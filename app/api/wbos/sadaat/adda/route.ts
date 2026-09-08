// app/api/wbos/sadaat/adda/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getBusinessId, getAuthPayload } from "@/app/lib/auth-helpers";
import { createAuditLog } from "@/app/lib/audit";

const toNumber = (val: any): number => {
  if (val === undefined || val === null || val === "") return 0;
  const num = typeof val === "number" ? val : parseFloat(val);
  return isNaN(num) ? 0 : num;
};

// GET – Fetch income & expenses
export async function GET(req: NextRequest) {
  try {
    const businessId = await getBusinessId(req);
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [income, expenses, categories] = await Promise.all([
      prisma.addaIncome.findMany({
        where: { businessId },
        orderBy: { date: "desc" },
      }),
      prisma.addaExpense.findMany({
        where: { businessId },
        include: { category: true },
        orderBy: { date: "desc" },
      }),
      prisma.addaExpenseCategory.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      }),
    ]);

    const totalIncome = income.reduce((sum, row) => sum + toNumber(row.amount), 0);
    const totalExpenses = expenses.reduce((sum, row) => sum + toNumber(row.amount), 0);
    const profit = totalIncome - totalExpenses;

    return NextResponse.json({
      income,
      expenses,
      categories,
      totals: { totalIncome, totalExpenses, profit },
    });
  } catch (error) {
    console.error("Error fetching Adda data:", error);
    return NextResponse.json(
      { error: "Failed to fetch Adda data" },
      { status: 500 }
    );
  }
}

// POST – Add income or expense
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

    if (!body.type || !body.amount) {
      return NextResponse.json(
        { error: "type and amount are required" },
        { status: 400 }
      );
    }

    const amount = toNumber(body.amount);

    if (body.type === "income") {
      const result = await prisma.addaIncome.create({
        data: {
          date: body.date ? new Date(body.date) : new Date(),
          amount,
          description: body.description || "",
          notes: body.notes || "",
          isCommission: body.isCommission || false,
          businessId,
        },
      });

      // ✅ Audit Log
      await createAuditLog({
        businessId,
        userId: auth.userId,
        action: "create_adda_income",
        details: {
          incomeId: result.id,
          amount: Number(result.amount),
          description: result.description,
        },
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
        userAgent: req.headers.get("user-agent") || undefined,
      });

      return NextResponse.json(result);
    }

    if (body.type === "expense") {
      if (!body.categoryId) {
        return NextResponse.json(
          { error: "categoryId is required for expenses" },
          { status: 400 }
        );
      }

      const result = await prisma.addaExpense.create({
        data: {
          date: body.date ? new Date(body.date) : new Date(),
          categoryId: body.categoryId,
          amount,
          description: body.description || "",
          notes: body.notes || "",
          businessId,
        },
      });

      // ✅ Audit Log
      await createAuditLog({
        businessId,
        userId: auth.userId,
        action: "create_adda_expense",
        details: {
          expenseId: result.id,
          categoryId: result.categoryId,
          amount: Number(result.amount),
          description: result.description,
        },
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
        userAgent: req.headers.get("user-agent") || undefined,
      });

      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "Invalid type. Must be 'income' or 'expense'." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error adding Adda record:", error);
    return NextResponse.json(
      { error: "Failed to add record" },
      { status: 500 }
    );
  }
}