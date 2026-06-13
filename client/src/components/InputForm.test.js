import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InputForm from "./InputForm";

beforeEach(() => {
  jest.spyOn(window, "alert").mockImplementation(() => {});
});

afterEach(() => {
  window.alert.mockRestore();
});

test("submits an income transaction with parsed amount", async () => {
  const postTransaction = jest.fn();
  render(<InputForm postTransaction={postTransaction} loading={false} />);

  await userEvent.type(screen.getByLabelText(/transaction name/i), "Salary");
  await userEvent.clear(screen.getByLabelText(/amount/i));
  await userEvent.type(screen.getByLabelText(/amount/i), "5000");
  await userEvent.click(screen.getByRole("button", { name: /add income/i }));

  expect(postTransaction).toHaveBeenCalledWith(
    expect.any(Object),
    "income",
    {
      transactionName: "Salary",
      amount: 5000,
    },
    false,
  );
});

test("shows an alert and does not submit when fields are invalid", async () => {
  const postTransaction = jest.fn();

  render(<InputForm postTransaction={postTransaction} loading={false} />);

  await userEvent.click(screen.getByRole("button", { name: /add income/i }));

  expect(window.alert).toHaveBeenCalledWith("Please fill in all fields.");
  expect(postTransaction).not.toHaveBeenCalled();
});

test("disables add buttons while loading", () => {
  render(<InputForm postTransaction={jest.fn()} loading={true} />);

  expect(screen.getByRole("button", { name: /adding income/i })).toBeDisabled();
  expect(
    screen.getByRole("button", { name: /adding expense/i }),
  ).toBeDisabled();
});
