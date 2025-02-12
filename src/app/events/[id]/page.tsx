// src/app/events/page.tsx
"use client";

import React, { useState } from "react";
import { Calendar, MapPin, Users, Search, Plus } from "lucide-react";

const mockEvents = [
  {
    id: "1",
    title: "Tech Workshop 2024",
    description: "Learn about the latest web technologies",
    date: new Date("2024-03-20"),
    venue: "Main Auditorium",
    society: "Tech Society",
    registeredParticipants: 45,
    maxParticipants: 100,
  },
  {
    id: "2",
    title: "Cultural Night",
    description: "Annual cultural celebration featuring performances",
    date: new Date("2024-03-25"),
    venue: "College Ground",
    society: "Cultural Club",
    registeredParticipants: 150,
    maxParticipants: 200,
  },
];

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Events</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Create Event
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search events..."
            className="w-full pl-10 pr-4 py-2 border rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          {["all", "upcoming", "past"].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-md ${
                selectedFilter === filter
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockEvents.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
              <p className="text-gray-600 mb-4">{event.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{event.date.toLocaleDateString()}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{event.venue}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>
                    {event.registeredParticipants} / {event.maxParticipants}{" "}
                    registered
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  By {event.society}
                </span>
                <button
                  className={`px-4 py-2 rounded-md ${
                    event.registeredParticipants >= event.maxParticipants
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                  disabled={
                    event.registeredParticipants >= event.maxParticipants
                  }
                >
                  {event.registeredParticipants >= event.maxParticipants
                    ? "Fully Booked"
                    : "Register Now"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
