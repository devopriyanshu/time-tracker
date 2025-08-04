"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Play,
  Square,
  RotateCcw,
  Clock,
  Briefcase,
  FileText,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

export default function Timer({ userId }) {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [selectedProject, setSelectedProject] = useState("");
  const [description, setDescription] = useState("");
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch user's assigned projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get("/api/projects/user");
        setProjects(response.data);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }
    };

    fetchProjects();
  }, []);

  // Timer logic
  useEffect(() => {
    let interval = null;

    if (isRunning) {
      interval = setInterval(() => {
        setTime((time) => time + 1);
      }, 1000);
    } else if (!isRunning && time !== 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isRunning, time]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    if (!selectedProject) {
      alert("Please select a project before starting the timer");
      return;
    }

    setIsRunning(true);
    setStartTime(new Date());
    setSuccess(false);
  };

  const handleStop = async () => {
    if (!selectedProject || !startTime) return;

    setIsLoading(true);
    const endTime = new Date();

    try {
      const response = await axios.post("/api/time-logs", {
        userId,
        projectId: selectedProject,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        description: description || "Timer session",
      });

      // Reset timer on success
      setIsRunning(false);
      setTime(0);
      setStartTime(null);
      setDescription("");
      setSuccess(true);

      // Refresh after showing success
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error saving time log:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to save time log";
      alert(`Failed to save time log: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setStartTime(null);
    setDescription("");
    setSuccess(false);
  };

  if (success) {
    return (
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Time Logged!
          </h3>
          <p className="text-gray-600 mb-4">
            Your time has been successfully saved.
          </p>
          <div className="animate-pulse text-sm text-gray-500">
            Refreshing page...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Clock className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Time Tracker</h2>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-8">
        <div
          className={`text-6xl font-mono font-bold mb-4 transition-colors duration-300 ${
            isRunning ? "text-green-600" : "text-blue-600"
          }`}
        >
          {formatTime(time)}
        </div>

        {isRunning && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Timer started at {startTime?.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Project Selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          <Briefcase className="inline w-4 h-4 mr-1" />
          Select Project *
        </label>
        <div className="relative">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="text-gray-900 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none appearance-none bg-white hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isRunning}
          >
            <option value="">Choose a project...</option>
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

      {/* Description */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          <FileText className="inline w-4 h-4 mr-1" />
          Description (optional)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What are you working on?"
          className="text-gray-900 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isRunning}
        />
      </div>

      {/* Timer Controls */}
      <div className="flex gap-3">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            <Play className="w-5 h-5" />
            Start Timer
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Square className="w-5 h-5" />
            )}
            {isLoading ? "Saving..." : "Stop & Save"}
          </button>
        )}

        <button
          onClick={handleReset}
          className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Status Indicator */}
      {isRunning && (
        <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium text-green-800">
              Timer is running...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
