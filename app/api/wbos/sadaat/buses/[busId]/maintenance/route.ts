// app/api/wbos/sadaat/buses/[busId]/maintenance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getBusinessId, getAuthPayload } from "@/app/lib/auth-helpers";
import { createAuditLog } from "@/app/lib/audit";

const parseNumber = (val: any): number => {
  if (val === undefined || val === null || val === "") return 0;
  const num = typeof val === "number" ? val : parseFloat(val);
  return isNaN(num) ? 0 : num;
};

// GET – Fetch all maintenance records for a bus
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

    const bus = await prisma.bus.findFirst({
      where: { id: busId, businessId },
      select: { id: true },
    });

    if (!bus) {
      return NextResponse.json(
        { error: "Bus not found or unauthorized" },
        { status: 404 }
      );
    }

    const records = await prisma.busMaintenance.findMany({
      where: { busId },
      orderBy: { maintenanceDate: "desc" },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching maintenance records:", error);
    return NextResponse.json(
      { error: "Failed to fetch maintenance records" },
      { status: 500 }
    );
  }
}

// POST – Create a new maintenance record
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
    const body = await req.json();

    const bus = await prisma.bus.findFirst({
      where: { id: busId, businessId },
      select: { id: true },
    });

    if (!bus) {
      return NextResponse.json(
        { error: "Bus not found or unauthorized" },
        { status: 404 }
      );
    }

    const { type, description, cost, notes } = body;

    if (!type || cost === undefined || cost === null) {
      return NextResponse.json(
        { error: "Type and cost are required" },
        { status: 400 }
      );
    }

    const record = await prisma.busMaintenance.create({
      data: {
        busId,
        type,
        description: description || "",
        cost: parseNumber(cost),
        notes: notes || "",
      },
    });

    // ✅ Audit Log
    await createAuditLog({
      businessId,
      userId: auth.userId,
      action: "create_maintenance",
      details: {
        maintenanceId: record.id,
        busId: record.busId,
        type: record.type,
        cost: Number(record.cost),
      },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error("Error creating maintenance record:", error);
    return NextResponse.json(
      { error: "Failed to create maintenance record" },
      { status: 500 }
    );
  }
}