// app/api/wbos/sadaat/petrol-pump/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getBusinessId } from "@/app/lib/auth-helpers";

const toNumber = (val: any): number => {
  if (val === undefined || val === null || val === "") return 0;
  const num = typeof val === "number" ? val : parseFloat(val);
  return isNaN(num) ? 0 : num;
};

export async function GET(req: NextRequest) {
  try {
    const businessId = await getBusinessId(req);
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [purchases, busFuelRecords] = await Promise.all([
      prisma.petrolPumpPurchase.findMany({
        where: {
          businessId,
          date: { gte: monthStart },
        },
        orderBy: { date: "desc" },
      }),
      prisma.busFuelRecord.findMany({
        where: {
          businessId,
          date: { gte: monthStart },
        },
        orderBy: { date: "desc" },
      }),
    ]);

    const purchaseCount = purchases.length;
    const saleCount = busFuelRecords.length;

    const totalPurchasedLiters = purchases.reduce((sum, p) => sum + toNumber(p.liters), 0);
    const totalPurchasedCost = purchases.reduce((sum, p) => sum + toNumber(p.totalCost), 0);
    const totalSoldLiters = busFuelRecords.reduce((sum, r) => sum + toNumber(r.liters), 0);
    const totalRevenue = busFuelRecords.reduce((sum, r) => sum + toNumber(r.totalAmount), 0);
    const profit = totalRevenue - totalPurchasedCost;
    const currentStock = totalPurchasedLiters - totalSoldLiters;

    return NextResponse.json({
      month: {
        petrol: {
          purchasedLiters: totalPurchasedLiters,
          purchasedCost: totalPurchasedCost,
          soldLiters: totalSoldLiters,
          revenue: totalRevenue,
          profit,
          currentStock,
        },
      },
      purchaseCount,
      saleCount,
    });
  } catch (error) {
    console.error("Error fetching petrol pump dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}