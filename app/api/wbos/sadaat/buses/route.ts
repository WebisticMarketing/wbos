// app/api/wbos/sadaat/buses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";

async function getBusinessId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get("wbos_token")?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    return payload.businessId;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const businessId = await getBusinessId(req);
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const buses = await prisma.bus.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(buses);
  } catch (error) {
    console.error("Error fetching buses:", error);
    return NextResponse.json(
      { error: "Failed to fetch buses" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const businessId = await getBusinessId(req);
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // ✅ Only numberPlate is required now
    if (!body.numberPlate) {
      return NextResponse.json(
        { error: "numberPlate is required" },
        { status: 400 }
      );
    }

    // 🔥 Auto‑generate busNumber if missing
    let busNumber = body.busNumber;
    if (!busNumber) {
      const count = await prisma.bus.count({
        where: { businessId },
      });
      busNumber = `BUS-${String(count + 1).padStart(3, '0')}`;
    }

    const newBus = await prisma.bus.create({
      data: {
        busNumber,
        numberPlate: body.numberPlate.trim(),
        name: body.name?.trim() || null,
        capacity: Number(body.capacity) || 0,
        status: body.status || "active",
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
        notes: body.notes?.trim() || null,
        businessId: businessId,
      },
    });

    return NextResponse.json(newBus, { status: 201 });
  } catch (error) {
    console.error("Error creating bus:", error);
    return NextResponse.json(
      { error: "Failed to create bus" },
      { status: 500 }
    );
  }
}