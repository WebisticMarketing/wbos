// app/api/wbos/sadaat/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import jwt from "jsonwebtoken";
import { getRequiredEnv } from "@/lib/env";

const JWT_SECRET = getRequiredEnv("JWT_SECRET");

// ============================================================
// 🔐 AUTH HELPER – Faster (no DB query)
// ============================================================
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

const toNumber = (val: any): number => {
  if (val === undefined || val === null || val === "") return 0;
  const num = typeof val === "number" ? val : parseFloat(val);
  return isNaN(num) ? 0 : num;
};

// ============================================================
// 📊 MAIN DASHBOARD
// ============================================================
export async function GET(req: NextRequest) {
  try {
    const businessId = await getBusinessId(req);
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    
    // ✅ FIX: Today = start of day to end of day
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    // 🚀 Fetch everything in parallel with businessId filter
    const [
      buses,
      todayVouchers,
      monthVouchers,
      addaIncome,
      addaExpenses,
      petrolPurchases,
      busFuelRecords,
      cargoRecords,
      installments,
      installmentPayments,
    ] = await Promise.all([
      // Buses
      prisma.bus.findMany({
        where: { businessId },
      }),
      
      // Today's vouchers
      prisma.busVoucher.findMany({
        where: {
          businessId,
          voucherDate: {
            gte: todayStart,
            lt: todayEnd,
          },
        },
      }),
      
      // Month's vouchers
      prisma.busVoucher.findMany({
        where: {
          businessId,
          voucherDate: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      }),
      
      // Adda Income
      prisma.addaIncome.findMany({
        where: {
          businessId,
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      }),
      
      // Adda Expenses
      prisma.addaExpense.findMany({
        where: {
          businessId,
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      }),
      
      // Petrol Purchases
      prisma.petrolPumpPurchase.findMany({
        where: {
          businessId,
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      }),
      
      // Bus Fuel Records (sales)
      prisma.busFuelRecord.findMany({
        where: {
          businessId,
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      }),
      
      // Cargo Records
      prisma.cargoRecord.findMany({
        where: {
          businessId,
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      }),
      
      // Active Installments
      prisma.installment.findMany({
        where: {
          businessId,
          isActive: true,
        },
      }),
      
      // Installment Payments for this month
      prisma.installmentPayment.findMany({
        where: {
          businessId,
          paymentDate: {
            gte: monthStart,
            lte: monthEnd,
          },
          status: "active",
        },
      }),
    ]);

    // 📊 Calculate totals
    const todayBusRevenue = todayVouchers.reduce((sum, v) => sum + toNumber(v.totalRevenue), 0);
    const todayBusExpenses = todayVouchers.reduce((sum, v) => sum + toNumber(v.totalExpenses), 0);
    const todayBusProfit = todayBusRevenue - todayBusExpenses;

    const monthBusRevenue = monthVouchers.reduce((sum, v) => sum + toNumber(v.totalRevenue), 0);
    const monthBusExpenses = monthVouchers.reduce((sum, v) => sum + toNumber(v.totalExpenses), 0);
    const monthBusProfit = monthBusRevenue - monthBusExpenses;

    const totalAddaIncome = addaIncome.reduce((sum, i) => sum + toNumber(i.amount), 0);
    const totalAddaExpenses = addaExpenses.reduce((sum, e) => sum + toNumber(e.amount), 0);
    const addaProfit = totalAddaIncome - totalAddaExpenses;

    const totalPetrolSales = busFuelRecords.reduce((sum, r) => sum + toNumber(r.totalAmount), 0);
    const totalPetrolCost = petrolPurchases.reduce((sum, p) => sum + toNumber(p.totalCost), 0);
    const petrolProfit = totalPetrolSales - totalPetrolCost;

    const totalCargoProfit = cargoRecords.reduce((sum, r) => sum + toNumber(r.profit), 0);

    const totalInstallmentsPaid = installmentPayments.reduce(
      (sum, p) => sum + toNumber(p.amount),
      0
    );

    const finalProfit = monthBusProfit + addaProfit + petrolProfit + totalCargoProfit - totalInstallmentsPaid;

    return NextResponse.json({
      buses: {
        total: buses.length,
        active: buses.filter(b => b.status === "active").length,
      },
      today: {
        revenue: todayBusRevenue,
        expenses: todayBusExpenses,
        profit: todayBusProfit,
      },
      month: {
        revenue: monthBusRevenue,
        expenses: monthBusExpenses,
        profit: monthBusProfit,
        addaIncome: totalAddaIncome,
        addaExpenses: totalAddaExpenses,
        addaProfit: addaProfit,
        petrolSales: totalPetrolSales,
        petrolCost: totalPetrolCost,
        petrolProfit: petrolProfit,
        cargoProfit: totalCargoProfit,
        installments: totalInstallmentsPaid,
        finalProfit: finalProfit,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}