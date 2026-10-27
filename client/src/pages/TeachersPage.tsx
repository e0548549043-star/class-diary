import { useQuery } from "@tanstack/react-query"
import { getUsers } from "../api/users"
import UsersTable from "../components/UsersTable"



const TeachersPage=()=>{
    
   const usersQuery = useQuery({
    queryKey: ["users", "TEACHER"],
    queryFn: () => getUsers("TEACHER"),
    staleTime: Infinity
   })

   if (usersQuery.isLoading) return <p>טוען...</p>;
  if (usersQuery.isError) return <p>{usersQuery.error.message}</p>;

    return(<div className="mx-auto max-w-2xl space-y-6 px-6 py-10">
   <h2 className="flex items-center gap-2 text-2xl font-bold text-[#3f5f4b]">
     <i className="ti ti-users text-[#86b59a]"></i>
     מורות
   </h2>
   <UsersTable users={usersQuery.data?.items ??[]}/>
    
    </div>)
}

export default TeachersPage