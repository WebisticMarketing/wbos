// app/api/admin/payment-alerts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyAuth } from "@/app/lib/admin";

export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAuth(req);
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date();
    const alerts = [];

    // ============================================================
    // 1. Get pending/overdue payments from payments table
    // ============================================================
    const payments = await prisma.payment.findMany({
      where: {
        status: {
          in: ["pending", "overdue"],
        },
      },
      include: {
        client: true,
        project: true,
      },
      orderBy: { dueDate: "asc" },
    });

    for (const payment of payments) {
      if (!payment.dueDate) continue;

      const dueDate = new Date(payment.dueDate);
      const diffTime = dueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Only show if overdue or within 30 days
      if (diffDays > 30) continue;

      alerts.push({
        id: payment.id,
        type: "one-time",
        clientId: payment.clientId,
        clientName: payment.client.name,
        projectId: payment.projectId,
        projectName: payment.project?.name || "Unknown Project",
        amount: payment.amount,
        dueDate: payment.dueDate,
        status: diffDays < 0 ? "overdue" : "upcoming",
        daysUntil: diffDays,
      });
    }

    // ============================================================
    // 2. Get upcoming recurring payments
    // ============================================================
    const recurringPayments = await prisma.recurringPayment.findMany({
      where: {
        status: "active",
        nextPaymentDate: {
          lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // Next 30 days
        },
      },
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
      orderBy: { nextPaymentDate: "asc" },
    });

    for (const rp of recurringPayments) {
      if (!rp.nextPaymentDate) continue;

      const dueDate = new Date(rp.nextPaymentDate);
      const diffTime = dueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Skip if already passed (should be handled by overdue check)
      if (diffDays < 0) {
        // This recurring payment is overdue - mark as overdue
        alerts.push({
          id: rp.id,
          type: "recurring",
          clientId: rp.project.client.id,
          clientName: rp.project.client.name,
          projectId: rp.projectId,
          projectName: rp.project.name,
          amount: rp.amount,
          dueDate: rp.nextPaymentDate,
          status: "overdue",
          daysUntil: diffDays,
          isRecurring: true,
        });
      } else if (diffDays <= 30) {
        alerts.push({
          id: rp.id,
          type: "recurring",
          clientId: rp.project.client.id,
          clientName: rp.project.client.name,
          projectId: rp.projectId,
          projectName: rp.project.name,
          amount: rp.amount,
          dueDate: rp.nextPaymentDate,
          status: "upcoming",
          daysUntil: diffDays,
          isRecurring: true,
        });
      }
    }

    // Sort: overdue first, then by due date
    alerts.sort((a, b) => {
      if (a.status === "overdue" && b.status !== "overdue") return -1;
      if (a.status !== "overdue" && b.status === "overdue") return 1;
      return a.daysUntil - b.daysUntil;
    });

    return NextResponse.json({
      alerts,
      summary: {
        overdue: alerts.filter(a => a.status === "overdue").length,
        upcoming: alerts.filter(a => a.status === "upcoming").length,
        total: alerts.length,
      },
    });
  } catch (error) {
    console.error("Payment alerts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment alerts" },
      { status: 500 }
    );
  }
}