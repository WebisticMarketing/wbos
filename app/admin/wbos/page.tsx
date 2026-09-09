// app/admin/wbos/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Building2,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Settings,
  Eye,
} from "lucide-react";

interface Business {
  id: string;
  name: string;
  logo: string;
  industry: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  clientId?: string;
  client: {
    id?: string;
    name: string;
    email: string;
  };
  _count: {
    users: number;
  };
}

export default function AdminWbosPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const token = localStorage.getItem("admin-token");
      const res = await fetch("/api/admin/wbos/businesses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setBusinesses(data);
    } catch (error) {
      console.error("Error fetching businesses:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBusinesses = businesses.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.email?.toLowerCase().includes(search.toLowerCase()) ||
    b.client?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"><CheckCircle className="w-3 h-3" /> Active</span>;
      case "suspended":
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full"><XCircle className="w-3 h-3" /> Suspended</span>;
      case "archived":
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"><AlertCircle className="w-3 h-3" /> Archived</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">WBOS Businesses</h1>
          <p className="text-sm text-white/40">Manage all businesses on the platform</p>
        </div>
        <Link
          href="/admin/wbos/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0068e3] to-[#00b8fd] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          New Business
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          placeholder="Search businesses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0068e3] focus:ring-1 focus:ring-[#0068e3]"
        />
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Business</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Industry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Users</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white/40 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredBusinesses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-white/40">
                    No businesses found. Create your first business.
                  </td>
                </tr>
              ) : (
                filteredBusinesses.map((business) => {
                  // Use clientId if business.id is missing or invalid
                  const linkId = business.clientId && (!business.id || business.id.startsWith('client_')) 
                    ? business.clientId 
                    : business.id;
                  
                  return (
                    <tr key={business.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {business.logo ? (
                            <img
                              src={business.logo}
                              alt={business.name}
                              className="w-8 h-8 rounded object-cover border border-white/10"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-blue-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-white">{business.name}</p>
                            <p className="text-sm text-white/40">{business.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-white">{business.client?.name || "—"}</p>
                        <p className="text-sm text-white/40">{business.client?.email || "—"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-white/5 text-white/60 text-xs rounded-md capitalize">
                          {business.industry || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-white/60">
                          <Users className="w-4 h-4" />
                          {business._count?.users || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(business.status)}</td>
                      <td className="px-6 py-4 text-sm text-white/40">
                        {new Date(business.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/wbos/${linkId}`}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Link>
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
  );
}