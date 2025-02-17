// src/app/dashboard/admin/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Users, Building2, CalendarDays, AlertCircle } from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/config";

interface PendingRequest {
  id: string;
  type: "society_creation" | "head_approval";
  title: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
}

export default function AdminDashboard() {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const requestsQuery = query(
        collection(db, "requests"),
        where("status", "==", "pending")
      );
      const requestsSnapshot = await getDocs(requestsQuery);
      const requestsData = requestsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp).toDate(),
      })) as PendingRequest[];
      setRequests(requestsData);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const handleApprove = (requestId: string) => {
    setRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === requestId ? { ...request, status: "approved" } : request
      )
    );
  };

  const handleReject = (requestId: string) => {
    setRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === requestId ? { ...request, status: "rejected" } : request
      )
    );
  };

  const viewDetails = (requestId: string) => {
    setSelectedRequest(requestId);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Total Societies
            </h3>
            <Building2 className="h-5 w-5 text-gray-400" />
          </div>
          <span className="text-2xl font-bold">12</span>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Members</h3>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <span className="text-2xl font-bold">450</span>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Active Events</h3>
            <CalendarDays className="h-5 w-5 text-gray-400" />
          </div>
          <span className="text-2xl font-bold">8</span>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Pending Requests
            </h3>
            <AlertCircle className="h-5 w-5 text-gray-400" />
          </div>
          <span className="text-2xl font-bold">
            {requests.filter((r) => r.status === "pending").length}
          </span>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Pending Requests</h2>
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border-b border-gray-100 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{request.title}</h3>
                    <p className="text-sm text-gray-500">
                      {request.description}
                    </p>
                    <span className="text-xs text-gray-400">
                      {request.createdAt.toLocaleDateString()}
                    </span>
                    <div className="mt-1">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          request.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : request.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {request.status.charAt(0).toUpperCase() +
                          request.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {request.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-md"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => viewDetails(request.id)}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Society Overview Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Society Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Activity chart would go here */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-2">Recent Activity</h3>
            <p className="text-sm text-gray-500">
              Chart visualization will be added here
            </p>
          </div>

          {/* Member statistics */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-2">Member Statistics</h3>
            <p className="text-sm text-gray-500">
              Member growth trends will be shown here
            </p>
          </div>

          {/* Event metrics */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-2">Event Metrics</h3>
            <p className="text-sm text-gray-500">
              Event participation data will be displayed here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
