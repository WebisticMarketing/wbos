// app/api/admin/tasks/route.ts
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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const projectId = searchParams.get("projectId");
    const clientId = searchParams.get("clientId");
    const assignedTo = searchParams.get("assignedTo");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (projectId) where.projectId = projectId;
    if (clientId) where.clientId = clientId;
    if (assignedTo) where.assignedToId = assignedTo;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
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
        orderBy: [
          { priority: "desc" },
          { dueDate: "asc" },
          { createdAt: "desc" },
        ],
        take: limit,
        skip,
      }),
      prisma.task.count({ where }),
    ]);

    return NextResponse.json({
      tasks,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Tasks fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

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
    const {
      title,
      description,
      status = "todo",
      priority = "medium",
      projectId,
      clientId,
      assignedTo,
      dueDate,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // If assignedTo is provided, check if it's a valid team member
    let assignedToId = null;
    if (assignedTo) {
      const teamMember = await prisma.teamMember.findUnique({
        where: { id: assignedTo },
      });
      if (teamMember) {
        assignedToId = assignedTo;
      }
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description || null,
        status,
        priority,
        projectId: projectId || null,
        clientId: clientId || null,
        assignedToId: assignedToId,
        dueDate: dueDate ? new Date(dueDate) : null,
        createdBy: admin.id,
      },
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
    console.error("Task create error:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}