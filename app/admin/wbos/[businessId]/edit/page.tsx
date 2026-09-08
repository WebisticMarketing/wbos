// app/admin/wbos/[businessId]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Loader2, Save } from "lucide-react";

interface Business {
  id: string;
  name: string;
  logo: string;
  industry: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  currency: string;
  timezone: string;
  status: string;
}

export default function EditBusinessPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.businessId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [formData, setFormData] = useState<Partial<Business>>({});

  useEffect(() => {
    fetchBusiness();
  }, [businessId]);

  const fetchBusiness = async () => {
    try {
      const token = localStorage.getItem("admin-token");
      const res = await fetch(`/api/admin/wbos/businesses/${businessId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setFormData(data);
      if (data.logo) setLogoPreview(data.logo);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to load business");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload PNG, JPG, or WEBP image');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('File too large. Max 2MB');
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("admin-token");
      let logoUrl = formData.logo || "";

      // Upload logo if file selected
      if (logoFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("logo", logoFile);
        uploadFormData.append("businessId", businessId);

        const uploadRes = await fetch("/api/admin/wbos/upload-logo", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.error || "Logo upload failed");
        }

        const uploadData = await uploadRes.json();
        logoUrl = uploadData.logoUrl;
        console.log("✅ Logo uploaded:", logoUrl);
      }

      // Update business
      const updatePayload = {
        ...formData,
        logo: logoUrl,
      };
      console.log("📦 Sending update payload:", updatePayload);

      const res = await fetch(`/api/admin/wbos/businesses/${businessId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to update");
      }

      setSuccess("Business updated successfully!");
      setTimeout(() => {
        router.push(`/admin/wbos/${businessId}`);
      }, 1500);
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.message || "Failed to update business");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0068e3]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/wbos/${businessId}`}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white/40" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Business</h1>
          <p className="text-sm text-white/40">Update business details</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-400">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-white/60 mb-1">
              Business Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0068e3] focus:ring-1 focus:ring-[#0068e3]"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-white/60 mb-1">
              Logo
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileUpload}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30"
            />
            <p className="text-xs text-white/30 mt-1">Upload PNG, JPG, or WEBP (max 2MB)</p>
            {logoPreview && (
              <div className="mt-3">
                <img src={logoPreview} alt="Logo preview" className="h-16 w-auto rounded-lg border border-white/10" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">
              Industry
            </label>
            <select
              name="industry"
              value={formData.industry || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0068e3] focus:ring-1 focus:ring-[#0068e3]"
            >
              <option value="transport">Transport & Logistics</option>
              <option value="restaurant">Restaurant & Food</option>
              <option value="education">Education & Training</option>
              <option value="retail">Retail & E-commerce</option>
              <option value="healthcare">Healthcare</option>
              <option value="realestate">Real Estate</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">
              Currency
            </label>
            <select
              name="currency"
              value={formData.currency || "PKR"}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0068e3] focus:ring-1 focus:ring-[#0068e3]"
            >
              <option value="PKR">PKR - Pakistani Rupee</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="AED">AED - UAE Dirham</option>
              <option value="SAR">SAR - Saudi Riyal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0068e3] focus:ring-1 focus:ring-[#0068e3]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0068e3] focus:ring-1 focus:ring-[#0068e3]"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-white/60 mb-1">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0068e3] focus:ring-1 focus:ring-[#0068e3]"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-white/60 mb-1">
              Website (optional)
            </label>
            <input
              type="url"
              name="website"
              value={formData.website || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0068e3] focus:ring-1 focus:ring-[#0068e3]"
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2.5 bg-gradient-to-r from-[#0068e3] to-[#00b8fd] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
          <Link
            href={`/admin/wbos/${businessId}`}
            className="px-6 py-2.5 border border-white/10 text-white/60 rounded-lg hover:bg-white/5 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}