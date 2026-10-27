// מקצועות: רשימה קבועה, זמינה לכל משתמש מחובר
import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as controller from "./subjects.controller.js";

export const subjectsRouter = Router();

subjectsRouter.get("/", authenticate, asyncHandler(controller.list));
