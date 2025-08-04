"use client";

import { useState, useEffect } from "react";
import {
  Filter,
  Calendar,
  Clock,
  FileText,
  TrendingUp,
  Activity,
  Package,
  RefreshCw,
  X,
} from "lucide-react";

export default function TimeLogsList({ userId }) {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    projectId: "",
    startDate: "",
    endDate: "",
  });

  // Fetch time logs and projects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsResponse, projectsResponse] = await Promise.all([
          fetch(`/api/time-logs/user?id=${userId}`),
          fetch(`/api/projects/user?id=${userId}`),
        ]);

        if (logsResponse.ok) {
          const logsData = await logsResponse.json();
          setLogs(logsData.timeLogs || logsData); // Support both formats
          setFilteredLogs(logsData.timeLogs || logsData);
        }

        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          setProjects(projectsData);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  // Apply filters
  useEffect(() => {
    let filtered = [...logs];

    // Filter by project
    if (filters.projectId) {
      filtered = filtered.filter((log) => log.projectId === filters.projectId);
    }

    // Filter by date range
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter((log) => new Date(log.startTime) >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // Include the entire end date
      filtered = filtered.filter((log) => new Date(log.endTime) <= endDate);
    }

    setFilteredLogs(filtered);
  }, [logs, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getTotalHours = () => {
    const totalMinutes = filteredLogs.reduce(
      (total, log) => total + log.duration,
      0
    );
    return (totalMinutes / 60).toFixed(1);
  };

  const clearFilters = () => {
    setFilters({
      projectId: "",
      startDate: "",
      endDate: "",
    });
  };

  const hasActiveFilters =
    filters.projectId || filters.startDate || filters.endDate;

  if (isLoading) {
    return (
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">
              Loading your time logs...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Activity className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Time Logs History</h2>
      </div>

      {/* Filters Section */}
      <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Filter Your Logs
          </h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Package className="inline w-4 h-4 mr-1" />
              Project
            </label>
            <div className="relative">
              <select
                name="projectId"
                value={filters.projectId}
                onChange={handleFilterChange}
                className="text-gray-900 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none appearance-none bg-white hover:border-gray-300"
              >
                <option value="">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="text-gray-900 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="text-gray-900 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-300"
            />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 font-semibold mb-1">Total Logs</p>
              <p className="text-3xl font-bold text-blue-900">
                {filteredLogs.length}
              </p>
            </div>
            <div className="bg-blue-600 p-3 rounded-xl">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 font-semibold mb-1">Total Hours</p>
              <p className="text-3xl font-bold text-green-900">
                {getTotalHours()}h
              </p>
            </div>
            <div className="bg-green-600 p-3 rounded-xl">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 font-semibold mb-1">Avg Session</p>
              <p className="text-3xl font-bold text-purple-900">
                {filteredLogs.length > 0
                  ? `${Math.round(
                      filteredLogs.reduce((acc, log) => acc + log.duration, 0) /
                        filteredLogs.length
                    )}m`
                  : "0m"}
              </p>
            </div>
            <div className="bg-purple-600 p-3 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {logs.length === 0
              ? "No time logs yet"
              : "No logs match your filters"}
          </h3>
          <p className="text-gray-500 mb-4">
            {logs.length === 0
              ? "Start tracking your time to see logs here"
              : "Try adjusting your filters or clearing them"}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                <th className="text-left py-4 px-6 font-semibold text-gray-900 rounded-tl-xl">
                  Project
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">
                  Start Time
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">
                  End Time
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">
                  Duration
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">
                  Description
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 rounded-tr-xl">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => (
                <tr
                  key={log.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  }`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <Package className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {log.project?.name || "Unknown Project"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-900 font-medium">
                      {formatDateTime(log.startTime)}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-900 font-medium">
                      {formatDateTime(log.endTime)}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDuration(log.duration)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {log.description}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-500">
                      {formatDateTime(log.createdAt)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Show filtered results indicator */}
      {hasActiveFilters && filteredLogs.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Showing {filteredLogs.length} of {logs.length} total logs
              </span>
            </div>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              View All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
