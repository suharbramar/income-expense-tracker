import { useCallback, useEffect, useState } from "react";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../api/TransactionApi";

import { isSingleRecordId } from "../utils/TransactionUtil";

import useCommon from "./useCommon";

const useTransactions = ({ onClearSelection }) => {
  const [transactionData, setTransactionData] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [updating, setUpdating] = useState(null);
  const { message, showMessage, clearMessage } = useCommon();

  const loadTransactions = useCallback(async () => {
    const data = await getTransactions();
    setTransactionData(data);
  }, []);

  useEffect(() => {
    const loadInitialTransactions = async () => {
      try {
        await loadTransactions();
      } catch (error) {
        showMessage(
          "error",
          "Error fetching transaction data. Please try again later.",
        );
        console.error(
          "There was an error fetching the transaction data!",
          error,
        );
      }
    };

    loadInitialTransactions();
  }, [loadTransactions, showMessage]);

  const postTransaction = async (type, payload) => {
    setLoading(true);

    // Send the POST request to add income
    try {
      await createTransaction(type, payload);
      await loadTransactions();

      const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
      showMessage("success", `${typeLabel} added successfully!`);
    } catch (error) {
      showMessage(
        "error",
        `Error adding the ${type} transaction. Please try again later.`,
      );
      console.error(
        `There was an error adding the ${type} transaction!`,
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  const editTransaction = async (id, type, payload) => {
    if (!isSingleRecordId(id)) {
      showMessage("error", "Please select a single transaction to update.");
      return;
    }

    const transactionName = payload.transactionName.trim();
    const amount = Number(payload.amount);

    if (!transactionName || !Number.isFinite(amount) || amount <= 0) {
      showMessage(
        "error",
        "Please enter a transaction name and a positive amount.",
      );
      return;
    }

    const transactionPayload = { transactionName, amount };

    setUpdating(id);
    try {
      await updateTransaction(type, id, transactionPayload);
      await loadTransactions();

      const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
      showMessage("success", `${typeLabel} updated successfully!`);

      onClearSelection();
      setEditingTransaction(null);
    } catch (error) {
      showMessage(
        "error",
        `Error updating the ${type} transaction. Please try again later.`,
      );
      console.error(
        `There was an error updating the ${type} transaction!`,
        error,
      );
    } finally {
      setUpdating(null);
    }
  };

  const openEditTransaction = useCallback((record) => {
    if (!record || !isSingleRecordId(record.id)) {
      showMessage("error", "Please select a single transaction to update.");
      return;
    }

    setEditingTransaction({
      ...record,
    });
  }, [showMessage]);

  const closedEditTransaction = useCallback(() => {
    if (updating) {
      return;
    }

    setEditingTransaction(null);
  }, [updating]);

  const removeTransaction = async (record) => {
    if (!record) {
      showMessage("error", "Please select a single transaction to delete.");
      return;
    }

    const transactionId = record.id;
    const transactionType = record.type;

    if (!isSingleRecordId(transactionId)) {
      showMessage("error", "Please select a single transaction to delete.");
      return;
    }

    setDeleting(transactionId);
    try {
      await deleteTransaction(transactionId, transactionType);
      await loadTransactions();

      onClearSelection();
      showMessage("success", "Transaction deleted successfully!");
    } catch (error) {
      showMessage(
        "error",
        `Error deleting the ${transactionType} transaction. Please try again later.`,
      );
      console.error(
        `There was an error deleting the ${transactionType} transaction!`,
        error,
      );
    } finally {
      setDeleting(null);
    }
  };

  return {
    transactionData,
    loading,
    updating,
    deleting,
    editingTransaction,
    message,
    postTransaction,
    editTransaction,
    removeTransaction,
    openEditTransaction,
    closedEditTransaction,
    showMessage,
    clearMessage,
  };
};

export default useTransactions;
