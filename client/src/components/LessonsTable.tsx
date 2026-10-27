import { Link } from "react-router-dom";
import type { Lesson } from "../typs/lesson";
import { useState } from "react";
import AttendanceDetails from "./AttendanceDetails";


type Props = {
    lessons: Lesson[],
    showTeacher?: boolean,
    showEdit?: boolean
}

export const TZ = "Asia/Jerusalem"

const LessonsTable = ({ lessons, showTeacher = false, showEdit = false }: Props) => {

    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

    return (<>

    {selectedLesson && <AttendanceDetails lesson={selectedLesson} onClose={() => setSelectedLesson(null)} />}
    
    <div className="mx-auto w-fit max-w-full overflow-x-auto rounded-2xl border border-[#e7e5dc] bg-white shadow-sm">
    <table className="text-sm [&_td]:px-4 [&_td]:py-3 [&_td]:text-start [&_th]:px-4 [&_th]:py-3 [&_th]:text-start">

        <thead className="bg-[#eef4ef] text-[#3f5f4b]">
            <tr>
                <th className="whitespace-nowrap font-semibold">תאריך</th>
                <th className="whitespace-nowrap font-semibold">שיעור</th>
                <th className="whitespace-nowrap font-semibold">מקצוע</th>
                {showTeacher && <th className="whitespace-nowrap font-semibold">מורה</th>}
                <th className="whitespace-nowrap font-semibold">למדנו בשיעור</th>
                {!showEdit &&<th></th>}
                {showEdit && <th></th>}
            </tr>
        </thead>
        <tbody>
            {lessons.map((lesson) => (
                <tr key={lesson.id} className="border-t border-[#efede6] transition even:bg-[#fbfaf7] hover:bg-[#f4f8f5]">
                    <td className="whitespace-nowrap font-medium text-stone-700">
                      {new Date(lesson.date).toLocaleDateString("he-IL", { weekday: "short", day: "numeric", month: "numeric", timeZone: TZ })}
                    </td>
                    <td className="whitespace-nowrap text-stone-500">שיעור {lesson.lessonNumber}</td>
                    <td className="whitespace-nowrap font-medium text-[#3f5f4b]">{lesson.subject.name}</td>
                    {showTeacher && <td className="whitespace-nowrap text-stone-600">{lesson.teacher.firstName} {lesson.teacher.lastName}</td>}
                    <td className="min-w-48 max-w-md leading-relaxed text-stone-600">{lesson.topic}</td>
                    {!showEdit &&<td>
                      <button
                        type="button"
                        onClick={() => setSelectedLesson(lesson)}
                        className="flex items-center gap-1 whitespace-nowrap rounded-lg border border-[#d6d3c4] px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:border-[#86b59a] hover:bg-[#eef4ef] hover:text-[#3f5f4b]"
                      ><i className="ti ti-list-details"></i>פירוט</button>
                    </td>} 
                    {showEdit && <td>
                      <Link
                        to={`/teacher/lessons/${lesson.id}`}
                        className="flex w-fit items-center gap-1 whitespace-nowrap rounded-lg bg-[#86b59a] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#6fa086]"
                      ><i className="ti ti-pencil"></i>עריכה</Link>
                    </td>}
                </tr>
            ))}
        </tbody>

    </table>
    </div>
    </>)

}
export default LessonsTable