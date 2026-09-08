// app/admin/layout.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  FileText,
  Briefcase,
  FolderKanban,
  DollarSign,
  CheckCircle,
  UserPlus,
  Building2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import NotificationBell from "@/app/components/NotificationBell";

interface Admin {
  id: string;
  email: string;
  name: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newLeadCount, setNewLeadCount] = useState(0);
  const [wbosExpanded, setWbosExpanded] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Fetch lead count for notification badge
  const fetchLeadCount = async () => {
    try {
      const token = localStorage.getItem("admin-token");
      if (!token) return;

      const response = await fetch("/api/admin/leads/count", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNewLeadCount(data.newLeads || 0);
      }
    } catch (error) {
      console.error("Failed to fetch lead count:", error);
    }
  };

  useEffect(() => {
    // Skip auth for login and setup pages
    if (pathname === "/admin/login" || pathname === "/admin/setup") {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("admin-token");
    const user = localStorage.getItem("admin-user");

    if (!token || !user) {
      router.push("/admin/login");
      return;
    }

    try {
      setAdmin(JSON.parse(user));
      fetchLeadCount();
    } catch (e) {
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }

    // Refresh lead count every 30 seconds
    const interval = setInterval(() => {
      if (localStorage.getItem("admin-token")) {
        fetchLeadCount();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem("admin-token");
    localStorage.removeItem("admin-user");
    router.push("/admin/login");
  };

  // Navigation items
  const mainNav = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  ];

  // ✅ WBOS Navigation – Audit Logs REMOVED
  const wbosNav = [
    { icon: Building2, label: "Businesses", href: "/admin/wbos" },
  ];

  const agencyNav = [
    { icon: Briefcase, label: "Clients", href: "/admin/clients" },
    { icon: FolderKanban, label: "Projects", href: "/admin/projects" },
    { icon: CheckCircle, label: "Tasks", href: "/admin/tasks" },
    { icon: UserPlus, label: "Team", href: "/admin/team" },
    {
      icon: Users,
      label: "Leads",
      href: "/admin/leads",
      badge: newLeadCount > 0 ? newLeadCount : undefined,
    },
    { icon: MessageSquare, label: "Conversations", href: "/admin/conversations" },
  ];

  const otherNav = [
    { icon: FileText, label: "Templates", href: "/admin/templates" },
    { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
    { icon: DollarSign, label: "Reports", href: "/admin/reports" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  // Don't show sidebar on login or setup pages
  if (pathname === "/admin/login" || pathname === "/admin/setup") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a1628] flex">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-[#0b1120] border-r border-white/10 
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 h-16 border-b border-white/10">
            <Image
              src="/logo.png"
              alt="Webistic"
              width={32}
              height={32}
              className="h-8 w-auto"
            />
            <span className="text-white font-bold text-lg">Webistic</span>
            <span className="text-white/40 text-xs ml-auto">CRM</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {/* Main */}
            {mainNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <NavLink key={item.href} href={item.href} icon={item.icon} label={item.label} isActive={isActive} />
              );
            })}

            {/* WBOS Section */}
            <div className="pt-2">
              <button
                onClick={() => setWbosExpanded(!wbosExpanded)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-white/30 uppercase tracking-wider hover:text-white/50 transition-colors"
              >
                <span>WBOS Management</span>
                {wbosExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
              {wbosExpanded && (
                <div className="space-y-1 mt-1 pl-2">
                  {wbosNav.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                    return (
                      <NavLink key={item.href} href={item.href} icon={item.icon} label={item.label} isActive={isActive} />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Agency */}
            <div className="pt-2">
              <div className="px-3 py-2 text-xs font-medium text-white/30 uppercase tracking-wider">
                Agency Tools
              </div>
              {agencyNav.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    isActive={isActive}
                    badge={item.badge}
                  />
                );
              })}
            </div>

            {/* Other */}
            <div className="pt-2 border-t border-white/5">
              {otherNav.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <NavLink key={item.href} href={item.href} icon={item.icon} label={item.label} isActive={isActive} />
                );
              })}
            </div>
          </nav>

          {/* User */}
          <div className="border-t border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#0068e3] to-[#00b8fd] flex items-center justify-center text-white text-sm font-medium">
                {admin.name?.[0] || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">{admin.name}</p>
                <p className="text-white/40 text-xs truncate">{admin.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-white/40 hover:text-white transition-colors p-1"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#0a1628]/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-white/60 hover:text-white p-1"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <NotificationBell />
            <span className="text-white/40 text-sm hidden sm:inline">
              {new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

// NavLink Component
function NavLink({ href, icon: Icon, label, isActive, badge }: any) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors
        ${isActive
          ? "bg-gradient-to-r from-[#0068e3]/20 to-[#00b8fd]/20 text-white border border-white/10"
          : "text-white/60 hover:text-white hover:bg-white/5"
        }
      `}
    >
      <Icon size={18} />
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-medium animate-pulse">
          {badge}
        </span>
      )}
    </Link>
  );
}