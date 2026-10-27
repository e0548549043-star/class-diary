// בניית אפליקציית Express: אבטחה, CORS, נתיבים, Swagger וטיפול בשגיאות
import cors from "cors";
import express from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { corsOrigins } from "./config/env.js";
import { prisma } from "./db/prisma.js";
import { openApiDocument } from "./docs/openapi.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { classesRouter } from "./modules/classes/classes.routes.js";
import { lessonsRouter } from "./modules/lessons/lessons.routes.js";
import { subjectsRouter } from "./modules/subjects/subjects.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";
import { asyncHandler } from "./utils/asyncHandler.js";

export function createApp() {
  const app = express();

  // שרתי ענן (כמו Render) יושבים מאחורי Proxy - נדרש לזיהוי IP נכון בהגבלת ניסיונות התחברות
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  // Swagger UI משתמש בסקריפטים משלו, לכן מבטלים CSP (זה שרת API, לא אתר)
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(
    cors({
      origin: corsOrigins === "*" ? true : corsOrigins,
      methods: ["GET", "POST", "PUT", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
  app.use(express.json({ limit: "200kb" }));

  // בדיקת בריאות - גם בודקת שמסד הנתונים מגיב
  app.get(
    "/api/health",
    asyncHandler(async (_req, res) => {
      let database: "ok" | "error" = "ok";
      try {
        await prisma.$queryRaw`SELECT 1`;
      } catch {
        database = "error";
      }
      res.status(database === "ok" ? 200 : 503).json({
        status: database === "ok" ? "ok" : "error",
        database,
        time: new Date().toISOString(),
      });
    }),
  );

  // תיעוד API
  app.get("/api-docs.json", (_req, res) => {
    res.json(openApiDocument);
  });
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, {
      customSiteTitle: "יומן כיתה - תיעוד API",
      swaggerOptions: { persistAuthorization: true },
    }),
  );
  app.get("/", (_req, res) => {
    res.redirect("/api-docs");
  });

  app.use("/api/auth", authRouter);
  app.use("/api/classes", classesRouter);
  app.use("/api/subjects", subjectsRouter);
  app.use("/api/lessons", lessonsRouter);
  app.use("/api/users", usersRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
