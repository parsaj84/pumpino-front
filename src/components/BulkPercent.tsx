import { useCallback, useContext, useState } from "react";
import { toPersianDigits } from "../utils/formatters";
import { CheckCircle2, Percent } from "lucide-react";
import API from "@/api/api";
import Spinner from "./Spinner";
import { Brand, Category } from "../types";
import { MainContext } from "../contexts/MainContext";

interface BulkPercentProps {
    brands: Brand[],
    categories: Category[]
}


export default function BulkPercent({ brands, categories }: BulkPercentProps) {
    type UpdateType = "category" | "brand" | ""
    
    const mainContextValue = useContext(MainContext)

    const [successMsg, setSuccessMsg] = useState("")
    const [categoryBulkPercentVal, setCategoryBulkPercentVal] = useState(0)
    const [brandBulkPercentVal, setBrandBulkPercentVal] = useState(0)
    const [selectedBrandPK, setSelectedBrandPK] = useState<number | string>("none")
    const [selectedCategoryPK, setSelectedCategoryPK] = useState<number | string>("none")
    const [isUpdatingByBrand, setIsUpdatingByBrand] = useState(false)
    const [isUpdatingByCategory, setIsUpdatingByCategory] = useState(false)
    const [isUpdating, setIsUpdating] = useState<UpdateType>("")
    const [brandError, setBrandError] = useState("")
    const [categoryError, setCategoryError] = useState("")


    const compileDataToSearchParams = useCallback((updateType: UpdateType) => {


        const searchParams = new URLSearchParams({
            category_id: selectedCategoryPK.toString(),
            brand_id: selectedBrandPK.toString(),
            update_type: updateType
        })
        return "?" + searchParams.toString()

    }, [selectedBrandPK, selectedCategoryPK])

    const handleApplyBulkPercent = async (bulkPercentVal: number, type: UpdateType, ID: string) => {
        try {
            setBrandError("")
            setCategoryError("")
            if (selectedBrandPK === "none" && type === "brand") {
                setBrandError("لطفا یک برند را انتخاب کنید")
                return;
            }
            if (selectedCategoryPK === "none" && type === "category") {
                setCategoryError("لطفا یک دسته انتخاب کنید")
                return;
            }
            setIsUpdating(type)
            const { status, data } = await API.put("products/product-bulk-update/" + compileDataToSearchParams(type), { off: bulkPercentVal })
            if (status === 200) {
                setSuccessMsg("تغییرات با موفقیت اعمل شد")
                setTimeout(() => setSuccessMsg(""), 1500)
            } else {
                const e = data.error_des || data.detail || "خطا"
                mainContextValue?.onError(typeof e === "object" ? mainContextValue.onError(compileErrorOBJToArray(e)?.join(",")) : e)

            }
            setIsUpdating("")
        } catch (e) {
            mainContextValue?.onError("")
            setIsUpdating("")
        }
    }




    return (
        <>
            {successMsg && (
                <div className="bg-emerald-100 text-emerald-900 p-3.5 rounded-2xl border border-emerald-300 font-bold text-xs flex items-center gap-2 animate-bounce">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>{successMsg}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6 max-w-2xl">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Percent className="w-5 h-5 text-sky-600" />
                        <span>افزایش یا کاهش درصد گروهی قیمت محصولات(براساس برند)</span>
                    </h3>

                    <div className="space-y-4 text-xs">
                        <div>
                            <label className="font-bold text-slate-700 block mb-1">
                                انتخاب برند یا گروه کالایی جهت تغییر قیمت:
                            </label>
                            <select
                                value={selectedBrandPK}
                                onChange={(e) => setSelectedBrandPK(e.target.value)}
                                className="w-full bg-slate-50 p-3 rounded-xl border border-slate-300 cursor-pointer font-bold"
                            >
                                <option value="none">-------</option>
                                {brands.map(b => (
                                    <option key={b.pk} value={b.pk}>محصولات برند {b.name}</option>
                                ))}
                            </select>
                            {brandError &&
                                <p className="my-1 text-red-500">
                                    {brandError}
                                </p>
                            }
                        </div>

                        <div>
                            <label className="font-bold text-slate-700 block mb-1">
                                درصد تغییر قیمت (%):
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={brandBulkPercentVal}
                                onChange={(e) => setBrandBulkPercentVal((parseFloat(e.target.value) || 0) > 100 ? 100 : parseFloat(e.target.value) || 0)}
                                className="w-full bg-slate-50 p-3 rounded-xl border border-slate-300 font-bold text-base text-center"
                            />
                        </div>

                        <div className="pt-2 flex items-center justify-center gap-3">
                            <button
                                disabled={isUpdating ? true : false}
                                onClick={() => handleApplyBulkPercent(brandBulkPercentVal, "brand", selectedBrandPK.toString())}
                                className="flex-1 flex justify-center items-center py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer shadow"
                            >
                                {isUpdating === "brand" ?
                                    <Spinner borderMainColor={"white"} borderTopColor={"blue"} height={17.5} width={17.5} borderWidth={1.75} />

                                    : ` تغییر تخفیف به ${toPersianDigits(brandBulkPercentVal)}%`}

                            </button>


                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6 max-w-2xl">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Percent className="w-5 h-5 text-sky-600" />
                        <span>افزایش یا کاهش درصد گروهی قیمت محصولات(براساس دسته بندی)</span>
                    </h3>

                    <div className="space-y-4 text-xs">
                        <div>
                            <label className="font-bold text-slate-700 block mb-1">
                                انتخاب برند یا گروه کالایی جهت تغییر قیمت:
                            </label>
                            <select
                                value={selectedCategoryPK}
                                onChange={(e) => setSelectedCategoryPK(e.target.value)}
                                className="w-full bg-slate-50 p-3 rounded-xl border border-slate-300 cursor-pointer font-bold"
                            >
                                <option value="none">------</option>
                                {categories.map(c => (
                                    <option key={c.pk} value={c.pk}>محصولات دسته {c.name}</option>
                                ))}
                            </select>
                            {categoryError && <p className="my-1 text-red-500">
                                {categoryError}
                            </p>}
                        </div>

                        <div>
                            <label className="font-bold text-slate-700 block mb-1">
                                درصد تغییر قیمت (%):
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={categoryBulkPercentVal}
                                onChange={(e) => setCategoryBulkPercentVal((parseFloat(e.target.value) || 0) > 100 ? 100 : parseFloat(e.target.value) || 0)}
                                className="w-full bg-slate-50 p-3 rounded-xl border border-slate-300 font-bold text-base text-center"
                            />
                        </div>

                        <div className="pt-2 flex items-center justify-center gap-3">
                            <button
                                disabled={isUpdating ? true : false}
                                onClick={() => handleApplyBulkPercent(categoryBulkPercentVal, "category", selectedCategoryPK.toString())}
                                className="flex-1 flex items-center justify-center py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer shadow"
                            >
                                {isUpdating === "category" ?
                                    <Spinner borderMainColor={"white"} borderTopColor={"blue"} height={17.5} width={17.5} borderWidth={1.75} />
                                    :
                                    ` تغییر تخفیف به ${toPersianDigits(categoryBulkPercentVal)}%`
                                }
                            </button>


                        </div>
                    </div>
                </div>
            </div>
        </>

    )
}