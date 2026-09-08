// app/wbos/sadaat/reports/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Printer,
  Wallet,
  Truck,
  Building2,
  Package,
  Banknote,
  DollarSign,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ChevronDown as ChevronDownIcon,
} from "lucide-react";
import { Skeleton } from "@/app/components/ui/Skeleton";

// ============================================================
// TYPES
// ============================================================
interface ReportData {
  month: string;
  timeline: {
    daily: Array<{ date: string; revenue: number; expenses: number; profit: number }>;
    weekly: Array<{ week: string; revenue: number; expenses: number; profit: number }>;
  };
  busBreakdown: Array<{
    id: string;
    busNumber: string;
    numberPlate: string;
    revenue: number;
    expenses: number;
    profit: number;
    maintenance: number;
    tyres: number;
    netProfit: number;
    tripCount: number;
  }>;
  adda: {
    income: number;
    expenses: number;
    profit: number;
  };
  petrol: {
    sales: number;
    cost: number;
    profit: number;
  };
  cargo: {
    profit: number;
    count: number;
  };
  installments: {
    scheduled: number;
    paid: number;
    count: number;
    details: Array<{
      id: string;
      installmentId: string;
      amount: number;
      paymentDate: string;
      paymentMethod: string;
      referenceNumber: string | null;
      notes: string | null;
    }>;
  };
  summary: {
    totalBusProfit: number;
    addaProfit: number;
    petrolProfit: number;
    cargoProfit: number;
    totalInstallments: number;
    finalProfit: number;
  };
}

// ============================================================
// HELPERS
// ============================================================
const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const getYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear - 5; y <= currentYear + 5; y++) {
    years.push(y);
  }
  return years;
};

// ============================================================
// CUSTOM DROPDOWN
// ============================================================
interface DropdownProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
}

