import React, { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle2, 
  Globe, 
  Lock, 
  Power,
  Check
} from 'lucide-react';
import { StoreSettings, PaymentSettings, PaymentGatewayItem } from '../types';
import { toPersianDigits } from '../utils/formatters';

interface PaymentSettingsPanelProps {
  storeSettings: StoreSettings;
  setStoreSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
}

export const PaymentSettingsPanel: React.FC<PaymentSettingsPanelProps> = ({
  storeSettings,
  setStoreSettings
}) => {
  const [successMsg, setSuccessMsg] = useState('');

  const initialSettings: PaymentSettings = storeSettings.paymentSettings || {
    onlineGatewaysEnabled: true,
    cardToCardEnabled: true,
    gateways: [
      {
        id: 'gw-zarinpal-1',
        name: 'درگاه پرداخت اینترنتی زرین‌پال (ZarinPal)',
        code: 'zarinpal',
        merchantId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        enabled: true,
        isDefault: true,
        description: 'پرداخت امن با کلیه کارت‌های عضو شتاب'
      },
      {
        id: 'gw-idpay-2',
        name: 'درگاه پرداخت آیدی‌پی (IDPay)',
        code: 'idpay',
        merchantId: 'idpay_merchant_1001',
        enabled: true,
        isDefault: false,
        description: 'درگاه واسط پرداخت آنلاین شاپرک'
      },
      {
        id: 'gw-mellat-3',
        name: 'درگاه اختصاصی بانک ملت (به پرداخت)',
        code: 'mellat',
        merchantId: '1234567',
        terminalId: '7654321',
        enabled: false,
        isDefault: false,
        description: 'درگاه مستقیم بانک ملت'
      }
    ]
  };

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(initialSettings);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStoreSettings(prev => ({
      ...prev,
      paymentSettings
    }));
    setSuccessMsg('تنظیمات درگاه‌های پرداخت آنلاین با موفقیت ذخیره گردید.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleAddGateway = () => {
    const newGateway: PaymentGatewayItem = {
      id: `gw-${Date.now()}`,
      name: 'درگاه جدید آنلاین',
      code: 'zarinpal',
      merchantId: '',
      enabled: true,
      isDefault: paymentSettings.gateways.length === 0,
      description: 'پرداخت مستقیم با کارت‌های شتاب'
    };

    setPaymentSettings(prev => ({
      ...prev,
      gateways: [...prev.gateways, newGateway]
    }));
  };

  const handleUpdateGateway = (id: string, field: keyof PaymentGatewayItem, value: any) => {
    setPaymentSettings(prev => ({
      ...prev,
      gateways: prev.gateways.map(g => {
        if (g.id === id) {
          return { ...g, [field]: value };
        }
        if (field === 'isDefault' && value === true && g.id !== id) {
          return { ...g, isDefault: false };
        }
        return g;
      })
    }));
  };

  const handleDeleteGateway = (id: string) => {
    if (paymentSettings.gateways.length <= 1) {
      if (!window.confirm('آیا از حذف تنها درگاه تعریف شده اطمینان دارید؟')) return;
    }
    const updated = paymentSettings.gateways.filter(g => g.id !== id);
    if (updated.length > 0 && !updated.some(g => g.isDefault)) {
      updated[0].isDefault = true;
    }
    setPaymentSettings(prev => ({ ...prev, gateways: updated }));
  };

  return (
    <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-600" />
            <span>مدیریت درگاه‌های پرداخت آنلاین و کارت‌به‌کارت (Multi Gateway Setup)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            امکان فعال‌سازی/غیرفعال‌سازی و پیکربندی چندین درگاه پرداخت شاپرک (زرین‌پال، آیدی‌پی، نکست‌پی، به پرداخت ملت، پارسیان، سامان، آسان‌پرداخت)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddGateway}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ افزودن درگاه جدید</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>ذخیره تنظیمات درگاه‌ها</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-100 text-emerald-900 p-4 rounded-2xl border border-emerald-300 font-bold text-xs flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Global Payment Switches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Switch 1: Online Gateways Global Enable */}
        <div className={`p-5 rounded-2xl border-2 transition ${
          paymentSettings.onlineGatewaysEnabled 
            ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950' 
            : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <label htmlFor="onlineGatewaysToggle" className="font-extrabold text-sm flex items-center gap-2 cursor-pointer">
                <Globe className={`w-5 h-5 ${paymentSettings.onlineGatewaysEnabled ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>فعال‌سازی درگاه پرداخت آنلاین (شاپرک)</span>
              </label>
              <p className="text-xs text-slate-600 leading-relaxed">
                مشتریان می‌توانند هنگام ثبت سفارش مستقیماً از طریق درگاه‌های شتاب آنلاین واریز را انجام دهند.
              </p>
            </div>

            <button
              id="onlineGatewaysToggle"
              type="button"
              onClick={() => setPaymentSettings(prev => ({ ...prev, onlineGatewaysEnabled: !prev.onlineGatewaysEnabled }))}
              className={`w-14 h-8 flex items-center rounded-full p-1 transition cursor-pointer shrink-0 ${
                paymentSettings.onlineGatewaysEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="w-6 h-6 bg-white rounded-full shadow-md"></div>
            </button>
          </div>
        </div>

        {/* Switch 2: Card to Card Transfer Global Enable */}
        <div className={`p-5 rounded-2xl border-2 transition ${
          paymentSettings.cardToCardEnabled 
            ? 'bg-sky-50/80 border-sky-400 text-sky-950' 
            : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <label htmlFor="cardToCardToggle" className="font-extrabold text-sm flex items-center gap-2 cursor-pointer">
                <CreditCard className={`w-5 h-5 ${paymentSettings.cardToCardEnabled ? 'text-sky-600' : 'text-slate-400'}`} />
                <span>امکان واریز کارت به کارت / حساب بانکی</span>
              </label>
              <p className="text-xs text-slate-600 leading-relaxed">
                مشتری می‌تواند شماره کارت یا شبا فروشگاه را مشاهده کرده و فیش واریزی خود را ثبت کند.
              </p>
            </div>

            <button
              id="cardToCardToggle"
              type="button"
              onClick={() => setPaymentSettings(prev => ({ ...prev, cardToCardEnabled: !prev.cardToCardEnabled }))}
              className={`w-14 h-8 flex items-center rounded-full p-1 transition cursor-pointer shrink-0 ${
                paymentSettings.cardToCardEnabled ? 'bg-sky-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="w-6 h-6 bg-white rounded-full shadow-md"></div>
            </button>
          </div>
        </div>
      </div>

      {/* List of Gateways */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600" />
            <span>لیست درگاه‌های متصل ({toPersianDigits(paymentSettings.gateways.length)} درگاه):</span>
          </h4>

          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            پشتیبانی از پروتکل SSL و توکن‌های شاپرک
          </span>
        </div>

        <div className="space-y-6">
          {paymentSettings.gateways.map((gw, index) => (
            <div 
              key={gw.id}
              className={`bg-white rounded-2xl border-2 p-5 space-y-4 relative transition shadow-xs ${
                gw.isDefault 
                  ? 'border-emerald-500 ring-2 ring-emerald-100 bg-emerald-50/20' 
                  : 'border-slate-200'
              }`}
            >
              {/* Header inside gateway card */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 bg-emerald-600 text-white rounded-full font-mono font-extrabold flex items-center justify-center text-xs">
                    {toPersianDigits(index + 1)}
                  </span>

                  <input
                    type="text"
                    value={gw.name}
                    onChange={(e) => handleUpdateGateway(gw.id, 'name', e.target.value)}
                    className="font-black text-slate-900 text-sm bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 focus:bg-white w-64 md:w-80"
                    placeholder="نام درگاه..."
                  />

                  {gw.isDefault && (
                    <span className="bg-emerald-600 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs">
                      <Check className="w-3.5 h-3.5" />
                      <span>درگاه پیش‌فرض</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateGateway(gw.id, 'enabled', !gw.enabled)}
                    className={`px-3 py-1.5 font-extrabold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer ${
                      gw.enabled 
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{gw.enabled ? 'فعال است' : 'غیرفعال'}</span>
                  </button>

                  {!gw.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleUpdateGateway(gw.id, 'isDefault', true)}
                      className="px-3 py-1.5 bg-sky-100 text-sky-800 hover:bg-sky-200 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      تنظیم پیش‌فرض
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteGateway(gw.id)}
                    className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    title="حذف درگاه"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Form Controls inside Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ارائه‌دهنده درگاه پرداخت:</label>
                  <select
                    value={gw.code}
                    onChange={(e) => handleUpdateGateway(gw.id, 'code', e.target.value as PaymentGatewayItem['code'])}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900"
                  >
                    <option value="zarinpal">زرین‌پال (ZarinPal)</option>
                    <option value="idpay">آیدی‌پی (IDPay)</option>
                    <option value="nextpay">نکست‌پای (NextPay)</option>
                    <option value="mellat">بانک ملت (به پرداخت)</option>
                    <option value="parsian">بانک پارسیان (تاپ)</option>
                    <option value="saman">بانک سامان (سپ)</option>
                    <option value="asanpardakht">آسان پرداخت (آپ)</option>
                    <option value="custom">درگاه اختصاصی سفارشی</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">کد مرچنت / شناسه پذیرنده (Merchant ID):</label>
                  <input
                    type="text"
                    value={gw.merchantId}
                    onChange={(e) => handleUpdateGateway(gw.id, 'merchantId', e.target.value)}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 dir-ltr text-center"
                    placeholder="مثلاً: zarinpal-merchant-code"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">شماره ترمینال / API Key (اختیاری):</label>
                  <input
                    type="text"
                    value={gw.terminalId || ''}
                    onChange={(e) => handleUpdateGateway(gw.id, 'terminalId', e.target.value)}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 dir-ltr text-center"
                    placeholder="Terminal ID یا API Key"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 text-xs">توضیحات نمایش داده شده به مشتری:</label>
                <input
                  type="text"
                  value={gw.description || ''}
                  onChange={(e) => handleUpdateGateway(gw.id, 'description', e.target.value)}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800"
                  placeholder="مثلاً: تسویه آنی با کلیه کارت‌های بانکی عضو شبکه شتاب"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-5 h-5" />
          <span>ذخیره کلیه تنظیمات درگاه‌های پرداخت</span>
        </button>
      </div>
    </form>
  );
};
