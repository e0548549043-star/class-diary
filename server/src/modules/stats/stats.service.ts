// חישוב אחוז נוכחות, מתחילת שנת הלימודים.
//
// אחוז נוכחות     = (נכח + חצי מהאיחורים) ÷ כל השיעורים × 100
// אם אין עדיין נתונים - האחוז הוא null.
import { prisma } from "../../db/prisma.js";
import { dateFromString, schoolYearStart } from "../../utils/dates.js";

export interface StudentStats {
  schoolYearStart: string;
  totalLessons: number;
  present: number;
  late: number;
  absent: number;
  attendancePercent: number | null;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

function emptyStats(start: string): StudentStats {
  return {
    schoolYearStart: start,
    totalLessons: 0,
    present: 0,
    late: 0,
    absent: 0,
    attendancePercent: null,
  };
}

/** מחשב סטטיסטיקה לרשימת תלמידים בבת אחת (שאילתה אחת בלבד) */
export async function getStatsForStudents(studentIds: number[]): Promise<Map<number, StudentStats>> {
  const start = schoolYearStart();
  const result = new Map<number, StudentStats>();
  for (const id of studentIds) result.set(id, emptyStats(start));
  if (studentIds.length === 0) return result;

  const sinceStart = { lesson: { date: { gte: dateFromString(start) } } };

  const byStatus = await prisma.attendance.groupBy({
    by: ["studentId", "status"],
    where: { studentId: { in: studentIds }, ...sinceStart },
    _count: { _all: true },
  });

  for (const row of byStatus) {
    const s = result.get(row.studentId);
    if (!s) continue;
    const count = row._count._all;
    if (row.status === "PRESENT") s.present += count;
    else if (row.status === "LATE") s.late += count;
    else s.absent += count;
    s.totalLessons += count;
  }

  for (const s of result.values()) {
    if (s.totalLessons > 0) {
      s.attendancePercent = round1(((s.present + s.late * 0.5) / s.totalLessons) * 100);
    }
  }

  return result;
}
