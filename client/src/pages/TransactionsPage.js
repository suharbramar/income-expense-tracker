import InputForm from "../components/InputForm";
import ItemHeader from "../components/ItemHeader";
import TransactionList from "../components/TransactionList";
import EditTransactionModal from "../components/EditTransactionModal";
import MessageBanner from "../components/MessageBanner";

import useTransactions from "../hooks/useTransactions";
import useTransactionSelection from "../hooks/useTransactionSelection";

const TransactionsPage = () => {
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
    <main className="page transactions-page">
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
    </main>
  );
};

export default TransactionsPage;
