# יומן כיתה – שרת Backend

שרת API למערכת **יומן כיתה**: מורים מתעדים שיעורים ונוכחות; המנהל צופה ביומן של כל כיתה, ברשימות התלמידים (עם אחוז נוכחות) והמורים, ומאפס סיסמאות.

> 👋 **פעם ראשונה כאן?** התחילי מהקובץ [`START-HERE.md`](START-HERE.md) – הוראות צעד אחר צעד להעלאת השרת לאינטרנט.
> 📘 **כותבת את צד ה־React?** כל מה שצריך נמצא ב־[`FRONTEND-API-GUIDE.md`](FRONTEND-API-GUIDE.md).

---

## טכנולוגיות

| תחום | טכנולוגיה |
|---|---|
| שפה וסביבת ריצה | Node.js 22, TypeScript (strict) |
| שרת | Express 4 |
| מסד נתונים | PostgreSQL + Prisma ORM 7 (עם `@prisma/adapter-pg`) |
| ולידציה | Zod |
| התחברות | JWT (jsonwebtoken) + bcrypt לסיסמאות |
| תיעוד | Swagger UI / OpenAPI 3 |
| בדיקות | Vitest + Supertest |

## מבנה התיקיות

```
backend-project/
├── src/
│   ├── server.ts              # נקודת הכניסה - מפעיל את השרת
│   ├── app.ts                 # בניית Express: אבטחה, CORS, נתיבים, Swagger
│   ├── config/env.ts          # קריאה ובדיקה של משתני סביבה
│   ├── db/prisma.ts           # החיבור למסד הנתונים
│   ├── middleware/
│   │   ├── authenticate.ts    # אימות: בדיקת Token וזיהוי המשתמש
│   │   ├── authorize.ts       # הרשאות לפי תפקיד (403)
│   │   └── errorHandler.ts    # טיפול מרכזי בשגיאות
│   ├── modules/               # כל תחום בתיקייה משלו
│   │   ├── auth/              # התחברות
│   │   ├── classes/           # כיתות ותלמידי כיתה
│   │   ├── subjects/          # מקצועות
│   │   ├── lessons/           # שיעורים ונוכחות (האובייקט המרכזי)
│   │   ├── users/             # רשימת משתמשים ואיפוס סיסמה (מנהל)
│   │   └── stats/             # חישוב אחוז נוכחות
│   │       # בכל מודול: *.routes.ts → *.controller.ts → *.service.ts (+ *.schemas.ts)
│   ├── docs/openapi.ts        # תיעוד Swagger
│   └── utils/                 # כלי עזר: שגיאות, תאריכים, ולידציה, סיסמאות
├── prisma/
│   ├── schema.prisma          # מבנה הטבלאות
│   ├── migrations/            # מיגרציות (יצירת הטבלאות במסד)
│   ├── seed.ts                # יצירת נתוני הדגמה
│   └── seed-data.ts           # שמות, מקצועות, נושאי שיעורים
├── tests/                     # בדיקות אוטומטיות
├── docs/
│   ├── SPEC.md                # האפיון שאושר
│   └── openapi.json           # קובץ OpenAPI
├── prisma.config.ts           # הגדרות Prisma
├── render.yaml                # הגדרות פריסה ל־Render
├── START-HERE.md              # מדריך העלאה לאינטרנט
└── FRONTEND-API-GUIDE.md      # מדריך API לכתיבת ה־React
```

## הפעלה על המחשב (לא חובה)

אין חובה להריץ את השרת על המחשב – אפשר להעלות אותו ישר לענן לפי `START-HERE.md`. אם בכל זאת רוצים להריץ מקומית:

