// app/wbos/sadaat/installments/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Skeleton } from "@/app/components/ui/Skeleton";

interface Installment {
  id: string;
  name: string;
  type: string;
  assetCount: number;
  totalAmount: number | null;
  monthlyDeduction: number;
  startDate: string | null;
  dueDay: number | null;
  lenderName: string | null;
  referenceNumber: string | null;
  notes: string | null;
  isActive: boolean;
}

export default function EditInstallmentPage() {
  const params = useParams();
  const router = useRouter();
  const installmentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
    fetchInstallment();
  }, [installmentId]);

  const fetchInstallment = async () => {
    try {
      const res = await fetch(`/api/wbos/sadaat/installments/${installmentId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setFormData({
        name: data.name || "",
        type: data.type || "bus",
        assetCount: data.assetCount?.toString() || "1",
        totalAmount: data.totalAmount !== null ? data.totalAmount.toString() : "",
        monthlyDeduction: data.monthlyDeduction.toString(),
        startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : "",
        dueDay: data.dueDay?.toString() || "",
        lenderName: data.lenderName || "",
        referenceNumber: data.referenceNumber || "",
        notes: data.notes || "",
        isActive: data.isActive !== undefined ? data.isActive : true,
      });
    } catch (error) {
      console.error("Error fetching installment:", error);
      setError("Failed to load installment");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
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

      const res = await fetch(`/api/wbos/sadaat/installments/${installmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, id: installmentId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update installment");
        setSaving(false);
        return;
      }

      setSuccess("Installment updated successfully!");
      setTimeout(() => {
        router.push(`/wbos/sadaat/installments/${installmentId}`);
      }, 1500);
    } catch (error) {
      console.error("Error updating installment:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ✅ SKELETON LOADER
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 p-6 bg-white min-h-screen">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div>
            <Skeleton className="h-7 w-40 rounded-lg" />
            <Skeleton className="h-4 w-32 rounded-lg mt-1" />
          </div>
        </div>

        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-12 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6 bg-white min-h-screen">
      <div className="flex items-center gap-4">
        <Link
          href={`/wbos/sadaat/installments/${installmentId}`}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Installment</h1>
          <p className="text-sm text-gray-500">Update installment details</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
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

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
          <Link
            href={`/wbos/sadaat/installments/${installmentId}`}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}