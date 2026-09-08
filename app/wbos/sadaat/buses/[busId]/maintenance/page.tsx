// app/wbos/sadaat/buses/[busId]/maintenance/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Wrench, Edit, Calendar } from "lucide-react";

interface MaintenanceRecord {
  id: string;
  maintenanceDate: string;
  type: string;
  description: string;
  cost: number;
  notes: string;
}

export default function MaintenancePage() {
  const params = useParams();
  const busId = params.busId as string;
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [bus, setBus] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [busId]);

  const fetchData = async () => {
    try {
      const [busRes, recordsRes] = await Promise.all([
        fetch(`/api/wbos/sadaat/buses/${busId}`),
        fetch(`/api/wbos/sadaat/buses/${busId}/maintenance`),
      ]);

      if (busRes.ok) {
        const busData = await busRes.json();
        setBus(busData);
      }

      if (recordsRes.ok) {
        const data = await recordsRes.json();
        setRecords(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    const num = typeof amount === 'number' ? amount : parseFloat(amount);
    if (isNaN(num) || num === 0) return "Rs 0";
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const totalCost = records.reduce((sum, r) => {
    const cost = typeof r.cost === 'number' ? r.cost : parseFloat(r.cost) || 0;
    return sum + cost;
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-white">
        <div className="text-gray-500">Loading maintenance records...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/wbos/sadaat/buses/${busId}`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Maintenance</h1>
            <p className="text-sm text-gray-500">
              {bus?.busNumber} — {bus?.numberPlate}
            </p>
          </div>
        </div>
        <Link
          href={`/wbos/sadaat/buses/${busId}/maintenance/create`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Maintenance
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
          <p className="text-sm text-yellow-600">Total Maintenance Records</p>
          <p className="text-xl font-bold text-yellow-700">{records.length}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
          <p className="text-sm text-red-600">Total Cost</p>
          <p className="text-xl font-bold text-red-700">{formatCurrency(totalCost)}</p>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {records.length === 0 ? (
          <div className="text-center py-12">
            <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No maintenance records yet</p>
            <Link
              href={`/wbos/sadaat/buses/${busId}/maintenance/create`}
              className="inline-block mt-3 text-blue-600 hover:text-blue-700 text-sm"
            >
              Add your first maintenance record
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cost</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(record.maintenanceDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                        {record.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.description || "—"}</td>
                    <td className="px-6 py-4 text-sm text-right text-red-600 font-medium">
                      {formatCurrency(record.cost)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}