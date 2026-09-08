// app/api/admin/check-overdue/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyAuth } from "@/app/lib/admin";
import { notifyTaskOverdue, notifyPaymentOverdue } from "@/app/lib/notifications";

// GET - Check for overdue tasks and payments
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
    const results = {
      overdueTasks: 0,
      overduePayments: 0,
      notificationsSent: 0,
    };

    // ============================================================
    // 1. Check Overdue Tasks (Excluding Completed)
    // ============================================================
    const overdueTasks = await prisma.task.findMany({
      where: {
        status: {
          notIn: ["done", "completed"],
        },
        dueDate: { lt: now },
      },
      include: {
        client: true,
        assignedToMember: true,
      },
    });

    for (const task of overdueTasks) {
      const daysOverdue = Math.floor(
        (now.getTime() - new Date(task.dueDate!).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      // Only notify if overdue by 1+ days
      if (daysOverdue >= 1) {
        await notifyTaskOverdue(admin.id, task.title, task.id, daysOverdue);
        results.overdueTasks++;
        results.notificationsSent++;
      }
    }

    // ============================================================
    // 2. Check Overdue Payments (Excluding Paid)
    // ============================================================
    const overduePayments = await prisma.payment.findMany({
      where: {
        status: {
          notIn: ["paid", "completed"],
        },
        dueDate: { lt: now },
      },
      include: {
        client: true,
        project: true,
      },
    });

    for (const payment of overduePayments) {
      const daysOverdue = Math.floor(
        (now.getTime() - new Date(payment.dueDate!).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysOverdue >= 1) {
        await notifyPaymentOverdue(
          admin.id,
          payment.client.name,
          payment.amount,
          payment.client.id,
          daysOverdue
        );
        results.overduePayments++;
        results.notificationsSent++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Overdue check completed",
      results,
    });
  } catch (error) {
    console.error("Overdue check error:", error);
    return NextResponse.json(
      { error: "Failed to check overdue items" },
      { status: 500 }
    );
  }
}