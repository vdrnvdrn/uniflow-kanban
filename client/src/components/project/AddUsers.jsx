import api from "../../api"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import GlassModal from "../ui/GlassModal"

const AddUsers = ({ addUser, open, onClose }) => {
    const { t } = useTranslation()
    const [query, setQuery] = useState('')
    const [users, setUsers] = useState([])

    const search = (query) => {
        api.post("/api/user/search", { query })
            .then(({ data }) => {
                setUsers(data)
            })
            .catch(() => {})
    }

    return (
        <GlassModal
            open={open}
            onClose={onClose}
            title={t("addMemberTitle")}
            footer={
                <button className="glass-btn-secondary px-4 py-2" onClick={onClose}>
                    {t("close")}
                </button>
            }
        >
            <div className="mb-3">
                <label className="text-white/70 text-sm font-medium block mb-1.5">{t("nameOrEmail")}</label>
                <div className="flex gap-2">
                    <input className="glass-input flex-1" placeholder={t("searchPlaceholder")} type="text" onChange={(event) => { setQuery(event.target.value) }} />
                    <button className="glass-btn-primary px-4 py-2" onClick={() => { search(query) }}>{t("search")}</button>
                </div>
                <div className="border border-white/10 rounded-lg my-3 p-3 max-h-[250px] overflow-y-auto">
                    {users.map(user =>
                        <div className="border border-white/10 flex justify-between items-center rounded-lg my-2 px-4 py-2 hover:bg-white/5 transition-colors" key={user.id}>
                            <div className="text-white text-base">
                                {user.fullName}
                            </div>
                            <button className="glass-btn-outline glass-btn-sm" onClick={() => addUser(user.id)}>{t("addButton")}</button>
                        </div>)
                    }
                </div>
            </div>
        </GlassModal>
    )
}

export default AddUsers
