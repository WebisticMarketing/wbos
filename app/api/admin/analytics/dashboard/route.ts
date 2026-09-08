// app/api/admin/analytics/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyAuth } from "@/app/lib/admin";

export async function GET(req: NextRequest) {
  try {
    // Verify admin is logged in
    const admin = await verifyAuth(req);
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ============================================================
    // 1. TOTAL LEADS
    // ============================================================
    const totalLeads = await prisma.lead.count();

    // ============================================================
    // 2. LEADS BY STATUS
    // ============================================================
    const leadsByStatus = await prisma.lead.groupBy({
      by: ["status"],
      _count: true,
    });

    // ============================================================
    // 3. LEADS BY SOURCE
    // ============================================================
    const leadsBySource = await prisma.lead.groupBy({
      by: ["source"],
      _count: true,
    });

    // ============================================================
    // 4. LEADS BY SERVICE
    // ============================================================
    const leadsByService = await prisma.lead.groupBy({
      by: ["service"],
      _count: true,
    });

    // ============================================================
    // 5. TOTAL REVENUE
    // ============================================================
    const totalRevenue = await prisma.revenue.aggregate({
      _sum: {
        amount: true,
      },
    });

    // ============================================================
    // 6. REVENUE BY SERVICE
    // ============================================================
    const revenueByService = await prisma.revenue.groupBy({
      by: ["service"],
      _sum: {
        amount: true,
      },
    });

    // ============================================================
    // 7. MONTHLY REVENUE (Last 12 months)
    // ============================================================
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyRevenue = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', date) as month,
        SUM(amount) as total
      FROM "revenues"
      WHERE date >= ${twelveMonthsAgo}
      GROUP BY DATE_TRUNC('month', date)
      ORDER BY month ASC
    `;

    // ============================================================
    // 8. RECENT ACTIVITY (Last 10 activities)
    // ============================================================
    const recentLeads = await prisma.lead.findMany({
      take: 10,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        status: true,
        service: true,
        updatedAt: true,
      },
    });

    // ============================================================
    // 9. CONVERSION RATE
    // ============================================================
    const convertedLeads = await prisma.lead.count({
      where: { status: "converted" },
    });
    const conversionRate = totalLeads > 0 
      ? Math.round((convertedLeads / totalLeads) * 100) 
      : 0;

    // ============================================================
    // 10. THIS MONTH'S REVENUE
    // ============================================================
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyRevenueTotal = await prisma.revenue.aggregate({
      where: {
        date: {
          gte: startOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    return NextResponse.json({
      totalLeads,
      convertedLeads,
      conversionRate,
      totalRevenue: totalRevenue._sum.amount || 0,
      monthlyRevenue: monthlyRevenueTotal._sum.amount || 0,
      leadsByStatus: leadsByStatus.map(item => ({
        status: item.status,
        count: item._count,
      })),
      leadsBySource: leadsBySource.map(item => ({
        source: item.source,
        count: item._count,
      })),
      leadsByService: leadsByService.map(item => ({
        service: item.service || "Unknown",
        count: item._count,
      })),
      revenueByService: revenueByService.map(item => ({
        service: item.service || "Unknown",
        total: item._sum.amount || 0,
      })),
      monthlyRevenueData: monthlyRevenue,
      recentActivity: recentLeads,
    });

  } catch (error) {
    console.error("Dashboard analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}