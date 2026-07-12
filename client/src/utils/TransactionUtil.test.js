import {
  formatAmount,
  getTransactionKey,
  getTransactionTotals,
  isSingleRecordId,
  removeClientOnlyFields,
} from "./TransactionUtil";

test("creates unique transaction keys from type and id", () => {
  expect(getTransactionKey(1, "income")).toBe("income:1");
  expect(getTransactionKey(1, "expense")).toBe("expense:1");
});

test("checks whether a value is a single record id", () => {
  expect(isSingleRecordId(1)).toBe(true);
  expect(isSingleRecordId("abc")).toBe(true);
  expect(isSingleRecordId(null)).toBe(false);
  expect(isSingleRecordId(undefined)).toBe(false);
  expect(isSingleRecordId("")).toBe(false);
  expect(isSingleRecordId([1, 2])).toBe(false);
});

test("removes UI-only fields before sending data to the server", () => {
  expect(
    removeClientOnlyFields({
      id: 1,
      transactionName: "Salary",
      amount: 5000,
      type: "income",
    }),
  ).toEqual({
    id: 1,
    transactionName: "Salary",
    amount: 5000,
  });
});

test("formats amounts with Indonesian number separators", () => {
  expect(formatAmount(250000)).toBe("250.000,00");
  expect(formatAmount("5000")).toBe("5.000,00");
});

test("calculates income, expense, and balance totals", () => {
  expect(
    getTransactionTotals([
      { id: 1, type: "income", amount: 500000 },
      { id: 2, type: "income", amount: "250000" },
      { id: 1, type: "expense", amount: 100000 },
    ]),
  ).toEqual({
    totalIncome: 750000,
    totalExpense: 100000,
    totalBalance: 650000,
  });
});

test("returns zero totals for an empty transaction list", () => {
  expect(getTransactionTotals([])).toEqual({
    totalIncome: 0,
    totalExpense: 0,
    totalBalance: 0,
  });
});
