// כיתות: רשימת כיתות, תלמידי כיתה ושיעורי כיתה (מנהל ומורה בלבד)
import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { requireRole } from "../../middleware/authorize.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as lessonsController from "../lessons/lessons.controller.js";
import * as controller from "./classes.controller.js";

export const classesRouter = Router();

classesRouter.use(authenticate, requireRole("ADMIN", "TEACHER"));

classesRouter.get("/", asyncHandler(controller.list));
classesRouter.get("/:classId/students", asyncHandler(controller.listStudents));
classesRouter.get("/:classId/lessons", asyncHandler(lessonsController.listClassLessons));
