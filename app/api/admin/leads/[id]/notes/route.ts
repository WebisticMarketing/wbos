// app/api/admin/leads/[id]/notes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyAuth } from "@/app/lib/admin";

export async function POST(
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
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Get the lead
    const lead = await prisma.lead.findUnique({
      where: { id },
      select: { notes: true },
    });

    if (!lead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    // Append note with timestamp
    const timestamp = new Date().toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const existingNotes = lead.notes || "";
    const newNote = `[${timestamp}] ${content}`;
    const updatedNotes = existingNotes
      ? `${existingNotes}\n\n${newNote}`
      : newNote;

    // Update lead with new note
    await prisma.lead.update({
      where: { id },
      data: { notes: updatedNotes },
    });

    return NextResponse.json({
      success: true,
      note: {
        content: newNote,
        timestamp,
      },
      message: "Note added successfully",
    });
  } catch (error) {
    console.error("Add note error:", error);
    return NextResponse.json(
      { error: "Failed to add note" },
      { status: 500 }
    );
  }
}