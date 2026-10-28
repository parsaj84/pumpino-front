import {
    Inbox,
    ArrowDownLeft, ArrowUpRight
    , X
} from "lucide-react";
import { ReactElement, useCallback, useContext, useEffect, useState } from "react";
import { Transaction } from "../types";
import { formatPrice } from "../utils/formatters";
import fetchData from "../utils/fetchData";
import Skeleton from "react-loading-skeleton";
import { MainContext, MainContextValue } from "../contexts/MainContext";

interface UserTransactionModalProps {
    userId: number | string;
    onClose: () => void
}

export default function UserTransactionModal({
    userId,
    onClose
}: UserTransactionModalProps) {
    const mainContextValue = useContext<MainContextValue>(MainContext)

    const [isLoadingTransactions, setIsLoadingTransactions] = useState(true)
    const [transactions, setTransactions] = useState<Transaction[]>([])


    useEffect(() => {
        fetchData("orders/admin-user-transactions/" + userId, ({ data, status }) => {
            if (status === 200) {
                setTransactions(data)
            } else {
                mainContextValue?.onError("خطا در دریافت اطلاعات")
            }
            setIsLoadingTransactions(false)
        }, () => setIsLoadingTransactions(true), () => mainContextValue?.onError("خطا در دریافت اطلاعات"))
    }, [
        userId
    ])



    const getReasonText = useCallback((transaction: Transaction): string => {
        switch (transaction.transaction_type) {
            case "PAYMENT":
                return `پرداخت سفارش با کد ${transaction.order}`
            case "RETURN_PRICE":
                return `بازگشت وجه درخواست مرجوعی به کد ${transaction.return_request}`
            default:
                return "دلیل نامشخص"
        }
    }, [])


    const getTransactionTypeBedge = useCallback((transaction: Transaction): ReactElement => {
        const isRecieved = transaction.transaction_type === "PAYMENT"
        return (
            <div className={`p-1 border-2 max-w-3/4 rounded-xl m-1.5 flex items-center justify-center gap-1 text-xs ${isRecieved ? "bg-emerald-500/50 border-emerald-500/50 text-emerald-700" : "bg-red-500/50 border-red-600/50 text-red-800"}`}>
                {isRecieved ? <ArrowDownLeft size={15} className="text-emerald-700" /> : <ArrowUpRight size={15} className="text-red-800" />}
                <span>
                    {isRecieved ? "دریافت" : "پرداخت به مشتری"}
                </span>
            </div>
        )

    }, [])

    return (
        <div className="w-dvw fixed inset-0 z-150 h-dvh bg-black/50 flex justify-center items-center">
            <div className="bg-white max-h-[75%] w-[90%] md:w-[75%] overflow-auto p-3 rounded-xl ">
                <div className="flex justify-between items-center w-full">
                    <div >
                        <span className="text-md font-semibold text-black">
                            جرئیات مالی کاربر
                        </span>
                    </div>

                    <button onClick={onClose} className="p-2.5  rounded-2xl hover:text-red-500 transition-colors bg-slate-200 w-10 h-10 flex items-center justify-center">
                        <X size={17.5} className="" />
                    </button >
                </div>
                <div className="overflow-auto my-3 rounded w-full ">
                    <table
                        className="border-collapse   min-w-300  "
                    >
                        <thead className="bg-gray-50 rounded-t-xl ">
                            <tr>
                                <th className="p-1.5 text-center text-sm font-semibold text-gray-500">
                                    کد تراکنش
                                </th>
                                <th className="p-1.5 text-center text-sm font-semibold text-gray-500">
                                    مبلغ
                                </th>
                                <th className="p-1.5 text-center text-sm font-semibold text-gray-500">
                                    تاریخ ایجاد
                                </th>

                                <th className="p-1.5 text-center text-sm font-semibold text-gray-500">
                                    دلیل

                                </th>

                                <th className="p-1.5 text-center text-sm font-semibold text-gray-500">
                                    نوع تراکنش
                                </th>

                            </tr>
                        </thead>
                        <tbody>
                            {isLoadingTransactions ?
                                Array(6).fill({}).map(ele => {
                                    return (
                                        <tr className="bg-slate-50 transition-colors hover:bg-slate-200">
                                            <td className="p-1.5 text-center text-sm font-semibold text-gray-500">
                                                <Skeleton width={75} height={15} />
                                            </td>
                                            <td className="p-1.5 text-center text-sm font-semibold text-gray-500">
                                                <Skeleton width={75} height={15} />
                                            </td>
                                            <td className="p-1.5 text-center text-sm font-semibold text-gray-500">
                                                <Skeleton width={75} height={15} />
                                            </td>
                                            <td className="p-1.5 text-center text-sm font-semibold text-gray-500">
                                                <Skeleton width={75} height={15} />
                                            </td>
                                            <td className="p-1.5 flex w-full justify-center text-center text-sm font-semibold text-gray-500">
                                                <Skeleton width={75} height={15} />
                                            </td>
                                        </tr>
                                    )
                                })
                                : (
                                    transactions.map(transaction => {

                                        return (
                                            <tr className="bg-slate-50 transition-colors hover:bg-slate-200">
                                                <td className="p-1.5 text-center text-sm font-semibold text-gray-500">
                                                    {transaction.pk}
                                                </td>
                                                <td className="p-1.5 text-center text-sm font-semibold text-gray-500">
                                                    {formatPrice(transaction.price)}
                                                </td>
                                                <td className="p-1.5 text-center text-sm font-semibold text-gray-500">
                                                    {transaction.date_created}
                                                </td>
                                                <td className="p-1.5 text-center text-sm font-semibold text-gray-500">
                                                    {getReasonText(transaction)}
                                                </td>
                                                <td className="p-1.5 flex w-full justify-center text-center text-sm font-semibold text-gray-500">
                                                    {getTransactionTypeBedge(transaction)}
                                                </td>
                                            </tr>
                                        )
                                    })

                                )}
                        </tbody>
                    </table>
                    {transactions.length === 0 &&
                        <div className="p-8 flex flex-col  min-w-300 justify-center items-center ">
                            <Inbox size={35} className="text-gray-500" />
                            <span className="font-semibold text-gray-500 ">
                                هیچ تراکنشی برای این کاربر وجود ندارد
                            </span>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
} 