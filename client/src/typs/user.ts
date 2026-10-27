export type Role = "ADMIN" | "TEACHER" | "STUDENT" 

export type User={
    id:number,
    idNumber: string;
    firstName: string;
    lastName: string;
    role: Role;
    class?: { id: number; name: string } | null;
    stats?: UserStats;
}

export type UserStats = {
  totalLessons: number;
  present: number;
  late: number;
  absent: number;
  attendancePercent: number;
};

export type ClassStudent = {
  id: number;
  idNumber: string;
  firstName: string;
  lastName: string;
};

export type UsersResponse = {
  items: User[];
};

export type LoginResponse={
    token:string,
    user:User   
}