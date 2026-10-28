import React, { useState, useEffect, useCallback, useDeferredValue, useContext } from 'react';
import {
  DollarSign,
  Plus,
  Trash2,
  Image as ImageIcon,
  Search,
  User,
  Phone,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt
} from 'lucide-react';
import { CustomerTransaction, CustomerProfile, StoreSettings, TotalTransactionData, OrderItem, User as UserType, PaginationData } from '../types';
import { formatPrice, toPersianDigits } from '../utils/formatters';
import Spinner from './Spinner';
import fetchData from '../utils/fetchData';
import { Transaction } from '../types';
import Skeleton from 'react-loading-skeleton';
import PaginationContainer from './Pagintation';
import TransactionDetailModal from './TransactionDetailModal';
import UserTransactionModal from './UserTranactionsModal';
import TransactionCreateModal from './TransactionCreateModal';
import { MainContext, MainContextValue } from '../contexts/MainContext';
import API from '@/api/api';
import { AxiosResponse } from 'axios';


interface CustomerTransactionsPanelProps {
  storeSettings: StoreSettings;
}
interface TransactiosFilterState {
  searchQuery: string;
  typeFilter: 'all' | 'receive' | 'pay';
  page: number;
}

const STORAGE_KEY = 'pumpino_customer_transactions_v1';

