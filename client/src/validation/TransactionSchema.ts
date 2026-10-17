import { z } from "zod";

export const TransactionSchema = z.object({
  transactionName: z.string().trim().min(1, "Enter a transaction name."),
  amount: z.coerce.number().positive("Enter an amount greater than zero"),
});
