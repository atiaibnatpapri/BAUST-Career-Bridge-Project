/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  getDocFromServer,
  updateDoc,
  onSnapshot,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { UserRole, Department, MentorshipTopic, AlumniProfile } from '../types';
import { toList } from '../utils/utils';
import {
  ENABLE_DEMO_LOGIN,
  DEMO_PASSWORD,
  getDemoAccountByRole,
  getDemoAccountByEmail,
  isDemoAccountEmail,
} from '../config/demoConfig';
import { ensureDemoProfileAndSampleData } from '../services/demoProvisioning';
import {
  deriveAcademicStanding,
  normalizeDepartment,
  EMAIL_PATTERN,
} from '../constants/baustDataModel';
import { triggerNotification } from '../services/careerBridgeService';

export interface UserProfileData {
  id: string;
  uid?: string;
  email: string;
  name: string;
  role: UserRole;
  baustId?: string;
  department: Department;
  batch: string;
  avatar: string;
  photoURL?: string;
  phone?: string;
  bio?: string;
  office?: string;
  employeeId?: string;
  isVerified?: boolean;
  verifiedAlumniBadge?: boolean;
  isFeatured?: boolean;
  hidePhone?: boolean;
  hideEmail?: boolean;
  profileVisibility?: 'public' | 'students_only' | 'private';
  privacy?: {
    cgpa?: 'public' | 'students_only' | 'connections_only' | 'hidden';
    email?: 'public' | 'students_only' | 'connections_only' | 'hidden';
    phone?: 'public' | 'students_only' | 'connections_only' | 'hidden';
    location?: 'public' | 'students_only' | 'connections_only' | 'hidden';
  };
  allowAlumniMessages?: boolean;
  notifyOnMentorship?: boolean;
  savedAlumniIds?: string[];
  savedMentorIds?: string[];
  isDemo?: boolean;
  suspended?: boolean;
  accountStatus?: 'pending' | 'approved' | 'rejected';
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  approvedAt?: any;
  rejectedAt?: any;
  rejectionReason?: string;
  documentType?: string;
  documentFileName?: string;
  documentPreviewUrl?: string;
  verificationProofUrl?: string;
  createdAt: any;
  updatedAt?: any;

  // Student specific
  studentId?: string;
  currentSemester?: string;
  cgpa?: number;
  careerGoal?: string;
  interests?: string[];
  cvFileName?: string;
  cvUrl?: string;
  cvFileDocId?: string;
  cvName?: string;
  cvUpdatedAt?: string;

  // Alumni / Admin specific
  headline?: string;
  designation?: string;
  company?: string;
  sector?: string;
  location?: string;
  passingYear?: number;
  linkedin?: string;
  github?: string;
  skills?: string[];
  mentoringAvailable?: boolean;
  mentorshipTopics?: MentorshipTopic[];
  availableSlots?: string[];
  experienceTimeline?: AlumniProfile['experienceTimeline'];
  education?: AlumniProfile['education'];
  achievements?: string[];
  totalMentees?: number;
  rating?: number;
}

export interface LoginResult {
  success: boolean;
  error?: string;
  blockedByRealSession?: boolean;
  role?: UserRole;
  status?: 'approved' | 'pending' | 'rejected' | 'suspended';
  rejectionReason?: string;
  profile?: UserProfileData;
}

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: UserProfileData | null;
  loading: boolean;
  isSwitchingDemo: boolean;
  error: string | null;
  login: (identifier: string, pass: string, rememberMe?: boolean) => Promise<LoginResult>;
  demoLogin: (role: UserRole) => Promise<LoginResult>;
  switchDemoAccount: (targetEmail: string) => Promise<LoginResult>;
  register: (params: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: 'student' | 'alumni' | 'admin';
    baustId: string;
    department: Department;
    batch: string;
    passingYear?: string;
    designation?: string;
    company?: string;
    office?: string;
    linkedin?: string;
    verificationProofUrl?: string;
    documentFileName?: string;
  }) => Promise<{ success: boolean; error?: string; code?: string; uid?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: (onAfterLogout?: () => void) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfileData>) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
  registerSessionCleanup: (fn: () => void) => () => void;
}

