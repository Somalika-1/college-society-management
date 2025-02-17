// src/app/societies/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { useSocieties } from "@/hooks/useSocieties";

export default function SocietiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { societies, loading, error } = useSocieties();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Societies</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Create Society
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search societies..."
            className="w-full pl-10 pr-4 py-2 border rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Societies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p>Loading societies...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : societies.length > 0 ? (
          societies.map((society) => (
            <div
              key={society.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="h-48 bg-gray-200">
                {/* Society image would go here */}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{society.name}</h3>
                <p className="text-gray-600 mb-4">{society.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {society.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {society.memberCount} members
                  </span>
                  <button className="text-blue-600 hover:text-blue-800">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No societies found</p>
        )}
      </div>
    </div>
  );
}
