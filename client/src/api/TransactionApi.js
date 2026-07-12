import axios from "axios";

const URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const getTransactions = async () => {
  const [incomeResponse, expenseResponse] = await Promise.all([
    axios.get(`${URL}/income`),
    axios.get(`${URL}/expense`),
  ]);

  const incomeData = incomeResponse.data.map((item) => ({
    ...item,
    type: "income",
  }));

  const expenseData = expenseResponse.data.map((item) => ({
    ...item,
    type: "expense",
  }));

  // combine into one array
  return [...incomeData, ...expenseData];
};

const createTransaction = (type, payload) => {
  return axios.post(`${URL}/${type}`, payload);
};

const updateTransaction = (type, id, payload) => {
  return axios.put(`${URL}/${type}/${id}`, payload);
};

const deleteTransaction = (id, type) => {
  return axios.delete(`${URL}/${type}/${id}`);
};

export {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
