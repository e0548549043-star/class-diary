// ניהול משתמשים (מנהל בלבד)
import { prisma } from "../../db/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { notFound } from "../../utils/httpError.js";
import { hashPassword } from "../../utils/password.js";
import { type StudentStats, getStatsForStudents } from "../stats/stats.service.js";
import type { ListUsersQuery } from "./users.schemas.js";
import { type PublicUser, publicUserSelect, toPublicUser } from "./users.select.js";

export type UserWithStats = PublicUser & { stats: StudentStats | null };

async function attachStats(users: PublicUser[]): Promise<UserWithStats[]> {
  const studentIds = users.filter((u) => u.role === "STUDENT").map((u) => u.id);
  const stats = await getStatsForStudents(studentIds);
  return users.map((u) => ({ ...u, stats: u.role === "STUDENT" ? (stats.get(u.id) ?? null) : null }));
}

/** חיפוש: כל מילה צריכה להופיע בשם הפרטי, בשם המשפחה או בתחילת ת.ז */
function searchFilter(search: string | undefined): Prisma.UserWhereInput {
  const words = (search ?? "").split(/\s+/).filter(Boolean);
  if (words.length === 0) return {};
  return {
    AND: words.map((w) => ({
      OR: [
        { firstName: { contains: w, mode: "insensitive" as const } },
        { lastName: { contains: w, mode: "insensitive" as const } },
        { idNumber: { startsWith: w } },
      ],
    })),
  };
}

export async function listUsers(query: ListUsersQuery) {
  const where: Prisma.UserWhereInput = {
    ...(query.role ? { role: query.role } : {}),
    ...(query.classId ? { classId: query.classId } : {}),
    ...searchFilter(query.search),
  };

  const [total, rows] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: publicUserSelect,
      orderBy: [{ role: "asc" }, { lastName: "asc" }, { firstName: "asc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
  ]);

  return {
    items: await attachStats(rows.map(toPublicUser)),
    page: query.page,
    pageSize: query.pageSize,
    total,
    totalPages: Math.ceil(total / query.pageSize),
  };
}

export async function getUser(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: publicUserSelect });
  if (!user) throw notFound("המשתמש לא נמצא");
  const [withStats] = await attachStats([toPublicUser(user)]);
  return withStats!;
}

/** "איפוס סיסמה": המנהל קובע סיסמה חדשה שמחליפה את הקודמת */
export async function resetPassword(userId: number, password: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) throw notFound("המשתמש לא נמצא");
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: await hashPassword(password) } });
}
