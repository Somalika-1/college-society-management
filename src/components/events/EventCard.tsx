// src/components/events/EventCard.tsx
import React from "react";
import { Calendar, MapPin, Users } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  venue: string;
  societyId: string;
  maxParticipants: number;
  registeredParticipants: string[];
}

interface EventCardProps extends Omit<Event, "registeredParticipants"> {
  registeredParticipants: string[];
  onRegister?: () => void;
}

export default function EventCard({
  title,
  description,
  date,
  venue,
  registeredParticipants,
  maxParticipants,
  onRegister,
}: EventCardProps) {
  const participantCount = registeredParticipants.length;
  const isFullyBooked = participantCount >= maxParticipants;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>

        <div className="space-y-2">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{date.toLocaleDateString()}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{venue}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span>
              {participantCount} / {maxParticipants} registered
            </span>
          </div>
        </div>

        {onRegister && (
          <button
            onClick={onRegister}
            disabled={isFullyBooked}
            className={`mt-4 w-full py-2 px-4 rounded-md ${
              isFullyBooked
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isFullyBooked ? "Fully Booked" : "Register Now"}
          </button>
        )}
      </div>
    </div>
  );
}
