// app/api/wbos/sadaat/buses/[busId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getBusinessId, getAuthPayload } from "@/app/lib/auth-helpers";
import { createAuditLog } from "@/app/lib/audit";

// ============================================================
// 📥 GET – Fetch bus with all related data
// ============================================================
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ busId: string }> }
) {
  try {
    const businessId = await getBusinessId(req);
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { busId } = await params;

    const [bus, vouchers, maintenance, tyres, fuelRecords] = await Promise.all([
      prisma.bus.findFirst({
        where: { id: busId, businessId },
      }),
      prisma.busVoucher.findMany({
        where: { busId, businessId },
        orderBy: { voucherDate: "desc" },
      }),
      prisma.busMaintenance.findMany({
        where: { busId, businessId },
        orderBy: { maintenanceDate: "desc" },
      }),
      prisma.busTyre.findMany({
        where: { busId, businessId },
        orderBy: { tyreDate: "desc" },
      }),
      prisma.busFuelRecord.findMany({
        where: { busId, businessId },
        orderBy: { date: "desc" },
      }),
    ]);

    if (!bus) {
      return NextResponse.json({ error: "Bus not found" }, { status: 404 });
    }

    const totalRevenue = vouchers.reduce((sum, v) => sum + Number(v.totalRevenue || 0), 0);
    const totalExpenses = vouchers.reduce((sum, v) => sum + Number(v.totalExpenses || 0), 0);
    const totalProfit = totalRevenue - totalExpenses;
    const totalMaintenance = maintenance.reduce((sum, m) => sum + Number(m.cost || 0), 0);
    const totalTyres = tyres.reduce((sum, t) => sum + Number(t.cost || 0), 0);
    const netProfit = totalProfit - totalMaintenance - totalTyres;
    const totalFuelLiters = fuelRecords.reduce((sum, f) => sum + Number(f.liters || 0), 0);
    const totalFuelCost = fuelRecords.reduce((sum, f) => sum + Number(f.totalAmount || 0), 0);

    return NextResponse.json({
      id: bus.id,
      busNumber: bus.busNumber,
      numberPlate: bus.numberPlate,
      name: bus.name,
      capacity: bus.capacity,
      status: bus.status,
      createdAt: bus.createdAt,
      purchaseDate: bus.purchaseDate,
      notes: bus.notes,
      vouchers,
      maintenance,
      tyres,
      fuelRecords,
      totals: {
        totalRevenue,
        totalExpenses,
        totalProfit,
        totalMaintenance,
        totalTyres,
        netProfit,
        tripCount: vouchers.length,
        maintenanceCount: maintenance.length,
        tyreCount: tyres.length,
        fuelCount: fuelRecords.length,
        totalFuelLiters,
        totalFuelCost,
      },
    });
  } catch (error) {
    console.error("Error fetching bus:", error);
    return NextResponse.json(
      { error: "Failed to fetch bus" },
      { status: 500 }
    );
  }
}

// ============================================================
// 📝 PUT – Update a bus
// ============================================================
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ busId: string }> }
) {
  try {
    const businessId = await getBusinessId(req);
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const auth = getAuthPayload(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { busId } = await params;
    const body = await req.json();

    // Get old data for audit log
    const oldBus = await prisma.bus.findFirst({
      where: { id: busId, businessId },
    });

    if (!oldBus) {
      return NextResponse.json(
        { error: "Bus not found" },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (body.numberPlate !== undefined) updateData.numberPlate = body.numberPlate.trim();
    if (body.name !== undefined) updateData.name = body.name?.trim() || null;
    if (body.capacity !== undefined) updateData.capacity = Number(body.capacity);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes?.trim() || null;
    if (body.purchaseDate !== undefined) {
      updateData.purchaseDate = body.purchaseDate ? new Date(body.purchaseDate) : null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const updatedBus = await prisma.bus.update({
      where: { id: busId },
      data: updateData,
    });

    // ✅ Audit Log
    await createAuditLog({
      businessId,
      userId: auth.userId,
      action: "update_bus",
      details: {
        busId: updatedBus.id,
        busNumber: updatedBus.busNumber,
        changes: {
          old: {
            numberPlate: oldBus.numberPlate,
            name: oldBus.name,
            capacity: oldBus.capacity,
            status: oldBus.status,
          },
          new: {
            numberPlate: updatedBus.numberPlate,
            name: updatedBus.name,
            capacity: updatedBus.capacity,
            status: updatedBus.status,
          },
        },
      },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(updatedBus);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Bus not found or unauthorized" },
        { status: 404 }
      );
    }
    console.error("Error updating bus:", error);
    return NextResponse.json(
      { error: "Failed to update bus" },
      { status: 500 }
    );
  }
}

// ============================================================
// 🗑️ DELETE – Delete a bus and all related records
// ============================================================
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ busId: string }> }
) {
  try {
    const businessId = await getBusinessId(req);
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const auth = getAuthPayload(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { busId } = await params;

    // Get bus data before deletion for audit log
    const bus = await prisma.bus.findFirst({
      where: { id: busId, businessId },
    });

    if (!bus) {
      return NextResponse.json(
        { error: "Bus not found" },
        { status: 404 }
      );
    }

    // Delete in transaction
    await prisma.$transaction([
      prisma.busVoucher.deleteMany({ where: { busId, businessId } }),
      prisma.busMaintenance.deleteMany({ where: { busId, businessId } }),
      prisma.busTyre.deleteMany({ where: { busId, businessId } }),
      prisma.busFuelRecord.deleteMany({ where: { busId, businessId } }),
      prisma.bus.delete({ where: { id: busId } }),
    ]);

    // ✅ Audit Log
    await createAuditLog({
      businessId,
      userId: auth.userId,
      action: "delete_bus",
      details: {
        busId: bus.id,
        busNumber: bus.busNumber,
        numberPlate: bus.numberPlate,
      },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Bus not found or unauthorized" },
        { status: 404 }
      );
    }
    console.error("Error deleting bus:", error);
    return NextResponse.json(
      { error: "Failed to delete bus" },
      { status: 500 }
    );
  }
}