// app/api/wbos/sadaat/audit-logs/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getBusinessId } from "@/app/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const businessId = await getBusinessId(req);
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get("action") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const search = searchParams.get("search") || "";
    const limit = parseInt(searchParams.get("limit") || "1000");

    const where: any = {
      businessId: businessId, // ✅ Business isolation
    };

    if (action) where.action = action;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate + "T23:59:59.999Z");
    }

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { action: { contains: search, mode: "insensitive" } },
      ];
    }

    const logs = await prisma.wbosAuditLog.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Build CSV
    const headers = ["Date", "User", "Email", "Action", "Details", "IP Address"];
    const rows = logs.map((log) => [
      log.createdAt.toISOString(),
      log.user?.name || "System",
      log.user?.email || "",
      log.action,
      JSON.stringify(log.details || {}),
      log.ipAddress || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=audit-logs-${new Date().toISOString().split("T")[0]}.csv`,
      },
    });
  } catch (error) {
    console.error("Error exporting logs:", error);
    return NextResponse.json(
      { error: "Failed to export logs" },
      { status: 500 }
    );
  }
}