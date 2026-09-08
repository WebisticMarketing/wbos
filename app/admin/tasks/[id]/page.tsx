// app/admin/tasks/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  Edit,
  Trash2,
  Calendar,
  User,
  Briefcase,
  Building2,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Save,
  X,
  Download,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  project: {
    id: string;
    name: string;
    service: string;
  } | null;
  client: {
    id: string;
    name: string;
    business: string | null;
  } | null;
  assignedTo: string | null;
  assignedToMember: {
    id: string;
    name: string;
    role: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
}

const STATUS_COLORS: Record<string, string> = {
  todo: "bg-gray-500/20 text-gray-400 border-gray-500/20",
  "in-progress": "bg-yellow-500/20 text-yellow-400 border-yellow-500/20",
  review: "bg-purple-500/20 text-purple-400 border-purple-500/20",
  done: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
  blocked: "bg-red-500/20 text-red-400 border-red-500/20",
};

const STATUS_OPTIONS = ["todo", "in-progress", "review", "done", "blocked"];

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-blue-500/20 text-blue-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  high: "bg-orange-500/20 text-orange-400",
  urgent: "bg-red-500/20 text-red-400",
};

const PRIORITY_OPTIONS = ["low", "medium", "high", "urgent"];

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "",
    priority: "",
    assignedTo: "",
    dueDate: "",
  });

  useEffect(() => {
    if (id) {
      fetchTask();
      fetchTeamMembers();
    }
  }, [id]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin-token");
      const response = await fetch(`/api/admin/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 404) {
          router.push("/admin/tasks");
          return;
        }
        throw new Error("Failed to fetch task");
      }

      const data = await response.json();
      setTask(data.task);
      setFormData({
        title: data.task.title,
        description: data.task.description || "",
        status: data.task.status,
        priority: data.task.priority,
        assignedTo: data.task.assignedTo || "",
        dueDate: data.task.dueDate ? data.task.dueDate.split("T")[0] : "",
      });
    } catch (error) {
      console.error("Error fetching task:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const token = localStorage.getItem("admin-token");
      const response = await fetch("/api/admin/team", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.teamMembers || []);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const token = localStorage.getItem("admin-token");
      const response = await fetch(`/api/admin/tasks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update task");

      setIsEditing(false);
      fetchTask();
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const token = localStorage.getItem("admin-token");
      const response = await fetch(`/api/admin/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete task");
      router.push("/admin/tasks");
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task");
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem("admin-token");
      const response = await fetch(`/api/admin/tasks/${id}/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to export");
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `Task_${task?.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match) filename = match[1];
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Error exporting:", error);
      alert(error.message || "Failed to export task");
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const color = STATUS_COLORS[status] || "bg-white/10 text-white/60";
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${color}`}>
        {status.replace("-", " ")}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const color = PRIORITY_COLORS[priority] || "bg-white/10 text-white/60";
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
        {priority}
      </span>
    );
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAssignedToName = () => {
    if (!task) return "-";
    if (task.assignedToMember) {
      return task.assignedToMember.name;
    }
    if (task.assignedTo) {
      const member = teamMembers.find(m => m.id === task.assignedTo);
      return member?.name || task.assignedTo;
    }
    return "-";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/60">Loading task...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/60">Task not found</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/tasks"
            className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isEditing ? "Edit Task" : task.title}
            </h1>
            {!isEditing && (
              <p className="text-white/50 text-sm flex items-center gap-2 flex-wrap">
                {task.client?.name || "No client"} • {task.project?.name || "No project"}
                {getStatusBadge(task.status)}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {!isEditing && (
            <>
              <button
                onClick={handleExportPDF}
                disabled={exporting}
                className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Download size={16} />
                {exporting ? "Generating..." : "Download PDF"}
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-colors flex items-center gap-2"
              >
                <Edit size={16} />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </>
          )}
          <button
            onClick={fetchTask}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      {isEditing ? (
        <form onSubmit={handleUpdate} className="max-w-2xl">
          <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-white/60 text-sm mb-1.5">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#0b1120] border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 rounded-xl bg-[#0b1120] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#0068e3] transition-colors resize-none"
                  placeholder="Enter task description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-sm mb-1.5">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[#0b1120] border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                  >
                    {PRIORITY_OPTIONS.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
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
                        {status.replace("-", " ").charAt(0).toUpperCase() + status.replace("-", " ").slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-sm mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[#0b1120] border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-1.5">
                    Assigned To
                  </label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[#0b1120] border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                  >
                    <option value="">Select a team member...</option>
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({member.role.replace("_", " ")})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <button
                  type="submit"
                  disabled={updating}
                  className="px-6 py-2.5 rounded-xl bg-[#0068e3] hover:bg-[#0068e3]/80 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Save size={16} />
                  {updating ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      title: task.title,
                      description: task.description || "",
                      status: task.status,
                      priority: task.priority,
                      assignedTo: task.assignedTo || "",
                      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
                    });
                  }}
                  className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
              <h3 className="text-white font-semibold text-sm mb-4">Task Details</h3>
              {task.description ? (
                <p className="text-white/60 text-sm whitespace-pre-wrap">{task.description}</p>
              ) : (
                <p className="text-white/30 text-sm">No description provided.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
              <h3 className="text-white font-semibold text-sm mb-4">Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-white/40 text-xs">Status</p>
                  <div className="mt-1">{getStatusBadge(task.status)}</div>
                </div>
                <div>
                  <p className="text-white/40 text-xs">Priority</p>
                  <div className="mt-1">{getPriorityBadge(task.priority)}</div>
                </div>
                {task.dueDate && (
                  <div>
                    <p className="text-white/40 text-xs">Due Date</p>
                    <p className="text-white/60 text-sm">{formatDate(task.dueDate)}</p>
                  </div>
                )}
                <div>
                  <p className="text-white/40 text-xs">Assigned To</p>
                  <p className="text-white/60 text-sm">{getAssignedToName()}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
              <h3 className="text-white font-semibold text-sm mb-4">Related</h3>
              <div className="space-y-3">
                {task.client && (
                  <div>
                    <p className="text-white/40 text-xs">Client</p>
                    <Link
                      href={`/admin/clients/${task.client.id}`}
                      className="text-[#00b8fd] hover:underline text-sm"
                    >
                      {task.client.name}
                    </Link>
                    {task.client.business && (
                      <p className="text-white/40 text-xs">{task.client.business}</p>
                    )}
                  </div>
                )}
                {task.project && (
                  <div>
                    <p className="text-white/40 text-xs">Project</p>
                    <Link
                      href={`/admin/projects/${task.project.id}`}
                      className="text-[#00b8fd] hover:underline text-sm"
                    >
                      {task.project.name}
                    </Link>
                    {task.project.service && (
                      <p className="text-white/40 text-xs">{task.project.service}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
              <h3 className="text-white font-semibold text-sm mb-4">Timeline</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-white/40 text-xs">Created</p>
                  <p className="text-white/60 text-sm">{formatDateTime(task.createdAt)}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs">Last Updated</p>
                  <p className="text-white/60 text-sm">{formatDateTime(task.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}