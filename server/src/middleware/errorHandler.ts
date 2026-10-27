// טיפול מרכזי בשגיאות: כל שגיאה מוחזרת ללקוח בפורמט אחיד
// { "error": { "code": "...", "message": "...", "details": [...] } }
import type { NextFunction, Request, Response } from "express";
import { Prisma } from "../generated/prisma/client.js";
import { HttpError } from "../utils/httpError.js";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: `הכתובת ${req.method} ${req.originalUrl} לא קיימת` },
  });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message, ...(err.details ? { details: err.details } : {}) },
    });
    return;
  }

  // JSON לא תקין בגוף הבקשה
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "גוף הבקשה אינו JSON תקין" } });
    return;
  }

  // הפרת ייחודיות במסד הנתונים (גיבוי לבדיקות שבשירותים)
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    res.status(409).json({ error: { code: "CONFLICT", message: "רשומה עם ערכים אלה כבר קיימת" } });
    return;
  }

  console.error(err);
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "שגיאה פנימית בשרת" } });
}
