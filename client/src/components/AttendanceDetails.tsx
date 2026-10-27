import type { Lesson } from "../typs/lesson";
import { TZ } from "./LessonsTable";
import { statusLabels } from "../utils/attendance";




type Props = {
    lesson: Lesson,
    onClose: () => void;
}

const AttendanceDetails = ({ lesson, onClose }: Props) => {

    return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f7f5ef]/60 p-4 backdrop-blur-[2px]">
    <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#e7e5dc] border-t-[6px] border-t-[#86b59a] bg-white p-6 shadow-2xl shadow-[#86b59a]/25">

        <h3 className="mb-4 flex items-start gap-2 text-lg font-bold leading-snug text-[#3f5f4b]"><i className="ti ti-clipboard-check mt-0.5 text-xl text-[#86b59a]"></i><span>נוכחות -  {new Date(lesson.date).toLocaleDateString("he-IL", { weekday: "short", day: "numeric", month: "numeric", timeZone: TZ })}
            , שיעור {lesson.lessonNumber} , {lesson.subject.name}
        </span></h3>
        <ul className="mb-5 divide-y divide-[#efede6] overflow-hidden rounded-xl border border-[#e7e5dc]">
        {lesson.attendance.map((student) => (
            <li key={student.studentId} className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 even:bg-[#fbfaf7]">
                <i className="ti ti-user text-[#86b59a]"></i>
                {student.firstName} {student.lastName} - {statusLabels[student.status]}
            </li>
        ))}
        </ul>
        <button type="button" onClick={onClose} className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#d6d3c4] py-2.5 text-sm font-medium text-stone-600 transition hover:border-[#86b59a] hover:bg-[#eef4ef] hover:text-[#3f5f4b]"><i className="ti ti-x"></i>סגירה</button>
    </div>
    </div>
    )

}
export default AttendanceDetails