import { act, renderHook, waitFor } from "@testing-library/react";
import useTransactions from "./useTransactions";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../api/TransactionApi";
import type { Transaction } from "../types/transaction";

jest.mock("../api/TransactionApi", () => ({
  getTransactions: jest.fn(),
  createTransaction: jest.fn(),
  updateTransaction: jest.fn(),
  deleteTransaction: jest.fn(),
}));

const mockedGetTransactions = jest.mocked(getTransactions);
const mockedCreateTransaction = jest.mocked(createTransaction);
const mockedUpdateTransaction = jest.mocked(updateTransaction);
const mockedDeleteTransaction = jest.mocked(deleteTransaction);

const transactions: Transaction[] = [
  { id: 1, transactionName: "Salary", amount: 5000, type: "income" },
  { id: 2, transactionName: "Rent", amount: 1500, type: "expense" },
];

const renderUseTransactions = () => {
  const onClearSelection = jest.fn();
  const utils = renderHook(() => useTransactions({ onClearSelection }));

  return {
    ...utils,
    onClearSelection,
  };
};

const consoleErrorSpy = jest.spyOn(console, "error");

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
  mockedGetTransactions.mockResolvedValue(transactions);
});

afterEach(() => {
  consoleErrorSpy.mockClear();
});

test("loads transactions when the hook is first rendered", async () => {
  const { result } = renderUseTransactions();

  await waitFor(() => {
    expect(result.current.transactionData).toEqual(transactions);
  });

  expect(mockedGetTransactions).toHaveBeenCalledTimes(1);
});

test("shows an error message when initial loading fails", async () => {
  const loadError = new Error("Failed to load transactions");
  mockedGetTransactions.mockRejectedValueOnce(loadError);

  const { result } = renderUseTransactions();

  await waitFor(() => {
    expect(result.current.message).toEqual({
      type: "error",
      text: "Error fetching transaction data. Please try again later.",
    });
  });

  expect(consoleErrorSpy).toHaveBeenCalledWith(
    "There was an error fetching the transaction data!",
    loadError,
  );
});

test("creates a transaction, refreshes data, and shows a success message", async () => {
  mockedCreateTransaction.mockResolvedValueOnce(
    {} as Awaited<ReturnType<typeof createTransaction>>,
  );
  const { result } = renderUseTransactions();

  await waitFor(() => {
    expect(result.current.transactionData).toEqual(transactions);
  });

  await act(async () => {
    await result.current.postTransaction("income", {
      transactionName: "Bonus",
      amount: 1000,
    });
  });

  expect(mockedCreateTransaction).toHaveBeenCalledWith("income", {
    transactionName: "Bonus",
    amount: 1000,
  });
  expect(mockedGetTransactions).toHaveBeenCalledTimes(2);
  expect(result.current.loading).toBe(false);
  expect(result.current.message).toEqual({
    type: "success",
    text: "Income added successfully!",
  });
});

test("shows an error message and resets loading when create fails", async () => {
  const createError = new Error("Failed to create transaction");
  mockedCreateTransaction.mockRejectedValueOnce(createError);
  const { result } = renderUseTransactions();

  await waitFor(() => {
    expect(result.current.transactionData).toEqual(transactions);
  });

  await act(async () => {
    await result.current.postTransaction("expense", {
      transactionName: "Food",
      amount: 250,
    });
  });

  expect(result.current.loading).toBe(false);
  expect(result.current.message).toEqual({
    type: "error",
    text: "Error adding the expense transaction.",
  });
});

test("keeps the create success result when refreshing after create fails", async () => {
  const refreshError = new Error("Refresh failed");
  mockedCreateTransaction.mockResolvedValueOnce(
    {} as Awaited<ReturnType<typeof createTransaction>>,
  );
  const { result } = renderUseTransactions();

  await waitFor(() => {
    expect(result.current.transactionData).toEqual(transactions);
  });
  mockedGetTransactions.mockRejectedValueOnce(refreshError);

  await act(async () => {
    await result.current.postTransaction("income", {
      transactionName: "Bonus",
      amount: 1000,
    });
  });

  expect(result.current.message).toEqual({
    type: "success",
    text: "Income added successfully!",
  });
  expect(consoleErrorSpy).toHaveBeenCalledWith(
    "Transaction created, but refresh failed.",
    refreshError,
  );
});

