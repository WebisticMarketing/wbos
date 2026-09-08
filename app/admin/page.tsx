// app/admin/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  MessageSquare,
  TrendingUp,
  Clock,
  DollarSign,
  Briefcase,
  ArrowRight,
  RefreshCw,
  Eye,
  Plus,
  BarChart3,
  Calendar,
  CheckCircle,
  UserPlus,
  Zap,
  AlertCircle,
  Check,
  X,
} from "lucide-react";

interface Stats {
  totalLeads: number;
  newLeads: number;
  contacted: number;
  qualified: number;
  converted: number;
  lost: number;
  conversations: number;
}

interface ClientStats {
  total: number;
  active: number;
  completed: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

interface RecentClient {
  id: string;
  name: string;
  business: string | null;
  service: string;
  status: string;
  totalRevenue: number;
  startDate: string;
  email: string | null;
  whatsapp: string | null;
}

interface RecentLead {
  id: string;
  name: string | null;
  business: string | null;
  service: string | null;
  status: string;
  createdAt: string;
}

interface PaymentAlert {
  id: string;
  type?: string;
  clientId: string;
  clientName: string;
  projectId: string;
  projectName: string;
  amount: number;
  dueDate: string;
  status: "overdue" | "upcoming";
  daysUntil: number;
  isRecurring?: boolean;
}

interface PaymentAlertsData {
  alerts: PaymentAlert[];
  summary: {
    overdue: number;
    upcoming: number;
    total: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [clientStats, setClientStats] = useState<ClientStats | null>(null);
  const [recentClients, setRecentClients] = useState<RecentClient[]>([]);
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [paymentAlerts, setPaymentAlerts] = useState<PaymentAlertsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchAllData();
    checkOverdue();
    fetchPaymentAlerts();
    
    const interval = setInterval(() => {
      checkOverdue();
      fetchPaymentAlerts();
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  const checkOverdue = async () => {
    try {
      const token = localStorage.getItem("admin-token");
      await fetch("/api/admin/check-overdue", {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Error checking overdue:", error);
    }
  };

  const fetchPaymentAlerts = async () => {
    try {
      const token = localStorage.getItem("admin-token");
      const response = await fetch("/api/admin/payment-alerts", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentAlerts(data);
      }
    } catch (error) {
      console.error("Error fetching payment alerts:", error);
    }
  };

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem("admin-token");

      // 1. Fetch lead stats
      const statsRes = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statsData = await statsRes.json();
      setStats(statsData);

      // 2. Fetch clients
      const clientsRes = await fetch("/api/admin/clients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const clientsData = await clientsRes.json();

      if (clientsData.clients) {
        const total = clientsData.clients.length;
        const active = clientsData.clients.filter((c: any) => c.status === "active").length;
        const completed = clientsData.clients.filter((c: any) => c.status === "completed").length;
        const totalRevenue = clientsData.clients.reduce((sum: number, c: any) => sum + c.totalRevenue, 0);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const monthlyRevenue = clientsData.clients
          .filter((c: any) => new Date(c.startDate) >= thirtyDaysAgo)
          .reduce((sum: number, c: any) => sum + c.totalRevenue, 0);

        setClientStats({ total, active, completed, totalRevenue, monthlyRevenue });
        setRecentClients(clientsData.clients.slice(0, 5));
      }

      // 3. Fetch recent leads
      const leadsRes = await fetch("/api/admin/leads?limit=5", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const leadsData = await leadsRes.json();
      setRecentLeads(leadsData.leads || []);

    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    await checkOverdue();
    await fetchPaymentAlerts();
  };

  const statusColors: Record<string, string> = {
    new: "bg-emerald-500/20 text-emerald-400",
    contacted: "bg-yellow-500/20 text-yellow-400",
    qualified: "bg-blue-500/20 text-blue-400",
    converted: "bg-purple-500/20 text-purple-400",
    lost: "bg-red-500/20 text-red-400",
  };

  const clientStatusColors: Record<string, string> = {
    active: "bg-emerald-500/20 text-emerald-400",
    completed: "bg-blue-500/20 text-blue-400",
    cancelled: "bg-red-500/20 text-red-400",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/60">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-white/50 text-sm">Overview of your business</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ============================================================
          LEAD STATS
          ============================================================ */}
      <div className="flex items-center gap-2 mb-3">
        <Users size={16} className="text-[#00b8fd]" />
        <h2 className="text-white font-semibold text-sm">Leads Overview</h2>
        <Link href="/admin/leads" className="text-white/30 text-xs hover:text-[#00b8fd] transition-colors ml-auto">
          View All →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
          <p className="text-white/40 text-xs">Total</p>
          <p className="text-xl font-bold text-white">{stats?.totalLeads || 0}</p>
        </div>
        <div className="rounded-xl bg-emerald-500/5 backdrop-blur-sm border border-emerald-500/20 p-4">
          <p className="text-white/40 text-xs">New</p>
          <p className="text-xl font-bold text-emerald-400">{stats?.newLeads || 0}</p>
        </div>
        <div className="rounded-xl bg-yellow-500/5 backdrop-blur-sm border border-yellow-500/20 p-4">
          <p className="text-white/40 text-xs">Contacted</p>
          <p className="text-xl font-bold text-yellow-400">{stats?.contacted || 0}</p>
        </div>
        <div className="rounded-xl bg-blue-500/5 backdrop-blur-sm border border-blue-500/20 p-4">
          <p className="text-white/40 text-xs">Qualified</p>
          <p className="text-xl font-bold text-blue-400">{stats?.qualified || 0}</p>
        </div>
        <div className="rounded-xl bg-purple-500/5 backdrop-blur-sm border border-purple-500/20 p-4">
          <p className="text-white/40 text-xs">Converted</p>
          <p className="text-xl font-bold text-purple-400">{stats?.converted || 0}</p>
        </div>
      </div>

      {/* ============================================================
          CLIENT STATS
          ============================================================ */}
      <div className="flex items-center gap-2 mb-3">
        <Briefcase size={16} className="text-[#00b8fd]" />
        <h2 className="text-white font-semibold text-sm">Client & Revenue Overview</h2>
        <Link href="/admin/clients" className="text-white/30 text-xs hover:text-[#00b8fd] transition-colors ml-auto">
          View All →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
          <p className="text-white/40 text-xs">Total Clients</p>
          <p className="text-xl font-bold text-white">{clientStats?.total || 0}</p>
        </div>
        <div className="rounded-xl bg-emerald-500/5 backdrop-blur-sm border border-emerald-500/20 p-4">
          <p className="text-white/40 text-xs">Active</p>
          <p className="text-xl font-bold text-emerald-400">{clientStats?.active || 0}</p>
        </div>
        <div className="rounded-xl bg-blue-500/5 backdrop-blur-sm border border-blue-500/20 p-4">
          <p className="text-white/40 text-xs">Completed</p>
          <p className="text-xl font-bold text-blue-400">{clientStats?.completed || 0}</p>
        </div>
        <div className="rounded-xl bg-[#0068e3]/5 backdrop-blur-sm border border-[#0068e3]/20 p-4">
          <p className="text-white/40 text-xs">Total Revenue</p>
          <p className="text-xl font-bold text-[#00b8fd]">£{(clientStats?.totalRevenue || 0).toFixed(2)}</p>
        </div>
        <div className="rounded-xl bg-yellow-500/5 backdrop-blur-sm border border-yellow-500/20 p-4">
          <p className="text-white/40 text-xs">This Month</p>
          <p className="text-xl font-bold text-yellow-400">£{(clientStats?.monthlyRevenue || 0).toFixed(2)}</p>
        </div>
      </div>

      {/* ============================================================
          RECENT ACTIVITY
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Clients */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <UserPlus size={16} className="text-emerald-400" />
              Recent Clients
            </h3>
            <Link href="/admin/clients" className="text-[#00b8fd] text-sm hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
            {recentClients.length === 0 ? (
              <div className="py-8 text-center text-white/40 text-sm">
                No clients yet. <Link href="/admin/clients" className="text-[#00b8fd] hover:underline">Add your first client →</Link>
              </div>
            ) : (
              recentClients.map((client) => (
                <Link
                  key={client.id}
                  href={`/admin/clients/${client.id}`}
                  className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm truncate">{client.name}</p>
                    <p className="text-white/40 text-xs truncate">
                      {client.service} • {client.business || "No business"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <span className="text-[#00b8fd] text-sm font-medium">
                      £{client.totalRevenue.toFixed(2)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${clientStatusColors[client.status] || "bg-white/10 text-white/60"}`}>
                      {client.status}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Leads */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <Users size={16} className="text-[#00b8fd]" />
              Recent Leads
            </h3>
            <Link href="/admin/leads" className="text-[#00b8fd] text-sm hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
            {recentLeads.length === 0 ? (
              <div className="py-8 text-center text-white/40 text-sm">
                No leads yet. They will appear here when visitors contact you.
              </div>
            ) : (
              recentLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/admin/leads/${lead.id}`}
                  className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm truncate">{lead.name || "Unknown"}</p>
                    <p className="text-white/40 text-xs truncate">
                      {lead.service || "No service"} • {lead.business || "No business"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors[lead.status] || "bg-white/10 text-white/60"}`}>
                      {lead.status}
                    </span>
                    <ArrowRight size={14} className="text-white/20" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ============================================================
          PAYMENT ALERTS
          ============================================================ */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <DollarSign size={16} className="text-[#00b8fd]" />
            Payment Alerts
          </h3>
          <div className="flex items-center gap-3">
            {paymentAlerts?.summary && (
              <div className="flex items-center gap-3 text-xs">
                {paymentAlerts.summary.overdue > 0 && (
                  <span className="text-red-400 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {paymentAlerts.summary.overdue} overdue
                  </span>
                )}
                {paymentAlerts.summary.upcoming > 0 && (
                  <span className="text-yellow-400 flex items-center gap-1">
                    <Clock size={12} />
                    {paymentAlerts.summary.upcoming} upcoming
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {!paymentAlerts ? (
            <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 text-center">
              <div className="text-white/40 text-sm">Loading payment alerts...</div>
            </div>
          ) : paymentAlerts.alerts.length === 0 ? (
            <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 text-center">
              <Check size={24} className="mx-auto mb-2 text-emerald-400" />
              <p className="text-white/40 text-sm">No pending payments. All caught up! ✅</p>
            </div>
          ) : (
            paymentAlerts.alerts.slice(0, 5).map((alert) => (
              <Link
                key={alert.id}
                href={`/admin/clients/${alert.clientId}`}
                className={`rounded-xl border p-4 hover:bg-white/5 transition-colors ${
                  alert.status === "overdue"
                    ? "border-red-500/30 bg-red-500/5"
                    : "border-yellow-500/30 bg-yellow-500/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-medium text-sm truncate">
                        {alert.clientName}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        alert.status === "overdue"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {alert.status === "overdue" ? "⚠️ Overdue" : "📅 Upcoming"}
                      </span>
                      {alert.isRecurring && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/20 text-blue-400">
                          🔄 Recurring
                        </span>
                      )}
                    </div>
                    <p className="text-white/40 text-xs truncate">
                      {alert.projectName} • Due: {new Date(alert.dueDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <span className={`text-sm font-bold ${
                      alert.status === "overdue" ? "text-red-400" : "text-yellow-400"
                    }`}>
                      £{alert.amount.toFixed(2)}
                    </span>
                    <span className={`text-xs ${
                      alert.status === "overdue" ? "text-red-400" : "text-yellow-400"
                    }`}>
                      {alert.status === "overdue"
                        ? `${Math.abs(alert.daysUntil)} day${Math.abs(alert.daysUntil) > 1 ? "s" : ""} overdue`
                        : `${alert.daysUntil} day${alert.daysUntil > 1 ? "s" : ""} left`
                      }
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* ============================================================
          QUICK ACTIONS
          ============================================================ */}
      <div className="mt-6 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
        <h3 className="text-white font-semibold text-sm mb-3">⚡ Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/clients"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0068e3]/20 text-[#00b8fd] hover:bg-[#0068e3]/30 transition-colors text-sm"
          >
            <Plus size={16} />
            Add Client
          </Link>
          <Link
            href="/admin/leads"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-colors text-sm"
          >
            <Eye size={16} />
            View All Leads
          </Link>
          <Link
            href="/admin/analytics"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-colors text-sm"
          >
            <BarChart3 size={16} />
            Analytics
          </Link>
        </div>
      </div>
    </div>
  );
}