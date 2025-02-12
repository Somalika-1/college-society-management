"use client";

import React, { useState, useEffect } from "react";
import { Users, Calendar, Bell } from "lucide-react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth"; // Make sure Firebase Auth is properly configured

interface Event {
  id: string;
  title: string;
  date: Date;
  venue: string;
  maxParticipants: number;
  registeredParticipants: string[];
  societyId: string;
}

interface DashboardStats {
  totalMembers: number;
  activeEvents: number;
  announcements: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeEvents: 0,
    announcements: 0,
  });
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, auth } = useAuth(); // Assuming `useAuth` hook provides Firebase auth instance
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch members count for the society
      const membersQuery = query(
        collection(db, "users"),
        where("societyId", "==", user?.societyId)
      );
      const membersSnapshot = await getDocs(membersQuery);
      const totalMembers = membersSnapshot.size;

      // Fetch active events
      const eventsQuery = query(
        collection(db, "events"),
        where("societyId", "==", user?.societyId),
        where("status", "==", "upcoming"),
        orderBy("date", "asc")
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      const events = eventsSnapshot.docs.map((doc) => {
        const eventData = doc.data() as DocumentData;
        return {
          id: doc.id,
          title: eventData.title,
          date: eventData.date.toDate(),
          venue: eventData.venue,
          maxParticipants: eventData.maxParticipants,
          registeredParticipants: eventData.registeredParticipants,
          societyId: eventData.societyId,
        };
      });

      // Fetch announcements count
      const announcementsQuery = query(
        collection(db, "announcements"),
        where("societyId", "==", user?.societyId),
        where("status", "==", "published")
      );
      const announcementsSnapshot = await getDocs(announcementsQuery);

      setStats({
        totalMembers,
        activeEvents: events.length,
        announcements: announcementsSnapshot.size,
      });

      setUpcomingEvents(events);
    } catch (error: any) {
      setError("Error fetching dashboard data: " + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    router.push("/events/create");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out using Firebase auth
      router.push("/"); // Redirect to login page after logout
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold capitalize">
          Welcome to <span className=" text-red-600">{user?.societyId}</span>
        </h1>
        <div className="flex items-center space-x-4">
          {user?.role === "society_head" && (
            <button
              onClick={handleCreateEvent}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Create Event
            </button>
          )}
          <button
            onClick={handleLogout}
            className="bg-gray-400 text-white px-4 py-2 rounded-md  hover:bg-gray-700"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Members</h3>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <span className="text-2xl font-bold">{stats.totalMembers}</span>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Active Events</h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <span className="text-2xl font-bold">{stats.activeEvents}</span>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Announcements</h3>
            <Bell className="h-5 w-5 text-gray-400" />
          </div>
          <span className="text-2xl font-bold">{stats.announcements}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
          <div className="space-y-4">
            {loading ? (
              <p>Loading events...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div key={event.id} className="border-b border-gray-100 pb-4">
                  <h3 className="font-medium">{event.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(event.date).toLocaleDateString()} • {event.venue}
                  </p>
                  <div className="flex items-center mt-2">
                    <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {event.registeredParticipants.length}/
                      {event.maxParticipants} Registered
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No upcoming events</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
