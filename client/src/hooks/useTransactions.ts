import { useCallback, useEffect, useState } from "react";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../api/TransactionApi";

import { isSingleRecordId } from "../utils/TransactionUtil";

import useCommon from "./useCommon";

import type {
  MutationResult,
  Transaction,
  TransactionPayload,
  TransactionType,
} from "../types/transaction";

type UseTransactionsOptions = {
  onClearSelection: () => void;
};

const useTransactions = ({ onClearSelection }: UseTransactionsOptions) => {
  const [transactionData, setTransactionData] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const { message, showMessage, clearMessage } = useCommon();

  const loadTransactions = useCallback(async (): Promise<void> => {
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

  const postTransaction = async (
    type: TransactionType,
    payload: TransactionPayload,
  ): Promise<MutationResult> => {
    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
    setLoading(true);

    try {
      await createTransaction(type, payload);

      try {
        await loadTransactions();
      } catch (refreshError) {
        console.error("Transaction created, but refresh failed.", refreshError);
      }

      showMessage("success", `${typeLabel} added successfully!`);
      return { success: true };
    } catch (error) {
      showMessage("error", `Error adding the ${type} transaction.`);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const editTransaction = async (
    id: number | null,
    type: TransactionType,
    payload: TransactionPayload,
  ): Promise<MutationResult> => {
    if (!isSingleRecordId(id) || typeof id !== "number") {
      showMessage("error", "Please select a single transaction to update.");
      return { success: false };
    }

    const transactionName = payload.transactionName.trim();
    const amount = Number(payload.amount);

    if (!transactionName || !Number.isFinite(amount) || amount <= 0) {
      showMessage(
        "error",
        "Please enter a transaction name and a positive amount.",
      );
      return { success: false };
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
      return { success: true };
    } catch (error) {
      showMessage(
        "error",
        `Error updating the ${type} transaction. Please try again later.`,
      );
      console.error(
        `There was an error updating the ${type} transaction!`,
        error,
      );
      return { success: false };
    } finally {
      setUpdating(null);
    }
  };

  const openEditTransaction = useCallback(
    (record: Transaction): void => {
      if (!record || !isSingleRecordId(record.id)) {
        showMessage("error", "Please select a single transaction to update.");
        return;
      }

      setEditingTransaction({
        ...record,
      });
    },
    [showMessage],
  );

  const closedEditTransaction = useCallback((): void => {
    if (updating) {
      return;
    }

    setEditingTransaction(null);
  }, [updating]);

  const removeTransaction = async (
    record: Transaction | null,
  ): Promise<MutationResult> => {
    if (!record) {
      showMessage("error", "Please select a single transaction to delete.");
      return { success: false };
    }

    const transactionId = record.id;
    const transactionType = record.type;

    if (!isSingleRecordId(transactionId)) {
      showMessage("error", "Please select a single transaction to delete.");
      return { success: false };
    }

    setDeleting(transactionId);
    try {
      await deleteTransaction(transactionId, transactionType);
      await loadTransactions();

      onClearSelection();
      showMessage("success", "Transaction deleted successfully!");
      return { success: true };
    } catch (error) {
      showMessage(
        "error",
        `Error deleting the ${transactionType} transaction. Please try again later.`,
      );
      console.error(
        `There was an error deleting the ${transactionType} transaction!`,
        error,
      );
      return { success: false };
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
