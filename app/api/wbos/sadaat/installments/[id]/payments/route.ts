// app/api/wbos/sadaat/installments/[id]/payments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getBusinessId, getAuthPayload } from "@/app/lib/auth-helpers";
import { createAuditLog } from "@/app/lib/audit";

const toNumber = (val: any): number => {
  if (val === undefined || val === null || val === "") return 0;
  const num = typeof val === "number" ? val : parseFloat(val);
  return isNaN(num) ? 0 : num;
};

// GET – List payments for an installment
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const businessId = await getBusinessId(req);
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const installment = await prisma.installment.findFirst({
      where: { id, businessId },
      select: { id: true },
    });

    if (!installment) {
      return NextResponse.json(
        { error: "Installment not found or unauthorized" },
        { status: 404 }
      );
    }

    const payments = await prisma.installmentPayment.findMany({
      where: { installmentId: id, businessId, status: "active" },
      orderBy: { paymentDate: "desc" },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

// POST – Record a new payment
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const businessId = await getBusinessId(req);
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const auth = getAuthPayload(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    if (!body.amount) {
      return NextResponse.json(
        { error: "amount is required" },
        { status: 400 }
      );
    }

    const installment = await prisma.installment.findFirst({
      where: { id, businessId },
    });

    if (!installment) {
      return NextResponse.json(
        { error: "Installment not found or unauthorized" },
        { status: 404 }
      );
    }

    const amount = toNumber(body.amount);
    const newPaidAmount = toNumber(installment.paidAmount) + amount;
    const totalAmount = installment.totalAmount ? toNumber(installment.totalAmount) : null;
    const newRemaining = totalAmount !== null ? totalAmount - newPaidAmount : null;

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.installmentPayment.create({
        data: {
          installmentId: id,
          paymentDate: body.paymentDate ? new Date(body.paymentDate) : new Date(),
          amount,
          paymentMethod: body.paymentMethod || "cash",
          referenceNumber: body.referenceNumber || null,
          notes: body.notes || null,
          status: "active",
          recordedBy: body.recordedBy || null,
          businessId,
        },
      });

      await tx.installment.update({
        where: { id },
        data: {
          paidAmount: newPaidAmount,
          remainingAmount: newRemaining,
        },
      });

      return payment;
    });

    // ✅ Audit Log
    await createAuditLog({
      businessId,
      userId: auth.userId,
      action: "create_installment_payment",
      details: {
        paymentId: result.id,
        installmentId: result.installmentId,
        amount: Number(result.amount),
        paymentMethod: result.paymentMethod,
      },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error recording payment:", error);
    return NextResponse.json(
      { error: "Failed to record payment" },
      { status: 500 }
    );
  }
}

// DELETE – Cancel a payment
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const businessId = await getBusinessId(req);
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const auth = getAuthPayload(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get("paymentId");

    if (!paymentId) {
      return NextResponse.json(
        { error: "paymentId is required" },
        { status: 400 }
      );
    }

    const payment = await prisma.installmentPayment.findFirst({
      where: {
        id: paymentId,
        installmentId: id,
        businessId,
        status: "active",
      },
      include: { installment: true },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found or unauthorized" },
        { status: 404 }
      );
    }

    const amount = toNumber(payment.amount);
    const newPaidAmount = toNumber(payment.installment.paidAmount) - amount;
    const totalAmount = payment.installment.totalAmount ? toNumber(payment.installment.totalAmount) : null;
    const newRemaining = totalAmount !== null ? totalAmount - newPaidAmount : null;

    await prisma.$transaction(async (tx) => {
      await tx.installmentPayment.update({
        where: { id: paymentId },
        data: { status: "cancelled" },
      });

      await tx.installment.update({
        where: { id },
        data: {
          paidAmount: newPaidAmount,
          remainingAmount: newRemaining,
        },
      });
    });

    // ✅ Audit Log
    await createAuditLog({
      businessId,
      userId: auth.userId,
      action: "delete_installment_payment",
      details: {
        paymentId: payment.id,
        installmentId: payment.installmentId,
        amount: Number(payment.amount),
      },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cancelling payment:", error);
    return NextResponse.json(
      { error: "Failed to cancel payment" },
      { status: 500 }
    );
  }
}