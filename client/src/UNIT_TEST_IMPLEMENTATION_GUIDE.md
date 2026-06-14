# Beginner Unit Test Implementation Guide for React

This guide explains how to add unit tests to this project using **Approach A: Component-First Testing**.

The goal is to learn by doing. Start with small components, then move into forms, tables, and modal behavior. Do not start by testing the whole `App.js` API flow. That comes later, after the basics feel familiar.

## Current Project Test Stack

This project already has the right beginner-friendly testing tools installed:

- **Jest**, through `react-scripts test`
- **React Testing Library**, through `@testing-library/react`
- **Jest DOM**, through `@testing-library/jest-dom`
- **User Event**, through `@testing-library/user-event`

The project also already has:

```txt
client/src/setupTests.js
```

That setup file imports Jest DOM:

```js
import "@testing-library/jest-dom";
```

This gives you readable assertions:

```js
expect(button).toBeDisabled();
expect(title).toBeInTheDocument();
expect(input).toHaveValue("Salary");
```

## Recommended Tools

Use the tools already included in this project:

- **Jest**: runs tests, provides assertions, and creates mocks.
- **React Testing Library**: renders React components and queries the DOM like a user.
- **Jest DOM**: adds helpful DOM matchers.
- **User Event**: simulates user actions such as clicking and typing.

Do not add Vitest, Enzyme, Cypress, or Playwright for the first unit test phase.

Playwright can be useful later for end-to-end tests, but it is heavier than you need for beginner component tests.

## Testing Mindset

Good React tests should answer this question:

> What can the user see or do?

Prefer this:

```js
expect(screen.getByText("Income List")).toBeInTheDocument();
```

Avoid this:

```js
expect(component.state.selectedId).toBe(1);
```

Users do not know about React state. They know that text appears, buttons enable, inputs change, and actions happen.

## Test File Naming

Use colocated test files next to the component being tested:

```txt
client/src/components/Header.test.js
client/src/components/ItemHeader.test.js
client/src/components/InputForm.test.js
client/src/components/Income.test.js
client/src/components/Expense.test.js
client/src/components/EditTransactionModal.test.js
```

This is easy for beginners because the test and component live together.

## Running Tests

From the client folder:

```bash
cd client
npm test
```

This starts watch mode.

For a one-time CI-style test run:

```bash
cd client
npm test -- --watch=false
```

Your GitHub Actions pipeline already runs tests, so once you add test files, CI will pick them up automatically.

## Suggested Learning Order

Add tests in this order:

1. `Header`
2. `ItemHeader`
3. `InputForm`
4. `Income`
5. `Expense`
6. `EditTransactionModal`
7. `App` with mocked Axios, later

This order moves from easiest to hardest.

## Step 1: Test `Header`

Create:

```txt
client/src/components/Header.test.js
```

Example:

```js
import { render, screen } from "@testing-library/react";
import Header from "./Header";

test("renders the provided app name", () => {
  render(<Header name="Income and Expense Tracker" />);

  expect(
    screen.getByRole("heading", {
      name: /income and expense tracker/i,
    }),
  ).toBeInTheDocument();
});
```

What you learn:

- `render()` displays a component in a test DOM.
- `screen.getByRole()` finds elements in an accessible, user-like way.
- `/income and expense tracker/i` is a case-insensitive regular expression.

## Step 2: Test `ItemHeader`

Create:

```txt
client/src/components/ItemHeader.test.js
```

Example:

```js
import { render, screen } from "@testing-library/react";
import ItemHeader from "./ItemHeader";

test("renders the transactions list heading", () => {
  render(<ItemHeader />);

  expect(
    screen.getByRole("heading", { name: /transactions list/i }),
  ).toBeInTheDocument();
});
```

What you learn:

- Simple components should have simple tests.
- A test does not need many assertions to be useful.

## Step 3: Test `InputForm`

`InputForm` is the first interactive component. It has local state and calls a parent callback named `postTransaction`.

Create:

```txt
client/src/components/InputForm.test.js
```

Example:

```js
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
```

Important note: this test expects the inputs to have accessible labels. If `getByLabelText` fails, improve the component labels:

```jsx
<label htmlFor="transaction-name">Transaction Name :</label>
<input id="transaction-name" />

<label htmlFor="amount">Amount :</label>
<input id="amount" />
```

