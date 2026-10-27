// ממלא את מסד הנתונים בנתוני בית ספר מומצאים ומציאותיים:
// מנהל, 15 מורים, 8 כיתות עם תלמידים, 12 מקצועות, מערכת שעות קבועה,
// ושיעורים עם נוכחות מתחילת שנת הלימודים ועד היום.
//
// הרצה:
//   npm run db:seed               - ממלא רק אם מסד הנתונים ריק
//   npm run db:seed -- --reset    - מוחק הכל וממלא מחדש (לא בסביבת production)
//
// הסיסמה של כל משתמשי ההדגמה נלקחת ממשתנה הסביבה SEED_PASSWORD.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client.js";
import {
  CLASSES,
  FIRST_NAMES,
  LAST_NAMES,
  SCHOOL_YEAR_END_MONTH_DAY,
  SUBJECTS,
  TEACHERS,
  VACATION_RANGES,
  topicFor,
} from "./seed-data.js";

type Status = "PRESENT" | "LATE" | "ABSENT";

const args = new Set(process.argv.slice(2));
const isProduction = process.env.NODE_ENV === "production";
const timeZone = process.env.SCHOOL_TIMEZONE || "Asia/Jerusalem";

// ---------- כלי עזר ----------

/** מחולל מספרים אקראיים קבוע (אותם נתונים בכל הרצה) */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(5787);
const randInt = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));
const randFloat = (min: number, max: number) => min + rand() * (max - min);
const pickOne = <T>(list: T[]): T => list[Math.floor(rand() * list.length)]!;
function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** יוצר מספר ת.ז תקין (9 ספרות עם ספרת ביקורת) מ־8 ספרות */
function makeIdNumber(first8: string): string {
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    let d = Number(first8[i]) * (i % 2 === 0 ? 1 : 2);
    if (d > 9) d -= 9;
    sum += d;
  }
  return first8 + String((10 - (sum % 10)) % 10);
}

function todayString(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}
const toDate = (s: string) => new Date(`${s}T00:00:00.000Z`);
const toStr = (d: Date) => d.toISOString().slice(0, 10);

function isVacation(day: string) {
  return VACATION_RANGES.some(([from, to]) => day >= from && day <= to);
}

/** ימי הלימודים מתחילת שנת הלימודים ועד היום (כולל) */
function schoolDays(today: string): string[] {
  const [y, m] = today.split("-").map(Number) as [number, number];
  const startYear = m >= 9 ? y : y - 1;
  const start = `${startYear}-09-01`;
  const yearEnd = `${startYear + 1}-${SCHOOL_YEAR_END_MONTH_DAY}`;
  const last = today < yearEnd ? today : yearEnd;

  const days: string[] = [];
  for (let d = toDate(start); toStr(d) <= last; d.setUTCDate(d.getUTCDate() + 1)) {
    const s = toStr(d);
    if (d.getUTCDay() === 6) continue; // שבת
    if (isVacation(s)) continue;
    days.push(s);
  }
  return days;
}

/** כמה שיעורים יש ביום: א'-ה' 6, ו' 4 */
const lessonsPerDay = (day: string) => (toDate(day).getUTCDay() === 5 ? 4 : 6);

