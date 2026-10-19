import React, { useState } from 'react';
import { 
  Filter, 
  RotateCcw, 
  Check, 
  Layers, 
  Tag, 
  Zap, 
  CheckCircle2, 
  Droplets,
  Disc,
  CircleDot,
  Cylinder,
  Sliders,
  BatteryCharging,
  Circle,
  Shield,
  Waves,
  RotateCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Category, Brand, FilterState } from '../types';
import { toPersianDigits } from '../utils/formatters';

interface FiltersSidebarProps {
  categories: Category[];
  brands: Brand[];
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  totalMatchingItems: number;
  onResetFilters: () => void;
}

export const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
  categories,
  brands,
  filterState,
  setFilterState,
  totalMatchingItems,
  onResetFilters
}) => {
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Droplets': return <Droplets className="w-4 h-4 text-sky-600" />;
      case 'Zap': return <Zap className="w-4 h-4 text-amber-500" />;
      case 'Layers': return <Layers className="w-4 h-4 text-indigo-600" />;
      case 'Waves': return <Waves className="w-4 h-4 text-cyan-600" />;
      case 'RotateCw': return <RotateCw className="w-4 h-4 text-emerald-600" />;
      case 'Disc': return <Disc className="w-4 h-4 text-amber-600" />;
      case 'CircleDot': return <CircleDot className="w-4 h-4 text-blue-600" />;
      case 'Cylinder': return <Cylinder className="w-4 h-4 text-purple-600" />;
      case 'Sliders': return <Sliders className="w-4 h-4 text-teal-600" />;
      case 'BatteryCharging': return <BatteryCharging className="w-4 h-4 text-yellow-600" />;
      case 'Circle': return <Circle className="w-4 h-4 text-slate-600" />;
      case 'Shield': return <Shield className="w-4 h-4 text-rose-600" />;
      default: return <Tag className="w-4 h-4 text-slate-500" />;
    }
  };

  const pumpCategories = categories.filter(c => !c.isSparePart);
  const spareCategories = categories.filter(c => c.isSparePart);

  return (
    <aside className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Mobile Accordion Toggle Header */}
      <div 
        onClick={() => setIsMobileExpanded(!isMobileExpanded)}
        className="lg:hidden p-3.5 bg-slate-900 text-white flex items-center justify-between cursor-pointer font-bold text-xs"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-sky-400" />
          <span>فیلترها و دسته‌بندی‌های کالا</span>
          <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[11px] px-2 py-0.5 rounded-full font-normal">
            {toPersianDigits(totalMatchingItems)} کالا
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-300">
          <span>{isMobileExpanded ? 'بستن' : 'تغییر فیلتر'}</span>
          {isMobileExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Filters Content (Always visible on Desktop lg:, collapsible on mobile) */}
      <div className={`p-4 space-y-5 ${isMobileExpanded ? 'block' : 'hidden lg:block'}`}>
        {/* Sidebar Header (Desktop) */}
        <div className="hidden lg:flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
            <Filter className="w-4 h-4 text-sky-600" />
            <span>فیلترهای جستجو</span>
          </div>

          <button
            onClick={onResetFilters}
            className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-medium cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>حذف فیلترها</span>
          </button>
        </div>

      {/* Stock Filter Toggle */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            فقط کالاهای موجود در انبار
          </span>
          <input
            type="checkbox"
            checked={filterState.stockOnly}
            onChange={(e) => setFilterState(prev => ({ ...prev, stockOnly: e.target.checked }))}
            className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
          />
        </label>
      </div>

      {/* Sort By */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 block">
          مرتب‌سازی بر اساس:
        </label>
        <select
          value={filterState.sortBy}
          onChange={(e) => setFilterState(prev => ({ ...prev, sortBy: e.target.value as any }))}
          className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
        >
          <option value="featured">پیش‌فرض (محصولات ویژه و پرفروش)</option>
          <option value="updated_desc">جدیدترین قیمت‌های بروز شده</option>
          <option value="price_asc">ارزان‌ترین قیمت به گران‌ترین</option>
          <option value="price_desc">گران‌ترین قیمت به ارزان‌ترین</option>
          <option value="name_asc">حروف الفبا (نام کالا)</option>
        </select>
      </div>

      {/* Categories Accordion/Tabs */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-800 block">
          دسته‌بندی اصلی:
        </label>

        <button
          onClick={() => setFilterState(prev => ({ ...prev, categoryId: 'all' }))}
          className={`w-full text-right text-xs font-medium px-3 py-2 rounded-xl transition flex items-center justify-between cursor-pointer ${
            filterState.categoryId === 'all'
              ? 'bg-sky-600 text-white font-bold shadow-sm'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <span>همه کالاها و قطعات</span>
          {filterState.categoryId === 'all' && <Check className="w-4 h-4" />}
        </button>

        {/* Pump Types Group */}
        <div className="space-y-1 pt-1">
          <span className="text-[11px] font-bold text-slate-400 block px-1">
            🚰 انواع پمپ‌های آب
          </span>
          {pumpCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterState(prev => ({ ...prev, categoryId: cat.id }))}
              className={`w-full text-right text-xs px-3 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                filterState.categoryId === cat.id
                  ? 'bg-sky-100 text-sky-900 font-bold border border-sky-300'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {getCategoryIcon(cat.iconName)}
              <span className="truncate">{cat.nameFarsi}</span>
            </button>
          ))}
        </div>

        {/* Spare Parts Group */}
        <div className="space-y-1 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded inline-block">
            🔧 قطعات یدکی و جانبی
          </span>
          {spareCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterState(prev => ({ ...prev, categoryId: cat.id }))}
              className={`w-full text-right text-xs px-3 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                filterState.categoryId === cat.id
                  ? 'bg-amber-100 text-amber-950 font-bold border border-amber-300'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {getCategoryIcon(cat.iconName)}
              <span className="truncate">{cat.nameFarsi}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Brands Selector */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-800 block">
          برند و سازنده:
        </label>
        <select
          value={filterState.brandId}
          onChange={(e) => setFilterState(prev => ({ ...prev, brandId: e.target.value }))}
          className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
        >
          <option value="all">همه برندها (ایتالیایی، ایرانی، چینی)</option>
          {brands.map(b => (
            <option key={b.id} value={b.id}>
              {b.nameFarsi} ({b.nameEnglish}) - {b.country}
            </option>
          ))}
        </select>
      </div>

      {/* Horsepower Filter (If Pump Category) */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-800 block">
          توان پمپ (اسب بخار HP):
        </label>
        <select
          value={filterState.powerHpFilter}
          onChange={(e) => setFilterState(prev => ({ ...prev, powerHpFilter: e.target.value }))}
          className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
        >
          <option value="all">همه توان‌ها</option>
          <option value="0.5">۰.۵ اسب (نیم اسب)</option>
          <option value="1">۱ اسب بخار</option>
          <option value="1.5">۱.۵ اسب بخار</option>
          <option value="2">۲ اسب بخار</option>
          <option value="3">۳ اسب بخار به بالا</option>
        </select>
      </div>

      {/* Total Matching Banner */}
      <div className="bg-sky-50 p-3 rounded-xl border border-sky-200 text-center text-xs text-sky-900 font-medium">
        تعداد کالاهای پیدا شده: <span className="font-bold text-sky-700 text-sm">{toPersianDigits(totalMatchingItems)}</span> کالا
      </div>
      </div>
    </aside>
  );
};
