import React, { ChangeEvent, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  ShoppingBag,
  Trash2,
  Send,
  Truck,
  CheckCircle2,
  User,
} from 'lucide-react';
import {  StoreSettings, UserData, FormConfig, CartData, Province, Freight, City, keyOffFormConfig } from '../types';
import { formatPrice, toPersianDigits } from '../utils/formatters';
import CartItemTableRow from './CartItemTableRow';
import API from '@/api/api';
import Spinner from './Spinner';
import fetchData from '../utils/fetchData';
import SelectInput from './SelectInput';
import { MainContext, MainContextValue } from '../contexts/MainContext';



interface QuoteCartModalProps {
  cartData: CartData | null;
  setCartData: React.Dispatch<React.SetStateAction<CartData | null>>;
  storeSettings: StoreSettings;
  customerProfile: UserData | null;
  onOpenAuthModal: () => void;
  // onSubmitOrder: (order: CustomerOrder) => void;
  // onClose: () => void;
  // onOpenPrintInvoice: (customer: CustomerInfo) => void;
}

export const QuoteCartModal: React.FC<QuoteCartModalProps> = ({
  cartData,
  setCartData,
  storeSettings,
  customerProfile,
  onOpenAuthModal,
}) => {
  const mainCotextValue = useContext<MainContextValue>(MainContext)

  const [shippingLocation, setShippingLocation] = useState<'tehran' | 'other_cities'>('tehran');
  const [shippingMethod, setShippingMethod] = useState<'MOTORCYCLE_COURIER' | 'INPERSON_PICKUP' | 'PICK_UP_FROM_FREIGHT_TERMINAL'>('MOTORCYCLE_COURIER');
  const [paymentChoice, setPaymentChoice] = useState<'online_gateway' | 'card_to_card'>('card_to_card');

  // Available active gateways
  const activeGateways = storeSettings.paymentSettings?.gateways.filter(g => g.enabled) || [
    { id: 'gw-zarinpal-1', name: 'درگاه پرداخت اینترنتی زرین‌پال', code: 'zarinpal', merchantId: 'demo', enabled: true, isDefault: true }
  ];
  const [selectedGatewayId, setSelectedGatewayId] = useState<string>(
    activeGateways.find(g => g.isDefault)?.id || activeGateways[0]?.id || ''
  );

  const [isOrderSubmittedSuccess, setIsOrderSubmittedSuccess] = useState(false);
  const [isClearingCart, setIsClearingCart] = useState(false)
  const [locatiosData, setLocationsData] = useState<(Province & { selected: boolean })[]>([])
  const [isLoadingLocations, setIsLoadingLocations] = useState(false)
  const [freights, setFreights] = useState<Freight[]>([])
  const [isLoadingFreghits, setIsLoadingFreights] = useState(false)
  const [selectedFreightId, setSelectedFreightId] = useState<number | string | null>(null)
  const [selectedProvinceId, setSelectedProvinceId] = useState(customerProfile?.data?.province?.pk)
  const [selectedCityId, setSelectedCityId] = useState(customerProfile?.data?.city?.pk)
  const [isSending, setIsSending] = useState(false)
  const [provinceError, setProvinceError] = useState("")
  const [cityError, setCityError] = useState("")
  const [freightError, setFreightError] = useState("")

  const [formConfig, setFormConfig] = useState<FormConfig[]>([
    { code: "fname", isNumeric: false, label: "نام خریدار", required: true, regex: null, value: customerProfile?.data?.fname, error: "", help_placeholder: "نام" },
    { code: "lname", isNumeric: false, label: "نام خانوادگی خریدار", required: true, regex: null, value: customerProfile?.data?.lname, error: "", help_placeholder: "نام خانوادگی" },
    { code: "phone", isNumeric: true, label: "شماره تلفن خریدار", required: true, regex: /^(?:\+98|98|0)?9[0-9]{9}$/, value: customerProfile?.data?.phone, error: "", help_placeholder: "09100000000" },
    { code: "address", isNumeric: false, label: "ادرس", required: true, regex: null, value: "", error: "", help_placeholder: "ادرس" },

  ])

  const validateAndSetConf = useCallback((conf: FormConfig, event: ChangeEvent<HTMLInputElement>, ele: FormConfig) => {
    if (conf.code !== ele.code) {
      return conf
    }

    let value = event.target.value

    if (conf.isNumeric) {
      value = event.target.value.replace(/[^0-9]/g, '')

    }

    if (!value && conf.required) {
      conf.error = "مقدار این فیلد اجباری است"
      conf.value = value
      return conf
    }
    if (conf.regex && !conf.regex.test(value)) {
      conf.error = `لطفا یک مقدار معتبر برای ${conf.label} وارد کنید`
      conf.value = value
      return conf
    }
    conf.error = ""
    conf.value = value
    return conf
  }, [])

  const clearAll = async () => {
    try {
      if (confirm('آیا از حذف تمام کالاهای موجود در لیست استعلام اطمینان دارید؟')) {
        setIsClearingCart(true)
        const { data, status } = await API.post("cart/clear-cart/")
        if (status === 200 && data.success) {
          setCartData({ post_price: 0, total_items_price: 0, cart_items: [] })
        } else {
          mainCotextValue?.onError("خطا در فرایند پاکسازی سبد خرید")
        }
        setIsClearingCart(false)
      }
    }
    catch (e) {
      mainCotextValue?.onError("خطا در فرایند پاکسازی سبد خرید")

      setIsClearingCart(false)

    }
  };

  // Financial calculations
  const finalTotalToman = (Number(cartData?.total_items_price) + Number(cartData?.post_price)) || 0;







  useEffect(() => {
    fetchData("users/fetch-cities-provinces/", (response) => {
      const { data, status } = response
      if (data && status === 200) {
        setLocationsData(data)
        setIsLoadingLocations(false)
      } else {
        mainCotextValue?.onError("خطا در بارگذاری اماکن!")
      }
    }, () => { setIsLoadingLocations(true) }, () => mainCotextValue?.onError("خطا در بارگذاری اماکن"));
    fetchData("orders/freight-list/", (response) => {
      if (response.data, response.status === 200) {
        setFreights(response.data);
        setIsLoadingFreights(false);
      }
    }, () => setIsLoadingFreights(true), () => mainCotextValue?.onError("خطا در بارگذاری باربری"));
  }, [])


  const provinces = useMemo(() => {
    return locatiosData?.map((ele, idx) => {

      if (selectedProvinceId) {
        ele.selected = selectedProvinceId === ele?.pk
      }
      return ele
    })
  }, [locatiosData, selectedProvinceId])

  const selectedProvince = provinces.find(ele => ele.selected)

  const cities = useMemo<City[]>(() => {

    return selectedProvince?.cities?.map((ele, idx) => {
      if (selectedCityId && selectedProvince?.cities.find(ele => ele.pk === selectedCityId)) {
        ele.selected = ele.pk === selectedCityId
      }
      return ele
    }) || []
  }, [selectedProvince, selectedCityId])

  const filteredFreights = freights.filter((ele) => {
    return ele.province === provinces.find(ele => ele.selected)?.pk && cities.find(ele => ele.selected)?.pk === ele.city
  }).map((ele, index) => {

    if (selectedFreightId) {
      ele.selected = ele.pk === selectedFreightId
      return ele
    }
    ele.selected = index === 0
    return ele
  });



  const handleSubmitOrderToAdmin = async () => {
    try {
      if (!customerProfile?.isAuthenticated) {
        onOpenAuthModal()
        return;
      }

      const formData: Record<keyOffFormConfig | string, string | number | null | undefined> = {}
      let isValid = true
      const compiledFormConfig = formConfig.map(ele => {
        if (!ele.value && ele.required) {
          isValid = false
          ele.error = "مقدار این فیلد اجباری است!"
          return ele;
        }
        if (ele.regex && !ele.regex.test(String(ele.value))) {
          isValid = false
          ele.error = `لطفا یک مقدار معتبر برای ${ele.label} وارد کنید!`
        }
        formData[ele.code] = ele.value
        return ele
      });
      setFormConfig(compiledFormConfig)

      setFreightError("")
      setCityError("")
      setProvinceError("")
      if (shippingMethod === 'PICK_UP_FROM_FREIGHT_TERMINAL') {
        formData["province_id"] = provinces.find(ele => ele.selected)?.pk
        formData["city_id"] = cities.find(ele => ele.selected)?.pk
        formData["freight_id"] = filteredFreights.find(ele => ele.selected)?.pk

        if (!formData["freight_id"]) {
          isValid = false
          setFreightError("مقدار این فیلد اجباری است")
        }

        if (!formData["city_id"]) {
          isValid = false
          setCityError("مقدار این فیلد اجباری است")
        }
        if (!formData["province_id"]) {
          isValid = false
          setProvinceError("مقدار این فیلد اجباری است")
        }
      }
      formData["delivery_type"] = shippingMethod


      if (isValid) {
        setIsSending(true)
        const { status, data } = await API.post("orders/create-order/", formData)
        if (status === 200) {
          setCartData({ post_price: 0, total_items_price: 0, cart_items: [] })
        } else if (status === 401) {
          mainCotextValue?.onError("کاربر نامعتبر!")
        } else {
          mainCotextValue?.onError(status === 400 ? "لطفا داده هارا درست وارد کنید" : "خطا غیرمنتظره")
        }
        setIsSending(false)
      }
    } catch (e) {
      mainCotextValue?.onError("خطا غیرمنتظره!")
      setIsSending(false)
    }

  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl font-bold">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">سبد خرید</h2>
            <p className="text-xs text-slate-400">
              تعداد کالاهای انتخابی: {toPersianDigits(cartData?.cart_items?.length || 0)} کالا
            </p>
          </div>
        </div>

        {cartData && cartData?.cart_items?.length > 0 && (
          <button
            disabled={isClearingCart}

            onClick={clearAll}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer"
          >
            {isClearingCart ? <Spinner width={15} height={15} borderMainColor={"white"} borderTopColor={"red"} borderWidth={1.5} /> : <>
              <Trash2 className="w-3.5 h-3.5" />
              <span>پاکسازی سبد</span>
            </>}
          </button>
        )}
      </div>

      {cartData?.cart_items?.length === 0 ? (
        <div className="p-12 text-center space-y-3">
          <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            سبد خرید شما خالی است
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            از کاتالوگ یا بخش قطعه‌یاب هوشمند، پمپ‌ها و قطعات یدکی مورد نیاز خود را به این لیست اضافه کنید.
          </p>
        </div>
      ) : (
        <div className="p-6 space-y-6">
          {/* Customer Info Form */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
                <User className="w-4 h-4 text-sky-600" />
                <span>اطلاعات خریدار جهت درج روی پیش‌فاکتور:</span>
              </h3>

              {customerProfile?.isAuthenticated ? (
                <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-xl text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>خریدار تاییدشده: {(customerProfile?.data?.fname || customerProfile?.data?.lname) ? (customerProfile?.data?.fname || "") + " " + (customerProfile?.data?.lname || "") : ""} ({toPersianDigits(customerProfile?.data?.phone || "") || "ثبت نشده"})</span>
                </div>
              ) : (
                <button
                  onClick={onOpenAuthModal}
                  className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer shadow-xs"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>ورود / ثبت شماره همراه برای ثبت پیش‌فاکتور</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {formConfig.map(ele => (
                <div className={`${ele.code === "address" && "col-span-full"}`}>
                  <label className="text-[11px] text-slate-600 font-medium block mb-1">
                    {ele.label}
                  </label>
                  <input
                    type="text"
                    value={String(ele.value)}
                    onChange={(e) => setFormConfig(prev => prev.map(conf => validateAndSetConf(conf, e, ele)))}
                    placeholder={ele.help_placeholder}
                    className={`w-full bg-white text-xs font-bold p-2.5 rounded-xl border ${ele.error ? "border-red-300" : "border-slate-300"} focus:outline-none focus:ring-2 ${ele.error ? "focus:ring-red-500" : "focus:ring-sky-500"}`}
                  />
                  {ele.error && <p className='text-xs my-1 text-red-500'>
                    {ele.error}
                  </p>}
                </div>
              ))}

            </div>

            {/* Shipping & Delivery Options Selector */}
            <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-sky-950 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-sky-600" />
                  <span>نحوه تحویل و ارسال کالا (Delivery Options):</span>
                </h4>

                {/* Location selector toggle */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-sky-300 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setShippingLocation('tehran');
                      setShippingMethod('MOTORCYCLE_COURIER');
                    }}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer ${shippingLocation === 'tehran'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                      }`}
                  >
                    استان تهران
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShippingLocation('other_cities');
                      setShippingMethod('PICK_UP_FROM_FREIGHT_TERMINAL');
                    }}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer ${shippingLocation === 'other_cities'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                      }`}
                  >
                    سایر شهرستان‌ها
                  </button>
                </div>
              </div>
              {shippingLocation === 'other_cities' &&
                <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
                  <SelectInput items={provinces} label={"استان"} isLoadingItems={isLoadingLocations} labelProperty={"name"} selectedItem={provinces.find(ele => ele.selected)} onItemSelected={(item) => { setSelectedProvinceId(item.pk); setSelectedFreightId(null) }} />

                  {provinceError && <p className='text-red-500 text-sm'>
                    {provinceError}
                  </p>}

                  <SelectInput items={cities} label={"شهر"} isLoadingItems={isLoadingLocations} labelProperty={"name"} onItemSelected={(item) => { setSelectedCityId(item?.pk); setSelectedFreightId(null) }} selectedItem={cities?.find(ele => ele.selected)} />
                  {cityError && <p className='text-red-500 text-sm'>
                    {cityError}
                  </p>}
                  <SelectInput items={filteredFreights} label={"باربری"} selectedItem={filteredFreights.find(ele => ele.selected)} isLoadingItems={isLoadingFreghits} labelProperty={"name"} onItemSelected={item => setSelectedFreightId(item.pk)} />
                  {freightError && <p className='text-red-500 text-sm'>
                    {freightError}
                  </p>}
                </div>
              }
              {/* Delivery method choices depending on location */}
              {shippingLocation === 'tehran' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-2.5 ${shippingMethod === 'MOTORCYCLE_COURIER'
                    ? 'bg-white border-sky-600 ring-2 ring-sky-200 text-sky-950 font-bold'
                    : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white'
                    }`}>
                    <input
                      type="radio"
                      name="shipping_method"
                      checked={shippingMethod === 'MOTORCYCLE_COURIER'}
                      onChange={() => setShippingMethod('MOTORCYCLE_COURIER')}
                      className="accent-sky-600"
                    />
                    <div>
                      <div className="font-extrabold text-slate-900">🛵 ارسال با پیک موتوری / اسنپ‌باکس</div>
                      <div className="text-[10px] text-slate-500">تحویل سریع در کلیه مناطق شهر تهران (کمتر از ۲ ساعت)</div>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-2.5 ${shippingMethod === 'INPERSON_PICKUP'
                    ? 'bg-white border-sky-600 ring-2 ring-sky-200 text-sky-950 font-bold'
                    : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white'
                    }`}>
                    <input
                      type="radio"
                      name="shipping_method"
                      checked={shippingMethod === 'INPERSON_PICKUP'}
                      onChange={() => setShippingMethod('INPERSON_PICKUP')}
                      className="accent-sky-600"
                    />
                    <div>
                      <div className="font-extrabold text-slate-900">🏢 تحویل حضوری در دفتر/انبار تهران</div>
                      <div className="text-[10px] text-slate-500">خيابان سعدی جنوبی - انبار مرکزی پمپینو (تحویل رایگان)</div>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">


                  <label className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-2.5 ${shippingMethod === 'PICK_UP_FROM_FREIGHT_TERMINAL'
                    ? 'bg-white border-sky-600 ring-2 ring-sky-200 text-sky-950 font-bold'
                    : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white'
                    }`}>
                    <input
                      type="radio"
                      name="shipping_method"
                      checked={shippingMethod === 'PICK_UP_FROM_FREIGHT_TERMINAL'}
                      onChange={() => setShippingMethod('PICK_UP_FROM_FREIGHT_TERMINAL')}
                      className="accent-sky-600"
                    />
                    <div>
                      <div className="font-extrabold text-slate-900">🚛 باربری بین‌شهری / ترمینال</div>
                      <div className="text-[10px] text-slate-500">مناسب بوسترپمپ، پمپ‌های سنگین و خریدهای عمده</div>
                    </div>
                  </label>

                </div>
              )}
            </div>

            {/* Payment Gateway Option Selection */}
            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-3">
              <h4 className="font-extrabold text-xs text-amber-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span>روش پرداخت فاکتور:</span>
              </h4>


              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Card to Card Option */}
                {storeSettings.paymentSettings?.cardToCardEnabled !== false && (
                  <div className={`p-3 rounded-2xl border transition space-y-1 ${paymentChoice === 'card_to_card'
                    ? 'bg-white border-amber-500 ring-2 ring-amber-200 text-slate-900 font-bold'
                    : 'bg-white/60 border-slate-200 text-slate-700'
                    }`}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="payment_choice"
                        checked={paymentChoice === 'card_to_card'}
                        onChange={() => setPaymentChoice('card_to_card')}
                        className="accent-amber-600"
                      />
                      <span className="font-black text-slate-900">🏦 واریز کارت به کارت / حساب بانکی</span>
                    </label>
                    <p className="text-[10px] text-slate-500 mr-5">
                      شماره کارت: {toPersianDigits(storeSettings.bankCardNumber || '۶۰۳۷-۹۹۷۵-۱۲۳۴-۵۶۷۸')} ({storeSettings.bankOwnerName || 'پمپینو'})
                    </p>
                  </div>
                )}

                {/* Online Gateway Option */}

                {storeSettings.paymentSettings?.onlineGatewaysEnabled !== false && (
                  <div className={`p-3 rounded-2xl border transition space-y-2 ${paymentChoice === 'online_gateway'
                    ? 'bg-white border-amber-500 ring-2 ring-amber-200 text-slate-900 font-bold'
                    : 'bg-white/60 border-slate-200 text-slate-700'
                    }`}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="payment_choice"
                        disabled={true}
                        checked={paymentChoice === 'online_gateway'}
                        onChange={() => setPaymentChoice('online_gateway')}
                        className="accent-amber-600"
                      />
                      <span className="font-black text-amber-900">💳 پرداخت آنلاین شاپرک (درگاه شتاب)(غیرقابل دستر)</span>
                    </label>

                    {paymentChoice === 'online_gateway' && activeGateways.length > 0 && (
                      <div className="pt-1">
                        <label className="text-[11px] text-slate-600 font-medium block mb-1">انتخاب درگاه بانکی:</label>
                        <select
                          value={selectedGatewayId}
                          onChange={(e) => setSelectedGatewayId(e.target.value)}
                          className="w-full bg-slate-50 text-xs font-bold p-2 rounded-xl border border-slate-300"
                        >
                          {activeGateways.map(gw => (
                            <option key={gw.id} value={gw.id}>
                              {gw.name} {gw.isDefault ? '(پیش‌فرض)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}


              </div>
            </div>
          </div>

          {/* Table of Selected Products */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">مدل فنی</th>
                  <th className="p-3">عنوان کالا</th>
                  <th className="p-3">قیمت واحد</th>
                  <th className="p-3 text-center">تعداد</th>
                  <th className="p-3">قیمت کل</th>
                  <th className="p-3 text-center">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cartData?.cart_items?.map((item, idx) => {
                  const product = item.product
                  return (
                    <CartItemTableRow setCartData={setCartData} idx={idx} item={item} product={product} storeSettings={storeSettings} key={idx} />
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Order Summary Total */}
          <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 w-full md:w-auto">
              <span className="text-xs text-sky-300 font-bold block">مجموع برآورد پیش‌فاکتور (قبل از تایید و تخفیف مدیریت):</span>
              <p className="text-[11px] text-slate-400">
                تخفیفات فروشگاهی و همکاری پس از بررسی توسط مدیریت اعمال خواهند شد.
              </p>
            </div>

            <div className="text-left md:text-right space-y-1 w-full md:w-auto">
              <span className="text-xs text-slate-400 block">مبلغ کل برآورد(همراه با هزینه ارسال):</span>
              <span className="text-2xl font-extrabold text-amber-400 font-mono">
                {formatPrice(finalTotalToman, storeSettings.currencyUnit)}
              </span>
            </div>
          </div>

          {/* Order Success Alert Banner */}
          {isOrderSubmittedSuccess && (
            <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl flex items-center justify-between gap-4 text-emerald-900 animate-fadeIn">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-extrabold text-sm">سفارش شما با موفقیت برای مدیریت ارسال گردید!</h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    مدیریت فروشگاه اقلام و قیمت‌ها را بررسی کرده و فاکتور خرید را صادر خواهد کرد. می‌توانید در زبانه «سفارشات من» وضعیت آن را پیگیری فرمایید.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOrderSubmittedSuccess(false)}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl cursor-pointer"
              >
                متوجه شدم
              </button>
            </div>
          )}

          {/* Action Export & Submit Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              disabled={isSending}
              onClick={handleSubmitOrderToAdmin}
              className="px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs transition flex items-center gap-2 cursor-pointer shadow-lg shadow-sky-600/30"
            >
              {isSending ? <Spinner width={15} height={15} borderMainColor={"wheat"} borderTopColor={"blue"} borderWidth={1.5} /> : <>
                <Send className="w-4 h-4" />
                <span>ارسال مستقیم سفارش برای مدیریت فروشگاه</span>
              </>}
            </button>

            <div className="flex flex-wrap items-center gap-2 mr-auto">








            </div>
          </div>
        </div>
      )}
    </div>
  );
};
