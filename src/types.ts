export type CategoryId = string;

export interface Category {
  pk: CategoryId;
  name: string
}

export interface Brand {
  id: string;
  nameFarsi: string;
  nameEnglish: string;
  country: string;
}

export interface TechnicalSpecs {
  powerHp?: number; // e.g., 0.5, 1, 1.5, 2, 3, 5.5
  powerKw?: number;
  voltage?: string; // e.g. '220V تک‌فاز', '380V سه‌فاز', '450V'
  inletOutletSize?: string; // e.g. '1" x 1"', '1.25" x 1"', '2" x 2"'
  maxHeadMeters?: number; // Hmax (متر)
  maxFlowLpm?: number; // Qmax (لیتر در دقیقه)
  impellerMaterial?: string; // برنجی، نوری، استیل، باکالیت
  bodyMaterial?: string; // چدن، استیل، برنج
  sealSizeMm?: number; // 12, 14, 16, 18, 20
  shaftDiameterMm?: number;
  capacitorVal?: string; // e.g. '12.5 uF', '20 uF'
  bearingCode?: string; // e.g. '6201', '6202'
  tankCapacityLiters?: number; // 24L, 50L, 100L
  pressureRangeBar?: string; // e.g. '1.5 - 3 bar'
}

export interface User {
  pk: number | string;
  is_authenticated: boolean;
  fname?: string;
  lname?: string;
  phone?: string;
  total_deposit?: number | string | null;

}

export interface UserData {
  isAuthenticated: boolean;
  data: User;
}


export interface Product {
  id: string;
  sku: string; // کد کالا
  titleFarsi: string;
  model: string;
  categoryId: CategoryId;
  brandId: string;
  priceToman: number; // قیمت به تومان
  oldPriceToman?: number;
  stockStatus: 'in_stock' | 'low_stock' | 'contact_us' | 'out_of_stock';
  quantityInStock: number;
  imageUrl?: string;
  specs: TechnicalSpecs;
  compatiblePumpModels?: string[]; // برای قطعات یدکی: مدل پمپ‌های سازگار
  description?: string;
  updatedAt: string; // ISO string date
  isFeatured?: boolean;
}

export interface QuoteItem {
  product: Product;
  quantity: number;
  discountPercent?: number;
  customNote?: string;
}

export interface CustomerProfile {
  id: string;
  fullName: string; // نام و نام خانوادگی
  storeName?: string; // نام فروشگاه / شرکت / همکار
  mobilePhone: string; // شماره همراه (نام کاربری)
  telephone: string; // تلفن ثابت
  provinceCity: string; // استان و شهر
  address: string; // آدرس دقیق پستی
  freightName: string; // نام باربری (جهانگیر، تیپاکس، وطن، پادرا و...)
  createdAt: string;
}

export type OrderStatus = 'pending' | 'reviewed' | 'approved' | 'shipped' | 'delivered' | 'rejected';

export type PaymentStatus = 'unpaid' | 'pending_verification' | 'paid_approved' | 'rejected';

export interface OrderItem {
  productId: string;
  sku: string;
  productTitle: string;
  model: string;
  requestedQuantity: number;
  approvedQuantity: number; // تعداد تایید شده توسط مدیر
  originalPriceToman: number; // قیمت پایه
  approvedPriceToman: number; // قیمت ویرایش شده توسط مدیر
  discountPercent?: number; // درصد تخفیف
  customNote?: string;
}

export interface BankDetails {
  bankName?: string;
  cardNumber?: string;
  accountNumber?: string;
  iban?: string;
  ownerName?: string;
}

export interface BankAccountItem {
  id: string;
  bankName: string;
  cardNumber: string;
  accountNumber?: string;
  iban?: string;
  ownerName: string;
  isDefault?: boolean;
}

export interface OrderMessage {
  id: string;
  sender: 'customer' | 'admin';
  senderName: string;
  message: string;
  createdAt: string; // e.g. '1403/05/12 - 14:30'
}

