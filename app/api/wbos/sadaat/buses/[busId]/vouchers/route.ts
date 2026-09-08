// app/api/wbos/sadaat/buses/[busId]/vouchers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getBusinessId, getAuthPayload } from "@/app/lib/auth-helpers";
import { createAuditLog } from "@/app/lib/audit";

const toNumber = (val: any): number => {
  if (val === undefined || val === null || val === "") return 0;
  const num = typeof val === "number" ? val : parseFloat(val);
  return isNaN(num) ? 0 : num;
};

// GET – List all vouchers for a bus
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ busId: string }> }
) {
  try {
    const businessId = await getBusinessId(req);
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { busId } = await params;

    const vouchers = await prisma.busVoucher.findMany({
      where: { busId, businessId },
      orderBy: { voucherDate: "desc" },
    });

    return NextResponse.json(vouchers);
  } catch (error) {
    console.error("Error fetching vouchers:", error);
    return NextResponse.json(
      { error: "Failed to fetch vouchers" },
      { status: 500 }
    );
  }
}

// POST – Create a new voucher
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ busId: string }> }
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

    const { busId } = await params;

    const bus = await prisma.bus.findFirst({
      where: { id: busId, businessId },
      select: { capacity: true },
    });

    if (!bus) {
      return NextResponse.json(
        { error: "Bus not found or unauthorized" },
        { status: 404 }
      );
    }

    const body = await req.json();

    if (!body.route) {
      return NextResponse.json(
        { error: "Route is required" },
        { status: 400 }
      );
    }

    const totalSeats = toNumber(body.totalSeats) || bus.capacity || 44;
    const seatsBooked = toNumber(body.seatsBooked);
    const pricePerSeat = toNumber(body.pricePerSeat);
    const seatsRevenue = seatsBooked * pricePerSeat;
    const individualPayments = toNumber(body.individualPayments);
    const otherRevenue = toNumber(body.otherRevenue);
    const totalRevenue = seatsRevenue + individualPayments + otherRevenue;

    const dieselExpense = toNumber(body.dieselExpense);
    const taExpense = toNumber(body.taExpense);
    const teaExpense = toNumber(body.teaExpense);
    const cleannessExpense = toNumber(body.cleannessExpense);
    const policeExpense = toNumber(body.policeExpense);
    const tollTaxExpense = toNumber(body.tollTaxExpense);
    const numberMoneyExpense = toNumber(body.numberMoneyExpense);
    const mechanicExpense = toNumber(body.mechanicExpense);
    const extraExpense = toNumber(body.extraExpense);
    const otherExpense = toNumber(body.otherExpense);
    const totalExpenses =
      dieselExpense + taExpense + teaExpense + cleannessExpense +
      policeExpense + tollTaxExpense + numberMoneyExpense +
      mechanicExpense + extraExpense + otherExpense;
    const profit = totalRevenue - totalExpenses;

    const result = await prisma.busVoucher.create({
      data: {
        busId,
        voucherDate: body.voucherDate ? new Date(body.voucherDate) : new Date(),
        route: body.route,
        tripNumber: body.tripNumber || null,
        totalSeats,
        seatsBooked,
        pricePerSeat,
        seatsRevenue,
        individualPayments,
        otherRevenue,
        totalRevenue,
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
        totalExpenses,
        profit,
        routeType: body.routeType || "lahore",
        status: body.status || "active",
        notes: body.notes || null,
        businessId,
      },
    });

    // ✅ Audit Log
    await createAuditLog({
      businessId,
      userId: auth.userId,
      action: "create_voucher",
      details: {
        voucherId: result.id,
        busId: result.busId,
        route: result.route,
        totalRevenue: Number(result.totalRevenue),
        profit: Number(result.profit),
      },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error creating voucher:", error);
    return NextResponse.json(
      { error: "Failed to create voucher: " + (error?.message || "Unknown error") },
      { status: 500 }
    );
  }
}