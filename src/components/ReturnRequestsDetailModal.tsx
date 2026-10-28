
import { ReturnRequest } from "../types";
import { X } from "lucide-react";

interface ReturnRequestDetailModalProps {
    returnRequest: ReturnRequest;
    onClose: () => void;
    
}



export default function ReturnRequestDetailModal({ returnRequest, onClose }: ReturnRequestDetailModalProps) {

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
        <div className="w-dvw fixed top-0 right-0 h-dvh flex justify-center items-center z-150 bg-gray-800/50">
            <div className="w-[85%] p-1.5 max-h-75 md:w-150 overflow-y-auto m-1 bg-white rounded-xl">
                <div className="flex w-full justify-between items-center">
                    <span className="font-bold text-md ">
                        جزئیات درخواست مرجوعی
                    </span>
                    <button onClick={() => onClose()} className="p-1.5 hover:text-red-600 rounded-xl transition-colors bg-slate-100 ">
                        <X className="" size={22.5} />
                    </button>
                </div>
                <div>
                    <div className="flex gap-1 my-1 w-full justify-center items-center">
                        <div className="w-[50%] text-center bg-gray-400 p-1.5 rounded-xl">
                            دلیل
                        </div>
                        <div className="w-[50%] text-center bg-gray-100 p-1.5 rounded-xl">
                            {getReasonText(returnRequest.reason)}
                        </div>
                    </div>
                    <div className="flex gap-1 my-1 w-full justify-center items-center">
                        <div className="w-[50%] text-center bg-gray-400 p-1.5 rounded-xl">
                            تاریج ایجاد
                        </div>
                        <div className="w-[50%] text-center bg-gray-100 p-1.5 rounded-xl">
                            {(returnRequest.date_created)}
                        </div>
                    </div>
                    <div className="flex gap-1 my-1 w-full justify-center items-center">
                        <div className="w-[50%] text-center bg-gray-400 p-1.5 rounded-xl">
                            اخرین تغییر
                        </div>
                        <div className="w-[50%] text-center bg-gray-100 p-1.5 rounded-xl">
                            {(returnRequest.date_created)}
                        </div>
                    </div>
                    <div className="flex gap-1 my-1 w-full justify-center items-center">
                        <div className="w-[50%] text-center self-baseline bg-gray-400 p-1.5 rounded-xl">
                            توضیحات
                        </div>
                        <div className="w-[50%] text-center bg-gray-100 p-1.5 rounded-xl">
                            {returnRequest.description || "ثبت نشده"}
                        </div>
                    </div>
                    <div className="flex gap-1 my-1 w-full justify-center items-center">
                        <div className="w-[50%] text-center self-baseline bg-gray-400 p-1.5 rounded-xl">
                            عکس ارسالی مشتری
                        </div>
                        <div className="w-[50%] text-center bg-gray-100 p-1.5 rounded-xl">
                            {returnRequest.reason_prove_file ? <img src={returnRequest.reason_prove_file} /> : "ثبت نشده"}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}