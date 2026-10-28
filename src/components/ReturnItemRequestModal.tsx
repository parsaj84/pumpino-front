import { Image, X } from "lucide-react";
import React, { FormEvent, SetStateAction, SubmitEvent, useContext, useRef, useState } from "react";
import SelectInput from "./SelectInput";
import { image, img } from "motion/react-client";
import API from "@/api/api";
import Spinner from "./Spinner";
import { CustomerOrder, OrderItem, ReturnRequest } from "../types";
import { MainContext, MainContextValue } from "../contexts/MainContext";



interface ReturnModalRequestModalProps {
    itemID: number | string | null;
    orderID: number | string | null;
    onClose: () => void;
    setOrders: React.Dispatch<SetStateAction<CustomerOrder[]>>;
    returnRequest: ReturnRequest | null;

}

interface ReasonInput {
    selected: boolean;
    labelName: string;
    dbName: string;

}

export const ReturnItemRequestModal: React.FC<ReturnModalRequestModalProps> = ({
    itemID,
    orderID,
    onClose,
    setOrders,
    returnRequest
}) => {
    const mainContextValue = useContext<MainContextValue>(MainContext)
    if (!itemID || !orderID) {
        return;
    }
    const processFile = (file: File | null): Promise<string | ArrayBuffer> | null => {
        if (!file) {
            return null
        }
        return new Promise((resolve, reject) => {
            try {

                const reader = new FileReader()
                reader.addEventListener("load", (e) => {
                    return resolve(e.target?.result || "")
                });
                reader.readAsDataURL(file)
            } catch (e) {
                return reject("ارور در پردازش تصویر")
            }
        })
    }

    const handleImageInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const files = (e.target as HTMLInputElement)?.files
            const result = await processFile(files && files[0])
            if (result) {
                setImageURL(result)
            }
        } catch (e) {
            mainContextValue?.onError("خطا در پردازش تصویر")
        }
    }

    const reasonsMapping: ReasonInput[] = [
        {
            selected: false,
            dbName: "damaged",
            labelName: "کالا اسیب دیده"
        },
        {
            selected: false,
            dbName: "wrong_item",
            labelName: "کالا اشتباه ارسال شده"
        },
        {
            selected: false,
            dbName: "defective",
            labelName: "کالای معیوب"
        },
        {
            selected: false,
            dbName: "not_as_described",
            labelName: "مطابق توضیحات نبود"
        },
        {
            selected: false,
            dbName: "change_of_mind",
            labelName: "انصراف از خرید"
        },
        {
            selected: false,
            dbName: "other",
            labelName: "سایر موارد"
        },
    ]

    const compileReasons = () => {
        if (!returnRequest) {
            return reasonsMapping
        }
        return reasonsMapping.map(ele => {
            if (ele.dbName === returnRequest?.reason) {
                ele.selected = true
            }
            return ele
        })
    }

    const [reasons, setReasons] = useState<ReasonInput[]>(compileReasons)

    const [reasonError, setReasonError] = useState("")
    const [description, setDescription] = useState(returnRequest?.description || "")
    const [descriptionError, setDescriptionError] = useState("")
    const imageInputRef = useRef<HTMLInputElement>(null)
    const [imageURL, setImageURL] = useState<string | ArrayBuffer>(returnRequest?.reason_prove_file || "")
    const [isSending, setIsSending] = useState<boolean>(false)
    const [imageError, setImageError] = useState("")



    const handleFormSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
        try {
            e.preventDefault()
            const reason = reasons.find(ele => ele.selected)
            if (!reason) {
                setReasonError("لطفا دلیل مرجوعی را وارد کنید")
                return;
            }
            if (!description) {
                setDescriptionError("لطفا این فیلد را پر کنید")
                return;
            }
            const maxSize = 1024 * 1024
            const formData = new FormData(e.target)
            const image = formData.get("reason_prove_file") as File
            const imageSize = image.size
            if (imageSize >= maxSize) {
                setImageError("اندازه عکس بیشتر از حد مجاز")
            }
            formData.append("reason", reason.dbName)
            formData.append("order_id", String(orderID));
            formData.append("item_id", String(itemID));
            setIsSending(true)

            const { data, status } = await (returnRequest ? API.put(`orders/return-request-update/${returnRequest.pk}/`, formData) : API.post("orders/return-request-create/", formData))
            if (status === 200) {
                setOrders(prev => [...prev].map(order => {
                    if (order.pk === orderID) {
                        order.items = order.items && [...order.items].map(item => {
                            if (item.pk === itemID) {
                                item.return_request = data.result
                            }
                            return item
                        })
                    }
                    return order
                }));
                onClose()
            } else {
                mainContextValue?.onError("خطا!")
            }
            setIsSending(false)
        } catch (e) {
            mainContextValue?.onError("خطا!")
            setIsSending(false)

        }
    }

    return (
        <div className="fixed z-150 flex justify-center items-center inset-0 w-dvw h-dvh bg-gray-800/50">
            <div className="m-1.5 overflow-y-auto   p-1.5 rounded bg-white w-[90%] md:w-[75%]">
                <div className="flex justify-between items-center  ">
                    <span className="
                    font-bold

                    ">
                        فرم درخواست مرجوعی

                    </span>
                    <button onClick={onClose} className="">
                        <X size={30} className="hover:text-red-600 transition-colors duration-150" />
                    </button>
                </div>
                <form onSubmit={handleFormSubmit} action="">
                    <div className="my-1.5 grid grid-cols-1  ">
                        <div>
                            <SelectInput isLoadingItems={false} selectedItem={reasons.find(ele => ele.selected)} items={reasons} labelProperty={"labelName"} label={"دلیل"} onItemSelected={(item: ReasonInput) => setReasons(prev => [...prev].map(reason => {
                                if (reason.dbName === item.dbName) {
                                    reason.selected = true
                                    return reason
                                }
                                reason.selected = false
                                return reason
                            }))} />
                            {reasonError && <p className="text-red-600 my-1 text-sm">
                                {reasonError}
                            </p>}
                        </div>
                        <div>
                            <label htmlFor="#description">
                                توضیحات
                            </label>
                            <textarea

                                onChange={(e) => {
                                    setDescription(e.target.value);
                                }}
                                value={description}
                                placeholder="توضیحات" maxLength={300} name="description" id="description" className="w-full max-h-48 border-2 bg-slate-50 border-slate-300 my-1.5 rounded-md outline-none p-1.5" />
                            {descriptionError &&
                                <p className="text-red-600  text-sm">
                                    {descriptionError}
                                </p>
                            }
                        </div>

                        <div onClick={() => {
                            if (imageInputRef.current) {
                                imageInputRef.current.click()
                            }
                        }} className="border-2 cursor-pointer overflow-auto flex flex-col items-center justify-center border-slate-300 border-dashed w-full h-37.5 overflow-y-auto ">
                            <input onChange={handleImageInput} ref={imageInputRef} type="file" hidden accept="image/*" name="reason_prove_file" />
                            <Image size={45} className="text-gray-400" />
                            <div className="w-full flex justify-center items-center flex-col">
                                <span className="font-bold w-full felx justify-center gap-0 items-center text-center text-gray-400">
                                    برای اپلود عکس کنید
                                </span>

                                <span className="font-bold text-gray-400">
                                    حجم عکس نباید بیشتر از دو مگابایت باشد
                                </span>
                                {imageError &&
                                    <p className="font-bold my-0.5 text-red-500">
                                        {imageError}
                                    </p>
                                }

                            </div>
                            {imageURL &&
                                <div className="h-15 my-1.5">
                                    <img src={imageURL as string} width={300} height={300} />

                                </div>
                            }
                        </div>
                    </div>
                    <div className="w-full " >
                        <button disabled={isSending} type="submit" className="p-1.5 w-full flex items-center justify-center text-white hover:bg-green-700 transition-colors rounded-md bg-green-600">
                            {isSending ? <Spinner borderMainColor={"white"} borderTopColor={"green"} borderWidth={1.75} height={17.5} width={17.5} /> :
                                <span>ثبت</span>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}