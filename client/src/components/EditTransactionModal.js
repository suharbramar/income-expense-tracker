import { useEffect, useState } from "react";

const formatTypeLabel = (type) => type.charAt(0).toUpperCase() + type.slice(1);

const EditTransactionModal = ({
  transaction,
  updating,
  onCancel,
  onSave,
}) => {
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
  const typeLabel = formatTypeLabel(transaction.type);

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedName = transactionName.trim();
    const numericAmount = Number(amount);

    if (!trimmedName || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      alert("Please enter a transaction name and a positive amount.");
      return;
    }

    onSave(transaction.id, transaction.type, {
      ...transaction,
      transactionName: trimmedName,
      amount: numericAmount,
    });
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-transaction-title">
        <h2 id="edit-transaction-title">Edit {typeLabel}</h2>

        <form onSubmit={handleSubmit}>
          <div className="modal-field">
            <label htmlFor="edit-transaction-name">Transaction Name</label>
            <input
              id="edit-transaction-name"
              type="text"
              value={transactionName}
              onChange={(event) => setTransactionName(event.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="modal-field">
            <label htmlFor="edit-transaction-amount">Amount</label>
            <input
              id="edit-transaction-amount"
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onCancel} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" disabled={isSaving}>
              {isSaving ? "Updating..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTransactionModal;
