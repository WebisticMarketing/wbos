// app/wbos/sadaat/buses/[busId]/vouchers/create/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bus, Loader2 } from "lucide-react";
import { Skeleton } from "@/app/components/ui/Skeleton";

export default function CreateVoucherPage() {
  const params = useParams();
  const router = useRouter();
  const busId = params.busId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [bus, setBus] = useState<any>(null);

  const [formData, setFormData] = useState({
    route: "",
    tripNumber: "",
    totalSeats: "",
    seatsBooked: "",
    pricePerSeat: "",
    individualPayments: "",
    otherRevenue: "",
    dieselExpense: "",
    taExpense: "",
    teaExpense: "",
    cleannessExpense: "",
    policeExpense: "",
    tollTaxExpense: "",
    numberMoneyExpense: "",
    mechanicExpense: "",
    extraExpense: "",
    otherExpense: "",
    routeType: "lahore",
  });

  useEffect(() => {
    fetchUserAndBus();
  }, [busId]);

  const fetchUserAndBus = async () => {
    try {
      // 🔹 Set document title
      const meRes = await fetch("/api/wbos/auth/me");
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData.user?.businessName) {
          document.title = `${meData.user.businessName} – Add Voucher`;
        }
      }

      const res = await fetch(`/api/wbos/sadaat/buses/${busId}`);
      if (res.ok) {
        const data = await res.json();
        setBus(data);
        setFormData((prev) => ({
          ...prev,
          totalSeats: data.capacity?.toString() || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching bus:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseNumber = (val: string) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  const seatsBookedVal = parseNumber(formData.seatsBooked);
  const pricePerSeatVal = parseNumber(formData.pricePerSeat);
  const seatsRevenueVal = seatsBookedVal * pricePerSeatVal;
  const individualPaymentsVal = parseNumber(formData.individualPayments);
  const otherRevenueVal = parseNumber(formData.otherRevenue);
  const totalRevenueVal = seatsRevenueVal + individualPaymentsVal + otherRevenueVal;

  const dieselExpenseVal = parseNumber(formData.dieselExpense);
  const taExpenseVal = parseNumber(formData.taExpense);
  const teaExpenseVal = parseNumber(formData.teaExpense);
  const cleannessExpenseVal = parseNumber(formData.cleannessExpense);
  const policeExpenseVal = parseNumber(formData.policeExpense);
  const tollTaxExpenseVal = parseNumber(formData.tollTaxExpense);
  const numberMoneyExpenseVal = parseNumber(formData.numberMoneyExpense);
  const mechanicExpenseVal = parseNumber(formData.mechanicExpense);
  const extraExpenseVal = parseNumber(formData.extraExpense);
  const otherExpenseVal = parseNumber(formData.otherExpense);
  const totalExpensesVal =
    dieselExpenseVal +
    taExpenseVal +
    teaExpenseVal +
    cleannessExpenseVal +
    policeExpenseVal +
    tollTaxExpenseVal +
    numberMoneyExpenseVal +
    mechanicExpenseVal +
    extraExpenseVal +
    otherExpenseVal;
  const profitVal = totalRevenueVal - totalExpensesVal;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/wbos/sadaat/buses/${busId}/vouchers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          route: formData.route,
          tripNumber: formData.tripNumber,
          totalSeats: parseNumber(formData.totalSeats),
          seatsBooked: seatsBookedVal,
          pricePerSeat: pricePerSeatVal,
          seatsRevenue: seatsRevenueVal,
          individualPayments: individualPaymentsVal,
          otherRevenue: otherRevenueVal,
          totalRevenue: totalRevenueVal,
          dieselExpense: dieselExpenseVal,
          taExpense: taExpenseVal,
          teaExpense: teaExpenseVal,
          cleannessExpense: cleannessExpenseVal,
          policeExpense: policeExpenseVal,
          tollTaxExpense: tollTaxExpenseVal,
          numberMoneyExpense: numberMoneyExpenseVal,
          mechanicExpense: mechanicExpenseVal,
          extraExpense: extraExpenseVal,
          otherExpense: otherExpenseVal,
          totalExpenses: totalExpensesVal,
          profit: profitVal,
          routeType: formData.routeType,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create voucher");
        setSaving(false);
        return;
      }

      router.push(`/wbos/sadaat/buses/${busId}/vouchers`);
    } catch (error) {
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  // 🟨 Loading state with skeleton
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 p-6 bg-white min-h-screen">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div>
            <Skeleton className="h-7 w-40 rounded-lg" />
            <Skeleton className="h-4 w-32 rounded-lg mt-1" />
          </div>
        </div>
        <div className="space-y-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-6 bg-white min-h-screen">
      <div className="flex items-center gap-4">
        <Link
          href={`/wbos/sadaat/buses/${busId}/vouchers`}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Trip Voucher</h1>
          <p className="text-sm text-gray-500">
            {bus?.busNumber} — {bus?.numberPlate}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Trip Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Trip Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Route <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="route"
                required
                value={formData.route}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="e.g., Mardan → Lahore"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trip Number
              </label>
              <input
                type="text"
                name="tripNumber"
                value={formData.tripNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="TR-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Route Type
              </label>
              <select
                name="routeType"
                value={formData.routeType}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="lahore">Lahore</option>
                <option value="karachi">Karachi</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
        </div>

        {/* Seats Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Seats Information</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Seats
              </label>
              <input
                type="number"
                name="totalSeats"
                value={formData.totalSeats}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                disabled
              />
              <p className="text-xs text-gray-400 mt-1">Auto-filled from bus</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seats Booked <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="seatsBooked"
                required
                value={formData.seatsBooked}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Per Seat <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="pricePerSeat"
                required
                value={formData.pricePerSeat}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Revenue</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seats Revenue
              </label>
              <input
                type="text"
                value={`PKR ${seatsRevenueVal.toFixed(2)}`}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
                disabled
              />
              <p className="text-xs text-gray-400 mt-1">Auto-calculated: Booked × Price</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Individual/On-way Payments
              </label>
              <input
                type="number"
                name="individualPayments"
                value={formData.individualPayments}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Other Revenue
              </label>
              <input
                type="number"
                name="otherRevenue"
                value={formData.otherRevenue}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700">Total Revenue</span>
              <span className="text-lg font-bold text-blue-700">
                PKR {totalRevenueVal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Expenses</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diesel</label>
              <input
                type="number"
                name="dieselExpense"
                value={formData.dieselExpense}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">TA</label>
              <input
                type="number"
                name="taExpense"
                value={formData.taExpense}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tea</label>
              <input
                type="number"
                name="teaExpense"
                value={formData.teaExpense}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bus Cleaning</label>
              <input
                type="number"
                name="cleannessExpense"
                value={formData.cleannessExpense}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Police</label>
              <input
                type="number"
                name="policeExpense"
                value={formData.policeExpense}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Toll Tax</label>
              <input
                type="number"
                name="tollTaxExpense"
                value={formData.tollTaxExpense}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number Money</label>
              <input
                type="number"
                name="numberMoneyExpense"
                value={formData.numberMoneyExpense}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mechanic</label>
              <input
                type="number"
                name="mechanicExpense"
                value={formData.mechanicExpense}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Extra Expense</label>
              <input
                type="number"
                name="extraExpense"
                value={formData.extraExpense}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Other Expense</label>
              <input
                type="number"
                name="otherExpense"
                value={formData.otherExpense}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-red-700">Total Expenses</span>
              <span className="text-lg font-bold text-red-700">
                PKR {totalExpensesVal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Profit */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="p-3 bg-green-50 rounded-lg border border-green-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-700">Profit</span>
              <span className={`text-lg font-bold ${profitVal >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                PKR {profitVal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Voucher"
            )}
          </button>
          <Link
            href={`/wbos/sadaat/buses/${busId}/vouchers`}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}