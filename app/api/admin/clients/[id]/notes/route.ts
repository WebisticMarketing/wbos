// app/api/admin/clients/[id]/notes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyAuth } from "@/app/lib/admin";

// GET - Get all notes for a client
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

    // Since we don't have a Note model yet, we'll use the client's notes field
    // For now, return the client's notes as a single note
    const client = await prisma.client.findUnique({
      where: { id },
      select: { notes: true },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // Return notes as an array (for now, just the single notes field)
    // Later we can add a proper Note model
    const notes = client.notes ? [
      {
        id: "1",
        content: client.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ] : [];

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Notes fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

// POST - Add a note to a client
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

    // Append to existing notes
    const client = await prisma.client.findUnique({
      where: { id },
      select: { notes: true },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    const existingNotes = client.notes || "";
    const timestamp = new Date().toLocaleString();
    const newNotes = existingNotes 
      ? `${existingNotes}\n\n[${timestamp}] ${content}`
      : `[${timestamp}] ${content}`;

    await prisma.client.update({
      where: { id },
      data: { notes: newNotes },
    });

    return NextResponse.json({ 
      success: true,
      note: {
        id: Date.now().toString(),
        content: `[${timestamp}] ${content}`,
        createdAt: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error("Note create error:", error);
    return NextResponse.json(
      { error: "Failed to add note" },
      { status: 500 }
    );
  }
}