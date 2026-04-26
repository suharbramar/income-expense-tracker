const Expense = ({
  expenseData,
  deleteTransaction,
  deleting,
  selectedId,
  onSelectRow,
  updateTransaction,
  updating,
}) => {
  return (
    <div className="expense-list">
      <div className="expense-heading">
        <h2>Expense List</h2>
      </div>

      <div className="button-group">
        <button
          className="update-btn"
          onClick={() => {
            if (selectedId) {
              const selected = expenseData.find(
                (item) => item.id === selectedId,
              );
              updateTransaction(selectedId, "expense", selected);
            }
          }}
          disabled={!selectedId || updating === selectedId}>
          {updating === selectedId ? "Updating..." : "Update"}
        </button>
        <button
          className="delete-btn"
          onClick={() => {
            if (selectedId) {
              deleteTransaction(selectedId, "expense");
            }
          }}
          disabled={!selectedId || deleting === selectedId}>
          {deleting === selectedId ? "Deleting..." : "Delete"}
        </button>
      </div>

      {/* Table */}
      <table className="expense-table">
        <thead>
          <tr>
            <th className="select-col">Select</th>
            <th className="item-col">Item</th>
            <th className="amount-col">Amount</th>
          </tr>
        </thead>
        <tbody>
          {expenseData.map((item) => (
            <tr
              key={item.id}
              className={selectedId === item.id ? "selected" : ""}>
              <td className="select-col">
                <input
                  type="checkbox"
                  checked={selectedId === item.id}
                  onChange={() => onSelectRow(item.id)}
                />
              </td>
              <td className="item-col">{item.transactionName}</td>
              <td className="amount-col">Rp {item.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Expense;
