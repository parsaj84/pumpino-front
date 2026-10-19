import { Check, Edit3, Save, Trash2 } from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";
import fetchData from "../utils/fetchData";
import { formatPrice } from "../utils/formatters";
import PaginationContainer from "./Pagintation";
import API from "@/api/api";
import Spinner from "./Spinner";
import ProductSubmitAdminModal from "./ProductSubmitAdminModal";

export default function QuickAdminPriceChange({ brands, categories, storeSettings, setIsQuickBrandModalOpen, setIsQuickCategoryModalOpen }) {
    const [searchQuery, setSearchQuery] = useState("")
    const deferedSearchQuery = useDeferredValue(searchQuery)
    const [filterState, setFilterState] = useState({
        selectedBrandPK: null,
        selectedCategoryPK: null,
        searchQuery: "",
        page: 1
    })

    const [deletingProductPK, setDeletingProductPK] = useState(null)


    const handleDeleteProduct = async (product) => {
        try {
            setDeletingProductPK(product.pk)
            const { data, status } = await API.delete("products/product-delete/" + product.pk?.toString() + "/")
            if (status === 200) {
                setProducts(prev => [...prev].filter(p => p.pk !== product.pk))
            } else {
                const e = data.error_des || data.detail || "error"
                console.log(e)
            }
            setDeletingProductPK(null)
        } catch (e) {
            console.log(e)
            setDeletingProductPK(null)

        }
    }

    const [isProductModalOpen, setIsProductModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)

    const [isLoadingProducts, setIsLoadingProducts] = useState(false)
    const [updatingProductPK, setUpdatingProductPK] = useState(null)


    const [pagintaionState, setPaginationState] = useState({
        prevPage: null,
        nextPage: 2,
        numPages: [],
    })

    const compileFilterState = () => {
        const searchParams = new URLSearchParams()
        searchParams.append("brandId", filterState.selectedBrandPK || "")
        searchParams.append("categoryId", filterState.selectedCategoryPK || "")
        searchParams.append("searchQuery", filterState.searchQuery)
        searchParams.append("page", filterState.page)
        return "?" + searchParams.toString()
    }



    useEffect(() => {
        const timeoutID = setTimeout(() => {
            setFilterState(prev => ({
                ...prev, searchQuery: deferedSearchQuery
            }))
        }, 1000)
        return () => clearTimeout(timeoutID)
    }, [deferedSearchQuery])

    useEffect(() => {
        const searchParamsString = compileFilterState()
        fetchData("products/" + searchParamsString, (response => {
            const { data, status } = response
            if (status === 200) {
                setProducts(data.products)
                console.log(data)
                setPaginationState({
                    prevPage: data.previous_page,
                    nextPage: data.next_page,
                    numPages: data.num_pages,
                    allObjsCount: data.all_objs_count
                })
            } else {
                const e = "خطا"
                console.log(e)
            }
            setIsLoadingProducts(false)
        }), () => setIsLoadingProducts(true))
    }, [filterState])


    const [products, setProducts] = useState([])
    const handleSaveQuickPrices = () => {

    }
    const handleProductPriceChange = (productId, value) => {
        setProducts(prev => [...prev].map(product => {
            if (product.pk === productId) {
                product.price = value
            }
            return product
        }))
    }

    const handleProductOffChange = (productId, value) => {

        setProducts(prev => [...prev].map(product => {
            if (product.pk === productId) {
                product.off = value
            }
            return product
        }));

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
            const { data, status } = await API.put("products/product-dynamic-update/" + product.pk + "/?updating_fields=inventory,off,price"
                , {
                    inventory: product.inventory,
                    off: product.off,
                    price: product.price
                }

            )
            if (status !== 200) {
                const e = data.error_des || data.detail || "خطا"
                console.log(e)
            }
            setUpdatingProductPK(null)
        } catch (e) {
            console.log(e)
            setUpdatingProductPK(null)

        }
    }


    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="جستجو در لیست کد کالا، عنوان یا مدل..."
                        className="bg-slate-50 text-xs p-2.5 rounded-xl border border-slate-300 w-full max-w-xs"
                    />

                    <select
                        value={filterState.selectedBrandPK}
                        onChange={(e) => setFilterState(prev => ({ ...prev, selectedBrandPK: e.target.value }))}
                        className="bg-slate-50 text-xs p-2.5 rounded-xl border border-slate-300 cursor-pointer"
                    >
                        <option value="">همه برندها</option>
                        {brands?.map(b => (
                            <option key={b.pk} value={b.pk}>{b.name}({b.country})</option>
                        ))}
                    </select>

                    <select
                        value={filterState.selectedCategoryPK}
                        onChange={(e) => setFilterState(prev => ({ ...prev, selectedCategoryPK: e.target.value }))}
                        className="bg-slate-50 text-xs p-2.5 rounded-xl border border-slate-300 cursor-pointer"
                    >
                        <option value="">همه دسته بندی</option>
                        {categories.map(c => (
                            <option key={c.pk} value={c.pk}>{c.name}</option>
                        ))}
                    </select>
                </div>
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
                            <th className="p-3 text-center">عملیات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {products ? products.map(p => {
                            // const draft = draftPrices[p.id] || { price: p.priceToman, stock: p.stockStatus, qty: p.quantityInStock };
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
                                    <td className="p-3 text-center flex items-center justify-center gap-1">
                                        <button
                                            onClick={() => {
                                                setEditingProduct(p);
                                                setIsProductModalOpen(true);
                                            }}
                                            className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg cursor-pointer"
                                            title="ویرایش کامل کالا"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            disabled={deletingProductPK && deletingProductPK === p.pk}

                                            onClick={() => handleDeleteProduct(p)}
                                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                            title="حذف"
                                        >
                                            {deletingProductPK && deletingProductPK === p.pk ? <Spinner height={15} width={15} borderWidth={1.5} borderMainColor={"white"} borderTopColor={"red"} /> :
                                                (<Trash2 className="w-4 h-4" />)
                                            }
                                        </button>
                                        <button onClick={() => handleProductUpdate(p)} disabled={isUpdating} className="flex justify-around gap-1 p-1.5 bg-green-700 items-center  text-white rounded-md">
                                            {isUpdating ? <Spinner height={17.5} width={17.5} borderWidth={1.5} borderMainColor={"white"} borderTopColor={"green"} /> :
                                                <>
                                                    <Check size={20} />
                                                    <span>اعمال تغییرات</span>
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
            {isProductModalOpen && editingProduct &&
                <ProductSubmitAdminModal products={products} editingProduct={editingProduct} setIsQuickBrandModalOpen={setIsQuickBrandModalOpen} brands={brands} setProducts={setProducts} categories={categories} setEditingProduct={setEditingProduct} setIsProductModalOpen={setIsProductModalOpen} setIsQuickCategoryModalOpen={setIsQuickCategoryModalOpen} />

            }
            <PaginationContainer productsCount={pagintaionState.allObjsCount} nextPage={pagintaionState.nextPage} pageNums={pagintaionState.numPages} prevPage={pagintaionState.prevPage} setFilterState={setFilterState} />
        </div>
    )
} 
