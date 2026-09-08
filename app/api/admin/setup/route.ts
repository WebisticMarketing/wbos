// app/api/admin/setup/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";

export async function POST() {
  try {
    console.log("🔍 Checking if admin exists...");

    const existingAdmin = await prisma.admin.findUnique({
      where: { email: "admin@webistic.co" },
    });

    if (existingAdmin) {
      console.log("✅ Admin already exists");
      return NextResponse.json(
        { message: "Admin already exists" },
        { status: 200 }
      );
    }

    console.log("🔐 Creating admin user...");
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = await prisma.admin.create({
      data: {
        email: "admin@webistic.co",
        password: hashedPassword,
        name: "Admin",
      },
    });

    console.log("✅ Admin created:", admin.email);

    return NextResponse.json({
      message: "Admin created successfully",
      email: admin.email,
    });
  } catch (error: any) {
    console.error("❌ Setup error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create admin" },
      { status: 500 }
    );
  }
}