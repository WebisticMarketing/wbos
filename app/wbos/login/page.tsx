// app/wbos/login/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Mail, Lock, Sparkles } from "lucide-react";

// ============================================================
// 🔐 Login Form Component
// ============================================================
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "suspended") {
      setError("Your business account has been suspended. Please contact your administrator.");
    }

    const registered = searchParams.get("registered");
    if (registered === "true") {
      setSuccess("Account created successfully! Please log in.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("🔐 [LOGIN PAGE] Attempting login for:", email);
      
      const response = await fetch("/api/wbos/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      console.log("🔐 [LOGIN PAGE] Response status:", response.status);
      const data = await response.json();
      console.log("🔐 [LOGIN PAGE] Response data:", data);

      if (!response.ok) {
        const errorMsg = data.error || data.details || "Login failed";
        console.error("🔐 [LOGIN PAGE] Login failed:", errorMsg);
        setError(errorMsg);
        setLoading(false);
        return;
      }

      console.log("🔐 [LOGIN PAGE] Login successful, redirecting to:", `/wbos/${data.user.slug}`);
      
      // Force a full page reload to ensure cookies are properly set
      window.location.href = `/wbos/${data.user.slug}`;
    } catch (error) {
      console.error("🔐 [LOGIN PAGE] Unexpected error:", error);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-8">
            {/* Logo & Brand */}
            <div className="text-center mb-8">
              <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-200 mb-4">
                {/* ✅ Custom WBOS Logo Image */}
                <img
                  src="/wbos-logo.png"
                  alt="WBOS Logo"
                  className="w-14 h-14 object-contain"
                />
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                </div>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                WBOS
              </h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                Webistic Business Operating System
              </p>
            </div>

            {/* Welcome Text */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Welcome back</h2>
              <p className="text-sm text-gray-500">Sign in to access your business dashboard</p>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-3 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none placeholder:text-gray-400"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link
                    href="/wbos/forgot-password"
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none placeholder:text-gray-400"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">
                Don't have an account?{" "}
                <span className="text-indigo-600 font-medium">Contact your administrator</span>
              </p>
            </div>
          </div>
        </div>

        {/* Version */}
        <p className="text-center text-xs text-gray-400 mt-4">WBOS v1.0.0 • Secure • Enterprise</p>
      </div>
    </div>
  );
}

// ============================================================
// 📄 Main Page with Suspense Boundary
// ============================================================
export default function WbosLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 p-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-200 mb-4">
              <img
                src="/wbos-logo.png"
                alt="WBOS Logo"
                className="w-14 h-14 object-contain"
              />
            </div>
            <div className="animate-pulse">
              <div className="h-8 w-32 bg-gray-200 rounded-lg mx-auto mb-2"></div>
              <div className="h-4 w-48 bg-gray-200 rounded-lg mx-auto"></div>
            </div>
            <p className="text-sm text-gray-400 mt-4">Loading...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}