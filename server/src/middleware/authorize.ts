// הרשאות (Authorization): מאפשר גישה רק לתפקידים מסוימים. אחרת - 403.
import type { NextFunction, Request, Response } from "express";
import type { Role } from "../generated/prisma/enums.js";
import { forbidden, unauthorized } from "../utils/httpError.js";

const roleNames: Record<Role, string> = {
  ADMIN: "מנהל",
  TEACHER: "מורה",
  STUDENT: "תלמיד",
};

export const requireRole =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(unauthorized());
    if (!roles.includes(req.user.role)) {
      const allowed = roles.map((r) => roleNames[r]).join(" / ");
      return next(forbidden(`פעולה זו מותרת רק ל: ${allowed}`));
    }
    next();
  };
