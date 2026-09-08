// app/api/admin/clients/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyAuth } from "@/app/lib/admin";

// GET - Get single client with all details
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

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        lead: {
          include: {
            conversation: {
              include: {
                messages: {
                  orderBy: { createdAt: "asc" },
                },
              },
            },
          },
        },
        revenues: {
          orderBy: { date: "desc" },
        },
        projects: {
          include: {
            payments: true,
            recurringPayments: true,
          },
          orderBy: { createdAt: "desc" },
        },
        payments: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                service: true,
              },
            },
          },
          orderBy: { paymentDate: "desc" },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // Calculate total revenue from revenues table
    const totalRevenue = client.revenues.reduce(
      (sum, r) => sum + r.amount,
      0
    );

    // Calculate project revenue from payments
    const projectsWithRevenue = client.projects.map((project) => {
      const projectRevenue = project.payments.reduce(
        (sum, p) => sum + p.amount,
        0
      );
      let mrr = 0;
      for (const rp of project.recurringPayments) {
        if (rp.frequency === "one-time") continue;
        if (rp.status === "active") {
          let monthlyAmount = rp.amount;
          if (rp.frequency === "quarterly") monthlyAmount = rp.amount / 3;
          if (rp.frequency === "yearly") monthlyAmount = rp.amount / 12;
          mrr += monthlyAmount;
        }
      }
      return {
        ...project,
        totalRevenue: projectRevenue,
        mrr,
      };
    });

    return NextResponse.json({
      client: {
        ...client,
        projects: projectsWithRevenue,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("Client fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch client" },
      { status: 500 }
    );
  }
}

// PATCH - Update client
export async function PATCH(
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
    const { status, notes, service, endDate } = await req.json();

    const data: any = {};
    if (status) data.status = status;
    if (notes !== undefined) data.notes = notes;
    if (service) data.service = service;
    if (endDate) data.endDate = new Date(endDate);

    const client = await prisma.client.update({
      where: { id },
      data,
      include: {
        revenues: true,
        payments: true,
        projects: true,
      },
    });

    const totalRevenue = client.revenues.reduce(
      (sum, r) => sum + r.amount,
      0
    );

    return NextResponse.json({
      client: {
        ...client,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("Client update error:", error);
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    );
  }
}

// DELETE - Delete client
export async function DELETE(
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

    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    await prisma.client.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (error) {
    console.error("Client delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    );
  }
}