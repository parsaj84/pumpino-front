import React, { useState, useEffect } from 'react';
import { Smartphone, Share, PlusSquare, MoreVertical, CheckCircle2, X, Download, ShieldCheck } from 'lucide-react';

interface PwaInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeName?: string;
}

export const PwaInstallGuideModal: React.FC<PwaInstallGuideModalProps> = ({ isOpen, onClose, storeName = 'پمپینو' }) => {
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'other'>('android');

  useEffect(() => {
    const ua = navigator.userAgent || '';
    if (/iPad|iPhone|iPod/.test(ua)) {
      setDeviceType('ios');
    } else if (/Android/.test(ua)) {
      setDeviceType('android');
    } else {
      setDeviceType('other');
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-slate-900 text-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-5 shadow-2xl border border-slate-800 max-h-[90vh] overflow-y-auto relative text-right dir-rtl">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-amber-500/30">
                <ShieldCheck className="w-3 h-3" />
                <span>نصب رایگان وب‌اپلیکیشن</span>
              </div>
              <h3 className="text-base font-black text-white mt-0.5">
                افزودن {storeName} به صفحه اصلی گوشی
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Intro */}
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
          با افزودن برنامه به صفحه اصلی، بدون نیاز به دانلود از کافه بازار یا سیب‌اپ، همیشه به سرعت و مانند یک نرم‌افزار نیتیو به کاتالوگ و استعلام قیمت روز دسترسی خواهید داشت.
        </p>

        {/* Device selector tabs */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-2xl border border-slate-700 text-xs font-bold">
          <button
            type="button"
            onClick={() => setDeviceType('ios')}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
              deviceType === 'ios' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>آیفون (iOS / Safari)</span>
          </button>

          <button
            type="button"
            onClick={() => setDeviceType('android')}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
              deviceType === 'android' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>اندروید (Android / Chrome)</span>
          </button>
        </div>

        {/* iOS Instructions */}
        {deviceType === 'ios' && (
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs">
            <h4 className="font-bold text-amber-400 text-xs flex items-center gap-2">
              <span>مراحل اضافه کردن در سیستم‌عامل آیفون (iOS Safari):</span>
            </h4>

            <div className="space-y-2.5 text-slate-200">
              <div className="flex items-start gap-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="w-6 h-6 bg-amber-500/20 text-amber-400 rounded-lg flex items-center justify-center font-extrabold shrink-0 text-xs">۱</span>
                <p className="leading-snug pt-0.5">
                  در پایین مرورگر Safari، دکمه <strong className="text-amber-300 font-bold inline-flex items-center gap-1 mx-1"><Share className="w-3.5 h-3.5" /> Share (اشتراک‌گذاری)</strong> را لمس کنید.
                </p>
              </div>

              <div className="flex items-start gap-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="w-6 h-6 bg-amber-500/20 text-amber-400 rounded-lg flex items-center justify-center font-extrabold shrink-0 text-xs">۲</span>
                <p className="leading-snug pt-0.5">
                  در منوی باز شده، منو را به پایین بکشید و گزینه <strong className="text-amber-300 font-bold inline-flex items-center gap-1 mx-1"><PlusSquare className="w-3.5 h-3.5" /> Add to Home Screen (افزودن به صفحه اصلی)</strong> را بزنید.
                </p>
              </div>

              <div className="flex items-start gap-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="w-6 h-6 bg-amber-500/20 text-amber-400 rounded-lg flex items-center justify-center font-extrabold shrink-0 text-xs">۳</span>
                <p className="leading-snug pt-0.5">
                  در بالای صفحه سمت راست دکمه <strong className="text-emerald-400 font-bold mx-1">Add</strong> را لمس کنید. آیکون اپلیکیشن به صفحه اصلی شما اضافه شد!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Android Instructions */}
        {deviceType === 'android' && (
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs">
            <h4 className="font-bold text-amber-400 text-xs flex items-center gap-2">
              <span>مراحل اضافه کردن در سیستم‌عامل اندروید (Chrome / Firefox):</span>
            </h4>

            <div className="space-y-2.5 text-slate-200">
              <div className="flex items-start gap-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="w-6 h-6 bg-amber-500/20 text-amber-400 rounded-lg flex items-center justify-center font-extrabold shrink-0 text-xs">۱</span>
                <p className="leading-snug pt-0.5">
                  در بالای مرورگر Chrome، روی منوی <strong className="text-amber-300 font-bold inline-flex items-center gap-1 mx-1"><MoreVertical className="w-3.5 h-3.5" /> سه نقطه بالا</strong> کلیک کنید.
                </p>
              </div>

              <div className="flex items-start gap-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="w-6 h-6 bg-amber-500/20 text-amber-400 rounded-lg flex items-center justify-center font-extrabold shrink-0 text-xs">۲</span>
                <p className="leading-snug pt-0.5">
                  گزینه <strong className="text-amber-300 font-bold inline-flex items-center gap-1 mx-1"><Download className="w-3.5 h-3.5" /> نصب برنامه (Install App)</strong> یا <strong className="text-amber-300 font-bold inline-flex items-center gap-1 mx-1"><PlusSquare className="w-3.5 h-3.5" /> افزودن به صفحه اصلی (Add to Home Screen)</strong> را لمس کنید.
                </p>
              </div>

              <div className="flex items-start gap-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="w-6 h-6 bg-amber-500/20 text-amber-400 rounded-lg flex items-center justify-center font-extrabold shrink-0 text-xs">۳</span>
                <p className="leading-snug pt-0.5">
                  پیام تایید را پذیرفته تا آیکون برنامه‌ به نرم‌افزارهای موبایل شما اضافه گردد.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Desktop or general guidance */}
        {deviceType === 'other' && (
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs space-y-2 text-slate-300">
            <p>شما در حال حاضر با کامپیوتر یا مرورگر دسکتاپ وارد شده‌اید.</p>
            <p>در مرورگرهای Chrome / Edge می‌توانید با کلیک روی آیکون نصب در نوار آدرس بالا، نرم‌افزار ویندوز را نصب کنید.</p>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>متوجه شدم - ورود به برنامه‌</span>
          </button>
        </div>

      </div>
    </div>
  );
};
