"use client";
import { useState, useEffect, useMemo } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  getFirestore,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { Announcement } from "@/types";

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const db = getFirestore();

  // Ensure the Firestore query remains stable
  const announcementsQuery = useMemo(
    () => query(collection(db, "announcements"), orderBy("createdAt", "desc")),
    [db]
  );

  useEffect(() => {
    setLoading(true);

    const unsubscribe = onSnapshot(
      announcementsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Announcement[];

        setAnnouncements(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error fetching announcements:", err);
        setError("Failed to fetch announcements");
        setLoading(false);
      }
    );

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [announcementsQuery]);

  const addAnnouncement = async (announcementData: Omit<Announcement, "id" | "createdAt">) => {
    try {
      const newDoc = await addDoc(collection(db, "announcements"), {
        ...announcementData,
        createdAt: serverTimestamp(),
      });
      return { id: newDoc.id, ...announcementData, createdAt: new Date() };
    } catch (err) {
      console.error("Error creating announcement:", err);
      setError("Failed to create announcement");
      return null;
    }
  };

  const removeAnnouncement = async (id: string) => {
    try {
      await deleteDoc(doc(db, "announcements", id));
      return true;
    } catch (err) {
      console.error("Error deleting announcement:", err);
      setError("Failed to delete announcement");
      return false;
    }
  };

  return {
    announcements,
    loading,
    error,
    addAnnouncement,
    removeAnnouncement,
  };
}
// [FILEPATH] src/hooks/useAnnouncements.ts [/FILEPATH]