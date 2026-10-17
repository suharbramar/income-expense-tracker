import { act, renderHook } from "@testing-library/react";
import useCommon from "./useCommon";

test("starts with no message", () => {
  const { result } = renderHook(() => useCommon());

  expect(result.current.message).toBeNull();
});

test("shows and clears a message", () => {
  const { result } = renderHook(() => useCommon());

  act(() => {
    result.current.showMessage("success", "Transaction saved.");
  });

  expect(result.current.message).toEqual({
    type: "success",
    text: "Transaction saved.",
  });

  act(() => {
    result.current.clearMessage();
  });

  expect(result.current.message).toBeNull();
});
