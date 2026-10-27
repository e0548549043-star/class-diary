import { env } from "../../config/env.js";
import { prisma } from "../../db/prisma.js";
import { signToken } from "../../middleware/authenticate.js";
import { notFound, unauthorized } from "../../utils/httpError.js";
import crypto from "node:crypto";
import { hashPasswordSync, verifyPassword } from "../../utils/password.js";
import { publicUserSelect, toPublicUser } from "../users/users.select.js";

// Hash של סיסמה אקראית, משמש להשוואה כשת.ז לא קיימת
const DUMMY_HASH = hashPasswordSync(crypto.randomUUID());

export async function login(idNumber: string, password: string) {
  // רק מנהל ומורים מתחברים. תלמיד מטופל בדיוק כמו ת.ז שלא קיימת
  const user = await prisma.user.findUnique({
    where: { idNumber, role: { not: "STUDENT" } },
    select: { ...publicUserSelect, passwordHash: true },
  });

  // הודעה זהה (ואותו זמן תגובה) לת.ז שגויה ולסיסמה שגויה - כדי לא לחשוף אילו ת.ז קיימות
  const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) throw unauthorized("תעודת זהות או סיסמה שגויים");

  const { passwordHash: _ignored, ...rest } = user;
  return {
    token: signToken(user),
    tokenType: "Bearer" as const,
    expiresIn: env.JWT_EXPIRES_IN,
    user: toPublicUser(rest),
  };
}

export async function getMe(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: publicUserSelect });
  if (!user) throw notFound("המשתמש לא נמצא");
  return toPublicUser(user);
}
