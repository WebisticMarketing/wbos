// app/api/wbos/sadaat/installments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getBusinessId, getAuthPayload } from "@/app/lib/auth-helpers";
import { createAuditLog } from "@/app/lib/audit";

const toNumber = (val: any): number => {
  if (val === undefined || val === null || val === "") return 0;
  const num = typeof val === "number" ? val : parseFloat(val);
  return isNaN(num) ? 0 : num;
};

// GET – List all installments
export async function GET(req: NextRequest) {
  try {
    const businessId = await getBusinessId(req);
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const installments = await prisma.installment.findMany({
      where: { businessId },
      include: {
        payments: {
          where: { status: "active" },
          orderBy: { paymentDate: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let totalAmount = 0, totalPaid = 0, totalRemaining = 0, totalMonthlyDeduction = 0;
    for (const row of installments) {
      totalAmount += toNumber(row.totalAmount);
      totalPaid += toNumber(row.paidAmount);
      totalMonthlyDeduction += toNumber(row.monthlyDeduction);
      const remaining = toNumber(row.totalAmount) - toNumber(row.paidAmount);
      totalRemaining += remaining > 0 ? remaining : 0;
    }

    return NextResponse.json({
      installments,
      totals: { totalAmount, totalPaid, totalRemaining, totalMonthlyDeduction },
    });
  } catch (error) {
    console.error("Error fetching installments:", error);
    return NextResponse.json(
      { error: "Failed to fetch installments" },
      { status: 500 }
    );
  }
}

// POST – Create a new installment
export async function POST(req: NextRequest) {
  try {
    const businessId = await getBusinessId(req);
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const auth = getAuthPayload(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (!body.name || !body.monthlyDeduction) {
      return NextResponse.json(
        { error: "name and monthlyDeduction are required" },
        { status: 400 }
      );
    }

    const monthlyDeduction = toNumber(body.monthlyDeduction);
    const totalAmount = body.totalAmount ? toNumber(body.totalAmount) : null;
    const paidAmount = 0;
    const remainingAmount = totalAmount !== null ? totalAmount : null;

    const installment = await prisma.installment.create({
      data: {
        name: body.name,
        type: body.type || "bus",
        assetCount: body.assetCount ? parseInt(body.assetCount) : 1,
        totalAmount,
        paidAmount,
        remainingAmount,
        monthlyDeduction,
        startDate: body.startDate ? new Date(body.startDate) : null,
        dueDay: body.dueDay ? parseInt(body.dueDay) : null,
        lenderName: body.lenderName || null,
        referenceNumber: body.referenceNumber || null,
        notes: body.notes || null,
        isActive: body.isActive !== undefined ? body.isActive : true,
        businessId,
      },
    });

    // ✅ Audit Log
    await createAuditLog({
      businessId,
      userId: auth.userId,
      action: "create_installment",
      details: {
        installmentId: installment.id,
        name: installment.name,
        monthlyDeduction: Number(installment.monthlyDeduction),
        totalAmount: installment.totalAmount ? Number(installment.totalAmount) : null,
      },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(installment);
  } catch (error) {
    console.error("Error creating installment:", error);
    return NextResponse.json(
      { error: "Failed to create installment" },
      { status: 500 }
    );
  }
}

// PUT – Update an installment
export async function PUT(req: NextRequest) {
  try {
    const businessId = await getBusinessId(req);
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const auth = getAuthPayload(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const existing = await prisma.installment.findFirst({
      where: { id: body.id, businessId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Installment not found or unauthorized" },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.assetCount !== undefined) updateData.assetCount = parseInt(body.assetCount);
    if (body.totalAmount !== undefined) updateData.totalAmount = body.totalAmount ? toNumber(body.totalAmount) : null;
    if (body.monthlyDeduction !== undefined) updateData.monthlyDeduction = toNumber(body.monthlyDeduction);
    if (body.startDate !== undefined) updateData.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.dueDay !== undefined) updateData.dueDay = body.dueDay ? parseInt(body.dueDay) : null;
    if (body.lenderName !== undefined) updateData.lenderName = body.lenderName || null;
    if (body.referenceNumber !== undefined) updateData.referenceNumber = body.referenceNumber || null;
    if (body.notes !== undefined) updateData.notes = body.notes || null;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const updated = await prisma.installment.update({
      where: { id: body.id },
      data: updateData,
    });

    // ✅ Audit Log
    await createAuditLog({
      businessId,
      userId: auth.userId,
      action: "update_installment",
      details: {
        installmentId: updated.id,
        name: updated.name,
        changes: {
          oldMonthlyDeduction: Number(existing.monthlyDeduction),
          newMonthlyDeduction: Number(updated.monthlyDeduction),
        },
      },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Installment not found" },
        { status: 404 }
      );
    }
    console.error("Error updating installment:", error);
    return NextResponse.json(
      { error: "Failed to update installment" },
      { status: 500 }
    );
  }
}

// DELETE – Soft-delete an installment
export async function DELETE(req: NextRequest) {
  try {
    const businessId = await getBusinessId(req);
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const auth = getAuthPayload(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const existing = await prisma.installment.findFirst({
      where: { id, businessId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Installment not found or unauthorized" },
        { status: 404 }
      );
    }

    await prisma.installment.update({
      where: { id },
      data: { isActive: false },
    });

    // ✅ Audit Log
    await createAuditLog({
      businessId,
      userId: auth.userId,
      action: "delete_installment",
      details: {
        installmentId: existing.id,
        name: existing.name,
      },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Installment not found" },
        { status: 404 }
      );
    }
    console.error("Error deleting installment:", error);
    return NextResponse.json(
      { error: "Failed to delete installment" },
      { status: 500 }
    );
  }
}