// app/api/admin/leads/count/route.ts
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

    // Count new leads
    const newLeads = await prisma.lead.count({
      where: { status: "new" },
    });

    // Count total leads
    const totalLeads = await prisma.lead.count();

    return NextResponse.json({
      newLeads,
      totalLeads,
    });
  } catch (error) {
    console.error("Lead count error:", error);
    return NextResponse.json(
      { error: "Failed to fetch lead count" },
      { status: 500 }
    );
  }
}