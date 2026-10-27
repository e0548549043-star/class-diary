import type { Request, Response } from "express";
import { idParam, validate } from "../../utils/validate.js";
import { listUsersQuerySchema, resetPasswordSchema } from "./users.schemas.js";
import * as usersService from "./users.service.js";

export async function list(req: Request, res: Response) {
  const query = validate(listUsersQuerySchema, req.query);
  res.json(await usersService.listUsers(query));
}

export async function get(req: Request, res: Response) {
  const userId = validate(idParam, req.params.id);
  res.json(await usersService.getUser(userId));
}

export async function resetPassword(req: Request, res: Response) {
  const userId = validate(idParam, req.params.id);
  const { password } = validate(resetPasswordSchema, req.body);
  await usersService.resetPassword(userId, password);
  res.json({ message: "הסיסמה אופסה בהצלחה" });
}
