// app/admin/projects/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  Calendar,
  DollarSign,
  Building2,
  Clock,
  FolderKanban,
  CreditCard,
  FileText,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string | null;
  service: string;
  status: string;
  startDate: string;
  endDate: string | null;
  notes: string | null;
  client: {
    id: string;
    name: string;
    business: string | null;
  };
  payments: Array<{
    id: string;
    amount: number;
    paymentDate: string;
    status: string;
    method: string | null;
    reference: string | null;
  }>;
  recurringPayments: Array<{
    id: string;
    amount: number;
    frequency: string;
    nextPaymentDate: string;
    status: string;
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
  completed: "bg-blue-500/20 text-blue-400 border-blue-500/20",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/20",
  "on-hold": "bg-yellow-500/20 text-yellow-400 border-yellow-500/20",
  planning: "bg-purple-500/20 text-purple-400 border-purple-500/20",
  review: "bg-indigo-500/20 text-indigo-400 border-indigo-500/20",
  "client-approval": "bg-orange-500/20 text-orange-400 border-orange-500/20",
};

const STATUS_OPTIONS = [
  "planning",
  "active",
  "review",
  "client-approval",
  "completed",
  "on-hold",
  "cancelled",
];

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "payments" | "recurring" | "notes">("overview");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin-token");
      const response = await fetch(`/api/admin/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 404) {
          router.push("/admin/projects");
          return;
        }
        throw new Error("Failed to fetch project");
      }

      const data = await response.json();
      setProject(data.project);
    } catch (error) {
      console.error("Error fetching project:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem("admin-token");
      const response = await fetch(`/api/admin/projects/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      setProject(prev => prev ? { ...prev, status } : null);
      setShowStatusDropdown(false);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete project "${project?.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(true);
      const token = localStorage.getItem("admin-token");
      const response = await fetch(`/api/admin/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete project");

      router.push(`/admin/clients/${project?.client.id}`);
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `£${amount.toFixed(2)}`;
  };

  const getStatusBadge = (status: string) => {
    const color = STATUS_COLORS[status] || "bg-white/10 text-white/60";
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${color}`}>
        {status.replace("-", " ")}
      </span>
    );
  };

  const getTotalRevenue = () => {
    if (!project) return 0;
    return project.payments.reduce((sum, p) => sum + p.amount, 0);
  };

  const getMRR = () => {
    if (!project) return 0;
    let mrr = 0;
    for (const rp of project.recurringPayments) {
      if (rp.status !== "active") continue;
      let monthlyAmount = rp.amount;
      if (rp.frequency === "quarterly") monthlyAmount = rp.amount / 3;
      if (rp.frequency === "yearly") monthlyAmount = rp.amount / 12;
      mrr += monthlyAmount;
    }
    return mrr;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/60">Loading project details...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/60">Project not found</div>
      </div>
    );
  }

  const totalRevenue = getTotalRevenue();
  const mrr = getMRR();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/clients/${project.client.id}`}
            className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{project.name}</h1>
            <p className="text-white/50 text-sm flex items-center gap-2 flex-wrap">
              {project.client.name} • {project.service}
              {getStatusBadge(project.status)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href={`/admin/projects/${id}/edit`}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-colors flex items-center gap-2"
          >
            <Edit size={16} />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 size={16} />
            {deleting ? "Deleting..." : "Delete"}
          </button>
          <button
            onClick={fetchProject}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Status Update */}
      <div className="mb-6">
        <div className="relative inline-block">
          <button
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            disabled={updating}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${STATUS_COLORS[project.status] || "bg-white/10 text-white/60"}`}
          >
            Status: {project.status.replace("-", " ")}
            {updating && " (Updating...)"}
          </button>
          {showStatusDropdown && (
            <div className="absolute top-full left-0 mt-2 w-48 rounded-xl bg-[#0b1120] border border-white/10 shadow-xl z-50 py-1 max-h-60 overflow-y-auto">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  onClick={() => updateStatus(status)}
                  className="w-full px-4 py-2 text-left text-white/60 hover:text-white hover:bg-white/5 text-sm capitalize"
                >
                  {status.replace("-", " ")}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
          <p className="text-white/40 text-xs">Total Revenue</p>
          <p className="text-xl font-bold text-[#00b8fd]">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
          <p className="text-white/40 text-xs">Monthly Revenue</p>
          <p className="text-xl font-bold text-emerald-400">
            {formatCurrency(mrr)}
          </p>
        </div>
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
          <p className="text-white/40 text-xs">Payments</p>
          <p className="text-xl font-bold text-white">
            {project.payments.length}
          </p>
        </div>
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
          <p className="text-white/40 text-xs">Recurring</p>
          <p className="text-xl font-bold text-white">
            {project.recurringPayments.filter(rp => rp.status === "active").length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-white/10 overflow-x-auto">
        {[
          { id: "overview", label: "Overview", icon: FileText },
          { id: "payments", label: "Payments", icon: CreditCard },
          { id: "recurring", label: "Recurring", icon: Clock },
          { id: "notes", label: "Notes", icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                isActive
                  ? "text-white border-[#00b8fd]"
                  : "text-white/40 hover:text-white border-transparent"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
            <h3 className="text-white font-semibold text-sm mb-4">Project Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-white/40 text-xs">Name</p>
                <p className="text-white text-sm">{project.name}</p>
              </div>
              <div>
                <p className="text-white/40 text-xs">Service</p>
                <p className="text-white text-sm">{project.service}</p>
              </div>
              {project.description && (
                <div>
                  <p className="text-white/40 text-xs">Description</p>
                  <p className="text-white/60 text-sm">{project.description}</p>
                </div>
              )}
              <div>
                <p className="text-white/40 text-xs">Client</p>
                <Link
                  href={`/admin/clients/${project.client.id}`}
                  className="text-[#00b8fd] hover:underline text-sm"
                >
                  {project.client.name}
                </Link>
                {project.client.business && (
                  <p className="text-white/40 text-xs">{project.client.business}</p>
                )}
              </div>
              <div>
                <p className="text-white/40 text-xs">Status</p>
                <p className="text-white text-sm capitalize">{project.status.replace("-", " ")}</p>
              </div>
              <div>
                <p className="text-white/40 text-xs">Timeline</p>
                <p className="text-white/60 text-sm">
                  Started {formatDate(project.startDate)}
                  {project.endDate && ` • Ends ${formatDate(project.endDate)}`}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
            <h3 className="text-white font-semibold text-sm mb-4">Financial Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <span className="text-white/60 text-sm">Total Revenue</span>
                <span className="text-[#00b8fd] font-bold">
                  {formatCurrency(totalRevenue)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <span className="text-white/60 text-sm">Monthly Recurring Revenue</span>
                <span className="text-emerald-400 font-bold">
                  {formatCurrency(mrr)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <span className="text-white/60 text-sm">Total Payments</span>
                <span className="text-white font-bold">
                  {project.payments.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === "payments" && (
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <p className="text-white/40 text-sm">
              {project.payments.length} payments • Total: {formatCurrency(totalRevenue)}
            </p>
            <Link
              href={`/admin/projects/${project.id}/payments/new`}
              className="px-4 py-2 rounded-xl bg-[#0068e3] hover:bg-[#0068e3]/80 text-white text-sm transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Add Payment
            </Link>
          </div>
          <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead className="border-b border-white/10">
                  <tr className="text-left text-white/40 text-xs uppercase tracking-wider">
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {project.payments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-white/40">
                        No payments recorded. Click "Add Payment" to add one.
                      </td>
                    </tr>
                  ) : (
                    project.payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-[#00b8fd] font-medium">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-4 py-3 text-white/60 text-sm">
                          {formatDate(payment.paymentDate)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            payment.status === "paid" ? "bg-emerald-500/20 text-emerald-400" :
                            payment.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                            "bg-red-500/20 text-red-400"
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white/60 text-sm capitalize">
                          {payment.method?.replace("_", " ") || "-"}
                        </td>
                        <td className="px-4 py-3 text-white/40 text-sm">
                          {payment.reference || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Recurring Tab */}
      {activeTab === "recurring" && (
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <p className="text-white/40 text-sm">
              {project.recurringPayments.filter(rp => rp.status === "active").length} active recurring payments
            </p>
            <Link
              href={`/admin/projects/${project.id}/recurring/new`}
              className="px-4 py-2 rounded-xl bg-[#0068e3] hover:bg-[#0068e3]/80 text-white text-sm transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Add Recurring
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.recurringPayments.length === 0 ? (
              <div className="col-span-2 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-12 text-center text-white/40">
                <Clock size={32} className="mx-auto mb-3 text-white/20" />
                <p>No recurring payments</p>
              </div>
            ) : (
              project.recurringPayments.map((rp) => (
                <div key={rp.id} className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white font-medium">{formatCurrency(rp.amount)}</p>
                      <p className="text-white/40 text-sm capitalize">{rp.frequency}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      rp.status === "active" ? "bg-emerald-500/20 text-emerald-400" :
                      rp.status === "paused" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>
                      {rp.status}
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-white/30 text-xs">Next Payment</p>
                    <p className="text-white/60 text-sm">{formatDate(rp.nextPaymentDate)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === "notes" && (
        <div>
          <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
            <h3 className="text-white font-semibold text-sm mb-4">Project Notes</h3>
            {project.notes ? (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-white/60 text-sm whitespace-pre-wrap">{project.notes}</p>
              </div>
            ) : (
              <div className="text-center text-white/40 py-8">
                <FileText size={24} className="mx-auto mb-2 text-white/20" />
                <p>No notes for this project</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}