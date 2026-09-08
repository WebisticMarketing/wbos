// app/admin/clients/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Eye,
  Plus,
  RefreshCw,
  Building2,
  Calendar,
  DollarSign,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Mail,
  Phone,
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
  totalRevenue: number;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
  completed: "bg-blue-500/20 text-blue-400 border-blue-500/20",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/20",
};

const STATUS_OPTIONS = ["active", "completed", "cancelled"];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [serviceFilter, setServiceFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const router = useRouter();

  const clientsPerPage = 20;

  useEffect(() => {
    fetchClients();
  }, [search, statusFilter, serviceFilter, currentPage]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin-token");
      
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      if (serviceFilter) params.append("service", serviceFilter);

      const response = await fetch(`/api/admin/clients?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch clients");

      const data = await response.json();
      setClients(data.clients || []);
      setTotalPages(Math.ceil((data.clients || []).length / clientsPerPage));
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const color = STATUS_COLORS[status] || "bg-white/10 text-white/60";
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${color}`}>
        {status}
      </span>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Client-side pagination
  const startIndex = (currentPage - 1) * clientsPerPage;
  const endIndex = startIndex + clientsPerPage;
  const paginatedClients = clients.slice(startIndex, endIndex);

  // Get unique services for filter
  const services = [...new Set(clients.map(c => c.service).filter(Boolean))];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="text-white/50 text-sm">
            {clients.length} total clients • {clients.filter(c => c.status === "active").length} active
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/clients/new"
            className="px-4 py-2 rounded-xl bg-[#0068e3] hover:bg-[#0068e3]/80 text-white text-sm transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add Client
          </Link>
          <button
            onClick={fetchClients}
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
            placeholder="Search clients..."
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
            <div className="absolute top-full left-0 mt-1 w-48 rounded-xl bg-[#0b1120] border border-white/10 shadow-xl z-50 py-1">
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
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Service Filter */}
        {services.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowServiceDropdown(!showServiceDropdown)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors text-sm"
            >
              <Filter size={14} />
              {serviceFilter || "All Services"}
              <ChevronDown size={14} />
            </button>
            {showServiceDropdown && (
              <div className="absolute top-full left-0 mt-1 w-48 rounded-xl bg-[#0b1120] border border-white/10 shadow-xl z-50 py-1 max-h-60 overflow-y-auto">
                <button
                  onClick={() => { setServiceFilter(""); setShowServiceDropdown(false); }}
                  className="w-full px-4 py-2 text-left text-white/60 hover:text-white hover:bg-white/5 text-sm"
                >
                  All Services
                </button>
                {services.map((service) => (
                  <button
                    key={service}
                    onClick={() => { setServiceFilter(service); setShowServiceDropdown(false); }}
                    className="w-full px-4 py-2 text-left text-white/60 hover:text-white hover:bg-white/5 text-sm"
                  >
                    {service}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr className="text-left text-white/40 text-xs uppercase tracking-wider">
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Business</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Start Date</th>
                <th className="px-4 py-3 text-right">Total Revenue</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-white/40">
                    Loading clients...
                  </td>
                </tr>
              ) : paginatedClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-white/40">
                    {search || statusFilter || serviceFilter ? "No clients match your filters." : "No clients yet. Convert leads to clients or add manually."}
                  </td>
                </tr>
              ) : (
                paginatedClients.map((client) => (
                  <tr
                    key={client.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="text-white hover:text-[#00b8fd] transition-colors font-medium"
                      >
                        {client.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        {client.email && (
                          <span className="text-white/40 text-xs flex items-center gap-1">
                            <Mail size={10} />
                            {client.email}
                          </span>
                        )}
                        {client.whatsapp && (
                          <span className="text-white/40 text-xs flex items-center gap-1">
                            <Phone size={10} />
                            {client.whatsapp}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/60 text-sm">
                      {client.business || "-"}
                    </td>
                    <td className="px-4 py-3 text-white/60 text-sm">
                      {client.service}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(client.status)}
                    </td>
                    <td className="px-4 py-3 text-white/40 text-sm">
                      {formatDate(client.startDate)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[#00b8fd] font-medium">
                        £{client.totalRevenue.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors inline-block"
                      >
                        <Eye size={16} />
                      </Link>
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
              Showing {startIndex + 1} - {Math.min(endIndex, clients.length)} of {clients.length}
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
    </div>
  );
}