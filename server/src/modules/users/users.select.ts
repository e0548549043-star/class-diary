// השדות של משתמש שמותר להחזיר ללקוח (בלי passwordHash!)
export const publicUserSelect = {
  id: true,
  idNumber: true,
  firstName: true,
  lastName: true,
  role: true,
  schoolClass: { select: { id: true, name: true } },
} as const;

type PublicUserRow = {
  id: number;
  idNumber: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  schoolClass: { id: number; name: string } | null;
};

export interface PublicUser {
  id: number;
  idNumber: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  class: { id: number; name: string } | null;
}

export function toPublicUser(row: PublicUserRow): PublicUser {
  return {
    id: row.id,
    idNumber: row.idNumber,
    firstName: row.firstName,
    lastName: row.lastName,
    role: row.role,
    class: row.schoolClass,
  };
}
