// app/api/wbos/sadaat/cargo/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getBusinessId, getAuthPayload } from "@/app/lib/auth-helpers";
import { createAuditLog } from "@/app/lib/audit";

const toNumber = (val: any): number => {
  if (val === undefined || val === null || val === "") return 0;
  const num = typeof val === "number" ? val : parseFloat(val);
  return isNaN(num) ? 0 : num;
};

// GET – List cargo records
export async function GET(req: NextRequest) {
  try {
    const businessId = await getBusinessId(req);
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const records = await prisma.cargoRecord.findMany({
      where: { businessId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching cargo records:", error);
    return NextResponse.json(
      { error: "Failed to fetch cargo records" },
      { status: 500 }
    );
  }
}

// POST – Create a new cargo record
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

    if (!body.description || !body.profit) {
      return NextResponse.json(
        { error: "description and profit are required" },
        { status: 400 }
      );
    }

    const record = await prisma.cargoRecord.create({
      data: {
        date: body.date ? new Date(body.date) : new Date(),
        description: body.description,
        profit: toNumber(body.profit),
        notes: body.notes || null,
        businessId,
      },
    });

    // ✅ Audit Log
    await createAuditLog({
      businessId,
      userId: auth.userId,
      action: "create_cargo",
      details: {
        cargoId: record.id,
        description: record.description,
        profit: Number(record.profit),
      },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error("Error creating cargo record:", error);
    return NextResponse.json(
      { error: "Failed to create cargo record" },
      { status: 500 }
    );
  }
}