const DEFAULT_STUDENT_AVATAR =
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80';
const DEFAULT_ALUMNI_AVATAR =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
const DEFAULT_ADMIN_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
const DEFAULT_SUPERADMIN_AVATAR =
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80';

const ALLOWED_ROLES: UserRole[] = ['student', 'alumni', 'admin', 'superAdmin'];
const LOGOUT_CHANNEL_NAME = 'baust_career_bridge_session';
const LOGOUT_STORAGE_KEY = 'baust_session_logout_signal';

function normalizeRole(rawRole: unknown): UserRole {
  if (typeof rawRole === 'string' && (ALLOWED_ROLES as string[]).includes(rawRole)) {
    return rawRole as UserRole;
  }
  return 'student';
}

export function normalizeProfile(
  uid: string,
  raw: Record<string, any> = {},
  fallbackEmail?: string
): UserProfileData {
  const email =
    typeof raw?.email === 'string'
      ? raw.email
      : typeof fallbackEmail === 'string'
      ? fallbackEmail
      : '';
  const role = normalizeRole(raw?.role);

  const rawStatus = String(
    raw?.verificationStatus ?? raw?.accountStatus ?? (raw?.isVerified ? 'approved' : 'pending')
  )
    .toLowerCase()
    .trim();

  const verificationStatus: 'pending' | 'approved' | 'rejected' =
    rawStatus === 'approved' ? 'approved' : rawStatus === 'rejected' ? 'rejected' : 'pending';

  const fallbackName = email ? email.split('@')[0] || 'BAUST Member' : 'BAUST Member';
  const safeName = typeof raw?.name === 'string' && raw.name.trim() ? raw.name.trim() : fallbackName;

  const defaultAvatar =
    role === 'superAdmin'
      ? DEFAULT_SUPERADMIN_AVATAR
      : role === 'admin'
      ? DEFAULT_ADMIN_AVATAR
      : role === 'alumni'
      ? DEFAULT_ALUMNI_AVATAR
      : DEFAULT_STUDENT_AVATAR;

  const normalizedBatch = raw?.batch ?? '';
  const numericPassing = typeof raw?.passingYear === 'number' ? raw.passingYear : undefined;
  const computedStanding = deriveAcademicStanding(normalizedBatch, numericPassing);

  return {
    id: raw?.id ?? uid,
    uid,
    email,
    name: safeName,
    role,
    baustId: raw?.baustId ?? raw?.studentId ?? raw?.employeeId ?? '',
    department: normalizeDepartment(raw?.department),
    batch: normalizedBatch,
    avatar: raw?.photoURL || raw?.avatar || defaultAvatar,
    photoURL: raw?.photoURL || raw?.avatar || defaultAvatar,
    phone: raw?.phone ?? '',
    bio: raw?.bio ?? '',
    office: raw?.office ?? '',
    employeeId: raw?.employeeId ?? '',
    isVerified: Boolean(raw?.isVerified ?? verificationStatus === 'approved'),
    verifiedAlumniBadge: Boolean(raw?.verifiedAlumniBadge),
    isFeatured: Boolean(raw?.isFeatured),
    hidePhone: Boolean(raw?.hidePhone),
    hideEmail: Boolean(raw?.hideEmail),
    profileVisibility: raw?.profileVisibility === 'private' ? 'private' : 'public',
    privacy: raw?.privacy && typeof raw.privacy === 'object' ? raw.privacy : undefined,
    allowAlumniMessages: raw?.allowAlumniMessages !== false,
    notifyOnMentorship: raw?.notifyOnMentorship !== false,
    savedAlumniIds: toList(raw?.savedAlumniIds),
    savedMentorIds: toList(raw?.savedMentorIds),
    isDemo: Boolean(raw?.isDemo),
    suspended: Boolean(raw?.suspended),
    verificationStatus,
    accountStatus: verificationStatus,
    approvedAt: raw?.approvedAt ?? null,
    rejectedAt: raw?.rejectedAt ?? null,
    rejectionReason: raw?.rejectionReason ?? '',
    documentType: raw?.documentType ?? '',
    documentFileName: raw?.documentFileName ?? '',
    documentPreviewUrl: raw?.documentPreviewUrl ?? '',
    verificationProofUrl: raw?.verificationProofUrl ?? '',
    createdAt: raw?.createdAt ?? '',
    updatedAt: raw?.updatedAt ?? '',
    studentId: raw?.studentId ?? raw?.baustId ?? '',
    currentSemester:
      role === 'student'
        ? computedStanding.levelTerm || raw?.currentSemester || 'Level-1, Term-I'
        : raw?.currentSemester ?? '',
    cgpa: typeof raw?.cgpa === 'number' ? raw.cgpa : 0,
    careerGoal: raw?.careerGoal ?? '',
    interests: toList(raw?.interests),
    cvFileName: raw?.cvFileName ?? '',
    cvUrl: raw?.cvUrl ?? '',
    cvFileDocId: raw?.cvFileDocId ?? '',
    cvName: raw?.cvName ?? raw?.cvFileName ?? '',
    cvUpdatedAt: raw?.cvUpdatedAt ?? '',
    headline: raw?.headline ?? '',
    designation: raw?.designation ?? '',
    company: raw?.company ?? '',
    sector: raw?.sector ?? 'Private',
    location: raw?.location ?? '',
    passingYear: typeof raw?.passingYear === 'number' ? raw.passingYear : 2024,
    linkedin: raw?.linkedin ?? '',
    github: raw?.github ?? '',
    skills: toList(raw?.skills),
    mentoringAvailable: Boolean(raw?.mentoringAvailable),
    mentorshipTopics: toList(raw?.mentorshipTopics) as MentorshipTopic[],
    availableSlots: toList(raw?.availableSlots),
    experienceTimeline: Array.isArray(raw?.experienceTimeline) ? raw.experienceTimeline : [],
    education: Array.isArray(raw?.education) ? raw.education : [],
    achievements: toList(raw?.achievements),
    totalMentees: typeof raw?.totalMentees === 'number' ? raw.totalMentees : 0,
    rating: typeof raw?.rating === 'number' ? raw.rating : 0,
  };
}

