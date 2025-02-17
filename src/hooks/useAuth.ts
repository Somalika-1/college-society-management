// src/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/config";
import { User } from "@/types";
import { useRouter } from "next/navigation";

interface AuthState {
  user: (User & { firebaseUser: FirebaseUser }) | null;
  loading: boolean;
  error: string | null;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: "admin" | "society_head" | "member";
  societyId?: string;
}

interface UpdateProfileData {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  role?: "admin" | "society_head" | "member";
  societyId?: string;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

          if (userDoc.exists()) {
            const userData = {
              ...userDoc.data() as User,
              firebaseUser,
            };
            setAuthState({
              user: userData,
              loading: false,
              error: null,
            });
          } else {
            setAuthState({ user: null, loading: false, error: "User data not found" });
          }
        } catch (error) {
          setAuthState({ user: null, loading: false, error: "Error fetching user data" });
        }
      } else {
        setAuthState({ user: null, loading: false, error: null });
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true }));
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

      if (!userDoc.exists()) {
        throw new Error("User data not found");
      }

      const userData = {
        ...userDoc.data() as User,
        firebaseUser: userCredential.user,
      };

      setAuthState({
        user: userData,
        loading: false,
        error: null,
      });
      console.log("useAuth: User logged in successfully");
      return userData.role;
    } catch (error: any) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "Invalid login credentials",
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setAuthState({ user: null, loading: false, error: null });
      console.log("useAuth: User logged out successfully");
      router.push("/auth/login"); // Redirect to login page after logout
    } catch (error) {
      setAuthState((prev) => ({ ...prev, error: "Logout failed" }));
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