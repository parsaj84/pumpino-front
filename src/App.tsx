import React, { useState, useEffect, act, useMemo, useCallback } from 'react';
import fetchData from './utils/fetchData';
import {
  Product,
  Category,
  Brand,
  UserData,
  CartData,
  AdminContextValue
} from './types';
import {
  loadStoreSettings,
} from './utils/storage';
import { Header } from './components/Header';
import { ProductDetailModal } from './components/ProductDetailModal';

import { SparePartFinder } from './components/SparePartFinder';
import { QuoteCartModal } from './components/QuoteCartModal';
import { AdminPanel } from './components/AdminPanel';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import EditProfileModal from './components/EditProfileModal';
import { CustomerOrdersView } from './components/CustomerOrdersView';
// import { PriceUpdatesAlert } from './components/PriceUpdatesAlert(must be developed)';
// import { PrintInvoiceView } from './components/PrintInvoiceView(probably deleted)';
// import { PrintInvoiceModal } from './components/PrintInvoiceModal';
// import { SeoContentSection } from './components/SeoContentSection';
import { PwaInstallGuideModal } from './components/PwaInstallGuideModal';
import { toPersianDigits } from './utils/formatters';
import {
  SlidersHorizontal,
  Zap,
  ShoppingBag,
  User,
  Package,
  Phone,
  Map
} from 'lucide-react';
import API from '@/api/api';
import 'react-loading-skeleton/dist/skeleton.css';
import EditPhoneModal from './components/EditPhoneModal';
import CustomerReturnRequests from './components/CustomerReturnRequests';
import ErrorMessage from './components/ErrorMessage';
import SuccessMessage from './components/successMessage';
import { MainContext, MainContextValue } from './contexts/MainContext';
import AdminContext from './contexts/AdminContext';
import ProductsList from './components/ProductsList';


