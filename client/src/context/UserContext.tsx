import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "../typs/user"
import {getMe, logout as lo} from "../api/auth"
import { getToken } from "../api/api";
import { useQueryClient } from "@tanstack/react-query";





type UserContextType ={
   user:User | null,
   setUser: (user:User)=>void,
   logout: () => void,
   isLoding:boolean,
}


 const UserContext = createContext<UserContextType | null >(null);


export function UserProvider({ children }: { children: ReactNode }){
    const [user, setUser] = useState<User | null>(null)
    const [isLoding,setLoding] = useState<boolean>(getToken()!=null)
    const quaryClient =useQueryClient()

    useEffect(()=>{
     if(!isLoding)
       return
      if(!user){
        getMe()
         .then((user) => setUser(user))
         .catch(() => setUser(null))
         .finally(() => setLoding(false));
      }
    },[])

    const logout=()=>{
        lo()
        quaryClient.clear()
        setUser(null)
    }

    return (
  <UserContext.Provider value={{ user, setUser, logout ,isLoding}}>
    {children}
  </UserContext.Provider>
);
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used inside UserProvider");
  return context;
}
