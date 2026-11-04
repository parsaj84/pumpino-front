import { Dispatch, ReactHTMLElement, SetStateAction, useContext, useEffect, useState } from "react";
import { Brand, Category } from "../types";
import { Layers, Package, Plus, Sparkles, Trash2 } from "lucide-react";
import fetchData from "../utils/fetchData";
import { MainContext, MainContextValue } from "../contexts/MainContext";
import API from "@/api/api";
import { toPersianDigits } from "../utils/formatters";
import Spinner from "./Spinner";
import Skeleton from "react-loading-skeleton";


interface CategoriesBrandsManageProps {
    setIsQuickCategoryModalOpen: Dispatch<SetStateAction<boolean>>
    setIsQuickBrandModalOpen: Dispatch<SetStateAction<boolean>>
    setSuccessMsg: Dispatch<SetStateAction<string>>

}




export default function CategoriesBrandsManage(
    {
        setIsQuickCategoryModalOpen,
        setIsQuickBrandModalOpen,
        setSuccessMsg
    }: CategoriesBrandsManageProps
) {
    const mainContextValue = useContext<MainContextValue>(MainContext)


    const [brands, setBrands] = useState<Brand[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [deletingBrandPK, setDeletingBrandPK] = useState<number | string | null>(null)
    const [deletingCategoryPK, setDeletingCategoryPK] = useState<number | string | null>(null)

    const [isLodaing, setIsLoading] = useState(false);


    const handleDeleteCategory = async (catId: string) => {
        try {
            if (window.confirm('آیا از حذف این دسته‌بندی اطمینان دارید؟')) {
                setDeletingCategoryPK(catId)
                const { data, status } = await API.delete("products/admih-category-delete/" + catId + "/")
                if (status === 200) {
                    setCategories(prev => [...(prev || [])].filter(cat => cat.pk !== catId))
                } else {
                    const e = data.error_des || data.detail || "خطا"
                }
                setDeletingCategoryPK(null)
                setSuccessMsg('دسته‌بندی با موفقیت حذف گردید.');
                setTimeout(() => setSuccessMsg(''), 3000);
            }
        } catch (e) {
            mainContextValue?.onError("خطای غیرمنتظه رخ داد")
            setDeletingCategoryPK(null)
        }
    };



    const handleDeleteBrand = async (brandId: string) => {
        try {
            if (window.confirm('آیا از حذف این برند اطمینان دارید؟')) {
                setDeletingBrandPK(brandId)
                const { data, status } = await API.delete("products/admih-brand-delete/" + brandId.toString() + "/")
                if (status === 200) {
                    setBrands(prev => [...prev].filter(brand => brand.pk?.toString() !== brandId.toString()))
                    setSuccessMsg('برند با موفقیت حذف شد.');
                    setTimeout(() => setSuccessMsg(''), 3000);
                } else {
                    const e = data.error_des || data.detail || "خطا غیر منتظره"
                    mainContextValue?.onError(e)
                }
                setDeletingBrandPK(null)
            }
        } catch (e) {
            mainContextValue?.onError("خطایی غیر منتظره رخ داده است")
            setDeletingBrandPK(null)
        }
    }
    useEffect(() => {
        fetchData("products/admin-categories-brands/", ({ data, status }) => {
            setBrands(data.brands)
            setCategories(data.categories)
            setIsLoading(false)
        }, () => setIsLoading(true), () => mainContextValue?.onError("خطا در دریافت اطلاعات"))
    }, [])


    return (
        <div className="space-y-6">
            {/* Top Banner */}
            <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 text-white p-6 rounded-3xl shadow-xl border border-indigo-800/60 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 flex items-center justify-center font-bold shadow-inner">
                        <Layers className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-extrabold text-white">مدیریت دسته‌بندی‌ها و برندهای تجهیزات</h3>
                        <p className="text-xs text-indigo-200 mt-1">
                            تعریف و دسته‌بندی تخصصی پمپ‌های صنعتی، خانگی و قطعات یدکی همراه با برندهای سازنده
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsQuickCategoryModalOpen(true)}
                        className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-2 shadow cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>+ ایجاد دسته‌بندی جدید</span>
                    </button>
                    <button
                        onClick={() => setIsQuickBrandModalOpen(true)}
                        className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-indigo-700/60 text-indigo-200 font-bold text-xs transition flex items-center gap-2 shadow cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>+ ایجاد برند جدید</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Categories List (2 Cols) */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <Layers className="w-5 h-5 text-indigo-600" />
                                <h4 className="font-extrabold text-sm text-slate-900">لیست دسته‌بندی‌های فعال ({toPersianDigits(categories.length)})</h4>
                            </div>

                        </div>

                        {isLodaing ?
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Array(6).fill({}).map(() => (
                                    <div
                                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-indigo-300 transition space-y-2 flex flex-col justify-between"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2.5">
                                                <Skeleton height={30} width={30} />
                                                <Skeleton width={150} height={30} />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                                            <Skeleton className="w-full" containerClassName="w-full" height={50} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            :
                            (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {categories.map((cat) => {
                                        const productCount = cat.products_count;
                                        return (
                                            <div
                                                key={cat.pk}
                                                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-indigo-300 transition space-y-2 flex flex-col justify-between"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={`p-2 rounded-xl  'bg-indigo-100 text-indigo-800`}>
                                                            <Package className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <h5 className="font-extrabold text-xs text-slate-900">{cat.name}</h5>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => handleDeleteCategory(cat.pk)}
                                                        disabled={deletingCategoryPK ? deletingCategoryPK === cat.pk : false}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                                        title="حذف دسته‌بندی"
                                                    >
                                                        {deletingCategoryPK && deletingCategoryPK === cat.pk ? <Spinner width={15} height={15} borderMainColor={"gray"} borderTopColor={"red"} borderWidth={1.5} /> : <Trash2 className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                                                    <span className="font-extrabold text-slate-700 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                                                        {toPersianDigits(productCount || 0)} کالا
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )
                        }
                    </div>
                </div>

                {/* Brands List (1 Col) */}
                <div className="space-y-4">
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-indigo-600" />
                                <h4 className="font-extrabold text-sm text-slate-900">برندها و سازندگان ({toPersianDigits(brands.length)})</h4>
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            {isLodaing ?
                                Array(5).fill({}).map(ele => (
                                    <div

                                        className="p-3 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white flex items-center justify-between transition"
                                    >
                                        <div>
                                            <Skeleton width={75} height={30} />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Skeleton width={150} height={30} />

                                        </div>
                                    </div>
                                ))
                                : (
                                    brands.map((b) => {
                                        const count = b.products_count
                                        return (
                                            <div
                                                key={b.pk}
                                                className="p-3 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white flex items-center justify-between transition"
                                            >
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-extrabold text-xs text-slate-900">{b.name}</span>
                                                    </div>
                                                    <span className="text-[10px] text-indigo-600 font-bold block mt-0.5">
                                                        کشور سازنده: {b.country}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] font-extrabold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                                                        {toPersianDigits(count || 0)} کالا
                                                    </span>
                                                    <button
                                                        onClick={() => handleDeleteBrand(b.pk)}
                                                        disabled={deletingBrandPK && deletingBrandPK === b.pk ? true : false}
                                                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                                                    >
                                                        {deletingBrandPK && deletingBrandPK === b.pk ? <Spinner width={15} height={15} borderMainColor={"gray"} borderTopColor={"red"} borderWidth={1.5} /> : <Trash2 className="w-3.5 h-3.5" />}

                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}