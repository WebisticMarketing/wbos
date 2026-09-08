// app/api/admin/leads/[id]/revenue/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyAuth } from "@/app/lib/admin";

// POST - Add revenue to a lead
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
    const { amount, description, service } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!lead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    let client = lead.client;

    if (!client) {
      client = await prisma.client.create({
        data: {
          leadId: lead.id,
          name: lead.name || "Unknown Client",
          email: lead.email,
          whatsapp: lead.whatsapp,
          business: lead.business,
          service: lead.service || service || "Unknown",
          status: "active",
        },
      });
    }

    const revenue = await prisma.revenue.create({
      data: {
        clientId: client.id,
        amount: amount,
        description: description || "Service payment",
        service: service || lead.service || "Unknown",
        date: new Date(),
      },
    });

    await prisma.lead.update({
      where: { id: lead.id },
      data: { status: "converted" },
    });

    return NextResponse.json({
      success: true,
      revenue,
      client,
    });
  } catch (error) {
    console.error("Revenue error:", error);
    return NextResponse.json(
      { error: "Failed to add revenue" },
      { status: 500 }
    );
  }
}

// GET - Get all revenue for a lead
export async function GET(
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

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        client: {
          include: {
            revenues: {
              orderBy: { date: "desc" },
            },
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

    const totalRevenue = lead.client?.revenues.reduce(
      (sum, r) => sum + r.amount,
      0
    ) || 0;

    return NextResponse.json({
      lead: lead,
      client: lead.client,
      revenues: lead.client?.revenues || [],
      totalRevenue: totalRevenue,
    });
  } catch (error) {
    console.error("Revenue fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch revenue" },
      { status: 500 }
    );
  }
}