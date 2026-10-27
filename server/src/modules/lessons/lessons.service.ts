import { prisma } from "../../db/prisma.js";
import { Prisma } from "../../generated/prisma/client.js";
import type { AuthUser } from "../../middleware/authenticate.js";
import { dateFromString, dateToString, todayString } from "../../utils/dates.js";
import { type ErrorDetail, badRequest, conflict, forbidden, notFound } from "../../utils/httpError.js";
import { assertClassExists } from "../classes/classes.service.js";
import { subjectExists } from "../subjects/subjects.service.js";
import type { AttendanceItemInput, CreateLessonInput, UpdateLessonInput } from "./lessons.schemas.js";

// מה נטען עם כל שיעור
const lessonInclude = {
  schoolClass: { select: { id: true, name: true } },
  subject: { select: { id: true, name: true } },
  teacher: { select: { id: true, firstName: true, lastName: true } },
  attendance: {
    select: {
      studentId: true,
      status: true,
      student: { select: { firstName: true, lastName: true } },
    },
    orderBy: [{ student: { lastName: "asc" } }, { student: { firstName: "asc" } }],
  },
} satisfies Prisma.LessonInclude;

type LessonRow = Prisma.LessonGetPayload<{ include: typeof lessonInclude }>;

/** מבנה השיעור שמוחזר ללקוח */
function formatLesson(l: LessonRow) {
  const summary = { present: 0, late: 0, absent: 0 };
  for (const a of l.attendance) {
    if (a.status === "PRESENT") summary.present++;
    else if (a.status === "LATE") summary.late++;
    else summary.absent++;
  }
  return {
    id: l.id,
    date: dateToString(l.date),
    lessonNumber: l.lessonNumber,
    topic: l.topic,
    class: l.schoolClass,
    subject: l.subject,
    teacher: l.teacher,
    attendanceSummary: summary,
    attendance: l.attendance.map((a) => ({
      studentId: a.studentId,
      firstName: a.student.firstName,
      lastName: a.student.lastName,
      status: a.status,
    })),
  };
}

export type LessonDto = ReturnType<typeof formatLesson>;

