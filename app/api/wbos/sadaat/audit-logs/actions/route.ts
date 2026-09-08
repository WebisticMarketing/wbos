// app/api/wbos/sadaat/audit-logs/actions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getBusinessId } from "@/app/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const businessId = await getBusinessId(req);
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await prisma.$queryRaw<{ action: string }[]>`
      SELECT DISTINCT action FROM wbos_audit_logs 
      WHERE "businessId" = ${businessId}
      ORDER BY action ASC
    `;

    const actions = result.map((r) => r.action);
    return NextResponse.json(actions);
  } catch (error) {
    console.error("Error fetching actions:", error);
    return NextResponse.json(
      { error: "Failed to fetch actions" },
      { status: 500 }
    );
  }
}