// app/wbos/sadaat/buses/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Bus,
  Edit,
  Eye,
  LayoutGrid,
  List,
  ArrowLeft,
} from "lucide-react";
import { SkeletonCard } from "@/app/components/ui/Skeleton";

interface Bus {
  id: string;
  busNumber: string;
  numberPlate: string;
  name: string;
  capacity: number;
  status: string;
  createdAt: string;
}

export default function BusesPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetchUserAndBuses();
  }, []);

  const fetchUserAndBuses = async () => {
    try {
      // 🔹 Fetch user for document title
      const meRes = await fetch("/api/wbos/auth/me");
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData.user?.businessName) {
          document.title = `${meData.user.businessName} – Buses`;
        }
      }

      // 🔹 Fetch buses
      const res = await fetch("/api/wbos/sadaat/buses");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setBuses(data);
    } catch (error) {
      console.error("Error fetching buses:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBuses = buses.filter((b) =>
    b.busNumber.toLowerCase().includes(search.toLowerCase()) ||
    b.numberPlate.toLowerCase().includes(search.toLowerCase()) ||
    b.name?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case "maintenance":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Maintenance
          </span>
        );
      case "inactive":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-500 text-xs font-medium rounded-full border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            Inactive
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-50 text-gray-500 text-xs font-medium rounded-full border border-gray-200">
            {status}
          </span>
        );
    }
  };

  // 🟨 Loading state with skeleton
  if (loading) {
    return (
      <div className="space-y-6 p-6 bg-white min-h-screen">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
          <div>
            <div className="h-7 w-40 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-4 w-32 bg-gray-200 rounded-lg animate-pulse mt-1" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Fleet Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {buses.length} buses in fleet
          </p>
        </div>
        <div className="ml-auto">
          <Link
            href="/wbos/sadaat/buses/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm shadow-blue-200 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Add Bus
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by plate number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 placeholder:text-gray-400 transition-all duration-200"
        />
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setViewMode("grid")}
          className={`p-2 rounded-lg transition-colors ${
            viewMode === "grid"
              ? "bg-blue-50 text-blue-600"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`p-2 rounded-lg transition-colors ${
            viewMode === "list"
              ? "bg-blue-50 text-blue-600"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
          }`}
        >
          <List className="w-4 h-4" />
        </button>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBuses.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                <Bus className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-sm font-medium text-gray-900">
                {search ? "No buses match your search" : "No buses yet"}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {search ? "Try adjusting your search terms" : "Add your first bus to get started"}
              </p>
              {!search && (
                <Link
                  href="/wbos/sadaat/buses/create"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Bus
                </Link>
              )}
            </div>
          ) : (
            filteredBuses.map((bus) => (
              <div
                key={bus.id}
                className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-blue-200 transition-all duration-200"
              >
                <Link href={`/wbos/sadaat/buses/${bus.id}`} className="block">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <Bus className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{bus.busNumber}</p>
                        <p className="text-sm text-gray-500 font-mono">{bus.numberPlate}</p>
                      </div>
                    </div>
                    {getStatusBadge(bus.status)}
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Capacity</span>
                      <p className="font-medium text-gray-900">{bus.capacity} seats</p>
                    </div>
                    {bus.name && (
                      <div>
                        <span className="text-gray-500">Name</span>
                        <p className="font-medium text-gray-900">{bus.name}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                    <span className="text-xs text-gray-400">Click to view</span>
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bus
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Number Plate
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBuses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {search ? "No buses match your search" : "No buses yet"}
                    </td>
                  </tr>
                ) : (
                  filteredBuses.map((bus) => (
                    <tr key={bus.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          href={`/wbos/sadaat/buses/${bus.id}`}
                          className="flex items-center gap-3 hover:text-blue-600"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Bus className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-900">{bus.busNumber}</span>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-900">{bus.numberPlate}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{bus.name || "—"}</td>
                      <td className="px-6 py-4 text-gray-600">{bus.capacity} seats</td>
                      <td className="px-6 py-4">{getStatusBadge(bus.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/wbos/sadaat/buses/${bus.id}`}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/wbos/sadaat/buses/${bus.id}/edit`}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}