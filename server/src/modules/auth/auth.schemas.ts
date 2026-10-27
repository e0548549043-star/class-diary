import { z } from "zod";

export const loginSchema = z
  .object({
    idNumber: z.string().trim().min(1, "יש להזין תעודת זהות"),
    password: z.string().min(1, "יש להזין סיסמה"),
  })
  .strict();
