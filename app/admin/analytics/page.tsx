// app/admin/analytics/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  RefreshCw,
  Calendar,
  ChevronDown,
  Download,
  PieChart,
  LineChart,
} from "lucide-react";

interface AnalyticsData {
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  totalRevenue: number;
  monthlyRevenue: number;
  leadsByStatus: Array<{ status: string; count: number }>;
  leadsBySource: Array<{ source: string; count: number }>;
  leadsByService: Array<{ service: string; count: number }>;
  revenueByService: Array<{ service: string; total: number }>;
  monthlyRevenueData: Array<{ month: string; total: number }>;
  recentActivity: Array<{
    id: string;
    name: string;
    status: string;
    service: string;
    updatedAt: string;
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  new: "#10b981",
  contacted: "#f59e0b",
  qualified: "#3b82f6",
  consultation: "#8b5cf6",
  proposal: "#6366f1",
  negotiation: "#f97316",
  converted: "#10b981",
  won: "#22c55e",
  lost: "#ef4444",
  "not-interested": "#6b7280",
  unqualified: "#6b7280",
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  consultation: "Consultation",
  proposal: "Proposal",
  negotiation: "Negotiation",
  converted: "Converted",
  won: "Won",
  lost: "Lost",
  "not-interested": "Not Interested",
  unqualified: "Unqualified",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "12m">("30d");
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin-token");
      const response = await fetch(`/api/admin/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch analytics");

      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `£${amount.toFixed(2)}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/60">Loading analytics...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/60">No analytics data available</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-white/50 text-sm">
            Performance metrics and insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
          <p className="text-white/40 text-xs">Total Leads</p>
          <p className="text-2xl font-bold text-white">{data.totalLeads}</p>
          <p className="text-white/20 text-xs mt-1">All time</p>
        </div>
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
          <p className="text-white/40 text-xs">Conversion Rate</p>
          <p className="text-2xl font-bold text-emerald-400">{data.conversionRate}%</p>
          <p className="text-white/20 text-xs mt-1">
            {data.convertedLeads} converted
          </p>
        </div>
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
          <p className="text-white/40 text-xs">Total Revenue</p>
          <p className="text-2xl font-bold text-[#00b8fd]">
            {formatCurrency(data.totalRevenue)}
          </p>
          <p className="text-white/20 text-xs mt-1">All time</p>
        </div>
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
          <p className="text-white/40 text-xs">Monthly Revenue</p>
          <p className="text-2xl font-bold text-emerald-400">
            {formatCurrency(data.monthlyRevenue)}
          </p>
          <p className="text-white/20 text-xs mt-1">This month</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Leads by Status */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <PieChart size={16} className="text-[#00b8fd]" />
            Leads by Status
          </h3>
          <div className="space-y-2.5">
            {data.leadsByStatus.length === 0 ? (
              <div className="text-white/40 text-sm py-4 text-center">No data</div>
            ) : (
              data.leadsByStatus.map((item) => {
                const percentage = data.totalLeads > 0
                  ? Math.round((item.count / data.totalLeads) * 100)
                  : 0;
                const color = STATUS_COLORS[item.status] || "#6b7280";
                const label = STATUS_LABELS[item.status] || item.status;

                return (
                  <div key={item.status}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-white/60">{label}</span>
                      <span className="text-white">
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Revenue by Service */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-[#00b8fd]" />
            Revenue by Service
          </h3>
          <div className="space-y-2.5">
            {data.revenueByService.length === 0 ? (
              <div className="text-white/40 text-sm py-4 text-center">No data</div>
            ) : (
              data.revenueByService.map((item) => {
                const maxRevenue = Math.max(
                  ...data.revenueByService.map((r) => r.total)
                );
                const percentage = maxRevenue > 0
                  ? Math.round((item.total / maxRevenue) * 100)
                  : 0;

                return (
                  <div key={item.service}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-white/60">{item.service}</span>
                      <span className="text-white font-medium">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all bg-gradient-to-r from-[#0068e3] to-[#00b8fd]"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Leads by Source */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <Users size={16} className="text-[#00b8fd]" />
            Leads by Source
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.leadsBySource.length === 0 ? (
              <div className="text-white/40 text-sm py-4 text-center w-full">No data</div>
            ) : (
              data.leadsBySource.map((item) => (
                <div
                  key={item.source}
                  className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 flex items-center gap-2"
                >
                  <span className="text-white/60 text-sm capitalize">
                    {item.source.replace("_", " ")}
                  </span>
                  <span className="text-white font-medium text-sm">
                    {item.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Leads by Service */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-[#00b8fd]" />
            Leads by Service
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.leadsByService.length === 0 ? (
              <div className="text-white/40 text-sm py-4 text-center w-full">No data</div>
            ) : (
              data.leadsByService.map((item) => (
                <div
                  key={item.service}
                  className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 flex items-center gap-2"
                >
                  <span className="text-white/60 text-sm">{item.service}</span>
                  <span className="text-white font-medium text-sm">
                    {item.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <LineChart size={16} className="text-[#00b8fd]" />
            Recent Activity
          </h3>
        </div>
        <div className="divide-y divide-white/5 max-h-64 overflow-y-auto">
          {data.recentActivity.length === 0 ? (
            <div className="py-8 text-center text-white/40 text-sm">
              No recent activity
            </div>
          ) : (
            data.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{activity.name}</p>
                  <p className="text-white/40 text-xs">
                    {activity.service} • Status: {activity.status}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  <span className="text-white/20 text-xs">
                    {formatDate(activity.updatedAt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}