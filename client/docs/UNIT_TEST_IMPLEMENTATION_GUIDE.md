# Beginner Test Guide: Your Step 5, Step 8A, and Step 8B Checkpoints

You have completed the first four refactoring steps. The next milestone is testing the components and pure helpers you extracted. This guide is intentionally focused: test behavior that matters to a user, and test pure utility functions directly.

## Current Test Stack

This Create React App project already includes:

- **Jest**, through `react-scripts test`, to run tests, provide assertions, and create mocks.
- **React Testing Library**, to render components and query the page as a user would.
- **Jest DOM**, for readable assertions such as `toBeInTheDocument()`.
- **User Event**, to simulate typing and clicking.
- **TypeScript**, to describe test data, component props, mocked functions, and API contracts.
- **`@types/jest`**, to give TypeScript names and types for `test`, `expect`, `jest.fn`, and lifecycle helpers.

Run tests once with:

```bash
cd client
npm test -- --watch=false
```

Use `npm test` when you want watch mode while developing.

## Current Test Inventory

The project already contains tests for:

```txt
src/components/Header.test.tsx
src/components/ItemHeader.test.tsx
src/components/InputForm.test.tsx
src/components/EditTransactionModal.test.tsx
src/components/MessageBanner.test.tsx
src/components/TransactionList.test.tsx
src/App.test.tsx
src/api/TransactionApi.test.ts
src/hooks/useCommon.test.ts
src/hooks/useTransactionSelection.test.ts
src/hooks/useTransactions.test.ts
src/utils/TransactionUtil.test.ts
src/validation/TransactionSchema.test.ts
```

The old `Income` and `Expense` components no longer exist. Their replacement is `TransactionList`, so new list behavior belongs in `TransactionList.test.tsx`.

Step 8A adds a second testing area: the add form and its validation schema.
Step 8B adds the same form behavior to the edit modal, plus synchronization
when the selected transaction changes.

## What to Test Next

| Piece | Behaviour worth protecting |
| --- | --- |
| `TransactionUtil` | correct totals, formatting, unique keys, and valid IDs |
| `MessageBanner` | absent with no message, correct text and accessible role, dismiss callback |
| `TransactionList` | displays rows and totals, selects a transaction, enables actions only after selection |
| `useTransactionSelection` | selecting a row creates a key, selecting it again clears it |
| `useTransactions` | initial loading, API success, API error, loading-state cleanup |

Start with utilities and `MessageBanner`. They have the fewest moving parts. Test hooks after components, because hooks need a small React test wrapper.

## Testing Mindset

Ask this question before each test:

> What can a user see or do that must keep working?

Prefer accessible queries:

```ts
screen.getByRole("button", { name: /edit/i });
screen.getByRole("alert");
screen.getByLabelText(/select income salary/i);
screen.getByText("Total Balance: Rp 250.000,00");
```

Avoid testing state variable names, component internals, or CSS pixel values. Those are implementation details a user cannot observe.

## First Challenge: Test the Utility Functions

Create `client/src/utils/TransactionUtil.test.ts`.

```js
import {
  formatAmount,
  getTransactionKey,
  getTransactionTotals,
} from "./TransactionUtil";

test("calculates income, expense, and balance", () => {
  const totals = getTransactionTotals([
    { id: 1, type: "income", amount: 500000 },
    { id: 2, type: "income", amount: 250000 },
    { id: 1, type: "expense", amount: 100000 },
  ]);

  expect(totals).toEqual({
    totalIncome: 750000,
    totalExpense: 100000,
    totalBalance: 650000,
  });
});

test("creates different keys for matching income and expense IDs", () => {
  expect(getTransactionKey(1, "income")).toBe("income:1");
  expect(getTransactionKey(1, "expense")).toBe("expense:1");
});

test("formats an amount for Indonesian currency display", () => {
  expect(formatAmount(250000)).toBe("250.000,00");
});
```

These are fast unit tests. No component rendering, browser interaction, or API mocking is necessary because the functions are pure.

