const Income = ({ incomeData, deleteTransaction, deleting }) => {
  return (
    <div className="income-list">
      <div className="income-heading">
        <h2>Income List</h2>
      </div>
      <div className="income-items">
        {incomeData.map((item) => (
          <div className="income-item" key={item.id}>
            <div className="income-item-left">
              <h4>{item.transactionName}</h4>
              <p>Rp{item.amount}</p>
            </div>
            <div className="income-item-right">
              <button
                className="delete-btn"
                onClick={(e) => deleteTransaction(item.id, "income")}
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

export default Income;
