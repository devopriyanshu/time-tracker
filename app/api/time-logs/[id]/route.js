import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, getSessionUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(request, { params }) {
  try {
    const user = await getSessionUser();
    if (user?.role !== "USER")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;
    const body = await request.json();
    const { projectId, startTime, endTime, description } = body;

    // Verify the time log belongs to the user
    const existingLog = await prisma.timeLog.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingLog) {
      return NextResponse.json(
        { error: "Time log not found" },
        { status: 404 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    const duration = Math.floor((end - start) / (1000 * 60));

    // Verify user has access to the project if projectId is being changed
    if (projectId && projectId !== existingLog.projectId) {
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
    }

    const updatedLog = await prisma.timeLog.update({
      where: { id },
      data: {
        ...(projectId && { projectId }),
        startTime: start,
        endTime: end,
        description,
        duration,
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(updatedLog);
  } catch (error) {
    console.error("Error updating time log:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Verify the time log belongs to the user
    const existingLog = await prisma.timeLog.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingLog) {
      return NextResponse.json(
        { error: "Time log not found" },
        { status: 404 }
      );
    }

    await prisma.timeLog.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Time log deleted successfully" });
  } catch (error) {
    console.error("Error deleting time log:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
