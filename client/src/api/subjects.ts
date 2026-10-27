import type { Subject } from "../typs/subject";
import request from "./api";


export  function getSubjects() {
    return request<Subject[]>("/subjects");
}