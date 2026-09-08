// app/api/admin/tasks/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyAuth } from "@/app/lib/admin";

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

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Task fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const body = await req.json();
    const {
      title,
      description,
      status,
      priority,
      assignedTo,
      dueDate,
      completedAt,
    } = body;

    const data: any = {};
    if (title) data.title = title.trim();
    if (description !== undefined) data.description = description;
    if (status) data.status = status;
    if (priority) data.priority = priority;
    if (dueDate) data.dueDate = new Date(dueDate);
    if (completedAt) data.completedAt = new Date(completedAt);

    // Handle assignedTo
    if (assignedTo !== undefined) {
      if (assignedTo) {
        const teamMember = await prisma.teamMember.findUnique({
          where: { id: assignedTo },
        });
        data.assignedToId = teamMember ? assignedTo : null;
      } else {
        data.assignedToId = null;
      }
    }

    const task = await prisma.task.update({
      where: { id },
      data,
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

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Task update error:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Task delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}