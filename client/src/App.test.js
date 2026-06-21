import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import App from "./App";

jest.mock("axios");

const API_URL = "http://localhost:3001";

const income = [{ id: 1, transactionName: "Salary", amount: 5000 }];
const expense = [{ id: 2, transactionName: "Rent", amount: 1500 }];

const mockInitialRequests = () => {
  axios.get.mockImplementation((url) => {
    if (url === `${API_URL}/income`) {
      return Promise.resolve({ data: income });
    }

    if (url === `${API_URL}/expense`) {
      return Promise.resolve({ data: expense });
    }

    return Promise.reject(new Error(`Unhandled GET request: ${url}`));
  });
};

const renderApp = async () => {
  mockInitialRequests();
  render(<App />);

  await screen.findByText("Salary");
  await screen.findByText("Rent");
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(window, "alert").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  window.alert.mockRestore();
  console.error.mockRestore();
});

test("loads and renders income and expense transactions on startup", async () => {
  await renderApp();

  expect(axios.get).toHaveBeenCalledWith(`${API_URL}/income`);
  expect(axios.get).toHaveBeenCalledWith(`${API_URL}/expense`);
  expect(screen.getByText("Income and Expense Tracker")).toBeInTheDocument();
  expect(screen.getByText("Salary")).toBeInTheDocument();
  expect(screen.getByText("Rp5000")).toBeInTheDocument();
  expect(screen.getByText("Rent")).toBeInTheDocument();
  expect(screen.getByText("Rp 1500")).toBeInTheDocument();
});

test("shows an error alert when income data fails to load", async () => {
  const incomeError = new Error("Failed to fetch income");

  axios.get.mockImplementation((url) => {
    if (url === `${API_URL}/income`) {
      return Promise.reject(incomeError);
    }

    if (url === `${API_URL}/expense`) {
      return Promise.resolve({ data: expense });
    }

    return Promise.reject(new Error(`Unhandled GET Request: ${url}`));
  });

  render(<App />);

  await screen.findByText("Rent"); // verify it appears after async loading

  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith(
      "Error fetching income data. Please try again later.",
    );
  });

  expect(console.error).toHaveBeenCalledWith(
    "There was an error fetching the income data!",
    incomeError,
  );

  expect(screen.queryByText("Salary")).not.toBeInTheDocument();
});

test("shows an error alert when expense data fails to load", async () => {
  const expenseError = new Error("Failed to fetch expense");

  axios.get.mockImplementation((url) => {
    if (url === `${API_URL}/expense`) {
      return Promise.reject(expenseError);
    }

    if (url === `${API_URL}/income`) {
      return Promise.resolve({ data: income });
    }

    return Promise.reject(new Error(`Unhandled GET Request: ${url}`));
  });

  render(<App />);

  await screen.findByText("Salary");

  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith(
      "Error fetching expense data. Please try again later.",
    );
  });

  expect(console.error).toHaveBeenCalledWith(
    "There was an error fetching the expense data!",
    expenseError,
  );

  expect(screen.getByText("Salary")).toBeInTheDocument();
  expect(screen.queryByText("Rent")).not.toBeInTheDocument();
});

test("adds an income transaction and refreshes the income list", async () => {
  await renderApp();
  axios.post.mockResolvedValueOnce({});

  await userEvent.type(screen.getByLabelText(/transaction name/i), "Bonus");
  await userEvent.clear(screen.getByLabelText(/^amount/i));
  await userEvent.type(screen.getByLabelText(/^amount/i), "1000");
  await userEvent.click(screen.getByRole("button", { name: /add income/i }));

  await waitFor(() => {
    expect(axios.post).toHaveBeenCalledWith(`${API_URL}/income`, {
      transactionName: "Bonus",
      amount: 1000,
    });
  });

  await waitFor(() => {
    expect(axios.get).toHaveBeenCalledWith(`${API_URL}/income`);
  });
  expect(window.alert).toHaveBeenCalledWith("Income added successfully!");
});

