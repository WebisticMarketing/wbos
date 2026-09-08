// app/api/admin/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyAuth } from "@/app/lib/admin";

export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAuth(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all leads
    const leads = await prisma.lead.findMany();

    // Count by service
    const serviceCounts: Record<string, number> = {};
    leads.forEach((lead) => {
      const service = lead.service || "Not specified";
      serviceCounts[service] = (serviceCounts[service] || 0) + 1;
    });

    const leadsByService = Object.entries(serviceCounts).map(([service, count]) => ({
      service,
      count,
    }));

    // Get leads by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const leadsByDay = await prisma.$queryRaw`
      SELECT DATE("createdAt") as date, COUNT(*) as count
      FROM "leads"
      WHERE "createdAt" >= ${sevenDaysAgo}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    const stats = {
      totalLeads: leads.length,
      newLeads: leads.filter(l => l.status === "new").length,
      contacted: leads.filter(l => l.status === "contacted").length,
      qualified: leads.filter(l => l.status === "qualified").length,
      converted: leads.filter(l => l.status === "converted").length,
      lost: leads.filter(l => l.status === "lost").length,
      conversations: await prisma.conversation.count(),
      leadsByService,
      leadsByDay: leadsByDay as any[],
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}