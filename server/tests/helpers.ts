// נתוני בדיקה קטנים וידועים מראש. כל קובץ בדיקות מתחיל ממסד נקי.
import request from "supertest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/db/prisma.js";
import { dateFromString, todayString } from "../src/utils/dates.js";
import { hashPassword } from "../src/utils/password.js";

export const app = createApp();
export const PASSWORD = "Test1234!";

export interface Fixture {
  classA: number;
  classB: number;
  math: number;
  english: number;
  admin: { id: number; idNumber: string };
  teacher1: { id: number; idNumber: string };
  teacher2: { id: number; idNumber: string };
  studentA1: { id: number; idNumber: string };
  studentA2: { id: number; idNumber: string };
  studentA3: { id: number; idNumber: string };
  studentB1: { id: number; idNumber: string };
  /** שיעורים של מורה 2 בכיתה A (היום, שיעורים 5-8) */
  teacher2Lessons: number[];
  /** שיעור ישן (2020) של מורה 2 - לפני תחילת שנת הלימודים */
  oldLesson: number;
  tokens: { admin: string; teacher1: string; teacher2: string };
}

export async function login(idNumber: string, password = PASSWORD): Promise<string> {
  const res = await request(app).post("/api/auth/login").send({ idNumber, password });
  if (res.status !== 200) throw new Error(`login failed for ${idNumber}: ${res.status} ${JSON.stringify(res.body)}`);
  return res.body.token as string;
}

export async function resetDatabase(): Promise<Fixture> {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "Attendance", "Lesson", "User", "Subject", "SchoolClass" RESTART IDENTITY CASCADE`,
  );

  const passwordHash = await hashPassword(PASSWORD);
  const math = await prisma.subject.create({ data: { name: "מתמטיקה" } });
  const english = await prisma.subject.create({ data: { name: "אנגלית" } });
  const classA = await prisma.schoolClass.create({ data: { name: "ט'1", gradeLevel: 9 } });
  const classB = await prisma.schoolClass.create({ data: { name: "ט'2", gradeLevel: 9 } });

  const mk = (idNumber: string, firstName: string, lastName: string, role: "ADMIN" | "TEACHER" | "STUDENT", classId?: number) =>
    prisma.user.create({
      data: { idNumber, firstName, lastName, role, classId: classId ?? null, passwordHash },
      select: { id: true, idNumber: true },
    });

  const admin = await mk("100000009", "אסתר", "לוי", "ADMIN");
  const teacher1 = await mk("200000008", "רבקה", "פרידמן", "TEACHER");
  const teacher2 = await mk("200000016", "חנה", "גולדברג", "TEACHER");
  const studentA1 = await mk("300000007", "שרה", "אברהמי", "STUDENT", classA.id);
  const studentA2 = await mk("300000015", "מרים", "ברגר", "STUDENT", classA.id);
  const studentA3 = await mk("300000023", "חנה", "גולד", "STUDENT", classA.id);
  const studentB1 = await mk("300000031", "רחל", "כהן", "STUDENT", classB.id);

  // ארבעה שיעורים היום של מורה 2 בכיתה A, עם דפוס נוכחות ידוע לתלמידה A1:
  // 5: נכחה | 6: איחרה | 7: חסרה | 8: נכחה
  // => נוכחות (2 + 0.5) / 4 = 62.5%
  const today = dateFromString(todayString());
  const pattern: { n: number; a1: "PRESENT" | "LATE" | "ABSENT" }[] = [
    { n: 5, a1: "PRESENT" },
    { n: 6, a1: "LATE" },
    { n: 7, a1: "ABSENT" },
    { n: 8, a1: "PRESENT" },
  ];
  const teacher2Lessons: number[] = [];
  for (const p of pattern) {
    const lesson = await prisma.lesson.create({
      data: {
        classId: classA.id,
        teacherId: teacher2.id,
        subjectId: english.id,
        date: today,
        lessonNumber: p.n,
        topic: `Topic ${p.n}`,
        attendance: {
          create: [
            { studentId: studentA1.id, status: p.a1 },
            { studentId: studentA2.id, status: "PRESENT" },
            { studentId: studentA3.id, status: "PRESENT" },
          ],
        },
      },
    });
    teacher2Lessons.push(lesson.id);
  }

  const old = await prisma.lesson.create({
    data: {
      classId: classA.id,
      teacherId: teacher2.id,
      subjectId: english.id,
      date: dateFromString("2020-01-01"),
      lessonNumber: 1,
      topic: "Old lesson",
      attendance: {
        create: [
          { studentId: studentA1.id, status: "PRESENT" },
          { studentId: studentA2.id, status: "PRESENT" },
          { studentId: studentA3.id, status: "PRESENT" },
        ],
      },
    },
  });

  const tokens = {
    admin: await login(admin.idNumber),
    teacher1: await login(teacher1.idNumber),
    teacher2: await login(teacher2.idNumber),
  };

  return {
    classA: classA.id,
    classB: classB.id,
    math: math.id,
    english: english.id,
    admin,
    teacher1,
    teacher2,
    studentA1,
    studentA2,
    studentA3,
    studentB1,
    teacher2Lessons,
    oldLesson: old.id,
    tokens,
  };
}

export const auth = (token: string) => ({ Authorization: `Bearer ${token}` });
