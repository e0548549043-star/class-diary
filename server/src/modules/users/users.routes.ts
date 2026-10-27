// ניהול משתמשים - מנהל בלבד
import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { requireRole } from "../../middleware/authorize.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as controller from "./users.controller.js";

export const usersRouter = Router();

usersRouter.use(authenticate, requireRole("ADMIN"));

usersRouter.get("/", asyncHandler(controller.list));
usersRouter.get("/:id", asyncHandler(controller.get));
usersRouter.patch("/:id/password", asyncHandler(controller.resetPassword));
