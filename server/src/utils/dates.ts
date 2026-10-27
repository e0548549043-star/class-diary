// כלי עזר לתאריכים. תאריכי שיעורים נשמרים כ"תאריך בלבד" (ללא שעה).
import { env } from "../config/env.js";

/** התאריך של היום באזור הזמן של בית הספר, בפורמט YYYY-MM-DD */
export function todayString(now: Date = new Date()): string {
  // הפורמט en-CA מחזיר בדיוק YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: env.SCHOOL_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** ממיר מחרוזת YYYY-MM-DD לאובייקט Date בחצות UTC (כך Prisma שומר עמודת DATE) */
export function dateFromString(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

/** ממיר Date (של עמודת DATE) חזרה למחרוזת YYYY-MM-DD */
export function dateToString(value: Date): string {
  return value.toISOString().slice(0, 10);
}

/**
 * תחילת שנת הלימודים הנוכחית: 1 בספטמבר.
 * מספטמבר עד דצמבר - 1 בספטמבר של השנה הזו; מינואר עד אוגוסט - של השנה הקודמת.
 */
export function schoolYearStart(today: string = todayString()): string {
  const [yearStr, monthStr] = today.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const startYear = month >= 9 ? year : year - 1;
  return `${startYear}-09-01`;
}
