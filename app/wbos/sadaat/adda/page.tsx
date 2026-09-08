// app/wbos/sadaat/adda/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Building2,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { Skeleton } from "@/app/components/ui/Skeleton";

interface Income {
  id: string;
  date: string;
  amount: number;
  description: string;
  notes: string;
  isCommission: boolean;
}

interface Expense {
  id: string;
  date: string;
  amount: number;
  description: string;
  notes: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

export default function AddaPage() {
  const [income, setIncome] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<"income" | "expense">("income");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [totals, setTotals] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    profit: 0,
  });

  const [formData, setFormData] = useState({
    type: "income",
    amount: "",
    description: "",
    categoryId: "",
    notes: "",
    isCommission: false,
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
          document.title = `${meData.user.businessName} – Adda`;
        }
      }

      const res = await fetch("/api/wbos/sadaat/adda");
      if (res.ok) {
        const data = await res.json();
        setIncome(data.income || []);
        setExpenses(data.expenses || []);
        setCategories(data.categories || []);
        setTotals(data.totals || { totalIncome: 0, totalExpenses: 0, profit: 0 });
      }
    } catch (error) {
      console.error("Error fetching Adda data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value =
      e.target.type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/wbos/sadaat/adda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to add record");
        setSaving(false);
        return;
      }

      setFormData({
        type: "income",
        amount: "",
        description: "",
        categoryId: "",
        notes: "",
        isCommission: false,
      });
      setShowForm(false);
      fetchUserAndData();
    } catch (error) {
      setError("Something went wrong. Please try again.");
      setSaving(false);
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
              <Skeleton className="h-7 w-48 rounded-lg" />
              <Skeleton className="h-4 w-32 rounded-lg mt-1" />
            </div>
          </div>
          <Skeleton className="w-32 h-10 rounded-lg" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
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
            <h1 className="text-2xl font-bold text-gray-900">Adda Management</h1>
            <p className="text-sm text-gray-500">Income, expenses, and commission tracking</p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setFormType("income");
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Record
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <p className="text-sm text-green-600">Total Income</p>
          <p className="text-xl font-bold text-green-700">{formatCurrency(totals.totalIncome)}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
          <p className="text-sm text-red-600">Total Expenses</p>
          <p className="text-xl font-bold text-red-700">{formatCurrency(totals.totalExpenses)}</p>
        </div>
        <div
          className={`rounded-lg p-4 border ${
            totals.profit >= 0
              ? "bg-blue-50 border-blue-100"
              : "bg-red-50 border-red-100"
          }`}
        >
          <p
            className={`text-sm ${
              totals.profit >= 0 ? "text-blue-600" : "text-red-600"
            }`}
          >
            Profit
          </p>
          <p
            className={`text-xl font-bold ${
              totals.profit >= 0 ? "text-blue-700" : "text-red-700"
            }`}
          >
            {formatCurrency(totals.profit)}
          </p>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">
              Add {formType === "income" ? "Income" : "Expense"}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setFormType("income")}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  formType === "income"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                Income
              </button>
              <button
                onClick={() => setFormType("expense")}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  formType === "expense"
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                Expense
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="type" value={formType} />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  name="amount"
                  required
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="0"
                  step="0.01"
                />
              </div>

              {formType === "expense" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="categoryId"
                    required
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formType === "income" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commission
                  </label>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      name="isCommission"
                      checked={formData.isCommission}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">
                      This is commission income
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Brief description"
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
                {saving ? "Saving..." : "Save Record"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Income List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Income Records</h3>
          <span className="text-sm text-gray-500">{income.length} records</span>
        </div>
        {income.length === 0 ? (
          <div className="text-center py-8">
            <Wallet className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No income records</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {income.slice(0, 10).map((record) => (
              <div
                key={record.id}
                className="px-6 py-3 flex items-center justify-between hover:bg-gray-50"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {record.description || "Income"}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{new Date(record.date).toLocaleDateString()}</span>
                    {record.isCommission && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                        Commission
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-sm font-medium text-green-600">
                  {formatCurrency(record.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expense List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Expense Records</h3>
          <span className="text-sm text-gray-500">{expenses.length} records</span>
        </div>
        {expenses.length === 0 ? (
          <div className="text-center py-8">
            <TrendingDown className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No expense records</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {expenses.slice(0, 10).map((record) => (
              <div
                key={record.id}
                className="px-6 py-3 flex items-center justify-between hover:bg-gray-50"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {record.description || record.category?.name || "Expense"}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{new Date(record.date).toLocaleDateString()}</span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                      {record.category?.name}
                    </span>
                  </div>
                </div>
                <div className="text-sm font-medium text-red-600">
                  {formatCurrency(record.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}