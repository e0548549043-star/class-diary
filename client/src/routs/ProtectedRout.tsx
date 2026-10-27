import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../context/UserContext";
import type { Role } from "../typs/user";





const ProtectedRout = ({role}:{role:Role})=>{

const { user ,isLoding} = useUser();
  
  if(isLoding)
    return <p>טוען</p>
  if(!user)
    return <Navigate to="/login" replace />

  if(user.role!==role)
  {
     return <Navigate to={user.role==='ADMIN'?"/admin":"'/teacher'"}/>
  }

  return <Outlet/>

}

export default ProtectedRout