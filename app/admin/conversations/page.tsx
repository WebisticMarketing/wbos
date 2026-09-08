// app/admin/conversations/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  RefreshCw,
  MessageSquare,
  User,
  Building2,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  Phone,
} from "lucide-react";

interface Conversation {
  id: string;
  sessionId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  lead: {
    id: string;
    name: string | null;
    business: string | null;
    email: string | null;
    whatsapp: string | null;
    service: string | null;
    status: string;
  } | null;
  messages: Array<{
    id: string;
    role: string;
    content: string;
    createdAt: string;
  }>;
  _count?: {
    messages: number;
  };
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const conversationsPerPage = 20;

  useEffect(() => {
    fetchConversations();
  }, [search, currentPage]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin-token");

      const params = new URLSearchParams();
      if (search) params.append("search", search);
      params.append("limit", conversationsPerPage.toString());
      params.append("page", currentPage.toString());

      const response = await fetch(`/api/admin/conversations?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch conversations");

      const data = await response.json();
      setConversations(data.conversations || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000 / 60);

    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMessagePreview = (messages: any[]) => {
    if (!messages || messages.length === 0) return "No messages";
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === "user") {
      return `👤 ${lastMessage.content.slice(0, 60)}${lastMessage.content.length > 60 ? "..." : ""}`;
    }
    return `🤖 ${lastMessage.content.slice(0, 60)}${lastMessage.content.length > 60 ? "..." : ""}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/20 text-emerald-400";
      case "completed":
        return "bg-blue-500/20 text-blue-400";
      default:
        return "bg-white/10 text-white/60";
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Conversations</h1>
          <p className="text-white/50 text-sm">
            {conversations.length} total conversations • Chatbot interactions
          </p>
        </div>
        <button
          onClick={fetchConversations}
          disabled={loading}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by lead name or business..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#0068e3] transition-colors text-sm"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="space-y-3">
        {loading ? (
          <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-12 text-center">
            <div className="text-white/40">Loading conversations...</div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-12 text-center">
            <MessageSquare size={32} className="mx-auto mb-3 text-white/20" />
            <p className="text-white/40">
              {search ? "No conversations match your search." : "No conversations yet. Chatbot interactions will appear here."}
            </p>
          </div>
        ) : (
          conversations.map((conversation) => {
            const isExpanded = expandedId === conversation.id;
            const messageCount = conversation.messages?.length || 0;

            return (
              <div
                key={conversation.id}
                className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden hover:bg-white/10 transition-colors"
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => toggleExpand(conversation.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        {conversation.lead ? (
                          <Link
                            href={`/admin/leads/${conversation.lead.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-white font-medium hover:text-[#00b8fd] transition-colors"
                          >
                            {conversation.lead.name || "Unknown"}
                          </Link>
                        ) : (
                          <span className="text-white/40">Unknown Lead</span>
                        )}
                        {conversation.lead && (
                          <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(conversation.lead.status)}`}>
                            {conversation.lead.status}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(conversation.status)}`}>
                          {conversation.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mt-1">
                        {conversation.lead?.business && (
                          <span className="text-white/40 text-xs flex items-center gap-1">
                            <Building2 size={12} />
                            {conversation.lead.business}
                          </span>
                        )}
                        {conversation.lead?.email && (
                          <span className="text-white/40 text-xs flex items-center gap-1">
                            <Mail size={12} />
                            {conversation.lead.email}
                          </span>
                        )}
                        {conversation.lead?.whatsapp && (
                          <span className="text-white/40 text-xs flex items-center gap-1">
                            <Phone size={12} />
                            {conversation.lead.whatsapp}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 text-white/60 text-sm">
                        {getMessagePreview(conversation.messages || [])}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 ml-4 flex-shrink-0">
                      <span className="text-white/30 text-xs flex items-center gap-1">
                        <MessageSquare size={12} />
                        {messageCount} messages
                      </span>
                      <span className="text-white/20 text-xs">
                        {formatDate(conversation.createdAt)}
                      </span>
                      <span className="text-white/20 text-[10px]">
                        {new Date(conversation.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expanded Messages */}
                {isExpanded && conversation.messages && conversation.messages.length > 0 && (
                  <div className="border-t border-white/10 p-4 bg-white/5">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {conversation.messages.map((message) => (
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
            );
          })
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <span className="text-white/40 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}