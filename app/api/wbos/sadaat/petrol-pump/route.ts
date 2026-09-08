// app/api/wbos/sadaat/petrol-pump/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getBusinessId, getAuthPayload } from "@/app/lib/auth-helpers";
import { createAuditLog } from "@/app/lib/audit";

const toNumber = (val: any): number => {
  if (val === undefined || val === null || val === "") return 0;
  const num = typeof val === "number" ? val : parseFloat(val);
  return isNaN(num) ? 0 : num;
};

// GET – Fetch all petrol pump records
export async function GET(req: NextRequest) {
  try {
    const businessId = await getBusinessId(req);
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const records = await prisma.petrolPumpRecord.findMany({
      where: { businessId },
      include: {
        bus: {
          select: { busNumber: true, numberPlate: true },
        },
      },
      orderBy: { date: "desc" },
    });

    const totalSales = records.reduce((sum, r) => sum + toNumber(r.totalSales), 0);
    const totalCost = records.reduce((sum, r) => sum + toNumber(r.fuelCost), 0);
    const totalProfit = records.reduce((sum, r) => sum + toNumber(r.profit), 0);

    return NextResponse.json({
      records,
      totals: { totalSales, totalCost, totalProfit },
    });
  } catch (error) {
    console.error("Error fetching petrol pump records:", error);
    return NextResponse.json(
      { error: "Failed to fetch records" },
      { status: 500 }
    );
  }
}

// POST – Create a new petrol pump record
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

    if (!body.liters || !body.pricePerLiter || !body.fuelCost) {
      return NextResponse.json(
        { error: "liters, pricePerLiter, and fuelCost are required" },
        { status: 400 }
      );
    }

    const liters = toNumber(body.liters);
    const price = toNumber(body.pricePerLiter);
    const fuelCost = toNumber(body.fuelCost);
    const totalSales = liters * price;
    const profit = totalSales - fuelCost;

    const record = await prisma.petrolPumpRecord.create({
      data: {
        busId: body.busId || null,
        date: body.date ? new Date(body.date) : new Date(),
        liters,
        pricePerLiter: price,
        totalSales,
        fuelCost,
        profit,
        notes: body.notes || null,
        businessId,
      },
    });

    // ✅ Audit Log
    await createAuditLog({
      businessId,
      userId: auth.userId,
      action: "create_petrol_record",
      details: {
        recordId: record.id,
        liters: Number(record.liters),
        totalSales: Number(record.totalSales),
        fuelCost: Number(record.fuelCost),
        profit: Number(record.profit),
      },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error("Error creating petrol pump record:", error);
    return NextResponse.json(
      { error: "Failed to create record" },
      { status: 500 }
    );
  }
}