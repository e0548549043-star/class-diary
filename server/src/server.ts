// נקודת הכניסה: מפעיל את השרת על הפורט שהוגדר (בענן - הפורט שהשירות מספק)
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./db/prisma.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`✅ השרת פועל על פורט ${env.PORT}`);
  console.log(`   בדיקת בריאות: http://localhost:${env.PORT}/api/health`);
  console.log(`   תיעוד Swagger: http://localhost:${env.PORT}/api-docs`);
});

// סגירה מסודרת כששירות הענן מכבה את השרת
async function shutdown(signal: string) {
  console.log(`התקבל ${signal}, סוגר את השרת...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
