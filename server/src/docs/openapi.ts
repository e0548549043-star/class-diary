// מסמך OpenAPI 3 - מקור התיעוד של Swagger (/api-docs) ושל הקובץ docs/openapi.json

const errorResponse = (description: string, code: string, message: string) => ({
  description,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Error" },
      example: { error: { code, message } },
    },
  },
});

const r400 = {
  description: "נתונים לא תקינים",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Error" },
      example: {
        error: {
          code: "VALIDATION_ERROR",
          message: "הנתונים שנשלחו אינם תקינים",
          details: [{ field: "topic", message: "יש לכתוב מה נלמד בשיעור" }],
        },
      },
    },
  },
};
const r401 = errorResponse("לא מחובר / Token חסר, לא תקין או שפג תוקפו", "UNAUTHORIZED", "נדרשת התחברות: חסר Bearer Token בכותרת Authorization");
const r403 = errorResponse("אין הרשאה לפעולה", "FORBIDDEN", "פעולה זו מותרת רק ל: מנהל");
const r404 = (what: string) => errorResponse(`${what} לא נמצא`, "NOT_FOUND", `${what} לא נמצא`);

const bearer = [{ bearerAuth: [] }];

const idPath = (name: string, description: string) => ({
  name,
  in: "path",
  required: true,
  description,
  schema: { type: "integer", minimum: 1 },
});

const pageParams = [
  { name: "page", in: "query", description: "מספר עמוד (מתחיל ב־1)", schema: { type: "integer", minimum: 1, default: 1 } },
  {
    name: "pageSize",
    in: "query",
    description: "כמה פריטים בעמוד (עד 100)",
    schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
  },
];

const json = (schema: object, example?: unknown) => ({
  "application/json": { schema, ...(example !== undefined ? { example } : {}) },
});

const exampleLesson = {
  id: 812,
  date: "2026-10-14",
  lessonNumber: 2,
  topic: "שברים פשוטים - חיבור וחיסור",
  class: { id: 5, name: "ט'1" },
  subject: { id: 7, name: "מתמטיקה" },
  teacher: { id: 3, firstName: "רבקה", lastName: "פרידמן" },
  attendanceSummary: { present: 1, late: 1, absent: 1 },
  attendance: [
    { studentId: 41, firstName: "שרה", lastName: "אברהמי", status: "PRESENT" },
    { studentId: 42, firstName: "מרים", lastName: "ברגר", status: "LATE" },
    { studentId: 43, firstName: "חנה", lastName: "גולד", status: "ABSENT" },
  ],
};

const exampleLessonBody = {
  subjectId: 7,
  lessonNumber: 2,
  topic: "שברים פשוטים - חיבור וחיסור",
  attendance: [
    { studentId: 41, status: "PRESENT" },
    { studentId: 42, status: "LATE" },
    { studentId: 43, status: "ABSENT" },
  ],
};

const exampleStats = {
  schoolYearStart: "2026-09-01",
  totalLessons: 120,
  present: 110,
  late: 4,
  absent: 6,
  attendancePercent: 93.3,
};

const exampleTeacher = {
  id: 3,
  idNumber: "200000008",
  firstName: "רבקה",
  lastName: "פרידמן",
  role: "TEACHER",
  class: null,
};

