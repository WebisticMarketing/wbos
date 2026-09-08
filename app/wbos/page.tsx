// app/wbos/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WbosIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch("/api/wbos/auth/me");
        if (res.ok) {
          const data = await res.json();
          // ✅ Redirect to the user's own slug
          const slug = data.user?.slug || "sadaat";
          router.replace(`/wbos/${slug}`);
        } else {
          router.replace("/wbos/login");
        }
      } catch {
        router.replace("/wbos/login");
      }
    };
    checkUser();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-gray-500">Redirecting...</div>
    </div>
  );
}