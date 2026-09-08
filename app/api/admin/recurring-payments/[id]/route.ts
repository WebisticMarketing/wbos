// app/api/admin/recurring-payments/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyAuth } from "@/app/lib/admin";

// GET - Get single recurring payment
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

    const recurringPayment = await prisma.recurringPayment.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!recurringPayment) {
      return NextResponse.json(
        { error: "Recurring payment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ recurringPayment });
  } catch (error) {
    console.error("Recurring payment fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recurring payment" },
      { status: 500 }
    );
  }
}

// PATCH - Update recurring payment
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
    const body = await req.json();
    const { amount, frequency, nextPaymentDate, status, notes } = body;

    const recurringPayment = await prisma.recurringPayment.update({
      where: { id },
      data: {
        amount,
        frequency,
        nextPaymentDate: nextPaymentDate ? new Date(nextPaymentDate) : undefined,
        status,
        notes,
      },
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
    });

    return NextResponse.json({ recurringPayment });
  } catch (error) {
    console.error("Recurring payment update error:", error);
    return NextResponse.json(
      { error: "Failed to update recurring payment" },
      { status: 500 }
    );
  }
}

// DELETE - Delete recurring payment
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

    await prisma.recurringPayment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Recurring payment delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete recurring payment" },
      { status: 500 }
    );
  }
}