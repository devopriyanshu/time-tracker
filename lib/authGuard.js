import { authOptions } from "./auth";
import { getServerSession } from "next-auth";

export async function requireAuth(role) {
  const session = await getServerSession(authOptions);
  if (!session || (role && session.user.role !== role)) {
    throw new Error("Unauthorized");
  }
  return session;
}
