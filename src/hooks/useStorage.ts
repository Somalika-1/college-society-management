// // src/hooks/useStorage.ts
// "use client"
// import { useState } from 'react';
// import { 
//   ref, 
//   uploadBytesResumable, 
//   getDownloadURL,
//   deleteObject
// } from 'firebase/storage';
// import { storage } from '@/firebase/config';
// // import { useToast } from '@/components/ui/use-toast';

// export function useStorage() {
//   const [progress, setProgress] = useState<number>(0);
// //   const [loading, setLoading]`