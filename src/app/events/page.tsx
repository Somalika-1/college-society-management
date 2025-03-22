"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useEvents } from "@/hooks/useEvents";
import EventCard from "@/components/events/EventCard";
import { Card } from "@/components/common/Card";

export default function EventsPage() {
  const router = useRouter();
  const { events, loading } = useEvents();

  const safeDate = (dateField: any): Date => {
    if (!dateField) return new Date();
    if (typeof dateField.toDate === "function") return dateField.toDate();
    const parsedDate = new Date(dateField);
    return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  };

  const today = new Date();

  const upcomingEvents = events
    ?.filter((event) => safeDate(event.date) > today)
    .sort((a, b) => safeDate(a.date).getTime() - safeDate(b.date).getTime()); // Sort upcoming events by date (earliest first)

  const pastEvents = events
    ?.filter((event) => safeDate(event.date) < today)
    .sort((a, b) => safeDate(b.date).getTime() - safeDate(a.date).getTime()); // Sort past events by date (latest first)

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <section className="bg-gray-900 text-white py-12 text-center">
        <h1 className="text-4xl font-extrabold">All Events</h1>
        <p className="text-lg mt-2">Explore upcoming and past events</p>
      </section>

      <section className="max-w-7xl mx-auto py-12 px-6">
        {loading ? (
          <Card>Loading events...</Card>
        ) : (
          <>
            {/* Upcoming Events Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
              {upcomingEvents.length === 0 ? (
                <p className="text-gray-500">No upcoming events.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      {...event}
                      date={safeDate(event.date)}
                      onRegister={() =>
                        router.push(`/events/${event.id}/register`)
                      }
                      onViewDetails={() => router.push(`/events/${event.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Past Events Section */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-4">Past Events</h2>
              {pastEvents.length === 0 ? (
                <p className="text-gray-500">No past events.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      {...event}
                      date={safeDate(event.date)}
                      onViewDetails={() => router.push(`/events/${event.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
