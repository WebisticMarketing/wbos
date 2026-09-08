// app/wbos/sadaat/cargo/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Package, Loader2, Trash2, Edit } from "lucide-react";
import { Skeleton } from "@/app/components/ui/Skeleton";

interface CargoRecord {
  id: string;
  date: string;
  description: string;
  profit: number;
  notes: string | null;
  createdAt: string;
}

export default function CargoPage() {
  const [records, setRecords] = useState<CargoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    description: "",
    profit: "",
    notes: "",
    date: "",
  });

  useEffect(() => {
    fetchUserAndData();
  }, []);

  const fetchUserAndData = async () => {
    try {
      // 🔹 Set document title
      const meRes = await fetch("/api/wbos/auth/me");
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData.user?.businessName) {
          document.title = `${meData.user.businessName} – Cargo`;
        }
      }

      const res = await fetch("/api/wbos/sadaat/cargo");
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      } else {
        setError("Failed to load cargo records");
      }
    } catch (error) {
      console.error("Error fetching cargo:", error);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({ description: "", profit: "", notes: "", date: "" });
    setEditingId(null);
    setError("");
    setSuccess("");
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    // Validate
    if (!formData.description || !formData.profit) {
      setError("Description and profit are required");
      setSaving(false);
      return;
    }

    const payload = {
      description: formData.description,
      profit: parseFloat(formData.profit) || 0,
      notes: formData.notes || null,
      date: formData.date || new Date().toISOString().split("T")[0],
    };

    try {
      const url = editingId
        ? `/api/wbos/sadaat/cargo/${editingId}`
        : "/api/wbos/sadaat/cargo";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save record");
        setSaving(false);
        return;
      }

      setSuccess(editingId ? "Record updated!" : "Record added!");
      resetForm();
      fetchUserAndData();
    } catch (error) {
      setError("Something went wrong");
      setSaving(false);
    }
  };

  const handleEdit = (record: CargoRecord) => {
    setEditingId(record.id);
    setFormData({
      description: record.description,
      profit: record.profit.toString(),
      notes: record.notes || "",
      date: record.date.split("T")[0],
    });
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      const res = await fetch(`/api/wbos/sadaat/cargo/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSuccess("Record deleted");
        fetchUserAndData();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete");
      }
    } catch (error) {
      setError("Something went wrong");
    }
  };

  // 🟨 Loading state with skeleton
  if (loading) {
    return (
      <div className="space-y-6 p-6 bg-white min-h-screen">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div>
              <Skeleton className="h-7 w-40 rounded-lg" />
              <Skeleton className="h-4 w-32 rounded-lg mt-1" />
            </div>
          </div>
          <Skeleton className="w-32 h-10 rounded-lg" />
        </div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <Skeleton className="h-5 w-32 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
          <div className="divide-y divide-gray-100">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-40 rounded mb-1.5" />
                  <Skeleton className="h-3 w-32 rounded" />
                </div>
                <Skeleton className="h-4 w-16 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalProfit = records.reduce((sum, r) => sum + r.profit, 0);

  return (
    <div className="space-y-6 p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/wbos/sadaat"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cargo</h1>
            <p className="text-sm text-gray-500">
              {records.length} records · Total Profit: {formatCurrency(totalProfit)}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Record
        </button>
      </div>

      {/* Success/Error */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {success}
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            {editingId ? "Edit Cargo Record" : "Add Cargo Record"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="e.g., Karachi shipment"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profit *
                </label>
                <input
                  type="number"
                  name="profit"
                  required
                  value={formData.profit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="0"
                  step="0.01"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                rows={2}
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Additional notes"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : editingId ? "Update" : "Save"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Records Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>No cargo records yet</p>
                    <p className="text-sm text-gray-400">Add your first record to get started</p>
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {record.description}
                      {record.notes && (
                        <span className="block text-xs text-gray-500">{record.notes}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-medium text-green-600">
                      {formatCurrency(record.profit)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(record)}
                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}