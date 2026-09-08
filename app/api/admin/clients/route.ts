// app/api/admin/clients/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyAuth } from "@/app/lib/admin";

// GET - Get all clients
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
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { business: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        lead: {
          select: {
            id: true,
            source: true,
            createdAt: true,
          },
        },
        revenues: {
          orderBy: { date: "desc" },
        },
        payments: {
          select: {
            amount: true,
          },
        },
        projects: {
          include: {
            payments: true,
            recurringPayments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate total revenue for each client from revenues table (FIXED)
    const clientsWithRevenue = clients.map((client) => {
      const totalRevenue = client.revenues.reduce(
        (sum, r) => sum + r.amount,
        0
      );
      return {
        ...client,
        totalRevenue,
      };
    });

    return NextResponse.json({ clients: clientsWithRevenue });
  } catch (error) {
    console.error("Clients fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

// POST - Create a new client manually
export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAuth(req);
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { 
      name, 
      email, 
      whatsapp, 
      business, 
      service, 
      status, 
      notes,
      revenue,
      revenueDescription 
    } = body;

    // Validate required fields
    if (!name || !service) {
      return NextResponse.json(
        { error: "Name and service are required" },
        { status: 400 }
      );
    }

    // Create client
    const client = await prisma.client.create({
      data: {
        name: name.trim(),
        email: email || null,
        whatsapp: whatsapp || null,
        business: business || null,
        service: service,
        status: status || "active",
        notes: notes || null,
        startDate: new Date(),
      },
    });

    // If revenue is provided, create revenue entry
    if (revenue && revenue > 0) {
      await prisma.revenue.create({
        data: {
          clientId: client.id,
          amount: parseFloat(revenue),
          description: revenueDescription || "Initial payment",
          service: service,
          date: new Date(),
        },
      });
    }

    return NextResponse.json({ 
      success: true,
      client 
    });
  } catch (error) {
    console.error("Client create error:", error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}