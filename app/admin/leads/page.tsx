// app/admin/leads/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Eye,
  Trash2,
  RefreshCw,
  Mail,
  Phone,
  Building2,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
  MoreVertical,
  X,
  Plus,
  Save,
  User,
  Briefcase,
  Globe,
  LayoutGrid,
} from "lucide-react";

interface Lead {
  id: string;
  name: string | null;
  business: string | null;
  email: string | null;
  whatsapp: string | null;
  service: string | null;
  source: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  goal: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
  contacted: "bg-yellow-500/20 text-yellow-400 border-yellow-500/20",
  qualified: "bg-blue-500/20 text-blue-400 border-blue-500/20",
  consultation: "bg-purple-500/20 text-purple-400 border-purple-500/20",
  proposal: "bg-indigo-500/20 text-indigo-400 border-indigo-500/20",
  negotiation: "bg-orange-500/20 text-orange-400 border-orange-500/20",
  converted: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
  won: "bg-green-500/20 text-green-400 border-green-500/20",
  lost: "bg-red-500/20 text-red-400 border-red-500/20",
  "not-interested": "bg-gray-500/20 text-gray-400 border-gray-500/20",
  unqualified: "bg-gray-500/20 text-gray-400 border-gray-500/20",
};

const STATUS_OPTIONS = [
  "new",
  "contacted",
  "qualified",
  "consultation",
  "proposal",
  "negotiation",
  "converted",
  "won",
  "lost",
  "not-interested",
  "unqualified",
];

