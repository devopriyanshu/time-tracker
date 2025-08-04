// app/api/projects/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(req) {
  const user = await getSessionUser();
  if (user?.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();

  const project = await prisma.project.create({ data: { name } });
  return NextResponse.json(project);
}
