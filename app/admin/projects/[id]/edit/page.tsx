// app/admin/projects/[id]/edit/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  X,
  FolderKanban,
  Calendar,
  Briefcase,
} from "lucide-react";

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    service: "",
    status: "",
    startDate: "",
    endDate: "",
    notes: "",
  });

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem("admin-token");
      const response = await fetch(`/api/admin/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const project = data.project;
        setFormData({
          name: project.name || "",
          description: project.description || "",
          service: project.service || "",
          status: project.status || "active",
          startDate: project.startDate ? project.startDate.split("T")[0] : "",
          endDate: project.endDate ? project.endDate.split("T")[0] : "",
          notes: project.notes || "",
        });
      }
    } catch (error) {
      console.error("Error fetching project:", error);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("admin-token");
      const response = await fetch(`/api/admin/projects/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update project");

      router.push(`/admin/projects/${id}`);
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Failed to update project");
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = ["planning", "active", "review", "client-approval", "completed", "on-hold", "cancelled"];

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/admin/projects/${id}`}
          className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Project</h1>
          <p className="text-white/50 text-sm">Update project details</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-white/60 text-sm mb-1.5">Project Name *</label>
              <div className="relative">
                <FolderKanban size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0b1120] border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-1.5">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 rounded-xl bg-[#0b1120] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#0068e3] transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-1.5">Service *</label>
              <div className="relative">
                <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0b1120] border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-1.5">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-[#0b1120] border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.replace("-", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/60 text-sm mb-1.5">Start Date</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0b1120] border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-1.5">End Date</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0b1120] border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-1.5">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 rounded-xl bg-[#0b1120] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#0068e3] transition-colors resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <button
                type="submit"
                disabled={loading || !formData.name || !formData.service}
                className="px-6 py-2.5 rounded-xl bg-[#0068e3] hover:bg-[#0068e3]/80 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={16} />
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <Link
                href={`/admin/projects/${id}`}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors flex items-center gap-2"
              >
                <X size={16} />
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}