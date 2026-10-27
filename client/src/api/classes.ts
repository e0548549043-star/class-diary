import type { SchoolClass } from "../typs/class";
import type { ClassStudent } from "../typs/user";
import request from "./api";


export function getClasses() {
    return request<SchoolClass[]>("/classes");
}

export function getClassStudents(classId: string){
    return request<ClassStudent[]>(`/classes/${classId}/students`)
}