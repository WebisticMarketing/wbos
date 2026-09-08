"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, UserMinus, WalletCards } from "lucide-react";

interface ExpenseUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  monthlyTotal: number;
  expenses: { id: string; amount: string | number; category: string; description: string; expenseDate: string }[];
}

const monthValue = () => new Date().toISOString().slice(0, 7);

export default function PersonalExpensesPage() {
  const [month, setMonth] = useState(monthValue());
  const [users, setUsers] = useState<ExpenseUser[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPerson, setNewPerson] = useState({ name: "", email: "", role: "Manager" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/wbos/sadaat/personal-expenses?month=${month}`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load expenses");
        setUsers(data.users || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [month]);

  const total = users.reduce((sum, user) => sum + Number(user.monthlyTotal), 0);

  const updateMembership = async (userId: string) => {
    setError("");
    const response = await fetch("/api/wbos/sadaat/personal-expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action: "remove" }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Could not update tracker people");
      return;
    }
    const refreshed = await fetch(`/api/wbos/sadaat/personal-expenses?month=${month}`, { cache: "no-store" });
    const refreshedData = await refreshed.json();
    setUsers(refreshedData.users || []);
  };

  const createPerson = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/wbos/sadaat/personal-expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", ...newPerson }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Could not create person");
      return;
    }
    setNewPerson({ name: "", email: "", role: "Manager" });
    setShowCreateForm(false);
    const refreshed = await fetch(`/api/wbos/sadaat/personal-expenses?month=${month}`, { cache: "no-store" });
    const refreshedData = await refreshed.json();
    setUsers(refreshedData.users || []);
  };

  return (
    <main className="expense-light-page min-h-screen overflow-x-hidden bg-gray-50 px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3 text-blue-600">
              <WalletCards className="h-6 w-6" />
              <span className="text-sm font-semibold uppercase tracking-wider">Separate tracking</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Personal Expenses</h1>
            <p className="mt-2 max-w-2xl text-gray-500">Manager, Owner, and Other spending, kept separate from the business expense totals.</p>
          </div>
          <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm">
            <CalendarDays className="h-4 w-4 text-gray-400" />
            <span className="sr-only">Select month</span>
            <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="bg-transparent font-medium outline-none" />
          </label>
        </header>

        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Combined personal expenses for {month}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">Rs {total.toLocaleString()}</p>
        </div>

        <div className="mb-8 flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:flex-row sm:items-center sm:p-5">
          <div>
            <h2 className="font-semibold text-gray-900">Manage tracker people</h2>
            <p className="mt-1 text-sm text-gray-600">Add or remove Manager, Owner, and Other trackers without changing their WBOS accounts.</p>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={() => setShowCreateForm((open) => !open)} className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100">
              {showCreateForm ? "Close" : "New person"}
            </button>
          </div>
        </div>

        {showCreateForm && (
          <form onSubmit={createPerson} className="mb-8 grid gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:grid-cols-[1fr_1fr_160px_auto] sm:items-end">
            <label className="text-sm font-medium text-gray-700">Name<input required value={newPerson.name} onChange={(event) => setNewPerson({ ...newPerson, name: event.target.value })} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 font-normal outline-none focus:border-blue-500" /></label>
            <label className="text-sm font-medium text-gray-700">Email<input required type="email" value={newPerson.email} onChange={(event) => setNewPerson({ ...newPerson, email: event.target.value })} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 font-normal outline-none focus:border-blue-500" /></label>
            <label className="text-sm font-medium text-gray-700">Role<select value={newPerson.role} onChange={(event) => setNewPerson({ ...newPerson, role: event.target.value })} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 font-normal outline-none focus:border-blue-500"><option>Manager</option><option>Owner</option><option>Other</option></select></label>
            <button type="submit" className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">Create tracker</button>
          </form>
        )}

        {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-500">Loading expense trackers...</div>
        ) : users.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">No active Manager or Owner accounts found.</div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {users.map((user) => (
              <div key={user.id} className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md sm:p-6">
                <Link href={`/wbos/sadaat/personal-expenses/${user.id}`} className="group block">
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">{user.roles.join(" / ")}</span>
                    <h2 className="mt-2 truncate text-xl font-semibold text-gray-900">{user.name}</h2>
                    <p className="mt-1 truncate text-sm text-gray-500">{user.email}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-300 transition-colors group-hover:text-blue-600" />
                </div>
                <div className="mt-8 flex items-end justify-between border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-sm text-gray-500">This month</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">Rs {Number(user.monthlyTotal).toLocaleString()}</p>
                  </div>
                  <span className="text-sm font-medium text-blue-600">View expenses</span>
                </div>
                </Link>
                <button type="button" onClick={() => updateMembership(user.id)} className="mt-4 flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-red-600">
                  <UserMinus className="h-3.5 w-3.5" /> Remove from tracker
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}