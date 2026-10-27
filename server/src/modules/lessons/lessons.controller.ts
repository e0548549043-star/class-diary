import type { Request, Response } from "express";
import { currentUser } from "../../middleware/authenticate.js";
import { idParam, validate } from "../../utils/validate.js";
import { createLessonSchema, listLessonsQuerySchema, updateLessonSchema } from "./lessons.schemas.js";
import * as lessonsService from "./lessons.service.js";

export async function listClassLessons(req: Request, res: Response) {
  const classId = validate(idParam, req.params.classId);
  const query = validate(listLessonsQuerySchema, req.query);
  res.json(await lessonsService.listClassLessons(currentUser(req), classId, query));
}

export async function getLesson(req: Request, res: Response) {
  const lessonId = validate(idParam, req.params.id);
  res.json(await lessonsService.getLesson(currentUser(req), lessonId));
}

export async function createLesson(req: Request, res: Response) {
  const input = validate(createLessonSchema, req.body);
  const lesson = await lessonsService.createLesson(currentUser(req).id, input);
  res.status(201).json(lesson);
}

export async function updateLesson(req: Request, res: Response) {
  const lessonId = validate(idParam, req.params.id);
  const input = validate(updateLessonSchema, req.body);
  res.json(await lessonsService.updateLesson(currentUser(req).id, lessonId, input));
}
