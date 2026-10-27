import { z } from "zod";
import { idParam, paginationSchema, passwordSchema } from "../../utils/validate.js";

export const listUsersQuerySchema = z
  .object({
    role: z.enum(["ADMIN", "TEACHER", "STUDENT"]).optional(),
    classId: idParam.optional(),
    search: z.string().trim().max(100).optional(),
    ...paginationSchema,
  })
  .strict();

export const resetPasswordSchema = z.object({ password: passwordSchema }).strict();

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
