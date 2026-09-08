// app/api/admin/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyAuth } from "@/app/lib/admin";

// GET - List all projects
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
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { client: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            business: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
          },
        },
        recurringPayments: {
          select: {
            id: true,
            amount: true,
            frequency: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Projects fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST - Create a new project
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
      client,
      clientId,
      name,
      description,
      service,
      status = "planning",
      startDate,
      endDate,
      notes,
      recurringPayments,
    } = body;

    // Support both 'client' and 'clientId' field names
    const clientIdValue = client || clientId;

    if (!clientIdValue) {
      return NextResponse.json(
        { error: "Client ID is required. Received: " + JSON.stringify(body) },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    if (!service) {
      return NextResponse.json(
        { error: "Service is required" },
        { status: 400 }
      );
    }

    // Check if client exists
    const clientRecord = await prisma.client.findUnique({
      where: { id: clientIdValue },
    });

    if (!clientRecord) {
      return NextResponse.json(
        { error: `Client not found with ID: ${clientIdValue}` },
        { status: 404 }
      );
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        clientId: clientIdValue,
        name: name.trim(),
        description: description || null,
        service: service,
        status: status,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        notes: notes || null,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            business: true,
          },
        },
        payments: true,
        recurringPayments: true,
      },
    });

    // Create recurring payments if provided
    if (recurringPayments && Array.isArray(recurringPayments) && recurringPayments.length > 0) {
      for (const rp of recurringPayments) {
        await prisma.recurringPayment.create({
          data: {
            projectId: project.id,
            amount: rp.amount,
            frequency: rp.frequency || "monthly",
            nextPaymentDate: rp.nextPaymentDate ? new Date(rp.nextPaymentDate) : new Date(),
            status: rp.status || "active",
            notes: rp.notes || null,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Project create error:", error);
    return NextResponse.json(
      { error: "Failed to create project: " + (error as Error).message },
      { status: 500 }
    );
  }
}