export default function App() {
  // Application Data States
  const [brands, setBrands] = useState<Brand[]>([]);
  const storeSettings = useMemo(() => loadStoreSettings(), [])
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isEditPhoneModalOpen, setIsEditPhoneModalOpen] = useState(false)

  // PWA Install Prompt Guide State (Auto open for first time mobile users)
  const [isPwaGuideOpen, setIsPwaGuideOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
    const dismissed = localStorage.getItem('pwa_guide_dismissed');
    return isMobile && !dismissed;
  });

  const handleClosePwaGuide = () => {
    setIsPwaGuideOpen(false);
    localStorage.setItem('pwa_guide_dismissed', 'true');
  };
  ////////////////////////////////// MY CODES BLoCK
  const [activeTab, setActiveTab] = useState<'catalog' | 'finder' | 'quote' | 'orders' | 'admin' | "return_requests">('catalog');
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState<boolean>(true)
  const [isBrandsLoading, setIsBrandsLoading] = useState<boolean>(true)
  const [user, setUser] = useState<UserData>({ isAuthenticated: false, data: null })
  const [isAuthorizing, setIsAuthorizing] = useState(true)
  const [isEditProfileModalActive, setIsEditProfileModalActive] = useState(false)
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [isCartLoading, setIsCartLoading] = useState(true)



  const authorize = useCallback(async () => {
    try {
      const response = await API.post("users/verify-token/")
      if (response.status === 200) {
        setUser({ isAuthenticated: true, data: response.data })
        setIsAuthorizing(false)
        return;
      } if (response.status === 401 && !response.data.is_valid_token) {
        setIsAuthorizing(false)
        return;
      }
    } catch (e) {
      setIsAuthorizing(false)
    }
  }, [])





  useEffect(() => {
    fetchData("products/categories/", (response) => {
      setCategories(response.data)
      setIsCategoriesLoading(false)
    }, null, () => {
      setIsErrorAlertActive(true)
      setErrorMsg("خطا در برقراری ارتباط با سرور")
      setTimeout(() => {
        setIsErrorAlertActive(true)
        setErrorMsg("خطا در برقراری ارتباط با سرور")
        setTimeout(() => {
          setIsErrorAlertActive(false)
          setErrorMsg("")
        }, 1500)
      }, 1500)
    })
    fetchData("products/brands/", (response) => {
      setBrands(response.data)
      setIsBrandsLoading(false)
    }, null, () => {
      setIsErrorAlertActive(true)
      setErrorMsg("خطا در برقراری ارتباط با سرور")
      setTimeout(() => {
        setIsErrorAlertActive(false)
        setErrorMsg("")
      }, 1500)
    })
    authorize()
    fetchData("cart/", (response) => {
      setCartData(response.data.empty_cart ? { post_price: 0, total_items_price: 0, cart_items: [] } : response.data)
      setIsCartLoading(false)
    }, null, null)
  }, [])



  useEffect(() => {
    if (activeTab !== "catalog") {
      history.replaceState({}, "", "")
    }
    history.replaceState({}, "", "/" + activeTab)
  }, [activeTab])

  /////////////////////////////////////////////////

  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [isErrorAlertActive, setIsErrorAlertActive] = useState(false)
  const [isSuccessAlertActive, setIsSuccessAlertActive] = useState(false)


  // Sync Persian font family setting with document body
  useEffect(() => {
    const f = storeSettings.fontFamily || 'vazirmatn';
    document.body.classList.remove('font-vazirmatn', 'font-shabnam', 'font-sahel');
    document.body.classList.add(`font-${f}`);
  }, [storeSettings.fontFamily]);


  // Selected Product Detail Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const cartITemsId = useMemo(() => (cartData?.cart_items?.map(i => i.product_id)), [
    cartData
  ])


  useEffect(() => {
    const body = document.querySelector("body")
    if (isEditProfileModalActive) {
      body?.classList.add("overflow-hidden")
    } else {
      body?.classList.remove("overflow-hidden")
    }
  }, [isEditProfileModalActive]);

  const userData = user.data

  const adminContextValue = useMemo<AdminContextValue>(() => ({
    setBrands: setBrands,
    setProducts: setProducts
  }), [])

  const MainContextValue = useMemo<MainContextValue>(() => {
    return {
      setErrorAlertActive: setIsErrorAlertActive,
      setSuccessAlertActive: setIsSuccessAlertActive,
      setErrorMessage: setErrorMsg,
      setSuccessMessage: setSuccessMsg,
      onError: (message) => {
        setErrorMsg(message)
        setIsErrorAlertActive(true)
        setTimeout(() => {
          setIsErrorAlertActive(false)
          setErrorMsg("")
        }, 1500);
      },
      onSuccess: (message: string = "فرایند موفقیت امیز بود") => {
        setSuccessMsg(message);
        setIsSuccessAlertActive(true)
        setTimeout(() => {
          setIsSuccessAlertActive(false)
          setSuccessMsg("")
        }, 1500);
      },
      setCartData: setCartData,
      storeSettings: storeSettings
    }

  }, [])

  return (
    <MainContext.Provider
      value={
        MainContextValue
      }
    >
      <div dir="rtl" className={`min-h-screen bg-slate-100/80 text-slate-900 font-sans flex flex-col selection:bg-sky-500 selection:text-white ${isEditProfileModalActive && "overflow-hidden"}`}>
        {/* Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isAuthorizing={isAuthorizing}
          user={user}
          isCartLoading={isCartLoading}
          setUser={setUser}
          setIsEditProfileModalActive={setIsEditProfileModalActive}
          quoteCount={cartData?.cart_items?.length || 0}
          storeSettings={storeSettings}
          products={products || []}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenPwaGuide={() => setIsPwaGuideOpen(true)}
        />

        {/* Main Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6 space-y-6 pb-24 md:pb-8">
          {activeTab === 'catalog' && (
            <ProductsList
              setErrorMsg={setErrorMsg}
              setIsErrorAlertActive={setIsErrorAlertActive}
              brands={brands}
              cartITemsId={cartITemsId}
              categories={categories}
              setProducts={setProducts}
              isBrandsLoading={isBrandsLoading}
              isCategoriesLoading={isCategoriesLoading}
              products={products}
              setSelectedProduct={setSelectedProduct}
            />
          )}
          {/* Tab 2: Spare Part Compatibility Finder */}
          {activeTab === 'finder' && (
            <SparePartFinder
              storeSettings={storeSettings}
              onViewDetails={(p) => setSelectedProduct(p)}
              setCartData={setCartData}
              cartItemsId={cartITemsId || []}
            />
          )}

          {/* Tab 3: Quote & Invoice Builder */}
          {activeTab === 'quote' && (
            <QuoteCartModal
              cartData={cartData}
              setCartData={setCartData}
              storeSettings={storeSettings}
              customerProfile={user}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}

            />
          )}

          {/* Tab 4: Customer Track Orders View */}
          {activeTab === 'orders' && (
            <CustomerOrdersView
              customerProfile={user}
              storeSettings={storeSettings}
              onEditProfile={() => user.isAuthenticated ? setIsEditProfileModalActive(true) : setIsAuthModalOpen(true)}
            />
          )}

          {/* Tab 5: admin panel*/}
          {activeTab === 'admin' && (
            <AdminContext.Provider
              value={adminContextValue}
            >
              <AdminPanel
                products={products}
                categories={categories}
                setCategories={setCategories}
                brands={brands}
                setProducts={setProducts}
                setBrands={setBrands}
                isAdminLoggedIn={(userData?.is_active && (userData?.is_admin || userData?.is_superuser || userData?.is_staff)) ? true : false}
                user={user}
                setUser={setUser}
                storeSettings={storeSettings}
                onClose={() => setActiveTab('catalog')}
                openPhoneAuthModal={() => setIsAuthModalOpen(true)}
                onOpenPrintInvoiceForOrder={() => { }}
              />
            </AdminContext.Provider>
          )}

          {activeTab === "return_requests" &&
            <CustomerReturnRequests user={user}
              setIsAuthModalOpen={setIsAuthModalOpen}
              storeSettings={storeSettings}
            />
          }

          {/* Price Updates Announcement Banner (Positioned at bottom of page) */}
          {/* <div className="pt-6 border-t border-slate-200/80">
            <PriceUpdatesAlert
              products={products}
              priceLogs={priceLogs}
              storeSettings={storeSettings}
              onViewDetails={(p) => setSelectedProduct(p)}
              isInQuote={(id) => cartITemsId?.includes(id)}
            />
          </div> */}
        </main>
        {/* edit profile modal  */}
        {(isEditProfileModalActive && user.isAuthenticated) &&
          <EditProfileModal setIsEditPhoneModalOpen={setIsEditPhoneModalOpen} setUser={setUser} userData={userData} setIsActive={setIsEditProfileModalActive} />}
        {(isEditPhoneModalOpen && user.isAuthenticated) &&
          <EditPhoneModal setIsActive={setIsEditPhoneModalOpen} setUser={setUser} userData={userData} />}
        {/* Customer Registration/Auth Modal */}
        {isAuthModalOpen && (
          <CustomerAuthModal
            setUser={setUser}

            onClose={() => setIsAuthModalOpen(false)}
          />
        )}

        {/* Product Detail Modal */}
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            isInQuote={cartITemsId?.includes(selectedProduct.pk.toString()) ? true : false}
            storeSettings={storeSettings}
            brand={selectedProduct.brand || null}

            setCartData={setCartData}
          />
        )}



        {/* Hidden Printable A4 Sheet Fallback View (maybe deleted) */}
        {/* {printableCustomer && (
          <PrintInvoiceView
            cartData={cartData}
            customerInfo={user}
            storeSettings={storeSettings}
          />
        )} */}

        {/* {selectedOrderForPrint && (
          <PrintInvoiceView
            customerInfo={user}
            order={selectedOrderForPrint}
            storeSettings={storeSettings}
          />
        )} */}

        {/* Google SEO Content & Structured Data FAQ Section (must be dabated) */}
        {/* <SeoContentSection storeSettings={storeSettings} /> */}

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 print:hidden mt-12 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-right">
            <div>
              <h4 className="font-bold text-slate-200 text-sm mb-1">{storeSettings.storeName}</h4>
              <p className="font-light">{storeSettings.tagline}</p>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-2 sm:gap-4  whitespace-nowrap">
              <span
                className="flex  items-center gap-1 text-sky-300 font-bold hover:underline shrink-0"
              >
                <Phone className="w-3 h-3 text-sky-400" />
                <span>تماس: {toPersianDigits(`02133953098 | 02133988231`)}</span>
              </span>
              <span
                className="flex items-center gap-1 text-sky-300 font-bold hover:underline shrink-0"
              >
                <Map className="w-3 h-3 text-sky-400" />
                <span>ادرس: تهران سعدی جنوبی پاساژ رضاپور همکف پلاک 23</span>
              </span>
            </div>
          </div>
        </footer>

        {/* Mobile Fixed Bottom Navigation Bar (iPhone & Touch Native Style) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/90 px-2 py-1 mb-safe shadow-2xl flex items-center justify-around text-[10px] font-bold text-slate-400 print:hidden">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition cursor-pointer ${activeTab === 'catalog' ? 'text-sky-400 font-black' : 'hover:text-slate-200'
              }`}
          >
            <SlidersHorizontal className="w-5 h-5 mb-0.5" />
            <span>کاتالوگ</span>
          </button>

          <button
            onClick={() => setActiveTab('finder')}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition cursor-pointer ${activeTab === 'finder' ? 'text-amber-400 font-black' : 'hover:text-slate-200'
              }`}
          >
            <Zap className="w-5 h-5 mb-0.5 text-amber-400" />
            <span>قطعه‌یاب</span>
          </button>

          <button
            onClick={() => setActiveTab('quote')}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition relative cursor-pointer ${activeTab === 'quote' ? 'text-amber-400 font-black' : 'hover:text-slate-200'
              }`}
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 mb-0.5" />
              {cartData && cartData?.cart_items?.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[10px] font-extrabold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                  {toPersianDigits(cartData?.cart_items?.length || 0)}
                </span>
              )}
            </div>
            <span>سبد خرید</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition relative cursor-pointer ${activeTab === 'orders' ? 'text-emerald-400 font-black' : 'hover:text-slate-200'
              }`}
          >
            <Package className="w-5 h-5 mb-0.5" />
            <span>سفارشات</span>
          </button>

          <button
            onClick={() => {
              if (user.isAuthenticated) {
                setIsEditProfileModalActive(true)
              } else {
                setIsAuthModalOpen(true)
              }
            }}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition cursor-pointer ${user.isAuthenticated ? 'text-sky-400 font-black' : 'hover:text-slate-200'
              }`}
          >
            <User className="w-5 h-5 mb-0.5 text-sky-400" />
            <span>{'پروفایل'}</span>
          </button>
        </nav>

        {/* error message alert */}
        <ErrorMessage
          message={errorMsg}
          isActive={isErrorAlertActive}
        />


        <SuccessMessage
          message={successMsg}
          isActive={isSuccessAlertActive} />

        {/* PWA Install Guide Modal */}
        <PwaInstallGuideModal
          isOpen={isPwaGuideOpen}
          onClose={handleClosePwaGuide}
          storeName="پمپینو"
        />
      </div>
    </MainContext.Provider>
  );
}
