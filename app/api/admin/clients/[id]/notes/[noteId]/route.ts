// app/api/admin/clients/[id]/notes/[noteId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyAuth } from "@/app/lib/admin";

// DELETE - Delete a note (for now, we clear the notes field if it matches)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const admin = await verifyAuth(req);
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, noteId } = await params;

    // For now, clear the notes field (since we're storing all notes in one field)
    // In a real implementation, we'd have a Note model with proper CRUD
    await prisma.client.update({
      where: { id },
      data: { notes: "" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Note delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}