// app/api/admin/clients/[id]/onboarding/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyAuth } from "@/app/lib/admin";

// GET - Get client onboarding status
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

    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // Get onboarding with steps
    let onboarding = await prisma.clientOnboarding.findUnique({
      where: { clientId: id },
      include: {
        template: {
          include: {
            steps: {
              orderBy: { stepNumber: "asc" },
            },
          },
        },
        steps: {
          include: {
            step: true,
          },
          orderBy: {
            step: {
              stepNumber: "asc",
            },
          },
        },
      },
    });

    // If no onboarding exists, create one
    if (!onboarding) {
      const serviceType = client.service || "website";
      const template = await prisma.onboardingTemplate.findFirst({
        where: {
          serviceType: serviceType,
          isActive: true,
        },
        include: {
          steps: {
            orderBy: { stepNumber: "asc" },
          },
        },
      });

      if (!template) {
        return NextResponse.json({
          onboarding: null,
          message: "No onboarding template found for this service type",
        });
      }

      onboarding = await prisma.clientOnboarding.create({
        data: {
          clientId: id,
          templateId: template.id,
          status: "in-progress",
          steps: {
            create: template.steps.map((step: { id: string }) => ({
              stepId: step.id,
              status: "pending",
            })),
          },
        },
        include: {
          template: {
            include: {
              steps: {
                orderBy: { stepNumber: "asc" },
              },
            },
          },
          steps: {
            include: {
              step: true,
            },
            orderBy: {
              step: {
                stepNumber: "asc",
              },
            },
          },
        },
      });
    }

    // Calculate progress
    const totalSteps = onboarding.steps.length;
    const completedSteps = onboarding.steps.filter(
      (s: { status: string }) => s.status === "completed"
    ).length;
    const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    return NextResponse.json({
      onboarding,
      progress,
      totalSteps,
      completedSteps,
    });
  } catch (error) {
    console.error("Onboarding fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch onboarding" },
      { status: 500 }
    );
  }
}

// PATCH - Update onboarding step status
export async function PATCH(
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
    const { stepId, status, notes } = body;

    if (!stepId) {
      return NextResponse.json(
        { error: "Step ID is required" },
        { status: 400 }
      );
    }

    const onboarding = await prisma.clientOnboarding.findUnique({
      where: { clientId: id },
    });

    if (!onboarding) {
      return NextResponse.json(
        { error: "Onboarding not found" },
        { status: 404 }
      );
    }

    const updatedStep = await prisma.clientOnboardingStep.update({
      where: {
        onboardingId_stepId: {
          onboardingId: onboarding.id,
          stepId: stepId,
        },
      },
      data: {
        status: status || "completed",
        completedAt: status === "completed" ? new Date() : null,
        notes: notes || null,
      },
    });

    const allSteps = await prisma.clientOnboardingStep.findMany({
      where: { onboardingId: onboarding.id },
    });

    const allCompleted = allSteps.every(
      (s: { status: string }) => s.status === "completed" || s.status === "skipped"
    );

    if (allCompleted) {
      await prisma.clientOnboarding.update({
        where: { id: onboarding.id },
        data: {
          status: "completed",
          completedAt: new Date(),
        },
      });
    } else if (onboarding.status === "not-started") {
      await prisma.clientOnboarding.update({
        where: { id: onboarding.id },
        data: {
          status: "in-progress",
        },
      });
    }

    return NextResponse.json({
      success: true,
      step: updatedStep,
    });
  } catch (error) {
    console.error("Onboarding update error:", error);
    return NextResponse.json(
      { error: "Failed to update onboarding step" },
      { status: 500 }
    );
  }
}