import { useState } from "react";

const InputForm = ({ postTransaction, loading, onMessage = () => {} }) => {
  const [transactionName, setTransactionName] = useState("");
  const [amount, setAmount] = useState("");

  const handleAddTransaction = async (e) => {
    e.preventDefault();

    const submitter = e.nativeEvent.submitter || document.activeElement;
    const type = submitter?.value || "income";
    const trimmedTransactionName = transactionName.trim();
    const numericAmount = Number(amount);

    // Validate input fields
    if (
      !trimmedTransactionName ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      onMessage("error", "Please fill in all fields.");
      return;
    }

    // Prepare the payload for the POST request
    const payload = {
      transactionName: trimmedTransactionName,
      amount: numericAmount,
    };

    postTransaction(type, payload);
    setTransactionName("");
    setAmount("");
  };

  return (
    <form className="container" onSubmit={handleAddTransaction}>
      <div className="container-item">
        <label htmlFor="transaction-name">Transaction Name :</label>
        <input
          type="text"
          id="transaction-name"
          value={transactionName}
          onChange={(e) => setTransactionName(e.target.value)}
        />
      </div>

      <div className="container-item">
        <label htmlFor="amount">Amount :</label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="button-group">
        <button
          type="submit"
          value="income"
          disabled={loading}>
          {loading ? "Adding Income..." : "Add Income"}
        </button>
        <button
          type="submit"
          value="expense"
          disabled={loading}>
          {loading ? "Adding Expense..." : "Add Expense"}
        </button>
      </div>
    </form>
  );
};

export default InputForm;
