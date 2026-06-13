import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Expense from "./Expense";

const expenseData = [
  { id: 1, transactionName: "Rent", amount: 1500 },
  { id: 2, transactionName: "Food", amount: 300 },
];

const renderExpense = (overrideProps = {}) => {
  const props = {
    expenseData,
    deleteTransaction: jest.fn(),
    deleting: null,
    selectedId: null,
    onSelectRow: jest.fn(),
    openEditTransaction: jest.fn(),
    updating: null,
    ...overrideProps,
  };

  render(<Expense {...props} />);

  return props;
};

test("renders expense rows", () => {
  renderExpense();

  expect(screen.getByText("Rent")).toBeInTheDocument();
  expect(screen.getByText("Rp 1500")).toBeInTheDocument();
  expect(screen.getByText("Food")).toBeInTheDocument();
  expect(screen.getByText("Rp 300")).toBeInTheDocument();
});

test("calls selection handler when a row radio is selected", async () => {
  const props = renderExpense();

  await userEvent.click(screen.getAllByRole("radio")[0]);

  expect(props.onSelectRow).toHaveBeenCalledWith(1);
});

test("opens edit flow for the selected expense", async () => {
  const props = renderExpense({ selectedId: 1 });

  await userEvent.click(screen.getByRole("button", { name: /update/i }));

  expect(props.openEditTransaction).toHaveBeenCalledWith(
    expenseData[0],
    "expense",
  );
});

test("deletes the selected expense", async () => {
  const props = renderExpense({ selectedId: 1 });

  await userEvent.click(screen.getByRole("button", { name: /delete/i }));

  expect(props.deleteTransaction).toHaveBeenCalledWith(1, "expense");
});
