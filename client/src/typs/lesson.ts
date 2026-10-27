import type { Subject } from "./subject";



export type LessonClass = {
  id: number;
  name: string;
};

export type LessonTeacher = {
  id: number;
  firstName: string;
  lastName: string;
};

export type AttendanceStatus = "ABSENT" | "LATE" | "PRESENT"

export type AttendanceSummary = {
  present: number;
  late: number;
  absent: number;
};

export type AttendanceRecord = {
  studentId: number;
  firstName: string;
  lastName: string;
  status: AttendanceStatus;
};

export type Lesson ={
     id:number,
     date:string,
     lessonNumber:number,
     topic:string,
     class:LessonClass,
     subject:Subject,
     teacher:LessonTeacher,
     attendanceSummary:AttendanceSummary,
     attendance:AttendanceRecord[]
}
export type LessonFormValues={
  lessonNumber: string,
  subjectId: string,
  topic: string,
  attendance: AttendanceRecord[]
}

export type LessonBody={
  subjectId: number,
  lessonNumber: number,
  topic: string,
  attendance:{studentId: number; status: AttendanceStatus }[]
}

export type CreateLessonBody=LessonBody & { classId: number }

export type LessonsResponse = {
  items: Lesson[];
};