import { CheckCircle2, Edit2, FileSpreadsheet, PackageX, Save, Search } from "lucide-react";
import { useCallback, useContext, useDeferredValue, useEffect, useState } from "react";
import Spinner from "./Spinner";
import Skeleton from "react-loading-skeleton";
import { formatPrice, toPersianDigits } from "../utils/formatters";
import { ReturnRequest, StoreSettings } from "../types";
import fetchData from "../utils/fetchData";
import PaginationContainer from "./Pagintation";
import API from "@/api/api";
import ReturnRequestDetailModal from "./ReturnRequestsDetailModal";
import { MainContext } from "../contexts/MainContext";
import compileErrorOBJToArray from "../utils/compileErrorsOBJToArray";

interface ReturnRequestFilterState {
    status: ReturnRequest["status"] | "all";
    searchQuery: string;
    reason: ReturnRequest["reason"] | "all";
    page: number;
}


interface AdminReturnRequest {
    storeSettings: StoreSettings
}


export default function AdminReturnRequest({ storeSettings }: AdminReturnRequest) {
    const mainContextValue = useContext(MainContext)

    const [successMsg, setSuccessMsg] = useState("")
    const [isFetchingData, setIsFetchingData] = useState(false)
    const [isGeneratingExcel, setIsGeneratingExcel] = useState(false)
    const [filterState, setFilterState] = useState<ReturnRequestFilterState>({
        status: "all",
        searchQuery: "",
        reason: "all",
        page: 1
    });
    const [detailExpectinReturnRequest, setDetailExpectingReturnRequest] = useState<ReturnRequest | null>(null)
    const [isDetailRequestModalOpen, setIsDetailRequestModalOpen] = useState(false)
    const [editingReturnRequest, setEditingReturnRequest] = useState<null | string | number>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const deferredSearchQuery = useDeferredValue(searchQuery)
    const [returnRequests, setReturnRequests] = useState<(ReturnRequest)[]>([])
    const [paginationData, setPagigationData] = useState({
        nextPage: 2,
        prevPage: null,
        numPages: []
    })

    const compileFilterState = useCallback((filterState: ReturnRequestFilterState) => {
        const searchParams = new URLSearchParams()
        searchParams.append("reason", filterState.reason === "all" ? "" : filterState.reason)
        searchParams.append("searchQuery", filterState.searchQuery);
        searchParams.append("page", filterState.page.toString())
        searchParams.append("status", filterState?.status === "all" ? "" : filterState.status)
        return searchParams
    }, [])


    useEffect(() => {
        setFilterState(prev => ({ ...prev, searchQuery: deferredSearchQuery }))
    }, [deferredSearchQuery])


    useEffect(() => {
        try {
            const searchParams = compileFilterState(filterState)

            fetchData("orders/admin-return-requests/?" + searchParams.toString(), ({ data, status }) => {
                if (status === 200) {
                    setReturnRequests(data.result.data)
                    setPagigationData({
                        prevPage: data.result.prev_page,
                        nextPage: data.result.next_page,
                        numPages: data.result.num_pages
                    })

                } else {
                    const e = data.error_des || "خطا در پدازش داده"
                    if (typeof e === "object") {
                        mainContextValue?.onError(compileErrorOBJToArray(e)?.join(","))
                    }

                }
                setIsFetchingData(false)
            }, () => setIsFetchingData(true), () => mainContextValue?.onError("خطایی رخ داده است"))
        } catch (e) {
            mainContextValue?.onError("خطایی غیرمنتظره رخ داد")
        }

    }, [filterState])


    const handleExportDataToExcel = async () => {
        try {
            setIsGeneratingExcel(true)
            const searchParams = compileFilterState(filterState)
            searchParams.delete("page")
            const { data, status } = await API.get("orders/admin-return-requests-excel/?" + compileFilterState(filterState).toString(), { responseType: "blob" })
            setIsGeneratingExcel(false)

            if (status === 200) {
                const blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
                const url = URL.createObjectURL(blob)
                const link = document.createElement("a")
                link.download = "return-requests.xlsx"
                link.href = url
                document.body.append(link)
                link.click()
                link.remove()
            } else {
                const e = data.detail || "خطا در پدازش"
                mainContextValue?.onError(e)
            }
        } catch (e) {
            mainContextValue?.onError("خطایی رخ داده اسست")
        }
    }


    const handleEditReturnRequest = async (returnRequest: ReturnRequest): Promise<void> => {
        try {
            const { pk, status, return_price_accepted_by_admin } = returnRequest
            setEditingReturnRequest(pk)
            const response = await API.put(`orders/admin-return-request-update/${pk}/?updating_fields=return_price_accepted_by_admin,status`, { status, return_price_accepted_by_admin })
            if (response.status === 200) {
                setSuccessMsg("با موفقیت اپدیت شد")
                setTimeout(() => setSuccessMsg(""), 1000)
            } else {
                const e = response.data.error_des || response.data.detail || "خطا"
                if (typeof e === "object") {
                    mainContextValue?.onError(compileErrorOBJToArray(e)?.join(","))
                    return;
                }
                mainContextValue?.onError("خطایی رخ داده است")
            }
            setEditingReturnRequest(null)
        } catch (e) {
            mainContextValue?.onError("خطایی رخ داده است")
            setEditingReturnRequest(null)
        }
    }

    const handleReturnPriceChanged = (returnRequestPK: string | number, price: number): void => {
        setReturnRequests(prev => [...prev].map(returnRequest => {
            if (returnRequest.pk === returnRequestPK) {
                returnRequest.return_price_accepted_by_admin = price
            }
            return returnRequest
        }))
    }

    const handleChangeStaus = (returnRequest: ReturnRequest, status: ReturnRequest["status"]) => {
        setReturnRequests(prev => [...prev].map(ele => {

            if (ele.pk === returnRequest.pk) {
                ele.status = status
            }
            return ele
        }));

    }

    const getReasonText = (reasonDBName: ReturnRequest["reason"]): string => {
        switch (reasonDBName) {
            case "damaged":
                return "کالا اسیب دیده است"
            case "change_of_mind":
                return "انصراف از خرید"
            case "defective":
                return "کالای ناقص"
            case "not_as_described":
                return "کالا با توضیحات تفاوت دارد"
            case "wrong_item":
                return "ارسال اشتباه کالا"
            case "other":
                return "سایر موارد"
            default:
                return "ثبت نشده"
        }
    }




    return (
        <>
            <div className="space-y-6">
                {/* Top Banner Alert */}
                <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 text-white p-5 rounded-3xl shadow-lg border border-rose-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-400 text-rose-950 flex items-center justify-center shrink-0 shadow-md">
                            <PackageX className="w-7 h-7 stroke-[2.5] animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-black text-rose-100 flex items-center gap-2">
                                <span>مدیریت درخواست های مرجوعی</span>

                            </h2>
                            <p className="text-xs text-rose-200/80 font-medium">
                                مشاهده درخواست های مرجوعی و مدیریت وضعیت انها
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <button
                            onClick={handleExportDataToExcel}
                            disabled={isGeneratingExcel}
                            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-rose-950 font-black text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
                        >
                            {isGeneratingExcel ? <Spinner width={17.5} height={17.5} borderMainColor={"white"} borderTopColor={"white"} borderWidth={1.75} /> : <>
                                <FileSpreadsheet className="w-4 h-4" />
                                <span>خروجی لیست سفارش خرید اکسل</span>
                            </>}
                        </button>
                    </div>
                </div>

                {/* Toast Success Message */}
                {successMsg && (
                    <div className="bg-emerald-100 text-emerald-900 p-3.5 rounded-2xl border border-emerald-300 font-bold text-xs flex items-center gap-2 animate-bounce">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>{successMsg}</span>
                    </div>
                )}



                {/* Filter and Search Toolbar */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="جستجو در نام و شماره تلفن کاربران ، نام محصول و ..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-sky-500"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <select
                                value={filterState.status}
                                onChange={(e) => setFilterState(prev => ({ ...prev, status: e.target.value }))}
                                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 cursor-pointer"
                            >
                                <option value="all">همه وضعیت ها</option>
                                <option value="pending">در صف بررسی</option>
                                <option value="approved">تایید شده</option>
                                <option value="rejected">رد شده</option>
                                <option value="recieved">دریافت شده</option>
                                <option value="refunded">وجه بازگشت شده</option>
                                <option value="canceled">لغو شده</option>
                            </select>

                            <select
                                value={filterState.reason}
                                onChange={(e) => setFilterState(prev => ({ ...prev, reason: e.target.value }))}
                                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 cursor-pointer"
                            >
                                <option value={"all"}>
                                    همه دلایل
                                </option>
                                <option value={"damaged"}>
                                    اسیب دیده
                                </option>
                                <option value={"wrong_item"}> کالای اشتباه</option>
                                <option value={"not_as_described"}>مطابق توضیحات نبود</option>
                                <option value={"change_of_mind"}>انصراف از خرید</option>
                                <option value={"other"}>سایر مواردی</option>
                            </select>
                        </div>
                    </div>

                    {/* Low Stock Items Table */}
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className=" w-350 text-right text-xs">
                            <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                                <tr>
                                    <th className="p-3 text-center">کد درخواست</th>
                                    <th className="p-3 text-center">
                                        کد سفارش
                                    </th>
                                    <th className="p-3 text-center">عنوان کالا و مدل</th>
                                    <th className="p-3 text-center">نام و نام خانوادگی درخواست کننده</th>
                                    <th className="p-3 text-center">دلیل</th>
                                    <th className="p-3 text-center">قیمت پرداختی مشتری (تومان)</th>
                                    <th className="p-3 text-center">قیمت پرداختی تاییدی توسط ادمین</th>
                                    <th className="p-3 text-center">
                                        وضعیت
                                    </th>
                                    <th className="p-3 text-center">جزئیات</th>
                                    <th className="p-3 text-center">عملیات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isFetchingData ? Array(3).fill({}).map(ele => (
                                    <tr className={`hover:bg-slate-50 transition `}>
                                        <td className="p-3 font-mono font-bold text-slate-600 dir-ltr text-right">
                                            <Skeleton width={50} height={30} />
                                        </td>

                                        <td className="p-3">
                                            <Skeleton containerClassName='flex justify-center gap-1' width={50} height={30} count={2} />
                                        </td>

                                        <td className="p-3">
                                            <Skeleton width={150} height={30} />
                                        </td>

                                        <td className="p-3 font-mono font-bold text-slate-800">
                                            <Skeleton width={150} height={30} />
                                        </td>

                                        <td className="p-3">
                                            <div className="flex items-center gap-1.5">
                                                <Skeleton width={150} height={30} />
                                            </div>
                                        </td>



                                        <td className="p-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Skeleton width={150} height={30} />
                                            </div>
                                        </td>

                                        <td className="p-3 text-center">
                                            <Skeleton width={150} height={30} />
                                        </td>
                                    </tr>
                                )) : returnRequests.length > 0 ? (
                                    returnRequests.map(returnRequest => {
                                        const item = returnRequest.item
                                        const product = item?.product
                                        const productPrice = product?.price ? product.price * (100 - (product?.off || 0)) : 0
                                        const itemPrice = item?.price_accepted_by_admin || item?.price || 0
                                        const itemQTY = item?.quantity || item?.quantity_accepted_by_admin || 0
                                        const defaultReturnPrice = (itemQTY * itemPrice) || (productPrice * itemPrice) || 0
                                        return (
                                            <tr key={returnRequest.pk} className={`hover:bg-slate-50 transition bg-rose-50/40`}>
                                                <td className="p-3 font-mono font-bold  text-center text-slate-600 dir-ltr ">
                                                    {returnRequest.pk}
                                                </td>
                                                <td className="p-3 font-mono font-bold  text-center text-slate-600 dir-ltr ">
                                                    {returnRequest.order?.pk || "یافت نشد"}
                                                </td>
                                                <td className="p-3  text-center">
                                                    <div className="font-bold text-slate-900">{product?.title || "محصول یافت نشد!"}</div>
                                                    <div className="text-[11px] text-slate-500 font-mono">مدل: {product?.technical_model || "محصول یافت نشد!"}</div>
                                                </td>
                                                <td className="p-3  text-center">
                                                    <div className="font-bold text-slate-900">{returnRequest.user?.fname} {returnRequest.user?.lname}</div>
                                                </td>

                                                <td className="p-3 text-center">
                                                    <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-lg text-[11px]">
                                                        {getReasonText(returnRequest.reason)}
                                                    </span>
                                                </td>

                                                <td className="p-3 text-center font-mono font-bold text-slate-800">
                                                    {formatPrice(defaultReturnPrice, storeSettings.currencyUnit)}
                                                </td>

                                                <td className="p-3 flex items-center justify-center">
                                                    <div className="flex  items-center gap-1.5">
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            defaultValue={returnRequest.return_price_accepted_by_admin || defaultReturnPrice}
                                                            value={returnRequest.return_price_accepted_by_admin}
                                                            onChange={(e) => handleReturnPriceChanged(returnRequest.pk, Number(e.target.value))}
                                                            className={`w-40 p-1.5 rounded-lg border font-mono font-bold text-center text-xs  bg-emerald-50 border-emerald-300 text-emerald-800`}
                                                        />
                                                        <span className="text-slate-500 text-[11px]">تومان</span>
                                                    </div>
                                                </td>

                                                <td className="p-3 text-center">
                                                    <select
                                                        value={returnRequest.status}
                                                        onChange={(e) => handleChangeStaus(returnRequest, e.target.value)}
                                                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 cursor-pointer"
                                                    >
                                                        <option value="pending">در صف بررسی</option>
                                                        <option value="approved">تایید شده</option>
                                                        <option value="rejected">رد شده</option>
                                                        <option value="recieved">دریافت شده</option>
                                                        <option value="refunded">وجه بازگشت شده</option>
                                                        <option value="canceled">لغو شده</option>
                                                    </select>
                                                </td>

                                                <td className="p-3 text-center">
                                                    <button onClick={() => {
                                                        setIsDetailRequestModalOpen(true)
                                                        setDetailExpectingReturnRequest(returnRequest)
                                                    }} className="px-2.5 py-1 gap-1 text-[11px] flex items-center justify-center text-white text-shadow-md bg-amber-600 rounded-md ">
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                        <span>
                                                            دیدن جزئیات
                                                        </span>
                                                    </button>
                                                </td>

                                                <td className="p-3 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            onClick={() => handleEditReturnRequest(returnRequest)}
                                                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition cursor-pointer flex items-center gap-1 shadow-xs"
                                                            title="ذخیره این درخواست"
                                                        >
                                                            {editingReturnRequest && editingReturnRequest === returnRequest.pk ? <Spinner borderMainColor={"white"} borderTopColor={"green"} height={15} width={15} borderWidth={1.5} /> : <>
                                                                <Save className="w-3.5 h-3.5" />
                                                                <span>ذخیره</span></>}
                                                        </button>

                                                        {/* <button
                                                        disabled={deletingProductPK && deletingProductPK === product.pk}
                                                        onClick={() => handleDeleteProduct(product)}
                                                        className="p-1.5 text-slate-600 hover:bg-slate-100 hover:text-red-500 rounded-lg cursor-pointer"
                                                        title="ویرایش کامل کالا"
                                                    >
                                                        {deletingProductPK && deletingProductPK === product.pk ? <Spinner height={15} width={15} borderWidth={1.5} borderMainColor={"white"} borderTopColor={"red"} /> :
                                                            (<Trash2 className="w-4 h-4" />)
                                                        }
                                                    </button> */}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center text-slate-500 text-xs">
                                            هیج درخواست مرجوعی یافت نشد
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {!isFetchingData && returnRequests?.length &&
                        <PaginationContainer nextPage={paginationData.nextPage} prevPage={paginationData.prevPage} pageNums={paginationData.numPages} setFilterState={setFilterState} productsCount={returnRequests?.length || 0} />
                    }
                </div>
            </div>
            {isDetailRequestModalOpen && detailExpectinReturnRequest &&
                <ReturnRequestDetailModal returnRequest={detailExpectinReturnRequest} onClose={() => {
                    setIsDetailRequestModalOpen(false)
                    setDetailExpectingReturnRequest(null)
                }} />
            }
        </>
    );
}

