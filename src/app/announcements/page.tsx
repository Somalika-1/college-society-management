// src/app/announcements/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { Bell, Search, Filter, Trash2, Edit } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useSocieties } from "@/hooks/useSocieties";
import { Announcement } from "@/types";

export default function AnnouncementsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSociety, setSelectedSociety] = useState("all");
  const { user } = useAuth();
  const { societies, loading: societiesLoading } = useSocieties();

  const {
    announcements,
    loading,
    error,
    removeAnnouncement,
    refreshAnnouncements,
  } = useAnnouncements();

  useEffect(() => {
    refreshAnnouncements();
  }, [refreshAnnouncements]);

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch = searchQuery
      ? announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesSociety =
      selectedSociety !== "all"
        ? announcement.societyId === selectedSociety
        : true;

    return matchesSearch && matchesSociety;
  });

  const canManageAnnouncement = (announcement: Announcement) => {
    return (
      user?.role === "admin" ||
      (user?.role === "society_head" &&
        user?.societyId === announcement.societyId)
    );
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      await removeAnnouncement(id);
    }
  };

  if (loading || societiesLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        {error}
        <button
          onClick={refreshAnnouncements}
          className="ml-2 text-blue-600 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Announcements</h1>
        {(user?.role === "admin" || user?.role === "society_head") && (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            onClick={() => {
              /* Open Create Announcement Modal */
            }}
          >
            <Bell className="h-5 w-5 mr-2" />
            New Announcement
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search announcements..."
            className="w-full pl-10 pr-4 py-2 border rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={selectedSociety}
            onChange={(e) => setSelectedSociety(e.target.value)}
            className="border rounded-md px-2 py-1"
          >
            <option value="all">All Societies</option>
            {societies.map((society) => (
              <option key={society.id} value={society.id}>
                {society.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No announcements found
          </div>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <div
              key={announcement.id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold mb-2">
                    {announcement.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{announcement.content}</p>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {announcement.societyId}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {canManageAnnouncement(announcement) && (
                  <div className="flex space-x-2">
                    <button
                      className="text-gray-400 hover:text-blue-600"
                      onClick={() => {
                        /* Open Edit Modal */
                      }}
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      className="text-gray-400 hover:text-red-600"
                      onClick={() => handleDelete(announcement.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
