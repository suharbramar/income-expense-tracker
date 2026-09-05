// The installed resolver version expects the Zod 3 error shape.
// Zod 4 provides that compatible API through its v3 compatibility module.
import { z } from "zod/v3";

export const TransactionSchema = z.object({
  transactionName: z.string().trim().min(1, "Enter a transaction name."),
  amount: z.coerce.number().positive("Enter an amount greater than zero"),
});
