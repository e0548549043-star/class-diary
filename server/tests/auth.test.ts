import jwt from "jsonwebtoken";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../src/db/prisma.js";
import { type Fixture, PASSWORD, app, auth, resetDatabase } from "./helpers.js";

let f: Fixture;

beforeAll(async () => {
  f = await resetDatabase();
});
afterAll(async () => {
  await prisma.$disconnect();
});

describe("התחברות - POST /api/auth/login", () => {
  it("התחברות תקינה מחזירה Token ופרטי משתמש בלי סיסמה", async () => {
    const res = await request(app).post("/api/auth/login").send({ idNumber: f.teacher1.idNumber, password: PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.tokenType).toBe("Bearer");
    expect(res.body.user).toMatchObject({ id: f.teacher1.id, role: "TEACHER", class: null });
    expect(JSON.stringify(res.body)).not.toMatch(/passwordHash|\$2[aby]\$/);
  });

  it("סיסמה שגויה מחזירה 401", async () => {
    const res = await request(app).post("/api/auth/login").send({ idNumber: f.teacher1.idNumber, password: "wrong-pass" });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("ת.ז שלא קיימת מחזירה 401 עם אותה הודעה", async () => {
    const wrongPass = await request(app).post("/api/auth/login").send({ idNumber: f.teacher1.idNumber, password: "x" });
    const unknown = await request(app).post("/api/auth/login").send({ idNumber: "999999998", password: "x" });
    expect(unknown.status).toBe(401);
    expect(unknown.body.error.message).toBe(wrongPass.body.error.message);
  });

  it("גוף בקשה חסר מחזיר 400 עם פירוט שדות", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details.map((d: { field: string }) => d.field)).toEqual(
      expect.arrayContaining(["idNumber", "password"]),
    );
  });

  it("JSON לא תקין מחזיר 400", async () => {
    const res = await request(app).post("/api/auth/login").set("Content-Type", "application/json").send("{bad json");
    expect(res.status).toBe(400);
  });
});

describe("זיהוי משתמש - GET /api/auth/me", () => {
  it("מחזיר את המשתמש לפי ה־Token", async () => {
    const res = await request(app).get("/api/auth/me").set(auth(f.tokens.teacher1));
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: f.teacher1.id, role: "TEACHER", class: null });
    expect(res.body.passwordHash).toBeUndefined();
  });

  it("בלי Token - 401", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("Token לא תקין - 401", async () => {
    const res = await request(app).get("/api/auth/me").set(auth("not-a-real-token"));
    expect(res.status).toBe(401);
  });

  it("Token שנחתם במפתח אחר - 401", async () => {
    const forged = jwt.sign({ role: "ADMIN" }, "some-other-secret-of-sufficient-length!!", { subject: String(f.admin.id) });
    const res = await request(app).get("/api/auth/me").set(auth(forged));
    expect(res.status).toBe(401);
  });

  it("Token שפג תוקפו - 401 עם הודעה מתאימה", async () => {
    const expired = jwt.sign({ role: "TEACHER" }, process.env.JWT_SECRET!, {
      subject: String(f.teacher1.id),
      expiresIn: -10,
    });
    const res = await request(app).get("/api/auth/me").set(auth(expired));
    expect(res.status).toBe(401);
    expect(res.body.error.message).toContain("פג תוקף");
  });

  it("כותרת Authorization בלי המילה Bearer - 401", async () => {
    const res = await request(app).get("/api/auth/me").set("Authorization", f.tokens.admin);
    expect(res.status).toBe(401);
  });
});
