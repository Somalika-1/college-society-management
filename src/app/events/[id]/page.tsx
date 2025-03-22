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
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return event ? (
    <div className="max-w-lg mx-auto p-6 border rounded-lg shadow-md bg-white">
      <h1 className="text-2xl font-bold mb-4">{event.title}</h1>
      <p className="mb-4">{event.description}</p>
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <p className="mb-2">
          <strong>Date:</strong>{" "}
          {new Date(event.date.seconds * 1000).toLocaleString()}
        </p>
        <p className="mb-2">
          <strong>Venue:</strong> {event.venue}
        </p>
        {event.maxParticipants && (
          <p>
            <strong>Capacity:</strong>{" "}
            {event.registeredParticipants?.length || 0}/{event.maxParticipants}
          </p>
        )}
        {event.type && (
          <p>
            <strong>Type:</strong> {event.type}
          </p>
        )}
        {event.status && (
          <p>
            <strong>Status:</strong> {event.status}
          </p>
        )}
      </div>

      {/* QR Code for Registration */}
      <div className="mt-6 mb-6 flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-2">Scan QR to Register</h3>
        <div
          className="border p-3 bg-white rounded inline-block"
          style={{ textDecoration: "none" }}
        >
          {registrationUrl && (
            <QRCodeSVG
              value={registrationUrl}
              size={200}
              level={"H"}
              includeMargin={true}
            />
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">{registrationUrl}</p>
      </div>

      {/* Manual Registration Button */}
      <button
        className="mt-4 w-full p-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
        onClick={() => router.push(`/events/${eventId}/register`)}
      >
        Register Manually
      </button>
    </div>
  ) : (
    <p>Event not found</p>
  );
};

export default EventPage;