export interface CustomerOrder {
  pk: string;
  orderNumber: string; // e.g., ORD-1403-1002
  createdAt: string;
  updatedAt: string;
  customerProfile: CustomerProfile;
  items: OrderItem[];
  status: OrderStatus;
  statusTitle: string;
  adminNote?: string;
  shippingFreightName: string; // نام باربری یا نحوه ارسال درخواستی
  shippingLocation?: ShippingLocationType;
  shippingMethod?: ShippingMethodType;
  shippingMethodTitle?: string;
  selectedGatewayId?: string;
  selectedGatewayName?: string;
  totalAmountToman: number; // مبلغ کل نهایی صادر شده
  discountToman?: number; // مبلغ تخفیف کل
  invoiceIssuedDate?: string;
  isInvoiceIssued: boolean; // آیا فاکتور خرید صادر شده یا خیر
  paymentStatus?: PaymentStatus;
  paymentReceiptRef?: string; // کد پیگیری یا شماره فیش/کارت
  paymentReceiptDate?: string; // تاریخ/زمان ثبت واریزی
  paymentNote?: string; // توضیحات مشتری در خصوص واریز
  adminBankDetails?: BankDetails;
  messages?: OrderMessage[]; // چت و پشتیبانی اختصاصی برای این پیش فاکتور
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address?: string;
  freightName?: string;
  shippingLocation?: ShippingLocationType;
  shippingMethod?: ShippingMethodType;
  shippingMethodTitle?: string;
  invoiceNumber: string;
  invoiceDate: string; // Persian date string e.g., '1403/05/06'
  notes?: string;
}

export interface SeoFaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface SeoCardItem {
  id: string;
  title: string;
  description: string;
}

export interface SeoSettings {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  mainBadge?: string;
  mainHeading?: string;
  mainSubheading?: string;
  articleTitle?: string;
  articleParagraph1?: string;
  articleParagraph2?: string;
  articleTags?: string[];
  cards?: SeoCardItem[];
  faqItems?: SeoFaqItem[];
}

export interface SmsSettings {
  provider: 'kavenegar' | 'farazsms' | 'melipayak' | 'ghasedak' | 'custom';
  apiKey: string;
  lineNumber: string;
  adminMobileNumber: string;
  enabled: boolean;
  sendOnOrderCreated: boolean;
  sendOnStatusChange: boolean;
  orderCreatedTemplate?: string;
  statusChangeTemplate?: string;
}

export interface PaymentGatewayItem {
  id: string;
  name: string;
  code: 'zarinpal' | 'idpay' | 'nextpay' | 'mellat' | 'parsian' | 'saman' | 'asanpardakht' | 'custom';
  merchantId: string;
  terminalId?: string;
  apiKey?: string;
  enabled: boolean;
  isDefault: boolean;
  description?: string;
}

export interface PaymentSettings {
  onlineGatewaysEnabled: boolean;
  cardToCardEnabled: boolean;
  gateways: PaymentGatewayItem[];
}

export type ShippingLocationType = 'tehran' | 'other_cities';
export type ShippingMethodType = 'courier_snapp' | 'in_person_tehran' | 'tipax' | 'freight_terminal' | 'post_express';

export interface SayadiChequeDetails {
  sayadiId?: string; // شناسه ۱۶ رقمی صیادی
  chequeNumber?: string; // شماره برگ چک
  dueDate?: string; // تاریخ سررسید (شمسی)
  bankName?: string; // نام بانک صادرکننده
  drawerName?: string; // نام صادرکننده چک
  status?: 'registered' | 'deposited' | 'cleared' | 'bounced' | 'returned'; // وضعیت چک
}

export interface CustomerTransaction {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  type: 'receive' | 'pay'; // دریافت از مشتری (+) / پرداخت به مشتری (-)
  amountToman: number;
  date: string; // تاریخ شمسی
  method: 'bank_transfer' | 'card_to_card' | 'cheque' | 'cash' | 'online_gateway';
  trackingCode?: string;
  receiptImage?: string; // عکس فیش واریزی یا چک
  description?: string;
  chequeDetails?: SayadiChequeDetails;
  orderId?: string;
  recordedBy: string;
  createdAt: string;
}

export interface PrinterItem {
  id: string;
  name: string;
  type: 'thermal_80mm' | 'thermal_58mm' | 'a4_invoice' | 'a5_invoice' | 'label_printer';
  connectionType: 'browser_print' | 'network_ip' | 'usb_serial';
  ipAddress?: string;
  port?: number;
  isDefault?: boolean;
  autoPrintNewOrders?: boolean;
  copies?: number;
  printHeader?: string;
  printFooter?: string;
  enabled?: boolean;
}

export interface PrinterSettings {
  autoPrintEnabled: boolean;
  soundAlertEnabled: boolean;
  printers: PrinterItem[];
}

