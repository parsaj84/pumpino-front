import React, { useState, useEffect, useRef, useCallback, useDeferredValue, useEffectEvent, useMemo, Dispatch, SetStateAction, useContext } from 'react';
import {
  Lock,
  Save,
  Plus,
  Trash2,
  Edit3,
  Upload,
  Percent,
  Store,
  CheckCircle2,
  AlertCircle,
  Layers,
  Wrench,
  Search,
  Package,
  FileText,
  Sparkles,
  CreditCard,
  Receipt,
  CircleDollarSign,
  AlertTriangle,
  FilePlus,
  Download,
  Zap,
  ArrowRight,
  ShieldCheck,
  PackageX
} from 'lucide-react';
import { AccountingModule } from './AccountingModule';
import { LowStockAlerts } from './LowStockAlerts';
import { CreateManualInvoiceModal } from './CreateManualInvoiceModal';
import { SmsSettingsPanel } from './SmsSettingsPanel';
import { PrinterSettingsPanel } from './PrinterSettingsPanel';
import { PaymentSettingsPanel } from './PaymentSettingsPanel';
import { CustomerTransactionsPanel } from './CustomerTransactionsPanel';
import { Product, Category, Brand, StoreSettings, PriceUpdateLog, CategoryId, CustomerOrder, OrderStatus, SeoSettings, SeoFaqItem, SeoCardItem, OrderMessage, BankAccountItem, AdminUser, AdminPermission, AdminSubTab, User, UserData } from '../types';
import { INITIAL_SEO_SETTINGS } from '../data/initialData';
import { toPersianDigits } from '../utils/formatters';
import API from '@/api/api';
import Spinner from './Spinner';
import fetchData from '../utils/fetchData';
import Skeleton from 'react-loading-skeleton';
import PaginationContainer from './Pagintation';
import OrderAdminContainer from './OrderAdminContainer';
import ProductSubmitAdminModal from './ProductSubmitAdminModal';
import BrandSubmitModal from './BrandSubmitModal';
import CategorySubmitModal from './CategorySubmitModal';
import QuickAdminPriceChange from './QuickAdminPriceChange';
import BulkPercent from './BulkPercent';
import ExcelProductImport from './ExcelProductImport';
import AdminReturnRequest from './AdminReturnRequest';
import AdminStaffUsersManage from './AdminStaffUsersManage';
import { MainContext } from '../contexts/MainContext';
import CategoriesBrandsManage from './CategoriesMange';


