// app/api/wbos/sadaat/dashboard/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getActiveWbosAuth } from "@/app/lib/auth-helpers";

// ============================================================
// 🔐 AUTH HELPER
// ============================================================
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? "" : "s"} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString();
}

// ============================================================
// 📊 DASHBOARD STATS
// ============================================================
export async function GET(req: NextRequest) {
  try {
    const auth = await getActiveWbosAuth(req);
    if (!auth?.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { businessId, slug } = auth;
    const monthParam = req.nextUrl.searchParams.get("month");
    const month = monthParam || new Date().toISOString().slice(0, 7);
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      return NextResponse.json({ error: "Invalid month format. Use YYYY-MM." }, { status: 400 });
    }
    const [year, monthNumber] = month.split("-").map(Number);
    const monthStart = new Date(year, monthNumber - 1, 1);
    const monthEnd = new Date(year, monthNumber, 1);
    const dateFilter = { gte: monthStart, lt: monthEnd };

    // 🚀 Use Prisma aggregations – faster and type-safe
    const [
      totalBuses,
      activeBuses,
      totalTrips,
      busRevenue,
      busExpenses,
      occupancyData,
      pendingMaintenance,
    ] = await Promise.all([
      prisma.bus.count({
        where: { businessId },
      }),
      prisma.bus.count({
        where: { businessId, status: "active" },
      }),
      prisma.busVoucher.count({
        where: { businessId, voucherDate: dateFilter },
      }),
      prisma.busVoucher.aggregate({
        where: { businessId, voucherDate: dateFilter },
        _sum: { totalRevenue: true },
      }),
      prisma.busVoucher.aggregate({
        where: { businessId, voucherDate: dateFilter },
        _sum: { totalExpenses: true },
      }),
      prisma.busVoucher.aggregate({
        where: { businessId, voucherDate: dateFilter },
        _sum: {
          totalSeats: true,
          seatsBooked: true,
        },
      }),
      prisma.bus.count({
        where: { businessId, status: "maintenance" },
      }),
    ]);

    // ✅ FIX: Use Number() to convert null/undefined to 0
    const totalRevenue = Number(busRevenue._sum.totalRevenue) || 0;
    const totalExpenses = Number(busExpenses._sum.totalExpenses) || 0;
    const netProfit = totalRevenue - totalExpenses;

    const totalSeats = Number(occupancyData._sum.totalSeats) || 1;
    const seatsBooked = Number(occupancyData._sum.seatsBooked) || 0;
    let occupancyRate = Math.round((seatsBooked / totalSeats) * 100);
    if (occupancyRate > 100) occupancyRate = 100;

    // ============================================================
    // 📋 Recent Activity – Fetch actual recent records
    // ============================================================
    const recentActivity: any[] = [];

    // Recent buses
    const recentBuses = await prisma.bus.findMany({
      where: { businessId, createdAt: dateFilter },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        busNumber: true,
        numberPlate: true,
        createdAt: true,
        status: true,
      },
    });
    recentBuses.forEach((b) => {
      recentActivity.push({
        id: `bus-${b.id}`,
        type: "bus",
        title: `Bus ${b.busNumber} (${b.numberPlate}) added`,
        subtitle: `Status: ${b.status}`,
        href: `/wbos/${slug}/buses/${b.id}`,
        time: b.createdAt,
        timeAgo: getRelativeTime(b.createdAt),
        icon: "bus",
      });
    });

    // Recent vouchers
    const recentVouchers = await prisma.busVoucher.findMany({
      where: { businessId, voucherDate: dateFilter },
      take: 5,
      orderBy: { voucherDate: "desc" },
      include: {
        bus: {
          select: { busNumber: true, numberPlate: true },
        },
      },
    });
    recentVouchers.forEach((v) => {
      recentActivity.push({
        id: `voucher-${v.id}`,
        type: "trip",
        title: `Trip to ${v.route}`,
        subtitle: `${v.bus?.busNumber || "Unknown"} – Rs ${(Number(v.totalRevenue) || 0).toLocaleString()}`,
        href: `/wbos/${slug}/buses/${v.busId}/vouchers/${v.id}`,
        time: v.voucherDate,
        timeAgo: getRelativeTime(v.voucherDate),
        icon: "trip",
      });
    });

    // Recent maintenance
    const recentMaintenance = await prisma.busMaintenance.findMany({
      where: { businessId, maintenanceDate: dateFilter },
      take: 5,
      orderBy: { maintenanceDate: "desc" },
      include: {
        bus: {
          select: { busNumber: true, numberPlate: true },
        },
      },
    });
    recentMaintenance.forEach((m) => {
      recentActivity.push({
        id: `maintenance-${m.id}`,
        type: "maintenance",
        title: `Maintenance: ${m.type}`,
        subtitle: `${m.bus?.busNumber || "Unknown"} – Rs ${(Number(m.cost) || 0).toLocaleString()}`,
        href: `/wbos/${slug}/buses/${m.busId}/maintenance`,
        time: m.maintenanceDate,
        timeAgo: getRelativeTime(m.maintenanceDate),
        icon: "wrench",
      });
    });

    // Recent cargo
    const recentCargo = await prisma.cargoRecord.findMany({
      where: { businessId, date: dateFilter },
      take: 5,
      orderBy: { date: "desc" },
    });
    recentCargo.forEach((c) => {
      recentActivity.push({
        id: `cargo-${c.id}`,
        type: "cargo",
        title: `Cargo: ${c.description}`,
        subtitle: `Profit: Rs ${(Number(c.profit) || 0).toLocaleString()}`,
        href: `/wbos/${slug}/cargo`,
        time: c.date,
        timeAgo: getRelativeTime(c.date),
        icon: "cargo",
      });
    });

    // Sort by time (newest first) and take top 10
    recentActivity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    const topRecent = recentActivity.slice(0, 10);

    return NextResponse.json({
      totalBuses,
      activeBuses,
      totalTrips,
      totalRevenue,
      totalExpenses,
      netProfit,
      occupancyRate,
      pendingMaintenance,
      recentActivity: topRecent,
    });
  } catch (error) {
    console.error("❌ Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}