import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../src/db/prisma.js";
import { todayString } from "../src/utils/dates.js";
import { type Fixture, app, auth, resetDatabase } from "./helpers.js";

let f: Fixture;
let createdId: number;

beforeAll(async () => {
  f = await resetDatabase();
});
afterAll(async () => {
  await prisma.$disconnect();
});

const body = (overrides: Record<string, unknown> = {}) => ({
  classId: f.classA,
  subjectId: f.math,
  lessonNumber: 1,
  topic: "שברים פשוטים",
  attendance: [
    { studentId: f.studentA1.id, status: "PRESENT" },
    { studentId: f.studentA2.id, status: "LATE" },
    { studentId: f.studentA3.id, status: "ABSENT" },
  ],
  ...overrides,
});

describe("פתיחת שיעור - POST /api/lessons", () => {
  it("מורה פותח שיעור להיום (201), המורה והתאריך נקבעים בשרת", async () => {
    const res = await request(app).post("/api/lessons").set(auth(f.tokens.teacher1)).send(body());
    expect(res.status).toBe(201);
    createdId = res.body.id;
    expect(res.body).toMatchObject({
      date: todayString(),
      lessonNumber: 1,
      topic: "שברים פשוטים",
      teacher: { id: f.teacher1.id },
      class: { id: f.classA },
      subject: { id: f.math, name: "מתמטיקה" },
      attendanceSummary: { present: 1, late: 1, absent: 1 },
    });
  });

  it("הנתונים נשמרו במסד הנתונים", async () => {
    const saved = await prisma.lesson.findUnique({ where: { id: createdId }, include: { attendance: true } });
    expect(saved?.teacherId).toBe(f.teacher1.id);
    expect(saved?.attendance).toHaveLength(3);
  });

  it("אותו מספר שיעור באותה כיתה היום - 409", async () => {
    const res = await request(app).post("/api/lessons").set(auth(f.tokens.teacher1)).send(body());
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
  });

  it("אי אפשר לקבוע מורה או תאריך מהלקוח (שדות לא מוכרים - 400)", async () => {
    const res = await request(app)
      .post("/api/lessons")
      .set(auth(f.tokens.teacher1))
      .send(body({ lessonNumber: 2, teacherId: f.teacher2.id, date: "2020-01-01" }));
    expect(res.status).toBe(400);
  });

  it("חסר תלמיד ברשימת הנוכחות - 400", async () => {
    const b = body({ lessonNumber: 2 });
    b.attendance = b.attendance.slice(0, 2);
    const res = await request(app).post("/api/lessons").set(auth(f.tokens.teacher1)).send(b);
    expect(res.status).toBe(400);
    expect(res.body.error.details[0].message).toContain(String(f.studentA3.id));
  });

  it("תלמיד מכיתה אחרת - 400", async () => {
    const b = body({ lessonNumber: 2 });
    b.attendance.push({ studentId: f.studentB1.id, status: "PRESENT" });
    const res = await request(app).post("/api/lessons").set(auth(f.tokens.teacher1)).send(b);
    expect(res.status).toBe(400);
  });

  it("תלמיד שמופיע פעמיים - 400", async () => {
    const b = body({ lessonNumber: 2 });
    b.attendance.push({ studentId: f.studentA1.id, status: "PRESENT" });
    const res = await request(app).post("/api/lessons").set(auth(f.tokens.teacher1)).send(b);
    expect(res.status).toBe(400);
  });

  it("שדות שהוסרו מהשיעור כבר לא מתקבלים - 400", async () => {
    const withLessonField = await request(app)
      .post("/api/lessons")
      .set(auth(f.tokens.teacher1))
      .send(body({ lessonNumber: 2, checkHomework: true }));
    expect(withLessonField.status).toBe(400);
    expect(withLessonField.body.error.details[0].message).toContain("checkHomework");

    const b = body({ lessonNumber: 2 });
    b.attendance[0] = { studentId: f.studentA1.id, status: "PRESENT", didHomework: true } as never;
    const withAttendanceField = await request(app).post("/api/lessons").set(auth(f.tokens.teacher1)).send(b);
    expect(withAttendanceField.status).toBe(400);
    expect(withAttendanceField.body.error.details[0].field).toBe("attendance.0");
  });

  it("פתיחת שיעור נוסף באותו יום במספר אחר - 201", async () => {
    const res = await request(app).post("/api/lessons").set(auth(f.tokens.teacher1)).send(body({ lessonNumber: 3 }));
    expect(res.status).toBe(201);
  });

  it("ולידציה של שדות: מספר שיעור, נושא, סטטוס, מקצוע", async () => {
    const res = await request(app)
      .post("/api/lessons")
      .set(auth(f.tokens.teacher1))
      .send(body({ lessonNumber: 11, topic: "   ", attendance: [{ studentId: f.studentA1.id, status: "SICK" }] }));
    expect(res.status).toBe(400);
    const fields = res.body.error.details.map((d: { field: string }) => d.field);
    expect(fields).toEqual(expect.arrayContaining(["lessonNumber", "topic", "attendance.0.status"]));

    const badSubject = await request(app)
      .post("/api/lessons")
      .set(auth(f.tokens.teacher1))
      .send(body({ lessonNumber: 4, subjectId: 9999 }));
    expect(badSubject.status).toBe(400);
  });
});

