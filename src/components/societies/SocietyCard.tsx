// src/components/societies/SocietyCard.tsx
import React from "react";
import { Users } from "lucide-react";

interface SocietyCardProps {
  name: string;
  description: string;
  memberCount: number;
  tags: string[];
  onViewDetails?: () => void;
}

export default function SocietyCard({
  name,
  description,
  memberCount,
  tags,
  onViewDetails,
}: SocietyCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        <p className="text-gray-600 mb-4">{description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span>{memberCount} members</span>
          </div>
          <button
            onClick={onViewDetails}
            className="text-blue-600 hover:text-blue-800"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
