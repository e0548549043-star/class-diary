import { prisma } from "../../db/prisma.js";
import { notFound } from "../../utils/httpError.js";

export function listClasses() {
  return prisma.schoolClass.findMany({
    orderBy: [{ gradeLevel: "asc" }, { name: "asc" }],
    select: { id: true, name: true, gradeLevel: true, _count: { select: { students: true } } },
  }).then((rows) =>
    rows.map(({ _count, ...c }) => ({ ...c, studentCount: _count.students })),
  );
}

export async function assertClassExists(classId: number) {
  const found = await prisma.schoolClass.findUnique({ where: { id: classId }, select: { id: true } });
  if (!found) throw notFound("הכיתה לא נמצאה");
}

export async function listClassStudents(classId: number) {
  await assertClassExists(classId);
  return prisma.user.findMany({
    where: { classId, role: "STUDENT" },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    select: { id: true, idNumber: true, firstName: true, lastName: true },
  });
}
