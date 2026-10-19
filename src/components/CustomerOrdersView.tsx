import React, { startTransition, useEffect, useState, useTransition } from 'react';
import {
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Printer,
  Truck,
  FileText,
  User,
  Phone,
  MapPin,
  Building2,
  ChevronDown,
  ChevronUp,
  Paperclip,
  BadgeDollarSignIcon,
  X,
  Sparkles,
  PackageCheck,
  Check,
  CreditCard,
  Copy,
  Send,
  DollarSign
} from 'lucide-react';
import { CustomerOrder, StoreSettings, CustomerProfile, OrderStatus, OrderMessage, ReturnRequest, UserData } from '../types';
import { formatPrice, toPersianDigits } from '../utils/formatters';
import { OrderTicketChat } from './OrderTicketChat';
import API from '@/api/api';
import fetchData from '../utils/fetchData';
import SubmitReciptModal from './SubmitReciptModal';
import Spinner from './Spinner';
import Skeleton from 'react-loading-skeleton';
import { ReturnItemRequestModal } from './ReturnItemRequestModal';

interface CustomerOrdersViewProps {
  orders: CustomerOrder[];
  customerProfile: UserData | null;
  storeSettings: StoreSettings;
  onOpenPrintInvoice: (order: CustomerOrder) => void;
  onEditProfile: () => void;
  onUpdateOrders: (updatedOrders: CustomerOrder[]) => void;
  onClose?: () => void;
}

const STATUS_STEPS: { key: OrderStatus; label: string; icon: React.FC<{ className?: string }> }[] = [
  { key: 'pending', label: 'ثبت سفارش', icon: Clock },
  { key: 'PENDING_BY_ADMIN', label: 'در حال بررسی توسط مدیریت', icon: FileText },
  { key: 'ACCEPTED(WAITING_FOR_PAYMENT)', label: 'تایید شده(در انتظار پرداخت)', icon: CheckCircle2 },
  { key: "PAID", label: "پرداخت شده", icon: BadgeDollarSignIcon },
  { key: 'OUT_FOR_TRANSIT', label: "تحویل به پیک | باربری", icon: Truck },
  { key: 'DELIVERED', label: 'تحویل نهایی', icon: PackageCheck },
];

