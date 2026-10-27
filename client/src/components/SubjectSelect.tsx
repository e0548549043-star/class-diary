import { useQuery } from "@tanstack/react-query";
import { getSubjects } from "../api/subjects";

type Props = {
  value: string;
  onChange: (subjectId: string) => void;
  emptyLabel?: string
};

const SubjectSelect=({ value, onChange,emptyLabel="כל המקצועות" }: Props)=>{

    const { data: subjects } = useQuery({
  queryKey: ["subjects"],
  queryFn: getSubjects,
});

return(<>
    <div className="flex items-center gap-2">
        <label htmlFor="subject" className="flex items-center gap-1.5 text-sm font-medium text-stone-500"><i className="ti ti-book-2 text-base text-[#86b59a]"></i>מקצוע</label>
        <select
          value={value}
          id="subject"
          onChange={(e)=>onChange(e.target.value)}
          className="min-w-44 cursor-pointer rounded-xl border border-[#e7e5dc] bg-[#fbfaf7] px-3 py-2 text-sm text-stone-700 outline-none transition hover:border-[#86b59a] focus:border-[#86b59a] focus:ring-4 focus:ring-[#eef4ef]"
        >
           <option value="">{emptyLabel}</option>
            {subjects?.map((sub)=>(
                <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
        </select>
    </div>
</>
)
}

export default SubjectSelect
