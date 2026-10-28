import { Dispatch,  SetStateAction, SubmitEvent, useContext, useState } from "react";
import { FormConfig, User } from "../types";
import { Save, ShieldCheck, X } from "lucide-react";
import { AxiosResponse } from "axios";
import API from "@/api/api";
import Spinner from "./Spinner";
import { MainContext, MainContextValue } from "../contexts/MainContext";

interface StaffCreateModalProps {
    editingAdmin: User | null;
    onClose: () => void,
    setEditingAdmin: Dispatch<SetStateAction<null | User>>;
    setAdminUsers: Dispatch<SetStateAction<User[]>>;
    adminUsers: User[];

}

export default function StaffCreateModal({ editingAdmin, setAdminUsers, setEditingAdmin, adminUsers, onClose }: StaffCreateModalProps) {
    const mainCotextValue = useContext<MainContextValue>(MainContext)

    const [formConfig, setFormConfig] = useState<FormConfig[]>([
        { label: "نام", code: "fname", value: editingAdmin?.fname || "", isNumeric: false, regex: null, required: true, error: "" },
        { label: "نام خانوادگی", code: "lname", value: editingAdmin?.lname || "", isNumeric: false, regex: null, required: true, error: "" },
        { label: "شماره تلفن", code: "phone", value: editingAdmin?.phone || "", isNumeric: true, regex: /^09\d{9}$/, required: true, error: "" },
        { label: "رمز عبور", code: "password", value: "", isNumeric: false, regex: null, required: editingAdmin ? false : true, error: "" },
        { label: "ایمیل", code: "email", value: editingAdmin?.email || "", isNumeric: false, regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, required: false, error: "" },
    ]);


    const [isActive, setIsActive] = useState<boolean>(editingAdmin?.is_active || false)
    const [userRole, setUserRole] = useState<"superuser" | "staff_user" | string>(editingAdmin?.is_superuser ? "superuser" : "staff_user")
    const [userRoleError, setUserRoleError] = useState("")

    const [isLoading, setIsLoading] = useState(false)
    


    const handleFormSubmit = async (e: SubmitEvent<HTMLFormElement>) :Promise<void> => {
        try {
            e.preventDefault()
            const formData: Record<string, any > = {};
            let isValid = true
            const compiledConfig = formConfig.map(conf => {
                conf.error = ""
                if (conf.required && !conf.value) {
                    conf.error = "مقدار این فیلد اجباری است!"
                    isValid = false
                    return conf
                }

                if (conf.value && conf.regex && !conf.regex.test(String(conf.value))) {
                    conf.error = `لطفا یک مقدار معتبر برای ${conf.label} وارد کنید!`
                    isValid = false;
                    return conf;
                }


                formData[conf.code] = conf.value
                return conf
            });

            setFormConfig(compiledConfig)

            if (!userRole) {
                return;
            }

            
            
            formData["role"] = userRole
            formData["is_active"] = isActive
            if (isValid) {
                setIsLoading(true)
                const { data, status }: AxiosResponse = await (editingAdmin ? API.put("users/admin-user-update/" + editingAdmin.pk + "/", formData) : API.post("users/admin-user-create/", formData))
                if (status === 200) {
                    if (editingAdmin) {
                        setAdminUsers(prev => [...prev].map(admin => {
                            if (admin.pk === data.user.pk) {
                                return data.user
                            }
                            return admin
                        }))
                    } else {
                        setAdminUsers(prev => [...prev, data.user])
                    }
                    onClose()
                } else {
                    const e = data.error_des || data.detail || "خطای غیر منتظره"
                    if (typeof e === "object") {
                        setFormConfig(prev => [...prev].map(conf => {
                            if (e[conf.code]) {
                                conf.error = e[conf.code][0]
                            }
                            return conf
                        }))
                    }
                }
                setIsLoading(false)

            }
        } catch (e) {
            mainCotextValue?.onError("خطا در برقرار ارتباط با سرور ")
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto dir-rtl">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative border border-slate-200 my-8">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900">
                                {editingAdmin?.pk && adminUsers.some(u => u.pk === editingAdmin?.pk) ? 'ویرایش حساب و سطح دسترسی مدیر' : 'تعریف مدیر جدید سیستم'}
                            </h3>
                            <p className="text-[11px] text-slate-400">تعیین اطلاعات فردی، رمز عبور ورود و تیک‌زدن دسترسی‌های مجاز</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form
                    onSubmit={(e) => {
                        handleFormSubmit(e)
                    }}
                    className="space-y-4 text-xs"
                >
                    {/* Name & Role Title Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {formConfig.map(conf => {
                            return (
                                <div>
                                    <label className="font-extrabold text-slate-700 block mb-1">{conf.label}: {conf.required && "*"}</label>
                                    <input
                                        type="text"
                                        value={(conf?.value || "" )as string}
                                        onChange={(e) => {
                                            let value = e.target.value
                                            if (conf.isNumeric) {
                                                value = value.replace(/\D/g, '');
                                            }
                                            setFormConfig(prev => [...prev].map(ele => {
                                                if (conf.code === ele.code) {
                                                    ele.value = value
                                                }
                                                return ele
                                            }))
                                        }}
                                        placeholder={conf.label}
                                        className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:bg-white focus:border-purple-600 outline-none"
                                    />
                                    {conf.error &&
                                        <p className="text-red-700">
                                            {conf.error}
                                        </p>
                                    }
                                </div>
                            )
                        })}



                        <div>
                            <label className="font-extrabold text-slate-700 block mb-1">نوع نقش سازمانی: *</label>
                            <select
                                value={userRole}
                                onChange={(e) => {

                                    setUserRole(e.target.value)
                                }}
                                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:bg-white focus:border-purple-600 outline-none"
                            >
                                <option value="superuser">⚡ سوپرمدیر (دسترسی کامل به همه‌چیز)</option>
                                <option value="staff_user">
                                    کارمند
                                </option>

                            </select>
                            {userRoleError &&
                                <p className="text-red-600">
                                    {userRole}
                                </p>
                            }
                        </div>


                    </div>



                    {/* Account Status Toggle */}
                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <span className="font-extrabold text-slate-800">وضعیت حساب مدیریتی:</span>
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.currentTarget.checked)}
                                className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                            />
                            <span className={`font-bold ${editingAdmin?.is_active !== false ? 'text-emerald-700' : 'text-rose-600'}`}>
                                فعال(قابلیت ورود)
                            </span>
                        </label>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                        >
                            انصراف
                        </button>

                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
                        >
                            {isLoading ? <Spinner width={20} height={20} borderMainColor={"white"} borderTopColor={"purple"} borderWidth={1.75} /> : <>
                                <Save className="w-4 h-4" />
                                <span>ذخیره اطلاعات مدیر</span>
                            </>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}