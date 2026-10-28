import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import {
    Trash2,
    CheckCircle2,
    Truck,
    Motorbike,
    HandHelping,
    ChevronLeft
} from 'lucide-react';
import { formatPrice, toPersianDigits } from "../utils/formatters";
import { OrderTicketChat } from "./OrderTicketChat";
import Spinner from './Spinner';
import API from '@/api/api';
import { CustomerOrder, OrderStatus, StoreSettings, UserData } from '../types';
import { MainContext } from '../contexts/MainContext';

interface OrderAdminContainerProps {
    setOrders: Dispatch<SetStateAction<CustomerOrder[]>>
    user: UserData;
    storeSettings: StoreSettings;
    order: CustomerOrder;
    editingOrderPK: string | number;
    setEditingOrderPk: Dispatch<SetStateAction<string | number | null>>
}


export default function OrderAdminContainer({ setOrders, user, storeSettings, order, editingOrderPK, setEditingOrderPk }: OrderAdminContainerProps) {
    const mainContextValue = useContext(MainContext)
    const [isSending, setIsSending] = useState(false)
    const customer = order.user;
    const generateDeliveyType = useCallback((order: CustomerOrder) => {
        switch (order?.delivery_type) {
            case "MOTORCYCLE_COURIER":
                return (
                    <>
                        <Motorbike className="w-3.5 h-3.5 text-sky-600" />
                        تحویل با پیک
                    </>
                )
            case "INPERSON_PICKUP":
                return (
                    <>
                        <HandHelping className="w-3.5 h-3.5 text-sky-600" />
                        تحویل حضوری
                    </>
                )
            case "PICK_UP_FROM_FREIGHT_TERMINAL":
                return (
                    <>
                        <Truck className="w-3.5 h-3.5 text-sky-600" />
                        تحویل باربری:{order.freight?.name}
                    </>
                )



        }
    }, [])
    const handleUpdateOrderStatus = useCallback((orderId: number | string, status: CustomerOrder['order_status'] | string) => {
        setOrders(prev => [...prev].map(ele => {
            if (ele.pk !== orderId) {
                return ele
            }
            ele.order_status = status as OrderStatus
            return ele
        }));
    }, [setOrders]);

    const handleUpdateOrderItemQuantity = useCallback((orderId: string | number | null | undefined, itemId: number | string | number | null | undefined, newQty: number) => {
        if (!orderId || !itemId) {
            return;
        }

        setOrders(prev => [...prev].map(order => {
            if (order.pk !== orderId) {
                return order
            }
            order.items = order.items && [...order.items].map(item => {
                if (item.pk !== itemId) {
                    return item
                }
                item.quantity_accepted_by_admin = newQty
                return item
            })
            return order
        }))
    }, []);

    const handleUpdateOrderItemPrice = useCallback((orderId: string | number | null, itemId: number | string | null | undefined, newPrice: number) => {

        setOrders(prev => [...prev].map(order => {
            if (order.pk !== orderId) {
                return order
            }
            order.items = order.items && [...order.items].map(item => {
                if (item.pk !== itemId) {
                    return item
                }
                item.price_accepted_by_admin = newPrice
                return item
            })
            return order
        }))
    }, [])


    const handleUpdateOrder = useCallback(async (order: CustomerOrder) => {
        try {
            setIsSending(true)
            const { data, status } = await API.put(`orders/order-update/${order.pk}/`, { delivery_price: order.delivery_price || 0, order_status: order.order_status, items: order.items && [...order.items].map(ele => ({ pk: ele.pk, price_accepted_by_admin: ele.price_accepted_by_admin || ele.price, quantity_accepted_by_admin: ele.quantity_accepted_by_admin || ele.quantity })) })
            if (status === 200) {
                mainContextValue?.onSuccess("سفارش بروز شد!")
            } else {
                mainContextValue?.onError(status === 400 ? "داده های ارسالی نامعتبرند" : "خطای غیر منتظره")                
            }
            setIsSending(false)
        } catch (e) {
            mainContextValue?.onError("خطای غیر منتظره رخ داد!")
            setIsSending(false)
        }
    }, [])

    const getOrderTotalPrice = (order: CustomerOrder) => {
        let result = 0
        order.items?.forEach(item => {
            const quantity = Number(item.quantity_accepted_by_admin || item.quantity) || 0
            const price = Number(item.price_accepted_by_admin || item.price)
            result += (quantity * price)
        });
        const finalResult = result + (Number(order.delivery_price) || 0)
        return finalResult
    }




    return (
        <div
            key={order.pk}


            className="bg-slate-50   rounded-2xl border border-slate-200/90 overflow-hidden space-y-4 p-5 hover:border-amber-400  transition-all"
        >
            {/* Top Row Header */}
            <div className='flex  justify-between  items-center'>
                <div className="flex flex-3 flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-900 text-amber-400 font-mono font-bold flex items-center justify-center text-xs shadow-xs">
                            {order.pk}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-slate-900 font-mono">
                                    {order.pk}
                                </span>
                                <span className="text-xs text-slate-500">
                                    (تاریخ: {order.date_created})
                                </span>
                            </div>
                            <>
                                <span className="text-xs font-bold text-sky-800 flex items-center gap-1.5 mt-0.5">
                                    {generateDeliveyType(order)}

                                </span>
                            </>
                        </div>
                    </div>


                    {/* Customer info card */}
                    <div className="bg-white px-3.5 py-2 rounded-xl border border-slate-200 text-xs space-y-0.5">
                        <div className="font-extrabold text-slate-900">
                            {order.fname} {order.lname}  {customer?.store_name ? `(${customer.store_name})` : ''}
                        </div>
                        <div className="text-slate-500 font-mono text-[11px]">
                            📱 {toPersianDigits(customer?.phone || order.phone || "") || ""}
                        </div>
                        <div className="text-slate-400 text-[10px] truncate max-w-xs">
                            📍 {order.province?.name || ""} - {order.city?.name || ""} - {order.address}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Status selector */}
                        <select
                            value={order.order_status}
                            onChange={(e) => handleUpdateOrderStatus(order.pk, e.target.value)}
                            className={`p-2 rounded-xl text-xs font-bold border cursor-pointer ${order.order_status === 'PENDING_BY_ADMIN'
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : order.order_status === 'ACCEPTED(WAITING_FOR_PAYMENT)'
                                    ? 'bg-sky-100 text-sky-900 border-sky-300'
                                    : order.order_status === 'PAID'
                                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                        : order.order_status === 'OUT_FOR_TRANSIT'
                                            ? 'bg-blue-100 text-blue-900 border-blue-300'
                                            : order.order_status === 'DELIVERED'
                                                ? 'bg-teal-100 text-teal-900 border-teal-300'
                                                : 'bg-rose-100 text-rose-900 border-rose-300'
                                }`}
                        >
                            <option value="PENDING_BY_ADMIN">⏳ ۱. در انتظار بررسی</option>
                            <option value="ACCEPTED(WAITING_FOR_PAYMENT)">🔍 ۲. تایید شده توسط مدیر</option>
                            <option value="PAID">✅ ۳. پرداخت شده.</option>
                            <option value="OUT_FOR_TRANSIT">🚚 ۴. تحویل به باربری و ارسال</option>
                            <option value="DELIVERED">🎉 ۵. تحویل کامل به خریدار</option>
                            <option value="REJECTED">❌ رد / لغو سفارش</option>
                        </select>
                    </div>
                </div>
                <div className='flex-1 flex items-center justify-end'>
                    <div onClick={(e) => {

                        if (editingOrderPK === order.pk) {
                            setEditingOrderPk(null)
                            return;
                        }
                        setEditingOrderPk(order.pk)
                    }} className='p-1.5 border-2  border-gray-300 rounded-2xl w-10 h-10 flex items-center justify-center '>

                        <ChevronLeft className={`${editingOrderPK === order.pk && "transform-[rotate(-90deg)]"} transition-transform`} />
                    </div>
                </div>
            </div>

            {order.pk === editingOrderPK && <div>
                {/* Order Items Edit Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                    <table className="w-full text-xs text-right">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                                <th className="p-2.5">#</th>
                                <th className="p-2.5">کد کالا</th>
                                <th className="p-2.5">شرح محصول / قطعه</th>
                                <th className="p-2.5 text-center">تعداد درخواستی</th>
                                <th className="p-2.5 text-center">تعداد تایید انبار</th>
                                <th className="p-2.5">قیمت فعلی</th>
                                <th className="p-2.5">قیمت هنگام ثبت سفارش</th>
                                <th className="p-2.5">قیمت تاییدشده مدیر (تومان)</th>
                                <th className="p-2.5">مبلغ کل (تومان)</th>
                                <th className="p-2.5">حذف</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {order.items?.map((item, idx) => {
                                const approvedQty = Number(item.quantity_accepted_by_admin || item.quantity) || 0;
                                const approvedPrice = Number(item.price_accepted_by_admin || item.price) || 0;
                                const lineTotal = approvedQty * approvedPrice;

                                return (
                                    <tr key={idx} className="hover:bg-amber-50/40">
                                        <td className="p-2.5 font-mono text-slate-400 font-bold">{idx + 1}</td>
                                        <td className="p-2.5 font-mono font-bold text-slate-700">{item.product?.pk}</td>
                                        <td className="p-2.5 font-bold text-slate-900">
                                            {item.product?.title || "محصول یافت نشد"}
                                            <span className="block text-[11px] text-slate-400 font-normal">
                                                مدل: {item.product?.technical_model || "محصول یافت نشد"}
                                            </span>
                                        </td>
                                        <td className="p-2.5 text-center font-bold text-slate-500">
                                            {toPersianDigits(Number(item.quantity) || 0)} عدد
                                        </td>
                                        <td className="p-2.5 text-center">
                                            <input
                                                type="number"
                                                min="1"
                                                value={approvedQty}
                                                onChange={(e) => {
                                                    if (parseInt(e.target.value) <= 0) {
                                                        return;
                                                    }
                                                    handleUpdateOrderItemQuantity(order.pk, item.pk, parseInt(e.target.value) || 1)
                                                }}
                                                className="w-16 bg-amber-50 text-center font-bold text-slate-900 p-1.5 rounded-lg border border-amber-300 focus:ring-2 focus:ring-amber-500"
                                            />
                                        </td>
                                        <td className="p-2.5 font-mono text-slate-400">
                                            {formatPrice(item.product?.price ? item.product.price * (100 - (Number(item.product.off)) || 0) : 0, storeSettings.currencyUnit) || "محصول یافت نشد"}
                                        </td>
                                        <td className="p-2.5 font-mono text-slate-400">
                                            {formatPrice(Number(item.price), storeSettings.currencyUnit)}
                                        </td>
                                        <td className="p-2.5">
                                            <input
                                                type="number"
                                                step="1000"
                                                value={approvedPrice}
                                                onChange={(e) => {
                                                    if (parseInt(e.target.value) <= 0) {
                                                        return;
                                                    }
                                                    handleUpdateOrderItemPrice(order.pk, item.pk, parseFloat(e.target.value) || 0)
                                                }}
                                                className="w-28 bg-amber-50 font-mono font-bold text-slate-900 p-1.5 rounded-lg border border-amber-300 focus:ring-2 focus:ring-amber-500"
                                            />
                                        </td>
                                        <td className="p-2.5 font-extrabold text-sky-900 font-mono">
                                            {formatPrice(lineTotal, storeSettings.currencyUnit)}
                                        </td>
                                        <td className="p-2.5 font-extrabold text-sky-900 font-mono">
                                            <button onClick={() => setOrders(prev => [...prev].map(ele => {
                                                if (ele.pk !== order.pk) {
                                                    return ele
                                                }
                                                ele.items = ele.items && [...ele.items].filter(orderItem => orderItem.pk !== item.pk)
                                                return ele
                                            }))}>
                                                <Trash2 color='red' />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {order.order_status === "ACCEPTED(WAITING_FOR_PAYMENT)" &&
                    <div className="w-full border-2 border-gray-100 rounded-2xl p-3.5 bg-white">
                        <span className='text-2xl'>
                            تصویر رسید :
                        </span>
                        {order.payment_image ? <a href={order.payment_image} className="h-full">
                            <img src={order.payment_image} alt="" />
                        </a> : "تصویری ثبت نشده است"}
                    </div>
                }



                {/* Admin Note and Delivery Price Input */}
                <div className="flex flex-wrap md:flex-row items-center justify-between gap-4 pt-2">
                    {/* <div className="flex-1 w-full">
                            <label className="text-[11px] text-slate-600 font-bold block mb-1">
                              یادداشت مدیر جهت مشاهده مشتری (مثلاً نحوه تسویه یا کد باربری):
                            </label>
                            <input
                              type="text"
                              value={order.adminNote || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setOrders(prev => prev.map(o => o.id === order.id ? { ...o, adminNote: val } : o));
                              }}
                              placeholder="مثلاً: اقلام آماده تحویل به باربری جهاد است. پس از واریز بیعانه ارسال می‌شود."
                              className="w-full bg-white text-xs p-2.5 rounded-xl border border-slate-300"
                            />
                          </div> */}
                    <div className="flex-1 w-full">
                        <label className="text-[11px] text-slate-600 font-bold block mb-1">
                            هزینه ارسال:
                        </label>
                        <input
                            type="text"
                            value={order.delivery_price || ""}
                            onChange={(e) => {
                                const val = e.target.value;
                                const onlyNumbers = val.replace(/\D/g, "")

                                setOrders(prev => ([...prev].map(o => o.pk === order.pk ? { ...o, delivery_price: Number(onlyNumbers) || 0 } : o)));
                            }}
                            placeholder="هزینه ارسال"
                            className="w-full bg-white text-xs p-2.5 rounded-xl border border-slate-300"
                        />
                    </div>
                    {/* Total and Invoice Issue Button */}
                    <div className="flex flex-wrap items-center gap-3 shrink-1">
                        <div className="text-left font-mono">
                            <span className="text-[10px] text-slate-400 block">جمع کل فاکتور:</span>
                            <span className="text-base font-extrabold text-sky-950">
                                {formatPrice(getOrderTotalPrice(order), storeSettings.currencyUnit)}
                            </span>
                        </div>

                        <button
                            onClick={() => handleUpdateOrder(order)}
                            disabled={isSending}
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md"
                        >
                            {isSending ? <Spinner width={17.5} height={17.5} borderMainColor={"white"} borderTopColor={"green"} borderWidth={1.5} /> :
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>اعمال تغییرات</span>
                                </>
                            }
                        </button>




                    </div>
                </div>


                {/* Order Ticket Chat for Admin & Support */}
                <div className="pt-2">
                    <OrderTicketChat
                        order={order}
                        currentUserRole="admin"
                        page="adminPanel"
                        setOrders={setOrders}
                        user={user}
                        currentUserName="مدیریت پشتیبانی"
                        defaultExpanded={order.order_tickets && order.order_tickets.length > 0}
                    />
                </div>
            </div>}
        </div>
    );

}