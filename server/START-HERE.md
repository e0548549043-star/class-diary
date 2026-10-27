# 🚀 מתחילים כאן – העלאת השרת לאינטרנט

המדריך הזה מסביר, צעד אחר צעד, איך להעלות את השרת לאינטרנט – גם אם מעולם לא עשית את זה.

**מה נעשה:**

1. **GitHub** – נשמור שם את קבצי הפרויקט.
2. **Neon** – ניצור שם את מסד הנתונים (PostgreSQL) בחינם.
3. **Render** – נפעיל שם את השרת בחינם. Render ייקח את הקבצים מ־GitHub ויתחבר למסד הנתונים ב־Neon.

```
GitHub (הקבצים)  ──►  Render (השרת)  ──►  Neon (מסד הנתונים)
```

⏱️ זמן משוער: 30-45 דקות. לא צריך כרטיס אשראי.

> ⚠️ **הערה חשובה:** האתרים GitHub, Neon ו־Render משנים מדי פעם את העיצוב ואת שמות הכפתורים. כתבתי את שמות הכפתורים כפי שהם מוכרים לי, אבל לא יכולתי לבדוק את המסכים העדכניים בעצמי. אם כפתור נראה קצת אחרת – חפשי כפתור עם משמעות דומה. **הערכים שצריך להקליד** (פקודות, שמות משתנים) הם מדויקים ונבדקו.

> 💡 כל האתרים באנגלית. אם צריך, אפשר להפעיל תרגום אוטומטי בדפדפן – אבל את הערכים עצמם תמיד מקלידים בדיוק כפי שכתוב כאן.

---

## חלק א – GitHub: העלאת הקבצים

### 1. פתיחת חשבון
1. היכנסי ל־https://github.com ולחצי **Sign up**.
2. הזיני אימייל, סיסמה ושם משתמש, ואשרי את האימייל לפי ההוראות שיישלחו אלייך.

### 2. יצירת Repository (מאגר)
1. אחרי ההתחברות, לחצי על **+** בפינה העליונה ← **New repository**.
2. **Repository name:** `class-diary-backend`
3. בחרי **Private** (פרטי) – כך רק את רואה את הקוד. (גם Public עובד, אין בפרויקט סודות.)
4. **אל תסמני** את האפשרויות להוספת README, ‏.gitignore או License – כבר יש לנו אותם.
5. לחצי **Create repository**.

### 3. חילוץ קובץ ה־ZIP
1. מצאי את קובץ ה־ZIP שהורדת.
2. **Windows:** לחיצה ימנית ← **Extract All** (חילוץ הכל) ← **Extract**.
   **Mac:** לחיצה כפולה על הקובץ.
3. תיווצר תיקייה בשם `backend-project`. בתוכה יש את הקבצים: `package.json`, ‏`src`, ‏`prisma` ועוד.

### 4. העלאת הקבצים דרך הדפדפן
1. בדף ה־Repository החדש, לחצי על הקישור **uploading an existing file** (מופיע במשפט "...or uploading an existing file").
2. פתחי את התיקייה `backend-project` במחשב, **סמני את כל מה שבתוכה** (Ctrl+A ב־Windows, ‏Cmd+A ב־Mac) וגררי אל אזור ההעלאה בדפדפן.
   - ⚠️ גוררים את **התוכן** של התיקייה, לא את התיקייה עצמה. הקובץ `package.json` חייב להיות בשורש ה־Repository.
   - ⚠️ **ב־Mac:** קבצים שמתחילים בנקודה (`.gitignore`, ‏`.env.example`, ‏`.node-version`) מוסתרים. לחצי **Cmd+Shift+.** (נקודה) בחלון ה־Finder כדי להציג אותם, ואז סמני הכל.
3. חכי שכל הקבצים יעלו (מופיעה רשימה).
4. למטה, בשדה **Commit changes**, אפשר להשאיר את ההודעה כמו שהיא, ולחצי **Commit changes**.

