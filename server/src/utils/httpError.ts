// שגיאה עם קוד HTTP. כל שגיאה כזו מגיעה ללקוח בפורמט אחיד (ראו errorHandler).

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "TOO_MANY_REQUESTS"
  | "INTERNAL_ERROR";

export interface ErrorDetail {
  field: string;
  message: string;
}

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: ErrorDetail[],
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export const badRequest = (message: string, details?: ErrorDetail[]) =>
  new HttpError(400, "VALIDATION_ERROR", message, details);
export const unauthorized = (message = "נדרשת התחברות") => new HttpError(401, "UNAUTHORIZED", message);
export const forbidden = (message = "אין לך הרשאה לבצע פעולה זו") => new HttpError(403, "FORBIDDEN", message);
export const notFound = (message = "לא נמצא") => new HttpError(404, "NOT_FOUND", message);
export const conflict = (message: string) => new HttpError(409, "CONFLICT", message);
