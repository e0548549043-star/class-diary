

import { useQuery } from "@tanstack/react-query"
import { getUsers } from "../api/users"
import UsersTable from "../components/UsersTable"
import { Link, useParams } from "react-router-dom"
import { getClasses } from "../api/classes"
import { useState } from "react"

type SortBy = "name" | "attendanceAsc" | "attendanceDesc";

const ClassStudentsPage = () => {
    const { classId } = useParams()


    const usersQuery = useQuery({
        queryKey: ["users", "STUDENT", classId],
        queryFn: () => getUsers("STUDENT", classId),
    })

    const classesQuery = useQuery({
        queryKey: ["classes"],
        queryFn: getClasses,
        staleTime: Infinity
    })

    const [sortBy, setSortBy] = useState<SortBy>("name");

    const students = usersQuery.data?.items ?? [];

    const sortedStudents = [...students].sort((a, b) =>{
            if(sortBy==='name')
                return a.lastName.localeCompare(b.lastName, "he") || a.firstName.localeCompare(b.firstName, "he")
            const pa = a.stats?.attendancePercent ?? 0;
            const pb = b.stats?.attendancePercent ?? 0;
            return sortBy === "attendanceAsc"? pa-pb:pb-pa;
})

    const currentClass = classesQuery.data?.find((c) => c.id === Number(classId))

    if (usersQuery.isLoading) return <p>טוען...</p>;
    if (usersQuery.isError) return <p>{usersQuery.error.message}</p>;

   
    return (<div className="mx-auto max-w-2xl space-y-6 px-6 py-10">

        <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-[#3f5f4b]">
          <i className="ti ti-users text-[#86b59a]"></i>
          תלמידות כיתה  {currentClass?.name}
        </h2>
        <Link
          to={`/admin/classes/${classId}`}
          className="flex items-center gap-1.5 rounded-xl border border-[#d6d3c4] bg-white px-4 py-2 text-sm font-medium text-stone-600 transition hover:border-[#86b59a] hover:bg-[#eef4ef] hover:text-[#3f5f4b]"
        ><i className="ti ti-arrow-right"></i>חזרה ליומן הכיתה</Link>
        </div>
            <div className="flex items-center gap-2">
                <label htmlFor="orderby" className="flex items-center gap-1.5 text-sm font-medium text-stone-500">
                  <i className="ti ti-arrows-sort text-base text-[#86b59a]"></i>מיון לפי
                </label>
                <select
                  id="orderby"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="min-w-44 cursor-pointer rounded-xl border border-[#e7e5dc] bg-[#fbfaf7] px-3 py-2 text-sm text-stone-700 outline-none transition hover:border-[#86b59a] focus:border-[#86b59a] focus:ring-4 focus:ring-[#eef4ef]"
                >
                        <option value="name">שם</option>
                        <option value="attendanceAsc">נוכחות -מהנמוכה</option>
                        <option value="attendanceDesc">נוכחות -מהגבוהה</option>
                </select>
            </div>
        <UsersTable users={sortedStudents} showAttendance />

    </div>)
}

export default ClassStudentsPage