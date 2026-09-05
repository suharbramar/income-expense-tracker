import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TransactionSchema } from "../validation/TransactionSchema";

const EditTransactionModal = ({ transaction, updating, onCancel, onSave }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(TransactionSchema),
    defaultValues: {
      transactionName: "",
      amount: "",
    },
  });

  useEffect(() => {
    if (!transaction) {
      return;
    }

    reset({
      transactionName: transaction.transactionName || "",
      amount: transaction.amount ?? "",
    });
  }, [transaction, reset]);

  useEffect(() => {
    if (!transaction) {
      return;
    }

    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && updating === null) {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [transaction, updating, onCancel]);

  if (!transaction) {
    return null;
  }

  const isSaving = updating === transaction.id;
  const isBusy = isSaving || isSubmitting;

  const typeLabel = transaction.type
    ? transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)
    : "Transaction";
  const title = `Edit ${typeLabel}`;

  const handleSaveTransaction = async (values) => {
    await onSave(transaction.id, transaction.type, values);
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-transaction-title">
        <h2 id="edit-transaction-title">{title}</h2>
        <form onSubmit={handleSubmit(handleSaveTransaction)}>
          <div className="modal-field">
            <label htmlFor="edit-transaction-name">Transaction Name</label>
            <input
              id="edit-transaction-name"
              type="text"
              autoFocus
              {...register("transactionName")}
              aria-invalid={Boolean(errors.transactionName)}
              aria-describedby={
                errors.transactionName
                  ? "edit-transaction-name-error"
                  : undefined
              }
              disabled={isBusy}
            />
            {errors.transactionName && (
              <p
                id="edit-transaction-name-error"
                className="form-error"
                role="alert">
                {errors.transactionName.message}
              </p>
            )}
          </div>

          <div className="modal-field">
            <label htmlFor="edit-transaction-amount">Transaction Amount</label>
            <input
              id="edit-transaction-amount"
              type="number"
              {...register("amount")}
              aria-invalid={Boolean(errors.amount)}
              aria-describedby={
                errors.amount ? "edit-transaction-amount-error" : undefined
              }
              disabled={isBusy}
            />
            {errors.amount && (
              <p
                id="edit-transaction-amount-error"
                className="form-error"
                role="alert">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div className="modal-actions">
            <button type="submit" disabled={isBusy}>
              {isBusy ? "Updating..." : "Save"}
            </button>

            <button type="button" onClick={onCancel} disabled={isBusy}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTransactionModal;
