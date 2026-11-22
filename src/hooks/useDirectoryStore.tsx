/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  DirectoryAlumniProfile,
  AlumniConnectionRequest,
  SavedSearchSet,
  ProfileReportSubmission,
} from '../types/directory';
import { Department } from '../types';
import { useAuth, UserProfileData } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { toList } from '../utils/utils';
import {
  isVerifiedVisibleAlumni,
  normalizeDepartment,
  parseBatchNumber,
  sanitizeUserForViewer,
} from '../constants/baustDataModel';
import { submitModerationReport, subscribeReports } from '../services/careerBridgeService';

interface DirectoryStoreContextType {
  alumniProfiles: DirectoryAlumniProfile[];
  savedAlumniIds: string[];
  connections: AlumniConnectionRequest[];
  savedSearches: SavedSearchSet[];
  reports: ProfileReportSubmission[];
  getProfileById: (id: string) => DirectoryAlumniProfile | undefined;
  toggleSaveAlumni: (id: string) => void;
  isAlumniSaved: (id: string) => boolean;
  updateAlumniProfile: (id: string, updates: Partial<DirectoryAlumniProfile>) => void;
  endorseSkill: (
    alumniId: string,
    skillName: string,
    studentInfo: { studentId: string; studentName: string; studentDept: Department; comment?: string }
  ) => boolean;
  sendConnectionRequest: (
    req: Omit<AlumniConnectionRequest, 'id' | 'status' | 'sentAt'>
  ) => void;
  respondConnectionRequest: (requestId: string, status: 'Accepted' | 'Declined') => void;
  saveSearchSet: (search: Omit<SavedSearchSet, 'id' | 'createdAt'>) => void;
  deleteSavedSearch: (id: string) => void;
  submitProfileReport: (report: Omit<ProfileReportSubmission, 'id' | 'status' | 'submittedAt'>) => void;
  resetProfilesToDefault: () => void;
}

