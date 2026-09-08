// app/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const {
      fullName,
      businessName,
      email,
      whatsapp,
      website,
      industry,
      services,
      goals,
      budget,
      preferredContact,
      source,
    } = body;

    // Validate required fields
    if (!fullName || !businessName || !email || !whatsapp || !industry || !goals || !budget) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create lead in database
    const lead = await prisma.lead.create({
      data: {
        name: fullName,
        business: businessName,
        email: email,
        whatsapp: whatsapp,
        service: services?.join(", ") || null,
        goal: goals,
        source: source || "contact_form",
        status: "new",
        notes: `Industry: ${industry}\nBudget: ${budget}\nPreferred Contact: ${preferredContact}\nWebsite: ${website || "Not provided"}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Lead created successfully",
      leadId: lead.id,
    });

  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to submit form" },
      { status: 500 }
    );
  }
}