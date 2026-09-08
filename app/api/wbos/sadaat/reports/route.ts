// app/api/wbos/sadaat/reports/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getActiveWbosAuth } from "@/app/lib/auth-helpers";

// ============================================================
// 🔐 AUTH HELPER
// ============================================================
const toNumber = (val: any): number => {
  if (val === undefined || val === null || val === "") return 0;
  const num = typeof val === "number" ? val : parseFloat(val);
  return isNaN(num) ? 0 : num;
};

// ============================================================
// 📊 MONTHLY REPORT
// ============================================================
export async function GET(req: NextRequest) {
  try {
    const auth = await getActiveWbosAuth(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const businessId = auth.businessId;

    const searchParams = req.nextUrl.searchParams;
    const monthParam = searchParams.get("month");
    const now = new Date();
    const month = monthParam || now.toISOString().slice(0, 7);
    const [year, monthNum] = month.split("-").map(Number);

    if (isNaN(year) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return NextResponse.json(
        { error: "Invalid month format. Use YYYY-MM." },
        { status: 400 }
      );
    }

    const monthStart = new Date(year, monthNum - 1, 1);
    const monthEnd = new Date(year, monthNum, 0);
    monthEnd.setHours(23, 59, 59, 999);

    // 🚀 Fetch all data with businessId filter
    const [
      buses,
      vouchers,
      maintenance,
      tyres,
      addaIncome,
      addaExpenses,
      cargoRecords,
      installments,
      petrolPurchases,
      busFuelRecords,
      installmentPayments,
    ] = await Promise.all([
      prisma.bus.findMany({
        where: { businessId },
      }),
      prisma.busVoucher.findMany({
        where: {
          businessId,
          voucherDate: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      }),
      prisma.busMaintenance.findMany({
        where: {
          businessId,
          maintenanceDate: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      }),
      prisma.busTyre.findMany({
        where: {
          businessId,
          tyreDate: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      }),
      prisma.addaIncome.findMany({
        where: {
          businessId,
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      }),
      prisma.addaExpense.findMany({
        where: {
          businessId,
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        include: { category: true },
      }),
      prisma.cargoRecord.findMany({
        where: {
          businessId,
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      }),
      prisma.installment.findMany({
        where: {
          businessId,
          isActive: true,
        },
      }),
      prisma.petrolPumpPurchase.findMany({
        where: {
          businessId,
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      }),
      prisma.busFuelRecord.findMany({
        where: {
          businessId,
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      }),
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

    // --- Timeline: Daily ---
    const dailyMap = new Map();
    vouchers.forEach((v) => {
      const date = v.voucherDate.toISOString().slice(0, 10);
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { date, revenue: 0, expenses: 0, profit: 0 });
      }
      const entry = dailyMap.get(date);
      entry.revenue += toNumber(v.totalRevenue);
      entry.expenses += toNumber(v.totalExpenses);
      entry.profit += toNumber(v.totalRevenue) - toNumber(v.totalExpenses);
    });
    const dailyTimeline = Array.from(dailyMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    // --- Timeline: Weekly ---
    const weeklyMap = new Map();
    vouchers.forEach((v) => {
      const d = new Date(v.voucherDate);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().slice(0, 10);
      if (!weeklyMap.has(key)) {
        weeklyMap.set(key, { week: key, revenue: 0, expenses: 0, profit: 0 });
      }
      const entry = weeklyMap.get(key);
      entry.revenue += toNumber(v.totalRevenue);
      entry.expenses += toNumber(v.totalExpenses);
      entry.profit += toNumber(v.totalRevenue) - toNumber(v.totalExpenses);
    });
    const weeklyTimeline = Array.from(weeklyMap.values()).sort((a, b) =>
      a.week.localeCompare(b.week)
    );

    // --- Bus Breakdown ---
    const busBreakdown = buses.map((bus) => {
      const busVouchers = vouchers.filter((v) => v.busId === bus.id);
      const busMaintenance = maintenance.filter((m) => m.busId === bus.id);
      const busTyres = tyres.filter((t) => t.busId === bus.id);

      const revenue = busVouchers.reduce((sum, v) => sum + toNumber(v.totalRevenue), 0);
      const expenses = busVouchers.reduce((sum, v) => sum + toNumber(v.totalExpenses), 0);
      const profit = revenue - expenses;
      const maintCost = busMaintenance.reduce((sum, m) => sum + toNumber(m.cost), 0);
      const tyreCost = busTyres.reduce((sum, t) => sum + toNumber(t.cost), 0);
      const netProfit = profit - maintCost - tyreCost;

      return {
        id: bus.id,
        busNumber: bus.busNumber,
        numberPlate: bus.numberPlate,
        revenue,
        expenses,
        profit,
        maintenance: maintCost,
        tyres: tyreCost,
        netProfit,
        tripCount: busVouchers.length,
      };
    });

    // --- Totals ---
    const totalAddaIncome = addaIncome.reduce((sum, i) => sum + toNumber(i.amount), 0);
    const totalAddaExpenses = addaExpenses.reduce((sum, e) => sum + toNumber(e.amount), 0);
    const addaProfit = totalAddaIncome - totalAddaExpenses;

    const totalPetrolSales = busFuelRecords.reduce((sum, r) => sum + toNumber(r.totalAmount), 0);
    const totalPetrolCost = petrolPurchases.reduce((sum, p) => sum + toNumber(p.totalCost), 0);
    const petrolProfit = totalPetrolSales - totalPetrolCost;

    const totalCargoProfit = cargoRecords.reduce((sum, r) => sum + toNumber(r.profit), 0);

    const totalScheduledInstallments = installments.reduce(
      (sum, i) => sum + toNumber(i.monthlyDeduction),
      0
    );
    const totalInstallmentsPaid = installmentPayments.reduce(
      (sum, p) => sum + toNumber(p.amount),
      0
    );

    const installmentsDetails = installmentPayments.map((p) => ({
      id: p.id,
      installmentId: p.installmentId,
      amount: toNumber(p.amount),
      paymentDate: p.paymentDate,
      paymentMethod: p.paymentMethod,
      referenceNumber: p.referenceNumber,
      notes: p.notes,
    }));

    const totalBusProfit = busBreakdown.reduce((sum, b) => sum + b.netProfit, 0);
    const finalProfit =
      totalBusProfit +
      addaProfit +
      petrolProfit +
      totalCargoProfit -
      totalInstallmentsPaid;

    const monthString = `${year.toString().padStart(4, "0")}-${monthNum.toString().padStart(2, "0")}`;

    return NextResponse.json({
      month: monthString,
      timeline: {
        daily: dailyTimeline,
        weekly: weeklyTimeline,
      },
      busBreakdown,
      adda: {
        income: totalAddaIncome,
        expenses: totalAddaExpenses,
        profit: addaProfit,
      },
      petrol: {
        sales: totalPetrolSales,
        cost: totalPetrolCost,
        profit: petrolProfit,
      },
      cargo: {
        profit: totalCargoProfit,
        count: cargoRecords.length,
      },
      installments: {
        scheduled: totalScheduledInstallments,
        paid: totalInstallmentsPaid,
        count: installments.length,
        details: installmentsDetails,
      },
      summary: {
        totalBusProfit,
        addaProfit,
        petrolProfit,
        cargoProfit: totalCargoProfit,
        totalInstallments: totalInstallmentsPaid,
        finalProfit,
      },
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}