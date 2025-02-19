"use client";
// src/app/dashboard/admin/page.tsx
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Users, Building2, CalendarDays } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  if (user?.role !== "admin") {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Total Societies</h3>
            <Building2 className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-2xl font-bold mt-2">10</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Total Members</h3>
            <Users className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-2xl font-bold mt-2">150</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Active Events</h3>
            <CalendarDays className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-2xl font-bold mt-2">25</p>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Society Requests</h2>
          {/* Society approval requests list */}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Recent Activities</h2>
          {/* Activity log */}
        </div>
      </div>
    </div>
  );
}
