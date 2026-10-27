import type { AttendanceRecord, AttendanceStatus, LessonFormValues } from "../typs/lesson";
import *  as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import SubjectSelect from "./SubjectSelect";
import { statusLabels } from "../utils/attendance";

 const statuses: AttendanceStatus[] = ["PRESENT", "LATE", "ABSENT"];

const lessonNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

type Props = {
    initialValues: LessonFormValues,
    onSubmit: (values: LessonFormValues) => void,
    isPending: boolean,
    errorMessage?: string,
    lockedInfo?:string
}



const schema = yup.object({
    lessonNumber: yup.string().required("יש לבחור מספר שיעור"),
    subjectId: yup.string().required("יש לבחור מקצוע"),
    topic: yup.string().trim().required("יש למלא מה נלמד").max(1000, "הטקסט ארוך מדי (עד 1000 תווים)"),
    attendance: yup.mixed<AttendanceRecord[]>().required(),
})

const LessonForm = ({ initialValues, onSubmit, isPending, errorMessage ,lockedInfo}: Props) => {


    const { register, handleSubmit, control, formState: { errors } } = useForm<LessonFormValues>({
        resolver: yupResolver(schema),
        defaultValues: initialValues
    })

    return (<>
        <form onSubmit={handleSubmit(onSubmit)} className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-10">
            {lockedInfo?<p className="flex items-center gap-2 rounded-2xl border border-[#e7dfc6] bg-[#faf6ea] px-5 py-4 text-sm text-[#7a6a3a]">
              <i className="ti ti-lock text-lg"></i>{lockedInfo}
            </p>:<div className="grid gap-5 rounded-2xl border border-[#e7e5dc] border-t-4 border-t-[#86b59a] bg-white p-6 sm:grid-cols-2">
            <div className="flex flex-wrap items-center gap-2">
                <label htmlFor="lesson_number" className="flex items-center gap-1.5 text-sm font-medium text-stone-500">
                  <i className="ti ti-list-numbers text-base text-[#86b59a]"></i>מספר שיעור
                </label>
                <select
                  id="lesson_number"
                  {...register("lessonNumber")}
                  className="min-w-44 cursor-pointer rounded-xl border border-[#e7e5dc] bg-[#fbfaf7] px-3 py-2 text-sm text-stone-700 outline-none transition hover:border-[#86b59a] focus:border-[#86b59a] focus:ring-4 focus:ring-[#eef4ef]"
                >
                    <option value="">בחרי מספר שיעור</option>
                    {lessonNumbers.map((n) => (
                        <option key={n} value={n}>{n}</option>
                    ))}
                </select>
                {errors.lessonNumber && <p className="w-full text-sm text-[#c0705b]">{errors.lessonNumber.message}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <Controller name="subjectId" control={control} render={({ field }) => (
                    <SubjectSelect value={field.value} onChange={field.onChange} emptyLabel="בחרי מקצוע" />
                )} />
                {errors.subjectId && <p className="w-full text-sm text-[#c0705b]">{errors.subjectId.message}</p>}
            </div>
            <div className="sm:col-span-2">
                <label htmlFor="topic" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-stone-500">
                  <i className="ti ti-pencil text-base text-[#86b59a]"></i>מה נלמד
                </label>
                <textarea
                  id="topic"
                  maxLength={1000}
                  {...register("topic")}
                  className="min-h-28 w-full resize-y rounded-xl border border-[#e7e5dc] bg-[#fbfaf7] px-4 py-3 text-stone-700 outline-none transition hover:border-[#86b59a] focus:border-[#86b59a] focus:bg-white focus:ring-4 focus:ring-[#eef4ef]"
                />
                {errors.topic && <p className="mt-1 text-sm text-[#c0705b]">{errors.topic.message}</p>}
            </div></div>}
            <div className="overflow-x-auto rounded-2xl border border-[#e7e5dc] bg-white shadow-sm">
                <table className="w-full text-sm [&_td]:px-4 [&_td]:py-3 [&_th]:px-4 [&_th]:py-3">
                    <thead className="bg-[#eef4ef] text-[#3f5f4b]">
                        <tr>
                            <th className="text-start font-semibold">שם תלמידה</th>
                            {statuses.map((s) => (<th key={s} className="whitespace-nowrap text-center font-semibold">{statusLabels[s]}</th>))}
                        </tr>
                    </thead>
                    <tbody>
                        {initialValues.attendance.map((row, index) => (
                            <tr key={row.studentId} className="border-t border-[#efede6] transition even:bg-[#fbfaf7] hover:bg-[#f4f8f5]">
                                <td className="whitespace-nowrap text-start font-medium text-stone-700">{row.firstName} {row.lastName}</td>
                                {statuses.map((s) => (<td key={s} className="text-center">
                                    <input
                                      type="radio"
                                      value={s}
                                      {...register(`attendance.${index}.status`)}
                                      className="h-4 w-4 cursor-pointer accent-[#86b59a]"
                                    />
                                </td>))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {errorMessage && <p className="flex items-center justify-center gap-1.5 rounded-xl border border-[#f1d5cb] bg-[#fbf1ec] px-4 py-3 text-sm text-[#a5533e]">
              <i className="ti ti-alert-circle"></i>{errorMessage}
            </p>}
            <button
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#86b59a] py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#6fa086] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            ><i className="ti ti-device-floppy"></i>{isPending?"שומר...":"שמירה"}</button>
        </form>
    </>)
}



export default LessonForm