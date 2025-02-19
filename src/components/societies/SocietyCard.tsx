// src/components/societies/SocietyCard.tsx
import React from "react";
import { Users } from "lucide-react";

interface SocietyCardProps {
  name: string;
  description: string;
  members: string[]; // Changed from `memberCount` to `members`
  tags?: string[];
  onViewDetails?: () => void;
}

export default function SocietyCard({
  name,
  description,
  members,
  tags = [],
  onViewDetails,
}: SocietyCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition hover:shadow-2xl">
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 text-gray-900">{name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex items-center text-gray-700">
            <Users className="h-4 w-4 mr-2" />
            <span>{members.length} members</span> {/* Dynamically calculated */}
          </div>
          <button
            onClick={onViewDetails}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
}
