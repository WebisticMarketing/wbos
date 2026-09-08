// app/api/wbos/sadaat/buses/[busId]/vouchers/[voucherId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getBusinessId, getAuthPayload } from "@/app/lib/auth-helpers";
import { createAuditLog } from "@/app/lib/audit";

const toNumber = (val: any): number => {
  if (val === undefined || val === null || val === "") return 0;
  const num = typeof val === "number" ? val : parseFloat(val);
  return isNaN(num) ? 0 : num;
};

// GET – Fetch a single voucher
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ busId: string; voucherId: string }> }
) {
  try {
    const businessId = await getBusinessId(req);
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { busId, voucherId } = await params;

    const voucher = await prisma.busVoucher.findFirst({
      where: { id: voucherId, busId, businessId },
    });

    if (!voucher) {
      return NextResponse.json(
        { error: "Voucher not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(voucher);
  } catch (error) {
    console.error("Error fetching voucher:", error);
    return NextResponse.json(
      { error: "Failed to fetch voucher" },
      { status: 500 }
    );
  }
}

// PUT – Update a voucher (with auto-recalc)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ busId: string; voucherId: string }> }
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

    const { busId, voucherId } = await params;
    const body = await req.json();

    const existing = await prisma.busVoucher.findFirst({
      where: { id: voucherId, busId, businessId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Voucher not found or unauthorized" },
        { status: 404 }
      );
    }

    const updated = { ...existing, ...body };

    const seatsBooked = toNumber(updated.seatsBooked);
    const pricePerSeat = toNumber(updated.pricePerSeat);
    const individualPayments = toNumber(updated.individualPayments);
    const otherRevenue = toNumber(updated.otherRevenue);

    const seatsRevenue = seatsBooked * pricePerSeat;
    const totalRevenue = seatsRevenue + individualPayments + otherRevenue;

    const dieselExpense = toNumber(updated.dieselExpense);
    const taExpense = toNumber(updated.taExpense);
    const teaExpense = toNumber(updated.teaExpense);
    const cleannessExpense = toNumber(updated.cleannessExpense);
    const policeExpense = toNumber(updated.policeExpense);
    const tollTaxExpense = toNumber(updated.tollTaxExpense);
    const numberMoneyExpense = toNumber(updated.numberMoneyExpense);
    const mechanicExpense = toNumber(updated.mechanicExpense);
    const extraExpense = toNumber(updated.extraExpense);
    const otherExpense = toNumber(updated.otherExpense);
    const totalExpenses =
      dieselExpense + taExpense + teaExpense + cleannessExpense +
      policeExpense + tollTaxExpense + numberMoneyExpense +
      mechanicExpense + extraExpense + otherExpense;
    const profit = totalRevenue - totalExpenses;

    const updateData = {
      voucherDate: body.voucherDate ? new Date(body.voucherDate) : existing.voucherDate,
      route: body.route || existing.route,
      tripNumber: body.tripNumber !== undefined ? body.tripNumber : existing.tripNumber,
      totalSeats: toNumber(body.totalSeats) || existing.totalSeats,
      routeType: body.routeType || existing.routeType,
      status: body.status || existing.status,
      notes: body.notes !== undefined ? body.notes : existing.notes,
      seatsRevenue,
      totalRevenue,
      totalExpenses,
      profit,
      seatsBooked,
      pricePerSeat,
      individualPayments,
      otherRevenue,
      dieselExpense,
      taExpense,
      teaExpense,
      cleannessExpense,
      policeExpense,
      tollTaxExpense,
      numberMoneyExpense,
      mechanicExpense,
      extraExpense,
      otherExpense,
    };

    const result = await prisma.busVoucher.update({
      where: { id: voucherId },
      data: updateData,
    });

    // ✅ Audit Log
    await createAuditLog({
      businessId,
      userId: auth.userId,
      action: "update_voucher",
      details: {
        voucherId: result.id,
        busId: result.busId,
        route: result.route,
        changes: {
          oldRevenue: Number(existing.totalRevenue),
          newRevenue: Number(result.totalRevenue),
          oldProfit: Number(existing.profit),
          newProfit: Number(result.profit),
        },
      },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Voucher not found" },
        { status: 404 }
      );
    }
    console.error("Error updating voucher:", error);
    return NextResponse.json(
      { error: "Failed to update voucher" },
      { status: 500 }
    );
  }
}

// DELETE – Delete a voucher
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ busId: string; voucherId: string }> }
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

    const { busId, voucherId } = await params;

    const existing = await prisma.busVoucher.findFirst({
      where: { id: voucherId, busId, businessId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Voucher not found or unauthorized" },
        { status: 404 }
      );
    }

    await prisma.busVoucher.delete({
      where: { id: voucherId },
    });

    // ✅ Audit Log
    await createAuditLog({
      businessId,
      userId: auth.userId,
      action: "delete_voucher",
      details: {
        voucherId: existing.id,
        busId: existing.busId,
        route: existing.route,
        totalRevenue: Number(existing.totalRevenue),
      },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Voucher not found" },
        { status: 404 }
      );
    }
    console.error("Error deleting voucher:", error);
    return NextResponse.json(
      { error: "Failed to delete voucher" },
      { status: 500 }
    );
  }
}