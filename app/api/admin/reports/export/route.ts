// app/api/admin/reports/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyAuth } from "@/app/lib/admin";
import { generatePDF } from '@/app/lib/pdf-report';

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

    // Fetch all data
    const [totalLeads, qualifiedLeads, convertedLeads, lostLeads] = await Promise.all([
      prisma.lead.count({ where: { createdAt: { gte: startDate } } }),
      prisma.lead.count({ where: { status: { in: ["qualified", "consultation", "proposal", "negotiation"] }, createdAt: { gte: startDate } } }),
      prisma.lead.count({ where: { status: { in: ["converted", "won"] }, createdAt: { gte: startDate } } }),
      prisma.lead.count({ where: { status: { in: ["lost"] }, createdAt: { gte: startDate } } }),
    ]);

    const [activeClients, newClients, lostClients] = await Promise.all([
      prisma.client.count({ where: { status: "active" } }),
      prisma.client.count({ where: { createdAt: { gte: startDate } } }),
      prisma.client.count({ where: { status: "cancelled" } }),
    ]);

    const [totalRevenue, monthlyRevenue, recurringRevenue, outstandingInvoices] = await Promise.all([
      prisma.revenue.aggregate({ where: { date: { gte: startDate } }, _sum: { amount: true } }),
      prisma.revenue.aggregate({ where: { date: { gte: new Date(now.getFullYear(), now.getMonth(), 1) } }, _sum: { amount: true } }),
      prisma.recurringPayment.aggregate({ where: { status: "active" }, _sum: { amount: true } }),
      prisma.payment.aggregate({ where: { status: { in: ["pending", "overdue"] } }, _sum: { amount: true } }),
    ]);

    const revenueServices = await prisma.revenue.groupBy({ by: ["service"], _sum: { amount: true } });
    const serviceClients = await prisma.client.groupBy({ by: ["service"], _count: { id: true } });

    const serviceData = revenueServices.map((s) => ({
      name: s.service || "Unknown",
      clients: serviceClients.find(c => c.service === s.service)?._count.id || 0,
      revenue: s._sum.amount || 0,
    }));

    const leadSources = await prisma.lead.groupBy({ by: ["source"], _count: { id: true } });
    const sourceData = await Promise.all(
      leadSources.map(async (s) => {
        const [qualified, converted] = await Promise.all([
          prisma.lead.count({ where: { source: s.source, status: { in: ["qualified", "consultation", "proposal", "negotiation"] } } }),
          prisma.lead.count({ where: { source: s.source, status: { in: ["converted", "won"] } } }),
        ]);
        return { source: s.source, leads: s._count.id, qualified, converted };
      })
    );

    const totalRevenueAmount = totalRevenue._sum.amount || 0;
    const averageDealValue = convertedLeads > 0 ? totalRevenueAmount / convertedLeads : 0;

    const reportData = {
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
        retention: (activeClients + lostClients) > 0 ? Math.round((activeClients / (activeClients + lostClients)) * 100) : 100,
      },
      finance: {
        totalRevenue: totalRevenueAmount,
        monthlyRevenue: monthlyRevenue._sum.amount || 0,
        recurringRevenue: recurringRevenue._sum.amount || 0,
        outstandingInvoices: outstandingInvoices._sum.amount || 0,
      },
      services: serviceData,
      leadSources: sourceData,
    };

    const dateRangeLabel = range === "7d" ? "Last 7 Days" : range === "30d" ? "Last 30 Days" : range === "90d" ? "Last 90 Days" : "Last 12 Months";

    // Generate PDF
    const pdfBuffer = generatePDF(reportData, dateRangeLabel);

    // Return as PDF download
    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Webistic_Report_${new Date().toISOString().split('T')[0]}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export report: " + (error as Error).message },
      { status: 500 }
    );
  }
}