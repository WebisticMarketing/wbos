// app/wbos/sadaat/buses/[busId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bus,
  Edit,
  Loader2,
  TrendingUp,
  TrendingDown,
  Wallet,
  Wrench,
  CircleDot,
  Calendar,
  DollarSign,
  Plus,
  Eye,
  Fuel,
  Clock,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";
import { Skeleton, SkeletonStatsCard } from "@/app/components/ui/Skeleton";

interface BusData {
  id: string;
  busNumber: string;
  numberPlate: string;
  name: string;
  capacity: number;
  status: string;
  createdAt: string;
  totals: {
    totalRevenue: number;
    totalExpenses: number;
    totalProfit: number;
    totalMaintenance: number;
    totalTyres: number;
    netProfit: number;
    tripCount: number;
    maintenanceCount: number;
    tyreCount: number;
    fuelCount: number;
    totalFuelLiters: number;
    totalFuelCost: number;
  };
  maintenance: Array<{
    id: string;
    maintenanceDate: string;
    type: string;
    description: string;
    cost: number;
    notes: string;
  }>;
  tyres: Array<{
    id: string;
    tyreDate: string;
    description: string;
    cost: number;
    notes: string;
  }>;
  fuelRecords: Array<{
    id: string;
    date: string;
    liters: number;
    totalAmount: number;
    notes: string;
  }>;
}

type TabType = "overview" | "trips" | "maintenance" | "tyres" | "fuel";