function mapUserToDirectoryProfile(
  raw: UserProfileData,
  viewerUid?: string,
  viewerRole?: any
): DirectoryAlumniProfile {
  const safe = sanitizeUserForViewer(raw, viewerUid, viewerRole) || raw;
  const uid = safe.id || safe.uid || '';
  const batchNum = parseBatchNumber(safe.batch) || 1;
  const passingYear = typeof safe.passingYear === 'number' ? safe.passingYear : 2022;
  const skillsArr = toList(safe.skills);
  const fullLoc = safe.location || 'Bangladesh';
  const locParts = fullLoc.split(',').map((s: string) => s.trim()).filter(Boolean);

  return {
    id: uid,
    name: safe.name || 'BAUST Alumni',
    email: safe.email || '',
    role: 'alumni',
    avatar: safe.avatar || '',
    department: normalizeDepartment(safe.department),
    batch: safe.batch || `${batchNum}th Batch`,
    batchNumber: batchNum,
    admissionYear: passingYear - 4,
    passingYear,
    studentIdMasked: safe.baustId
      ? `${String(safe.baustId).slice(0, 6)}***`
      : 'BAUST-VERIFIED',
    phone: safe.phone || '',
    bio: safe.bio || `${safe.designation || 'BAUST Graduate'} at ${safe.company || 'Partner Organization'}.`,
    headline:
      safe.headline ||
      `${safe.designation || 'BAUST Alumni'} · ${safe.company || 'BAUST Network'}`,
    isVerified: Boolean(safe.isVerified),
    verifiedAlumniBadge: Boolean(safe.verifiedAlumniBadge),
    isFeatured: Boolean(safe.isFeatured),
    _privacyRestricted: Boolean((safe as any)._privacyRestricted),
    _hiddenEmail: Boolean((safe as any)._hiddenEmail),
    _hiddenPhone: Boolean((safe as any)._hiddenPhone),
    verificationBadgeLevel: safe.verifiedAlumniBadge ? 'Official BAUST' : undefined,
    designation: safe.designation || 'Alumni Member',
    company: safe.company || 'Partner Organization',
    sector: (safe.sector as any) || 'Private',
    location: fullLoc,
    city: locParts[0] || 'Dhaka',
    country: locParts[1] || 'Bangladesh',
    cgpa: typeof safe.cgpa === 'number' ? safe.cgpa : 0,
    thesisTitle: '',
    thesisSupervisor: '',
    honors: toList(safe.achievements),
    clubs: [],
    scholarships: [],
    education: Array.isArray(safe.education)
      ? safe.education.map((e: any, idx: number) => ({
          id: e?.id || `edu-${idx}`,
          degree: e?.degree || 'B.Sc.',
          institution: e?.institution || 'BAUST, Saidpur',
          department: normalizeDepartment(safe.department),
          period: e?.year || String(passingYear),
        }))
      : [],
    publications: [],
    skillsWithLevels: skillsArr.map((name, idx) => ({
      id: `sk-${uid}-${idx}`,
      name,
      level: 'Advanced',
      endorsements: [],
    })),
    skills: skillsArr,
    topExpertise: skillsArr.slice(0, 3),
    experienceTimeline: Array.isArray(safe.experienceTimeline)
      ? safe.experienceTimeline.map((exp: any, idx: number) => ({
          id: exp?.id || `exp-${idx}`,
          role: exp?.role || safe.designation || 'Engineer',
          company: exp?.company || safe.company || 'Organization',
          location: fullLoc,
          period: exp?.duration || `${passingYear} - Present`,
          isCurrent: idx === 0,
          description: exp?.description || '',
        }))
      : [],
    certifications: [],
    interestedFields: toList(safe.mentorshipTopics),
    mentoringAvailable: Boolean(safe.mentoringAvailable),
    openToReferrals: Boolean(safe.mentoringAvailable),
    openToHiring: false,
    mentorshipTopics: toList(safe.mentorshipTopics) as any,
    availableSlots: toList(safe.availableSlots),
    totalMentees: typeof safe.totalMentees === 'number' ? safe.totalMentees : 0,
    studentsConsulted: typeof safe.totalMentees === 'number' ? safe.totalMentees : 0,
    rating: typeof safe.rating === 'number' ? safe.rating : 0,
    reviewCount: 0,
    linkedin: safe.linkedin || '',
    github: safe.github || '',
    privacy: {
      cgpa:
        safe.privacy?.cgpa ||
        (safe.profileVisibility === 'private' ? 'hidden' : 'public'),
      email:
        safe.privacy?.email ||
        (safe.hideEmail ? 'hidden' : 'public'),
      phone:
        safe.privacy?.phone ||
        (safe.hidePhone ? 'hidden' : 'public'),
      location: safe.privacy?.location || 'public',
    },
    stats: {
      profileViewsThisMonth: 0,
      searchAppearances: 0,
      bookmarksCount: 0,
      endorsementsReceived: skillsArr.length,
      monthlyViewHistory: [],
    },
    lastUpdated: new Date().toISOString().split('T')[0],
  };
}

const DirectoryStoreContext = createContext<DirectoryStoreContextType | undefined>(undefined);

