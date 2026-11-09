/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  getDocFromServer,
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../services/firebase';
import { UserRole, Department, StudentProfile, AlumniProfile } from '../types';

export interface UserProfileData {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  baustId?: string;
  department: Department;
  batch: string;
  avatar: string;
  phone?: string;
  bio?: string;
  isVerified?: boolean;
  accountStatus?: 'pending' | 'approved' | 'rejected';
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  documentType?: string;
  documentPreviewUrl?: string;
  createdAt: any;
  updatedAt?: any;

  // Student specific
  studentId?: string;
  currentSemester?: string;
  cgpa?: number;
  careerGoal?: string;
  interests?: string[];
  cvFileName?: string;

  // Alumni specific
  designation?: string;
  company?: string;
  sector?: string;
  location?: string;
  passingYear?: number;
  skills?: string[];
  mentoringAvailable?: boolean;
}

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: UserProfileData | null;
  loading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string; role?: UserRole; profile?: UserProfileData }>;
  register: (params: {
    email: string;
    password: string;
    name: string;
    role: 'student' | 'alumni';
    baustId: string;
    department: Department;
    batch: string;
    passingYear?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfileData>) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Firestore Profile (fresh from server)
  const fetchUserProfile = async (uid: string, fallbackEmail?: string): Promise<UserProfileData | null> => {
    const userDocRef = doc(db, 'users', uid);
    try {
      let snap;
      try {
        // Force fresh read from Cloud Firestore server to avoid stale local cache
        snap = await getDocFromServer(userDocRef);
      } catch (e) {
        // Fallback to getDoc if offline or network hiccup
        snap = await getDoc(userDocRef);
      }

      if (snap && snap.exists()) {
        return snap.data() as UserProfileData;
      }

      // Check if user is known admin
      const email = fallbackEmail || auth.currentUser?.email || '';
      const isAdminEmail = email === 'registrar@baust.edu.bd' || email === 'atiaibnatpapri@gmail.com';
      
      if (isAdminEmail) {
        const adminProfile: UserProfileData = {
          id: uid,
          email,
          name: 'Prof. Dr. Registrar Office',
          role: 'admin',
          baustId: 'ADM-001',
          department: 'Administration' as any,
          batch: 'Registrar & Student Affairs',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          isVerified: true,
          accountStatus: 'approved',
          verificationStatus: 'approved',
          approvedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, adminProfile, { merge: true });
        try {
          await setDoc(doc(db, 'admins', uid), {
            id: uid,
            email,
            role: 'admin',
            authorizedAt: new Date().toISOString(),
          }, { merge: true });
        } catch (e) {
          console.warn('Admins collection entry skipped', e);
        }
        return adminProfile;
      }

      return null;
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const profile = await fetchUserProfile(user.uid, user.email || undefined);
        // Ensure unapproved users cannot persist session on page refresh
        if (profile && profile.role !== 'admin') {
          const accStatus = (profile.accountStatus || 'pending').toLowerCase().trim();
          if (accStatus !== 'approved') {
            await signOut(auth);
            setUserProfile(null);
            setFirebaseUser(null);
            setLoading(false);
            return;
          }
        }
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string; role?: UserRole; profile?: UserProfileData }> => {
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const profile = await fetchUserProfile(cred.user.uid, cred.user.email || undefined);

      if (!profile) {
        await signOut(auth);
        const msg = 'User profile not found in university records. Please register first.';
        setError(msg);
        return { success: false, error: msg };
      }

      // Check account approval status for non-admin users
      if (profile.role !== 'admin') {
        const accStatus = (profile.accountStatus || 'pending').toLowerCase().trim();
        
        if (accStatus === 'rejected') {
          await signOut(auth);
          const reason = profile.rejectionReason ? ` Reason: ${profile.rejectionReason}` : '';
          const msg = `Your registration was rejected by the Registrar Office.${reason}`;
          setError(msg);
          return { success: false, error: msg };
        }

        // Only accountStatus: "approved" is allowed entry
        if (accStatus !== 'approved') {
          await signOut(auth);
          const msg = 'Your registration is waiting for Admin approval. The BAUST Registrar and Student Affairs Office will review your verification documents.';
          setError(msg);
          return { success: false, error: msg };
        }
      }

      setUserProfile(profile);
      return { success: true, role: profile.role, profile };
    } catch (err: any) {
      let msg = 'Failed to sign in. Please verify your email and password.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email address or password.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'The email address format is invalid.';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = 'Email/Password sign-in provider is disabled in Firebase project "metal-zepplin-b5v9p". Please enable it in Firebase Console under Authentication > Sign-in method.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many failed login attempts. Please try again later.';
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const register = async (params: {
    email: string;
    password: string;
    name: string;
    role: 'student' | 'alumni';
    baustId: string;
    department: Department;
    batch: string;
    passingYear?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    // Security check: Normal users can only register as student or alumni
    if (params.role !== 'student' && params.role !== 'alumni') {
      return { success: false, error: 'Unauthorized role selected.' };
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, params.email.trim(), params.password);
      
      // Update Firebase Auth displayName
      await updateFirebaseProfile(cred.user, {
        displayName: params.name,
      });

      const defaultAvatar = params.role === 'student'
        ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';

      const now = new Date().toISOString();
      const newProfile: UserProfileData = {
        id: cred.user.uid,
        email: cred.user.email || params.email.trim(),
        name: params.name.trim(),
        role: params.role,
        baustId: params.baustId.trim(),
        department: params.department,
        batch: params.batch.trim() || '19th Batch',
        avatar: defaultAvatar,
        isVerified: false, // Must be verified by Admin
        accountStatus: 'pending',
        verificationStatus: 'pending',
        createdAt: now,
        updatedAt: now,
      };

      if (params.role === 'student') {
        newProfile.studentId = params.baustId.trim();
        newProfile.currentSemester = 'Level-3, Term-II';
        newProfile.cgpa = 3.50;
        newProfile.careerGoal = 'Seeking guidance in Software Engineering and Career Planning';
        newProfile.interests = ['Problem Solving', 'Web Development', 'Higher Studies'];
      } else {
        newProfile.designation = 'Professional / Researcher';
        newProfile.company = 'BAUST Alumni Network';
        newProfile.sector = 'Private';
        newProfile.location = 'Dhaka, Bangladesh';
        newProfile.passingYear = parseInt(params.passingYear || '2024', 10);
        newProfile.skills = ['Leadership', 'Project Management', 'Engineering'];
        newProfile.mentoringAvailable = true;
      }

      // Write to Firestore /users/{uid}
      const userDocRef = doc(db, 'users', cred.user.uid);
      await setDoc(userDocRef, newProfile);

      // Create Verification queue entry in /verifications/{id} for Admin review
      const verificationRef = doc(db, 'verifications', `ver-${cred.user.uid}`);
      await setDoc(verificationRef, {
        id: `ver-${cred.user.uid}`,
        userId: cred.user.uid,
        name: params.name.trim(),
        email: params.email.trim(),
        role: params.role,
        baustId: params.baustId.trim(),
        department: params.department,
        batch: params.batch.trim(),
        passingYear: params.passingYear ? parseInt(params.passingYear, 10) : undefined,
        submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        documentType: `${params.role === 'student' ? 'Student ID Card' : 'Degree Certificate'} Verification`,
        documentPreviewUrl: 'https://images.unsplash.com/photo-1589330694653-dad6d3240a2b?w=600&auto=format&fit=crop&q=80',
        status: 'Pending',
        accountStatus: 'pending',
      });

      // Crucial: Sign out pending applicant so unverified sessions cannot access protected pages
      await signOut(auth);

      setUserProfile(null);
      return { success: true };
    } catch (err: any) {
      let msg = 'Registration failed. Please check your details.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email address already exists. Please sign in.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters long.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please provide a valid email address.';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = 'Email/Password sign-in provider is disabled in Firebase project "metal-zepplin-b5v9p". Please enable it in Firebase Console under Authentication > Sign-in method.';
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setFirebaseUser(null);
      setUserProfile(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const updateUserProfile = async (data: Partial<UserProfileData>): Promise<{ success: boolean; error?: string }> => {
    if (!firebaseUser || !userProfile) {
      return { success: false, error: 'User not logged in' };
    }

    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const updated = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      await updateDoc(userDocRef, updated);
      setUserProfile((prev) => (prev ? { ...prev, ...updated } : null));
      return { success: true };
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}`);
      return { success: false, error: err.message };
    }
  };

  const refreshProfile = async (): Promise<void> => {
    if (firebaseUser) {
      const p = await fetchUserProfile(firebaseUser.uid);
      setUserProfile(p);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        userProfile,
        loading,
        error,
        login,
        register,
        logout,
        updateUserProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
