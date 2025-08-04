import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, getSessionUser } from "@/lib/auth";

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (user?.role !== "USER")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { projectId, description } = body;

    if (!projectId || !description) {
      return NextResponse.json(
        { error: "Project ID and description are required" },
        { status: 400 }
      );
    }

    // Verify user has access to the project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        users: {
          some: { id: session.user.id },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    // Check if user already has an active timer
    const activeTimer = await prisma.timeLog.findFirst({
      where: {
        userId: session.user.id,
        endTime: null, // Active timer has no end time
      },
    });

    if (activeTimer) {
      return NextResponse.json(
        { error: "Timer already running" },
        { status: 400 }
      );
    }

    const timeLog = await prisma.timeLog.create({
      data: {
        userId: session.user.id,
        projectId,
        startTime: new Date(),
        endTime: new Date(), // Temporary end time, will be updated when stopped
        description,
        duration: 0, // Will be calculated when stopped
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
    });

    // Update to set endTime to null for active timer
    const activeTimeLog = await prisma.timeLog.update({
      where: { id: timeLog.id },
      data: { endTime: null },
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(activeTimeLog, { status: 201 });
  } catch (error) {
    console.error("Error starting timer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
