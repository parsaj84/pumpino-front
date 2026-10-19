import React, { useState } from 'react';
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
  MessageSquare,
  X
} from 'lucide-react';
import { formatPrice, getStockBadge, toPersianDigits, generateWhatsAppShareUrl } from '../utils/formatters';
import { Product } from '../types';
import Spinner from './Spinner';
import API from '@/api/api';


export const ProductCard = ({
  product,
  brandName,
  categoryName,
  storeSettings,
  onViewDetails,
  isInQuote,
  setCartData,
  cartData
}) => {

  const [isTogglingCartStatus, setIsTogglingCartStatus] = useState(false)

  async function handleAddToQuote() {
    try {
      setIsTogglingCartStatus(true);
      const { data, status } = await API.post("cart/add-to-cart/", { product_id: product.pk });
      if (status === 200) {
        setCartData(prev => ({ total_items_price: data.cart_total_price, post_price: data.post_price, cart_items: [...prev.cart_items, data.cart_item] }))
      } else {
        const e = data.error_des
        console.log(e)
      }
      setIsTogglingCartStatus(false)
    } catch (e) {
      console.log(e)
      setIsTogglingCartStatus(false)
    }
  }
  async function handleRmoveFromCart() {
    try {
      setIsTogglingCartStatus(true)
      const { status, data } = await API.post("cart/remove-cart-item/", { product_id: product.pk })
      if (status === 200 && data.success) {
        setCartData(prev => ({ total_items_price: data.cart_total_price, post_price: data.post_price, cart_items: [...prev.cart_items].filter(ele => !(ele.product_id === product.pk.toString())) }))
      } else {

      }
      setIsTogglingCartStatus(false)
    } catch (e) {
      console.log(e)
      setIsTogglingCartStatus(false)
    }
  }

  const stockBadge = getStockBadge(product.inventory > 0 ? true : false, product.inventory);

  const handleShareWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = generateWhatsAppShareUrl(product, storeSettings);
    window.open(url, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onViewDetails(product)}
      className="bg-white rounded-2xl border border-slate-200/90 hover:border-sky-400/80 hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer relative"
    >
      {/* Top Badges */}
      <div className="p-3 pb-0 flex items-center justify-between gap-2 z-10">
        <span className="text-[11px] font-semibold text-slate-600 bg-slate-100/80 group-hover:bg-sky-50 group-hover:text-sky-800 px-2.5 py-1 rounded-full border border-slate-200/80 group-hover:border-sky-200/80 transition-colors duration-200 flex items-center gap-1">
          <Tag className="w-3 h-3 text-slate-400 group-hover:text-sky-500 transition-colors" />
          {product.technical_model}
        </span>

        <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-transform duration-200 ${stockBadge.colorClass}`}>
          {stockBadge.label}
        </span>
      </div>

      {/* Image & Main Info Header */}
      <div className="p-4 flex gap-4 items-start">
        <div className="w-24 h-24 rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 relative flex items-center justify-center shadow-inner">
          <img
            src={product.files[0]?.image}
            alt={product.files[0]?.alt_name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
            loading="lazy"

          />
          {/* {product.isFeatured && (
            <span className="absolute top-1.5 right-1.5 bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
              ویژه
            </span>
          )}
           */}
          {/* Quick View Hover Overlay */}
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="bg-white/95 text-slate-900 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <Eye className="w-3 h-3 text-sky-600" />
              جزئیات
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200/80 group-hover:bg-sky-100 transition-colors">
              {brandName}
            </span>
            {categoryName && (
              <span className="text-[11px] text-slate-500 truncate">
                {categoryName}
              </span>
            )}
          </div>

          <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2 leading-snug">
            {product.title}
          </h3>

          <p className="text-xs font-mono text-slate-500 mt-1 font-semibold">
            مدل: <span className="text-slate-800 group-hover:text-sky-950">{product.technical_model}</span>
          </p>
        </div>
      </div>

      {/* Technical Specs Pills */}
      <div className="px-4 py-2 bg-slate-50/80 group-hover:bg-sky-50/30 border-y border-slate-100 transition-colors flex flex-wrap gap-1.5 text-xs text-slate-700">
        {product.features?.map(feature => (<span className="bg-white px-2 py-1 rounded border border-slate-200/90 font-medium shadow-2xs">
          {feature.feature_name}: {feature.feature_value} اسب
        </span>))}


      </div>

      {/* Compatible Pumps Note if Spare Part */}
      {product.compatiblePumpModels && product.compatiblePumpModels.length > 0 && (
        <div className="px-4 py-1.5 bg-amber-50/60 text-[11px] text-amber-900 border-b border-amber-100/80 truncate">
          <span className="font-bold text-amber-800 ml-1">پمپ‌های سازگار:</span>
          <span>{product.compatiblePumpModels.slice(0, 3).join(' • ')}</span>
        </div>
      )}

      {/* Footer Price & Add Button */}
      <div className="p-4 mt-auto flex items-center justify-between gap-3 bg-white">
        <div>
          {product.off ? (
            <>
              <div className="line-through text-xs text-slate-400 line-through font-mono">
                {formatPrice(product.price, storeSettings.currencyUnit)}
              </div>
              <div className="text-base font-bold text-sky-900 group-hover:text-sky-600 transition-colors">
                {formatPrice(product.price * ((100 - product.off) / 100), storeSettings.currencyUnit)}
              </div></>
          ) :
            <div className="text-base font-bold text-sky-900 group-hover:text-sky-600 transition-colors">
              {formatPrice(product.price, storeSettings.currencyUnit)}
            </div>
          }
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
              if (!product.inventory || isTogglingCartStatus) {
                return;
              }

              if (!isInQuote) {
                handleAddToQuote()
              } else {
                handleRmoveFromCart()
              }
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${isInQuote
              ? 'bg-red-600 text-white hover:bg-emerald-700'
              : 'bg-sky-600 text-white hover:bg-sky-700 hover:shadow-md hover:shadow-sky-600/20'
              }`}
          >
            {!product.inventory ? <span>ناموجود</span> : isTogglingCartStatus ? <Spinner width={20} height={20} borderMainColor={"white"} borderTopColor={isInQuote ? "red" : "blue"} borderWidth={2} /> : isInQuote ? (
              <>
                <X className="w-3.5 h-3.5" />
                <span>حذف از سبد خرید</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>افزودن به سبد خرید</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

