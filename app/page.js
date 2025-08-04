"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Users,
  BarChart3,
  Timer,
  Calendar,
  Shield,
  ChevronRight,
  PlayCircle,
  UserPlus,
  Settings,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState(null);

  const features = [
    {
      icon: <Timer className="w-8 h-8" />,
      title: "Dual Time Logging",
      description:
        "Log hours manually or use our live timer with start/stop functionality",
      color: "from-blue-100 to-indigo-100",
      iconColor: "text-blue-600",
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "Project Management",
      description:
        "Admins can create, manage projects, and assign users seamlessly",
      color: "from-green-100 to-emerald-100",
      iconColor: "text-green-600",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Smart Analytics",
      description:
        "Filter time logs by user, project, or date with comprehensive summaries",
      color: "from-purple-100 to-violet-100",
      iconColor: "text-purple-600",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Role-Based Access",
      description:
        "Secure authentication with separate dashboards for users and admins",
      color: "from-orange-100 to-amber-100",
      iconColor: "text-orange-600",
    },
  ];

  const handleGetStarted = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-lg">
              <Clock className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-6">
            Time Tracker Pro
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            A comprehensive full-stack time tracking solution built with
            Next.js. Streamline your workflow with intelligent time logging,
            project management, and role-based dashboards designed for teams of
            all sizes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={handleGetStarted}
              className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
            >
              <PlayCircle className="w-5 h-5" />
              Get Started
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => router.push("/signup?role=USER")}
                className="bg-white text-gray-700 px-6 py-4 rounded-xl font-semibold border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 flex items-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Join as User
              </button>

              <button
                onClick={() => router.push("/signup?role=ADMIN")}
                className="bg-white text-gray-700 px-6 py-4 rounded-xl font-semibold border-2 border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-300 flex items-center gap-2"
              >
                <Shield className="w-5 h-5" />
                Admin Access
              </button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Powerful Features for Modern Teams
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Everything you need to track time efficiently, manage projects
            effectively, and gain insights into your teams productivity.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${feature.color} p-6 rounded-2xl shadow-sm hover:shadow-lg transform hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-white/50`}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div
                  className={`${
                    feature.iconColor
                  } mb-4 transform transition-transform duration-300 ${
                    hoveredCard === index ? "scale-110" : ""
                  }`}
                >
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Capabilities */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Built for Productivity
          </h2>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-lg shrink-0">
                  <Timer className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Flexible Time Logging
                  </h3>
                  <p className="text-gray-600">
                    Choose between manual entry with start/end times and
                    descriptions, or use our intuitive live timer for real-time
                    tracking.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-2 rounded-lg shrink-0">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Team Management
                  </h3>
                  <p className="text-gray-600">
                    Admins can create projects, assign team members, and
                    maintain organized workflows across multiple initiatives.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-2 rounded-lg shrink-0">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Advanced Filtering
                  </h3>
                  <p className="text-gray-600">
                    Filter and analyze time logs by project, user, or date range
                    with comprehensive summary reports.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 text-center">
              <div className="bg-white p-4 rounded-full w-20 h-20 mx-auto mb-6 shadow-md">
                <BarChart3 className="w-12 h-12 text-blue-600 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Responsive Design
              </h3>
              <p className="text-gray-600 mb-6">
                Built with Tailwind CSS for a seamless experience across all
                devices. Clean, intuitive dashboards tailored for each user
                role.
              </p>
              <div className="bg-white px-4 py-2 rounded-full text-sm font-medium text-blue-600 inline-block">
                NextAuth.js + JWT Security
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Time Tracking?
            </h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg">
              Join thousands of teams who trust Time Tracker Pro to streamline
              their workflow and boost productivity.
            </p>
            <button
              onClick={handleGetStarted}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center gap-2"
            >
              Start Your Journey
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
