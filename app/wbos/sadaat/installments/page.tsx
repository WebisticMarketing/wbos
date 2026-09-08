// app/wbos/sadaat/installments/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Banknote, Edit, Trash2, Loader2 } from "lucide-react";
import { Skeleton } from "@/app/components/ui/Skeleton";

interface Installment {
  id: string;
  name: string;
  type: string;
  assetCount: number;
  totalAmount: number | null;
  paidAmount: number;
  remainingAmount: number | null;
  monthlyDeduction: number;
  startDate: string | null;
  dueDay: number | null;
  lenderName: string | null;
  referenceNumber: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function InstallmentsPage() {
  const router = useRouter();
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [totals, setTotals] = useState({
    totalMonthlyDeduction: 0,
    totalAmount: 0,
    totalPaid: 0,
    totalRemaining: 0,
  });

  const [formData, setFormData] = useState({
    name: "",
    type: "bus",
    assetCount: "1",
    totalAmount: "",
    monthlyDeduction: "",
    startDate: "",
    dueDay: "",
    lenderName: "",
    referenceNumber: "",
    notes: "",
    isActive: true,
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
          document.title = `${meData.user.businessName} – Installments`;
        }
      }

      const res = await fetch("/api/wbos/sadaat/installments");
      if (res.ok) {
        const data = await res.json();
        setInstallments(data.installments || []);
        setTotals(data.totals || { totalMonthlyDeduction: 0, totalAmount: 0, totalPaid: 0, totalRemaining: 0 });
      }
    } catch (error) {
      console.error("Error fetching installments:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined || isNaN(amount)) return "Not Provided";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCurrencyOrDash = (amount: number | null) => {
    if (amount === null || amount === undefined || isNaN(amount)) return "—";
    return formatCurrency(amount);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "bus",
      assetCount: "1",
      totalAmount: "",
      monthlyDeduction: "",
      startDate: "",
      dueDay: "",
      lenderName: "",
      referenceNumber: "",
      notes: "",
      isActive: true,
    });
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        assetCount: formData.assetCount,
        totalAmount: formData.totalAmount || undefined,
        monthlyDeduction: parseFloat(formData.monthlyDeduction) || 0,
        startDate: formData.startDate || null,
        dueDay: formData.dueDay || null,
        lenderName: formData.lenderName || null,
        referenceNumber: formData.referenceNumber || null,
        notes: formData.notes || null,
        isActive: formData.isActive,
      };

      let res;
      if (editingId) {
        res = await fetch("/api/wbos/sadaat/installments", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, id: editingId }),
        });
      } else {
        res = await fetch("/api/wbos/sadaat/installments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save installment");
        setSaving(false);
        return;
      }

      setSuccess(editingId ? "Installment updated successfully!" : "Installment created successfully!");
      resetForm();
      setShowForm(false);
      fetchUserAndData();
    } catch (error) {
      console.error("Error saving installment:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (installment: Installment) => {
    setEditingId(installment.id);
    setFormData({
      name: installment.name,
      type: installment.type,
      assetCount: installment.assetCount?.toString() || "1",
      totalAmount: installment.totalAmount !== null ? installment.totalAmount.toString() : "",
      monthlyDeduction: installment.monthlyDeduction.toString(),
      startDate: installment.startDate ? new Date(installment.startDate).toISOString().split('T')[0] : "",
      dueDay: installment.dueDay?.toString() || "",
      lenderName: installment.lenderName || "",
      referenceNumber: installment.referenceNumber || "",
      notes: installment.notes || "",
      isActive: installment.isActive,
    });
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this installment?")) return;

    try {
      const res = await fetch(`/api/wbos/sadaat/installments?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to cancel installment");
        return;
      }

      setSuccess("Installment cancelled successfully");
      fetchUserAndData();
    } catch (error) {
      console.error("Error cancelling installment:", error);
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900">Installments</h1>
            <p className="text-sm text-gray-500">Track bus and car loan installments</p>
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
          Add Installment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p className="text-sm text-blue-600">Total Amount</p>
          <p className="text-xl font-bold text-blue-700">{formatCurrencyOrDash(totals.totalAmount)}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <p className="text-sm text-green-600">Total Paid</p>
          <p className="text-xl font-bold text-green-700">{formatCurrency(totals.totalPaid)}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
          <p className="text-sm text-yellow-600">Total Remaining</p>
          <p className="text-xl font-bold text-yellow-700">{formatCurrencyOrDash(totals.totalRemaining)}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
          <p className="text-sm text-red-600">Monthly Deduction</p>
          <p className="text-xl font-bold text-red-700">{formatCurrency(totals.totalMonthlyDeduction)}</p>
        </div>
      </div>

      {/* Success/Error Messages */}
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
            {editingId ? "Edit Installment" : "Add Installment"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Installment Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="e.g., Bus Installments"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="bus">Bus</option>
                  <option value="car">Car</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Assets</label>
                <input
                  type="number"
                  name="assetCount"
                  value={formData.assetCount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="e.g., 10"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Installment *</label>
                <input
                  type="number"
                  name="monthlyDeduction"
                  required
                  value={formData.monthlyDeduction}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (optional)</label>
                <input
                  type="number"
                  name="totalAmount"
                  value={formData.totalAmount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Leave empty if unknown"
                  step="0.01"
                />
                <p className="text-xs text-gray-400 mt-1">Leave empty if total amount is unknown</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Day</label>
                <input
                  type="number"
                  name="dueDay"
                  value={formData.dueDay}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="e.g., 10"
                  min="1"
                  max="31"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lender Name</label>
                <input
                  type="text"
                  name="lenderName"
                  value={formData.lenderName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Bank name or lender"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
              <input
                type="text"
                name="referenceNumber"
                value={formData.referenceNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Account or loan reference"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                rows={2}
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Additional notes"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Active</span>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingId ? "Update Installment" : "Save Installment"
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                  setError("");
                  setSuccess("");
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Installments Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {installments.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <Banknote className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No installments added yet</p>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700"
            >
              Add your first installment
            </button>
          </div>
        ) : (
          installments.map((item) => (
            <Link
              key={item.id}
              href={`/wbos/sadaat/installments/${item.id}`}
              className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-blue-200 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{item.type}</span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {item.assetCount} {item.assetCount === 1 ? 'asset' : 'assets'}
                    </span>
                  </div>
                </div>
                {item.isActive ? (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Active</span>
                ) : (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">Cancelled</span>
                )}
              </div>

              <div className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Monthly:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(item.monthlyDeduction)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total:</span>
                  <span className="font-medium text-gray-900">
                    {item.totalAmount !== null ? formatCurrency(item.totalAmount) : "Not Provided"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Paid:</span>
                  <span className="font-medium text-green-600">{formatCurrency(item.paidAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Remaining:</span>
                  <span className="font-medium text-yellow-600">
                    {item.remainingAmount !== null ? formatCurrency(item.remainingAmount) : "Not Available"}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/wbos/sadaat/installments/${item.id}/edit`);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCancel(item.id);
                  }}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                  disabled={!item.isActive}
                >
                  <Trash2 className="w-3 h-3" /> Cancel
                </button>
                <span className="text-xs text-gray-400 ml-auto">Click to view payments</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}