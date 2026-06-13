import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Income from "./Income";

const incomeData = [
  { id: 1, transactionName: "Salary", amount: 5000 },
  { id: 2, transactionName: "Bonus", amount: 1000 },
];

const renderIncome = (overrideProps = {}) => {
  const props = {
    incomeData,
    deleteTransaction: jest.fn(),
    deleting: null,
    handleSelectedIncome: jest.fn(),
    selectedId: null,
    openEditTransaction: jest.fn(),
    updating: null,
    ...overrideProps,
  };

  render(<Income {...props} />);

  return props;
};

test("renders income rows", () => {
  renderIncome();

  expect(screen.getByText("Salary")).toBeInTheDocument();
  expect(screen.getByText("Rp5000")).toBeInTheDocument();
  expect(screen.getByText("Bonus")).toBeInTheDocument();
  expect(screen.getByText("Rp1000")).toBeInTheDocument();
});

test("calls selection handler when a row radio is selected", async () => {
  const props = renderIncome();

  await userEvent.click(screen.getAllByRole("radio")[0]);

  expect(props.handleSelectedIncome).toHaveBeenCalledWith(1);
});

test("disables update and delete buttons when no income is selected", () => {
  renderIncome();

  expect(screen.getByRole("button", { name: /edit/i })).toBeDisabled();
  expect(screen.getByRole("button", { name: /delete/i })).toBeDisabled();
});

test("opens edit flow for the selected income", async () => {
  const props = renderIncome({ selectedId: 1 });

  await userEvent.click(screen.getByRole("button", { name: /update/i }));

  expect(props.openEditTransaction).toHaveBeenCalledWith(
    incomeData[0],
    "income",
  );
});

test("deletes the selected income", async () => {
  const props = renderIncome({ selectedId: 1 });

  await userEvent.click(screen.getByRole("button", { name: /delete/i }));

  expect(props.deleteTransaction).toHaveBeenCalledWith(1, "income");
});