type ReturnRequestStatus = "pending" | "approved" | "rejected" | "received" | "refunded" | "canceled"
type ReturnRequestReason = "all" | "damaged" | "wrong_item" | "defective" | "not_as_described" | "change_of_mind" | "other"

export interface OrderItem {
  product: Product;
  total_items_price: string | number;
  return_request: string;
  pk: string | number
}


export interface ReturnRequest {
  reason: ReturnRequestReason;
  pk: string | number;
  reason_prove_file: string;
  description?: string;
  status?: ReturnRequestStatus;
  item?: OrderItem;
  return_price_accepted_by_admin?: number | string;
  paid_price?: string | number;
  order?: CustomerOrder
  user?: User
}

export interface TotalTransactionData {
  paid: number | string | null;
  recieved: number | string | null;
  total: number | string | null;

}

export interface FormConfig {
  label:string,
  code: string,
  value: string;
  isNumeric: boolean
  rigex: null | RegExp,
  required: boolean,
  error: string
}

export interface Transaction {
  user?: User;
  order?: CustomerOrder;
  price: number;
  date_created: string;
  document_file?: string;
  return_request?: ReturnRequest;
  transaction_type: "PAYMENT" | "RETURN_PRICE";
  pk?: string | number
}

export type AdminPermission =
  | 'orders_manage'           // مدیریت سفارشات و صدور فاکتور
  | 'quick_prices'            // تغییر سریع قیمت‌ها و موجودی
  | 'add_product'             // تعریف و ویرایش کالا و کاتالوگ
  | 'customer_transactions'  // امور مالی و ثبت دریافت/پرداخت مشتریان
  | 'accounting'              // حسابداری و گزارش سود/زیان
  | 'gateways'                // تنظیمات درگاه‌های پرداخت
  | 'settings'                // تنظیمات فروشگاه و تغییر رمزها
  | 'admin_users'             // تعریف مدیران و مدیریت دسترسی‌ها
  | 'categories_manage'       // مدیریت دسته‌بندی‌ها و برندها
  | 'sms'                     // تنظیمات پیامک
  | 'printers'                // تنظیمات پرینترها
  | 'excel_import'            // خروجی/ورودی اکسل
  | 'seo';                    // تنظیمات سئو

export interface AdminUser {
  id: string;
  name: string;
  pin: string; // رمز عبور یا پین ورود اختصاصی
  role: 'super_admin' | 'manager' | 'operator' | 'accountant' | 'sales';
  roleTitle: string; // مثلاً: مدیر ارشد، مدیر فروش، حسابدار، اپراتور
  permissions: AdminPermission[];
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  phoneNumber: string;
  mobileNumber: string;
  address: string;
  telegramAdmin: string;
  whatsappNumber: string;
  currencyUnit: 'تومان' | 'ریال';
  lastUpdatedDate: string;
  adminPin: string;
  footerNotice: string;
  // Bank Account details editable by admin
  bankName?: string;
  bankCardNumber?: string;
  bankAccountNumber?: string;
  bankIbanNumber?: string;
  bankOwnerName?: string;
  bankAccounts?: BankAccountItem[];
  // SEO Settings editable by admin
  seoSettings?: SeoSettings;
  // SMS Settings
  smsSettings?: SmsSettings;
  // Printer Settings
  printerSettings?: PrinterSettings;
  // Payment Gateways Settings
  paymentSettings?: PaymentSettings;
  // Font Family Setting
  fontFamily?: 'vazirmatn' | 'shabnam' | 'sahel' | 'iranyekan' | 'system';
}

export interface ExpenseEntry {
  id: string;
  title: string;
  amountToman: number;
  category: 'shipping' | 'purchase' | 'utilities' | 'salary' | 'tax' | 'other';
  date: string; // Persian date string
  note?: string;
  recordedBy: string;
}

export interface PriceUpdateLog {
  id: string;
  date: string;
  productId: string;
  productTitle: string;
  oldPrice: number;
  newPrice: number;
  updatedBy: string;
}

export interface FilterState {

  categoryId: string; // 'all' or CategoryId
  brandId: string; // 'all' or Brand.id
  stockOnly: boolean;
  minPrice: number;
  maxPrice: number;
  sortBy: 'featured' | 'price_asc' | 'price_desc' | 'updated_desc' | 'name_asc';
  powerHpFilter: string; // 'all' or numeric
  compatiblePumpQuery: string;
}
