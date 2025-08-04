import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req) {
  const user = await getSessionUser();
  if (user?.role !== "ADMIN" && user?.role !== "USER")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("id") || user.id;

  const logs = await prisma.timeLog.findMany({
    where: { userId },
    include: {
      project: true,
    },
    orderBy: {
      startTime: "desc",
    },
  });

  return NextResponse.json(logs);
}
