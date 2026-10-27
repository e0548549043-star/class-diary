import type { Request, Response } from "express";
import * as subjectsService from "./subjects.service.js";

export async function list(_req: Request, res: Response) {
  res.json(await subjectsService.listSubjects());
}
