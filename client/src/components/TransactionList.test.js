import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TransactionList from "./TransactionList";

const transactionData = [
  { id: 1, transactionName: "Salary", amount: 500000, type: "income" },
  { id: 2, transactionName: "Bonus", amount: 250000, type: "income" },
  { id: 1, transactionName: "Rent", amount: 100000, type: "expense" },
];

const renderTransactionList = (overrideProps = {}) => {
  const props = {
    transactionData,
    selectedIdAndType: null,
    onSelect: jest.fn(),
    openEditTransaction: jest.fn(),
    deleteTransaction: jest.fn(),
    deleting: null,
    updating: null,
    ...overrideProps,
  };

  render(<TransactionList {...props} />);

  return props;
};

test("renders transaction rows and formatted totals", () => {
  renderTransactionList();

  expect(
    screen.getByRole("table", { name: /income and expense transactions/i }),
  ).toBeInTheDocument();
  expect(screen.getByText("Salary")).toBeInTheDocument();
  expect(screen.getByText("Bonus")).toBeInTheDocument();
  expect(screen.getByText("Rent")).toBeInTheDocument();
  expect(screen.getByText("Total Income: Rp 750.000,00")).toBeInTheDocument();
  expect(screen.getByText("Total Expense: Rp 100.000,00")).toBeInTheDocument();
  expect(screen.getByText("Total Balance: Rp 650.000,00")).toBeInTheDocument();
});

test("calls select handler with transaction id and type", async () => {
  const { onSelect } = renderTransactionList();

  await userEvent.click(
    screen.getByRole("radio", { name: /select income salary/i }),
  );

  expect(onSelect).toHaveBeenCalledWith(1, "income");
});

test("gives each transaction radio button an accessible label", () => {
  renderTransactionList();

  expect(
    screen.getByRole("radio", { name: /select income salary/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("radio", { name: /select income bonus/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("radio", { name: /select expense rent/i }),
  ).toBeInTheDocument();
});

test("keeps edit and delete disabled when no transaction is selected", () => {
  renderTransactionList();

  expect(screen.getByRole("button", { name: /edit/i })).toBeDisabled();
  expect(screen.getByRole("button", { name: /delete/i })).toBeDisabled();
});

test("opens edit flow for the selected transaction", async () => {
  const { openEditTransaction } = renderTransactionList({
    selectedIdAndType: "income:1",
  });

  await userEvent.click(screen.getByRole("button", { name: /edit/i }));

  expect(openEditTransaction).toHaveBeenCalledWith(transactionData[0]);
});

test("deletes the selected transaction", async () => {
  const { deleteTransaction } = renderTransactionList({
    selectedIdAndType: "expense:1",
  });

  await userEvent.click(screen.getByRole("button", { name: /delete/i }));

  expect(deleteTransaction).toHaveBeenCalledWith(transactionData[2]);
});

test("disables actions while a delete or update request is active", () => {
  renderTransactionList({
    selectedIdAndType: "income:1",
    deleting: 1,
  });

  expect(screen.getByRole("button", { name: /edit/i })).toBeDisabled();
  expect(screen.getByRole("button", { name: /delete/i })).toBeDisabled();
});
