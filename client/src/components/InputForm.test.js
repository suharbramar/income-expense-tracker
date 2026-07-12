import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InputForm from "./InputForm";

test("submits an income transaction with trimmed name and numeric amount", async () => {
  const postTransaction = jest.fn();

  render(<InputForm postTransaction={postTransaction} loading={false} />);

  await userEvent.type(
    screen.getByLabelText(/transaction name/i),
    " Salary ",
  );
  await userEvent.type(screen.getByLabelText(/^amount/i), "5000");
  await userEvent.click(screen.getByRole("button", { name: /add income/i }));

  expect(postTransaction).toHaveBeenCalledWith("income", {
    transactionName: "Salary",
    amount: 5000,
  });
});

test("submits an expense transaction", async () => {
  const postTransaction = jest.fn();

  render(<InputForm postTransaction={postTransaction} loading={false} />);

  await userEvent.type(screen.getByLabelText(/transaction name/i), "Rent");
  await userEvent.type(screen.getByLabelText(/^amount/i), "1500");
  await userEvent.click(screen.getByRole("button", { name: /add expense/i }));

  expect(postTransaction).toHaveBeenCalledWith("expense", {
    transactionName: "Rent",
    amount: 1500,
  });
});

test("shows an error message and does not submit when fields are invalid", async () => {
  const postTransaction = jest.fn();
  const onMessage = jest.fn();

  render(
    <InputForm
      postTransaction={postTransaction}
      loading={false}
      onMessage={onMessage}
    />,
  );

  await userEvent.click(screen.getByRole("button", { name: /add income/i }));

  expect(onMessage).toHaveBeenCalledWith("error", "Please fill in all fields.");
  expect(postTransaction).not.toHaveBeenCalled();
});

test("disables add buttons while loading", () => {
  render(<InputForm postTransaction={jest.fn()} loading={true} />);

  expect(screen.getByRole("button", { name: /adding income/i })).toBeDisabled();
  expect(
    screen.getByRole("button", { name: /adding expense/i }),
  ).toBeDisabled();
});
