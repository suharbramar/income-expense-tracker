import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MessageBanner from "./MessageBanner";

test("renders nothing when there is no message", () => {
  render(<MessageBanner message={null} onDismiss={jest.fn()} />);

  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});

test("renders an error message as an alert", () => {
  render(
    <MessageBanner
      message={{ type: "error", text: "Could not load transactions." }}
      onDismiss={jest.fn()}
    />,
  );

  expect(screen.getByRole("alert")).toHaveTextContent(
    "Could not load transactions.",
  );
});

test("renders a success message as a status", () => {
  render(
    <MessageBanner
      message={{ type: "success", text: "Transaction saved." }}
      onDismiss={jest.fn()}
    />,
  );

  expect(screen.getByRole("status")).toHaveTextContent("Transaction saved.");
});

test("calls dismiss handler when the dismiss button is clicked", async () => {
  const onDismiss = jest.fn();

  render(
    <MessageBanner
      message={{ type: "success", text: "Transaction saved." }}
      onDismiss={onDismiss}
    />,
  );

  await userEvent.click(
    screen.getByRole("button", { name: /dismiss message/i }),
  );

  expect(onDismiss).toHaveBeenCalledTimes(1);
});
