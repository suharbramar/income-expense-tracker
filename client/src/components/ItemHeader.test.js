import { render, screen } from "@testing-library/react";
import ItemHeader from "./ItemHeader";

test("renders the transaction list heading", () => {
  render(<ItemHeader />);

  expect(
    screen.getByRole("heading", { name: /transactions list/i }),
  ).toBeInTheDocument();
});
