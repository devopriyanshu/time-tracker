"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  Clock,
  Package,
  RefreshCw,
  Filter,
  Plus,
  Download,
  LogOut,
  BarChart3,
  UserPlus,
  Calendar,
  TrendingUp,
  Activity,
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { signOut, useSession } from "next-auth/react";
import { getSessionUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userProjects, setUserProjects] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState({
    projects: false,
    users: false,
    logs: false,
  });

  const [newProjectName, setNewProjectName] = useState("");
  const [assignData, setAssignData] = useState({
    projectId: "",
    selectedUserIds: [], // array of selected user IDs
  });

  const [selectedUser, setSelectedUser] = useState("");
  const [selectedProject, setSelectedProject] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchInitialData();
    }
  }, [status]);

  const fetchInitialData = async () => {
    try {
      setLoading((prev) => ({
        ...prev,
        projects: true,
        users: true,
        userProjects: true,
        logs: true,
      }));

      const [projRes, userRes, userProjectsRes, logsRes] = await Promise.all([
        axios.get("/api/projects"),
        axios.get("/api/users"),
        axios.get("/api/projects/user-projects"),
        axios.get("/api/time-logs/summary"),
      ]);

      setProjects(projRes.data);
      setUsers(userRes.data.filter((user) => user.role !== "ADMIN"));
      setUserProjects(userProjectsRes.data);
      setLogs(logsRes.data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error(error.response?.data?.error || "Failed to fetch data");
    } finally {
      setLoading((prev) => ({
        ...prev,
        projects: false,
        users: false,
        userProjects: false,
        logs: false,
      }));
    }
  };

  const user = session?.user;

  //   if (user?.role !== "ADMIN") {
  //     return (
  //       <div className="flex items-center justify-center min-h-screen">
  //         <p className="text-red-600 text-lg">
  //           Access denied. Admin users should use the admin dashboard.
  //         </p>
  //       </div>
  //     );
  //   }

  const createProject = async () => {
    if (!newProjectName.trim()) return toast.error("Enter project name");
    try {
      setLoading((prev) => ({ ...prev, projects: true }));
      const res = await axios.post("/api/projects/create", {
        name: newProjectName,
      });
      setProjects((prev) => [...prev, res.data]);
      setNewProjectName("");
      toast.success("Project created successfully!");
    } catch {
      toast.error("Project creation failed");
    } finally {
      setLoading((prev) => ({ ...prev, projects: false }));
    }
  };

  const assignUsers = async () => {
    if (!assignData.projectId || assignData.selectedUserIds.length === 0)
      return toast.error("Please select project and at least one user");

    try {
      // Get user names from selected IDs
      const selectedUsers = users.filter((user) =>
        assignData.selectedUserIds.includes(user.id)
      );
      const userNames = selectedUsers.map((user) => user.name);

      const response = await await axios.patch(
        `/api/projects/${assignData.projectId}/assign`,
        {
          userIds: assignData.selectedUserIds,
        }
      );

      toast.success(
        `Successfully assigned ${selectedUsers.length} user(s) to project!`
      );
      setAssignData({ projectId: "", selectedUserIds: [] });

      // Optionally refresh projects list to show updated assignments
      // fetchInitialData();
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Assignment failed";
      toast.error(errorMessage);
    }
  };

  const handleUserSelection = (userId) => {
    setAssignData((prev) => ({
      ...prev,
      selectedUserIds: prev.selectedUserIds.includes(userId)
        ? prev.selectedUserIds.filter((id) => id !== userId)
        : [...prev.selectedUserIds, userId],
    }));
  };

  const selectAllUsers = () => {
    setAssignData((prev) => ({
      ...prev,
      selectedUserIds:
        prev.selectedUserIds.length === users.length
          ? []
          : users.map((user) => user.id),
    }));
  };

  const fetchLogs = async () => {
    try {
      setLoading((prev) => ({ ...prev, logs: true }));
      const params = new URLSearchParams();
      if (selectedUser) params.append("userId", selectedUser);
      if (selectedProject) params.append("projectId", selectedProject);

      const res = await axios.get(
        `/api/time-logs/summary?${params.toString()}`
      );
      setLogs(res.data);
      toast.success("Logs filtered successfully!");
    } catch {
      toast.error("Failed to fetch logs");
    } finally {
      setLoading((prev) => ({ ...prev, logs: false }));
    }
  };

  const exportToCSV = () => {
    if (logs.length === 0) {
      toast.error("No data to export");
      return;
    }

    const csvHeader = "User,Project,Duration (Hours),Duration (Minutes),Date\n";
    const csvContent = logs
      .map((log) => {
        const hours = Math.floor(log.duration / 60);
        const minutes = log.duration % 60;
        const user = log.user?.name || "N/A";
        const project = log.project?.name || "N/A";
        const date = log.createdAt
          ? new Date(log.createdAt).toLocaleDateString()
          : "N/A";

        return `"${user}","${project}","${hours}h ${minutes}m","${log.duration}","${date}"`;
      })
      .join("\n");

    const csv = csvHeader + csvContent;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `time-logs-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV exported successfully!");
    }
  };

  const formatDuration = (min) => `${Math.floor(min / 60)}h ${min % 60}m`;

  const getStats = () => {
    const totalHours = logs.reduce(
      (sum, log) => sum + Math.floor(log.duration / 60),
      0
    );
    const uniqueUsers = new Set(logs.map((log) => log.user?.id)).size;
    const uniqueProjects = new Set(logs.map((log) => log.project?.id)).size;

    return { totalHours, uniqueUsers, uniqueProjects };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Manage projects, users, and track time logs
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-6 rounded-2xl border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 font-medium mb-1">Total Projects</p>
                <p className="text-3xl font-bold text-gray-900">
                  {projects.length}
                </p>
              </div>
              <div className="bg-blue-600 p-3 rounded-xl">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-100 to-blue-100 p-6 rounded-2xl border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 font-medium mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">
                  {users.length}
                </p>
              </div>
              <div className="bg-blue-600 p-3 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-100 to-blue-100 p-6 rounded-2xl border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 font-medium mb-1">
                  Total Hours Logged
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalHours}h
                </p>
              </div>
              <div className="bg-blue-600 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Create Project */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Create Project
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name"
                  className="text-gray-900 w-full px-4 py-3 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                />
              </div>

              <button
                onClick={createProject}
                disabled={loading.projects}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading.projects ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Create Project
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Assign Users */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-lg">
                <UserPlus className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Assign Users</h2>
            </div>

            <div className="space-y-6">
              {/* Project Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Project
                </label>
                <select
                  value={assignData.projectId}
                  onChange={(e) =>
                    setAssignData({ ...assignData, projectId: e.target.value })
                  }
                  className="text-gray-900 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                >
                  <option value="">Choose a project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* User Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Users ({assignData.selectedUserIds.length} selected)
                  </label>
                  <button
                    type="button"
                    onClick={selectAllUsers}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {assignData.selectedUserIds.length === users.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>

                <div className="border border-gray-200 rounded-xl max-h-60 overflow-y-auto">
                  {loading.users ? (
                    <div className="p-4 text-center text-gray-500">
                      Loading users...
                    </div>
                  ) : users.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No users available
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {users.map((user) => (
                        <label
                          key={user.id}
                          className="flex items-center p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                        >
                          <input
                            type="checkbox"
                            checked={assignData.selectedUserIds.includes(
                              user.id
                            )}
                            onChange={() => handleUserSelection(user.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <div className="ml-3 flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                          {user.role && (
                            <span className="ml-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                              {user.role}
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Users Preview */}
              {assignData.selectedUserIds.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Selected Users:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {assignData.selectedUserIds.map((userId) => {
                      const user = users.find((u) => u.id === userId);
                      return user ? (
                        <span
                          key={userId}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                        >
                          {user.name}
                          <button
                            onClick={() => handleUserSelection(userId)}
                            className="ml-2 hover:text-blue-600"
                          >
                            ×
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              <button
                onClick={assignUsers}
                disabled={
                  !assignData.projectId ||
                  assignData.selectedUserIds.length === 0
                }
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <UserPlus className="w-5 h-5" />
                Assign {assignData.selectedUserIds.length} User(s)
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              User Project Assignments
            </h2>
          </div>

          {loading.userProjects ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin text-blue-500" />
              <p className="mt-2 text-gray-600">Loading assignments...</p>
            </div>
          ) : userProjects.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-8 h-8 mx-auto text-gray-400" />
              <p className="mt-2 text-gray-600">No user assignments found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {userProjects.map((user) => (
                <div
                  key={user.id}
                  className="border-b border-gray-100 pb-6 last:border-0"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {user.name || "Unknown User"}
                      </h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>

                  {user.projects.length > 0 ? (
                    <div className="ml-13 space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">
                        Assigned Projects:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {user.projects.map((project) => (
                          <span
                            key={project.id}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                          >
                            {project.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="ml-13 text-gray-500">No projects assigned</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Time Logs Section */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Time Logs Analysis
            </h2>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by User
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className=" text-gray-900 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
              >
                <option value="">All Users</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Project
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="text-gray-900 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
              >
                <option value="">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchLogs}
                disabled={loading.logs}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading.logs ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Filter className="w-5 h-5" />
                    Apply Filters
                  </>
                )}
              </button>
            </div>

            <div className="flex items-end">
              <button
                onClick={exportToCSV}
                disabled={logs.length === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Filtered Stats */}
          {logs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    Filtered Results
                  </span>
                </div>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {logs.length} logs
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">
                    Active Users
                  </span>
                </div>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {stats.uniqueUsers}
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-100">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-900">
                    Total Hours
                  </span>
                </div>
                <p className="text-2xl font-bold text-purple-900 mt-1">
                  {stats.totalHours}h
                </p>
              </div>
            </div>
          )}

          {/* Results Table */}
          {logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">
                      User
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">
                      Project
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">
                      Duration
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => (
                    <tr
                      key={log.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {(log.user?.name || "N/A")
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {log.user?.name || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
                          {log.project?.name || "N/A"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-purple-600">
                          {formatDuration(log.duration)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {log.createdAt
                          ? new Date(log.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No logs found
              </h3>
              <p className="text-gray-500">
                Apply filters and click Apply Filters to view time logs
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
