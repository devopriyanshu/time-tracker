"use client";

import { useState, useEffect } from "react";

export default function LogForm({ userId }) {
  const [formData, setFormData] = useState({
    projectId: "",
    startTime: "",
    endTime: "",
    description: "",
  });
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.projectId) {
      newErrors.projectId = "Project is required";
    }

    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);

      if (end <= start) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateDuration = (start, end) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    return Math.round((endTime - startTime) / (1000 * 60)); // Duration in minutes
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/timelogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          projectId: formData.projectId,
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
          description: formData.description.trim(),
        }),
      });

      if (response.ok) {
        // Reset form
        setFormData({
          projectId: "",
          startTime: "",
          endTime: "",
          description: "",
        });
        setErrors({});
        alert("Time log saved successfully!");
        // Refresh the page to update the logs list
        window.location.reload();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save time log");
      }
    } catch (error) {
      console.error("Error saving time log:", error);
      alert(`Failed to save time log: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate duration display
  const duration =
    formData.startTime && formData.endTime
      ? calculateDuration(formData.startTime, formData.endTime)
      : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Project Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project *
        </label>
        <select
          name="projectId"
          value={formData.projectId}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.projectId ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Select a project...</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        {errors.projectId && (
          <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>
        )}
      </div>

      {/* Start Time */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Start Time *
        </label>
        <input
          type="datetime-local"
          name="startTime"
          value={formData.startTime}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.startTime ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.startTime && (
          <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
        )}
      </div>

      {/* End Time */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          End Time *
        </label>
        <input
          type="datetime-local"
          name="endTime"
          value={formData.endTime}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.endTime ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.endTime && (
          <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
        )}
      </div>

      {/* Duration Display */}
      {duration > 0 && (
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-sm text-blue-800">
            Duration: {Math.floor(duration / 60)}h {duration % 60}m
          </p>
        </div>
      )}

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe what you worked on..."
          rows={3}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.description ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
      >
        {isLoading ? "Saving..." : "Add Time Log"}
      </button>
    </form>
  );
}
