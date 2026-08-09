const getTransactionKey = (id, type) => {
  return `${type}:${id}`;
};

const isSingleRecordId = (id) => {
  return !Array.isArray(id) && id !== null && id !== undefined && id !== "";
};

const removeClientOnlyFields = (transaction) => {
  const { type, ...serverTransaction } = transaction;
  return serverTransaction;
};

const amountFormatter = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatAmount = (amount) => {
  return amountFormatter.format(Number(amount));
};

const getTransactionTotals = (transactions) => {
  const totals = {
    totalIncome: 0,
    totalExpense: 0,
  };

  transactions.forEach((transaction) => {
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
