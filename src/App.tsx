import React, { useState, useEffect, act } from 'react';
import fetchData from './utils/fetchData';
import {
  Product,
  Category,
  Brand,
  StoreSettings,
  QuoteItem,
  FilterState,
  CustomerInfo,
  PriceUpdateLog,
  CustomerProfile,
  CustomerOrder
} from './types';
import {
  loadProducts,
  saveProducts,
  loadCategories,
  saveCategories,
  loadBrands,
  saveBrands,
  loadStoreSettings,
  saveStoreSettings,
  loadPriceLogs,
  savePriceLogs,
  loadCustomerProfile,
  saveCustomerProfile,
  loadCustomerOrders,
  saveCustomerOrders,
  fetchOnlineData
} from './utils/storage';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { FiltersSidebar } from './components/FiltersSidebar';
import { SparePartFinder } from './components/SparePartFinder';
import { QuoteCartModal } from './components/QuoteCartModal';
import { AdminPanel } from './components/AdminPanel';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import EditProfileModal from './components/EditProfileModal';
import { CustomerOrdersView } from './components/CustomerOrdersView';
import { PriceUpdatesAlert } from './components/PriceUpdatesAlert';
import { PrintInvoiceView } from './components/PrintInvoiceView';
import { PrintInvoiceModal } from './components/PrintInvoiceModal';
import { SeoContentSection } from './components/SeoContentSection';
import { PwaInstallGuideModal } from './components/PwaInstallGuideModal';
import { toPersianDigits } from './utils/formatters';
import { playNewOrderChime } from './utils/audioAlert';
import {
  Wrench,
  Sparkles,
  CheckCircle2,
  SlidersHorizontal,
  Zap,
  ShoppingBag,
  RotateCcw,
  Info,
  Package,
  Lock,
  User,
  Search,
  X,
  Tag
} from 'lucide-react';
import API from '@/api/api';

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { ProductCardLoading } from './components/ProductCardLoading';
import { data, filter, pre } from 'motion/react-client';
import { json } from 'stream/consumers';
import { response } from 'express';
import PaginationContainer from './components/Pagintation';
import EditPhoneModal from './components/EditPhoneModal';
import CustomerReturnRequests from './components/CustomerReturnRequests';