### 5. בדיקה שהקבצים הגיעו
בדף הראשי של ה־Repository צריך לראות:
- תיקיות: `docs`, ‏`prisma`, ‏`scripts`, ‏`src`, ‏`tests`
- קבצים: `package.json`, ‏`package-lock.json`, ‏`render.yaml`, ‏`README.md`, ‏`START-HERE.md`, ‏`.gitignore` ועוד.
- היכנסי לתיקייה `prisma` ← `migrations` – צריכה להיות שם תיקייה שמתחילה ב־`20261014`.

✅ אם `package.json` מופיע ישר בדף הראשי (ולא בתוך תיקייה `backend-project`) – הכל תקין.

> ❌ אם רואים רק תיקייה אחת בשם `backend-project` – גררת את התיקייה עצמה. הכי פשוט: למחוק את ה־Repository (Settings ← למטה **Delete this repository**) ולהתחיל את סעיף 2 מחדש.

---

## חלק ב – Neon: מסד הנתונים

> **למה לא מסד הנתונים של Render?** מסד הנתונים החינמי של Render נמחק אחרי 30 יום. המסלול החינמי של Neon קבוע ולא דורש כרטיס אשראי. (נכון לאוקטובר 2026. המסלולים החינמיים יכולים להשתנות.)

### 1. פתיחת חשבון
1. היכנסי ל־https://neon.com ולחצי **Sign up**.
2. הכי פשוט: **Continue with GitHub** (התחברות עם חשבון ה־GitHub שפתחת).

### 2. יצירת מסד נתונים
1. אם מופיע מסך יצירת פרויקט (או לחצי **New Project**):
   - **Project name:** `class-diary`
   - **Postgres version:** להשאיר את ברירת המחדל.
   - **Region:** לבחור אזור באירופה, למשל **AWS Europe Central 1 (Frankfurt)** – קרוב לישראל ולשרת ב־Render.
2. לחצי **Create project**.

### 3. קבלת כתובת החיבור (Connection String)
1. בדף הפרויקט לחצי על **Connect** (או **Connection Details**).
2. ודאי שנבחר:
   - **Branch:** `main` ‏ · **Database:** `neondb` ‏ · **Role:** `neondb_owner`
   - אפשרות **Connection pooling** – **כבויה**.
