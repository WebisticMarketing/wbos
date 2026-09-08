// app/admin/wbos/[businessId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Users,
  Mail,
  Phone,
  MapPin,
  Globe,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Key,
  Trash2,
  Activity,
  UserCheck,
  Clock,
} from "lucide-react";

interface Business {
  id: string;
  name: string;
  logo: string;
  industry: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  currency: string;
  timezone: string;
  status: string;
  createdAt: string;
  client: {
    id: string;
    name: string;
    email: string;
    whatsapp: string;
  };
  _count: {
    users: number;
  };
  users: Array<{
    id: string;
    name: string;
    email: string;
    status: string;
    roles: Array<{
      role: {
        name: string;
      };
    }>;
  }>;
  modules: Array<{
    moduleKey: string;
    enabled: boolean;
  }>;
}

interface AuditLog {
  id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  details: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: { name: string; email: string } | null;
  admin: { name: string; email: string } | null;
}

export default function BusinessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "audit">("overview");

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const businessId = params.businessId as string;

  // ------------------------
  // Fetch business data
  // ------------------------
  const fetchBusiness = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("admin-token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const url = `/api/admin/wbos/businesses/${businessId}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Read the response body once as text
      const responseText = await res.text();
      let parsedData: any = null;
      try {
        parsedData = JSON.parse(responseText);
      } catch {
        // If parsing fails, keep parsedData as null
      }

      if (!res.ok) {
        const errorMsg =
          parsedData?.error ||
          parsedData?.message ||
          responseText ||
          `Request failed with status ${res.status}`;
        throw new Error(errorMsg);
      }

      setBusiness(parsedData);
    } catch (err: any) {
      console.error("❌ fetchBusiness error:", err);
      setError(err.message || "Failed to load business. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------
  // Fetch audit logs
  // ------------------------
  const fetchAuditLogs = async () => {
    setLoadingAudit(true);
    setError("");
    try {
      const token = localStorage.getItem("admin-token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const res = await fetch(
        `/api/admin/wbos/businesses/${businessId}/audit-logs`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const responseText = await res.text();
      let parsedData: any = null;
      try {
        parsedData = JSON.parse(responseText);
      } catch {
        // keep null
      }

      if (!res.ok) {
        const errorMsg =
          parsedData?.error ||
          parsedData?.message ||
          responseText ||
          `Failed to fetch audit logs (status ${res.status})`;
        throw new Error(errorMsg);
      }

      setAuditLogs(parsedData);
    } catch (err: any) {
      console.error("Audit log fetch error:", err);
      setError(err.message || "Failed to load audit logs");
    } finally {
      setLoadingAudit(false);
    }
  };

  // ------------------------
  // Update business status
  // ------------------------
  const updateStatus = async (status: string) => {
    setUpdatingStatus(true);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("admin-token");
      const res = await fetch(`/api/admin/wbos/businesses/${businessId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const responseText = await res.text();
      let parsedData: any = null;
      try {
        parsedData = JSON.parse(responseText);
      } catch {}

      if (!res.ok) {
        const errorMsg =
          parsedData?.error ||
          parsedData?.message ||
          responseText ||
          "Failed to update status";
        throw new Error(errorMsg);
      }

      setSuccess(
        `Business ${status === "active" ? "activated" : status === "suspended" ? "suspended" : "archived"} successfully`
      );
      await fetchBusiness();
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ------------------------
  // Reset user password
  // ------------------------
  const resetPassword = async (userId: string, userEmail: string) => {
    const newPassword = prompt(`Enter new password for ${userEmail}:`, "newpass123");
    if (!newPassword) return;
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    setActionLoading(userId);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("admin-token");
      const res = await fetch("/api/admin/wbos/users/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, newPassword }),
      });

      const responseText = await res.text();
      let parsedData: any = null;
      try {
        parsedData = JSON.parse(responseText);
      } catch {}

      if (!res.ok) {
        const errorMsg =
          parsedData?.error ||
          parsedData?.message ||
          responseText ||
          "Failed to reset password";
        throw new Error(errorMsg);
      }

      setSuccess(`Password reset for ${userEmail}`);
      await fetchBusiness();
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setActionLoading(null);
    }
  };

  // ------------------------
  // Remove user from business
  // ------------------------
  const removeUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to remove ${userEmail} from this business?`)) return;

    setActionLoading(userId);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("admin-token");
      const res = await fetch(`/api/admin/wbos/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const responseText = await res.text();
      let parsedData: any = null;
      try {
        parsedData = JSON.parse(responseText);
      } catch {}

      if (!res.ok) {
        const errorMsg =
          parsedData?.error ||
          parsedData?.message ||
          responseText ||
          "Failed to remove user";
        throw new Error(errorMsg);
      }

      setSuccess(`User ${userEmail} removed from business`);
      await fetchBusiness();
    } catch (err: any) {
      setError(err.message || "Failed to remove user");
    } finally {
      setActionLoading(null);
    }
  };

  // ------------------------
  // Tab switching
  // ------------------------
  const handleTabChange = (tab: "overview" | "audit") => {
    setActiveTab(tab);
    if (tab === "audit" && auditLogs.length === 0 && !loadingAudit) {
      fetchAuditLogs();
    }
  };

  // ------------------------
  // Initial load
  // ------------------------
  useEffect(() => {
    fetchBusiness();
  }, [businessId]);

  // ------------------------
  // Helpers
  // ------------------------
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
            <CheckCircle className="w-3 h-3" /> Active
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
            <XCircle className="w-3 h-3" /> Suspended
          </span>
        );
      case "archived":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 text-white/40 text-xs rounded-full">
            <AlertCircle className="w-3 h-3" /> Archived
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-white/5 text-white/40 text-xs rounded-full">
            {status}
          </span>
        );
    }
  };

  const activeUsers = business?.users?.filter((u) => u.status === "active").length || 0;

  // ------------------------
  // Render
  // ------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0068e3]" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="text-center py-12">
        <p className="text-white/40">Business not found</p>
        <Link href="/admin/wbos" className="text-[#0068e3] hover:underline">
          Back to businesses
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/wbos"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white/40" />
          </Link>
          <div className="flex items-center gap-3">
            {business.logo ? (
              <img
                src={business.logo}
                alt={business.name}
                className="w-12 h-12 rounded-lg object-cover border border-white/10"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-400" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white">{business.name}</h1>
              <p className="text-sm text-white/40">{business.industry}</p>
            </div>
          </div>
        </div>
        <Link
          href={`/admin/wbos/${business.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 border border-white/10 text-white/60 rounded-lg hover:bg-white/5 transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit
        </Link>
      </div>

      {/* Error / Success Messages */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-400">
          {success}
        </div>
      )}

      {/* Status & Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {getStatusBadge(business.status)}
        <div className="flex flex-wrap gap-2">
          {business.status !== "active" && (
            <button
              onClick={() => updateStatus("active")}
              disabled={updatingStatus}
              className="px-3 py-1 text-sm bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
            >
              Activate
            </button>
          )}
          {business.status !== "suspended" && business.status !== "archived" && (
            <button
              onClick={() => updateStatus("suspended")}
              disabled={updatingStatus}
              className="px-3 py-1 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
            >
              Suspend
            </button>
          )}
          {business.status !== "archived" && (
            <button
              onClick={() => updateStatus("archived")}
              disabled={updatingStatus}
              className="px-3 py-1 text-sm bg-white/5 text-white/40 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              Archive
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-green-400" />
            <span className="text-sm text-white/40">Active Users</span>
          </div>
          <p className="text-2xl font-bold text-white">{activeUsers}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-white/40">Total Users</span>
          </div>
          <p className="text-2xl font-bold text-white">{business._count?.users || 0}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-white/40">Modules</span>
          </div>
          <p className="text-2xl font-bold text-white">{business.modules?.length || 0}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-white/40">Created</span>
          </div>
          <p className="text-sm font-medium text-white">
            {new Date(business.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => handleTabChange("overview")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "overview"
              ? "border-b-2 border-blue-500 text-blue-400"
              : "text-white/40 hover:text-white/60"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => handleTabChange("audit")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "audit"
              ? "border-b-2 border-blue-500 text-blue-400"
              : "text-white/40 hover:text-white/60"
          }`}
        >
          Audit Logs
        </button>
      </div>

      {/* Tab Content: Overview */}
      {activeTab === "overview" && (
        <>
          {/* Business Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h3 className="text-sm font-medium text-white/40 mb-3">
                Business Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-white/30" />
                  <span className="text-white/60">{business.email || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-white/30" />
                  <span className="text-white/60">{business.phone || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-white/30" />
                  <span className="text-white/60">{business.address || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-white/30" />
                  <span className="text-white/60">{business.website || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-white/30" />
                  <span className="text-white/60">Currency: {business.currency}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h3 className="text-sm font-medium text-white/40 mb-3">Client</h3>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-white">{business.client?.name || "—"}</p>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-white/30" />
                  <span className="text-white/60">{business.client?.email || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-white/30" />
                  <span className="text-white/60">{business.client?.whatsapp || "—"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Users */}
          <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-medium text-white flex items-center gap-2">
                <Users className="w-4 h-4" />
                Users
              </h3>
              <span className="text-sm text-white/40">
                {business._count?.users || 0} total
              </span>
            </div>
            <div className="divide-y divide-white/5">
              {business.users?.length === 0 ? (
                <div className="px-6 py-4 text-sm text-white/40">No users yet</div>
              ) : (
                business.users?.map((user) => (
                  <div
                    key={user.id}
                    className="px-6 py-3 flex items-center justify-between hover:bg-white/5"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-sm text-white/40">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-white/40">
                          {user.roles?.map((r) => r.role.name).join(", ") || "No role"}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            user.status === "active"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-white/5 text-white/40"
                          }`}
                        >
                          {user.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => resetPassword(user.id, user.email)}
                        disabled={actionLoading === user.id}
                        className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Reset Password"
                      >
                        {actionLoading === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Key className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => removeUser(user.id, user.email)}
                        disabled={actionLoading === user.id}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Remove User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Tab Content: Audit Logs */}
      {activeTab === "audit" && (
        <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-medium text-white flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Audit Logs
            </h3>
            <span className="text-sm text-white/40">Latest 100 actions</span>
          </div>
          <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
            {loadingAudit ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[#0068e3]" />
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="px-6 py-8 text-center text-white/40">
                <Activity className="w-10 h-10 mx-auto mb-3 text-white/20" />
                <p>No audit logs yet</p>
                <p className="text-sm text-white/30">
                  Actions will appear here as users interact
                </p>
              </div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="px-6 py-3 hover:bg-white/5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-white">
                          {log.user?.name || log.admin?.name || "System"}
                        </span>
                        <span className="text-xs text-white/30">
                          {log.user ? "(User)" : log.admin ? "(Admin)" : ""}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                          {log.action}
                        </span>
                        {log.entityType && (
                          <span className="text-xs text-white/40">
                            {log.entityType} #{log.entityId}
                          </span>
                        )}
                      </div>
                      {log.details && (
                        <div className="mt-1 text-xs text-white/40 font-mono bg-white/5 p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </div>
                      )}
                      {log.ipAddress && (
                        <div className="mt-1 text-xs text-white/30">
                          IP: {log.ipAddress} •{" "}
                          {log.userAgent?.substring(0, 80)}...
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-white/30 whitespace-nowrap ml-4">
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}