// בדיקות מערכת: בריאות שרת, Swagger, תקינות מסד הנתונים, CORS
import SwaggerParser from "@apidevtools/swagger-parser";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../src/db/prisma.js";
import { openApiDocument } from "../src/docs/openapi.js";
import { dateFromString } from "../src/utils/dates.js";
import { type Fixture, app, resetDatabase } from "./helpers.js";

let f: Fixture;

beforeAll(async () => {
  f = await resetDatabase();
});
afterAll(async () => {
  await prisma.$disconnect();
});

describe("בדיקת בריאות", () => {
  it("GET /api/health מחזיר ok ומאשר חיבור למסד הנתונים", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: "ok", database: "ok" });
  });

  it("כתובת לא קיימת - 404 בפורמט אחיד", async () => {
    const res = await request(app).get("/api/nothing-here");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});

describe("Swagger / OpenAPI", () => {
  it("מסמך ה־OpenAPI תקין לפי התקן", async () => {
    const doc = structuredClone(openApiDocument) as unknown as Parameters<typeof SwaggerParser.validate>[0];
    await expect(SwaggerParser.validate(doc)).resolves.toBeTruthy();
  });

  it("כל ה־Endpoints מתועדים", () => {
    const documented = Object.entries(openApiDocument.paths).flatMap(([path, ops]) =>
      Object.keys(ops).map((m) => `${m.toUpperCase()} ${path}`),
    );
    expect(documented.sort()).toEqual(
      [
        "GET /api/health",
        "POST /api/auth/login",
        "GET /api/auth/me",
        "GET /api/classes",
        "GET /api/classes/{classId}/students",
        "GET /api/classes/{classId}/lessons",
        "GET /api/subjects",
        "POST /api/lessons",
        "GET /api/lessons/{id}",
        "PUT /api/lessons/{id}",
        "GET /api/users",
        "GET /api/users/{id}",
        "PATCH /api/users/{id}/password",
      ].sort(),
    );
  });

  it("כל Endpoint מתועד קיים בשרת, ומוגן ב־Token אם הוא מסומן כמוגן", async () => {
    for (const [path, ops] of Object.entries(openApiDocument.paths)) {
      for (const [method, op] of Object.entries(ops)) {
        const url = path.replace(/\{[^}]+\}/g, "1");
        const res = await (request(app) as unknown as Record<string, (u: string) => request.Test>)[method]!(url).send({});
        expect(res.status, `${method} ${path}`).not.toBe(404);
        const isProtected = "security" in (op as object);
        if (isProtected) expect(res.status, `${method} ${path}`).toBe(401);
      }
    }
  });

  it("מוגדר Bearer JWT (כפתור Authorize)", () => {
    expect(openApiDocument.components.securitySchemes.bearerAuth).toMatchObject({ type: "http", scheme: "bearer" });
  });

  it("Swagger UI נפתח ב־/api-docs, והמסמך זמין ב־/api-docs.json", async () => {
    const ui = await request(app).get("/api-docs/");
    expect(ui.status).toBe(200);
    expect(ui.text).toContain("swagger-ui");
    const json = await request(app).get("/api-docs.json");
    expect(json.status).toBe(200);
    expect(json.body.openapi).toBe("3.0.3");
  });
});

describe("תקינות מסד הנתונים (Prisma)", () => {
  it("אילוץ ייחודיות: אותו מספר שיעור באותה כיתה ובאותו יום", async () => {
    const lesson = await prisma.lesson.findUniqueOrThrow({ where: { id: f.teacher2Lessons[0]! } });
    await expect(
      prisma.lesson.create({
        data: {
          classId: lesson.classId,
          teacherId: lesson.teacherId,
          subjectId: lesson.subjectId,
          date: lesson.date,
          lessonNumber: lesson.lessonNumber,
          topic: "כפילות",
        },
      }),
    ).rejects.toMatchObject({ code: "P2002" });
  });

  it("אילוץ ייחודיות: ת.ז", async () => {
    await expect(
      prisma.user.create({
        data: { idNumber: f.admin.idNumber, firstName: "x", lastName: "y", role: "TEACHER", passwordHash: "x" },
      }),
    ).rejects.toMatchObject({ code: "P2002" });
  });

  it("אילוץ ייחודיות: תלמיד פעם אחת בכל שיעור", async () => {
    await expect(
      prisma.attendance.create({
        data: { lessonId: f.teacher2Lessons[0]!, studentId: f.studentA1.id, status: "PRESENT" },
      }),
    ).rejects.toMatchObject({ code: "P2002" });
  });

  it("מפתח זר: אי אפשר ליצור שיעור לכיתה שלא קיימת", async () => {
    await expect(
      prisma.lesson.create({
        data: {
          classId: 99999,
          teacherId: f.teacher1.id,
          subjectId: f.math,
          date: dateFromString("2026-01-01"),
          lessonNumber: 1,
          topic: "x",
        },
      }),
    ).rejects.toMatchObject({ code: "P2003" });
  });

  it("מחיקת שיעור מוחקת גם את הנוכחות שלו (Cascade)", async () => {
    await prisma.lesson.delete({ where: { id: f.oldLesson } });
    expect(await prisma.attendance.count({ where: { lessonId: f.oldLesson } })).toBe(0);
  });
});

describe("CORS", () => {
  it("מחזיר כותרות CORS לבקשת preflight", async () => {
    const res = await request(app)
      .options("/api/auth/login")
      .set("Origin", "http://localhost:5173")
      .set("Access-Control-Request-Method", "POST");
    expect(res.status).toBe(204);
    expect(res.headers["access-control-allow-origin"]).toBeTruthy();
  });
});