export const CustomerTransactionsPanel: React.FC<CustomerTransactionsPanelProps> = ({
  storeSettings
}) => {
  const [totalTransactionData, setTotalTransactionData] = useState<TotalTransactionData>({
    total: null,
    paid: null,
    recieved: null
  })
  const mainContextValue = useContext<MainContextValue>(MainContext)




  const [detailInspectingTransaction, setDetailInspectingTransaction] = useState<Transaction | null>(null)
  const [dateSelectValue, setDateSelectedValue] = useState<number>(30)
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paginationData, setPaginationData] = useState<{
    prevPage: number | string | null;
    nextPage: number | string | null;
    pageNums: (number | string)[]
  }>({
    prevPage: null,
    nextPage: 2,
    pageNums: [],
  })


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserTransactionsDetialModalOpen, setIsUserTransactionsDetailModalOpen] = useState(false)
  const [transactionsInspectingUserPK, setTransactionsInspectingUserPK] = useState<null | UserType["pk"]>(null)
  const [isTransactionDetailModalOpen, setIsTransactionDetailModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('');
  const defferedSearchQuery = useDeferredValue(searchQuery)
  const [filterState, setFilterState] = useState<TransactiosFilterState>({
    page: 1,
    searchQuery: "",
    typeFilter: "all"
  })
  const [selectedReceiptImage, setSelectedReceiptImage] = useState<string | null>(null);

  const compileFilterStateToParams = useCallback(() => {
    const searchParams = new URLSearchParams()
    searchParams.append("search", filterState.searchQuery);
    searchParams.append("type_filter", filterState.typeFilter === "all" ? "" : filterState.typeFilter);
    searchParams.append("page", filterState.page.toString());
    return searchParams.toString()
  }, [filterState])




  // Form states for new transaction
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formCustomerPhone, setFormCustomerPhone] = useState('');
  const [formType, setFormType] = useState<'receive' | 'pay'>('receive');

  const [formAmountToman, setFormAmountToman] = useState<number>(0);
  const [formDate, setFormDate] = useState<string>(new Date().toLocaleDateString('fa-IR'));
  const [formMethod, setFormMethod] = useState<CustomerTransaction['method']>('card_to_card');
  const [formTrackingCode, setFormTrackingCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formReceiptImage, setFormReceiptImage] = useState<string>('');






  const [viewMode, setViewMode] = useState<'ledger' | 'user_base'>('ledger');



  //loadings 
  const [isLoadingTotalTransactionsData, setIsLoadingTotalTransactionsData] = useState<boolean>(false)
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true)
  const [isDeletingTransactionPK , setIsDeletingTransactionPK] = useState<Transaction["pk"] | null>()


  const [usersSerachQuery, setUsersSearchQuery] = useState("")
  const defferedUsersSearchQuery = useDeferredValue(usersSerachQuery)
  const [users, setUsers] = useState<UserType[]>([])
  const [usersFilterState, setUsersFilterState] = useState(
    {
      searchQuery: "",
      page: 1
    }
  )
  const [userPaginationData, setUserPaginationData] = useState<PaginationData>({
    nextPage: 2,
    prevPage: null,
    numPages: []
  })

  const [isLoadingUsers, setIsLoadingUsers] = useState(false)

  useEffect(() => {
    const timeoutID = setTimeout(() => setUsersFilterState(prev => ({ ...prev, searchQuery: defferedUsersSearchQuery })), 100);
    return () => clearTimeout(timeoutID)
  }, [defferedUsersSearchQuery])


  useEffect(() => {
    if (viewMode === 'user_base') {
      const searchParams = new URLSearchParams()
      searchParams.append("search_query", usersFilterState.searchQuery)
      searchParams.append("page", usersFilterState.page.toString())
      fetchData("users/admin-users-list/?" + searchParams.toString(), ({ data, status }: {
        data: {
          data: UserType[];
          prev_page: number | string | null;
          next_page: number | string | null;
          page_nums: (number | string)[];
          error_des?: string;
          detail?: string;
        };
        status: number
      }) => {
        if (status === 200) {
          setUsers(data.data)
          setUserPaginationData({
            nextPage: Number(data.next_page),
            prevPage: Number(data.prev_page),
            numPages: data.page_nums
          })
        } else {
          const e = data.error_des || data.detail || "حطا"
         mainContextValue?.onError(e)
        }
        setIsLoadingUsers(false)
      }, () => setIsLoadingUsers(true))
    }
  }, [viewMode, usersFilterState])

  const handleProcessTransactionsData = async () => {
    try {
      fetchData(`orders/admin-transaction-aggregation/?past_days=${dateSelectValue}`, ({ data, status }: {
        data: {
          paid: number;
          recieved: number;
          error_des?: string;
          detail?: string
        };
        status: number
      }) => {
        if (status === 200) {
          setTotalTransactionData({
            paid: data.paid,
            recieved: data.recieved,
            total: data.recieved - data.paid
          });
        } else {
          const e = data.error_des || data.detail || "خطا!"
          mainContextValue?.onError(e)
        }
        setIsLoadingTotalTransactionsData(false)
      }, () => setIsLoadingTotalTransactionsData(true) , () => mainContextValue?.onError("خطا در دریافت اطلاعات"))
    } catch (e) {
      mainContextValue?.onError("خطا در دریافت اطلاعات")
    }
  }




  const getTransactionReason = (transaction: Transaction) => {
    if (transaction.return_request) {
      return `مرجوعی کالا با کد درخواست ${transaction.return_request.pk}`
    }
    if (transaction.order) {
      return `پرداخت سفارش به کد ${transaction.order.pk}`
    }
  }

  


  const handleDeleteTransaction = async (id: string) => {
    try {
      if (!id) {
        mainContextValue?.onError("ایدی تراکنش ثبت نشده است")
      }
      if (confirm('آیا از حذف این تراکنش مالی اطمینان دارید؟')) {
        setIsDeletingTransactionPK(id)
        const { data, status }: AxiosResponse = await API.delete("orders/admin-transaction-delete/" + id.toString() + "/")
        if (status === 200) {
          setTransactions(prev => [...prev].filter(t => t.pk?.toString() !== id.toString()));
        } else {
          mainContextValue?.onError(data.error_des || data.details || "خطایی غیر منتطره رخ داد")
        }
        setIsDeletingTransactionPK(null)

      }
    } catch (e) {
          mainContextValue?.onError("خطایی غیر منتطره رخ داد")
        setIsDeletingTransactionPK(null)
      
    }
  };




  useEffect(() => {
    const timeoutID = setTimeout(() => {
      setFilterState(prev => (
        {
          ...prev,
          searchQuery: defferedSearchQuery,
        }
      ))
    }, 1000)
    return () => clearTimeout(timeoutID)
  }, [defferedSearchQuery])

  useEffect(() => {
    const searchParams = compileFilterStateToParams()
    fetchData("orders/admin-transactions-list/?" + searchParams, ({ data, status }) => {
      if (status === 200) {
        setTransactions(data.result)
        setPaginationData({
          nextPage: data.next_page,
          prevPage: data.previous_page,
          pageNums: data.page_nums,
        })
      } else {
        const e = data.error_des || data.details || "خطا!"
        mainContextValue?.onError(e)
      }
      setIsLoadingTransactions(false)
    }, () => setIsLoadingTransactions(true) , () => mainContextValue?.onError("خطا در دیافت اطلاعات"))
  }, [filterState])




  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-sky-600" />
            <span>ثبت دریافت و پرداخت مالی مشتریان و فیش‌های واریزی (Customer Ledger)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            مدیریت حساب مشتریان، ثبت فیش واریزی کارت‌به‌کارت/ساتنا، مانده بدهکاری و بستانکاری
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ ثبت تراکنش / فیش واریزی جدید</span>
        </button>
      </div>

      {/* Financial Overview Summary Cards */}
      <div className='w-full flex items-baseline-last justify-start gap-1.5'>
        <div className='flex flex-col gap-y-1.5 '>
          <label className='font-bold' htmlFor="date-threshold-input">
            تاریخ:
          </label>
          <select value={dateSelectValue} onChange={(e) => setDateSelectedValue(Number(e.target.value))} className='bg-slate-200 text-sm transition-colors   py-1.5 rounded-xl  px-3  focus:outline-0 focus:border-slate-400  border-2 border-slate-300 ' id='date-threshold-input'>
            <option className='text-sm' value={30}>
              30 روز اخیر
            </option>
            <option className='text-sm' value={60}>
              2 ماه اخیر
            </option>
            <option className='text-sm' value={90}>
              3 ماه اخیر
            </option>
            <option value={120}>
              3 ماه اخیر
            </option>
          </select>
        </div>
        <button disabled={isLoadingTotalTransactionsData} onClick={handleProcessTransactionsData} className='py-1.5 rounded-xl  px-3 bg-amber-400'>
          {isLoadingTotalTransactionsData ?
            <Spinner borderMainColor={"white"} borderTopColor={"orange"} borderWidth={1.75} height={22.5} width={22.5} />
            :
            <>
              <span className='text-sm font-bold text-white '>
                پردازش
              </span>
            </>}
        </button >
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-bold">
            <span className="flex items-center gap-1">
              <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
              <span>کل دریافتی از مشتریان:</span>
            </span>
            <span className="bg-emerald-200 text-emerald-900 text-[10px] px-2 py-0.5 rounded-md font-mono">
              دریافت (+)
            </span>
          </div>
          <div className="text-xl font-black text-emerald-900 font-mono">
            {isLoadingTotalTransactionsData ? <Spinner borderMainColor={"white"} width={30} height={30} borderWidth={2.5} borderTopColor={"green"} /> :
              totalTransactionData.recieved !== null ? formatPrice(Number(totalTransactionData.recieved), storeSettings.currencyUnit) : "--------"
            }
          </div>
        </div>

        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-rose-800 text-xs font-bold">
            <span className="flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4 text-rose-600" />
              <span>کل پرداختی به مشتریان / عودتی:</span>
            </span>
            <span className="bg-rose-200 text-rose-900 text-[10px] px-2 py-0.5 rounded-md font-mono">
              پرداخت (-)
            </span>
          </div>
          <div className="text-xl font-black text-rose-900 font-mono">
            {isLoadingTotalTransactionsData ? <Spinner borderMainColor={"white"} width={30} height={30} borderWidth={2.5} borderTopColor={"red"} /> :
              totalTransactionData.paid !== null ? formatPrice(Number(totalTransactionData.paid), storeSettings.currencyUnit) : "--------"
            }

          </div>
        </div>

        <div className="bg-sky-50 border border-sky-200 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-sky-800 text-xs font-bold">
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-sky-600" />
              <span>خالص مانده صندوق / حساب‌ها:</span>
            </span>
            <span className="bg-sky-200 text-sky-900 text-[10px] px-2 py-0.5 rounded-md font-mono">
              تراز کل
            </span>
          </div>
          <div className="text-xl font-black text-sky-900 font-mono">
            {isLoadingTotalTransactionsData ? <Spinner borderMainColor={"white"} width={30} height={30} borderWidth={2.5} borderTopColor={"blue"} /> :
              totalTransactionData.total !== null ? `${Number(totalTransactionData.total) <= 0 ? "-" : ""}` + formatPrice(Number(totalTransactionData.total), storeSettings.currencyUnit) : "--------"
            }
          </div>
        </div>
      </div>

      {/* View Mode Sub-tabs (Ledger Table vs Customer Receipts Archive) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('ledger')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${viewMode === 'ledger'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Receipt className="w-4 h-4 text-sky-600" />
            <span>دفتر تراکنش‌های مالی و واریزی‌ها</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('user_base')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${viewMode === 'user_base'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <User className="w-4 h-4 text-emerald-600" />
            <span>تراز ملی کاربران</span>

          </button>
        </div>

        <div className="text-xs text-slate-500 font-bold px-2">
          {viewMode === 'ledger' ? 'نمایش جدول حساب‌ها' : 'تراز مالی کاربران'}
        </div>
      </div>

      {viewMode === 'ledger' ? (
        <>
          {/* Search and Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجوی نام مشتری، شماره تماس، کد پیگیری"
                className="w-full bg-white pr-9 pl-3 py-2 rounded-xl text-xs font-bold border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterState(prev => ({ ...prev, typeFilter: "all" }))}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${filterState.typeFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border border-slate-200'
                  }`}
              >
                همه موارد
              </button>

              <button
                onClick={() => setFilterState(prev => ({ ...prev, typeFilter: "receive" }))}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${filterState.typeFilter === 'receive' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-800 border border-slate-200'
                  }`}
              >
                دریافتی‌ها (+)
              </button>

              <button
                onClick={() => setFilterState(prev => ({ ...prev, typeFilter: "pay" }))}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${filterState.typeFilter === 'pay' ? 'bg-rose-600 text-white' : 'bg-white text-rose-800 border border-slate-200'
                  }`}
              >
                پرداختی‌ها (-)
              </button>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto rounded-2xl border overflow-auto border-slate-200">
            <table className="w-full text-xs text-right min-w-175">
              <thead className="bg-slate-100 text-slate-800 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3 text-center">#</th>
                  <th className="p-3 text-center">نام و مشخصات مشتری</th>
                  <th className="p-3 text-center">نوع تراکنش</th>
                  <th className="p-3 text-center">مبلغ (تومان)</th>
                  <th className="p-3 text-center">تاریخ و دلیل پرداخت</th>
                  <th className="p-3 text-center">کد پیگیری / توضیحات</th>

                  <th className="p-3 text-center">عملیات</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {isLoadingTransactions ?
                  Array(6).fill({}).map(ele => {
                    return (
                      <tr>
                        {Array(7).fill({}).map(ele => {
                          return (
                            <td className='text-center p-1.5'>
                              <Skeleton width={75} height={30} containerClassName='flex w-full text-center justify-center gap-3 items-center'
                              />
                            </td>
                          )

                        })}

                      </tr>
                    )
                  })

                  :

                  transactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500 font-bold">
                        هیچ تراکنش مالی ثبت‌شده‌ای یافت نشد.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((t, index) => (
                      <tr key={index + 1} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 font-mono font-bold text-slate-400">{index + 1}</td>
                        <td className="p-3">
                          <div className="font-extrabold text-slate-900">
                            {`${(t.user?.fname || t.user?.lname) ? (t.user.fname || "") + " " + (t.user.lname || "") : ""} `}

                          </div>
                          {t.user?.phone && (
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">{toPersianDigits(t.user.phone)}</div>
                          )}
                        </td>

                        <td className="p-3 text-center">
                          {t.transaction_type === 'PAYMENT' ? (
                            <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[11px] px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                              <span>دریافت (+)</span>
                            </span>
                          ) : (
                            <span className="bg-rose-100 text-rose-800 font-extrabold text-[11px] px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                              <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                              <span>پرداخت (-)</span>
                            </span>
                          )}
                        </td>

                        <td className="p-3 font-black text-sm font-mono text-slate-900">
                          {formatPrice(t.price, storeSettings.currencyUnit)}
                        </td>

                        <td className="p-3">
                          <div className="font-bold text-slate-800">{t.date_created}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            {getTransactionReason(t)}
                          </div>
                        </td>

                        {/* <td className="p-3 max-w-xs space-y-1">
                        {t.chequeDetails ? (
                          <div className="bg-purple-50 p-2 rounded-xl border border-purple-200 text-[11px] space-y-1">
                            {t.chequeDetails.sayadiId && (
                              <div className="font-mono font-black text-purple-900 dir-ltr text-right">
                                شناسه صیادی: {toPersianDigits(t.chequeDetails.sayadiId)}
                              </div>
                            )}
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-slate-700 font-bold">
                              {t.chequeDetails.bankName && <span>بانک: {t.chequeDetails.bankName}</span>}
                              {t.chequeDetails.chequeNumber && <span className="font-mono">چک #: {toPersianDigits(t.chequeDetails.chequeNumber)}</span>}
                              {t.chequeDetails.dueDate && <span>سررسید: {toPersianDigits(t.chequeDetails.dueDate)}</span>}
                              {t.chequeDetails.drawerName && <span>صادرکننده: {t.chequeDetails.drawerName}</span>}
                            </div>
                            {t.chequeDetails.status && (
                              <div className="pt-0.5">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${t.chequeDetails.status === 'cleared' ? 'bg-emerald-100 text-emerald-800' :
                                  t.chequeDetails.status === 'bounced' ? 'bg-rose-100 text-rose-800' :
                                    t.chequeDetails.status === 'deposited' ? 'bg-sky-100 text-sky-800' :
                                      t.chequeDetails.status === 'returned' ? 'bg-amber-100 text-amber-800' :
                                        'bg-purple-100 text-purple-900'
                                  }`}>
                                  {t.chequeDetails.status === 'cleared' ? 'پاس شده / وصول' :
                                    t.chequeDetails.status === 'bounced' ? 'برگشتی' :
                                      t.chequeDetails.status === 'deposited' ? 'واگذار به بانک' :
                                        t.chequeDetails.status === 'returned' ? 'استرداد شده' :
                                          'ثبت در سامانه صیاد'}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          t.trackingCode && (
                            <div className="font-mono text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded inline-block mb-1">
                              کد: {toPersianDigits(t.trackingCode)}
                            </div>
                          )
                        )}
                        <div className="text-slate-600 text-[11px] line-clamp-2">{t.description || 'بدون توضیحات'}</div>
                      </td> */}

                        <td className='p-3 max-w-xs space-y-1 w-full flex justify-center items-center '>
                          <button onClick={() => {
                            setIsTransactionDetailModalOpen(true)
                            setDetailInspectingTransaction(t)
                          }} className='py-1.5 rounded-md  px-1 text-center bg-linear-to-br from-green-800 to-green-950 from-0%'>
                            <span className='text-white font-bold '>
                              جزئیات بیشتر
                            </span>
                          </button>
                        </td>


                        <td className="p-3 text-center">
                          <button
                            type="button"
                            disabled={isDeletingTransactionPK && isDeletingTransactionPK === t.pk ? true : false}
                            onClick={() => handleDeleteTransaction(t.pk?.toString() || "")}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                            title="حذف تراکنش"
                          >
                            {isDeletingTransactionPK && isDeletingTransactionPK === t.pk ?
                            <Spinner borderMainColor={"white"} borderTopColor={"red"} borderWidth={1.75} height={17.5} width={17.5} />
                            : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )
                }
              </tbody>
            </table>


          </div>
          {!isLoadingTransactions &&
            <PaginationContainer setFilterState={setFilterState} prevPage={paginationData.prevPage} pageNums={paginationData.pageNums} nextPage={paginationData.nextPage} />
          }
        </>
      ) : (
        /* Receipts Archive Mode: Categorized per Customer with Date & Time filtering */
        <div className="space-y-6">
          {/* Archive Search and Filter controls */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>جستجو در کابران و دیدن تراکنش:</span>
              </h4>


            </div>

            <div className="">
              {/* Search by Customer or Tracking Code */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  value={usersSerachQuery}
                  onChange={(e) => setUsersSearchQuery(e.target.value)}
                  placeholder="جستجو در نام و نام خانوادگی کاربران ، شماره تلفن کاربران و..."
                  className="w-full bg-white pr-9 pl-3 py-2 rounded-xl text-xs font-bold border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>


          {(() => {

            return (
              <div className="space-y-6">
                {isLoadingUsers ?
                  Array(6).fill({}).map(() => (
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
                      {/* Customer Banner */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <Skeleton width={30} height={30} circle />
                          <Skeleton width={90} height={30} />
                        </div>

                        <div className="flex items-center gap-3">
                          <Skeleton width={90} height={30} />
                          <Skeleton width={90} height={30} />
                        </div>
                      </div>
                    </div>

                  ))
                  : users.length === 0 ? <div className='font-bold flex items-center justify-center w-full p-5 text-center text-gray-500 text-xl '>
                    <span>
                      کاربری یافت نشد!
                    </span>
                  </div> : (
                    users.map(user => {


                      return (
                        <div key={user.pk} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
                          {/* Customer Banner */}
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center font-black">
                                <User className="w-5 h-5 text-emerald-600" />
                              </div>
                              <div>
                                <h4 className="font-black text-slate-900 text-sm">{(user.fname || user.lname) ? (user.fname || "") + " " + (user.lname || "") : "ثبت نشده"}</h4>
                                {user.phone && (
                                  <p className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    <span>{toPersianDigits(user.phone)}</span>
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <button onClick={() => {
                                setIsUserTransactionsDetailModalOpen(true)
                                setTransactionsInspectingUserPK(user.pk)
                              }} className='bg-amber-100 border-2 p-1.5 flex justify-center items-center border-amber-200 text-amber-400 rounded-xl'>
                                <span className='font-mono font-black text-xs'>
                                  دیدن همه تراکنش ها
                                </span>
                              </button>


                              <span className={` ${(typeof user.total_deposit === "number" && user.total_deposit < 0) ? "bg-red-50 text-red-500 border-red-200" : "bg-emerald-50 text-emerald-900 border-emerald-200"} font-mono font-black text-xs px-3 py-1.5 rounded-xl border `}>
                                گردش مالی خالص:  {(user.total_deposit !== null && typeof user.total_deposit === "number") ? formatPrice(user.total_deposit, storeSettings.currencyUnit) : "تراکنشی برای این کاربر ثبت نشده"}
                              </span>

                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
              </div>
            );
          })()}

          {!isLoadingUsers && users.length !== 0 &&
            <PaginationContainer nextPage={userPaginationData.nextPage} pageNums={userPaginationData.numPages} setFilterState={setUsersFilterState} prevPage={userPaginationData.prevPage} />}
        </div>
      )}

      {/* Modal for Creating New Customer Financial Transaction */}
      {isModalOpen && (
        <TransactionCreateModal setTransactions={setTransactions} setIsModalOpen={setIsModalOpen} />
      )}

      {/* Modal for Viewing Full Receipt Slip Image */}
      {selectedReceiptImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-4 space-y-4 relative border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-sky-600" />
                <span>تصویر فیش واریزی بانکی</span>
              </h4>
              <button
                onClick={() => setSelectedReceiptImage(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 max-h-[70vh] flex items-center justify-center">
              <img
                src={selectedReceiptImage}
                alt="فیش واریزی"
                className="max-w-full max-h-[65vh] object-contain"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedReceiptImage(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
      {isTransactionDetailModalOpen && detailInspectingTransaction &&
        <TransactionDetailModal onClose={() => {
          setIsTransactionDetailModalOpen(false);
          setDetailInspectingTransaction(null);
        }} transaction={detailInspectingTransaction} />
      }
      {isUserTransactionsDetialModalOpen && transactionsInspectingUserPK &&
        <UserTransactionModal onClose={() => {
          setIsTransactionDetailModalOpen(false);
          setTransactionsInspectingUserPK(null)
        }} userId={transactionsInspectingUserPK} />
      }
    </div>
  );
};
