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

type Who = "admin" | "teacher1";

describe("טבלת הרשאות", () => {
  // [כתובת לתצוגה, פונקציה שמחזירה את הכתובת, מי מורשה]
  const cases: [string, () => string, Who[]][] = [
    ["GET /api/classes", () => "/api/classes", ["admin", "teacher1"]],
    ["GET /api/classes/:id/students", () => `/api/classes/${f.classA}/students`, ["admin", "teacher1"]],
    ["GET /api/classes/:id/lessons", () => `/api/classes/${f.classA}/lessons`, ["admin", "teacher1"]],
    ["GET /api/subjects", () => "/api/subjects", ["admin", "teacher1"]],
    ["GET /api/users", () => "/api/users", ["admin"]],
    ["GET /api/users/:id", () => `/api/users/${f.studentA1.id}`, ["admin"]],
    // מורה 1 לא לימד את השיעור הזה - ולכן גם לו אסור
    ["GET /api/lessons/:id (של מורה אחר)", () => `/api/lessons/${f.teacher2Lessons[0]}`, ["admin"]],
  ];

  for (const [label, url, allowed] of cases) {
    for (const who of ["admin", "teacher1"] as Who[]) {
      const expected = allowed.includes(who) ? 200 : 403;
      it(`${label} - ${who} מקבל ${expected}`, async () => {
        const res = await request(app).get(url()).set(auth(f.tokens[who]));
        expect(res.status).toBe(expected);
      });
    }
  }

  it("רק מורה יכול לפתוח שיעור (מנהל מקבל 403)", async () => {
    for (const who of ["admin"] as Who[]) {
      const res = await request(app).post("/api/lessons").set(auth(f.tokens[who])).send({});
      expect(res.status).toBe(403);
    }
  });

  it("רק מנהל יכול לאפס סיסמה (מורה מקבל 403)", async () => {
    const reset = await request(app)
      .patch(`/api/users/${f.teacher2.id}/password`)
      .set(auth(f.tokens.teacher1))
      .send({ password: "Hacked123" });
    expect(reset.status).toBe(403);
  });

  it("כל Endpoint מוגן מחזיר 401 בלי Token", async () => {
    const urls = ["/api/classes", "/api/subjects", "/api/users", "/api/lessons/1"];
    for (const url of urls) {
      const res = await request(app).get(url);
      expect(res.status, url).toBe(401);
    }
  });
});
