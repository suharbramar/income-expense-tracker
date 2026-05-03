import { useState, useEffect } from "react";

const EditTransactionModal = ({ transaction, updating, onCancel, onSave }) => {
  const [transactionName, setTransactionName] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (transaction) {
      setTransactionName(transaction.transactionName || "");
      setAmount(transaction.amount || "");
    }
  }, [transaction]);

  if (!transaction) {
    return null;
  }

  const isSaving = updating === transaction.id;
  const typeLabel = transaction.type
    ? transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)
    : "Transaction";
  const title = `Edit ${typeLabel}`;

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedTransactionName = transactionName.trim();
    const numericAmount = Number(amount);

    if (
      !trimmedTransactionName ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      alert("Please enter a transaction name and a positive amount.");
      return;
    }

    const transactionPayload = {
      transactionName: trimmedTransactionName,
      amount: numericAmount,
    };

    onSave(transaction.id, transaction.type, transactionPayload);
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-transaction-title">
        <h2 id="edit-transaction-title">{title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="modal-field">
            <label htmlFor="edit-transaction-name">Transaction Name</label>
            <input
              id="edit-transaction-name"
              type="text"
              value={transactionName}
              onChange={(e) => setTransactionName(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="modal-field">
            <label htmlFor="edit-transaction-amount">Transaction Amount</label>
            <input
              id="edit-transaction-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="modal-actions">
            <button type="submit" disabled={isSaving}>
              {isSaving ? "Updating..." : "Save"}
            </button>

            <button type="button" onClick={onCancel} disabled={isSaving}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTransactionModal;
