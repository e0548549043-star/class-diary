import { useState } from "react";
import type { User } from "../typs/user"
import ResetPasswordDialog from "./ResetPasswordDialog";


type Props = {
    users: User[],
    showAttendance?: boolean;
}

const UsersTable = ({ users, showAttendance = false }: Props) => {

    const [selectedUser, setSelectedUser] = useState<User | null>(null);

     return (<>

        {selectedUser && <ResetPasswordDialog key={selectedUser.id} user={selectedUser} onClose={() => setSelectedUser(null)} />}

        <div className="mx-auto max-w-2xl overflow-x-auto rounded-2xl border border-[#e7e5dc] bg-white shadow-sm">
        <table className="w-full text-sm [&_td]:px-4 [&_td]:py-3 [&_td]:text-start [&_th]:px-4 [&_th]:py-3 [&_th]:text-start [&_td:first-child]:ps-3 [&_th:first-child]:ps-3">
            <thead className="bg-[#eef4ef] text-[#3f5f4b]">
                <tr>
                <th className="font-semibold">שם</th>
                <th className="font-semibold">ת.ז</th>
                {showAttendance && <th className="font-semibold">נוכחות</th>}
                {!showAttendance && <th></th>}
                </tr>
            </thead>
            <tbody>
                {users.map((user) => (
                    <tr key={user.id} className="border-t border-[#efede6] transition even:bg-[#fbfaf7] hover:bg-[#f4f8f5]">
                        <td className="whitespace-nowrap font-medium text-stone-700"><i className="ti ti-user-circle me-1 align-middle text-base text-[#86b59a]"></i>{user.firstName} {user.lastName}</td>
                        <td className="whitespace-nowrap tabular-nums text-stone-500">{user.idNumber}</td>
                        {showAttendance && <td className="whitespace-nowrap font-semibold tabular-nums text-[#3f5f4b]">{user.stats ? user.stats.attendancePercent + "%" : "-"}</td>}
                        {!showAttendance && <td><button onClick={() => setSelectedUser(user)} className="ms-auto flex items-center gap-1 whitespace-nowrap rounded-lg border border-[#d6d3c4] px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:border-[#86b59a] hover:bg-[#eef4ef] hover:text-[#3f5f4b]"><i className="ti ti-key"></i>איפוס סיסמה</button></td>}
                    </tr>
                ))}

            </tbody>
        </table>
        </div>

    </>)
}
export default UsersTable