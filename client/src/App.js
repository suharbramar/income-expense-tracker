import "./App.css";
import {
  Header,
  InputForm,
  ItemHeader,
  Income,
  Expense,
  EditTransactionModal,
} from "./components/Index";

import axios from "axios";
import { useState, useEffect } from "react";

const URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const isSingleRecordId = (id) => {
  return !Array.isArray(id) && id !== null && id !== undefined && id !== "";
};

function App() {
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [selectedIncomeId, setSelectedIncomeId] = useState(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);

  useEffect(() => {
    getIncome();
    getExpense();
  }, []);

  const getIncome = async () => {
    try {
      const response = await axios.get(`${URL}/income`);
      console.log(response.data);
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
    if (!isSingleRecordId(id)) {
      alert("Please select a single transaction to delete.");
      return;
    }

    setDeleting(id);
    try {
      await axios.delete(`${URL}/${type}/${id}`);
      if (type === "income") {
        await getIncome();
        setSelectedIncomeId(null);
      } else {
        await getExpense();
        setSelectedExpenseId(null);
      }

      alert("Transaction deleted successfully!");
    } catch (error) {
      alert(`Error deleting the ${type} transaction. Please try again later.`);
      console.error(
        `There was an error deleting the ${type} transaction!`,
        error,
      );
    } finally {
      setDeleting(null);
    }
  };

  // Toggle selection of income or expense item
  const handleSelectIncome = (id) => {
    setSelectedIncomeId(selectedIncomeId === id ? null : id);
    setSelectedExpenseId(null);
  };

  const handleSelectExpense = (id) => {
    setSelectedExpenseId(selectedExpenseId === id ? null : id);
    setSelectedIncomeId(null);
  };

  const openEditTransaction = (record, type) => {
    if (!record || !isSingleRecordId(record.id)) {
      alert("Please select a single transaction to update.");
      return;
    }

    setEditingTransaction({
      ...record,
      type,
    });
  };

  const closeEditTransaction = () => {
    if (updating !== null) {
      return;
    }

    setEditingTransaction(null);
  };

  const updateTransaction = async (id, type, payload) => {
    if (!isSingleRecordId(id)) {
      alert("Please select a single transaction to update.");
      return;
    }

    const transactionName = String(payload.transactionName || "").trim();
    const amount = Number(payload.amount);

    if (!transactionName || !Number.isFinite(amount) || amount <= 0) {
      alert("Please enter a transaction name and a positive amount.");
      return;
    }

    setUpdating(id);
    try {
      const { type: _ignoredType, ...transactionPayload } = payload;

      await axios.put(`${URL}/${type}/${id}`, {
        ...transactionPayload,
        transactionName,
        amount,
      });

      let typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
      alert(`${typeLabel} updated successfully!`);

      if (type === "income") {
        await getIncome();
        setSelectedIncomeId(null);
      } else {
        await getExpense();
        setSelectedExpenseId(null);
      }

      setEditingTransaction(null);
    } catch (error) {
      alert(`Error updating the ${type} transaction. Please try again later.`);
      console.error(
        `There was an error updating the ${type} transaction!`,
        error,
      );
    } finally {
      setUpdating(null);
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
          onSelectRow={handleSelectIncome}
          selectedId={selectedIncomeId}
          openEditTransaction={openEditTransaction}
          updating={updating}
        />
        <Expense
          expenseData={expenseData}
          deleteTransaction={deleteTransaction}
          deleting={deleting}
          onSelectRow={handleSelectExpense}
          selectedId={selectedExpenseId}
          openEditTransaction={openEditTransaction}
          updating={updating}
        />
      </div>
      <EditTransactionModal
        transaction={editingTransaction}
        updating={updating}
        onCancel={closeEditTransaction}
        onSave={updateTransaction}
      />
    </div>
  );
}

export default App;
