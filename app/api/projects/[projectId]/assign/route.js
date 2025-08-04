// app/api/projects/[projectId]/assign/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function PATCH(req, { params }) {
  const user = await getSessionUser();
  if (user?.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userIds } = await req.json(); // array of user IDs
  const { projectId } = params;

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      users: {
        set: userIds.map((id) => ({ id })),
      },
    },
    include: { users: true },
  });

  return NextResponse.json(updatedProject);
}
