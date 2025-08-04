// app/dashboard/user/page.js
"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import LogForm from "@/components/LogForm";
import Timer from "@/components/Timer";
import TimeLogsList from "@/components/TimeLogsList";
import { useEffect } from "react";

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const user = session?.user;

  if (user?.role !== "USER") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600 text-lg">
          Access denied. Admin users should use the admin dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome {user.name || "to User Dashboard"}
            </h1>
            <p className="text-gray-600">
              Track your time and manage your work logs
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Signout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Live Timer
            </h2>
            <Timer userId={user.id} />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Manual Time Entry
            </h2>
            <LogForm userId={user.id} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Your Time Logs
            </h2>
          </div>
          <TimeLogsList userId={user.id} />
        </div>
      </div>
    </div>
  );
}
