
import { useState } from "react";
import { Link, useParams } from "react-router-dom"
import SubjectSelect from "../components/SubjectSelect";
import { useQuery } from "@tanstack/react-query";
import { getClassLessons } from "../api/lessons";
import LessonsTable from "../components/LessonsTable";




const ClassDiaryPage=()=>{
    
const {classId}= useParams()
const [subjectId, setSubjectId] = useState("");

const lessonsQuery = useQuery({
  queryKey :["lessons",classId,subjectId],
  queryFn:()=>getClassLessons(classId!,subjectId)
})


const lessons = lessonsQuery.data?.items ?? [];


    return(<div className="mx-auto max-w-5xl space-y-6 px-6 py-10">
    <h2 className="flex items-center gap-2 text-2xl font-bold text-[#3f5f4b]"><i className="ti ti-notebook text-[#86b59a]"></i>יומן כיתה</h2>

    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e7e5dc] bg-white p-4">
     <Link to={`/admin/classes/${classId}/students`} className="flex items-center gap-2 rounded-xl bg-[#eef4ef] px-4 py-2 text-sm font-semibold text-[#3f5f4b] transition hover:bg-[#86b59a] hover:text-white"><i className="ti ti-users"></i>תלמידות הכיתה</Link>
     <SubjectSelect value={subjectId} onChange={setSubjectId} />
    </div>

     {lessonsQuery.isLoading && <p className="flex items-center justify-center gap-2 py-12 text-stone-400"><i className="ti ti-loader-2 animate-spin text-xl text-[#86b59a]"></i>...טוען</p>}
     {lessonsQuery.isError && <p className="flex items-center justify-center gap-1.5 rounded-xl border border-[#f1d5cb] bg-[#fbf1ec] px-4 py-3 text-sm text-[#a5533e]"><i className="ti ti-alert-circle"></i>{lessonsQuery.error.message}</p>}
     {lessonsQuery.isSuccess && lessons.length === 0 && <p className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-[#d6d3c4] bg-white/60 py-14 text-stone-500"><i className="ti ti-notebook-off text-4xl text-[#c9c5b5]"></i>{subjectId ? "אין שיעורים במקצוע הזה":"עדיין לא נרשמו שיעורים בכיתה זאת"}</p>}
     {lessons.length > 0 && <LessonsTable lessons={lessons} showTeacher />}
    
    </div>)
}

export default ClassDiaryPage