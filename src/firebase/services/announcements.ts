// src/firebase/services/announcements.ts
import { 
    collection,
    doc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    Timestamp,
  } from 'firebase/firestore';
  import { db } from '../config';
  import { Announcement } from '@/types';
  
  // Collection reference
  const announcementRef = collection(db, 'announcements');
  
  // Get all announcements with optional filters
  export const getAnnouncements = async ({
    societyId,
    isPublic,
    limit: queryLimit = 50,
    orderDirection = 'desc'
  }: {
    societyId?: string;
    isPublic?: boolean;
    limit?: number;
    orderDirection?: 'asc' | 'desc';
  } = {}) => {
    try {
      let q = query(announcementRef, orderBy('createdAt', orderDirection));
  
      // Add filters if provided
      if (societyId) {
        q = query(q, where('societyId', '==', societyId));
      }
  
      if (typeof isPublic === 'boolean') {
        q = query(q, where('isPublic', '==', isPublic));
      }
  
      // Apply limit
      q = query(q, limit(queryLimit));
  
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp).toDate()
      })) as Announcement[];
    } catch (error) {
      console.error('Error getting announcements:', error);
      throw error;
    }
  };
  
  // Get a single announcement by ID
  export const getAnnouncementById = async (id: string) => {
    try {
      const docRef = doc(db, 'announcements', id);
      const docSnap = await getDoc(docRef);
  
      if (!docSnap.exists()) {
        return null;
      }
  
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: (docSnap.data().createdAt as Timestamp).toDate()
      } as Announcement;
    } catch (error) {
      console.error('Error getting announcement:', error);
      throw error;
    }
  };
  
  // Create a new announcement
  export const createAnnouncement = async (data: Omit<Announcement, 'id' | 'createdAt'>) => {
    try {
      const docRef = await addDoc(announcementRef, {
        ...data,
        createdAt: serverTimestamp(),
      });
  
      return {
        id: docRef.id,
        ...data,
        createdAt: new Date(),
      } as Announcement;
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  };
  
  // Update an announcement
  export const updateAnnouncement = async (
    id: string, 
    data: Partial<Omit<Announcement, 'id' | 'createdAt'>>
  ) => {
    try {
      const docRef = doc(db, 'announcements', id);
      await updateDoc(docRef, data);
  
      // Get updated document
      const updatedDoc = await getDoc(docRef);
      return {
        id: updatedDoc.id,
        ...updatedDoc.data(),
        createdAt: (updatedDoc.data()?.createdAt as Timestamp).toDate()
      } as Announcement;
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  };
  
  // Delete an announcement
  export const deleteAnnouncement = async (id: string) => {
    try {
      const docRef = doc(db, 'announcements', id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  };
  
  // Get announcements by society
  export const getAnnouncementsBySociety = async (societyId: string) => {
    try {
      const q = query(
        announcementRef,
        where('societyId', '==', societyId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp).toDate()
      })) as Announcement[];
    } catch (error) {
      console.error('Error getting society announcements:', error);
      throw error;
    }
  };
  
  // Get public announcements
  export const getPublicAnnouncements = async () => {
    try {
      const q = query(
        announcementRef,
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp).toDate()
      })) as Announcement[];
    } catch (error) {
      console.error('Error getting public announcements:', error);
      throw error;
    }
  };
  
  // Get recent announcements
  export const getRecentAnnouncements = async (limitCount: number = 5) => {
    try {
      const q = query(
        announcementRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp).toDate()
      })) as Announcement[];
    } catch (error) {
      console.error('Error getting recent announcements:', error);
      throw error;
    }
  };
  
  // Search announcements
  export const searchAnnouncements = async (searchTerm: string) => {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a simple implementation searching by title
      const q = query(
        announcementRef,
        where('title', '>=', searchTerm),
        where('title', '<=', searchTerm + '\uf8ff'),
        orderBy('title'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp).toDate()
      })) as Announcement[];
    } catch (error) {
      console.error('Error searching announcements:', error);
      throw error;
    }
  };