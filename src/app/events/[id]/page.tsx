"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { QRCodeSVG } from "qrcode.react";

const EventPage = () => {
  const params = useParams();
  const eventId = params.id as string;
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registrationUrl, setRegistrationUrl] = useState("");
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
        setError("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, router]);

  // Generate the registration URL with proper domain handling
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Get the base URL based on the environment
      let baseUrl;

      // Use window.location.host to get the domain:port without the protocol
      // This works correctly in both development and production
      baseUrl = `${window.location.protocol}//${window.location.host}`;

      setRegistrationUrl(`${baseUrl}/events/${eventId}/register`);
    }
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading event details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
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
          <h2 className="mt-2 text-xl font-bold text-gray-900">{error}</h2>
          <p className="mt-2 text-gray-600">Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  if (!event) return null;

  // Format date nicely
  const eventDate = new Date(event.date.seconds * 1000);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = eventDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Calculate registration status and capacity
  const registeredCount = event.registeredParticipants?.length || 0;
  const maxCapacity = event.maxParticipants || 0;
  const capacityPercentage =
    maxCapacity > 0 ? (registeredCount / maxCapacity) * 100 : 0;
  const isEventFull = maxCapacity > 0 && registeredCount >= maxCapacity;

  // Determine status badge color
  let statusColor = "bg-gray-100 text-gray-800";
  if (event.status) {
    if (event.status.toLowerCase() === "upcoming") {
      statusColor = "bg-blue-100 text-blue-800";
    } else if (event.status.toLowerCase() === "ongoing") {
      statusColor = "bg-green-100 text-green-800";
    } else if (event.status.toLowerCase() === "completed") {
      statusColor = "bg-gray-100 text-gray-800";
    } else if (event.status.toLowerCase() === "cancelled") {
      statusColor = "bg-red-100 text-red-800";
    }
  }

  return (
    // <section className="bg-red-200 !important">
    <div className="bg-gray-100 text-gray-900">
      <div className="max-w-2xl mx-auto  bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push("/")}
              className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}
            >
              {event.status || "Upcoming"}
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
          <div className="flex items-center text-blue-100 mb-1">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>
              {formattedDate} at {formattedTime}
            </span>
          </div>
          <div className="flex items-center text-blue-100">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>{event.venue}</span>
          </div>
        </div>

        {/* Event Details */}
        <div className="p-6 md:p-8">
          {/* Event Type Badge */}
          {event.type && (
            <div className="mb-4">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                {event.type}
              </span>
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">About This Event</h2>
            <p className="text-gray-700">{event.description}</p>
          </div>

          {/* Capacity Section */}
          {maxCapacity > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Event Capacity</h2>
              <div className="bg-gray-100 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-4 rounded-full ${
                    isEventFull ? "bg-red-500" : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span>{registeredCount} registered</span>
                <span>{maxCapacity - registeredCount} spots left</span>
              </div>
            </div>
          )}

          {/* QR Code Section */}
          <div className="bg-gray-50 p-6 rounded-xl mb-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-3">Quick Registration</h3>
              <p className="text-gray-600 text-sm mb-4">
                Scan the QR code to register for this event
              </p>

              <div className="flex justify-center">
                <div className="bg-white p-3 rounded-lg shadow-sm inline-block">
                  {registrationUrl && (
                    <QRCodeSVG
                      value={registrationUrl}
                      size={200}
                      level={"H"}
                      includeMargin={true}
                      bgColor={"#FFFFFF"}
                      fgColor={"#000000"}
                    />
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-3 break-all">
                <a href={registrationUrl} className="hover:underline">
                  {registrationUrl}
                </a>
              </p>
            </div>
          </div>

          {/* Registration Button */}
          <div className="flex flex-col space-y-3">
            <button
              className={`py-3 px-6 rounded-lg font-medium text-white text-center transition-all duration-200 ${
                isEventFull
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
              }`}
              onClick={() =>
                !isEventFull && router.push(`/events/${eventId}/register`)
              }
              disabled={isEventFull}
            >
              {isEventFull ? "Event Full" : "Register Now"}
            </button>

            <button
              className="py-3 px-6 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 text-center transition-all duration-200"
              onClick={() => router.push("/events")}
            >
              View All Events
            </button>
          </div>
        </div>
      </div>
    </div>
    // </section>
  );
};

export default EventPage;
