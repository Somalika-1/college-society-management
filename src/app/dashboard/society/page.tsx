"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Users, Calendar, Bell, UserCircle } from "lucide-react";
import {
  collection,
  query,
  where,
  getDocs,
  getFirestore,
} from "firebase/firestore";
import { app } from "@/firebase/config";

// Define an interface for member details
interface MemberDetails {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export default function SocietyDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const db = getFirestore(app);

  // State for dynamic data
  const [membersCount, setMembersCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [announcementsCount, setAnnouncementsCount] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [memberRequests, setMemberRequests] = useState<any[]>([]);
  const [societyMembers, setSocietyMembers] = useState<MemberDetails[]>([]);

  // Navigation effect
  useEffect(() => {
    if (!loading && user?.role !== "society_head") {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  // Data fetching effect
  useEffect(() => {
    // Only fetch if user is a society head
    if (!user || user.role !== "society_head") return;

    const fetchSocietyData = async () => {
      try {
        // Fetch members
        const membersQuery = query(
          collection(db, "users"),
          where("societyId", "==", user.societyId)
        );
        const membersSnapshot = await getDocs(membersQuery);

        // Map members with details
        const members = membersSnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as MemberDetails)
        );

        setSocietyMembers(members);
        setMembersCount(members.length);

        // Fetch events count
        const eventsQuery = query(
          collection(db, "events"),
          where("societyId", "==", user.societyId)
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        setEventsCount(eventsSnapshot.size);

        // Fetch announcements count
        const announcementsQuery = query(
          collection(db, "announcements"),
          where("societyId", "==", user.societyId)
        );
        const announcementsSnapshot = await getDocs(announcementsQuery);
        setAnnouncementsCount(announcementsSnapshot.size);

        // Fetch upcoming events
        const upcomingEventsQuery = query(
          collection(db, "events"),
          where("societyId", "==", user.societyId),
          where("status", "==", "upcoming")
        );
        const upcomingEventsSnapshot = await getDocs(upcomingEventsQuery);
        const events = upcomingEventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUpcomingEvents(events);

        // Fetch member requests
        const memberRequestsQuery = query(
          collection(db, "memberRequests"),
          where("societyId", "==", user.societyId),
          where("status", "==", "pending")
        );
        const memberRequestsSnapshot = await getDocs(memberRequestsQuery);
        const requests = memberRequestsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMemberRequests(requests);
      } catch (error) {
        console.error("Error fetching society data:", error);
      }
    };

    fetchSocietyData();
  }, [user, db]);

  // Loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Unauthorized access
  if (!user || user.role !== "society_head") {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Society Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Members</h3>
            <Users className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-2xl font-bold mt-2">{membersCount}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Events</h3>
            <Calendar className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-2xl font-bold mt-2">{eventsCount}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Announcements</h3>
            <Bell className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-2xl font-bold mt-2">{announcementsCount}</p>
        </div>
      </div>

      {/* Society Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
          {upcomingEvents.length > 0 ? (
            <ul>
              {upcomingEvents.map((event) => (
                <li key={event.id} className="mb-2">
                  {event.title} - {new Date(event.date).toLocaleDateString()}
                </li>
              ))}
            </ul>
          ) : (
            <p>No upcoming events</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Member Requests</h2>
          {memberRequests.length > 0 ? (
            <ul>
              {memberRequests.map((request) => (
                <li key={request.id} className="mb-2">
                  {request.name} ({request.email})
                </li>
              ))}
            </ul>
          ) : (
            <p>No pending member requests</p>
          )}
        </div>
      </div>

      {/* Society Members */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Society Members</h2>
        {societyMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {societyMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition"
              >
                <UserCircle className="h-10 w-10 mr-4 text-gray-500" />
                <div>
                  <p className="font-semibold">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      member.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {member.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No members in this society</p>
        )}
      </div>
    </div>
  );
}
