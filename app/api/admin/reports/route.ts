// app/api/admin/reports/route.ts
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
    const range = searchParams.get("range") || "30d";

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      case "12m":
        startDate.setMonth(now.getMonth() - 12);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // 1. Sales Data
    const [totalLeads, qualifiedLeads, convertedLeads, lostLeads] = await Promise.all([
      prisma.lead.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.lead.count({
        where: {
          status: { in: ["qualified", "consultation", "proposal", "negotiation"] },
          createdAt: { gte: startDate },
        },
      }),
      prisma.lead.count({
        where: {
          status: { in: ["converted", "won"] },
          createdAt: { gte: startDate },
        },
      }),
      prisma.lead.count({
        where: {
          status: { in: ["lost"] },
          createdAt: { gte: startDate },
        },
      }),
    ]);

    // 2. Client Data
    const [activeClients, newClients, lostClients] = await Promise.all([
      prisma.client.count({
        where: { status: "active" },
      }),
      prisma.client.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.client.count({
        where: { status: "cancelled" },
      }),
    ]);

    // 3. Finance Data - FIXED: Using revenues table instead of payments
    const [totalRevenue, monthlyRevenue, recurringRevenue, outstandingInvoices] = await Promise.all([
      // Total Revenue from revenues table (FIXED)
      prisma.revenue.aggregate({
        where: { date: { gte: startDate } },
        _sum: { amount: true },
      }),
      // Monthly Revenue from revenues table (FIXED)
      prisma.revenue.aggregate({
        where: {
          date: {
            gte: new Date(now.getFullYear(), now.getMonth(), 1),
          },
        },
        _sum: { amount: true },
      }),
      // Recurring Revenue
      prisma.recurringPayment.aggregate({
        where: { status: "active" },
        _sum: { amount: true },
      }),
      // Outstanding Invoices (from payments table - keep as is)
      prisma.payment.aggregate({
        where: {
          status: { in: ["pending", "overdue"] },
        },
        _sum: { amount: true },
      }),
    ]);

    // 4. Service Performance - FIXED: Using revenues table
    // Get all services from revenues
    const revenueServices = await prisma.revenue.groupBy({
      by: ["service"],
      _sum: { amount: true },
    });

    // Get client counts per service
    const serviceClients = await prisma.client.groupBy({
      by: ["service"],
      _count: { id: true },
    });

    // Combine the data
    const serviceData = revenueServices.map((s) => {
      const clientCount = serviceClients.find(c => c.service === s.service)?._count.id || 0;
      return {
        name: s.service || "Unknown",
        clients: clientCount,
        revenue: s._sum.amount || 0,
      };
    });

    // 5. Lead Sources
    const leadSources = await prisma.lead.groupBy({
      by: ["source"],
      _count: { id: true },
    });

    const sourceData = await Promise.all(
      leadSources.map(async (s) => {
        const [qualified, converted] = await Promise.all([
          prisma.lead.count({
            where: {
              source: s.source,
              status: { in: ["qualified", "consultation", "proposal", "negotiation"] },
            },
          }),
          prisma.lead.count({
            where: {
              source: s.source,
              status: { in: ["converted", "won"] },
            },
          }),
        ]);
        return {
          source: s.source,
          leads: s._count.id,
          qualified,
          converted,
        };
      })
    );

    // Calculate average deal value from revenues
    const totalRevenueAmount = totalRevenue._sum.amount || 0;
    const averageDealValue = convertedLeads > 0 ? totalRevenueAmount / convertedLeads : 0;

    return NextResponse.json({
      sales: {
        totalLeads,
        qualifiedLeads,
        convertedLeads,
        lostLeads,
        conversionRate: totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0,
        averageDealValue,
      },
      clients: {
        active: activeClients,
        new: newClients,
        lost: lostClients,
        retention: (activeClients + lostClients) > 0 
          ? Math.round((activeClients / (activeClients + lostClients)) * 100) 
          : 100,
      },
      finance: {
        totalRevenue: totalRevenueAmount,
        monthlyRevenue: monthlyRevenue._sum.amount || 0,
        recurringRevenue: recurringRevenue._sum.amount || 0,
        outstandingInvoices: outstandingInvoices._sum.amount || 0,
      },
      services: serviceData,
      leadSources: sourceData,
    });
  } catch (error) {
    console.error("Reports error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}