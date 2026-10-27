import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../src/db/prisma.js";
import { type Fixture, app, auth, resetDatabase } from "./helpers.js";

let f: Fixture;

beforeAll(async () => {
  f = await resetDatabase();
});
afterAll(async () => {
  await prisma.$disconnect();
});

type UserItem = { id: number; role: string; firstName: string; lastName: string; idNumber: string; stats: unknown };

describe("רשימת משתמשים - GET /api/users", () => {
  it("מחזיר את כל המשתמשים עם חלוקה לעמודים", async () => {
    const res = await request(app).get("/api/users").set(auth(f.tokens.admin));
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(7);
    expect(JSON.stringify(res.body)).not.toContain("passwordHash");
  });

  it("סינון לפי תפקיד", async () => {
    const res = await request(app).get("/api/users?role=TEACHER").set(auth(f.tokens.admin));
    expect(res.body.items.map((u: UserItem) => u.role)).toEqual(["TEACHER", "TEACHER"]);
  });

  it("סינון לפי כיתה", async () => {
    const res = await request(app).get(`/api/users?classId=${f.classA}`).set(auth(f.tokens.admin));
    expect(res.body.total).toBe(3);
  });

  it("חיפוש לפי שם (גם שם מלא) ולפי תחילת ת.ז", async () => {
    const byName = await request(app).get(`/api/users?search=${encodeURIComponent("שרה אברהמי")}`).set(auth(f.tokens.admin));
    expect(byName.body.items.map((u: UserItem) => u.id)).toEqual([f.studentA1.id]);

    const byPart = await request(app).get(`/api/users?search=${encodeURIComponent("גולד")}`).set(auth(f.tokens.admin));
    expect(byPart.body.total).toBe(2); // "גולד" ו"גולדברג"

    const byId = await request(app).get("/api/users?search=2000000").set(auth(f.tokens.admin));
    expect(byId.body.items.every((u: UserItem) => u.idNumber.startsWith("2000000"))).toBe(true);
    expect(byId.body.total).toBe(2);
  });

  it("לתלמידים מוחזרים אחוזים, למורים null", async () => {
    const res = await request(app).get("/api/users?pageSize=100").set(auth(f.tokens.admin));
    const a1 = res.body.items.find((u: UserItem) => u.id === f.studentA1.id);
    expect(a1.stats).toEqual({
      schoolYearStart: expect.any(String),
      totalLessons: 4,
      present: 2,
      late: 1,
      absent: 1,
      attendancePercent: 62.5,
    });
    const t1 = res.body.items.find((u: UserItem) => u.id === f.teacher1.id);
    expect(t1.stats).toBeNull();
  });

  it("פרמטר שגוי - 400", async () => {
    const res = await request(app).get("/api/users?role=PRINCIPAL").set(auth(f.tokens.admin));
    expect(res.status).toBe(400);
  });
});

describe("איפוס סיסמה ומשתמש בודד", () => {
  it("איפוס סיסמה: הסיסמה הישנה כבר לא עובדת והחדשה כן", async () => {
    const res = await request(app)
      .patch(`/api/users/${f.teacher2.id}/password`)
      .set(auth(f.tokens.admin))
      .send({ password: "Changed456" });
    expect(res.status).toBe(200);

    const oldLogin = await request(app).post("/api/auth/login").send({ idNumber: f.teacher2.idNumber, password: "Test1234!" });
    expect(oldLogin.status).toBe(401);
    const newLogin = await request(app).post("/api/auth/login").send({ idNumber: f.teacher2.idNumber, password: "Changed456" });
    expect(newLogin.status).toBe(200);
  });

  it("משתמש בודד כולל אחוזים; לא קיים - 404", async () => {
    const res = await request(app).get(`/api/users/${f.studentA1.id}`).set(auth(f.tokens.admin));
    expect(res.status).toBe(200);
    expect(res.body.stats.attendancePercent).toBe(62.5);
    const missing = await request(app).get("/api/users/999999").set(auth(f.tokens.admin));
    expect(missing.status).toBe(404);
  });
});
