import { useState, useEffect, ReactElement, Dispatch, SetStateAction, useContext } from "react";
import { ReturnRequest, StoreSettings, UserData } from "../types";
import fetchData from "../utils/fetchData";

import { Inbox, PackageX } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import { formatPrice } from "../utils/formatters";
import { MainContext } from "../contexts/MainContext";


interface CustomerReturnRequestProps {
    user: UserData;
    setIsAuthModalOpen: Dispatch<SetStateAction<boolean>>
    storeSettings: StoreSettings
}
export default function CustomerReturnRequests({ user, storeSettings, setIsAuthModalOpen }: CustomerReturnRequestProps) {
    const mainContextValue = useContext(MainContext)

    const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([])
    const [isLoadingReturnRequests, setIsLoadingReturnRequests] = useState<boolean>(false)
    const [status, setStatus] = useState<ReturnRequest["status"] | "all">("all")

    useEffect(() => {
        try {
            const urlSearchParams = new URLSearchParams()

            if (status !== "all") {
                urlSearchParams.set("status", status)
            }
            fetchData("orders/user-return-requests/" +`?${urlSearchParams.toString()}`, ({ data, status }) => {
                if (status === 200) {

                    setReturnRequests(data)
                } else {
                    const e = data.error_des || data.detail || "خطا در برقرار ارتباط"
                    mainContextValue?.onError(e)
                }
                setIsLoadingReturnRequests(false)
            }, () => setIsLoadingReturnRequests(true) , () => mainContextValue?.onError("خطایی رخ داده است"))
        } catch (e) {
             mainContextValue?.onError("خطایی رخ داده است")
        }
    }, [status])


    const getStatusBedge = (status: string): ReactElement => {
        switch (status) {
            case "pending":
                return (
                    <span className="p-1 border-amber-500/50 bg-amber-500/50 border-2  text-white  rounded-xl">
                        در حال بررسی توسط ادمین
                    </span>
                )
            case "approved":
                return (
                    <span className="p-1 border-2 border-emerald-700 bg-emerald-700/50 text-white  rounded-xl">
                        تایید شده توسط مدیر
                    </span>
                )
            case "rejected":
                return (
                    <span className="p-1 border-2 border-red-600 bg-red-600/50 text-white  rounded-xl">
                        رد شده
                    </span>
                )
            case "received":
                return (
                    <span className="p-1 border-2 border-green-600 bg-green-600/50 text-white  rounded-xl">
                        کالا دریافت شده
                    </span>
                )
            case "refunded":
                return (
                    <span className="p-1 border-2 border-green-600 bg-green-600/50 text-white  rounded-xl">
                        وجه بازگشت داده شد
                    </span>
                )
            case "canceled":
                return (
                    <span className="p-1 border-2 border-orange-600 bg-orange-600/50 text-white  rounded-xl">
                        کنسل شده
                    </span>
                )
            default:
                return (
                    <span>
                        ثبت نشده
                    </span>
                )
            }
    }

    const getReasonPersionText = (reasonDBName: string): string => {
        switch (reasonDBName) {
            case "damaged":
                return "کالا اسیب دیده"
            case "wrong_item":
                return "کالای اشتباه"
            case "defective":
                return "کالای معیوب"
            case "not_as_describe":
                return "کالای ارسالی مطابق توضیحات نیست"
            case "change_of_mind":
                return "انصراف از خرید"
            case "other":
                return "سایر"
            default:
                return "تبت نشده"
        }

    }

    

    return (
        <div className="my-1">
            <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 rounded-t-2xl ">
                <div className="flex justify-center items-center gap-5 ">
                    <div className="flex items-center gap-5">
                        <div className="p-1.5  bg-sky-800 w-15 h-15 flex items-center justify-center rounded-2xl">
                            <PackageX className="" size={30} />
                        </div>
                    </div>
                    <div className="flex flex-col ">
                        <span className="text-md font-bold">
                            درخواست های مرجوعی مشتری
                        </span>
                        <span className="text-sm text-slate-300">
                            در این بخش میتوانید در خواست ها مرجوعی حود را ببینید
                        </span>
                    </div>
                </div>
            </div>
            <div className="rounded-b-2xl bg-white p-3">
                {user.isAuthenticated ? (
                    <>
                        <div className="box-shadow p-1.5 bg-white rounded-2xl">
                            <div className="mx-6 flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
                                <button
                                    onClick={() => setStatus('all')}
                                    className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${status === 'all'
                                        ? 'bg-slate-900 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    همه
                                </button>

                                <button
                                    onClick={() => setStatus('pending')}
                                    className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${status === 'pending'
                                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                                        }`}
                                >
                                    در انتظار بررسی
                                </button>

                                <button
                                    onClick={() => setStatus('approved')}
                                    className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${status === 'approved'
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                                        }`}
                                >
                                    تایید شده توسط مدیر
                                </button>

                                <button
                                    onClick={() => setStatus('received')}
                                    className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${status === 'received'
                                        ? 'bg-blue-600 text-white shadow-xs'
                                        : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                                        }`}
                                >
                                    دریافت شده
                                </button>
                                <button
                                    onClick={() => setStatus('refunded')}
                                    className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${status === 'refunded'
                                        ? 'bg-green-600 text-white shadow-xs'
                                        : 'bg-green-50 text-green-800 hover:bg-blue-100'
                                        }`}
                                >
                                    باز پرداخت شده
                                </button>




                                <button
                                    onClick={() => setStatus('rejected')}
                                    className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${status === 'rejected'
                                        ? 'bg-red-600 text-white shadow-xs'
                                        : 'bg-red-50 text-red-800 hover:bg-teal-100'
                                        }`}
                                >
                                    رد شده
                                </button>
                                <button
                                    onClick={() => setStatus('canceled')}
                                    className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${status === 'canceled'
                                        ? 'bg-red-700 text-white shadow-xs'
                                        : 'bg-red-50 text-red-900 hover:bg-teal-100'
                                        }`}
                                >
                                    لغو شده
                                </button>
                            </div>
                        </div>
                        {isLoadingReturnRequests ? <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="min-w-300 text-xs rounded-2xl text-right">

                                <tbody className="divide-y divide-slate-100">
                                    {Array(6).fill({}).map((item, idx) => {


                                        return (
                                            <tr key={idx} className="hover:bg-slate-50">
                                                <td className="p-2.5 text-center font-bold text-slate-600">
                                                    <Skeleton width={60} height={30} />
                                                </td>
                                                <td className="p-2.5 text-center font-bold text-slate-600">
                                                    <Skeleton width={60} height={30} />
                                                </td>
                                                <td className="p-2.5 text-center font-bold text-slate-600">
                                                    <Skeleton width={60} height={30} />
                                                </td>
                                                <td className="p-2.5 text-center font-bold text-slate-600">
                                                    <Skeleton width={60} height={30} />
                                                </td>
                                                <td className="p-2.5 text-center font-bold text-slate-600">
                                                    <Skeleton width={60} height={30} />
                                                </td>

                                                {/* <td className="p-2.5 font-bold text-slate-900">
                                                {item.product?.title || "محصول یافت نشد!"}
                                                <span className="block text-[11px] text-slate-400 font-normal">
                                                    مدل: {item.product?.technical_model || "محصول یافت نشد"}
                                                </span>
                                            </td>
                                            <td className="p-2.5 text-center font-bold text-slate-600">
                                                {toPersianDigits(item.quantity)}
                                            </td>
                                            <td className="p-2.5 text-center font-extrabold text-sky-800 bg-sky-50/50">
                                                {toPersianDigits(item.quantity_accepted_by_admin) || "----"}
                                            </td>
                                            <td className="p-2.5 font-bold text-slate-800">
                                                {formatPrice(item.price, storeSettings.currencyUnit)}
                                            </td>
                                            <td className="p-2.5 font-bold text-slate-800">
                                                {item.price_accepted_by_admin ? formatPrice(item.price_accepted_by_admin, storeSettings.currencyUnit) : "----"}
                                            </td> */}

                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div> : returnRequests.length ?
                            <div className="overflow-x-auto rounded-xl border border-slate-200 scrollbar-thumb-slate-300" >
                                <table className="min-w-315 text-xs text-right rounded-xl ">
                                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                                        <tr>
                                            <th className="p-2.5 text-center">#</th>
                                            <th className="p-2.5 text-center">کد درخواست</th>
                                            <th className="p-2.5 text-center">نام محصول / قطعه مرجوعی</th>
                                            <th className="p-2.5 text-center">وضعیت</th>
                                            <th className="p-2.5 text-center">مبلغ پرداختی</th>
                                            <th className="p-2.5 text-center">قیمت تاییدی توسط مدیر</th>
                                            <th className="p-2.5 text-center">دلیل</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {returnRequests.map((returnRequest, idx) => {
                                            return (
                                                <tr key={idx} className="hover:bg-slate-50">
                                                    <td className="p-2.5 font-mono text-center text-slate-400 font-bold">{idx + 1}</td>
                                                    <td className="p-2.5 font-mono text-center font-bold text-slate-700">{returnRequest.pk}</td>
                                                    <td className="p-2.5 font-bold text-center text-slate-900">
                                                        {returnRequest.item?.product?.title || "محصول یافت نشد!"}
                                                        <span className="block text-[11px] text-slate-400 font-normal">
                                                            مدل: {returnRequest.item?.product?.technical_model || "محصول یافت نشد"}
                                                        </span>
                                                    </td>
                                                    <td className="p-2.5 text-center font-bold text-slate-600">
                                                        {getStatusBedge(returnRequest.status)}
                                                    </td>
                                                    <td className="p-2.5 font-bold text-center text-slate-800">
                                                        {formatPrice(Number(returnRequest.order?.price_accepted_by_admin || (returnRequest.item?.price || 0) * (returnRequest.item?.quantity || 0)), storeSettings.currencyUnit)}
                                                    </td>
                                                    <td className="p-2.5 text-center font-extrabold text-sky-800 bg-sky-50/50">
                                                        {returnRequest.return_price_accepted_by_admin ? formatPrice(Number(returnRequest.return_price_accepted_by_admin), storeSettings.currencyUnit) : "در دست بررسی"}
                                                    </td>
                                                    <td className="p-2.5 font-bold text-center text-slate-800">
                                                        <span className="border-2 border-slate-300 bg-slate-200 text-gray-400 p-1.5 rounded-2xl">
                                                            {getReasonPersionText(returnRequest.reason)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div> : <div
                                className="flex w-full bg-white rounded p-1.5"
                            >
                                <div className="flex flex-col w-full h-50  items-center justify-center bg-white rounded p-1.5 ">
                                    <Inbox size={60} className="font-bold  text-gray-400" />
                                    <span
                                        className="font-bold text-gray-500"
                                    >
                                        درخواستی برای شما یافت نشد
                                    </span>
                                </div>
                            </div>}

                    </>
                ) : <>
                    <div className="flex flex-col w-full h-50  items-center justify-center bg-white rounded p-1.5 ">
                        <Inbox size={60} className="font-bold  text-gray-400" />
                        <span
                            className="font-bold text-gray-500"
                        >
                            برای دیدن درخواست ها ابتدا <button
                                onClick={() => setIsAuthModalOpen(true)}
                                className="p-1.5 bg-amber-600  rounded-xl text-white hover:bg-amber-800 transition-colors "
                            >
                                ورود | ثبت نام
                            </button>
                            کنید
                        </span>
                    </div>
                </>}
            </div>
        </div>
    )
}