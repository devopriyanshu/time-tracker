import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, getSessionUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const user = await getSessionUser();
    if (user?.role !== "USER")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Find active timer
    const activeTimer = await prisma.timeLog.findFirst({
      where: {
        userId: session.user.id,
        endTime: null,
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
    });

    if (!activeTimer) {
      return NextResponse.json(
        { error: "No active timer found" },
        { status: 404 }
      );
    }

    const endTime = new Date();
    const duration = Math.floor(
      (endTime - activeTimer.startTime) / (1000 * 60)
    );

    const stoppedTimer = await prisma.timeLog.update({
      where: { id: activeTimer.id },
      data: {
        endTime,
        duration,
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(stoppedTimer);
  } catch (error) {
    console.error("Error stopping timer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
