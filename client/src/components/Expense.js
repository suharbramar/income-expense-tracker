const Expense = ({
  expenseData,
  deleteTransaction,
  deleting,
  selectedId,
  onSelectRow,
  openEditTransaction,
  updating,
}) => {
  const selectedExpense = expenseData.find((item) => item.id === selectedId);
  const actionDisabled = !selectedId || deleting !== null || updating !== null;
  return (
    <div className="expense-list">
      <div className="expense-heading">
        <h2>Expense List</h2>
      </div>

      <div className="button-group">
        <button
          className="update-btn"
          onClick={() => {
            if (selectedExpense) {
              openEditTransaction(selectedExpense, "expense");
            }
          }}
          disabled={actionDisabled}>
          {updating === selectedId ? "Edit" : "Update"}
        </button>
        <button
          className="delete-btn"
          onClick={() => {
            if (selectedId) {
              deleteTransaction(selectedId, "expense");
            }
          }}
          disabled={actionDisabled}>
          delete
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
                  type="radio"
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