1. להתקין [Node.js](https://nodejs.org) בגרסה 22 (LTS).
2. ליצור מסד נתונים PostgreSQL. הכי פשוט: ליצור מסד חינמי ב־Neon (ראו `START-HERE.md`, חלק ב) ולהשתמש בכתובת שלו.
3. בתיקיית הפרויקט:
   ```bash
   npm install
   cp .env.example .env        # ואז לערוך את .env ולהדביק את DATABASE_URL
   npm run db:migrate          # יצירת הטבלאות
   npm run db:seed             # מילוי נתוני הדגמה
   npm run dev                 # הפעלת השרת
   ```
4. לפתוח בדפדפן: http://localhost:3000/api-docs

## פקודות

| פקודה | מה היא עושה |
|---|---|
| `npm run dev` | הפעלת השרת במצב פיתוח (מתעדכן אוטומטית בשמירה) |
| `npm run build` | יצירת Prisma Client וקומפילציה ל־JavaScript (לתיקייה `dist`) |
| `npm start` | הפעלת השרת מהקוד המקומפל |
| `npm run start:prod` | מה ש־Render מריץ: מיגרציות → נתוני הדגמה (רק אם המסד ריק) → הפעלת השרת |
| `npm run typecheck` | בדיקת טיפוסים של TypeScript |
| `npm test` | הרצת הבדיקות האוטומטיות (דורש `TEST_DATABASE_URL` נפרד!) |
| `npm run db:migrate` | החלת המיגרציות על מסד הנתונים |
| `npm run db:seed` | נתוני הדגמה (רק אם המסד ריק). `npm run db:seed -- --reset` מוחק ומתחיל מחדש |
| `npm run docs:generate` | עדכון `docs/openapi.json` |

## חשבונות הדגמה

ה־Seed יוצר בית ספר מומצא: 8 כיתות (ז'1 עד י'2), כ־190 תלמידות, 15 מורות, 12 מקצועות, מערכת שעות קבועה, ושיעורים עם נוכחות מ־1 בספטמבר ועד היום. ביום הנוכחי מתועדים רק שיעורים 1-2, כדי שאפשר יהיה להדגים פתיחת שיעור חדש.

הסיסמה של כל החשבונות היא הערך של `SEED_PASSWORD`.

| תפקיד | ת.ז | פרטים |
|---|---|---|
| מנהל | `100000009` | אסתר לוי |
| מורה | `200000008` | רבקה פרידמן – מלמדת מתמטיקה |

שאר המורות: ת.ז מתחילה ב־`2` (אפשר למצוא אותן ב־`GET /api/users` עם חשבון המנהל).

## משתני סביבה

| משתנה | חובה | הסבר |
|---|:-:|---|
| `DATABASE_URL` | ✅ | כתובת החיבור ל־PostgreSQL |
| `JWT_SECRET` | ✅ | מפתח סודי לחתימת Token, לפחות 32 תווים |
| `JWT_EXPIRES_IN` | | תוקף Token (ברירת מחדל `8h`) |
| `PORT` | | פורט (בענן נקבע אוטומטית; ברירת מחדל 3000) |
| `CORS_ORIGIN` | | כתובות מורשות מופרדות בפסיק, או `*` (ברירת מחדל `*`) |
| `SEED_PASSWORD` | | סיסמת חשבונות ההדגמה. בלעדיו לא נוצרים נתוני הדגמה בענן |
| `SCHOOL_TIMEZONE` | | ברירת מחדל `Asia/Jerusalem` |
| `LOGIN_RATE_LIMIT` | | ניסיונות התחברות ל־15 דקות לכל IP (ברירת מחדל 20) |
| `TEST_DATABASE_URL` | לבדיקות | מסד נפרד לבדיקות – **הבדיקות מוחקות בו את כל הנתונים** |

## אבטחה – מה מומש

- סיסמאות נשמרות כ־Hash של bcrypt בלבד, ולא מוחזרות אף פעם ב־API.
- כל Endpoint חוץ מ־`/api/health` ו־`/api/auth/login` דורש `Authorization: Bearer <token>`.
- בלי Token תקין → 401. בלי הרשאה → 403.
- המשתמש והתפקיד נקבעים לפי ה־Token ולפי מסד הנתונים – לא לפי מה שהלקוח שולח.
- מורה רואה ועורך רק שיעורים שלימד.
- הגבלת ניסיונות התחברות, Helmet, CORS ניתן להגדרה, הגבלת גודל בקשה.

## הערה טכנית

הפרויקט משתמש ב־Prisma 7, שבו כתובת מסד הנתונים מוגדרת ב־`prisma.config.ts` (ולא ב־`schema.prisma`), והחיבור בזמן ריצה נעשה דרך `@prisma/adapter-pg`. ה־Prisma Client נוצר לתיקייה `src/generated/prisma` (לא נשמרת ב־Git; נוצרת אוטומטית ב־`npm install` וב־`npm run build`).