export const CustomerOrdersView: React.FC<CustomerOrdersViewProps> = ({
  customerProfile,
  storeSettings,
  onOpenPrintInvoice,
  onEditProfile,
  onUpdateOrders,
  onClose
}) => {
  const [isReturnItemRequestModalOpen, setIsReturnItemRequestModalOpen] = useState(false)
  const [editingItemID, setEditingItemID] = useState(null)
  const [editingOrderPK, setEditingOrderPK] = useState(null)
  const [orders, setOrders] = useState([])
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(orders[0]?.id || null);
  const [selectedStatusTab, setSelectedStatusTab] = useState<'all' | OrderStatus>('all');
  const [paymentRefInputs, setPaymentRefInputs] = useState<{ [orderId: string]: string }>({});
  const [paymentNoteInputs, setPaymentNoteInputs] = useState<{ [orderId: string]: string }>({});
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isReciptSubmitModalActive, setIsReciptSubmitModalOpen] = useState(false)
  const [reciptSubmitingOrder, setReciptSubmitingOrder] = useState(null)
  const [orderGeneratingInvoice, setOrderGeneratingInvoice] = useState(null)
  const [fetchingOrders, setFetchingOrders] = useState(true)
  const [editingReturnRequest, setEditingReturnRequest] = useState<ReturnRequest | null>(null)
  useEffect(() => {
    if (customerProfile.isAuthenticated) {
      fetchData("orders/user-orders-list/", (response) => {
        const { status, data } = response
        if (status === 200) {
          setOrders(data)
        } else {
          const e = "خطا"
          console.log(e)
        }
        setFetchingOrders(false)
      }, () => setFetchingOrders(true))
    } else {
      setOrders([])
    }
  }, [customerProfile])

  const filteredOrders = orders.filter(ele => {
    if (selectedStatusTab === "all") {
      return true
    }
    return ele.order_status === selectedStatusTab
  })


  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleRegisterPaymentSubmit = (orderId: string) => {
    const ref = paymentRefInputs[orderId] || '';
    if (!ref.trim()) {
      alert('لطفاً شماره پیگیری یا فیش واریزی را وارد کنید.');
      return;
    }
    const note = paymentNoteInputs[orderId] || '';
    const nowShamsi = new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    const updated = orders.map(o => {

      if (o.id === orderId) {
        return {
          ...o,
          paymentStatus: 'pending_verification' as const,
          paymentReceiptRef: ref,
          paymentReceiptDate: nowShamsi,
          paymentNote: note,
          updatedAt: new Date().toISOString()
        };
      }
      return o;
    });

    onUpdateOrders(updated);
    alert('اطلاعات واریزی با موفقیت ثبت شد و در انتظار تایید مدیریت می‌باشد.');
  };

  const handleSendMessage = (orderId: string, messageText: string) => {
    const nowShamsi = new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    const senderName = customerProfile?.fullName || 'خریدار';
    const newMsg: OrderMessage = {
      id: `msg-${Date.now()}`,
      sender: 'customer',
      senderName,
      message: messageText,
      createdAt: nowShamsi
    };

    const updated = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          messages: [...(o.messages || []), newMsg],
          updatedAt: new Date().toISOString()
        };
      }
      return o;
    });

    onUpdateOrders(updated);
  };

  const handleInvoiceGenerate = async (orderId) => {
    try {
      setOrderGeneratingInvoice(orderId)
      const response = await API.get(`orders/generate-order-invoice/${orderId?.toString()}/`, { responseType: "blob" })
      const blob = new Blob([response.data], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", "invoice-order-" + orderId.toString() + ".pdf")
      document.body.appendChild(link)
      link.click()
      link.remove()
      setOrderGeneratingInvoice(null)


    } catch (e) {
      console.log(e)
    }
  }



  const getStatusBadge = (status: CustomerOrder['status']) => {
    switch (status) {
      case 'PENDING_BY_ADMIN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            <span>در انتظار بررسی ادمین</span>
          </span>
        );

      case 'ACCEPTED(WAITING_FOR_PAYMENT)':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>تایید و فاکتور صادر گردید</span>
          </span>
        );
      case 'PAID':
        return (

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>پرداخت شده</span>
          </span>
        );

      case 'OUT_FOR_TRANSIT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
            <Truck className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>ارسال شده</span>
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-900 border border-teal-300">
            <PackageCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>تحویل کامل به خریدار</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>رد شده / لغو گردید</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };



  const getDeliveryTypeText = (deliveryType) => {
    switch (deliveryType) {
      case "MOTORCYCLE_COURIER":
        return "ارسال با پیک موتوری"
      case "INPERSON_PICKUP":
        return "تحویل حضوری"
      case "PICK_UP_FROM_FREIGHT_TERMINAL":
        return "تحویل از باربری"
    }

  }

  const renderStatusStepper = (order) => {
    const status = order.order_status


    if (status === 'REJECTED') {
      return (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-rose-900 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <span className="font-extrabold block">این سفارش متاسفانه رد یا لغو گردیده است.</span>
            <p className="text-rose-700 text-[11px] mt-0.5">
              جهت اطلاع از دلیل لغو یا ثبت سفارش جایگزین می‌توانید با پشتیبانی فروشگاه تماس حاصل فرمایید.
            </p>
          </div>
        </div>
      );
    }

    const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === status);
    const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

    return (
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-extrabold text-slate-800 border-b border-slate-200 pb-2">
          <span>وضعیت پردازش سفارش:</span>
          <span className="text-sky-800 font-mono text-[11px] bg-sky-100 px-2 py-0.5 rounded-full">
            مرحله {toPersianDigits(activeIndex + 1)} از {toPersianDigits(STATUS_STEPS.filter(ele => {
              if ((order.delivery_type === "INPERSON_PICKUP" || order.delivery_type === "MOTORCYCLE_COURIER") && ele.key === "OUT_FOR_TRANSIT") {
                return false
              }
              return true
            }).length)}: {STATUS_STEPS[activeIndex]?.label}
          </span>
        </div>

        {/* Mobile View: Vertical Step Pills */}
        <div className="sm:hidden space-y-2 pt-1">
          {STATUS_STEPS.filter(ele => {
            if ((order.delivery_type === "INPERSON_PICKUP" || order.delivery_type === "MOTORCYCLE_COURIER") && ele.key === "OUT_FOR_TRANSIT") {
              return false
            }
            return true
          }).map((step, idx) => {
            const IconComponent = step.icon;
            const isCompleted = idx < activeIndex;
            const isCurrent = idx === activeIndex;

            return (
              <div
                key={step.key}
                className={`flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold transition ${isCurrent
                  ? 'bg-sky-600 text-white shadow-sm ring-1 ring-sky-500'
                  : isCompleted
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-white text-slate-400 border border-slate-200 opacity-60'
                  }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isCurrent
                    ? 'bg-white text-sky-700'
                    : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-400'
                    }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <IconComponent className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span>{step.label}</span>
                  {isCurrent && <span className="text-[10px] bg-sky-500 text-white px-2 py-0.5 rounded-full">در حال اجرا</span>}
                  {isCompleted && <span className="text-[10px] text-emerald-700">تکمیل شد</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View: Stepper horizontal line and nodes */}
        <div className="hidden sm:block relative pt-2 pb-1">
          <div className="flex items-center justify-between relative z-10">
            {STATUS_STEPS.map((step, idx) => {
              const IconComponent = step.icon;
              const isCompleted = idx < activeIndex;
              const isCurrent = idx === activeIndex;

              return (
                <div key={step.key} className="flex flex-col items-center gap-1.5 relative flex-1 text-center">
                  {/* Step Node */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-xs ${isCompleted
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                      : isCurrent
                        ? 'bg-sky-600 text-white ring-4 ring-sky-200 scale-110 shadow-md'
                        : 'bg-white text-slate-400 border border-slate-300'
                      }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 text-white stroke-[3]" />
                    ) : (
                      <IconComponent className="w-4 h-4" />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`text-[11px] font-bold transition ${isCurrent
                      ? 'text-sky-950 font-black'
                      : isCompleted
                        ? 'text-emerald-800 font-bold'
                        : 'text-slate-400 font-medium'
                      }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress Connecting Line */}
          <div className="absolute top-6 left-8 right-8 h-1 bg-slate-200 z-0 -translate-y-1/2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-l from-emerald-500 to-sky-600 transition-all duration-500 rounded-full"
              style={{
                width: `${(activeIndex / (STATUS_STEPS.length - 1)) * 100}%`
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white">پیگیری و سفارشات ثبت‌شده مشتری</h2>
            <p className="text-xs text-sky-200/80">
              مشاهده وضعیت لحظه‌ای، بررسی قیمت‌های تاییدشده مدیر و دریافت فاکتور رسمی
            </p>
          </div>
        </div>

        {customerProfile.isAuthenticated && (
          <button
            onClick={onEditProfile}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 text-xs font-bold transition cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            <span>ویرایش profile ({customerProfile?.data?.fname} {customerProfile?.data?.lname})</span>
          </button>
        )}
      </div>

      {/* Customer Profile Banner if logged in */}
      {customerProfile.isAuthenticated ? (
        <div className="mx-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">نام و فروشگاه خریدار:</span>
            <span className="font-bold text-slate-800">
              {customerProfile.data?.fname} {customerProfile.data?.lname} {customerProfile?.data?.store_name ? `(${customerProfile.data?.store_name})` : ''}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">تلفن همراه:</span>
            <span className="font-bold text-slate-800 font-mono">
              {toPersianDigits(customerProfile?.data?.phone)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5"> شهر و استان:</span>
            <span className="font-medium text-slate-700 truncate block">
              {customerProfile.data?.province?.name || ''} - {customerProfile.data?.city?.name || ''}
            </span>
          </div>
        </div>
      ) : (
        <div className="mx-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
          <div className="text-xs text-amber-900 space-y-1">
            <span className="font-bold block">مشخصات خریدار هنوز تکمیل نشده است!</span>
            <p>جهت تسریع در صدور فاکتور رسمی و ارسال باربری، مشخصات خود را ثبت فرمایید.</p>
          </div>
          <button
            onClick={onEditProfile}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer shrink-0"
          >
            ثبت مشخصات خریدار
          </button>
        </div>
      )}

      {/* Status Filter Tabs */}
 
      <div className="mx-6 flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setSelectedStatusTab('all')}
          className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${selectedStatusTab === 'all'
            ? 'bg-slate-900 text-white shadow-xs'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
        >
          همه 
        </button>

        <button
          onClick={() => setSelectedStatusTab('PENDING_BY_ADMIN')}
          className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${selectedStatusTab === 'PENDING_BY_ADMIN'
            ? 'bg-amber-500 text-slate-950 shadow-xs'
            : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
        >
          در انتظار بررسی 
        </button>

        <button
          onClick={() => setSelectedStatusTab('ACCEPTED(WAITING_FOR_PAYMENT)')}
          className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${selectedStatusTab === 'ACCEPTED(WAITING_FOR_PAYMENT)'
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
        >
          تایید شده توسط مدیر 
        </button>

        <button
          onClick={() => setSelectedStatusTab('PAID')}
          className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${selectedStatusTab === 'PAID'
            ? 'bg-green-600 text-white shadow-xs'
            : 'bg-green-50 text-green-800 hover:bg-blue-100'
            }`}
        >
          پرداخت شده 
        </button>

        <button
          onClick={() => setSelectedStatusTab('OUT_FOR_TRANSIT')}
          className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${selectedStatusTab === 'OUT_FOR_TRANSIT'
            ? 'bg-blue-600 text-white shadow-xs'
            : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
        >
          ارسال‌شده 
        </button>

        <button
          onClick={() => setSelectedStatusTab('DELIVERED')}
          className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${selectedStatusTab === 'DELIVERED'
            ? 'bg-teal-600 text-white shadow-xs'
            : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
            }`}
        >
          تحویل‌شده 
        </button>
        <button
          onClick={() => setSelectedStatusTab('REJECTED')}
          className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${selectedStatusTab === 'REJECTED'
            ? 'bg-red-600 text-white shadow-xs'
            : 'bg-red-50 text-red-800 hover:bg-teal-100'
            }`}
        >
          لغو شده 
        </button>
      </div>
  

      {/* Orders List */}
      <div className="p-6 pt-0 space-y-4">
        {customerProfile.isAuthenticated ? fetchingOrders ? Array(6).fill({}).map((ele, idx) => (
          <div key={idx}
            className="bg-white gap-1.5 flex justify-between items-center p-2 box-border rounded-2xl border border-slate-200 shadow-xs hover:border-sky-300 transition-all ">
            <div className='w-1/4'>
              <Skeleton className='w-full min-h-20' containerClassName='w-full h-full' />
            </div>
            <div className='w-3/4'>
              <Skeleton count={3} containerClassName='w-full' className='w-full' />
            </div>
          </div>
        )) :
          filteredOrders.length <= 0 ? <div className="p-12 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-slate-200">
            <Package className="w-14 h-14 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              هنوز هیچ سفارشی با مشخصات زیر برای شما ثبت نشده است!
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              می‌توانید اقلام مورد نیاز خود را به سبد استعلام اضافه کرده و گزینه "ارسال سفارش برای مدیر" را انتخاب نمایید.
            </p>
          </div> :
            orders.map((order) => {

              const isExpanded = expandedOrderId === order.pk;
              console.log(order.items)
              return (
                <div
                  key={order.pk}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-sky-300 transition-all overflow-hidden space-y-2"
                >
                  {/* Order Summary Bar */}
                  <div
                    onClick={() => setExpandedOrderId(isExpanded ? null : order.pk)}
                    className="p-4 bg-slate-50/80 hover:bg-slate-100/80 flex flex-wrap items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold font-mono text-xs shadow-xs">
                        #{order.pk}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900 font-mono">
                            {order.pk}
                          </span>
                          <span className="text-xs text-slate-500">
                            ({toPersianDigits(order.items.length)} قلم کالا)
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          تاریخ ثبت: {toPersianDigits(order.date_created)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {getStatusBadge(order.order_status)}

                      <div className="text-left font-mono">
                        <span className="text-[10px] text-slate-400 block">مبلغ کل تایید شده توسط مدیر:</span>
                        <span className="text-sm font-extrabold text-sky-900">
                          {order.admin_accepted_price ? formatPrice(order.admin_accepted_price, storeSettings.currencyUnit) : "هنوز توسط ادمین قیمتی تعیین نشده"}
                        </span>
                      </div>

                      <button className="p-1 text-slate-400 hover:text-slate-700">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Order Details Body */}
                  {isExpanded && (
                    <div className="p-5 space-y-5 border-t border-slate-200 bg-white">
                      {/* Visual Status Stepper */}
                      {renderStatusStepper(order)}

                      {/* Admin Note if any */}
                      {order.adminNote && (
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                          <span className="font-bold block flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            پاسخ و یادداشت مدیریت فروشگاه:
                          </span>
                          <p>{order.adminNote}</p>
                        </div>
                      )}

                      {/* Order Shipping / Freight Details */}
                      <div className="bg-sky-50/60 p-3 rounded-xl border border-sky-100 flex flex-wrap items-center justify-between text-xs gap-2">
                        <span className="text-sky-900 font-medium flex items-center gap-1.5">
                          <Truck className="w-4 h-4 text-sky-600" />
                          نام باربری و روش ارسال: <strong className="text-sky-950 font-bold">  {getDeliveryTypeText(order.delivery_type)} {order?.freight && `- ${order.freight.name}`}  </strong>
                        </span>
                        {order.delivery_price && (
                          <>
                            <span className="text-sky-900 font-medium flex items-center gap-1.5">
                              <Truck className="w-4 h-4 text-sky-600" />
                              هزینه ارسال <strong className="text-sky-950 font-bold">  {formatPrice(order.delivery_price)}  </strong>
                            </span>
                          </>
                        )}

                        {order.invoiceIssuedDate && (
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            تاریخ صدور فاکتور: {toPersianDigits(order.invoiceIssuedDate)}
                          </span>
                        )}
                      </div>

                      {/* Table of Items */}
                      <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="min-w-300 text-xs text-right">
                          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                              <th className="p-2.5">#</th>
                              <th className="p-2.5">کد کالا</th>
                              <th className="p-2.5">نام محصول / قطعه</th>
                              <th className="p-2.5 text-center">تعداد درخواستی</th>
                              <th className="p-2.5 text-center">تعداد تاییدشده مدیر</th>
                              <th className="p-2.5">قیمت واحد در لحظه ثبت(تومان)</th>
                              <th className="p-2.5">قیمت واحد تایدی توسط مدیر(تومان)</th>
                              <th className="p-2.5">درخواست مرجوعی</th>
                              <th className="p-2.5">جمع کل</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {order.items.map((item, idx) => {
                              const returnRequest = item.return_request || null;
                              
                              return (
                                <tr key={idx} className="hover:bg-slate-50">
                                  <td className="p-2.5 font-mono text-slate-400 font-bold">{idx + 1}</td>
                                  <td className="p-2.5 font-mono font-bold text-slate-700">{item.sku}</td>
                                  <td className="p-2.5 font-bold text-slate-900">
                                    {item.product?.title || "محصول یافت نشد!"}
                                    <span className="block text-[11px] text-slate-400 font-normal">
                                      مدل: {item.product?.technical_model || "محصول یافت نشد"}
                                    </span>
                                  </td>
                                  <td className="p-2.5 text-center font-bold text-slate-600">
                                    {toPersianDigits(item.quantity)}
                                  </td>
                                  <td className="p-2.5 text-center font-extrabold text-sky-800 bg-sky-50/50">
                                    {toPersianDigits(item.quantity_accepted_by_admin) || "----"}
                                  </td>
                                  <td className="p-2.5 font-bold text-slate-800">
                                    {formatPrice(item.price, storeSettings.currencyUnit)}
                                  </td>
                                  <td className="p-2.5 font-bold text-slate-800">
                                    {item.price_accepted_by_admin ? formatPrice(item.price_accepted_by_admin, storeSettings.currencyUnit) : "----"}
                                  </td>
                                  <td className="p-2.5 font-bold text-slate-800">
                                    <button onClick={() => {
                                      setIsReturnItemRequestModalOpen(true);

                                      setEditingItemID(item.pk);
                                      setEditingOrderPK(order.pk);
                                      setEditingReturnRequest(returnRequest);


                                    }} className='p-1.5 rounded-xl bg-white border-2 text-gray-700 border-red-600 hover:border-0 hover:bg-red-600 hover:text-white transition-colors'>
                                      {returnRequest ? "ویرایش درخواست" : "درخواست مرجوعی"}
                                    </button>
                                  </td>

                                  <td className="p-2.5 font-extrabold text-sky-900">
                                    {item.price_accepted_by_admin && item.quantity_accepted_by_admin ? formatPrice(item.quantity_accepted_by_admin * item.price_accepted_by_admin, storeSettings.currencyUnit) : "تعیین نشده"}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Bank Account Details & Payment Registration Section */}
                      {(order.order_status === "ACCEPTED(WAITING_FOR_PAYMENT)") && (
                        <div className="bg-gradient-to-br from-slate-900 to-sky-950 text-white rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg border border-slate-800">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                            <div className="flex  items-center gap-2">
                              <CreditCard className="w-5 h-5 text-amber-400" />
                              <h4 className="font-bold text-sm text-slate-100">
                                درانتظار پرداخت و ثبت فیش واریزی
                              </h4>
                            </div>
                            <div>
                              <button onClick={() => {
                                console.log("modal is opening")
                                setIsReciptSubmitModalOpen(true)
                                setReciptSubmitingOrder(order)
                              }} className='px-1.5 py-3 bg-emerald-400 rounded-md flex items-center justify-between gap-3'>
                                <CreditCard className="w-5 h-5 text-amber-400" />
                                <span className='text-bold text-sm text-white'>ثبت فیش واریزی</span>
                              </button>
                            </div>

                            {order.order_status === 'PAID' && (
                              <span className="bg-emerald-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                                <CheckCircle2 className="w-4 h-4" />
                                <span> پرداخت شده</span>
                              </span>
                            )}

                            {order.order_status === 'PENDING_BY_ADMIN' && (
                              <span className="bg-amber-400 text-slate-950 font-extrabold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm animate-pulse">
                                <Clock className="w-4 h-4" />
                                <span>در انتظار بررسی و تایید مدیریت</span>
                              </span>
                            )}


                          </div>

                          {/* Bank Cards Info Display */}
                          {(() => {
                            const accounts = storeSettings.bankAccounts && storeSettings.bankAccounts.length > 0
                              ? storeSettings.bankAccounts
                              : [
                                {
                                  id: 'default',
                                  bankName: storeSettings.bankName || 'بانک ملی ایران',
                                  ownerName: storeSettings.bankOwnerName || 'بازرگانی صنعت آبرسان',
                                  cardNumber: storeSettings.bankCardNumber || '۶۰۳۷-۹۹۷۵-۱۲۳۴-۵۶۷۸',
                                  accountNumber: storeSettings.bankAccountNumber || '',
                                  iban: storeSettings.bankIbanNumber || 'IR120170000000123456789001'
                                }
                              ];

                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                                {accounts.map((acc, index) => (
                                  <div key={acc.id || index} className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80 space-y-1.5 shadow-xs relative">
                                    <div className="flex items-center justify-between border-b border-slate-700/80 pb-1 mb-1">
                                      <span className="font-bold text-amber-300 text-xs flex items-center gap-1">
                                        <span>{acc.bankName || 'حساب بانکی'}</span>
                                      </span>
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        #{toPersianDigits(index + 1)}
                                      </span>
                                    </div>

                                    <div className="text-slate-200 font-bold text-[11px]">
                                      صاحب حساب: <span className="text-white">{acc.ownerName}</span>
                                    </div>

                                    {acc.cardNumber && (
                                      <div className="pt-1">
                                        <span className="text-slate-400 block text-[10px]">شماره کارت (جهت کارت به کارت):</span>
                                        <div className="font-mono font-black text-xs text-sky-300 dir-ltr tracking-wider">
                                          {acc.cardNumber}
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handleCopy(acc.cardNumber, `کارت ${acc.bankName}-${index}`)}
                                          className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 mt-0.5 font-bold cursor-pointer"
                                        >
                                          <Copy className="w-3 h-3" />
                                          <span>{copiedText === `کارت ${acc.bankName}-${index}` ? 'کپی شد!' : 'کپی شماره کارت'}</span>
                                        </button>
                                      </div>
                                    )}

                                    {acc.accountNumber && (
                                      <div className="pt-0.5">
                                        <span className="text-slate-400 block text-[10px]">شماره حساب:</span>
                                        <div className="font-mono font-bold text-xs text-slate-200 dir-ltr">
                                          {acc.accountNumber}
                                        </div>
                                      </div>
                                    )}

                                    {acc.iban && (
                                      <div className="pt-0.5">
                                        <span className="text-slate-400 block text-[10px]">شماره شبا (IBAN):</span>
                                        <div className="font-mono font-bold text-[11px] text-slate-300 dir-ltr truncate">
                                          {acc.iban}
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handleCopy(acc.iban, `شبا ${acc.bankName}-${index}`)}
                                          className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 mt-0.5 font-bold cursor-pointer"
                                        >
                                          <Copy className="w-3 h-3" />
                                          <span>{copiedText === `شبا ${acc.bankName}-${index}` ? 'کپی شد!' : 'کپی شماره شبا'}</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            );
                          })()}

                        </div>
                      )}

                      {/* Chat & Support Ticket Section for this Invoice */}
                      <div className="pt-2">
                        <OrderTicketChat
                          order={order}
                          currentUserRole="customer"
                          page={"userOrders"}
                          user={customerProfile}
                          currentUserName={customerProfile?.fname + customerProfile?.lname || 'خریدار'}
                          setOrders={setOrders}
                          onSendMessage={handleSendMessage}
                          defaultExpanded={order.messages && order.messages.length > 0}
                        />
                      </div>

                      {/* Bottom Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
                        <div className="text-xs text-slate-500">
                          جمع کل نهایی فاکتور: <strong className="text-sky-900 font-mono text-sm">{order.price_accepted_by_admin ? formatPrice(order.price_accepted_by_admin, storeSettings.currencyUnit) : formatPrice(order.total_items_price, storeSettings.currencyUnit) + "(تایید نشده)"}</strong>
                        </div>
                        <div>
                          <button
                            onClick={() => handleInvoiceGenerate(order.pk)}
                            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition flex items-center gap-2 cursor-pointer shadow-md"
                          >
                            {orderGeneratingInvoice === order.pk ? <Spinner height={15} borderWidth={1.5} borderMainColor={"white"} borderTopColor={"yellow"} width={15} /> : <>
                              <Printer className="w-4 h-4" />
                              <span>دریافت فاکتور خرید </span>
                            </>}
                          </button>
                        </div>

                      </div>
                    </div>
                  )}
                </div>
              );
            })

          : <div className='p-12 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-slate-200'>
            <h3>برای دیدن سفارشات ابتدا باید <button className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer shrink-0" onClick={() => onEditProfile()}>ورود|ثبت نام</button> کنید</h3>
          </div>}

      </div>
      {isReciptSubmitModalActive && <SubmitReciptModal setOrders={setOrders} order={reciptSubmitingOrder} onClose={() => { setIsReciptSubmitModalOpen(false); setReciptSubmitingOrder(null) }} />}
      {isReturnItemRequestModalOpen && <ReturnItemRequestModal onClose={() => {
        setIsReturnItemRequestModalOpen(false)
        setEditingItemID(null)
        setEditingOrderPK(null)
      }} itemID={editingItemID} returnRequest={editingReturnRequest} orderID={editingOrderPK} setOrders={setOrders} />}
    </div>
  );
};

