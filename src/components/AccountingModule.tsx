import React, { useState } from 'react';
import {
  CircleDollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Receipt,
  CreditCard,
  Users,
  BarChart3,
  FileSpreadsheet,
  Trash2,
  Calendar,
  Search,
  PieChart,
  Building2,
  Phone,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { CustomerOrder, StoreSettings, PaymentStatus, OrderStatus, ExpenseEntry } from '../types';
import { formatPrice, toPersianDigits } from '../utils/formatters';

interface AccountingModuleProps {
  orders: CustomerOrder[];
  storeSettings: StoreSettings;
  onUpdateOrders: (updatedOrders: CustomerOrder[]) => void;
}

export const AccountingModule: React.FC<AccountingModuleProps> = ({
  orders,
  storeSettings,
  onUpdateOrders
}) => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'expenses' | 'debtors' | 'analytics'>('transactions');

  // Search and Filters for transactions
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid_approved' | 'pending_verification' | 'unpaid'>('all');

  // Local Expenses State with initial sample data
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([
    {
      id: 'exp-1',
      title: 'کرایه حمل کالا از انبار مرکزی به باربری',
      amountToman: 450000,
      category: 'shipping',
      date: '۱۴۰۳/۰۵/۰۵',
      note: 'باربری جهانگیر - ۵ کارتن پمپ',
      recordedBy: 'مدیریت انبار'
    },
    {
      id: 'exp-2',
      title: 'خرید اولیه قطعات یدکی و مکانیکال سیل',
      amountToman: 5200000,
      category: 'purchase',
      date: '۱۴۰۳/۰۵/۰۳',
      note: 'فاکتور شرکتی واردات پنتاکس',
      recordedBy: 'مدیریت فروشگاه'
    }
  ]);

  // New Expense Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [newExpTitle, setNewExpTitle] = useState('');
  const [newExpAmount, setNewExpAmount] = useState<number | ''>('');
  const [newExpCategory, setNewExpCategory] = useState<ExpenseEntry['category']>('other');
  const [newExpNote, setNewExpNote] = useState('');

  // Calculations for Financial KPIs
  const totalInvoicedAmount = orders
    .filter(o => o.status !== 'rejected')
    .reduce((sum, o) => sum + o.totalAmountToman, 0);

  const totalPaidAmount = orders
    .filter(o => o.paymentStatus === 'paid_approved')
    .reduce((sum, o) => sum + o.totalAmountToman, 0);

  const totalPendingPaymentAmount = orders
    .filter(o => o.status !== 'rejected' && o.paymentStatus !== 'paid_approved')
    .reduce((sum, o) => sum + o.totalAmountToman, 0);

  const totalExpensesAmount = expenses.reduce((sum, e) => sum + e.amountToman, 0);

  const netCashFlow = totalPaidAmount - totalExpensesAmount;

  // Date calculations for Today, Week, Month
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).getTime();

  const validOrders = orders.filter(o => o.status !== 'rejected');

  const todayOrders = validOrders.filter(o => {
    const t = new Date(o.createdAt).getTime();
    return !isNaN(t) && t >= startOfToday;
  });
  const todayTotalAmount = todayOrders.reduce((sum, o) => sum + o.totalAmountToman, 0);
  const todayPaidAmount = todayOrders.filter(o => o.paymentStatus === 'paid_approved').reduce((sum, o) => sum + o.totalAmountToman, 0);

  const weekOrders = validOrders.filter(o => {
    const t = new Date(o.createdAt).getTime();
    return !isNaN(t) && t >= sevenDaysAgo;
  });
  const weekTotalAmount = weekOrders.reduce((sum, o) => sum + o.totalAmountToman, 0);
  const weekPaidAmount = weekOrders.filter(o => o.paymentStatus === 'paid_approved').reduce((sum, o) => sum + o.totalAmountToman, 0);

  const monthOrders = validOrders.filter(o => {
    const t = new Date(o.createdAt).getTime();
    return !isNaN(t) && t >= thirtyDaysAgo;
  });
  const monthTotalAmount = monthOrders.reduce((sum, o) => sum + o.totalAmountToman, 0);
  const monthPaidAmount = monthOrders.filter(o => o.paymentStatus === 'paid_approved').reduce((sum, o) => sum + o.totalAmountToman, 0);

  // Handler to approve/change payment status of an order
  const handlePaymentStatusChange = (orderId: string, newStatus: PaymentStatus) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          paymentStatus: newStatus,
          // if paid_approved, make sure order status is at least approved
          status: (newStatus === 'paid_approved' && (o.status === 'pending' || o.status === 'reviewed'))
            ? ('approved' as OrderStatus)
            : o.status,
          updatedAt: new Date().toISOString()
        };
      }
      return o;
    });
    onUpdateOrders(updated);
  };

  // Add Expense
  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpTitle.trim() || !newExpAmount || Number(newExpAmount) <= 0) {
      alert('لطفاً عنوان و مبلغ معتبر برای هزینه وارد کنید.');
      return;
    }

    const newExpense: ExpenseEntry = {
      id: `exp-${Date.now()}`,
      title: newExpTitle.trim(),
      amountToman: Number(newExpAmount),
      category: newExpCategory,
      date: new Date().toLocaleDateString('fa-IR'),
      note: newExpNote.trim(),
      recordedBy: 'مدیریت سیستم'
    };

    setExpenses([newExpense, ...expenses]);
    setNewExpTitle('');
    setNewExpAmount('');
    setNewExpNote('');
    setIsExpenseModalOpen(false);
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('آیا از حذف این ردیف هزینه اطمینان دارید؟')) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  // Export Transactions to Excel
  const handleExportTransactionsExcel = () => {
    const dataToExport = orders.map(o => ({
      'شماره فاکتور': o.orderNumber,
      'تاریخ فاکتور': o.invoiceIssuedDate || o.createdAt,
      'نام مشتری': o.customerProfile.fullName,
      'فروشگاه / خریدار': o.customerProfile.storeName || 'مشتری حقیقی',
      'تلفن': o.customerProfile.mobilePhone,
      'شهر / استان': o.customerProfile.provinceCity,
      'مبلغ کل فاکتور (تومان)': o.totalAmountToman,
      'مبلغ تخفیف (تومان)': o.discountToman || 0,
      'وضعیت پرداخت': o.paymentStatus === 'paid_approved' ? 'واریز شده و تایید شده' : o.paymentStatus === 'pending_verification' ? 'در انتظار بررسی واریز' : 'پرداخت نشده',
      'شماره فیش / کد پیگیری': o.paymentReceiptRef || '-',
      'تاریخ واریز': o.paymentReceiptDate || '-',
      'باربری درخواستی': o.shippingFreightName
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "صورتحساب‌های فروش");
    XLSX.writeFile(wb, `Accounting_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Filtered Orders for table
  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o?.orderNumber?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      o?.customerProfile?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o?.customerProfile?.storeName && o?.customerProfile.storeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o?.paymentReceiptRef && o?.paymentReceiptRef?.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPayment = paymentFilter === 'all' || o.paymentStatus === paymentFilter;

    return matchesSearch && matchesPayment;
  });

  // Group debtors (Customers with unpaid or pending orders)
  const debtorsList = orders
    .filter(o => o.status !== 'rejected' && o.paymentStatus !== 'paid_approved')
    .reduce((acc: any[], order) => {
      const existing = acc.find(item => item.customer.mobilePhone === order.customerProfile.mobilePhone);
      if (existing) {
        existing.totalDebt += order.totalAmountToman;
        existing.unpaidOrdersCount += 1;
        existing.orders.push(order);
      } else {
        acc.push({
          customer: order.customerProfile,
          totalDebt: order.totalAmountToman,
          unpaidOrdersCount: 1,
          orders: [order]
        });
      }
      return acc;
    }, []);

  return (
    <div className="space-y-6">
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 text-white p-5 rounded-3xl shadow-lg border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
            <CircleDollarSign className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-100 flex items-center gap-2">
              <span>ماژول کامل حسابداری و تراز مالی فروشگاه</span>
              <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold">
                نسخه هوشمند
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              مدیریت تراکنش‌ها، وصولی‌ها، بدهکاران، ثبت هزینه‌ها و گزارشات مالی
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleExportTransactionsExcel}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>خروجی اکسل دفتر مالی</span>
          </button>
        </div>
      </div>

      {/* Sales Breakdown by Period (Today / Week / Month) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 p-5 rounded-3xl text-white border border-slate-700/60 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-400" />
            <h3 className="font-extrabold text-sm sm:text-base text-slate-100">
              گزارش مقایسه‌ای فروش دوره‌ای (امروز / ۷ روز اخیر / ۳۰ روز اخیر)
            </h3>
          </div>
          <span className="text-[11px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2.5 py-0.5 rounded-full font-bold">
            بروزرسانی لحظه‌ای
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Today Card */}
          <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700/80 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sky-300 text-xs flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-400" />
                <span>فروش امروز (روز جاری)</span>
              </span>
              <span className="bg-sky-500/20 text-sky-200 px-2 py-0.5 rounded-full font-mono text-[11px] font-bold">
                {toPersianDigits(todayOrders.length)} سفارش
              </span>
            </div>
            <div className="text-base sm:text-lg font-black font-mono text-white pt-1">
              {formatPrice(todayTotalAmount, storeSettings.currencyUnit)}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-700/60 pt-2 font-medium">
              <span>وصولی تایید شده:</span>
              <span className="font-bold text-emerald-400 font-mono">
                {formatPrice(todayPaidAmount, storeSettings.currencyUnit)}
              </span>
            </div>
          </div>

          {/* Week Card */}
          <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700/80 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-amber-300 text-xs flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>فروش هفته جاری (۷ روز اخیر)</span>
              </span>
              <span className="bg-amber-500/20 text-amber-200 px-2 py-0.5 rounded-full font-mono text-[11px] font-bold">
                {toPersianDigits(weekOrders.length)} سفارش
              </span>
            </div>
            <div className="text-base sm:text-lg font-black font-mono text-white pt-1">
              {formatPrice(weekTotalAmount, storeSettings.currencyUnit)}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-700/60 pt-2 font-medium">
              <span>وصولی تایید شده:</span>
              <span className="font-bold text-emerald-400 font-mono">
                {formatPrice(weekPaidAmount, storeSettings.currencyUnit)}
              </span>
            </div>
          </div>

          {/* Month Card */}
          <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700/80 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-emerald-300 text-xs flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>فروش ماه جاری (۳۰ روز اخیر)</span>
              </span>
              <span className="bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded-full font-mono text-[11px] font-bold">
                {toPersianDigits(monthOrders.length)} سفارش
              </span>
            </div>
            <div className="text-base sm:text-lg font-black font-mono text-white pt-1">
              {formatPrice(monthTotalAmount, storeSettings.currencyUnit)}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-700/60 pt-2 font-medium">
              <span>وصولی تایید شده:</span>
              <span className="font-bold text-emerald-400 font-mono">
                {formatPrice(monthPaidAmount, storeSettings.currencyUnit)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Invoiced */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>مجموع فاکتورهای صادرشده</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black font-mono text-slate-900">
            {formatPrice(totalInvoicedAmount, storeSettings.currencyUnit)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between pt-1 border-t border-slate-100">
            <span>تعداد فاکتورها:</span>
            <span className="font-bold text-slate-800">{toPersianDigits(orders.length)} فاکتور</span>
          </div>
        </div>

        {/* Card 2: Total Received Cash */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>درآمد محقق‌شده (وصولی بانک)</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black font-mono text-emerald-700">
            {formatPrice(totalPaidAmount, storeSettings.currencyUnit)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between pt-1 border-t border-slate-100">
            <span>فاکتورهای تسویه شده:</span>
            <span className="font-bold text-emerald-700">
              {toPersianDigits(orders.filter(o => o.paymentStatus === 'paid_approved').length)} عدد
            </span>
          </div>
        </div>

        {/* Card 3: Pending Receivables */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>مطالبات و فاکتورهای معوق</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black font-mono text-amber-700">
            {formatPrice(totalPendingPaymentAmount, storeSettings.currencyUnit)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between pt-1 border-t border-slate-100">
            <span>مشتریان بدهکار:</span>
            <span className="font-bold text-amber-700">{toPersianDigits(debtorsList.length)} نفر</span>
          </div>
        </div>

        {/* Card 4: Net Cash balance after Expenses */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>تراز خالص واریزی‌ها (منهای هزینه)</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-lg font-black font-mono ${netCashFlow >= 0 ? 'text-indigo-700' : 'text-rose-600'}`}>
            {formatPrice(netCashFlow, storeSettings.currencyUnit)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between pt-1 border-t border-slate-100">
            <span>مجموع هزینه‌ها:</span>
            <span className="font-bold text-rose-600 font-mono">
              {formatPrice(totalExpensesAmount, storeSettings.currencyUnit)}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${activeTab === 'transactions'
              ? 'bg-sky-600 text-white shadow'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>دفتر تراکنش‌ها و دریافتی فاکتورها</span>
          <span className="bg-sky-500/20 text-sky-200 px-2 py-0.5 rounded-full text-[10px]">
            {toPersianDigits(orders.length)}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${activeTab === 'expenses'
              ? 'bg-sky-600 text-white shadow'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
        >
          <Receipt className="w-4 h-4" />
          <span>ثبت و مدیریت هزینه‌های فروشگاه</span>
          <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full text-[10px]">
            {toPersianDigits(expenses.length)}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('debtors')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${activeTab === 'debtors'
              ? 'bg-sky-600 text-white shadow'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
        >
          <Users className="w-4 h-4" />
          <span>صورتحساب و بدهکاران</span>
          <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full text-[10px]">
            {toPersianDigits(debtorsList.length)}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${activeTab === 'analytics'
              ? 'bg-sky-600 text-white shadow'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>گزارشات آماری و نموداری</span>
        </button>
      </div>

      {/* TAB 1: TRANSACTIONS & INVOICES */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
          {/* Controls & Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="جستجو بر اساس کد فاکتور، نام مشتری، شماره فیش یا تلفن..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-bold shrink-0">فیلتر پرداخت:</span>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="all">همه تراکنش‌ها</option>
                <option value="paid_approved">🟢 پرداخت و واریزی تایید شده</option>
                <option value="pending_verification">🟡 در انتظار تایید فیش</option>
                <option value="unpaid">🔴 پرداخت نشده</option>
              </select>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3">شماره فاکتور</th>
                  <th className="p-3">مشتری / خریدار</th>
                  <th className="p-3">تاریخ فاکتور</th>
                  <th className="p-3">مبلغ کل (تومان)</th>
                  <th className="p-3">وضعیت پرداخت</th>
                  <th className="p-3">کد پیگیری / فیش</th>
                  <th className="p-3 text-center">عملیات حسابداری</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map(order => {
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 font-mono font-bold text-slate-900 dir-ltr text-right">
                          {order.orderNumber}
                        </td>

                        <td className="p-3">
                          <div className="font-bold text-slate-900">{order.customerProfile.fullName}</div>
                          {order.customerProfile.storeName && (
                            <div className="text-[11px] text-slate-500 font-medium">
                              {order.customerProfile.storeName}
                            </div>
                          )}
                        </td>

                        <td className="p-3 text-slate-500 font-mono text-[11px]">
                          {order.invoiceIssuedDate || new Date(order.createdAt).toLocaleDateString('fa-IR')}
                        </td>

                        <td className="p-3 font-mono font-black text-slate-900 text-sm">
                          {formatPrice(order.totalAmountToman, storeSettings.currencyUnit)}
                        </td>

                        <td className="p-3">
                          {order.paymentStatus === 'paid_approved' ? (
                            <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>واریزی تایید شد</span>
                            </span>
                          ) : order.paymentStatus === 'pending_verification' ? (
                            <span className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1 animate-pulse">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>در انتظار بررسی فیش</span>
                            </span>
                          ) : (
                            <span className="bg-rose-50 text-rose-700 border border-rose-200 font-bold px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                              <span>پرداخت نشده</span>
                            </span>
                          )}
                        </td>

                        <td className="p-3 font-mono text-[11px]">
                          {order.paymentReceiptRef ? (
                            <div className="bg-slate-100 p-1.5 rounded-lg border border-slate-200 text-slate-900 font-bold dir-ltr text-center">
                              {order.paymentReceiptRef}
                            </div>
                          ) : (
                            <span className="text-slate-400 font-sans">-</span>
                          )}
                        </td>

                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {order.paymentStatus !== 'paid_approved' ? (
                              <button
                                onClick={() => handlePaymentStatusChange(order.id, 'paid_approved')}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition cursor-pointer flex items-center gap-1"
                                title="تایید پرداخت این فاکتور"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>تایید واریزی</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handlePaymentStatusChange(order.id, 'unpaid')}
                                className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-[10px] transition cursor-pointer"
                              >
                                لغو تایید
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">
                      هیچ تراکنش یا فاکتوری با مشخصات جستجو شده یافت نشد.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: STORE EXPENSES MANAGEMENT */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">دفتر ثبت هزینه‌های جاری فروشگاه</h3>
              <p className="text-xs text-slate-500">ثبت هزینه‌های انبارداری، حمل و نقل، خریدهای شرکتی و غیره</p>
            </div>

            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ ثبت هزینه جدید</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3">عنوان هزینه</th>
                  <th className="p-3">دسته هزینه</th>
                  <th className="p-3">تاریخ ثبت</th>
                  <th className="p-3">مبلغ هزینه (تومان)</th>
                  <th className="p-3">توضیحات / بابت</th>
                  <th className="p-3">ثبت کننده</th>
                  <th className="p-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.length > 0 ? (
                  expenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-bold text-slate-900">{exp.title}</td>
                      <td className="p-3">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-bold text-[11px]">
                          {exp.category === 'shipping' ? '🚚 حمل و نقل' :
                            exp.category === 'purchase' ? '📦 خرید انبار' :
                              exp.category === 'salary' ? '👥 حقوق' :
                                exp.category === 'utilities' ? '⚡ قبوض و خدمات' : 'سایر'}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-500">{exp.date}</td>
                      <td className="p-3 font-mono font-black text-rose-600 text-sm">
                        {formatPrice(exp.amountToman, storeSettings.currencyUnit)}
                      </td>
                      <td className="p-3 text-slate-600">{exp.note || '-'}</td>
                      <td className="p-3 text-slate-500">{exp.recordedBy}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="حذف هزینه"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">
                      هیچ هزینه‌ای ثبت نشده است.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DEBTORS & CUSTOMER BALANCES */}
      {activeTab === 'debtors' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900">لیست و صورتحساب بدهکاران (معوقات پرداخت)</h3>
            <p className="text-xs text-slate-500">فهرست خریدارانی که فاکتور صادرشده پرداخت نشده دارند</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {debtorsList.length > 0 ? (
              debtorsList.map((debtor, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-600" />
                      <span className="font-extrabold text-sm text-slate-900">
                        {debtor.customer.fullName}
                      </span>
                      {debtor.customer.storeName && (
                        <span className="text-xs text-slate-500 font-medium">({debtor.customer.storeName})</span>
                      )}
                    </div>
                    <span className="bg-amber-100 text-amber-900 text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {toPersianDigits(debtor.unpaidOrdersCount)} فاکتور تسویه‌نشده
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Phone className="w-3.5 h-3.5" />
                      <span className="font-mono dir-ltr">{debtor.customer.mobilePhone}</span>
                    </div>
                    <div className="text-slate-500">
                      استان: <span className="font-bold text-slate-700">{debtor.customer.provinceCity}</span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">مجموع مانده بدهی:</span>
                    <span className="text-base font-black font-mono text-rose-600">
                      {formatPrice(debtor.totalDebt, storeSettings.currencyUnit)}
                    </span>
                  </div>

                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] font-bold text-slate-600 block">فاکتورهای معوق این مشتری:</span>
                    {debtor.orders.map((o: CustomerOrder) => (
                      <div key={o.id} className="flex items-center justify-between text-[11px] bg-white p-2 rounded-lg border border-slate-100">
                        <span className="font-mono font-bold text-slate-800 dir-ltr">{o.orderNumber}</span>
                        <span className="font-mono font-bold text-slate-900">{formatPrice(o.totalAmountToman, storeSettings.currencyUnit)}</span>
                        <span className="text-amber-700 font-bold">
                          {o.paymentStatus === 'pending_verification' ? 'در انتظار بررسی واریز' : 'پرداخت نشده'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 p-8 text-center text-slate-500 text-xs">
                خوشبختانه هیچ مشتری بدهکاری وجود ندارد و تمامی فاکتورها تسویه شده‌اند.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900">تحلیل و گزارشات آماری فروش</h3>
            <p className="text-xs text-slate-500">تحلیل نسبت تسویه فاکتورها و وضعیت مالی بازرگانی</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <h4 className="font-bold text-xs text-slate-800 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-sky-600" />
                <span>نسبت فاکتورهای تسویه‌شده به کل مطالبات:</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-emerald-700">فاکتورهای وصول شده (نقدی):</span>
                    <span className="font-mono">{toPersianDigits(Math.round((totalPaidAmount / (totalInvoicedAmount || 1)) * 100))}٪</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.round((totalPaidAmount / (totalInvoicedAmount || 1)) * 100))}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-amber-700">فاکتورهای معوق (بدهی):</span>
                    <span className="font-mono">{toPersianDigits(Math.round((totalPendingPaymentAmount / (totalInvoicedAmount || 1)) * 100))}٪</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-amber-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.round((totalPendingPaymentAmount / (totalInvoicedAmount || 1)) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <h4 className="font-bold text-xs text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>خلاصه میانگین‌ها:</span>
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-[11px] block">میانگین مبلغ هر فاکتور:</span>
                  <span className="font-bold font-mono text-sm text-slate-900 block mt-1">
                    {formatPrice(orders.length > 0 ? Math.round(totalInvoicedAmount / orders.length) : 0, storeSettings.currencyUnit)}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-[11px] block">نرخ وصول مطالبات:</span>
                  <span className="font-bold font-mono text-sm text-emerald-600 block mt-1">
                    {toPersianDigits(orders.length > 0 ? Math.round((orders.filter(o => o.paymentStatus === 'paid_approved').length / orders.length) * 100) : 0)}٪
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expense Creation Modal */}
      {isExpenseModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsExpenseModalOpen(false)}
        >
          <form
            onSubmit={handleAddExpenseSubmit}
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 relative my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-3">
              ثبت هزینه جدید فروشگاه
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">عنوان هزینه:</label>
                <input
                  type="text"
                  placeholder="مثلاً: هزینه حمل ۵ پمپ به باربری"
                  value={newExpTitle}
                  onChange={(e) => setNewExpTitle(e.target.value)}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 font-bold focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">مبلغ به تومان:</label>
                <input
                  type="number"
                  placeholder="مثلاً: 450000"
                  value={newExpAmount}
                  onChange={(e) => setNewExpAmount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 font-mono font-bold focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">دسته‌بندی هزینه:</label>
                <select
                  value={newExpCategory}
                  onChange={(e) => setNewExpCategory(e.target.value as any)}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 font-bold focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="shipping">🚚 حمل و نقل و باربری</option>
                  <option value="purchase">📦 خرید اجناس و قطعات انبار</option>
                  <option value="salary">👥 حقوق و دستمزد</option>
                  <option value="utilities">⚡ قبوض، اینترنت و خدمات</option>
                  <option value="tax">🏛️ مالیات و عوارض</option>
                  <option value="other">سایر هزینه‌ها</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">توضیحات تکمیلی:</label>
                <textarea
                  placeholder="توضیحات یا شماره فاکتور هزینه..."
                  value={newExpNote}
                  onChange={(e) => setNewExpNote(e.target.value)}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 h-20 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
              >
                ثبت در حسابداری
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