## Second Challenge: Test `MessageBanner`

Create `client/src/components/MessageBanner.test.tsx`.

```js
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MessageBanner from "./MessageBanner";

test("renders an error message and dismisses it", async () => {
  const onDismiss = jest.fn();

  render(
    <MessageBanner
      message={{ type: "error", text: "Could not load transactions." }}
      onDismiss={onDismiss}
    />,
  );

  expect(screen.getByRole("alert")).toHaveTextContent(
    "Could not load transactions.",
  );

  await userEvent.click(
    screen.getByRole("button", { name: /dismiss message/i }),
  );

  expect(onDismiss).toHaveBeenCalledTimes(1);
});
```

## Third Challenge: Test `TransactionList`

Give it three transactions: two incomes and one expense. Confirm that it:

1. Renders each transaction name and formatted amount.
2. Renders the correct total income, total expense, and total balance.
3. Calls `onSelect(id, type)` after clicking a radio button.
4. Keeps Edit and Delete disabled before a selection.
5. Calls `openEditTransaction(selectedTransaction)` and `deleteTransaction(selectedTransaction)` after selection.

Use callback mocks for props:

```js
const onSelect = jest.fn();
const openEditTransaction = jest.fn();
const deleteTransaction = jest.fn();
```

## App-Level Tests and API Mocks

`App.test.tsx` is an integration test: it renders several components together and mocks Axios instead of contacting the real server.

```js
jest.mock("axios");
```

Mocking is useful because a frontend test should be fast, repeatable, and independent of whether the backend happens to be running.

For each async test, wait for the final UI change with `findBy...` or `waitFor`. Do not use arbitrary timeouts.

## Definition of Done for Step 5

- [ ] `TransactionUtil.test.ts` covers totals, keys, and formatting.
- [ ] `MessageBanner.test.tsx` covers success/error roles and dismissal.
- [ ] `TransactionList.test.tsx` covers rendering, selection, and action buttons.
- [ ] Existing tests still pass.
- [ ] `npm run build` still passes.

## Step 8A: Test the React Hook Form and Zod Migration

Step 8A migrates `InputForm` from manual `useState` form handling to
React Hook Form and Zod. The tests should protect the behavior a user cares
about, not React Hook Form's private internals.

The testing layers are:

```txt
TransactionSchema.test.ts
= Does the validation rule accept or reject the data?

InputForm.test.tsx
= Does the form show errors, submit the right payload, and reset correctly?

useTransactions.test.ts
= Does the API workflow create the record and return success/failure?
```

### What Step 8A must continue to do

The form should:

- show a name error when the name is empty or only spaces;
- reject zero and negative amounts;
- convert an amount such as `"250000"` into the number `250000`;
- submit `income` when Add Income is clicked;
- submit `expense` when Add Expense is clicked;
- reset only after a successful API action;
- keep the user's values when the API action fails;
- expose field errors through `aria-invalid`, `aria-describedby`, and `role="alert"`.

### Direct schema tests

Create `client/src/validation/TransactionSchema.test.ts`:

```js
import { TransactionSchema } from "./TransactionSchema";

test("accepts a trimmed name and converts amount text into a number", () => {
  const result = TransactionSchema.safeParse({
    transactionName: " Salary ",
    amount: "250000",
  });

  expect(result.success).toBe(true);
  expect(result.data).toEqual({
    transactionName: "Salary",
    amount: 250000,
  });
});

test("rejects an empty transaction name", () => {
  const result = TransactionSchema.safeParse({
    transactionName: "   ",
    amount: "1000",
  });

  expect(result.success).toBe(false);
  expect(result.error.issues[0].message).toBe("Enter a transaction name.");
});

test.each(["0", "-1"])("rejects amount %s", (amount) => {
  const result = TransactionSchema.safeParse({
    transactionName: "Salary",
    amount,
  });

  expect(result.success).toBe(false);
  expect(result.error.issues[0].message).toBe(
    "Enter an amount greater than zero",
  );
});
```

