import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, getSessionUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (user?.role !== "USER")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayTime, weekTime, monthTime, totalTime, projectStats] =
      await Promise.all([
        // Today's time
        prisma.timeLog.aggregate({
          where: {
            userId,
            startTime: { gte: startOfDay },
          },
          _sum: { duration: true },
        }),
        // This week's time
        prisma.timeLog.aggregate({
          where: {
            userId,
            startTime: { gte: startOfWeek },
          },
          _sum: { duration: true },
        }),
        // This month's time
        prisma.timeLog.aggregate({
          where: {
            userId,
            startTime: { gte: startOfMonth },
          },
          _sum: { duration: true },
        }),
        // Total time
        prisma.timeLog.aggregate({
          where: { userId },
          _sum: { duration: true },
        }),
        // Time by project
        prisma.timeLog.groupBy({
          by: ["projectId"],
          where: { userId },
          _sum: { duration: true },
          orderBy: { _sum: { duration: "desc" } },
        }),
      ]);

    // Get project names
    const projectIds = projectStats.map((stat) => stat.projectId);
    const projects = await prisma.project.findMany({
      where: { id: { in: projectIds } },
      select: { id: true, name: true },
    });

    const projectMap = projects.reduce((acc, project) => {
      acc[project.id] = project.name;
      return acc;
    }, {});

    const projectStatsWithNames = projectStats.map((stat) => ({
      projectId: stat.projectId,
      projectName: projectMap[stat.projectId],
      totalMinutes: stat._sum.duration || 0,
    }));

    return NextResponse.json({
      todayMinutes: todayTime._sum.duration || 0,
      weekMinutes: weekTime._sum.duration || 0,
      monthMinutes: monthTime._sum.duration || 0,
      totalMinutes: totalTime._sum.duration || 0,
      projectStats: projectStatsWithNames,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