const exampleStudent = {
  id: 41,
  idNumber: "300000017",
  firstName: "שרה",
  lastName: "אברהמי",
  role: "STUDENT",
  class: { id: 5, name: "ט'1" },
};

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "יומן כיתה - API",
    version: "1.0.0",
    description: [
      "שרת ה־Backend של מערכת **יומן כיתה**: מורים מתעדים שיעורים ונוכחות; המנהל צופה ביומני הכיתות, ברשימות התלמידים והמורים, ומאפס סיסמאות.",
      "",
      "**איך מתחברים מתוך Swagger:**",
      "1. פתחי את `POST /api/auth/login`, לחצי **Try it out**, הזיני ת.ז וסיסמה ולחצי **Execute**.",
      "2. העתיקי את הערך של `token` מהתשובה.",
      "3. לחצי על הכפתור **Authorize** (למעלה מימין), הדביקי את ה־Token (בלי המילה Bearer) ולחצי **Authorize**.",
      "4. מעכשיו כל הקריאות נשלחות עם ה־Token.",
      "",
      "**קודי שגיאה:** 400 נתונים לא תקינים · 401 לא מחובר · 403 אין הרשאה · 404 לא נמצא · 409 כפילות · 429 יותר מדי ניסיונות התחברות · 500 שגיאת שרת.",
    ].join("\n"),
  },
  servers: [{ url: "/", description: "השרת הנוכחי" }],
  tags: [
    { name: "כללי", description: "בדיקת תקינות השרת" },
    { name: "התחברות", description: "התחברות וזיהוי המשתמש המחובר" },
    { name: "כיתות ומקצועות", description: "נתוני בסיס" },
    { name: "שיעורים", description: "פתיחה, צפייה ועריכה של שיעורים ונוכחות" },
    { name: "ניהול משתמשים", description: "מנהל בלבד" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "ה־Token שמתקבל מ־POST /api/auth/login",
      },
    },
    schemas: {
      Error: {
        type: "object",
        required: ["error"],
        properties: {
          error: {
            type: "object",
            required: ["code", "message"],
            properties: {
              code: {
                type: "string",
                enum: ["VALIDATION_ERROR", "UNAUTHORIZED", "FORBIDDEN", "NOT_FOUND", "CONFLICT", "TOO_MANY_REQUESTS", "INTERNAL_ERROR"],
              },
              message: { type: "string", description: "הודעה בעברית שאפשר להציג למשתמש" },
              details: {
                type: "array",
                description: "פירוט שגיאות לפי שדה (רק בשגיאות ולידציה)",
                items: {
                  type: "object",
                  properties: { field: { type: "string" }, message: { type: "string" } },
                },
              },
            },
          },
        },
      },
      Role: { type: "string", enum: ["ADMIN", "TEACHER", "STUDENT"], description: "ADMIN=מנהל, TEACHER=מורה, STUDENT=תלמיד" },
      AttendanceStatus: { type: "string", enum: ["PRESENT", "LATE", "ABSENT"], description: "PRESENT=נכח, LATE=איחר, ABSENT=חסר" },
      ClassRef: {
        type: "object",
        properties: { id: { type: "integer" }, name: { type: "string" } },
      },
      PersonRef: {
        type: "object",
        properties: { id: { type: "integer" }, firstName: { type: "string" }, lastName: { type: "string" } },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          idNumber: { type: "string", example: "300000017" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          role: { $ref: "#/components/schemas/Role" },
          class: { allOf: [{ $ref: "#/components/schemas/ClassRef" }], nullable: true, description: "כיתה - רק לתלמיד" },
        },
      },
      StudentStats: {
        type: "object",
        description: "אחוז נוכחות = (נכח + חצי מהאיחורים) ÷ כל השיעורים. null = אין עדיין נתונים.",
        properties: {
          schoolYearStart: { type: "string", format: "date" },
          totalLessons: { type: "integer" },
          present: { type: "integer" },
          late: { type: "integer" },
          absent: { type: "integer" },
          attendancePercent: { type: "number", nullable: true },
        },
      },
      UserWithStats: {
        allOf: [
          { $ref: "#/components/schemas/User" },
          {
            type: "object",
            properties: {
              stats: { allOf: [{ $ref: "#/components/schemas/StudentStats" }], nullable: true, description: "רק לתלמיד; למורה ולמנהל null" },
            },
          },
        ],
      },
      SchoolClass: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string", example: "ט'1" },
          gradeLevel: { type: "integer", example: 9 },
          studentCount: { type: "integer", example: 24 },
        },
      },
      Subject: {
        type: "object",
        properties: { id: { type: "integer" }, name: { type: "string", example: "מתמטיקה" } },
      },
      ClassStudent: {
        type: "object",
        properties: {
          id: { type: "integer" },
          idNumber: { type: "string" },
          firstName: { type: "string" },
          lastName: { type: "string" },
        },
      },
      AttendanceRow: {
        type: "object",
        properties: {
          studentId: { type: "integer" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          status: { $ref: "#/components/schemas/AttendanceStatus" },
        },
      },
      Lesson: {
        type: "object",
        properties: {
          id: { type: "integer" },
          date: { type: "string", format: "date" },
          lessonNumber: { type: "integer", minimum: 1, maximum: 10 },
          topic: { type: "string", description: "מה נלמד" },
          class: { $ref: "#/components/schemas/ClassRef" },
          subject: { $ref: "#/components/schemas/ClassRef" },
          teacher: { $ref: "#/components/schemas/PersonRef" },
          attendanceSummary: {
            type: "object",
            properties: { present: { type: "integer" }, late: { type: "integer" }, absent: { type: "integer" } },
          },
          attendance: { type: "array", items: { $ref: "#/components/schemas/AttendanceRow" } },
        },
      },
      AttendanceInput: {
        type: "object",
        required: ["studentId", "status"],
        properties: {
          studentId: { type: "integer" },
          status: { $ref: "#/components/schemas/AttendanceStatus" },
        },
      },
      LessonUpdateInput: {
        type: "object",
        required: ["subjectId", "lessonNumber", "topic", "attendance"],
        properties: {
          subjectId: { type: "integer" },
          lessonNumber: { type: "integer", minimum: 1, maximum: 10 },
          topic: { type: "string", minLength: 1, maxLength: 1000 },
          attendance: {
            type: "array",
            minItems: 1,
            description: "שורה לכל תלמיד - בדיוק פעם אחת לכל תלמיד",
            items: { $ref: "#/components/schemas/AttendanceInput" },
          },
        },
      },
      LessonCreateInput: {
        allOf: [
          { type: "object", required: ["classId"], properties: { classId: { type: "integer" } } },
          { $ref: "#/components/schemas/LessonUpdateInput" },
        ],
      },
      LessonPage: {
        type: "object",
        properties: {
          items: { type: "array", items: { $ref: "#/components/schemas/Lesson" } },
          page: { type: "integer" },
          pageSize: { type: "integer" },
          total: { type: "integer" },
          totalPages: { type: "integer" },
        },
      },
      UserPage: {
        type: "object",
        properties: {
          items: { type: "array", items: { $ref: "#/components/schemas/UserWithStats" } },
          page: { type: "integer" },
          pageSize: { type: "integer" },
          total: { type: "integer" },
          totalPages: { type: "integer" },
        },
      },
    },
  },
  paths: {
    "/api/health": {
      get: {
        tags: ["כללי"],
        summary: "בדיקת בריאות השרת",
        description: "ציבורי. בודק שהשרת פועל ושמסד הנתונים מגיב.",
        responses: {
          200: {
            description: "השרת ומסד הנתונים תקינים",
            content: json(
              {
                type: "object",
                properties: {
                  status: { type: "string", enum: ["ok", "error"] },
                  database: { type: "string", enum: ["ok", "error"] },
                  time: { type: "string", format: "date-time" },
                },
              },
              { status: "ok", database: "ok", time: "2026-10-14T18:00:00.000Z" },
            ),
          },
          503: { description: "אין חיבור למסד הנתונים" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["התחברות"],
        summary: "התחברות",
        description: "ציבורי. מחזיר JWT לשימוש בכותרת `Authorization: Bearer <token>`. מוגבל ל־20 ניסיונות ב־15 דקות לכל כתובת.",
        requestBody: {
          required: true,
          content: json(
            {
              type: "object",
              required: ["idNumber", "password"],
              properties: { idNumber: { type: "string", example: "100000009" }, password: { type: "string", example: "Demo1234!" } },
            },
            { idNumber: "100000009", password: "Demo1234!" },
          ),
        },
        responses: {
          200: {
            description: "התחברות הצליחה",
            content: json(
              {
                type: "object",
                properties: {
                  token: { type: "string" },
                  tokenType: { type: "string", example: "Bearer" },
                  expiresIn: { type: "string", example: "8h" },
                  user: { $ref: "#/components/schemas/User" },
                },
              },
              {
                token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                tokenType: "Bearer",
                expiresIn: "8h",
                user: { id: 1, idNumber: "100000009", firstName: "אסתר", lastName: "לוי", role: "ADMIN", class: null },
              },
            ),
          },
          400: r400,
          401: errorResponse("ת.ז או סיסמה שגויים", "UNAUTHORIZED", "תעודת זהות או סיסמה שגויים"),
          429: errorResponse("יותר מדי ניסיונות", "TOO_MANY_REQUESTS", "יותר מדי ניסיונות התחברות. נסי שוב בעוד כמה דקות"),
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["התחברות"],
        summary: "פרטי המשתמש המחובר",
        description: "כל משתמש מחובר.",
        security: bearer,
        responses: {
          200: { description: "המשתמש המחובר", content: json({ $ref: "#/components/schemas/User" }, exampleTeacher) },
          401: r401,
        },
      },
    },
    "/api/classes": {
      get: {
        tags: ["כיתות ומקצועות"],
        summary: "רשימת כל הכיתות",
        description: "מנהל ומורה. ממוין לפי שכבה ושם.",
        security: bearer,
        responses: {
          200: {
            description: "רשימת כיתות",
            content: json({ type: "array", items: { $ref: "#/components/schemas/SchoolClass" } }, [
              { id: 1, name: "ז'1", gradeLevel: 7, studentCount: 23 },
              { id: 2, name: "ז'2", gradeLevel: 7, studentCount: 22 },
            ]),
          },
          401: r401,
          403: r403,
        },
      },
    },
    "/api/classes/{classId}/students": {
      get: {
        tags: ["כיתות ומקצועות"],
        summary: "תלמידי כיתה",
        description: "מנהל ומורה. ממוין לפי שם משפחה. משמש לטבלת הנוכחות בפתיחת שיעור.",
        security: bearer,
        parameters: [idPath("classId", "מזהה הכיתה")],
        responses: {
          200: {
            description: "רשימת תלמידים",
            content: json({ type: "array", items: { $ref: "#/components/schemas/ClassStudent" } }, [
              { id: 41, idNumber: "300000017", firstName: "שרה", lastName: "אברהמי" },
            ]),
          },
          400: r400,
          401: r401,
          403: r403,
          404: r404("הכיתה"),
        },
      },
    },
    "/api/classes/{classId}/lessons": {
      get: {
        tags: ["שיעורים"],
        summary: "שיעורי כיתה (יומן הכיתה)",
        description:
          "מנהל: כל השיעורים בכיתה. מורה: רק השיעורים שהוא לימד בכיתה. ממוין מהתאריך החדש לישן, ובתוך יום לפי מספר שיעור. אפשר לסנן לפי מקצוע.",
        security: bearer,
        parameters: [
          idPath("classId", "מזהה הכיתה"),
          { name: "subjectId", in: "query", description: "סינון לפי מקצוע", schema: { type: "integer", minimum: 1 } },
          ...pageParams,
        ],
        responses: {
          200: {
            description: "עמוד של שיעורים",
            content: json({ $ref: "#/components/schemas/LessonPage" }, { items: [exampleLesson], page: 1, pageSize: 20, total: 1, totalPages: 1 }),
          },
          400: r400,
          401: r401,
          403: r403,
          404: r404("הכיתה"),
        },
      },
    },
    "/api/subjects": {
      get: {
        tags: ["כיתות ומקצועות"],
        summary: "רשימת מקצועות",
        description: "כל משתמש מחובר.",
        security: bearer,
        responses: {
          200: {
            description: "רשימת מקצועות",
            content: json({ type: "array", items: { $ref: "#/components/schemas/Subject" } }, [
              { id: 1, name: "אנגלית" },
              { id: 7, name: "מתמטיקה" },
            ]),
          },
          401: r401,
        },
      },
    },
    "/api/lessons": {
      post: {
        tags: ["שיעורים"],
        summary: "פתיחת שיעור להיום",
        description: [
          "מורה בלבד. התאריך נקבע אוטומטית להיום (שעון ישראל), והמורה נקבע לפי ה־Token.",
          "",
          "- `attendance` חייב לכלול כל תלמיד בכיתה בדיוק פעם אחת.",
          "- אם מספר השיעור כבר קיים היום בכיתה - 409.",
        ].join("\n"),
        security: bearer,
        requestBody: {
          required: true,
          content: json({ $ref: "#/components/schemas/LessonCreateInput" }, { classId: 5, ...exampleLessonBody }),
        },
        responses: {
          201: { description: "השיעור נוצר", content: json({ $ref: "#/components/schemas/Lesson" }, exampleLesson) },
          400: r400,
          401: r401,
          403: errorResponse("רק מורה יכול לפתוח שיעור", "FORBIDDEN", "פעולה זו מותרת רק ל: מורה"),
          409: errorResponse("מספר השיעור תפוס", "CONFLICT", "שיעור מספר 2 כבר קיים בכיתה הזו בתאריך 2026-10-14"),
        },
      },
    },
    "/api/lessons/{id}": {
      get: {
        tags: ["שיעורים"],
        summary: "שיעור בודד",
        description: "מנהל: כל שיעור. מורה: רק שיעור שהוא לימד (אחרת 403).",
        security: bearer,
        parameters: [idPath("id", "מזהה השיעור")],
        responses: {
          200: { description: "השיעור", content: json({ $ref: "#/components/schemas/Lesson" }, exampleLesson) },
          400: r400,
          401: r401,
          403: r403,
          404: r404("השיעור"),
        },
      },
      put: {
        tags: ["שיעורים"],
        summary: "עריכת שיעור",
        description:
          "מורה בלבד, ורק שיעור שהוא לימד (אחרת 403). אי אפשר לשנות כיתה או תאריך. `attendance` חייב לכלול בדיוק את התלמידים שהיו בשיעור.",
        security: bearer,
        parameters: [idPath("id", "מזהה השיעור")],
        requestBody: { required: true, content: json({ $ref: "#/components/schemas/LessonUpdateInput" }, exampleLessonBody) },
        responses: {
          200: { description: "השיעור אחרי העדכון", content: json({ $ref: "#/components/schemas/Lesson" }, exampleLesson) },
          400: r400,
          401: r401,
          403: errorResponse("השיעור של מורה אחר", "FORBIDDEN", "אפשר לערוך רק שיעורים שלימדת בעצמך"),
          404: r404("השיעור"),
          409: errorResponse("מספר השיעור תפוס", "CONFLICT", "שיעור מספר 3 כבר קיים בכיתה הזו בתאריך 2026-10-14"),
        },
      },
    },
    "/api/users": {
      get: {
        tags: ["ניהול משתמשים"],
        summary: "רשימת משתמשים",
        description: "מנהל בלבד. חיפוש לפי שם או תחילת ת.ז, סינון לפי תפקיד וכיתה. לכל תלמיד מוחזר גם אחוז הנוכחות (`stats`).",
        security: bearer,
        parameters: [
          { name: "role", in: "query", description: "סינון לפי תפקיד", schema: { $ref: "#/components/schemas/Role" } },
          { name: "classId", in: "query", description: "סינון לפי כיתה", schema: { type: "integer", minimum: 1 } },
          { name: "search", in: "query", description: "חיפוש לפי שם פרטי, שם משפחה או תחילת ת.ז", schema: { type: "string", maxLength: 100 } },
          ...pageParams,
        ],
        responses: {
          200: {
            description: "עמוד של משתמשים",
            content: json(
              { $ref: "#/components/schemas/UserPage" },
              { items: [{ ...exampleStudent, stats: exampleStats }], page: 1, pageSize: 20, total: 1, totalPages: 1 },
            ),
          },
          400: r400,
          401: r401,
          403: r403,
        },
      },
    },
    "/api/users/{id}": {
      get: {
        tags: ["ניהול משתמשים"],
        summary: "משתמש בודד",
        description: "מנהל בלבד. לתלמיד כולל `stats`.",
        security: bearer,
        parameters: [idPath("id", "מזהה המשתמש")],
        responses: {
          200: { description: "המשתמש", content: json({ $ref: "#/components/schemas/UserWithStats" }, { ...exampleStudent, stats: exampleStats }) },
          400: r400,
          401: r401,
          403: r403,
          404: r404("המשתמש"),
        },
      },
    },
    "/api/users/{id}/password": {
      patch: {
        tags: ["ניהול משתמשים"],
        summary: "איפוס סיסמה",
        description: "מנהל בלבד. המנהל קובע סיסמה חדשה שמחליפה את הקודמת.",
        security: bearer,
        parameters: [idPath("id", "מזהה המשתמש")],
        requestBody: {
          required: true,
          content: json(
            { type: "object", required: ["password"], properties: { password: { type: "string", minLength: 6, maxLength: 72 } } },
            { password: "NewPass123" },
          ),
        },
        responses: {
          200: {
            description: "הסיסמה הוחלפה",
            content: json({ type: "object", properties: { message: { type: "string" } } }, { message: "הסיסמה אופסה בהצלחה" }),
          },
          400: r400,
          401: r401,
          403: r403,
          404: r404("המשתמש"),
        },
      },
    },
  },
} as const;
