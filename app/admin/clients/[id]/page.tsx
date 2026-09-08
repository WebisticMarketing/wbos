// app/admin/clients/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Calendar,
  DollarSign,
  RefreshCw,
  Edit,
  Plus,
  FolderKanban,
  CreditCard,
  FileText,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  PlayCircle,
  Check,
  ChevronRight,
  Trash2,
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string | null;
  whatsapp: string | null;
  business: string | null;
  service: string;
  status: string;
  startDate: string;
  endDate: string | null;
  notes: string | null;
  totalRevenue: number;
  projects: Array<{
    id: string;
    name: string;
    service: string;
    status: string;
    startDate: string;
    endDate: string | null;
    totalRevenue: number;
    mrr: number;
  }>;
  payments: Array<{
    id: string;
    amount: number;
    paymentDate: string;
    status: string;
    method: string | null;
    reference: string | null;
    project: {
      id: string;
      name: string;
      service: string;
    } | null;
  }>;
  revenues: Array<{
    id: string;
    amount: number;
    description: string | null;
    date: string;
  }>;
}

interface OnboardingStep {
  id: string;
  stepId: string;
  status: string;
  completedAt: string | null;
  notes: string | null;
  step: {
    id: string;
    stepNumber: number;
    title: string;
    description: string | null;
    isRequired: boolean;
  };
}

interface OnboardingData {
  onboarding: {
    id: string;
    status: string;
    startedAt: string;
    completedAt: string | null;
    steps: OnboardingStep[];
    template: {
      name: string;
    };
  };
  progress: number;
  totalSteps: number;
  completedSteps: number;
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
  completed: "bg-blue-500/20 text-blue-400 border-blue-500/20",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/20",
};

const PROJECT_STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-400",
  completed: "bg-blue-500/20 text-blue-400",
  cancelled: "bg-red-500/20 text-red-400",
  "on-hold": "bg-yellow-500/20 text-yellow-400",
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  paid: "bg-emerald-500/20 text-emerald-400",
  pending: "bg-yellow-500/20 text-yellow-400",
  overdue: "bg-red-500/20 text-red-400",
};

