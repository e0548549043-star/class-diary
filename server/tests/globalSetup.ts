// לפני כל הבדיקות: מעדכן את מבנה מסד נתוני הבדיקות לפי המיגרציות
import { execSync } from "node:child_process";

export default function setup() {
  if (process.env.SKIP_TEST_MIGRATE === "1") return;
  const url =
    process.env.TEST_DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/class_diary_test?schema=public";
  execSync("npx prisma migrate deploy", { stdio: "inherit", env: { ...process.env, DATABASE_URL: url } });
}
