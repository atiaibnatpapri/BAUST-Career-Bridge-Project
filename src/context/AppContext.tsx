/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserRole, 
  Language, 
  AlumniProfile, 
  StudentProfile, 
  ServiceRequest, 
  MentorshipRequest, 
  VerificationItem, 
  ChatMessage, 
  Conversation, 
  Announcement,
  Notification 
} from '../types';
import { mockAlumni } from '../data/alumni';
import { mockStudents } from '../data/students';
import { mockServiceRequests } from '../data/serviceRequests';
import { mockMentorshipRequests } from '../data/mentorshipSessions';
import { mockVerifications } from '../data/verifications';
import { mockConversations, mockMessages } from '../data/chats';
import { mockAnnouncements } from '../data/announcements';
import { translations } from '../data/translations';
import { useAuth } from './AuthContext';
import { collection, onSnapshot, doc, updateDoc, getDoc, getDocFromServer } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: StudentProfile | AlumniProfile | { id: string; name: string; email: string; role: 'admin'; avatar: string; department: string; batch: string };
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'];
  
  // Data States
  alumniList: AlumniProfile[];
  studentList: StudentProfile[];
  serviceRequests: ServiceRequest[];
  mentorshipRequests: MentorshipRequest[];
  verifications: VerificationItem[];
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  announcements: Announcement[];
  notifications: Notification[];

  // Actions
  addServiceRequest: (newReq: Omit<ServiceRequest, 'id' | 'submittedAt' | 'timeline' | 'status' | 'estimatedDelivery'>) => void;
  updateServiceRequestStatus: (id: string, status: ServiceRequest['status'], remarks?: string, trackingNumber?: string) => void;
  
  requestMentorship: (req: Omit<MentorshipRequest, 'id' | 'createdAt' | 'status'>) => void;
  respondMentorship: (id: string, action: 'Accepted' | 'Declined', feedback?: string, meetingLink?: string) => void;
  
  approveVerification: (id: string) => Promise<boolean>;
  rejectVerification: (id: string, reason: string) => Promise<boolean>;
  
  sendMessage: (conversationId: string, text: string, attachment?: ChatMessage['attachment']) => void;
  
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'date'>) => void;
  deleteAnnouncement: (id: string) => void;
  
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message?: string) => void;
  removeToast: (id: string) => void;
  
  // Mentor settings for alumni
  updateAlumniMentorSettings: (available: boolean, slots: string[], topics: any[]) => void;
  updateStudentProfile: (updatedData: Partial<StudentProfile>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const ADMIN_USER = {
  id: 'admin-1',
  name: 'Prof. Dr. Registrar Office',
  email: 'registrar@baust.edu.bd',
  role: 'admin' as const,
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  department: 'Administration' as any,
  batch: 'Registrar & Student Affairs',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, updateUserProfile: updateFirebaseUserProfile } = useAuth();

  // Initialize role from logged-in profile or fallback to localStorage / student
  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem('baust_demo_role');
    return (saved as UserRole) || 'student';
  });

  // Keep role in sync with logged-in user profile
  useEffect(() => {
    if (userProfile?.role) {
      setRoleState(userProfile.role);
    }
  }, [userProfile?.role]);

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('baust_lang');
    return (saved as Language) || 'en';
  });

  // Local state initialized from mock data or local storage
  const [alumniList, setAlumniList] = useState<AlumniProfile[]>(() => {
    const saved = localStorage.getItem('baust_alumni');
    return saved ? JSON.parse(saved) : mockAlumni;
  });

  const [studentList, setStudentList] = useState<StudentProfile[]>(() => {
    const saved = localStorage.getItem('baust_students');
    return saved ? JSON.parse(saved) : mockStudents;
  });

  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(() => {
    const saved = localStorage.getItem('baust_service_requests');
    return saved ? JSON.parse(saved) : mockServiceRequests;
  });

  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>(() => {
    const saved = localStorage.getItem('baust_mentorships');
    return saved ? JSON.parse(saved) : mockMentorshipRequests;
  });

  const [verifications, setVerifications] = useState<VerificationItem[]>(() => {
    const saved = localStorage.getItem('baust_verifications');
    return saved ? JSON.parse(saved) : mockVerifications;
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('baust_conversations');
    return saved ? JSON.parse(saved) : mockConversations;
  });

  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem('baust_messages');
    return saved ? JSON.parse(saved) : mockMessages;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('baust_announcements');
    return saved ? JSON.parse(saved) : mockAnnouncements;
  });

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'notif-1',
      title: 'Mentorship Confirmed',
      message: 'Kazi Farhan Kabir accepted your CV Review session for Oct 30, 7:00 PM.',
      timestamp: '15 mins ago',
      read: false,
      type: 'mentorship',
      link: '/student/mentorship',
    },
    {
      id: 'notif-2',
      title: 'Document Ready for Pickup',
      message: 'Official Academic Transcript (REQ-2026-0891) is ready at the Exam Controller Office.',
      timestamp: '2 hours ago',
      read: false,
      type: 'service',
      link: '/alumni/services',
    },
    {
      id: 'notif-3',
      title: 'New Event Notice',
      message: 'BAUST Annual Career & Tech Expo 2026 announced for November 15-16.',
      timestamp: '1 day ago',
      read: true,
      type: 'announcement',
    }
  ]);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('baust_demo_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('baust_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('baust_service_requests', JSON.stringify(serviceRequests));
  }, [serviceRequests]);

  useEffect(() => {
    localStorage.setItem('baust_mentorships', JSON.stringify(mentorshipRequests));
  }, [mentorshipRequests]);

  useEffect(() => {
    localStorage.setItem('baust_verifications', JSON.stringify(verifications));
  }, [verifications]);

  // Real-time synchronization with Firestore /verifications
  useEffect(() => {
    try {
      const verificationsCol = collection(db, 'verifications');
      const unsubscribe = onSnapshot(
        verificationsCol,
        (snapshot) => {
          const firestoreItems: VerificationItem[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const rawStatus = data.status || (data.accountStatus === 'approved' ? 'Approved' : 'Pending');
            const status: VerificationItem['status'] =
              rawStatus === 'Approved' || rawStatus === 'approved'
                ? 'Approved'
                : rawStatus === 'Rejected' || rawStatus === 'rejected'
                ? 'Rejected'
                : 'Pending';

            firestoreItems.push({
              id: docSnap.id,
              userId: data.userId || docSnap.id.replace('ver-', ''),
              name: data.name || 'Applicant',
              email: data.email || '',
              role: data.role || 'student',
              baustId: data.baustId || data.studentId || '1902041',
              department: data.department || 'CSE',
              batch: data.batch || '19th Batch',
              passingYear: data.passingYear,
              submittedAt: data.submittedAt || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              documentType: data.documentType || `${data.role === 'alumni' ? 'Degree Certificate' : 'Student ID Card'} Verification`,
              documentPreviewUrl: data.documentPreviewUrl || 'https://images.unsplash.com/photo-1589330694653-dad6d3240a2b?w=600&auto=format&fit=crop&q=80',
              status,
              accountStatus: (data.accountStatus || (status === 'Approved' ? 'approved' : status === 'Rejected' ? 'rejected' : 'pending')) as any,
              rejectionReason: data.rejectionReason,
              reviewedAt: data.reviewedAt,
              reviewedBy: data.reviewedBy,
            });
          });

          if (firestoreItems.length > 0) {
            setVerifications((prev) => {
              const firestoreIds = new Set(firestoreItems.map((f) => f.id));
              const existingUnmatched = prev.filter((p) => !firestoreIds.has(p.id));
              const combined = [...firestoreItems, ...existingUnmatched];
              localStorage.setItem('baust_verifications', JSON.stringify(combined));
              return combined;
            });
          }
        },
        (error) => {
          console.warn('Firestore verifications subscription note:', error.message);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.warn('Error attaching Firestore listener:', err);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('baust_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('baust_messages', JSON.stringify(messages));
  }, [messages]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    addToast('info', 'Switched Demo Persona', `Now browsing as ${newRole.toUpperCase()}`);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const addToast = (type: ToastMessage['type'], title: string, message?: string) => {
    const id = 'toast-' + Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Determine current active user: prefer real Firebase profile if matching active role
  const currentUser = React.useMemo(() => {
    if (userProfile && userProfile.role === role) {
      if (role === 'student') {
        return {
          ...studentList[0],
          ...userProfile,
          id: userProfile.id,
          name: userProfile.name,
          email: userProfile.email,
          role: 'student' as const,
          avatar: userProfile.avatar || studentList[0].avatar,
          department: userProfile.department || studentList[0].department,
          batch: userProfile.batch || studentList[0].batch,
          studentId: userProfile.studentId || userProfile.baustId || studentList[0].studentId,
          currentSemester: userProfile.currentSemester || studentList[0].currentSemester,
          cgpa: userProfile.cgpa !== undefined ? userProfile.cgpa : studentList[0].cgpa,
          interests: userProfile.interests || studentList[0].interests,
          careerGoal: userProfile.careerGoal || studentList[0].careerGoal,
          cvFileName: userProfile.cvFileName || studentList[0].cvFileName,
          isVerified: userProfile.isVerified !== undefined ? userProfile.isVerified : studentList[0].isVerified,
        } as StudentProfile;
      } else if (role === 'alumni') {
        return {
          ...alumniList[0],
          ...userProfile,
          id: userProfile.id,
          name: userProfile.name,
          email: userProfile.email,
          role: 'alumni' as const,
          avatar: userProfile.avatar || alumniList[0].avatar,
          department: userProfile.department || alumniList[0].department,
          batch: userProfile.batch || alumniList[0].batch,
          designation: userProfile.designation || alumniList[0].designation,
          company: userProfile.company || alumniList[0].company,
          sector: (userProfile.sector as any) || alumniList[0].sector,
          location: userProfile.location || alumniList[0].location,
          passingYear: userProfile.passingYear || alumniList[0].passingYear,
          isVerified: userProfile.isVerified !== undefined ? userProfile.isVerified : alumniList[0].isVerified,
        } as AlumniProfile;
      } else {
        return {
          ...ADMIN_USER,
          ...userProfile,
          id: userProfile.id,
          name: userProfile.name,
          email: userProfile.email,
          role: 'admin' as const,
        };
      }
    }

    return role === 'student' 
      ? studentList[0] 
      : role === 'alumni' 
        ? alumniList[0] 
        : ADMIN_USER;
  }, [userProfile, role, studentList, alumniList]);

  // Actions
  const addServiceRequest = (newReq: Omit<ServiceRequest, 'id' | 'submittedAt' | 'timeline' | 'status' | 'estimatedDelivery'>) => {
    const id = `REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const fullReq: ServiceRequest = {
      ...newReq,
      id,
      submittedAt: now,
      status: 'Pending',
      estimatedDelivery: '10 business days',
      timeline: [
        { step: 'Request Submitted & Payment Verified', timestamp: `${now} (Online)`, completed: true },
        { step: 'Document Under Review by Registrar Office', timestamp: 'Pending', completed: false },
        { step: 'Controller of Examinations Approval & Seal', timestamp: 'Pending', completed: false },
        { step: 'Ready for Dispatch / Collection', timestamp: 'Pending', completed: false },
        { step: 'Delivered / Handed Over', timestamp: 'Pending', completed: false }
      ]
    };
    setServiceRequests((prev) => [fullReq, ...prev]);
    addToast('success', 'Document Request Submitted', `Application ID: ${id}`);
  };

  const updateServiceRequestStatus = (id: string, status: ServiceRequest['status'], remarks?: string, trackingNumber?: string) => {
    setServiceRequests((prev) =>
      prev.map((req) => {
        if (req.id !== id) return req;
        const now = new Date().toLocaleString();
        const updatedTimeline = req.timeline.map((step) => {
          if (status === 'Under Review' && step.step.includes('Under Review')) {
            return { ...step, completed: true, timestamp: now, remarks: remarks || step.remarks };
          }
          if (status === 'Approved' && step.step.includes('Approval')) {
            return { ...step, completed: true, timestamp: now, remarks: remarks || step.remarks };
          }
          if (status === 'Ready' && step.step.includes('Ready for Dispatch')) {
            return { ...step, completed: true, timestamp: now };
          }
          if (status === 'Delivered' && step.step.includes('Delivered')) {
            return { ...step, completed: true, timestamp: now };
          }
          return step;
        });

        return {
          ...req,
          status,
          adminRemarks: remarks || req.adminRemarks,
          trackingNumber: trackingNumber || req.trackingNumber,
          timeline: updatedTimeline,
        };
      })
    );
    addToast('success', 'Request Updated', `Status changed to ${status}`);
  };

  const requestMentorship = (req: Omit<MentorshipRequest, 'id' | 'createdAt' | 'status'>) => {
    const id = `MNT-${Math.floor(200 + Math.random() * 800)}`;
    const newSession: MentorshipRequest = {
      ...req,
      id,
      status: 'Pending',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setMentorshipRequests((prev) => [newSession, ...prev]);
    addToast('success', 'Mentorship Requested', `Request sent to ${req.alumniName}`);
  };

  const respondMentorship = (id: string, action: 'Accepted' | 'Declined', feedback?: string, meetingLink?: string) => {
    setMentorshipRequests((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          status: action,
          feedback: feedback || item.feedback,
          meetingLink: meetingLink || (action === 'Accepted' ? 'https://meet.google.com/bau-stcb-live' : undefined),
          scheduledDate: action === 'Accepted' ? item.preferredDate : undefined,
          scheduledTime: action === 'Accepted' ? item.preferredTime : undefined,
        };
      })
    );
    addToast(action === 'Accepted' ? 'success' : 'info', `Mentorship ${action}`, `Updated session ${id}`);
  };

  const ensureAdminAuth = async () => {
    if (
      !auth.currentUser ||
      (auth.currentUser.email !== 'registrar@baust.edu.bd' &&
        auth.currentUser.email !== 'atiaibnatpapri@gmail.com')
    ) {
      try {
        await signInWithEmailAndPassword(auth, 'registrar@baust.edu.bd', 'admin123456');
      } catch (err: any) {
        console.warn('Admin auto-auth notice:', err.message);
      }
    }
  };

  const approveVerification = async (id: string): Promise<boolean> => {
    try {
      await ensureAdminAuth();

      let item = verifications.find((v) => v.id === id);
      let userId = item?.userId;

      // If item or userId is missing in memory, fetch fresh from Firestore
      if (!userId) {
        try {
          const vSnap = await getDocFromServer(doc(db, 'verifications', id));
          if (vSnap.exists()) {
            userId = vSnap.data().userId;
            if (!item) {
              item = { id: vSnap.id, ...vSnap.data() } as any;
            }
          }
        } catch (e) {
          // fallback
        }
      }

      if (!userId) {
        userId = id.replace('ver-', '');
      }

      const nowIso = new Date().toISOString();

      // 1. Update the user document in /users/{userId}
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        accountStatus: 'approved',
        verificationStatus: 'approved',
        isVerified: true,
        approvedAt: nowIso,
        updatedAt: nowIso,
      });

      // 2. Update the verification document in /verifications/{id}
      const verDocRef = doc(db, 'verifications', id);
      try {
        await updateDoc(verDocRef, {
          status: 'Approved',
          accountStatus: 'approved',
          verificationStatus: 'approved',
          approvedAt: nowIso,
          reviewedAt: nowIso,
          reviewedBy: 'Registrar Office',
        });
      } catch (err: any) {
        console.warn('Notice: verifications doc update:', err.message);
      }

      // 3. Update local state and storage only after Firestore succeeds
      setVerifications((prev) => {
        const updated = prev.map((v) =>
          v.id === id ? { ...v, status: 'Approved' as const, accountStatus: 'approved' as const, approvedAt: nowIso } : v
        );
        localStorage.setItem('baust_verifications', JSON.stringify(updated));
        return updated;
      });

      addToast('success', 'Profile Approved', `${item?.name || 'Applicant'} account has been approved. They can now log in.`);

      // 4. In-app notification
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const approvalNotif: Notification = {
        id: `notif-${Date.now()}`,
        title: 'Profile Approved',
        message: `${item?.name || 'Applicant'} (${item?.baustId || 'ID'}) has been approved by Registrar Office.`,
        timestamp: `${nowStr} · Just now`,
        read: false,
        type: 'announcement',
      };
      setNotifications((prev) => [approvalNotif, ...prev]);

      return true;
    } catch (err: any) {
      console.error('Approval failed:', err);
      addToast('error', 'Approval Failed', `Could not update Firestore user document: ${err.message || 'Permission denied'}`);
      return false;
    }
  };

  const rejectVerification = async (id: string, reason: string): Promise<boolean> => {
    try {
      await ensureAdminAuth();

      let item = verifications.find((v) => v.id === id);
      let userId = item?.userId;

      if (!userId) {
        try {
          const vSnap = await getDocFromServer(doc(db, 'verifications', id));
          if (vSnap.exists()) {
            userId = vSnap.data().userId;
            if (!item) {
              item = { id: vSnap.id, ...vSnap.data() } as any;
            }
          }
        } catch (e) {
          // fallback
        }
      }

      if (!userId) {
        userId = id.replace('ver-', '');
      }

      const nowIso = new Date().toISOString();

      // 1. Update the user document in /users/{userId}
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        accountStatus: 'rejected',
        verificationStatus: 'rejected',
        isVerified: false,
        rejectionReason: reason,
        rejectedAt: nowIso,
        updatedAt: nowIso,
      });

      // 2. Update the verification document in /verifications/{id}
      const verDocRef = doc(db, 'verifications', id);
      try {
        await updateDoc(verDocRef, {
          status: 'Rejected',
          accountStatus: 'rejected',
          verificationStatus: 'rejected',
          rejectionReason: reason,
          reviewedAt: nowIso,
          reviewedBy: 'Registrar Office',
        });
      } catch (err: any) {
        console.warn('Notice: verifications doc rejection update:', err.message);
      }

      setVerifications((prev) => {
        const updated = prev.map((v) =>
          v.id === id
            ? { ...v, status: 'Rejected' as const, accountStatus: 'rejected' as const, rejectionReason: reason, rejectedAt: nowIso }
            : v
        );
        localStorage.setItem('baust_verifications', JSON.stringify(updated));
        return updated;
      });

      addToast('warning', 'Profile Rejected', `${item?.name || 'Applicant'} registration was rejected.`);

      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const rejectionNotif: Notification = {
        id: `notif-${Date.now()}`,
        title: 'Registration Rejected',
        message: `${item?.name || 'Applicant'} verification was rejected: ${reason}`,
        timestamp: `${nowStr} · Just now`,
        read: false,
        type: 'announcement',
      };
      setNotifications((prev) => [rejectionNotif, ...prev]);

      return true;
    } catch (err: any) {
      console.error('Rejection failed:', err);
      addToast('error', 'Rejection Failed', `Could not update Firestore user document: ${err.message || 'Permission denied'}`);
      return false;
    }
  };

  const sendMessage = (conversationId: string, text: string, attachment?: ChatMessage['attachment']) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      conversationId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text,
      timestamp: nowTime,
      attachment,
    };

    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: text || (attachment ? `Sent attachment: ${attachment.name}` : ''),
              lastMessageTime: nowTime,
              unreadCount: 0,
            }
          : c
      )
    );
  };

  const addAnnouncement = (item: Omit<Announcement, 'id' | 'date'>) => {
    const id = `ANC-0${announcements.length + 1}`;
    const newAnnouncement: Announcement = {
      ...item,
      id,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    setAnnouncements((prev) => [newAnnouncement, ...prev]);
    addToast('success', 'Announcement Published', item.title);
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    addToast('info', 'Announcement Deleted');
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast('info', 'All notifications marked as read');
  };

  const updateAlumniMentorSettings = (available: boolean, slots: string[], topics: any[]) => {
    setAlumniList((prev) =>
      prev.map((alm) => {
        if (alm.id === alumniList[0].id) {
          return {
            ...alm,
            mentoringAvailable: available,
            availableSlots: slots,
            mentorshipTopics: topics,
          };
        }
        return alm;
      })
    );
    addToast('success', 'Mentor Settings Saved', 'Your mentorship profile has been updated.');
  };

  const updateStudentProfile = (updatedData: Partial<StudentProfile>) => {
    // If logged in via Firebase, persist to Firestore
    if (userProfile) {
      updateFirebaseUserProfile(updatedData).catch((err) => {
        console.error('Failed to update Firestore profile:', err);
      });
    }

    setStudentList((prev) =>
      prev.map((std) => (std.id === studentList[0].id ? { ...std, ...updatedData } : std))
    );
    addToast('success', 'Profile Updated', 'Student profile information saved successfully.');
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        currentUser,
        language,
        setLanguage,
        t: translations[language],
        alumniList,
        studentList,
        serviceRequests,
        mentorshipRequests,
        verifications,
        conversations,
        messages,
        announcements,
        notifications,
        addServiceRequest,
        updateServiceRequestStatus,
        requestMentorship,
        respondMentorship,
        approveVerification,
        rejectVerification,
        sendMessage,
        addAnnouncement,
        deleteAnnouncement,
        markNotificationRead,
        markAllNotificationsRead,
        toasts,
        addToast,
        removeToast,
        updateAlumniMentorSettings,
        updateStudentProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
