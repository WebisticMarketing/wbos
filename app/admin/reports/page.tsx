// app/admin/reports/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  RefreshCw,
  Calendar,
  ChevronDown,
  Users,
  DollarSign,
  TrendingUp,
  BarChart3,
  PieChart,
  Building2,
  Clock,
} from "lucide-react";

interface ReportData {
  sales: {
    totalLeads: number;
    qualifiedLeads: number;
    convertedLeads: number;
    lostLeads: number;
    conversionRate: number;
    averageDealValue: number;
  };
  clients: {
    active: number;
    new: number;
    lost: number;
    retention: number;
  };
  finance: {
    totalRevenue: number;
    monthlyRevenue: number;
    recurringRevenue: number;
    outstandingInvoices: number;
  };
  services: Array<{
    name: string;
    clients: number;
    revenue: number;
  }>;
  leadSources: Array<{
    source: string;
    leads: number;
    qualified: number;
    converted: number;
  }>;
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "12m">("30d");
  const [showDateRangeDropdown, setShowDateRangeDropdown] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin-token");
      const response = await fetch(`/api/admin/reports?range=${dateRange}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch reports");

      const reportData = await response.json();
      setData(reportData);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem("admin-token");
      const response = await fetch(`/api/admin/reports/export?range=${dateRange}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to export");
      }

