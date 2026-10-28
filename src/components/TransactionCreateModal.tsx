import { ChangeEvent, Dispatch, SetStateAction, SubmitEvent,  useContext, useDeferredValue, useEffect, useRef, useState } from "react";
import { CustomerOrder,  ReturnRequest, Transaction, User as UserType } from "../types";
import { formatPrice } from "../utils/formatters";
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Package, PackageX, Phone, Receipt, Search, Upload, User, X } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import fetchData from "../utils/fetchData";
import { AxiosResponse } from "axios";
import API from "@/api/api";
import { MainContext, MainContextValue } from "../contexts/MainContext";

interface TransactionCreateModalProps {
    setIsModalOpen: Dispatch<SetStateAction<boolean>>
    setTransactions: Dispatch<SetStateAction<Transaction[]>>
}


export default function TransactionCreateModal({ setIsModalOpen, setTransactions }: TransactionCreateModalProps) {
    const mainContextValue = useContext<MainContextValue>(MainContext)


    const [transactionType, setTransactionType] = useState<Transaction['transaction_type']>("PAYMENT")
    const [price, setPrice] = useState<string | number>("")


    const [formReceiptImage, setFormReceiptImage] = useState<string | ArrayBuffer | null | undefined>("")


    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        try {
            const files = e.currentTarget.files
            if (files?.length) {
                const fileReader = new FileReader()
                fileReader.addEventListener("load", (e) => {
                    setFormReceiptImage(e.target?.result)

                })
                fileReader.readAsDataURL(files[0])

            } else {
                setImageError("خطا در پردازش تصویر")
            }
        } catch (e) {
            setImageError("خطا در پردازش تصویر")
        }
    }

    const [selectedUser, setSelectedUser] = useState<null | UserType>(null)
    const [matchedUsers, setMatchedUsers] = useState<UserType[]>([])
    const [userSearch, setUserSearch] = useState("")
    const deferredUserSearchQuery = useDeferredValue(userSearch)
    const totalUserPagesCount = useRef(null)
    const [userPage, setUserPage] = useState(1)

    useEffect(() => {
        setUserPage(1);
        setMatchedUsers([]);
        totalUserPagesCount.current = null
    }, [deferredUserSearchQuery]);

    useEffect(() => {
        const timeOutId = setTimeout(() => {
            if (deferredUserSearchQuery) {
                const urlSearchParams = new URLSearchParams({ page: userPage.toString(), search_query: deferredUserSearchQuery })
                fetchData("users/admin-users-list/" + "?" + urlSearchParams.toString(), ({ data, status }) => {
                    if (status === 200) {
                        if (userPage === 1) {
                            setMatchedUsers(data.data)
                            totalUserPagesCount.current = data.page_nums?.length || null
                            return;
                        }
                        setMatchedUsers(prev => [...prev, ...data.data])
                    }
                    else {
                        mainContextValue?.onError("خطا در دریافت اطلاعات")
                    }
                }, null, () => mainContextValue?.onError("خطا در دریافت اطلاعات"));
            }
        }, 750)
        return () => clearTimeout(timeOutId)
    }, [deferredUserSearchQuery, userPage])
    const userScrollEventTimeout = useRef<null | NodeJS.Timeout | null>(null)

    const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null)
    const [matchedOrders, setMatchedOrders] = useState<CustomerOrder[]>([])
    const [orderSearch, setOrderSearch] = useState("")
    const orderSearchDefferedValue = useDeferredValue(orderSearch)
    const totalOrderPagesCount = useRef(null)
    const [orderPage, setOrderPage] = useState(1)


    useEffect(() => {
        setOrderPage(1);
        setMatchedOrders([]);
        totalOrderPagesCount.current = null
    }, [orderSearchDefferedValue]);


    useEffect(() => {
        const timeOutId = setTimeout(() => {
            if (orderSearchDefferedValue) {
                const urlSearchParams = new URLSearchParams({ page: orderPage.toString(), search_query: orderSearchDefferedValue })
                fetchData("orders/orders-list/" + "?" + urlSearchParams.toString(), ({ data, status }) => {
                    if (status === 200) {
                        if (userPage === 1) {
                            setMatchedOrders(data.orders)
                            totalOrderPagesCount.current = data.page_nums?.length || null
                            return;
                        }
                        setMatchedOrders(prev => [...prev, ...data.orders])
                    }
                    else {
                        mainContextValue?.onError("خطا در دریافت اطلاعات")
                    }
                }, null, () => mainContextValue?.onError("خطا در دریافت اطلاعات"));
            }
        }, 750)
        return () => clearTimeout(timeOutId)
    }, [orderSearchDefferedValue, orderPage])
    const orderScrollEventTimeout = useRef<null | NodeJS.Timeout | null>(null)

    const [selectedReturnRequest, setSelectedReturnRequest] = useState<ReturnRequest | null>(null)
    const [matchedReturnRequests, setMatchedReturnRequests] = useState<ReturnRequest[]>([])
    const [returnRequestSearchQuery, setReturnRequestSearchQuery] = useState("")
    const defferedReturnRequestSearchQuery = useDeferredValue(returnRequestSearchQuery)
    const [returnRequestsPage, setReturnRequestsPage] = useState(1)
    const totalReturnRequestPagesCount = useRef(null)
    useEffect(() => {
        setReturnRequestsPage(1);
        setMatchedReturnRequests([]);
        totalReturnRequestPagesCount.current = null
    }, [defferedReturnRequestSearchQuery]);

    useEffect(() => {
        const timeOutId = setTimeout(() => {
            if (defferedReturnRequestSearchQuery) {
                const urlSearchParams = new URLSearchParams({ page: orderPage.toString(), searchQuery: orderSearchDefferedValue })
                fetchData("orders/admin-return-requests/" + "?" + urlSearchParams.toString(), ({ data, status }) => {
                    if (status === 200) {
                        if (userPage === 1) {
                            setMatchedReturnRequests(data.data)
                            totalOrderPagesCount.current = data.num_pages?.length || null
                            return;
                        }
                        setMatchedReturnRequests(prev => [...prev, ...data.data])
                    }
                    else {
                        mainContextValue?.onError("خطا در دریافت اطلاعات")

                    }
                }, null, () => mainContextValue?.onError("خطا در دریافت اطلاعات")
                );
            }
        }, 750)
        return () => clearTimeout(timeOutId)
    }, [defferedReturnRequestSearchQuery, returnRequestsPage])
    const returnRequestScrollEventTimeout = useRef<null | NodeJS.Timeout | null>(null)

    // errors
    const [imageError, setImageError] = useState("")
    const [priceError, setPriceError] = useState("")
    const [userError, setUserError] = useState("")
    const [returnRequestError, setReturnRequestError] = useState("")
    const [orderError, setOrderError] = useState("")


    const handleCreateTransaction = async (e: SubmitEvent): Promise<void> => {
        try {
            const formData = new FormData(e.target)
            const image: File | null = formData.get("image") as File
            const maxSize = 1024 * 1024

            if (image && image.size >= maxSize) {
                setImageError("حجم عکس بیش از حجم مجاز")
                return;
            }
            if (!price) {
                setPriceError("لطفا مبلغ را وارد کنید")
                return;
            }
            if (!selectedUser) {
                setUserError("لطفا کاربر را وارد کنید.")
                return;
            }
            if (transactionType === "RETURN_PRICE" && !selectedReturnRequest) {
                setReturnRequestError("لطفا درخواست مرجوعی را انتخاب کنید!")
                return;
            }
            if (transactionType === "PAYMENT" && !selectedOrder) {
                setOrderError("لطفا سفارش را انتخاب کنید")
                return;
            }
            formData.set(transactionType === "PAYMENT" ? "order_id" : "return_request_id", (transactionType === "PAYMENT" ? selectedOrder?.pk : selectedReturnRequest?.pk)?.toString() || "")
            const { data, status }: AxiosResponse = await API.post("orders/admin-transaction-create/", formData)
            if (
                status === 200
            ) {
                setTransactions(prev => [...prev, data.transaction])
                setIsModalOpen(false)
            } else {
                mainContextValue?.onError(status === 400 ? "داده ها معتبر نیستند" : "خطایی غیرمنتظره رخ داد")
            }
        } catch (e) {
            mainContextValue?.onError("خطا غیرمنتظره در برقراری ارتباط با سرور")
        }
    }

    return (
        <div className="fixed inset-0  z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white max-h-100 overflow-auto rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative border border-slate-100">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-sky-600" />
                        <span>ثبت فیش و تراکنش مالی جدید برای مشتری</span>
                    </h3>
                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleCreateTransaction} className="space-y-4 text-xs">
                    {/* Type Selection */}
                    <div>
                        <label className="font-bold text-slate-700 block mb-1">نوع تراکنش مالی:</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setTransactionType('PAYMENT')}
                                className={`py-2.5 rounded-xl font-black transition flex items-center justify-center gap-1.5 border cursor-pointer ${transactionType === 'PAYMENT'
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                    : 'bg-slate-50 text-slate-700 border-slate-200'
                                    }`}
                            >
                                <ArrowDownLeft className="w-4 h-4" />
                                <span>دریافت از مشتری (+)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setTransactionType('RETURN_PRICE')}
                                className={`py-2.5 rounded-xl font-black transition flex items-center justify-center gap-1.5 border cursor-pointer ${transactionType === 'RETURN_PRICE'
                                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                                    : 'bg-slate-50 text-slate-700 border-slate-200'
                                    }`}
                            >
                                <ArrowUpRight className="w-4 h-4" />
                                <span>پرداخت به مشتری (-)</span>
                            </button>
                        </div>
                    </div>

                    {/* Customer Name & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                        <div>
                            <label className="font-bold text-slate-700 block mb-1">مبلغ تراکنش:</label>
                            <input
                                name="price"
                                type="text"
                                value={price}
                                onChange={(e) => {
                                    let value = e.target.value
                                    value = value.replace(/[^0-9.-]/g, '');
                                    setPrice(value);
                                }}
                                placeholder="مبلغ تراکنش"
                                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900"
                            />
                            {priceError &&
                                <p className="text-red-600">
                                    {priceError}
                                </p>
                            }
                        </div>

                    </div>


                    {/* Section 2: user Picker */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                        <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-2 border-b border-slate-200/80 pb-2">
                            <User className="w-4 h-4 text-emerald-600" />
                            <span>جستجو در کابران:</span>
                        </h4>

                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="جستجو در کاربران (نام ، نام خانوادگی و شماره تلفن)"
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                className="w-full pr-9 pl-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-sky-500"
                            />

                            {/* Live Search Dropdown */}
                            {matchedUsers.length > 0 && (
                                <div
                                    onScroll={(e) => {
                                        if (userScrollEventTimeout.current) {
                                            clearTimeout(userScrollEventTimeout.current)
                                        }
                                        const element = e.currentTarget
                                        userScrollEventTimeout.current = setTimeout(() => {
                                            if ((totalUserPagesCount.current && userPage >= totalUserPagesCount.current) || totalUserPagesCount.current === 1) {
                                                return;
                                            }
                                            const { scrollHeight, offsetHeight, clientHeight } = element
                                            const reachedThreshhold = (offsetHeight + clientHeight) >= (scrollHeight - 200)
                                            if (reachedThreshhold) {
                                                setUserPage(prev => prev + 1)
                                            }
                                        }, 1000)
                                    }}
                                    className="absolute top-full right-0 left-0 mt-1 bg-white border p-1.5 h-35 border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto">
                                    {matchedUsers.map((u, idx) => (
                                        <div
                                            key={u.pk || idx}
                                            onClick={() => {
                                                setSelectedUser(u);
                                                setUserSearch("")
                                            }}
                                            className="p-2.5 hover:bg-sky-50 transition cursor-pointer flex items-center justify-between text-xs"
                                        >
                                            <div>
                                                <div className="font-bold text-slate-900">{(u.fname || u.lname) ? ((u.fname || "") + (u.lname || "")) : "ثبت نشده!"}</div>
                                                <div className="text-[11px] text-slate-500 font-mono">شماره تلفن : {u.phone}</div>
                                            </div>
                                            {/* <div className="font-mono font-black text-sky-700">
                                                {formatPrice(p.price * ((100 - (p.off || 0)) / 100), storeSettings.currencyUnit)}
                                            </div> */}
                                        </div>
                                    ))}
                                    {(!totalUserPagesCount.current || userPage < totalUserPagesCount.current) && Array(2).fill({}).map(() => (<div
                                        className='p-2.5 hover:bg-sky-50 transition cursor-pointer flex items-center justify-between text-xs'

                                    >
                                        <div>
                                            <Skeleton height={15} width={90} />
                                            <Skeleton height={15} width={180} />

                                        </div>
                                        <div>
                                            <Skeleton height={15} width={135} count={2} />

                                        </div>
                                    </div>))}
                                </div>
                            )}
                        </div>
                    </div>
                    {selectedUser && (
                        <div className="w-full p-3 flex items-center justify-between rounded-xl border-2 border-slate-100 bg-slate-50">
                            <div className="flex flex-col items-start ">
                                <span className="font-semibold text-gray-500">
                                    نام : {(selectedUser?.fname || selectedUser?.lname) ? ((selectedUser.fname || "") + (selectedUser.lname || "")) : "ثبت نشده!"}
                                </span>
                                <span className="font-semibold text-gray-500">
                                    شماره تلفن : {selectedUser?.phone}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-300">
                                    تراز کل کاربر : {selectedUser?.total_deposit || "تراکنشی برای کاربر ثبت نشده"}
                                </span>
                            </div>
                        </div>
                    )}

                    {userError && <p className="text-red-600">
                        {userError}
                    </p>}
                    {/* Section 3: order or return request Picker */}
                    {transactionType === "PAYMENT" && (
                        <>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                                <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-2 border-b border-slate-200/80 pb-2">
                                    <Package className="w-4 h-4 text-emerald-600" />
                                    <span>جستجو در سفارشات:</span>
                                </h4>

                                <div className="relative">
                                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="جستوجو در سفارشات(نام و نام خانوادگی سفارش دهنده ، شماره تلفن سفارش دهنده و شماره سفارش)"
                                        value={orderSearch}
                                        onChange={(e) => setOrderSearch(e.target.value)}
                                        className="w-full pr-9 pl-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-sky-500"
                                    />

                                    {/* Live Search Dropdown */}
                                    {matchedOrders.length > 0 && (
                                        <div
                                            onScroll={(e) => {
                                                if (orderScrollEventTimeout.current) {
                                                    clearTimeout(orderScrollEventTimeout.current)
                                                }
                                                const element = e.currentTarget
                                                orderScrollEventTimeout.current = setTimeout(() => {
                                                    if ((totalOrderPagesCount.current && userPage >= totalOrderPagesCount.current) || totalOrderPagesCount.current === 1) {
                                                        return;
                                                    }
                                                    const { scrollHeight, offsetHeight, clientHeight } = element
                                                    const reachedThreshhold = (offsetHeight + clientHeight) >= (scrollHeight - 200)
                                                    if (reachedThreshhold) {
                                                        setOrderPage(prev => prev + 1)
                                                    }
                                                }, 1000)
                                            }}
                                            className="absolute top-full right-0 left-0 mt-1 bg-white border p-1.5 h-35 border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto">
                                            {matchedOrders.map((o, idx) => (
                                                <div
                                                    key={o.pk || idx}
                                                    onClick={() => {
                                                        setSelectedOrder(o);
                                                        setOrderSearch("")
                                                    }}
                                                    className="p-2.5 hover:bg-sky-50 transition cursor-pointer flex items-center justify-between text-xs"
                                                >
                                                    <div>
                                                        <div className="font-bold text-slate-900">شماره سفارش : {o.pk}</div>
                                                        <div className="text-[11px] text-slate-500 font-mono">مبلغ سفارش: {formatPrice(Number(o.total_items_price)) || "ثبت نشده"}</div>
                                                        <div className="text-[11px] text-slate-500 font-mono">نام و نام خانوادگی خریدار : {((o.fname || o.user?.fname) || (o.fname || o.user?.fname)) ? ((o.fname || o.user?.fname || "") + " " + (o.lname || o.user?.lname || "")) : "ثبت نشده"}</div>
                                                    </div>

                                                </div>
                                            ))}
                                            {(!totalOrderPagesCount.current || orderPage < totalOrderPagesCount.current) && Array(2).fill({}).map(() => (<div
                                                className='p-2.5 hover:bg-sky-50 transition cursor-pointer flex items-center justify-between text-xs'

                                            >
                                                <div>
                                                    <Skeleton height={15} width={90} />
                                                    <Skeleton height={15} width={180} />

                                                </div>
                                                <div>
                                                    <Skeleton height={15} width={135} count={2} />

                                                </div>
                                            </div>))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {selectedOrder && (
                                <div className="w-full p-3 flex items-center justify-between rounded-xl border-2 border-slate-100 bg-slate-50">
                                    <div className="flex flex-col items-start ">
                                        <span className="font-semibold text-gray-500">
                                            نام و نام خانوادگی خریدار: {((selectedOrder.fname || selectedOrder.user?.fname) || (selectedOrder.fname || selectedOrder.user?.fname)) ? ((selectedOrder.fname || selectedOrder.user?.fname || "") + " " + (selectedOrder.lname || selectedOrder.user?.lname || "")) : "ثبت نشده"}
                                        </span>
                                        <span className="font-semibold text-gray-500">
                                            شماره تلفن خریدار: {selectedOrder?.phone || selectedOrder.user?.fname}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-300">
                                            مبلغ کل سفارش : {selectedOrder?.total_items_price || "ثبت نشده"}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {orderError && <p className="text-red-600">
                                {orderError}
                            </p>}
                        </>
                    )}

                    {transactionType === "RETURN_PRICE" && (
                        <>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                                <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-2 border-b border-slate-200/80 pb-2">
                                    <PackageX className="w-4 h-4 text-emerald-600" />
                                    <span>جستجو درخواست های مرجوعی:</span>
                                </h4>

                                <div className="relative">
                                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="جستوجو در سفارشات(نام و نام خانوادگی سفارش دهنده ، شماره تلفن سفارش دهنده و شماره سفارش)"
                                        value={returnRequestSearchQuery}
                                        onChange={(e) => setReturnRequestSearchQuery(e.target.value)}
                                        className="w-full pr-9 pl-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-sky-500"
                                    />

                                    {/* Live Search Dropdown */}
                                    {matchedReturnRequests.length > 0 && (
                                        <div
                                            onScroll={(e) => {
                                                if (returnRequestScrollEventTimeout.current) {
                                                    clearTimeout(returnRequestScrollEventTimeout.current)
                                                }
                                                const element = e.currentTarget
                                                returnRequestScrollEventTimeout.current = setTimeout(() => {
                                                    if ((totalReturnRequestPagesCount.current && returnRequestsPage >= totalReturnRequestPagesCount.current) || totalReturnRequestPagesCount.current === 1) {
                                                        return;
                                                    }
                                                    const { scrollHeight, offsetHeight, clientHeight } = element
                                                    const reachedThreshhold = (offsetHeight + clientHeight) >= (scrollHeight - 200)
                                                    if (reachedThreshhold) {
                                                        setReturnRequestsPage(prev => prev + 1)
                                                    }
                                                }, 1000)
                                            }}
                                            className="absolute top-full right-0 left-0 mt-1 bg-white border p-1.5 h-35 border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto">
                                            {matchedReturnRequests.map((r, idx) => (
                                                <div
                                                    key={r.pk || idx}
                                                    onClick={() => {
                                                        setSelectedReturnRequest(r);
                                                        setReturnRequestSearchQuery("")
                                                    }}
                                                    className="p-2.5 hover:bg-sky-50 transition cursor-pointer flex items-center justify-between text-xs"
                                                >
                                                    <div>
                                                        <div className="font-bold text-slate-900">شماره درخواست : {r.pk}</div>
                                                        <div className="font-bold text-slate-900">شماره سفارش : {r.pk}</div>
                                                        <div className="text-[11px] text-slate-500 font-mono">مبلغ مرجوعی: {(r.return_price_accepted_by_admin || r.paid_price) ? formatPrice(Number(r.return_price_accepted_by_admin || r.paid_price)) + (!r.return_price_accepted_by_admin ? "(نهایی نشده)" : "") : "ثبت نشده"}</div>
                                                        <div className="text-[11px] text-slate-500 font-mono">نام و نام خانوادگی خریدار : {((r.user?.fname) || (r.user?.fname)) ? ((r.user?.fname || "") + " " + (r.user?.lname || "")) : "ثبت نشده"}</div>
                                                    </div>

                                                </div>
                                            ))}
                                            {(!totalReturnRequestPagesCount.current || returnRequestsPage < totalReturnRequestPagesCount.current) && Array(2).fill({}).map(() => (<div
                                                className='p-2.5 hover:bg-sky-50 transition cursor-pointer flex items-center justify-between text-xs'
                                            >
                                                <div>
                                                    <Skeleton height={15} width={90} />
                                                    <Skeleton height={15} width={180} />

                                                </div>
                                                <div>
                                                    <Skeleton height={15} width={135} count={2} />

                                                </div>
                                            </div>))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {selectedReturnRequest && (
                                <div className="w-full p-3 flex items-center justify-between rounded-xl border-2 border-slate-100 bg-slate-50">
                                    <div className="flex flex-col items-start ">
                                        <span className="font-semibold text-gray-500">
                                            نام و نام خانوادگی کاربر: {((selectedReturnRequest.user?.fname) || (selectedReturnRequest.user?.fname)) ? ((selectedReturnRequest.user?.fname || "") + " " + (selectedReturnRequest.user?.lname || "")) : "ثبت نشده"}
                                        </span>
                                        <span className="font-semibold text-gray-500">
                                            شماره تلفن کاربر: {selectedReturnRequest.user?.fname}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-300">
                                            مبلغ کل درخواست : {(selectedReturnRequest.return_price_accepted_by_admin || selectedReturnRequest.paid_price) ? formatPrice(Number(selectedReturnRequest.return_price_accepted_by_admin || selectedReturnRequest.paid_price)) + (selectedReturnRequest.return_price_accepted_by_admin ? "" : "(نهایی  نشده)") : "ثبت نشده"}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {returnRequestError && <p className="text-red-600">
                                {returnRequestError}
                            </p>}
                        </>
                    )}
                    {/* Receipt Image File Upload */}
                    <div>
                        <label className="font-bold text-slate-700 block mb-1">تصویر فیش واریزی / برگه چک (اختیاری):</label>
                        <div className="flex items-center gap-3">
                            <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-xl font-bold cursor-pointer transition flex items-center gap-1.5">
                                <Upload className="w-4 h-4 text-sky-600" />
                                <span>انتخاب تصویر فیش</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    name="image"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </label>

                            {formReceiptImage && (
                                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200 font-bold text-[11px]">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>تصویر آپلود شد</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormReceiptImage('');

                                        }}
                                        className="text-rose-600 hover:text-rose-800 mr-1"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                    <div className="w-fit overflow-auto">
                                        <img src={typeof formReceiptImage === "string" ? formReceiptImage : ""} />
                                    </div>
                                </div>
                            )}
                        </div>
                        {imageError && <p className="text-red-600">
                            {imageError}
                        </p>}

                    </div>


                    <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                        >
                            انصراف
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black shadow-md"
                        >
                            ثبت  تراکنش
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )


}