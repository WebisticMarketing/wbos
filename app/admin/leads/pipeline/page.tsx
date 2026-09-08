// app/admin/leads/pipeline/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  Calendar,
  Building2,
  Mail,
  Phone,
} from "lucide-react";

interface Lead {
  id: string;
  name: string | null;
  business: string | null;
  email: string | null;
  whatsapp: string | null;
  service: string | null;
  status: string;
  createdAt: string;
}

const PIPELINE_STAGES = [
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "qualified", label: "Qualified" },
  { id: "consultation", label: "Consultation" },
  { id: "proposal", label: "Proposal" },
  { id: "negotiation", label: "Negotiation" },
  { id: "won", label: "Won 🎉" },
];

const STAGE_COLORS: Record<string, string> = {
  new: "border-emerald-500/30 bg-emerald-500/5",
  contacted: "border-yellow-500/30 bg-yellow-500/5",
  qualified: "border-blue-500/30 bg-blue-500/5",
  consultation: "border-purple-500/30 bg-purple-500/5",
  proposal: "border-indigo-500/30 bg-indigo-500/5",
  negotiation: "border-orange-500/30 bg-orange-500/5",
  won: "border-green-500/30 bg-green-500/5",
  lost: "border-red-500/30 bg-red-500/5",
  "not-interested": "border-gray-500/30 bg-gray-500/5",
  unqualified: "border-gray-500/30 bg-gray-500/5",
};

