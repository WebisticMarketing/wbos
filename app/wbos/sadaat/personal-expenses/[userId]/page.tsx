"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, Plus, WalletCards } from "lucide-react";

interface Expense { id: string; amount: string | number; category: string; description: string; notes?: string | null; expenseDate: string; }
interface User { id: string; name: string; email: string; roles: string[]; }

export default function PersonalExpenseDetailPage() {
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [user, setUser] = useState<User | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [form, setForm] = useState({ amount: "", category: "", description: "", notes: "", expenseDate: new Date().toISOString().slice(0, 10) });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadExpenses = async () => {
    setLoading(true);
    const response = await fetch(`/api/wbos/sadaat/personal-expenses/${params.userId}?month=${month}`, { cache: "no-store" });
    const data = await response.json();
    if (response.ok) { setUser(data.user); setExpenses(data.expenses || []); setMonthlyTotal(Number(data.monthlyTotal || 0)); }
    else setMessage(data.error || "Could not load expenses");
    setLoading(false);
  };

  useEffect(() => { loadExpenses(); }, [params.userId, month]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true); setMessage("");
    const response = await fetch(`/api/wbos/sadaat/personal-expenses/${params.userId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await response.json();
    if (!response.ok) setMessage(data.error || "Could not save expense");
    else { setForm({ amount: "", category: "", description: "", notes: "", expenseDate: new Date().toISOString().slice(0, 10) }); setMessage("Expense added"); await loadExpenses(); }
    setSaving(false);
  };

  return (
    <main className="expense-light-page min-h-screen overflow-x-hidden bg-gray-50 px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <button onClick={() => router.push("/wbos/sadaat/personal-expenses")} className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"><ArrowLeft className="h-4 w-4" /> Back to personal expenses</button>
        <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4"><div className="rounded-2xl bg-blue-600 p-3 text-white"><WalletCards className="h-7 w-7" /></div><div className="min-w-0"><p className="text-sm font-semibold uppercase tracking-wider text-blue-600">{user?.roles.join(" / ") || "Personal tracker"}</p><h1 className="truncate text-2xl font-bold text-gray-900 sm:text-3xl">{user?.name || "Loading..."}</h1><p className="truncate text-gray-500">{user?.email}</p></div></div>
          <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm"><CalendarDays className="h-4 w-4 text-gray-400" /><span className="sr-only">Select month</span><input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="bg-transparent font-medium outline-none" /></label>
        </header>
        {message && <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">{message}</div>}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"><div className="mb-6 flex items-end justify-between"><div><p className="text-sm text-gray-500">Monthly personal total</p><p className="mt-1 text-3xl font-bold text-gray-900">Rs {monthlyTotal.toLocaleString()}</p></div><span className="text-sm text-gray-400">{expenses.length} {expenses.length === 1 ? "expense" : "expenses"}</span></div>{loading ? <p className="py-10 text-center text-gray-500">Loading...</p> : expenses.length === 0 ? <p className="rounded-xl bg-gray-50 py-10 text-center text-gray-500">No expenses recorded for this month.</p> : <div className="space-y-3">{expenses.map((expense) => <div key={expense.id} className="flex min-w-0 items-start justify-between gap-3 rounded-xl border border-gray-100 p-3 sm:gap-4 sm:p-4"><div className="min-w-0"><p className="break-words font-medium text-gray-900">{expense.description}</p><p className="mt-1 text-sm text-gray-500">{expense.category} · {new Date(expense.expenseDate).toLocaleDateString()}</p>{expense.notes && <p className="mt-1 break-words text-xs text-gray-400">{expense.notes}</p>}</div><p className="whitespace-nowrap font-semibold text-gray-900">Rs {Number(expense.amount).toLocaleString()}</p></div>)}</div>}</section>
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"><div className="mb-5 flex items-center gap-2"><Plus className="h-5 w-5 text-blue-600" /><h2 className="text-lg font-semibold text-gray-900">Add expense</h2></div><form onSubmit={submit} className="space-y-4"><input required type="number" min="0.01" step="0.01" placeholder="Amount" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /><input required placeholder="Category, e.g. fuel or travel" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /><input required placeholder="What was it for?" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /><input type="date" value={form.expenseDate} onChange={(event) => setForm({ ...form, expenseDate: event.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /><textarea placeholder="Notes (optional)" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows={3} className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /><button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"><Plus className="h-4 w-4" />{saving ? "Saving..." : "Add expense"}</button></form></section>
        </div>
      </div>
    </main>
  );
}