export default function BusDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bus, setBus] = useState<BusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const busId = params.busId as string;
  const slug = params.slug as string; // Get the business slug from URL

  useEffect(() => {
    const tabParam = searchParams.get("tab") as TabType;
    if (tabParam === "fuel" || tabParam === "trips" || tabParam === "maintenance" || tabParam === "tyres") {
      setActiveTab(tabParam);
    }
    fetchData();
  }, [busId, searchParams, slug]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // 🔹 Set document title
      const meRes = await fetch("/api/wbos/auth/me");
      if (!meRes.ok) {
        // User not authenticated, redirect to login
        router.push(`/login?redirect=/wbos/${slug}/buses/${busId}`);
        return;
      }
      
      const meData = await meRes.json();
      if (meData.user?.businessName) {
        document.title = `${meData.user.businessName} – Bus Details`;
      }

      const res = await fetch(`/api/wbos/sadaat/buses/${busId}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError("Bus not found");
        } else if (res.status === 401) {
          // Unauthorized - redirect to login
          router.push(`/login?redirect=/wbos/${slug}/buses/${busId}`);
          return;
        } else {
          throw new Error("Failed to fetch bus data");
        }
        return;
      }
      
      const data = await res.json();
      setBus(data);
    } catch (error) {
      console.error("Error fetching bus:", error);
      setError("Failed to load bus data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === null || amount === undefined) return "Rs 0";
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (isNaN(num) || num === null || num === undefined) return "0";
    return new Intl.NumberFormat("en-PK").format(num);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case "maintenance":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-sm font-medium rounded-full border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Maintenance
          </span>
        );
      case "inactive":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-500 text-sm font-medium rounded-full border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            Inactive
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-50 text-gray-500 text-sm font-medium rounded-full border border-gray-200">
            {status}
          </span>
        );
    }
  };

  const tabs: { key: TabType; label: string; icon: any }[] = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "trips", label: "Trips", icon: Calendar },
    { key: "maintenance", label: "Maintenance", icon: Wrench },
    { key: "tyres", label: "Tyres", icon: CircleDot },
    { key: "fuel", label: "Fuel", icon: Fuel },
  ];

  // 🟨 Loading state with skeleton
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
        {/* Header Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="flex items-center gap-4">
                <Skeleton className="w-14 h-14 rounded-2xl" />
                <div>
                  <Skeleton className="h-7 w-32 rounded-lg" />
                  <div className="flex items-center gap-3 mt-1">
                    <Skeleton className="h-5 w-24 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="w-32 h-10 rounded-xl" />
              <Skeleton className="w-20 h-10 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonStatsCard key={i} />
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 px-4">
            <div className="flex items-center gap-1 py-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !bus) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-white">
        <div className="text-red-500">{error || "Bus not found"}</div>
      </div>
    );
  }

  const { totals } = bus;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/wbos/sadaat/buses"
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                <Bus className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {bus.numberPlate}
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm text-gray-500">{bus.busNumber}</span>
                  <span className="text-gray-300">|</span>
                  {bus.name && (
                    <>
                      <span className="text-sm text-gray-600">{bus.name}</span>
                      <span className="text-gray-300">|</span>
                    </>
                  )}
                  <span className="text-sm text-gray-500">
                    Capacity: <span className="font-medium">{bus.capacity}</span>
                  </span>
                  {getStatusBadge(bus.status)}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/wbos/sadaat/buses/${bus.id}/vouchers`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              <Eye className="w-4 h-4" />
              View Vouchers
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href={`/wbos/sadaat/buses/${bus.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            Revenue
          </div>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(totals.totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <TrendingDown className="w-4 h-4 text-red-500" />
            Expenses
          </div>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(totals.totalExpenses)}</p>
        </div>
        <div className={`bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-shadow ${
          totals.totalProfit >= 0 ? 'border-emerald-200' : 'border-red-200'
        }`}>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Wallet className={`w-4 h-4 ${totals.totalProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
            Profit
          </div>
          <p className={`text-lg font-bold ${totals.totalProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(totals.totalProfit)}
          </p>
        </div>
        <div className={`bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-shadow ${
          totals.netProfit >= 0 ? 'border-indigo-200' : 'border-red-200'
        }`}>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <DollarSign className={`w-4 h-4 ${totals.netProfit >= 0 ? 'text-indigo-500' : 'text-red-500'}`} />
            Net Profit
          </div>
          <p className={`text-lg font-bold ${totals.netProfit >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
            {formatCurrency(totals.netProfit)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Calendar className="w-4 h-4 text-purple-500" />
            Trips
          </div>
          <p className="text-lg font-bold text-gray-900">{formatNumber(totals.tripCount)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Wrench className="w-4 h-4 text-amber-500" />
            Maintenance
          </div>
          <p className="text-lg font-bold text-gray-900">{formatNumber(totals.maintenanceCount)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-4 overflow-x-auto">
          <div className="flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                    isActive
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.key === "trips" && totals.tripCount > 0 && (
                    <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {totals.tripCount}
                    </span>
                  )}
                  {tab.key === "maintenance" && totals.maintenanceCount > 0 && (
                    <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {totals.maintenanceCount}
                    </span>
                  )}
                  {tab.key === "tyres" && totals.tyreCount > 0 && (
                    <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {totals.tyreCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-sm text-gray-500">Bus Number</p>
                  <p className="text-lg font-semibold text-gray-900">{bus.busNumber}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-sm text-gray-500">Number Plate</p>
                  <p className="text-lg font-semibold text-gray-900">{bus.numberPlate}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-sm text-gray-500">Capacity</p>
                  <p className="text-lg font-semibold text-gray-900">{bus.capacity} seats</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-sm text-gray-500">Status</p>
                  {getStatusBadge(bus.status)}
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(bus.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-sm text-gray-500">Total Trips</p>
                  <p className="text-lg font-semibold text-gray-900">{totals.tripCount}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href={`/wbos/sadaat/buses/${bus.id}/vouchers/create`} className="p-4 bg-blue-50 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors text-center group">
                  <Plus className="w-6 h-6 text-blue-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-blue-700">Add Voucher</p>
                </Link>
                <Link href={`/wbos/sadaat/buses/${bus.id}/vouchers`} className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-colors text-center group">
                  <Eye className="w-6 h-6 text-emerald-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-emerald-700">View Vouchers</p>
                </Link>
                <Link href={`/wbos/sadaat/buses/${bus.id}/maintenance/create`} className="p-4 bg-amber-50 rounded-xl border border-amber-200 hover:bg-amber-100 transition-colors text-center group">
                  <Wrench className="w-6 h-6 text-amber-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-amber-700">Add Maintenance</p>
                </Link>
                <Link href={`/wbos/sadaat/buses/${bus.id}/tyres/create`} className="p-4 bg-purple-50 rounded-xl border border-purple-200 hover:bg-purple-100 transition-colors text-center group">
                  <CircleDot className="w-6 h-6 text-purple-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-purple-700">Add Tyre</p>
                </Link>
              </div>
            </div>
          )}

          {/* Trips Tab */}
          {activeTab === "trips" && (
            <div>
              <p className="text-sm text-gray-500 mb-4">All trip vouchers for this bus</p>
              <Link href={`/wbos/sadaat/buses/${bus.id}/vouchers`} className="block">
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center hover:bg-gray-100 transition-colors">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">View All Trips</p>
                  <p className="text-sm text-gray-400">{totals.tripCount} {totals.tripCount === 1 ? "trip" : "trips"} recorded</p>
                </div>
              </Link>
            </div>
          )}

          {/* Maintenance Tab */}
          {activeTab === "maintenance" && (
            <div>
              <Link href={`/wbos/sadaat/buses/${bus.id}/maintenance/create`} className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors mb-4">
                <Plus className="w-4 h-4" /> Add Record
              </Link>
              {bus.maintenance && bus.maintenance.length === 0 ? (
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
                  <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No maintenance records</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bus.maintenance.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-900">{new Date(record.maintenanceDate).toLocaleDateString()}</td>
                          <td className="px-4 py-3"><span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">{record.type}</span></td>
                          <td className="px-4 py-3 text-sm text-gray-600">{record.description || "—"}</td>
                          <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">{formatCurrency(record.cost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tyres Tab */}
          {activeTab === "tyres" && (
            <div>
              <Link href={`/wbos/sadaat/buses/${bus.id}/tyres/create`} className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors mb-4">
                <Plus className="w-4 h-4" /> Add Record
              </Link>
              {bus.tyres && bus.tyres.length === 0 ? (
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
                  <CircleDot className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No tyre records</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th><th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Cost</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bus.tyres.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-900">{new Date(record.tyreDate).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{record.description || "—"}</td>
                          <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">{formatCurrency(record.cost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Fuel Tab */}
          {activeTab === "fuel" && (
            <div>
              <Link href={`/wbos/sadaat/buses/${bus.id}/fuel/create`} className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors mb-4">
                <Plus className="w-4 h-4" /> Add Fuel
              </Link>
              {bus.fuelRecords && bus.fuelRecords.length === 0 ? (
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
                  <Fuel className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No fuel records</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th><th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Liters</th><th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total Amount</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notes</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bus.fuelRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-900">{new Date(record.date).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">{formatNumber(record.liters)}</td>
                          <td className="px-4 py-3 text-sm text-right text-orange-600 font-medium">{formatCurrency(record.totalAmount)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{record.notes || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}