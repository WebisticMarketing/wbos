// app/api/wbos/sadaat/dashboard/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";

async function getBusinessId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get("wbos_token")?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    return payload.businessId;
  } catch {
    return null;
  }
}

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

export async function GET(req: NextRequest) {
  try {
    const businessId = await getBusinessId(req);
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🚀 ONE RAW QUERY – all stats in a single connection
    const result = await prisma.$queryRaw<any[]>`
      SELECT
        (SELECT COUNT(*)::int FROM buses WHERE "businessId" = ${businessId}) AS "totalBuses",
        (SELECT COUNT(*)::int FROM buses WHERE "businessId" = ${businessId} AND status = 'active') AS "activeBuses",
        (SELECT COUNT(*)::int FROM bus_vouchers WHERE "businessId" = ${businessId}) AS "totalTrips",
        (SELECT COALESCE(SUM("totalRevenue"), 0)::float FROM bus_vouchers WHERE "businessId" = ${businessId}) AS "totalRevenue",
        (SELECT COALESCE(SUM("totalExpenses"), 0)::float FROM bus_vouchers WHERE "businessId" = ${businessId}) AS "totalExpenses",
        (SELECT COALESCE(SUM("totalSeats"), 0)::int FROM bus_vouchers WHERE "businessId" = ${businessId}) AS "totalSeats",
        (SELECT COALESCE(SUM("seatsBooked"), 0)::int FROM bus_vouchers WHERE "businessId" = ${businessId}) AS "seatsBooked",
        (SELECT COUNT(*)::int FROM buses WHERE "businessId" = ${businessId} AND status = 'maintenance') AS "pendingMaintenance"
    `;

    const data = result[0] || {};

    const totalBuses = Number(data.totalBuses) || 0;
    const activeBuses = Number(data.activeBuses) || 0;
    const totalTrips = Number(data.totalTrips) || 0;
    const totalRevenue = Number(data.totalRevenue) || 0;
    const totalExpenses = Number(data.totalExpenses) || 0;

    // Fetch total maintenance cost
    const maintenanceResult = await prisma.busMaintenance.aggregate({
      _sum: { cost: true },
      where: { businessId },
    });
    const totalMaintenance = Number(maintenanceResult._sum.cost) || 0;

    // Fetch total tyre cost
    const tyreResult = await prisma.busTyre.aggregate({
      _sum: { cost: true },
      where: { businessId },
    });
    const totalTyres = Number(tyreResult._sum.cost) || 0;

    // Net Profit = Revenue - Trip Expenses - Maintenance - Tyres
    const netProfit = totalRevenue - totalExpenses - totalMaintenance - totalTyres;
    const totalSeats = Number(data.totalSeats) || 1;
    const seatsBooked = Number(data.seatsBooked) || 0;
    let occupancyRate = Math.round((seatsBooked / totalSeats) * 100);
    if (occupancyRate > 100) occupancyRate = 100;
    const pendingMaintenance = Number(data.pendingMaintenance) || 0;

    // Recent Activity (still separate but only 4 queries)
    const recentActivity: any[] = [];

    const recentBuses = await prisma.bus.findMany({
      where: { businessId },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, busNumber: true, numberPlate: true, createdAt: true, status: true },
    });
    recentBuses.forEach((b) => {
      recentActivity.push({
        id: `bus-${b.id}`,
        type: "bus",
        title: `Bus ${b.busNumber} (${b.numberPlate}) added`,
        subtitle: `Status: ${b.status}`,
        href: `/wbos/sadaat/buses/${b.id}`,
        time: b.createdAt,
        timeAgo: getRelativeTime(b.createdAt),
        icon: "bus",
      });
    });

    const recentVouchers = await prisma.busVoucher.findMany({
      where: { businessId },
      take: 5,
      orderBy: { voucherDate: "desc" },
      include: { bus: { select: { busNumber: true, numberPlate: true } } },
    });
    recentVouchers.forEach((v) => {
      recentActivity.push({
        id: `voucher-${v.id}`,
        type: "trip",
        title: `Trip to ${v.route}`,
        subtitle: `${v.bus?.busNumber || "Unknown"} – Rs ${(v.totalRevenue ?? 0).toLocaleString()}`,
        href: `/wbos/sadaat/buses/${v.busId}/vouchers/${v.id}`,
        time: v.voucherDate,
        timeAgo: getRelativeTime(v.voucherDate),
        icon: "trip",
      });
    });

    const recentMaintenance = await prisma.busMaintenance.findMany({
      where: { businessId },
      take: 5,
      orderBy: { maintenanceDate: "desc" },
      include: { bus: { select: { busNumber: true, numberPlate: true } } },
    });
    recentMaintenance.forEach((m) => {
      recentActivity.push({
        id: `maintenance-${m.id}`,
        type: "maintenance",
        title: `Maintenance: ${m.type}`,
        subtitle: `${m.bus?.busNumber || "Unknown"} – Rs ${(m.cost ?? 0).toLocaleString()}`,
        href: `/wbos/sadaat/buses/${m.busId}/maintenance`,
        time: m.maintenanceDate,
        timeAgo: getRelativeTime(m.maintenanceDate),
        icon: "wrench",
      });
    });

    const recentCargo = await prisma.cargoRecord.findMany({
      where: { businessId },
      take: 5,
      orderBy: { date: "desc" },
    });
    recentCargo.forEach((c) => {
      recentActivity.push({
        id: `cargo-${c.id}`,
        type: "cargo",
        title: `Cargo: ${c.description}`,
        subtitle: `Profit: Rs ${(c.profit ?? 0).toLocaleString()}`,
        href: `/wbos/sadaat/cargo`,
        time: c.date,
        timeAgo: getRelativeTime(c.date),
        icon: "cargo",
      });
    });

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
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch stats", details: message },
      { status: 500 }
    );
  }
}
