import { act, renderHook, waitFor } from "@testing-library/react";
import useTransactions from "./useTransactions";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../api/TransactionApi";

jest.mock("../api/TransactionApi", () => ({
  getTransactions: jest.fn(),
  createTransaction: jest.fn(),
  updateTransaction: jest.fn(),
  deleteTransaction: jest.fn(),
}));

const transactions = [
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

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
  getTransactions.mockResolvedValue(transactions);
});

afterEach(() => {
  console.error.mockRestore();
});

test("loads transactions when the hook is first rendered", async () => {
  const { result } = renderUseTransactions();

  await waitFor(() => {
    expect(result.current.transactionData).toEqual(transactions);
  });

  expect(getTransactions).toHaveBeenCalledTimes(1);
});

test("shows an error message when initial loading fails", async () => {
  const loadError = new Error("Failed to load transactions");
  getTransactions.mockRejectedValueOnce(loadError);

  const { result } = renderUseTransactions();

  await waitFor(() => {
    expect(result.current.message).toEqual({
      type: "error",
      text: "Error fetching transaction data. Please try again later.",
    });
  });

  expect(console.error).toHaveBeenCalledWith(
    "There was an error fetching the transaction data!",
    loadError,
  );
});

test("creates a transaction, refreshes data, and shows a success message", async () => {
  createTransaction.mockResolvedValueOnce({});
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

  expect(createTransaction).toHaveBeenCalledWith("income", {
    transactionName: "Bonus",
    amount: 1000,
  });
  expect(getTransactions).toHaveBeenCalledTimes(2);
  expect(result.current.loading).toBe(false);
  expect(result.current.message).toEqual({
    type: "success",
    text: "Income added successfully!",
  });
});

test("shows an error message and resets loading when create fails", async () => {
  const createError = new Error("Failed to create transaction");
  createTransaction.mockRejectedValueOnce(createError);
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

test("updates a transaction with cleaned values", async () => {
  const onClearSelection = jest.fn();
  updateTransaction.mockResolvedValueOnce({});
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
      amount: "6000",
    });
  });

  expect(updateTransaction).toHaveBeenCalledWith("income", 1, {
    transactionName: "Updated Salary",
    amount: 6000,
  });
  expect(getTransactions).toHaveBeenCalledTimes(2);
  expect(onClearSelection).toHaveBeenCalledTimes(1);
  expect(result.current.editingTransaction).toBeNull();
  expect(result.current.updating).toBeNull();
  expect(result.current.message).toEqual({
    type: "success",
    text: "Income updated successfully!",
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

  expect(updateTransaction).not.toHaveBeenCalled();
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

  expect(updateTransaction).not.toHaveBeenCalled();
  expect(result.current.message).toEqual({
    type: "error",
    text: "Please enter a transaction name and a positive amount.",
  });
});

test("deletes a transaction, refreshes data, and clears selection", async () => {
  const onClearSelection = jest.fn();
  deleteTransaction.mockResolvedValueOnce({});
  const { result } = renderHook(() => useTransactions({ onClearSelection }));

  await waitFor(() => {
    expect(result.current.transactionData).toEqual(transactions);
  });

  await act(async () => {
    await result.current.removeTransaction(transactions[1]);
  });

  expect(deleteTransaction).toHaveBeenCalledWith(2, "expense");
  expect(getTransactions).toHaveBeenCalledTimes(2);
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

  expect(deleteTransaction).not.toHaveBeenCalled();
  expect(result.current.message).toEqual({
    type: "error",
    text: "Please select a single transaction to delete.",
  });
});

test("shows an error message and resets deleting when delete fails", async () => {
  const deleteError = new Error("Failed to delete transaction");
  deleteTransaction.mockRejectedValueOnce(deleteError);
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
  expect(console.error).toHaveBeenCalledWith(
    "There was an error deleting the expense transaction!",
    deleteError,
  );
});
