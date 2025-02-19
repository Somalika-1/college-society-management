"use client";
// src/app/dashboard/page.tsx

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, Bell } from "lucide-react";

export default function MemberDashboard() {
  const { user, loading } = useAuth();

  console.log("Dashboard Page:", { user, loading });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold">Welcome, {user.email}</h1>
          <p className="text-gray-600">Member Dashboard</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">My Events</h3>
              <Calendar className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-2xl font-bold mt-2">0</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Notifications</h3>
              <Bell className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-2xl font-bold mt-2">0</p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">My Registered Events</h2>
            <p className="text-gray-500">No events registered yet.</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Recent Announcements</h2>
            <p className="text-gray-500">No recent announcements.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
