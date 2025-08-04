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

  try {
    // Validate users exist
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });

    if (users.length !== userIds.length) {
      const foundIds = users.map((u) => u.id);
      const notFoundIds = userIds.filter((id) => !foundIds.includes(id));
      return NextResponse.json(
        {
          error: `Users not found: ${notFoundIds.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Assign users to the project
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        users: {
          set: userIds.map((id) => ({ id })),
        },
      },
      include: {
        users: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Assignment error:", error);
    return NextResponse.json({ error: "Assignment failed" }, { status: 500 });
  }
}
