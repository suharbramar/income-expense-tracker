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

const formatAmount = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount));
};

const getTransactionTotals = (transactions) => {
  const totalIncome = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  const totalExpense = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  return {
    totalIncome,
    totalExpense,
    totalBalance: totalIncome - totalExpense,
  };
};

export {
  getTransactionKey,
  isSingleRecordId,
  removeClientOnlyFields,
  formatAmount,
  getTransactionTotals,
};
