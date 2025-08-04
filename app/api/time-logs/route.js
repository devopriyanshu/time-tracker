import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, getSessionUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const user = await getSessionUser();
    if (user?.role !== "USER")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const userId = session.user.id;

    const [timeLogs, totalCount] = await Promise.all([
      prisma.timeLog.findMany({
        where: { userId },
        include: {
          project: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.timeLog.count({
        where: { userId },
      }),
    ]);

    return NextResponse.json({
      timeLogs,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching time logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, startTime, endTime, description } = body;

    if (!projectId || !startTime || !endTime || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
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

    const duration = Math.floor((end - start) / (1000 * 60)); // duration in minutes

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

    const timeLog = await prisma.timeLog.create({
      data: {
        userId: session.user.id,
        projectId,
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

    return NextResponse.json(timeLog, { status: 201 });
  } catch (error) {
    console.error("Error creating time log:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
