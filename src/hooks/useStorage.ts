// src/hooks/useStorage.ts
"use client";
import { useState } from 'react';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { storage } from '@/firebase/config';

export function useStorage() {
  const [progress, setProgress] = useState<number>(0);

  const uploadFile = async (file: File, path: string) => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {
        console.error("Error uploading file:", error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        return downloadURL;
      }
    );
  };

  const deleteFile = async (path: string) => {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  };

  return {
    progress,
    uploadFile,
    deleteFile,
  };
}