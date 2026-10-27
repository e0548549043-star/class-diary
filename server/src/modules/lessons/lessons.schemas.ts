import { z } from "zod";
import { idParam, paginationSchema } from "../../utils/validate.js";

export const attendanceItemSchema = z
  .object({
    studentId: idParam,
    status: z.enum(["PRESENT", "LATE", "ABSENT"], {
      errorMap: () => ({ message: "סטטוס נוכחות חייב להיות PRESENT (נכח), LATE (איחר) או ABSENT (חסר)" }),
    }),
  })
  .strict();

const lessonFields = {
  subjectId: idParam,
  lessonNumber: z.coerce
    .number({ invalid_type_error: "מספר שיעור חייב להיות מספר" })
    .int("מספר שיעור חייב להיות מספר שלם")
    .min(1, "מספר שיעור חייב להיות בין 1 ל־10")
    .max(10, "מספר שיעור חייב להיות בין 1 ל־10"),
  topic: z.string().trim().min(1, "יש לכתוב מה נלמד בשיעור").max(1000, "יכול להכיל לכל היותר 1000 תווים"),
  attendance: z.array(attendanceItemSchema).min(1, "יש לסמן נוכחות לפחות לתלמיד אחד"),
};

export const createLessonSchema = z.object({ classId: idParam, ...lessonFields }).strict();

export const updateLessonSchema = z.object(lessonFields).strict();

export const listLessonsQuerySchema = z
  .object({
    subjectId: idParam.optional(),
    ...paginationSchema,
  })
  .strict();

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
export type AttendanceItemInput = z.infer<typeof attendanceItemSchema>;
