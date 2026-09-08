// app/admin/team/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  Mail,
  Phone,
  User,
  Calendar,
  CheckCircle,
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
  updatedAt: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  client: {
    id: string;
    name: string;
    business: string | null;
  } | null;
  project: {
    id: string;
    name: string;
    service: string;
  } | null;
}

const ROLE_COLORS: Record<string, string> = {
  ceo: "bg-purple-500/20 text-purple-400",
  sales_lead: "bg-emerald-500/20 text-emerald-400",
  social_media_manager: "bg-pink-500/20 text-pink-400",
  advertising_specialist: "bg-blue-500/20 text-blue-400",
  web_app_developer: "bg-indigo-500/20 text-indigo-400",
};
const STATUS_COLORS: Record<string, string> = {
  todo: "bg-gray-500/20 text-gray-400",
  "in-progress": "bg-yellow-500/20 text-yellow-400",
  review: "bg-purple-500/20 text-purple-400",
  done: "bg-emerald-500/20 text-emerald-400",
  blocked: "bg-red-500/20 text-red-400",
};

export default function TeamMemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [member, setMember] = useState<TeamMember | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchMember();
    }
  }, [id]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin-token");
      
      // Fetch member details
      const memberRes = await fetch(`/api/admin/team/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!memberRes.ok) {
        if (memberRes.status === 404) {
          router.push("/admin/team");
          return;
        }
        throw new Error("Failed to fetch team member");
      }
      
      const memberData = await memberRes.json();
      setMember(memberData.teamMember);

      // Fetch tasks assigned to this member
      const tasksRes = await fetch(`/api/admin/tasks?assignedTo=${id}&limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData.tasks || []);
      }
    } catch (error) {
      console.error("Error fetching team member:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const color = ROLE_COLORS[role] || "bg-white/10 text-white/60";
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
        {role.replace("_", " ")}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const color = STATUS_COLORS[status] || "bg-white/10 text-white/60";
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
        {status.replace("-", " ")}
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/60">Team member not found</div>
      </div>
    );
  }

  const activeTasks = tasks.filter(t => t.status !== "done").length;
  const completedTasks = tasks.filter(t => t.status === "done").length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/team"
            className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{member.name}</h1>
              {getRoleBadge(member.role)}
            </div>
            <p className="text-white/50 text-sm">{member.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchMember}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
          <p className="text-white/40 text-xs">Total Tasks</p>
          <p className="text-xl font-bold text-white">{tasks.length}</p>
        </div>
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
          <p className="text-white/40 text-xs">Active Tasks</p>
          <p className="text-xl font-bold text-yellow-400">{activeTasks}</p>
        </div>
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
          <p className="text-white/40 text-xs">Completed</p>
          <p className="text-xl font-bold text-emerald-400">{completedTasks}</p>
        </div>
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
          <p className="text-white/40 text-xs">Member Since</p>
          <p className="text-xl font-bold text-[#00b8fd]">
            {formatDate(member.createdAt)}
          </p>
        </div>
      </div>

      {/* Member Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
            <h3 className="text-white font-semibold text-sm mb-4">Assigned Tasks</h3>
            {tasks.length === 0 ? (
              <div className="text-center text-white/40 py-8">
                <CheckCircle size={24} className="mx-auto mb-2 text-white/20" />
                <p>No tasks assigned to this team member</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/admin/tasks/${task.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{task.title}</p>
                      <p className="text-white/40 text-xs truncate">
                        {task.client?.name || "No client"} • {task.project?.name || "No project"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      {getStatusBadge(task.status)}
                      {task.dueDate && (
                        <span className="text-white/20 text-xs">
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
            <h3 className="text-white font-semibold text-sm mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Mail size={14} className="text-white/30" />
                <span>{member.email}</span>
              </div>
              {member.phone && (
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Phone size={14} className="text-white/30" />
                  <span>{member.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-white/40 text-sm">
                <User size={14} className="text-white/30" />
                <span>Role: {member.role.replace("_", " ")}</span>
              </div>
              <div className="flex items-center gap-2 text-white/40 text-sm">
                <Calendar size={14} className="text-white/30" />
                <span>Joined {formatDate(member.createdAt)}</span>
              </div>
            </div>
          </div>

          {member.bio && (
            <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
              <h3 className="text-white font-semibold text-sm mb-2">About</h3>
              <p className="text-white/60 text-sm">{member.bio}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}