// app/api/admin/payments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyAuth } from "@/app/lib/admin";

// GET - Get all payments
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
    const clientId = searchParams.get("clientId");
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");

    const where: any = {};
    if (clientId) where.clientId = clientId;
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;

    const payments = await prisma.payment.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            business: true,
            email: true,
            whatsapp: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            service: true,
          },
        },
      },
      orderBy: { paymentDate: "desc" },
    });

    // Calculate totals
    const totalPaid = payments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0);
    const totalPending = payments
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0);
    const totalOverdue = payments
      .filter((p) => p.status === "overdue")
      .reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      payments,
      summary: {
        totalPaid,
        totalPending,
        totalOverdue,
        total: totalPaid + totalPending + totalOverdue,
      },
    });
  } catch (error) {
    console.error("Payments fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

// POST - Create a new payment
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
      projectId,
      clientId,
      amount,
      paymentDate,
      dueDate,
      status,
      method,
      reference,
      notes,
    } = body;

    if (!projectId || !clientId || !amount) {
      return NextResponse.json(
        { error: "Project ID, client ID, and amount are required" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.create({
      data: {
        projectId,
        clientId,
        amount,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        status: status || "paid",
        method,
        reference,
        notes,
      },
      include: {
        client: true,
        project: true,
      },
    });

    return NextResponse.json({ payment });
  } catch (error) {
    console.error("Payment create error:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}