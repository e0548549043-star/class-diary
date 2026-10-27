// שיעורים: פתיחה, צפייה ועריכה
import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { requireRole } from "../../middleware/authorize.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as controller from "./lessons.controller.js";

export const lessonsRouter = Router();

lessonsRouter.use(authenticate);

lessonsRouter.post("/", requireRole("TEACHER"), asyncHandler(controller.createLesson));
lessonsRouter.get("/:id", requireRole("ADMIN", "TEACHER"), asyncHandler(controller.getLesson));
lessonsRouter.put("/:id", requireRole("TEACHER"), asyncHandler(controller.updateLesson));
