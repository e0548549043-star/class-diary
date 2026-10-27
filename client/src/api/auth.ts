import request, { clearToken, saveToken } from "./api";
import type { LoginResponse, User } from "../typs/user";


export async function login(idNumber:string,password:string){
     const response=await request<LoginResponse>("/auth/login",{method:'POST',body:{idNumber,password}})
     saveToken(response.token);
     return response.user;
}

export  function getMe() {
    const response= request<User>("/auth/me",{method:'GET'})
    return response
}

export function logout(){
    clearToken();
}