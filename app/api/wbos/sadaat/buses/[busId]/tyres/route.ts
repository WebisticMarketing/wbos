// app/api/wbos/sadaat/buses/[busId]/tyres/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getBusinessId, getAuthPayload } from "@/app/lib/auth-helpers";
import { createAuditLog } from "@/app/lib/audit";

const parseNumber = (val: any): number => {
  if (val === undefined || val === null || val === "") return 0;
  const num = typeof val === "number" ? val : parseFloat(val);
  return isNaN(num) ? 0 : num;
};

// GET – Fetch all tyre records for a bus
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

    const records = await prisma.busTyre.findMany({
      where: { busId },
      orderBy: { tyreDate: "desc" },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching tyre records:", error);
    return NextResponse.json(
      { error: "Failed to fetch tyre records" },
      { status: 500 }
    );
  }
}

// POST – Create a new tyre record
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

    const { description, cost, notes } = body;

    if (cost === undefined || cost === null) {
      return NextResponse.json(
        { error: "Cost is required" },
        { status: 400 }
      );
    }

    const record = await prisma.busTyre.create({
      data: {
        busId,
        description: description || "",
        cost: parseNumber(cost),
        notes: notes || "",
      },
    });

    // ✅ Audit Log
    await createAuditLog({
      businessId,
      userId: auth.userId,
      action: "create_tyre",
      details: {
        tyreId: record.id,
        busId: record.busId,
        cost: Number(record.cost),
      },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error("Error creating tyre record:", error);
    return NextResponse.json(
      { error: "Failed to create tyre record" },
      { status: 500 }
    );
  }
}