"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, Calendar, Bell } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import EventCard from "@/components/events/EventCard";
import SocietyCard from "@/components/societies/SocietyCard";
import StatsCard from "@/components/dashboard/StatsCard";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useEvents } from "@/hooks/useEvents";
import { useSocieties } from "@/hooks/useSocieties";
import { useAuth } from "@/hooks/useAuth";

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { announcements, loading: announcementsLoading } = useAnnouncements();
  const { events, loading: eventsLoading } = useEvents();
  const { societies, loading: societiesLoading } = useSocieties();

  const publicAnnouncements =
    announcements?.filter((announcement) => announcement.isPublic) || [];
  const upcomingEvents =
    events?.filter((event) => new Date(event.date) > new Date()) || [];

  const handleSignUp = () => {
    router.push("/auth/register");
  };

  const handleLogin = () => {
    router.push("/auth/login");
  };

  const handleEventRegistration = (eventId: string) => {
    router.push(`/events/${eventId}/register`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-100 text-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-900 to-slate-800 text-white py-20 text-center shadow-lg rounded-b-3xl">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl font-extrabold mb-4">Campus Society Hub</h1>
          <p className="text-lg mb-6 capitalize">
            Discover student societies, join exciting events, and stay updated
            with the latest announcements!
          </p>
          <Button
            variant="outline"
            size="lg"
            className="bg-gray-300"
            onClick={handleLogin}
          >
            Login
          </Button>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="max-w-7xl mx-auto py-12 px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <StatsCard
            title="Active Societies"
            value={societies?.length || 0}
            icon={Users}
          />
          <StatsCard
            title="Upcoming Events"
            value={upcomingEvents.length}
            icon={Calendar}
          />
          <StatsCard
            title="Latest Announcements"
            value={publicAnnouncements.length}
            icon={Bell}
          />
        </div>
      </section>

      {/* Latest Announcements Section */}
      <section className="max-w-7xl mx-auto py-12 px-6">
        <h2 className="text-3xl font-bold text-center mb-8">
          Latest Announcements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcementsLoading ? (
            <Card>Loading announcements...</Card>
          ) : (
            publicAnnouncements.slice(0, 3).map((announcement) => (
              <Card
                key={announcement.id}
                className="hover:shadow-xl transition"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">
                    {announcement.title}
                  </h3>
                  <p className="text-gray-700 line-clamp-3">
                    {announcement.content}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            ))
          )}
        </div>
        <div className="text-center mt-8">
          <Link href="/announcements">
            <Button variant="secondary">View All Announcements</Button>
          </Link>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="max-w-7xl mx-auto py-12 px-6">
        <h2 className="text-3xl font-bold text-center mb-8">Upcoming Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventsLoading ? (
            <Card>Loading events...</Card>
          ) : (
            upcomingEvents
              .slice(0, 3)
              .map((event) => (
                <EventCard
                  key={event.id}
                  {...event}
                  onRegister={() => handleEventRegistration(event.id)}
                />
              ))
          )}
        </div>
      </section>

      {/* Featured Societies Section */}
      <section className="max-w-7xl mx-auto py-12 px-6">
        <h2 className="text-3xl font-bold text-center mb-8">
          Featured Societies
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {societiesLoading ? (
            <Card>Loading societies...</Card>
          ) : (
            societies
              .slice(0, 3)
              .map((society) => (
                <SocietyCard
                  key={society.id}
                  {...society}
                  onViewDetails={() => router.push(`/societies/${society.id}`)}
                />
              ))
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-600 py-16 text-center text-white mt-12 rounded-t-3xl">
        <h2 className="text-3xl font-bold mb-4">Join Our Campus Community</h2>
        <p className="text-lg mb-6">
          Register now to participate in events and join societies!
        </p>
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            className="bg-gray-300 text-gray-800"
            onClick={handleLogin}
          >
            Login
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="bg-gray-300 text-gray-800"
            onClick={handleSignUp}
          >
            Sign Up
          </Button>
        </div>
      </section>
    </div>
  );
}
