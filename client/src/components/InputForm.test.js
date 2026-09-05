import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InputForm from "./InputForm";

const fillValidForm = async () => {
  await userEvent.type(
    screen.getByLabelText(/transaction name/i),
    "Salary",
  );
  await userEvent.type(screen.getByLabelText(/^amount/i), "5000");
};

test("shows validation errors and does not submit empty fields", async () => {
  const postTransaction = jest.fn();

  render(<InputForm postTransaction={postTransaction} />);

  await userEvent.click(screen.getByRole("button", { name: /add income/i }));

  expect(
    await screen.findByText("Enter a transaction name."),
  ).toBeInTheDocument();
  expect(
    await screen.findByText("Enter an amount greater than zero"),
  ).toBeInTheDocument();
  expect(postTransaction).not.toHaveBeenCalled();
});

test.each(["0", "-1"])("rejects an amount of %s", async (amount) => {
  const postTransaction = jest.fn();

  render(<InputForm postTransaction={postTransaction} />);

  await userEvent.type(
    screen.getByLabelText(/transaction name/i),
    "Salary",
  );
  await userEvent.type(screen.getByLabelText(/^amount/i), amount);
  await userEvent.click(screen.getByRole("button", { name: /add income/i }));

  expect(
    await screen.findByText("Enter an amount greater than zero"),
  ).toBeInTheDocument();
  expect(postTransaction).not.toHaveBeenCalled();
});

test("submits an income transaction with trimmed name and numeric amount", async () => {
  const postTransaction = jest.fn().mockResolvedValue({ success: true });

  render(<InputForm postTransaction={postTransaction} />);

  await userEvent.type(
    screen.getByLabelText(/transaction name/i),
    " Salary ",
  );
  await userEvent.type(screen.getByLabelText(/^amount/i), "5000");
  await userEvent.click(screen.getByRole("button", { name: /add income/i }));

  await waitFor(() => {
    expect(postTransaction).toHaveBeenCalledWith("income", {
      transactionName: "Salary",
      amount: 5000,
    });
  });
});

test("submits an expense transaction when the expense button is clicked", async () => {
  const postTransaction = jest.fn().mockResolvedValue({ success: true });

  render(<InputForm postTransaction={postTransaction} />);

  await fillValidForm();
  await userEvent.click(screen.getByRole("button", { name: /add expense/i }));

  await waitFor(() => {
    expect(postTransaction).toHaveBeenCalledWith("expense", {
      transactionName: "Salary",
      amount: 5000,
    });
  });
});

test("resets the fields after a successful submission", async () => {
  const postTransaction = jest.fn().mockResolvedValue({ success: true });

  render(<InputForm postTransaction={postTransaction} />);

  await fillValidForm();
  await userEvent.click(screen.getByRole("button", { name: /add income/i }));

  await waitFor(() => {
    expect(screen.getByLabelText(/transaction name/i)).toHaveValue("");
  });
  expect(screen.getByLabelText(/^amount/i)).toHaveValue(null);
});

test("keeps the fields filled when submission fails", async () => {
  const postTransaction = jest.fn().mockResolvedValue({ success: false });

  render(<InputForm postTransaction={postTransaction} />);

  await fillValidForm();
  await userEvent.click(screen.getByRole("button", { name: /add income/i }));

  await waitFor(() => {
    expect(screen.getByLabelText(/transaction name/i)).toHaveValue("Salary");
  });
  expect(screen.getByLabelText(/^amount/i)).toHaveValue(5000);
});

test("disables add buttons while loading", () => {
  render(<InputForm postTransaction={jest.fn()} loading={true} />);

  expect(screen.getByRole("button", { name: /adding income/i })).toBeDisabled();
  expect(
    screen.getByRole("button", { name: /adding expense/i }),
  ).toBeDisabled();
});
