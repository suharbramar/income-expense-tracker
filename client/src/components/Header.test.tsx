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
