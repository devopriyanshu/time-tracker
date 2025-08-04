"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-3xl font-bold">Time Tracker Pro</h1>
      <p className="text-center max-w-xl">
        Track your work time efficiently. Admins can manage projects, users log
        time manually or with a live timer.
      </p>
      <div className="flex gap-4">
        <button onClick={() => router.push("/login")} className="btn">
          Login
        </button>
        <button
          onClick={() => router.push("/signup?role=USER")}
          className="btn"
        >
          Signup as User
        </button>
        <button
          onClick={() => router.push("/signup?role=ADMIN")}
          className="btn"
        >
          Signup as Admin
        </button>
      </div>
    </div>
  );
}
