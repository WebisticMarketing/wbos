// app/admin/conversations/[id]/page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Zap, Calendar, Clock } from "lucide-react";

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  sessionId: string;
  status: string;
  createdAt: string;
  lead: {
    id: string;
    name: string | null;
    business: string | null;
    email: string | null;
    whatsapp: string | null;
    service: string | null;
    goal: string | null;
  } | null;
  messages: Message[];
}

export default function ConversationDetailPage() {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchConversation();
  }, [id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation?.messages]);

  const fetchConversation = async () => {
    try {
      const token = localStorage.getItem("admin-token");
      const response = await fetch(`/api/admin/conversations/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }
      
      const data = await response.json();
      setConversation(data.conversation);
    } catch (error) {
      console.error("Failed to fetch conversation:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/60">Loading conversation...</div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60">Conversation not found</p>
        <Link href="/admin/conversations" className="text-[#00b8fd] hover:underline text-sm mt-2 inline-block">
          ← Back to Conversations
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Back button */}
      <Link
        href="/admin/conversations"
        className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6 text-sm"
      >
        <ArrowLeft size={16} />
        Back to Conversations
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {conversation.lead?.name || "Unknown Visitor"}
          </h1>
          {conversation.lead?.business && (
            <p className="text-white/60 text-sm">{conversation.lead.business}</p>
          )}
          <div className="flex items-center gap-4 mt-2">
            <span className="text-white/40 text-xs flex items-center gap-1">
              <Calendar size={14} />
              {new Date(conversation.createdAt).toLocaleString()}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${conversation.status === "completed" ? "bg-emerald-500/20 text-emerald-400" : "bg-yellow-500/20 text-yellow-400"}`}>
              {conversation.status === "completed" ? "Completed" : "Active"}
            </span>
          </div>
        </div>
        {conversation.lead && (
          <Link
            href={`/admin/leads/${conversation.lead.id}`}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
          >
            View Lead Details →
          </Link>
        )}
      </div>

      {/* Messages */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
        <div className="p-4 max-h-[500px] overflow-y-auto">
          <div className="space-y-4">
            {conversation.messages
              .filter(m => m.role !== "system")
              .map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[75%]">
                    <div className={`flex items-center gap-2 mb-1 ${msg.role === "user" ? "justify-end" : ""}`}>
                      <span className="text-white/30 text-xs">
                        {msg.role === "user" ? "👤 User" : "🤖 Webistic AI"}
                      </span>
                      <span className="text-white/20 text-xs">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-[#0068e3] to-[#00b8fd] text-white rounded-tr-none"
                          : "bg-white/10 text-white/90 rounded-tl-none border border-white/10"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Lead info at bottom */}
      {conversation.lead && (
        <div className="mt-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
          <h3 className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">Lead Information</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-white/30 text-xs">Name</p>
              <p className="text-white">{conversation.lead.name || "—"}</p>
            </div>
            <div>
              <p className="text-white/30 text-xs">Business</p>
              <p className="text-white">{conversation.lead.business || "—"}</p>
            </div>
            <div>
              <p className="text-white/30 text-xs">Service</p>
              <p className="text-white">{conversation.lead.service || "—"}</p>
            </div>
            <div>
              <p className="text-white/30 text-xs">Goal</p>
              <p className="text-white">{conversation.lead.goal || "—"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
