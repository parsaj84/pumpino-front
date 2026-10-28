import React, { useState } from 'react';
import { 
  BellRing, 
  TrendingDown, 
  Clock, 
  X, 
  ShoppingBag, 
  Eye, 
  Sparkles,
} from 'lucide-react';
import { Product, PriceUpdateLog, StoreSettings } from '../types';
import { formatPrice, toPersianDigits } from '../utils/formatters';

interface PriceUpdatesAlertProps {
  products: Product[];
  priceLogs: PriceUpdateLog[];
  storeSettings: StoreSettings;
  onViewDetails: (product: Product) => void;
  onAddToQuote: (product: Product) => void;
  isInQuote: (productId: string) => boolean;
}

export const PriceUpdatesAlert: React.FC<PriceUpdatesAlertProps> = ({
  products,
  priceLogs,
  storeSettings,
  onViewDetails,
  onAddToQuote,
  isInQuote
}) => {
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Find products with price changes (either oldPriceToman defined or in priceLogs)
  const updatedProducts = products?.filter(p => 
    (p?.oldPriceToman && p?.oldPriceToman !== p?.priceToman) || 
    priceLogs.some(log => log.productId === p?.id)
  );

  if (updatedProducts?.length === 0 && priceLogs.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-indigo-500/10 border border-amber-300/60 rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-3 relative overflow-hidden transition-all">
      {/* Glow Effect Accent */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex items-center justify-between gap-2 border-b border-amber-200/60 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-sm animate-pulse">
            <BellRing className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">
                اعلان تغییرات اخیر قیمت‌ها و تخفیفات ویژه
              </h3>
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                {toPersianDigits(updatedProducts?.length)} کالا
              </span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium">
              آخرین به روزرسانی قیمت کاتالوگ: <span className="font-bold text-slate-800">{storeSettings.lastUpdatedDate}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="text-xs bg-white hover:bg-slate-50 text-slate-800 font-bold border border-slate-300 px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">تاریخچه تغییرات قیمت</span>
            <span className="sm:hidden">تاریخچه</span>
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-xs text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-200/50 cursor-pointer"
            title={isCollapsed ? 'نمایش لیست' : 'بستن اعلانات'}
          >
            {isCollapsed ? 'نمایش' : 'بستن'}
          </button>
        </div>
      </div>

      {/* Horizontal Cards Scroller (visible if not collapsed) */}
      {!isCollapsed && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin pt-1">
          {updatedProducts?.map(product => {
            const hasDiscount = product.oldPriceToman && product.oldPriceToman > product.priceToman;
            const diffAmount = product.oldPriceToman ? Math.abs(product.oldPriceToman - product.priceToman) : 0;
            const percentChange = product.oldPriceToman ? Math.round((diffAmount / product.oldPriceToman) * 100) : 0;
            const inCart = isInQuote(product.id);

            return (
              <div
                key={product.id}
                className="min-w-[240px] sm:min-w-[270px] max-w-[280px] bg-white rounded-xl border border-slate-200 p-3 shadow-xs space-y-2 flex flex-col justify-between hover:shadow-md transition group shrink-0"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                      {product.sku}
                    </span>
                    {hasDiscount ? (
                      <span className="bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        <span>{toPersianDigits(percentChange)}٪ کاهش قیمت</span>
                      </span>
                    ) : (
                      <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>بروزرسانی جدید</span>
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 line-clamp-1 group-hover:text-sky-600 transition">
                    {product.titleFarsi}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono">مدل: {product.model}</p>

                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between">
                    <div>
                      {product.oldPriceToman && product.oldPriceToman !== product.priceToman && (
                        <div className="text-[10px] text-slate-400 line-through font-mono">
                          {formatPrice(product.oldPriceToman, storeSettings.currencyUnit)}
                        </div>
                      )}
                      <div className="text-xs font-black text-slate-900 font-mono">
                        {formatPrice(product.priceToman, storeSettings.currencyUnit)}
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 font-medium">
                      قیمت بروز شده
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    onClick={() => onViewDetails(product)}
                    className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>جزئیات</span>
                  </button>

                  <button
                    onClick={() => onAddToQuote(product)}
                    className={`flex-1 py-1.5 px-2 font-bold text-[11px] rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                      inCart
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{inCart ? 'در فاکتور' : 'افزودن'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Price Change History Modal */}
      {isHistoryModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
          onClick={() => setIsHistoryModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 relative my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    تاریخچه و آرشیو تغییرات قیمت محصولات
                  </h3>
                  <p className="text-xs text-slate-500">
                    لیست کلیه تغییرات قیمت اعمال شده توسط مدیریت سیستم
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {priceLogs.length > 0 ? (
                priceLogs.map(log => {
                  const isDecrease = log.newPrice < log.oldPrice;
                  const diff = Math.abs(log.newPrice - log.oldPrice);

                  return (
                    <div
                      key={log.id}
                      className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900">
                          {log.productTitle}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                          <span>تاریخ بروزرسانی: {log.date}</span>
                          <span>•</span>
                          <span>توسط: {log.updatedBy}</span>
                        </div>
                      </div>

                      <div className="text-left shrink-0">
                        <div className="text-slate-400 line-through font-mono text-[11px]">
                          {formatPrice(log.oldPrice, storeSettings.currencyUnit)}
                        </div>
                        <div className={`font-black font-mono text-sm ${isDecrease ? 'text-emerald-700' : 'text-slate-900'}`}>
                          {formatPrice(log.newPrice, storeSettings.currencyUnit)}
                        </div>
                        <div className={`text-[10px] font-bold ${isDecrease ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {isDecrease ? `▼ ${formatPrice(diff, storeSettings.currencyUnit)} کاهش` : `▲ ${formatPrice(diff, storeSettings.currencyUnit)} تغییر`}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs">
                  هیچ سابقه تغییر قیمتی تاکنون ثبت نشده است.
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
