import { X } from "lucide-react";
import {  useContext, useRef, useState } from "react";
import Spinner from "./Spinner";
import API from "@/api/api";
import { MainContext } from "../contexts/MainContext";

export default function SubmitReciptModal({ onClose, order , setOrders}) {
    const mainCotextValue = useContext(MainContext)

    const imageInputRef = useRef(null)
    const [imageSrc, setImageSrc] = useState(order.payment_image)
    const imageEntered = useRef(false)
    const formRef = useRef(null)
    const [error, setError] = useState("")
    const [isSending, setIsSending] = useState(false)

    const validateFile = (file) => {
        const sizeLimit = 2 * 1024 * 1024
        if (!file) {
            setError("لطفا فایل را وارد کنی")
            return false
        }

        if (file.size > sizeLimit) {
            setError("حجم عکس بیش از حد مجاز")
            return false
        }
        if (file.type !== "image/jpeg" && file.type !== "image/png") {
            setError("فرمت غیرمجاز")
            return false
        }
        return true
    }

    const handleImageInput = async (event) => {
        try {
            setImageSrc("")
            setError("")
            
            const file = event.target.files[0]
            const result = validateFile(file)
            
            if (!result) {
                return;
            }
            const fileReader = new FileReader()
            fileReader.onload = (e) => {
                setImageSrc(e.target?.result)
                imageEntered.current = true
            }
            fileReader.readAsDataURL(file)
        } catch (err) {
            mainCotextValue?.onError("خطا در فرایند پردازش تصویر")
        }
    }
    const handleSubmitToBackend = async () => {
        try {
            const formData = new FormData(formRef.current)
            const file = formData.get("receipt_image")
            const result = validateFile(file)
            if (!imageEntered.current) {
                setError("لطفا عکس را وارد کنید")
                return ;
            }
            if (!result) {
                return;
            }
            setIsSending(true)
            formData.append("order_id", order?.pk)
            const { data, status } = await API.post("orders/submit-payment-receipt/", formData)
            if (status === 200 && data.success) {
                setOrders(prev => [...prev].map(ele => {
                    if (ele.pk !== order.pk) {
                        return ele
                    }
                    ele.payment_image = imageSrc
                    return ele
                }))
                onClose()
                mainCotextValue.onSuccess("رسید با موفقیت ثبت شد!")
            } else {
                setError(data.error_des || data.detail || "خطا غیرمنتظره")
            }
            setIsSending(false)
        } catch (e) {
            mainCotextValue?.onError("خطا در فرایند ثبت رسید!")
            setIsSending(false)
        }
    }
    return (
        <div style={{ backgroundColor: "rgba(0, 0,0 , 0.5)" }} className="fixed top-0 bg-rgb bg right-0  z-50 w-dvw h-dvh flex justify-center items-center" >
            <div className="p-3 w-4/5  bg-gray-50 rounded-2xl shadow-2xl ">
                <div className="flex w-full justify-between items-center">
                    <span className="font-bold text-gray-950">ثبت فیش پرداخت</span>
                    <X onClick={onClose} className="text-2xl  hover:text-red-500 transition-colors" />
                </div>
                <div className="w-full flex flex-col justify-center items-center">
                    <div onClick={() => imageInputRef.current?.click()} className="w-11/12 p-1.5 box-border overflow-auto my-3.5 flex flex-col rounded-2xl cursor-pointer items-center justify-center h-75 bg-gray-100 ">
                        <span className="text-xl text-gray-500"> برای انتخاب فیش کلیک کنید</span>
                        <span className="text-sm text-gray-300">عکس در فرمت jpeg , png و در حجم کمتر از دو مگابایت وارد کنید</span>
                        {error && <span className="text-sm text-red-500">{error}</span>}
                        <form ref={formRef}  className="hidden">
                            <input onChange={handleImageInput} ref={imageInputRef} type="file" accept="image/*" name="receipt_image" id="" className="hidden" />
                        </form>
                        <img className={`my-1.5 ${imageSrc ? "" : "hidden"}`} width={"150px"} height={"75px"} src={imageSrc} alt="" />

                    </div>
                    <button onClick={handleSubmitToBackend} disabled={isSending} className="py-1.5 flex justify-center items-center px-3 bg-cyan-400 font-extrabold w-11/12 rounded-2xl vazirMatn text-amber-50">
                        {isSending ? <Spinner height={15} borderWidth={1.5} borderMainColor={"white"} borderTopColor={"blue"} width={15} /> : "ارسال"}
                    </button>
                </div>
            </div>
        </div>
    )
}