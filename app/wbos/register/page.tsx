// app/wbos/register/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

// ============================================================
// 🔐 Register Form Component (uses useSearchParams)
// ============================================================
function RegisterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inviteData, setInviteData] = useState<{
    businessName: string;
    email: string;
    name: string;
  } | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("No invitation token found. Please check your link.");
      setLoading(false);
      return;
    }

    fetch(`/api/wbos/invitations/validate?token=${token}`)
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          // Handle specific error messages
          if (data.error === "Invitation already used") {
            // ✅ Friendly message instead of throwing
            setError("This invitation has already been used. Please log in.");
            setLoading(false);
            return;
          }
          throw new Error(data.error || `Validation failed (${res.status})`);
        }

        return data;
      })
      .then((data) => {
        if (data) {
          console.log("✅ Validation success:", data);
          setInviteData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("❌ Validation error:", err);
        setError(err.message || "Invalid or expired invitation");
        setLoading(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/wbos/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to accept invitation");
      }

      router.push("/wbos/login?registered=true");
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // ✅ Show error with "Go to Login" button
  if (error || !inviteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 text-lg font-semibold">❌ {error || "Invalid invitation"}</div>
          <p className="text-sm text-gray-500 mt-2">
            {error === "This invitation has already been used. Please log in."
              ? "Your account is already active. Please log in below."
              : "The invitation link may have expired or been used already."}
          </p>
          <Link
            href="/wbos/login"
            className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome to WBOS</h1>
          <p className="text-gray-600">
            You've been invited to join <strong>{inviteData.businessName}</strong>
          </p>
          <p className="text-sm text-gray-500 mt-1">{inviteData.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Create Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Minimum 6 characters"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Confirm your password"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {submitting ? "Setting up..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <Link href="/wbos/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

// ============================================================
// 📄 Main Page with Suspense Boundary
// ============================================================
export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded-lg mx-auto mb-4"></div>
            <div className="h-4 w-64 bg-gray-200 rounded-lg mx-auto"></div>
          </div>
          <p className="text-sm text-gray-400 mt-4">Loading registration...</p>
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}