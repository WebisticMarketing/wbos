// app/wbos/sadaat/petrol-pump/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Fuel, Truck, Loader2, Trash2 } from "lucide-react";
import { Skeleton } from "@/app/components/ui/Skeleton";

// ============================================================
// TYPES
// ============================================================
interface DashboardData {
  month: {
    petrol: {
      purchasedLiters: number;
      purchasedCost: number;
      soldLiters: number;
      revenue: number;
      profit: number;
      currentStock: number;
    };
  };
}

interface BusFuelRecord {
  id: string;
  busId: string;
  date: string;
  liters: number;
  pricePerLiter: number;
  totalAmount: number;
  notes: string | null;
  bus: {
    id: string;
    busNumber: string;
    numberPlate: string;
  } | null;
}

interface PurchaseRecord {
  id: string;
  date: string;
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  supplier: string | null;
  invoiceNumber: string | null;
  notes: string | null;
}

type TabType = "overview" | "bus-fuel" | "purchases";

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function PetrolPumpPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Dashboard data
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  // Bus fuel records
  const [busFuelRecords, setBusFuelRecords] = useState<BusFuelRecord[]>([]);
  const [buses, setBuses] = useState<any[]>([]);

  // Purchase records
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);

  // Form states
  const [showBusFuelForm, setShowBusFuelForm] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [busFuelForm, setBusFuelForm] = useState({
    busId: "",
    liters: "",
    pricePerLiter: "",
    notes: "",
  });

  const [purchaseForm, setPurchaseForm] = useState({
    liters: "",
    pricePerLiter: "",
    supplier: "",
    invoiceNumber: "",
    notes: "",
  });

  useEffect(() => {
    fetchUserAndData();
  }, []);

  const fetchUserAndData = async () => {
    setLoading(true);
    try {
      // 🔹 Set document title
      const meRes = await fetch("/api/wbos/auth/me");
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData.user?.businessName) {
          document.title = `${meData.user.businessName} – Petrol Pump`;
        }
      }

      const [dashboardRes, busFuelRes, purchasesRes, busesRes] = await Promise.all([
        fetch("/api/wbos/sadaat/petrol-pump/dashboard"),
        fetch("/api/wbos/sadaat/petrol-pump/bus-fuel"),
        fetch("/api/wbos/sadaat/petrol-pump/purchases"),
        fetch("/api/wbos/sadaat/buses"),
      ]);

      if (dashboardRes.ok) {
        const data = await dashboardRes.json();
        setDashboard(data);
      }

      if (busFuelRes.ok) {
        const data = await busFuelRes.json();
        setBusFuelRecords(data);
      }

      if (purchasesRes.ok) {
        const data = await purchasesRes.json();
        setPurchases(data);
      }

      if (busesRes.ok) {
        const data = await busesRes.json();
        setBuses(data);
      }
    } catch (error) {
      console.error("Error fetching petrol pump data:", error);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null || isNaN(amount)) return "Rs 0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num === undefined || num === null || isNaN(num)) return "0";
    return new Intl.NumberFormat("en-PK").format(num);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const handleBusFuelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/wbos/sadaat/petrol-pump/bus-fuel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          busId: busFuelForm.busId,
          liters: parseFloat(busFuelForm.liters) || 0,
          pricePerLiter: parseFloat(busFuelForm.pricePerLiter) || 0,
          notes: busFuelForm.notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to add fuel record");
        setSaving(false);
        return;
      }

      setSuccess("Fuel record added successfully!");
      setBusFuelForm({ busId: "", liters: "", pricePerLiter: "", notes: "" });
      setShowBusFuelForm(false);
      fetchUserAndData();
    } catch (error) {
      setError("Something went wrong");
      setSaving(false);
    }
  };

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/wbos/sadaat/petrol-pump/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          liters: parseFloat(purchaseForm.liters) || 0,
          pricePerLiter: parseFloat(purchaseForm.pricePerLiter) || 0,
          supplier: purchaseForm.supplier,
          invoiceNumber: purchaseForm.invoiceNumber,
          notes: purchaseForm.notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to add purchase");
        setSaving(false);
        return;
      }

      setSuccess("Purchase added successfully!");
      setPurchaseForm({ liters: "", pricePerLiter: "", supplier: "", invoiceNumber: "", notes: "" });
      setShowPurchaseForm(false);
      fetchUserAndData();
    } catch (error) {
      setError("Something went wrong");
      setSaving(false);
    }
  };

  const handleDeleteBusFuel = async (id: string) => {
    if (!confirm("Are you sure you want to delete this fuel record?")) return;
    try {
      const res = await fetch(`/api/wbos/sadaat/petrol-pump/bus-fuel/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSuccess("Fuel record deleted");
        fetchUserAndData();
      } else {
        setError("Failed to delete");
      }
    } catch (error) {
      setError("Something went wrong");
    }
  };

  // 🟨 Loading state with skeleton
  if (loading) {
    return (
      <div className="space-y-6 p-6 bg-white min-h-screen">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div>
            <Skeleton className="h-7 w-40 rounded-lg" />
            <Skeleton className="h-4 w-32 rounded-lg mt-1" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <div className="flex border-b border-gray-200">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-t-lg" />
          ))}
        </div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <Skeleton className="h-5 w-32 rounded" />
            <Skeleton className="h-8 w-24 rounded" />
          </div>
          <div className="divide-y divide-gray-100">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-4 w-16 rounded" />
                </div>
                <Skeleton className="h-4 w-20 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Safely access the petrol data
  const petrolData = dashboard?.month?.petrol || {
    purchasedLiters: 0,
    purchasedCost: 0,
    soldLiters: 0,
    revenue: 0,
    profit: 0,
    currentStock: 0,
  };

  return (
    <div className="space-y-6 p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/wbos/sadaat"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Petrol Pump</h1>
          <p className="text-sm text-gray-500">Track diesel purchases and bus fuel consumption</p>
        </div>
      </div>

      {/* Success/Error */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {success}
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "overview"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("bus-fuel")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "bus-fuel"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Bus Fuel Records
        </button>
        <button
          onClick={() => setActiveTab("purchases")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "purchases"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Purchases
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <p className="text-sm text-blue-600">Total Purchased</p>
              <p className="text-xl font-bold text-blue-700">{formatNumber(petrolData.purchasedLiters)} L</p>
              <p className="text-xs text-blue-500">{formatCurrency(petrolData.purchasedCost)} cost</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <p className="text-sm text-green-600">Total Sold to Buses</p>
              <p className="text-xl font-bold text-green-700">{formatNumber(petrolData.soldLiters)} L</p>
              <p className="text-xs text-green-500">{formatCurrency(petrolData.revenue)} revenue</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
              <p className="text-sm text-yellow-600">Current Stock</p>
              <p className="text-xl font-bold text-yellow-700">{formatNumber(petrolData.currentStock)} L</p>
            </div>
            <div className={`rounded-lg p-4 border ${petrolData.profit >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
              <p className={`text-sm ${petrolData.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>Profit</p>
              <p className={`text-xl font-bold ${petrolData.profit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                {formatCurrency(petrolData.profit)}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600">Purchases</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{purchases.length}</p>
              <p className="text-xs text-gray-400">Total purchase records</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2">
                <Fuel className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600">Bus Fuel Records</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{busFuelRecords.length}</p>
              <p className="text-xs text-gray-400">Total fuel records</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setShowBusFuelForm(true);
                setActiveTab("bus-fuel");
              }}
              className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors text-center"
            >
              <Fuel className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <p className="text-sm font-medium text-blue-700">Record Bus Fuel</p>
            </button>
            <button
              onClick={() => {
                setShowPurchaseForm(true);
                setActiveTab("purchases");
              }}
              className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors text-center"
            >
              <Truck className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <p className="text-sm font-medium text-green-700">Add Purchase</p>
            </button>
          </div>
        </div>
      )}

      {/* Bus Fuel Records Tab */}
      {activeTab === "bus-fuel" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Bus Fuel Records</h3>
            <button
              onClick={() => setShowBusFuelForm(!showBusFuelForm)}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Record
            </button>
          </div>

          {/* Add Bus Fuel Form */}
          {showBusFuelForm && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Record Bus Fuel</h4>
              <form onSubmit={handleBusFuelSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bus *</label>
                    <select
                      required
                      value={busFuelForm.busId}
                      onChange={(e) => setBusFuelForm({ ...busFuelForm, busId: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="">Select bus</option>
                      {buses.map((bus) => (
                        <option key={bus.id} value={bus.id}>
                          {bus.busNumber} — {bus.numberPlate}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Liters *</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={busFuelForm.liters}
                      onChange={(e) => setBusFuelForm({ ...busFuelForm, liters: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Liter *</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={busFuelForm.pricePerLiter}
                      onChange={(e) => setBusFuelForm({ ...busFuelForm, pricePerLiter: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="w-full p-2 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-xs text-blue-600">Total Amount</p>
                      <p className="text-lg font-bold text-blue-700">
                        {formatCurrency((parseFloat(busFuelForm.liters) || 0) * (parseFloat(busFuelForm.pricePerLiter) || 0))}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <input
                    type="text"
                    value={busFuelForm.notes}
                    onChange={(e) => setBusFuelForm({ ...busFuelForm, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Optional notes"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Save Record
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBusFuelForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Bus Fuel Records Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {busFuelRecords.length === 0 ? (
              <div className="text-center py-8">
                <Fuel className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No fuel records yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bus</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Liters</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price/L</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {busFuelRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">{formatDate(record.date)}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {record.bus ? record.bus.numberPlate : "—"}
                        </td>
                        <td className="px-4 py-2 text-sm text-right text-gray-900">{formatNumber(record.liters)}</td>
                        <td className="px-4 py-2 text-sm text-right text-gray-900">{formatCurrency(record.pricePerLiter)}</td>
                        <td className="px-4 py-2 text-sm text-right text-blue-600 font-medium">
                          {formatCurrency(record.totalAmount)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button
                            onClick={() => handleDeleteBusFuel(record.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Purchases Tab */}
      {activeTab === "purchases" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Purchase Records</h3>
            <button
              onClick={() => setShowPurchaseForm(!showPurchaseForm)}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Purchase
            </button>
          </div>

          {/* Add Purchase Form */}
          {showPurchaseForm && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Add Purchase</h4>
              <form onSubmit={handlePurchaseSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Liters *</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={purchaseForm.liters}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, liters: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Liter *</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={purchaseForm.pricePerLiter}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, pricePerLiter: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                    <input
                      type="text"
                      value={purchaseForm.supplier}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, supplier: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Supplier name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                    <input
                      type="text"
                      value={purchaseForm.invoiceNumber}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, invoiceNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Invoice #"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <input
                      type="text"
                      value={purchaseForm.notes}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, notes: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Optional notes"
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="w-full p-2 bg-green-50 rounded-lg border border-green-100">
                      <p className="text-xs text-green-600">Total Cost</p>
                      <p className="text-lg font-bold text-green-700">
                        {formatCurrency((parseFloat(purchaseForm.liters) || 0) * (parseFloat(purchaseForm.pricePerLiter) || 0))}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Save Purchase
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPurchaseForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Purchases Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {purchases.length === 0 ? (
              <div className="text-center py-8">
                <Truck className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No purchase records yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Liters</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price/L</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total Cost</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {purchases.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">{formatDate(record.date)}</td>
                        <td className="px-4 py-2 text-sm text-right text-gray-900">{formatNumber(record.liters)}</td>
                        <td className="px-4 py-2 text-sm text-right text-gray-900">{formatCurrency(record.pricePerLiter)}</td>
                        <td className="px-4 py-2 text-sm text-right text-red-600 font-medium">
                          {formatCurrency(record.totalCost)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">{record.supplier || "—"}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{record.invoiceNumber || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}