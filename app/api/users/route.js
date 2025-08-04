// app/api/users/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Adjust path as needed
import { getSessionUser } from "@/lib/auth";

export async function GET(req) {
  const user = await getSessionUser();
  if (user?.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
