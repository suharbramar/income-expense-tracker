import { useState } from "react";

const InputForm = ({ postTransaction, loading }) => {
  const [transactionName, setTransactionName] = useState("");
  const [amount, setAmount] = useState(0);

  const handleAddTransaction = async (e, type) => {
    // Validate input fields
    if (transactionName === "" || amount === 0 || amount <= 0) {
      alert("Please fill in all fields.");
      return;
    }

    // Prepare the payload for the POST request
    const payload = {
      transactionName: transactionName,
      amount: parseFloat(amount),
    };

    postTransaction(e, type, payload, loading);
    setTransactionName("");
    setAmount(0);
  };

  return (
    <div className="container">
      <div className="container-item">
        <label>Transaction Name :</label>
        <input
          type="text"
          id="transaction-name"
          value={transactionName}
          onChange={(e) => setTransactionName(e.target.value)}
        />
      </div>

      <div className="container-item">
        <label>Amount :</label>
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
          onClick={(e) => handleAddTransaction(e, "income")}
          disabled={loading}>
          {loading ? "Adding Income..." : "Add Income"}
        </button>
        <button
          type="submit"
          onClick={(e) => handleAddTransaction(e, "expense")}
          disabled={loading}>
          {loading ? "Adding Expense..." : "Add Expense"}
        </button>
      </div>
    </div>
  );
};

export default InputForm;
