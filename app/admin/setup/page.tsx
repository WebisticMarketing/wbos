// app/admin/setup/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminSetup() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ message?: string; error?: string } | null>(null);
  const router = useRouter();

  const handleSetup = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/setup", {
        method: "POST",
      });
      const data = await response.json();
      setResult(data);
      
      if (data.message) {
        setTimeout(() => {
          router.push("/admin/login");
        }, 2000);
      }
    } catch (error) {
      setResult({ error: "Failed to create admin" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Admin Setup</h1>
        <p className="text-white/60 text-sm mb-6">
          Create the initial admin user for your CRM.
        </p>

        {result && (
          <div className={`mb-4 p-3 rounded-xl text-sm ${result.error ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
            {result.error || result.message}
          </div>
        )}

        <button
          onClick={handleSetup}
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#0068e3] to-[#00b8fd] text-white px-6 py-3 rounded-xl text-sm font-medium hover:from-[#0052b3] hover:to-[#0068e3] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating..." : "Create Admin User"}
        </button>

        <p className="text-white/30 text-xs mt-4">
          Default: admin@webistic.co / admin123
        </p>
      </div>
    </div>
  );
}
