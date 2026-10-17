import type {
  Transaction,
  ServerTransaction,
  TransactionTotals,
  TransactionType,
} from "../types/transaction";

const getTransactionKey = (id: number, type: TransactionType): string => {
  return `${type}:${id}`;
};

const isSingleRecordId = (id: unknown): boolean => {
  return !Array.isArray(id) && id !== null && id !== undefined && id !== 0;
};

const removeClientOnlyFields = (
  transaction: Transaction,
): ServerTransaction => {
  const { type, ...serverTransaction } = transaction;
  return serverTransaction;
};

const amountFormatter = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatAmount = (amount: number): string => {
  return amountFormatter.format(Number(amount));
};

const getTransactionTotals = (
  transaction: Transaction[],
): TransactionTotals => {
  const totals = {
    totalIncome: 0,
    totalExpense: 0,
  };

  transaction.forEach((transaction: Transaction) => {
    const amount = Number(transaction.amount);

    if (transaction.type === "income") {
      totals.totalIncome += amount;
      return;
    }

    if (transaction.type === "expense") {
      totals.totalExpense += amount;
    }
  });

  return {
    ...totals,
    totalBalance: totals.totalIncome - totals.totalExpense,
  };
};

export {
  getTransactionKey,
  isSingleRecordId,
  removeClientOnlyFields,
  formatAmount,
  getTransactionTotals,
};
