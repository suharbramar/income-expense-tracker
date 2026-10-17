import { useRef } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TransactionSchema } from "../validation/TransactionSchema";
import type {
  MutationResult,
  TransactionPayload,
  TransactionType,
} from "../types/transaction";

type InputFormProps = {
  postTransaction: (
    type: TransactionType,
    payload: TransactionPayload,
  ) => Promise<MutationResult>;
  loading?: boolean;
};

const InputForm = ({ postTransaction, loading = false }: InputFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionPayload>({
    resolver: zodResolver(TransactionSchema),
    defaultValues: {
      transactionName: "",
    },
  });
  const lastClickedType = useRef<TransactionType>("income");

  const handleAddTransaction: SubmitHandler<TransactionPayload> = async (
    values,
    event,
  ) => {
    const nativeEvent = event?.nativeEvent as SubmitEvent | undefined;
    const submitter = nativeEvent?.submitter;
    const submittedType =
      submitter instanceof HTMLButtonElement
        ? submitter.value
        : lastClickedType.current;
    const type: TransactionType =
      submittedType === "expense" ? "expense" : "income";
    const result = await postTransaction(type, values);
    if (result.success) {
      reset();
    }
  };

  const isButtonBusy = loading || isSubmitting;

  return (
    <form className="container" onSubmit={handleSubmit(handleAddTransaction)}>
      <div className="container-item">
        <label htmlFor="transaction-name">Transaction Name :</label>
        <input
          id="transaction-name"
          type="text"
          {...register("transactionName")}
          aria-invalid={Boolean(errors.transactionName)}
          aria-describedby={
            errors.transactionName ? "transaction-name-error" : undefined
          }
        />
        {errors.transactionName && (
          <p id="transaction-name-error" className="form-error" role="alert">
            {errors.transactionName.message}
          </p>
        )}
      </div>

      <div className="container-item">
        <label htmlFor="amount">Amount :</label>
        <input
          id="amount"
          type="number"
          inputMode="decimal"
          {...register("amount")}
          aria-invalid={Boolean(errors.amount)}
          aria-describedby={errors.amount ? "amount-error" : undefined}
        />
        {errors.amount && (
          <p id="amount-error" className="form-error" role="alert">
            {errors.amount.message}
          </p>
        )}
      </div>

      <div className="button-group">
        <button
          type="submit"
          value="income"
          disabled={isButtonBusy}
          onClick={() => {
            lastClickedType.current = "income";
          }}
        >
          {isButtonBusy ? "Adding Income..." : "Add Income"}
        </button>
        <button
          type="submit"
          value="expense"
          disabled={isButtonBusy}
          onClick={() => {
            lastClickedType.current = "expense";
          }}
        >
          {isButtonBusy ? "Adding Expense..." : "Add Expense"}
        </button>
      </div>
    </form>
  );
};

export default InputForm;
