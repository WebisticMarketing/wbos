// app/admin/clients/[id]/projects/new/page.tsx
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
  DollarSign,
  Clock,
} from "lucide-react";

export default function AddProjectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [clientName, setClientName] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    service: "",
    status: "planning",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    notes: "",
    recurringAmount: "",
    recurringFrequency: "monthly",
  });

  useEffect(() => {
    if (id) {
      fetchClient();
    }
  }, [id]);

  const fetchClient = async () => {
    try {
      const token = localStorage.getItem("admin-token");
      const response = await fetch(`/api/admin/clients/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setClientName(data.client.name);
        if (data.client.service) {
          setFormData(prev => ({ ...prev, service: data.client.service }));
        }
      }
    } catch (error) {
      console.error("Error fetching client:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("admin-token");
      
      const requestBody = {
        client: id,
        name: formData.name,
        description: formData.description || null,
        service: formData.service,
        status: formData.status,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        notes: formData.notes || null,
        recurringPayments: formData.recurringAmount && parseFloat(formData.recurringAmount) > 0 ? [{
          amount: parseFloat(formData.recurringAmount),
          frequency: formData.recurringFrequency,
          nextPaymentDate: formData.startDate,
          status: "active",
        }] : [],
      };

      const response = await fetch("/api/admin/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to create project");
      }

      router.push(`/admin/clients/${id}`);
    } catch (error: any) {
      console.error("Error creating project:", error);
      alert(error.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/admin/clients/${id}`}
          className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">New Project</h1>
          <p className="text-white/50 text-sm">
            {clientName || "Loading..."}
          </p>
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
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                  placeholder="e.g., Website Redesign"
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
                className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#0068e3] transition-colors resize-none"
                placeholder="Describe the project..."
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-1.5">Service *</label>
              <input
                type="text"
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                placeholder="e.g., SEO, Website Design"
                required
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-1.5">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="review">Review</option>
                <option value="client-approval">Client Approval</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/60 text-sm mb-1.5">Start Date *</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-1.5">End Date (Optional)</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <p className="text-white/60 text-sm mb-3">Recurring Payment (Optional)</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/40 text-xs mb-1.5">Amount (£)</label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.recurringAmount}
                      onChange={(e) => setFormData({ ...formData, recurringAmount: e.target.value })}
                      className="w-full pl-8 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white/40 text-xs mb-1.5">Frequency</label>
                  <div className="relative">
                    <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <select
                      value={formData.recurringFrequency}
                      onChange={(e) => setFormData({ ...formData, recurringFrequency: e.target.value })}
                      className="w-full pl-8 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-1.5">Notes (Optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#0068e3] transition-colors resize-none"
                placeholder="Add any notes about this project..."
              />
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <button
                type="submit"
                disabled={loading || !formData.name || !formData.service}
                className="px-6 py-2.5 rounded-xl bg-[#0068e3] hover:bg-[#0068e3]/80 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={16} />
                {loading ? "Creating..." : "Create Project"}
              </button>
              <Link
                href={`/admin/clients/${id}`}
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