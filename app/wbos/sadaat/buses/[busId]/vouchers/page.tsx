// app/wbos/sadaat/buses/[busId]/vouchers/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Calendar, Eye, Loader2 } from "lucide-react";
import { Skeleton } from "@/app/components/ui/Skeleton";

interface Voucher {
  id: string;
  voucherDate: string;
  route: string;
  tripNumber: string;
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  status: string;
}

type DateFilter = "today" | "week" | "month" | "all";

export default function VouchersPage() {
  const params = useParams();
  const router = useRouter();
  const busId = params.busId as string;

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [bus, setBus] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  useEffect(() => {
    fetchUserAndData();
  }, [busId]);

  const fetchUserAndData = async () => {
    try {
      // Set title
      const meRes = await fetch("/api/wbos/auth/me");
      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData.user);
        if (meData.user?.businessName) {
          document.title = `${meData.user.businessName} – Vouchers`;
        }
      }

      const [busRes, vouchersRes] = await Promise.all([
        fetch(`/api/wbos/sadaat/buses/${busId}`),
        fetch(`/api/wbos/sadaat/buses/${busId}/vouchers`),
      ]);

      if (busRes.ok) {
        const busData = await busRes.json();
        setBus(busData);
      }

      if (vouchersRes.ok) {
        const data = await vouchersRes.json();
        const parsedData = data.map((v: any) => ({
          ...v,
          totalRevenue: typeof v.totalRevenue === "number" ? v.totalRevenue : parseFloat(v.totalRevenue) || 0,
          totalExpenses: typeof v.totalExpenses === "number" ? v.totalExpenses : parseFloat(v.totalExpenses) || 0,
          profit: typeof v.profit === "number" ? v.profit : parseFloat(v.profit) || 0,
        }));
        setVouchers(parsedData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === null || amount === undefined) {
      return "Rs 0";
    }
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getFilteredVouchers = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return vouchers.filter((v) => {
      const vDate = new Date(v.voucherDate);
      switch (dateFilter) {
        case "today":
          return vDate >= today;
        case "week":
          return vDate >= weekStart;
        case "month":
          return vDate >= monthStart;
        default:
          return true;
      }
    });
  };

  const filteredVouchers = getFilteredVouchers();

  const totalRevenue = filteredVouchers.reduce((sum, v) => sum + Number(v.totalRevenue || 0), 0);
  const totalExpenses = filteredVouchers.reduce((sum, v) => sum + Number(v.totalExpenses || 0), 0);
  const totalProfit = filteredVouchers.reduce((sum, v) => sum + Number(v.profit || 0), 0);

  const businessName = user?.businessName || "Business";

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="space-y-6 p-6 bg-white min-h-screen">
      {/* Print‑only header */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{businessName}</h1>
        <p className="text-sm text-gray-500">Trip Vouchers – {bus?.busNumber} ({bus?.numberPlate})</p>
        <hr className="my-2 border-gray-300" />
      </div>

      {/* Screen header */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <Link
            href={`/wbos/sadaat/buses/${busId}`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Trip Vouchers</h1>
            <p className="text-sm text-gray-500">
              {bus?.busNumber} — {bus?.numberPlate}
            </p>
          </div>
        </div>
        <Link
          href={`/wbos/sadaat/buses/${busId}/vouchers/create`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors no-print"
        >
          <Plus className="w-4 h-4" />
          Add Voucher
        </Link>
      </div>

      {/* Filter buttons (hidden on print) */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 no-print">
        <button
          onClick={() => setDateFilter("all")}
          className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
            dateFilter === "all"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setDateFilter("today")}
          className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
            dateFilter === "today"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setDateFilter("week")}
          className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
            dateFilter === "week"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setDateFilter("month")}
          className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
            dateFilter === "month"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          This Month
        </button>
        <span className="ml-4 text-sm text-gray-500">
          {filteredVouchers.length} vouchers
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 no-print">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 print:bg-gray-100 print:border-gray-300">
          <p className="text-sm text-blue-600 print:text-gray-700">Total Revenue</p>
          <p className="text-xl font-bold text-blue-700 print:text-gray-900">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-100 print:bg-gray-100 print:border-gray-300">
          <p className="text-sm text-red-600 print:text-gray-700">Total Expenses</p>
          <p className="text-xl font-bold text-red-700 print:text-gray-900">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className={`bg-green-50 rounded-lg p-4 border border-green-100 print:bg-gray-100 print:border-gray-300`}>
          <p className={`text-sm ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'} print:text-gray-700`}>Total Profit</p>
          <p className={`text-xl font-bold ${totalProfit >= 0 ? 'text-green-700' : 'text-red-700'} print:text-gray-900`}>
            {formatCurrency(totalProfit)}
          </p>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden print:border-gray-300">
        {filteredVouchers.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No vouchers found for this period</p>
            <Link
              href={`/wbos/sadaat/buses/${busId}/vouchers/create`}
              className="inline-block mt-3 text-blue-600 hover:text-blue-700 text-sm no-print"
            >
              Add your first voucher
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 print:bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Expenses</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Profit</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVouchers.map((voucher) => (
                  <tr
                    key={voucher.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer group"
                    onClick={() => router.push(`/wbos/sadaat/buses/${busId}/vouchers/${voucher.id}`)}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(voucher.voucherDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{voucher.route}</td>
                    <td className="px-6 py-4 text-sm text-right text-green-600 font-medium">
                      {formatCurrency(Number(voucher.totalRevenue))}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-red-600 font-medium">
                      {formatCurrency(Number(voucher.totalExpenses))}
                    </td>
                    <td className={`px-6 py-4 text-sm text-right font-medium ${Number(voucher.profit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Number(voucher.profit))}
                    </td>
                    <td className="px-6 py-4 text-right no-print">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/wbos/sadaat/buses/${busId}/vouchers/${voucher.id}`);
                          }}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        {/* ❌ Edit button removed */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Print‑only footer */}
      <div className="hidden print:block text-center text-xs text-gray-400 border-t border-gray-200 pt-4 mt-8">
        {businessName} • Powered by <span className="font-medium">Webistic</span>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .bg-white { background: white !important; }
          .border { border-color: #ddd !important; }
          .shadow-sm { box-shadow: none !important; }
          .bg-blue-50, .bg-red-50, .bg-green-50 {
            background: #f9fafb !important;
          }
          .text-blue-600, .text-red-600, .text-green-600 {
            color: #1f2937 !important;
          }
          .text-blue-700, .text-red-700, .text-green-700 {
            color: #111827 !important;
          }
          .print\\:border-gray-300 { border-color: #d1d5db !important; }
          th { background: #f9f9f9 !important; }
          @page { margin: 2cm; }
        }
      `}</style>
    </div>
  );
}

// Skeleton Loader
function SkeletonLoader() {
  return (
    <div className="space-y-6 p-6 bg-white min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
          <div>
            <div className="h-7 w-40 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-4 w-32 bg-gray-200 rounded-lg animate-pulse mt-1" />
          </div>
        </div>
        <div className="w-32 h-10 bg-gray-200 rounded-lg animate-pulse" />
      </div>
      <div className="flex items-center gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 w-16 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {[...Array(6)].map((_, i) => (
                  <th key={i} className="px-6 py-3">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(3)].map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className={`h-4 ${j === 0 ? 'w-24' : 'w-20'} bg-gray-200 rounded animate-pulse`} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}