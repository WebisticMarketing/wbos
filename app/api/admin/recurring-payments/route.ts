// app/api/admin/recurring-payments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyAuth } from "@/app/lib/admin";

// GET - Get all recurring payments
export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAuth(req);
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");

    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;

    const recurringPayments = await prisma.recurringPayment.findMany({
      where,
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
      orderBy: { nextPaymentDate: "asc" },
    });

    // Calculate Monthly Recurring Revenue (MRR)
    let mrr = 0;
    for (const rp of recurringPayments) {
      if (rp.status === "active") {
        let monthlyAmount = rp.amount;
        if (rp.frequency === "quarterly") monthlyAmount = rp.amount / 3;
        if (rp.frequency === "yearly") monthlyAmount = rp.amount / 12;
        mrr += monthlyAmount;
      }
    }

    // Calculate Annual Recurring Revenue (ARR)
    const arr = mrr * 12;

    // Count upcoming payments (next 30 days)
    const now = new Date();
    const thirtyDaysLater = new Date(now);
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    const upcomingPayments = recurringPayments.filter(
      (rp) =>
        rp.status === "active" &&
        rp.nextPaymentDate >= now &&
        rp.nextPaymentDate <= thirtyDaysLater
    );

    return NextResponse.json({
      recurringPayments,
      mrr,
      arr,
      upcomingCount: upcomingPayments.length,
      upcomingPayments,
    });
  } catch (error) {
    console.error("Recurring payments fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recurring payments" },
      { status: 500 }
    );
  }
}

// POST - Create a new recurring payment
export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAuth(req);
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { projectId, amount, frequency, nextPaymentDate, status, notes } = body;

    if (!projectId || !amount || !nextPaymentDate) {
      return NextResponse.json(
        { error: "Project ID, amount, and next payment date are required" },
        { status: 400 }
      );
    }

    const recurringPayment = await prisma.recurringPayment.create({
      data: {
        projectId,
        amount,
        frequency: frequency || "monthly",
        nextPaymentDate: new Date(nextPaymentDate),
        status: status || "active",
        notes,
      },
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
    });

    return NextResponse.json({ recurringPayment });
  } catch (error) {
    console.error("Recurring payment create error:", error);
    return NextResponse.json(
      { error: "Failed to create recurring payment" },
      { status: 500 }
    );
  }
}