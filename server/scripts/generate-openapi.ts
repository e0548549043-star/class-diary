// יוצר את הקובץ docs/openapi.json מתוך src/docs/openapi.ts
// הרצה: npm run docs:generate
import { writeFileSync } from "node:fs";
import { openApiDocument } from "../src/docs/openapi.js";

writeFileSync("docs/openapi.json", `${JSON.stringify(openApiDocument, null, 2)}\n`, "utf8");
console.log("✅ docs/openapi.json עודכן");
