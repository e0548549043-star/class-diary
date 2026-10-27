import { yupResolver } from "@hookform/resolvers/yup";
import {  useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { login } from "../api/auth";
import type { User } from "../typs/user";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

type LoginForm={
   idNumber:string,
   password:string
}

const schema = yup.object({
   idNumber:yup.string().required("יש להזין תעודת זהות").matches(/^\d{9}$/, "יש להזין 9 ספרות"),
   password:yup.string().required("הזן סיסמה").min(6,"הסיסמא צריכה להכיל לפחות 6 תווים").max(72,"סיסמא ארוכה מדי")
})



const Login=()=>{

   const {setUser} = useUser();
   const navigate = useNavigate()

   const loginMutation =useMutation({
     mutationFn:(data:LoginForm)=>login(data.idNumber,data.password),
     onSuccess: (user:User) => {setUser(user);
          navigate(user.role === "ADMIN" ? "/admin" : "/teacher",{replace:true})
     },
     onError:()=>resetField("password")
   })

  const {register,handleSubmit,formState:{errors},resetField} = useForm<LoginForm>(
  {resolver: yupResolver(schema),}
  );



    return(<>
<form
  onSubmit={handleSubmit((data)=>loginMutation.mutate(data))}
  className="mx-auto mt-24 w-full max-w-sm space-y-6 rounded-2xl border border-[#e7e5dc] border-t-[6px] border-t-[#86b59a] bg-white p-8 shadow-sm"
>
    <div className="text-center">
      <i className="ti ti-notebook mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#eef4ef] text-3xl text-[#86b59a]"></i>
      <h2 className="text-2xl font-bold text-[#3f5f4b]">כניסה ליומן הכיתה</h2>
    </div>

    <div>
      <label htmlFor="idNumber" className="flex items-center gap-1.5 text-sm text-stone-500"><i className="ti ti-id text-base text-[#86b59a]"></i>ת.ז:</label>
      <input
        id="idNumber"
        {...register("idNumber")}
        className="w-full border-0 border-b-2 border-[#d6d3c4] bg-transparent px-1 py-2 text-stone-700 outline-none transition focus:border-[#86b59a]"
      />
      {errors.idNumber&&<p className="mt-1 text-sm text-[#c0705b]">{errors.idNumber.message}</p>}
    </div>
     <div>
      <label htmlFor="password" className="flex items-center gap-1.5 text-sm text-stone-500"><i className="ti ti-lock text-base text-[#86b59a]"></i>הסיסמא שלך:</label>
      <input
        id="password"
        type="password"
        {...register("password")}
        className="w-full border-0 border-b-2 border-[#d6d3c4] bg-transparent px-1 py-2 text-stone-700 outline-none transition focus:border-[#86b59a]"
      />
      {errors.password&&<p className="mt-1 text-sm text-[#c0705b]">{errors.password.message}</p>}
    </div>

    <button
      disabled={loginMutation.isPending}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#86b59a] py-3 font-semibold text-white transition hover:bg-[#6fa086] disabled:cursor-not-allowed disabled:opacity-60"
    ><i className="ti ti-login-2"></i>{loginMutation.isPending? "מתחבר":"התחברות"}</button>

   {loginMutation.isError && <p className="flex items-center justify-center gap-1.5 rounded-xl border border-[#f1d5cb] bg-[#fbf1ec] px-4 py-2.5 text-sm text-[#a5533e]"><i className="ti ti-alert-circle"></i>{loginMutation.error.message}</p>}

</form>
   </>);
}
export default Login