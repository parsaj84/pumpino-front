import React, { useState, useMemo, useEffect, useDeferredValue, useRef, useContext } from 'react';
import {
  FilePlus,
  X,
  UserCheck,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  Building2,
  Truck,
  DollarSign,
  Package,
  Motorbike
} from 'lucide-react';
import { Product, StoreSettings, CustomerProfile, CustomerOrder, OrderItem, PaymentStatus, OrderStatus, Province, City, Freight } from '../types';
import { formatPrice, toPersianDigits } from '../utils/formatters';
import SelectInput from './SelectInput';
import fetchData from '../utils/fetchData';
import Skeleton from 'react-loading-skeleton';
import API from '@/api/api';
import Spinner from './Spinner';
import { MainContext } from '../contexts/MainContext';

interface CreateManualInvoiceModalProps {
  products: Product[];
  orders: CustomerOrder[];
  storeSettings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
  onSaveInvoice: (newOrder: CustomerOrder) => void;
  onPrintInvoice?: (order: CustomerOrder) => void;
}

export const CreateManualInvoiceModal: React.FC<CreateManualInvoiceModalProps> = ({
  storeSettings,
  isOpen,
  onClose,
  onSaveInvoice,
}) => {
  if (!isOpen) return null;

  const mainContextValue = useContext(MainContext)


  const [cityError, setCityError] = useState("")
  const [provinceError, setProvinceError] = useState("")
  const [freightError, setFreightError] = useState("")
  const [selectedCityId, setSelectedCityId] = useState<City["pk"] | null>(null)
  const [selectedProvinceId, setSelectedProvinceId] = useState<Province["pk"] | null>(null)
  const [selectedFreightId, setSelectedFreightId] = useState<null | Freight["pk"]>(null)
  const [locatiosData, setLocationsData] = useState<Province[]>([])
  const [freights, setFreights] = useState<(Freight & { city: number | string, province: number | string })[]>([])
  const [isLoadingLocations, setIsLoadingLocations] = useState(false)
  const [isLoadingFreghits, setIsLoadingFreights] = useState(false)
  const [deliveryType, setDeliveryType] = useState<"INPERSON_PICKUP" | "MOTORCYCLE_COURIER" | "PICK_UP_FROM_FREIGHT_TERMINAL">("INPERSON_PICKUP")

  locatiosData.forEach(ele => ele.selected)

  useEffect(() => {
    fetchData("users/fetch-cities-provinces/", (response) => {
      const { data, status } = response
      if (data && status === 200) {
        setLocationsData(data)

        setIsLoadingLocations(false)
      } else {
        mainContextValue?.onError("خطا در بارگذاری اماکن")
      }
    }, () => { setIsLoadingLocations(true) }, () => mainContextValue?.onError("خطا در بارگذاری اماکن"));
    fetchData("orders/freight-list/", (response) => {
      if (response.data, response.status === 200) {
        setFreights(response.data);
        setIsLoadingFreights(false);
      } else {
        mainContextValue?.onError("خطا در بارگذاری بابری ها")
      }
    }, () => setIsLoadingFreights(true), () => mainContextValue?.onError("خطا در بارگذاری باربری"));
  }, [])

  const provinces = useMemo(() => {
    return (
      locatiosData?.map((ele, idx) => {

        if (selectedProvinceId) {
          ele.selected = selectedProvinceId === ele.pk
        }
        return ele
      }) || []
    )
  }, [locatiosData, selectedProvinceId])

  const selectedProvince = provinces.find(ele => ele.selected)

  const cities = useMemo(() => {
    return (
      selectedProvince?.cities?.map((ele, idx) => {
        if (selectedCityId && selectedProvince?.cities.find(ele => ele.pk === selectedCityId)) {
          ele.selected = ele.pk === selectedCityId
        }
        return ele
      }) || []
    )
  }, [selectedCityId, selectedProvince])

  const filteredFreights = useMemo(() => {
    return freights.filter((ele) => {
      return ele.province === provinces.find(ele => ele.selected)?.pk && cities.find(ele => ele.selected)?.pk === ele.city
    }).map((ele, index) => {

      if (selectedFreightId) {
        ele.selected = ele.pk === selectedFreightId
        return ele
      }
      ele.selected = index === 0
      return ele
    });
  }, [freights, provinces, cities, selectedFreightId])

  const [formConfig, setFormConfig] = useState([
    { code: "fname", label: "نام خریدار", value: "", regex: null, isNumeric: false, required: true, error: "" },
    { code: "lname", label: "نام خانوادگی خریدار", value: "", regex: null, isNumeric: false, required: true, error: "" },
    { code: "phone", label: "شماره تلفن خریدار", value: "", regex: /^09\d{9}$/, isNumeric: false, required: true, error: "" },
    { code: "store_name", label: "نام فروشگاه", value: "", regex: null, isNumeric: false, required: false, error: "" },
    { code: "address", label: "ادرس", value: "", regex: null, isNumeric: false, required: true, isLongTextField: true, error: "" },
  ])
  // When customer dropdown changes



  const [isSending, setIsSending] = useState(false)
  // Items in invoice
  const [invoiceItems, setInvoiceItems] = useState<OrderItem[]>([]);

  // Product Search for adding items

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [itemQty, setItemQty] = useState<number>(1);
  const [itemPriceToman, setItemPriceToman] = useState<number | ''>('');
  const [itemDiscountPercent, setItemDiscountPercent] = useState<number>(0);

  // When product is selected from search
  const handleSelectProductToDraft = (product: Product) => {
    setSelectedProduct(product);
    setItemPriceToman(product.price);
    setItemDiscountPercent(0);
    setItemQty(1);
    setProductSearch('');
  };

  const handleAddItemToInvoice = () => {
    if (!selectedProduct) {
      alert('لطفاً یک محصول را انتخاب کنید.');
      return;
    }

    const off = itemDiscountPercent || selectedProduct.off
    const price = (itemPriceToman ? (Number(itemPriceToman) * ((100 - (off || 0)) / 100)) : (selectedProduct.price) * ((100 - (off || 0)) / 100));
    const qty = Math.max(1, itemQty);
    setInvoiceItems(prev => {
      const output = [...prev].filter(ele => ele.product?.pk !== selectedProduct.pk)
      const newItem: OrderItem = {
        product: selectedProduct,
        quantity: qty,
        quantity_accepted_by_admin: qty,
        price: price,
        price_accepted_by_admin: price,
        off: off,

      }
      output.push(newItem)
      return output
    })

    // Reset picker
    setSelectedProduct(null);
    setItemPriceToman('');
    setItemQty(1);
    setItemDiscountPercent(0);
  };

  const handleRemoveItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const handleUpdateItemQty = (itemProductId: number | null | string, newQty: number) => {
    if (!itemProductId) {
      mainContextValue?.onError("ایدی ثبت نشده است!لطفا صفحه را رفرش کرده و دوباره ادامه دهید")
      return;
    }
    const qty = Math.max(1, newQty);
    setInvoiceItems(prev => prev.map((item) => itemProductId === item.product?.pk ? { ...item, quantity: qty, quantity_accepted_by_admin: newQty } : item));
  };

  const handleUpdateItemPrice = (itemProductId: number | null | string, newPrice: number) => {
    if (!itemProductId) {
      mainContextValue?.onError("ایدی ثبت نشده است!لطفا صفحه را رفرش کرده و دوباره ادامه دهید")
      return;
    }
    setInvoiceItems(prev => prev.map((item) => itemProductId === item.product?.pk ? { ...item, price: Math.max(0, newPrice * ((100 - (Number(item.off) || 0)) / 100)), price_accepted_by_admin: Math.max(0, newPrice * ((100 - (Number(item.off) || 0)) / 100)) } : item));
  };

  // Calculations
  const totalCalculator = () => {
    let priceWithOff = 0
    let total = 0

    if (invoiceItems.length === 0) {
      return { priceWithOff, total }
    }
    invoiceItems.forEach(item => {
      const { quantity } = item
      priceWithOff += (item.price || 0) * (quantity || 0)
      total += ((item.price || 0) * (1 / ((100 - (Number(item.off) || 0)) / 100))) * (quantity || 0)
    })
    return { priceWithOff, total }
  }


  const { priceWithOff, total } = useMemo(() => totalCalculator() , [
    invoiceItems
  ])
  const discouted = total - priceWithOff

  // Search matches
  const [productMatches, setProductMatches] = useState<Product[]>([])
  const [productSearch, setProductSearch] = useState('');  // Submit invoice creation

  const deferedProductSearch = useDeferredValue(productSearch)
  const [page, setPage] = useState(1)
  const totalPagesCount = useRef(null)
  const filterPayload = useMemo(() => ({
    page: page.toString(),
    searchQuery: deferedProductSearch
  }), [deferedProductSearch, page])

  useEffect(() => {
    setPage(1);
    setProductMatches([]);
    totalPagesCount.current = null
  }, [deferedProductSearch]);
  useEffect(() => {
    const timeOutId = setTimeout(() => {
      if (filterPayload.searchQuery) {
        const urlSearchParams = new URLSearchParams(filterPayload)
        fetchData("products/" + "?" + urlSearchParams.toString(), ({ data, status }) => {
     
          if (status === 200) {
            if (page === 1) {
              setProductMatches(data.products)
              totalPagesCount.current = data.num_pages?.length || null
              return;
            }
            setProductMatches(prev => [...prev, ...data.products])

          }
          else {
            mainContextValue?.onError("خطا در دریافت اطلاعات")
          }

        }  , () => mainContextValue?.onError("خطا در دیافت اطلاعات"))
      }
    }, 750)
    return () => clearTimeout(timeOutId)
  }, [filterPayload])
  const scrollEventTimeout = useRef<null | NodeJS.Timeout | null>(null)

  const handleSubmitInvoice = async () => {
    try {

      if (invoiceItems.length === 0) {
        alert('لطفاً حداقل یک کالا به فاکتور اضافه نمایید.');
        return;
      }

      const orderData: Record<string, (string | number | OrderItem[])> = {}
      let isValid = true
      const compiledFormConfig = formConfig.map(ele => {
        if (ele.required && !ele.value) {
          isValid = false
          ele.error = "مقدار این فیلد اجباری است"
          return ele
        }
        if (ele.regex && !ele.regex.test(ele.value)) {
          isValid = false
          ele.error = `لطفا یک مقدار معتبر برای ${ele.label} وارد کنید.`
          return ele
        }
        orderData[ele.code] = ele.value
        return ele
      })
      setFormConfig(compiledFormConfig)
      orderData["delivery_type"] = deliveryType

      if (deliveryType === "PICK_UP_FROM_FREIGHT_TERMINAL") {
        if (!selectedCityId) {
          isValid = false
          setCityError("مقدار این فیلد اجباری است.")
        }
        if (!selectedProvinceId) {
          isValid = false
          setProvinceError("مقدار این فیلد اجباری است.")
        }
        if (!selectedFreightId && (filteredFreights?.find(ele => ele.selected))) {
          isValid = false
          setFreightError("مقدار این فیلد اجباری است.")
        }
        orderData["freight_id"] = selectedFreightId || filteredFreights.find(ele => ele.selected)?.pk || ""
        orderData["city_id"] = selectedCityId || ""
        orderData["province_id"] = selectedProvinceId || ""
      }

      if (!isValid) {
        return;
      }



      orderData["items"] = invoiceItems.map(item => ({ quantity: item.quantity, quantity_accepted_by_admin: item.quantity_accepted_by_admin, product_id: item.product?.pk, price: item.price, price_accepted_by_admin: item.price }))
      orderData["order_status"] = "ACCEPTED(WAITING_FOR_PAYMENT)"
      setIsSending(true)
      const { data, status } = await API.post("orders/order-admin-manual-create/", orderData)
      if (status === 200) {
        onSaveInvoice(data.data);
      }
      else {
        const e = data.error_des || data.detail || "خطا"
        if (typeof e === "object") {
          mainContextValue?.onError("لطفا اطلاعات را درست وارد کنید!")
          setFormConfig(prev => [...prev].map(ele => {
            if (ele.code in data.error_des) {
              ele.error = data.error_des[ele.code]
            } 
            return ele
          }))
        } else {
            mainContextValue?.onError("خطایی غیرمنتظره رخ داد")
        }
      }
      setIsSending(false)
      onClose();
    } catch (e) {
      mainContextValue?.onError("خطایی غیرمنظتره رخ داد!")
      setIsSending(false)
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 "
      onClick={onClose}
    >
      <div
        className="bg-white scrollbar-thumb-gray-300 rounded-3xl max-w-4xl w-full h-[90%] p-5 sm:p-6 space-y-5 shadow-2xl border border-slate-200 relative my-6 overflow-y-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <FilePlus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                <span>صدور دستی فاکتور رسمی فروش</span>

              </h3>
              <p className="text-xs text-slate-500 font-medium">
                صدور مستقیم فاکتور به نام مشتریان ثبت‌نام شده یا خریداران جدید
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Customer Selection */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
            <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-sky-600" />
              <span>۱. مشخصات مشتری / خریدار:</span>
            </h4>


          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {formConfig.map(ele => (<div className={`${ele.isLongTextField && "sm:col-[1/3] md:col-[1/5]"}`}>
              <label className="font-bold text-slate-700 block mb-1">{ele.label} {ele.required && "*"}</label>
              <input
                type="text"
                placeholder={ele.label}
                value={ele.value}
                onChange={(e) => {
                  setFormConfig(prev => [...prev].map(conf => {
                    if (conf.code !== ele.code) {
                      return conf
                    }
                    const value = e.target.value
                    if (conf.isNumeric) {
                      value.replace(/\D/g, "")
                    }
                    conf.value = value
                    return conf
                  }))
                }}
                className={`w-full  bg-white p-2 rounded-xl border border-slate-300 font-bold focus:outline-none focus:border-sky-500`}
                required
              />
              {ele.error &&
                <p className='text-sm text-red-600'>
                  {ele.error}
                </p>
              }
            </div>))}

          </div>
          <div className='w-full p-3 bg-gray-300/50 rounded-2xl'>
            <div className=" grid gap-1 grid-cols-2 md:grid-cols-3">
              <div className={`p-3 rounded-xl bg-blue-600/50  ${deliveryType === "INPERSON_PICKUP" && "border border-blue-500"}`}>
                <div className='flex justify-around items-center '>
                  <input onChange={() => setDeliveryType("INPERSON_PICKUP")} name='delivery_type' type="radio" checked={deliveryType === "INPERSON_PICKUP"} />
                  <div className='flex items-center justify-around '>
                    <Building2 />
                    <span className='text-sm mx-1'> دریافت حضوری از دفتر مرکزی</span>
                  </div>
                </div>
              </div>
              <div className={`p-3 rounded-xl bg-yellow-600/55 ${deliveryType === "MOTORCYCLE_COURIER" && "border border-yellow-500"}`}>
                <div className="flex justify-around items-center">
                  <input onChange={() => setDeliveryType("MOTORCYCLE_COURIER")} name='delivery_type' type="radio" checked={deliveryType === "MOTORCYCLE_COURIER"} />
                  <div className='flex items-center justify-around '>
                    <Motorbike />
                    <span className='text-sm mx-1'> دریافت با پیک(اسنپ باکس و ...)</span>
                  </div>
                </div>

              </div>
              <div className={`p-3 rounded-xl bg-red-600/55 ${deliveryType === "PICK_UP_FROM_FREIGHT_TERMINAL" && "border border-red-500"}`}>
                <div className="flex justify-around items-center">
                  <input onChange={() => setDeliveryType("PICK_UP_FROM_FREIGHT_TERMINAL")} name='delivery_type' type="radio" checked={deliveryType === "PICK_UP_FROM_FREIGHT_TERMINAL"} />
                  <div className='flex items-center justify-around '>
                    <Truck className='text-sm' />
                    <span className='text-sm mx-1'> تحویل از باربری</span>
                  </div>
                </div>

              </div>

            </div>
            {deliveryType === 'PICK_UP_FROM_FREIGHT_TERMINAL' &&
              <div>
                <div className="my-1">
                  <SelectInput items={provinces} label={"استان"} isLoadingItems={isLoadingLocations} labelProperty={"name"} selectedItem={provinces.find(ele => ele.selected)} onItemSelected={(item) => { setSelectedProvinceId(item?.pk || null); setSelectedFreightId(null) }} />

                  {provinceError && <p className='text-red-500 text-sm'>
                    {provinceError}
                  </p>}
                </div>

                <div className="my-1">
                  <SelectInput items={cities} label={"شهر"} isLoadingItems={isLoadingLocations} labelProperty={"name"} onItemSelected={(item: City) => { setSelectedCityId(item?.pk || null); setSelectedFreightId(null) }} selectedItem={cities?.find(ele => ele.selected) || cities[0]} />
                  {cityError && <p className='text-red-500 text-sm'>
                    {cityError}
                  </p>}
                </div>
                <div className="my-1">
                  <SelectInput items={filteredFreights} label={"باربری"} selectedItem={filteredFreights.find(ele => ele.selected)} isLoadingItems={isLoadingFreghits} labelProperty={"name"} onItemSelected={item => setSelectedFreightId(item?.pk || null)} />
                  {freightError && <p className='text-red-500 text-sm'>
                    {freightError}
                  </p>}
                </div>


              </div>
            }
          </div>
        </div>

        {/* Section 2: Product Catalog Picker */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
          <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-2 border-b border-slate-200/80 pb-2">
            <Package className="w-4 h-4 text-emerald-600" />
            <span>۲. جستجو و افزودن اقلام به فاکتور:</span>
          </h4>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجوی نام پمپ، کد کالا (SKU) یا مدل کالا..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full pr-9 pl-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-sky-500"
            />

            {/* Live Search Dropdown */}
            {productMatches.length > 0 && (
              <div
                onScroll={(e) => {
                  if (scrollEventTimeout.current) {
                    clearTimeout(scrollEventTimeout.current)
                  }
                  const element = e.currentTarget
                  scrollEventTimeout.current = setTimeout(() => {
                    if ((totalPagesCount.current && page >= totalPagesCount.current) || totalPagesCount.current === 1) {
                      return;
                    }
                    const { scrollHeight, offsetHeight, clientHeight } = element
                    const reachedThreshhold = (offsetHeight + clientHeight) >= (scrollHeight - 200)
                    if (reachedThreshhold) {

                      setPage(prev => prev + 1)
                    }
                  }, 1000)
                }}
                className="absolute top-full right-0 left-0 mt-1 bg-white border p-1.5 h-35 border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {productMatches.map(p => (
                  <div

                    key={p.pk}
                    onClick={() => handleSelectProductToDraft(p)}
                    className="p-2.5 hover:bg-sky-50 transition cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{p.title}</div>
                      <div className="text-[11px] text-slate-500 font-mono">کد: {p.pk} | مدل: {p.technical_model}</div>
                    </div>
                    <div className="font-mono font-black text-sky-700">
                      {formatPrice(p.price * ((100 - (p.off || 0)) / 100), storeSettings.currencyUnit)}
                    </div>
                  </div>
                ))}
                {(!totalPagesCount.current || page < totalPagesCount.current) && Array(2).fill({}).map(() => (<div
                  className='p-2.5 hover:bg-sky-50 transition cursor-pointer flex items-center justify-between text-xs'

                >
                  <div>
                    <Skeleton height={15} width={90} />
                    <Skeleton height={15} width={180} />

                  </div>
                  <div>
                    <Skeleton height={15} width={135} count={2} />

                  </div>
                </div>))}
              </div>
            )}
          </div>

          {/* Selected Product Form Builder */}
          {selectedProduct && (
            <div className="bg-sky-50/80 border border-sky-200 p-3 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-sky-900">
                  انتخاب شده: {selectedProduct.title} ({selectedProduct.technical_model})
                </span>
                <span className="font-mono text-xs text-slate-600">
                  قیمت مصوب: {formatPrice(selectedProduct.price * ((100 - (selectedProduct.off || 0)) / 100), storeSettings.currencyUnit)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">تعداد سفارش:</label>
                  <input
                    type="number"
                    min={1}
                    value={itemQty}
                    onChange={(e) => setItemQty(Number(e.target.value))}
                    className="w-full bg-white p-2 rounded-xl border border-sky-300 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">قیمت توافقی واحد (تومان):</label>
                  <input
                    type="number"
                    value={itemPriceToman || (selectedProduct.price * ((100 - (selectedProduct.off || 0)) / 100))}
                    onChange={(e) => setItemPriceToman(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-white p-2 rounded-xl border border-sky-300 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">درصد تخفیف (%):</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={itemDiscountPercent || selectedProduct.off}
                    onChange={(e) => setItemDiscountPercent(Number(e.target.value))}
                    className="w-full bg-white p-2 rounded-xl border border-sky-300 font-mono font-bold"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAddItemToInvoice}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ افزودن به ردیف فاکتور</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Invoice Items Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">ردیف</th>
                  <th className="p-2.5">عنوان کالا و مدل</th>
                  <th className="p-2.5 text-center">تعداد</th>
                  <th className="p-2.5">قیمت واحد (تومان)</th>
                  <th className="p-2.5">تخفیف</th>
                  <th className="p-2.5">مبلغ کل همراه با تخفیف(تومان)</th>
                  <th className="p-2.5 text-center">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoiceItems.length > 0 ? (
                  invoiceItems.map((item, idx) => {
                    const lineFinal = (item?.price || 0) * (item?.price || 0)



                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="p-2.5 font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-slate-900">
                          {item.product?.title || "ثبت نشده"}
                          <span className="text-[11px] text-slate-500 font-mono block">کد: {item.product?.serial_number || "ثبت نشده"}</span>
                        </td>
                        <td className="p-2.5 text-center">
                          <input
                            type="number"
                            min={1}

                            value={item.quantity}
                            onChange={(e) => handleUpdateItemQty(item.product?.pk || null, Number(e.target.value))}
                            className="w-14 text-center bg-slate-100 border border-slate-300 rounded-lg p-1 font-mono font-bold"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            value={((item?.price || 0) * (1 / ((100 - (Number(item?.off) || 0)) / 100)))}
                            step={1000000}
                            onChange={(e) => handleUpdateItemPrice(item.product?.pk || null, Number(e.target.value))}
                            className="w-28 bg-slate-100 border border-slate-300 rounded-lg p-1 font-mono font-bold dir-ltr text-right"
                          />
                        </td>
                        <td className="p-2.5 font-mono text-amber-600 font-bold">
                          {`${toPersianDigits(item.off || 0)}٪`}
                        </td>
                        <td className="p-2.5 font-mono font-black text-slate-900">
                          {formatPrice(lineFinal, storeSettings.currencyUnit)}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400 text-xs font-medium">
                      هنوز هیچ کالایی به ردیف‌های این فاکتور اضافه نشده است.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Status and Financial Totals */}
        <div className="grid grid-cols-1  gap-4">


          <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3">
            <h4 className="font-extrabold text-xs text-sky-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <DollarSign className="w-4 h-4" />
              <span>خلاصه محاسبات مالی فاکتور:</span>
            </h4>

            <div className="space-y-2 text-xs font-bold">
              <div className="flex justify-between text-slate-300">
                <span>جمع کل بدون تخفیف:</span>
                <span className="font-mono">{formatPrice(total, storeSettings.currencyUnit)}</span>
              </div>
              <div className="flex justify-between text-amber-400">
                <span>مجموع تخفیفات:</span>
                <span className="font-mono">{formatPrice(discouted, storeSettings.currencyUnit)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-emerald-400 pt-2 border-t border-slate-800">
                <span>مبلغ قابل پرداخت فاکتور:</span>
                <span className="font-mono">{formatPrice(priceWithOff, storeSettings.currencyUnit)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                انصراف
              </button>

              <button
                type="button"
                onClick={() => handleSubmitInvoice()}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer flex items-center gap-1.5"
              >
                {isSending ? <Spinner borderMainColor={"white"} width={15} height={15} borderTopColor={"blue"} borderWidth={1.75} /> : <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>صدور و ثبت فاکتور</span></>}
              </button>


            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
