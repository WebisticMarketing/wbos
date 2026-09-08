// app/admin/templates/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  Search,
  Mail,
  MessageSquare,
  Copy,
  Check,
  ChevronDown,
  X,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  content: string;
  type: "email" | "whatsapp" | "both";
  category: string;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  "Lead Follow-up",
  "Consultation Confirmation",
  "Proposal",
  "Invoice",
  "Payment Reminder",
  "Project Completed",
  "Review Request",
  "Welcome",
  "Onboarding",
  "Newsletter",
];

const TEMPLATE_TYPES = [
  { value: "email", label: "Email", icon: Mail },
  { value: "whatsapp", label: "WhatsApp", icon: MessageSquare },
  { value: "both", label: "Both", icon: Copy },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, [search, categoryFilter]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin-token");
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (categoryFilter) params.append("category", categoryFilter);

      const response = await fetch(`/api/admin/templates?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch templates");

      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const token = localStorage.getItem("admin-token");
      const response = await fetch(`/api/admin/templates/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete template");
      fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      alert("Failed to delete template");
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getTypeIcon = (type: string) => {
    const found = TEMPLATE_TYPES.find(t => t.value === type);
    if (found) {
      const Icon = found.icon;
      return <Icon size={14} />;
    }
    return null;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Templates</h1>
          <p className="text-white/50 text-sm">
            Manage communication templates for emails and WhatsApp
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-[#0068e3] hover:bg-[#0068e3]/80 text-white text-sm transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            New Template
          </button>
          <button
            onClick={fetchTemplates}
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
            placeholder="Search templates..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#0068e3] transition-colors text-sm"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors text-sm"
          >
            <span>Category</span>
            {categoryFilter || "All"}
            <ChevronDown size={14} />
          </button>
          {showCategoryDropdown && (
            <div className="absolute top-full left-0 mt-1 w-48 rounded-xl bg-[#0b1120] border border-white/10 shadow-xl z-50 py-1 max-h-60 overflow-y-auto">
              <button
                onClick={() => {
                  setCategoryFilter("");
                  setShowCategoryDropdown(false);
                }}
                className="w-full px-4 py-2 text-left text-white/60 hover:text-white hover:bg-white/5 text-sm"
              >
                All Categories
              </button>
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setCategoryFilter(category);
                    setShowCategoryDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-white/60 hover:text-white hover:bg-white/5 text-sm"
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-12 text-center">
          <div className="text-white/40">Loading templates...</div>
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-12 text-center">
          <FileText size={32} className="mx-auto mb-3 text-white/20" />
          <p className="text-white/40">
            {search || categoryFilter
              ? "No templates match your filters."
              : "No templates yet. Create your first template."}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-block mt-4 px-4 py-2 rounded-xl bg-[#0068e3] text-white text-sm hover:bg-[#0068e3]/80 transition-colors"
          >
            Create Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-5 hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium truncate">
                      {template.name}
                    </h3>
                    <span className="text-white/30 text-xs flex items-center gap-1">
                      {getTypeIcon(template.type)}
                      <span className="capitalize">{template.type}</span>
                    </span>
                  </div>
                  <p className="text-white/40 text-xs mt-1">
                    {template.category}
                  </p>
                </div>
                <div className="flex items-center gap-1 ml-4 flex-shrink-0">
                  <button
                    onClick={() => handleCopy(template.content, template.id)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                  >
                    {copiedId === template.id ? (
                      <Check size={14} className="text-emerald-400" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedTemplate(template)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-white/40 text-xs line-clamp-2">
                  {template.content.slice(0, 100)}...
                </p>
              </div>

              <div className="flex items-center justify-between mt-3">
                <span className="text-white/20 text-xs">
                  Updated {formatDate(template.updatedAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Template Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-[#0b1120] border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-bold text-lg">
                  {selectedTemplate.name}
                </h3>
                <p className="text-white/40 text-sm">
                  {selectedTemplate.category} • {selectedTemplate.type}
                </p>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 max-h-96 overflow-y-auto">
              <p className="text-white/80 whitespace-pre-wrap">
                {selectedTemplate.content}
              </p>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => handleCopy(selectedTemplate.content, selectedTemplate.id)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-colors flex items-center gap-2"
              >
                <Copy size={16} />
                Copy Content
              </button>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}