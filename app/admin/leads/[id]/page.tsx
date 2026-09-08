// app/admin/leads/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Calendar,
  User,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  UserPlus,
  Edit,
  Trash2,
  Send,
  MoreVertical,
} from "lucide-react";

interface Lead {
  id: string;
  name: string | null;
  business: string | null;
  email: string | null;
  whatsapp: string | null;
  service: string | null;
  goal: string | null;
  source: string;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  conversation: {
    id: string;
    messages: Array<{
      id: string;
      role: string;
      content: string;
      createdAt: string;
    }>;
  } | null;
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

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    fetchLead();
  }, [id]);

  const fetchLead = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin-token");
      const response = await fetch(`/api/admin/leads/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 404) {
          router.push("/admin/leads");
          return;
        }
        throw new Error("Failed to fetch lead");
      }

      const data = await response.json();
      setLead(data.lead);
      setNewStatus(data.lead.status);
    } catch (error) {
      console.error("Error fetching lead:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem("admin-token");
      const response = await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      setLead(prev => prev ? { ...prev, status } : null);
      setNewStatus(status);
      setShowStatusDropdown(false);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;

    try {
      setAddingNote(true);
      const token = localStorage.getItem("admin-token");
      const response = await fetch(`/api/admin/leads/${id}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newNote }),
      });

      if (!response.ok) throw new Error("Failed to add note");

      setNewNote("");
      fetchLead(); // Refresh to get updated notes
    } catch (error) {
      console.error("Error adding note:", error);
      alert("Failed to add note");
    } finally {
      setAddingNote(false);
    }
  };

  const convertToClient = async () => {
    if (!confirm("Convert this lead to a client?")) return;

    try {
      const token = localStorage.getItem("admin-token");
      const response = await fetch(`/api/admin/leads/${id}/convert`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to convert");

      router.push(`/admin/clients/${id}`);
    } catch (error) {
      console.error("Error converting:", error);
      alert("Failed to convert lead to client");
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/60">Loading lead details...</div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/60">Lead not found</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/leads"
            className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {lead.name || "Unknown Lead"}
            </h1>
            <p className="text-white/50 text-sm">
              {lead.business || "No business"} • {lead.source.replace("_", " ")}
            </p>
          </div>
          <button
            onClick={convertToClient}
            className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors text-sm flex items-center gap-2"
          >
            <UserPlus size={16} />
            Convert to Client
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLead}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Update */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
            <h3 className="text-white font-semibold text-sm mb-4">Status</h3>
            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                disabled={updating}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${STATUS_COLORS[lead.status] || "bg-white/10 text-white/60"}`}
              >
                {lead.status.replace("-", " ")}
                {updating && " (Updating...)"}
              </button>
              {showStatusDropdown && (
                <div className="absolute top-full left-0 mt-2 w-48 rounded-xl bg-[#0b1120] border border-white/10 shadow-xl z-50 py-1 max-h-60 overflow-y-auto">
                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(status)}
                      className="w-full px-4 py-2 text-left text-white/60 hover:text-white hover:bg-white/5 text-sm capitalize"
                    >
                      {status.replace("-", " ")}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Conversation */}
          {lead.conversation && lead.conversation.messages.length > 0 && (
            <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                  <MessageSquare size={16} className="text-[#00b8fd]" />
                  Conversation History
                </h3>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto space-y-4">
                {lead.conversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl px-4 py-2 ${
                        message.role === "user"
                          ? "bg-[#0068e3]/20 text-white"
                          : message.role === "assistant"
                          ? "bg-white/10 text-white"
                          : "bg-white/5 text-white/40 text-xs"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <span className="text-[10px] text-white/30 mt-1 block">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
            <h3 className="text-white font-semibold text-sm mb-4">Contact</h3>
            <div className="space-y-3">
              {lead.email && (
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Mail size={14} className="text-white/30" />
                  <a href={`mailto:${lead.email}`} className="hover:text-[#00b8fd] transition-colors">
                    {lead.email}
                  </a>
                </div>
              )}
              {lead.whatsapp && (
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Phone size={14} className="text-white/30" />
                  <a href={`https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#00b8fd] transition-colors">
                    {lead.whatsapp}
                  </a>
                </div>
              )}
              {lead.business && (
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Building2 size={14} className="text-white/30" />
                  <span>{lead.business}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-white/40 text-sm">
                <Clock size={14} className="text-white/30" />
                <span>Created {formatDate(lead.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Service & Goal */}
          {(lead.service || lead.goal) && (
            <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
              <h3 className="text-white font-semibold text-sm mb-4">Details</h3>
              <div className="space-y-3">
                {lead.service && (
                  <div>
                    <p className="text-white/40 text-xs">Service</p>
                    <p className="text-white text-sm">{lead.service}</p>
                  </div>
                )}
                {lead.goal && (
                  <div>
                    <p className="text-white/40 text-xs">Goal</p>
                    <p className="text-white text-sm">{lead.goal}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
            <h3 className="text-white font-semibold text-sm mb-4">Internal Notes</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#0068e3] transition-colors text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addNote();
                  }}
                />
                <button
                  onClick={addNote}
                  disabled={addingNote || !newNote.trim()}
                  className="px-4 py-2 rounded-xl bg-[#0068e3] text-white hover:bg-[#0068e3]/80 transition-colors disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
              {lead.notes && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white/60 text-sm whitespace-pre-wrap">{lead.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}