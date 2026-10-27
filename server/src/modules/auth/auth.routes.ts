import { Router } from "express";
import rateLimit from "express-rate-limit";
import { env } from "../../config/env.js";
import { authenticate } from "../../middleware/authenticate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as controller from "./auth.controller.js";

// הגבלת ניסיונות התחברות - הגנה מפני ניחוש סיסמאות
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.LOGIN_RATE_LIMIT,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: { code: "TOO_MANY_REQUESTS", message: "יותר מדי ניסיונות התחברות. נסי שוב בעוד כמה דקות" } },
});

export const authRouter = Router();

authRouter.post("/login", loginLimiter, asyncHandler(controller.login));
authRouter.get("/me", authenticate, asyncHandler(controller.me));
