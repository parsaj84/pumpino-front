import React, { useState } from 'react';
import { 
  Printer, 
  Plus, 
  Trash2, 
  Save, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Monitor, 
  Power,
  ShieldCheck,
  Check
} from 'lucide-react';
import { StoreSettings, PrinterSettings, PrinterItem } from '../types';
import { toPersianDigits } from '../utils/formatters';
import { playNewOrderChime } from '../utils/audioAlert';

interface PrinterSettingsPanelProps {
  storeSettings: StoreSettings;
  setStoreSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
}

export const PrinterSettingsPanel: React.FC<PrinterSettingsPanelProps> = ({
  storeSettings,
  setStoreSettings
}) => {
  const [successMsg, setSuccessMsg] = useState('');

  // Default initial settings fallback
  const initialSettings: PrinterSettings = storeSettings.printerSettings || {
    autoPrintEnabled: true,
    soundAlertEnabled: true,
    printers: [
      {
        id: 'printer-default-1',
        name: 'چاپگر حرارتی فاکتور مشتری (۸۰ میلی‌متری)',
        type: 'thermal_80mm',
        connectionType: 'browser_print',
        isDefault: true,
        autoPrintNewOrders: true,
        copies: 1,
        printHeader: 'فروشگاه پمپینو - فاکتور نهایی سفارش مشتری',
        printFooter: 'با تشکر از اعتماد شما به بازرگانی صنعت آبرسان پمپینو',
        enabled: true
      },
      {
        id: 'printer-default-2',
        name: 'چاپگر دفتر و انبار (A4 / A5)',
        type: 'a4_invoice',
        connectionType: 'browser_print',
        isDefault: false,
        autoPrintNewOrders: false,
        copies: 1,
        printHeader: 'بازرگانی صنعت آبرسان پمپینو',
        printFooter: 'تلفن تماس: ۰۲۱-۳۳۹۸۷۶۵۴ | آدرس: تهران، سعدی جنوبی',
        enabled: true
      }
    ]
  };

  const [printerSettings, setPrinterSettings] = useState<PrinterSettings>(initialSettings);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStoreSettings(prev => ({
      ...prev,
      printerSettings
    }));
    setSuccessMsg('تنظیمات چاپگرها و چاپ خودکار با موفقیت ذخیره گردید.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleAddPrinter = () => {
    if (printerSettings.printers.length >= 15) {
      alert('حداکثر ۱۵ چاپگر می‌توانید در سیستم تعریف نمایید.');
      return;
    }

    const newPrinter: PrinterItem = {
      id: `printer-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: `چاپگر جدید ${toPersianDigits(printerSettings.printers.length + 1)}`,
      type: 'thermal_80mm',
      connectionType: 'browser_print',
      isDefault: printerSettings.printers.length === 0,
      autoPrintNewOrders: false,
      copies: 1,
      printHeader: storeSettings.storeName || 'فروشگاه پمپینو',
      printFooter: 'با تشکر از سفارش شما',
      enabled: true
    };

    setPrinterSettings(prev => ({
      ...prev,
      printers: [...prev.printers, newPrinter]
    }));
  };

  const handleUpdatePrinter = (id: string, field: keyof PrinterItem, value: any) => {
    setPrinterSettings(prev => ({
      ...prev,
      printers: prev.printers.map(p => {
        if (p.id === id) {
          return { ...p, [field]: value };
        }
        // If making this printer default, unset default for others
        if (field === 'isDefault' && value === true && p.id !== id) {
          return { ...p, isDefault: false };
        }
        return p;
      })
    }));
  };

  const handleDeletePrinter = (id: string) => {
    if (printerSettings.printers.length <= 1) {
      if (!window.confirm('آیا از حذف تنها چاپگر تعریف شده اطمینان دارید؟')) return;
    }
    const updated = printerSettings.printers.filter(p => p.id !== id);
    // Ensure at least one printer is default if list not empty
    if (updated.length > 0 && !updated.some(p => p.isDefault)) {
      updated[0].isDefault = true;
    }
    setPrinterSettings(prev => ({ ...prev, printers: updated }));
  };

  const handleTestPrint = (printer: PrinterItem) => {
    const testWindow = window.open('', '_blank', 'width=600,height=700');
    if (!testWindow) {
      alert('مرورگر شما مانع باز شدن پنجره چاپ شد. لطفاً پاپ‌آپ‌های سایت را مجاز نمایید.');
      return;
    }

    const isThermal = printer.type === 'thermal_80mm' || printer.type === 'thermal_58mm';
    const paperWidth = printer.type === 'thermal_58mm' ? '58mm' : printer.type === 'thermal_80mm' ? '80mm' : '100%';

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
      <head>
        <meta charset="utf-8">
        <title>برگه تست صحت چاپ - ${printer.name}</title>
        <style>
          @import url('https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css');
          body { 
            font-family: Vazirmatn, Tahoma, Arial, sans-serif; 
            padding: ${isThermal ? '10px' : '25px'}; 
            max-width: ${paperWidth}; 
            margin: 0 auto;
            font-size: ${isThermal ? '11px' : '13px'}; 
            line-height: 1.6; 
            color: #0f172a; 
          }
          .header { 
            border-bottom: 2px dashed #0284c7; 
            padding-bottom: 10px; 
            margin-bottom: 12px; 
            text-align: center; 
          }
          .title { font-weight: 900; font-size: ${isThermal ? '14px' : '18px'}; color: #0369a1; }
          .subtitle { font-size: 11px; color: #64748b; margin-top: 3px; }
          .info-box { background: #f0f9ff; border: 1px solid #bae6fd; padding: 10px; border-radius: 8px; margin: 10px 0; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
          .footer { border-top: 1px dashed #cbd5e1; padding-top: 10px; margin-top: 15px; text-align: center; font-size: 10px; color: #475569; }
          .btn-container { text-align: center; margin-top: 20px; }
          .btn { background: #0284c7; color: white; padding: 10px 20px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 13px; }
          @media print { .btn-container { display: none !important; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${printer.printHeader || storeSettings.storeName}</div>
          <div class="subtitle">[ برگه آزمایش و تست صحت عملکرد چاپگر ]</div>
        </div>

        <div class="info-box">
          <div class="info-row"><span>نام چاپگر:</span> <strong>${printer.name}</strong></div>
          <div class="info-row"><span>مدل خروجی:</span> <strong>${printer.type === 'thermal_80mm' ? 'حرارتی ۸۰ میلی‌متری' : printer.type === 'thermal_58mm' ? 'حرارتی ۵۸ میلی‌متری' : printer.type === 'a4_invoice' ? 'فاکتور A4' : printer.type === 'a5_invoice' ? 'فاکتور A5' : 'لیبل برچسب باربری'}</strong></div>
          <div class="info-row"><span>درگاه اتصال:</span> <strong>${printer.connectionType === 'network_ip' ? `IP تحت شبکه (${printer.ipAddress || '192.168.1.200'})` : printer.connectionType === 'usb_serial' ? 'USB / سریال مستقیم' : 'چاپگر سیستم (مرورگر)'}</strong></div>
          <div class="info-row"><span>تعداد نسخه:</span> <strong>${printer.copies || 1} نسخه</strong></div>
          <div class="info-row"><span>تاریخ تست:</span> <strong>${new Date().toLocaleDateString('fa-IR')} - ${new Date().toLocaleTimeString('fa-IR')}</strong></div>
        </div>

        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 8px; border-radius: 8px; text-align: center; font-weight: bold;">
          ✔ ارتباط با چاپگر برقرار است و آماده چاپ اتوماتیک فاکتور مشتریان می‌باشد.
        </div>

        <div class="footer">
          ${printer.printFooter || 'پمپینو - مرجع تخصصی تامین پمپ و قطعات یدکی'}
        </div>

        <div class="btn-container">
          <button class="btn" onclick="window.print()">شروع پرینت نمونه</button>
        </div>

        <script>
          setTimeout(() => { window.print(); }, 600);
        </script>
      </body>
      </html>
    `;

    testWindow.document.write(html);
    testWindow.document.close();
  };

  const handleTestChime = () => {
    playNewOrderChime();
    setSuccessMsg('صدای هشدار ورود سفارش جدید پخش گردید.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Printer className="w-6 h-6 text-sky-600" />
            <span>مدیریت اتصال چاپگرها و تنظیمات چاپ خودکار فاکتور (Multi-Printer Setup)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            امکان وصل کردن انواع چاپگرهای حرارتی (۸۰mm / ۵۸mm)، چاپگرهای A4 و A5 دفتر، چاپگرهای تحت شبکه (Network IP) و چاپ اتوماتیک فاکتور سفارشات جدید
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddPrinter}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ افزودن چاپگر جدید</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>ذخیره تنظیمات چاپگرها</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-100 text-emerald-900 p-4 rounded-2xl border border-emerald-300 font-bold text-xs flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Global Master Settings Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Toggle 1: Auto Print on New Order */}
        <div className={`p-5 rounded-2xl border-2 transition ${
          printerSettings.autoPrintEnabled 
            ? 'bg-sky-50/70 border-sky-400 text-sky-950' 
            : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <label htmlFor="autoPrintEnabledToggle" className="font-extrabold text-sm flex items-center gap-2 cursor-pointer">
                <Printer className={`w-5 h-5 ${printerSettings.autoPrintEnabled ? 'text-sky-600' : 'text-slate-400'}`} />
                <span>چاپ خودکار فاکتور به محض ثبت سفارش جدید</span>
              </label>
              <p className="text-xs text-slate-600 leading-relaxed">
                وقتی مشتری در سایت یا برنامه سفارش جدید ثبت می‌کند، فاکتور خرید فوراً برای چاپگر پیش‌فرض فرستاده می‌شود.
              </p>
            </div>

            <button
              id="autoPrintEnabledToggle"
              type="button"
              onClick={() => setPrinterSettings(prev => ({ ...prev, autoPrintEnabled: !prev.autoPrintEnabled }))}
              className={`w-14 h-8 flex items-center rounded-full p-1 transition cursor-pointer shrink-0 ${
                printerSettings.autoPrintEnabled ? 'bg-sky-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="w-6 h-6 bg-white rounded-full shadow-md"></div>
            </button>
          </div>
        </div>

        {/* Toggle 2: Sound Alert Chime on New Order */}
        <div className={`p-5 rounded-2xl border-2 transition ${
          printerSettings.soundAlertEnabled 
            ? 'bg-emerald-50/70 border-emerald-400 text-emerald-950' 
            : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="soundAlertEnabledToggle" className="font-extrabold text-sm flex items-center gap-2 cursor-pointer">
                  {printerSettings.soundAlertEnabled ? (
                    <Volume2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-slate-400" />
                  )}
                  <span>پخش صدای هشدار ورود سفارش جدید</span>
                </label>

                <button
                  type="button"
                  onClick={handleTestChime}
                  className="text-[11px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg transition"
                >
                  🔊 تست صدا
                </button>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                هنگام دریافت پیش‌فاکتور جدید از سمت خریداران، چایم هشداری از بلندگوی سیستم جهت مطلع شدن کاربر پخش می‌شود.
              </p>
            </div>

            <button
              id="soundAlertEnabledToggle"
              type="button"
              onClick={() => setPrinterSettings(prev => ({ ...prev, soundAlertEnabled: !prev.soundAlertEnabled }))}
              className={`w-14 h-8 flex items-center rounded-full p-1 transition cursor-pointer shrink-0 ${
                printerSettings.soundAlertEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="w-6 h-6 bg-white rounded-full shadow-md"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Connected Printers List (Multi-Printer Management) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Monitor className="w-5 h-5 text-sky-600" />
            <span>لیست چاپگرهای متصل به سیستم ({toPersianDigits(printerSettings.printers.length)} چاپگر):</span>
          </h4>

          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            پشتیبانی از انواع چاپگرهای حرارتی، لیزری و شبکه IP
          </span>
        </div>

        <div className="space-y-6">
          {printerSettings.printers.map((printer, index) => (
            <div 
              key={printer.id}
              className={`bg-white rounded-2xl border-2 p-5 space-y-4 relative transition shadow-xs ${
                printer.isDefault 
                  ? 'border-sky-500 ring-2 ring-sky-100 bg-sky-50/20' 
                  : 'border-slate-200'
              }`}
            >
              {/* Card Title Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 bg-sky-600 text-white rounded-full font-mono font-extrabold flex items-center justify-center text-xs">
                    {toPersianDigits(index + 1)}
                  </span>
                  <input
                    type="text"
                    value={printer.name}
                    onChange={(e) => handleUpdatePrinter(printer.id, 'name', e.target.value)}
                    className="font-black text-slate-900 text-sm bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 focus:bg-white w-64 md:w-80"
                    placeholder="نام چاپگر..."
                  />

                  {printer.isDefault && (
                    <span className="bg-sky-600 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs">
                      <Check className="w-3.5 h-3.5" />
                      <span>چاپگر اصلی و پیش‌فرض</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTestPrint(printer)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer shadow-xs"
                    title="ارسال برگه آزمایشی به این چاپگر"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>تست پرینت زنده</span>
                  </button>

                  {!printer.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleUpdatePrinter(printer.id, 'isDefault', true)}
                      className="px-3 py-1.5 bg-sky-100 text-sky-800 hover:bg-sky-200 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      تنظیم به عنوان پیش‌فرض
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeletePrinter(printer.id)}
                    className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    title="حذف چاپگر"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Printer Options Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                {/* Field 1: Printer Paper Format Type */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">نوع کاغذ و مدل چاپگر:</label>
                  <select
                    value={printer.type}
                    onChange={(e) => handleUpdatePrinter(printer.id, 'type', e.target.value as PrinterItem['type'])}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900"
                  >
                    <option value="thermal_80mm">حرارتی ۸۰ میلی‌متری (فاکتورخوان استاندارد)</option>
                    <option value="thermal_58mm">حرارتی ۵۸ میلی‌متری (فیش پرینتر کوچک)</option>
                    <option value="a4_invoice">فاکتور A4 رسمی (پرینتر لیزری/جوهر افشان)</option>
                    <option value="a5_invoice">فاکتور A5 دفتر و انبار</option>
                    <option value="label_printer">چاپگر لیبل برچسبی (آدرس باربری)</option>
                  </select>
                </div>

                {/* Field 2: Connection Interface */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">روش اتصال چاپگر:</label>
                  <select
                    value={printer.connectionType}
                    onChange={(e) => handleUpdatePrinter(printer.id, 'connectionType', e.target.value as PrinterItem['connectionType'])}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900"
                  >
                    <option value="browser_print">چاپگر متصل به سیستم (Browser Print)</option>
                    <option value="network_ip">چاپگر تحت شبکه IP/LAN (پرینتر وای‌فای/کابل شبکه)</option>
                    <option value="usb_serial">پورت مستقیم USB / سریال (Com Port)</option>
                  </select>
                </div>

                {/* Field 3: IP Address if Network IP */}
                {printer.connectionType === 'network_ip' ? (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">آدرس IP شبکه چاپگر:</label>
                    <input
                      type="text"
                      placeholder="192.168.1.200"
                      value={printer.ipAddress || ''}
                      onChange={(e) => handleUpdatePrinter(printer.id, 'ipAddress', e.target.value)}
                      className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 dir-ltr text-center"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">تعداد نسخه چاپ همزمان:</label>
                    <select
                      value={printer.copies || 1}
                      onChange={(e) => handleUpdatePrinter(printer.id, 'copies', parseInt(e.target.value))}
                      className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900"
                    >
                      <option value={1}>۱ نسخه (مخصوص مشتری)</option>
                      <option value={2}>۲ نسخه (مشتری + بایگانی انبار)</option>
                      <option value={3}>۳ نسخه (مشتری + انبار + حسابداری)</option>
                    </select>
                  </div>
                )}

                {/* Field 4: Auto Print Toggle for this printer */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">چاپ خودکار برای این پرینتر:</label>
                  <button
                    type="button"
                    onClick={() => handleUpdatePrinter(printer.id, 'autoPrintNewOrders', !printer.autoPrintNewOrders)}
                    className={`w-full p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                      printer.autoPrintNewOrders
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-slate-100 border-slate-200 text-slate-500'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                    <span>{printer.autoPrintNewOrders ? 'ارسال خودکار فعال است' : 'فقط چاپ دستی'}</span>
                  </button>
                </div>
              </div>

              {/* Custom Header & Footer Texts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">عنوان سربرگ برگه چاپ:</label>
                  <input
                    type="text"
                    value={printer.printHeader || ''}
                    onChange={(e) => handleUpdatePrinter(printer.id, 'printHeader', e.target.value)}
                    className="w-full bg-white p-2 rounded-lg border border-slate-300 text-slate-800"
                    placeholder="مثلاً: فروشگاه پمپینو - پیش‌فاکتور رسمی"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">متن پاورقی برگه چاپ:</label>
                  <input
                    type="text"
                    value={printer.printFooter || ''}
                    onChange={(e) => handleUpdatePrinter(printer.id, 'printFooter', e.target.value)}
                    className="w-full bg-white p-2 rounded-lg border border-slate-300 text-slate-800"
                    placeholder="مثلاً: تلفن تماس: ۰۲۱-۳۳۹۸۷۶۵۴ - با تشکر از خرید شما"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions & Hardware Guide */}
      <div className="bg-sky-50/80 border border-sky-200 rounded-2xl p-5 space-y-3 text-xs text-sky-950">
        <h4 className="font-extrabold text-sm flex items-center gap-2 text-sky-900">
          <ShieldCheck className="w-5 h-5 text-sky-600" />
          <span>راهنمای راه اندازی چاپگرهای حرارتی (Thermal Printers) و شبکه در سیستم پمپینو:</span>
        </h4>

        <ul className="list-disc list-inside space-y-1.5 text-slate-700 leading-relaxed">
          <li><strong>چاپگرهای حرارتی فاکتورخوان (۸۰mm):</strong> پرینترهای Bixolon, Sewoo, Oscar, Zec, Axiom و بهینه از طریق درگاه USB یا شبکه قابل اتصال می‌باشند.</li>
          <li><strong>تنظیم چاپ بدون تایید (Silent Printing):</strong> در مرورگر Google Chrome با افزودن سوئیچ <code className="bg-sky-100 px-1 py-0.5 rounded font-mono text-sky-900">--kiosk-printing</code> به شورتکات مرورگر، فاکتورها بدون نمایش پنجره تأیید مرورگر مستقیماً چاپ می‌شوند.</li>
          <li><strong>چاپ همزمان در چند دستگاه:</strong> می‌توانید یک چاپگر حرارتی را در انبار و یک چاپگر A4 را در دفتر قرار داده و برای هر یک الگوی مشخص تعریف کنید.</li>
        </ul>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-5 h-5" />
          <span>ذخیره کلیه تنظیمات و اتصال چاپگرها</span>
        </button>
      </div>
    </form>
  );
};
