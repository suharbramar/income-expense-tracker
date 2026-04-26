const Income = ({
  incomeData,
  deleteTransaction,
  deleting,
  onSelectRow,
  selectedId,
  updateTransaction,
  updating,
}) => {
  return (
    <div className="income-list">
      <div className="income-heading">
        <h2>Income List</h2>
      </div>
      <div className="button-group">
        <button
          className="update-btn"
          onClick={() => onSelectRow(selectedId)}
          disabled={!selectedId || updating === selectedId}>
          {updating !== null && selectedId !== null ? "Updating..." : "Update"}
        </button>
        <button
          className="delete-btn"
          onClick={() => onSelectRow(selectedId)}
          disabled={!selectedId || deleting === selectedId}>
          {deleting !== null && selectedId != null ? "Deleting..." : "Delete"}
        </button>
      </div>

      <table>
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
              <td>
                <input
                  type="checkbox"
                  checked={selectedId === item.id}
                  onChange={() => onSelectRow(item.id)}></input>
              </td>
              <td>{item.transactionName}</td>
              <td>{item.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Income;
