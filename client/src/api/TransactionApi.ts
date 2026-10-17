import axios from "axios";
import type {
  Transaction,
  TransactionPayload,
  TransactionType,
  ServerTransaction,
} from "../types/transaction";

const URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const getTransactions = async (): Promise<Transaction[]> => {
  const [incomeResponse, expenseResponse] = await Promise.all([
    axios.get<ServerTransaction[]>(`${URL}/income`),
    axios.get<ServerTransaction[]>(`${URL}/expense`),
  ]);

  const incomeData: Transaction[] = incomeResponse.data.map((item) => ({
    ...item,
    type: "income",
  }));

  const expenseData: Transaction[] = expenseResponse.data.map((item) => ({
    ...item,
    type: "expense",
  }));

  // combine into one array
  return [...incomeData, ...expenseData];
};

const createTransaction = (
  type: TransactionType,
  payload: TransactionPayload,
) => {
  return axios.post<ServerTransaction>(`${URL}/${type}`, payload);
};

const updateTransaction = (
  type: TransactionType,
  id: number,
  payload: TransactionPayload,
) => {
  return axios.put<ServerTransaction>(`${URL}/${type}/${id}`, payload);
};

const deleteTransaction = (id: number, type: TransactionType) => {
  return axios.delete(`${URL}/${type}/${id}`);
};

export {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
