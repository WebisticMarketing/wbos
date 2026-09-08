// app/api/wbos/sadaat/petrol-pump/bus-fuel/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getBusinessId, getAuthPayload } from "@/app/lib/auth-helpers";
import { createAuditLog } from "@/app/lib/audit";

const toNumber = (val: any): number => {
  if (val === undefined || val === null || val === "") return 0;
  const num = typeof val === "number" ? val : parseFloat(val);
  return isNaN(num) ? 0 : num;
};

// GET – Fetch all bus fuel records
export async function GET(req: NextRequest) {
  try {
    const businessId = await getBusinessId(req);
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const records = await prisma.busFuelRecord.findMany({
      where: { businessId },
      include: {
        bus: {
          select: {
            id: true,
            busNumber: true,
            numberPlate: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching bus fuel records:", error);
    return NextResponse.json(
      { error: "Failed to fetch records" },
      { status: 500 }
    );
  }
}

// POST – Create a new bus fuel record
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

    if (!body.busId || !body.liters || !body.pricePerLiter) {
      return NextResponse.json(
        { error: "busId, liters, and pricePerLiter are required" },
        { status: 400 }
      );
    }

    const bus = await prisma.bus.findFirst({
      where: { id: body.busId, businessId },
      select: { id: true },
    });

    if (!bus) {
      return NextResponse.json(
        { error: "Bus not found or unauthorized" },
        { status: 404 }
      );
    }

    const liters = toNumber(body.liters);
    const price = toNumber(body.pricePerLiter);
    const totalAmount = liters * price;

    const record = await prisma.busFuelRecord.create({
      data: {
        busId: body.busId,
        date: body.date ? new Date(body.date) : new Date(),
        liters,
        pricePerLiter: price,
        totalAmount,
        notes: body.notes || null,
        businessId,
      },
    });

    // ✅ Audit Log
    await createAuditLog({
      businessId,
      userId: auth.userId,
      action: "create_bus_fuel",
      details: {
        fuelId: record.id,
        busId: record.busId,
        liters: Number(record.liters),
        totalAmount: Number(record.totalAmount),
      },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error("Error creating bus fuel record:", error);
    return NextResponse.json(
      { error: "Failed to create record" },
      { status: 500 }
    );
  }
}