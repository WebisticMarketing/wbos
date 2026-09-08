// app/api/admin/team/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyAuth } from "@/app/lib/admin";

// GET - Get all team members
export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAuth(req);
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const teamMembers = await prisma.teamMember.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ teamMembers });
  } catch (error) {
    console.error("Team members fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

// POST - Create a new team member
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
    const { name, email, role, avatar, phone, bio } = body;

    if (!name || !email || !role) {
      return NextResponse.json(
        { error: "Name, email, and role are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await prisma.teamMember.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A team member with this email already exists" },
        { status: 400 }
      );
    }

    const teamMember = await prisma.teamMember.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        role,
        avatar: avatar || null,
        phone: phone || null,
        bio: bio || null,
        active: true,
      },
    });

    return NextResponse.json({ teamMember });
  } catch (error) {
    console.error("Team member create error:", error);
    return NextResponse.json(
      { error: "Failed to create team member" },
      { status: 500 }
    );
  }
}