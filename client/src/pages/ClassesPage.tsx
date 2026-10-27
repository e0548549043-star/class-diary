import { useQuery } from "@tanstack/react-query";
import { getClasses } from "../api/classes";
import { Link } from "react-router-dom";

type Props={
    basePath: string;
}

const ClassesPage = ({basePath}:Props) =>{

    const classesQuery=useQuery({
    queryKey:["classes"],
    queryFn:getClasses,
    staleTime:Infinity
})  

if (classesQuery.isLoading) return <p>טוען...</p>;
  if (classesQuery.isError) return <p>{classesQuery.error.message}</p>;

return(<>
<div className="mx-auto max-w-5xl px-6 py-10">
    <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-[#3f5f4b]"><i className="ti ti-books text-[#86b59a]"></i>כיתות</h2>
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {classesQuery.data?.map((c)=>(
            <Link
              to={`${basePath}/${c.id}`}
              key={c.id}
              className="group flex items-center gap-3 rounded-2xl border border-[#e7e5dc] border-t-4 border-t-[#86b59a] bg-white p-5 font-semibold text-stone-700 transition hover:-translate-y-0.5 hover:border-[#86b59a] hover:shadow-md"
            >
              <i className="ti ti-school flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eef4ef] text-2xl text-[#86b59a] transition group-hover:bg-[#86b59a] group-hover:text-white"></i>
              {" "}כיתה {c.name}
              <i className="ti ti-chevron-left ms-auto text-stone-300 transition group-hover:-translate-x-1 group-hover:text-[#86b59a]"></i>
            </Link>
        ))}
    </div>
</div>
    
</>
)
}

export default ClassesPage