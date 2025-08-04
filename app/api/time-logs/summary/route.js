// app/api/timelogs/summary/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req) {
  const user = await getSessionUser();
  if (user?.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const projectId = searchParams.get("projectId");

  const where = {};
  if (userId) where.userId = userId;
  if (projectId) where.projectId = projectId;

  const logs = await prisma.timeLog.findMany({
    where,
    include: {
      user: true,
      project: true,
    },
  });

  return NextResponse.json(logs);
}
