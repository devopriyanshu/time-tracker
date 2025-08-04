"use client";

import { useState, useEffect } from "react";

export default function Timer({ userId }) {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [selectedProject, setSelectedProject] = useState("");
  const [description, setDescription] = useState("");
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user's assigned projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects/user");
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        }
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
  };

  const handleStop = async () => {
    if (!selectedProject || !startTime) return;

    setIsLoading(true);
    const endTime = new Date();

    try {
      const response = await fetch("/api/timelogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          projectId: selectedProject,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          description: description || "Timer session",
        }),
      });

      if (response.ok) {
        // Reset timer
        setIsRunning(false);
        setTime(0);
        setStartTime(null);
        setDescription("");
        alert("Time log saved successfully!");
        // Refresh the page to update the logs list
        window.location.reload();
      } else {
        throw new Error("Failed to save time log");
      }
    } catch (error) {
      console.error("Error saving time log:", error);
      alert("Failed to save time log. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setStartTime(null);
    setDescription("");
  };

  return (
    <div className="space-y-4">
      {/* Timer Display */}
      <div className="text-center">
        <div className="text-4xl font-mono font-bold text-blue-600 mb-4">
          {formatTime(time)}
        </div>
      </div>

      {/* Project Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Project *
        </label>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isRunning}
        >
          <option value="">Choose a project...</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description (optional)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What are you working on?"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isRunning}
        />
      </div>

      {/* Timer Controls */}
      <div className="flex gap-2">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            disabled={isLoading}
          >
            Start Timer
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Stop & Save"}
          </button>
        )}

        <button
          onClick={handleReset}
          className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          disabled={isLoading}
        >
          Reset
        </button>
      </div>

      {isRunning && (
        <div className="text-center text-sm text-gray-600">
          Timer started at {startTime?.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