Beginner explanation:

- `safeParse()` never throws for normal validation failure. It returns an
  object with `success: true` or `success: false`.
- `result.data` is the cleaned output after `.trim()` and `z.coerce.number()`.
- `result.error.issues` contains the validation problems.
- `test.each()` runs the same test for multiple examples, here `0` and `-1`.

### Component tests for `InputForm`

The form tests live in `client/src/components/InputForm.test.tsx`.

A valid submission test follows Arrange, Act, Assert:

```js
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
```

What is happening:

```txt
Arrange: create a fake postTransaction callback and render the form.
Act: type values and click the Income submit button.
Assert: verify the callback received the clean application payload.
```

The test does not inspect React Hook Form's internal registry. It checks the
boundary that matters: the form sends the correct data to the transaction
hook.

### Testing the Expense button

The two buttons share one form submit handler. Their `value` tells the handler
which transaction type to use:

```js
test("submits an expense transaction when the expense button is clicked", async () => {
  const postTransaction = jest.fn().mockResolvedValue({ success: true });

  render(<InputForm postTransaction={postTransaction} />);

  await userEvent.type(
    screen.getByLabelText(/transaction name/i),
    "Salary",
  );
  await userEvent.type(screen.getByLabelText(/^amount/i), "5000");
  await userEvent.click(screen.getByRole("button", { name: /add expense/i }));

  await waitFor(() => {
    expect(postTransaction).toHaveBeenCalledWith("expense", {
      transactionName: "Salary",
      amount: 5000,
    });
  });
});
```

This test protects an easy regression: both buttons accidentally submitting
`income` because the browser test environment does not always provide
`event.nativeEvent.submitter`. The implementation uses the active button as
a fallback while keeping the normal native form-submit path.

### Testing validation errors

Do not call the submit handler directly. Click the real button and inspect the
visible errors:

```js
await userEvent.click(screen.getByRole("button", { name: /add income/i }));

expect(
  await screen.findByText("Enter a transaction name."),
).toBeInTheDocument();
expect(
  await screen.findByText("Enter an amount greater than zero"),
).toBeInTheDocument();
expect(postTransaction).not.toHaveBeenCalled();
```

`findByText()` is used because React Hook Form updates its error state
asynchronously after the submit event. `getByText()` is for content that is
already present immediately.

### Testing reset versus keeping input

The hook returns a small result object:

```js
{ success: true }
```

The form resets only when `success` is true. Test both branches:

```js
const postTransaction = jest.fn().mockResolvedValue({ success: true });
```

After submission, expect the inputs to be empty.

```js
const postTransaction = jest.fn().mockResolvedValue({ success: false });
```

After submission, expect the original values to remain. This protects users
from losing their work when the server rejects or cannot process a request.

Because `reset()` and `isSubmitting` update React Hook Form state, use
`waitFor()` around the final input assertions:

```js
await waitFor(() => {
  expect(screen.getByLabelText(/transaction name/i)).toHaveValue("");
  expect(screen.getByLabelText(/^amount/i)).toHaveValue(null);
});
```

### Zod and resolver compatibility note

This project currently uses `@hookform/resolvers@4.1.3` with Zod 4. That
resolver expects the Zod 3 error shape. The schema therefore imports the
compatible Zod 3 API exposed by the installed Zod package:

```js
import { z } from "zod/v3";
```

This is a compatibility detail, not a form concept to memorize. The important
lesson is that related library versions must agree on their public error
contract. If the resolver is upgraded to a Zod 4-compatible version later,
the schema import can return to the normal Zod 4 entry point.

### Run the Step 8A tests

From `client`:

```bash
npm test -- --watch=false --runInBand src/components/InputForm.test.tsx src/validation/TransactionSchema.test.ts
```

The expected result for the current checkpoint is:

```txt
Test Suites: 2 passed, 2 total
Tests:       12 passed, 12 total
```

Then run the complete suite before committing:

```bash
npm test -- --watch=false --runInBand
npm run lint
```

