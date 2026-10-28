import React, { useContext, useDeferredValue, useEffect, useState } from 'react';
import {
  AlertTriangle,
  PackageX,
  Save,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  Boxes,
  Trash2
} from 'lucide-react';
import { Product, Brand, StoreSettings } from '../types';
import { formatPrice, toPersianDigits } from '../utils/formatters';
import fetchData from '../utils/fetchData';
import PaginationContainer from './Pagintation';
import API from '@/api/api';
import Spinner from './Spinner';
import Skeleton from 'react-loading-skeleton';
import { MainContext } from '../contexts/MainContext';

interface LowStockAlertsProps {
  brands: Brand[];
  storeSettings: StoreSettings;
}

export const LowStockAlerts: React.FC<LowStockAlertsProps> = ({
  brands,
  storeSettings,
}) => {
  const mainContextValue = useContext(MainContext)
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery)
  const [filterState, setFilterState] = useState({
    threshold: 5,
    brandPK: "",
    status: "",
    searchQuery: "",
    page: 1
  });

  const handleDeleteProduct = async (product: Product) => {
    try {
      setDeletingProductPK(product.pk)
      const { data, status } = await API.delete("products/product-delete/" + product.pk?.toString() + "/")
      if (status === 200) {
        setProducts(prev => [...prev].filter(p => p.pk !== product.pk))
      } else {
        mainContextValue?.onError("خطا در پاک کردن کالا")
      }
      setDeletingProductPK(null)
    } catch (e) {
      mainContextValue?.onError("خطا در پاک کردن کالا")

      setDeletingProductPK(null)

    }
  }

  const compileFilterState = () => {
    const searchParams = new URLSearchParams()
    searchParams.append("brandId", filterState.brandPK)
    searchParams.append("inventory_status", filterState.status)
    searchParams.append("inventory_threshold", filterState.threshold.toString())
    searchParams.append("searchQuery", filterState.searchQuery)
    searchParams.append("page", filterState.page.toString())
    return "?" + searchParams.toString()
  }

  const [products, setProducts] = useState<Product[]>([])
  const [paginationData, setPaginationData] = useState({
    prevPage: null,
    nextPage: 2,
    numPages: []
  })
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isFetchingInventoryData, setIsFetchingInventoryData] = useState(false)
  const [inventoryData, setInventoryData] = useState(null)
  useEffect(() => {
    const timeoutId = setTimeout(() => {

      setFilterState(prev => ({ ...prev, searchQuery: deferredSearchQuery }))
    }, 750)
    return () => clearTimeout(timeoutId)
  }, [deferredSearchQuery])

  useEffect(() => {
    const searchParamsString = compileFilterState()
    fetchData("products/" + searchParamsString, (response) => {
      if (response.status === 200) {
        setProducts(response.data.products)
        setPaginationData({
          nextPage: response.data.next_page,
          prevPage: response.data.previous_page,
          numPages: response.data.num_pages
        })
      } else {
        mainContextValue?.onError("خطا در دریافت اطلاعات")

      }
      setIsLoadingProducts(false)
    }, () => setIsLoadingProducts(true), () => {
      mainContextValue?.onError("خطا در دریافت داده ها")
    })
  }, [filterState])

  useEffect(() => {
    fetchData("products/out-of-stock-products-count/", (response) => {
      setIsFetchingInventoryData(false)
      setInventoryData(response.data.count)
    }, () => setIsFetchingInventoryData(true), () => {
      mainContextValue?.onError("خطا در دریافت داده ها")
    })
  }, [])

  const threshold = 5

  const [deletingProductPK, setDeletingProductPK] = useState<string | number | null>(null)

  const [successMsg, setSuccessMsg] = useState('');





  const handleQtyChange = (productId: string | number, newQty: number) => {
    const validQty = Math.max(0, newQty);
    setProducts(prev => [...prev].map(ele => {
      if (ele.pk === productId) {
        ele.inventory = validQty
      }
      return ele
    }))
  };




  const [editingProductPk, setEditingProductPK] = useState<string | null | number>(null)


  const handleSaveStockForItem = async (product: Product) => {
    try {
      setEditingProductPK(product.pk)
      const { data, status } = await API.put("products/product-dynamic-update/" + product.pk.toString() + "/?updating_fields=inventory", { inventory: product.inventory })
      if (status === 200) {

        setSuccessMsg(`موجودی کالا "${product.title}" با موفقیت بروزرسانی شد.`);
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        const e = data.error_des || data.detail || "خطا"
        mainContextValue?.onError("خطایی در فرایند اپدیت کردن محصول!")
      }
      setEditingProductPK(null)

    } catch (e) {
      mainContextValue?.onError("خطایی رخ داده است!")
      setEditingProductPK(null)
    }

  };


  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false)

  // Export low stock purchase order to Excel
  const handleExportPurchaseOrderExcel = async () => {
    try {
      if (isLoadingProducts || !products?.length) {
        const e = "محصولی برای خروچی گرفتن وجود ندارد"
        mainContextValue?.onError(e)
        return;
      }
      setIsGeneratingExcel(true)
      const { data, status } = await API.get("products/product-excel-generator/" + compileFilterState(), { responseType: "blob", responseEncoding: "UTF-8" })
      if (status === 200) {
        const blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
        const downloadURL = URL.createObjectURL(blob)
        const linkElement = document.createElement("a")
        linkElement.download = "prodcuts-excel.xlsx"
        linkElement.href = downloadURL
        document.body.append(linkElement)
        linkElement.click()
        linkElement.remove()
        setIsGeneratingExcel(false)
      } else {

        mainContextValue?.onError("خطا در ساخت اکسل")
      }
    } catch (e) {
      mainContextValue?.onError("خطا در ساخت اکسل")

    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 text-white p-5 rounded-3xl shadow-lg border border-rose-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-rose-950 flex items-center justify-center shrink-0 shadow-md">
            <AlertTriangle className="w-7 h-7 stroke-[2.5] animate-pulse" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-rose-100 flex items-center gap-2">
              <span>مدیریت کالاهای کم‌انبار و هشدار اتما‌م موجودی</span>

            </h2>
            <p className="text-xs text-rose-200/80 font-medium">
              مشاهده سریع کالاهای ناموجود یا رو به اتمام، اصلاح موجودی انبار و تهیه خروجی اکسل برای تامین‌کنندگان
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handleExportPurchaseOrderExcel}
            disabled={isGeneratingExcel}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-rose-950 font-black text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            {isGeneratingExcel ? <Spinner width={17.5} height={17.5} borderMainColor={"white"} borderTopColor={"white"} borderWidth={1.75} /> : <>
              <FileSpreadsheet className="w-4 h-4" />
              <span>خروجی لیست سفارش خرید اکسل</span>
            </>}
          </button>


        </div>
      </div>

      {/* Toast Success Message */}
      {successMsg && (
        <div className="bg-emerald-100 text-emerald-900 p-3.5 rounded-2xl border border-emerald-300 font-bold text-xs flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            {isFetchingInventoryData ? <Skeleton width={50} height={15} /> : <>
              <span className="text-xs font-bold text-rose-800 block">کالاهای کاملاً ناموجود (موجودی ۰)</span>
              <span className="text-xl font-black font-mono text-rose-600">
                {toPersianDigits(inventoryData || 0)} کالا
              </span></>}
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <PackageX className="w-6 h-6" />
          </div>
        </div>


        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-700 block">حدآستانه کسر موجودی</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-500 font-bold">کمتر از:</span>
              <select
                value={filterState.threshold}
                onChange={(e) => setFilterState(prev => ({ ...prev, threshold: Number(e.target.value) }))}
                className="bg-slate-100 border border-slate-300 rounded-lg px-2 py-1 font-bold text-xs font-mono"
              >
                <option value={2}>۲ عدد</option>
                <option value={3}>۳ عدد</option>
                <option value={5}>۵ عدد</option>
                <option value={10}>۱۰ عدد</option>
                <option value={15}>۱۵ عدد</option>
              </select>
            </div>
          </div>
          <div className="p-3 bg-slate-100 text-slate-700 rounded-2xl">
            <Boxes className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجو در کالاهای کسر موجودی (کد کالا، نام، مدل)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterState.brandPK}
              onChange={(e) => setFilterState(prev => ({ ...prev, brandPK: e.target.value }))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 cursor-pointer"
            >
              <option value="all">همه برندها</option>
              {brands.map(b => (
                <option key={b.pk} value={b.pk}>{b.name}({b.country})</option>
              ))}
            </select>

            <select
              value={filterState.status}
              onChange={(e) => setFilterState(prev => ({ ...prev, status: e.target.value as any }))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 cursor-pointer"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="out_of_stock">🔴 فقط کاملاً ناموجود</option>
              <option value="low_stock">🟡 فقط کسر موجودی</option>
              <option value="below_threshold">📦 تمام مواردی که ≤ حدآستانه هستند</option>
            </select>
          </div>
        </div>

        {/* Low Stock Items Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
              <tr>
                <th className="p-3">کد کالا</th>
                <th className="p-3">عنوان کالا و مدل</th>
                <th className="p-3">برند</th>
                <th className="p-3">قیمت فعلی (تومان)</th>
                <th className="p-3">موجودی فعلی</th>

                <th className="p-3 text-center">افزایش سریع انبار</th>
                <th className="p-3 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingProducts ? Array(3).fill({}).map(ele => (
                <tr className={`hover:bg-slate-50 transition `}>
                  <td className="p-3 font-mono font-bold text-slate-600 dir-ltr text-right">
                    <Skeleton width={50} height={30} />
                  </td>

                  <td className="p-3">
                    <Skeleton containerClassName='flex justify-center gap-1' width={50} height={30} count={2} />

                  </td>

                  <td className="p-3">
                    <Skeleton width={150} height={30} />
                  </td>

                  <td className="p-3 font-mono font-bold text-slate-800">
                    <Skeleton width={150} height={30} />
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <Skeleton width={150} height={30} />
                    </div>
                  </td>



                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Skeleton width={150} height={30} />
                    </div>
                  </td>

                  <td className="p-3 text-center">
                    <Skeleton width={150} height={30} />
                  </td>
                </tr>
              )) : products.length > 0 ? (
                products.map(product => {

                  const brand = product.brand

                  const isOut = product.inventory === 0

                  return (
                    <tr key={product.pk} className={`hover:bg-slate-50 transition ${isOut ? 'bg-rose-50/40' : 'bg-amber-50/20'}`}>
                      <td className="p-3 font-mono font-bold text-slate-600 dir-ltr text-right">
                        {product.pk}
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-slate-900">{product.title}</div>
                        <div className="text-[11px] text-slate-500 font-mono">مدل: {product.technical_model}</div>
                      </td>

                      <td className="p-3">
                        <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-lg text-[11px]">
                          {brand ? brand.name : "بدون برند"}
                        </span>
                      </td>

                      <td className="p-3 font-mono font-bold text-slate-800">
                        {formatPrice(product.price * ((100 - (Number(product.off) || 0)) / 100), storeSettings.currencyUnit)}
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={0}
                            value={product.inventory}
                            onChange={(e) => handleQtyChange(product.pk, Number(e.target.value))}
                            className={`w-16 p-1.5 rounded-lg border font-mono font-bold text-center text-xs ${isOut
                              ? 'bg-rose-100 border-rose-300 text-rose-800'
                              : product.inventory <= threshold
                                ? 'bg-amber-100 border-amber-300 text-amber-900'
                                : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                              }`}
                          />
                          <span className="text-slate-500 text-[11px]">عدد</span>
                        </div>
                      </td>



                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleQtyChange(product.pk, product.inventory + 5)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono font-bold rounded-lg text-[11px] cursor-pointer"
                            title="افزایش ۵ تایی موجودی"
                          >
                            +۵
                          </button>
                          <button
                            onClick={() => handleQtyChange(product.pk, product.inventory + 10)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono font-bold rounded-lg text-[11px] cursor-pointer"
                            title="افزایش ۱۰ تایی موجودی"
                          >
                            +۱۰
                          </button>
                          <button
                            onClick={() => handleQtyChange(product.pk, product.inventory + 20)}
                            className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 font-mono font-bold rounded-lg text-[11px] cursor-pointer"
                            title="افزایش ۲۰ تایی موجودی"
                          >
                            +۲۰
                          </button>
                        </div>
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleSaveStockForItem(product)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition cursor-pointer flex items-center gap-1 shadow-xs"
                            title="ذخیره این کالا"
                          >
                            {editingProductPk && editingProductPk === product.pk ? <Spinner borderMainColor={"white"} borderTopColor={"green"} height={15} width={15} borderWidth={1.5} /> : <>
                              <Save className="w-3.5 h-3.5" />
                              <span>ذخیره</span></>}
                          </button>

                          <button
                            disabled={(deletingProductPK && deletingProductPK === product.pk) ? true : false}
                            onClick={() => handleDeleteProduct(product)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 hover:text-red-500 rounded-lg cursor-pointer"
                            title="ویرایش کامل کالا"
                          >
                            {deletingProductPK && deletingProductPK === product.pk ? <Spinner height={15} width={15} borderWidth={1.5} borderMainColor={"white"} borderTopColor={"red"} /> :
                              (<Trash2 className="w-4 h-4" />)
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 text-xs">
                    هیچ کالایی با کسر موجودی در حدآستانه تعیین‌شده پیدا نشد. تمامی کالاها دارای موجودی کافی هستند.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {!isLoadingProducts && products?.length &&
          <PaginationContainer nextPage={paginationData.nextPage} prevPage={paginationData.prevPage} pageNums={paginationData.numPages} setFilterState={setFilterState} productsCount={products?.length || 0} />
        }
      </div>
    </div>
  );
};