      // Get the filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `Webistic_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match) filename = match[1];
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Error exporting:", error);
      alert(error.message || "Failed to export report");
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `£${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/60">Loading reports...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/60">No report data available</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-white/50 text-sm">
            Comprehensive business insights and analytics
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <button
              onClick={() => setShowDateRangeDropdown(!showDateRangeDropdown)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
            >
              <Calendar size={16} />
              {dateRange === "7d" ? "Last 7 Days" :
               dateRange === "30d" ? "Last 30 Days" :
               dateRange === "90d" ? "Last 90 Days" :
               "Last 12 Months"}
              <ChevronDown size={14} />
            </button>
            {showDateRangeDropdown && (
              <div className="absolute top-full right-0 mt-1 w-48 rounded-xl bg-[#0b1120] border border-white/10 shadow-xl z-50 py-1">
                {[
                  { value: "7d", label: "Last 7 Days" },
                  { value: "30d", label: "Last 30 Days" },
                  { value: "90d", label: "Last 90 Days" },
                  { value: "12m", label: "Last 12 Months" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setDateRange(option.value as any);
                      setShowDateRangeDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-white/60 hover:text-white hover:bg-white/5 text-sm"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={fetchReports}
            disabled={loading}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2 rounded-xl bg-[#0068e3] hover:bg-[#0068e3]/80 text-white text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Download size={16} />
            {exporting ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>

      {/* Sales Report */}
      <div className="mb-6">
        <h2 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <TrendingUp size={16} className="text-[#00b8fd]" />
          Sales Report
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
            <p className="text-white/40 text-xs">Total Leads</p>
            <p className="text-xl font-bold text-white">{data.sales.totalLeads}</p>
          </div>
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
            <p className="text-white/40 text-xs">Qualified</p>
            <p className="text-xl font-bold text-blue-400">{data.sales.qualifiedLeads}</p>
          </div>
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
            <p className="text-white/40 text-xs">Conversion Rate</p>
            <p className="text-xl font-bold text-emerald-400">{data.sales.conversionRate}%</p>
          </div>
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
            <p className="text-white/40 text-xs">Avg Deal Value</p>
            <p className="text-xl font-bold text-[#00b8fd]">
              {formatCurrency(data.sales.averageDealValue)}
            </p>
          </div>
        </div>
      </div>

      {/* Client Report */}
      <div className="mb-6">
        <h2 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <Users size={16} className="text-[#00b8fd]" />
          Client Report
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
            <p className="text-white/40 text-xs">Active Clients</p>
            <p className="text-xl font-bold text-white">{data.clients.active}</p>
          </div>
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
            <p className="text-white/40 text-xs">New Clients</p>
            <p className="text-xl font-bold text-emerald-400">{data.clients.new}</p>
          </div>
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
            <p className="text-white/40 text-xs">Lost Clients</p>
            <p className="text-xl font-bold text-red-400">{data.clients.lost}</p>
          </div>
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
            <p className="text-white/40 text-xs">Retention Rate</p>
            <p className="text-xl font-bold text-blue-400">{data.clients.retention}%</p>
          </div>
        </div>
      </div>

      {/* Finance Report */}
      <div className="mb-6">
        <h2 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <DollarSign size={16} className="text-[#00b8fd]" />
          Finance Report
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
            <p className="text-white/40 text-xs">Total Revenue</p>
            <p className="text-xl font-bold text-[#00b8fd]">
              {formatCurrency(data.finance.totalRevenue)}
            </p>
          </div>
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
            <p className="text-white/40 text-xs">Monthly Revenue</p>
            <p className="text-xl font-bold text-emerald-400">
              {formatCurrency(data.finance.monthlyRevenue)}
            </p>
          </div>
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
            <p className="text-white/40 text-xs">Recurring Revenue</p>
            <p className="text-xl font-bold text-blue-400">
              {formatCurrency(data.finance.recurringRevenue)}
            </p>
          </div>
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
            <p className="text-white/40 text-xs">Outstanding</p>
            <p className="text-xl font-bold text-yellow-400">
              {formatCurrency(data.finance.outstandingInvoices)}
            </p>
          </div>
        </div>
      </div>

      {/* Service Performance */}
      <div className="mb-6">
        <h2 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <BarChart3 size={16} className="text-[#00b8fd]" />
          Service Performance
        </h2>
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10">
                <tr className="text-left text-white/40 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3 text-right">Clients</th>
                  <th className="px-4 py-3 text-right">Revenue</th>
                  <th className="px-4 py-3 text-right">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {data.services.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-white/40">
                      No service data available
                    </td>
                  </tr>
                ) : (
                  data.services.map((service) => {
                    const percentage = data.finance.totalRevenue > 0
                      ? Math.round((service.revenue / data.finance.totalRevenue) * 100)
                      : 0;

                    return (
                      <tr
                        key={service.name}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-4 py-3 text-white font-medium">
                          {service.name}
                        </td>
                        <td className="px-4 py-3 text-white/60 text-right">
                          {service.clients}
                        </td>
                        <td className="px-4 py-3 text-[#00b8fd] text-right">
                          {formatCurrency(service.revenue)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-white/60 text-sm">{percentage}%</span>
                            <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#0068e3] to-[#00b8fd]"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Lead Sources */}
      <div>
        <h2 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <PieChart size={16} className="text-[#00b8fd]" />
          Lead Source Performance
        </h2>
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10">
                <tr className="text-left text-white/40 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3 text-right">Leads</th>
                  <th className="px-4 py-3 text-right">Qualified</th>
                  <th className="px-4 py-3 text-right">Converted</th>
                  <th className="px-4 py-3 text-right">Conversion Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.leadSources.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-white/40">
                      No lead source data available
                    </td>
                  </tr>
                ) : (
                  data.leadSources.map((source) => {
                    const conversionRate = source.leads > 0
                      ? Math.round((source.converted / source.leads) * 100)
                      : 0;

                    return (
                      <tr
                        key={source.source}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-4 py-3 text-white capitalize">
                          {source.source.replace("_", " ")}
                        </td>
                        <td className="px-4 py-3 text-white/60 text-right">
                          {source.leads}
                        </td>
                        <td className="px-4 py-3 text-blue-400 text-right">
                          {source.qualified}
                        </td>
                        <td className="px-4 py-3 text-emerald-400 text-right">
                          {source.converted}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            conversionRate > 50
                              ? "bg-emerald-500/20 text-emerald-400"
                              : conversionRate > 25
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                          }`}>
                            {conversionRate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}