This is not only for tests. It also improves accessibility.

Validation test:

```js
test("shows an alert and does not submit when fields are invalid", async () => {
  const postTransaction = jest.fn();

  render(<InputForm postTransaction={postTransaction} loading={false} />);

  await userEvent.click(screen.getByRole("button", { name: /add income/i }));

  expect(window.alert).toHaveBeenCalledWith("Please fill in all fields.");
  expect(postTransaction).not.toHaveBeenCalled();
});
```

Loading-state test:

```js
test("disables add buttons while loading", () => {
  render(<InputForm postTransaction={jest.fn()} loading={true} />);

  expect(screen.getByRole("button", { name: /adding income/i })).toBeDisabled();
  expect(screen.getByRole("button", { name: /adding expense/i })).toBeDisabled();
});
```

What you learn:

- `jest.fn()` creates a fake callback.
- `userEvent.type()` simulates typing.
- `userEvent.click()` simulates clicking.
- Tests can reveal accessibility improvements.

## Step 4: Test `Income`

`Income` receives data and callbacks from `App.js`. Do not test Axios here. Test only what this component owns:

- renders income rows
- calls the selection callback
- disables action buttons when nothing is selected
- calls update/delete callbacks when selected

Create:

```txt
client/src/components/Income.test.js
```

Example:

```js
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

  expect(screen.getByRole("button", { name: /update/i })).toBeDisabled();
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
```

What you learn:

- Component tests can use fake props.
- The component does not need the full app to be tested.
- You should test behavior owned by the component, not behavior owned by the parent.

## Step 5: Test `Expense`

`Expense` is similar to `Income`, but use its actual prop names.

Create:

```txt
client/src/components/Expense.test.js
```

Example:

```js
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
```

## Step 6: Test `EditTransactionModal`

The modal has important behavior:

- hidden when no transaction exists
- shows selected transaction data
- lets the user edit values
- validates before saving
- calls `onSave` with clean data
- disables fields while saving

Create:

```txt
client/src/components/EditTransactionModal.test.js
```

Example:

```js
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
  await userEvent.type(screen.getByLabelText(/transaction name/i), " Updated Salary ");
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
```

## Common Query Methods

Use these most often:

```js
screen.getByRole("button", { name: /save/i });
screen.getByRole("heading", { name: /income list/i });
screen.getByLabelText(/transaction name/i);
screen.getByText("Salary");
```

Use `queryBy...` when checking that something is absent:

```js
expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
```

Use `findBy...` when something appears after async work:

```js
expect(await screen.findByText("Salary")).toBeInTheDocument();
```

## What Not to Test Yet

Avoid these while learning component tests:

- CSS pixel-perfect layout
- implementation details like internal state names
- full Axios flows inside `Income`, `Expense`, or `InputForm`
- huge snapshots of entire components
- private helper functions that users cannot observe

## Beginner Checklist for Every Test

Before writing a test, ask:

1. What behavior am I protecting?
2. What would the user see or do?
3. What props does this component need?
4. Do I need a fake callback with `jest.fn()`?
5. Should I query by role, label, or text?

## Suggested First Pull Request Scope

For your first unit-test pull request, keep the scope small:

```txt
Header.test.js
ItemHeader.test.js
InputForm.test.js
```

Then run:

```bash
cd client
npm test -- --watch=false
```

After that passes, add:

```txt
Income.test.js
Expense.test.js
EditTransactionModal.test.js
```

## Industry-Standard Best Practices

- Test behavior, not implementation details.
- Prefer accessible queries: `getByRole`, `getByLabelText`, `getByText`.
- Use `jest.fn()` for callback props.
- Mock browser APIs like `window.alert` when needed.
- Keep each test focused on one behavior.
- Use clear test names that describe user behavior.
- Avoid large snapshots.
- Start with small component tests before app-level integration tests.
- Treat failing tests as feedback about either the test or the component design.

## After Component Tests

Once component tests feel comfortable, move to app-level tests:

- render `App`
- mock `axios`
- verify income and expense load
- verify add income calls `POST`
- verify delete calls `DELETE`
- verify edit calls `PUT`

That is Approach B, and it is easier after Approach A is solid.
