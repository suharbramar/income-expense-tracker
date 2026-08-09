import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
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

const renderAppAtRoute = (route = "/") => {
  render(
    <MemoryRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      initialEntries={[route]}
    >
      <App />
    </MemoryRouter>,
  );
};

const renderApp = async () => {
  mockInitialRequests();
  renderAppAtRoute("/transactions");

  await screen.findByText("Salary", {}, { timeout: 5000 });
  await screen.findByText("Rent", {}, { timeout: 5000 });
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
});

test("renders the dashboard page by default", async () => {
  renderAppAtRoute();

  expect(
    await screen.findByRole("heading", { name: /dashboard/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /transactions/i }),
  ).toBeInTheDocument();
});

test("navigates to the about page", async () => {
  renderAppAtRoute();

  await userEvent.click(screen.getByRole("link", { name: /about/i }));

  expect(
    await screen.findByRole("heading", { name: /about/i }),
  ).toBeInTheDocument();
});

test("loads and renders the unified transaction list on startup", async () => {
  await renderApp();

  expect(axios.get).toHaveBeenCalledWith(`${API_URL}/income`);
  expect(axios.get).toHaveBeenCalledWith(`${API_URL}/expense`);
  expect(screen.getByText("Income and Expense Tracker")).toBeInTheDocument();
  expect(screen.getByText("Salary")).toBeInTheDocument();
  expect(screen.getByText("Rp 5.000,00")).toBeInTheDocument();
  expect(screen.getByText("Rent")).toBeInTheDocument();
  expect(screen.getByText("Rp 1.500,00")).toBeInTheDocument();
  expect(screen.getByText("Total Balance: Rp 3.500,00")).toBeInTheDocument();
});

test("shows an error banner when initial transaction data fails to load", async () => {
  const transactionError = new Error("Failed to fetch transactions");

  axios.get.mockRejectedValue(transactionError);

  renderAppAtRoute("/transactions");

  expect(
    await screen.findByText(
      "Error fetching transaction data. Please try again later.",
    ),
  ).toBeInTheDocument();
  expect(screen.getByRole("alert")).toBeInTheDocument();

  expect(console.error).toHaveBeenCalledWith(
    "There was an error fetching the transaction data!",
    transactionError,
  );
  expect(screen.queryByText("Salary")).not.toBeInTheDocument();
});

test("adds an income transaction and shows a success message", async () => {
  await renderApp();
  axios.post.mockResolvedValueOnce({});

  await userEvent.type(screen.getByLabelText(/transaction name/i), "Bonus");
  await userEvent.type(screen.getByLabelText(/^amount/i), "1000");
  await userEvent.click(screen.getByRole("button", { name: /add income/i }));

  await waitFor(() => {
    expect(axios.post).toHaveBeenCalledWith(`${API_URL}/income`, {
      transactionName: "Bonus",
      amount: 1000,
    });
  });

  expect(await screen.findByText("Income added successfully!")).toBeInTheDocument();
  expect(screen.getByRole("status")).toBeInTheDocument();
});

test("shows an error banner and resets loading when adding income fails", async () => {
  const addIncomeError = new Error("Failed to add income");

  await renderApp();
  axios.post.mockRejectedValueOnce(addIncomeError);

  await userEvent.type(screen.getByLabelText(/transaction name/i), "Bonus");
  await userEvent.type(screen.getByLabelText(/^amount/i), "1000");
  await userEvent.click(screen.getByRole("button", { name: /add income/i }));

  expect(
    await screen.findByText(
      "Error adding the income transaction. Please try again later.",
    ),
  ).toBeInTheDocument();
  expect(screen.getByRole("alert")).toBeInTheDocument();
  expect(console.error).toHaveBeenCalledWith(
    "There was an error adding the income transaction!",
    addIncomeError,
  );
  expect(screen.getByRole("button", { name: /add income/i })).toBeEnabled();
  expect(screen.getByRole("button", { name: /add expense/i })).toBeEnabled();
});

test("opens a populated edit modal without sending an update request", async () => {
  await renderApp();

  await userEvent.click(
    screen.getByRole("radio", { name: /select income salary/i }),
  );
  await userEvent.click(screen.getByRole("button", { name: /edit/i }));

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

  await userEvent.click(
    screen.getByRole("radio", { name: /select income salary/i }),
  );
  await userEvent.click(screen.getByRole("button", { name: /edit/i }));

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
  expect(
    await screen.findByText("Income updated successfully!"),
  ).toBeInTheDocument();
  expect(screen.getByRole("status")).toBeInTheDocument();
});

test("blocks invalid edit values before calling the update API", async () => {
  await renderApp();

  await userEvent.click(
    screen.getByRole("radio", { name: /select income salary/i }),
  );
  await userEvent.click(screen.getByRole("button", { name: /edit/i }));

  const dialog = screen.getByRole("dialog", { name: /edit income/i });

  await userEvent.clear(within(dialog).getByLabelText(/transaction name/i));
  await userEvent.click(within(dialog).getByRole("button", { name: /save/i }));

  expect(axios.put).not.toHaveBeenCalled();
  expect(
    screen.getByText("Please enter a transaction name and a positive amount."),
  ).toBeInTheDocument();
  expect(screen.getByRole("alert")).toBeInTheDocument();
});

test("selecting an expense clears the selected income", async () => {
  await renderApp();

  const incomeRadio = screen.getByRole("radio", {
    name: /select income salary/i,
  });
  const expenseRadio = screen.getByRole("radio", {
    name: /select expense rent/i,
  });

  await userEvent.click(incomeRadio);
  expect(incomeRadio).toBeChecked();

  await userEvent.click(expenseRadio);
  expect(expenseRadio).toBeChecked();
  expect(incomeRadio).not.toBeChecked();
});

test("deletes the selected expense and refreshes the transaction list", async () => {
  await renderApp();
  axios.delete.mockResolvedValueOnce({});

  await userEvent.click(
    screen.getByRole("radio", { name: /select expense rent/i }),
  );
  await userEvent.click(screen.getByRole("button", { name: /delete/i }));

  await waitFor(() => {
    expect(axios.delete).toHaveBeenCalledWith(`${API_URL}/expense/2`);
  });

  expect(
    await screen.findByText("Transaction deleted successfully!"),
  ).toBeInTheDocument();
  expect(screen.getByRole("status")).toBeInTheDocument();
});
