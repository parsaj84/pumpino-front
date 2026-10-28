import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { User, CheckCircle2, X, Smartphone, KeyRound, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import {  UserData as UserDataType } from '../types';
import { toPersianDigits } from '../utils/formatters';
import API from '@/api/api';
import Spinner from './Spinner';


interface CustomerAuthModalProps {
  onClose: () => void;
  title?: string;
  setUser : Dispatch<SetStateAction<UserDataType>>
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  setUser,


  onClose,
  title = 'ورود / ثبت‌ نام سریع با شماره موبایل'
}) => {

  const [step, setStep] = useState<'mobile' | 'otp' >(
     'mobile'
  );

  const [mobilePhone, setMobilePhone] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const [timer, setTimer] = useState(120);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  //////////////MY CODES BLOCK
  const [isResendingOtpCode, setIsSendingOtpCode] = useState(false)
  const [isSending, setIsSending] = useState<boolean>(false)
  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Step 1: Send SMS Code
  const handleSendSms = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      const iranianPhoneRegax = /^(\+98|0098|98|0)?9\d{9}$/
      if (!iranianPhoneRegax.test(mobilePhone)) {
        setErrors({ mobilePhone: 'لطفاً شماره همراه معتبر ۱۰ یا ۱۱ رقمی وارد نمایید (مثال: 09123456789)' });
        return;
      }

      setErrors({});
      setIsSending(true)
      const { data, status } = await API.post("/users/send-otp-code/", { phone: mobilePhone }, { fetchOptions: {} })
      if (status === 200 && data.success) {
        setStep("otp")
        setTimer(120)
        setIsSending(false)
      } else {
        setErrors({ mobilePhone: data.error_des || data.detail || "خطای غیرمنظره رخ داد" })
        setIsSending(false)
      }

    } catch (e) {

      setErrors({ mobilePhone: "خطای وب سرویس" })
      setIsSending(false)
    }
  };

  // Step 2: Verify OTP Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      const OTPCodeRegex = /^[0-9]{5}$/
      if (!OTPCodeRegex.test(otpCode)) {
        setErrors({ otp: 'لطفاً کد تایید 5 رقمی را وارد نمایید.' });
        return;
      }

      setErrors({});
      setIsSending(true)
      const { data, status } = await API.post("/users/otp-code-verification/", { phone: mobilePhone, validation_code: otpCode }, { withCredentials: true })
      if (status === 200) {

        localStorage.setItem("accessToken", data.access_token)
        setIsSending(false)
        setUser({ isAuthenticated: true, data: data.user })
        onClose()
      } else {
        setIsSending(false)
        setErrors({ otp: data.message })
      }
    } catch (e) {
      setIsSending(false)
      setErrors({ otp: "خطای وب سرویس" })
    }

  };

  const handleResendCode = async () => {
    try {
      setIsSendingOtpCode(true)
      const { data, status } = await API.post("users/send-otp-code/", { phone: mobilePhone })
      setIsSendingOtpCode(false)
      if (status === 200) {
        setTimer(120)
        return;
      }
      setErrors({ otp: data.error_des || data.detail || "خطای وب سرویس" })

    } catch (e) {
      setErrors({ otp: "خطای غیر منتظره" })
      setIsSendingOtpCode(false)
    }

  };
  




  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-slate-100">{title}</h2>
              <p className="text-xs text-sky-200/90">
                {step === 'mobile' && 'مرحله ۱ از ۲: ثبت شماره همراه'}
                {step === 'otp' && 'مرحله ۲ از ۲: کد تایید پیامکی'}

              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: MOBILE NUMBER INPUT */}
        {step === 'mobile' && (
          <form onSubmit={handleSendSms} className="p-6 space-y-5">
            <div className="bg-sky-50 border border-sky-200 p-3.5 rounded-2xl flex items-center gap-3 text-sky-950 text-xs">
              <Smartphone className="w-5 h-5 text-sky-600 shrink-0" />
              <span>
                جهت ثبت پیش‌فاکتور و پیگیری سفارشات در فروشگاه پمپینو، شماره همراه خود را وارد کنید تا کد تایید پیامکی ارسال گردد.
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-sky-600" />
                <span>شماره تلفن همراه *</span>
              </label>
              <input
                type="tel"
                value={mobilePhone}
                onChange={(e) => {
                  setMobilePhone(e.target.value);
                  if (errors.mobilePhone) setErrors(prev => ({ ...prev, mobilePhone: '' }));
                }}
                placeholder="09123456789"
                className={`w-full bg-slate-50 text-slate-900 text-sm font-bold font-mono p-3 rounded-2xl border transition focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.mobilePhone ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300'
                  }`}
              />
              {errors.mobilePhone && <p className="text-[11px] text-rose-600 mt-1">{errors.mobilePhone}</p>}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs transition shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSending ? <Spinner width={20} height={20} borderWidth={2} borderMainColor="white" borderTopColor={"blue"} /> : <>
                  <span>ارسال کد تایید پیامکی (SMS)</span>
                  <ArrowRight className="w-4 h-4 rotate-180" /></>}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: VERIFY OTP CODE */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="p-6 space-y-5">
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-emerald-900 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-950">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>کد تایید پیامکی ارسال شد</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                کد تایید 5 رقمی به شماره <strong className="font-mono text-slate-900">{mobilePhone}</strong> پیامک شد.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-sky-600" />
                <span>کد تایید 5 رقمی *</span>
              </label>
              <input
                type="text"
                maxLength={5}
                value={otpCode}
                onChange={(e) => {
                  const input = e.target.value.replace(/[^0-9]/g, "")
                  setOtpCode(input);
                  if (errors.otp) setErrors(prev => ({ ...prev, otp: '' }));
                }}
                placeholder="00000"
                className={`w-full bg-slate-50 text-slate-900 text-center text-lg tracking-widest font-black font-mono p-3 rounded-2xl border transition focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.otp ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300'
                  }`}
              />
              {errors.otp && <p className="text-[11px] text-rose-600 mt-1">{errors.otp}</p>}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600">
              <button
                type="button"
                onClick={() => setStep('mobile')}
                className="text-sky-700 hover:text-sky-900 font-bold hover:underline cursor-pointer"
              >
                اصلاح شماره همراه
              </button>

              {timer > 0 ? (
                <span className="font-mono text-slate-500">
                  ارسال مجدد کد تا: {toPersianDigits(Math.floor(timer / 60))}:{toPersianDigits(timer % 60 < 10 ? `0${timer % 60}` : timer % 60)}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-emerald-700 hover:text-emerald-900 font-bold flex justify-center items-center gap-1 cursor-pointer"
                >
                  {isResendingOtpCode ? <div className='w-33 flex items-center justify-center'>
                    <Spinner width={15} height={15} borderMainColor={"gray"} borderTopColor={"green"} borderWidth={1} />
                  </div> : <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>ارسال مجدد کد تایید</span></>}
                </button>
              )}
            </div>

            <div className="pt-2">
              {isSending ? <div className='w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer'>
                <Spinner width={20} height={20} borderWidth={2} borderMainColor="white" borderTopColor={"green"} />
              </div> : <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>بررسی و تایید کد تایید</span>
              </button>}
            </div>
          </form>
        )}
      

      </div>
    </div>
  );
};
