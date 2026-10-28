import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { AdminPermission, AdminSubTab, User, UserData } from "../types";
import {  ArrowRight, CheckCircle2, Edit3, KeyRound, Plus,    ShieldCheckIcon, Trash2, User as UserSVG, Users, X } from "lucide-react";
import { toPersianDigits } from "../utils/formatters";
import fetchData from "../utils/fetchData";
import StaffCreateModal from "./StaffCreateUserModel";
import Skeleton from "react-loading-skeleton";
import API from "@/api/api";
import Spinner from "./Spinner";
import { MainContext } from "../contexts/MainContext";
import compileErrorOBJToArray from "../utils/compileErrorsOBJToArray";

interface AdminStaffUserManageProps {
    user: UserData;
    ALL_ADMIN_PERMISSIONS: { id: AdminPermission; title: string; desc: string }[];
    setActiveAdminSubTab: Dispatch<SetStateAction<AdminSubTab>>
}

export default function AdminStaffUsersManage({ user, ALL_ADMIN_PERMISSIONS, setActiveAdminSubTab }: AdminStaffUserManageProps) {
    const mainContextValue = useContext(MainContext)


    const [adminUsers, setAdminUsers] = useState<User[]>([])
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false)
    const [editingAdmin, setEditingAdmin] = useState<null | User>(null)
    const [isLoadingAdminUsers, setIsLoadingAdminUsers] = useState(true)
    const [successMsg, setSuccessMsg] = useState('');
    const [deletingUserPK, setDeletingUserPK] = useState<string | number | null>(null)
    useEffect(() => {
        fetchData("users/admin-staff-users/", ({ data, status }) => {
            if (status === 200) {

                setAdminUsers(data)
            } else {
                const e = data.error_des || data.details || "خطای غیر منتظره"

                mainContextValue?.onError(typeof e === "object" ? mainContextValue.onError(compileErrorOBJToArray(e)?.join(",")) : e)
            }
            setIsLoadingAdminUsers(false)
        }, () => setIsLoadingAdminUsers(true), () => mainContextValue?.onError("خطایی رخ داده است!"))
    }, [])

    const handleDeleteUser = async (adminUser: User): Promise<void | null> => {
        try {
            if (!adminUser.pk) {
                mainContextValue?.onError("ایدی یافت نشد")
                return;
            }
            setDeletingUserPK(adminUser.pk)
            setTimeout(() => { }, 3000)
            const { data, status } = await API.delete("users/admin-user-delete/" + adminUser.pk + "/")
            if (status === 200) {
                setAdminUsers(prev => [...prev].filter(ele => ele?.pk !== adminUser?.pk))
                setSuccessMsg("حساب با موفقیت حذف شد!")
                setTimeout(() => setSuccessMsg(""), 1500)
            } else {
                const e = data.error_des || data.detail || "خطایی رخ داد!"
                mainContextValue?.onError(typeof e === "object" ? mainContextValue.onError(compileErrorOBJToArray(e)?.join(",")) : e)

            }
            setDeletingUserPK(null)
        } catch (e) {
            mainContextValue?.onError("خطایی غیر منتظره رخ داده است!")
            setDeletingUserPK(null)

        }
    }

    return (
        <div className="space-y-6 animate-fadeIn dir-rtl">

            {/* Subtab Header */}
            <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white rounded-3xl p-6 border border-purple-800/40 shadow-xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-500 text-slate-950 rounded-2xl font-black shadow-lg">
                        <ShieldCheckIcon className="w-7 h-7" />
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-1.5 bg-purple-500/20 text-purple-300 text-[11px] font-bold px-3 py-0.5 rounded-full border border-purple-500/30 mb-1">
                            <Users className="w-3.5 h-3.5" />
                            <span>مدیریت چندکاربره و تعیین سطح دسترسی</span>
                        </div>
                        <h3 className="text-xl font-black">تعریف مدیران سیستم و رمزهای عبور اختصاصی</h3>
                        <p className="text-xs text-slate-300 mt-1">
                            تعریف حساب‌های مدیریتی، تعیین نقش‌ها (سوپرمدیر، مدیر فروش، حسابدار، اپراتور انبار) و اختصاص دسترسی‌های تفکیک‌شده بدون تداخل کاری.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {

                            setIsAdminModalOpen(true);
                        }}
                        className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>+ تعریف مدیر جدید</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveAdminSubTab('main_dashboard')}
                        className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-2xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                    >
                        <ArrowRight className="w-4 h-4" />
                        <span>بازگشت به داشبورد (Esc)</span>
                    </button>
                </div>
            </div>

            {/* Admin Stats Summary Grid */}
            {successMsg && (
                <div className="bg-emerald-100 text-emerald-900 p-4 rounded-2xl border border-emerald-300 font-bold text-xs flex items-center gap-2 animate-bounce">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>{successMsg}</span>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
                    <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-slate-500 block">تعداد مدیران فعال سیستم</span>
                        <span className="text-lg font-black text-slate-900 font-mono">{toPersianDigits(adminUsers?.length)} مدیر</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
                    <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-slate-500 block">حساب‌های فعال آماده بکار</span>
                        <span className="text-lg font-black text-emerald-700 font-mono">
                            {toPersianDigits(adminUsers?.filter(u => u.is_active).length)} حساب فعال
                        </span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
                    <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                        <KeyRound className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-slate-500 block">مدیر آنلاین فعلی شما</span>
                        <span className="text-xs font-black text-slate-900 truncate block max-w-[200px]">
                            {user.data?.is_superuser ? "کاربر برتر" : "کاربر ادمین"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Admin Accounts Table & Cards */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span>لیست مدیران تعریف شده و سطوح دسترسی ({toPersianDigits(adminUsers.length)})</span>
                    </h4>

                    <span className="text-[11px] text-slate-500">
                        💡 هر مدیر با رمز عبور اختصاصی خود وارد شده و دسترسی‌های تعیین‌شده را خواهد داشت.
                    </span>
                </div>

                <div className="divide-y divide-slate-100">
                    {isLoadingAdminUsers ? (
                        Array(6).fill({}).map(() => {
                            return (
                                <div className="p-4 hover:bg-slate-50/80 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-3.5">
                                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-lg shadow-xs shrink-0 `}>
                                            <Skeleton width={45} height={45} circle />
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Skeleton width={100} height={30} />
                                            </div>
                                            <div>
                                                <Skeleton width={50} height={30} />

                                            </div>


                                            {/* Permissions Badges */}
                                            <div className="pt-1 flex flex-wrap gap-1">
                                                <Skeleton width={50} height={30} />

                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                                        <Skeleton width={60} height={30} />

                                    </div>
                                </div>
                            )
                        })
                    ) : (adminUsers.length === 0 ? <div className="w-full h-30 flex flex-col items-center justify-center">
                        <UserSVG size={30} className="text-gray-600" />
                        <span className="font-semibold text-gray-600 text-xl">
                            هیچ کاربری یافت نشد!
                        </span>
                    </div> : adminUsers.map((adminUser) => {
                        const isSuper = adminUser.is_superuser;
                        const isCurrent = user?.data?.pk === adminUser.pk;
                        const isDeleting = (deletingUserPK && false) && deletingUserPK === adminUser.pk

                        return (
                            <div key={adminUser.pk} className="p-4 hover:bg-slate-50/80 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-3.5">
                                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-lg shadow-xs shrink-0 `}>
                                        <UserSVG />
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h5 className="font-black text-sm text-slate-900"> {(adminUser.fname && adminUser.lname) ? (adminUser.fname || "") + " " + (adminUser.lname || "") : "ثبت نشده"}</h5>
                                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${isSuper ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-sky-100 text-sky-800 border-sky-200'
                                                }`}>
                                                {adminUser.is_superuser ? "کاربر برتر" : "کابر ادمین"}

                                            </span>

                                            {isCurrent && (
                                                <span className="text-[10px] font-extrabold bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow-xs">
                                                    حساب جاری شما (آنلاین)
                                                </span>
                                            )}

                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${adminUser.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                                }`}>
                                                {adminUser.is_active ? 'فعال' : 'غیرفعال'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-md font-semibold text-gray-600">
                                                {adminUser.phone}
                                            </span>
                                        </div>


                                        {/* Permissions Badges */}
                                        <div className="pt-1 flex flex-wrap gap-1">
                                            {isSuper ? (
                                                <span className="text-[10px] bg-purple-900 text-purple-100 font-extrabold px-2.5 py-0.5 rounded-md border border-purple-700">
                                                    ⚡ دسترسی نامحدود به تمام بخش‌های پنل
                                                </span>
                                            ) : (
                                                <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md border border-slate-200">
                                                    دسترسی به سفارش ها ، محصولات ، درخواست های مرجوعی و ...
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingAdmin(adminUser);
                                            setIsAdminModalOpen(true);
                                        }}
                                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-slate-300"
                                    >
                                        <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                                        <span>ویرایش دسترسی و رمز</span>
                                    </button>



                                    {!isCurrent && (
                                        <button
                                            type="button"
                                            disabled={isDeleting ? true : false}
                                            onClick={() => {
                                                if (window.confirm("ایا از حذف این حساب اطمینان دارید؟")) {
                                                    handleDeleteUser(adminUser)


                                                }
                                            }}
                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                                            title="حذف مدیر"
                                        >
                                            {isDeleting ? <Spinner width={17.5} height={17.5} borderMainColor={"white"} borderTopColor={"red"} borderWidth={1.75} /> :
                                                <Trash2 className="w-4 h-4" />
                                            }
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    }))}
                </div>
            </div>
            {isAdminModalOpen && (
                <StaffCreateModal onClose={() => {
                    setIsAdminModalOpen(false);
                    setEditingAdmin(null);
                }} setAdminUsers={setAdminUsers} adminUsers={adminUsers} setEditingAdmin={setEditingAdmin} editingAdmin={editingAdmin} />
            )}
        </div>
    )

}