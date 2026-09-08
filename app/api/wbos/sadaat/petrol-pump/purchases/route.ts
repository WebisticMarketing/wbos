// app/api/wbos/sadaat/petrol-pump/purchases/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getBusinessId, getAuthPayload } from "@/app/lib/auth-helpers";
import { createAuditLog } from "@/app/lib/audit";

const toNumber = (val: any): number => {
  if (val === undefined || val === null || val === "") return 0;
  const num = typeof val === "number" ? val : parseFloat(val);
  return isNaN(num) ? 0 : num;
};

// GET – Fetch all purchases
export async function GET(req: NextRequest) {
  try {
    const businessId = await getBusinessId(req);
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const purchases = await prisma.petrolPumpPurchase.findMany({
      where: { businessId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(purchases);
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}

// POST – Create a new purchase
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

    if (!body.liters || !body.pricePerLiter) {
      return NextResponse.json(
        { error: "liters and pricePerLiter are required" },
        { status: 400 }
      );
    }

    const liters = toNumber(body.liters);
    const price = toNumber(body.pricePerLiter);
    const totalCost = liters * price;

    const purchase = await prisma.petrolPumpPurchase.create({
      data: {
        date: body.date ? new Date(body.date) : new Date(),
        liters,
        pricePerLiter: price,
        totalCost,
        supplier: body.supplier || null,
        invoiceNumber: body.invoiceNumber || null,
        notes: body.notes || null,
        businessId,
      },
    });

    // ✅ Audit Log
    await createAuditLog({
      businessId,
      userId: auth.userId,
      action: "create_petrol_purchase",
      details: {
        purchaseId: purchase.id,
        liters: Number(purchase.liters),
        totalCost: Number(purchase.totalCost),
        supplier: purchase.supplier,
      },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(purchase);
  } catch (error) {
    console.error("Error creating purchase:", error);
    return NextResponse.json(
      { error: "Failed to create purchase" },
      { status: 500 }
    );
  }
}