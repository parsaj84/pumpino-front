import { ArrowRight, CheckCircle2, KeyRound, Phone, RefreshCcw, ShieldCheck, Smartphone, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import Spinner from "./Spinner";
import { toPersianDigits } from "../utils/formatters";
import API from "@/api/api";

export default function EditPhoneModal({ setIsActive, userData, setUser }) {
  const [step, setStep] = useState<'newPhoneInput' | 'prevPhonOTP' | "newPhoneOTP">(
    'newPhoneInput'
  );

  const [mobilePhone, setMobilePhone] = useState("");
  const [prevPhoneOtpCode, setPrevPhoneOtpCode] = useState('');
  const [newPhoneOTPCode, setNewPhoneOTPCOde] = useState('')

  const [timer, setTimer] = useState(120);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  //////////////MY CODES BLOCK
  const [isResendingOtpCode, setIsSendingOtpCode] = useState(false)
  const [isSending, setIsSending] = useState<boolean>(false)
  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if ((step === 'prevPhonOTP' || step === "newPhoneOTP") && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);


  async function handleNewPhoneSubmit(e) {
    try {
      e.preventDefault()
      const iranianPhoneRegex = /^(\+98|0098|98|0)?9\d{9}$/
      if (!iranianPhoneRegex.test(mobilePhone)) {
        setErrors({ mobilePhone: "شماره تلفن نامعتبر" })
        return;
      }
      setIsSending(true)
      const { data, status } = await API.post("users/edit-phone-new-phone-entry/", { phone: mobilePhone });
      if (status === 200 && data.success) {
        setErrors(prev => ({ ...prev, mobilePhone: "" }))
        setStep("prevPhonOTP")
        setTimer(120)
        setIsSending(false)
      } else {
        setErrors(prev => ({ ...prev, mobilePhone: data?.error_des || "خطای سرور" }))
      }
      setIsSending(false)
    } catch (e) {
      setErrors({ mobilePhone: "خطای غیر منتظره" })
      setIsSending(false)
    }

  }
  async function handlePrevPhoneOTP(e) {
    try {
      e.preventDefault()
      if (!/^\d{5}$/.test(prevPhoneOtpCode)) {
        setErrors(prev => ({ ...prev, prevPhoneOtp: "لطفا یک کد 5 رقمی معتبر وارد کنید" }))
        return;
      }
      setIsSending(true)
      const { data, status } = await API.post("users/edit-phone-prev-phone-validation/", { otp_code: prevPhoneOtpCode, phone: mobilePhone })
      if (status === 200) {
        setStep("newPhoneOTP")
        setTimer(120)
      } else {
        setErrors(prev => ({ ...prev, prevPhoneOtp: data.error_des || data.detail || "خطا سمت سرور" }))
      }
      setIsSending(false)
    } catch (e) {
      console.log()
      setErrors(prev => ({ ...prev, prevPhoneOtp: "خطا غیرمنتطره" }))
      setIsSending(false)
    }
  }
  async function handleNewPhoneOTP(e) {
    try {
      e.preventDefault()
      if (!/^\d{5}$/.test(newPhoneOTPCode)) {
        setErrors(prev => ({ ...prev, newPhoneOTP: "لطفا یک کد 5 رقمی معتبر وارد کنید" }))

        return;
      }
      setIsSending(true)
      const { data, status } = await API.post("users/edit-phone-new-phone-validation/", { phone: mobilePhone, otp_code: newPhoneOTPCode });
      console.log(data)
      if (status === 200) {
        setUser(prev => ({ isAuthenticated: prev.isAuthenticated, data: { ...prev.data, phone: mobilePhone } }))
        setIsActive(false)
      } else {
        setErrors(prev => ({ ...prev, newPhoneOTP: data?.error_des || data.detail || "خطای غیرمنتظره" }))
      }
      setIsSending(false)
    } catch (e) {
      setIsSending(false)
      setErrors(prev => ({ ...prev, newPhoneOTP: "خطای غیرمنتظره" }))
    }
  }
  async function handleResendCode(phone: string) {
    try {
      console.log(phone)
      setIsSendingOtpCode(true)
      const { data, status } = await API.post("users/send-otp-code/", { phone: phone })
      if (status === 200 && data.success) {
        setTimer(120)
      } else {
        setErrors(prev => {
          if (step === "prevPhonOTP") {
            return ({ ...prev, prevPhoneOtp: "خطای غیرمنتظره" })
          } else {
            return ({ ...prev, newPhoneOTP: "خطای غیرمنتظره" })
          }
        });
      }
      setIsSendingOtpCode(false)
    } catch (e) {
      setErrors(prev => {
        if (step === "prevPhonOTP") {
          return ({ ...prev, prevPhoneOtp: "خطای غیرمنتظره" })
        } else {
          return ({ ...prev, newPhoneOTP: "خطای غیرمنتظره" })
        }
      });
      setIsSendingOtpCode(false)
    }
  }



  return (
    <div className="fixed inset-0 z-75 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-slate-100">تغییر شماره تلفن</h2>
              <p className="text-xs text-sky-200/90">
                {step === 'newPhoneInput' && 'مرحله ۱ از 3: ثبت شماره همراه جدید'}
                {step === 'prevPhonOTP' && ' مرحله ۲ از 3: تایید پیامکی قبلی'}
                {step === 'newPhoneOTP' && ' مرحله 3 از 3: تایید پیامکی شماره جدید'}

              </p>
            </div>
          </div>
          <button
            onClick={() => setIsActive(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>


        {/* STEP 1: MOBILE NUMBER INPUT */}
        {step === 'newPhoneInput' && (
          <form onSubmit={handleNewPhoneSubmit} className="p-6 space-y-5">
            <div className="bg-sky-50 border border-sky-200 p-3.5 rounded-2xl flex items-center gap-3 text-sky-950 text-xs">
              <Smartphone className="w-5 h-5 text-sky-600 shrink-0" />
              <span>
                شماره تلفن جدید را وارد کنید
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-sky-600" />
                <span>شماره تلفن همراه جدید*</span>
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

        {/* STEP 2: VERIFY PREV PHONE OTP CODE */}
        {step === 'prevPhonOTP' && (
          <form onSubmit={handlePrevPhoneOTP} className="p-6 space-y-5">
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-emerald-900 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-950">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>کد تایید پیامکی ارسال شد</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                کد تایید 5 رقمی به شماره <strong className="font-mono text-slate-900">{userData?.phone}</strong> پیامک شد.
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
                value={prevPhoneOtpCode}
                onChange={(e) => {
                  const input = e.target.value.replace(/[^0-9]/g, "")
                  setPrevPhoneOtpCode(input);
                  if (errors.otp) setErrors(prev => ({ ...prev, prevPhoneOtp: '' }));
                }}
                placeholder="00000"
                className={`w-full bg-slate-50 text-slate-900 text-center text-lg tracking-widest font-black font-mono p-3 rounded-2xl border transition focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.otp ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300'
                  }`}
              />
              {errors.prevPhoneOtp && <p className="text-[11px] text-rose-600 mt-1">{errors.prevPhoneOtp}</p>}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600">


              {timer > 0 ? (
                <span className="font-mono text-slate-500">
                  ارسال مجدد کد تا: {toPersianDigits(Math.floor(timer / 60))}:{toPersianDigits(timer % 60 < 10 ? `0${timer % 60}` : timer % 60)}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleResendCode(userData?.phone)}
                  className="text-emerald-700 hover:text-emerald-900 font-bold flex justify-center items-center gap-1 cursor-pointer"
                >
                  {isResendingOtpCode ? <div className='w-33 flex items-center justify-center'>
                    <Spinner width={15} height={15} borderMainColor={"gray"} borderTopColor={"green"} borderWidth={1} />
                  </div> : <>
                    <RefreshCcw className="w-3.5 h-3.5" />
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
        {/* STEP 3: VERIFY NEW PHONE OTP CODE */}

        {step === 'newPhoneOTP' && (
          <form onSubmit={handleNewPhoneOTP} className="p-6 space-y-5">
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
                value={newPhoneOTPCode}
                onChange={(e) => {
                  const input = e.target.value.replace(/[^0-9]/g, "")
                  setNewPhoneOTPCOde(input);
                  if (errors.otp) setErrors(prev => ({ ...prev, newPhoneOTP: '' }));
                }}
                placeholder="00000"
                className={`w-full bg-slate-50 text-slate-900 text-center text-lg tracking-widest font-black font-mono p-3 rounded-2xl border transition focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.otp ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300'
                  }`}
              />
              {errors.newPhoneOTP && <p className="text-[11px] text-rose-600 mt-1">{errors.newPhoneOTP}</p>}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600">


              {timer > 0 ? (
                <span className="font-mono text-slate-500">
                  ارسال مجدد کد تا: {toPersianDigits(Math.floor(timer / 60))}:{toPersianDigits(timer % 60 < 10 ? `0${timer % 60}` : timer % 60)}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleResendCode(mobilePhone)}
                  className="text-emerald-700 hover:text-emerald-900 font-bold flex justify-center items-center gap-1 cursor-pointer"
                >
                  {isResendingOtpCode ? <div className='w-33 flex items-center justify-center'>
                    <Spinner width={15} height={15} borderMainColor={"gray"} borderTopColor={"green"} borderWidth={1} />
                  </div> : <>
                    <RefreshCcw className="w-3.5 h-3.5" />
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
}