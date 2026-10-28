import React from 'react';
import { 
  Printer, 
  X, 
  Truck, 
  Building2, 
  CreditCard, 
  Share2, 
  FileText, 
  MessageSquare,
  Download
} from 'lucide-react';
import { CustomerOrder, StoreSettings, CustomerInfo, QuoteItem } from '../types';
import { formatPrice, toPersianDigits } from '../utils/formatters';

interface PrintInvoiceModalProps {
  order?: CustomerOrder | null;
  quoteItems?: QuoteItem[];
  customerInfo?: CustomerInfo | null;
  storeSettings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintInvoiceModal: React.FC<PrintInvoiceModalProps> = ({
  order,
  quoteItems = [],
  customerInfo,
  storeSettings,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const [copiedText, setCopiedText] = React.useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const isOrderInvoice = Boolean(order);
  const invoiceNumber = order ? order.orderNumber : (customerInfo?.invoiceNumber || 'INV-1001');
  const invoiceDate = order 
    ? (order.invoiceIssuedDate || toPersianDigits(new Date(order.createdAt).toLocaleDateString('fa-IR')))
    : (customerInfo?.invoiceDate || toPersianDigits(new Date().toLocaleDateString('fa-IR')));

  const customerName = order 
    ? `${order.customerProfile?.fullName} ${order.customerProfile?.storeName ? `(${order.customerProfile?.storeName})` : ''}`
    : (customerInfo?.name || 'مشتری محترم');

  const customerPhone = order
    ? `${order.customerProfile?.mobilePhone} ${order.customerProfile?.telephone ? `/ ${order.customerProfile?.telephone}` : ''}`
    : (customerInfo?.phone || '-');

  const freightName = order 
    ? (order.customerProfile?.freightName || order.shippingFreightName)
    : 'باربری سعدی / عمومی';

  const customerAddress = order
    ? `${order.customerProfile?.provinceCity} - ${order.customerProfile?.address}`
    : 'نامشخص';

  // Calculate items
  const items = order
    ? order.items.map((item) => {
        const qty = item.approvedQuantity || item.requestedQuantity;
        const unitPrice = item.approvedPriceToman || item.originalPriceToman;
        return {
          sku: item.sku,
          title: item.productTitle,
          model: item.model,
          quantity: qty,
          unitPrice,
          totalPrice: qty * unitPrice,
          imageUrl: item.imageUrl
        };
      })
    : quoteItems.map((item) => {
        const unitPrice = item.product.priceToman;
        const disc = item.discountPercent || 0;
        const lineTotal = (unitPrice * (1 - disc / 100)) * item.quantity;
        return {
          sku: item.product.sku,
          title: item.product.titleFarsi,
          model: item.product.model,
          quantity: item.quantity,
          unitPrice,
          totalPrice: lineTotal,
          imageUrl: item.product.imageUrl
        };
      });

  const totalPayable = order
    ? order.totalAmountToman
    : items.reduce((acc, curr) => acc + curr.totalPrice, 0);

  const handleShareWhatsApp = () => {
    const text = `فاکتور خرید از ${storeSettings.storeName}\nشماره فاکتور: ${invoiceNumber}\nتاریخ: ${invoiceDate}\nخریدار: ${customerName}\nمبلغ کل: ${formatPrice(totalPayable, storeSettings.currencyUnit)}\nپشتیبانی: ${storeSettings.mobileNumber}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareBale = () => {
    const text = `فاکتور خرید از ${storeSettings.storeName}\nشماره فاکتور: ${invoiceNumber}\nتاریخ: ${invoiceDate}\nخریدار: ${customerName}\nمبلغ کل: ${formatPrice(totalPayable, storeSettings.currencyUnit)}\nپشتیبانی: ${storeSettings.mobileNumber}`;
    window.open(`https://ble.ir/share?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareRubika = () => {
    const text = `فاکتور خرید از ${storeSettings.storeName}\nشماره فاکتور: ${invoiceNumber}\nتاریخ: ${invoiceDate}\nخریدار: ${customerName}\nمبلغ کل: ${formatPrice(totalPayable, storeSettings.currencyUnit)}\nپشتیبانی: ${encodeURIComponent(storeSettings.mobileNumber)}`;
    window.open(`https://rubika.ir/share?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden my-auto print:shadow-none print:border-none print:rounded-none">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="bg-slate-900 text-white p-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <span>نمایش و چاپ فاکتور {isOrderInvoice ? 'رسمی سفارش' : 'پیش‌فاکتور استعلام'}</span>
                <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full border border-sky-500/30">
                  {invoiceNumber}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                امکان مشاهده آنلاین، چاپ مستقیم یا ذخیره به صورت فایل PDF استاندارد A4
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleShareBale}
              className="px-2.5 py-1.5 rounded-xl bg-sky-700 hover:bg-sky-600 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
              title="ارسال فاکتور در پیام‌رسان بله"
            >
              <Share2 className="w-3.5 h-3.5 text-sky-300" />
              <span>ارسال در بله</span>
            </button>

            <button
              onClick={handleShareRubika}
              className="px-2.5 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
              title="ارسال فاکتور در روبیکا"
            >
              <Share2 className="w-3.5 h-3.5 text-purple-300" />
              <span>ارسال در روبیکا</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
              title="اشتراک‌گذاری فاکتور در واتساپ"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">واتساپ</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>چاپ فاکتور</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable PDF / Invoice Document View */}
        <div className="p-6 sm:p-8 space-y-6 dir-rtl text-slate-900 bg-white font-sans text-xs print:p-0 print:space-y-4">
          {/* PDF Save Hint (Screen only) */}
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3 flex items-center justify-between text-sky-950 text-xs print:hidden">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-sky-600 shrink-0" />
              <span>
                <strong>نکته دریافت PDF:</strong> جهت ذخیره نسخه دیجتیال (PDF)، روی دکمه «چاپ / دانلود PDF» زده و در پنجره مرورگر گزینه مقصد را روی <strong>Save as PDF</strong> یا <strong>ذخیره به عنوان PDF</strong> تنظیم کنید.
              </span>
            </div>
            <button
              onClick={handlePrint}
              className="text-xs bg-sky-600 text-white font-bold px-3 py-1 rounded-xl hover:bg-sky-700 cursor-pointer shrink-0"
            >
              دریافت PDF
            </button>
          </div>

          {/* Official Invoice Header */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1 max-w-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-700 text-white flex items-center justify-center font-bold text-sm">
                  P
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {storeSettings.storeName}
                </h1>
              </div>
              <p className="text-xs text-slate-600 font-semibold">{storeSettings.tagline}</p>
              <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                <div>نشانی: {storeSettings.address}</div>
                <div>
                  تلفن تماس پشتیبانی: <span className="font-mono font-bold text-slate-800">{toPersianDigits(storeSettings.phoneNumber)}</span> - <span className="font-mono font-bold text-slate-800">{toPersianDigits(storeSettings.mobileNumber)}</span>
                </div>
              </div>
            </div>

            <div className="text-left bg-slate-50 border border-slate-300 p-3.5 rounded-2xl space-y-1.5 min-w-[200px]">
              <div className="font-black text-base text-slate-900 border-b border-slate-200 pb-1 text-center">
                {isOrderInvoice ? 'فاکتور رسمی خرید' : 'پیش‌فاکتور فروش'}
              </div>
              <div className="flex justify-between gap-4 text-xs font-mono">
                <span className="text-slate-500">شماره:</span>
                <span className="font-bold text-slate-900">{invoiceNumber}</span>
              </div>
              <div className="flex justify-between gap-4 text-xs font-mono">
                <span className="text-slate-500">تاریخ صدور:</span>
                <span className="font-bold text-slate-900">{invoiceDate}</span>
              </div>
              <div className="flex justify-between gap-4 text-xs">
                <span className="text-slate-500">وضعیت:</span>
                <span className="font-bold text-emerald-700">
                  {order?.paymentStatus === 'paid_approved' ? 'پرداخت شده' : 'معتبر و تاییدشده'}
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Information Box */}
          <div className="bg-slate-50/80 border border-slate-300 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-slate-600 font-bold">
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
                <span>مشخصات خریدار / متقاضی:</span>
              </div>
              <div className="font-bold text-sm text-slate-900">{customerName}</div>
              <div className="text-slate-600">
                تلفن تماس: <span className="font-mono font-bold text-slate-800">{toPersianDigits(customerPhone)}</span>
              </div>
            </div>

            <div className="space-y-1.5 border-t md:border-t-0 md:border-r border-slate-200 pt-2 md:pt-0 md:pr-4">
              <div className="flex items-center gap-1 text-slate-600 font-bold">
                <Truck className="w-3.5 h-3.5 text-sky-600" />
                <span>تحویل و اطلاعات باربری:</span>
              </div>
              <div className="font-bold text-sky-900">باربری تحویل‌گیرنده: {freightName}</div>
              <div className="text-slate-600 truncate">
                مقصد و نشانی: <span className="font-medium text-slate-800">{customerAddress}</span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-300">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                  <th className="p-2.5 text-center w-10 border-l border-slate-300">#</th>
                  <th className="p-2.5 w-24 border-l border-slate-300">کد کالا</th>
                  <th className="p-2.5 border-l border-slate-300">شرح پمپ / قطعه یدکی</th>
                  <th className="p-2.5 text-center w-16 border-l border-slate-300">تعداد</th>
                  <th className="p-2.5 w-32 border-l border-slate-300">قیمت واحد (تومان)</th>
                  <th className="p-2.5 w-36">قیمت کل (تومان)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="p-2.5 text-center font-mono font-bold text-slate-400 border-l border-slate-300">
                      {idx + 1}
                    </td>
                    <td className="p-2.5 font-mono font-bold text-slate-800 border-l border-slate-300">
                      {item.sku}
                    </td>
                    <td className="p-2.5 border-l border-slate-300">
                      <div className="font-bold text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-500">مدل: {item.model}</div>
                    </td>
                    <td className="p-2.5 text-center font-extrabold text-slate-900 border-l border-slate-300">
                      {toPersianDigits(item.quantity)}
                    </td>
                    <td className="p-2.5 font-mono font-medium text-slate-800 border-l border-slate-300">
                      {formatPrice(item.unitPrice, storeSettings.currencyUnit)}
                    </td>
                    <td className="p-2.5 font-mono font-bold text-sky-950">
                      {formatPrice(item.totalPrice, storeSettings.currencyUnit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Totals & Bank Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start pt-2">
            {/* Bank Card Info for Payment (Hidden or Compact in Print) */}
            <div className="border border-slate-300 rounded-2xl p-3.5 bg-slate-50/60 space-y-2 text-xs">
              <div className="font-bold text-slate-900 flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-sky-700" />
                  اطلاعات حساب بانکی جهت واریز:
                </span>
                <span className="text-[11px] text-slate-500 font-bold">{storeSettings.bankName || 'بانک ملی'}</span>
              </div>
              <div className="space-y-1 font-mono">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-600 font-sans">شماره کارت:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-slate-900 dir-ltr tracking-wider">
                      {storeSettings.bankCardNumber || '۶۰۳۷-۹۹۷۵-۱۲۳۴-۵۶۷۸'}
                    </span>
                    <button
                      onClick={() => handleCopy(storeSettings.bankCardNumber || '6037997512345678', 'کارت')}
                      className="text-sky-700 hover:text-sky-900 font-sans text-[10px] cursor-pointer print:hidden"
                    >
                      {copiedText === 'کارت' ? '✓ کپی شد' : 'کپی'}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-600 font-sans">شماره شبا:</span>
                  <span className="font-bold text-slate-800 dir-ltr truncate max-w-[180px]">
                    {storeSettings.bankIbanNumber || 'IR120170000000123456789001'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-600 font-sans">بنام:</span>
                  <span className="font-bold text-slate-900 font-sans">
                    {storeSettings.bankOwnerName || 'فروشگاه پمپینو'}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Payable Box */}
            <div className="border border-slate-400 rounded-2xl p-4 bg-slate-900 text-white space-y-2.5 shadow-sm">
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span>تعداد کل اقلام:</span>
                <span className="font-bold font-mono text-white">
                  {toPersianDigits(items.reduce((a, b) => a + b.quantity, 0))} عدد
                </span>
              </div>

              <div className="border-t border-slate-700 pt-2 flex justify-between items-center text-sm sm:text-base font-extrabold text-white">
                <span>مبلغ کل قابل پرداخت:</span>
                <span className="text-amber-400 font-mono text-lg font-black">
                  {formatPrice(totalPayable, storeSettings.currencyUnit)}
                </span>
              </div>
            </div>
          </div>

          {/* Terms & Notice */}
          <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-3 space-y-1">
            <div>• {storeSettings.footerNotice}</div>
            <div>• تحویل کلیه سفارشات به باربری سعدی به عهده فروشگاه بوده و هزینه حمل تا شهر مقصد به عهده خریدار می‌باشد.</div>
          </div>

          {/* Signatures */}
          <div className="pt-8 flex justify-between px-8 text-xs font-bold text-slate-700">
            <div className="text-center space-y-8">
              <div>مهر و امضاء مدیریت فروشگاه (پمپینو)</div>
              <div className="w-32 border-b border-slate-300 mx-auto opacity-40"></div>
            </div>
            <div className="text-center space-y-8">
              <div>امضاء و تایید خریدار</div>
              <div className="w-32 border-b border-slate-300 mx-auto opacity-40"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
