import { User, X, Smartphone, Building2, Ampersand, Mail, CheckCircle2, Edit, Turtle } from "lucide-react";
import {  useContext, useEffect,  useMemo, useState } from "react";
import Spinner from "./Spinner";
import SelectInput from "./SelectInput";
import fetchData from "../utils/fetchData";
import API from "@/api/api";
import { MainContext } from "../contexts/MainContext";


export default function EditProfileModal({ setIsEditPhoneModalOpen, setIsActive, userData, setUser }) {
    const mainContextValue = useContext(MainContext)


    const [formConfig, setFormConfig] = useState([
        { code: "phone", icon: <Smartphone className="w-3.5 h-3.5 text-emerald-600" />, editable: false, title: "شماره تلفن", type: "text", isNumeric: true, regex: /^(?:09\d{9}|\+989\d{9})$/, value: userData.phone, error: "" },
        { code: "fname", icon: <User className="w-3.5 h-3.5 text-sky-600" />, editable: true, title: "نام", type: "text", isNumeric: false, value: userData.fname, error: "" },
        { code: "lname", icon: <User className="w-3.5 h-3.5 text-sky-600" />, editable: true, title: "نام خانوادگی", isNumeric: false, type: "text", value: userData.lname, error: "" },
        { code: "nationall_code", icon: <Ampersand className="w-3.5 h-3.5 text-sky-600" />, editable: true, title: "کد ملی", isNumeric: true, regex: /^\d{10}$/, type: "text", value: userData.nationall_code, error: "" },
        { code: "email", icon: <Mail className="w-3.5 h-3.5 text-sky-600" />, editable: true, title: "ایمیل", isNumeric: false, regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, type: "text", value: userData.email, error: "" },
        { code: "store_name", icon: <Building2 className="w-3.5 h-3.5 text-sky-600" />, editable: true, title: "نام فروشگاه", isNumeric: false, type: "text", value: userData?.store_name, error: "" },
    ])
    const [isSending, setIsSending] = useState(false)
    const [locations, setLocations] = useState([])
    const [selectedProvincePK, setSelectedProvincePK] = useState(userData?.province?.pk || null)
    const [isLoadnigLocations, setIsLoadingLocations] = useState(true)
    const [selectedCityPk, setSelcetedCityPk] = useState(userData?.city?.pk || null)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    useEffect(() => {
        setFormConfig(prev => [...prev].map(ele => ({ ...ele, value: userData[ele.code] })))
    }, [userData])

    useEffect(() => {
        fetchData("users/fetch-cities-provinces/", (response) => {
            const { data, status } = response
            if (status === 200) {
                setLocations(data)
                if (!selectedProvincePK) {
                    setSelectedProvincePK(data ? data[0]?.pk : null)
                }
                if (!selectedCityPk) {
                    setSelcetedCityPk(data ? data[0]?.city?.pk : null)
                }
            }
            setIsLoadingLocations(false)
        }, null, () => mainContextValue.onError("خطا در دریافت اطلاعات"))
    }, []);
    const provinces = useMemo(() => locations?.map((ele, idx) => {
        if (selectedProvincePK) {
            ele.selected = selectedProvincePK === ele.pk
            return ele
        }
        ele.selected = idx === 0
        return ele
    }), [locations, selectedProvincePK])


    const selectedProvince = provinces.find(ele => ele.selected)

    const cities = useMemo(() => selectedProvince?.cities?.map((ele, idx) => {
        if (selectedCityPk && selectedProvince?.cities.find(ele => ele.pk === selectedCityPk)) {
            ele.selected = ele.pk === selectedCityPk
            return ele
        }
        if (userData?.city) {
            ele.selected = userData?.city.pk === ele.pk
        }
        ele.selected = idx === 0
        return ele
    }), [selectedProvince , selectedCityPk , selectedProvince , userData])

    async function logout() {
        try {
            setIsLoggingOut(true)
            const { data, status } = await API.post("users/logout/")
            if (status === 200 && data.success) {
                localStorage.removeItem("accessToken")
            }
            setUser({ isAuthenticated: false, data: {} })
            setIsActive(false)
            setIsLoggingOut(false)
        } catch (e) {
            mainContextValue?.onError("خطا در فرایند خروج")
            setIsLoggingOut(false)
        }
    }


    async function handleSubmitProfile(e) {
        try {
            e.preventDefault()
            let isValidData = true
            const validatedData = {}
            const mappedFormConfig = formConfig.map(ele => {
                if (!ele.editable) {
                    return ele
                }
                if (ele.value && ele.regex && !ele.regex.test(ele.value)) {
                    ele.error = `لطفا یک مقدار معتبر برای ${ele.title} وارد کنید.`
                    isValidData = false
                }
                validatedData[ele.code] = ele.value
                return ele
            })
            setFormConfig(mappedFormConfig);
            if (isValidData) {
                setIsSending(true)
                validatedData["province_id"] = selectedProvincePK
                validatedData["city_id"] = selectedCityPk
                const { data, status } = await API.post("users/edit-profile/", { ...validatedData });
                if (status === 200) {
                    setUser({ isAuthenticated: true, data: data })
                } else if (status === 400) {
                    if (data.non_field_erros) {
                        mainContextValue.onError(data.non_field_erros)
                        
                    }
                    setFormConfig(prev => [...prev].map(ele => {

                        if (Object.keys(data).includes(ele.code)) {
                            ele.error = data[ele.code][0]
                        }
                        return ele
                    }))
                }
                setIsSending(false)
            }
        } catch (e) {
            mainContextValue.onError("خطایی در فرایند ارسال اطلاعات")
            setIsSending(false)
        }
    }



    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-fadeIn">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden my-auto">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-extrabold text-sm sm:text-base text-slate-100">ادیت پروفایل</h2>

                        </div>
                    </div>
                    <button
                        onClick={() => setIsActive(false)}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>






                <form onSubmit={handleSubmitProfile} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {formConfig.filter(ele => ele.type === "text").map(ele => (
                            <div key={ele.code}>
                                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex  items-center gap-1">
                                    {ele.icon}
                                    <span>{ele.title}</span>
                                    {ele.editable || <div onClick={() => { setIsEditPhoneModalOpen(true) }} className=" mr-auto  flex justify-center items-center gap-1 px-1 py-1 rounded-xl text-xs md:text-sm font-extrabold transition cursor-pointer whitespace-nowrap border mr-auto bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20">
                                        <span>تغییر شماره تلفن</span>
                                        <Edit className="mr-auto w-3.5 h-3.5 text-sky-600" />
                                    </div>}

                                </label>
                                <input
                                    type="text"
                                    value={ele.value}
                                    disabled={!ele.editable}
                                    onChange={(e) => {
                                        if (ele.isNumeric) {
                                            e.target.value = e.target.value.replace(/\D/g, "");
                                        }
                                        setFormConfig(prev => {
                                            const output = [...prev]
                                            return output.map(conf => {
                                                if (conf.code === ele.code) {
                                                    conf.value = e.target.value
                                                    if (conf.regex && e.target.value) {

                                                        if (e.target.value && !conf.regex.test(e.target.value)) {
                                                            conf.error = `لطفا یک مقدار معتبر برای ${ele.title} وارد کنید`;
                                                        } else {
                                                            conf.error = "";
                                                        }
                                                    } else {
                                                        conf.error = ""
                                                    }
                                                }
                                                return conf
                                            })
                                        });


                                    }}

                                    placeholder={ele.title}
                                    className={`w-full bg-slate-50 text-slate-900 text-xs p-3 rounded-xl border transition focus:outline-none focus:ring-2 focus:ring-sky-500 ${ele.error ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300'
                                        }`}
                                />

                                {ele.error && <p className="text-[11px] text-rose-600 mt-1">{ele.error}</p>}
                            </div>
                        ))}
                        <SelectInput labelProperty={"name"} isLoadingItems={isLoadnigLocations} selectedItem={provinces?.find(ele => ele.selected)} onItemSelected={(item) => { setSelectedProvincePK(item.pk); setSelcetedCityPk(item?.cities[0]?.pk) }} items={provinces} Icon={<Building2 className="w-3.5 h-3.5 text-sky-600" />} label={"استان"} />
                        <SelectInput labelProperty={"name"} isLoadingItems={isLoadnigLocations} selectedItem={cities?.find(ele => ele.selected)} onItemSelected={(item) => setSelcetedCityPk(item.pk)} items={cities} Icon={<Building2 className="w-3.5 h-3.5 text-sky-600" />} label={"شهر"} />
                    </div>

                    {/* Actions */}
                    <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                        <button
                            type="button"
                            disabled={isLoggingOut}
                            onClick={() => { logout() }}
                            className="px-4 py-2.5 rounded-xl border border-red-300 text-red-700 text-xs font-bold hover:bg-red-100 transition cursor-pointer"
                        >

                            {isLoggingOut ? <Spinner width={20} height={20} borderMainColor={"white"} borderWidth={1.5} borderTopColor={"red"} /> : "خروج"}
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsActive(false)}
                            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                        >
                            انصراف
                        </button>

                        <button
                            type="submit"
                            disabled={isSending}
                            className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition shadow-lg shadow-sky-600/30 flex items-center gap-2 cursor-pointer"
                        >
                            {isSending ? <Spinner width={20} height={20} borderMainColor={"white"} borderWidth={1.5} borderTopColor={"green"} /> : <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>تایید</span>
                            </>}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    )
}