3. העתיקי את הכתובת. היא נראית בערך כך:
   ```
   postgresql://neondb_owner:AbC123xyz@ep-cool-name-123456.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
   (אם יש בכתובת גם `&channel_binding=require` – זה בסדר, אפשר להשאיר.)

### 4. שמירה בטוחה
- הכתובת מכילה **סיסמה**. אל תכתבי אותה בשום קובץ בפרויקט, אל תעלי אותה ל־GitHub ואל תשלחי אותה לאף אחד.
- שמרי אותה זמנית בפתק במחשב או במנהל סיסמאות. תצטרכי אותה בחלק ג.
- אם הכתובת נחשפה בטעות: ב־Neon אפשר לאפס את הסיסמה (בדף **Roles** ← **Reset password**) ולקבל כתובת חדשה.

### 5. קישור השרת למסד הנתונים
אין צורך ליצור טבלאות בעצמך! את הכתובת נכניס ל־Render בשם `DATABASE_URL` (חלק ג, סעיף 6), ובהפעלה הראשונה השרת:
1. ייצור את כל הטבלאות (Prisma Migrations),
2. ימלא את מסד הנתונים בנתוני בית הספר לדוגמה,
3. ויתחיל לפעול.

---

## חלק ג – Render: הפעלת השרת

### 1. פתיחת חשבון
1. היכנסי ל־https://render.com ולחצי **Get Started** (או **Sign Up**).
2. בחרי **GitHub** – כך החשבונות יחוברו אוטומטית.

### 2. חיבור GitHub
אם Render מבקש גישה ל־GitHub, אשרי (**Authorize**). כשתתבקשי לבחור לאילו מאגרים לתת גישה, אפשר לבחור **Only select repositories** ולסמן את `class-diary-backend`.

### 3. יצירת Web Service
בלוח הבקרה של Render לחצי **+ New** ← **Web Service**.

### 4. בחירת ה־Repository
ברשימת המאגרים בחרי `class-diary-backend` ולחצי **Connect**.
(אם הוא לא מופיע: **Configure account** / **Configure GitHub** ← לתת גישה למאגר.)

### 5. הגדרת Build ו־Start
מלאי בדיוק כך:

| שדה | ערך |
|---|---|
| **Name** | `class-diary-api` (השם יופיע בכתובת האתר) |
| **Language / Runtime** | `Node` |
| **Branch** | `main` |
| **Region** | `Frankfurt (EU Central)` |
| **Root Directory** | להשאיר ריק |
| **Build Command** | `npm ci --include=dev && npm run build` |
| **Start Command** | `npm run start:prod` |
| **Instance Type** | **Free** |

### 6. משתני סביבה (Environment Variables)
באזור **Environment Variables** לחצי **Add Environment Variable** לכל שורה:

| NAME | VALUE |
|---|---|
| `NODE_ENV` | `production` |
| `NODE_VERSION` | `22` |
| `DATABASE_URL` | הכתובת מ־Neon (חלק ב, סעיף 3) |
| `JWT_SECRET` | מחרוזת אקראית ארוכה – לחצי **Generate** אם יש כפתור כזה, או הקלידי לפחות 40 תווים אקראיים |
| `JWT_EXPIRES_IN` | `8h` |
| `CORS_ORIGIN` | `http://localhost:5173` (הכתובת של ה־React במחשב שלך) |
| `SEED_PASSWORD` | סיסמה שתבחרי לחשבונות ההדגמה, לפחות 8 תווים. למשל: `School2026!` |
| `SCHOOL_TIMEZONE` | `Asia/Jerusalem` |

> 🔐 `JWT_SECRET` ו־`SEED_PASSWORD` הם סודות – הם נשמרים רק ב־Render, לא ב־GitHub.
> 💡 כשתעלי בהמשך גם את ה־React לאינטרנט, הוסיפי את הכתובת שלו ל־`CORS_ORIGIN` עם פסיק: `http://localhost:5173,https://my-app.example.com`

### 7. Prisma Migrations
אין צורך לעשות כלום – פקודת ההפעלה `npm run start:prod` מריצה בעצמה, בכל הפעלה:
1. `prisma migrate deploy` – יוצרת או מעדכנת את הטבלאות;
2. מילוי נתוני הדגמה – **רק אם מסד הנתונים ריק** (אחרי הפעם הראשונה זה מדלג);
3. הפעלת השרת.

### 8. Deploy
1. אם יש אזור **Advanced**, פתחי אותו והזיני ב־**Health Check Path**: `/api/health`
2. לחצי **Deploy Web Service** (או **Create Web Service**).
3. יופיע מסך **Logs** עם הרבה טקסט. חכי כמה דקות (בפעם הראשונה 3-6 דקות).
4. כשמופיע **Your service is live** 🎉 – השרת עלה. ב־Logs תראי גם:
   ```
   ✅ נתוני ההדגמה נוצרו בהצלחה
   ✅ השרת פועל על פורט 10000
   ```

> 💡 **אפשרות חלופית:** בקובץ `render.yaml` יש את כל ההגדרות האלה. אפשר במקום סעיפים 3-6 ללחוץ **+ New** ← **Blueprint**, לבחור את ה־Repository, ולמלא רק את `DATABASE_URL`, ‏`CORS_ORIGIN` ו־`SEED_PASSWORD`.

### 9. בדיקה שהשרת פעיל
למעלה בדף השירות מופיעה הכתובת שלו, למשל:
```
https://class-diary-api.onrender.com
```
(אצלך ייתכן שיהיו בסוף אותיות נוספות.) זו **כתובת השרת** שלך. שמרי אותה.

