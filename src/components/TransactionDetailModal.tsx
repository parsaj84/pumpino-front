import { useState } from "react";
import { Transaction } from "../types";
import { X } from "lucide-react";


interface TransactionDetailModalProos {
    transaction: Transaction;
    onClose: () => void
}


export default function TransactionDetailModal({ transaction, onClose }: TransactionDetailModalProos) {
    const user = transaction.user
    console.log(user)
    const getTransactionReason = (transaction: Transaction) => {
        if (transaction.return_request) {
            return `مرجوعی کالا با کد درخواست ${transaction.return_request.pk}`
        }
        if (transaction.order) {
            return `پرداخت سفارش به کد ${transaction.order.pk}`
        }
    }


    return (
        <div className="fixed z-150 flex items-center justify-center inset-0 w-dvw h-dvh bg-black/25">
            <div className="max-h-[50%] overflow-auto p-3 bg-white rounded-md w-[90%] md:w-[75%]">
                <div className="flex w-full justify-between items-center">
                    <span
                        className="font-semibold"
                    >
                        جزئیات تراکنش
                    </span>
                    <button onClick={onClose} className="p-1.5 bg-slate-300 w-10 h-10 rounded-xl flex justify-center items-center">
                        <X size={17.5} className="transition-colors hover:text-red-600" />
                    </button >
                </div>
                <div className=" my-3 w-full ">
                    <div className="w-full my-1 flex items-center justify-between gap-1.5">
                        <div className="w-full text-center bg-slate-50 p-1.5 rounded-md " >
                            نام و نام کاربری مشتری
                        </div>
                        <div className="w-full text-center p-1.5 bg-gray-100 rounded-md">
                            {`${(user?.fname || user?.lname) ? (user.fname || "") + " " + (user.lname || "") : ""} `}
                        </div>
                    </div>
                    <div className="w-full my-1 flex items-center justify-between gap-1.5">
                        <div className="w-full text-center bg-slate-50 p-1.5 rounded-md " >
                            شماره تلفن
                        </div>
                        <div className="w-full text-center p-1.5 bg-gray-100 rounded-md">
                            {user?.phone}
                        </div>
                    </div>
                    <div className="w-full my-1 flex items-center justify-between gap-1.5">
                        <div className="w-full text-center bg-slate-50 p-1.5 rounded-md " >
                            تاریخ ایجاد
                        </div>
                        <div className="w-full text-center p-1.5 bg-gray-100 rounded-md">
                            {transaction.date_created}
                        </div>
                    </div>
                    <div className="w-full my-1 flex items-center justify-between gap-1.5">
                        <div className="w-full text-center bg-slate-50 p-1.5 rounded-md " >
                            دلیل
                        </div>
                        <div className="w-full text-center p-1.5 bg-gray-100 rounded-md">
                            {getTransactionReason(transaction)}
                        </div>
                    </div>
                    <div className="w-full flex  items-start my-1 justify-between gap-1.5">

                        <div className="w-full text-center bg-slate-50 p-1.5 rounded-md " >
                            عکس مربوط به مستندات
                        </div>
                        <div className="w-full text-center p-1.5 bg-gray-100 rounded-md">
                            {transaction.document_file ?
                                <img src={transaction.document_file} />
                                :
                                <span className="font-semibold">
                                    ثبت نشده
                                </span>
                            }
                        </div>
                    </div >


                </div>
            </div>
        </div>
    )
}