export const DirectoryStoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { firebaseUser, userProfile, loading: authLoading, updateUserProfile, registerSessionCleanup } = useAuth();
  const { allUsers, addToast, mentorshipRequests, requestMentorship, respondMentorship } = useApp();

  const [savedAlumniIds, setSavedAlumniIds] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearchSet[]>([]);
  const [reports, setReports] = useState<ProfileReportSubmission[]>([]);

  // Sync savedAlumniIds & per-user savedSearches
  useEffect(() => {
    setSavedAlumniIds(toList(userProfile?.savedAlumniIds));
  }, [userProfile?.savedAlumniIds]);

  useEffect(() => {
    if (!firebaseUser?.uid) {
      setSavedSearches([]);
      return;
    }
    try {
      const raw = localStorage.getItem(`baust_saved_searches_${firebaseUser.uid}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSavedSearches(parsed);
          return;
        }
      }
    } catch {
      // ignore storage errors
    }
    setSavedSearches([]);
  }, [firebaseUser?.uid]);

  // Subscribe to Firestore reports collection (for moderation visibility)
  useEffect(() => {
    if (
      authLoading ||
      !firebaseUser ||
      userProfile?.verificationStatus !== 'approved' ||
      userProfile?.suspended
    ) {
      setReports([]);
      return;
    }

    const opts =
      userProfile.role === 'admin' || userProfile.role === 'superAdmin'
        ? {}
        : { reporterId: firebaseUser.uid };

    return subscribeReports(
      opts,
      (items) => {
        setReports(
          items.map((r) => ({
            id: r.id,
            reportedAlumniId: r.targetId,
            reportedAlumniName: r.targetName,
            reporterId: r.reporterId,
            reporterName: r.reporterName,
            reason: (r.reason as any) || 'Other',
            details: r.details,
            submittedAt: new Date().toISOString(),
            status: r.status === 'Action Taken' ? 'Resolved' : r.status === 'Reviewed' ? 'Investigated' : 'Pending',
          }))
        );
      },
      (err) => console.warn('Reports listener warning:', err.message)
    );
  }, [authLoading, firebaseUser, userProfile?.role, userProfile?.verificationStatus, userProfile?.suspended]);

  const connections = useMemo<AlumniConnectionRequest[]>(() => {
    return mentorshipRequests.map((m) => ({
      id: m.id,
      studentId: m.studentId,
      studentName: m.studentName,
      studentEmail: '',
      studentDept: m.studentDept,
      studentBatch: m.studentBatch,
      studentAvatar: m.studentAvatar,
      alumniId: m.alumniId,
      purpose: (m.topic as any) || 'Career Advice',
      note: m.note,
      status: m.status === 'Accepted' ? 'Accepted' : m.status === 'Declined' ? 'Declined' : 'Pending',
      sentAt: m.createdAt,
    }));
  }, [mentorshipRequests]);

  useEffect(() => {
    return registerSessionCleanup(() => {
      setSavedAlumniIds([]);
      setSavedSearches([]);
      setReports([]);
    });
  }, [registerSessionCleanup]);

  // Live Firestore verified & non-suspended alumni only (#42, #50, #63)
  const alumniProfiles = useMemo<DirectoryAlumniProfile[]>(() => {
    return allUsers
      .filter((u) => isVerifiedVisibleAlumni(u))
      .map((u) => mapUserToDirectoryProfile(u, firebaseUser?.uid, userProfile?.role));
  }, [allUsers, firebaseUser?.uid, userProfile?.role]);

  const getProfileById = (id: string): DirectoryAlumniProfile | undefined => {
    return alumniProfiles.find((p) => p.id === id);
  };

  const toggleSaveAlumni = (id: string) => {
    setSavedAlumniIds((prev) => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter((i) => i !== id) : [...prev, id];
      if (firebaseUser) {
        void updateUserProfile({ savedAlumniIds: updated });
      }
      return updated;
    });
  };

  const isAlumniSaved = (id: string): boolean => {
    return savedAlumniIds.includes(id);
  };

  const updateAlumniProfile = (id: string, updates: Partial<DirectoryAlumniProfile>) => {
    if (!firebaseUser || id !== firebaseUser.uid) {
      return;
    }
    void updateUserProfile({
      bio: updates.bio,
      headline: updates.headline,
      designation: updates.designation,
      company: updates.company,
      sector: updates.sector as any,
      location: updates.location,
      linkedin: updates.linkedin,
      github: updates.github,
      skills: updates.skills,
      mentoringAvailable: updates.mentoringAvailable,
      mentorshipTopics: updates.mentorshipTopics,
      availableSlots: updates.availableSlots,
      hideEmail: updates.privacy?.email === 'hidden',
      hidePhone: updates.privacy?.phone === 'hidden',
      profileVisibility: updates.privacy?.cgpa === 'hidden' ? 'private' : 'public',
    });
  };

  const endorseSkill = (
    alumniId: string,
    skillName: string,
    studentInfo: { studentId: string; studentName: string; studentDept: Department; comment?: string }
  ): boolean => {
    const targetAlumni = alumniProfiles.find((p) => p.id === alumniId);
    addToast(
      'success',
      'Skill Endorsed',
      `${studentInfo.studentName || 'Student'} endorsed ${skillName} for ${targetAlumni?.name || 'alumni member'}.`
    );
    return true;
  };

  const sendConnectionRequest = (req: Omit<AlumniConnectionRequest, 'id' | 'status' | 'sentAt'>) => {
    const targetAlumni = alumniProfiles.find((p) => p.id === req.alumniId);
    void requestMentorship({
      studentId: firebaseUser?.uid || req.studentId,
      studentName: userProfile?.name || req.studentName,
      studentDept: normalizeDepartment(userProfile?.department || req.studentDept),
      studentBatch: userProfile?.batch || req.studentBatch,
      studentAvatar: userProfile?.avatar || req.studentAvatar,
      alumniId: req.alumniId,
      alumniName: targetAlumni?.name || 'BAUST Alumni',
      alumniCompany: targetAlumni?.company || 'BAUST Network',
      topic: 'Career Guidance',
      note: `[Connection: ${req.purpose}] ${req.note}`.trim(),
      preferredDate: 'Flexible',
      preferredTime: 'To be scheduled',
    });
  };

  const respondConnectionRequest = (requestId: string, status: 'Accepted' | 'Declined') => {
    void respondMentorship(requestId, status);
  };

  const saveSearchSet = (search: Omit<SavedSearchSet, 'id' | 'createdAt'>) => {
    const newSearch: SavedSearchSet = {
      ...search,
      id: `search-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setSavedSearches((prev) => {
      const updated = [newSearch, ...prev];
      if (firebaseUser?.uid) {
        try {
          localStorage.setItem(`baust_saved_searches_${firebaseUser.uid}`, JSON.stringify(updated));
        } catch {
          // ignore storage quota errors
        }
      }
      return updated;
    });
  };

  const deleteSavedSearch = (id: string) => {
    setSavedSearches((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      if (firebaseUser?.uid) {
        try {
          localStorage.setItem(`baust_saved_searches_${firebaseUser.uid}`, JSON.stringify(updated));
        } catch {
          // ignore storage quota errors
        }
      }
      return updated;
    });
  };

  const submitProfileReport = (
    report: Omit<ProfileReportSubmission, 'id' | 'status' | 'submittedAt'>
  ) => {
    if (!firebaseUser || !userProfile) {
      addToast('error', 'Sign In Required', 'Please sign in to submit a report.');
      return;
    }
    void submitModerationReport({
      reporterId: firebaseUser.uid,
      reporterName: userProfile.name,
      reporterRole: userProfile.role,
      targetId: report.reportedAlumniId,
      targetType: 'user',
      targetName: report.reportedAlumniName,
      reason: report.reason,
      details: report.details,
    })
      .then(() => {
        addToast('success', 'Report Submitted', 'University moderation staff have been notified.');
      })
      .catch((err) => {
        addToast('error', 'Report Failed', err?.message || 'Unable to submit report.');
      });
  };

  const resetProfilesToDefault = () => {
    setSavedSearches([]);
  };

  return (
    <DirectoryStoreContext.Provider
      value={{
        alumniProfiles,
        savedAlumniIds,
        connections,
        savedSearches,
        reports,
        getProfileById,
        toggleSaveAlumni,
        isAlumniSaved,
        updateAlumniProfile,
        endorseSkill,
        sendConnectionRequest,
        respondConnectionRequest,
        saveSearchSet,
        deleteSavedSearch,
        submitProfileReport,
        resetProfilesToDefault,
      }}
    >
      {children}
    </DirectoryStoreContext.Provider>
  );
};

export const useDirectoryStore = (): DirectoryStoreContextType => {
  const context = useContext(DirectoryStoreContext);
  if (!context) {
    throw new Error('useDirectoryStore must be used within a DirectoryStoreProvider');
  }
  return context;
};
