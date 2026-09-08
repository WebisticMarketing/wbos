// app/admin/wbos/create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Building2, Mail, Phone, MapPin, Globe, User, Briefcase } from "lucide-react";

export default function CreateBusinessPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Business fields
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [brandColor, setBrandColor] = useState("#2563eb");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [currency, setCurrency] = useState("PKR");

  // Owner (Client) fields – this is the only person section
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");

  const industries = [
    "Transportation",
    "Travel & Tourism",
    "Real Estate",
    "Retail",
    "Healthcare",
    "Education",
    "Technology",
    "Food & Beverage",
    "Manufacturing",
    "Construction",
    "Logistics",
    "Other",
  ];

  const currencies = ["PKR", "USD", "EUR", "GBP", "AED", "SAR"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate required fields
    if (!name || !industry || !ownerName || !ownerEmail) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    // Basic email validation
    if (!ownerEmail.includes("@")) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("admin-token");

      // Prepare form data – we use owner fields as client fields
      const payload = {
        name,
        industry,
        logo: null, // We'll handle logo upload separately if needed
        brandColor,
        email,
        phone,
        address,
        website,
        currency,
        timezone: "Asia/Karachi",
        clientName: ownerName,    // ✅ Owner becomes the client
        clientEmail: ownerEmail,  // ✅ Owner email is client email
        ownerName,
        ownerEmail,
      };

      const res = await fetch("/api/admin/wbos/businesses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create business");
      }

      setSuccess("Business created successfully! Invitation sent to owner.");
      setTimeout(() => {
        router.push("/admin/wbos");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/wbos" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-white/40" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Create Business</h1>
          <p className="text-sm text-white/40">Set up a new business on WBOS</p>
        </div>
      </div>

      {/* Error / Success messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-400">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 border border-white/10 rounded-lg p-6">
        {/* Business Details */}
        <div>
          <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Business Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Business Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white/60 mb-1.5">
                Business Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0068e3] focus:ring-1 focus:ring-[#0068e3]"
                placeholder="e.g., Sadaat Travels"
                required
              />
            </div>

            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Business Logo</label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setLogo(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-[#0068e3]/20 file:text-white file:text-sm hover:file:bg-[#0068e3]/30 transition-colors"
              />
              <p className="text-xs text-white/30 mt-1">PNG, JPG, or WEBP (max 2MB)</p>
            </div>

            {/* Brand Color */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Brand Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0068e3] focus:ring-1 focus:ring-[#0068e3]"
                  placeholder="#2563eb"
                />
              </div>
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">
                Industry <span className="text-red-400">*</span>
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0068e3] focus:ring-1 focus:ring-[#0068e3]"
                required
              >
                <option value="">Select industry</option>
                {industries.map((ind) => (
                  <option key={ind} value={ind} className="bg-[#0a1628]">
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0068e3] focus:ring-1 focus:ring-[#0068e3]"
              >
                {currencies.map((c) => (
                  <option key={c} value={c} className="bg-[#0a1628]">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0068e3] focus:ring-1 focus:ring-[#0068e3]"
                placeholder="business@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0068e3] focus:ring-1 focus:ring-[#0068e3]"
                placeholder="+92-300-1234567"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white/60 mb-1.5">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0068e3] focus:ring-1 focus:ring-[#0068e3]"
                placeholder="Business address"
              />
            </div>

            {/* Website */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white/60 mb-1.5">Website (optional)</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0068e3] focus:ring-1 focus:ring-[#0068e3]"
                placeholder="https://example.com"
              />
            </div>
          </div>
        </div>

        {/* Owner (Client) Section – just one person */}
        <div className="border-t border-white/10 pt-6">
          <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">
            Business Owner <span className="text-xs text-white/30">(This person will receive the invitation email)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">
                Owner Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0068e3] focus:ring-1 focus:ring-[#0068e3]"
                placeholder="e.g., Ahmed Khan"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">
                Owner Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0068e3] focus:ring-1 focus:ring-[#0068e3]"
                placeholder="owner@example.com"
                required
              />
            </div>
          </div>
          <p className="text-xs text-white/30 mt-3">
            An invitation email will be sent to this email address with a link to set up the account.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-white/10">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-[#0068e3] to-[#00b8fd] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Business"
            )}
          </button>
          <Link
            href="/admin/wbos"
            className="px-6 py-2.5 border border-white/10 text-white/60 rounded-lg hover:bg-white/5 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}