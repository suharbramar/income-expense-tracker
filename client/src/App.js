import "./App.css";
import {
  Header,
  InputForm,
  ItemHeader,
  Income,
  Expense,
} from "./components/Index";

import axios from "axios";
import { useState, useEffect } from "react";

const URL = "http://localhost:3001";

function App() {
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    getIncome();
    getExpense();
  }, []);

  const getIncome = async () => {
    try {
      const response = await axios.get(`${URL}/income`);
      setIncomeData(response.data);
    } catch (error) {
      alert("Error fetching income data. Please try again later.");
      console.error("There was an error fetching the income data!", error);
    }
  };

  const getExpense = async () => {
    try {
      const response = await axios.get(`${URL}/expense`);
      setExpenseData(response.data);
    } catch (error) {
      alert("Error fetching expense data. Please try again later.");
      console.error("There was an error fetching the expense data!", error);
    }
  };

  const postTransaction = async (e, type, payload) => {
    e.preventDefault();
    setLoading(true);

    // Send the POST request to add income
    try {
      await axios.post(`${URL}/${type}`, payload);

      let typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
      alert(`${typeLabel} added successfully!`);
      if (type === "income") {
        getIncome();
      } else {
        getExpense();
      }

      setLoading(false);
    } catch (error) {
      alert(`Error adding the ${type} transaction. Please try again later.`);
      console.error(
        `There was an error adding the ${type} transaction!`,
        error,
      );
      setLoading(false);
    }
  };

  const deleteTransaction = async (id, type) => {
    setDeleting(id);
    try {
      await axios.delete(`${URL}/${type}/${id}`);
      if (type === "income") {
        getIncome();
      } else {
        getExpense();
      }

      alert("Transaction deleted successfully!");
      setDeleting(null);
    } catch (error) {
      alert(`Error deleting the ${type} transaction. Please try again later.`);
      console.error(
        `There was an error deleting the ${type} transaction!`,
        error,
      );
      setDeleting(null);
    }
  };

  return (
    <div className="App">
      <Header name="Income and Expense Tracker" />
      <InputForm postTransaction={postTransaction} loading={loading} />
      <ItemHeader />
      <div className="transactions">
        <Income
          incomeData={incomeData}
          deleteTransaction={deleteTransaction}
          deleting={deleting}
        />
        <Expense
          expenseData={expenseData}
          deleteTransaction={deleteTransaction}
          deleting={deleting}
        />
      </div>
    </div>
  );
}

export default App;
