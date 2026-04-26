const Income = ({
  incomeData,
  deleteTransaction,
  deleting,
  selectedId,
  onSelectRow,
  openEditTransaction,
  updating,
}) => {
  const selectedIncome = incomeData.find((item) => item.id === selectedId);
  const actionDisabled = !selectedId || deleting !== null || updating !== null;

  return (
    <div className="income-list">
      <div className="income-heading">
        <h2>Income List</h2>
      </div>

      <div className="button-group">
        <button
          className="update-btn"
          onClick={() => {
            if (selectedIncome) {
              openEditTransaction(selectedIncome, "income");
            }
          }}
          disabled={actionDisabled}>
          {updating === selectedId ? "Updating..." : "Update"}
        </button>
        <button
          className="delete-btn"
          onClick={() => {
            if (selectedId) {
              deleteTransaction(selectedId, "income");
            }
          }}
          disabled={actionDisabled}>
          {deleting === selectedId ? "Deleting..." : "Delete"}
        </button>
      </div>

      <table className="income-table">
        <thead>
          <tr>
            <th className="select-col">Select</th>
            <th className="item-col">Item</th>
            <th className="amount-col">Amount</th>
          </tr>
        </thead>
        <tbody>
          {incomeData.map((item) => (
            <tr
              key={item.id}
              className={selectedId === item.id ? "selected" : ""}>
              <td className="select-col">
                <input
                  type="checkbox"
                  aria-label={`Select income ${item.transactionName}`}
                  checked={selectedId === item.id}
                  onChange={() => onSelectRow(item.id)}
                />
              </td>
              <td className="item-col">{item.transactionName}</td>
              <td className="amount-col">Rp{item.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Income;
