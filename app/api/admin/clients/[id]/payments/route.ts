// app/api/admin/clients/[id]/payments/route.ts
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

    if (!id) {
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 }
      );
    }

    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id: id },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { amount, paymentDate, status, method, reference, notes } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    // Get or create a project
    let project = await prisma.project.findFirst({
      where: { clientId: id },
      orderBy: { createdAt: "asc" },
    });

    if (!project) {
      project = await prisma.project.create({
        data: {
          clientId: id,
          name: "Default Project",
          service: client.service || "General",
          status: "active",
          startDate: new Date(),
        },
      });
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        projectId: project.id,
        clientId: id,
        amount: parseFloat(amount),
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        status: status || "paid",
        method: method || "bank_transfer",
        reference: reference || null,
        notes: notes || null,
      },
    });

    // Only create revenue entry if payment is paid
    if (status === "paid") {
      await prisma.revenue.create({
        data: {
          clientId: id,
          amount: parseFloat(amount),
          description: `Payment: ${reference || "Manual entry"}`,
          service: client.service || "General",
          date: paymentDate ? new Date(paymentDate) : new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Payment create error:", error);
    return NextResponse.json(
      { error: "Failed to create payment: " + (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE - Delete a payment
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

    // Get the payment ID from the URL
    // The URL is /api/admin/clients/[id]/payments
    // We need to get the payment ID from the request body
    const body = await req.json();
    const { paymentId } = body;

    console.log("Deleting payment with ID:", paymentId);

    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    // Check if payment exists
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Delete associated revenue entry if exists
    await prisma.revenue.deleteMany({
      where: {
        clientId: payment.clientId,
        amount: payment.amount,
        description: {
          contains: `Payment:`,
        },
      },
    });

    // Delete the payment
    await prisma.payment.delete({
      where: { id: paymentId },
    });

    return NextResponse.json({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (error) {
    console.error("Payment delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete payment: " + (error as Error).message },
      { status: 500 }
    );
  }
}