import type{  Lesson,  CreateLessonBody,  LessonBody,  LessonsResponse } from "../typs/lesson";
import request from "./api";


export function getClassLessons(classId:string,subjectId:string){
    return request<LessonsResponse>(`/classes/${classId}/lessons`, {
        query: { subjectId, pageSize: 100 },
    });
}

export function getLesson(lessonId: string){
    return request<Lesson>(`/lessons/${lessonId}`)
}

export function createLesson(body: CreateLessonBody){
    return request<Lesson>("/lessons", { method: "POST", body });
}

export function updateLesson(lessonId: string, body: LessonBody) {
    return request<Lesson>(`/lessons/${lessonId}`, { method: "PUT", body });
}
