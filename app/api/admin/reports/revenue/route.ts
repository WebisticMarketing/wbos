// app/api/admin/reports/revenue/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyAuth } from "@/app/lib/admin";

export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAuth(req);
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "all"; // all, month, quarter, year
    const clientId = searchParams.get("clientId");
    const service = searchParams.get("service");

    // Build date filter
    let dateFilter: any = {};
    const now = new Date();

    if (period === "month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { gte: start };
    } else if (period === "quarter") {
      const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
      const start = new Date(now.getFullYear(), quarterMonth, 1);
      dateFilter = { gte: start };
    } else if (period === "year") {
      const start = new Date(now.getFullYear(), 0, 1);
      dateFilter = { gte: start };
    }

    // Build where clause for payments
    const where: any = {};
    if (clientId) where.clientId = clientId;
    if (service) where.project = { service };
    if (Object.keys(dateFilter).length > 0) {
      where.paymentDate = dateFilter;
    }

    // ============================================================
    // 1. TOTAL REVENUE
    // ============================================================
    const totalRevenue = await prisma.payment.aggregate({
      where: where,
      _sum: { amount: true },
    });

    // ============================================================
    // 2. REVENUE BY CLIENT
    // ============================================================
    const revenueByClient = await prisma.payment.groupBy({
      by: ["clientId"],
      where: where,
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    });

    // Get client details for each
    const clientRevenue = await Promise.all(
      revenueByClient.map(async (item) => {
        const client = await prisma.client.findUnique({
          where: { id: item.clientId },
          select: { id: true, name: true, business: true, status: true },
        });
        return {
          clientId: item.clientId,
          clientName: client?.name || "Unknown",
          clientBusiness: client?.business || "",
          clientStatus: client?.status || "unknown",
          total: item._sum.amount || 0,
        };
      })
    );

    // ============================================================
    // 3. REVENUE BY SERVICE
    // ============================================================
    const revenueByService = await prisma.payment.groupBy({
      by: ["projectId"],
      where: where,
      _sum: { amount: true },
    });

    // Get project details for each
    const serviceRevenue = await Promise.all(
      revenueByService.map(async (item) => {
        const project = await prisma.project.findUnique({
          where: { id: item.projectId },
          select: { id: true, name: true, service: true },
        });
        return {
          projectId: item.projectId,
          projectName: project?.name || "Unknown",
          service: project?.service || "Unknown",
          total: item._sum.amount || 0,
        };
      })
    );

    // Group by service name
    const serviceRevenueGrouped = serviceRevenue.reduce((acc: any, item) => {
      const key = item.service;
      if (!acc[key]) {
        acc[key] = { service: key, total: 0, projects: [] };
      }
      acc[key].total += item.total;
      acc[key].projects.push({
        projectId: item.projectId,
        projectName: item.projectName,
        total: item.total,
      });
      return acc;
    }, {});

    // ============================================================
    // 4. MONTHLY REVENUE (Last 12 months)
    // ============================================================
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyRevenueRaw = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "paymentDate") as month,
        SUM(amount) as total
      FROM "payments"
      WHERE "paymentDate" >= ${twelveMonthsAgo}
      GROUP BY DATE_TRUNC('month', "paymentDate")
      ORDER BY month ASC
    `;

    // ============================================================
    // 5. RECENT PAYMENTS (For table view)
    // ============================================================
    const recentPayments = await prisma.payment.findMany({
      where: where,
      include: {
        client: {
          select: { id: true, name: true, business: true },
        },
        project: {
          select: { id: true, name: true, service: true },
        },
      },
      orderBy: { paymentDate: "desc" },
      take: 20,
    });

    // ============================================================
    // 6. SUMMARY STATS
    // ============================================================
    const totalPaid = await prisma.payment.count({
      where: { ...where, status: "paid" },
    });
    const totalPending = await prisma.payment.count({
      where: { ...where, status: "pending" },
    });
    const totalOverdue = await prisma.payment.count({
      where: { ...where, status: "overdue" },
    });

    return NextResponse.json({
      summary: {
        totalRevenue: totalRevenue._sum.amount || 0,
        totalPayments: await prisma.payment.count({ where }),
        totalPaid,
        totalPending,
        totalOverdue,
        clientCount: clientRevenue.length,
        serviceCount: Object.keys(serviceRevenueGrouped).length,
      },
      byClient: clientRevenue,
      byService: Object.values(serviceRevenueGrouped),
      monthlyRevenue: monthlyRevenueRaw,
      recentPayments,
    });

  } catch (error) {
    console.error("Revenue report error:", error);
    return NextResponse.json(
      { error: "Failed to generate revenue report" },
      { status: 500 }
    );
  }
}