test("shows an error alert and resets loading when adding income fails", async () => {
  const addIncomeError = new Error("Failed to add income");

  await renderApp();
  axios.post.mockRejectedValueOnce(addIncomeError);

  await userEvent.type(screen.getByLabelText(/transaction name/i), "Bonus");
  await userEvent.clear(screen.getByLabelText(/^amount/i));
  await userEvent.type(screen.getByLabelText(/^amount/i), "1000");
  await userEvent.click(screen.getByRole("button", { name: /add income/i }));

  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith(
      "Error adding the income transaction. Please try again later.",
    );
  });

  expect(console.error).toHaveBeenCalledWith(
    "There was an error adding the income transaction!",
    addIncomeError,
  );
  expect(screen.getByRole("button", { name: /add income/i })).toBeEnabled();
  expect(screen.getByRole("button", { name: /add expense/i })).toBeEnabled();
});

test("opens a populated edit modal without sending an update request", async () => {
  await renderApp();

  await userEvent.click(screen.getAllByRole("radio")[0]);
  await userEvent.click(screen.getAllByRole("button", { name: /update/i })[0]);

  const dialog = screen.getByRole("dialog", { name: /edit income/i });

  expect(dialog).toBeInTheDocument();
  expect(within(dialog).getByLabelText(/transaction name/i)).toHaveValue(
    "Salary",
  );
  expect(within(dialog).getByLabelText(/transaction amount/i)).toHaveValue(
    5000,
  );
  expect(axios.put).not.toHaveBeenCalled();
});

test("submits edited income values and closes the edit modal", async () => {
  await renderApp();
  axios.put.mockResolvedValueOnce({});

  await userEvent.click(screen.getAllByRole("radio")[0]);
  await userEvent.click(screen.getAllByRole("button", { name: /update/i })[0]);

  const dialog = screen.getByRole("dialog", { name: /edit income/i });

  await userEvent.clear(within(dialog).getByLabelText(/transaction name/i));
  await userEvent.type(
    within(dialog).getByLabelText(/transaction name/i),
    "Updated Salary",
  );
  await userEvent.clear(within(dialog).getByLabelText(/transaction amount/i));
  await userEvent.type(
    within(dialog).getByLabelText(/transaction amount/i),
    "6000",
  );
  await userEvent.click(within(dialog).getByRole("button", { name: /save/i }));

  await waitFor(() => {
    expect(axios.put).toHaveBeenCalledWith(`${API_URL}/income/1`, {
      transactionName: "Updated Salary",
      amount: 6000,
    });
  });

  await waitFor(() => {
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  expect(window.alert).toHaveBeenCalledWith("Income updated successfully!");
});

test("blocks invalid edit values before calling the update API", async () => {
  await renderApp();

  await userEvent.click(screen.getAllByRole("radio")[0]);
  await userEvent.click(screen.getAllByRole("button", { name: /update/i })[0]);

  const dialog = screen.getByRole("dialog", { name: /edit income/i });

  await userEvent.clear(within(dialog).getByLabelText(/transaction name/i));
  await userEvent.click(within(dialog).getByRole("button", { name: /save/i }));

  expect(axios.put).not.toHaveBeenCalled();
  expect(window.alert).toHaveBeenCalledWith(
    "Please enter a transaction name and a positive amount.",
  );
});

test("selecting an expense clears the selected income", async () => {
  await renderApp();

  const radios = screen.getAllByRole("radio");
  const incomeRadio = radios[0];
  const expenseRadio = radios[1];

  await userEvent.click(incomeRadio);
  expect(incomeRadio).toBeChecked();

  await userEvent.click(expenseRadio);
  expect(expenseRadio).toBeChecked();
  expect(incomeRadio).not.toBeChecked();
});

test("deletes the selected expense and refreshes the expense list", async () => {
  await renderApp();
  axios.delete.mockResolvedValueOnce({});

  await userEvent.click(screen.getAllByRole("radio")[1]);
  await userEvent.click(screen.getAllByRole("button", { name: /delete/i })[1]);

  await waitFor(() => {
    expect(axios.delete).toHaveBeenCalledWith(`${API_URL}/expense/2`);
  });

  await waitFor(() => {
    expect(axios.get).toHaveBeenCalledWith(`${API_URL}/expense`);
  });
  expect(window.alert).toHaveBeenCalledWith(
    "Transaction deleted successfully!",
  );
});
