import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import App from "./App";

jest.mock("axios");

const income = [{ id: 1, transactionName: "Salary", amount: 5000 }];
const expense = [{ id: 2, transactionName: "Rent", amount: 1500 }];

const mockInitialRequests = () => {
  axios.get.mockImplementation((url) => {
    if (url.includes("/income")) {
      return Promise.resolve({ data: income });
    }

    if (url.includes("/expense")) {
      return Promise.resolve({ data: expense });
    }

    return Promise.reject(new Error(`Unhandled GET ${url}`));
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(window, "alert").mockImplementation(() => {});
  mockInitialRequests();
});

afterEach(() => {
  window.alert.mockRestore();
});

test("selecting a row enables update and delete actions", async () => {
  render(<App />);

  expect(await screen.findByText("Salary")).toBeInTheDocument();

  const updateButtons = screen.getAllByText("Update");
  const deleteButtons = screen.getAllByText("Delete");

  expect(updateButtons[0]).toBeDisabled();
  expect(deleteButtons[0]).toBeDisabled();

  await userEvent.click(screen.getAllByRole("checkbox")[0]);

  expect(updateButtons[0]).toBeEnabled();
  expect(deleteButtons[0]).toBeEnabled();
});

test("selecting an expense row clears the selected income row", async () => {
  render(<App />);

  expect(await screen.findByText("Salary")).toBeInTheDocument();
  expect(await screen.findByText("Rent")).toBeInTheDocument();

  const checkboxes = screen.getAllByRole("checkbox");

  await userEvent.click(checkboxes[0]);
  expect(checkboxes[0]).toBeChecked();

  await userEvent.click(checkboxes[1]);
  expect(checkboxes[0]).not.toBeChecked();
  expect(checkboxes[1]).toBeChecked();
});

test("opens a populated edit modal for selected income without sending PUT", async () => {
  render(<App />);

  expect(await screen.findByText("Salary")).toBeInTheDocument();

  await userEvent.click(screen.getAllByRole("checkbox")[0]);
  await userEvent.click(screen.getAllByText("Update")[0]);

  expect(
    screen.getByRole("dialog", { name: /edit income/i }),
  ).toBeInTheDocument();
  expect(screen.getByDisplayValue("Salary")).toBeInTheDocument();
  expect(screen.getByDisplayValue("5000")).toBeInTheDocument();
  expect(axios.put).not.toHaveBeenCalled();
});

test("submits edited income values", async () => {
  axios.put.mockResolvedValueOnce({});

  render(<App />);

  expect(await screen.findByText("Salary")).toBeInTheDocument();

  await userEvent.click(screen.getAllByRole("checkbox")[0]);
  await userEvent.click(screen.getAllByText("Update")[0]);

  const nameInput = screen.getByLabelText(/transaction name/i);
  const amountInput = screen.getByLabelText(/amount/i);

  await userEvent.clear(nameInput);
  await userEvent.type(nameInput, "Updated Salary");
  await userEvent.clear(amountInput);
  await userEvent.type(amountInput, "6000");
  await userEvent.click(screen.getByRole("button", { name: /save/i }));

  await waitFor(() => {
    expect(axios.put).toHaveBeenCalledWith(
      expect.stringContaining("/income/1"),
      expect.objectContaining({
        transactionName: "Updated Salary",
        amount: 6000,
      }),
    );
  });
});

test("does not submit invalid edit values", async () => {
  render(<App />);

  expect(await screen.findByText("Salary")).toBeInTheDocument();

  await userEvent.click(screen.getAllByRole("checkbox")[0]);
  await userEvent.click(screen.getAllByText("Update")[0]);

  const nameInput = screen.getByLabelText(/transaction name/i);

  await userEvent.clear(nameInput);
  await userEvent.click(screen.getByRole("button", { name: /save/i }));

  expect(axios.put).not.toHaveBeenCalled();
});

test("opens a populated edit modal for selected expense", async () => {
  render(<App />);

  expect(await screen.findByText("Rent")).toBeInTheDocument();

  await userEvent.click(screen.getAllByRole("checkbox")[1]);
  await userEvent.click(screen.getAllByText("Update")[1]);

  expect(
    screen.getByRole("dialog", { name: /edit expense/i }),
  ).toBeInTheDocument();
  expect(screen.getByDisplayValue("Rent")).toBeInTheDocument();
  expect(screen.getByDisplayValue("1500")).toBeInTheDocument();
});

test("deletes only the selected income record", async () => {
  let resolveDelete;
  axios.delete.mockReturnValueOnce(
    new Promise((resolve) => {
      resolveDelete = resolve;
    }),
  );

  render(<App />);

  expect(await screen.findByText("Salary")).toBeInTheDocument();

  await userEvent.click(screen.getAllByRole("checkbox")[0]);
  await userEvent.click(screen.getAllByText("Delete")[0]);

  expect(screen.getByText("Deleting...")).toBeInTheDocument();

  resolveDelete({});

  await waitFor(() => {
    expect(axios.delete).toHaveBeenCalledWith(
      expect.stringContaining("/income/1"),
    );
  });

  expect(axios.delete).toHaveBeenCalledTimes(1);
});
