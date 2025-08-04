import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(request, { params }) {
  try {
    const user = await getSessionUser();

    // Only allow ADMIN users
    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { userId } = await request.json();

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Remove user from project
    await prisma.project.update({
      where: { id },
      data: {
        users: {
          disconnect: { id: userId },
        },
      },
    });

    return NextResponse.json(
      { message: "User unassigned successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error unassigning user:", error);
    return NextResponse.json(
      { error: "Failed to unassign user" },
      { status: 500 }
    );
  }
}