## Definition of Done for Step 8A

- [x] `TransactionSchema.test.ts` covers trimming, coercion, empty names, zero, and negative amounts.
- [x] `InputForm.test.tsx` covers income and expense submission.
- [x] `InputForm.test.tsx` covers keyboard submission and the browser's native submitter path.
- [x] Invalid form data shows visible field errors.
- [x] Successful submission resets the form.
- [x] Failed submission keeps the user's input.
- [x] Existing Step 5 and Step 6 tests still pass.
- [x] `npm run lint` passes.

### Coverage follow-up: `InputForm.tsx`

The coverage report showed that the form's important decision points needed
explicit tests, not just one successful income submission.

The tests now cover:

- clicking **Add Income**;
- clicking **Add Expense**;
- submitting with the keyboard, where there is no clicked submit button;
- the browser-provided `SubmitEvent.submitter` path;
- successful submission and form reset;
- failed submission and preserved input;
- invalid values and disabled buttons.

The keyboard test teaches an important browser distinction. A mouse click can
identify which submit button was clicked, but pressing Enter may submit the form
without a submitter. The component therefore uses a safe income default and a
small ref fallback for clicked buttons. The test checks the user behavior rather
than React Hook Form internals.

The native submitter test uses `createEvent.submit` and defines the submitter
explicitly because jsdom does not always populate `SubmitEvent.submitter` when
using a convenience `fireEvent.submit` call. This keeps the test close to the
browser contract while still remaining deterministic in Jest.

## Step 8B: Test the React Hook Form Edit Modal

Step 8B migrates `EditTransactionModal` from manual `useState` fields to
React Hook Form and the shared Zod schema. The most important new behavior is
that the modal must show the transaction selected by the parent, even when the
modal stays mounted and the parent changes the `transaction` prop.

### The beginner mental model

There are two different kinds of values:

```txt
transaction prop = the saved record selected by the parent
form values      = the user's temporary edits
reset(...)        = copy the newly selected record into the form
```

`defaultValues` are used only when the form is first created. They do not
automatically change when a prop changes. That is why the modal uses
`reset(...)` inside an effect.

This test protects that behavior:

```js
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
    expect(screen.getByLabelText(/transaction amount/i)).toHaveValue(1250);
  });
});
```

Beginner explanation:

- `rerender(...)` renders the same component again with new props. This is
  similar to the parent selecting another table row.
- The temporary edit proves that the first form had its own values.
- `reset(...)` should replace those values with `Rent` and `1250`.
- `waitFor(...)` gives React and the effect time to finish updating the form.

### Test the edit payload

The modal should send the record identity separately from the form payload:

```js
await waitFor(() => {
  expect(onSave).toHaveBeenCalledWith(1, "income", {
    transactionName: "Updated Salary",
    amount: 6000,
  });
});
```

This boundary is important. The modal knows the selected record's `id` and
`type`; the form provides only editable fields; `useTransactions` and the API
module handle server communication.

### Test validation in the modal

Click the real Save button after entering an invalid value. Do not call the
submit handler directly:

```js
await userEvent.clear(screen.getByLabelText(/transaction amount/i));
await userEvent.type(screen.getByLabelText(/transaction amount/i), "0");
await userEvent.click(screen.getByRole("button", { name: /save/i }));

expect(
  await screen.findByText("Enter an amount greater than zero"),
).toBeInTheDocument();
expect(screen.getByLabelText(/transaction amount/i)).toHaveAttribute(
  "aria-invalid",
  "true",
);
expect(onSave).not.toHaveBeenCalled();
```

This checks three user-visible outcomes: an error appears, the invalid field
is marked with `aria-invalid`, and no API-facing save callback runs.

### Testing React Hook Form's asynchronous updates

React Hook Form may update its validation and submission state after the
browser click event has finished. A test must wait for the user-visible result
instead of asserting immediately after `userEvent.click(...)`.

Use `findBy...` when you are waiting for an element to appear:

