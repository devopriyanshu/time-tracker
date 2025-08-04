import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req) {
  const user = await getSessionUser();
  if (user?.role !== "ADMIN" && user?.role !== "USER")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("id") || user.id;

  const projects = await prisma.project.findMany({
    where: {
      users: {
        some: { id: userId },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json(projects);
}
