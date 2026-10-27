// ולידציה בעזרת Zod: הודעות שגיאה בעברית ופורמט אחיד
import { z, type ZodTypeAny } from "zod";
import { badRequest } from "./httpError.js";

// הודעות ברירת מחדל בעברית לשגיאות הנפוצות
z.setErrorMap((issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.received === "undefined") return { message: "שדה חובה" };
      return { message: `סוג ערך שגוי (התקבל ${issue.received}, נדרש ${issue.expected})` };
    case z.ZodIssueCode.too_small:
      if (issue.type === "string") return { message: `חייב להכיל לפחות ${issue.minimum} תווים` };
      if (issue.type === "array") return { message: `חייב להכיל לפחות ${issue.minimum} פריטים` };
      return { message: `הערך המינימלי הוא ${issue.minimum}` };
    case z.ZodIssueCode.too_big:
      if (issue.type === "string") return { message: `יכול להכיל לכל היותר ${issue.maximum} תווים` };
      if (issue.type === "array") return { message: `יכול להכיל לכל היותר ${issue.maximum} פריטים` };
      return { message: `הערך המקסימלי הוא ${issue.maximum}` };
    case z.ZodIssueCode.invalid_enum_value:
      return { message: `ערך לא חוקי. ערכים אפשריים: ${issue.options.join(", ")}` };
    case z.ZodIssueCode.unrecognized_keys:
      return { message: `שדות לא מוכרים: ${issue.keys.join(", ")}` };
    default:
      return { message: ctx.defaultError };
  }
});

/** בודק נתונים מול סכמה. אם לא תקין - זורק שגיאת 400 עם פירוט לכל שדה */
export function validate<S extends ZodTypeAny>(schema: S, data: unknown): z.infer<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.length ? issue.path.join(".") : "(body)",
      message: issue.message,
    }));
    throw badRequest("הנתונים שנשלחו אינם תקינים", details);
  }
  return result.data;
}

// סכמות משותפות
export const idParam = z.coerce
  .number({ invalid_type_error: "מזהה חייב להיות מספר" })
  .int("מזהה חייב להיות מספר שלם")
  .positive("מזהה חייב להיות מספר חיובי");

export const passwordSchema = z
  .string()
  .min(6, "הסיסמה חייבת להכיל לפחות 6 תווים")
  .max(72, "הסיסמה יכולה להכיל לכל היותר 72 תווים");

export const paginationSchema = {
  page: z.coerce.number().int().min(1, "מספר העמוד חייב להיות 1 או יותר").default(1),
  pageSize: z.coerce.number().int().min(1).max(100, "לכל היותר 100 פריטים בעמוד").default(20),
};