function CustomDropdown({ value, options, onChange, placeholder }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((opt) => opt.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white text-gray-700 font-medium py-1 px-2 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      >
        <span>{selected ? selected.label : placeholder}</span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-60 overflow-auto">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                opt.value === value ? "bg-blue-50 text-blue-700" : "text-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function ReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<ReportData | null>(null);
  const [user, setUser] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [showInstallmentDetails, setShowInstallmentDetails] = useState(false);

  useEffect(() => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear());
    setSelectedMonth(month);
    setSelectedYear(year);
    fetchUserAndReport(year, month);
  }, []);

  const fetchUserAndReport = async (year: string, month: string) => {
    setLoading(true);
    setError("");
    try {
      const meRes = await fetch("/api/wbos/auth/me");
      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData.user);
        if (meData.user?.businessName) {
          document.title = `${meData.user.businessName} – Reports`;
        }
      }

      const res = await fetch(`/api/wbos/sadaat/reports?month=${year}-${month}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch report");
      }
      const reportData = await res.json();
      setData(reportData);
    } catch (err: any) {
      setError(err.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (newMonth: string) => {
    setSelectedMonth(newMonth);
    if (selectedYear) {
      fetchUserAndReport(selectedYear, newMonth);
    }
  };

  const handleYearChange = (newYear: string) => {
    setSelectedYear(newYear);
    if (selectedMonth) {
      fetchUserAndReport(newYear, selectedMonth);
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rs ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  // ----- LOADING -----
  if (loading) {
    return <div className="min-h-screen bg-gray-50"><SkeletonLoader /></div>;
  }

  // ----- ERROR -----
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900">Unable to load report</h2>
          <p className="text-gray-500 text-sm mt-2">{error || "No data available"}</p>
          <button
            onClick={() => fetchUserAndReport(selectedYear, selectedMonth)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { summary } = data;
  const displayMonth = selectedYear && selectedMonth ? `${selectedYear}-${selectedMonth}` : data.month;
  const businessName = user?.businessName || "Business";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Print‑only header */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{businessName}</h1>
        <p className="text-sm text-gray-500">Monthly Report – {new Date(displayMonth + "-01").toLocaleString("default", { month: "long", year: "numeric" })}</p>
        <hr className="my-2 border-gray-300" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* HEADER – screen only */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 no-print">
          <div className="flex items-center gap-4">
            <Link
              href="/wbos/sadaat"
              className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Monthly Report</h1>
              <p className="text-sm text-gray-500">
                Financial summary for{" "}
                {new Date(displayMonth + "-01").toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap no-print">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
              <Calendar className="w-4 h-4 text-gray-400" />
              <CustomDropdown
                value={selectedMonth}
                options={MONTHS}
                onChange={handleMonthChange}
                placeholder="Month"
              />
              <span className="text-gray-300">/</span>
              <CustomDropdown
                value={selectedYear}
                options={getYears().map((y) => ({ value: String(y), label: String(y) }))}
                onChange={handleYearChange}
                placeholder="Year"
              />
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Truck className="w-4 h-4" />
              Total Bus Profit
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalBusProfit)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Building2 className="w-4 h-4" />
              Adda Profit
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.addaProfit)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Package className="w-4 h-4" />
              Cargo Profit
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.cargoProfit)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Banknote className="w-4 h-4" />
              Installments Paid
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalInstallments)}</p>
          </div>
        </div>

        {/* FINAL PROFIT */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 shadow-lg shadow-blue-200 mb-8 print:bg-gray-100 print:text-gray-900">
          <div className="flex items-center gap-3 text-white/80 text-sm print:text-gray-600">
            <Wallet className="w-5 h-5" />
            Final Monthly Profit
          </div>
          <p className="text-3xl font-bold text-white mt-1 print:text-gray-900">
            {formatCurrency(summary.finalProfit)}
          </p>
        </div>

        {/* INSTALLMENTS */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8">
          <div
            className="flex items-center justify-between cursor-pointer no-print"
            onClick={() => setShowInstallmentDetails(!showInstallmentDetails)}
          >
            <div className="flex items-center gap-2">
              <Banknote className="w-5 h-5 text-rose-600" />
              <h2 className="text-lg font-semibold text-gray-900">Installments</h2>
            </div>
            <button className="text-gray-400 hover:text-gray-600 no-print">
              {showInstallmentDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Scheduled (Expected)</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(data.installments.scheduled)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Paid This Month</p>
              <p className="text-xl font-bold text-emerald-600">{formatCurrency(data.installments.paid)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Deducted from Profit</p>
              <p className="text-xl font-bold text-rose-600">{formatCurrency(data.installments.paid)}</p>
            </div>
          </div>

          {showInstallmentDetails && (
            <div className="mt-6 border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Details</h4>
              {data.installments.details.length === 0 ? (
                <p className="text-sm text-gray-400">No installment payments recorded this month.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 font-medium text-gray-500">Date</th>
                        <th className="text-right py-2 px-3 font-medium text-gray-500">Amount</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-500">Method</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-500">Reference</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-500">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.installments.details.map((payment) => (
                        <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-3 text-gray-700">
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </td>
                          <td className="py-2 px-3 text-right font-medium text-gray-900">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="py-2 px-3 text-gray-600">{payment.paymentMethod || "—"}</td>
                          <td className="py-2 px-3 text-gray-600">{payment.referenceNumber || "—"}</td>
                          <td className="py-2 px-3 text-gray-600">{payment.notes || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* DAILY TIMELINE */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Revenue Timeline</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Revenue</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Expenses</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Profit</th>
                </tr>
              </thead>
              <tbody>
                {data.timeline.daily.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-gray-400">No daily data</td>
                  </tr>
                ) : (
                  data.timeline.daily.map((day) => (
                    <tr key={day.date} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-700">{new Date(day.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right text-emerald-600 font-medium">{formatCurrency(day.revenue)}</td>
                      <td className="py-3 px-4 text-right text-red-500 font-medium">{formatCurrency(day.expenses)}</td>
                      <td className="py-3 px-4 text-right text-blue-600 font-medium">{formatCurrency(day.profit)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ADDA & PETROL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              Adda
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Income</span>
                <span className="font-medium">{formatCurrency(data.adda.income)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Expenses</span>
                <span className="font-medium">{formatCurrency(data.adda.expenses)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                <span className="font-semibold text-gray-700">Profit</span>
                <span className="font-bold text-emerald-600">{formatCurrency(data.adda.profit)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-orange-600" />
              Petrol Pump
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Sales</span>
                <span className="font-medium">{formatCurrency(data.petrol.sales)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cost</span>
                <span className="font-medium">{formatCurrency(data.petrol.cost)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                <span className="font-semibold text-gray-700">Profit</span>
                <span className="font-bold text-orange-600">{formatCurrency(data.petrol.profit)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARGO */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            Cargo
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Profit</p>
              <p className="text-xl font-bold text-purple-600">{formatCurrency(data.cargo.profit)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Entries</p>
              <p className="text-xl font-bold text-gray-900">{data.cargo.count}</p>
            </div>
          </div>
        </div>

        {/* BUS-WISE BREAKDOWN */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bus-wise Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Bus</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Revenue</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Expenses</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Profit</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Maintenance</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Tyres</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Net Profit</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Trips</th>
                </tr>
              </thead>
              <tbody>
                {data.busBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-gray-400">No bus data</td>
                  </tr>
                ) : (
                  data.busBreakdown.map((bus) => (
                    <tr key={bus.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800">{bus.busNumber}</td>
                      <td className="py-3 px-4 text-right text-emerald-600">{formatCurrency(bus.revenue)}</td>
                      <td className="py-3 px-4 text-right text-red-500">{formatCurrency(bus.expenses)}</td>
                      <td className="py-3 px-4 text-right text-blue-600">{formatCurrency(bus.profit)}</td>
                      <td className="py-3 px-4 text-right text-amber-600">{formatCurrency(bus.maintenance)}</td>
                      <td className="py-3 px-4 text-right text-amber-600">{formatCurrency(bus.tyres)}</td>
                      <td className="py-3 px-4 text-right font-bold text-indigo-700">{formatCurrency(bus.netProfit)}</td>
                      <td className="py-3 px-4 text-right text-gray-600">{bus.tripCount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* FOOTER – screen only */}
        <div className="mt-8 text-center text-sm text-gray-400 no-print">
          Report generated for{" "}
          {new Date(displayMonth + "-01").toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Print‑only footer */}
      <div className="hidden print:block text-center text-xs text-gray-400 border-t border-gray-200 pt-4 mt-8">
        {businessName} • Powered by <span className="font-medium">Webistic</span>
      </div>

      {/* Global print styles */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .print\\:block { display: block !important; }
          body { background: white !important; }
          .bg-white { background: white !important; }
          .border { border-color: #ddd !important; }
          .shadow-sm, .shadow-lg { box-shadow: none !important; }
          table, th, td { border-color: #ddd !important; }
          th { background: #f9f9f9 !important; }
          .bg-gradient-to-r { background: #f3f4f6 !important; }
          .text-white { color: #1f2937 !important; }
          @page { margin: 2cm; }
        }
        @media screen {
          .print\\:block { display: none !important; }
        }
      `}</style>
    </div>
  );
}

// Skeleton loader (unchanged)
function SkeletonLoader() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ... skeleton content ... */}
    </div>
  );
}