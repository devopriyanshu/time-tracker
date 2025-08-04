import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (user?.role !== "USER")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: {
      users: {
        some: { id: user.id },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json(projects);
}