const STEP_STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-500/20 text-gray-400",
  "in-progress": "bg-yellow-500/20 text-yellow-400",
  completed: "bg-emerald-500/20 text-emerald-400",
  skipped: "bg-gray-500/20 text-gray-500",
};

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "projects" | "payments" | "notes" | "onboarding">("overview");
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [updatingStep, setUpdatingStep] = useState<string | null>(null);

  useEffect(() => {
    fetchClient();
  }, [id]);

  useEffect(() => {
    if (activeTab === "onboarding") {
      fetchOnboarding();
    }
  }, [activeTab, id]);

  const fetchClient = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin-token");
      const response = await fetch(`/api/admin/clients/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 404) {
          router.push("/admin/clients");
          return;
        }
        throw new Error("Failed to fetch client");
      }

      const data = await response.json();
      setClient(data.client);
    } catch (error) {
      console.error("Error fetching client:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOnboarding = async () => {
    try {
      setOnboardingLoading(true);
      const token = localStorage.getItem("admin-token");
      const response = await fetch(`/api/admin/clients/${id}/onboarding`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setOnboardingData(data);
      } else {
        console.error("Failed to fetch onboarding");
      }
    } catch (error) {
      console.error("Error fetching onboarding:", error);
    } finally {
      setOnboardingLoading(false);
    }
  };

  const updateStepStatus = async (stepId: string, status: string) => {
    try {
      setUpdatingStep(stepId);
      const token = localStorage.getItem("admin-token");
      const response = await fetch(`/api/admin/clients/${id}/onboarding`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stepId, status }),
      });

      if (response.ok) {
        await fetchOnboarding();
      }
    } catch (error) {
      console.error("Error updating step:", error);
    } finally {
      setUpdatingStep(null);
    }
  };

  const handleDeleteClient = async () => {
    if (!confirm(`Are you sure you want to delete "${client?.name}"? This will also delete all projects, payments, and tasks associated with this client. This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem("admin-token");
      const response = await fetch(`/api/admin/clients/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete client");
      router.push("/admin/clients");
    } catch (error) {
      console.error("Error deleting client:", error);
      alert("Failed to delete client");
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm("Are you sure you want to delete this payment?")) return;

    try {
      const token = localStorage.getItem("admin-token");
      const response = await fetch(`/api/admin/clients/${id}/payments`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentId }),
      });

      if (!response.ok) throw new Error("Failed to delete payment");
      fetchClient();
    } catch (error) {
      console.error("Error deleting payment:", error);
      alert("Failed to delete payment");
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return `£${amount.toFixed(2)}`;
  };

  const getStatusBadge = (status: string, colors: Record<string, string>) => {
    const color = colors[status] || "bg-white/10 text-white/60";
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
        {status}
      </span>
    );
  };

  const getStepStatusBadge = (status: string) => {
    const color = STEP_STATUS_COLORS[status] || "bg-gray-500/20 text-gray-400";
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/60">Loading client details...</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/60">Client not found</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/clients"
            className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{client.name}</h1>
            <p className="text-white/50 text-sm flex items-center gap-2 flex-wrap">
              {client.business || "No business"} • {client.service}
              {getStatusBadge(client.status, STATUS_COLORS)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href={`/admin/clients/${id}/edit`}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-colors flex items-center gap-2"
          >
            <Edit size={16} />
            Edit
          </Link>
          <button
            onClick={handleDeleteClient}
            className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm transition-colors flex items-center gap-2"
          >
            <Trash2 size={16} />
            Delete Client
          </button>
          <button
            onClick={fetchClient}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
          <p className="text-white/40 text-xs">Total Revenue</p>
          <p className="text-xl font-bold text-[#00b8fd]">
            {formatCurrency(client.totalRevenue)}
          </p>
        </div>
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
          <p className="text-white/40 text-xs">Projects</p>
          <p className="text-xl font-bold text-white">
            {client.projects.length}
          </p>
        </div>
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
          <p className="text-white/40 text-xs">Payments</p>
          <p className="text-xl font-bold text-white">
            {client.payments.length}
          </p>
        </div>
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
          <p className="text-white/40 text-xs">Monthly Revenue</p>
          <p className="text-xl font-bold text-emerald-400">
            {formatCurrency(client.projects.reduce((sum, p) => sum + (p.mrr || 0), 0))}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-white/10 overflow-x-auto">
        {[
          { id: "overview", label: "Overview", icon: FileText },
          { id: "projects", label: "Projects", icon: FolderKanban },
          { id: "payments", label: "Payments", icon: CreditCard },
          { id: "onboarding", label: "Onboarding", icon: PlayCircle },
          { id: "notes", label: "Notes", icon: MessageSquare },
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

      {/* Tab Content */}
      <div>
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
              <h3 className="text-white font-semibold text-sm mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <User size={14} className="text-white/30" />
                  <span>{client.name}</span>
                </div>
                {client.email && (
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Mail size={14} className="text-white/30" />
                    <a href={`mailto:${client.email}`} className="hover:text-[#00b8fd] transition-colors">
                      {client.email}
                    </a>
                  </div>
                )}
                {client.whatsapp && (
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Phone size={14} className="text-white/30" />
                    <a href={`https://wa.me/${client.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#00b8fd] transition-colors">
                      {client.whatsapp}
                    </a>
                  </div>
                )}
                {client.business && (
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Building2 size={14} className="text-white/30" />
                    <span>{client.business}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-white/40 text-sm">
                  <Calendar size={14} className="text-white/30" />
                  <span>Client since {formatDate(client.startDate)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
              <h3 className="text-white font-semibold text-sm mb-4">Service Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-white/40 text-xs">Service</p>
                  <p className="text-white text-sm">{client.service}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs">Status</p>
                  <p className="text-white text-sm capitalize">{client.status}</p>
                </div>
                {client.endDate && (
                  <div>
                    <p className="text-white/40 text-xs">End Date</p>
                    <p className="text-white text-sm">{formatDate(client.endDate)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === "projects" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-white/40 text-sm">Showing {client.projects.length} projects</p>
              <Link
                href={`/admin/clients/${client.id}/projects/new`}
                className="px-4 py-2 rounded-xl bg-[#0068e3] hover:bg-[#0068e3]/80 text-white text-sm transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                Add Project
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {client.projects.length === 0 ? (
                <div className="col-span-2 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-12 text-center text-white/40">
                  <FolderKanban size={32} className="mx-auto mb-3 text-white/20" />
                  <p>No projects yet</p>
                  <p className="text-sm text-white/20">Add a project to get started</p>
                </div>
              ) : (
                client.projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/admin/projects/${project.id}`}
                    className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-white font-medium">{project.name}</h4>
                        <p className="text-white/40 text-sm">{project.service}</p>
                      </div>
                      {getStatusBadge(project.status, PROJECT_STATUS_COLORS)}
                    </div>
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10">
                      <div>
                        <p className="text-white/30 text-xs">Revenue</p>
                        <p className="text-[#00b8fd] font-medium">
                          {formatCurrency(project.totalRevenue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/30 text-xs">MRR</p>
                        <p className="text-emerald-400 font-medium">
                          {formatCurrency(project.mrr || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/30 text-xs">Started</p>
                        <p className="text-white/60 text-sm">
                          {formatDate(project.startDate)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-white/40 text-sm">
                {client.payments.length} payments • Total: {formatCurrency(client.totalRevenue)}
              </p>
              <Link
                href={`/admin/clients/${client.id}/payments/new`}
                className="px-4 py-2 rounded-xl bg-[#0068e3] hover:bg-[#0068e3]/80 text-white text-sm transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                Add Payment
              </Link>
            </div>
            <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-white/10">
                    <tr className="text-left text-white/40 text-xs uppercase tracking-wider">
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Method</th>
                      <th className="px-4 py-3">Reference</th>
                      <th className="px-4 py-3">Project</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {client.payments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-white/40">
                          No payments recorded
                        </td>
                      </tr>
                    ) : (
                      client.payments.map((payment) => (
                        <tr
                          key={payment.id}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="px-4 py-3 text-[#00b8fd] font-medium">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-4 py-3 text-white/60 text-sm">
                            {formatDate(payment.paymentDate)}
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(payment.status, PAYMENT_STATUS_COLORS)}
                          </td>
                          <td className="px-4 py-3 text-white/60 text-sm capitalize">
                            {payment.method || "-"}
                          </td>
                          <td className="px-4 py-3 text-white/40 text-sm">
                            {payment.reference || "-"}
                          </td>
                          <td className="px-4 py-3 text-white/60 text-sm">
                            {payment.project?.name || "-"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDeletePayment(payment.id)}
                              className="p-1 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
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

        {/* Onboarding Tab */}
        {activeTab === "onboarding" && (
          <div>
            {onboardingLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-white/40">Loading onboarding...</div>
              </div>
            ) : onboardingData?.onboarding ? (
              <div>
                {/* Progress Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-white font-semibold text-sm">
                      {onboardingData.onboarding.template.name}
                    </h3>
                    <p className="text-white/40 text-sm">
                      {onboardingData.completedSteps} of {onboardingData.totalSteps} steps completed
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-[#00b8fd]">
                      {onboardingData.progress}%
                    </span>
                    {onboardingData.onboarding.status === "completed" && (
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium">
                        ✅ Completed
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden mb-8">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#0068e3] to-[#00b8fd] transition-all duration-500"
                    style={{ width: `${onboardingData.progress}%` }}
                  />
                </div>

                {/* Steps List */}
                <div className="space-y-3">
                  {onboardingData.onboarding.steps.map((item) => {
                    const isCompleted = item.status === "completed";
                    const isInProgress = item.status === "in-progress";
                    const isPending = item.status === "pending";

                    return (
                      <div
                        key={item.id}
                        className={`rounded-xl border p-4 transition-all ${
                          isCompleted
                            ? "bg-emerald-500/5 border-emerald-500/20"
                            : isInProgress
                            ? "bg-yellow-500/5 border-yellow-500/20"
                            : "bg-white/5 border-white/10"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="flex-shrink-0 mt-0.5">
                              {isCompleted ? (
                                <CheckCircle size={18} className="text-emerald-400" />
                              ) : isInProgress ? (
                                <Clock size={18} className="text-yellow-400" />
                              ) : (
                                <div className="w-[18px] h-[18px] rounded-full border border-white/20" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-white font-medium text-sm">
                                  {item.step.stepNumber}. {item.step.title}
                                </span>
                                {getStepStatusBadge(item.status)}
                                {item.step.isRequired && (
                                  <span className="text-white/20 text-xs">Required</span>
                                )}
                              </div>
                              {item.step.description && (
                                <p className="text-white/40 text-sm mt-0.5">
                                  {item.step.description}
                                </p>
                              )}
                              {item.completedAt && (
                                <p className="text-white/20 text-xs mt-1">
                                  Completed: {formatDateTime(item.completedAt)}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {isPending && (
                              <button
                                onClick={() => updateStepStatus(item.stepId, "in-progress")}
                                disabled={updatingStep === item.stepId}
                                className="px-3 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 text-xs hover:bg-yellow-500/30 transition-colors disabled:opacity-50"
                              >
                                Start
                              </button>
                            )}
                            {isInProgress && (
                              <button
                                onClick={() => updateStepStatus(item.stepId, "completed")}
                                disabled={updatingStep === item.stepId}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs hover:bg-emerald-500/30 transition-colors disabled:opacity-50 flex items-center gap-1"
                              >
                                <Check size={14} />
                                Complete
                              </button>
                            )}
                            {isCompleted && (
                              <button
                                onClick={() => updateStepStatus(item.stepId, "pending")}
                                disabled={updatingStep === item.stepId}
                                className="px-3 py-1.5 rounded-lg bg-white/10 text-white/40 text-xs hover:bg-white/20 hover:text-white transition-colors disabled:opacity-50"
                              >
                                Undo
                              </button>
                            )}
                            {updatingStep === item.stepId && (
                              <span className="text-white/20 text-xs">Updating...</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-12 text-center">
                <PlayCircle size={32} className="mx-auto mb-3 text-white/20" />
                <p className="text-white/40">
                  No onboarding template found for this client's service type.
                </p>
                <p className="text-white/20 text-sm mt-1">
                  Create a template for "{client.service}" in the database.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === "notes" && (
          <div>
            <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
              <h3 className="text-white font-semibold text-sm mb-4">Client Notes</h3>
              {client.notes ? (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white/60 text-sm whitespace-pre-wrap">{client.notes}</p>
                  <p className="text-white/20 text-xs mt-2">
                    Last updated: {formatDate(client.startDate)}
                  </p>
                </div>
              ) : (
                <div className="text-center text-white/40 py-8">
                  <MessageSquare size={24} className="mx-auto mb-2 text-white/20" />
                  <p>No notes for this client</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}