// app/api/admin/wbos/businesses/[businessId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import jwt from "jsonwebtoken";
import { getRequiredEnv } from "@/lib/env";

const JWT_SECRET = getRequiredEnv("JWT_SECRET");

async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];
  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const admin = await prisma.admin.findUnique({
      where: { id: payload.id },
    });
    return admin;
  } catch {
    return null;
  }
}

// GET - Get a single business
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const admin = await verifyAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { businessId } = await params;

    console.log("🔍 Fetching business with ID:", businessId);

    // First verify the business exists
    const businessExists = await prisma.wbosBusiness.findUnique({
      where: { id: businessId },
      select: { id: true, name: true, clientId: true },
    });

    console.log("📊 Business exists check:", businessExists);

    if (!businessExists) {
      // Try to find by clientId as fallback
      const businessByClient = await prisma.wbosBusiness.findFirst({
        where: { clientId: businessId },
        select: { id: true, name: true },
      });
      
      if (businessByClient) {
        console.log("✅ Found business by clientId:", businessByClient.id);
        // Redirect to correct ID
        return NextResponse.redirect(new URL(`/admin/wbos/${businessByClient.id}`, req.url));
      }
      
      return NextResponse.json(
        { error: "Business not found", searchedId: businessId },
        { status: 404 }
      );
    }

    const business = await prisma.wbosBusiness.findUnique({
      where: { id: businessId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            whatsapp: true,
          },
        },
        users: {
          include: {
            roles: {
              include: {
                role: true,
              },
            },
          },
        },
        modules: true,
        settings: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    console.log("✅ Business fetched successfully:", business?.name);
    return NextResponse.json(business);
  } catch (error) {
    console.error("❌ Error fetching business:", error);
    return NextResponse.json(
      { error: "Failed to fetch business", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// PATCH - Update a business
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const admin = await verifyAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { businessId } = await params;
    const body = await req.json();

    // Log the incoming body to debug
    console.log("📦 PATCH body:", body);

    const { status, name, logo, email, phone, address, website, currency, timezone } = body;

    const existing = await prisma.wbosBusiness.findUnique({
      where: { id: businessId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    const business = await prisma.wbosBusiness.update({
      where: { id: businessId },
      data: {
        status: status !== undefined ? status : existing.status,
        name: name !== undefined ? name : existing.name,
        logo: logo !== undefined ? logo : existing.logo,  // ✅ IMPORTANT
        email: email !== undefined ? email : existing.email,
        phone: phone !== undefined ? phone : existing.phone,
        address: address !== undefined ? address : existing.address,
        website: website !== undefined ? website : existing.website,
        currency: currency !== undefined ? currency : existing.currency,
        timezone: timezone !== undefined ? timezone : existing.timezone,
        ...(status === "suspended" && { suspendedAt: new Date() }),
        ...(status === "active" && { suspendedAt: null }),
      },
    });

    console.log("✅ Business updated:", business);

    return NextResponse.json(business);
  } catch (error) {
    console.error("Error updating business:", error);
    return NextResponse.json(
      { error: "Failed to update business" },
      { status: 500 }
    );
  }
}

// DELETE - Archive a business
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const admin = await verifyAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { businessId } = await params;

    const business = await prisma.wbosBusiness.update({
      where: { id: businessId },
      data: {
        status: "archived",
      },
    });

    return NextResponse.json({ message: "Business archived", business });
  } catch (error) {
    console.error("Error archiving business:", error);
    return NextResponse.json(
      { error: "Failed to archive business" },
      { status: 500 }
    );
  }
}