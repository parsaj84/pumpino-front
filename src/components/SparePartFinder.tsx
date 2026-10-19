import React, { useDeferredValue, useEffect, useState } from 'react';
import {
  Zap,
  Search,
  CheckCircle2,
  ShoppingBag,
  Wrench,
  Layers,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { Product, StoreSettings } from '../types';
import { ProductCard } from './ProductCard';
import { toPersianDigits } from '../utils/formatters';
import PaginationContainer from './Pagintation';
import fetchData from '../utils/fetchData';
import { ProductCardLoading } from './ProductCardLoading';



interface SparePartFinderProps {
  products: Product[];
  storeSettings: StoreSettings;
  onViewDetails: (p: Product) => void;
  onAddToQuote: (p: Product) => void;
  quoteItemIds: string[];
}

export const SparePartFinder: React.FC<SparePartFinderProps> = ({
  products,
  storeSettings,
  onViewDetails,
  onAddToQuote,
  quoteItemIds
}) => {


  // Popular pump presets
  //must Change to State -> order by order
  const popularPumps = [
    { title: 'پنتاکس جتی ۱ اسب (CAM100)', query: 'CAM100' },
    { title: 'پنتاکس بشقابی ۱ اسب (CM100)', query: 'CM100' },
    { title: 'پنتاکس محیطی نیم اسب (PM45)', query: 'PM45' },
    { title: 'الکتروژن جتی ۱ اسب (Jet100)', query: 'Jet100' },
    { title: 'ابارا بشقابی ۱ اسب (CMA100)', query: 'CMA100' },
    { title: 'پنتاکس دو پروانه ۲ اسب (CB210)', query: 'CB210' },
  ];



  const handleAddAllToQuote = () => {
    compatibleParts?.forEach(p => {
      if (!quoteItemIds.includes(p.id)) {
        onAddToQuote(p);
      }
    });
  };

  // my codes block
  const [compatibleParts, setCompatibleParts] = useState(null)
  const [isLoadingCompatibleParts, setIsLoadingCompatibleParts] = useState(false)
  const [paginationState, setPaginationState] = useState(null)
  const [filterState, setFilterState] = useState({
    compatiblePartsSearchQuery: "",
    page: ""
  })
  const [compatiblePartsCount , setCompatiblePartsCount] = useState(0)
  const defferedFilterState = useDeferredValue(filterState)
  useEffect(() => {
    setIsLoadingCompatibleParts(true)
    const timeoutId = setTimeout(() => {
      const searchParam = new URLSearchParams(
        filterState
      )

      fetchData("/products/compatible-parts/" + "?" + searchParam.toString(), (response) => {
        console.log(response.data)
        setCompatibleParts(response.data.products)
        setIsLoadingCompatibleParts(false)
        setCompatiblePartsCount(response.data.all_objs_count)
        setPaginationState({
          nextPage: response.data.next_page,
          previousePage: response.data.previous_page,
          numPages: response.data.num_pages
        })
      })
    }, 750)
    return () => clearTimeout(timeoutId)
  }, [filterState])

  // const [popularPumps , setPopularPumps] = useState(null)



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
            {popularPumps.map((pump, idx) => (
              <button
                key={idx}
                onClick={() => setfilterState.compatiblePartsSearchQuery(pump.query)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer border ${filterState.compatiblePartsSearchQuery === pump.query
                  ? 'bg-sky-500 text-white font-bold border-sky-400 shadow-md'
                  : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700 border-slate-700'
                  }`}
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

        {compatiblePartsCount> 0 && (
          <button
            onClick={handleAddAllToQuote}
            className="w-full md:w-auto px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs md:text-sm transition shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>افزودن کلیه قطعات این پمپ به لیست استعلام ({toPersianDigits(compatiblePartsCount)} آیتم)</span>
          </button>
        )}
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
              brandName={`${p.brand.name}(${p.brand.country})`}
              categoryName={p.categories.map(c => c.name).join()}
              storeSettings={storeSettings}
              onViewDetails={onViewDetails}
              onAddToQuote={onAddToQuote}
              isInQuote={quoteItemIds.includes(p.id)}
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
      {(isLoadingCompatibleParts ) || <PaginationContainer productsCount={compatiblePartsCount}  setFilterState={setFilterState} nextPage={paginationState?.nextPage} prevPage={paginationState?.previousePage} pageNums={paginationState?.numPages} />}
    </div>
  );
};
