// app/lib/notifications.ts
import { prisma } from "./prisma";

interface NotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}

export async function createNotification(data: NotificationData) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link || null,
        read: false,
      },
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

export async function getNotifications(userId: string, limit: number = 50) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

export async function getUnreadCount(userId: string) {
  try {
    const count = await prisma.notification.count({
      where: { userId, read: false },
    });
    return count;
  } catch (error) {
    console.error("Error counting unread notifications:", error);
    return 0;
  }
}

export async function markAsRead(notificationId: string) {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true, readAt: new Date() },
    });
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
}

export async function markAllAsRead(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });
    return true;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }
}

// Notification types
export const NotificationTypes = {
  NEW_LEAD: "new_lead",
  NEW_CLIENT: "new_client",
  PAYMENT_RECEIVED: "payment_received",
  TASK_COMPLETED: "task_completed",
  TASK_OVERDUE: "task_overdue",
  PAYMENT_OVERDUE: "payment_overdue",
  ONBOARDING_COMPLETED: "onboarding_completed",
  PROJECT_COMPLETED: "project_completed",
} as const;

// Notification helper functions
export async function notifyNewLead(adminId: string, leadName: string, leadId: string) {
  return createNotification({
    userId: adminId,
    type: NotificationTypes.NEW_LEAD,
    title: "New Lead",
    message: `New lead "${leadName}" has been added.`,
    link: `/admin/leads/${leadId}`,
  });
}

export async function notifyNewClient(adminId: string, clientName: string, clientId: string) {
  return createNotification({
    userId: adminId,
    type: NotificationTypes.NEW_CLIENT,
    title: "New Client",
    message: `"${clientName}" has been converted to a client.`,
    link: `/admin/clients/${clientId}`,
  });
}

export async function notifyPaymentReceived(adminId: string, clientName: string, amount: number, clientId: string) {
  return createNotification({
    userId: adminId,
    type: NotificationTypes.PAYMENT_RECEIVED,
    title: "Payment Received",
    message: `Received £${amount.toFixed(2)} from "${clientName}".`,
    link: `/admin/clients/${clientId}`,
  });
}

export async function notifyTaskCompleted(adminId: string, taskTitle: string, taskId: string) {
  return createNotification({
    userId: adminId,
    type: NotificationTypes.TASK_COMPLETED,
    title: "Task Completed",
    message: `Task "${taskTitle}" has been completed.`,
    link: `/admin/tasks/${taskId}`,
  });
}

export async function notifyOnboardingCompleted(adminId: string, clientName: string, clientId: string) {
  return createNotification({
    userId: adminId,
    type: NotificationTypes.ONBOARDING_COMPLETED,
    title: "Onboarding Complete",
    message: `Onboarding for "${clientName}" is complete.`,
    link: `/admin/clients/${clientId}`,
  });
}

export async function notifyTaskOverdue(adminId: string, taskTitle: string, taskId: string, daysOverdue: number) {
  return createNotification({
    userId: adminId,
    type: NotificationTypes.TASK_OVERDUE,
    title: "⚠️ Task Overdue",
    message: `Task "${taskTitle}" is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue!`,
    link: `/admin/tasks/${taskId}`,
  });
}

export async function notifyPaymentOverdue(adminId: string, clientName: string, amount: number, clientId: string, daysOverdue: number) {
  return createNotification({
    userId: adminId,
    type: NotificationTypes.PAYMENT_OVERDUE,
    title: "🔴 Payment Overdue",
    message: `£${amount.toFixed(2)} payment from "${clientName}" is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue!`,
    link: `/admin/clients/${clientId}`,
  });
}