const STATUS_BADGE_COLORS: Record<string, string> = {
  new: "bg-emerald-500/20 text-emerald-400",
  contacted: "bg-yellow-500/20 text-yellow-400",
  qualified: "bg-blue-500/20 text-blue-400",
  consultation: "bg-purple-500/20 text-purple-400",
  proposal: "bg-indigo-500/20 text-indigo-400",
  negotiation: "bg-orange-500/20 text-orange-400",
  won: "bg-green-500/20 text-green-400",
  lost: "bg-red-500/20 text-red-400",
  "not-interested": "bg-gray-500/20 text-gray-400",
  unqualified: "bg-gray-500/20 text-gray-400",
};

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin-token");
      const response = await fetch("/api/admin/leads?limit=100", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch leads");

      const data = await response.json();
      setLeads(data.leads || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLeadsByStage = (stage: string) => {
    return leads.filter((lead) => lead.status === stage);
  };

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    
    if (!draggedLead) return;
    if (draggedLead.status === newStatus) return;

    try {
      const token = localStorage.getItem("admin-token");
      const response = await fetch(`/api/admin/leads/${draggedLead.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update lead status");

      setLeads(prev =>
        prev.map((lead) =>
          lead.id === draggedLead.id ? { ...lead, status: newStatus } : lead
        )
      );
    } catch (error) {
      console.error("Error updating lead status:", error);
      alert("Failed to update lead status");
    } finally {
      setDraggedLead(null);
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000 / 60 / 60);
    
    if (diff < 1) return "Just now";
    if (diff < 24) return `${diff}h ago`;
    if (diff < 48) return "Yesterday";
    if (diff < 168) return `${Math.floor(diff / 24)}d ago`;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/60">Loading pipeline...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/leads"
            className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Pipeline</h1>
            <p className="text-white/50 text-sm">
              Drag and drop leads between stages • {leads.length} total leads
            </p>
          </div>
        </div>
        <button
          onClick={fetchLeads}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex-shrink-0"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Pipeline Board - Scrollable Container */}
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 overflow-x-auto overflow-y-auto pb-4">
          <div className="flex gap-4 px-1 min-w-max h-full">
            {PIPELINE_STAGES.map((stage) => {
              const stageLeads = getLeadsByStage(stage.id);
              const count = stageLeads.length;

              return (
                <div
                  key={stage.id}
                  className="w-72 flex-shrink-0 flex flex-col h-full max-h-full"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  {/* Stage Header */}
                  <div className="flex items-center justify-between mb-3 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium text-sm">
                        {stage.label}
                      </span>
                      <span className="text-white/30 text-xs bg-white/10 px-2 py-0.5 rounded-full">
                        {count}
                      </span>
                    </div>
                  </div>

                  {/* Stage Content */}
                  <div
                    className={`rounded-xl border-2 ${STAGE_COLORS[stage.id] || "border-white/10 bg-white/5"} p-3 flex-1 overflow-y-auto min-h-[300px]`}
                  >
                    {stageLeads.length === 0 ? (
                      <div className="text-white/20 text-xs text-center py-8">
                        No leads
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {stageLeads.map((lead) => (
                          <div
                            key={lead.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, lead)}
                            className="bg-[#0a1628] rounded-xl border border-white/10 p-3 cursor-grab hover:border-white/20 transition-colors group"
                          >
                            <div className="flex items-start justify-between">
                              <Link
                                href={`/admin/leads/${lead.id}`}
                                className="flex-1 min-w-0"
                              >
                                <p className="text-white font-medium text-sm truncate">
                                  {lead.name || "Unknown"}
                                </p>
                                {lead.business && (
                                  <p className="text-white/40 text-xs truncate flex items-center gap-1 mt-0.5">
                                    <Building2 size={12} />
                                    {lead.business}
                                  </p>
                                )}
                                {lead.service && (
                                  <p className="text-white/30 text-xs mt-1">
                                    {lead.service}
                                  </p>
                                )}
                              </Link>
                              <div className="flex flex-col items-end gap-1 ml-2">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${STATUS_BADGE_COLORS[lead.status] || "bg-white/10 text-white/60"}`}>
                                  {lead.status}
                                </span>
                                <span className="text-white/20 text-[10px] flex items-center gap-1">
                                  <Calendar size={10} />
                                  {formatDate(lead.createdAt)}
                                </span>
                              </div>
                            </div>

                            {(lead.email || lead.whatsapp) && (
                              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                                {lead.email && (
                                  <span className="text-white/20 text-[10px] flex items-center gap-0.5">
                                    <Mail size={10} />
                                    {lead.email.split("@")[0]}
                                  </span>
                                )}
                                {lead.whatsapp && (
                                  <span className="text-white/20 text-[10px] flex items-center gap-0.5 ml-auto">
                                    <Phone size={10} />
                                    {lead.whatsapp}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Lost Column */}
            <div
              className="w-72 flex-shrink-0 flex flex-col h-full max-h-full"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, "lost")}
            >
              <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-white/40 font-medium text-sm">Lost</span>
                  <span className="text-white/20 text-xs bg-white/10 px-2 py-0.5 rounded-full">
                    {getLeadsByStage("lost").length + getLeadsByStage("not-interested").length + getLeadsByStage("unqualified").length}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border-2 border-red-500/20 bg-red-500/5 p-3 flex-1 overflow-y-auto min-h-[300px]">
                {[
                  ...getLeadsByStage("lost"),
                  ...getLeadsByStage("not-interested"),
                  ...getLeadsByStage("unqualified"),
                ].length === 0 ? (
                  <div className="text-white/20 text-xs text-center py-8">
                    No lost leads
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {[
                      ...getLeadsByStage("lost"),
                      ...getLeadsByStage("not-interested"),
                      ...getLeadsByStage("unqualified"),
                    ].map((lead) => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead)}
                        className="bg-[#0a1628] rounded-xl border border-red-500/20 p-3 cursor-grab hover:border-red-500/40 transition-colors group"
                      >
                        <div className="flex items-start justify-between">
                          <Link
                            href={`/admin/leads/${lead.id}`}
                            className="flex-1 min-w-0"
                          >
                            <p className="text-white font-medium text-sm truncate">
                              {lead.name || "Unknown"}
                            </p>
                            {lead.business && (
                              <p className="text-white/40 text-xs truncate flex items-center gap-1 mt-0.5">
                                <Building2 size={12} />
                                {lead.business}
                              </p>
                            )}
                          </Link>
                          <div className="flex flex-col items-end gap-1 ml-2">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${STATUS_BADGE_COLORS[lead.status] || "bg-white/10 text-white/60"}`}>
                              {lead.status}
                            </span>
                            <span className="text-white/20 text-[10px] flex items-center gap-1">
                              <Calendar size={10} />
                              {formatDate(lead.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 flex-shrink-0">
        <p className="text-white/40 text-xs">
          💡 Drag and drop cards between columns to update lead status. 
          Click a card to view full lead details.
        </p>
      </div>
    </div>
  );
}