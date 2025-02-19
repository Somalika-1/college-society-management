"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import {
  Users,
  Calendar,
  Bell,
  Check,
  X,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import {
  collection,
  query,
  where,
  getDocs,
  getFirestore,
  updateDoc,
  doc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { app } from "@/firebase/config";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/common/dialog";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/input";
import { Textarea } from "@/components/common/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/common/tabs";
import { Alert, AlertDescription } from "@/components/common/alert";

// Interfaces
interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  status: "upcoming" | "active" | "completed";
  attendees: string[];
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  createdBy: string;
  isPublished: boolean;
}

interface MemberRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
}

export default function SocietyDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const db = getFirestore(app);

  // State variables
  const [membersCount, setMembersCount] = useState(0);
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [memberRequests, setMemberRequests] = useState<MemberRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
    status: "upcoming" as const,
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
    isPublished: false,
  });

  // Dialog states
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Check user role and redirect if necessary
  useEffect(() => {
    if (!loading && user?.role !== "society_head") {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  // Fetch all society data
  useEffect(() => {
    if (!user || user.role !== "society_head" || !user.societyId) return;

    const fetchSocietyData = async () => {
      try {
        setIsLoading(true);

        // Fetch members
        const membersQuery = query(
          collection(db, "users"),
          where("societyId", "==", user.societyId)
        );
        const membersSnapshot = await getDocs(membersQuery);
        const membersData = membersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Member[];
        setMembers(membersData);
        setMembersCount(membersSnapshot.size);

        // Fetch events
        const eventsQuery = query(
          collection(db, "events"),
          where("societyId", "==", user.societyId)
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        const eventsData = eventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate(),
        })) as Event[];
        setEvents(eventsData);

        // Fetch announcements
        const announcementsQuery = query(
          collection(db, "announcements"),
          where("societyId", "==", user.societyId)
        );
        const announcementsSnapshot = await getDocs(announcementsQuery);
        const announcementsData = announcementsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as Announcement[];
        setAnnouncements(announcementsData);

        // Fetch member requests
        const requestsQuery = query(
          collection(db, "memberRequests"),
          where("societyId", "==", user.societyId),
          where("status", "==", "pending")
        );
        const requestsSnapshot = await getDocs(requestsQuery);
        const requestsData = requestsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as MemberRequest[];
        setMemberRequests(requestsData);
      } catch (error) {
        console.error("Error fetching society data:", error);
        setError("Failed to fetch society data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSocietyData();
  }, [user, db]);

  // Handle member requests
  const handleMemberRequest = async (
    requestId: string,
    status: "approved" | "rejected"
  ) => {
    try {
      setIsSubmitting(true);
      await updateDoc(doc(db, "memberRequests", requestId), {
        status,
        updatedAt: new Date(),
        updatedBy: user?.id,
      });

      // If approved, update user's societyId
      if (status === "approved") {
        const request = memberRequests.find((r) => r.id === requestId);
        if (request) {
          await updateDoc(doc(db, "users", request.userId), {
            societyId: user?.societyId,
            updatedAt: new Date(),
          });
        }
      }

      setMemberRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (error) {
      setError(`Failed to ${status} member request`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle event operations
  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const eventData = {
        ...eventForm,
        societyId: user?.societyId,
        date: new Date(eventForm.date),
        attendees: [],
      };

      if (editMode && editId) {
        await updateDoc(doc(db, "events", editId), {
          ...eventData,
          updatedAt: new Date(),
        });
      } else {
        await addDoc(collection(db, "events"), {
          ...eventData,
          createdAt: new Date(),
          createdBy: user?.id,
        });
      }

      // Refresh events list
      const eventsQuery = query(
        collection(db, "events"),
        where("societyId", "==", user?.societyId)
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      const eventsData = eventsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
      })) as Event[];
      setEvents(eventsData);

      setShowEventDialog(false);
      setEventForm({
        title: "",
        description: "",
        date: "",
        status: "upcoming",
      });
    } catch (error) {
      setError("Failed to save event");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle announcement operations
  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const announcementData = {
        ...announcementForm,
        societyId: user?.societyId,
        createdBy: user?.id,
      };

      if (editMode && editId) {
        await updateDoc(doc(db, "announcements", editId), {
          ...announcementData,
          updatedAt: new Date(),
        });
      } else {
        await addDoc(collection(db, "announcements"), {
          ...announcementData,
          createdAt: new Date(),
        });
      }

      // Refresh announcements list
      const announcementsQuery = query(
        collection(db, "announcements"),
        where("societyId", "==", user?.societyId)
      );
      const announcementsSnapshot = await getDocs(announcementsQuery);
      const announcementsData = announcementsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Announcement[];
      setAnnouncements(announcementsData);

      setShowAnnouncementDialog(false);
      setAnnouncementForm({
        title: "",
        content: "",
        isPublished: false,
      });
    } catch (error) {
      setError("Failed to save announcement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await deleteDoc(doc(db, "events", id));
      setEvents(events.filter((event) => event.id !== id));
    } catch (error) {
      setError("Failed to delete event");
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      await deleteDoc(doc(db, "announcements", id));
      setAnnouncements(
        announcements.filter((announcement) => announcement.id !== id)
      );
    } catch (error) {
      setError("Failed to delete announcement");
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!user || user.role !== "society_head") return null;
  return (
    <div className="container mx-auto p-6">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="requests">Member Requests</TabsTrigger>
        </TabsList>

        {/* Events Tab */}
        <TabsContent value="events">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Events Management</h2>
              <Button
                onClick={() => {
                  setEditMode(false);
                  setEditId(null);
                  setEventForm({
                    title: "",
                    description: "",
                    date: "",
                    status: "upcoming",
                  });
                  setShowEventDialog(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Event
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white p-6 rounded-lg shadow-md space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold">{event.title}</h3>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditMode(true);
                          setEditId(event.id);
                          setEventForm({
                            title: event.title,
                            description: event.description,
                            date: new Date(event.date)
                              .toISOString()
                              .split("T")[0],
                            status: event.status,
                          });
                          setShowEventDialog(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteEvent(event.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-600">{event.description}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs capitalize
                      ${
                        event.status === "upcoming"
                          ? "bg-blue-100 text-blue-800"
                          : ""
                      }
                      ${
                        event.status === "active"
                          ? "bg-green-100 text-green-800"
                          : ""
                      }
                      ${
                        event.status === "completed"
                          ? "bg-gray-100 text-gray-800"
                          : ""
                      }
                    `}
                    >
                      {event.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {event.attendees?.length || 0} Attendees
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Event Dialog */}
          <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editMode ? "Edit Event" : "Create New Event"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEventSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Event Title
                  </label>
                  <Input
                    id="title"
                    value={eventForm.title}
                    onChange={(e) =>
                      setEventForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    value={eventForm.description}
                    onChange={(e) =>
                      setEventForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="date" className="text-sm font-medium">
                    Event Date
                  </label>
                  <Input
                    id="date"
                    type="date"
                    value={eventForm.date}
                    onChange={(e) =>
                      setEventForm((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                {/* <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium">
                    Status
                  </label>
                  <Select
                    value={eventForm.status}
                    onValueChange={(value) =>
                      setEventForm((prev) => ({
                        ...prev,
                        status: value as "upcoming" | "active" | "completed",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEventDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Saving..."
                      : editMode
                      ? "Update"
                      : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