describe("צפייה ועריכה של שיעור", () => {
  it("המורה רואה את השיעור שלו, המנהל רואה כל שיעור", async () => {
    const own = await request(app).get(`/api/lessons/${createdId}`).set(auth(f.tokens.teacher1));
    expect(own.status).toBe(200);
    const admin = await request(app).get(`/api/lessons/${createdId}`).set(auth(f.tokens.admin));
    expect(admin.status).toBe(200);
  });

  it("מורה אחר לא יכול לצפות או לערוך - 403", async () => {
    const get = await request(app).get(`/api/lessons/${createdId}`).set(auth(f.tokens.teacher2));
    expect(get.status).toBe(403);
    const { classId: _c, ...update } = body();
    const put = await request(app).put(`/api/lessons/${createdId}`).set(auth(f.tokens.teacher2)).send(update);
    expect(put.status).toBe(403);
  });

  it("שיעור שלא קיים - 404", async () => {
    const res = await request(app).get("/api/lessons/999999").set(auth(f.tokens.admin));
    expect(res.status).toBe(404);
  });

  it("מזהה לא מספרי - 400", async () => {
    const res = await request(app).get("/api/lessons/abc").set(auth(f.tokens.admin));
    expect(res.status).toBe(400);
  });

  it("המורה עורך את השיעור שלו", async () => {
    const res = await request(app)
      .put(`/api/lessons/${createdId}`)
      .set(auth(f.tokens.teacher1))
      .send({
        subjectId: f.english,
        lessonNumber: 4,
        topic: "נושא מעודכן",
        attendance: [
          { studentId: f.studentA1.id, status: "ABSENT" },
          { studentId: f.studentA2.id, status: "PRESENT" },
          { studentId: f.studentA3.id, status: "PRESENT" },
        ],
      });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      lessonNumber: 4,
      topic: "נושא מעודכן",
      subject: { id: f.english },
      attendanceSummary: { present: 2, late: 0, absent: 1 },
    });
  });

  it("עריכה למספר שיעור תפוס - 409", async () => {
    const res = await request(app)
      .put(`/api/lessons/${createdId}`)
      .set(auth(f.tokens.teacher1))
      .send({
        subjectId: f.math,
        lessonNumber: 3, // נפתח קודם בבדיקה אחרת
        topic: "x",
        attendance: [
          { studentId: f.studentA1.id, status: "PRESENT" },
          { studentId: f.studentA2.id, status: "PRESENT" },
          { studentId: f.studentA3.id, status: "PRESENT" },
        ],
      });
    expect(res.status).toBe(409);
  });
});

describe("יומן כיתה - GET /api/classes/:classId/lessons", () => {
  it("מורה רואה רק את השיעורים שהוא לימד", async () => {
    const res = await request(app).get(`/api/classes/${f.classA}/lessons`).set(auth(f.tokens.teacher1));
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.items.every((l: { teacher: { id: number } }) => l.teacher.id === f.teacher1.id)).toBe(true);
  });

  it("מנהל רואה את כל השיעורים בכיתה, ממוינים מהחדש לישן", async () => {
    const res = await request(app).get(`/api/classes/${f.classA}/lessons?pageSize=100`).set(auth(f.tokens.admin));
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(7); // 4 + 1 ישן של מורה 2, ועוד 2 של מורה 1
    const dates = res.body.items.map((l: { date: string }) => l.date);
    expect(dates.at(-1)).toBe("2020-01-01");
  });

  it("סינון לפי מקצוע", async () => {
    const res = await request(app)
      .get(`/api/classes/${f.classA}/lessons?subjectId=${f.math}`)
      .set(auth(f.tokens.admin));
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body.items.every((l: { subject: { id: number } }) => l.subject.id === f.math)).toBe(true);
  });

  it("חלוקה לעמודים", async () => {
    const res = await request(app).get(`/api/classes/${f.classA}/lessons?pageSize=2&page=2`).set(auth(f.tokens.admin));
    expect(res.body).toMatchObject({ page: 2, pageSize: 2, total: 7, totalPages: 4 });
    expect(res.body.items).toHaveLength(2);
  });

  it("פרמטר לא מוכר או שגוי - 400; כיתה שלא קיימת - 404", async () => {
    const bad = await request(app).get(`/api/classes/${f.classA}/lessons?foo=1`).set(auth(f.tokens.admin));
    expect(bad.status).toBe(400);
    const missing = await request(app).get("/api/classes/9999/lessons").set(auth(f.tokens.admin));
    expect(missing.status).toBe(404);
  });

  it("רשימת תלמידי כיתה ממוינת לפי שם משפחה", async () => {
    const res = await request(app).get(`/api/classes/${f.classA}/students`).set(auth(f.tokens.teacher1));
    expect(res.status).toBe(200);
    expect(res.body.map((s: { lastName: string }) => s.lastName)).toEqual(["אברהמי", "ברגר", "גולד"]);
  });
});
