"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/firebase/config";

const RegisterForEvent = () => {
  const params = useParams();
  const eventId = params.id as string;
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventRef = doc(db, "events", eventId);
        const eventSnap = await getDoc(eventRef);

        if (eventSnap.exists()) {
          setEvent(eventSnap.data());
        } else {
          setError("Event not found!");
          setTimeout(() => router.push("/"), 2000);
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        setError("Error loading event details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setError("");

    try {
      // Email validation
      if (!form.email.endsWith("@stu.srmuniversity.ac.in")) {
        setError(
          "Please use your SRM student email (@stu.srmuniversity.ac.in)."
        );
        setFormSubmitting(false);
        return;
      }

      // Phone number validation
      if (!/^\d{10}$/.test(form.phone)) {
        setError("Please enter a valid 10-digit phone number.");
        setFormSubmitting(false);
        return;
      }

      // Fetch latest event data
      const eventRef = doc(db, "events", eventId);
      const eventSnap = await getDoc(eventRef);

      if (!eventSnap.exists()) {
        setError("Event not found!");
        setTimeout(() => router.push("/"), 2000);
        return;
      }

      const currentEvent = eventSnap.data();
      const currentParticipants = currentEvent.registeredParticipants || [];

      // Check if max participants reached
      if (
        currentEvent.maxParticipants &&
        currentParticipants.length >= currentEvent.maxParticipants
      ) {
        setError("Sorry, this event is full. No more slots available.");
        setFormSubmitting(false);
        return;
      }

      // Check if user is already registered
      if (currentParticipants.some((p: any) => p.email === form.email)) {
        setError("You have already registered for this event.");
        setFormSubmitting(false);
        return;
      }

      // Create new participant object with phone number
      const newParticipant = {
        name: form.name,
        email: form.email,
        phone: form.phone, // ✅ Added phone number
        registeredAt: new Date(),
      };

      // Update Firestore document
      await updateDoc(eventRef, {
        registeredParticipants: arrayUnion(newParticipant),
      });

      // Success message and redirect
      setError("");

      // Show success message
      const successDiv = document.createElement("div");
      successDiv.className =
        "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50";
      successDiv.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <div class="text-center">
            <svg class="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <h2 class="mt-2 text-xl font-bold text-gray-900">Registration Successful!</h2>
            <p class="mt-2 text-gray-600">You have been registered for ${event.title}.</p>
            <p class="mt-2 text-sm text-gray-500">Redirecting to event page...</p>
          </div>
        </div>
      `;

      document.body.appendChild(successDiv);

      setTimeout(() => {
        document.body.removeChild(successDiv);
        router.push(`/events/${eventId}`);
      }, 1500);
    } catch (error) {
      console.error("Error registering for event:", error);
      setError("Failed to register. Please try again.");
    } finally {
      setFormSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading event details...</p>
      </div>
    );
  }

  if (error && error.includes("not found")) {
    return (
      <div className="min-h-[60vh] flex flex-col bg-white items-center justify-center p-8">
        <div className="bg-red-100 p-6 rounded-lg text-center max-w-md w-full">
          <svg
            className="mx-auto h-12 w-12 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="mt-2 text-xl font-bold text-gray-900">
            Event Not Found
          </h2>
          <p className="mt-2 text-gray-600">Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  if (!event) return null;

  // Calculate available slots
  const availableSlots =
    event.maxParticipants - (event.registeredParticipants?.length || 0);
  const isFull = availableSlots <= 0;
  console.log("Available slots:", availableSlots);

  return (
    <section className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto  bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
          <h2 className="text-2xl font-bold">{event.title}</h2>
          <p className="text-sm opacity-90 mt-1">Registration Form</p>
        </div>

        {isFull ? (
          <div className="p-6">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center">
                <svg
                  className="h-6 w-6 text-red-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-red-700 font-medium">
                  This event is full. No more slots available.
                </p>
              </div>
              <button
                onClick={() => router.push(`/events/${eventId}`)}
                className="mt-4 w-full p-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition duration-200"
              >
                Back to Event
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6 bg-blue-50 p-3 rounded">
              <span className="font-medium">Available Slots:</span>
              <span className="bg-blue-500 text-white py-1 px-3 rounded-full font-semibold">
                {availableSlots} / {event.maxParticipants}
              </span>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  disabled={formSubmitting}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  College Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="yourname@stu.srmuniversity.ac.in"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  disabled={formSubmitting}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Use your SRM student email (@stu.srmuniversity.ac.in)
                </p>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="text"
                  name="phone"
                  placeholder="Enter your phone number"
                  pattern="\d{10}"
                  maxLength={10}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  disabled={formSubmitting}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter a valid 10-digit phone number.
                </p>
              </div>

              <button
                type="submit"
                className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center space-x-2"
                disabled={formSubmitting}
              >
                {formSubmitting ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Registering...</span>
                  </>
                ) : (
                  "Register Now"
                )}
              </button>

              <button
                type="button"
                onClick={() => router.push(`/events/${eventId}`)}
                className="w-full p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium transition duration-200 text-center"
              >
                Back to Event
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};

export default RegisterForEvent;
