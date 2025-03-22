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
  onViewDetails?: () => void;
}

export default function EventCard({
  title,
  description,
  date,
  venue,
  registeredParticipants,
  maxParticipants,
  onRegister,
  onViewDetails,
}: EventCardProps) {
  const participantCount = registeredParticipants.length;
  const isFullyBooked = participantCount >= maxParticipants;

  return (
    <div
      className="bg-white rounded-lg capitalize shadow-md overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl transform hover:-translate-y-1"
      onClick={onViewDetails}
    >
      <div className="p-6">
        <h3 className="text-xl capitalize font-semibold mb-2 text-blue-800 transition-colors duration-300 hover:text-blue-600">
          {title}
        </h3>
        <p className="text-gray-600  mb-4">{description}</p>

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
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the card's onClick
              onRegister();
            }}
            disabled={isFullyBooked}
            className={`mt-4 w-full py-2 px-4 rounded-md transition-all duration-300 ${
              isFullyBooked
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"
            }`}
          >
            {isFullyBooked ? "Fully Booked" : "Register Now"}
          </button>
        )}
      </div>
    </div>
  );
}
