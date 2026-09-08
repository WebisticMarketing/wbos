// app/wbos/sadaat/buses/[busId]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bus, Loader2, Save } from "lucide-react";

interface Bus {
  id: string;
  busNumber: string;
  numberPlate: string;
  name: string;
  capacity: number;
  status: string;
}

export default function EditBusPage() {
  const params = useParams();
  const router = useRouter();
  const busId = params.busId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState<Partial<Bus>>({});

  useEffect(() => {
    fetchBus();
  }, [busId]);

  const fetchBus = async () => {
    try {
      const res = await fetch(`/api/wbos/sadaat/buses/${busId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setFormData(data);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to load bus");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const capacityValue = typeof formData.capacity === 'string' 
        ? parseInt(formData.capacity) 
        : formData.capacity || 0;

      const res = await fetch(`/api/wbos/sadaat/buses/${busId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numberPlate: formData.numberPlate,
          name: formData.name,
          capacity: capacityValue,
          status: formData.status,
        }),
      });

      if (!res.ok) throw new Error("Failed to update");

      setSuccess("Bus updated successfully!");
      setTimeout(() => {
        router.push(`/wbos/sadaat/buses/${busId}`);
      }, 1500);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to update bus");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-white">
        <div className="text-gray-500">Loading bus details...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6 bg-white min-h-screen">
      <div className="flex items-center gap-4">
        <Link
          href={`/wbos/sadaat/buses/${busId}`}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Bus</h1>
          <p className="text-sm text-gray-500">Update bus details</p>
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

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bus Number (Auto-generated)
            </label>
            <input
              type="text"
              value={formData.busNumber || ""}
              disabled
              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number Plate <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="numberPlate"
              required
              value={formData.numberPlate || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="e.g., ABC-123"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bus Name (optional)
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="e.g., Green Line"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="capacity"
              required
              min="1"
              value={formData.capacity || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="e.g., 45"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status || "active"}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
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
            href={`/wbos/sadaat/buses/${busId}`}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}