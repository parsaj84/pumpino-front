import * as XLSX from 'xlsx';
import { Product, QuoteItem, CustomerInfo, StoreSettings } from '../types';

/**
 * Convert English digits to Persian digits
 */
export function toPersianDigits(n: number | string): string {
  if (n === null || n === undefined) return '';
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return n
    .toString()
    .replace(/\d/g, (x) => farsiDigits[parseInt(x)]);
}

/**
 * Format price in Toman or Rial with thousands separators
 */
export function formatPrice(amountToman: number, unit: 'تومان' | 'ریال' = 'تومان', usePersianDigits = true): string {
  if (isNaN(amountToman)) return '۰ تومان';
  const displayAmount = unit === 'ریال' ? amountToman * 10 : amountToman;
  const formatted = Math.round(displayAmount).toLocaleString('en-US');
  const digits = usePersianDigits ? toPersianDigits(formatted) : formatted;
  return `${digits} ${unit}`;
}

/**
 * Stock status labels in Persian with CSS badge colors
 */
export function getStockBadge(status: boolean, qty?: number) {
  switch (status) {
    case true:
      return {
        label: qty && qty > 0 ? `موجود در انبار (${toPersianDigits(qty)} عدد)` : 'موجود در انبار',
        colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200'
      };

    case false:
    default:
      return {
        label: 'اتمام موجودی',
        colorClass: 'bg-rose-100 text-rose-800 border-rose-200'
      };
  }
}

/**
 * Export products array or quote items to an Excel (.xlsx) file
 */
export function exportToExcel(products: Product[], filename = 'لیست_محصولات_و_قطعات_پمپ_آب.xlsx') {
  const excelData = products.map((p, idx) => ({
    'ردیف': idx + 1,
    'کد کالا (SKU)': p.sku,
    'نام و مدل کالا': p.titleFarsi,
    'مدل فنی': p.model,
    'برند': p.brandId,
    'دسته‌بندی': p.categoryId,
    'قیمت (تومان)': p.priceToman,
    'وضعیت موجودی': p.stockStatus === 'in_stock' ? 'موجود' : p.stockStatus === 'low_stock' ? 'محدود' : 'استعلامی/ناموجود',
    'موجودی انبار': p.quantityInStock,
    'توان (اسب)': p.specs.powerHp || '-',
    'سایز ورود/خروج': p.specs.inletOutletSize || '-',
    'جنس پروانه': p.specs.impellerMaterial || '-',
    'سایز سیل (میلی‌متر)': p.specs.sealSizeMm || '-',
    'پمپ‌های سازگار': p.compatiblePumpModels ? p.compatiblePumpModels.join(', ') : '-',
    'توضیحات': p.description || '',
    'آخرین بروزرسانی': new Date(p.updatedAt).toLocaleDateString('fa-IR')
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  
  // Set sheet RTL mode
  if (!worksheet['!views']) worksheet['!views'] = [];
  worksheet['!views'].push({ RTL: true });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'لیست قیمت پمپ و قطعات');
  
  XLSX.writeFile(workbook, filename);
}

/**
 * Export a quote / invoice cart to Excel
 */
export function exportQuoteToExcel(items: QuoteItem[], customer: CustomerInfo, store: StoreSettings) {
  const invoiceData = items.map((item, idx) => {
    const unitPrice = item.product.priceToman;
    const discount = item.discountPercent || 0;
    const finalPrice = unitPrice * (1 - discount / 100);
    const totalPrice = finalPrice * item.quantity;

    return {
      'ردیف': idx + 1,
      'کد کالا': item.product.sku,
      'شرح کالا / قطعه': item.product.titleFarsi,
      'برند / مدل': `${item.product.brandId} - ${item.product.model}`,
      'تعداد / مقدار': item.quantity,
      'قیمت واحد (تومان)': unitPrice,
      'درصد تخفیف': discount > 0 ? `${discount}%` : '۰٪',
      'قیمت کل (تومان)': totalPrice,
      'یادداشت': item.customNote || ''
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(invoiceData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `پیش_فاکتور_${customer.invoiceNumber}`);
  
  XLSX.writeFile(workbook, `پیش_فاکتور_پمپ_${customer.invoiceNumber || 'استعلام'}.xlsx`);
}

/**
 * Generate share text or WhatsApp link for a product or quote
 */
export function generateWhatsAppShareUrl(product: Product, store: StoreSettings): string {
  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const text = `🔹 *${product.titleFarsi}*
📌 مدل: ${product.model}
🏷 کد کالا: ${product.sku}
💰 قیمت روز: ${formatPrice(product.priceToman, store.currencyUnit)}
📍 استعلام و سفارش از: ${store.storeName}
📞 تماس: ${store.mobileNumber} - ${store.phoneNumber}
🌐 کاتالوگ آنلاین: ${appUrl}`;

  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function generateTelegramShareUrl(product: Product, store: StoreSettings): string {
  const text = `🔹 ${product.titleFarsi}
📌 مدل: ${product.model}
💰 قیمت روز: ${formatPrice(product.priceToman, store.currencyUnit)}
📞 تماس: ${store.mobileNumber}`;

  return `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
}
