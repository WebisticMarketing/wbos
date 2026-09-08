// app/api/admin/wbos/businesses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import jwt from "jsonwebtoken";
import { sendInvitationEmail } from "@/lib/email";
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

// GET - List all WBOS businesses
export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const businesses = await prisma.wbosBusiness.findMany({
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            whatsapp: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(businesses);
  } catch (error) {
    console.error("Error fetching businesses:", error);
    return NextResponse.json(
      { error: "Failed to fetch businesses" },
      { status: 500 }
    );
  }
}

// POST - Create a new WBOS business
export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      name,
      industry,
      logo,
      brandColor,
      email,
      phone,
      address,
      website,
      currency,
      timezone,
      clientName,
      clientEmail,
      ownerName,
      ownerEmail,
    } = body;

    if (!name || !industry || !clientName || !clientEmail || !ownerName || !ownerEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // -------- SLUG GENERATION --------
    // Generate a slug from the business name
    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // replace spaces & special chars with -
      .replace(/^-|-$/g, '');      // remove leading/trailing dashes

    // If the slug is empty (e.g., name was only special chars), fallback to 'business'
    if (!slug) slug = 'business';

    // Ensure uniqueness: if slug already exists, append a number
    let finalSlug = slug;
    let counter = 1;
    while (await prisma.wbosBusiness.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }
    // -------- END SLUG GENERATION --------

    // Find or create client
    let client = await prisma.client.findFirst({
      where: { email: clientEmail },
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          name: clientName,
          email: clientEmail,
          business: name,
          service: "WBOS Platform",
          status: "active",
        },
      });
    }

    // Check if business already exists for this client
    const existingBusiness = await prisma.wbosBusiness.findFirst({
      where: { clientId: client.id },
    });

    if (existingBusiness) {
      return NextResponse.json(
        { error: "A business already exists for this client" },
        { status: 400 }
      );
    }

    // 1. Create business (with slug)
    const business = await prisma.wbosBusiness.create({
      data: {
        name,
        slug: finalSlug, // ✅ Added
        industry,
        logo: logo || null,
        email,
        phone,
        address,
        website,
        currency: currency || "PKR",
        timezone: timezone || "Asia/Karachi",
        status: "active",
        createdBy: admin.id,
        clientId: client.id,
      },
    });

    // 2. Create default roles
    const roleData = [
      { name: "Owner", description: "Full business control", isSystem: true },
      { name: "Manager", description: "Day-to-day operations", isSystem: true },
      { name: "Staff", description: "Limited operational access", isSystem: true },
      { name: "Accountant", description: "Financial access", isSystem: true },
    ];

    const rolesMap: Record<string, any> = {};
    for (const r of roleData) {
      const role = await prisma.wbosRole.create({
        data: {
          businessId: business.id,
          name: r.name,
          description: r.description,
          isSystem: r.isSystem,
        },
      });
      rolesMap[r.name] = role;
    }

    // 3. Generate invitation token
    const token = crypto.randomUUID();

    // 4. Create invitation record
    const invitation = await prisma.invitation.create({
      data: {
        businessId: business.id,
        email: ownerEmail,
        name: ownerName,
        roleId: rolesMap["Owner"].id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: "pending",
        invitedBy: admin.id,
        invitedByType: "admin",
      },
    });

    // 5. Create owner user
    const owner = await prisma.wbosUser.create({
      data: {
        businessId: business.id,
        email: ownerEmail,
        name: ownerName,
        status: "invited",
        invitedAt: new Date(),
      },
    });

    // 6. Assign Owner role
    await prisma.wbosUserRole.create({
      data: {
        userId: owner.id,
        roleId: rolesMap["Owner"].id,
      },
    });

    // 7. Create business settings
    await prisma.businessSettings.create({
      data: {
        businessId: business.id,
        brandColor: brandColor || "#2563eb",
        allowStaffInvites: true,
        emailNotifications: true,
      },
    });

    // 8. Send invitation email
    try {
      await sendInvitationEmail(ownerEmail, ownerName, name, token);
      console.log(`✅ Invitation email sent to ${ownerEmail}`);
    } catch (emailError) {
      console.error("❌ Failed to send invitation email:", emailError);
    }

    return NextResponse.json({
      id: business.id,
      name: business.name,
      slug: business.slug, // Include slug in response
      clientId: client.id,
      ownerId: owner.id,
      invitationId: invitation.id,
      message: "Business created successfully. Invitation email sent to owner.",
    });
  } catch (error) {
    console.error("Error creating business:", error);
    return NextResponse.json(
      { error: "Failed to create business: " + (error as Error).message },
      { status: 500 }
    );
  }
}