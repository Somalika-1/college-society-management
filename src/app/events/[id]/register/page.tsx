"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/firebase/config";

const RegisterForEvent = () => {
  const params = useParams();
  const eventId = params.id as string;
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "" });
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventRef = doc(db, "events", eventId);
        const eventSnap = await getDoc(eventRef);

        if (eventSnap.exists()) {
          setEvent(eventSnap.data());
        } else {
          alert("Event not found!");
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        alert("Error loading event details. Please try again.");
      }
    };

    fetchEvent();
  }, [eventId, router]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Email validation
      if (!form.email.endsWith("@stu.srmuniversity.ac.in")) {
        alert("Please use your SRM student email (@stu.srmuniversity.ac.in).");
        setIsLoading(false);
        return;
      }

      // Fetch latest event data to check available slots and duplicate registrations
      const eventRef = doc(db, "events", eventId);
      const eventSnap = await getDoc(eventRef);

      if (!eventSnap.exists()) {
        alert("Event not found!");
        router.push("/");
        return;
      }

      const currentEvent = eventSnap.data();
      const currentParticipants = currentEvent.registeredParticipants || [];

      // Check if max participants reached
      if (
        currentEvent.maxParticipants &&
        currentParticipants.length >= currentEvent.maxParticipants
      ) {
        alert("Sorry, this event is full. No more slots available.");
        setIsLoading(false);
        return;
      }

      // Check if user is already registered
      if (currentParticipants.some((p: any) => p.email === form.email)) {
        alert("You have already registered for this event.");
        setIsLoading(false);
        return;
      }

      // Create new participant object with timestamp
      const newParticipant = {
        name: form.name,
        email: form.email,
        registeredAt: new Date(),
      };

      // Update only the registeredParticipants field using arrayUnion
      await updateDoc(eventRef, {
        registeredParticipants: arrayUnion(newParticipant),
      });

      alert("Registered Successfully!");
      router.push(`/events/${eventId}`);
    } catch (error) {
      console.error("Error registering for event:", error);
      alert("Failed to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!event) {
    return <div className="text-center p-8">Loading event details...</div>;
  }

  // Calculate available slots
  const availableSlots =
    event.maxParticipants - (event.registeredParticipants?.length || 0);

  return (
    <div className="max-w-md mx-auto p-6 border rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Register for {event.title}</h2>

      {availableSlots <= 0 ? (
        <div className="bg-red-100 p-4 rounded mb-4">
          <p className="text-red-700 font-medium">
            This event is full. No more slots available.
          </p>
        </div>
      ) : (
        <p className="mb-4">
          <strong>Available Slots:</strong> {availableSlots} out of{" "}
          {event.maxParticipants}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Enter your name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="w-full p-2 border rounded"
          disabled={isLoading || availableSlots <= 0}
        />
        <input
          type="email"
          name="email"
          placeholder="Enter your college email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          className="w-full p-2 border rounded"
          disabled={isLoading || availableSlots <= 0}
        />
        <button
          type="submit"
          className={`w-full p-2 ${
            isLoading || availableSlots <= 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white rounded`}
          disabled={isLoading || availableSlots <= 0}
        >
          {isLoading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default RegisterForEvent;
