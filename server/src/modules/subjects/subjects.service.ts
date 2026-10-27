import { prisma } from "../../db/prisma.js";

export function listSubjects() {
  return prisma.subject.findMany({ orderBy: { name: "asc" } });
}

export async function subjectExists(subjectId: number) {
  return (await prisma.subject.count({ where: { id: subjectId } })) > 0;
}
