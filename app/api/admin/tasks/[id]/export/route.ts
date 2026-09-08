// app/api/admin/tasks/[id]/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyAuth } from "@/app/lib/admin";
import { generateTaskPDF } from "@/app/lib/task-pdf";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAuth(req);
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            service: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            business: true,
          },
        },
        assignedToMember: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Convert Date objects to strings for the PDF generator
    const taskData = {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      client: task.client,
      project: task.project,
      assignedToMember: task.assignedToMember,
    };

    const pdfBuffer = generateTaskPDF(taskData);

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Task_${task.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error("Task export error:", error);
    return NextResponse.json(
      { error: "Failed to export task" },
      { status: 500 }
    );
  }
}