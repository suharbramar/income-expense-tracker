import {
  formatAmount,
  getTransactionKey,
  getTransactionTotals,
} from "../utils/TransactionUtil";

const TransactionList = ({
  transactionData,
  selectedIdAndType,
  onSelect,
  openEditTransaction,
  deleteTransaction,
  deleting,
  updating,
}) => {
  const selectedTransaction = transactionData.find(
    (item) => selectedIdAndType === getTransactionKey(item.id, item.type),
  );
  const actionDisabled =
    !selectedTransaction || deleting !== null || updating !== null;

  const { totalIncome, totalExpense, totalBalance } =
    getTransactionTotals(transactionData);

  return (
    <div className="transaction-list">
      <div className="transaction-summary">
        <p>Total Income: Rp {formatAmount(totalIncome)}</p>
        <p>Total Expense: Rp {formatAmount(totalExpense)}</p>
        <p>Total Balance: Rp {formatAmount(totalBalance)}</p>
      </div>

      <div className="button-group">
        <button
          className="update-btn"
          onClick={() => {
            if (selectedTransaction) {
              openEditTransaction(selectedTransaction);
            }
          }}
          disabled={actionDisabled}>
          Edit
        </button>
        <button
          className="delete-btn"
          onClick={() => {
            if (selectedTransaction) {
              deleteTransaction(selectedTransaction);
            }
          }}
          disabled={actionDisabled}>
          Delete
        </button>
      </div>
      <table className="transaction-table">
        <caption>Income and expense transactions</caption>
        <thead>
          <tr>
            <th className="select-col">Select</th>
            <th className="item-col">Item</th>
            <th className="amount-col">Amount</th>
            <th className="type-col">Type</th>
          </tr>
        </thead>
        <tbody>
          {transactionData.map((item) => (
            <tr
              key={getTransactionKey(item.id, item.type)}
              className={
                selectedIdAndType === getTransactionKey(item.id, item.type)
                  ? "selected"
                  : ""
              }>
              <td className="select-col">
                <input
                  type="radio"
                  name="selected-transaction"
                  aria-label={`Select ${item.type} ${item.transactionName}`}
                  checked={
                    selectedIdAndType === getTransactionKey(item.id, item.type)
                  }
                  onChange={() => onSelect(item.id, item.type)}
                />
              </td>
              <td className="item-col">{item.transactionName}</td>
              <td className="amount-col">Rp {formatAmount(item.amount)}</td>
              <td className="type-col">{item.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;
