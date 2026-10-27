import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getClassStudents } from "../api/classes";
import { createLesson, getLesson, updateLesson } from "../api/lessons";
import type { Lesson, LessonBody, LessonFormValues } from "../typs/lesson";
import LessonForm from "../components/LessonForm";
import type { ClassStudent } from "../typs/user";


const toLessonBody = (values: LessonFormValues): LessonBody => ({
                subjectId: Number(values.subjectId),
                lessonNumber: Number(values.lessonNumber),
                topic: values.topic,
                attendance: values.attendance.map((row) => ({
                    studentId: row.studentId,
                    status: row.status,
                })),
            });

const lessonToFormValues = (lesson: Lesson): LessonFormValues => ({
  lessonNumber: String(lesson.lessonNumber),
  subjectId: String(lesson.subject.id),
  topic: lesson.topic,
  attendance: lesson.attendance,
});

const studentsToFormValues = (students: ClassStudent[]): LessonFormValues => ({
  lessonNumber: "",
  subjectId: "",
  topic: "",
  attendance: students.map((s) => ({
    studentId: s.id,
    firstName: s.firstName,
    lastName: s.lastName,
    status: "PRESENT",
  })),
});


const LessonFormPage = () => {

    const { classId, lessonId } = useParams()
    const isEdit = lessonId !== undefined;

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const studentsQuery = useQuery({
        queryKey: ["classStudents", classId],
        queryFn: () => getClassStudents(classId!),
        enabled: !isEdit
    })
    const lessonQuery = useQuery({
        queryKey: ["lesson", lessonId],
        queryFn: () => getLesson(lessonId!),
        enabled: isEdit
    })


    const backClassId = isEdit ? lessonQuery.data?.class.id : classId;

    const mutation = useMutation({
        mutationFn: (values: LessonFormValues) =>{
            const body = toLessonBody(values)
            if (isEdit) {
                return updateLesson(lessonId!, body);
            }
            return createLesson({ ...body, classId: Number(classId) });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lessons"] });
            queryClient.invalidateQueries({ queryKey: ["classLessons"] });
            queryClient.invalidateQueries({ queryKey: ["users"] });
            navigate(`/teacher/classes/${backClassId}`);
        },
    })

    const loadQuery = isEdit ? lessonQuery : studentsQuery;
    if (loadQuery.isPending) return <p>טוען...</p>;
    if (loadQuery.isError) return <p>{loadQuery.error.message}</p>;

    const initialValues = isEdit?lessonToFormValues(lessonQuery.data!):studentsToFormValues(studentsQuery.data!)

    const lockedInfo=isEdit ? `שיעור ${lessonQuery.data!.lessonNumber} · ${lessonQuery.data!.subject.name} · ${lessonQuery.data!.topic}` : undefined;

   return (<>
        <div className="mx-auto -mb-4 flex max-w-3xl flex-wrap items-center justify-between gap-3 px-6 pt-10">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-[#3f5f4b]">
          <i className="ti ti-notebook text-[#86b59a]"></i>
          {isEdit ? "עריכת שיעור" : "פתיחת שיעור"}
        </h2>
        <Link
          to={`/teacher/classes/${backClassId}`}
          className="flex items-center gap-1.5 rounded-xl border border-[#d6d3c4] bg-white px-4 py-2 text-sm font-medium text-stone-600 transition hover:border-[#e2b4a5] hover:bg-[#fbf1ec] hover:text-[#a5533e]"
        ><i className="ti ti-x"></i>ביטול </Link>
        </div>
        <LessonForm initialValues={initialValues} onSubmit={(values) => mutation.mutate(values)} isPending={mutation.isPending}
            errorMessage={mutation.isError ? mutation.error.message : undefined} lockedInfo={lockedInfo}/>
    </>)

      
}

export default LessonFormPage