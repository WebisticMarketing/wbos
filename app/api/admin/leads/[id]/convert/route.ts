// app/api/admin/leads/[id]/convert/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyAuth } from "@/app/lib/admin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAuth(req);
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get the lead
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        conversation: {
          include: {
            messages: true,
          },
        },
      },
    });

    if (!lead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    // Check if lead is already a client
    const existingClient = await prisma.client.findUnique({
      where: { leadId: id },
    });

    if (existingClient) {
      return NextResponse.json(
        { error: "Lead is already converted to a client" },
        { status: 400 }
      );
    }

    // Create client from lead
    const client = await prisma.client.create({
      data: {
        leadId: lead.id,
        name: lead.name || "Unknown Client",
        email: lead.email,
        whatsapp: lead.whatsapp,
        business: lead.business,
        service: lead.service || "Unknown",
        status: "active",
        startDate: new Date(),
        notes: `Converted from lead ${lead.id} on ${new Date().toISOString()}`,
      },
    });

    // Update lead status to converted
    await prisma.lead.update({
      where: { id },
      data: { status: "converted" },
    });

    // If there was revenue associated with the lead, create revenue entry
    // This could be extended to handle initial payment

    return NextResponse.json({
      success: true,
      client,
      message: "Lead successfully converted to client",
    });
  } catch (error) {
    console.error("Convert lead error:", error);
    return NextResponse.json(
      { error: "Failed to convert lead to client" },
      { status: 500 }
    );
  }
}