/** רשימת שיעורי כיתה. מנהל רואה הכל, מורה רואה רק את השיעורים שהוא לימד */
export async function listClassLessons(
  user: AuthUser,
  classId: number,
  query: { subjectId?: number; page: number; pageSize: number },
) {
  await assertClassExists(classId);

  const where: Prisma.LessonWhereInput = {
    classId,
    ...(query.subjectId ? { subjectId: query.subjectId } : {}),
    ...(user.role === "TEACHER" ? { teacherId: user.id } : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.lesson.count({ where }),
    prisma.lesson.findMany({
      where,
      include: lessonInclude,
      orderBy: [{ date: "desc" }, { lessonNumber: "asc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
  ]);

  return {
    items: rows.map(formatLesson),
    page: query.page,
    pageSize: query.pageSize,
    total,
    totalPages: Math.ceil(total / query.pageSize),
  };
}

/** שיעור בודד. מורה יכול לצפות רק בשיעור שלו */
export async function getLesson(user: AuthUser, lessonId: number) {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, include: lessonInclude });
  if (!lesson) throw notFound("השיעור לא נמצא");
  if (user.role === "TEACHER" && lesson.teacherId !== user.id) {
    throw forbidden("אפשר לצפות רק בשיעורים שלימדת בעצמך");
  }
  return formatLesson(lesson);
}

/** בודק שרשימת הנוכחות מכילה בדיוק את התלמידים הצפויים (בלי כפילויות, בלי חסרים, בלי זרים) */
function normalizeAttendance(attendance: AttendanceItemInput[], expectedStudentIds: Set<number>) {
  const details: ErrorDetail[] = [];
  const seen = new Set<number>();

  attendance.forEach((a, i) => {
    if (seen.has(a.studentId)) {
      details.push({ field: `attendance.${i}.studentId`, message: `התלמיד ${a.studentId} מופיע יותר מפעם אחת` });
    }
    seen.add(a.studentId);
    if (!expectedStudentIds.has(a.studentId)) {
      details.push({ field: `attendance.${i}.studentId`, message: `התלמיד ${a.studentId} לא שייך לשיעור/לכיתה הזו` });
    }
  });

  const missing = [...expectedStudentIds].filter((id) => !seen.has(id));
  if (missing.length > 0) {
    details.push({ field: "attendance", message: `חסרה נוכחות לתלמידים: ${missing.join(", ")}` });
  }

  if (details.length > 0) throw badRequest("רשימת הנוכחות אינה תקינה", details);

  return attendance.map((a) => ({
    studentId: a.studentId,
    status: a.status,
  }));
}

async function assertSubject(subjectId: number) {
  if (!(await subjectExists(subjectId))) {
    throw badRequest("הנתונים שנשלחו אינם תקינים", [{ field: "subjectId", message: "המקצוע לא קיים" }]);
  }
}

async function assertLessonNumberFree(classId: number, date: Date, lessonNumber: number, exceptLessonId?: number) {
  const existing = await prisma.lesson.findUnique({
    where: { classId_date_lessonNumber: { classId, date, lessonNumber } },
    select: { id: true },
  });
  if (existing && existing.id !== exceptLessonId) {
    throw conflict(`שיעור מספר ${lessonNumber} כבר קיים בכיתה הזו בתאריך ${dateToString(date)}`);
  }
}

function isUniqueViolation(err: unknown) {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

/** פתיחת שיעור חדש להיום. המורה נקבע לפי ה־Token, התאריך לפי השרת */
export async function createLesson(teacherId: number, input: CreateLessonInput) {
  const classExists = await prisma.schoolClass.count({ where: { id: input.classId } });
  if (!classExists) {
    throw badRequest("הנתונים שנשלחו אינם תקינים", [{ field: "classId", message: "הכיתה לא קיימת" }]);
  }
  await assertSubject(input.subjectId);

  const date = dateFromString(todayString());
  await assertLessonNumberFree(input.classId, date, input.lessonNumber);

  const students = await prisma.user.findMany({
    where: { classId: input.classId, role: "STUDENT" },
    select: { id: true },
  });
  const attendance = normalizeAttendance(input.attendance, new Set(students.map((s) => s.id)));

  try {
    const lesson = await prisma.lesson.create({
      data: {
        classId: input.classId,
        teacherId,
        subjectId: input.subjectId,
        date,
        lessonNumber: input.lessonNumber,
        topic: input.topic,
        attendance: { create: attendance },
      },
      include: lessonInclude,
    });
    return formatLesson(lesson);
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw conflict(`שיעור מספר ${input.lessonNumber} כבר קיים בכיתה הזו היום`);
    }
    throw err;
  }
}

/**
 * עריכת שיעור - רק המורה שלימד אותו.
 * אי אפשר לשנות כיתה או תאריך. רשימת התלמידים בשיעור נשארת כפי שהייתה בפתיחתו.
 */
export async function updateLesson(teacherId: number, lessonId: number, input: UpdateLessonInput) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, teacherId: true, classId: true, date: true, attendance: { select: { studentId: true } } },
  });
  if (!lesson) throw notFound("השיעור לא נמצא");
  if (lesson.teacherId !== teacherId) throw forbidden("אפשר לערוך רק שיעורים שלימדת בעצמך");

  await assertSubject(input.subjectId);
  await assertLessonNumberFree(lesson.classId, lesson.date, input.lessonNumber, lesson.id);

  const attendance = normalizeAttendance(input.attendance, new Set(lesson.attendance.map((a) => a.studentId)));

  try {
    // הכל בטרנזקציה אחת: או שהכל נשמר, או ששום דבר לא נשמר
    await prisma.$transaction(async (tx) => {
      await tx.lesson.update({
        where: { id: lessonId },
        data: {
          subjectId: input.subjectId,
          lessonNumber: input.lessonNumber,
          topic: input.topic,
        },
      });
      for (const a of attendance) {
        await tx.attendance.update({
          where: { lessonId_studentId: { lessonId, studentId: a.studentId } },
          data: { status: a.status },
        });
      }
    });
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw conflict(`שיעור מספר ${input.lessonNumber} כבר קיים בכיתה הזו בתאריך הזה`);
    }
    throw err;
  }

  const updated = await prisma.lesson.findUniqueOrThrow({ where: { id: lessonId }, include: lessonInclude });
  return formatLesson(updated);
}
