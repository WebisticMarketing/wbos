// app/wbos/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Bus,
  Building2,
  Fuel,
  Package,
  Banknote,
  BarChart3,
  FileText,
  WalletCards,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

export default function WbosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [logoError, setLogoError] = useState(false);

  // 🔹 Fetch the user once
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/wbos/auth/me", {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // 🔹 Auth check (existing logic)
  useEffect(() => {
    // Skip auth check on public pages
    const publicPaths = ["/wbos/login", "/wbos/register", "/wbos/forgot-password", "/wbos/reset-password"];
    if (publicPaths.some(p => pathname?.startsWith(p))) {
      return;
    }

    let isMounted = true;

    const refreshSession = async () => {
      try {
        // Try to refresh the token silently
        const refreshRes = await fetch("/api/wbos/auth/refresh", {
          method: "POST",
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });
        
        if (!refreshRes.ok) {
          // If refresh fails, check if it's a suspension or other auth issue
          const res = await fetch("/api/wbos/auth/me", {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
          });

          if (res.status === 403) {
            const logoutRes = await fetch("/api/wbos/auth/logout", {
              method: "POST",
            });
            if (logoutRes.ok) {
              router.push("/wbos/login?error=suspended");
            }
            return;
          }

          if (!res.ok && res.status !== 403) {
            router.push("/wbos/login");
          }
        }
      } catch (error) {
        console.debug("Session refresh failed:", error);
      }
    };

    // Initial session check
    refreshSession();

    // Refresh every 2 minutes to keep session alive
    const intervalId = setInterval(() => {
      if (isMounted) {
        refreshSession();
      }
    }, 120000); // 2 minutes

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [router, pathname]);

  // 🔹 Redirect /wbos/sadaat to the user's own slug
  useEffect(() => {
    if (loading || !user) return;

    const slug = user.slug;
    if (!slug) return;

    // Skip public paths
    const publicPaths = ["/wbos/login", "/wbos/register", "/wbos/forgot-password", "/wbos/reset-password"];
    if (publicPaths.some(p => pathname?.startsWith(p))) {
      return;
    }

    // Do not redirect on root /wbos or /wbos/ (app/wbos/page.tsx handles index navigation)
    if (pathname === "/wbos" || pathname === "/wbos/") return;

    // Only apply to /wbos/* paths
    if (!pathname?.startsWith("/wbos/")) return;

    // Extract the slug from the URL
    const segments = pathname.split("/").filter(Boolean);
    const urlSlug = segments[1]; // /wbos/[slug]

    // If the URL slug is different from user's slug, safely redirect
    if (urlSlug && urlSlug !== slug) {
      const remainingSegments = segments.slice(2).join("/");
      const newPath = `/wbos/${slug}${remainingSegments ? `/${remainingSegments}` : ""}`;
      if (newPath !== pathname) {
        router.replace(newPath);
      }
    }
  }, [loading, user, pathname, router]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen]);

  useEffect(() => {
    setLogoError(false);
  }, [user?.logo]);

  // Don't show sidebar on public pages
  const publicPaths = ["/wbos/login", "/wbos/register", "/wbos/forgot-password", "/wbos/reset-password"];
  if (publicPaths.some(p => pathname?.startsWith(p))) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  const slug = user.slug || "sadaat";

  // Navigation items
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: `/wbos/${slug}` },
    { icon: Bus, label: "Buses", href: `/wbos/${slug}/buses` },
    { icon: Building2, label: "Adda", href: `/wbos/${slug}/adda` },
    { icon: Fuel, label: "Petrol Pump", href: `/wbos/${slug}/petrol-pump` },
    { icon: Package, label: "Cargo", href: `/wbos/${slug}/cargo` },
    { icon: Banknote, label: "Installments", href: `/wbos/${slug}/installments` },
    { icon: BarChart3, label: "Reports", href: `/wbos/${slug}/reports` },
    { icon: WalletCards, label: "Personal Expenses", href: `/wbos/${slug}/personal-expenses` },
    // ✅ NEW: Audit Logs
    { icon: FileText, label: "Audit Logs", href: `/wbos/${slug}/audit-logs` },
  ];

  const handleLogout = async () => {
    await fetch("/api/wbos/auth/logout", { method: "POST" });
    router.push("/wbos/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-gray-900/30 lg:hidden"
        />
      )}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-[min(16rem,calc(100vw-1rem))] bg-white border-r border-gray-200
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static
        `}
      >
          <div className="flex h-full min-w-0 flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-4 sm:px-6">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-bold text-white">
              {user.logo && !logoError ? (
                <img
                  src={user.logo}
                  alt={`${user.businessName || "Business"} logo`}
                  className="h-full w-full object-cover"
                  onError={() => setLogoError(true)}
                />
              ) : (
                user.businessName?.charAt(0) || "B"
              )}
            </div>
            <span className="min-w-0 truncate text-lg font-bold text-gray-900">{user.businessName}</span>
            <button type="button" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} className="ml-auto rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 lg:hidden">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors
                    ${isActive
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-sm font-medium">
                {user.name?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-3 backdrop-blur-xl sm:px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-gray-500 hover:text-gray-700 p-1"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:inline">
              {new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}