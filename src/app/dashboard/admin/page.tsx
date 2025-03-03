"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import {
  Users,
  Building2,
  CalendarDays,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import {
  collection,
  query,
  getDocs,
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  addDoc,
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
interface Society {
  id: string;
  name: string;
  description: string;
  headId: string | null;
  members: string[];
  createdAt: Date;
  status: "active" | "inactive";
  events?: string[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "society_head" | "member";
  societyId?: string;
  isActive: boolean;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  societyId: string;
  status: "upcoming" | "active" | "completed";
  venue?: string;
  type?: string;
  maxParticipants?: number;
  registeredParticipants?: string[];
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  societyId: string;
  authorId: string;
  createdAt: Date;
  updatedAt?: Date;
  isPublic: boolean;
  status: string;
  priority: string;
  metadata?: {
    comments: number;
    likes: number;
    views: number;
  };
  tags?: string[];
  targetAudience?: {
    roles: string[];
    societies: string[];
    years: number[];
  };
}

// Form interfaces
interface SocietyForm {
  name: string;
  description: string;
  headId: string;
}

interface UserForm {
  name: string;
  email: string;
  role: string;
  societyId: string;
}

interface EventForm {
  title: string;
  description: string;
  date: string;
  societyId: string;
  status: string;
  venue: string;
  type: string;
  maxParticipants: number;
}

interface AnnouncementForm {
  title: string;
  content: string;
  societyId: string;
  isPublic: boolean;
  status: string;
  priority: string;
  tags: string;
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const db = getFirestore(app);

  // States
  const [societies, setSocieties] = useState<Society[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [societyForm, setSocietyForm] = useState<SocietyForm>({
    name: "",
    description: "",
    headId: "",
  });
  const [userForm, setUserForm] = useState<UserForm>({
    name: "",
    email: "",
    role: "member",
    societyId: "",
  });
  const [eventForm, setEventForm] = useState<EventForm>({
    title: "",
    description: "",
    date: "",
    societyId: "",
    status: "upcoming",
    venue: "",
    type: "social",
    maxParticipants: 100,
  });
  const [announcementForm, setAnnouncementForm] = useState<AnnouncementForm>({
    title: "",
    content: "",
    societyId: "",
    isPublic: false,
    status: "draft",
    priority: "medium",
    tags: "",
  });

  // Dialog states
  const [showSocietyDialog, setShowSocietyDialog] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Fetch data function
  const fetchData = async () => {
    try {
      const societiesSnapshot = await getDocs(collection(db, "societies"));
      const societiesData = societiesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Society[];
      setSocieties(societiesData);

      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
      setUsers(usersData);

      const eventsSnapshot = await getDocs(collection(db, "events"));
      const eventsData = eventsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
      })) as Event[];
      setEvents(eventsData);

      const announcementsSnapshot = await getDocs(
        collection(db, "announcements")
      );
      const announcementsData = announcementsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Announcement[];
      setAnnouncements(announcementsData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchData();
    }
  }, [user]);

  // CRUD Operations

  // Split the society creation into two steps
  const handleSocietySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editMode && editId) {
        await updateDoc(doc(db, "societies", editId), {
          ...societyForm,
          updatedAt: new Date(),
        });
      } else {
        // Create society without requiring a head
        const societyRef = await addDoc(collection(db, "societies"), {
          name: societyForm.name,
          description: societyForm.description,
          headId: null, // Initially null
          members: [],
          createdAt: new Date(),
          status: "active",
        });

        // If a head was selected during creation, update the user and society
        if (societyForm.headId) {
          await updateDoc(doc(db, "societies", societyRef.id), {
            headId: societyForm.headId,
          });

          await updateDoc(doc(db, "users", societyForm.headId), {
            role: "society_head",
            societyId: societyRef.id,
          });
        }
      }
      await fetchData();
      setShowSocietyDialog(false);
      setSocietyForm({ name: "", description: "", headId: "" });
    } catch (err) {
      setError("Failed to save society");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add function to assign/change society head
  const assignSocietyHead = async (societyId: string, userId: string) => {
    try {
      // Get the current society data
      const societyDoc = await getDoc(doc(db, "societies", societyId));
      const society = societyDoc.data() as Society;

      // If there was a previous head, update their role
      if (society.headId) {
        await updateDoc(doc(db, "users", society.headId), {
          role: "member",
        });
      }

      // Update the new head
      await updateDoc(doc(db, "users", userId), {
        role: "society_head",
        societyId: societyId,
      });

      // Update the society
      await updateDoc(doc(db, "societies", societyId), {
        headId: userId,
      });

      await fetchData();
    } catch (err) {
      setError("Failed to assign society head");
    }
  };

  const handleUserSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editMode && editId) {
        await updateDoc(doc(db, "users", editId), {
          ...userForm,
          updatedAt: new Date(),
        });
      } else {
        await addDoc(collection(db, "users"), {
          ...userForm,
          isActive: true,
          createdAt: new Date(),
        });
      }
      await fetchData();
      setShowUserDialog(false);
      setUserForm({ name: "", email: "", role: "member", societyId: "" });
    } catch (err) {
      setError("Failed to save user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEventSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const eventData = {
        ...eventForm,
        date: new Date(eventForm.date),
        registeredParticipants: [],
      };

      if (editMode && editId) {
        await updateDoc(doc(db, "events", editId), {
          ...eventData,
          updatedAt: new Date(),
        });
      } else {
        const eventRef = await addDoc(collection(db, "events"), {
          ...eventData,
          createdAt: new Date(),
        });

        // Update the society's events array
        const societyRef = doc(db, "societies", eventForm.societyId);
        const societyDoc = await getDoc(societyRef);
        if (societyDoc.exists()) {
          const societyData = societyDoc.data();
          const events = societyData.events || [];
          await updateDoc(societyRef, {
            events: [...events, eventRef.id],
          });
        }
      }
      await fetchData();
      setShowEventDialog(false);
      setEventForm({
        title: "",
        description: "",
        date: "",
        societyId: "",
        status: "upcoming",
        venue: "",
        type: "social",
        maxParticipants: 100,
      });
    } catch (err) {
      setError("Failed to save event");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnnouncementSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Process tags
      const tagsArray = announcementForm.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const announcementData = {
        title: announcementForm.title,
        content: announcementForm.content,
        societyId: announcementForm.societyId,
        isPublic: announcementForm.isPublic, // Changed from isPublished to isPublic
        status: announcementForm.status,
        priority: announcementForm.priority,
        tags: tagsArray,
        metadata: {
          comments: 0,
          likes: 0,
          views: 0,
        },
        targetAudience: {
          roles: ["member"],
          societies: [announcementForm.societyId],
          years: [1, 2, 3, 4],
        },
      };

      if (editMode && editId) {
        await updateDoc(doc(db, "announcements", editId), {
          ...announcementData,
          updatedAt: new Date(),
        });
      } else {
        await addDoc(collection(db, "announcements"), {
          ...announcementData,
          authorId: user?.id || "",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      await fetchData();
      setShowAnnouncementDialog(false);
      setAnnouncementForm({
        title: "",
        content: "",
        societyId: "",
        isPublic: false,
        status: "draft",
        priority: "medium",
        tags: "",
      });
    } catch (err) {
      setError("Failed to save announcement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteSociety = async (id: string) => {
    try {
      await deleteDoc(doc(db, "societies", id));
      await fetchData();
    } catch (err) {
      setError("Failed to delete society");
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await deleteDoc(doc(db, "users", id));
      await fetchData();
    } catch (err) {
      setError("Failed to delete user");
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await deleteDoc(doc(db, "events", id));
      await fetchData();
    } catch (err) {
      setError("Failed to delete event");
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      await deleteDoc(doc(db, "announcements", id));
      await fetchData();
    } catch (err) {
      setError("Failed to delete announcement");
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

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
          <TabsTrigger value="societies">Societies</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Total Societies</h3>
                <Building2 className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-2xl font-bold mt-2">{societies.length}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Total Users</h3>
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-2xl font-bold mt-2">{users.length}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Active Events</h3>
                <CalendarDays className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-2xl font-bold mt-2">
                {events.filter((e) => e.status === "active").length}
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Societies Tab */}
        <TabsContent value="societies">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Societies Management</h2>
              <Button
                onClick={() => {
                  setEditMode(false);
                  setEditId(null);
                  setSocietyForm({ name: "", description: "", headId: "" });
                  setShowSocietyDialog(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Society
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {societies.map((society) => (
                <div
                  key={society.id}
                  className="bg-white p-4 rounded-lg shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{society.name}</h3>
                      <p className="text-sm text-gray-600">
                        {society.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Members: {society.members?.length || 0}
                      </p>
                      <p className="text-xs text-gray-400">
                        Events: {society.events?.length || 0}
                      </p>
                      <p className="text-xs text-gray-400">
                        Status: {society.status}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditMode(true);
                          setEditId(society.id);
                          setSocietyForm({
                            name: society.name,
                            description: society.description,
                            headId: society.headId || "",
                          });
                          setShowSocietyDialog(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteSociety(society.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Society Dialog */}
            <Dialog
              open={showSocietyDialog}
              onOpenChange={setShowSocietyDialog}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editMode ? "Edit Society" : "Create New Society"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSocietySubmit} className="space-y-4">
                  <Input
                    placeholder="Society Name"
                    value={societyForm.name}
                    onChange={(e) =>
                      setSocietyForm({ ...societyForm, name: e.target.value })
                    }
                    required
                  />
                  <Textarea
                    placeholder="Description"
                    value={societyForm.description}
                    onChange={(e) =>
                      setSocietyForm({
                        ...societyForm,
                        description: e.target.value,
                      })
                    }
                    required
                  />
                  <Select
                    value={societyForm.headId}
                    onValueChange={(value) =>
                      setSocietyForm({ ...societyForm, headId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Head (Optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No head assigned</SelectItem>
                      {users
                        .filter((u) => !u.societyId || u.societyId === editId)
                        .map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Saving..."
                      : editMode
                      ? "Update Society"
                      : "Create Society"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Users Management</h2>
              <Button
                onClick={() => {
                  setEditMode(false);
                  setEditId(null);
                  setUserForm({
                    name: "",
                    email: "",
                    role: "member",
                    societyId: "",
                  });
                  setShowUserDialog(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full bg-white shadow rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Society
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap capitalize">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize">
                        {user.role.replace("_", " ")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {societies.find((s) => s.id === user.societyId)?.name ||
                          "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditMode(true);
                              setEditId(user.id);
                              setUserForm({
                                name: user.name,
                                email: user.email,
                                role: user.role,
                                societyId: user.societyId || "",
                              });
                              setShowUserDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* User Dialog */}
            <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editMode ? "Edit User" : "Create New User"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUserSubmit} className="space-y-4">
                  <Input
                    placeholder="Full Name"
                    value={userForm.name}
                    onChange={(e) =>
                      setUserForm({ ...userForm, name: e.target.value })
                    }
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={userForm.email}
                    onChange={(e) =>
                      setUserForm({ ...userForm, email: e.target.value })
                    }
                    required
                  />
                  <Select
                    value={userForm.role}
                    onValueChange={(value) =>
                      setUserForm({ ...userForm, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="society_head">Society Head</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  {userForm.role !== "admin" && (
                    <Select
                      value={userForm.societyId}
                      onValueChange={(value) =>
                        setUserForm({ ...userForm, societyId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Society" />
                      </SelectTrigger>
                      <SelectContent>
                        {societies.map((society) => (
                          <SelectItem key={society.id} value={society.id}>
                            {society.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Saving..."
                      : editMode
                      ? "Update User"
                      : "Create User"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>

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
                    societyId: "",
                    status: "upcoming",
                    venue: "",
                    type: "social",
                    maxParticipants: 100,
                  });
                  setShowEventDialog(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => (
                <div key={event.id} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-gray-600">
                        {event.description}
                      </p>
                      <div className="text-xs text-gray-400">
                        <p>Date: {event.date.toLocaleDateString()}</p>
                        <p>
                          Society:{" "}
                          {
                            societies.find((s) => s.id === event.societyId)
                              ?.name
                          }
                        </p>
                        <p>Venue: {event.venue || "TBD"}</p>
                        <p>Status: {event.status}</p>
                        <p>Type: {event.type || "Standard"}</p>
                        <p>
                          Max Participants:{" "}
                          {event.maxParticipants || "Unlimited"}
                        </p>
                        <p>
                          Registered:{" "}
                          {event.registeredParticipants?.length || 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditMode(true);
                          setEditId(event.id);
                          setEventForm({
                            title: event.title,
                            description: event.description,
                            date: event.date.toISOString().split("T")[0],
                            societyId: event.societyId,
                            status: event.status,
                            venue: event.venue || "",
                            type: event.type || "social",
                            maxParticipants: event.maxParticipants || 100,
                          });
                          setShowEventDialog(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteEvent(event.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
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
                  <Input
                    placeholder="Event Title"
                    value={eventForm.title}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, title: e.target.value })
                    }
                    required
                  />
                  <Textarea
                    placeholder="Description"
                    value={eventForm.description}
                    onChange={(e) =>
                      setEventForm({
                        ...eventForm,
                        description: e.target.value,
                      })
                    }
                    required
                  />
                  <Input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, date: e.target.value })
                    }
                    required
                  />
                  <Input
                    placeholder="Venue"
                    value={eventForm.venue}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, venue: e.target.value })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Max Participants"
                    value={eventForm.maxParticipants.toString()}
                    onChange={(e) =>
                      setEventForm({
                        ...eventForm,
                        maxParticipants: parseInt(e.target.value) || 100,
                      })
                    }
                  />
                  <Select
                    value={eventForm.societyId}
                    onValueChange={(value) =>
                      setEventForm({ ...eventForm, societyId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Society" />
                    </SelectTrigger>
                    <SelectContent>
                      {societies.map((society) => (
                        <SelectItem key={society.id} value={society.id}>
                          {society.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={eventForm.status}
                    onValueChange={(value) =>
                      setEventForm({ ...eventForm, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={eventForm.type}
                    onValueChange={(value) =>
                      setEventForm({ ...eventForm, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Event Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="cultural">Cultural</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Saving..."
                      : editMode
                      ? "Update Event"
                      : "Create Event"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Announcements</h2>
              <Button
                onClick={() => {
                  setEditMode(false);
                  setEditId(null);
                  setAnnouncementForm({
                    title: "",
                    content: "",
                    societyId: "",
                    isPublic: false,
                    status: "draft",
                    priority: "medium",
                    tags: "",
                  });
                  setShowAnnouncementDialog(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Announcement
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="bg-white p-4 rounded-lg shadow"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold">{announcement.title}</h3>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditMode(true);
                            setEditId(announcement.id);
                            setAnnouncementForm({
                              title: announcement.title,
                              content: announcement.content,
                              societyId: announcement.societyId,
                              isPublic: announcement.isPublic,
                              status: announcement.status,
                              priority: announcement.priority,
                              tags: announcement.tags?.join(", ") || "",
                            });
                            setShowAnnouncementDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteAnnouncement(announcement.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {announcement.content}
                    </p>
                    <div className="text-xs text-gray-400">
                      <p>
                        Society:{" "}
                        {
                          societies.find((s) => s.id === announcement.societyId)
                            ?.name
                        }
                      </p>
                      <p>
                        Created: {announcement.createdAt.toLocaleDateString()}
                      </p>
                      <p>Status: {announcement.status}</p>
                      <p>
                        Visibility:{" "}
                        {announcement.isPublic ? "Public" : "Private"}
                      </p>
                      <p>Priority: {announcement.priority}</p>
                      {announcement.tags && announcement.tags.length > 0 && (
                        <p>Tags: {announcement.tags.join(", ")}</p>
                      )}
                      {announcement.metadata && (
                        <p>
                          Engagement: {announcement.metadata.views} views,{" "}
                          {announcement.metadata.likes} likes,{" "}
                          {announcement.metadata.comments} comments
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Announcement Dialog */}
            <Dialog
              open={showAnnouncementDialog}
              onOpenChange={setShowAnnouncementDialog}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editMode ? "Edit Announcement" : "Create New Announcement"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
                  <Input
                    placeholder="Announcement Title"
                    value={announcementForm.title}
                    onChange={(e) =>
                      setAnnouncementForm({
                        ...announcementForm,
                        title: e.target.value,
                      })
                    }
                    required
                  />
                  <Textarea
                    placeholder="Content"
                    value={announcementForm.content}
                    onChange={(e) =>
                      setAnnouncementForm({
                        ...announcementForm,
                        content: e.target.value,
                      })
                    }
                    required
                  />
                  <Select
                    value={announcementForm.societyId}
                    onValueChange={(value) =>
                      setAnnouncementForm({
                        ...announcementForm,
                        societyId: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Society" />
                    </SelectTrigger>
                    <SelectContent>
                      {societies.map((society) => (
                        <SelectItem key={society.id} value={society.id}>
                          {society.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Tags (comma-separated)"
                    value={announcementForm.tags}
                    onChange={(e) =>
                      setAnnouncementForm({
                        ...announcementForm,
                        tags: e.target.value,
                      })
                    }
                  />
                  <Select
                    value={announcementForm.status}
                    onValueChange={(value) =>
                      setAnnouncementForm({
                        ...announcementForm,
                        status: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={announcementForm.priority}
                    onValueChange={(value) =>
                      setAnnouncementForm({
                        ...announcementForm,
                        priority: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={announcementForm.isPublic}
                      onChange={(e) =>
                        setAnnouncementForm({
                          ...announcementForm,
                          isPublic: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label htmlFor="isPublic" className="text-sm text-gray-600">
                      Make public
                    </label>
                  </div>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Saving..."
                      : editMode
                      ? "Update Announcement"
                      : "Create Announcement"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// export default AdminDashboard;
