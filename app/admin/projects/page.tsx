// app/admin/projects/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  RefreshCw,
  FolderKanban,
  Plus,
  Eye,
  ChevronDown,
  Building2,
  Calendar,
  DollarSign,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string | null;
  service: string;
  status: string;
  startDate: string;
  endDate: string | null;
  client: {
    id: string;
    name: string;
    business: string | null;
  };
  payments: Array<{
    amount: number;
    status: string;
  }>;
  recurringPayments: Array<{
    amount: number;
    frequency: string;
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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProjects();
  }, [search]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin-token");
      const params = new URLSearchParams();
      if (search) params.append("search", search);

      const response = await fetch(`/api/admin/projects?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch projects");

      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
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

  const getTotalRevenue = (project: Project) => {
    return project.payments.reduce((sum, p) => sum + p.amount, 0);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-white/50 text-sm">
            {projects.length} total projects
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchProjects}
            disabled={loading}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#0068e3] transition-colors text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-12 text-center">
          <div className="text-white/40">Loading projects...</div>
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-12 text-center">
          <FolderKanban size={32} className="mx-auto mb-3 text-white/20" />
          <p className="text-white/40">No projects found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const totalRevenue = getTotalRevenue(project);
            return (
              <Link
                key={project.id}
                href={`/admin/projects/${project.id}`}
                className="group rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-5 hover:bg-white/10 transition-all hover:border-white/20"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate group-hover:text-[#00b8fd] transition-colors">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-white/40 text-xs flex items-center gap-1">
                        <Building2 size={12} />
                        {project.client.name}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(project.status)}
                </div>

                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/10">
                  <div>
                    <p className="text-white/30 text-[10px] uppercase tracking-wider">Service</p>
                    <p className="text-white/60 text-sm">{project.service}</p>
                  </div>
                  <div>
                    <p className="text-white/30 text-[10px] uppercase tracking-wider">Revenue</p>
                    <p className="text-[#00b8fd] font-medium">
                      £{totalRevenue.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/10">
                  <span className="text-white/20 text-xs flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(project.startDate)}
                  </span>
                  <span className="ml-auto text-white/20 text-xs">
                    {project.payments.length} payments
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}