```js
await userEvent.click(screen.getByRole("button", { name: /save/i }));

expect(
  await screen.findByText(/enter a transaction name/i),
).toBeInTheDocument();
```

Use `waitFor` when you are waiting for an assertion about a mock callback or
an existing element to become true:

```js
const onSave = jest.fn().mockResolvedValue({ success: true });

await userEvent.click(screen.getByRole("button", { name: /save/i }));

await waitFor(() => {
  expect(onSave).toHaveBeenCalledWith(1, "income", {
    transactionName: "Updated Salary",
    amount: 6000,
  });
});
```

`mockResolvedValue(...)` makes the fake asynchronous `onSave` callback finish
successfully. It matches the real callback contract more closely than a plain
`jest.fn()`, which returns `undefined` immediately.

Do not use `setTimeout` or arbitrary delays in tests. Waiting for an actual
visible error or callback gives the test a meaningful condition to observe.

### Keep the Step 6 behavior protected

The Step 8B migration must not remove the accessibility behavior from Step 6.
Keep tests for:

- focusing the transaction name input when the modal opens;
- closing with `Escape` when it is not saving;
- refusing to close with `Escape` while saving;
- disabling fields and buttons while saving.

These tests are about user behavior. They do not need to know how React Hook
Form stores its internal values.

### Important failure-path rule

The modal should not call `reset()` immediately after the Save button is
clicked. The API request may fail, and clearing the fields would make the user
lose their edits. Resetting when the `transaction` prop changes is different:
that means the parent selected a different source record.

### Run the Step 8B tests

From `client`:

```bash
npm test -- --watch=false --runInBand src/components/EditTransactionModal.test.tsx
```

The test count may change as you add exercises. A passing result should report
all tests in this file as passed.

## Definition of Done for Step 8B

- [x] The modal renders empty when there is no transaction.
- [x] The selected transaction populates both form fields.
- [x] Changing the transaction prop replaces both form values.
- [x] Valid submission sends the expected `id`, `type`, and cleaned payload.
- [x] Invalid name and amount values show visible field errors.
- [x] Invalid submission does not call `onSave`.
- [x] Step 6 focus, Escape, and disabled-state tests still pass.
- [x] `npm run lint` passes.

### Completed Step 8 test result

The focused Step 8 test command currently passes:

```bash
npm test -- --watchAll=false --runInBand --runTestsByPath \
  src/components/InputForm.test.tsx \
  src/components/EditTransactionModal.test.tsx \
  src/validation/TransactionSchema.test.ts \
  src/hooks/useTransactions.test.ts
```

It covers the schema, add-form, edit-modal, and transaction API hook behavior.
Run the complete project test suite and production build before committing a
release-ready checkpoint.

The complete client test suite also passes with 13 suites and 73 tests, and
`npm run lint` passes. The remaining release verification is `npm run build`.

## TypeScript Test Migration

The test suite now uses TypeScript without changing what the tests verify.
This is a migration of the test files, not a new testing framework.

### `.ts` versus `.tsx`

Use `.ts` when the test contains only JavaScript/TypeScript logic:

```txt
TransactionApi.test.ts
useTransactions.test.ts
TransactionUtil.test.ts
TransactionSchema.test.ts
```

Use `.tsx` when the test renders JSX, for example:

```tsx
render(<InputForm postTransaction={postTransaction} />);
```

That is why component tests and `App.test.tsx` use `.tsx`. The extra `x`
means the TypeScript file is allowed to contain JSX markup.

### Type fixtures using the application types

Instead of allowing TypeScript to infer `type` as a general `string`, import
the shared application type:

```ts
import type { Transaction } from "../types/transaction";

const transaction: Transaction = {
  id: 1,
  type: "income",
  transactionName: "Salary",
  amount: 5000,
};
```

This catches mistakes such as misspelling `income`, forgetting `transactionName`,
or passing text where the application expects a number. The test now shares the
same contract as the component instead of creating a second, slightly different
transaction shape.

