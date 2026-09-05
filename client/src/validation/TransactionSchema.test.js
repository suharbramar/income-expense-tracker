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
