// app/admin/tasks/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle,
  X,
  Clock,
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  Trash2,
  Eye,
  Calendar,
  User,
  Briefcase,
  Building2,
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
}

interface Client {
  id: string;
  name: string;
  business: string | null;
}

interface Project {
  id: string;
  name: string;
  clientId: string;
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

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [teamMemberFilter, setTeamMemberFilter] = useState<string>("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showTeamMemberDropdown, setShowTeamMemberDropdown] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    projectId: "",
    clientId: "",
    assignedTo: "",
    dueDate: "",
  });
  const [creating, setCreating] = useState(false);

  // Load all data on page load
  useEffect(() => {
    fetchTasks();
    fetchClients();
    fetchTeamMembers();
  }, [search, statusFilter, priorityFilter, teamMemberFilter]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin-token");
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      if (priorityFilter) params.append("priority", priorityFilter);
      if (teamMemberFilter) params.append("assignedTo", teamMemberFilter);

      const response = await fetch(`/api/admin/tasks?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch tasks");

      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("admin-token");
      const response = await fetch("/api/admin/clients", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const fetchProjects = async (clientId: string) => {
    try {
      const token = localStorage.getItem("admin-token");
      const response = await fetch(`/api/admin/projects?clientId=${clientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
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

  const handleClientChange = (clientId: string) => {
    setSelectedClient(clientId);
    setFormData({ ...formData, clientId, projectId: "" });
    setProjects([]);
    if (clientId) {
      fetchProjects(clientId);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const token = localStorage.getItem("admin-token");
      const response = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create task");

      setShowCreateModal(false);
      setFormData({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        projectId: "",
        clientId: "",
        assignedTo: "",
        dueDate: "",
      });
      fetchTasks();
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const token = localStorage.getItem("admin-token");
      const response = await fetch(`/api/admin/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete task");
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task");
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

  const getTeamMemberName = (task: Task) => {
    if (task.assignedToMember) {
      return task.assignedToMember.name;
    }
    if (task.assignedTo) {
      const member = teamMembers.find(m => m.id === task.assignedTo);
      return member?.name || task.assignedTo;
    }
    return "-";
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <p className="text-white/50 text-sm">
            {tasks.length} total tasks • {tasks.filter(t => t.status === "todo").length} pending
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setFormData({
                title: "",
                description: "",
                status: "todo",
                priority: "medium",
                projectId: "",
                clientId: "",
                assignedTo: "",
                dueDate: "",
              });
              setSelectedClient("");
              setProjects([]);
              setShowCreateModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#0068e3] hover:bg-[#0068e3]/80 text-white text-sm transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            New Task
          </button>
          <button
            onClick={fetchTasks}
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
            placeholder="Search tasks..."
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
                  {status.replace("-", " ")}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Priority Filter */}
        <div className="relative">
          <button
            onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors text-sm"
          >
            <Filter size={14} />
            {priorityFilter || "All Priority"}
            <ChevronDown size={14} />
          </button>
          {showPriorityDropdown && (
            <div className="absolute top-full left-0 mt-1 w-48 rounded-xl bg-[#0b1120] border border-white/10 shadow-xl z-50 py-1">
              <button
                onClick={() => { setPriorityFilter(""); setShowPriorityDropdown(false); }}
                className="w-full px-4 py-2 text-left text-white/60 hover:text-white hover:bg-white/5 text-sm"
              >
                All Priority
              </button>
              {PRIORITY_OPTIONS.map((priority) => (
                <button
                  key={priority}
                  onClick={() => { setPriorityFilter(priority); setShowPriorityDropdown(false); }}
                  className="w-full px-4 py-2 text-left text-white/60 hover:text-white hover:bg-white/5 text-sm capitalize"
                >
                  {priority}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Team Member Filter */}
        {teamMembers.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowTeamMemberDropdown(!showTeamMemberDropdown)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors text-sm"
            >
              <User size={14} />
              {teamMemberFilter ? teamMembers.find(m => m.id === teamMemberFilter)?.name || "Assigned To" : "Assigned To"}
              <ChevronDown size={14} />
            </button>
            {showTeamMemberDropdown && (
              <div className="absolute top-full left-0 mt-1 w-48 rounded-xl bg-[#0b1120] border border-white/10 shadow-xl z-50 py-1">
                <button
                  onClick={() => { setTeamMemberFilter(""); setShowTeamMemberDropdown(false); }}
                  className="w-full px-4 py-2 text-left text-white/60 hover:text-white hover:bg-white/5 text-sm"
                >
                  All Team Members
                </button>
                {teamMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => { setTeamMemberFilter(member.id); setShowTeamMemberDropdown(false); }}
                    className="w-full px-4 py-2 text-left text-white/60 hover:text-white hover:bg-white/5 text-sm"
                  >
                    {member.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-12 text-center">
          <div className="text-white/40">Loading tasks...</div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-12 text-center">
          <Clock size={32} className="mx-auto mb-3 text-white/20" />
          <p className="text-white/40">
            {search || statusFilter || priorityFilter || teamMemberFilter
              ? "No tasks match your filters."
              : "No tasks yet. Create your first task."}
          </p>
          <button
            onClick={() => {
              setFormData({
                title: "",
                description: "",
                status: "todo",
                priority: "medium",
                projectId: "",
                clientId: "",
                assignedTo: "",
                dueDate: "",
              });
              setSelectedClient("");
              setProjects([]);
              setShowCreateModal(true);
            }}
            className="inline-block mt-4 px-4 py-2 rounded-xl bg-[#0068e3] text-white text-sm hover:bg-[#0068e3]/80 transition-colors"
          >
            Create Task
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10">
                <tr className="text-left text-white/40 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Assigned To</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/tasks/${task.id}`}
                        className="text-white hover:text-[#00b8fd] transition-colors font-medium"
                      >
                        {task.title}
                      </Link>
                      {task.description && (
                        <p className="text-white/40 text-xs truncate max-w-[200px]">
                          {task.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/60 text-sm">
                      {task.project?.name || "-"}
                    </td>
                    <td className="px-4 py-3 text-white/60 text-sm">
                      {task.client?.name || "-"}
                    </td>
                    <td className="px-4 py-3 text-white/60 text-sm">
                      {getTeamMemberName(task)}
                    </td>
                    <td className="px-4 py-3">
                      {getPriorityBadge(task.priority)}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(task.status)}
                    </td>
                    <td className="px-4 py-3 text-white/40 text-sm">
                      {formatDate(task.dueDate)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/tasks/${task.id}`}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-[#0b1120] border border-white/10 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Create New Task</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-white/60 text-sm mb-1.5">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#0b1120] border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                  placeholder="Enter task title"
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
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl bg-[#0b1120] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#0068e3] transition-colors resize-none"
                  placeholder="Enter task description..."
                />
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-1.5">
                  Client (Optional)
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-[#0b1120] border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                >
                  <option value="">No Client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} {client.business ? `(${client.business})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-1.5">
                  Project (Optional)
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#0b1120] border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                  disabled={!selectedClient && !formData.clientId}
                >
                  <option value="">No Project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                {!selectedClient && !formData.clientId && (
                  <p className="text-white/20 text-xs mt-1">Select a client first to see projects</p>
                )}
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
                  disabled={creating || !formData.title}
                  className="px-6 py-2.5 rounded-xl bg-[#0068e3] hover:bg-[#0068e3]/80 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Plus size={16} />
                  {creating ? "Creating..." : "Create Task"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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