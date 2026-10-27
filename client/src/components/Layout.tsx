import { NavLink, Outlet } from "react-router-dom"
import { useUser } from "../context/UserContext"



const Layout=()=>{
   
    const {logout,user}=useUser();

    return(<>

    <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b border-[#e7e5dc] border-t-4 border-t-[#86b59a] bg-white/90 px-8 py-5 backdrop-blur md:grid md:grid-cols-[1fr_auto_1fr]">

     <h1 className="flex items-center gap-3 text-2xl font-bold text-[#3f5f4b]">
       <i className="ti ti-notebook flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef4ef] text-2xl text-[#86b59a]"></i>
       היומן הדיגטלי ❤️
     </h1>

        <nav className="flex gap-1 rounded-xl bg-[#f7f5ef] p-1.5">
          {user?.role==='ADMIN'&&(
          <>
          <NavLink
            to="/admin/classes"
            className="flex items-center gap-1.5 rounded-lg px-5 py-2 font-medium text-stone-500 transition hover:text-[#3f5f4b] aria-[current=page]:bg-white aria-[current=page]:text-[#3f5f4b] aria-[current=page]:shadow-sm"
          ><i className="ti ti-school"></i>כיתות</NavLink>
          <NavLink
            to="/admin/teachers"
            className="flex items-center gap-1.5 rounded-lg px-5 py-2 font-medium text-stone-500 transition hover:text-[#3f5f4b] aria-[current=page]:bg-white aria-[current=page]:text-[#3f5f4b] aria-[current=page]:shadow-sm"
          ><i className="ti ti-users"></i>מורות</NavLink>
          </>
          )}
           {user?.role==='TEACHER'&&(
          <>
          <NavLink
            to="/teacher/classes"
            className="flex items-center gap-2 rounded-lg px-10 py-2.5 text-lg font-semibold text-stone-500 transition hover:text-[#3f5f4b] aria-[current=page]:bg-white aria-[current=page]:text-[#3f5f4b] aria-[current=page]:shadow-sm"
          ><i className="ti ti-school text-xl"></i>כיתות</NavLink>
          </>
          )}
        </nav>

        <div className="flex items-center gap-4 md:justify-self-end">
        <span className="flex items-center gap-1.5 text-stone-600">
          <i className="ti ti-user-circle text-xl text-[#86b59a]"></i>
          {user?.firstName} {user?.lastName}
        </span> 
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-1.5 rounded-xl border border-[#d6d3c4] px-4 py-2 text-sm text-stone-600 transition hover:border-[#e2b4a5] hover:bg-[#fbf1ec] hover:text-[#a5533e]"
        ><i className="ti ti-logout"></i>התנתקות</button>   
        </div>

    </header>
      


    <Outlet/>
   </> )
}

export default Layout