test("opens and closes the edit transaction state", async () => {
  const { result } = renderUseTransactions();

  await waitFor(() => {
    expect(result.current.transactionData).toEqual(transactions);
  });

  act(() => {
    result.current.openEditTransaction(transactions[0]);
  });

  expect(result.current.editingTransaction).toEqual(transactions[0]);

  act(() => {
    result.current.closedEditTransaction();
  });

  expect(result.current.editingTransaction).toBeNull();
});

test("does not open edit state for an invalid transaction id", async () => {
  const { result } = renderUseTransactions();

  await waitFor(() => {
    expect(result.current.transactionData).toEqual(transactions);
  });

  act(() => {
    result.current.openEditTransaction({ ...transactions[0], id: 0 });
  });

  expect(result.current.editingTransaction).toBeNull();
  expect(result.current.message).toEqual({
    type: "error",
    text: "Please select a single transaction to update.",
  });
});

test("updates a transaction with cleaned values", async () => {
  const onClearSelection = jest.fn();
  mockedUpdateTransaction.mockResolvedValueOnce(
    {} as Awaited<ReturnType<typeof updateTransaction>>,
  );
  const { result } = renderHook(() => useTransactions({ onClearSelection }));

  await waitFor(() => {
    expect(result.current.transactionData).toEqual(transactions);
  });

  act(() => {
    result.current.openEditTransaction(transactions[0]);
  });

  await act(async () => {
    await result.current.editTransaction(1, "income", {
      transactionName: " Updated Salary ",
      amount: 6000,
    });
  });

  expect(mockedUpdateTransaction).toHaveBeenCalledWith("income", 1, {
    transactionName: "Updated Salary",
    amount: 6000,
  });
  expect(mockedGetTransactions).toHaveBeenCalledTimes(2);
  expect(onClearSelection).toHaveBeenCalledTimes(1);
  expect(result.current.editingTransaction).toBeNull();
  expect(result.current.updating).toBeNull();
  expect(result.current.message).toEqual({
    type: "success",
    text: "Income updated successfully!",
  });
});

test("does not close the edit modal while an update is running", async () => {
  let resolveUpdate!: (
    response: Awaited<ReturnType<typeof updateTransaction>>,
  ) => void;
  mockedUpdateTransaction.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveUpdate = resolve;
      }),
  );
  const { result } = renderUseTransactions();

  await waitFor(() => {
    expect(result.current.transactionData).toEqual(transactions);
  });

  act(() => {
    result.current.openEditTransaction(transactions[0]);
  });

  let editPromise: Promise<unknown> | undefined;
  act(() => {
    editPromise = result.current.editTransaction(1, "income", {
      transactionName: "Updated Salary",
      amount: 6000,
    });
  });

  await waitFor(() => {
    expect(result.current.updating).toBe(1);
  });

  act(() => {
    result.current.closedEditTransaction();
  });

  expect(result.current.editingTransaction).toEqual(transactions[0]);

  await act(async () => {
    resolveUpdate({} as Awaited<ReturnType<typeof updateTransaction>>);
    await editPromise;
  });
});

test("does not update when the id is invalid", async () => {
  const { result } = renderUseTransactions();

  await waitFor(() => {
    expect(result.current.transactionData).toEqual(transactions);
  });

  await act(async () => {
    await result.current.editTransaction(null, "income", {
      transactionName: "Salary",
      amount: 6000,
    });
  });

  expect(mockedUpdateTransaction).not.toHaveBeenCalled();
  expect(result.current.message).toEqual({
    type: "error",
    text: "Please select a single transaction to update.",
  });
});

test("does not update when the payload is invalid", async () => {
  const { result } = renderUseTransactions();

  await waitFor(() => {
    expect(result.current.transactionData).toEqual(transactions);
  });

  await act(async () => {
    await result.current.editTransaction(1, "income", {
      transactionName: " ",
      amount: 0,
    });
  });

  expect(mockedUpdateTransaction).not.toHaveBeenCalled();
  expect(result.current.message).toEqual({
    type: "error",
    text: "Please enter a transaction name and a positive amount.",
  });
});

