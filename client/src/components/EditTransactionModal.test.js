import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditTransactionModal from "./EditTransactionModal";

const transaction = {
  id: 1,
  type: "income",
  transactionName: "Salary",
  amount: 5000,
};

beforeEach(() => {
  jest.spyOn(window, "alert").mockImplementation(() => {});
});

afterEach(() => {
  window.alert.mockRestore();
});

test("renders nothing when there is no transaction", () => {
  render(
    <EditTransactionModal
      transaction={null}
      updating={null}
      onCancel={jest.fn()}
      onSave={jest.fn()}
    />,
  );

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("renders a populated edit form", () => {
  render(
    <EditTransactionModal
      transaction={transaction}
      updating={null}
      onCancel={jest.fn()}
      onSave={jest.fn()}
    />,
  );

  expect(
    screen.getByRole("dialog", { name: /edit income/i }),
  ).toBeInTheDocument();
  expect(screen.getByLabelText(/transaction name/i)).toHaveValue("Salary");
  expect(screen.getByLabelText(/transaction amount/i)).toHaveValue(5000);
});

test("saves trimmed name and numeric amount", async () => {
  const onSave = jest.fn();

  render(
    <EditTransactionModal
      transaction={transaction}
      updating={null}
      onCancel={jest.fn()}
      onSave={onSave}
    />,
  );

  await userEvent.clear(screen.getByLabelText(/transaction name/i));
  await userEvent.type(
    screen.getByLabelText(/transaction name/i),
    " Updated Salary ",
  );
  await userEvent.clear(screen.getByLabelText(/transaction amount/i));
  await userEvent.type(screen.getByLabelText(/transaction amount/i), "6000");
  await userEvent.click(screen.getByRole("button", { name: /save/i }));

  expect(onSave).toHaveBeenCalledWith(1, "income", {
    transactionName: "Updated Salary",
    amount: 6000,
  });
});

test("blocks invalid save values", async () => {
  const onSave = jest.fn();

  render(
    <EditTransactionModal
      transaction={transaction}
      updating={null}
      onCancel={jest.fn()}
      onSave={onSave}
    />,
  );

  await userEvent.clear(screen.getByLabelText(/transaction name/i));
  await userEvent.click(screen.getByRole("button", { name: /save/i }));

  expect(window.alert).toHaveBeenCalledWith(
    "Please enter a transaction name and a positive amount.",
  );
  expect(onSave).not.toHaveBeenCalled();
});

test("disables controls while saving", () => {
  render(
    <EditTransactionModal
      transaction={transaction}
      updating={1}
      onCancel={jest.fn()}
      onSave={jest.fn()}
    />,
  );

  expect(screen.getByLabelText(/transaction name/i)).toBeDisabled();
  expect(screen.getByLabelText(/transaction amount/i)).toBeDisabled();
  expect(screen.getByRole("button", { name: /updating/i })).toBeDisabled();
  expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
});
