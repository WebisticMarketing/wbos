// app/api/wbos/sadaat/cargo/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getBusinessId, getAuthPayload } from "@/app/lib/auth-helpers";
import { createAuditLog } from "@/app/lib/audit";

const toNumber = (val: any): number => {
  if (val === undefined || val === null || val === "") return 0;
  const num = typeof val === "number" ? val : parseFloat(val);
  return isNaN(num) ? 0 : num;
};

// GET – Fetch a single cargo record
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

    const record = await prisma.cargoRecord.findFirst({
      where: { id, businessId },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error("Error fetching cargo record:", error);
    return NextResponse.json(
      { error: "Failed to fetch cargo record" },
      { status: 500 }
    );
  }
}

// PUT – Update a cargo record
export async function PUT(
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

    const existing = await prisma.cargoRecord.findFirst({
      where: { id, businessId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Record not found or unauthorized" },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (body.date !== undefined) updateData.date = new Date(body.date);
    if (body.description !== undefined) updateData.description = body.description;
    if (body.profit !== undefined) updateData.profit = toNumber(body.profit);
    if (body.notes !== undefined) updateData.notes = body.notes || null;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const updated = await prisma.cargoRecord.update({
      where: { id },
      data: updateData,
    });

    // ✅ Audit Log
    await createAuditLog({
      businessId,
      userId: auth.userId,
      action: "update_cargo",
      details: {
        cargoId: updated.id,
        description: updated.description,
        changes: {
          oldProfit: Number(existing.profit),
          newProfit: Number(updated.profit),
        },
      },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Record not found" },
        { status: 404 }
      );
    }
    console.error("Error updating cargo record:", error);
    return NextResponse.json(
      { error: "Failed to update cargo record" },
      { status: 500 }
    );
  }
}

// DELETE – Delete a cargo record
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

    const existing = await prisma.cargoRecord.findFirst({
      where: { id, businessId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Record not found or unauthorized" },
        { status: 404 }
      );
    }

    await prisma.cargoRecord.delete({
      where: { id },
    });

    // ✅ Audit Log
    await createAuditLog({
      businessId,
      userId: auth.userId,
      action: "delete_cargo",
      details: {
        cargoId: existing.id,
        description: existing.description,
        profit: Number(existing.profit),
      },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Record not found" },
        { status: 404 }
      );
    }
    console.error("Error deleting cargo record:", error);
    return NextResponse.json(
      { error: "Failed to delete cargo record" },
      { status: 500 }
    );
  }
}