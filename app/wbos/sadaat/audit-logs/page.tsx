// app/wbos/sadaat/audit-logs/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Eye,
  User,
  Calendar,
  Clock,
  AlertCircle,
  Loader2,
  Activity,
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================
interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  details: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function AuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(50);

  // Actions for filter dropdown
  const [actions, setActions] = useState<string[]>([]);
  const [expandedFilter, setExpandedFilter] = useState(false);

  useEffect(() => {
    fetchActions();
    fetchLogs();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [search, action, startDate, endDate, page]);

  const fetchActions = async () => {
    try {
      const res = await fetch("/api/wbos/sadaat/audit-logs/actions");
      if (res.ok) {
        const data = await res.json();
        setActions(data);
      }
    } catch (error) {
      console.error("Error fetching actions:", error);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (action) params.append("action", action);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const res = await fetch(`/api/wbos/sadaat/audit-logs?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch audit logs");
      }

      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching logs:", error);
      setError("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchLogs();
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (action) params.append("action", action);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      params.append("limit", "1000");

      const res = await fetch(`/api/wbos/sadaat/audit-logs/export?${params.toString()}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
      }
    } catch (error) {
      console.error("Error exporting logs:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const getActionColor = (action: string) => {
    if (action.startsWith("create_")) return "text-emerald-600 bg-emerald-50";
    if (action.startsWith("update_")) return "text-blue-600 bg-blue-50";
    if (action.startsWith("delete_") || action.startsWith("cancel_")) return "text-red-600 bg-red-50";
    if (action.startsWith("login")) return "text-green-600 bg-green-50";
    if (action.startsWith("logout")) return "text-gray-600 bg-gray-50";
    return "text-purple-600 bg-purple-50";
  };

  const formatAction = (action: string) => {
    return action
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/wbos/sadaat"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-sm text-gray-500">
              Complete history of all actions in your business
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <button
          onClick={() => setExpandedFilter(!expandedFilter)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700"
        >
          <Filter className="w-4 h-4" />
          Filters
          {expandedFilter ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span className="text-xs text-gray-400 ml-2">
            {action || startDate || endDate || search ? "(Active)" : ""}
          </span>
        </button>

        {expandedFilter && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search actions, details..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="">All Actions</option>
                {actions.map((a) => (
                  <option key={a} value={a}>
                    {formatAction(a)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">
          Showing {logs.length} of {total} logs
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-500">Loading audit logs...</span>
        </div>
      )}

      {/* Logs Table */}
      {!loading && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No audit logs found</p>
              <p className="text-sm text-gray-400">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expand
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-900">{formatDate(log.createdAt)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {log.user ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="w-3 h-3 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{log.user.name}</p>
                              <p className="text-xs text-gray-400">{log.user.email}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">System</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getActionColor(log.action)}`}>
                          {formatAction(log.action)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {log.details ? (
                            Object.keys(log.details).length > 0 ? (
                              <span className="font-mono text-xs text-gray-500">
                                {JSON.stringify(log.details).slice(0, 50)}
                                {JSON.stringify(log.details).length > 50 ? "..." : ""}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => toggleExpand(log.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Expanded Detail */}
      {expandedId && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mt-4">
          {logs.find((l) => l.id === expandedId) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Log Details</h3>
                <button
                  onClick={() => setExpandedId(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">ID</p>
                  <p className="text-sm text-gray-900 font-mono">{expandedId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Action</p>
                  <p className="text-sm text-gray-900">{formatAction(logs.find((l) => l.id === expandedId)?.action || "")}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">IP Address</p>
                  <p className="text-sm text-gray-900">{logs.find((l) => l.id === expandedId)?.ipAddress || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">User Agent</p>
                  <p className="text-sm text-gray-900">{logs.find((l) => l.id === expandedId)?.userAgent || "—"}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Details</p>
                <div className="bg-white rounded-lg border border-gray-200 p-3 mt-1 overflow-auto max-h-60">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(logs.find((l) => l.id === expandedId)?.details || {}, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}