// src/hooks/useAuth.ts
import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/config";
import { User } from "@/types";
import { useRouter } from "next/navigation";

interface AuthState {
  user: (User & { firebaseUser: FirebaseUser }) | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  const router = useRouter();

  // Helper function to set cookies
  const setCookie = (name: string, value: string, maxAge = 3600) => {
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge};`;
  };

  // Helper function to clear cookies
  const clearCookie = (name: string) => {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth state changed:", firebaseUser?.email);
      
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          console.log
          if (userDoc.exists()) {
            const userData = {
              ...userDoc.data() as User,
              firebaseUser,
            };

            // Set both cookies when user is authenticated
            setCookie('userRole', userData.role);
            const token = await firebaseUser.getIdToken();
            setCookie('firebaseToken', token);

            setAuthState({
              user: userData,
              loading: false,
              error: null,
            });
          } else {
            console.error("User document not found");
            setAuthState({ user: null, loading: false, error: "User data not found" });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setAuthState({ user: null, loading: false, error: "Error fetching user data" });
        }
      } else {
        // Clear cookies when no user is present
        clearCookie('userRole');
        clearCookie('firebaseToken');
        setAuthState({ user: null, loading: false, error: null });
      }
    });

    return () => unsubscribe();
  }, []);
  const login = async (email: string, password: string) => {
    try {
      console.log("Attempting login for:", email);
      setAuthState((prev) => ({ ...prev, loading: true }));
      
      // Detailed logging for Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Firebase Authentication Successful");
      console.log("User UID:", userCredential.user.uid);
      
      // Detailed logging for Firestore document retrieval
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      console.log("Firestore Document Lookup:");
      console.log("Document Exists:", userDoc.exists());
      console.log("Document Path:", userDocRef.path);
      
      if (!userDoc.exists()) {
        console.error("No user document found for UID:", userCredential.user.uid);
        throw new Error("User data not found in Firestore");
      }
  
      // Log the retrieved user data
      const userData = {
        ...userDoc.data() as User,
        firebaseUser: userCredential.user,
      };
      console.log("Retrieved User Data:", userData);
  
      // Set cookies and update state as before
      setCookie('userRole', userData.role);
      const token = await userCredential.user.getIdToken();
      setCookie('firebaseToken', token);
  
      setAuthState({
        user: userData,
        loading: false,
        error: null,
      });
  
      console.log("Login successful, user role:", userData.role);
      return userData.role;
    } catch (error: any) {
      console.error("Comprehensive Login Error:", error);
      console.error("Error Details:", {
        name: error.name,
        message: error.message,
        code: error.code,
      });
  
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "Invalid login credentials",
      }));
      throw error;
    }
  };// Inside your useAuth.ts, update the logout function:

const logout = async () => {
  try {
    // First update the state and clear cookies
    setAuthState({ user: null, loading: false, error: null });
    clearCookie('userRole');
    clearCookie('firebaseToken');

    // Then sign out from Firebase
    await signOut(auth);
    
    console.log("Logout successful");
    
    // Use window.location for logout redirect to ensure clean state
    window.location.href = "/";
  } catch (error) {
    console.error("Logout error:", error);
    setAuthState((prev) => ({ ...prev, error: "Logout failed" }));
    throw error;
  }
};
  return {
    auth,
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    login,
    logout,
  };
}