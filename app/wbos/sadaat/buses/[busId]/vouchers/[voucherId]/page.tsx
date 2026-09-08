// app/wbos/sadaat/buses/[busId]/vouchers/[voucherId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer, Loader2, Calendar, MapPin, Users, CreditCard, Receipt } from "lucide-react";

interface Voucher {
  id: string;
  voucherDate: string;
  route: string;
  tripNumber: string | null;
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  totalSeats: number;
  seatsBooked: number;
  pricePerSeat: number;
  seatsRevenue: number;
  individualPayments: number;
  otherRevenue: number;
  dieselExpense: number;
  taExpense: number;
  teaExpense: number;
  cleannessExpense: number;
  policeExpense: number;
  tollTaxExpense: number;
  numberMoneyExpense: number;
  mechanicExpense: number;
  extraExpense: number;
  otherExpense: number;
  routeType: string;
  status: string;
  notes: string | null;
  busId: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  businessName: string;
  businessId: string;
  slug: string;
}

export default function VoucherDetailPage() {
  const params = useParams();
  const router = useRouter();
  const busId = params.busId as string;
  const voucherId = params.voucherId as string;

  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Fetch user and voucher
  useEffect(() => {
    Promise.all([fetchUser(), fetchVoucher()]);
  }, [busId, voucherId]);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/wbos/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.user?.businessName) {
          document.title = data.user.businessName;
        }
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  };

  const fetchVoucher = async () => {
    try {
      const res = await fetch(`/api/wbos/sadaat/buses/${busId}/vouchers/${voucherId}`);
      if (!res.ok) {
        throw new Error("Voucher not found");
      }
      const data = await res.json();
      setVoucher(data);
    } catch (err: any) {
      setError(err.message || "Failed to load voucher");
    } finally {
      setLoading(false);
    }
  };

  // ✅ HIDE THE GLOBAL LAYOUT HEADER ON THIS PAGE
  useEffect(() => {
    const header = document.querySelector('header');
    if (header) {
      const originalDisplay = header.style.display;
      header.style.display = 'none';
      return () => {
        header.style.display = originalDisplay;
      };
    }
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const businessName = user?.businessName || "Business";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !voucher) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-white">
        <div className="text-red-500">{error || "Voucher not found"}</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white min-h-screen print:w-full print:max-w-none print:mx-0 print:p-0 print:min-h-0">
      {/* ============================================================ */}
      {/* PRINT ONLY – Professional Voucher Document */}
      {/* ============================================================ */}
      <div className="hidden print:block max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
          <h1 className="text-3xl font-bold uppercase tracking-wider text-black">
            {businessName}
          </h1>
          <p className="text-sm font-medium text-black mt-1">TRIP FINANCIAL VOUCHER</p>
          <p className="text-xs text-black mt-0.5">
            {voucher.route} • {formatDate(voucher.voucherDate)}
          </p>
        </div>

        {/* Voucher Meta */}
        <div className="flex justify-between text-xs text-black mb-4">
          <div>
            <span className="font-bold">Voucher Date:</span> {formatDate(voucher.voucherDate)}
          </div>
          <div>
            <span className="font-bold">Trip No:</span> {voucher.tripNumber || "—"}
          </div>
          <div>
            <span className="font-bold">Route:</span> {voucher.route}
          </div>
        </div>

        {/* Financial Summary – 3 Columns */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-100 border border-gray-300 rounded p-3 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-black">Total Revenue</p>
            <p className="text-xl font-bold text-black">{formatCurrency(voucher.totalRevenue)}</p>
          </div>
          <div className="bg-gray-100 border border-gray-300 rounded p-3 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-black">Total Expenses</p>
            <p className="text-xl font-bold text-black">{formatCurrency(voucher.totalExpenses)}</p>
          </div>
          <div className={`border rounded p-3 text-center ${
            voucher.profit >= 0 ? 'bg-gray-100 border-gray-300' : 'bg-gray-200 border-gray-400'
          }`}>
            <p className="text-xs font-bold uppercase tracking-wider text-black">Net Profit</p>
            <p className="text-xl font-bold text-black">
              {formatCurrency(voucher.profit)}
            </p>
          </div>
        </div>

        {/* Two‑column layout: Trip Info + Seats */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="border border-gray-300 rounded p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black border-b border-gray-200 pb-2 mb-3">
              Trip Information
            </h3>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-1.5 text-black font-medium">Route</td>
                  <td className="py-1.5 text-black text-right">{voucher.route}</td>
                </tr>
                {voucher.tripNumber && (
                  <tr className="border-b border-gray-100">
                    <td className="py-1.5 text-black font-medium">Trip Number</td>
                    <td className="py-1.5 text-black text-right">{voucher.tripNumber}</td>
                  </tr>
                )}
                <tr className="border-b border-gray-100">
                  <td className="py-1.5 text-black font-medium">Date</td>
                  <td className="py-1.5 text-black text-right">{formatDate(voucher.voucherDate)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1.5 text-black font-medium">Route Type</td>
                  <td className="py-1.5 text-black text-right capitalize">{voucher.routeType}</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-black font-medium">Status</td>
                  <td className="py-1.5 text-black text-right capitalize">{voucher.status}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="border border-gray-300 rounded p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black border-b border-gray-200 pb-2 mb-3">
              Seats & Revenue
            </h3>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-1.5 text-black font-medium">Total Seats</td>
                  <td className="py-1.5 text-black text-right">{voucher.totalSeats}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1.5 text-black font-medium">Seats Booked</td>
                  <td className="py-1.5 text-black text-right">{voucher.seatsBooked}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1.5 text-black font-medium">Price / Seat</td>
                  <td className="py-1.5 text-black text-right">{formatCurrency(voucher.pricePerSeat)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1.5 text-black font-medium">Seats Revenue</td>
                  <td className="py-1.5 text-black text-right">{formatCurrency(voucher.seatsRevenue)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1.5 text-black font-medium">Individual Payments</td>
                  <td className="py-1.5 text-black text-right">{formatCurrency(voucher.individualPayments)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-black font-medium">Other Revenue</td>
                  <td className="py-1.5 text-black text-right">{formatCurrency(voucher.otherRevenue)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses Table – Professional Layout */}
        <div className="border border-gray-300 rounded p-4 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-black border-b border-gray-200 pb-2 mb-3">
            Expense Breakdown
          </h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
            <div className="flex justify-between border-b border-gray-100 py-1.5">
              <span className="text-black font-medium">Diesel</span>
              <span className="text-black">{formatCurrency(voucher.dieselExpense)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-1.5">
              <span className="text-black font-medium">TA</span>
              <span className="text-black">{formatCurrency(voucher.taExpense)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-1.5">
              <span className="text-black font-medium">Tea</span>
              <span className="text-black">{formatCurrency(voucher.teaExpense)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-1.5">
              <span className="text-black font-medium">Bus Cleaning</span>
              <span className="text-black">{formatCurrency(voucher.cleannessExpense)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-1.5">
              <span className="text-black font-medium">Police</span>
              <span className="text-black">{formatCurrency(voucher.policeExpense)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-1.5">
              <span className="text-black font-medium">Toll Tax</span>
              <span className="text-black">{formatCurrency(voucher.tollTaxExpense)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-1.5">
              <span className="text-black font-medium">Number Money</span>
              <span className="text-black">{formatCurrency(voucher.numberMoneyExpense)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-1.5">
              <span className="text-black font-medium">Mechanic</span>
              <span className="text-black">{formatCurrency(voucher.mechanicExpense)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-1.5">
              <span className="text-black font-medium">Extra</span>
              <span className="text-black">{formatCurrency(voucher.extraExpense)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-1.5">
              <span className="text-black font-medium">Other</span>
              <span className="text-black">{formatCurrency(voucher.otherExpense)}</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t-2 border-gray-400 flex justify-between">
            <span className="font-bold text-black">TOTAL EXPENSES</span>
            <span className="font-bold text-black">{formatCurrency(voucher.totalExpenses)}</span>
          </div>
        </div>

        {/* Notes */}
        {voucher.notes && (
          <div className="border border-gray-300 rounded p-4 mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-black border-b border-gray-200 pb-2 mb-2">
              Notes
            </h4>
            <p className="text-sm text-black">{voucher.notes}</p>
          </div>
        )}

        {/* Footer with Signature Lines */}
        <div className="border-t border-gray-300 pt-4 mt-2">
          <div className="grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <div className="border-b border-gray-400 pb-1 mb-2 text-black">Prepared By</div>
              <div className="h-6 text-black">_________________</div>
            </div>
            <div>
              <div className="border-b border-gray-400 pb-1 mb-2 text-black">Checked By</div>
              <div className="h-6 text-black">_________________</div>
            </div>
            <div>
              <div className="border-b border-gray-400 pb-1 mb-2 text-black">Approved By</div>
              <div className="h-6 text-black">_________________</div>
            </div>
          </div>
        </div>

        {/* Powered by */}
        <div className="mt-4 text-center text-[10px] text-black border-t border-gray-300 pt-3">
          {businessName} • Powered by <span className="font-bold">Webistic</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SCREEN VERSION – Header hidden by useEffect */}
      {/* ============================================================ */}
      <div className="print:hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              href={`/wbos/sadaat/buses/${busId}/vouchers`}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{businessName}</h1>
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {voucher.route}
                <span className="text-gray-300">•</span>
                <Calendar className="w-4 h-4" />
                {formatDate(voucher.voucherDate)}
              </p>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>

        {/* Screen cards (unchanged) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
            <p className="text-sm text-blue-600 font-medium">Revenue</p>
            <p className="text-2xl font-bold text-blue-700">{formatCurrency(voucher.totalRevenue)}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-5 border border-red-100">
            <p className="text-sm text-red-600 font-medium">Expenses</p>
            <p className="text-2xl font-bold text-red-700">{formatCurrency(voucher.totalExpenses)}</p>
          </div>
          <div className={`rounded-xl p-5 border ${voucher.profit >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
            <p className={`text-sm font-medium ${voucher.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>Profit</p>
            <p className={`text-2xl font-bold ${voucher.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatCurrency(voucher.profit)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Receipt className="w-4 h-4 text-gray-400" />
              Trip Information
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <dt className="text-gray-500">Route</dt>
                <dd className="font-medium text-gray-900">{voucher.route}</dd>
              </div>
              {voucher.tripNumber && (
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <dt className="text-gray-500">Trip Number</dt>
                  <dd className="font-medium text-gray-900">{voucher.tripNumber}</dd>
                </div>
              )}
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <dt className="text-gray-500">Date</dt>
                <dd className="font-medium text-gray-900">{formatDate(voucher.voucherDate)}</dd>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <dt className="text-gray-500">Route Type</dt>
                <dd className="font-medium text-gray-900 capitalize">{voucher.routeType}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Status</dt>
                <dd className="font-medium text-gray-900 capitalize">{voucher.status}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-gray-400" />
              Seats & Revenue
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <dt className="text-gray-500">Total Seats</dt>
                <dd className="font-medium text-gray-900">{voucher.totalSeats}</dd>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <dt className="text-gray-500">Seats Booked</dt>
                <dd className="font-medium text-gray-900">{voucher.seatsBooked}</dd>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <dt className="text-gray-500">Price / Seat</dt>
                <dd className="font-medium text-gray-900">{formatCurrency(voucher.pricePerSeat)}</dd>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <dt className="text-gray-500">Seats Revenue</dt>
                <dd className="font-medium text-gray-900">{formatCurrency(voucher.seatsRevenue)}</dd>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <dt className="text-gray-500">Individual Payments</dt>
                <dd className="font-medium text-gray-900">{formatCurrency(voucher.individualPayments)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Other Revenue</dt>
                <dd className="font-medium text-gray-900">{formatCurrency(voucher.otherRevenue)}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-gray-400" />
            Expenses
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm">
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-500">Diesel</span>
              <span className="font-medium text-gray-900">{formatCurrency(voucher.dieselExpense)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-500">TA</span>
              <span className="font-medium text-gray-900">{formatCurrency(voucher.taExpense)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-500">Tea</span>
              <span className="font-medium text-gray-900">{formatCurrency(voucher.teaExpense)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-500">Bus Cleaning</span>
              <span className="font-medium text-gray-900">{formatCurrency(voucher.cleannessExpense)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-500">Police</span>
              <span className="font-medium text-gray-900">{formatCurrency(voucher.policeExpense)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-500">Toll Tax</span>
              <span className="font-medium text-gray-900">{formatCurrency(voucher.tollTaxExpense)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-500">Number Money</span>
              <span className="font-medium text-gray-900">{formatCurrency(voucher.numberMoneyExpense)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-500">Mechanic</span>
              <span className="font-medium text-gray-900">{formatCurrency(voucher.mechanicExpense)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-500">Extra</span>
              <span className="font-medium text-gray-900">{formatCurrency(voucher.extraExpense)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-500">Other</span>
              <span className="font-medium text-gray-900">{formatCurrency(voucher.otherExpense)}</span>
            </div>
            <div className="col-span-2 md:col-span-3 flex justify-between border-t-2 border-gray-300 pt-2 mt-2">
              <span className="font-semibold text-gray-700">Total Expenses</span>
              <span className="font-bold text-red-600">{formatCurrency(voucher.totalExpenses)}</span>
            </div>
          </div>
        </div>

        {voucher.notes && (
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Notes</h4>
            <p className="text-sm text-gray-700">{voucher.notes}</p>
          </div>
        )}
      </div>

      {/* Print styles – crisp and clear */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }

          html, body {
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          .max-w-5xl {
            display: block !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            min-height: auto !important;
            background: white !important;
          }

          /* Force all text to black */
          .text-gray-500, .text-gray-600, .text-gray-700,
          .text-blue-600, .text-red-600, .text-green-600,
          .text-blue-700, .text-red-700, .text-green-700,
          .text-white, .text-gray-400, .text-gray-300,
          .text-black {
            color: black !important;
          }

          .border, .border-t-2, .border-b {
            border-color: #999 !important;
          }

          .shadow-sm, .shadow-lg, .shadow-xl {
            box-shadow: none !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .rounded-xl {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .print\\:block.max-w-4xl {
            max-width: 100% !important;
            padding: 0.5in !important;
          }

          /* ✅ Crisp, clear text – no scaling, use standard sizes */
          .text-xs {
            font-size: 0.7rem !important;
          }
          .text-sm {
            font-size: 0.8rem !important;
          }
          .text-xl {
            font-size: 1.2rem !important;
          }
          .text-2xl {
            font-size: 1.4rem !important;
          }
          .text-3xl {
            font-size: 1.8rem !important;
          }
          h1, h2, h3, h4, h5, h6 {
            font-weight: 700 !important;
          }
          table td, table th {
            font-size: 0.8rem !important;
          }
        }
      `}</style>
    </div>
  );
}