interface AdminPanelProps {
  products: Product[] | null;
  setProducts: React.Dispatch<React.SetStateAction<Product[] | null>>;
  categories: Category[] | null;
  setCategories: React.Dispatch<React.SetStateAction<Category[] | null>>;
  brands: Brand[];
  setBrands: React.Dispatch<React.SetStateAction<Brand[]>>;
  storeSettings: StoreSettings;
  isAdminLoggedIn: boolean;
  onOpenPrintInvoiceForOrder: (order: CustomerOrder) => void;
  setUser: Dispatch<SetStateAction<UserData>>;
  user: UserData;
  openPhoneAuthModal: () => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  products,
  setProducts,
  categories,
  setCategories,
  brands,
  setBrands,
  storeSettings,
  isAdminLoggedIn,
  onOpenPrintInvoiceForOrder,
  openPhoneAuthModal,
  setUser,
  user,

}) => {
  const mainContextValue = useContext(MainContext)

  // const [orderAccordionHeight, setOrderAccordionHeight] = useState()
  const [pinInput, setPinInput] = useState('');
  const [userName, setUserName] = useState("")
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggiingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [orderSearchQuery, setOrderSearchQuery] = useState("")
  const deferedSearchQuery = useDeferredValue(orderSearchQuery)
  const [isFetchingOrders, setIsFetchingOrders] = useState(true)
  const [orderFilterPayload, setOrderFilterPayload] = useState<{
    search?: string;
    order_status?: string
  }>({})
  const [orderPaginationState, setOrderPaginationState] = useState({
    pageNums: [],
    prevPage: null,
    nextPage: null
  })
  const [editingOrderPK, setEditingOrderPk] = useState(null)



  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setOrderFilterPayload(prev => ({ ...prev, search: deferedSearchQuery }))
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [deferedSearchQuery])

  const [activeAdminSubTab, setActiveAdminSubTab] = useState<AdminSubTab>('main_dashboard');

  //effects
  useEffect(() => {
    if (activeAdminSubTab === "orders_manage") {
      fetchData("orders/orders-list/", ({ data, status }) => {
        if (status === 200) {
          setOrders(data.orders)
          setOrderPaginationState({
            prevPage: data.prev_page,
            nextPage: data.next_page,
            pageNums: data.page_nums
          })
        } else {
          const e = data.error_des || data.detail || "خطا"
          mainContextValue?.onError(e)
        }
        setIsFetchingOrders(false)
      }, () => setIsFetchingOrders(true), () => mainContextValue?.onError("خطای غیرمنتظره"));
    }
  }, [activeAdminSubTab])

  useEffect(() => {
    const searchParams = new URLSearchParams(orderFilterPayload)
    fetchData(`orders/orders-list/?${searchParams.toString()}`, ({ data, status }) => {
      if (status === 200) {
        setOrders(data.orders)
        setOrderPaginationState({
          prevPage: data.prev_page,
          nextPage: data.next_page,
          pageNums: data.page_nums
        })
      } else {
        const e = data.error_des || data.detail || "خطا"
        mainContextValue?.onError(e)
      }
      setIsFetchingOrders(false)
    }, () => setIsFetchingOrders(true), () => mainContextValue?.onError("خطایی غیرمنتظه رخ داد"))
  }, [orderFilterPayload])

  // Admin Multi-user & Role Permissions State
  const ALL_ADMIN_PERMISSIONS: { id: AdminPermission; title: string; desc: string }[] = [
    { id: 'orders_manage', title: 'مدیریت سفارشات و فاکتورها', desc: 'بررسی سفارشات خرید، ویرایش اقلام، صدور فاکتور و وضعیت ارسال' },
    { id: 'quick_prices', title: 'تغییر قیمت و موجودی روزانه', desc: 'ویرایش مستقیم قیمت، موجودی انبار و وضعیت کالاها در جدول سریع' },
    { id: 'add_product', title: 'تعریف کالا و کاتالوگ محصولات', desc: 'افزودن محصول جدید، ویرایش کد کالا، تصاویر و مشخصات فنی' },
    { id: 'customer_transactions', title: 'ثبت واریزی‌ها و دفتر کل مشتریان', desc: 'ثبت دریافت/پرداخت، آپلود فیش بانکی، چک صیادی و سوابق مشتریان' },
    { id: 'accounting', title: 'حسابداری و تراز سود و زیان', desc: 'مشاهده سود خالص، فروش روزانه/ماهانه، فاکتورهای رسمی و تراز مالی' },
    { id: 'admin_users', title: 'مدیریت مدیران و سطح دسترسی', desc: 'تعریف مدیر جدید، تغییر رمزهای عبور، تعیین دسترسی‌ها و مدیریت حساب‌ها' },
    { id: 'gateways', title: 'تنظیمات درگاه‌های پرداخت', desc: 'مدیریت مرچنت‌کدها، زیبال، زرین‌پال و تنظیمات پرداخت آنلاین' },
    { id: 'settings', title: 'تنظیمات عمومی و کارت بانکی', desc: 'تغییر شماره کارت، تلفن پشتیبانی، آدرس فروشگاه و پین اصلی' },
    { id: 'categories_manage', title: 'مدیریت دسته‌بندی‌ها و برندها', desc: 'افزودن و ویرایش برندها، دسته‌ها و قطعات یدکی' },
    { id: 'sms', title: 'سامانه پیامک و اطلاع‌رسانی', desc: 'تنظیمات الگوی SMS و ارسال پیامک خودکار به خریداران' },
    { id: 'printers', title: 'تنظیمات چاپگرها و فاکتور', desc: 'اتصال پرینتر حرارتی ۸۰ میلی‌متری و چاپ خودکار فاکتور' },
    { id: 'excel_import', title: 'ورودی/خروجی فایل اکسل', desc: 'خروجی گرفتن از تمام کالاها و آپدیت گروهی قیمت‌ها از اکسل' },
    { id: 'seo', title: 'تنظیمات سئو و گوگل Search Console', desc: 'ویرایش کلیدواژه‌ها، متاتگ‌ها و اسکیماهای Google' },
  ];





  const [currentAdminUser, setCurrentAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('pumpino_current_admin');
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return null;
  });





  const hasPermission = (perm: AdminPermission): boolean => {
    if (!isAdminLoggedIn) return false;
    if (!currentAdminUser) return true;
    if (currentAdminUser.role === 'super_admin') return true;
    return currentAdminUser.permissions.includes(perm);
  };

  // Ref for auto-focusing default tile "مدیریت سفارشات"
  const firstTileRef = useRef<HTMLButtonElement>(null);

  // Auto focus first tile when entering main dashboard
  useEffect(() => {
    if (activeAdminSubTab === 'main_dashboard' && isAdminLoggedIn) {
      const timer = setTimeout(() => {
        firstTileRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeAdminSubTab, isAdminLoggedIn]);



  // Keyboard Navigation Support (Escape to return to main dashboard)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keypress when typing in text fields or selects
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      if (e.key === 'Escape') {
        if (activeAdminSubTab !== 'main_dashboard') {
          setActiveAdminSubTab('main_dashboard');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeAdminSubTab]);


  // Quick Category Modal State
  const [isQuickCategoryModalOpen, setIsQuickCategoryModalOpen] = useState(false);

  // Quick Brand Modal State
  const [isQuickBrandModalOpen, setIsQuickBrandModalOpen] = useState(false);



  const handleSaveSettingsSubmit = () => {

  }






















  // Modal editing product
  const [editingProduct, setEditingProduct] = useState<Product | null | {}>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);







  // Manual Invoice Creation Modal State
  const [isManualInvoiceModalOpen, setIsManualInvoiceModalOpen] = useState(false);

  // Bulk percentage state
  const [bulkPercentVal, setBulkPercentVal] = useState<number>(5);
  const [bulkBrandTarget, setBulkBrandTarget] = useState<string>('all');

  // Store & Bank & SEO settings state
  const [tempStoreSettings, setTempStoreSettings] = useState<StoreSettings>(() => ({
    ...storeSettings,
    seoSettings: storeSettings.seoSettings || INITIAL_SEO_SETTINGS
  }));

  // Sync tempStoreSettings with parent storeSettings prop when updated
  useEffect(() => {
    setTempStoreSettings({
      ...storeSettings,
      seoSettings: storeSettings.seoSettings || INITIAL_SEO_SETTINGS
    });
  }, [storeSettings]);

  // Notification
  const [successMsg, setSuccessMsg] = useState('');

  // Bank Accounts Management Helpers (Supports up to 30 Bank Accounts)
  const getBankAccounts = (): BankAccountItem[] => {
    if (tempStoreSettings.bankAccounts && tempStoreSettings.bankAccounts.length > 0) {
      return tempStoreSettings.bankAccounts;
    }
    if (tempStoreSettings.bankName || tempStoreSettings.bankCardNumber) {
      return [
        {
          id: 'bank-default-1',
          bankName: tempStoreSettings.bankName || 'بانک ملی ایران',
          cardNumber: tempStoreSettings.bankCardNumber || '',
          accountNumber: tempStoreSettings.bankAccountNumber || '',
          iban: tempStoreSettings.bankIbanNumber || '',
          ownerName: tempStoreSettings.bankOwnerName || tempStoreSettings.storeName || 'صاحب حساب',
          isDefault: true
        }
      ];
    }
    return [
      {
        id: `bank-${Date.now()}`,
        bankName: 'بانک ملی ایران',
        cardNumber: '',
        accountNumber: '',
        iban: '',
        ownerName: tempStoreSettings.storeName || 'صاحب حساب',
        isDefault: true
      }
    ];
  };

  const handleAddBankAccount = () => {
    const current = getBankAccounts();
    if (current.length >= 30) {
      alert('حداکثر امکان اضافه کردن ۳۰ حساب بانکی وجود دارد.');
      return;
    }
    const newAccount: BankAccountItem = {
      id: `bank-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      bankName: 'بانک جدید',
      cardNumber: '',
      accountNumber: '',
      iban: '',
      ownerName: tempStoreSettings.storeName || 'نام صاحب حساب',
      isDefault: current.length === 0
    };
    const updated = [...current, newAccount];
    setTempStoreSettings(prev => ({
      ...prev,
      bankAccounts: updated,
      bankName: updated[0]?.bankName,
      bankCardNumber: updated[0]?.cardNumber,
      bankAccountNumber: updated[0]?.accountNumber,
      bankIbanNumber: updated[0]?.iban,
      bankOwnerName: updated[0]?.ownerName
    }));
  };

  const handleUpdateBankAccount = (id: string, field: keyof BankAccountItem, value: any) => {
    const current = getBankAccounts();
    const updated = current.map(acc => acc.id === id ? { ...acc, [field]: value } : acc);
    setTempStoreSettings(prev => ({
      ...prev,
      bankAccounts: updated,
      bankName: updated[0]?.bankName,
      bankCardNumber: updated[0]?.cardNumber,
      bankAccountNumber: updated[0]?.accountNumber,
      bankIbanNumber: updated[0]?.iban,
      bankOwnerName: updated[0]?.ownerName
    }));
  };




















  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const phoneRegex = /^09\d{9}$/
      if (!userName || !pinInput || !phoneRegex.test(userName)) {
        setLoginError("لطفا اطلاعات را به درستی وارد کنید")
        return;
      }
      setIsLoggiingIn(true)
      const { data, status } = await API.post("users/admin-login/", { phone: userName, password: pinInput })
      if (status === 200 && data.success) {
        localStorage.setItem("accessToken", data.access_token)
        setUser({ isAuthenticated: true, data: data.user_data })
      } else if (status === 400) {
        setLoginError(data.error_des || "خطا غیر منتظره")
      }
      setIsLoggiingIn(false)
    } catch (e) {
      mainContextValue?.onError("خظایی رخ داد")
      setIsLoggiingIn(false)
    }
  }





  const handleAdminLogout = async () => {
    try {
      setIsLoggingOut(true)
      localStorage.removeItem("accessToken")
      const { status } = await API.post("users/logout/")
      if (status === 200) {
        setUser({ isAuthenticated: false, data: null })
      } else {
        const e = "خطا"
        mainContextValue?.onError(e)
      }
      setIsLoggingOut(false)
    } catch (e) {
      mainContextValue?.onError("خطایی رخ داد!")
      setIsLoggingOut(false)

    }
  };





  const handleAddNewProductModal = () => {

    setEditingProduct({});
    setIsProductModalOpen(true);
  };

  const bedges = useMemo(() => {
    return [
      {
        id: 'orders_manage' as const,
        title: 'مدیریت سفارشات و صدور فاکتور',

        Icon: Package,
        bgClass: 'bg-gradient-to-br from-amber-500 via-amber-500 to-amber-600 text-slate-950 border-amber-300 shadow-amber-900/20',
      },
      {
        id: 'add_product' as const,
        title: 'تعریف و ثبت کالا / قطعه جدید',
        badge: '+ ثبت آسان کالا',
        badgeBg: 'bg-emerald-950/40 text-emerald-100 font-extrabold',
        Icon: Plus,
        bgClass: 'bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-white border-emerald-300 shadow-emerald-900/20',
      },
      {
        id: 'customer_transactions' as const,
        title: 'ثبت واریزی‌ها و دفتر کل مشتریان',
        badge: 'آرشیو عکس فیش‌ها',
        badgeBg: 'bg-emerald-950/40 text-emerald-100',
        Icon: Receipt,
        bgClass: 'bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 text-white border-emerald-400 shadow-emerald-900/20',
      },
      {
        id: 'accounting' as const,
        title: 'حسابداری و تراز مالی فروشگاه',
        badge: 'گزارش سود و زیان',
        badgeBg: 'bg-sky-950/40 text-sky-100',
        Icon: CircleDollarSign,
        bgClass: 'bg-gradient-to-br from-sky-600 via-sky-600 to-blue-700 text-white border-sky-400 shadow-sky-900/20',
      },
      {
        id: 'low_stock' as const,
        title: 'هشدار کالاهای کسر موجودی',
        Icon: AlertTriangle,
        bgClass: 'bg-gradient-to-br from-rose-600 via-rose-600 to-red-700 text-white border-rose-400 shadow-rose-900/20',
      },
      {
        id: 'return_requests' as const,
        title: 'مدیریت درخواست های مرجوعی',
        Icon: PackageX,
        bgClass: 'bg-gradient-to-br from-red-600 via-orange-700 to-red-900 text-white border-red-300 shadow-purple-900/20',
      },
      {
        id: 'quick_prices' as const,
        title: 'جدول بروزرسانی سریع ',
        badge: 'ویرایش مستقیم',
        badgeBg: 'bg-indigo-950/40 text-indigo-100',
        Icon: Edit3,
        bgClass: 'bg-gradient-to-br from-indigo-600 via-indigo-600 to-indigo-800 text-white border-indigo-400 shadow-indigo-900/20',
      },
      {
        id: 'bulk_percent' as const,
        title: 'تغییر درصدی گروهی قیمت‌ها',
        badge: 'تغییر گروهی قیمت',
        badgeBg: 'bg-cyan-950/40 text-cyan-100',
        Icon: Percent,
        bgClass: 'bg-gradient-to-br from-cyan-600 via-cyan-600 to-blue-700 text-white border-cyan-400 shadow-cyan-900/20',
      },
      {
        id: 'excel_import' as const,
        title: "اپلود از روی فایل اکسل",
        badge: 'Excel / CSV',
        badgeBg: 'bg-teal-950/40 text-teal-100',
        Icon: Upload,
        bgClass: 'bg-gradient-to-br from-teal-600 via-teal-600 to-emerald-800 text-white border-teal-400 shadow-teal-900/20',
      },
      {
        id: 'categories_manage' as const,
        title: 'مدیریت دسته‌بندی‌ها و برندها',
        badge: 'برندها و دسته‌ها',
        badgeBg: 'bg-violet-950/40 text-violet-100',
        Icon: Layers,
        bgClass: 'bg-gradient-to-br from-violet-600 via-violet-600 to-purple-800 text-white border-violet-400 shadow-violet-900/20',
      },
      // {
      //   id: 'settings' as const,
      //   title: 'تنظیمات حساب بانکی و فروشگاه',
      //   badge: 'شماره کارت و پشتیبانی',
      //   badgeBg: 'bg-slate-950/50 text-slate-200',
      //   Icon: Store,
      //   bgClass: 'bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-white border-slate-600 shadow-slate-900/20',
      // },
      // {
      //   id: 'gateways' as const,
      //   title: 'تنظیمات درگاه‌های پرداخت آنلاین',
      //   badge: 'زرین‌پال / زیبال',
      //   badgeBg: 'bg-orange-950/40 text-orange-950 font-black',
      //   Icon: CreditCard,
      //   bgClass: 'bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 text-slate-950 border-orange-300 shadow-orange-900/20',
      // },
      // {
      //   id: 'seo' as const,
      //   title: 'مدیریت سئو و گوگل (SEO)',
      //   badge: 'Search Console',
      //   badgeBg: 'bg-emerald-950/50 text-emerald-100',
      //   Icon: Search,
      //   bgClass: 'bg-gradient-to-br from-emerald-700 via-emerald-800 to-slate-950 text-white border-emerald-500 shadow-emerald-900/20',
      // },
      // {
      //   id: 'sms' as const,
      //   title: 'تنظیمات سامانه پیامک (SMS)',
      //   badge: 'کاوه‌نگار / ملی‌پیامک',
      //   badgeBg: 'bg-fuchsia-950/40 text-fuchsia-100',
      //   Icon: Smartphone,
      //   bgClass: 'bg-gradient-to-br from-fuchsia-600 via-fuchsia-700 to-purple-900 text-white border-fuchsia-400 shadow-fuchsia-900/20',
      // },
      // {
      //   id: 'printers' as const,
      //   title: 'اتصال و تنظیمات چاپگرها (Printers)',
      //   badge: 'چاپگر A4 / فیش',
      //   badgeBg: 'bg-blue-950/40 text-blue-100',
      //   Icon: Printer,
      //   bgClass: 'bg-gradient-to-br from-blue-600 via-blue-700 to-sky-900 text-white border-blue-400 shadow-blue-900/20',
      // },
      {
        id: 'admin_users' as const,
        title: "مدیریت ادمین ها",
        Icon: ShieldCheck,
        bgClass: 'bg-gradient-to-br from-purple-600 via-indigo-700 to-purple-900 text-white border-purple-300 shadow-purple-900/20',
      },
    ].filter(bedge => {
      const isSuperUserAllowed = bedge.id === "admin_users" || bedge.id === "accounting"
      if (isSuperUserAllowed && !user.data?.is_superuser) {
        return false
      }
      return true
    })
  }, [user])











  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6 text-center">
        <div className="w-16 h-16 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900">ورود به پنل مدیریت روزانه قیمت‌ها</h2>
          <p className="text-xs text-slate-500 mt-1">
            جهت ویرایش سریع قیمت‌ها، موجودی و افزودن کالا رمز مدیریت را وارد کنید.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="نام کاربری(شماره تلفن)"
              className="w-full text-center text-lg font-mono tracking-widest p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="رمز عبور مدیر"
              className="w-full text-center text-lg font-mono tracking-widest p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {loginError && (
            <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2 rounded-lg border border-rose-200">
              {loginError}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-3 flex items-center justify-center rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition shadow-md cursor-pointer"
          >

            {isLoggingIn ? <Spinner width={20} height={20} borderMainColor={"white"} borderWidth={3} borderTopColor={"orange"} /> : "ورود به سیستم"}
          </button>
          <button
            type="button"
            onClick={openPhoneAuthModal}
            disabled={isLoggingIn}
            className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-sm transition shadow-md cursor-pointer"
          >
            ورود با شماره تلفن همراه
          </button>
        </form>
      </div>
    );
  }



  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl font-bold">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">پنل مدیریت و بروزرسانی قیمت روزانه</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              مدیریت کاتالوگ پمپ‌های آب، قطعات یدکی، تغییر قیمت‌های گروهی و تنظیمات فروشگاه
            </p>
          </div>
        </div>

        <button
          onClick={handleAdminLogout}
          disabled={isLoggingOut}
          className="text-xs flex justify-center items-center text-slate-400 hover:text-white bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 cursor-pointer"
        >
          {isLoggingOut ? <Spinner width={15} height={15} borderWidth={2.5} borderMainColor={"white"} borderTopColor={"gray"} /> : "خروج از پنل"}
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-100 text-emerald-900 p-4 rounded-2xl border border-emerald-300 font-bold text-xs flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Admin Dashboard Hub Grid when activeAdminSubTab === 'main_dashboard' */}
      {activeAdminSubTab === 'main_dashboard' ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Welcome Banner / Keyboard Navigation Notice */}
          <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs px-3 py-1 rounded-full font-bold mb-2">
                  <span>⌨️ فوکوس خودکار روی نخستین کاشی فعال است | پیمایش با کلیدهای جهت‌نما (Arrow Keys) | ورود با Enter | بازگشت با Esc</span>
                </div>
                <h3 className="text-xl font-black">داشبورد و منوی اصلی خدمات مدیریت پمپینو</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualInvoiceModalOpen(true)}
                  className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-black rounded-2xl shadow transition flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-4 focus:ring-sky-400"
                >
                  <FilePlus className="w-4 h-4" />
                  <span>+ صدور فاکتور دستی</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddNewProductModal}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-2xl shadow transition flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-400"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ تعریف کالا جدید</span>
                </button>
              </div>
            </div>
          </div>

          {/* Grid of Menu Cards with Custom Color Backgrounds, Larger Fonts & Icons, and Arrow Key Support */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            onKeyDown={(e) => {
              if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                const buttons = Array.from(e.currentTarget.querySelectorAll('button')) as HTMLButtonElement[];
                const currentIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);
                if (currentIndex !== -1) {
                  e.preventDefault();
                  let nextIndex = currentIndex;
                  const cols = window.innerWidth >= 1280 ? 4 : window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;

                  if (e.key === 'ArrowLeft') nextIndex = (currentIndex + 1) % buttons.length;
                  if (e.key === 'ArrowRight') nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
                  if (e.key === 'ArrowDown') nextIndex = Math.min(currentIndex + cols, buttons.length - 1);
                  if (e.key === 'ArrowUp') nextIndex = Math.max(currentIndex - cols, 0);

                  buttons[nextIndex]?.focus();
                }
              }
            }}
          >
            {bedges.map((tile) => {
              const isAllowed = tile.id === 'low_stock' || tile.id === 'bulk_percent' || hasPermission(tile.id as AdminPermission);

              return (
                <button
                  key={tile.id}
                  ref={tile.id === 'orders_manage' ? firstTileRef : undefined}
                  type="button"
                  onClick={() => {
                    if (!isAllowed) {
                      alert(`شما دسترسی لازم برای ورود به بخش "${tile.title}" را ندارید.\nجهت دریافت دسترسی با مدیر ارشد تماس بگیرید.`);
                      return;
                    }
                    if (tile.id === 'add_product') {
                      handleAddNewProductModal();
                    } else {
                      setActiveAdminSubTab(tile.id);
                    }
                  }}
                  className={`${tile.bgClass} p-4 rounded-2xl border-2 hover:scale-[1.02] focus:scale-[1.03] focus:outline-none focus:ring-4 focus:ring-amber-300 text-right transition-all duration-200 shadow-md cursor-pointer flex flex-col justify-between min-h-[105px] group relative overflow-hidden ${!isAllowed ? 'opacity-70 saturate-50' : ''
                    }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl group-hover:scale-110 transition duration-300 flex items-center gap-1">
                      <tile.Icon className="w-6 h-6" />
                      {!isAllowed && <Lock className="w-3.5 h-3.5 text-amber-300" />}
                    </div>

                    <span className={`${tile.badgeBg} ${tile.isPulse ? 'animate-pulse' : ''} text-[11px] font-black px-2.5 py-0.5 rounded-full font-mono shadow-xs`}>
                      {tile.badge}
                    </span>
                  </div>

                  <div className="mt-2.5">
                    <h4 className="text-sm sm:text-base font-black tracking-tight leading-snug">
                      {tile.title}
                    </h4>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Active SubTab Header with Prominent Back to Dashboard Button */
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white p-3.5 rounded-3xl shadow-sm border border-slate-800">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveAdminSubTab('main_dashboard')}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow transition flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-300"
                title="کلید Esc را فشار دهید تا به منوی اصلی بازگردید"
              >
                <ArrowRight className="w-4 h-4" />
                <span>بازگشت به منوی اصلی مدیریت (Esc)</span>
              </button>

              <div className="h-5 w-px bg-slate-700 hidden sm:block" />

              <span className="text-xs text-slate-200 font-black hidden sm:inline">
                بخش فعلی: {
                  activeAdminSubTab === 'orders_manage' ? 'مدیریت سفارشات و فاکتورها' :
                    activeAdminSubTab === 'customer_transactions' ? 'دفتر کل و فیش‌های واریزی' :
                      activeAdminSubTab === 'accounting' ? 'حسابداری و تراز مالی' :
                        activeAdminSubTab === 'low_stock' ? 'هشدار کالاهای کسر موجودی' :
                          activeAdminSubTab === 'quick_prices' ? 'جدول بروزرسانی سریع قیمت‌ها' :
                            activeAdminSubTab === 'bulk_percent' ? 'تغییر درصدی قیمت‌ها' :
                              activeAdminSubTab === 'excel_import' ? 'آپدیت از روی اکسل' :
                                activeAdminSubTab === 'categories_manage' ? 'مدیریت دسته‌بندی‌ها و برندها' :
                                  activeAdminSubTab === 'settings' ? 'تنظیمات حساب بانکی و فروشگاه' :
                                    activeAdminSubTab === 'gateways' ? 'درگاه‌های پرداخت آنلاین' :
                                      activeAdminSubTab === 'seo' ? 'مدیریت سئو' :
                                        activeAdminSubTab === 'sms' ? 'سامانه پیامک' :
                                          activeAdminSubTab === 'printers' ? 'تنظیمات چاپگرها' : 'مدیریت'
                }
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsManualInvoiceModalOpen(true)}
                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <FilePlus className="w-4 h-4" />
                <span>+ فاکتور دستی</span>
              </button>

              <button
                type="button"
                onClick={handleAddNewProductModal}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ تعریف کالا</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab 0: Orders Management & Invoice Issuance */}
      {activeAdminSubTab === 'orders_manage' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-600" />
                <span>لیست سفارش‌های دریافتی از مشتریان</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                بررسی اقلام، تعدیل قیمت و تعداد بر اساس انبار، و صدور فاکتور رسمی خریدار
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsManualInvoiceModalOpen(true)}
                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-black rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
              >
                <FilePlus className="w-4 h-4" />
                <span>+ صدور فاکتور دستی به نام مشتری</span>
              </button>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
              <button
                onClick={() => setOrderFilterPayload(prev => ({ ...prev, order_status: "" }))}
                className={`px-3 py-1.5 rounded-xl cursor-pointer ${orderFilterPayload.order_status === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                همه
              </button>
              <button
                onClick={() => setOrderFilterPayload(prev => ({ ...prev, order_status: "PENDING_BY_ADMIN" }))}
                className={`px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1 ${orderFilterPayload.order_status === 'PENDING_BY_ADMIN' ? 'bg-amber-500 text-slate-950 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <span>در انتظار بررسی</span>

              </button>
              <button
                onClick={() => setOrderFilterPayload(prev => ({ ...prev, order_status: "ACCEPTED(WAITING_FOR_PAYMENT)" }))}
                className={`px-3 py-1.5 rounded-xl cursor-pointer ${orderFilterPayload.order_status === 'ACCEPTED(WAITING_FOR_PAYMENT)' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                تایید شده(در انتظار پرداخت)
              </button>
              <button
                onClick={() => setOrderFilterPayload(prev => ({ ...prev, order_status: "PAID" }))}
                className={`px-3 py-1.5 rounded-xl cursor-pointer ${orderFilterPayload.order_status === 'PAID' ? 'bg-green-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                پرداخت شده
              </button>
              <button
                onClick={() => setOrderFilterPayload(prev => ({ ...prev, order_status: "OUT_FOR_TRANSIT" }))}
                className={`px-3 py-1.5 rounded-xl cursor-pointer ${orderFilterPayload.order_status === 'OUT_FOR_TRANSIT' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                ارسال‌شده
              </button>
              <button
                onClick={() => setOrderFilterPayload(prev => ({ ...prev, order_status: "DELIVERED" }))}
                className={`px-3 py-1.5 rounded-xl cursor-pointer ${orderFilterPayload.order_status === 'DELIVERED' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                تحویل‌شده
              </button>
              <button
                onClick={() => setOrderFilterPayload(prev => ({ ...prev, order_status: "REJECTED" }))}
                className={`px-3 py-1.5 rounded-xl cursor-pointer ${orderFilterPayload.order_status === 'REJECTED' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                لغو شده
              </button>
            </div>
            <div className="w-full p-1 flex items-center justify-center">
              <div className="rounded-3xl bg-cyan-50 border-2 border-cyan-100 w-[98%]">
                <input
                  type="text"
                  placeholder='جستجو در سفارشات با شماره سفارش،شماره خریدار و گیرنده،نام و نام خانوادگی گیرنده و...'
                  className='p-1.5 w-full focus:border-0 focus:outline-0'
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                />

              </div>
            </div>

          </div>

          {/* Orders list */}
          {isFetchingOrders ? Array(6).fill({}).map(() => (
            <div className="bg-slate-50 p-1.5 my-1.5 rounded-2xl border border-slate-200/90">
              <div className="w-full flex justify-between items-center">
                <Skeleton containerClassName='flex-1 flex justify-start' width={"50%"} className='min-h-10 ' />
                <Skeleton containerClassName='flex-1 flex justify-center ' width={"50%"} className='min-h-10 ' />
                <Skeleton containerClassName='flex-1 flex justify-end ' width={"50%"} className='min-h-10 ' />
              </div>
              <div className="w-full my-2">
                <Skeleton width={"100%"} height={40} />
              </div>
              <div className="w-full my-2">
                <Skeleton width={"100%"} height={40} />
              </div>
            </div>
          )) : (
            orders?.length === 0 ? (
              <div className="p-12 text-center space-y-2 bg-slate-50 rounded-2xl border border-slate-200">
                <Package className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">سفارشی در این بخش یافت نشد!</p>
              </div>
            ) : (
              orders
                ?.map(order => {
                  return <OrderAdminContainer user={user} editingOrderPK={editingOrderPK} order={order} setOrders={setOrders} setEditingOrderPk={setEditingOrderPk} storeSettings={storeSettings} />

                })
            )
          )}

          {!isFetchingOrders && <PaginationContainer productsCount={orders.length} nextPage={orderPaginationState.nextPage} prevPage={orderPaginationState.prevPage} pageNums={orderPaginationState.pageNums} setFilterState={setOrderFilterPayload} />}
        </div>

      )}

      {/* Sub Tab: Accounting Module */}
      {activeAdminSubTab === 'accounting' && (
        <AccountingModule
          orders={orders}
          storeSettings={storeSettings}
          onUpdateOrders={setOrders}
        />
      )}

      {/* Sub Tab: Low Stock Alerts & Inventory Replenishment */}
      {activeAdminSubTab === 'low_stock' && (
        <LowStockAlerts


          brands={brands}
          storeSettings={storeSettings}

        />
      )}

      {/* Sub Tab 1: Quick Prices Table */}
      {activeAdminSubTab === 'quick_prices' && (
        <QuickAdminPriceChange setIsQuickBrandModalOpen={setIsQuickBrandModalOpen} setIsQuickCategoryModalOpen={setIsQuickCategoryModalOpen} storeSettings={storeSettings} brands={brands} categories={categories} />
      )}

      {/* Sub Tab 2: Bulk Percentage Adjuster */}
      {activeAdminSubTab === 'bulk_percent' && (
        <BulkPercent brands={brands} categories={categories} />
      )}

      {/* Sub Tab 3: Excel Import */}
      {activeAdminSubTab === 'excel_import' && (
        <ExcelProductImport brands={brands} categories={categories} storeSettings={storeSettings} />
      )}

      {/* return requests management */}

      {activeAdminSubTab === "return_requests" &&
        <AdminReturnRequest storeSettings={storeSettings} />
      }

      {/* Sub Tab 4: Store & Bank Settings */}
      {activeAdminSubTab === 'settings' && (
        <form onSubmit={handleSaveSettingsSubmit} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 max-w-3xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Store className="w-5 h-5 text-sky-600" />
              <span>تنظیمات فروشگاه و حساب‌های بانکی جهت اعلام واریز به مشتری</span>
            </h3>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره تغییرات</span>
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div className="bg-sky-50/60 p-4 rounded-2xl border border-sky-100 space-y-3">
              <h4 className="font-bold text-sky-950 text-sm flex items-center gap-2">
                <Store className="w-4 h-4 text-sky-600" />
                <span>مشخصات عمومی فروشگاه:</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">نام فروشگاه / بازرگانی:</label>
                  <input
                    type="text"
                    value={tempStoreSettings.storeName}
                    onChange={(e) => setTempStoreSettings({ ...tempStoreSettings, storeName: e.target.value })}
                    className="w-full bg-white p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">شعار / زیرعنوان کاتالوگ:</label>
                  <input
                    type="text"
                    value={tempStoreSettings.tagline}
                    onChange={(e) => setTempStoreSettings({ ...tempStoreSettings, tagline: e.target.value })}
                    className="w-full bg-white p-2.5 rounded-xl border border-slate-300 text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">تلفن دفتر فروشگاه (ثابت):</label>
                  <input
                    type="text"
                    value={tempStoreSettings.phoneNumber}
                    onChange={(e) => setTempStoreSettings({ ...tempStoreSettings, phoneNumber: e.target.value })}
                    className="w-full bg-white p-2.5 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">شماره همراه و واتساپ مدیر:</label>
                  <input
                    type="text"
                    value={tempStoreSettings.mobileNumber}
                    onChange={(e) => setTempStoreSettings({ ...tempStoreSettings, mobileNumber: e.target.value })}
                    className="w-full bg-white p-2.5 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">آدرس دقیق دفتر و فروشگاه:</label>
                <input
                  type="text"
                  value={tempStoreSettings.address}
                  onChange={(e) => setTempStoreSettings({ ...tempStoreSettings, address: e.target.value })}
                  className="w-full bg-white p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              {/* Typography & Persian Font Selector */}
              <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-indigo-950 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>انتخاب قلم و فونت فارسی اصلی سایت:</span>
                  </h4>
                  <span className="text-[11px] font-extrabold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full border border-indigo-200">
                    تضمین خوانایی عالی متون
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setTempStoreSettings({ ...tempStoreSettings, fontFamily: 'vazirmatn' })}
                    className={`p-3 rounded-xl border text-right transition cursor-pointer flex flex-col justify-between ${(tempStoreSettings.fontFamily || 'vazirmatn') === 'vazirmatn'
                      ? 'bg-white border-indigo-600 shadow-sm ring-2 ring-indigo-500/30'
                      : 'bg-white/60 border-slate-200 hover:bg-white'
                      }`}
                  >
                    <div>
                      <span className="font-extrabold text-xs text-slate-900 block">فونت وزیرمتن (Vazirmatn)</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">استانداردترین فونت مدرن وب فارسی</span>
                    </div>
                    <span className="text-[11px] text-indigo-600 font-bold mt-2 font-mono">نمونه: خرید پمپ آب ۱ اسب</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTempStoreSettings({ ...tempStoreSettings, fontFamily: 'shabnam' })}
                    className={`p-3 rounded-xl border text-right transition cursor-pointer flex flex-col justify-between ${tempStoreSettings.fontFamily === 'shabnam'
                      ? 'bg-white border-indigo-600 shadow-sm ring-2 ring-indigo-500/30'
                      : 'bg-white/60 border-slate-200 hover:bg-white'
                      }`}
                  >
                    <div>
                      <span className="font-extrabold text-xs text-slate-900 block">فونت شبنم (Shabnam)</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">طراحی بسیار زیبا، هندسی و شکیل</span>
                    </div>
                    <span className="text-[11px] text-indigo-600 font-bold mt-2 font-mono">نمونه: خرید پمپ آب ۱ اسب</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTempStoreSettings({ ...tempStoreSettings, fontFamily: 'sahel' })}
                    className={`p-3 rounded-xl border text-right transition cursor-pointer flex flex-col justify-between ${tempStoreSettings.fontFamily === 'sahel'
                      ? 'bg-white border-indigo-600 shadow-sm ring-2 ring-indigo-500/30'
                      : 'bg-white/60 border-slate-200 hover:bg-white'
                      }`}
                  >
                    <div>
                      <span className="font-extrabold text-xs text-slate-900 block">فونت ساحل (Sahel)</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">فونت خوانا با ارقام و اعداد کاملا فارسی</span>
                    </div>
                    <span className="text-[11px] text-indigo-600 font-bold mt-2 font-mono">نمونه: خرید پمپ آب ۱ اسب</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Multi Bank Accounts Management (Up to 30 Accounts) */}
            <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 pb-3">
                <div>
                  <h4 className="font-extrabold text-amber-950 text-sm flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber-600" />
                    <span>اطلاعات حساب‌های بانکی جهت دریافت واریزی مشتریان (تا ۳۰ حساب):</span>
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    می‌توانید تا ۳۰ کارت و حساب بانکی مختلف (بانک ملی، ملت، صادرات، تجارت و...) اضافه کنید.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                    {toPersianDigits(getBankAccounts().length)} از ۳۰ حساب
                  </span>
                  {getBankAccounts().length < 30 && (
                    <button
                      type="button"
                      onClick={handleAddBankAccount}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ افزودن حساب بانکی جدید</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Bank Accounts List */}
              <div className="space-y-4">
                {getBankAccounts().map((acc, index) => (
                  <div key={acc.id} className="bg-white p-4 rounded-xl border border-amber-200/90 shadow-xs space-y-3 relative">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-amber-500 text-slate-950 rounded-full font-mono font-extrabold flex items-center justify-center text-xs">
                          {toPersianDigits(index + 1)}
                        </span>
                        <span className="font-extrabold text-slate-900 text-xs">
                          {acc.bankName || `حساب بانکی شماره ${toPersianDigits(index + 1)}`}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {}}
                        className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-[11px] rounded-lg transition flex items-center gap-1 cursor-pointer"
                        title="حذف این حساب بانکی"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف کارت</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">نام بانک و شعبه:</label>
                        <input
                          type="text"
                          placeholder="مثلاً: بانک ملی شعبه سعدی"
                          value={acc.bankName}
                          onChange={(e) => handleUpdateBankAccount(acc.id, 'bankName', e.target.value)}
                          className="w-full bg-slate-50 p-2 rounded-xl border border-slate-300 font-bold text-slate-900 text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">نام و نام خانوادگی صاحب حساب:</label>
                        <input
                          type="text"
                          placeholder="مثلاً: بازرگانی صنعت آبرسان - حسینی"
                          value={acc.ownerName}
                          onChange={(e) => handleUpdateBankAccount(acc.id, 'ownerName', e.target.value)}
                          className="w-full bg-slate-50 p-2 rounded-xl border border-slate-300 font-bold text-slate-900 text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">شماره کارت ۱۶ رقمی (جهت کارت به کارت):</label>
                        <input
                          type="text"
                          placeholder="6037-9975-1234-5678"
                          value={acc.cardNumber}
                          onChange={(e) => handleUpdateBankAccount(acc.id, 'cardNumber', e.target.value)}
                          className="w-full bg-slate-50 p-2 rounded-xl border border-slate-300 font-mono font-bold text-sky-900 dir-ltr text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">شماره حساب:</label>
                        <input
                          type="text"
                          placeholder="0123456789001"
                          value={acc.accountNumber || ''}
                          onChange={(e) => handleUpdateBankAccount(acc.id, 'accountNumber', e.target.value)}
                          className="w-full bg-slate-50 p-2 rounded-xl border border-slate-300 font-mono text-slate-800 dir-ltr text-xs"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="font-bold text-slate-700 block mb-1">شماره شبا (IBAN):</label>
                        <input
                          type="text"
                          placeholder="IR120170000000123456789001"
                          value={acc.iban || ''}
                          onChange={(e) => handleUpdateBankAccount(acc.id, 'iban', e.target.value)}
                          className="w-full bg-slate-50 p-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 dir-ltr text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-600" />
                <span>پین رمز عبور مدیریت (جهت ورود به پنل):</span>
              </h4>
              <div>
                <input
                  type="text"
                  value={tempStoreSettings.adminPin}
                  onChange={(e) => setTempStoreSettings({ ...tempStoreSettings, adminPin: e.target.value })}
                  className="w-48 bg-white p-2.5 rounded-xl border border-slate-300 font-mono text-center font-bold text-slate-900"
                />
              </div>
            </div>

            {/* Database Backup & Live cPanel Publishing */}
            <div className="bg-gradient-to-br from-emerald-50 via-sky-50 to-indigo-50 p-5 rounded-2xl border border-emerald-200 space-y-4 shadow-sm">
              <div className="space-y-1 border-b border-emerald-200/80 pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="font-extrabold text-emerald-950 text-base flex items-center gap-2">
                    <Zap className="w-5 h-5 text-emerald-600 animate-pulse" />
                    <span>همگام‌سازی و انتشار آنلاین سریع روی هاست cPanel</span>
                  </h4>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    سیستم آنلاین فعال
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  با استفاده از قابلیت سرویس PHP متصل به هاست (<code className="font-mono bg-emerald-100/60 px-1.5 py-0.5 rounded text-emerald-900">api.php</code>)، با یک کلیک تمامی محصولات، دسته‌بندی‌ها، قیمت‌ها و تنظیمات جدید بدون نیاز به Build مجدد روی هاست ذخیره شده و تمام مشتریان بلافاصله تغییرات آنلاین را مشاهده خواهند کرد!
                </p>
              </div>

  



              {/* Step-by-step cPanel guide */}
              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 text-xs space-y-2 text-slate-800 dir-rtl text-right">
                <div className="font-extrabold text-emerald-950 flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>راهنمای استفاده از همگام‌سازی آنلاین در cPanel:</span>
                </div>
                <ol className="list-decimal list-inside text-slate-700 leading-relaxed text-[11px] space-y-1">
                  <li>مطمئن شوید فایل <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono text-emerald-900">api.php</code> همراه با پوشه <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono text-emerald-900">dist</code> روی cPanel آپلود شده است.</li>
                  <li>هر زمان در پنل مدیریت محصول، قیمت یا دسته‌بندی جدیدی اضافه کردید، دکمه سبز رنگ <strong>«ذخیره و انتشار آنی روی هاست cPanel»</strong> را بزنید.</li>
                  <li>تمام بازدیدکنندگان سایت به محض باز کردن یا رفرش سایت، کاتالوگ و قیمت‌های به‌روزرسانی‌شده آنلاین را مشاهده خواهند کرد!</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره کلیه تنظیمات فروشگاه و شماره حساب</span>
            </button>
          </div>
        </form>
      )}

      {/* Sub Tab: SEO Content & Google Search Algorithm Management */}
      {activeAdminSubTab === 'seo' && (
        <form onSubmit={() => {}} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-emerald-600" />
                <span>مدیریت کامل تنظیمات سئو، کلمات کلیدی و متون صفحه اصلی (Google SEO Panel)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                ویرایش بدون نیاز به کدنویسی برای عنوان متای گوگل، توضیحات کلیدی، کارت‌های تجهیزات، مقاله سئو و سوالات متداول (Google Rich Snippets)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {}}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 transition cursor-pointer"
              >
                بازنشانی متون سئو
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>ذخیره تغییرات سئو</span>
              </button>
            </div>
          </div>

          {/* Google Live Search Result Preview Box */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>پیش‌نمایش زنده ظاهر سایت در نتایج جستجوی گوگل (Google Live Snippet):</span>
              </span>
              <span className="text-[10px] bg-slate-800 px-2.5 py-1 rounded-full text-slate-300 font-mono">
                google.com/search
              </span>
            </div>

            <div className="bg-white text-slate-900 p-4 rounded-xl space-y-1.5 shadow-md border border-slate-200 dir-rtl text-right">
              <div className="flex items-center gap-2 text-xs text-slate-600 font-mono">
                <span className="w-4 h-4 rounded-full bg-sky-600 text-white text-[10px] flex items-center justify-center font-bold">P</span>
                <span>https://pumpino.com</span>
                <span className="text-slate-400">› main</span>
              </div>
              <h3 className="text-base font-bold text-blue-800 hover:underline cursor-pointer leading-snug line-clamp-1">
                {tempStoreSettings.seoSettings?.metaTitle || INITIAL_SEO_SETTINGS.metaTitle}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                {tempStoreSettings.seoSettings?.metaDescription || INITIAL_SEO_SETTINGS.metaDescription}
              </p>
            </div>
          </div>

          {/* Section 1: Meta Tags for Google */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 text-sky-700">
              <Sparkles className="w-4 h-4" />
              <span>۱. عنوان برگه، توضیحات متا و کلمات کلیدی (Google Meta Tags)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-700 block">
                    عنوان اصلی سایت در گوگل (Meta Title):
                  </label>
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md ${(tempStoreSettings.seoSettings?.metaTitle || '').length > 65
                    ? 'bg-rose-100 text-rose-700 font-bold'
                    : 'bg-slate-100 text-slate-600'
                    }`}>
                    {(tempStoreSettings.seoSettings?.metaTitle || '').length} / 60 کاراکتر پیشنهاد شده
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={tempStoreSettings.seoSettings?.metaTitle || ''}
                  onChange={(e) => setTempStoreSettings({
                    ...tempStoreSettings,
                    seoSettings: { ...tempStoreSettings.seoSettings, metaTitle: e.target.value }
                  })}
                  placeholder="خرید پمپ آب، لوازم یدکی پمپ، مخزن تحت فشار، تیوپ مخزن و خازن | پمپینو"
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900"
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">
                  کلمات کلیدی اصلی و واژه‌های جستجو (Keywords - با ویرگول جدا کنید):
                </label>
                <input
                  type="text"
                  value={tempStoreSettings.seoSettings?.keywords || ''}
                  onChange={(e) => setTempStoreSettings({
                    ...tempStoreSettings,
                    seoSettings: { ...tempStoreSettings.seoSettings, keywords: e.target.value }
                  })}
                  placeholder="پمپ آب, لوازم یدکی پمپ آب, سیل مکانیکی, پروانه پمپ, مخزن تحت فشار, تیوپ مخزن, خازن پمپ..."
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 dir-rtl"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-700 block">
                    توضیحات خلاصه برای نتایج گوگل (Meta Description):
                  </label>
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md ${(tempStoreSettings.seoSettings?.metaDescription || '').length > 160
                    ? 'bg-rose-100 text-rose-700 font-bold'
                    : 'bg-slate-100 text-slate-600'
                    }`}>
                    {(tempStoreSettings.seoSettings?.metaDescription || '').length} / 160 کاراکتر پیشنهاد شده
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={tempStoreSettings.seoSettings?.metaDescription || ''}
                  onChange={(e) => setTempStoreSettings({
                    ...tempStoreSettings,
                    seoSettings: { ...tempStoreSettings.seoSettings, metaDescription: e.target.value }
                  })}
                  placeholder="مرجع تخصصی خرید آنلاین و استعلام قیمت پمپ آب خانگی و صنعتی، قطعات یدکی پمپ..."
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 leading-relaxed text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Main SEO Heading & Subtitle */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 text-sky-700">
              <FileText className="w-4 h-4" />
              <span>۲. تیترها و متون بالای بخش سئو صفحه اصلی</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  نشان فوقانی بالای تیتر (Main Badge):
                </label>
                <input
                  type="text"
                  value={tempStoreSettings.seoSettings?.mainBadge || ''}
                  onChange={(e) => setTempStoreSettings({
                    ...tempStoreSettings,
                    seoSettings: { ...tempStoreSettings.seoSettings, mainBadge: e.target.value }
                  })}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  تیتر اصلی بخش سئو (H2 Heading):
                </label>
                <input
                  type="text"
                  value={tempStoreSettings.seoSettings?.mainHeading || ''}
                  onChange={(e) => setTempStoreSettings({
                    ...tempStoreSettings,
                    seoSettings: { ...tempStoreSettings.seoSettings, mainHeading: e.target.value }
                  })}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 font-black"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  توضیحات جامع زیر تیتر:
                </label>
                <textarea
                  rows={3}
                  value={tempStoreSettings.seoSettings?.mainSubheading || ''}
                  onChange={(e) => setTempStoreSettings({
                    ...tempStoreSettings,
                    seoSettings: { ...tempStoreSettings.seoSettings, mainSubheading: e.target.value }
                  })}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Category Knowledge Cards */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 text-sky-700">
                <Layers className="w-4 h-4" />
                <span>۳. کارت‌های معرفی تجهیزات و قطعات اصلی صفحه اصلی</span>
              </h4>

              <button
                type="button"
                onClick={() => {}}
                className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ افزودن کارت جدید</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {(tempStoreSettings.seoSettings?.cards || INITIAL_SEO_SETTINGS.cards).map((card, idx) => (
                <div key={card.id || idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 relative">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-black text-slate-800 text-xs">
                      کارت شماره {toPersianDigits(idx + 1)}:
                    </span>
                    {(tempStoreSettings.seoSettings?.cards || INITIAL_SEO_SETTINGS.cards).length > 1 && (
                      <button
                        type="button"
                        onClick={() => {}}
                        className="text-rose-600 hover:text-rose-800 p-1 rounded-lg hover:bg-rose-50 cursor-pointer flex items-center gap-1 font-bold text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 block mb-1">عنوان کارت:</label>
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) => {}}
                      className="w-full bg-white p-2 rounded-xl border border-slate-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">توضیحات کامل کارت:</label>
                    <textarea
                      rows={3}
                      value={card.description}
                      onChange={(e) => {}}
                      className="w-full bg-white p-2 rounded-xl border border-slate-300 leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Deep Article Section */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 text-sky-700">
              <Wrench className="w-4 h-4" />
              <span>۴. متن مقاله و نکات کلیدی (بخش مقاله سئو صفحه اصلی)</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">عنوان اصلی مقاله:</label>
                <input
                  type="text"
                  value={tempStoreSettings.seoSettings?.articleTitle || ''}
                  onChange={(e) => setTempStoreSettings({
                    ...tempStoreSettings,
                    seoSettings: { ...tempStoreSettings.seoSettings, articleTitle: e.target.value }
                  })}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">پاراگراف اول مقاله:</label>
                <textarea
                  rows={3}
                  value={tempStoreSettings.seoSettings?.articleParagraph1 || ''}
                  onChange={(e) => setTempStoreSettings({
                    ...tempStoreSettings,
                    seoSettings: { ...tempStoreSettings.seoSettings, articleParagraph1: e.target.value }
                  })}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 leading-relaxed"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">پاراگراف دوم مقاله:</label>
                <textarea
                  rows={3}
                  value={tempStoreSettings.seoSettings?.articleParagraph2 || ''}
                  onChange={(e) => setTempStoreSettings({
                    ...tempStoreSettings,
                    seoSettings: { ...tempStoreSettings.seoSettings, articleParagraph2: e.target.value }
                  })}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 leading-relaxed"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">تگ‌ها و هشتگ‌های مقاله (با ویرگول جدا کنید):</label>
                <input
                  type="text"
                  value={(tempStoreSettings.seoSettings?.articleTags || INITIAL_SEO_SETTINGS.articleTags).join(', ')}
                  onChange={(e) => setTempStoreSettings({
                    ...tempStoreSettings,
                    seoSettings: {
                      ...tempStoreSettings.seoSettings,
                      articleTags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }
                  })}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 5: FAQ List Management */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 text-sky-700">
                <AlertCircle className="w-4 h-4" />
                <span>۵. مدیریت سوالات متداول (Google FAQ Schema Accordion)</span>
              </h4>

              <button
                type="button"
                onClick={() => {}}
                className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ افزودن سوال جدید به FAQ</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {(tempStoreSettings.seoSettings?.faqItems || INITIAL_SEO_SETTINGS.faqItems).map((faq, idx) => (
                <div key={faq.id || idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 relative group">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-black text-slate-800 text-xs">
                      سوال متداول شماره {toPersianDigits(idx + 1)}:
                    </span>
                    <button
                      type="button"
                      onClick={() => {}}
                      className="text-rose-600 hover:text-rose-800 p-1 rounded-lg hover:bg-rose-50 cursor-pointer flex items-center gap-1 font-bold text-xs"
                      title="حذف این سوال"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>حذف سوال</span>
                    </button>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">متن سوال (Question):</label>
                    <input
                      type="text"
                      required
                      value={faq.question}
                      onChange={(e) => {}}
                      className="w-full bg-white p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">متن پاسخ جامع (Answer):</label>
                    <textarea
                      rows={3}
                      required
                      value={faq.answer}
                      onChange={(e) => {}}
                      className="w-full bg-white p-2.5 rounded-xl border border-slate-300 text-slate-800 leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end border-t border-slate-100">
            <button
              type="submit"
              className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-5 h-5" />
              <span>ذخیره کلیه تنظیمات سئو و به‌روزرسانی در گوگل</span>
            </button>
          </div>
        </form>
      )}

      {/* Sub Tab: SMS Gateway Settings */}
      {activeAdminSubTab === 'sms' && (
        <SmsSettingsPanel
          storeSettings={storeSettings}
          setStoreSettings={setStoreSettings}
        />
      )}

      {/* Sub Tab: Customer Ledger & Deposit Slips */}
      {activeAdminSubTab === 'customer_transactions' && (
        <CustomerTransactionsPanel
          storeSettings={storeSettings}
        />
      )}

      {/* Sub Tab: Online Payment Gateways */}
      {activeAdminSubTab === 'gateways' && (
        <PaymentSettingsPanel
          storeSettings={storeSettings}
          setStoreSettings={setStoreSettings}
        />
      )}

      {/* Sub Tab: Printers & Auto-Print Settings */}
      {activeAdminSubTab === 'printers' && (
        <PrinterSettingsPanel
          storeSettings={storeSettings}
          setStoreSettings={setStoreSettings}
        />
      )}

      {/* Sub Tab: Categories and Brands Management */}
      {activeAdminSubTab === 'categories_manage' && (
        <CategoriesBrandsManage
        setIsQuickBrandModalOpen={setIsQuickBrandModalOpen}
        setIsQuickCategoryModalOpen={setIsQuickCategoryModalOpen}
        setSuccessMsg={setSuccessMsg}
        />
      )}

      {/* Sub Tab: Admin Users & Role Permissions Management */}
      {activeAdminSubTab === 'admin_users' && (
        <AdminStaffUsersManage setActiveAdminSubTab={setActiveAdminSubTab} user={user} ALL_ADMIN_PERMISSIONS={ALL_ADMIN_PERMISSIONS} />
      )}



      {/* Product Add/Edit Modal */}
      {isProductModalOpen && editingProduct &&
        <ProductSubmitAdminModal products={products} editingProduct={editingProduct} setIsQuickBrandModalOpen={setIsQuickBrandModalOpen} brands={brands} setProducts={setProducts} categories={categories} setEditingProduct={setEditingProduct} setIsProductModalOpen={setIsProductModalOpen} setIsQuickCategoryModalOpen={setIsQuickCategoryModalOpen} />
      }

      {/* Quick Category Creation Modal */}
      {isQuickCategoryModalOpen && (
        <CategorySubmitModal setCategories={setCategories} setIsQuickCategoryModalOpen={setIsQuickCategoryModalOpen}

        />
      )}

      {/* Quick Brand Creation Modal */}
      {isQuickBrandModalOpen && (
        <BrandSubmitModal
          setBrands={setBrands}
          setIsQuickBrandModalOpen={setIsQuickBrandModalOpen}

        />

      )}

      {/* Manual Invoice Issuance Modal */}
      <CreateManualInvoiceModal
        orders={orders}
        storeSettings={storeSettings}
        isOpen={isManualInvoiceModalOpen}
        onClose={() => setIsManualInvoiceModalOpen(false)}
        onSaveInvoice={(newOrder) => {
          setOrders(prev => [newOrder, ...prev]);
          setSuccessMsg(`فاکتور دستی شماره ${newOrder.pk} با موفقیت صادر شد.`);
          setTimeout(() => setSuccessMsg(''), 4000);
        }}
        onPrintInvoice={(order) => {
          onOpenPrintInvoiceForOrder(order);
        }}
      />
    </div>
  );
};
