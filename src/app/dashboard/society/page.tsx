"use client";
// src/app/dashboard/society/page.tsx
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Users, Calendar, Bell } from "lucide-react";

export default function SocietyDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  if (user?.role !== "society_head") {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Society Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Members</h3>
            <Users className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-2xl font-bold mt-2">45</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Events</h3>
            <Calendar className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-2xl font-bold mt-2">8</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Announcements</h3>
            <Bell className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-2xl font-bold mt-2">12</p>
        </div>
      </div>

      {/* Society Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
          {/* Events list */}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Member Requests</h2>
          {/* Member join requests */}
        </div>
      </div>
    </div>
  );
}
