import { act, renderHook } from "@testing-library/react";
import useTransactionSelection from "./useTransactionSelection";

test("selects a transaction by type and id", () => {
  const { result } = renderHook(() => useTransactionSelection());

  act(() => {
    result.current.handleSelectedTransaction(1, "income");
  });

  expect(result.current.selectedTransactionId).toBe("income:1");
});

test("selecting the same transaction again clears the selection", () => {
  const { result } = renderHook(() => useTransactionSelection());

  act(() => {
    result.current.handleSelectedTransaction(1, "income");
  });

  act(() => {
    result.current.handleSelectedTransaction(1, "income");
  });

  expect(result.current.selectedTransactionId).toBeNull();
});

test("clears the selected transaction", () => {
  const { result } = renderHook(() => useTransactionSelection());

  act(() => {
    result.current.handleSelectedTransaction(1, "income");
  });

  act(() => {
    result.current.clearSelectedTransaction();
  });

  expect(result.current.selectedTransactionId).toBeNull();
});
