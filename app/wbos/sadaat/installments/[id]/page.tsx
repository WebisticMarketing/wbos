// app/wbos/sadaat/installments/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Banknote,
  Calendar,
  Loader2,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Skeleton } from "@/app/components/ui/Skeleton";

interface Payment {
  id: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  referenceNumber: string | null;
  notes: string | null;
  status: string;
  recordedBy: string | null;
  createdAt: string;
}

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
  payments: Payment[];
}

export default function InstallmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const installmentId = params.id as string;

  const [installment, setInstallment] = useState<Installment | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentDate: "",
    paymentMethod: "cash",
    referenceNumber: "",
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, [installmentId]);

  const fetchData = async () => {
    try {
      const [installmentRes, paymentsRes] = await Promise.all([
        fetch(`/api/wbos/sadaat/installments/${installmentId}`),
        fetch(`/api/wbos/sadaat/installments/${installmentId}/payments`),
      ]);

      if (installmentRes.ok) {
        const data = await installmentRes.json();
        setInstallment(data);
      }

      if (paymentsRes.ok) {
        const data = await paymentsRes.json();
        setPayments(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined || isNaN(amount)) return "Not Provided";
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString();
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/wbos/sadaat/installments/${installmentId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentForm),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to record payment");
        setSaving(false);
        return;
      }

      setSuccess("Payment recorded successfully!");
      setPaymentForm({ amount: "", paymentDate: "", paymentMethod: "cash", referenceNumber: "", notes: "" });
      setShowPaymentForm(false);
      fetchData();
    } catch (error) {
      setError("Something went wrong");
      setSaving(false);
    }
  };

  const handleCancelPayment = async (paymentId: string) => {
    if (!confirm("Are you sure you want to cancel this payment?")) return;

    try {
      const res = await fetch(
        `/api/wbos/sadaat/installments/${installmentId}/payments?paymentId=${paymentId}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to cancel payment");
        return;
      }

      setSuccess("Payment cancelled successfully");
      fetchData();
    } catch (error) {
      setError("Something went wrong");
    }
  };

  // ✅ SKELETON LOADER
  if (loading) {
    return (
      <div className="space-y-6 p-6 bg-white min-h-screen">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div>
              <Skeleton className="h-7 w-48 rounded-lg" />
              <div className="flex items-center gap-3 mt-1">
                <Skeleton className="h-5 w-16 rounded" />
                <Skeleton className="h-5 w-16 rounded" />
                <Skeleton className="h-5 w-16 rounded" />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="w-20 h-10 rounded-lg" />
            <Skeleton className="w-32 h-10 rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>

        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (!installment) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-white">
        <div className="text-red-500">Installment not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/wbos/sadaat/installments"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{installment.name}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="px-2 py-0.5 bg-gray-100 rounded">{installment.type}</span>
              <span>{installment.assetCount} assets</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  installment.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {installment.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/wbos/sadaat/installments/${installmentId}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={() => setShowPaymentForm(!showPaymentForm)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Record Payment
          </button>
        </div>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p className="text-sm text-blue-600">Total Amount</p>
          <p className="text-xl font-bold text-blue-700">
            {installment.totalAmount !== null ? formatCurrency(installment.totalAmount) : "Not Provided"}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <p className="text-sm text-green-600">Total Paid</p>
          <p className="text-xl font-bold text-green-700">{formatCurrency(installment.paidAmount)}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
          <p className="text-sm text-yellow-600">Remaining</p>
          <p className="text-xl font-bold text-yellow-700">
            {installment.remainingAmount !== null ? formatCurrency(installment.remainingAmount) : "Not Available"}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
          <p className="text-sm text-red-600">Monthly Installment</p>
          <p className="text-xl font-bold text-red-700">{formatCurrency(installment.monthlyDeduction)}</p>
        </div>
      </div>

      {/* Payment Form */}
      {showPaymentForm && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Record Payment</h3>
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <input
                  type="number"
                  name="amount"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                <input
                  type="date"
                  name="paymentDate"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                name="paymentMethod"
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
              <input
                type="text"
                name="referenceNumber"
                value={paymentForm.referenceNumber}
                onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Transaction reference"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                rows={2}
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Additional notes"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Record Payment
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPaymentForm(false);
                  setError("");
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payment History */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Payment History ({payments.length})
        </h3>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <Banknote className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No payments recorded yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900">{formatDate(payment.paymentDate)}</td>
                      <td className="px-4 py-2 text-sm text-right text-green-600 font-medium">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600 capitalize">{payment.paymentMethod}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{payment.referenceNumber || "—"}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            payment.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        {payment.status === "active" && (
                          <button
                            onClick={() => handleCancelPayment(payment.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}