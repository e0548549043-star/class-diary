import { useState } from "react";
import type { User } from "../typs/user";
import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "../api/users";

type Props = {
    user: User;
    
    onClose: () => void;
}


const ResetPasswordDialog = ({ user, onClose }: Props) => {
    const [password, setPassword] = useState("")
  
    const mutation = useMutation({
        mutationFn: () => resetPassword(user.id, password),
        onError: () => setPassword(""),
    })


    if (mutation.isSuccess) {
        return <><div>הסיסמה של {user.firstName} {user.lastName} שונתה</div>
            <button onClick={onClose}>סגירה</button>   </>
    }

    return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f7f5ef]/60 p-4 backdrop-blur-[2px]">
    <div className="w-full max-w-sm rounded-2xl border border-[#e7e5dc] border-t-[6px] border-t-[#86b59a] bg-white p-6 shadow-2xl shadow-[#86b59a]/25">

        <h3 className="mb-5 flex items-start gap-2 text-lg font-bold leading-snug text-[#3f5f4b]"><i className="ti ti-key mt-0.5 text-xl text-[#86b59a]"></i><span>איפוס סיסמה ל {user.firstName} {user.lastName}</span></h3>

        <label htmlFor="password" className="flex items-center gap-1.5 text-sm text-stone-500"><i className="ti ti-lock text-base text-[#86b59a]"></i>סיסמה חדשה</label>
        <input
          type="password"
          id="password"
          maxLength={72}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-5 w-full border-0 border-b-2 border-[#d6d3c4] bg-transparent px-1 py-2 text-stone-700 outline-none transition focus:border-[#86b59a]"
        />

        {mutation.isError && <p className="mb-4 flex items-center justify-center gap-1.5 rounded-xl border border-[#f1d5cb] bg-[#fbf1ec] px-4 py-2.5 text-sm text-[#a5533e]"><i className="ti ti-alert-circle"></i>{mutation.error.message}</p>}

        <div className="flex gap-3">
        <button onClick={()=>mutation.mutate()} disabled={mutation.isPending || password.length < 6} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#86b59a] py-2.5 text-sm font-semibold text-white transition hover:bg-[#6fa086] disabled:cursor-not-allowed disabled:opacity-50"><i className="ti ti-device-floppy"></i> {mutation.isPending ? "שומר..." : "שמירה"}</button>
        <button onClick={onClose} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#d6d3c4] py-2.5 text-sm font-medium text-stone-600 transition hover:border-[#86b59a] hover:bg-[#eef4ef] hover:text-[#3f5f4b]"><i className="ti ti-x"></i>ביטול</button>
        </div>

    </div>
    </div>)
}
export default ResetPasswordDialog