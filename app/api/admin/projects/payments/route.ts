// app/api/admin/projects/payments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyAuth } from "@/app/lib/admin";

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
    const { projectId, clientId, amount, paymentDate, status, method, reference, notes } = body;

    if (!projectId || !clientId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Project ID, Client ID, and valid amount are required" },
        { status: 400 }
      );
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        projectId: projectId,
        clientId: clientId,
        amount: parseFloat(amount),
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        status: status || "paid",
        method: method || "bank_transfer",
        reference: reference || null,
        notes: notes || null,
      },
    });

    // Also create a revenue entry
    await prisma.revenue.create({
      data: {
        clientId: clientId,
        amount: parseFloat(amount),
        description: `Payment for project: ${project.name}${reference ? " - " + reference : ""}`,
        service: project.service,
        date: paymentDate ? new Date(paymentDate) : new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Project payment create error:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}