const SOURCE_OPTIONS = [
  "chatbot",
  "website",
  "google_ads",
  "google_search",
  "whatsapp",
  "social_media",
  "referral",
  "email",
  "manual",
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    business: "",
    email: "",
    whatsapp: "",
    service: "",
    source: "manual",
    status: "new",
    goal: "",
    notes: "",
  });
  const router = useRouter();

  const leadsPerPage = 20;

  useEffect(() => {
    fetchLeads();
  }, [search, statusFilter, sourceFilter, currentPage]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin-token");
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: leadsPerPage.toString(),
      });
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      if (sourceFilter) params.append("source", sourceFilter);

      const response = await fetch(`/api/admin/leads?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch leads");

      const data = await response.json();
      setLeads(data.leads || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const token = localStorage.getItem("admin-token");
      const response = await fetch("/api/admin/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create lead");

      setShowAddLeadModal(false);
      setFormData({
        name: "",
        business: "",
        email: "",
        whatsapp: "",
        service: "",
        source: "manual",
        status: "new",
        goal: "",
        notes: "",
      });
      fetchLeads();
      
      // Trigger notification refresh
      window.dispatchEvent(new Event('notification-created'));
    } catch (error) {
      console.error("Error creating lead:", error);
      alert("Failed to create lead");
    } finally {
      setCreating(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (!selectedLeads.length) return;

    if (!confirm(`Are you sure you want to ${action} ${selectedLeads.length} leads?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("admin-token");
      const response = await fetch("/api/admin/leads/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ leadIds: selectedLeads, action }),
      });

      if (!response.ok) throw new Error("Bulk action failed");

      setSelectedLeads([]);
      fetchLeads();
    } catch (error) {
      console.error("Bulk action error:", error);
      alert("Failed to perform bulk action");
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;

    try {
      const token = localStorage.getItem("admin-token");
      const response = await fetch(`/api/admin/leads/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete lead");
      fetchLeads();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete lead");
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const color = STATUS_COLORS[status] || "bg-white/10 text-white/60";
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${color}`}>
        {status.replace("-", " ")}
      </span>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-white/50 text-sm">Manage and track all your leads</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowAddLeadModal(true)}
            className="px-4 py-2 rounded-xl bg-[#0068e3] hover:bg-[#0068e3]/80 text-white text-sm transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add Lead
          </button>
          <Link
            href="/admin/leads/pipeline"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-colors flex items-center gap-2"
          >
            <LayoutGrid size={16} />
            Pipeline
          </Link>
          <button
            onClick={fetchLeads}
            disabled={loading}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#0068e3] transition-colors text-sm"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <button
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors text-sm"
          >
            <Filter size={14} />
            {statusFilter || "All Status"}
            <ChevronDown size={14} />
          </button>
          {showStatusDropdown && (
            <div className="absolute top-full left-0 mt-1 w-48 rounded-xl bg-[#0b1120] border border-white/10 shadow-xl z-50 py-1 max-h-60 overflow-y-auto">
              <button
                onClick={() => { setStatusFilter(""); setShowStatusDropdown(false); }}
                className="w-full px-4 py-2 text-left text-white/60 hover:text-white hover:bg-white/5 text-sm"
              >
                All Status
              </button>
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  onClick={() => { setStatusFilter(status); setShowStatusDropdown(false); }}
                  className="w-full px-4 py-2 text-left text-white/60 hover:text-white hover:bg-white/5 text-sm capitalize"
                >
                  {status.replace("-", " ")}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Source Filter */}
        <div className="relative">
          <button
            onClick={() => setShowSourceDropdown(!showSourceDropdown)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors text-sm"
          >
            <Filter size={14} />
            {sourceFilter || "All Sources"}
            <ChevronDown size={14} />
          </button>
          {showSourceDropdown && (
            <div className="absolute top-full left-0 mt-1 w-48 rounded-xl bg-[#0b1120] border border-white/10 shadow-xl z-50 py-1 max-h-60 overflow-y-auto">
              <button
                onClick={() => { setSourceFilter(""); setShowSourceDropdown(false); }}
                className="w-full px-4 py-2 text-left text-white/60 hover:text-white hover:bg-white/5 text-sm"
              >
                All Sources
              </button>
              {SOURCE_OPTIONS.map((source) => (
                <button
                  key={source}
                  onClick={() => { setSourceFilter(source); setShowSourceDropdown(false); }}
                  className="w-full px-4 py-2 text-left text-white/60 hover:text-white hover:bg-white/5 text-sm capitalize"
                >
                  {source.replace("_", " ")}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedLeads.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-sm">
              {selectedLeads.length} selected
            </span>
            <select
              value={bulkAction}
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkAction(e.target.value);
                  setBulkAction("");
                }
              }}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#0068e3]"
            >
              <option value="">Bulk Action</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  Set to {status.replace("-", " ")}
                </option>
              ))}
              <option value="delete">Delete</option>
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr className="text-left text-white/40 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedLeads.length === leads.length && leads.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLeads(leads.map(l => l.id));
                      } else {
                        setSelectedLeads([]);
                      }
                    }}
                    className="rounded bg-white/10 border-white/20 text-[#0068e3] focus:ring-[#0068e3]"
                  />
                </th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Business</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-white/40">
                    Loading leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-white/40">
                    No leads found. {search || statusFilter || sourceFilter ? "Try adjusting your filters." : "Click 'Add Lead' to manually add a lead."}
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLeads([...selectedLeads, lead.id]);
                          } else {
                            setSelectedLeads(selectedLeads.filter(id => id !== lead.id));
                          }
                        }}
                        className="rounded bg-white/10 border-white/20 text-[#0068e3] focus:ring-[#0068e3]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="text-white hover:text-[#00b8fd] transition-colors font-medium"
                      >
                        {lead.name || "Unknown"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-white/60 text-sm">
                      {lead.business || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        {lead.email && (
                          <span className="text-white/60 text-xs flex items-center gap-1">
                            <Mail size={12} />
                            {lead.email}
                          </span>
                        )}
                        {lead.whatsapp && (
                          <span className="text-white/60 text-xs flex items-center gap-1">
                            <Phone size={12} />
                            {lead.whatsapp}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/60 text-sm">
                      {lead.service || "-"}
                    </td>
                    <td className="px-4 py-3 text-white/60 text-sm capitalize">
                      {lead.source.replace("_", " ")}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(lead.status)}
                    </td>
                    <td className="px-4 py-3 text-white/40 text-sm">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <span className="text-white/40 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      {showAddLeadModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-[#0b1120] border border-white/10 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Add New Lead</h2>
              <button
                onClick={() => setShowAddLeadModal(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-sm mb-1.5">
                    Name *
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0b1120] border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-1.5">
                    Business
                  </label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      value={formData.business}
                      onChange={(e) => setFormData({ ...formData, business: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0b1120] border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                      placeholder="Acme Corp"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-sm mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0b1120] border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-1.5">
                    WhatsApp
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0b1120] border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                      placeholder="+44 1234 567890"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-sm mb-1.5">
                    Service
                  </label>
                  <div className="relative">
                    <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0b1120] border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                      placeholder="SEO, Website Design, etc."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-1.5">
                    Source *
                  </label>
                  <div className="relative">
                    <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <select
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0b1120] border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                    >
                      {SOURCE_OPTIONS.map((source) => (
                        <option key={source} value={source}>
                          {source.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-sm mb-1.5">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[#0b1120] border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status.replace("-", " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-1.5">
                    Goal
                  </label>
                  <input
                    type="text"
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[#0b1120] border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                    placeholder="e.g., Increase website traffic"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-1.5">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 rounded-xl bg-[#0b1120] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#0068e3] transition-colors resize-none"
                  placeholder="Any additional notes about this lead..."
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <button
                  type="submit"
                  disabled={creating || !formData.name}
                  className="px-6 py-2.5 rounded-xl bg-[#0068e3] hover:bg-[#0068e3]/80 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Save size={16} />
                  {creating ? "Creating..." : "Add Lead"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}