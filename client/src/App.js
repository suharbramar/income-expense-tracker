import "./App.css";
import {
  Header,
  InputForm,
  ItemHeader,
  TransactionList,
  EditTransactionModal,
  MessageBanner,
} from "./components/Index";

import useTransactions from "./hooks/useTransactions";
import useTransactionSelection from "./hooks/useTransactionSelection";

function App() {
  const {
    selectedTransactionId,
    handleSelectedTransaction,
    clearSelectedTransaction,
  } = useTransactionSelection();

  const {
    transactionData,
    loading,
    updating,
    deleting,
    editingTransaction,
    message,
    postTransaction,
    editTransaction,
    removeTransaction,
    openEditTransaction,
    closedEditTransaction,
    showMessage,
    clearMessage,
  } = useTransactions({ onClearSelection: clearSelectedTransaction });

  return (
    <div className="App">
      <Header name="Income and Expense Tracker" />
      <MessageBanner message={message} onDismiss={clearMessage} />
      <InputForm
        postTransaction={postTransaction}
        loading={loading}
        onMessage={showMessage}
      />
      <ItemHeader />
      <div className="transactions">
        <EditTransactionModal
          transaction={editingTransaction}
          updating={updating}
          onCancel={closedEditTransaction}
          onSave={editTransaction}
          onMessage={showMessage}
        />
        <TransactionList
          transactionData={transactionData}
          selectedIdAndType={selectedTransactionId}
          onSelect={handleSelectedTransaction}
          openEditTransaction={openEditTransaction}
          deleteTransaction={removeTransaction}
          deleting={deleting}
          updating={updating}
        />
      </div>
    </div>
  );
}

export default App;
