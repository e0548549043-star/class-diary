import type { Request, Response } from "express";
import { currentUser } from "../../middleware/authenticate.js";
import { validate } from "../../utils/validate.js";
import { loginSchema } from "./auth.schemas.js";
import * as authService from "./auth.service.js";

export async function login(req: Request, res: Response) {
  const { idNumber, password } = validate(loginSchema, req.body);
  res.json(await authService.login(idNumber, password));
}

export async function me(req: Request, res: Response) {
  res.json(await authService.getMe(currentUser(req).id));
}
