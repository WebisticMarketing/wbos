import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getActiveWbosAuth } from "@/app/lib/auth-helpers";
import { createAuditLog } from "@/app/lib/audit";

const ELIGIBLE_ROLES = ["Owner", "Manager", "Other"];

function monthRange(month: string | null) {
  const value = month || new Date().toISOString().slice(0, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return null;
  const [year, monthNumber] = value.split("-").map(Number);
  return {
    value,
    gte: new Date(year, monthNumber - 1, 1),
    lt: new Date(year, monthNumber, 1),
  };
}

async function getManagerOrOwner(businessId: string, userId: string) {
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

export async function GET(req: NextRequest) {
  try {
    const auth = await getActiveWbosAuth(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const actor = await getManagerOrOwner(auth.businessId, auth.userId);
    if (!actor) return NextResponse.json({ error: "Manager or owner access required" }, { status: 403 });

    const range = monthRange(req.nextUrl.searchParams.get("month"));
    if (!range) return NextResponse.json({ error: "Invalid month format. Use YYYY-MM." }, { status: 400 });

    const users = await prisma.wbosUser.findMany({
      where: {
        businessId: auth.businessId,
        status: "active",
        personalExpenseEnabled: true,
        roles: { some: { role: { name: { in: ELIGIBLE_ROLES } } } },
      },
      include: {
        roles: { include: { role: true } },
        personalExpenses: {
          where: { expenseDate: { gte: range.gte, lt: range.lt } },
          orderBy: { expenseDate: "desc" },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      month: range.value,
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles.map(({ role }) => role.name),
        expenses: user.personalExpenses,
        monthlyTotal: user.personalExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0),
      })),
      availableUsers: await prisma.wbosUser.findMany({
        where: {
          businessId: auth.businessId,
          status: "active",
          personalExpenseEnabled: false,
          roles: { some: { role: { name: { in: ELIGIBLE_ROLES } } } },
        },
        include: { roles: { include: { role: true } } },
        orderBy: { name: "asc" },
      }).then((available) => available.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles.map(({ role }) => role.name),
      }))),
    });
  } catch (error) {
    console.error("Personal expenses error:", error);
    return NextResponse.json({ error: "Failed to fetch personal expenses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getActiveWbosAuth(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!(await getManagerOrOwner(auth.businessId, auth.userId))) {
      return NextResponse.json({ error: "Manager or owner access required" }, { status: 403 });
    }

    const body = await req.json();

    if (body.action === "create") {
      const name = typeof body.name === "string" ? body.name.trim() : "";
      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      const roleName = ELIGIBLE_ROLES.includes(body.role) ? body.role : "";
      if (!name || !/^\S+@\S+\.\S+$/.test(email) || !roleName) {
        return NextResponse.json({ error: "Name, valid email, and role are required" }, { status: 400 });
      }

      const role = await prisma.wbosRole.upsert({
        where: { businessId_name: { businessId: auth.businessId, name: roleName } },
        update: {},
        create: { businessId: auth.businessId, name: roleName, description: "Personal expense tracker role", isSystem: false },
      });

      const existing = await prisma.wbosUser.findUnique({
        where: { businessId_email: { businessId: auth.businessId, email } },
      });
      if (existing) {
        return NextResponse.json({ error: "A person with this email already exists" }, { status: 409 });
      }

      const created = await prisma.wbosUser.create({
        data: {
          businessId: auth.businessId,
          email,
          name,
          status: "active",
          acceptedAt: new Date(),
          personalExpenseEnabled: true,
          roles: { create: { roleId: role.id } },
        },
      });
      await createAuditLog({
        businessId: auth.businessId,
        userId: auth.userId,
        action: "create_personal_expense_person",
        details: { targetUserId: created.id, targetName: created.name, role: roleName },
      });
      return NextResponse.json({ success: true, user: { id: created.id, name: created.name, email: created.email, roles: [roleName] } }, { status: 201 });
    }

    if (!body.userId || !["add", "remove"].includes(body.action)) {
      return NextResponse.json({ error: "userId and action are required" }, { status: 400 });
    }
    const target = await prisma.wbosUser.findFirst({
      where: {
        id: body.userId,
        businessId: auth.businessId,
        status: "active",
        roles: { some: { role: { name: { in: ELIGIBLE_ROLES } } } },
      },
    });
    if (!target) return NextResponse.json({ error: "Manager or owner not found" }, { status: 404 });

    const enabled = body.action === "add";
    await prisma.wbosUser.update({ where: { id: target.id }, data: { personalExpenseEnabled: enabled } });
    await createAuditLog({
      businessId: auth.businessId,
      userId: auth.userId,
      action: enabled ? "add_personal_expense_person" : "remove_personal_expense_person",
      details: { targetUserId: target.id, targetName: target.name },
    });
    return NextResponse.json({ success: true, enabled });
  } catch (error) {
    console.error("Personal expense membership error:", error);
    return NextResponse.json({ error: "Failed to update expense tracker people" }, { status: 500 });
  }
}