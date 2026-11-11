import React, { Dispatch, SetStateAction, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Send,
  User,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MessageCircle,
} from 'lucide-react';
import { CustomerOrder,  UserData as UserDataType } from '../types';
import { toPersianDigits } from '../utils/formatters';
import Spinner from './Spinner';
import API from '@/api/api';
import { MainContext } from '../contexts/MainContext';

interface OrderTicketChatProps {
  order: CustomerOrder;
  currentUserRole: 'customer' | 'admin';
  currentUserName: string;
  defaultExpanded?: boolean;
  page: "userOrders" | "adminPanel";
  user: UserDataType;

  setOrders: Dispatch<SetStateAction<CustomerOrder[]>>
}

export const OrderTicketChat: React.FC<OrderTicketChatProps> = ({
  order,
  currentUserRole,
  page,
  setOrders,
  defaultExpanded = false,
  user
}) => {

  const mainContextValue = useContext(MainContext)

  const [isOpen, setIsOpen] = useState(defaultExpanded);
  const [inputText, setInputText] = useState('');
  const [isSubmiting, setIsSubmiting] = useState(false)

  const messages = order.order_tickets || [];
  const messageCount = messages.length;
  messages.reverse()
  const handleSend = async (e?: React.FormEvent) => {
    try {
      if (e) e.preventDefault();
      if (!inputText.trim()) return;
      setIsSubmiting(true)
      const { data, status } = await API.post("orders/order-ticket-create/", { order_id: order.pk, user_from_id: user?.data?.pk, text: inputText })
      if (data.success && data.ticket && status === 200) {
        setInputText("")

        setOrders(prev =>
          prev.map(ele =>
            ele.pk === order.pk
              ? {
                ...ele,
                order_tickets: ele.order_tickets ? [...ele.order_tickets, data.ticket] : [data.ticket],
              }
              : ele
          )
        );
      } else {
        mainContextValue?.onError("خطا در هنگام ثبت تیکت")
      }
      setIsSubmiting(false)
    } catch (e) {
      mainContextValue?.onError("خطا در هنگام ثبت تیکت")
      setIsSubmiting(false)
    }


  };

  const quickChips = currentUserRole === 'customer'
    ? [
      'آیا پیش‌فاکتور من تایید شده است؟',
      'لطفاً فیش واریزی بنده را بررسی نمایید.',
      'امکان ارسال بار با کدامین باربری وجود دارد؟',
      'چقدر زمان می‌برد تا کالا ارسال شود؟'
    ]
    : [
      'پیش‌فاکتور شما تایید و آماده پرداخت می‌باشد.',
      'فیش واریزی شما تایید گردید. کالا به باربری تحویل شد.',
      'لطفاً شماره تماس دقیق گیرنده را ارسال فرمایید.',
      'تخفیف درخواستی شما در فاکتور اعمال گردید.'
    ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all duration-300">
      {/* Accordion Toggle Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 bg-gradient-to-r from-sky-900 to-slate-900 text-white flex items-center justify-between gap-3 cursor-pointer hover:from-sky-800 hover:to-slate-800 transition"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-400/30">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-extrabold text-white">
                چت و تیکت پشتیبانی پیش‌فاکتور
              </h4>
              <span className="text-[11px] font-mono font-bold bg-sky-500/30 text-sky-200 px-2 py-0.5 rounded-full border border-sky-400/30">
                {order.pk || "ثبت نشده"}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              گفتگو و هماهنگی آنلاین خریدار و مدیریت برای این فاکتور
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border ${messageCount > 0
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
            : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{toPersianDigits(messageCount)} پیام</span>
          </span>

          <div className="p-1 rounded-lg bg-white/10 text-white">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Expanded Chat Body */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="p-4 bg-slate-50/70 border-t border-slate-200/80 space-y-4"
          >
            {/* Messages Thread Container */}
            <div className="space-y-3 max-h-80 overflow-y-auto p-2 rounded-2xl bg-white border border-slate-200/80 shadow-inner">
              {messages.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <MessageSquare className="w-10 h-10 text-slate-300 mx-auto animate-bounce" />
                  <p className="text-xs font-bold text-slate-600">
                    هنوز هیچ پیامی برای این پیش‌فاکتور ثبت نشده است.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    سوالات، توضیحات واریزی یا درخواست‌های باربری خود را در کادر زیر بنویسید.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.user_from === user.data?.pk;



                  return (
                    <motion.div
                      key={msg.pk}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={` flex  flex-col-reverse ${isMe ? 'items-start' : 'items-end'}`}
                    >
                      <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 shadow-xs space-y-1 ${!isMe
                        ? 'bg-sky-900 text-white rounded-bl-none border border-sky-800'
                        : 'bg-emerald-700 text-white rounded-br-none border border-emerald-600'
                        }`}>
                        <div className="flex items-center justify-between gap-4 border-b border-white/20 pb-1 text-[11px]">
                          <span className="font-extrabold flex items-center gap-1">
                            {isMe ? (
                              <>
                                <User className="w-3.5 h-3.5 text-sky-300" />
                                <span>{(user?.data?.fname || user?.data?.lname) ? (user?.data?.fname + " " + user?.data?.lname) : "شما"}</span>
                              </>
                            ) : (
                              <>
                                <User className="w-3.5 h-3.5 text-emerald-200" />
                                <span>{page === "adminPanel" ? "خریدار" : "پشتیبانی فروش"}</span>
                              </>
                            )}
                          </span>

                          <span className="text-[10px] text-white/70 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 opacity-70" />
                            {msg.date_created}
                          </span>
                        </div>

                        <p className="text-xs leading-relaxed whitespace-pre-wrap pt-1 font-medium">
                          {msg.text}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Quick Chips Suggestions */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-sky-600" />
                میانبرهای ارسال:
              </span>
              {quickChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInputText(chip)}
                  className="text-[11px] bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-800 px-2.5 py-1 rounded-xl border border-slate-200 hover:border-sky-300 transition cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Message Input Form */}
            <form className="flex gap-2 items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder='سوال یا پیام خود را برای مدیریت بنویسید...'

                className="flex-1 bg-white text-slate-900 text-xs font-bold p-3 rounded-2xl border border-slate-300 focus:border-sky-600 focus:ring-2 focus:ring-sky-100 outline-none shadow-xs"
              />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                onClick={handleSend}
                disabled={!inputText.trim() || isSubmiting}
                className={`px-4 py-3 rounded-2xl text-xs font-black transition flex items-center gap-1.5 shadow-md cursor-pointer ${inputText.trim()
                  ? 'bg-sky-600 hover:bg-sky-700 text-white'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
              >
                {isSubmiting ? <Spinner width={15} height={15} borderWidth={1.5} borderMainColor={"white"} borderTopColor={"blue"} /> :
                  <>
                    <Send className="w-4 h-4" />
                    <span>ارسال</span>
                  </>}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
