const Expense = ({ expenseData, deleteTransaction, deleting }) => {
  return (
    <div className="expense-list">
      <div className="expense-heading">
        <h2>Expense List</h2>
      </div>
      <div className="expense-items">
        {expenseData.map((item) => (
          <div className="expense-item" key={item.id}>
            <div className="expense-item-left">
              <h4>{item.transactionName}</h4>
              <p>Rp {item.amount}</p>
            </div>
            <div className="expense-item-right">
              <button
                className="delete-btn"
                onClick={(e) => deleteTransaction(item.id, "expense")}
                disabled={deleting == item.id}>
                {deleting == item.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Expense;