export default function App() {
  // Application Data States

  const [brands, setBrands] = useState<Brand[]>(() => loadBrands());
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => loadStoreSettings());
  const [priceLogs, setPriceLogs] = useState<PriceUpdateLog[]>(() => loadPriceLogs());


  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(() => loadCustomerProfile());
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
  const [searchQuery, setSearchQuery] = useState(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState<boolean>(true)
  const [isBrandsLoading, setIsBrandsLoading] = useState<boolean>(true)
  const [paginationState, setPaginationState] = useState(null)
  const [productsCount, setProductsCount] = useState(0)
  const [user, setUser] = useState({ isAuthenticated: false, data: {} })
  const [isAuthorizing, setIsAuthorizing] = useState(true)
  const [isEditProfileModalActive, setIsEditProfileModalActive] = useState(false)
  const [cartData, setCartData] = useState({});
  const [isCartLoading, setIsCartLoading] = useState(true)

  function compileFilterStateFromURL(): FilterState {
    const params = new URLSearchParams(location.search)

    return {
      categoryId: params.get('categoryId') ?? 'all',
      brandId: params.get('brandId') ?? 'all',
      stockOnly: params.get('stockOnly') === 'true',
      minPrice: Number(params.get('minPrice') ?? 0),
      maxPrice: Number(params.get('maxPrice') ?? 50000000),
      sortBy: params.get('sortBy') ?? 'featured',
      powerHpFilter: params.get('powerHpFilter') ?? 'all',
      compatiblePumpQuery: params.get('compatiblePumpQuery') ?? ''
    }
  }

  const [filterState, setFilterState] = useState<FilterState>(() => compileFilterStateFromURL());

  async function authorize() {
    try {
      const response = await API.post("users/verify-token/")
      if (response.status === 200) {
        console.log(response.data)
        setUser({ isAuthenticated: true, data: response.data })
        setIsAuthorizing(false)
        return;
      } if (response.status === 401 && !response.data.is_valid_token) {
        setIsAuthorizing(false)
        return;
      }
    } catch (e) {
      console.log(e)
      setIsAuthorizing(false)
    }
  }


  useEffect(() => {
    const urlParams = new URLSearchParams(filterState)
    urlParams.set("searchQuery", searchQuery || "")
    fetchData("products/" + "?" + urlParams.toString(), (response) => {
      setProducts(response.data.products)
      setPaginationState({
        nextPage: response.data.next_page,
        previousePage: response.data.previous_page,
        numPages: response.data.num_pages
      })
      setProductsCount(response.data.all_objs_count)
      setIsLoading(false)
      history.replaceState({}, "", "?" + urlParams.toString())
    }, () => { setIsLoading(true) });
  }, [filterState])
  useEffect(() => {
    fetchData("products/categories/", (response) => {
      setCategories(response.data)
      setIsCategoriesLoading(false)
    })
    fetchData("products/brands/", (response) => {
      setBrands(response.data)
      setIsBrandsLoading(false)
    })
    authorize()
    fetchData("cart/", (response) => {
      console.log("cart ", response.data.empty_cart ? [] : response.data)
      setCartData(response.data.empty_cart ? { post_price: 0, total_items_price: 0, cart_items: [] } : response.data)
      setIsCartLoading(false)
    })
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery === null) {
        return;
      }


      const urlSearchParams = new URLSearchParams(filterState)
      urlSearchParams.set("searchQuery", searchQuery || "")
      fetchData("products/" + "?" + urlSearchParams.toString(), (response) => {
        setProducts(response.data.products)
        setPaginationState({
          nextPage: response.data.next_page,
          previousePage: response.data.previous_page,
          numPages: response.data.num_pages
        })
        setProductsCount(response.data.all_objs_count)
        setIsLoading(false)
        history.replaceState({}, "", "?" + urlSearchParams.toString())
      }, () => {
        setIsLoading(true)
      })

    }, 500)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  useEffect(() => {
    let searchParams = null
    if (activeTab !== "catalog") {
      history.replaceState({}, "", "")
    }
    else {
      searchParams = new URLSearchParams(filterState)
      searchParams.set("searchQuery", searchQuery || "")
    }
    const searchParamsString = searchParams && !location.search && location.pathname ? "/?" + searchParams?.toString() : ""
    console.log(searchParams, activeTab)
    history.replaceState({}, "", "/" + activeTab + searchParamsString)
  }, [activeTab])

  /////////////////////////////////////////////////




  // Sync Persian font family setting with document body
  useEffect(() => {
    const f = storeSettings.fontFamily || 'vazirmatn';
    document.body.classList.remove('font-vazirmatn', 'font-shabnam', 'font-sahel');
    document.body.classList.add(`font-${f}`);
  }, [storeSettings.fontFamily]);

  // Navigation & UI States



  // Selected Product Detail Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);




  // Print Invoice Trigger State
  const [printableCustomer, setPrintableCustomer] = useState<CustomerInfo | null>(null);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<CustomerOrder | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);




  // Submit new customer order to admin
  const handleSubmitNewOrder = (newOrder: CustomerOrder) => {
    setOrders(prev => [newOrder, ...prev]);
    setSelectedOrderForPrint(newOrder);
    setPrintableCustomer(null);
    setIsInvoiceModalOpen(true);
    setActiveTab('orders');

    // Trigger Sound Alert Chime if enabled
    if (storeSettings.printerSettings?.soundAlertEnabled !== false) {
      playNewOrderChime();
    }

    // Trigger Auto-Print if enabled
    if (storeSettings.printerSettings?.autoPrintEnabled !== false) {
      const printers = storeSettings.printerSettings?.printers || [];
      const hasActiveAutoPrinter = printers.some(p => p.enabled && (p.isDefault || p.autoPrintNewOrders));

      if (hasActiveAutoPrinter) {
        setTimeout(() => {
          window.print();
        }, 800);
      }
    }
  };

  const handleOpenPrintInvoiceForOrder = (order: CustomerOrder) => {
    setSelectedOrderForPrint(order);
    setPrintableCustomer(null);
    setIsInvoiceModalOpen(true);
  };

  // Keep search query synced with header


  // Add / Toggle quote item


  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterState({
      categoryId: 'all',
      brandId: 'all',
      stockOnly: false,
      minPrice: 0,
      maxPrice: 50000000,
      sortBy: 'featured',
      powerHpFilter: 'all',
      compatiblePumpQuery: ''
    });
  };

  // Filter & Sort Products
  //MDL


  const cartITemsId = cartData?.cart_items?.map(i => i.product_id);
  console.log(cartITemsId, "item ids")

  const handleOpenPrintInvoice = (customer: CustomerInfo) => {
    setPrintableCustomer(customer);
    setSelectedOrderForPrint(null);
    setIsInvoiceModalOpen(true);
  };

  useEffect(() => {
    const body = document.querySelector("body")
    if (isEditProfileModalActive) {
      body?.classList.add("overflow-hidden")
    } else {
      body?.classList.remove("overflow-hidden")
    }
  }, [isEditProfileModalActive]);

  const userData = user.data

  return (
    <div dir="rtl" className={`min-h-screen bg-slate-100/80 text-slate-900 font-sans flex flex-col selection:bg-sky-500 selection:text-white ${isEditProfileModalActive && "overflow-hidden"}`}>
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isAuthorizing={isAuthorizing}
        user={user}

        setUser={setUser}
        setIsEditProfileModalActive={setIsEditProfileModalActive}
        quoteCount={cartData?.cart_items?.length}
        customerProfile={customerProfile}
        storeSettings={storeSettings}
        products={products}
        openAdminLoginModal={() => {
          setActiveTab('admin');
        }}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenPwaGuide={() => setIsPwaGuideOpen(true)}
        productsCount={productsCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6 space-y-6 pb-24 md:pb-8">
        {activeTab === 'catalog' && (
          <>
            <div className="space-y-4 w-full">
              {/* Product Catalog Grid */}
              <div className="space-y-4">
                {/* Category Header Banner if Category Filtered */}
                {/* Category Header Banner if Category Filtered */}
                {(filterState.categoryId !== 'all' || filterState.brandId !== "all") && (
                  <div className="bg-sky-900 text-white p-4 rounded-2xl flex items-center justify-between border border-sky-800">
                    <div>
                      <h2 className="text-base font-bold">
                        {categories?.find(c => c.id === filterState.categoryId)?.nameFarsi}
                      </h2>
                      <p className="text-xs text-sky-200 mt-0.5">
                        {categories?.find(c => c.id === filterState.categoryId)?.description}
                      </p>
                    </div>
                    <button
                      onClick={() => setFilterState(prev => ({ ...prev, categoryId: 'all', brandId: "all" }))}
                      className="text-xs bg-sky-800 hover:bg-sky-700 text-white px-3 py-1.5 rounded-xl cursor-pointer"
                    >
                      نمایش همه
                    </button>
                  </div>
                )}

                {/* Accessible High-Contrast Search Box & Quick Chips */}
                <div className="bg-gradient-to-r from-sky-50 to-cyan-50 border-2 border-sky-400 rounded-3xl p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-sky-950">
                      <Search className="w-4 h-4 text-sky-600" />
                      <span>جستجوی سریع کالاها، برندها و کد قطعات پمپینو:</span>
                    </div>
                    <span className="text-xs font-mono font-bold bg-sky-700 text-white px-2.5 py-0.5 rounded-xl">
                      {toPersianDigits(productsCount)} کالا
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="جستجوی پمپ، مدل (مثلاً PM45 یا CAM100)، برند (پنتاکس...) یا کد قطعه..."
                      className="w-full bg-white text-slate-900 placeholder-slate-400 text-sm font-extrabold rounded-2xl py-3 pr-10 pl-10 border-2 border-sky-300 focus:border-sky-600 focus:ring-4 focus:ring-sky-100 shadow-sm transition outline-none"
                    />
                    <Search className="w-5 h-5 text-sky-600 absolute right-3 top-3.5 pointer-events-none" />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute left-3 top-3 p-1 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition cursor-pointer"
                        title="پاک کردن جستجو"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Quick Search Tag Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                    <span className="text-slate-500 font-bold ml-1 flex items-center gap-1 text-[11px]">
                      <Tag className="w-3.5 h-3.5 text-sky-600" />
                      دسته بندی ها:
                    </span>
                    {isCategoriesLoading ? Array(10).fill({}).map(ele => <Skeleton width={50} height={20} />) : categories?.map((category, idx) => (

                      <button
                        key={idx}
                        onClick={() => setFilterState(prev => {
                          const output = { ...prev }
                          output.categoryId = category.pk
                          console.log("debuging filter", filterState, category.pk)
                          return output
                        })}
                        className={`px-2.5 py-1 rounded-xl font-bold transition cursor-pointer text-[11px] border ${Number(filterState.categoryId) === Number(category.pk)
                          ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-sky-400 hover:text-sky-700'
                          }`}
                      >
                        ⚡ {category.name}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                    <span className="text-slate-500 font-bold ml-1 flex items-center gap-1 text-[11px]">
                      <Tag className="w-3.5 h-3.5 text-sky-600" />
                      برندها
                    </span>
                    {isBrandsLoading ? Array(10).fill({}).map(ele => <Skeleton width={50} height={20} />) : brands?.map((brand, idx) => (
                      <button
                        key={idx}
                        onClick={() => setFilterState(prev => {
                          const output = { ...prev, brandId: brand.pk }
                          return output
                        })}
                        className={`px-2.5 py-1 rounded-xl font-bold transition cursor-pointer text-[11px] border ${Number(filterState.brandId) === Number(brand.pk)
                          ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-sky-400 hover:text-sky-700'
                          }`}
                      >
                        ⚡ {brand.name}
                      </button>
                    ))}
                  </div>

                </div>

                {/* Products Grid Container */}
                {isLoading ? (<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4'>
                  {Array(6).fill({}).map(ele => <ProductCardLoading />)}
                </div>) : products?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products?.map(product => {
                      const categoriesString = product.categories.map(ele => ele.name).join(",")
                      return (
                        <ProductCard
                          key={product.pk}
                          product={product}
                          brandName={product.brand?.name}
                          categoryName={categoriesString}
                          storeSettings={storeSettings}
                          onViewDetails={(p) => setSelectedProduct(p)}
                          setCartData={setCartData}
                          cartData={cartData}
                          isInQuote={cartITemsId?.includes(product?.pk?.toString())}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
                    <Info className="w-12 h-12 text-slate-300 mx-auto" />
                    <h3 className="text-base font-bold text-slate-800">
                      هیچ محصول یا قطعه‌ای با مشخصات انتخابی شما پیدا نشد!
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      عبارت جستجو یا فاکتورهای فیلتر را تغییر دهید یا دکمه حذف فیلترها را بزنید.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 cursor-pointer"
                    >
                      بازنشانی همه فیلترها
                    </button>
                  </div>
                )}
              </div>
            </div>
            {isLoading || <PaginationContainer productsCount={productsCount} setFilterState={setFilterState} pageNums={paginationState?.numPages} nextPage={paginationState?.nextPage} prevPage={paginationState?.previousePage} />}</>
        )}
        {/* Tab 2: Spare Part Compatibility Finder */}
        {activeTab === 'finder' && (
          <SparePartFinder

            storeSettings={storeSettings}
            onViewDetails={(p) => setSelectedProduct(p)}

            cartITemsId={cartITemsId}
          />
        )}

        {/* Tab 3: Quote & Invoice Builder */}
        {activeTab === 'quote' && (
          <QuoteCartModal
            cartData={cartData}
            setCartData={setCartData}
            storeSettings={storeSettings}
            customerProfile={user}
            setCustomerProfile={setUser}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onSubmitOrder={handleSubmitNewOrder}
            onClose={() => setActiveTab('catalog')}
            onOpenPrintInvoice={handleOpenPrintInvoice}
          />
        )}

        {/* Tab 4: Customer Track Orders View */}
        {activeTab === 'orders' && (
          <CustomerOrdersView

            customerProfile={user}
            storeSettings={storeSettings}
            onOpenPrintInvoice={handleOpenPrintInvoiceForOrder}
            onEditProfile={() => user.isAuthenticated ? setIsEditProfileModalActive(true) : setIsAuthModalOpen(true)}
            onUpdateOrders={(updated) => setOrders(updated)}
            onClose={() => setActiveTab('catalog')}
          />
        )}

        {/* Tab 5: admin panel*/}
        {activeTab === 'admin' && (
          <AdminPanel
            products={products}
            categories={categories}
            setCategories={setCategories}
            brands={brands}
            setProducts={setProducts}
            setBrands={setBrands}
            isAdminLoggedIn={userData?.is_active && (userData?.is_admin || userData?.is_superuser || userData?.is_staff)}
            user={user}
            setUser={setUser}
            storeSettings={storeSettings}
            onOpenPrintInvoice={handleOpenPrintInvoiceForOrder}
            onEditProfile={() => user.isAuthenticated ? setIsEditProfileModalActive(true) : setIsAuthModalOpen(true)}
            onUpdateOrders={(updated) => setOrders(updated)}
            onClose={() => setActiveTab('catalog')}
            openPhoneAuthModal={() => setIsAuthModalOpen(true)}

          />
        )}

        {activeTab === "return_requests" &&
          <CustomerReturnRequests user={user}
            setIsAuthModalOpen={setIsAuthModalOpen}
            storeSettings={storeSettings}
          />
        }

        {/* Price Updates Announcement Banner (Positioned at bottom of page) */}
        <div className="pt-6 border-t border-slate-200/80">
          <PriceUpdatesAlert
            products={products}
            priceLogs={priceLogs}
            storeSettings={storeSettings}
            onViewDetails={(p) => setSelectedProduct(p)}
            isInQuote={(id) => cartITemsId?.includes(id)}
          />
        </div>
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
          onSaveProfile={(prof) => {
            setCustomerProfile(prof);
            setIsAuthModalOpen(false);
          }}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          isInQuote={cartITemsId?.includes(selectedProduct.pk.toString())}
          storeSettings={storeSettings}
          categories={categories}
          brand={selectedProduct.brand}
          cartData={cartData}
          setCartData={setCartData}
        />
      )}

      {/* Interactive Printable A4 Invoice Modal */}
      <PrintInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        order={selectedOrderForPrint}
        customerInfo={user}
        cartData={cartData}
        storeSettings={storeSettings}
      />

      {/* Hidden Printable A4 Sheet Fallback View */}
      {printableCustomer && (
        <PrintInvoiceView
          cartData={cartData}
          customerInfo={user}
          storeSettings={storeSettings}
        />
      )}

      {selectedOrderForPrint && (
        <PrintInvoiceView
          customerInfo={user}
          order={selectedOrderForPrint}
          storeSettings={storeSettings}
        />
      )}

      {/* Google SEO Content & Structured Data FAQ Section */}
      <SeoContentSection storeSettings={storeSettings} />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 print:hidden mt-12 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-right">
          <div>
            <h4 className="font-bold text-slate-200 text-sm mb-1">{storeSettings.storeName}</h4>
            <p className="font-light">{storeSettings.tagline}</p>
          </div>

          <div className="text-slate-500">
            تلفن فروش: {toPersianDigits(storeSettings.phoneNumber)} - {toPersianDigits(storeSettings.mobileNumber)} | آدرس: {storeSettings.address}
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
            {cartData?.cart_items?.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[10px] font-extrabold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                {toPersianDigits(cartData.length)}
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

      {/* PWA Install Guide Modal */}
      <PwaInstallGuideModal
        isOpen={isPwaGuideOpen}
        onClose={handleClosePwaGuide}
        storeName="پمپینو"
      />
    </div>
  );
}
