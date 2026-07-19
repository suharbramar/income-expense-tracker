import axios from "axios";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "./TransactionApi";

jest.mock("axios");

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

beforeEach(() => {
  jest.clearAllMocks();
});

test("fetches and combines income and expense transactions", async () => {
  axios.get
    .mockResolvedValueOnce({
      data: [{ id: 1, transactionName: "Salary", amount: 5000 }],
    })
    .mockResolvedValueOnce({
      data: [{ id: 2, transactionName: "Rent", amount: 1500 }],
    });

  const result = await getTransactions();

  expect(axios.get).toHaveBeenCalledWith(`${API_URL}/income`);
  expect(axios.get).toHaveBeenCalledWith(`${API_URL}/expense`);
  expect(axios.get).toHaveBeenCalledTimes(2);

  expect(result).toEqual([
    {
      id: 1,
      transactionName: "Salary",
      amount: 5000,
      type: "income",
    },
    {
      id: 2,
      transactionName: "Rent",
      amount: 1500,
      type: "expense",
    },
  ]);
});

test("creates a transaction with the requested type and payload", async () => {
  const payload = {
    transactionName: "Bonus",
    amount: 1000,
  };

  await createTransaction("income", payload);

  expect(axios.post).toHaveBeenCalledWith(`${API_URL}/income`, payload);
});

test("updates a transaction with the requested type, id, and payload", async () => {
  const payload = {
    transactionName: "Updated Salary",
    amount: 6000,
  };

  await updateTransaction("income", 1, payload);

  expect(axios.put).toHaveBeenCalledWith(
    `${API_URL}/income/1`,
    payload,
  );
});

test("deletes a transaction with the requested id and type", async () => {
  await deleteTransaction(2, "expense");

  expect(axios.delete).toHaveBeenCalledWith(`${API_URL}/expense/2`);
});

test("passes API errors to the caller", async () => {
  const apiError = new Error("Server unavailable");
  axios.get.mockRejectedValueOnce(apiError);

  await expect(getTransactions()).rejects.toBe(apiError);
});
