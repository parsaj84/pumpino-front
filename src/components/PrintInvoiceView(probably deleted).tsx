import React from 'react';
import { QuoteItem, CustomerInfo, StoreSettings, CustomerOrder } from '../types';
import { formatPrice, toPersianDigits } from '../utils/formatters';

interface PrintInvoiceViewProps {
  quoteItems?: QuoteItem[];
  customerInfo?: CustomerInfo;
  order?: CustomerOrder | null;
  storeSettings: StoreSettings;
}

export const PrintInvoiceView: React.FC<PrintInvoiceViewProps> = ({
  quoteItems = [],
  customerInfo,
  order,
  storeSettings
}) => {
  // If order is passed, render CustomerOrder Invoice format
  if (order) {
    const cust = customerInfo.data;
    const isInvoice = order.isInvoiceIssued;

    return (
      <div className="hidden print:block font-sans text-slate-900 text-xs p-6 bg-white dir-rtl min-h-screen">
        {/* Printable Invoice Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">{storeSettings.storeName}</h1>
            <p className="text-[11px] text-slate-600 mt-0.5">{storeSettings.tagline}</p>
            <p className="text-[10px] text-slate-500 mt-1">
              آدرس: {storeSettings.address} | تلفن پشتیبانی: {toPersianDigits(storeSettings.phoneNumber)} - {toPersianDigits(storeSettings.mobileNumber)}
            </p>
          </div>

          <div className="text-left space-y-1 text-[11px] font-mono border-r-2 border-slate-200 pr-4">
            <div className="font-extrabold text-sm text-slate-900">
              {isInvoice ? 'فاکتور رسمی خرید' : 'پیش‌فاکتور استعلام سفارش'}
            </div>
            <div>شماره سفارش: <span className="font-bold">{order.orderNumber}</span></div>
            <div>تاریخ صدور: <span className="font-bold">{toPersianDigits(order.invoiceIssuedDate || new Date(order.createdAt).toLocaleDateString('fa-IR'))}</span></div>
          </div>
        </div>

        {/* Customer & Shipping Details Box */}
        <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 mb-4 grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <span className="font-bold text-slate-600">نام و نام خانوادگی خریدار: </span>
            <span className="font-bold text-slate-900">{cust.fullName} {cust.storeName ? `(${cust.storeName})` : ''}</span>
          </div>

          <div>
            <span className="font-bold text-slate-600">تلفن همراه و ثابت: </span>
            <span className="font-bold text-slate-900">{toPersianDigits(cust.mobilePhone)} {cust.telephone ? `/ ${toPersianDigits(cust.telephone)}` : ''}</span>
          </div>

          <div>
            <span className="font-bold text-slate-600">باربری تحویل‌گیرنده: </span>
            <span className="font-extrabold text-sky-900">{cust.freightName || order.shippingFreightName}</span>
          </div>

          <div>
            <span className="font-bold text-slate-600">استان / شهر و آدرس دقیق: </span>
            <span className="font-medium text-slate-900">{cust.provinceCity} - {cust.address}</span>
          </div>
        </div>

        {/* Invoice Items Table */}
        <table className="w-full text-right border-collapse border border-slate-300 text-[11px] mb-4">
          <thead>
            <tr className="bg-slate-200 text-slate-800 font-bold border-b border-slate-300">
              <th className="border border-slate-300 p-2 text-center w-8">#</th>
              <th className="border border-slate-300 p-2 w-24">کد کالا</th>
              <th className="border border-slate-300 p-2">نام کالا / قطعه یدکی</th>
              <th className="border border-slate-300 p-2 text-center w-16">تعداد</th>
              <th className="border border-slate-300 p-2 w-28">قیمت واحد (تومان)</th>
              <th className="border border-slate-300 p-2 w-32">قیمت کل (تومان)</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => {
              const qty = item.approvedQuantity || item.requestedQuantity;
              const unitPrice = item.approvedPriceToman || item.originalPriceToman;
              const lineTotal = qty * unitPrice;

              return (
                <tr key={idx} className="border-b border-slate-200">
                  <td className="border border-slate-300 p-2 text-center font-mono">{idx + 1}</td>
                  <td className="border border-slate-300 p-2 font-mono font-bold">{item.sku}</td>
                  <td className="border border-slate-300 p-2">
                    <div className="font-bold">{item.productTitle}</div>
                    <div className="text-[10px] text-slate-500">مدل: {item.model}</div>
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-bold">
                    {toPersianDigits(qty)}
                  </td>
                  <td className="border border-slate-300 p-2 font-mono">
                    {formatPrice(unitPrice, storeSettings.currencyUnit)}
                  </td>
                  <td className="border border-slate-300 p-2 font-mono font-bold">
                    {formatPrice(lineTotal, storeSettings.currencyUnit)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals & Notes */}
        <div className="flex items-start justify-between gap-6 pt-2">
          <div className="flex-1 border border-slate-300 rounded-lg p-3 bg-slate-50 text-[10px] space-y-1">
            <div className="font-bold text-slate-800">توضیحات و شرایط تحویل باربری:</div>
            <div>• {storeSettings.footerNotice}</div>
            {order.adminNote && <div>• یادداشت مدیریت: {order.adminNote}</div>}
            <div>• تحویل کلیه اقلام به باربری {cust.freightName || order.shippingFreightName} انجام می‌شود.</div>
          </div>

          <div className="w-64 border border-slate-300 rounded-lg p-3 space-y-2 text-[11px]">
            <div className="flex justify-between font-extrabold text-sm text-slate-900 border-t border-slate-300 pt-1">
              <span>مبلغ کل فاکتور:</span>
              <span>{formatPrice(order.totalAmountToman, storeSettings.currencyUnit)}</span>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="mt-12 flex justify-between px-12 text-[11px] font-bold text-slate-700">
          <div>مهر و امضاء مدیریت فروشگاه</div>
          <div>امضاء و تایید خریدار</div>
        </div>
      </div>
    );
  }

  // Fallback for simple Quote Items
  const rawSubtotal = quoteItems.reduce((acc, item) => acc + (item.product.priceToman * item.quantity), 0);
  const totalDiscounts = quoteItems.reduce((acc, item) => {
    const itemSubtotal = item.product.priceToman * item.quantity;
    const disc = (item.discountPercent || 0) / 100;
    return acc + (itemSubtotal * disc);
  }, 0);

  const finalTotal = rawSubtotal - totalDiscounts;

  return (
    <div className="hidden print:block font-sans text-slate-900 text-xs p-6 bg-white dir-rtl min-h-screen">
      {/* Printable Invoice Header */}
      <div className="border-b-2 border-slate-900 pb-4 mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{storeSettings.storeName}</h1>
          <p className="text-[11px] text-slate-600 mt-0.5">{storeSettings.tagline}</p>
          <p className="text-[10px] text-slate-500 mt-1">
            آدرس: {storeSettings.address} | تلفن: {toPersianDigits(storeSettings.phoneNumber)} - {toPersianDigits(storeSettings.mobileNumber)}
          </p>
        </div>

        <div className="text-left space-y-1 text-[11px] font-mono border-r-2 border-slate-200 pr-4">
          <div className="font-bold text-sm text-slate-900">پیش‌فاکتور فروش</div>
          <div>شماره: <span className="font-bold">{customerInfo.invoiceNumber}</span></div>
          <div>تاریخ: <span className="font-bold">{customerInfo.invoiceDate}</span></div>
        </div>
      </div>

      {/* Customer Box */}
      <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 mb-4 grid grid-cols-2 gap-2 text-[11px]">
        <div>
          <span className="font-bold text-slate-600">نام خریدار / شرکت: </span>
          <span className="font-bold text-slate-900">{customerInfo.name || 'مشتری محترم'}</span>
        </div>

        <div>
          <span className="font-bold text-slate-600">شماره تماس: </span>
          <span className="font-bold text-slate-900">{toPersianDigits(customerInfo.phone || 'ثبت نشده')}</span>
        </div>
      </div>

      {/* Invoice Items Table */}
      <table className="w-full text-right border-collapse border border-slate-300 text-[11px] mb-4">
        <thead>
          <tr className="bg-slate-200 text-slate-800 font-bold border-b border-slate-300">
            <th className="border border-slate-300 p-2 text-center w-8">#</th>
            <th className="border border-slate-300 p-2 w-24">کد کالا</th>
            <th className="border border-slate-300 p-2">شرح پمپ / قطعه یدکی</th>
            <th className="border border-slate-300 p-2 text-center w-16">تعداد</th>
            <th className="border border-slate-300 p-2 w-28">قیمت واحد (تومان)</th>
            <th className="border border-slate-300 p-2 w-16 text-center">تخفیف</th>
            <th className="border border-slate-300 p-2 w-32">قیمت کل (تومان)</th>
          </tr>
        </thead>
        <tbody>
          {quoteItems.map((item, idx) => {
            const unitPrice = item.product.priceToman;
            const disc = item.discountPercent || 0;
            const lineTotal = (unitPrice * (1 - disc / 100)) * item.quantity;

            return (
              <tr key={item.product.id} className="border-b border-slate-200">
                <td className="border border-slate-300 p-2 text-center font-mono">{idx + 1}</td>
                <td className="border border-slate-300 p-2 font-mono font-bold">{item.product.sku}</td>
                <td className="border border-slate-300 p-2">
                  <div className="font-bold">{item.product.titleFarsi}</div>
                  <div className="text-[10px] text-slate-500">مدل: {item.product.model}</div>
                </td>
                <td className="border border-slate-300 p-2 text-center font-bold">
                  {toPersianDigits(item.quantity)}
                </td>
                <td className="border border-slate-300 p-2 font-mono">
                  {formatPrice(unitPrice, storeSettings.currencyUnit)}
                </td>
                <td className="border border-slate-300 p-2 text-center">
                  {disc > 0 ? `${toPersianDigits(disc)}٪` : '-'}
                </td>
                <td className="border border-slate-300 p-2 font-mono font-bold">
                  {formatPrice(lineTotal, storeSettings.currencyUnit)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Invoice Totals & Signatures */}
      <div className="flex items-start justify-between gap-6 pt-2">
        <div className="flex-1 border border-slate-300 rounded-lg p-3 bg-slate-50 text-[10px] space-y-1">
          <div className="font-bold text-slate-800">توضیحات و شرایط فروش:</div>
          <div>• {storeSettings.footerNotice}</div>
          <div>• این پیش‌فاکتور تا ۲۴ ساعت اعتبار دارد.</div>
          {customerInfo.notes && <div>• {customerInfo.notes}</div>}
        </div>

        <div className="w-64 border border-slate-300 rounded-lg p-3 space-y-2 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-600">جمع کل کالاها:</span>
            <span className="font-bold">{formatPrice(rawSubtotal, storeSettings.currencyUnit)}</span>
          </div>

          {totalDiscounts > 0 && (
            <div className="flex justify-between text-rose-700">
              <span>تخفیف کل:</span>
              <span className="font-bold">- {formatPrice(totalDiscounts, storeSettings.currencyUnit)}</span>
            </div>
          )}

          <div className="flex justify-between pt-2 border-t border-slate-300 font-extrabold text-xs text-slate-900">
            <span>مبلغ قابل پرداخت:</span>
            <span>{formatPrice(finalTotal, storeSettings.currencyUnit)}</span>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="mt-12 flex justify-between px-12 text-[11px] font-bold text-slate-700">
        <div>مهر و امضاء فروشگاه</div>
        <div>امضاء خریدار</div>
      </div>
    </div>
  );
};
