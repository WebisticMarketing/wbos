// app/api/admin/stats/route.ts
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

    // Get all leads with status counts
    const leads = await prisma.lead.findMany();
    const totalLeads = leads.length;
    const newLeads = leads.filter(l => l.status === "new").length;
    const contacted = leads.filter(l => l.status === "contacted").length;
    const qualified = leads.filter(l => l.status === "qualified").length;
    const converted = leads.filter(l => l.status === "converted").length;
    const lost = leads.filter(l => l.status === "lost").length;

    // Get conversation count
    const conversations = await prisma.conversation.count();

    return NextResponse.json({
      totalLeads,
      newLeads,
      contacted,
      qualified,
      converted,
      lost,
      conversations,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}