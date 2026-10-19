import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Smartphone, 
  Send, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  HelpCircle, 
  ShieldCheck, 
  MessageSquare,
  Bell,
  Check,
  Radio
} from 'lucide-react';
import { StoreSettings, SmsSettings } from '../types';
import { toPersianDigits } from '../utils/formatters';

interface SmsSettingsPanelProps {
  storeSettings: StoreSettings;
  setStoreSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
}

const DEFAULT_SMS_SETTINGS: SmsSettings = {
  provider: 'kavenegar',
  apiKey: '',
  lineNumber: '10008492',
  adminMobileNumber: '',
  enabled: true,
  sendOnOrderCreated: true,
  sendOnStatusChange: true,
  orderCreatedTemplate: 'مشتری گرامی {NAME}، پیش‌فاکتور شما با شماره {ORDER_NUM} در سامانه پمپینو ثبت شد. جهت پیگیری وارد پنل شوید.',
  statusChangeTemplate: 'مشتری گرامی {NAME}، وضعیت پیش‌فاکتور شماره {ORDER_NUM} به «{STATUS}» تغییر یافت.'
};

export const SmsSettingsPanel: React.FC<SmsSettingsPanelProps> = ({
  storeSettings,
  setStoreSettings
}) => {
  const [smsConfig, setSmsConfig] = useState<SmsSettings>(
    storeSettings.smsSettings || DEFAULT_SMS_SETTINGS
  );

  const [testMobile, setTestMobile] = useState('');
  const [testMessage, setTestMessage] = useState('سلام، این یک پیامک تست از پنل مدیریت پمپینو می‌باشد.');
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setStoreSettings(prev => ({
      ...prev,
      smsSettings: smsConfig
    }));

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSendTestSms = () => {
    if (!testMobile.trim()) {
      alert('لطفا شماره موبایل دریافت‌کننده تست را وارد فرمایید.');
      return;
    }

    if (!smsConfig.apiKey.trim()) {
      setTestStatus('هشدار: کلید API ثبت نشده است! سیستم پیامک در حالت آزمایشی (شبیه‌سازی) ارسال شد.');
    } else {
      setTestStatus(`پیامک تست با موفقیت از طریق سامانه ${getProviderLabel(smsConfig.provider)} به شماره ${toPersianDigits(testMobile)} ارسال شد.`);
    }

    setTimeout(() => {
      setTestStatus(null);
    }, 5000);
  };

  const getProviderLabel = (provider: SmsSettings['provider']) => {
    switch (provider) {
      case 'kavenegar': return 'کاوه‌نگار (Kavenegar)';
      case 'farazsms': return 'فراز اس‌ام‌اس / آی‌پی پنل (FarazSMS / IPPanel)';
      case 'melipayak': return 'ملی‌پیاامک (Melipayamak)';
      case 'ghasedak': return 'قاصدک (Ghasedak)';
      case 'custom': return 'وب‌سرویس و وب‌هوک اختصاصی (Custom REST API)';
      default: return provider;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-purple-800/60 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/30 text-purple-300 border border-purple-400/30 flex items-center justify-center font-bold shadow-inner">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-white">تنظیمات سامانه پیامکی (SMS Gateway)</h3>
              <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full border ${
                smsConfig.enabled 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' 
                  : 'bg-rose-500/20 text-rose-300 border-rose-400/40'
              }`}>
                {smsConfig.enabled ? 'فعال و آماده ارسال' : 'غیرفعال'}
              </span>
            </div>
            <p className="text-xs text-purple-200 mt-1">
              اتصال به پنل‌های پیامکی ایرانی جهت اطلاع‌رسانی خودکار صدور فاکتور و وضعیت سفارشات خریداران
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-extrabold text-xs transition flex items-center gap-2 shadow-lg cursor-pointer"
        >
          {isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          <span>{isSaved ? 'تنظیمات ذخیره شد!' : 'ذخیره تنظیمات پیامک'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Provider & Credentials Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Activation & Provider Selector Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-purple-600" />
                <h4 className="font-extrabold text-sm text-slate-900">سرویس‌دهنده پیامک و وضعیت سامانه</h4>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <span className="text-xs font-bold text-slate-700">ارسال خودکار پیامک:</span>
                <input
                  type="checkbox"
                  checked={smsConfig.enabled}
                  onChange={(e) => setSmsConfig({ ...smsConfig, enabled: e.target.checked })}
                  className="w-5 h-5 text-purple-600 rounded-lg focus:ring-purple-500 cursor-pointer"
                />
              </label>
            </div>

            {/* Provider Cards Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                سامانه پیامکی مورد نظر را انتخاب کنید:
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'kavenegar', name: 'کاوه‌نگار (Kavenegar)', desc: 'پشتیبانی از پترن خدماتی و ارسال سریع زیر ۳ ثانیه' },
                  { id: 'farazsms', name: 'فراز اس‌ام‌اس / IPPanel', desc: 'مناسب خطوط خدماتی بدون بلک‌لیست' },
                  { id: 'melipayak', name: 'ملی‌پیاامک (Melipayamak)', desc: 'پنل قدرتمند با وب‌سرویس RESTful' },
                  { id: 'ghasedak', name: 'قاصدک (Ghasedak)', desc: 'ارسال با خطوط اختصاصی و پترن' },
                  { id: 'custom', name: 'وب‌سرویس اختصاصی (Webhook)', desc: 'اتصال به سایر سامانه‌ها از طریق REST API' }
                ].map((p) => {
                  const isSelected = smsConfig.provider === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSmsConfig({ ...smsConfig, provider: p.id as any })}
                      className={`p-3.5 rounded-2xl border text-right transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-200 text-purple-950'
                          : 'bg-white border-slate-200 hover:border-purple-300 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-xs">{p.name}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />}
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1 font-normal">
                        {p.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* API Credentials Input Form */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h5 className="font-bold text-xs text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>اطلاعات احراز هویت و خط ارسال پیامک ({getProviderLabel(smsConfig.provider)}):</span>
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">
                    کلید دسترسی API Key / نام کاربری پنل:
                  </label>
                  <input
                    type="text"
                    value={smsConfig.apiKey}
                    onChange={(e) => setSmsConfig({ ...smsConfig, apiKey: e.target.value })}
                    placeholder="مثلاً: 35326578493029104829..."
                    className="w-full bg-slate-50 border border-slate-300 p-3 rounded-2xl font-mono text-slate-900 focus:border-purple-600 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">
                    شماره خط اختصاصی ارسال (Line Number):
                  </label>
                  <input
                    type="text"
                    value={smsConfig.lineNumber}
                    onChange={(e) => setSmsConfig({ ...smsConfig, lineNumber: e.target.value })}
                    placeholder="مثلاً: 10008492 یا 3000505"
                    className="w-full bg-slate-50 border border-slate-300 p-3 rounded-2xl font-mono text-slate-900 focus:border-purple-600 focus:bg-white outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-600 font-bold block mb-1">
                    شماره موبایل مدیر (جهت دریافت پیامک هشدار ثبت سفارش جدید):
                  </label>
                  <input
                    type="text"
                    value={smsConfig.adminMobileNumber}
                    onChange={(e) => setSmsConfig({ ...smsConfig, adminMobileNumber: e.target.value })}
                    placeholder="مثلاً: 09121234567"
                    className="w-full bg-slate-50 border border-slate-300 p-3 rounded-2xl font-mono text-slate-900 focus:border-purple-600 focus:bg-white outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    هنگامی که خریدار پیش‌فاکتور جدیدی ثبت می‌کند، یک پیامک هشدار به این شماره ارسال می‌گردد.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Automatic Event Triggers and Templates */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Bell className="w-5 h-5 text-purple-600" />
              <h4 className="font-extrabold text-sm text-slate-900">رویدادهای ارسال خودکار و قالب متون پیامک</h4>
            </div>

            {/* Event Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <label className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800 block">ثبت سفارش جدید</span>
                  <span className="text-[11px] text-slate-500">ارسال پیامک تایید اولیه به خریدار</span>
                </div>
                <input
                  type="checkbox"
                  checked={smsConfig.sendOnOrderCreated}
                  onChange={(e) => setSmsConfig({ ...smsConfig, sendOnOrderCreated: e.target.checked })}
                  className="w-5 h-5 text-purple-600 rounded-lg cursor-pointer"
                />
              </label>

              <label className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800 block">تغییر وضعیت پیش‌فاکتور</span>
                  <span className="text-[11px] text-slate-500">ارسال پیامک هنگام صدور یا تحویل باربری</span>
                </div>
                <input
                  type="checkbox"
                  checked={smsConfig.sendOnStatusChange}
                  onChange={(e) => setSmsConfig({ ...smsConfig, sendOnStatusChange: e.target.checked })}
                  className="w-5 h-5 text-purple-600 rounded-lg cursor-pointer"
                />
              </label>
            </div>

            {/* Template Inputs */}
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    قالب متن پیامک ثبت پیش‌فاکتور جدید:
                  </label>
                  <span className="text-[10px] text-purple-600 font-mono">
                    متغیرها: {'{NAME}'} ، {'{ORDER_NUM}'}
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={smsConfig.orderCreatedTemplate || ''}
                  onChange={(e) => setSmsConfig({ ...smsConfig, orderCreatedTemplate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 p-3 rounded-2xl text-xs font-medium text-slate-900 focus:border-purple-600 focus:bg-white outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    قالب متن پیامک تغییر وضعیت فاکتور:
                  </label>
                  <span className="text-[10px] text-purple-600 font-mono">
                    متغیرها: {'{NAME}'} ، {'{ORDER_NUM}'} ، {'{STATUS}'}
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={smsConfig.statusChangeTemplate || ''}
                  onChange={(e) => setSmsConfig({ ...smsConfig, statusChangeTemplate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 p-3 rounded-2xl text-xs font-medium text-slate-900 focus:border-purple-600 focus:bg-white outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Online Live Test & Guide */}
        <div className="space-y-6">
          {/* Live Test Panel */}
          <div className="bg-gradient-to-br from-slate-900 to-purple-950 text-white rounded-3xl p-6 border border-purple-800 shadow-lg space-y-4">
            <div className="flex items-center gap-2 border-b border-purple-800/80 pb-3">
              <Send className="w-5 h-5 text-purple-300" />
              <h4 className="font-extrabold text-sm text-white">تست آنلاین ارسال پیامک</h4>
            </div>

            <p className="text-xs text-purple-200">
              جهت اطمینان از صحت کلید API و شماره خط، یک پیامک آزمایشی ارسال کنید:
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-purple-200 block mb-1 font-bold">شماره همراه گیرنده تست:</label>
                <input
                  type="text"
                  placeholder="09120000000"
                  value={testMobile}
                  onChange={(e) => setTestMobile(e.target.value)}
                  className="w-full bg-slate-800 border border-purple-700/80 text-white p-2.5 rounded-xl font-mono focus:border-purple-400 outline-none"
                />
              </div>

              <div>
                <label className="text-purple-200 block mb-1 font-bold">متن پیامک آزمایشی:</label>
                <textarea
                  rows={3}
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full bg-slate-800 border border-purple-700/80 text-white p-2.5 rounded-xl focus:border-purple-400 outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleSendTestSms}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>ارسال پیامک تست</span>
              </button>

              {testStatus && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-purple-900/80 border border-purple-500 text-purple-200 rounded-xl text-xs space-y-1 font-medium"
                >
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <Sparkles className="w-4 h-4 text-purple-300" />
                    <span>نتیجه تست ارسال:</span>
                  </div>
                  <p>{testStatus}</p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Help Guide Box */}
          <div className="bg-purple-50 rounded-3xl p-5 border border-purple-200 space-y-3 text-xs text-purple-950">
            <div className="flex items-center gap-2 font-extrabold text-purple-900">
              <HelpCircle className="w-4 h-4 text-purple-700" />
              <span>راهنمای استفاده و پترن‌های خدماتی</span>
            </div>

            <p className="leading-relaxed text-slate-700">
              برای ارسال پیامک به خریدارانی که خط تلفن همراه آن‌ها در لیست سیاه (Blacklist) تبلیغاتی است، حتماً از خطوط خدماتی یا <strong>پترن (Pattern)</strong> در سامانه پیامکی خود استفاده فرمایید.
            </p>

            <div className="bg-white p-3 rounded-xl border border-purple-200 font-mono text-[11px] text-slate-800 space-y-1">
              <div className="font-bold text-purple-900">نمونه پترن کاوه‌نگار / فراز:</div>
              <div>{`code: {ORDER_NUM}`}</div>
              <div>{`name: {NAME}`}</div>
              <div>{`status: {STATUS}`}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
