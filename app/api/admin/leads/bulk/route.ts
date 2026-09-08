// app/api/admin/leads/bulk/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyAuth } from "@/app/lib/admin";

export async function POST(req: NextRequest) {
  try {
    // Verify admin is logged in
    const admin = await verifyAuth(req);
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { leadIds, action } = await req.json();

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { error: "No leads selected" },
        { status: 400 }
      );
    }

    if (action === "delete") {
      // Delete selected leads
      await prisma.lead.deleteMany({
        where: {
          id: { in: leadIds },
        },
      });
      
      return NextResponse.json({
        success: true,
        message: `Deleted ${leadIds.length} leads`,
      });
    }

    // Update status for all selected leads
    await prisma.lead.updateMany({
      where: {
        id: { in: leadIds },
      },
      data: {
        status: action,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Updated ${leadIds.length} leads to ${action}`,
    });

  } catch (error) {
    console.error("Bulk action error:", error);
    return NextResponse.json(
      { error: "Failed to perform bulk action" },
      { status: 500 }
    );
  }
}