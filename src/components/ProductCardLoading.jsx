import React from 'react';
import { motion } from 'motion/react';
import {
    ShoppingBag,
    Share2,
    Eye,
    CheckCircle,
    Zap,
    Layers,
    ShieldCheck,
    Droplets,
    Tag,
    MessageSquare
} from 'lucide-react';
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'


export const ProductCardLoading = () => {

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-2xl border border-slate-200/90 hover:border-sky-400/80 hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer relative"
        >
            {/* Top Badges */}
            <div className="p-3 pb-0 flex items-center justify-between gap-2 z-10">
                <Skeleton width={50} height={30} />

                <Skeleton width={50} height={30} />
            </div>


            <div className="p-4 flex gap-4 items-start">
                <div className="w-24 h-24 rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 relative flex items-center justify-center shadow-inner">

                    <Skeleton width={"100%"} height={"100%"} />

                    {/* Quick View Hover Overlay */}
                    {/* <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="bg-white/95 text-slate-900 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <Eye className="w-3 h-3 text-sky-600" />
              جزئیات
            </span>
          </div> */}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Skeleton width={150} height={15} />
                    </div>

                    <Skeleton width={150} height={15} />

                    <Skeleton width={150} height={15} />

                </div>
            </div>

            {/* Technical Specs Pills */}
            <div className="px-4 py-2 bg-slate-50/80 group-hover:bg-sky-50/30 border-y border-slate-100 transition-colors flex flex-wrap gap-1.5 text-xs text-slate-700">
                <Skeleton width={50} height={30} />
                <Skeleton width={50} height={30} />
                <Skeleton width={50} height={30} />
                <Skeleton width={50} height={30} />
                <Skeleton width={50} height={30} />
                <Skeleton width={50} height={30} />
            </div>

            {/* Compatible Pumps Note if Spare Part */}
            {/* {product.compatiblePumpModels && product.compatiblePumpModels.length > 0 && (
                <div className="px-4 py-1.5 bg-amber-50/60 text-[11px] text-amber-900 border-b border-amber-100/80 truncate">
                    <span className="font-bold text-amber-800 ml-1">پمپ‌های سازگار:</span>
                    <span>{product.compatiblePumpModels.slice(0, 3).join(' • ')}</span>
                </div>
            )} */}

            {/* Footer Price & Add Button */}
            {/* <div className="p-4 mt-auto flex items-center justify-between gap-3 bg-white">
                <div>
                    {product.oldPriceToman && (
                        <div className="text-xs text-slate-400 line-through font-mono">
                            {formatPrice(product.oldPriceToman, storeSettings.currencyUnit)}
                        </div>
                    )}
                    <div className="text-base font-bold text-sky-900 group-hover:text-sky-600 transition-colors">
                        {formatPrice(product.priceToman, storeSettings.currencyUnit)}
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleShareWhatsApp}
                        className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200/80 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                        title="ارسال مشخصات، قیمت و لینک کاتالوگ در واتساپ"
                    >
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                        <span className="text-[11px] font-bold text-emerald-800 hidden sm:inline">واتساپ</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddToQuote(product);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${isInQuote
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-sky-600 text-white hover:bg-sky-700 hover:shadow-md hover:shadow-sky-600/20'
                            }`}
                    >
                        {isInQuote ? (
                            <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>در لیست استعلام</span>
                            </>
                        ) : (
                            <>
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>+ افزودن به استعلام</span>
                            </>
                        )}
                    </motion.button>
                </div>
            </div> */}
        </motion.div>
    );
};

