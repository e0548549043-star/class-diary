// אימות (Authentication): בודק את ה־Bearer Token ומזהה את המשתמש.
// המשתמש נטען ממסד הנתונים בכל בקשה, כך שהתפקיד תמיד עדכני ואי אפשר לזייף אותו.
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../db/prisma.js";
import type { Role } from "../generated/prisma/enums.js";
import { unauthorized } from "../utils/httpError.js";

export interface AuthUser {
  id: number;
  role: Role;
  classId: number | null;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

interface TokenPayload {
  sub: string;
  role: Role;
}

export function signToken(user: { id: number; role: Role }): string {
  return jwt.sign({ role: user.role }, env.JWT_SECRET, {
    subject: String(user.id),
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    algorithm: "HS256",
  });
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw unauthorized("נדרשת התחברות: חסר Bearer Token בכותרת Authorization");
    }
    const token = header.slice("Bearer ".length).trim();

    let payload: TokenPayload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] }) as TokenPayload;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw unauthorized("פג תוקף ההתחברות, יש להתחבר מחדש");
      }
      throw unauthorized("Token לא תקין");
    }

    const userId = Number(payload.sub);
    if (!Number.isInteger(userId)) throw unauthorized("Token לא תקין");

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, classId: true },
    });
    if (!user) throw unauthorized("המשתמש לא קיים יותר במערכת");

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/** מחזיר את המשתמש המחובר (לשימוש אחרי authenticate) */
export function currentUser(req: Request): AuthUser {
  if (!req.user) throw unauthorized();
  return req.user;
}
