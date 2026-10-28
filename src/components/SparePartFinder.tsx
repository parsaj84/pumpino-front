import React, { Dispatch, SetStateAction, useContext, useDeferredValue, useEffect, useState } from 'react';
import {
  Search,
  Wrench,
  Sparkles,
  Info
} from 'lucide-react';
import { CartData, PaginationData, Product, StoreSettings } from '../types';
import { ProductCard } from './ProductCard';
import { toPersianDigits } from '../utils/formatters';
import PaginationContainer from './Pagintation';
import fetchData from '../utils/fetchData';
import { ProductCardLoading } from './ProductCardLoading';
import { MainContext } from '../contexts/MainContext';
import Skeleton from 'react-loading-skeleton';



interface SparePartFinderProps {
  cartItemsId: (string | null | number)[]
  storeSettings: StoreSettings;
  onViewDetails: (p: Product) => void;
  setCartData: Dispatch<SetStateAction<CartData | null>>;
}

export const SparePartFinder: React.FC<SparePartFinderProps> = ({
  storeSettings,
  onViewDetails,
  setCartData,
  cartItemsId,
  
}) => {

  const mainContextValue = useContext(MainContext)


  // Popular pump presets
  //must Change to State -> order by order
  const [popularPumps, setPopularPumps] = useState<{ technical_model: string, title: string }[]>([]);
  const [isLoadingPopularPumps, setIsLoadingPopularPumps] = useState(true)
  useEffect(() => {

    fetchData("products/product-get-popular-products/", ({ data, status }) => {

      if (status === 200) {
        setPopularPumps(data)
      } else {
        mainContextValue?.onError("خطایی رخ داد!")
      }
      setIsLoadingPopularPumps(false)
    }, () => setIsLoadingPopularPumps(true), () => mainContextValue?.onError("خطایی رخ داده است"))
  }, [])


  // my codes block
  const [compatibleParts, setCompatibleParts] = useState<Product[] | null>(null)
  const [isLoadingCompatibleParts, setIsLoadingCompatibleParts] = useState(false)
  const [paginationState, setPaginationState] = useState<PaginationData | null>({
    prevPage: null,
    nextPage: 2,
    numPages: []
  })
  const [filterState, setFilterState] = useState({
    compatiblePartsSearchQuery: "",
    page: ""
  })
  const [compatiblePartsCount, setCompatiblePartsCount] = useState(0)
  const defferedFilterState = useDeferredValue(filterState)
  useEffect(() => {
    setIsLoadingCompatibleParts(true)
    const timeoutId = setTimeout(() => {
      const searchParam = new URLSearchParams(
        filterState
      )

      fetchData("/products/compatible-parts/" + "?" + searchParam.toString(), (response) => {

        setCompatibleParts(response.data.products)
        setIsLoadingCompatibleParts(false)
        setCompatiblePartsCount(response.data.all_objs_count)
        setPaginationState({
          nextPage: response.data.next_page,
          prevPage: response.data.previous_page,
          numPages: response.data.num_pages
        })
      })
    }, 750)
    return () => clearTimeout(timeoutId)
  }, [filterState])





  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>سامانه هوشمند عیب‌یابی و تامین قطعات یدکی پمپ آب</span>
          </div>

          <h2 className="text-xl md:text-3xl font-extrabold tracking-tight">
            مدل پمپ آب خود را انتخاب کنید تا کلیه قطعات یدکی فابریک آن نمایش داده شود
          </h2>

          <p className="text-xs md:text-sm text-slate-300 font-light leading-relaxed">
            دیگر نگران اشتباه بودن سایز مکانیکال سیل، پروانه یا خازن پمپ نباشید. با انتخاب مدل پمپ، تمام لوازم یدکی دقیقاً سازگار با آن (فیبر و فنر، پروانه، خازن، دیفیوزر و بلبرینگ) لیست می‌شوند.
          </p>

          {/* Quick Preset Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">مدل‌های پرمصرف:</span>
            {isLoadingPopularPumps ? Array(8).fill({}).map(() => {
              return (
                <div className='mx-1 rounded-xl text-xs font-medium transition cursor-pointer '>
                  <Skeleton height={20} width={60} />
                </div>
              )
            }) : popularPumps.map((pump, idx) => (
              <button
                key={idx}
                onClick={() => setFilterState(prev => ({ ...prev, compatiblePartsSearchQuery: pump.title }))}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer border 
                   border-sky-400 shadow-md'
                   'bg-slate-800/80 text-slate-200 hover:bg-slate-700 border-slate-700'
                  `}
              >
                {pump.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Search Box */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={filterState.compatiblePartsSearchQuery}
            onChange={(e) => setFilterState(prev => ({ ...prev, compatiblePartsSearchQuery: e.target.value }))}
            placeholder="مدل پمپ را وارد کنید (مثلاً CAM100، PM45، CM100 یا برند پمپ)..."
            className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 text-sm rounded-xl py-3 pr-10 pl-4 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <Search className="w-5 h-5 text-slate-400 absolute right-3 top-3.5" />
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        {filterState.compatiblePartsSearchQuery && <>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-sky-600" />
            <span>قطعات یدکی و جانبی پیدا شده برای پمپ «{filterState.compatiblePartsSearchQuery}»:</span>
          </h3>
          <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold">
            {toPersianDigits(compatiblePartsCount)} قطعه سازگار
          </span></>}

      </div>

      {/* Matched Parts Grid */}
      {isLoadingCompatibleParts ? <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {Array(6).fill({}).map(ele => <ProductCardLoading />)}
      </div> : compatiblePartsCount > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {compatibleParts?.map(p => (
            <ProductCard
              key={p.pk}
              product={p}
              brandName={`${p.brand?.name}(${p.brand?.country})`}
              categoryName={p.categories?.map(c => c.name).join()}
              storeSettings={storeSettings}
              onViewDetails={onViewDetails}
              setCartData={setCartData}
              isInQuote={cartItemsId && cartItemsId?.includes(p.pk.toString())}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <Info className="w-12 h-12 text-slate-300 mx-auto" />
          {defferedFilterState.compatiblePartsSearchQuery && !isLoadingCompatibleParts ? <>
            <h4 className="text-base font-bold text-slate-800">
              قطعه‌ای متناسب با عبارت «{defferedFilterState.compatiblePartsSearchQuery}» یافت نشد.
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              می‌توانید مدل‌های دیگری مانند CAM100، PM45، CM100 یا Jet100 را انتخاب کنید یا با کارشناسان فروشگاه جهت استعلام سفارشی تماس بگیرید.
            </p>
          </> :
            <h4>برای یافتن قطعات سازگار اسم پمپ یا برند پمپ را سرچ کنید.</h4>}

        </div>
      )}
      {(isLoadingCompatibleParts) || <PaginationContainer productsCount={compatiblePartsCount} setFilterState={setFilterState} nextPage={paginationState?.nextPage || null} prevPage={paginationState?.prevPage || null} pageNums={paginationState?.numPages || []} />}
    </div>
  );
};
