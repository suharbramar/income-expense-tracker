export type TransactionType = "income" | "expense";

export type TransactionPayload = {
  transactionName: string;
  amount: number;
};

export type ServerTransaction = TransactionPayload & {
  id: number;
};

export type Transaction = ServerTransaction & {
  type: TransactionType;
};

export type TransactionTotals = {
  totalIncome: number;
  totalExpense: number;
  totalBalance: number;
};

export type MutationResult = { success: true } | { success: false };

export type MessageType = "success" | "error";

export type AppMessage = {
  type: MessageType;
  text: string;
};
