import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (user?.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const logs = await prisma.timeLog.findMany({
    where: { userId: user.id },
    include: {
      project: true,
    },
    orderBy: {
      startTime: "desc",
    },
  });

  return NextResponse.json(logs);
}
