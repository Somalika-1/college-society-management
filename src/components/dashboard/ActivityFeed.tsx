// src/components/dashboard/ActivityFeed.tsx
import React from "react";
import { Clock } from "lucide-react";

interface Activity {
  id: string;
  type: "event" | "announcement" | "member";
  title: string;
  description: string;
  timestamp: Date;
}

interface ActivityFeedProps {
  activities: Activity[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start space-x-3 border-b border-gray-100 pb-4"
          >
            <div className="flex-shrink-0">
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium">{activity.title}</h3>
              <p className="text-sm text-gray-500">{activity.description}</p>
              <span className="text-xs text-gray-400">
                {activity.timestamp.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
