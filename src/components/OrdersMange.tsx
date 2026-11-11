import { FilePlus, Package } from "lucide-react";
import { Dispatch, SetStateAction, useContext, useDeferredValue, useEffect, useState } from "react";
import { AdminContextValue, CustomerOrder, UserData } from "../types";
import Skeleton from "react-loading-skeleton";
import OrderAdminContainer from "./OrderAdminContainer";
import PaginationContainer from "./Pagintation";
import fetchData from "../utils/fetchData";
import { MainContext, MainContextValue } from "../contexts/MainContext";
import { CreateManualInvoiceModal } from "./CreateManualInvoiceModal";

interface OrdersManageProps {
    user : UserData;
    isManualInvoiceModalOpen: boolean;
    setIsManualInvoiceModalOpen: Dispatch<SetStateAction<boolean>>;
    setSuccessMsg : Dispatch<SetStateAction<string>>
}

export default function OrdersManage({ user, setSuccessMsg, isManualInvoiceModalOpen, setIsManualInvoiceModalOpen }: OrdersManageProps) {
    const mainContextValue = useContext<MainContextValue>(MainContext)
    const storeSettings = mainContextValue?.storeSettings
    const [orders, setOrders] = useState<CustomerOrder[]>([])
    const [orderSearchQuery, setOrderSearchQuery] = useState("")
    const deferedSearchQuery = useDeferredValue(orderSearchQuery)
    const [isFetchingOrders, setIsFetchingOrders] = useState(true)
    const [orderFilterPayload, setOrderFilterPayload] = useState<{
        search?: string;
        order_status?: string
    }>({})
    const [orderPaginationState, setOrderPaginationState] = useState({
        pageNums: [],
        prevPage: null,
        nextPage: null
    })
    const [editingOrderPK, setEditingOrderPk] = useState(null)


    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setOrderFilterPayload(prev => ({ ...prev, search: deferedSearchQuery }))
        }, 500)
        return () => clearTimeout(timeoutId)
    }, [deferedSearchQuery])

    useEffect(() => {
        const searchParams = new URLSearchParams(orderFilterPayload)
        fetchData(`orders/orders-list/?${searchParams.toString()}`, ({ data, status }) => {
            if (status === 200) {
                setOrders(data.orders)
                setOrderPaginationState({
                    prevPage: data.prev_page,
                    nextPage: data.next_page,
                    pageNums: data.page_nums
                })
            } else {
                const e = data.error_des || data.detail || "خطا"
                mainContextValue?.onError(e)
            }
            setIsFetchingOrders(false)
        }, () => setIsFetchingOrders(true), () => mainContextValue?.onError("خطایی غیرمنتظه رخ داد"))
    }, [orderFilterPayload])
    return (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <Package className="w-5 h-5 text-amber-600" />
                        <span>لیست سفارش‌های دریافتی از مشتریان</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        بررسی اقلام، تعدیل قیمت و تعداد بر اساس انبار، و صدور فاکتور رسمی خریدار
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsManualInvoiceModalOpen(true)}
                        className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-black rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
                    >
                        <FilePlus className="w-4 h-4" />
                        <span>+ صدور فاکتور دستی به نام مشتری</span>
                    </button>
                </div>

                {/* Filter buttons */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
                    <button
                        onClick={() => setOrderFilterPayload(prev => ({ ...prev, order_status: "" }))}
                        className={`px-3 py-1.5 rounded-xl cursor-pointer ${orderFilterPayload.order_status === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        همه
                    </button>
                    <button
                        onClick={() => setOrderFilterPayload(prev => ({ ...prev, order_status: "PENDING_BY_ADMIN" }))}
                        className={`px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1 ${orderFilterPayload.order_status === 'PENDING_BY_ADMIN' ? 'bg-amber-500 text-slate-950 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <span>در انتظار بررسی</span>

                    </button>
                    <button
                        onClick={() => setOrderFilterPayload(prev => ({ ...prev, order_status: "ACCEPTED(WAITING_FOR_PAYMENT)" }))}
                        className={`px-3 py-1.5 rounded-xl cursor-pointer ${orderFilterPayload.order_status === 'ACCEPTED(WAITING_FOR_PAYMENT)' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        تایید شده(در انتظار پرداخت)
                    </button>
                    <button
                        onClick={() => setOrderFilterPayload(prev => ({ ...prev, order_status: "PAID" }))}
                        className={`px-3 py-1.5 rounded-xl cursor-pointer ${orderFilterPayload.order_status === 'PAID' ? 'bg-green-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        پرداخت شده
                    </button>
                    <button
                        onClick={() => setOrderFilterPayload(prev => ({ ...prev, order_status: "OUT_FOR_TRANSIT" }))}
                        className={`px-3 py-1.5 rounded-xl cursor-pointer ${orderFilterPayload.order_status === 'OUT_FOR_TRANSIT' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        ارسال‌شده
                    </button>
                    <button
                        onClick={() => setOrderFilterPayload(prev => ({ ...prev, order_status: "DELIVERED" }))}
                        className={`px-3 py-1.5 rounded-xl cursor-pointer ${orderFilterPayload.order_status === 'DELIVERED' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        تحویل‌شده
                    </button>
                    <button
                        onClick={() => setOrderFilterPayload(prev => ({ ...prev, order_status: "REJECTED" }))}
                        className={`px-3 py-1.5 rounded-xl cursor-pointer ${orderFilterPayload.order_status === 'REJECTED' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        لغو شده
                    </button>
                </div>
                <div className="w-full p-1 flex items-center justify-center">
                    <div className="rounded-3xl bg-cyan-50 border-2 border-cyan-100 w-[98%]">
                        <input
                            type="text"
                            placeholder='جستجو در سفارشات با شماره سفارش،شماره خریدار و گیرنده،نام و نام خانوادگی گیرنده و...'
                            className='p-1.5 w-full focus:border-0 focus:outline-0'
                            value={orderSearchQuery}
                            onChange={(e) => setOrderSearchQuery(e.target.value)}
                        />

                    </div>
                </div>

            </div>

            {/* Orders list */}
            {isFetchingOrders ? Array(6).fill({}).map(() => (
                <div className="bg-slate-50 p-1.5 my-1.5 rounded-2xl border border-slate-200/90">
                    <div className="w-full flex justify-between items-center">
                        <Skeleton containerClassName='flex-1 flex justify-start' width={"50%"} className='min-h-10 ' />
                        <Skeleton containerClassName='flex-1 flex justify-center ' width={"50%"} className='min-h-10 ' />
                        <Skeleton containerClassName='flex-1 flex justify-end ' width={"50%"} className='min-h-10 ' />
                    </div>
                    <div className="w-full my-2">
                        <Skeleton width={"100%"} height={40} />
                    </div>
                    <div className="w-full my-2">
                        <Skeleton width={"100%"} height={40} />
                    </div>
                </div>
            )) : (
                orders?.length === 0 ? (
                    <div className="p-12 text-center space-y-2 bg-slate-50 rounded-2xl border border-slate-200">
                        <Package className="w-12 h-12 text-slate-300 mx-auto" />
                        <p className="text-xs font-bold text-slate-600">سفارشی در این بخش یافت نشد!</p>
                    </div>
                ) : (
                    orders
                        ?.map(order => {
                            return <OrderAdminContainer user={user} editingOrderPK={editingOrderPK} order={order} setOrders={setOrders} setEditingOrderPk={setEditingOrderPk} storeSettings={storeSettings} />

                        })
                )
            )}

            {!isFetchingOrders && <PaginationContainer productsCount={orders.length} nextPage={orderPaginationState.nextPage} prevPage={orderPaginationState.prevPage} pageNums={orderPaginationState.pageNums} setFilterState={setOrderFilterPayload} />}

        </div>
    )
}