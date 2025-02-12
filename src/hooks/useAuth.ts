// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
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
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import { User } from '@/types';
// import { useToast } from '@/components/ui/use-toast';

interface AuthState {
  user: (User & { firebaseUser: FirebaseUser }) | null;
  loading: boolean;
  error: string | null;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'society_head' | 'member';
  societyId?: string;
}

interface UpdateProfileData {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  role?: 'admin' | 'society_head' | 'member';
  societyId?: string;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
//   const { toast } = useToast();

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          console.log("Fetching user data..."); // De
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setAuthState({
              user: {
                ...userDoc.data() as User,
                firebaseUser,
              },
              loading: false,
              error: null,
            });
            return userDoc;
          } else {
            setAuthState({
              user: null,
              loading: false,
              error: 'User data not found',
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setAuthState({
            user: null,
            loading: false,
            error: 'Error fetching user data',
          });
        }
      } else {
        setAuthState({
          user: null,
          loading: false,
          error: null,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      console.log('Starting login attempt for:', email);
      setAuthState(prev => ({ ...prev, loading: true }));
  
      // 1. Firebase Authentication
      console.log('Attempting Firebase authentication...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase Auth successful. User ID:', userCredential.user.uid);
  
      // 2. Fetch Firestore Document
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      console.log('Fetching Firestore document for ID:', userCredential.user.uid);
      
      const userDoc = await getDoc(userDocRef);
      console.log('Firestore document exists?', userDoc.exists());
      if (userDoc.exists()) {
        console.log('Firestore data:', userDoc.data());
        
        const userData = {
          ...userDoc.data() as User,
          firebaseUser: userCredential.user,
        };
  
        // 3. Get ID Token
        const idToken = await userCredential.user.getIdToken();
        console.log('Got ID token');
  
        // 4. Set Cookie
        document.cookie = `firebaseToken=${idToken}; path=/; secure; samesite=strict`;
        console.log('Set auth cookie');
  
        // 5. Update Auth State
        setAuthState({
          user: userData,
          loading: false,
          error: null,
        });
  
        console.log('Login successful, user role:', userData.role);
        return true;
      } else {
        console.error('User document not found in Firestore. Auth UID:', userCredential.user.uid);
        throw new Error('User data not found');
      }
    } catch (error: any) {
      console.error('Login error details:', {
        code: error.code,
        message: error.message,
        fullError: error
      });
  
      let errorMessage = 'Invalid login credentials';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password';
      }
  
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
  
      throw error;
    }
  };
  // Register new user
  const register = async ({ email, password, name, role = 'member', societyId }: RegisterData) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase Auth profile
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      // Create user document in Firestore
      const userData: User = {
        id: userCredential.user.uid,
        email,
        name,
        role,
        societyId: societyId || "defaultSocietyId", // ✅ Prevents undefined error
      };
      console.log("Registering user with:");
      console.log("Email:", email);
      console.log("Name:", name);
      console.log("Role:", role);
      console.log("Society ID:", societyId); // 🔍 Check if undefined
            
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);

      setAuthState({
        user: {
          ...userData,
          firebaseUser: userCredential.user,
        },
        loading: false,
        error: null,
      });

      alert({
        title: 'Success',
        description: 'Account created successfully',
      });
    } catch (error) {
      console.error('Registration error:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Registration failed',
      }));
      alert({
        title: 'Error',
        description: 'Failed to create account',
        variant: 'destructive',
      });
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setAuthState({
        user: null,
        loading: false,
        error: null,
      });
      alert({
        title: 'Success',
        description: 'Logged out successfully',
      });
      document.cookie = 'firebaseToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } catch (error) {
      console.error('Logout error:', error);
      setAuthState(prev => ({
        ...prev,
        error: 'Logout failed',
      }));
      alert({
        title: 'Error',
        description: 'Failed to logout',
        variant: 'destructive',
      });
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      await sendPasswordResetEmail(auth, email);
      setAuthState(prev => ({ ...prev, loading: false }));
      alert({
        title: 'Success',
        description: 'Password reset email sent',
      });
    } catch (error) {
      console.error('Password reset error:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Password reset failed',
      }));
      alert({
        title: 'Error',
        description: 'Failed to send password reset email',
        variant: 'destructive',
      });
    }
  };

  // Update user profile
  const updateUserProfile = async (data: UpdateProfileData) => {
    if (!authState.user?.firebaseUser) {
      throw new Error('No authenticated user');
    }

    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      const updates: Partial<User> = {};
      
      // Update display name if provided
      if (data.name) {
        await updateProfile(authState.user.firebaseUser, {
          displayName: data.name,
        });
        updates.name = data.name;
      }

      // Update email if provided
      if (data.email && data.email !== authState.user.firebaseUser.email) {
        await updateEmail(authState.user.firebaseUser, data.email);
        updates.email = data.email;
      }

      // Update password if provided
      if (data.currentPassword && data.newPassword) {
        await updatePassword(authState.user.firebaseUser, data.newPassword);
      }

      // Update role if provided
      if (data.role) {
        updates.role = data.role;
      }

      // Update societyId if provided
      if (data.societyId !== undefined) {
        updates.societyId = data.societyId;
      }

      // Update Firestore document if there are any updates
      if (Object.keys(updates).length > 0) {
        const userRef = doc(db, 'users', authState.user.firebaseUser.uid);
        await updateDoc(userRef, updates);

        // Update local state
        setAuthState(prev => ({
          ...prev,
          user: prev.user ? {
            ...prev.user,
            ...updates,
          } : null,
          loading: false,
          error: null,
        }));
      }

      alert({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('Profile update error:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Profile update failed',
      }));
      alert({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  return {
    auth,
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    login,
    register,
    logout,
    resetPassword,
    updateProfile: updateUserProfile,
  };
}