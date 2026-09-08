import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getActiveWbosAuth } from "@/app/lib/auth-helpers";
import { createAuditLog } from "@/app/lib/audit";

const ELIGIBLE_ROLES = ["Owner", "Manager"];

function getRange(month: string | null) {
  const value = month || new Date().toISOString().slice(0, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return null;
  const [year, monthNumber] = value.split("-").map(Number);
  return { value, gte: new Date(year, monthNumber - 1, 1), lt: new Date(year, monthNumber, 1) };
}

async function getEligibleUser(businessId: string, userId: string) {
  return prisma.wbosUser.findFirst({
    where: {
      id: userId,
      businessId,
      status: "active",
      roles: { some: { role: { name: { in: ELIGIBLE_ROLES } } } },
    },
    include: { roles: { include: { role: true } } },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const auth = await getActiveWbosAuth(req);
    const { userId } = await params;
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!(await getEligibleUser(auth.businessId, auth.userId))) return NextResponse.json({ error: "Manager or owner access required" }, { status: 403 });
    const user = await getEligibleUser(auth.businessId, userId);
    if (!user) return NextResponse.json({ error: "Manager or owner not found" }, { status: 404 });
    const range = getRange(req.nextUrl.searchParams.get("month"));
    if (!range) return NextResponse.json({ error: "Invalid month format. Use YYYY-MM." }, { status: 400 });
    const expenses = await prisma.wbosPersonalExpense.findMany({ where: { businessId: auth.businessId, userId, expenseDate: { gte: range.gte, lt: range.lt } }, orderBy: { expenseDate: "desc" } });
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, roles: user.roles.map(({ role }) => role.name) }, month: range.value, expenses, monthlyTotal: expenses.reduce((sum, expense) => sum + Number(expense.amount), 0) });
  } catch (error) {
    console.error("Personal expense detail error:", error);
    return NextResponse.json({ error: "Failed to fetch personal expenses" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const auth = await getActiveWbosAuth(req);
    const { userId } = await params;
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!(await getEligibleUser(auth.businessId, auth.userId))) return NextResponse.json({ error: "Manager or owner access required" }, { status: 403 });
    const user = await getEligibleUser(auth.businessId, userId);
    if (!user) return NextResponse.json({ error: "Manager or owner not found" }, { status: 404 });

    const body = await req.json();
    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0 || !body.category?.trim() || !body.description?.trim()) {
      return NextResponse.json({ error: "Amount, category, and description are required" }, { status: 400 });
    }
    const expenseDate = body.expenseDate ? new Date(body.expenseDate) : new Date();
    if (Number.isNaN(expenseDate.getTime())) return NextResponse.json({ error: "Invalid expense date" }, { status: 400 });

    const expense = await prisma.wbosPersonalExpense.create({ data: { businessId: auth.businessId, userId, amount, category: body.category.trim(), description: body.description.trim(), notes: body.notes?.trim() || null, expenseDate } });
    await createAuditLog({ businessId: auth.businessId, userId: auth.userId, action: "create_personal_expense", details: { expenseId: expense.id, targetUserId: userId, amount, category: expense.category } });
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("Create personal expense error:", error);
    return NextResponse.json({ error: "Failed to add personal expense" }, { status: 500 });
  }
}