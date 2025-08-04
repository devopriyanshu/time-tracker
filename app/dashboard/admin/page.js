"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  FiUsers,
  FiClock,
  FiPackage,
  FiRefreshCw,
  FiFilter,
} from "react-icons/fi";
import { Toaster, toast } from "react-hot-toast";

export default function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState({
    projects: false,
    users: false,
    logs: false,
  });

  const [newProjectName, setNewProjectName] = useState("");
  const [assignData, setAssignData] = useState({ projectId: "", userIds: "" });
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedProject, setSelectedProject] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading((prev) => ({ ...prev, projects: true, users: true }));
      const [projRes, userRes] = await Promise.all([
        axios.get("/api/projects"),
        axios.get("/api/users"),
      ]);
      setProjects(projRes.data);
      setUsers(userRes.data);
    } catch {
      toast.error("Failed to fetch data");
    } finally {
      setLoading((prev) => ({ ...prev, projects: false, users: false }));
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return toast.error("Enter project name");
    try {
      setLoading((prev) => ({ ...prev, projects: true }));
      const res = await axios.post("/api/projects", { name: newProjectName });
      setProjects((prev) => [...prev, res.data]);
      setNewProjectName("");
      toast.success("Project created");
    } catch {
      toast.error("Project creation failed");
    } finally {
      setLoading((prev) => ({ ...prev, projects: false }));
    }
  };

  const assignUsers = async () => {
    if (!assignData.projectId || !assignData.userIds)
      return toast.error("Missing data");
    try {
      await axios.patch(`/api/projects/${assignData.projectId}/assign`, {
        userIds: assignData.userIds.split(",").map((id) => id.trim()),
      });
      toast.success("Users assigned");
      setAssignData({ projectId: "", userIds: "" });
    } catch {
      toast.error("Assignment failed");
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading((prev) => ({ ...prev, logs: true }));
      const params = new URLSearchParams();
      if (selectedUser) params.append("userId", selectedUser);
      if (selectedProject) params.append("projectId", selectedProject);

      const res = await axios.get(`/api/timelogs/summary?${params.toString()}`);
      setLogs(res.data);
    } catch {
      toast.error("Log fetch failed");
    } finally {
      setLoading((prev) => ({ ...prev, logs: false }));
    }
  };

  const formatDuration = (min) => `${Math.floor(min / 60)}h ${min % 60}m`;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        {/* Top Section: Create & Assign */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Create Project */}
          <div className="bg-white p-6 rounded-xl shadow space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FiPackage className="text-blue-500" /> Create Project
            </h2>
            <input
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="New project name"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <button
              onClick={createProject}
              disabled={loading.projects}
              className="bg-blue-600 text-white px-4 py-2 rounded w-full"
            >
              {loading.projects ? "Creating..." : "Create Project"}
            </button>
          </div>

          {/* Assign Users */}
          <div className="bg-white p-6 rounded-xl shadow space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FiUsers className="text-green-500" /> Assign Users
            </h2>
            <select
              value={assignData.projectId}
              onChange={(e) =>
                setAssignData({ ...assignData, projectId: e.target.value })
              }
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Select project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              value={assignData.userIds}
              onChange={(e) =>
                setAssignData({ ...assignData, userIds: e.target.value })
              }
              placeholder="User IDs (comma separated)"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <button
              onClick={assignUsers}
              className="bg-green-600 text-white px-4 py-2 rounded w-full"
            >
              Assign Users
            </button>
          </div>
        </div>

        {/* Bottom Section: Time Logs */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FiClock className="text-purple-500" /> Time Logs
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">All Users</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchLogs}
            disabled={loading.logs}
            className="bg-purple-600 text-white px-4 py-2 rounded w-full mb-4 flex items-center justify-center gap-2"
          >
            {loading.logs ? (
              <>
                <FiRefreshCw className="animate-spin" /> Loading...
              </>
            ) : (
              <>
                <FiFilter /> Filter Logs
              </>
            )}
          </button>

          {logs.length > 0 ? (
            <table className="w-full table-auto text-left text-sm border-t">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="p-2">User</th>
                  <th className="p-2">Project</th>
                  <th className="p-2">Duration</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t">
                    <td className="p-2">{log.user?.name || "N/A"}</td>
                    <td className="p-2">{log.project?.name || "N/A"}</td>
                    <td className="p-2">{formatDuration(log.duration)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 italic">No logs to show</p>
          )}
        </div>
      </div>
    </div>
  );
}
