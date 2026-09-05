import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditTransactionModal from "./EditTransactionModal";

const transaction = {
  id: 1,
  type: "income",
  transactionName: "Salary",
  amount: 5000,
};

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

test("replaces form values when a different transaction is selected", async () => {
  const secondTransaction = {
    id: 2,
    type: "expense",
    transactionName: "Rent",
    amount: 1250,
  };

  const { rerender } = render(
    <EditTransactionModal
      transaction={transaction}
      updating={null}
      onCancel={jest.fn()}
      onSave={jest.fn()}
    />,
  );

  await userEvent.clear(screen.getByLabelText(/transaction name/i));
  await userEvent.type(screen.getByLabelText(/transaction name/i), "Temporary edit");

  rerender(
    <EditTransactionModal
      transaction={secondTransaction}
      updating={null}
      onCancel={jest.fn()}
      onSave={jest.fn()}
    />,
  );

  await waitFor(() => {
    expect(screen.getByLabelText(/transaction name/i)).toHaveValue("Rent");
  });

  expect(
    screen.getByRole("dialog", { name: /edit expense/i }),
  ).toBeInTheDocument();
  expect(screen.getByLabelText(/transaction amount/i)).toHaveValue(1250);
});

test("focuses the transaction name input when the modal opens", () => {
  render(
    <EditTransactionModal
      transaction={transaction}
      updating={null}
      onCancel={jest.fn()}
      onSave={jest.fn()}
    />,
  );

  expect(screen.getByLabelText(/transaction name/i)).toHaveFocus();
});

test("keeps focus in the modal when saving starts", async () => {
  const trigger = document.createElement("button");
  document.body.appendChild(trigger);
  trigger.focus();

  try {
    const { rerender } = render(
      <EditTransactionModal
        transaction={transaction}
        updating={null}
        onCancel={jest.fn()}
        onSave={jest.fn()}
      />,
    );

    const nameInput = screen.getByLabelText(/transaction name/i);
    await waitFor(() => expect(nameInput).toHaveFocus());

    rerender(
      <EditTransactionModal
        transaction={transaction}
        updating={transaction.id}
        onCancel={jest.fn()}
        onSave={jest.fn()}
      />,
    );

    await waitFor(() => expect(nameInput).toHaveFocus());
  } finally {
    trigger.remove();
  }
});

test("saves trimmed name and numeric amount", async () => {
  const onSave = jest.fn().mockResolvedValue({ success: true });

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

  await waitFor(() => {
    expect(onSave).toHaveBeenCalledWith(1, "income", {
      transactionName: "Updated Salary",
      amount: 6000,
    });
  });
});

test("reports invalid save values", async () => {
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

  expect(
    await screen.findByText(/enter a transaction name/i),
  ).toBeInTheDocument();
  expect(onSave).not.toHaveBeenCalled();
});

test("reports an invalid amount without saving", async () => {
  const onSave = jest.fn();

  render(
    <EditTransactionModal
      transaction={transaction}
      updating={null}
      onCancel={jest.fn()}
      onSave={onSave}
    />,
  );

  await userEvent.clear(screen.getByLabelText(/transaction amount/i));
  await userEvent.type(screen.getByLabelText(/transaction amount/i), "0");
  await userEvent.click(screen.getByRole("button", { name: /save/i }));

  expect(
    await screen.findByText(/enter an amount greater than zero/i),
  ).toBeInTheDocument();
  expect(screen.getByLabelText(/transaction amount/i)).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  expect(onSave).not.toHaveBeenCalled();
});

test("closes the modal when Escape is pressed", async () => {
  const onCancel = jest.fn();

  render(
    <EditTransactionModal
      transaction={transaction}
      updating={null}
      onCancel={onCancel}
      onSave={jest.fn()}
    />,
  );

  await userEvent.keyboard("{Escape}");

  expect(onCancel).toHaveBeenCalledTimes(1);
});

test("does not close the modal with Escape while saving", async () => {
  const onCancel = jest.fn();

  render(
    <EditTransactionModal
      transaction={transaction}
      updating={1}
      onCancel={onCancel}
      onSave={jest.fn()}
    />,
  );

  await userEvent.keyboard("{Escape}");

  expect(onCancel).not.toHaveBeenCalled();
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
