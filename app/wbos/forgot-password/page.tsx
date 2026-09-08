// app/wbos/forgot-password/page.tsx
"use client";

import Link from "next/link";
import { ArrowLeft, Mail, Shield } from "lucide-react";

export default function ForgotPasswordPage() {
  const adminEmail = "admin@webistic.co";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-100">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-200 mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">WBOS</h1>
            <p className="text-sm text-gray-500 mt-1">Business Operating System</p>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Forgot Password?</h2>
            <p className="text-sm text-gray-500 mt-2">
              No problem. Please contact your system administrator to reset your password.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center justify-center gap-3 mb-6">
            <Mail className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-700">
              Contact: <span className="font-medium text-blue-600">{adminEmail}</span>
            </span>
          </div>

          <Link
            href="/wbos/login"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>

          <p className="text-center text-xs text-gray-400 mt-6">Secure access • Webistic Business OS</p>
        </div>
      </div>
    </div>
  );
}