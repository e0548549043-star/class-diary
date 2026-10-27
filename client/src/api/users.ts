import type { UsersResponse } from "../typs/user";
import request from "./api";


export function getUsers(role: string, classId?: string){
   const respons= request<UsersResponse>("/users",{query:{role,classId,pageSize: 100}})
   return respons;
}

export function resetPassword(userId:number,password:string){
  return   request<void>(`/users/${userId}/password`,{method:'PATCH',body:{password}})
}