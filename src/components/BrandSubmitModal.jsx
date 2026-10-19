import API from "@/api/api";
import { Sparkles, X } from "lucide-react";
import { useState } from "react";
import Spinner from "./Spinner";

export default function BrandSubmitModal({ setIsQuickBrandModalOpen , setBrands }) {
    const [ brandName , setBrandName ] =useState("")
    const [brandCountry, setBrandCountry] = useState("")
    const [isSubmiting , setIsSubmiting] = useState(false)
    const [error , setError] = useState("")

    const handleCreateQuickBrand = async (e) => {
        try {
            e.preventDefault()
            setError("")
            if (!(brandName && brandCountry)) {
                setError("لطفا هر دو فیلد را پر کنید")
            }
            const brandData = {
                name : brandName,
                country : brandCountry
            }
            setIsSubmiting(true)
            const {data   , status} = await API.post("products/admin-brand-create/", brandData )
            console.log(data , status, "brand response payload")
            if (status === 200) {
                setBrands(prev => [...prev , data.brand])
                setIsQuickBrandModalOpen(false)
                return ;
            } else {
                const e = data.error_des || data.detail || "خطا"
                console.log(e)
            }
            setIsSubmiting(false)
        } catch(e) {
            console.log(e)
            setIsSubmiting(false)

        }
    }

    return (
        <div className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative border border-slate-200 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-sm font-extrabold text-slate-900">ایجاد برند و سازنده جدید</h3>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsQuickBrandModalOpen(false)}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleCreateQuickBrand} className="space-y-3.5 text-xs">
                    <div>
                        <label className="font-bold text-slate-700 block mb-1">نام فارسی برند: *</label>
                        <input
                            type="text"
                            
                            placeholder="مثلاً: ابارا یا پنتکس"
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 focus:bg-white focus:border-indigo-600 outline-none"
                        />
                    </div>



                    <div>
                        <label className="font-bold text-slate-700 block mb-1">کشور سازنده:</label>
                        <input
                            type="text"
                            placeholder="ایران، ایتالیا، چین، آلمان..."
                            value={brandCountry}
                            onChange={(e) => setBrandCountry(e.target.value)}
                            className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 focus:bg-white focus:border-indigo-600 outline-none"
                        />
                    </div>

                    {error && 
                    <p  className="my-1.5 text-red-500">
                        {error}
                    </p>
                    }


                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setIsQuickBrandModalOpen(false)}
                            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                        >
                            انصراف
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-extrabold hover:bg-indigo-700 shadow"
                        >
                            {isSubmiting ?
                             <Spinner borderMainColor={"white"} borderTopColor={"blue"} borderWidth={1.75} height={17.5} width={17.5}/>
                             : 
                            "ذخیره برند"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}