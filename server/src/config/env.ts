// קריאה ובדיקה של משתני הסביבה. אם משהו חסר - השרת לא יעלה ויסביר מה חסר.
import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL חסר - כתובת החיבור למסד הנתונים"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET חייב להכיל לפחות 32 תווים"),
  JWT_EXPIRES_IN: z.string().default("8h"),
  // כתובות מורשות ל־CORS, מופרדות בפסיק. "*" = כל כתובת
  CORS_ORIGIN: z.string().default("*"),
  // אזור הזמן של בית הספר - קובע מה נחשב "היום"
  SCHOOL_TIMEZONE: z.string().default("Asia/Jerusalem"),
  // מספר ניסיונות התחברות מותרים לכל כתובת IP בחלון של 15 דקות
  LOGIN_RATE_LIMIT: z.coerce.number().int().positive().default(20),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const problems = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
  console.error(`❌ הגדרות סביבה שגויות:\n${problems}\nבדקי את קובץ .env או את משתני הסביבה בשירות הענן.`);
  process.exit(1);
}

export const env = parsed.data;

export const corsOrigins: string[] | "*" =
  env.CORS_ORIGIN.trim() === "*"
    ? "*"
    : env.CORS_ORIGIN.split(",")
        .map((o) => o.trim().replace(/\/$/, ""))
        .filter(Boolean);
