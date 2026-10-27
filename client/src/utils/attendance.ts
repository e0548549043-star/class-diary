import type { AttendanceStatus } from "../typs/lesson";

export const statusLabels: Record<AttendanceStatus, string> = {
     PRESENT: "נכחה", LATE: "איחרה", ABSENT: "חסרה" };
