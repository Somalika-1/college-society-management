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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-4">
            Campus Society Hub
          </h1>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-8">
            Discover and engage with student societies, upcoming events, and
            important announcements.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="primary" onClick={handleLogin}>
              Login
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
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
      <section className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Latest Announcements
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {announcementsLoading ? (
            <Card>Loading announcements...</Card>
          ) : (
            publicAnnouncements.slice(0, 3).map((announcement) => (
              <Card key={announcement.id}>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {announcement.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {announcement.content}
                  </p>
                  <p className="text-sm text-gray-500">
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
      <section className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Upcoming Events
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {eventsLoading ? (
            <Card>Loading events...</Card>
          ) : (
            upcomingEvents
              .slice(0, 3)
              .map((event) => (
                <EventCard
                  key={event.id}
                  id={event.id}
                  title={event.title}
                  description={event.description}
                  date={new Date(event.date)}
                  venue={event.venue}
                  societyId={event.societyId}
                  registeredParticipants={event.registeredParticipants || []}
                  maxParticipants={event.maxParticipants}
                  onRegister={() => handleEventRegistration(event.id)}
                />
              ))
          )}
        </div>
        <div className="text-center mt-8">
          <Link href="/events">
            <Button variant="secondary">View All Events</Button>
          </Link>
        </div>
      </section>

      {/* Featured Societies Section */}
      <section className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Featured Societies
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {societiesLoading ? (
            <Card>Loading societies...</Card>
          ) : (
            societies
              ?.slice(0, 3)
              .map((society) => (
                <SocietyCard
                  key={society.id}
                  name={society.name}
                  description={society.description}
                  memberCount={society.members.length}
                  tags={["Active"]}
                  onViewDetails={() => router.push(`/societies/${society.id}`)}
                />
              ))
          )}
        </div>
        <div className="text-center mt-8">
          <Link href="/societies">
            <Button variant="secondary">View All Societies</Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 mt-12">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Join Our Campus Community
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Register now to participate in events and join societies!
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="secondary" onClick={handleLogin}>
              Login
            </Button>
            <Button variant="secondary" onClick={handleSignUp}>
              Sign Up
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
