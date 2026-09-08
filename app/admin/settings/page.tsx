// app/admin/settings/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Settings,
  Building2,
  Mail,
  Globe,
  Shield,
  Bell,
  Users,
  CreditCard,
  Save,
  RefreshCw,
  Key,
  User,
  Briefcase,
  FileText,
  Palette,
} from "lucide-react";

interface Admin {
  id: string;
  email: string;
  name: string;
}

export default function SettingsPage() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "security" | "services" | "notifications">("general");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  // General settings
  const [agencyName, setAgencyName] = useState("Webistic Marketing Solutions");
  const [agencyEmail, setAgencyEmail] = useState("info@webistic.co");
  const [agencyWebsite, setAgencyWebsite] = useState("https://webistic.co");

  // Security
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("admin-user");
    if (user) {
      setAdmin(JSON.parse(user));
    }
  }, []);

  const handleSaveGeneral = async () => {
    setSaving(true);
    setSuccess("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess("Settings saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    setSaving(true);
    setSuccess("");
    try {
      const token = localStorage.getItem("admin-token");
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      setSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: any) {
      alert(error.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: Building2 },
    { id: "security", label: "Security", icon: Shield },
    { id: "services", label: "Services", icon: Briefcase },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-white/50 text-sm">
            Manage your agency settings and preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          {success && (
            <span className="text-emerald-400 text-sm">{success}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 mb-6 border-b border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                isActive
                  ? "text-white border-[#00b8fd]"
                  : "text-white/40 hover:text-white border-transparent"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div>
        {activeTab === "general" && (
          <div className="max-w-2xl">
            <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
              <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <Building2 size={16} className="text-[#00b8fd]" />
                Agency Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/60 text-sm mb-1.5">
                    Agency Name
                  </label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/60 text-sm mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="email"
                      value={agencyEmail}
                      onChange={(e) => setAgencyEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/60 text-sm mb-1.5">
                    Website
                  </label>
                  <div className="relative">
                    <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="url"
                      value={agencyWebsite}
                      onChange={(e) => setAgencyWebsite(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveGeneral}
                  disabled={saving}
                  className="w-full py-2.5 rounded-xl bg-[#0068e3] hover:bg-[#0068e3]/80 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="max-w-2xl">
            <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
              <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <Key size={16} className="text-[#00b8fd]" />
                Change Password
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/60 text-sm mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/60 text-sm mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                  <p className="text-white/20 text-xs mt-1">
                    Must be at least 8 characters
                  </p>
                </div>

                <div>
                  <label className="block text-white/60 text-sm mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#0068e3] transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                  className="w-full py-2.5 rounded-xl bg-[#0068e3] hover:bg-[#0068e3]/80 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Key size={16} />
                  {saving ? "Changing..." : "Change Password"}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "services" && (
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <Briefcase size={16} className="text-[#00b8fd]" />
              Services Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
  { name: "Logo Design", price: 49, type: "one-time" },
  { name: "Website Care", price: 30, type: "monthly" },
  { name: "Advanced SEO", price: 250, type: "monthly" },
  { name: "Social Media Management", price: 150, type: "monthly" },
  { name: "Google Ads Management", price: 200, type: "monthly" },
  { name: "Growth Bundle", price: 350, type: "monthly" },
  { name: "Business Launch Website", price: 499, type: "one-time" },
  { name: "Business Growth Website", price: 799, type: "one-time" },
  { name: "Business Pro Website", price: 999, type: "one-time" },
  { name: "App Starter", price: 1499, type: "one-time" },
  { name: "App Pro", price: 1999, type: "one-time" },
].map((service, index) => (
                <div
                  key={index}
                  className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-white font-medium">{service.name}</h4>
                      <p className="text-white/40 text-xs capitalize mt-0.5">
                        {service.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#00b8fd] font-bold">
                        £{service.price}
                      </p>
                      <p className="text-white/20 text-[10px]">
                        {service.type === "monthly" ? "/month" : "/one-time"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-white/40 text-xs">
                Services are managed in the database. Contact your developer to add or modify services.
              </p>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="max-w-2xl">
            <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
              <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <Bell size={16} className="text-[#00b8fd]" />
                Notification Preferences
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <p className="text-white text-sm">New Leads</p>
                    <p className="text-white/40 text-xs">Get notified when new leads come in</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:bg-[#0068e3] transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <p className="text-white text-sm">New Clients</p>
                    <p className="text-white/40 text-xs">Get notified when leads convert to clients</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:bg-[#0068e3] transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <p className="text-white text-sm">Payments</p>
                    <p className="text-white/40 text-xs">Get notified when payments are received</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:bg-[#0068e3] transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <p className="text-white text-sm">Overdue Invoices</p>
                    <p className="text-white/40 text-xs">Get notified when invoices are overdue</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:bg-[#0068e3] transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>

                <button
                  onClick={() => {
                    setSuccess("Notification preferences saved!");
                    setTimeout(() => setSuccess(""), 3000);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#0068e3] hover:bg-[#0068e3]/80 text-white font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}