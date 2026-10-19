import API from "@/api/api";
import { Check, CheckCircle2, ChevronLeft, ChevronRight, Download, Edit3, FileSpreadsheet, Image, Images, Layers, Plus, Trash2, Upload, Wrench, X } from "lucide-react";
import { startTransition, useCallback, useDeferredValue, useEffect, useRef, useState } from "react";
import * as XLSX from 'xlsx';
import Spinner from "./Spinner";
import { formatPrice } from "../utils/formatters";
import SelectInput from "./SelectInput";


export default function ExcelProductImport({ storeSettings, brands, categories }) {
    const compileCategories = useCallback(() => {
        return categories?.map(ele => ({ selected: false, data: ele }))
    }, [categories])
    const excelInputRef = useRef(null)
    const [excelName, setExcelName] = useState("")
    const [successMsg, setSuccessMsg] = useState("")
    const [isSending, setIsSending] = useState<boolean>(false)
    const [updatingProductPK, setUpdatingProductPK] = useState(null)
    const [products, setProducts] = useState([])
    const [isBrandModalActive, setIsBrandModalActive] = useState<boolean>(false)
    const [isCategoryModalActive, setIsCategoryModalActive] = useState<boolean>(false)
    const [isImageModalActive, setIsImageModalActive] = useState<boolean>(false)
    const [isFeatureModalActive, setIsFeatureModalActive] = useState<boolean>(false)
    const [fileError, setFileError] = useState<string>("")
    const [modifingProductPK, setModifingProductPK] = useState<number | string | null>(null)
    const [selectedBrandPK, setSelectedBrandPK] = useState<number | string | null>("")
    const [brandError, setBrandError] = useState("")
    const [categoriesData, setCategoriesData] = useState(compileCategories)
    const [unSelectedCategoriesSearchQuery, setUnSelectedCategoriedSearchQuery] = useState("")
    const deferedUnSelectedCategoriesSearchQuery = useDeferredValue(unSelectedCategoriesSearchQuery)
    const [selectedCategoriesSearchQuery, setSelectedCategoriedSearchQuery] = useState("")
    const deferedSelectedCategoriesSearchQuery = useDeferredValue(selectedCategoriesSearchQuery)
    const [imagePayloads, setImagePayloads] = useState([])
    const [categoryError, setCategoryError] = useState("")
    const [imageError, setImageError] = useState("")
    const [features, setFeatures] = useState([])
    const [feature, setFeature] = useState({ feature_name: "", feature_value: "" })
    const [featureEntryError, setFeatureEntryError] = useState("")
    const [isFeatureAddModalOpen, setIsFeatureAddModalOpen] = useState(false)
    const [featureError, setFeatureError] = useState("")

    const imageInputHandler = async (file) => {
        try {
            const fileReader = new FileReader()
            fileReader.addEventListener("load", (e) => {

                setImagePayloads([...imagePayloads, file].map(ele => {
                    return {
                        file: ele,
                        altName: ele.name,
                        name: ele.name,
                        url: e.target?.result
                    }
                }))
            })
            fileReader.readAsDataURL(file)
        } catch (e) {
            console.log(e)
        }
    }


    useEffect(() => {
        setCategoriesData(compileCategories)
    }, [categories])



    const selectedCategoriesRef = useRef(null)
    const unSelectedCategoriesRef = useRef(null)

    console.log(products.find(ele => ele.pk === modifingProductPK)?.categories, "categories", modifingProductPK)



    const selectedCategories = categoriesData.filter(ele => {
        if (!ele.selected) {
            return false
        }
        if (!ele.data?.name?.includes(deferedSelectedCategoriesSearchQuery)) {
            return false;
        }
        return true
    })


    const unSelectedCategories = categoriesData.filter(ele => {
        if (ele.selected) {
            return false
        }
        if (!ele?.data.name.includes(deferedUnSelectedCategoriesSearchQuery)) {
            return false;
        }
        return true
    })


    const handleCategorySubmit = () => {

    }



    const handleProductPriceChange = (productId, value) => {
        setProducts(prev => [...prev].map(product => {
            if (product.pk === productId) {
                product.price = value
            }
            return product
        }))
    }

    const handleProductInventoryChange = (productId, value) => {
        setProducts(prev => [...prev].map(product => {
            if (product.pk === productId) {
                product.inventory = value
            }
            return product
        }));
    }



    const handleProductUpdate = async (product) => {
        try {
            setUpdatingProductPK(product.pk)
            console.log(product)


            const { images, features, brand, categories, ...otherData } = product

            const productPK = otherData?.pk

            delete otherData["pk"]

            const formData = new FormData()



            Object.entries(otherData).forEach(ele => {
                console.log(ele)
                formData.append(ele[0], ele[1])
            })

            images?.forEach(ele => {
                formData.append(ele.name, ele.file);
                formData.append("image-alt-" + ele.name, ele.altName);

            })
            if (features?.length) {
                formData.append("features", JSON.stringify(features))
            }
            if (categories?.length) {
                formData.append("categories_id", JSON.stringify(categories?.map(ele => ele.pk)))
            }
            if (brand) {
                formData.append("brand_id", brand.pk)
            }


            const { data, status } = await API.post("products/product-admin-submit/"
                , formData
            )
            if (status === 200) {
                setProducts(prev => [...prev].filter(ele => ele.pk !== productPK))

            }
            else {
                const e = data.error_des || data.detail || "خطا"
                console.log(e)
            }

            setUpdatingProductPK(null)
        } catch (e) {
            console.log(e)
            setUpdatingProductPK(null)

        }
    }

    const handleProductOffChange = (productId: string | number, value: string | number) => {

        setProducts(prev => [...prev].map(product => {
            if (product.pk === productId) {
                product.off = value
            }
            return product
        }));

    }


    const handleExcelSubmit = async (e: Event) => {
        try {
            e.preventDefault()
            setFileError("")
            const formData = new FormData(e.currentTarget);

            console.log(formData.get("excel_file"), "moz is moz ")
            const file = formData.get("excel_file");
            if (!file?.size) {
                setFileError("لطفا فایل را وارد کنید")
                return
            }


            const arrayBuffer = await file?.arrayBuffer();

            const workbook = XLSX.read(arrayBuffer, {
                type: "array",
            });

            const worksheet = workbook.Sheets[workbook.SheetNames[0]];

            const excelData = XLSX.utils.sheet_to_json(worksheet);
            setProducts(prev => excelData.map((ele, idx) => ({ ...ele, pk: idx + 1 })))
            excelInputRef.current.value = ""
            setExcelName("")

        } catch (e) {
            console.log(e)
            // setIsSending(false)
        }
    }

    const handleExcelUpload = (e) => {
        setExcelName(e.target.files[0].name)
    }

    const handleDownloadSampleExcel = () => {
        const sampleData = [
            {
                'title': 'عنوان کالا(مثلا پمپ بشقابی)',
                "technical_model": "مدل فنی محصول()",
                'product_type': "pomp یا part",
                'inventory': "موجودی محصول به عدد",
                'price': 'قیمت',
                "off": "تخفیف",
                "description": "توضیحات کوتاه",
                "weight": "وزن محصول",
                "serial_number": "سریال نامبر"
            },
        ];
        const ws = XLSX.utils.json_to_sheet(sampleData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "لیست_قیمت_نمونه");
        XLSX.writeFile(wb, "Sample_PriceList_Pumpino.xlsx");
    };




    return (
        <div>
            {successMsg && (
                <div className="bg-emerald-100 text-emerald-900 p-4 rounded-2xl border border-emerald-300 font-bold text-xs flex items-center gap-2 animate-bounce">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>{successMsg}</span>
                </div>
            )}
            <div className="w-full p-1.5">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 w-full">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-emerald-600" />
                        <span>بروزرسانی لیست قیمت و موجودی از روی فایل اکسل (Excel Import)</span>
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                        فایل اکسل خروجی گرفته شده از نرم‌افزار حسابداری یا فایل ویرایش‌شده خود را اینجا بارگذاری کنید. سیستم بر اساس «کد کالا (SKU)» قیمت‌ها و موجودی را اتوماتیک بروزرسانی می‌کند.
                    </p>

                    {/* Excel Formatting Instructions Guide */}
                    <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-5 space-y-4 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/80 pb-3">
                            <h4 className="font-extrabold text-emerald-950 text-sm flex items-center gap-2">
                                <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                                <span>راهنمای نحوه ساخت و ساختار ستون‌های فایل اکسل:</span>
                            </h4>

                            <button
                                type="button"
                                disabled={isSending}
                                onClick={handleDownloadSampleExcel}
                                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer text-xs"
                            >
                                <Download className="w-4 h-4" />
                                <span>دانلود نمونه فایل اکسل استاندارد (.xlsx)</span>
                            </button>
                        </div>

                        <div className="space-y-2 text-slate-800 leading-relaxed">
                            <p className="font-bold text-slate-900">
                                فایل اکسل شما باید حتماً دارای یک سطر عنوان (Header) باشد و شامل ستون‌های زیر گردد:
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                                <div className="bg-white p-3 rounded-xl border border-emerald-100 space-y-1">
                                    <span className="font-extrabold text-emerald-800 block">۱. فایل اکسل را مطابق نمونه اماده کنید</span>

                                </div>

                                <div className="bg-white p-3 rounded-xl border border-emerald-100 space-y-1">
                                    <span className="font-extrabold text-emerald-800 block">۲. از طریق فیلد زیر انرا وارد کنید و کلید ثبت را بزنید</span>

                                </div>

                                <div className="bg-white p-3 rounded-xl border border-emerald-100 space-y-1">
                                    <span className="font-extrabold text-slate-800 block">۳. پس از ورود و ایجاد جدول ، ویژگی هارا وارد کنید</span>

                                </div>

                                <div className="bg-white p-3 rounded-xl border border-emerald-100 space-y-1">
                                    <span className="font-extrabold text-slate-800 block"> نحوه خروجی نرم‌افزارهای حسابداری</span>
                                    <p className="text-[11px] text-slate-600">
                                        در نرم‌افزارهای هلو، سپیدار، محک، پارسیان و... گزارش لیست قیمت کالاها را با فرمت Excel خروجی بگیرید و نام ستون کد کالا و قیمت را طبق راهنمای فوق تنظیم کنید.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form className="flex flex-col items-center" onSubmit={handleExcelSubmit}>
                        <div onClick={() => {
                            if (excelInputRef.current) {
                                excelInputRef.current.click()
                            }
                        }} className="p-6 w-full flex flex-col items-center border-2 border-dashed border-emerald-300 rounded-2xl bg-emerald-50/40 text-center space-y-3 hover:border-emerald-500 transition">
                            <FileSpreadsheet className="w-12 h-12 text-emerald-600 mx-auto" />
                            <div className="text-xs font-extrabold text-slate-800">
                                برای وارد کردن فایل کلیک کنید
                            </div>
                            {fileError && <p className="text-red-500 text-md">
                                {fileError}
                            </p>}
                            {excelName && (
                                <p className="text-green-300">
                                    {excelName}
                                </p>
                            )}
                            <input
                                hidden
                                type="file"
                                name="excel_file"
                                ref={excelInputRef}
                                accept=".xlsx, .xls"
                                onChange={handleExcelUpload}
                                className="cursor-pointer text-xs"
                            />
                        </div>
                        <button type="submit" className="w-full flex justify-center gap-1.5 items-center p-1 rounded m-1 bg-green-600">
                            {isSending ? <Spinner borderMainColor={"white"} borderTopColor={"green"} height={17.5} width={17.5} borderWidth={1.75} /> : <>
                                <Upload size={20} className="text-white" />
                                <span className="text-white ">
                                    ثبت
                                </span>
                            </>}
                        </button >
                    </form>
                </div>
            </div>
            {/* product last modifications  */}
            <div className="p-1.5 bg-white shadow-md rounded-2xl">
                <div className="text-xl my-1.5">
                    لیست محصولات وارد شده برای تغییر نهایی
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-xs text-right">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                                <th className="p-3">کد کالا</th>
                                <th className="p-3">عنوان کالا</th>
                                <th className="p-3">برند</th>
                                <th className="p-3">تخفیف</th>
                                <th className="p-3">قیمت فعلی با تخفیف(تومان)</th>
                                <th className="p-3">قیمت جدید (تومان)</th>
                                <th className="p-3">تعداد انبار</th>
                                <th className="p-3 text-center">افزودن تصویر</th>
                                <th className="p-3 text-center">افرودن ویژگی </th>
                                <th className="p-3 text-center">افزودن برند </th>
                                <th className="p-3 text-center">افزودن دسته </th>
                                <th className="p-3 text-center">تغییر</th>

                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {products ? products.map(p => {
                                const isUpdating = updatingProductPK && updatingProductPK === p.pk
                                return (
                                    <tr key={p.pk} className="hover:bg-slate-50">
                                        <td className="p-3 font-mono font-bold text-slate-600">{p.pk}</td>
                                        <td className="p-3 font-bold text-slate-900">{p.title}</td>
                                        <td className="p-3 text-slate-600">{p.brand?.name || "بدون برند"}</td>
                                        <td className="p-3">
                                            <input
                                                type="number"
                                                step="10"
                                                value={p.off}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value) || 0;
                                                    handleProductOffChange(p.pk, val)
                                                }}
                                                className="w-32 bg-amber-50/80 font-mono font-bold text-slate-900 p-2 rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                            />
                                        </td>
                                        <td className="p-3 text-slate-500 font-mono">
                                            {formatPrice(p.price * ((100 - p.off) / 100), storeSettings.currencyUnit)}
                                        </td>
                                        <td className="p-3">
                                            <input
                                                type="number"
                                                step="1000"
                                                value={p.price}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value) || 0;
                                                    handleProductPriceChange(p.pk, val)
                                                }}
                                                className="w-32 bg-amber-50/80 font-mono font-bold text-slate-900 p-2 rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                            />
                                        </td>

                                        <td className="p-3">
                                            <input
                                                type="number"
                                                value={p.inventory}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value) || 0;
                                                    handleProductInventoryChange(p.pk, val)
                                                }}
                                                className="w-16 bg-white text-center p-1.5 rounded-lg border border-slate-300 font-bold"
                                            />
                                        </td>
                                        <td className="p-3">
                                            <button onClick={() => {
                                                setModifingProductPK(p.pk)
                                                setIsImageModalActive(true)
                                            }} disabled={isUpdating} className="flex justify-around gap-1 p-1.5 bg-green-700 items-center  text-white rounded-md">
                                                <>
                                                    <Image size={20} />
                                                    <span>افزودن تصویر</span>
                                                </>

                                            </button></td>
                                        <td className="p-3">
                                            <button onClick={() => { setIsFeatureModalActive(true); setModifingProductPK(p.pk) }} disabled={isUpdating} className="flex justify-around gap-1 p-1.5 bg-green-700 items-center  text-white rounded-md">
                                                <>
                                                    <Plus size={20} />
                                                    <span>افزودن ویژگی</span>
                                                </>

                                            </button>
                                        </td>
                                        <td className="p-3">
                                            <button onClick={() => {
                                                setIsBrandModalActive(true);
                                                setModifingProductPK(p.pk);

                                            }} disabled={isUpdating} className="flex justify-around gap-1 p-1.5 bg-green-700 items-center  text-white rounded-md">
                                                <>
                                                    <Plus size={20} />
                                                    <span>افزودن برند</span>
                                                </>

                                            </button>
                                        </td>
                                        <td className="p-3">
                                            <button onClick={() => {
                                                setModifingProductPK(p.pk)
                                                setIsCategoryModalActive(true)
                                            }} disabled={isUpdating} className="flex justify-around gap-1 p-1.5 bg-green-700 items-center  text-white rounded-md">
                                                <>
                                                    <Layers size={20} />
                                                    <span>افزودن دسته بندی</span>
                                                </>

                                            </button>
                                        </td>
                                        <td className="p-3 text-center flex items-center justify-center gap-1">
                                           
                                            <button
                                                onClick={() => setProducts(prev => [...prev].filter(ele => ele.pk !== p.pk))}
                                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                                title="حذف"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleProductUpdate(p)} disabled={isUpdating} className="flex justify-around gap-1 p-1.5 bg-green-700 items-center  text-white rounded-md">
                                                {isUpdating ? <Spinner height={17.5} width={17.5} borderWidth={1.5} borderMainColor={"white"} borderTopColor={"green"} /> :
                                                    <>
                                                        <Check size={20} />
                                                        <span>ذخیره</span>
                                                    </>
                                                }
                                            </button>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <span>
                                    محصولی یافت نشد!
                                </span>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isBrandModalActive && (
                <div className="fixed flex justify-center items-center w-dvw h-dvh bg-gray-800/50 z-50 top-0 right-0">
                    <div className="bg-white p-1.5 rounded-2xl w-[75%] md:w-100">
                        <div className="w-full flex justify-between items-center">
                            <span className="text-xl font-bold ">
                                منو ست کردن برند
                            </span>
                            <X onClick={() => {
                                setIsBrandModalActive(false)
                                setModifingProductPK(null)
                                startTransition(() => {
                                    setSelectedBrandPK(null)
                                })
                            }} className="hover:text-red-500 transition-colors" />

                        </div>
                        <div className="w-full ">
                            <SelectInput items={brands} labelProperty={"name"} selectedItem={brands.find(ele => ele.pk === selectedBrandPK)} onItemSelected={item => setSelectedBrandPK(item.pk)} />
                        </div>
                        {brandError && <p className="text-red-600">
                            {brandError}
                        </p>}
                        <button onClick={() => {
                            setBrandError("")
                            if (!selectedBrandPK) {
                                setBrandError("لطفا یک برند انتخاب کنید")
                                return;
                            }
                            setProducts(prev => [...prev].map(ele => {
                                if (ele.pk === modifingProductPK) {
                                    console.log(selectedBrandPK)
                                    ele.brand = brands.find(ele => ele.pk === selectedBrandPK)
                                }
                                console.log(ele.brand)
                                return ele
                            }))
                            setIsBrandModalActive(false)
                            setModifingProductPK(null)
                            startTransition(() => {
                                setSelectedBrandPK(null)
                            })
                        }} className="w-full my-1.5 rounded-2xl text-white hover:bg-green-700 transition-colors flex items-center justify-center bg-green-600 p-1.5">
                            <span>
                                ثبت
                            </span>
                        </button>
                    </div>

                </div>
            )}
            {isCategoryModalActive && (
                <div className="fixed flex justify-center items-center w-dvw h-dvh bg-gray-800/50 z-50 top-0 right-0">
                    <div className="bg-white p-1.5 rounded-2xl w-[75%] md:w-100">
                        <div className="w-full flex justify-between items-center">
                            <span className="text-xl font-bold ">
                                منو ست کردن دسته بندی
                            </span>
                            <X onClick={() => {
                                setIsCategoryModalActive(false)
                                startTransition(() => {
                                    setModifingProductPK(null)
                                    setCategoriesData(prev => [...prev].map(ele => {
                                        ele.selected = false
                                        return ele
                                    }))
                                })
                            }} className="hover:text-red-500 transition-colors" />

                        </div>
                        <div className="w-full col-span-full flex flex-col  justify-between items-center">
                            <div className="flex w-full flex-col ">

                                <div className="p-1.5 rounded-t-md bg-slate-300">
                                    <span className="text-md text-gray-800">دسته بندی ها</span>

                                </div>

                                <div className="p-1 w-full bg-slate-100">
                                    <input type="text"
                                        className="w-full border rounded-md p-1  border-slate-300  text-md bg-slate-200  "
                                        value={unSelectedCategoriesSearchQuery}
                                        onChange={(e) => setUnSelectedCategoriedSearchQuery(e.target.value)}
                                        placeholder="جستجو در دسته بندی ها" />
                                </div>
                                <select
                                    ref={unSelectedCategoriesRef}
                                    className="bg-slate-400 h-30 rounded-b-md" multiple>

                                    {unSelectedCategories.map(({ data }) => (
                                        <option className="p-1 checked:bg-slate-700 checked:text-white my-1 rounded-xl " value={data.pk}>{data.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex m-1   gap-3 flex-row ">
                                <div onClick={() => {
                                    const selectedPks = []
                                    unSelectedCategoriesRef.current?.querySelectorAll("option").forEach(ele => {
                                        if (ele.selected) {
                                            selectedPks.push(ele.value)
                                        }
                                    });
                                    setCategoriesData(prev => [...prev].map(cat => {

                                        if (!selectedPks.includes(cat.data?.pk?.toString())) {
                                            return cat
                                        }
                                        cat.selected = true
                                        return cat
                                    }))
                                }} className="w-7 -rotate-90  h-7 bg-slate-200 flex items-center justify-center rounded-full">
                                    <ChevronLeft

                                    />
                                </div>
                                <div onClick={() => {
                                    const selectedPks = []
                                    selectedCategories.current?.querySelectorAll("option").forEach(ele => {
                                        if (ele.selected) {
                                            selectedPks.push(ele.value)
                                        }
                                    });
                                    setCategoriesData(prev => [...prev].map(cat => {

                                        if (selectedPks.includes(cat.data?.pk?.toString())) {
                                            return cat
                                        }
                                        cat.selected = false
                                        return cat
                                    }))
                                }} className="w-7 h-7 -rotate-90  bg-slate-200 flex items-center justify-center rounded-full">
                                    <ChevronRight />
                                </div>

                            </div>
                            <div className="flex w-full flex-col ">
                                <div className="p-1.5 rounded-t-md bg-slate-300">
                                    <span className="text-md text-gray-800">دسته بندی های انتخابی</span>
                                </div>
                                <div className="p-1 w-full bg-slate-100">
                                    <input type="text"
                                        className="w-full border border-slate-300 rounded-md p-1 text-md bg-slate-200  "
                                        value={selectedCategoriesSearchQuery}
                                        onChange={(e) => setSelectedCategoriedSearchQuery(e.target.value)}
                                        placeholder="جستجو در دسته بندی ها" />
                                </div>
                                <select
                                    ref={selectedCategoriesRef}
                                    className="bg-slate-400 h-30 rounded-b-md" multiple>
                                    {selectedCategories.map(({ data }) => (
                                        <option className="p-1 checked:bg-slate-700 checked:text-white my-1 rounded-xl " value={data.pk}>{data.name}</option>
                                    ))}
                                </select>

                            </div>


                        </div>
                        {categoryError && <p className="text-red-600">
                            {categoryError}
                        </p>}
                        <button onClick={() => {
                            setCategoryError("")
                            if (!selectedCategories?.length) {
                                setCategoryError("لطفا یک دسته انتخاب کنید")
                                return;
                            }
                            setProducts(prev => [...prev].map(ele => {
                                console.log(modifingProductPK, ele.name, ele.pk)
                                if (ele.pk === modifingProductPK) {
                                    ele.categories = selectedCategories.map(ele => ele.data)
                                    console.log(ele.categories)
                                }
                                return ele
                            }));
                            setIsCategoryModalActive(false)
                            startTransition(() => {
                                setModifingProductPK(null)
                                setCategoriesData(prev => [...prev].map(cat => {
                                    cat.selected = false
                                    return cat
                                }))
                            })
                        }} className="w-full my-1.5 rounded-2xl text-white hover:bg-green-700 transition-colors flex items-center justify-center bg-green-600 p-1.5">
                            <span>
                                ثبت
                            </span>
                        </button>

                    </div>
                </div>
            )}
            {isImageModalActive && (
                <div className="fixed flex justify-center items-center w-dvw h-dvh bg-gray-800/50 z-50 top-0 right-0">
                    <div className="bg-white p-1.5 rounded-2xl w-[75%] md:w-100">
                        <div className="w-full flex justify-between items-center">
                            <span className="text-xl font-bold ">
                                اضافه کردن عکس
                            </span>
                            <X onClick={() => {
                                setIsImageModalActive(false)
                                setModifingProductPK(null)
                                startTransition(() => {
                                    setImagePayloads([])
                                })
                            }} className="hover:text-red-500 transition-colors" />

                        </div>
                        <div className="flex flex-wrap items-center ">
                            <div className="sm:col-span-2 w-full bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                                    <label className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                                        <Images className="w-4 h-4 text-emerald-600" />
                                        <span>تصویر محصول و گالری آرشیو عکس‌ها:</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <label className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold rounded-xl shadow cursor-pointer transition flex items-center gap-1.5">
                                            <Upload className="w-3.5 h-3.5" />
                                            <span>آپلود عکس جدید</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    e.preventDefault()
                                                    imageInputHandler(e.target.files[0])
                                                }}
                                                className="hidden"
                                            />
                                        </label>


                                    </div>
                                </div>

                                <div className="grid grid-cols-2  gap-3">
                                    {imagePayloads.map((image, index) => (
                                        <div >
                                            <div className="w-12 h-12 z-30 relative rounded-xl border border-slate-300 overflow-hidden bg-white shrink-0  group shadow-xs">
                                                <div onClick={() => {
                                                    setImagePayloads(prev => [...prev].filter((_, idx) => idx !== index))

                                                }} className="absolute z-100 p-0.5 rounded-full bg-slate-100 top-0 right-0">
                                                    <X size={15} className="hover:text-red-500  transition-colors" />
                                                </div>
                                                <img
                                                    src={image.url}
                                                    alt="پیش‌نمایش"
                                                    className="w-full z-10 h-full object-cover"
                                                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                                                />
                                            </div>
                                            <input

                                                defaultValue={image.name}
                                                onChange={(e) => {
                                                    setImagePayloads(prev => [...prev].map(imgPayload => {
                                                        if (imgPayload.name === image.name) {
                                                            imgPayload.altName = e.target.value
                                                        }
                                                        return imgPayload
                                                    }))
                                                }}
                                                className="w-full my-1 rounded-md bg-slate-200 p-1 text-sm z-150"
                                                type="text"
                                            />
                                        </div>
                                    ))}

                                </div>
                            </div>
                        </div>
                        {imageError && <p className="text-red-500">
                            {imageError}
                        </p>}
                        <button onClick={() => {
                            setImageError("")
                            if (!imagePayloads.length) {
                                setImageError("لطفا یک تصویر انتخاب کنید")
                                return;

                            }
                            setProducts(prev => [...prev].map(ele => {
                                if (ele.pk === modifingProductPK) {
                                    ele.images = imagePayloads
                                    console.log(ele.images, "submited images")
                                }
                                return ele
                            }))
                            setIsImageModalActive(false)
                            setModifingProductPK(null)
                            startTransition(() => {

                                setImagePayloads([])

                            })
                        }} className="w-full my-1.5 rounded-2xl text-white hover:bg-green-700 transition-colors flex items-center justify-center bg-green-600 p-1.5">
                            <span>
                                ثبت
                            </span>
                        </button>
                    </div>
                </div>)}
            {isFeatureModalActive && (
                <div className="fixed flex justify-center items-center w-dvw h-dvh bg-gray-800/50 z-50 top-0 right-0">
                    <div className="bg-white p-1.5 rounded-2xl w-[75%] md:w-100">
                        <div className="w-full flex justify-between items-center">
                            <span className="text-xl font-bold ">
                                اضافه کردن ویژگی
                            </span>
                            <X onClick={() => {
                                setIsFeatureModalActive(false)
                                setModifingProductPK(null)
                                startTransition(() => {
                                    setFeatures([])
                                })
                            }} className="hover:text-red-500 transition-colors" />

                        </div>
                        {/* Detailed Technical Specs Panel */}
                        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                                <Wrench className="w-4 h-4 text-sky-600" />
                                <span className="font-extrabold text-slate-900">مشخصات فنی تخصصی پمپ و قطعات:</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                {features.map((feature, idx) => (
                                    <div>
                                        <div onClick={() => setFeatures(prev => [...prev].filter((_, filtered_idx) => filtered_idx !== idx))} className="flex mb-1 items-center justify-between ">
                                            <label className="text-[11px] font-bold text-slate-600 block mb-0.5">{feature.feature_name}:</label>
                                            <div className="flex transition-colors hover:bg-red-500 hover:border-white hover:text-white  bg-transparent p-0.5 rounded-md border-2 text-red-500 border-red-500 cursor-pointer items-center justify-around">
                                                <X size={10} />
                                                <span>حذف</span>
                                            </div>
                                        </div>
                                        <div

                                            className="w-full bg-white p-2 rounded-xl border border-slate-300 focus:border-sky-600 outline-none"
                                        >
                                            {feature.feature_value}
                                        </div>
                                    </div>
                                ))}
                                <div onClick={() => setIsFeatureAddModalOpen(true)} className="group h-15 w-15 bg-slate-100 border-[1.5px] rounded-xl border-slate-300 flex justify-center items-center">
                                    <Plus className="group-hover:transform-[rotate(90deg)]  transition-transform" />
                                </div>

                            </div>
                        </div>

                        {featureEntryError && <p className="text-red-500">
                            {featureEntryError}
                        </p>}
                        <button onClick={() => {
                            setFeatureEntryError("")
                            if (!features.length) {
                                setFeatureEntryError("لطفا یک وِیژگی وارد کنید")
                                return;
                            }
                            setProducts(prev => [...prev].map(ele => {
                                if (ele.pk === modifingProductPK) {
                                    ele.features = features
                                    console.log(ele.features, "submited features")
                                }
                                return ele
                            }))
                            setIsFeatureModalActive(false)
                            setModifingProductPK(null)
                            startTransition(() => {
                                setFeatures([])
                            })
                        }} className="w-full my-1.5 rounded-2xl text-white hover:bg-green-700 transition-colors flex items-center justify-center bg-green-600 p-1.5">
                            <span>
                                ثبت
                            </span>
                        </button>
                    </div>
                </div>
            )}
            {isFeatureAddModalOpen && (
                <div className="fixed inset-0 w-dvw h-dvh flex items-center justify-center bg-slate-900/70 z-150 ">
                    <div className="p-1.75 rounded-xl bg-white w-[90%] md:w-100">
                        <div className="flex items-center justify-between">

                            <div className="text-xl font-medium">
                                وارد کردن ویژگی جدید
                            </div>
                            <div onClick={() => { setIsFeatureAddModalOpen(false); setFeatureError(""); setFeature({ feature_name: "", feature_value: "" }) }} className="transition-colors hover:text-red-500">
                                <X className="" />
                            </div>

                        </div>
                        <div className="grid my-3 grid-cols-2 md:grid-cols-1 ">
                            <div>
                                <div className="text-md text-gray-600"> نام:</div>
                                <input
                                    onChange={(e) => setFeature(prev => ({ ...prev, feature_name: e.target.value }))}
                                    className="bg-gray-100 p-1 w-[95%] rounded-xl focus:border focus:border-gray-300 outline-none"

                                />
                            </div>
                            <div>
                                <div className="text-md text-gray-600"> ویژگی:</div>
                                <input
                                    onChange={(e) => setFeature(prev => ({ ...prev, feature_value: e.target.value }))}
                                    className="bg-gray-100 p-1 w-[95%] rounded-xl focus:border focus:border-gray-300 outline-none"

                                />
                            </div>
                        </div>
                        <div className="w-full">
                            {featureError && (
                                <span className="text-red-500">{featureError}</span>

                            )}
                        </div>
                        <div className="flex items-center justify-end">
                            <div onClick={() => {
                                if (!feature.feature_value || !feature.feature_name) {
                                    setFeatureError("لطفا مقادیر را پر کنید")
                                    return;
                                }
                                setFeatures(prev => [...prev, feature])
                                setFeature({ feature_name: "", feature_value: "" })
                                setIsFeatureAddModalOpen(false)
                            }} className="bg-blue-700 flex items-center justify-between p-1.5 rounded-xl hover:bg-green-700 font-semibold text-white transition-colors  cursor-pointer">
                                <Plus />
                                <span className="text-sm">
                                    وارد کردن
                                </span>

                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

    )
}