test("shows an error and resets updating when update fails", async () => {
  const updateError = new Error("Failed to update transaction");
  mockedUpdateTransaction.mockRejectedValueOnce(updateError);
  const { result, onClearSelection } = renderUseTransactions();

  await waitFor(() => {
    expect(result.current.transactionData).toEqual(transactions);
  });

  await act(async () => {
    await result.current.editTransaction(1, "income", {
      transactionName: "Updated Salary",
      amount: 6000,
    });
  });

  expect(result.current.updating).toBeNull();
  expect(onClearSelection).not.toHaveBeenCalled();
  expect(result.current.message).toEqual({
    type: "error",
    text: "Error updating the income transaction. Please try again later.",
  });
  expect(consoleErrorSpy).toHaveBeenCalledWith(
    "There was an error updating the income transaction!",
    updateError,
  );
});

test("deletes a transaction, refreshes data, and clears selection", async () => {
  const onClearSelection = jest.fn();
  mockedDeleteTransaction.mockResolvedValueOnce(
    {} as Awaited<ReturnType<typeof deleteTransaction>>,
  );
  const { result } = renderHook(() => useTransactions({ onClearSelection }));

  await waitFor(() => {
    expect(result.current.transactionData).toEqual(transactions);
  });

  await act(async () => {
    await result.current.removeTransaction(transactions[1]);
  });

  expect(mockedDeleteTransaction).toHaveBeenCalledWith(2, "expense");
  expect(mockedGetTransactions).toHaveBeenCalledTimes(2);
  expect(onClearSelection).toHaveBeenCalledTimes(1);
  expect(result.current.deleting).toBeNull();
  expect(result.current.message).toEqual({
    type: "success",
    text: "Transaction deleted successfully!",
  });
});

test("does not delete when no transaction is provided", async () => {
  const { result } = renderUseTransactions();

  await waitFor(() => {
    expect(result.current.transactionData).toEqual(transactions);
  });

  await act(async () => {
    await result.current.removeTransaction(null);
  });

  expect(mockedDeleteTransaction).not.toHaveBeenCalled();
  expect(result.current.message).toEqual({
    type: "error",
    text: "Please select a single transaction to delete.",
  });
});

test("does not delete a transaction with an invalid id", async () => {
  const { result } = renderUseTransactions();

  await waitFor(() => {
    expect(result.current.transactionData).toEqual(transactions);
  });

  await act(async () => {
    await result.current.removeTransaction({ ...transactions[1], id: 0 });
  });

  expect(mockedDeleteTransaction).not.toHaveBeenCalled();
  expect(result.current.message).toEqual({
    type: "error",
    text: "Please select a single transaction to delete.",
  });
});

test("shows an error when delete refresh fails", async () => {
  const refreshError = new Error("Refresh failed after delete");
  mockedDeleteTransaction.mockResolvedValueOnce(
    {} as Awaited<ReturnType<typeof deleteTransaction>>,
  );
  const { result, onClearSelection } = renderUseTransactions();

  await waitFor(() => {
    expect(result.current.transactionData).toEqual(transactions);
  });
  mockedGetTransactions.mockRejectedValueOnce(refreshError);

  await act(async () => {
    await result.current.removeTransaction(transactions[1]);
  });

  expect(onClearSelection).not.toHaveBeenCalled();
  expect(result.current.deleting).toBeNull();
  expect(result.current.message).toEqual({
    type: "error",
    text: "Error deleting the expense transaction. Please try again later.",
  });
  expect(consoleErrorSpy).toHaveBeenCalledWith(
    "There was an error deleting the expense transaction!",
    refreshError,
  );
});

test("shows an error message and resets deleting when delete fails", async () => {
  const deleteError = new Error("Failed to delete transaction");
  mockedDeleteTransaction.mockRejectedValueOnce(deleteError);
  const { result, onClearSelection } = renderUseTransactions();

  await waitFor(() => {
    expect(result.current.transactionData).toEqual(transactions);
  });

  await act(async () => {
    await result.current.removeTransaction(transactions[1]);
  });

  expect(onClearSelection).not.toHaveBeenCalled();
  expect(result.current.deleting).toBeNull();
  expect(result.current.message).toEqual({
    type: "error",
    text: "Error deleting the expense transaction. Please try again later.",
  });
  expect(consoleErrorSpy).toHaveBeenCalledWith(
    "There was an error deleting the expense transaction!",
    deleteError,
  );
});
