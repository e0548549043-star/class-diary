import type { Request, Response } from "express";
import { idParam, validate } from "../../utils/validate.js";
import * as classesService from "./classes.service.js";

export async function list(_req: Request, res: Response) {
  res.json(await classesService.listClasses());
}

export async function listStudents(req: Request, res: Response) {
  const classId = validate(idParam, req.params.classId);
  res.json(await classesService.listClassStudents(classId));
}
