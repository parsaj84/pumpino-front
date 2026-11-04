import { Dispatch, SetStateAction, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShoppingBag,
  Share2,
  CheckCircle2,
  MessageSquare,
  Info,
  Wrench,
} from 'lucide-react';
import { Product, StoreSettings, Category, Brand, CartData } from '../types';
import { formatPrice, getStockBadge, toPersianDigits, generateWhatsAppShareUrl, generateTelegramShareUrl } from '../utils/formatters';
import API from '@/api/api';
import Spinner from './Spinner';
import { MainContext } from '../contexts/MainContext';


interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  isInQuote: boolean;
  storeSettings: StoreSettings;
  brand?: Brand | null;
  setCartData: Dispatch<SetStateAction<CartData | null>>
  categories?: Category[]
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  isInQuote,
  storeSettings,
  brand,

  setCartData
}) => {

  const mainContextValue = useContext(MainContext)

  const [isTogglingCartStatus, setIsTogglingCartStatus] = useState(false)

  async function handleAddToQuote() {
    try {
      setIsTogglingCartStatus(true);
      const { data, status } = await API.post("cart/add-to-cart/", { product_id: product?.pk.toString() || "" });
      if (status === 200) {
        setCartData(prev => ({ total_items_price: data.cart_total_price, post_price: data.post_price, cart_items: [...(prev?.cart_items || []), data.cart_item] }))
      } else {
        mainContextValue?.onError("خطا هنگام حذف از سبد خرید")

      }
      setIsTogglingCartStatus(false)
    } catch (e) {
      mainContextValue?.onError("خطا هنگام حذف از سبد خرید")

      setIsTogglingCartStatus(false)
    }
  }
  async function handleRmoveFromCart() {
    try {
      setIsTogglingCartStatus(true)
      const { status, data } = await API.post("cart/remove-cart-item/", { product_id: product?.pk || "" })
      if (status === 200 && data.success) {
        setCartData(prev => ({ total_items_price: data.cart_total_price, post_price: data.post_price, cart_items: [...(prev?.cart_items || [])].filter(ele => !(ele.product_id === product?.pk.toString())) }))
      } else {
        mainContextValue?.onError("خطا در هنگام حذف از سبد خرید")
      }
      setIsTogglingCartStatus(false)
    } catch (e) {
      mainContextValue?.onError("خطا در هنگام حذف از سبد خرید")
      setIsTogglingCartStatus(false)
    }
  }

  const files = product?.files
  const firstFile = files && files.length > 0 && files[0]

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200/90 relative max-h-[92vh] sm:max-h-[90vh] flex flex-col mb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-sky-500/20 text-sky-300 px-2.5 py-1 rounded-full border border-sky-500/30 font-mono">
                  {product.title}
                </span>
                <span className="text-xs text-slate-400">
                  {product.categories?.map(ele => ele.name).join(",")}
                </span>
              </div>

              <motion.button
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Main Info Box */}
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="w-full sm:w-48 h-48 bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative shadow-sm group"
                >
                  <img
                    src={firstFile ? firstFile.image : ""}
                    alt={firstFile ? firstFile.alt_name : "پمپینو | مرجع فروش پمپ و ابزارالات"}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </motion.div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-sky-800 bg-sky-100 px-3 py-1 rounded-full border border-sky-200">
                      برند: {brand?.name} {`(${brand?.country})`}
                    </span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStockBadge(product.inventory > 0 ? true : false, product.inventory).colorClass}`}>
                      {getStockBadge(product.inventory > 0 ? true : false, product.inventory).label}
                    </span>
                  </div>

                  <h2 className="text-lg md:text-xl font-black text-slate-900 leading-snug">
                    {product.title}
                  </h2>

                  <p className="text-sm font-mono text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/90">
                    مدل فنی / پارت نامبر: <span className="font-bold text-slate-900">{product.technical_model}</span>
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-baseline gap-2">
                    <span className="text-xs text-slate-500">قیمت فروش:</span>
                    <span className="text-xl font-black text-sky-900">
                      {formatPrice(product.price * ((100 - (Number(product.off) || 0)) / 100), storeSettings.currencyUnit)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Technical Specifications Datasheet */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90 space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-sky-600" />
                  <span>مشخصات فنی و استانداردهای ساخت</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  {product.features && product.features.length > 0 && product.features.map(feature => (
                    <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                      <span className="text-slate-500 block">{feature.feature_name} :</span>
                      <span className="font-bold text-slate-800">{toPersianDigits(feature.feature_value)}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Compatible Pump Models */}
              {product.compatible_pomps && product.compatible_pomps?.length > 0 && (
                <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200 space-y-2">
                  <h3 className="text-sm font-extrabold text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>لیست پمپ‌ها و مدل‌های سازگار با این قطعه:</span>
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {product.compatible_pomps.map((pomp, idx) => (
                      <span key={idx} className="bg-white text-emerald-900 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                        ✓ {pomp.technical_model} | {pomp.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div className="space-y-1.5 text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                  <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-sky-600" />
                    <span>توضیحات و نکات نصب:</span>
                  </h4>
                  <p>{product.description}</p>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="bg-slate-100 p-4 border-t border-slate-200 flex flex-wrap items-center justify-end gap-3">
           
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  if (isTogglingCartStatus || !product.inventory) {
                    return;
                  }
                  if (!isInQuote) {
                    handleAddToQuote()
                    return;
                  }
                  handleRmoveFromCart()

                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-md ${isInQuote
                  ? 'bg-red-700 text-white hover:bg-emerald-800'
                  : 'bg-sky-500 text-slate-950 hover:bg-amber-400'
                  }`}
              >
                {isTogglingCartStatus ? <Spinner width={20} height={20} borderMainColor={"white"} borderTopColor={isInQuote ? "red" : "blue"} borderWidth={2} /> : isInQuote ? (
                  <>
                    <X className="w-4 h-4" />
                    <span>حذف از سبد خرید</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>افزودن به سبد خرید</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

