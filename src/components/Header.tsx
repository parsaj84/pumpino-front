import React, { Dispatch, SetStateAction } from 'react';
import {
  ShoppingBag,
  SlidersHorizontal,
  Phone,
  Clock,
  Zap,
  User,
  Package,
  Smartphone,
  PackageX
} from 'lucide-react';
import { StoreSettings, Product, CustomerProfile, UserData } from '../types';
import { toPersianDigits } from '../utils/formatters';
import Skeleton from 'react-loading-skeleton';




interface HeaderProps {
  activeTab: 'catalog' | 'finder' | 'quote' | 'orders' | 'admin' | "return_requests";
  setActiveTab: (tab: 'catalog' | 'finder' | 'quote' | 'orders' | 'admin' | "return_requests") => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  quoteCount: number;
  user : UserData;
  setUser : Dispatch<SetStateAction<UserData>>
  customerProfile: CustomerProfile | null;
  storeSettings: StoreSettings;
  products: Product[];
  onOpenAuthModal: () => void;
  onOpenPwaGuide?: () => void;
  isAuthorizing : boolean;
  productsCount : number,
  setIsEditProfileModalActive : Dispatch<SetStateAction<boolean>>
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  quoteCount,
  customerProfile,
  storeSettings,
  onOpenAuthModal,
  onOpenPwaGuide,
  isAuthorizing,
  user,
  productsCount,
  setIsEditProfileModalActive,  
}) => {

  return (
    <header className="bg-slate-900 text-slate-100 shadow-md border-b border-slate-800 sticky top-0 z-30 pt-safe">
      {/* Top Bar with Store Info */}
      <div className="bg-slate-950 text-slate-300 text-[11px] sm:text-xs py-1.5 px-3 sm:px-4 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto whitespace-nowrap">
            <span className="flex items-center gap-1 font-medium text-amber-400 shrink-0">
              <Clock className="w-3 h-3" />
              <span>قیمت‌ها: {toPersianDigits(storeSettings.lastUpdatedDate)}</span>
            </span>
            <span className="text-slate-700">|</span>
            <a
              href={`tel:${storeSettings.mobileNumber}`}
              className="flex items-center gap-1 text-sky-300 font-bold hover:underline shrink-0"
            >
              <Phone className="w-3 h-3 text-sky-400" />
              <span>تماس: {toPersianDigits(storeSettings.mobileNumber)}</span>
            </a>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenPwaGuide && (
              <button
                type="button"
                onClick={onOpenPwaGuide}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition text-[11px] font-bold cursor-pointer border border-amber-500/30"
                title="راهنمای افزودن وب‌اپلیکیشن به صفحه اصلی گوشی"
              >
                <Smartphone className="w-3 h-3 text-amber-400" />
                <span>نصب اپلیکیشن</span>
              </button>
            )}
            {!isAuthorizing && user.isAuthenticated && (user.data?.is_admin || user.data?.is_staff || user.data?.is_superuser) && user.data?.is_active && (
              <button
                onClick={() => setActiveTab(("admin"))}
                className=" = sm:inline-flex items-center gap-1 px-3 py-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-300 border-2 border-red-500/20 transition text-[11px] font-medium cursor-pointer"
                title="خروجی اکسل"
              >
                <User className="w-3 h-3" />
                <span>ورود به پنل ادمین</span>
              </button>
            )}

          </div>
        </div>
      </div>

      {/* Main Branding & Header Actions */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4">
        {/* Logo & Store Branding */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('catalog')}>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight font-mono">
                PUMPINO
              </h1>
              <span className="text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30">
                پمپینو
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-300 font-medium">
              مرکز تخصصی پمپ آب، بوسترپمپ و کامل‌ترین بانک قطعات یدکی
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('quote')}
            className={`relative inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition cursor-pointer shadow-sm ${activeTab === 'quote'
              ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
              : 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700/80 hover:border-amber-400/40'
              }`}
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">سبد خرید</span>
            <span className="sm:hidden">سبد خرید</span>
            {quoteCount > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[11px] font-black rounded-full w-5 h-5 flex items-center justify-center">
                {toPersianDigits(quoteCount)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Tabs (Horizontal Scrollable Bar on Desktop/Tablet) */}
      <div className="bg-slate-950/90 border-t border-slate-800/90 px-2 sm:px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto py-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm transition cursor-pointer whitespace-nowrap font-extrabold ${activeTab === 'catalog'
              ? 'bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-md shadow-sky-950/50'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-sky-400" />
            <span>محصولات و کاتالوگ</span>
            <span className="text-[10px] bg-slate-800/90 px-2 py-0.5 rounded-md text-slate-300 font-mono">
              {toPersianDigits(productsCount)}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('finder')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm transition cursor-pointer whitespace-nowrap font-extrabold ${activeTab === 'finder'
              ? 'bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-md shadow-sky-950/50'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>قطعه‌یاب پمپ (سازگاری)</span>
          </button>

          <button
            onClick={() => setActiveTab('quote')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm transition cursor-pointer whitespace-nowrap font-extrabold ${activeTab === 'quote'
              ? 'bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-md shadow-sky-950/50'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
          >
            <ShoppingBag className="w-4 h-4 text-amber-300" />
            <span>سبد خرید</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm transition cursor-pointer whitespace-nowrap font-extrabold ${activeTab === 'orders'
              ? 'bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-md shadow-sky-950/50'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
          >
            <Package className="w-4 h-4 text-emerald-400" />
            <span>سفارشات من</span>

          </button>
          <button
            onClick={() => setActiveTab('return_requests')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm transition cursor-pointer whitespace-nowrap font-extrabold ${activeTab === 'return_requests'
              ? 'bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-md shadow-sky-950/50'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
          >
            <PackageX  className="w-4 h-4 text-emerald-400" />
            <span> درخواست های مرجوعی</span>

          </button>

          {isAuthorizing ?
            <Skeleton width={80} height={25} highlightColor='gray' containerClassName={`flex items-center gap-1.5 py-2 rounded-xl text-xs md:text-sm   cursor-pointer mr-auto `} />
            : <button
              onClick={user.isAuthenticated ? () => setIsEditProfileModalActive(true) : onOpenAuthModal}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs md:text-sm font-extrabold transition cursor-pointer whitespace-nowrap border mr-auto ${customerProfile
                ? 'bg-slate-800/90 text-sky-300 border-sky-500/40 hover:bg-slate-700'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                }`}
            >
              <User className="w-4 h-4" />
              <span>{user.isAuthenticated ? `پروفایل` : "ورود / ثبت نام"}</span>
            </button>}
        </div>
      </div>
    </header>
  );
};