function mapFirebaseAuthError(code?: string): string {
  switch (code) {
    case 'auth/wrong-password':
      return 'Incorrect credentials. Please check your Email / BAUST ID and password and try again.';
    case 'auth/user-not-found':
      return 'Incorrect credentials. If you do not have an account, please register first.';
    case 'auth/invalid-credential':
      return 'Invalid Email / BAUST ID or password. Please verify your credentials and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact the BAUST Super Admin directorate.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address or BAUST ID.';
    case 'auth/too-many-requests':
      return 'Too many sign-in attempts detected. Please wait a few minutes or reset your password.';
    case 'auth/network-request-failed':
      return 'Network error while connecting to authentication servers. Please check your connection.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password does not meet security requirements. Use at least 8 characters with uppercase, lowercase, and numbers.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is currently disabled in Firebase Authentication settings.';
    case 'permission-denied':
      return 'Your account could not be registered due to security rules. Please contact the BAUST Super Admin.';
    default:
      return 'Unable to complete your request right now. Please verify your details and try again.';
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSwitchingDemo, setIsSwitchingDemo] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isRegisteringRef = useRef<boolean>(false);
  const isSwitchingDemoRef = useRef<boolean>(false);
  const isProvisioningDemoRef = useRef<boolean>(false);
  const demoLoginInFlightRef = useRef<Promise<LoginResult> | null>(null);
  const profileUnsubRef = useRef<(() => void) | null>(null);
  const cleanupCallbacksRef = useRef<Set<() => void>>(new Set());

  const registerSessionCleanup = useCallback((fn: () => void) => {
    cleanupCallbacksRef.current.add(fn);
    return () => {
      cleanupCallbacksRef.current.delete(fn);
    };
  }, []);

  const clearClientCachesAndStorage = useCallback(() => {
    cleanupCallbacksRef.current.forEach((cb) => {
      try {
        cb();
      } catch {
        // ignore cleanup errors
      }
    });
    try {
      const lang = localStorage.getItem('baust_lang');
      localStorage.clear();
      sessionStorage.clear();
      if (lang === 'en' || lang === 'bn') {
        localStorage.setItem('baust_lang', lang);
      }
    } catch {
      // ignore storage quota/privacy errors
    }
  }, []);

  const fetchUserProfileOnce = useCallback(async (user: FirebaseUser): Promise<UserProfileData | null> => {
    const userDocRef = doc(db, 'users', user.uid);
    try {
      let snap;
      try {
        snap = await getDocFromServer(userDocRef);
      } catch {
        snap = await getDoc(userDocRef);
      }
      if (snap && snap.exists()) {
        return normalizeProfile(user.uid, snap.data(), user.email || undefined);
      }
      return null;
    } catch (err) {
      console.error('Failed to read user profile from Firestore:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (isRegisteringRef.current || isSwitchingDemoRef.current || isProvisioningDemoRef.current) {
        return;
      }

      if (profileUnsubRef.current) {
        profileUnsubRef.current();
        profileUnsubRef.current = null;
      }

      setFirebaseUser(user);

      if (!user) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      const userDocRef = doc(db, 'users', user.uid);

      profileUnsubRef.current = onSnapshot(
        userDocRef,
        (docSnap) => {
          if (isRegisteringRef.current || isSwitchingDemoRef.current || isProvisioningDemoRef.current) {
            return;
          }

          if (docSnap.exists()) {
            const normalized = normalizeProfile(user.uid, docSnap.data(), user.email || undefined);
            if ((normalized.isDemo || isDemoAccountEmail(normalized.email)) && !ENABLE_DEMO_LOGIN) {
              void signOut(auth);
              setFirebaseUser(null);
              setUserProfile(null);
              setLoading(false);
              return;
            }
            setUserProfile(normalized);
          } else {
            setUserProfile(null);
          }
          setLoading(false);
        },
        (snapshotError) => {
          console.error('Live user profile listener error:', snapshotError);
          setLoading(false);
        }
      );
    });

    return () => {
      if (profileUnsubRef.current) {
        profileUnsubRef.current();
        profileUnsubRef.current = null;
      }
      authUnsubscribe();
    };
  }, []);

  // Cross-tab logout synchronization (BroadcastChannel + storage event fallback)
  useEffect(() => {
    const handleRemoteLogout = async () => {
      if (profileUnsubRef.current) {
        profileUnsubRef.current();
        profileUnsubRef.current = null;
      }
      clearClientCachesAndStorage();
      await signOut(auth).catch(() => {});
      setFirebaseUser(null);
      setUserProfile(null);
      setError(null);
      setLoading(false);
      if (window.location.hash !== '#/login') {
        window.location.hash = '#/login';
      }
    };

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        channel = new BroadcastChannel(LOGOUT_CHANNEL_NAME);
        channel.onmessage = (event) => {
          if (event?.data?.type === 'LOGOUT') {
            void handleRemoteLogout();
          }
        };
      } catch {
        channel = null;
      }
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === LOGOUT_STORAGE_KEY && e.newValue) {
        void handleRemoteLogout();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      channel?.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, [clearClientCachesAndStorage]);

  /**
   * Supports signing in with EITHER Email OR BAUST ID (#52).
   * If identifier is not an email, resolves email via `idIndex/{baustId}` first,
   * never leaking whether a specific ID exists if resolution fails.
   */
  const login = async (identifier: string, pass: string, rememberMe = true): Promise<LoginResult> => {
    setError(null);
    const cleanInput = (identifier ?? '').trim();

    if (!cleanInput || !pass) {
      const msg = 'Please enter your Email or BAUST ID and password.';
      setError(msg);
      return { success: false, error: msg };
    }

    let resolvedEmail = cleanInput;
    if (!EMAIL_PATTERN.test(cleanInput)) {
      if (!/^[A-Za-z0-9\-_]{3,40}$/.test(cleanInput)) {
        const msg = 'Invalid Email / BAUST ID or password. Please verify your credentials and try again.';
        setError(msg);
        return { success: false, error: msg };
      }
      try {
        const indexSnap = await getDoc(doc(db, 'idIndex', cleanInput));
        if (!indexSnap.exists() || !indexSnap.data()?.email) {
          const msg = 'Invalid Email / BAUST ID or password. Please verify your credentials and try again.';
          setError(msg);
          return { success: false, error: msg };
        }
        resolvedEmail = String(indexSnap.data().email).trim();
      } catch {
        const msg = 'Invalid Email / BAUST ID or password. Please verify your credentials and try again.';
        setError(msg);
        return { success: false, error: msg };
      }
    }

    if (!ENABLE_DEMO_LOGIN && isDemoAccountEmail(resolvedEmail)) {
      const disabledMsg = 'Demo login is currently disabled by system configuration.';
      setError(disabledMsg);
      return { success: false, error: disabledMsg };
    }

    try {
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      ).catch(() => {});

      const cred = await signInWithEmailAndPassword(auth, resolvedEmail, pass);
      const profile = await fetchUserProfileOnce(cred.user);

      if (!profile) {
        await signOut(auth);
        setFirebaseUser(null);
        setUserProfile(null);
        const msg =
          'No BAUST user record was found for this account. Please register or contact the Super Admin.';
        setError(msg);
        return { success: false, error: msg };
      }

      if ((profile.isDemo || isDemoAccountEmail(profile.email)) && !ENABLE_DEMO_LOGIN) {
        await signOut(auth);
        setFirebaseUser(null);
        setUserProfile(null);
        const disabledMsg = 'Demo accounts are currently disabled.';
        setError(disabledMsg);
        return { success: false, error: disabledMsg };
      }

      if (profile.suspended) {
        await signOut(auth);
        setFirebaseUser(null);
        setUserProfile(null);
        const msg =
          'Your account has been suspended by the Super Admin. Please contact university governance.';
        setError(msg);
        return { success: false, status: 'suspended', error: msg, profile };
      }

      if (profile.verificationStatus === 'pending') {
        await signOut(auth).catch(() => {});
        setFirebaseUser(null);
        setUserProfile(null);
        return {
          success: true,
          status: 'pending',
          role: profile.role,
          profile,
        };
      }

      if (profile.verificationStatus === 'rejected') {
        await signOut(auth).catch(() => {});
        setFirebaseUser(null);
        setUserProfile(null);
        return {
          success: true,
          status: 'rejected',
          role: profile.role,
          rejectionReason: profile.rejectionReason,
          profile,
        };
      }

      setUserProfile(profile);
      return {
        success: true,
        status: 'approved',
        role: profile.role,
        profile,
      };
    } catch (err: any) {
      const msg = mapFirebaseAuthError(err?.code);
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const demoLogin = (role: UserRole): Promise<LoginResult> => {
    if (!ENABLE_DEMO_LOGIN) {
      return Promise.resolve({ success: false, error: 'Demo login is currently disabled.' });
    }

    if (demoLoginInFlightRef.current) {
      return demoLoginInFlightRef.current;
    }

    const task = (async (): Promise<LoginResult> => {
      const spec = getDemoAccountByRole(role);
      if (!spec) {
        return { success: false, error: 'Requested demo role is not configured in demoConfig.ts.' };
      }

      const activeAuthUser = auth.currentUser;
      const isCurrentDemo =
        Boolean(userProfile?.isDemo) || isDemoAccountEmail(activeAuthUser?.email);
      if (activeAuthUser && !isCurrentDemo) {
        const msg = 'You are already signed in. Please log out first.';
        return { success: false, blockedByRealSession: true, error: msg };
      }

      const wasDemoSignedIn = Boolean(activeAuthUser && isCurrentDemo);
      isProvisioningDemoRef.current = true;
      if (wasDemoSignedIn) {
        isSwitchingDemoRef.current = true;
        setIsSwitchingDemo(true);
      }
      setError(null);

      try {
        if (wasDemoSignedIn) {
          if (profileUnsubRef.current) {
            profileUnsubRef.current();
            profileUnsubRef.current = null;
          }
          clearClientCachesAndStorage();
          await signOut(auth);
        }

        await setPersistence(auth, browserSessionPersistence).catch(() => {});

        let signedInUser: FirebaseUser | null = null;
        try {
          const cred = await signInWithEmailAndPassword(auth, spec.email, DEMO_PASSWORD);
          signedInUser = cred.user;
        } catch (signInErr: any) {
          const code = signInErr?.code;
          if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
            try {
              const created = await createUserWithEmailAndPassword(auth, spec.email, DEMO_PASSWORD);
              signedInUser = created.user;
              await updateFirebaseProfile(created.user, { displayName: spec.name }).catch(() => {});
            } catch (createErr: any) {
              if (createErr?.code === 'auth/email-already-in-use') {
                const misconfiguredMsg = 'Demo account is misconfigured. Check demoConfig.ts';
                setError(misconfiguredMsg);
                return { success: false, error: misconfiguredMsg };
              }
              const createMsg = mapFirebaseAuthError(createErr?.code);
              setError(createMsg);
              return { success: false, error: createMsg };
            }
          } else {
            const signInMsg = mapFirebaseAuthError(code);
            setError(signInMsg);
            return { success: false, error: signInMsg };
          }
        }

        if (!signedInUser) {
          return { success: false, error: 'Unable to establish demo authentication session.' };
        }

        await ensureDemoProfileAndSampleData(signedInUser.uid, spec);
        const profile = await fetchUserProfileOnce(signedInUser);

        if (!profile) {
          await signOut(auth).catch(() => {});
          const missingMsg = 'Could not load demo profile from Firestore after provisioning.';
          setError(missingMsg);
          return { success: false, error: missingMsg };
        }

        setFirebaseUser(signedInUser);
        setUserProfile(profile);
        setLoading(false);

        const userDocRef = doc(db, 'users', signedInUser.uid);
        profileUnsubRef.current = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (isSwitchingDemoRef.current || isRegisteringRef.current || isProvisioningDemoRef.current) {
              return;
            }
            if (docSnap.exists()) {
              const normalized = normalizeProfile(
                signedInUser!.uid,
                docSnap.data(),
                signedInUser!.email || undefined
              );
              if (!ENABLE_DEMO_LOGIN) {
                void signOut(auth);
                setFirebaseUser(null);
                setUserProfile(null);
                return;
              }
              setUserProfile(normalized);
            }
          },
          (snapshotError) => {
            console.error('Demo profile listener warning:', snapshotError);
          }
        );

        return {
          success: true,
          status: 'approved',
          role: profile.role,
          profile,
        };
      } catch (err: any) {
        console.error('Demo login provisioning failure:', err);
        const msg = err?.message || 'Unable to launch demo workspace.';
        setError(msg);
        return { success: false, error: msg };
      } finally {
        isProvisioningDemoRef.current = false;
        isSwitchingDemoRef.current = false;
        setIsSwitchingDemo(false);
        demoLoginInFlightRef.current = null;
      }
    })();

    demoLoginInFlightRef.current = task;
    return task;
  };

  const switchDemoAccount = async (targetEmail: string): Promise<LoginResult> => {
    const spec = getDemoAccountByEmail(targetEmail);
    if (!spec) {
      return { success: false, error: 'Requested account is not a configured demo account.' };
    }
    return demoLogin(spec.role);
  };

  const register = async (params: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: 'student' | 'alumni' | 'admin';
    baustId: string;
    department: Department;
    batch: string;
    passingYear?: string;
    designation?: string;
    company?: string;
    office?: string;
    linkedin?: string;
    verificationProofUrl?: string;
    documentFileName?: string;
  }): Promise<{ success: boolean; error?: string; code?: string; uid?: string }> => {
    setError(null);

    if (params.role !== 'student' && params.role !== 'alumni' && params.role !== 'admin') {
      return { success: false, error: 'Selected role cannot be created via public registration.' };
    }

    const safeEmail = (params.email ?? '').trim();
    const safeName = (params.name ?? '').trim();
    const safePhone = (params.phone ?? '').trim();
    const safeBaustId = (params.baustId ?? '').trim();
    const safeBatch = (params.batch ?? '').trim();
    const safePassingYear = params.passingYear ? parseInt(params.passingYear, 10) || 2024 : 2024;
    const safeDesignation = (params.designation ?? '').trim();
    const safeCompany = (params.company ?? '').trim();
    const safeOffice = (params.office ?? '').trim();
    const safeLinkedin = (params.linkedin ?? '').trim();
    const safeProofUrl = (params.verificationProofUrl ?? '').trim();

    // Check duplicate BAUST ID / Employee ID before creating Auth account (#32)
    if (safeBaustId && /^[a-zA-Z0-9_\-]+$/.test(safeBaustId)) {
      try {
        const idCheckSnap = await getDoc(doc(db, 'idIndex', safeBaustId));
        if (idCheckSnap.exists()) {
          const msg = 'This BAUST ID / Employee ID is already registered in the system.';
          setError(msg);
          return { success: false, error: msg, code: 'baust/id-already-in-use' };
        }
      } catch {
        // Proceed cleanly if index is unreadable pre-auth
      }
    }

    isRegisteringRef.current = true;
    try {
      const cred = await createUserWithEmailAndPassword(auth, safeEmail, params.password);
      const uid = cred.user.uid;

      const defaultAvatar =
        params.role === 'admin'
          ? DEFAULT_ADMIN_AVATAR
          : params.role === 'alumni'
          ? DEFAULT_ALUMNI_AVATAR
          : DEFAULT_STUDENT_AVATAR;

      const docType =
        params.role === 'admin'
          ? 'BAUST Staff / Office Authorization ID'
          : params.role === 'alumni'
          ? 'Degree Certificate / Alumni Proof'
          : 'Student ID Card Verification';

      const standing = deriveAcademicStanding(safeBatch, safePassingYear);

      const userPayload: Record<string, any> = {
        id: uid,
        uid,
        name: safeName,
        email: cred.user.email || safeEmail,
        role: params.role,
        baustId: safeBaustId,
        department: normalizeDepartment(params.department),
        batch: safeBatch,
        passingYear: safePassingYear,
        avatar: defaultAvatar,
        photoURL: defaultAvatar,
        phone: safePhone,
        bio: '',
        office: safeOffice,
        employeeId: params.role === 'admin' ? safeBaustId : '',
        isVerified: false,
        verifiedAlumniBadge: false,
        isFeatured: false,
        hidePhone: false,
        hideEmail: false,
        profileVisibility: 'public',
        savedAlumniIds: [],
        savedMentorIds: [],
        isDemo: false,
        suspended: false,
        verificationStatus: 'pending',
        accountStatus: 'pending',
        rejectionReason: '',
        documentType: docType,
        documentFileName: params.documentFileName || '',
        documentPreviewUrl: safeProofUrl || '',
        verificationProofUrl: safeProofUrl || '',
        studentId: params.role === 'student' ? safeBaustId : '',
        currentSemester: params.role === 'student' ? standing.levelTerm : '',
        cgpa: 0,
        careerGoal: '',
        interests: [],
        cvFileName: '',
        cvUrl: '',
        cvFileDocId: '',
        cvName: '',
        cvUpdatedAt: '',
        headline: '',
        designation: safeDesignation,
        company: params.role === 'admin' ? 'BAUST Administration' : safeCompany,
        sector: params.role === 'admin' ? 'Government' : 'Private',
        location: '',
        linkedin: safeLinkedin,
        github: '',
        skills: [],
        mentoringAvailable: false,
        mentorshipTopics: [],
        availableSlots: [],
        experienceTimeline: [],
        education: [],
        achievements: [],
        totalMentees: 0,
        rating: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const verificationPayload = {
        id: uid,
        userId: uid,
        name: safeName,
        email: cred.user.email || safeEmail,
        phone: safePhone,
        role: params.role,
        baustId: safeBaustId,
        department: normalizeDepartment(params.department),
        batch: safeBatch,
        passingYear: safePassingYear,
        office: safeOffice,
        company: params.role === 'admin' ? 'BAUST Administration' : safeCompany,
        designation: safeDesignation,
        linkedin: safeLinkedin,
        verificationProofUrl: safeProofUrl,
        isDemo: false,
        details: {
          baustId: safeBaustId,
          phone: safePhone,
          department: normalizeDepartment(params.department),
          batch: safeBatch,
          passingYear: safePassingYear,
          office: safeOffice,
          company: params.role === 'admin' ? 'BAUST Administration' : safeCompany,
          designation: safeDesignation,
          linkedin: safeLinkedin,
          verificationProofUrl: safeProofUrl,
          documentFileName: params.documentFileName || '',
        },
        documentType: docType,
        documentFileName: params.documentFileName || '',
        documentPreviewUrl: safeProofUrl,
        status: 'pending',
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const batch = writeBatch(db);
      batch.set(doc(db, 'users', uid), userPayload);
      batch.set(doc(db, 'verificationRequests', uid), verificationPayload);
      if (safeBaustId && /^[a-zA-Z0-9_\-]+$/.test(safeBaustId)) {
        batch.set(doc(db, 'idIndex', safeBaustId), {
          uid,
          email: cred.user.email || safeEmail,
          role: params.role,
          isDemo: false,
          createdAt: serverTimestamp(),
        });
      }

      await updateFirebaseProfile(cred.user, { displayName: safeName }).catch(() => {});
      await batch.commit();

      // Notify Super Admin governance queue (#45)
      await triggerNotification({
        recipientId: 'ALL_SUPERADMINS',
        title: 'New Registration Pending Verification',
        message: `${safeName} (${params.role.toUpperCase()} · ${normalizeDepartment(params.department)}) submitted verification details.`,
        type: 'verification',
        link: '/superadmin/verifications',
        itemId: uid,
      }).catch(() => {});

      // Immediately sign out so unapproved account cannot retain an active session
      await signOut(auth);
      setFirebaseUser(null);
      setUserProfile(null);

      return { success: true, uid };
    } catch (err: any) {
      await signOut(auth).catch(() => {});
      setFirebaseUser(null);
      setUserProfile(null);
      const msg = mapFirebaseAuthError(err?.code);
      setError(msg);
      return { success: false, error: msg, code: err?.code };
    } finally {
      isRegisteringRef.current = false;
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      return { success: true };
    } catch (err: any) {
      if (err?.code === 'auth/user-not-found') {
        return { success: true };
      }
      const msg = mapFirebaseAuthError(err?.code);
      return { success: false, error: msg };
    }
  };

  const logout = async (onAfterLogout?: () => void): Promise<void> => {
    try {
      if (profileUnsubRef.current) {
        profileUnsubRef.current();
        profileUnsubRef.current = null;
      }

      clearClientCachesAndStorage();
      await signOut(auth);

      if (typeof BroadcastChannel !== 'undefined') {
        try {
          const ch = new BroadcastChannel(LOGOUT_CHANNEL_NAME);
          ch.postMessage({ type: 'LOGOUT', ts: Date.now() });
          ch.close();
        } catch {
          // ignore
        }
      }
      try {
        localStorage.setItem(LOGOUT_STORAGE_KEY, String(Date.now()));
        localStorage.removeItem(LOGOUT_STORAGE_KEY);
      } catch {
        // ignore
      }

      setFirebaseUser(null);
      setUserProfile(null);
      setError(null);
      setLoading(false);
      onAfterLogout?.();
    } catch (err) {
      console.error('Logout failed:', err);
      setFirebaseUser(null);
      setUserProfile(null);
      onAfterLogout?.();
    }
  };

  const updateUserProfile = async (
    data: Partial<UserProfileData>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!firebaseUser) {
      return { success: false, error: 'User not logged in' };
    }

    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      // Strip immutable identity and privileged governance fields enforced by firestore.rules (#46)
      const {
        id: _id,
        uid: _uid,
        email: _email,
        baustId: _baustId,
        name: _name,
        role: _r,
        isVerified: _v,
        verifiedAlumniBadge: _vab,
        isFeatured: _feat,
        verificationStatus: _vs,
        accountStatus: _as,
        suspended: _s,
        isDemo: _d,
        createdAt: _ca,
        ...safeData
      } = data;

      const sanitizedData = Object.fromEntries(
        Object.entries(safeData).filter(([, value]) => value !== undefined)
      ) as Record<string, any>;

      if (typeof sanitizedData.photoURL === 'string' && sanitizedData.avatar === undefined) {
        sanitizedData.avatar = sanitizedData.photoURL;
      } else if (typeof sanitizedData.avatar === 'string' && sanitizedData.photoURL === undefined) {
        sanitizedData.photoURL = sanitizedData.avatar;
      }

      await updateDoc(userDocRef, {
        ...sanitizedData,
        updatedAt: serverTimestamp(),
      });
      setUserProfile((prev) => (prev ? { ...prev, ...sanitizedData } : null));
      return { success: true };
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}`);
      return { success: false, error: err.message };
    }
  };

  const refreshProfile = async (): Promise<void> => {
    if (firebaseUser) {
      const p = await fetchUserProfileOnce(firebaseUser);
      setUserProfile(p);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        userProfile,
        loading,
        isSwitchingDemo,
        error,
        login,
        demoLogin,
        switchDemoAccount,
        register,
        resetPassword,
        logout,
        updateUserProfile,
        refreshProfile,
        registerSessionCleanup,
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