> 😴 **חשוב לדעת:** בשרת החינמי, אם אין פניות 15 דקות – השרת "נרדם". הפנייה הבאה תיקח כדקה (הוא מתעורר), ואחרי זה הכל מהיר. זה תקין.

---

## חלק ד – בדיקה שהכל עובד

בכל מקום שכתוב `https://YOUR-SERVER` – החליפי בכתובת השרת שלך.

### 1. בדיקת בריאות
פתחי בדפדפן: `https://YOUR-SERVER/api/health`
צריך לראות:
```json
{"status":"ok","database":"ok","time":"..."}
```
`"database":"ok"` = השרת מחובר למסד הנתונים. ✅

### 2. פתיחת Swagger
פתחי: `https://YOUR-SERVER/api-docs`
יופיע דף עם כל ה־API, מחולק לקבוצות (התחברות, שיעורים, ניהול משתמשים...).

### 3. התחברות מתוך Swagger
1. פתחי את **POST /api/auth/login** ← **Try it out**.
2. בתיבה כתבי (עם ה־`SEED_PASSWORD` שבחרת):
   ```json
   { "idNumber": "200000008", "password": "School2026!" }
   ```
3. לחצי **Execute**.

### 4. קבלת JWT
בתשובה (**Response body**) מופיע `"token": "eyJhbGciOi..."`. העתיקי את הערך הארוך **בלי המירכאות**.

### 5. Authorize
1. גללי למעלה ולחצי על הכפתור **Authorize** 🔓.
2. הדביקי את ה־Token בשדה **Value** (בלי המילה Bearer).
3. **Authorize** ← **Close**. המנעול נסגר 🔒.

### 6. קריאה ל־Endpoint מוגן
1. פתחי **GET /api/classes** ← **Try it out** ← **Execute**.
2. צריך לקבל **200** ורשימה של 8 כיתות.
3. לבדיקת 401: לחצי שוב **Authorize** ← **Logout**, והריצי שוב – צריך לקבל **401**.
4. לבדיקת 403: כשאת מחוברת כמורה, הריצי **GET /api/users** – צריך לקבל **403** (רק למנהל מותר).

