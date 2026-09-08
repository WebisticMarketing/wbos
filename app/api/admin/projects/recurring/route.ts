// app/api/admin/projects/recurring/route.ts
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
    const { projectId, amount, frequency, nextPaymentDate, status, notes } = body;

    if (!projectId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Project ID and valid amount are required" },
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

    // Create recurring payment
    const recurringPayment = await prisma.recurringPayment.create({
      data: {
        projectId: projectId,
        amount: parseFloat(amount),
        frequency: frequency || "monthly",
        nextPaymentDate: nextPaymentDate ? new Date(nextPaymentDate) : new Date(),
        status: status || "active",
        notes: notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      recurringPayment,
    });
  } catch (error) {
    console.error("Recurring payment create error:", error);
    return NextResponse.json(
      { error: "Failed to create recurring payment" },
      { status: 500 }
    );
  }
}