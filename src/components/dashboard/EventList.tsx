// src/components/dashboard/EventList.tsx
import { Event } from "@/types";

interface EventListProps {
  events: Event[];
  loading?: boolean;
  error?: string | null;
}

export default function EventList({ events, loading, error }: EventListProps) {
  if (loading) return <p className="text-gray-500">Loading events...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (events.length === 0)
    return <p className="text-gray-500">No upcoming events</p>;

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="border-b border-gray-100 pb-4">
          <h3 className="font-medium">{event.title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {new Date(event.date).toLocaleDateString()} • {event.venue}
          </p>
          <div className="flex items-center mt-2">
            <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              {event.registeredParticipants.length}/{event.maxParticipants}{" "}
              Registered
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