### 7. הוספת רשומה (פתיחת שיעור)
מחוברת כמורה (`200000008`):
1. **GET /api/classes/{classId}/students** עם `classId` = `5` (ט'1) – העתיקי את מספרי ה־`id` של התלמידות.
2. **POST /api/lessons** ← **Try it out**, ובתיבה (החליפי את ה־studentId במספרים שקיבלת – **כל** התלמידות של הכיתה):
   ```json
   {
     "classId": 5,
     "subjectId": 7,
     "lessonNumber": 3,
     "topic": "שיעור לדוגמה",
     "attendance": [
       { "studentId": 101, "status": "PRESENT" },
       { "studentId": 102, "status": "LATE" }
     ]
   }
   ```
   (מספר המקצוע: הריצי **GET /api/subjects** ובחרי `id` של מתמטיקה.)
3. **Execute** ← צריך לקבל **201** עם השיעור שנוצר ו־`id` שלו.

### 8. שליפת הרשומה ממסד הנתונים
**GET /api/lessons/{id}** עם ה־`id` שקיבלת ← **Execute** ← השיעור חוזר בדיוק כפי ששמרת. ✅
אפשר גם להתחבר כמנהל (`100000009`) ולהריץ **GET /api/classes/5/lessons** – השיעור יופיע ראשון.

---

## חלק ה – פתרון תקלות

| תקלה | מה רואים | פתרון |
|---|---|---|
| **Build Failed** | ב־Logs של Render: `npm error` | ודאי שה־Build Command הוא בדיוק `npm ci --include=dev && npm run build`. ודאי ש־`package.json` ו־`package-lock.json` נמצאים **בשורש** ה־Repository (חלק א, סעיף 5). ודאי ש־`NODE_VERSION` = `22`. |
| **DATABASE_URL שגוי** | ב־Logs: `DATABASE_URL חסר` או `P1001: Can't reach database server` או `password authentication failed` | העתיקי שוב את הכתובת מ־Neon (בלי רווחים בהתחלה או בסוף, בלי מירכאות). ב־Render: **Environment** ← לערוך את `DATABASE_URL` ← **Save Changes**. ודאי שבסוף הכתובת יש `?sslmode=require`. |
| **בעיית Prisma** | ב־Logs: `prisma: command not found` או `Cannot find module '../generated/prisma/client.js'` | ה־Build Command חייב לכלול `--include=dev` ואת `npm run build` (שמריץ `prisma generate`). ב־Render: **Manual Deploy** ← **Clear build cache & deploy**. |
| **מיגרציה נכשלה** | ב־Logs: `migrate deploy` עם שגיאה | ודאי שהתיקייה `prisma/migrations` הועלתה ל־GitHub עם הקובץ `migration_lock.toml`. אם המסד ב־Neon לא ריק מניסיון קודם – אפשר ליצור Branch/Database חדש ב־Neon ולעדכן את הכתובת. |
| **JWT_SECRET חסר** | ב־Logs: `JWT_SECRET חייב להכיל לפחות 32 תווים` | הוסיפי ב־**Environment** את `JWT_SECRET` עם לפחות 32 תווים אקראיים ושמרי. |
| **אין נתוני הדגמה** | ההתחברות נכשלת, ב־Logs: `SEED_PASSWORD לא הוגדר` | הוסיפי `SEED_PASSWORD` (לפחות 8 תווים) ב־**Environment** ← **Save Changes**. הנתונים ייווצרו בהפעלה הבאה (רק אם המסד ריק). |
| **שגיאת CORS** | ב־React, בקונסול של הדפדפן: `blocked by CORS policy` | הכתובת שבשורת הכתובות של ה־React (למשל `http://localhost:5173`) חייבת להופיע ב־`CORS_ORIGIN` בדיוק – כולל `http`/`https` והפורט, בלי `/` בסוף. אחרי שינוי: **Save Changes** וחכי שהשרת יעלה מחדש. |
| **401 Unauthorized** | `נדרשת התחברות` / `Token לא תקין` / `פג תוקף ההתחברות` | לא נשלח Token, הוא הועתק לא נכון, או שעברו 8 שעות. התחברי מחדש. בכותרת: `Authorization: Bearer <token>` עם רווח אחד אחרי Bearer. ב־Swagger מדביקים **בלי** המילה Bearer. |
| **403 Forbidden** | `פעולה זו מותרת רק ל: ...` | מחוברת עם תפקיד שלא מורשה. למשל: רק מורה פותח שיעור, רק מנהל רואה משתמשים. התחברי עם החשבון המתאים. |
| **Swagger לא נפתח** | הדף ריק או שגיאה | ודאי שהכתובת היא `/api-docs` (עם מקף). אם השרת "ישן" – חכי דקה ורענני. בדקי קודם ש־`/api/health` עובד. |
| **השרת לא עולה** | ב־Render: `Exited with status 1` או `Deploy failed` | קראי את השורות האחרונות ב־**Logs** – בדרך כלל כתוב שם בעברית מה חסר (משתנה סביבה, מסד נתונים). תקני ולחצי **Manual Deploy** ← **Deploy latest commit**. |
| **הפנייה הראשונה איטית מאוד** | לוקח כדקה | השרת החינמי "נרדם" אחרי 15 דקות בלי פניות. זה תקין – הפנייה הבאה תהיה מהירה. |
| **409 Conflict** בפתיחת שיעור | `שיעור מספר X כבר קיים` | באותה כיתה ובאותו יום כבר יש שיעור עם המספר הזה. בחרי מספר שיעור אחר. |

---

## עדכון הקוד בעתיד

אם תשני קובץ: ב־GitHub פתחי את הקובץ ← סמל העיפרון ✏️ ← ערכי ← **Commit changes**. ‏Render יזהה את השינוי ויעלה את השרת מחדש אוטומטית.
