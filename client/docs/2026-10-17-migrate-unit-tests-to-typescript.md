# Migrate Unit Tests to TypeScript Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate the existing Jest and React Testing Library test suite from JavaScript to typed TypeScript without changing tested behavior.

**Architecture:** Keep the current Jest, React Testing Library, React Hook Form, Zod, and Create React App setup. Use `.tsx` for tests that render JSX and `.ts` for API, hook, utility, and schema tests. Production JavaScript remains supported through the existing `allowJs` transition setting.

**Tech Stack:** TypeScript, Jest through `react-scripts`, React Testing Library, `@testing-library/user-event`, existing CRA test environment.

**Spec:** Approved migration approach from the conversation.

## Global Constraints

- Preserve existing test behavior and assertions.
- Do not migrate production components in this task.
- Use shared types instead of repeating incompatible test-only shapes.
- Keep tests focused on observable behavior and public module contracts.
- Keep `strict: true` enabled in `client/tsconfig.json`.

## Review Focus

- JSX tests must use `.tsx` and compile under the CRA JSX configuration.
- Jest mocks must have useful types without hiding incorrect calls behind `any`.
- Axios mock responses must match the API module's expected shapes.
- Hook tests must type wrapper props and callback arguments correctly.
- Existing async tests must still wait for React state and form updates.

### Task 1: Confirm TypeScript test infrastructure

**Files:**
- Modify: `client/package.json` only if required by compiler/test output.
- Modify: `client/tsconfig.json` only if required by the mixed JS/TS migration.

- [x] Inspect the existing TypeScript dependencies and configuration.
- [x] Add only missing type packages or compiler options needed by the current tests.
- [x] Run a TypeScript-aware test discovery command through CRA.

### Task 2: Migrate pure and API tests

**Files:**
- Rename: `client/src/api/TransactionApi.test.js` -> `.test.ts`
- Rename: `client/src/utils/TransactionUtil.test.js` -> `.test.ts`
- Rename: `client/src/validation/TransactionSchema.test.js` -> `.test.ts`

- [x] Add explicit fixture types for transaction records and API payloads where useful.
- [x] Type Axios mocks and pure-function inputs without changing assertions.
- [x] Run these three test files and confirm they pass.

### Task 3: Migrate hook tests

**Files:**
- Rename: `client/src/hooks/useCommon.test.js` -> `.test.ts`
- Rename: `client/src/hooks/useTransactionSelection.test.js` -> `.test.ts`
- Rename: `client/src/hooks/useTransactions.test.js` -> `.test.ts`

- [x] Type hook callback mocks, wrapper components, transaction fixtures, and async API mocks.
- [x] Preserve the existing render-hook helper behavior.
- [x] Run all hook tests and confirm they pass.

### Task 4: Migrate component tests

**Files:**
- Rename: `client/src/components/Header.test.js` -> `.test.tsx`
- Rename: `client/src/components/ItemHeader.test.js` -> `.test.tsx`
- Rename: `client/src/components/InputForm.test.js` -> `.test.tsx`
- Rename: `client/src/components/EditTransactionModal.test.js` -> `.test.tsx`
- Rename: `client/src/components/MessageBanner.test.js` -> `.test.tsx`
- Rename: `client/src/components/TransactionList.test.js` -> `.test.tsx`

- [x] Type component props at the test boundary when TypeScript cannot infer them.
- [x] Type mocked callbacks with `jest.fn`-compatible signatures.
- [x] Preserve accessibility queries, async waits, form validation, modal focus, and selection behavior.
- [x] Run all component tests and confirm they pass.

### Task 5: Migrate the app integration test

**Files:**
- Rename: `client/src/App.test.js` -> `client/src/App.test.tsx`

- [x] Type transaction fixtures, route helpers, Axios mocks, and MemoryRouter inputs.
- [x] Preserve dashboard, navigation, transaction, error, update, and delete scenarios.
- [x] Run the App integration test independently.

### Task 6: Update learning documentation

**Files:**
- Modify: `client/docs/UNIT_TEST_IMPLEMENTATION_GUIDE.md`

- [x] Update the test inventory from `.js` to `.ts` and `.tsx`.
- [x] Add a beginner explanation of `.ts` versus `.tsx`.
- [x] Explain typed fixtures, `jest.fn` callback types, and typed Axios mocks.
- [x] Update all test commands and examples to use the new filenames.
- [x] Add a TypeScript migration definition of done.

### Task 7: Full verification

- [x] Run `npm test -- --watch=false --runInBand` from `client`.
- [x] Run `npm run lint` from `client`.
- [ ] Run `npm run build` from `client` (left for the user to self-verify).
- [x] Confirm no `.test.js` or `.test.jsx` files remain under `client/src`.

### Task 8: Add coverage for missed branches

**Files:**
- Modify: `client/src/hooks/useTransactions.test.ts`
- Modify: `client/src/components/InputForm.test.tsx`
- Modify: `client/docs/UNIT_TEST_IMPLEMENTATION_GUIDE.md`

- [x] Cover create and delete refresh failures after the initial load.
- [x] Cover update API failure and invalid edit/delete records.
- [x] Cover the rule that an edit modal stays open while an update is running.
- [x] Cover keyboard form submission without a native submitter.
- [x] Cover the browser `SubmitEvent.submitter` path.
- [x] Run focused coverage and confirm both requested files reach 100%.

This follow-up is intentionally behavior-focused. The goal is not to add tests
only to increase a percentage; each test protects a real error, loading, or
keyboard interaction path.

## Commit Checkpoint

```bash
git add client/package.json client/package-lock.json client/tsconfig.json client/src client/docs/UNIT_TEST_IMPLEMENTATION_GUIDE.md
git commit -m "test: migrate unit tests to TypeScript"
```
