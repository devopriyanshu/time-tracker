export default function DashboardPage() {
  return <h1>Welcome to user Dashboard!</h1>;
}

// import { getSessionUser } from "@/lib/auth";
// import LogForm from "@/components/LogForm";
// import Timer from "@/components/Timer";

// export default async function UserDashboard() {
//   const user = await getSessionUser();

//   if (user?.role !== "USER") return <p>Access denied</p>;

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-4">User Dashboard</h2>
//       <Timer userId={user.id} />
//       <LogForm userId={user.id} />
//     </div>
//   );
// }