// ---------- הרצה ----------

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL חסר");

  let password = process.env.SEED_PASSWORD;
  if (!password) {
    if (isProduction) {
      console.log("ℹ️  SEED_PASSWORD לא הוגדר - דילוג על יצירת נתוני הדגמה.");
      return;
    }
    password = "Demo1234!";
    console.log("⚠️  SEED_PASSWORD לא הוגדר - משתמשים בסיסמת פיתוח Demo1234!");
  }
  if (password.length < 8) throw new Error("SEED_PASSWORD חייב להכיל לפחות 8 תווים");

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
  try {
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      if (!args.has("--reset")) {
        console.log("ℹ️  מסד הנתונים כבר מכיל נתונים - לא נוצרו נתוני הדגמה. (למחיקה ומילוי מחדש: --reset)");
        return;
      }
      if (isProduction) throw new Error("--reset אסור בסביבת production");
      console.log("🗑️  מוחק נתונים קיימים...");
      await prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "Attendance", "Lesson", "User", "Subject", "SchoolClass" RESTART IDENTITY CASCADE`,
      );
    }

    await seed(prisma, password);
  } finally {
    await prisma.$disconnect();
  }
}

async function seed(prisma: PrismaClient, password: string) {
  const started = Date.now();
  const passwordHash = await bcrypt.hash(password, 10);

  // מקצועות וכיתות
  await prisma.subject.createMany({ data: SUBJECTS.map((s) => ({ name: s.name })) });
  await prisma.schoolClass.createMany({ data: CLASSES });
  const subjects = await prisma.subject.findMany();
  const classes = await prisma.schoolClass.findMany({ orderBy: [{ gradeLevel: "asc" }, { name: "asc" }] });
  const subjectId = new Map(subjects.map((s) => [s.name, s.id]));

  // מנהל
  await prisma.user.create({
    data: { idNumber: makeIdNumber("10000000"), firstName: "אסתר", lastName: "לוי", role: "ADMIN", passwordHash },
  });

  // מורים (המורה הראשון הוא מורה ההדגמה: 200000008)
  const teachers = [];
  for (let i = 0; i < TEACHERS.length; i++) {
    const t = TEACHERS[i]!;
    const idNumber = makeIdNumber(i === 0 ? "20000000" : String(20000100 + i));
    const created = await prisma.user.create({
      data: { idNumber, firstName: t.firstName, lastName: t.lastName, role: "TEACHER", passwordHash },
    });
    teachers.push({ ...created, subjects: t.subjects, load: 0 });
  }

  // תלמידים: 21-25 בכל כיתה. תלמידת ההדגמה (300000007) בכיתה ט'1
  let studentCounter = 0;
  const studentsByClass = new Map<number, number[]>();
  const usedNames = new Set<string>();
  for (const cls of classes) {
    const size = randInt(21, 25);
    const data = [];
    for (let i = 0; i < size; i++) {
      let firstName: string;
      let lastName: string;
      if (cls.name === "ט'1" && i === 0) {
        firstName = "שרה";
        lastName = "אברהמי";
      } else {
        do {
          firstName = pickOne(FIRST_NAMES);
          lastName = pickOne(LAST_NAMES);
        } while (usedNames.has(`${firstName} ${lastName}`));
      }
      usedNames.add(`${firstName} ${lastName}`);
      const isDemo = cls.name === "ט'1" && i === 0;
      const idNumber = makeIdNumber(isDemo ? "30000000" : String(30000100 + ++studentCounter));
      data.push({ idNumber, firstName, lastName, role: "STUDENT" as const, classId: cls.id, passwordHash });
    }
    const created = await prisma.user.createManyAndReturn({ data, select: { id: true } });
    studentsByClass.set(cls.id, created.map((s) => s.id));
  }

  // שיבוץ מורה לכל (כיתה, מקצוע) - למורה עם העומס הנמוך ביותר
  const teacherFor = new Map<string, (typeof teachers)[number]>();
  const key = (classId: number, subject: string) => `${classId}|${subject}`;
  for (const cls of classes) {
    for (const s of SUBJECTS) {
      if (s.name === "חינוך") continue;
      const candidates = teachers.filter((t) => t.subjects.includes(s.name)).sort((a, b) => a.load - b.load);
      const chosen = candidates[0]!;
      chosen.load += s.weeklyHours;
      teacherFor.set(key(cls.id, s.name), chosen);
    }
    // מחנכת הכיתה: אחת המורות שכבר מלמדות בכיתה, עם העומס הנמוך ביותר
    const inClass = [...new Set(SUBJECTS.filter((s) => s.name !== "חינוך").map((s) => teacherFor.get(key(cls.id, s.name))!))];
    const homeroom = inClass.sort((a, b) => a.load - b.load)[0]!;
    homeroom.load += 1;
    teacherFor.set(key(cls.id, "חינוך"), homeroom);
  }

  // מערכת שעות שבועית: לכל כיתה, יום (0-5) ושיעור -> מקצוע. בלי שמורה תלמד בשתי כיתות באותה שעה.
  const slots: [number, number][] = [];
  for (let day = 0; day <= 5; day++) {
    for (let n = 1; n <= (day === 5 ? 4 : 6); n++) slots.push([day, n]);
  }
  let timetable = new Map<string, string>();
  let bestConflicts = Infinity;
  for (let attempt = 0; attempt < 200 && bestConflicts > 0; attempt++) {
    const table = new Map<string, string>();
    const remaining = new Map(classes.map((c) => [c.id, SUBJECTS.flatMap((s) => Array<string>(s.weeklyHours).fill(s.name))]));
    let conflicts = 0;
    for (const [day, n] of slots) {
      const busy = new Set<number>();
      for (const cls of shuffle(classes)) {
        const left = remaining.get(cls.id)!;
        // קודם מקצועות שנשארו להם הכי הרבה שעות (הכי קשה לשבץ אותם בסוף)
        const remainingCount = (s: string) => left.filter((x) => x === s).length;
        const options = shuffle([...new Set(left)]).sort((a, b) => remainingCount(b) - remainingCount(a));
        let subject = options.find((s) => !busy.has(teacherFor.get(key(cls.id, s))!.id));
        if (!subject) {
          subject = options[0]!;
          conflicts++;
        }
        left.splice(left.indexOf(subject), 1);
        busy.add(teacherFor.get(key(cls.id, subject))!.id);
        table.set(`${cls.id}|${day}|${n}`, subject);
      }
    }
    if (conflicts < bestConflicts) {
      bestConflicts = conflicts;
      timetable = table;
    }
  }

  // שיעורים לכל יום לימודים
  const today = todayString();
  const days = schoolDays(today);
  const lessonCounter = new Map<string, number>(); // כמה שיעורים היו בכל (כיתה, מקצוע)

  // מאפייני תלמידים: נוכחות ואיחורים
  const profile = new Map<number, { absent: number; late: number }>();
  for (const ids of studentsByClass.values()) {
    for (const id of ids) {
      profile.set(id, { absent: randFloat(0.01, 0.1), late: randFloat(0.01, 0.06) });
    }
  }

  type LessonRow = {
    classId: number;
    teacherId: number;
    subjectId: number;
    date: Date;
    lessonNumber: number;
    topic: string;
  };
  const lessonRows: LessonRow[] = [];
  const attendanceByKey = new Map<string, { studentId: number; status: Status }[]>();

  for (const day of days) {
    const weekday = toDate(day).getUTCDay();
    const isToday = day === today;
    // היום: רק שני השיעורים הראשונים כבר תועדו - כדי שאפשר יהיה להדגים פתיחת שיעור חדש
    const count = isToday ? Math.min(2, lessonsPerDay(day)) : lessonsPerDay(day);

    // תלמידים שחסרו כל היום (מחלה וכו')
    const absentAllDay = new Set<number>();
    for (const [id, p] of profile) if (rand() < p.absent * 0.7) absentAllDay.add(id);

    for (const cls of classes) {
      for (let n = 1; n <= count; n++) {
        const subject = timetable.get(`${cls.id}|${weekday}|${n}`)!;
        // כ־3% מהשיעורים בעבר לא תועדו (מורה חסרה, טיול וכו')
        if (!isToday && rand() < 0.03) continue;

        const k = key(cls.id, subject);
        const index = lessonCounter.get(k) ?? 0;
        lessonCounter.set(k, index + 1);

        const date = toDate(day);
        lessonRows.push({
          classId: cls.id,
          teacherId: teacherFor.get(k)!.id,
          subjectId: subjectId.get(subject)!,
          date,
          lessonNumber: n,
          topic: topicFor(subject, cls.gradeLevel, index),
        });

        const rows = studentsByClass.get(cls.id)!.map((studentId) => {
          const p = profile.get(studentId)!;
          let status: Status = "PRESENT";
          if (absentAllDay.has(studentId) || rand() < p.absent * 0.3) status = "ABSENT";
          else if (rand() < (n === 1 ? p.late * 2.5 : p.late)) status = "LATE";
          return { studentId, status };
        });
        attendanceByKey.set(`${cls.id}|${day}|${n}`, rows);
      }
    }
  }

  // שמירה במנות
  let lessonsCreated = 0;
  let attendanceCreated = 0;
  for (let i = 0; i < lessonRows.length; i += 500) {
    const chunk = lessonRows.slice(i, i + 500);
    const created = await prisma.lesson.createManyAndReturn({
      data: chunk,
      select: { id: true, classId: true, date: true, lessonNumber: true },
    });
    lessonsCreated += created.length;
    const attendance = created.flatMap((l) =>
      attendanceByKey.get(`${l.classId}|${toStr(l.date)}|${l.lessonNumber}`)!.map((a) => ({ lessonId: l.id, ...a })),
    );
    for (let j = 0; j < attendance.length; j += 5000) {
      const res = await prisma.attendance.createMany({ data: attendance.slice(j, j + 5000) });
      attendanceCreated += res.count;
    }
  }

  const studentsTotal = [...studentsByClass.values()].reduce((sum, ids) => sum + ids.length, 0);
  console.log("✅ נתוני ההדגמה נוצרו בהצלחה:");
  console.log(`   כיתות: ${classes.length} | מקצועות: ${subjects.length} | מורים: ${teachers.length} | תלמידים: ${studentsTotal}`);
  console.log(`   ימי לימודים: ${days.length} | שיעורים: ${lessonsCreated} | שורות נוכחות: ${attendanceCreated}`);
  console.log(`   התנגשויות במערכת השעות: ${bestConflicts}`);
  console.log("   חשבונות הדגמה (הסיסמה = SEED_PASSWORD):");
  console.log(`     מנהל:  ת.ז ${makeIdNumber("10000000")}`);
  console.log(`     מורה:  ת.ז ${makeIdNumber("20000000")} (מתמטיקה)`);
  console.log(`     תלמיד: ת.ז ${makeIdNumber("30000000")} (כיתה ט'1)`);
  console.log(`   זמן: ${((Date.now() - started) / 1000).toFixed(1)} שניות`);
}

main().catch((err) => {
  console.error("❌ שגיאה ביצירת נתוני ההדגמה:", err);
  process.exit(1);
});
