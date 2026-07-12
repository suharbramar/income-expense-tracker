import { useState } from "react";
import { getTransactionKey } from "../utils/TransactionUtil";

const useTransactionSelection = () => {
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);

  const handleSelectedTransaction = (id, type) => {
    const transactionId = getTransactionKey(id, type);
    setSelectedTransactionId((currentId) =>
      currentId === transactionId ? null : transactionId,
    );
  };

  const clearSelectedTransaction = () => {
    setSelectedTransactionId(null);
  };

  return {
    selectedTransactionId,
    handleSelectedTransaction,
    clearSelectedTransaction,
  };
};

export default useTransactionSelection;
