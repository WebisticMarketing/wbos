// app/admin/projects/[id]/recurring/new/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  X,
  DollarSign,
  Calendar,
  Clock,
} from "lucide-react";

export default function AddRecurringPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [formData, setFormData] = useState({
    amount: "",
    frequency: "monthly",
    nextPaymentDate: new Date().toISOString().split("T")[0],
    status: "active",
    notes: "",
  });

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem("admin-token");
      const response = await fetch(`/api/admin/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProjectName(data.project.name);
        setClientName(data.project.client.name);
      }
    } catch (error) {
      console.error("Error fetching project:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("admin-token");
      
      const requestBody = {
        projectId: id,
        amount: parseFloat(formData.amount),
        frequency: formData.frequency,
        nextPaymentDate: formData.nextPaymentDate,
        status: formData.status,
        notes: formData.notes || null,
      };

      const response = await fetch("/api/admin/projects/recurring", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to add recurring payment");
      }

      router.push(`/admin/projects/${id}`);
    } catch (error: any) {
      console.error("Error adding recurring payment:", error);
      alert(error.message || "Failed to add recurring payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/admin/projects/${id}`}
          className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Add Recurring Payment</h1>
          <p className="text-white/50 text-sm">
            {projectName || "Loading..."} • {clientName || ""}
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-white/60 text-sm mb-1.5">
                Amount (£) *
              </label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-1.5">
                Frequency *
              </label>
              <div className="relative">
                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-1.5">
                Next Payment Date *
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="date"
                  value={formData.nextPaymentDate}
                  onChange={(e) => setFormData({ ...formData, nextPaymentDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-1.5">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#0068e3] transition-colors resize-none"
                placeholder="Add any notes about this recurring payment..."
              />
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <button
                type="submit"
                disabled={loading || !formData.amount}
                className="px-6 py-2.5 rounded-xl bg-[#0068e3] hover:bg-[#0068e3]/80 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={16} />
                {loading ? "Saving..." : "Add Recurring Payment"}
              </button>
              <Link
                href={`/admin/projects/${id}`}
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