For API response fixtures, use the server shape without the UI-only `type` field:

```ts
import type { ServerTransaction } from "../types/transaction";

const income: ServerTransaction[] = [
  { id: 1, transactionName: "Salary", amount: 5000 },
];
```

### Type mocked functions with `jest.mocked`

After `jest.mock("axios")`, TypeScript still sees the normal Axios function
signature unless we tell it that the imported module is mocked:

```ts
import axios from "axios";

jest.mock("axios");
const mockedAxios = jest.mocked(axios);

mockedAxios.get.mockResolvedValueOnce({
  data: [{ id: 1, transactionName: "Salary", amount: 5000 }],
});
```

The important idea is that `jest.mocked(axios)` is only for the test. It gives
the mock methods such as `mockResolvedValueOnce` and `mockRejectedValueOnce`
without weakening the production Axios types.

The same pattern works for mocked API functions:

```ts
const mockedGetTransactions = jest.mocked(getTransactions);
mockedGetTransactions.mockResolvedValue(transactions);
```

### Why this is useful for a beginner

JavaScript lets a test accidentally pass incomplete or incorrectly shaped data.
TypeScript acts like a helpful checklist before the test runs. When `tsc`
reports an error, read it as a question:

```txt
Does this fixture match the real application contract?
Is this function really allowed to receive null?
Is this mocked function being configured as a Jest mock?
```

Fixing the type error usually makes the test setup more realistic, not merely
more verbose.

### Migration checklist

- [x] API, utility, schema, and hook tests use `.test.ts`.
- [x] JSX component and app tests use `.test.tsx`.
- [x] Shared transaction types are reused in fixtures.
- [x] Axios and API mocks use `jest.mocked(...)`.
- [x] Nullable hook inputs match the real UI flow.
- [x] `@types/jest` is declared as a development dependency.
- [x] `tsc --noEmit` passes with `strict: true`.
- [x] All 13 test suites pass with 73 tests.

Run the migration checks from `client`:

```bash
npm test -- --watch=false --runInBand
npx tsc --noEmit
npm run lint
npm run build
```

The migration is complete when the test, type-check, and lint commands pass.
Run the production build as your final self-verification step. No test should
be renamed back to JavaScript just to avoid a TypeScript error; fix the
fixture, mock, or application contract that the compiler identifies.

## Coverage Follow-up: `useTransactions.ts`

Coverage is most useful when it reveals a user-visible path that has not been
protected yet. The added hook tests target the branches that are easy to miss
when only the happy path is tested:

```txt
initial loading succeeds and fails
create succeeds and create refresh fails
update succeeds, rejects invalid input, and fails at the API
delete succeeds, rejects null/invalid records, and fails during refresh
the edit modal refuses to close while an update is in progress
```

For refresh-failure tests, configure the mock in two stages:

```ts
const { result } = renderUseTransactions();

await waitFor(() => {
  expect(result.current.transactionData).toEqual(transactions);
});

mockedGetTransactions.mockRejectedValueOnce(refreshError);
await act(async () => {
  await result.current.postTransaction("income", payload);
});
```

The rejection must be configured **after** the initial load. Otherwise the
one-time mock rejection is consumed by the hook's startup request instead of by
the refresh request being tested.

The update-in-progress test uses a Promise whose resolver is controlled by the
test. That lets the test pause the API call, invoke `closedEditTransaction()`,
and prove the modal remains open until the update finishes.

Run focused coverage for these two files with:

```bash
npm test -- --watchAll=false --coverage --runInBand \
  --runTestsByPath src/hooks/useTransactions.test.ts \
  src/components/InputForm.test.tsx
```

The focused report for the current implementation reaches 100% statements,
branches, functions, and lines for both `useTransactions.ts` and `InputForm.tsx`.

## After Testing

Move to accessibility. The most valuable next improvements are giving each radio control an associated visible label, moving focus into the modal when it opens, returning focus to the Edit button when it closes, and supporting Escape to close the modal when no update is in progress.
