// app/admin/team/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  RefreshCw,
  Trash2,
  Edit,
  Mail,
  Phone,
  X,
  Save,
  Clock,
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  phone: string | null;
  bio: string | null;
  active: boolean;
  createdAt: string;
  _count?: {
    assignedTasks: number;
  };
}

const ROLE_OPTIONS = [
  { value: "ceo", label: "Chief Executive Officer" },
  { value: "sales_lead", label: "Sales & Lead Generation Specialist" },
  { value: "social_media_manager", label: "Social Media Manager" },
  { value: "advertising_specialist", label: "Advertising Specialist" },
  { value: "web_app_developer", label: "Web and App Developer" },
];

const ROLE_COLORS: Record<string, string> = {
  ceo: "bg-purple-500/20 text-purple-400",
  sales_lead: "bg-emerald-500/20 text-emerald-400",
  social_media_manager: "bg-pink-500/20 text-pink-400",
  advertising_specialist: "bg-blue-500/20 text-blue-400",
  web_app_developer: "bg-indigo-500/20 text-indigo-400",
};

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    phone: "",
    bio: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin-token");
      const response = await fetch("/api/admin/team", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch team members");

      const data = await response.json();
      
      // Fetch task counts for each team member
      const membersWithCounts = await Promise.all(
        (data.teamMembers || []).map(async (member: TeamMember) => {
          const tasksRes = await fetch(`/api/admin/tasks?assignedTo=${member.id}&limit=100`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const tasksData = await tasksRes.json();
          return {
            ...member,
            _count: {
              assignedTasks: tasksData.tasks?.filter((t: any) => t.status !== "done").length || 0,
            },
          };
        })
      );
      
      setTeamMembers(membersWithCounts || []);
    } catch (error) {
      console.error("Error fetching team members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team member?")) return;

    try {
      const token = localStorage.getItem("admin-token");
      const response = await fetch(`/api/admin/team/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete team member");
      fetchTeamMembers();
    } catch (error) {
      console.error("Error deleting team member:", error);
      alert("Failed to delete team member");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("admin-token");
      const url = editingMember 
        ? `/api/admin/team/${editingMember.id}`
        : "/api/admin/team";
      const method = editingMember ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save team member");
      }

      setShowCreateModal(false);
      setEditingMember(null);
      setFormData({ name: "", email: "", role: "", phone: "", bio: "" });
      fetchTeamMembers();
    } catch (error: any) {
      console.error("Error saving team member:", error);
      alert(error.message || "Failed to save team member");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      role: member.role,
      phone: member.phone || "",
      bio: member.bio || "",
    });
    setShowCreateModal(true);
  };

  const getRoleBadge = (role: string) => {
    const color = ROLE_COLORS[role] || "bg-white/10 text-white/60";
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
        {role.replace("_", " ")}
      </span>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Team Members</h1>
          <p className="text-white/50 text-sm">
            {teamMembers.length} active team members
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingMember(null);
              setFormData({ name: "", email: "", role: "", phone: "", bio: "" });
              setShowCreateModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#0068e3] hover:bg-[#0068e3]/80 text-white text-sm transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add Team Member
          </button>
          <button
            onClick={fetchTeamMembers}
            disabled={loading}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Team Members Grid */}
      {loading ? (
        <div className="rounded-2xl bg-[#0b1120] backdrop-blur-sm border border-white/10 p-12 text-center">
          <div className="text-white/40">Loading team members...</div>
        </div>
      ) : teamMembers.length === 0 ? (
        <div className="rounded-2xl bg-[#0b1120] backdrop-blur-sm border border-white/10 p-12 text-center">
          <Users size={32} className="mx-auto mb-3 text-white/20" />
          <p className="text-white/40">No team members yet. Add your first team member.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamMembers.map((member) => (
            <Link
              href={`/admin/team/${member.id}`}
              key={member.id}
              className="block rounded-2xl bg-[#0b1120] backdrop-blur-sm border border-white/10 p-5 hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#0068e3] to-[#00b8fd] flex items-center justify-center text-white text-lg font-medium">
                    {member.name?.[0] || "?"}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{member.name}</h3>
                    <p className="text-white/40 text-sm">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      openEditModal(member);
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(member.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center gap-3">
                {getRoleBadge(member.role)}
                {member.phone && (
                  <span className="text-white/40 text-xs flex items-center gap-1">
                    <Phone size={12} />
                    {member.phone}
                  </span>
                )}
                {member._count && (
                  <span className="text-white/40 text-xs flex items-center gap-1 ml-auto">
                    <Clock size={12} />
                    {member._count.assignedTasks} active tasks
                  </span>
                )}
              </div>

              {member.bio && (
                <p className="mt-2 text-white/40 text-sm line-clamp-2">
                  {member.bio}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#0b1120] border border-white/10 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                {editingMember ? "Edit Team Member" : "Add Team Member"}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingMember(null);
                }}
                className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/60 text-sm mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#0b1120] border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#0b1120] border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                  placeholder="john@webistic.co"
                  required
                  disabled={!!editingMember}
                />
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-1.5">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#0b1120] border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                  required
                >
                  <option value="">Select a role...</option>
                  {ROLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-1.5">
                  Phone
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#0b1120] border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                  placeholder="+44 1234 567890"
                />
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-1.5">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl bg-[#0b1120] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#0068e3] transition-colors resize-none"
                  placeholder="Brief description of their role and expertise..."
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <button
                  type="submit"
                  disabled={submitting || !formData.name || !formData.email || !formData.role}
                  className="px-6 py-2.5 rounded-xl bg-[#0068e3] hover:bg-[#0068e3]/80 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Save size={16} />
                  {submitting ? "Saving..." : editingMember ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingMember(null);
                  }}
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
