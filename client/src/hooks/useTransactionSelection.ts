import { useState } from "react";
import { getTransactionKey } from "../utils/TransactionUtil";

import type { TransactionType } from "../types/transaction";

const useTransactionSelection = () => {
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);

  const handleSelectedTransaction = (id: number, type: TransactionType): void => {
    const transactionId = getTransactionKey(id, type);
    setSelectedTransactionId((currentId) =>
      currentId === transactionId ? null : transactionId,
    );
  };

  const clearSelectedTransaction = (): void => {
    setSelectedTransactionId(null);
  };

  return {
    selectedTransactionId,
    handleSelectedTransaction,
    clearSelectedTransaction,
  };
};

export default useTransactionSelection;
