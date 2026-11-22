/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Mentor,
  MentorshipSession,
  CVReviewItem,
  MentorshipGoal,
  MentorTimeSlot,
  ActionItem,
  CVCategoryScore,
  SectionComment,
} from '../types/mentorship';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { toList } from '../utils/utils';
import {
  CVReviewEntity,
  EvaluationEntity,
  isVerifiedVisibleAlumni,
  normalizeDepartment,
  sanitizeUserForViewer,
} from '../constants/baustDataModel';
import {
  createCVReviewRequest,
  submitCVReviewFeedback,
  submitStudentEvaluation,
  subscribeCVReviews,
  subscribeEvaluations,
  triggerNotification,
} from '../services/careerBridgeService';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { updateFirestoreMentorship } from '../services/firestorePortal';

interface MentorshipStoreContextType {
  mentors: Mentor[];
  sessions: MentorshipSession[];
  cvReviews: CVReviewItem[];
  evaluations: EvaluationEntity[];
  savedMentorIds: string[];
  goals: MentorshipGoal[];

  toggleSaveMentor: (mentorId: string) => void;
  getMentorById: (id: string) => Mentor | undefined;
  calculateMatchScore: (mentor: Mentor) => number;

  requestSession: (params: {
    mentorId: string;
    topic: MentorshipSession['topic'];
    goal: string;
    message: string;
    mode: MentorshipSession['mode'];
    slot: MentorTimeSlot;
    attachmentName?: string;
  }) => Promise<{ success: boolean; error?: string }>;

  acceptSession: (sessionId: string, meetingLink?: string) => void;
  holdSession: (sessionId: string, reason?: string) => void;
  declineSession: (sessionId: string, reason: string, note?: string) => void;
  cancelSession: (sessionId: string, reason?: string) => void;
  startSession: (sessionId: string) => void;
  completeSession: (
    sessionId: string,
    rating: number,
    review: string,
    tags: string[],
    recommended: boolean
  ) => void;

  updateSessionNotes: (sessionId: string, notes: string) => void;
  addActionItem: (sessionId: string, text: string) => void;
  toggleActionItem: (sessionId: string, itemId: string) => void;

  requestCVReview: (params: {
    mentorId: string;
    targetRole: string;
    targetSector: string;
    version: string;
    cvFileName: string;
    cvFileSize: string;
    deadlinePreference: 'Standard (3-5 days)' | 'Urgent (24-48 hours)';
    studentNotes?: string;
  }) => Promise<boolean>;

  submitCVReview: (params: {
    reviewId: string;
    overallScore: number;
    categoryScores: CVCategoryScore[];
    strengths: string[];
    areasToImprove: string[];
    sectionComments: SectionComment[];
    mentorSummary: string;
  }) => Promise<void>;

  sendCVThanks: (reviewId: string) => void;

  createGoal: (goal: Omit<MentorshipGoal, 'id' | 'linkedSessionIds'>) => void;
  updateGoalProgress: (goalId: string, progress: number) => void;
}

const MentorshipStoreContext = createContext<MentorshipStoreContextType | undefined>(undefined);

function mapCVReviewEntityToItem(r: CVReviewEntity): CVReviewItem {
  return {
    id: r.id,
    studentId: r.studentId,
    studentName: r.studentName,
    studentAvatar: r.studentAvatar || '',
    studentDept: normalizeDepartment(r.studentDept),
    studentBatch: r.studentBatch || '',
    mentorId: r.mentorId,
    mentorName: r.mentorName,
    mentorAvatar: r.mentorAvatar || '',
    mentorCompany: r.mentorCompany || '',
    targetRole: r.targetRole,
    targetSector: r.targetSector,
    version: 'v1',
    cvFileName: r.cvFileName,
    cvFileSize: 'PDF',
    submittedAt: 'Recently',
    deadlinePreference:
      r.deadlinePreference === 'Urgent (24-48 hours)'
        ? 'Urgent (24-48 hours)'
        : 'Standard (3-5 days)',
    status:
      r.status === 'Reviewed' ? 'REVIEWED' : r.status === 'In Review' ? 'IN_REVIEW' : 'SUBMITTED',
    overallScore: r.score,
    overallRating: r.rating,
    strengths: r.strengths || [],
    areasToImprove: r.areasToImprove || [],
    mentorSummary: r.mentorFeedback || '',
    studentNotes: r.studentNotes,
    thanksSent: r.thanksSent,
  };
}

export const MentorshipStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    currentUser,
    allUsers,
    mentorshipRequests,
    requestMentorship,
    respondMentorship,
    openOrCreateConversation,
    addToast,
  } = useApp();
  const { firebaseUser, userProfile, loading: authLoading, updateUserProfile, registerSessionCleanup } =
    useAuth();

  const [cvReviewDocs, setCvReviewDocs] = useState<CVReviewEntity[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationEntity[]>([]);
  const [savedMentorIds, setSavedMentorIds] = useState<string[]>([]);
  const [goals, setGoals] = useState<MentorshipGoal[]>([]);
  const [sessionNotesMap, setSessionNotesMap] = useState<Record<string, string>>({});
  const [actionItemsMap, setActionItemsMap] = useState<Record<string, ActionItem[]>>({});

  useEffect(() => {
    setSavedMentorIds(toList(userProfile?.savedMentorIds));
  }, [userProfile?.savedMentorIds]);

  const isApproved =
    !authLoading &&
    Boolean(firebaseUser) &&
    userProfile?.verificationStatus === 'approved' &&
    !userProfile?.suspended;

  // Live Firestore CV Reviews (#41, FR-16)
  useEffect(() => {
    if (!isApproved || !firebaseUser || !userProfile) {
      setCvReviewDocs([]);
      return;
    }
    const opts =
      userProfile.role === 'student'
        ? { studentId: firebaseUser.uid }
        : userProfile.role === 'alumni'
        ? { mentorId: firebaseUser.uid }
        : {};
    return subscribeCVReviews(
      opts,
      (docs) => setCvReviewDocs(docs),
      (err) => console.warn('CV Reviews listener warning:', err.message)
    );
  }, [isApproved, firebaseUser, userProfile?.role]);

  // Live Firestore Evaluations (FR-16)
  useEffect(() => {
    if (!isApproved || !firebaseUser) {
      setEvaluations([]);
      return;
    }
    return subscribeEvaluations(
      {},
      (docs) => setEvaluations(docs),
      (err) => console.warn('Evaluations listener warning:', err.message)
    );
  }, [isApproved, firebaseUser]);

  useEffect(() => {
    return registerSessionCleanup(() => {
      setCvReviewDocs([]);
      setEvaluations([]);
      setSavedMentorIds([]);
      setGoals([]);
      setSessionNotesMap({});
      setActionItemsMap({});
    });
  }, [registerSessionCleanup]);

  // Live Firestore verified alumni mentors (#51, #63)
  const mentors = useMemo<Mentor[]>(() => {
    return allUsers
      .filter((u) => isVerifiedVisibleAlumni(u))
      .map((raw) => {
        const u = sanitizeUserForViewer(raw, firebaseUser?.uid, userProfile?.role) || raw;
        const uid = u.id || u.uid || '';
        const userEvals = evaluations.filter((e) => e.alumniId === uid);
        const evalCount = userEvals.length;
        const avgRating =
          evalCount > 0
            ? Number(
                (userEvals.reduce((s, e) => s + Number(e.rating || 5), 0) / evalCount).toFixed(1)
              )
            : typeof u.rating === 'number'
            ? u.rating
            : 0;

        const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Mentor['ratingBreakdown'];
        userEvals.forEach((e) => {
          const k = Math.min(5, Math.max(1, Math.round(e.rating))) as 1 | 2 | 3 | 4 | 5;
          breakdown[k] += 1;
        });

        const slots: MentorTimeSlot[] = toList(u.availableSlots).map((slotStr, idx) => {
          const parts = slotStr.split(' ');
          return {
            id: `slot-${uid}-${idx}`,
            day: parts[0] || 'Fri',
            time: parts.slice(1).join(' ') || '08:00 PM',
            isBooked: false,
          };
        });

        return {
          id: uid,
          name: u.name || 'BAUST Alumni Mentor',
          email: u.email || '',
          avatar: u.avatar || '',
          isVerified: Boolean(u.isVerified),
          department: normalizeDepartment(u.department),
          batch: u.batch || '',
          passingYear: typeof u.passingYear === 'number' ? u.passingYear : 2022,
          designation: u.designation || 'Alumni Mentor',
          company: u.company || 'BAUST Network',
          sector: (u.sector as any) || 'Private',
          location: u.location || 'Bangladesh',
          bio: u.bio || 'Verified BAUST Alumni Mentor.',
          skills: toList(u.skills),
          mentoringTopics:
            toList(u.mentorshipTopics).length > 0
              ? (toList(u.mentorshipTopics) as any)
              : ['Career Guidance', 'CV Review'],
          availableSlots: slots,
          isAvailableNow: Boolean(u.mentoringAvailable),
          rating: avgRating,
          reviewCount: evalCount,
          ratingBreakdown: breakdown,
          sessionsCompleted: mentorshipRequests.filter(
            (m) => m.alumniId === uid && m.status === 'Completed'
          ).length,
          studentsMentored: typeof u.totalMentees === 'number' ? u.totalMentees : evalCount,
          responseTime: '< 24 hours',
          acceptanceRate: 95,
          reviews: userEvals.map((e) => ({
            id: e.id,
            studentId: e.studentId,
            studentName: e.studentName,
            studentAvatar: '',
            studentDept: 'CSE',
            studentBatch: '',
            rating: e.rating,
            tags: e.tags || [],
            comment: e.comment,
            recommended: e.recommended,
            date: 'Verified',
          })),
          experienceTimeline: Array.isArray(u.experienceTimeline)
            ? u.experienceTimeline.map((x: any) => ({
                period: x?.duration || '',
                role: x?.role || '',
                company: x?.company || '',
                description: x?.description || '',
              }))
            : [],
          education: Array.isArray(u.education)
            ? u.education.map((x: any) => ({
                degree: x?.degree || '',
                institution: x?.institution || '',
                year: x?.year || '',
              }))
            : [],
          achievements: toList(u.achievements),
          linkedin: u.linkedin || '',
          github: u.github || '',
        };
      });
  }, [allUsers, evaluations, firebaseUser?.uid, mentorshipRequests, userProfile?.role]);

  // Live Firestore mentorships mapped to MentorshipSession[]
  const sessions = useMemo<MentorshipSession[]>(() => {
    const mapToUiStatus = (raw: string): MentorshipSession['status'] => {
      if (raw === 'Accepted') return 'ACCEPTED';
      if (raw === 'On Hold') return 'ON_HOLD';
      if (raw === 'Declined') return 'REJECTED';
      if (raw === 'Completed') return 'COMPLETED';
      if (raw === 'Cancelled') return 'CANCELLED';
      return 'PENDING';
    };

    return mentorshipRequests.map((m) => {
      const mentor = mentors.find((mt) => mt.id === m.alumniId);
      const status = mapToUiStatus(m.status);
      const persistedHistory =
        Array.isArray(m.statusHistory) && m.statusHistory.length > 0
          ? m.statusHistory.map((h) => ({
              status: mapToUiStatus(h.status),
              timestamp: h.at ? new Date(h.at).toLocaleString() : m.createdAt,
              actorName: h.by || m.studentName,
              actorRole: (h.by === m.studentName ? 'student' : 'alumni') as 'student' | 'alumni',
              note: h.note || '',
            }))
          : [
              {
                status,
                timestamp: m.createdAt,
                actorName: m.studentName,
                actorRole: 'student' as const,
                note: m.note,
              },
            ];

      return {
        id: m.id,
        studentId: m.studentId,
        studentName: m.studentName,
        studentEmail: '',
        studentAvatar: m.studentAvatar || '',
        studentDept: normalizeDepartment(m.studentDept),
        studentBatch: m.studentBatch || '',
        mentorId: m.alumniId,
        mentorName: m.alumniName || mentor?.name || 'BAUST Alumni',
        mentorAvatar: mentor?.avatar || '',
        mentorDesignation: mentor?.designation || 'Alumni Mentor',
        mentorCompany: m.alumniCompany || mentor?.company || '',
        topic: m.topic,
        goal: m.topic,
        message: m.message || m.note,
        mode: 'Video Call',
        scheduledSlot: {
          id: `slot-${m.id}`,
          day: m.preferredDate || 'Flexible',
          time: m.preferredTime || '08:00 PM',
        },
        status,
        statusHistory: persistedHistory,
        meetingLink: m.meetingLink,
        sharedNotes: sessionNotesMap[m.id] ?? m.feedback ?? '',
        actionItems: actionItemsMap[m.id] ?? [],
        rejectionReason:
          m.status === 'Declined' || m.status === 'On Hold' || m.status === 'Cancelled'
            ? m.feedback
            : undefined,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt || m.createdAt,
      };
    });
  }, [actionItemsMap, mentors, mentorshipRequests, sessionNotesMap]);

  const cvReviews = useMemo<CVReviewItem[]>(() => {
    return cvReviewDocs.map(mapCVReviewEntityToItem);
  }, [cvReviewDocs]);

  const toggleSaveMentor = (mentorId: string) => {
    setSavedMentorIds((prev) => {
      const isSaved = prev.includes(mentorId);
      const updated = isSaved ? prev.filter((id) => id !== mentorId) : [...prev, mentorId];
      if (firebaseUser) {
        void updateUserProfile({ savedMentorIds: updated });
      }
      addToast(
        'info',
        isSaved ? 'Removed from Bookmarks' : 'Mentor Bookmarked',
        isSaved ? 'Mentor removed from your saved list.' : 'Find them anytime under Saved Mentors.'
      );
      return updated;
    });
  };

  const getMentorById = (id: string): Mentor | undefined => {
    return mentors.find((m) => m.id === id);
  };

  const calculateMatchScore = (mentor: Mentor): number => {
    let score = 68;
    const studentDept = (currentUser as any).department || 'CSE';
    if (mentor.department === studentDept) score += 16;
    if (mentor.mentoringTopics.includes('CV Review')) score += 5;
    if (mentor.rating >= 4.5) score += 6;
    if (mentor.isAvailableNow) score += 4;
    return Math.min(score, 99);
  };

  const requestSession = async (params: {
    mentorId: string;
    topic: MentorshipSession['topic'];
    goal: string;
    message: string;
    mode: MentorshipSession['mode'];
    slot: MentorTimeSlot;
    attachmentName?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!params.mentorId) {
      addToast('error', 'Mentor Required', 'Please select a specific alumni mentor.');
      return { success: false, error: 'Please select a specific alumni mentor.' };
    }
    const mentor = getMentorById(params.mentorId);
    if (!mentor) {
      addToast('error', 'Mentor Not Found', 'The selected mentor profile is unavailable.');
      return { success: false, error: 'Selected mentor unavailable.' };
    }

    return requestMentorship({
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentDept: normalizeDepartment((currentUser as any).department),
      studentBatch: (currentUser as any).batch || '',
      studentAvatar: currentUser.avatar,
      alumniId: mentor.id,
      alumniName: mentor.name,
      alumniCompany: mentor.company,
      topic: params.topic,
      note: `${params.goal ? `[Goal: ${params.goal}] ` : ''}${params.message}`,
      preferredDate: params.slot.day,
      preferredTime: params.slot.time,
    });
  };

  const acceptSession = (sessionId: string, meetingLink?: string) => {
    const target = sessions.find((s) => s.id === sessionId);
    void respondMentorship(sessionId, 'Accepted', 'Session request accepted', meetingLink);
    if (target?.studentId) {
      void openOrCreateConversation(target.studentId, 'mentorship');
    }
  };

  const holdSession = (sessionId: string, reason?: string) => {
    void respondMentorship(
      sessionId,
      'On Hold',
      reason?.trim() || 'Placed on hold for schedule coordination.'
    );
  };

  const declineSession = (sessionId: string, reason: string, note?: string) => {
    void respondMentorship(sessionId, 'Declined', `${reason}${note ? `: ${note}` : ''}`);
  };

  const cancelSession = (sessionId: string, reason?: string) => {
    void respondMentorship(sessionId, 'Cancelled', reason || 'Withdrawn by student');
  };

  const startSession = (_sessionId: string) => {
    // Session link open handled directly in UI
  };

  const completeSession = (
    sessionId: string,
    rating: number,
    review: string,
    tags: string[],
    recommended: boolean
  ) => {
    const session = sessions.find((s) => s.id === sessionId);
    void updateFirestoreMentorship(sessionId, 'Completed', review, undefined, currentUser.name).then(
      async () => {
        if (session && firebaseUser) {
          await submitStudentEvaluation({
            studentId: firebaseUser.uid,
            studentName: currentUser.name,
            alumniId: session.mentorId,
            alumniName: session.mentorName,
            sessionId,
            rating,
            comment: review,
            tags,
            recommended,
          }).catch(() => {});
        }
        addToast('success', 'Session Completed', 'Your verified evaluation has been saved to Firestore.');
      }
    );
  };

  const updateSessionNotes = (sessionId: string, notes: string) => {
    setSessionNotesMap((prev) => ({ ...prev, [sessionId]: notes }));
    void updateDoc(doc(db, 'mentorships', sessionId), {
      feedback: notes,
      updatedAt: serverTimestamp(),
    }).catch(() => {});
  };

  const addActionItem = (sessionId: string, text: string) => {
    const newItem: ActionItem = {
      id: 'act-' + Date.now(),
      text,
      completed: false,
      addedBy: currentUser.name,
    };
    setActionItemsMap((prev) => ({
      ...prev,
      [sessionId]: [...(prev[sessionId] || []), newItem],
    }));
    addToast('info', 'Action Item Added', text);
  };

  const toggleActionItem = (sessionId: string, itemId: string) => {
    setActionItemsMap((prev) => ({
      ...prev,
      [sessionId]: (prev[sessionId] || []).map((a) =>
        a.id === itemId ? { ...a, completed: !a.completed } : a
      ),
    }));
  };

  const requestCVReview = async (params: {
    mentorId: string;
    targetRole: string;
    targetSector: string;
    version: string;
    cvFileName: string;
    cvFileSize: string;
    deadlinePreference: 'Standard (3-5 days)' | 'Urgent (24-48 hours)';
    studentNotes?: string;
  }): Promise<boolean> => {
    if (!firebaseUser || !userProfile) {
      addToast('error', 'Sign In Required', 'Please sign in to submit a CV review.');
      return false;
    }
    const mentor = getMentorById(params.mentorId);
    if (!mentor) {
      addToast('error', 'Select Alumni Mentor', 'Please choose a verified alumni mentor for CV review.');
      return false;
    }

    try {
      await createCVReviewRequest({
        studentId: firebaseUser.uid,
        studentName: userProfile.name,
        studentEmail: userProfile.email,
        studentDept: userProfile.department,
        studentBatch: userProfile.batch,
        studentAvatar: userProfile.avatar,
        mentorId: mentor.id,
        mentorName: mentor.name,
        mentorCompany: mentor.company,
        mentorAvatar: mentor.avatar,
        targetRole: params.targetRole,
        targetSector: params.targetSector,
        cvFileName: params.cvFileName,
        deadlinePreference: params.deadlinePreference,
        studentNotes: params.studentNotes,
        isDemo: Boolean(userProfile.isDemo),
      });
      addToast('success', 'CV Review Submitted', `Sent to ${mentor.name}.`);
      return true;
    } catch (err: any) {
      addToast('error', 'Submission Failed', err?.message || 'Unable to submit CV review.');
      return false;
    }
  };

  const submitCVReview = async (params: {
    reviewId: string;
    overallScore: number;
    categoryScores: CVCategoryScore[];
    strengths: string[];
    areasToImprove: string[];
    sectionComments: SectionComment[];
    mentorSummary: string;
  }): Promise<void> => {
    const existing = cvReviewDocs.find((r) => r.id === params.reviewId);
    if (!existing) return;
    try {
      await submitCVReviewFeedback({
        review: existing,
        score: params.overallScore,
        strengths: params.strengths,
        areasToImprove: params.areasToImprove,
        mentorFeedback: params.mentorSummary,
      });
      addToast('success', 'CV Review Published', 'Feedback and score saved to Cloud Firestore.');
    } catch (err: any) {
      addToast('error', 'Save Failed', err?.message || 'Could not publish CV feedback.');
    }
  };

  const sendCVThanks = (reviewId: string) => {
    void updateDoc(doc(db, 'cvReviews', reviewId), { thanksSent: true, updatedAt: serverTimestamp() })
      .then(() => {
        addToast('success', 'Thank You Note Sent', 'Sent your appreciation to your alumni mentor!');
      })
      .catch(() => {});
  };

  const createGoal = (goal: Omit<MentorshipGoal, 'id' | 'linkedSessionIds'>) => {
    const newGoal: MentorshipGoal = {
      ...goal,
      id: 'goal-' + Date.now(),
      linkedSessionIds: [],
    };
    setGoals((prev) => [newGoal, ...prev]);
    addToast('success', 'Career Goal Created', goal.title);
  };

  const updateGoalProgress = (goalId: string, progress: number) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, progressPercentage: progress } : g))
    );
  };

  return (
    <MentorshipStoreContext.Provider
      value={{
        mentors,
        sessions,
        cvReviews,
        evaluations,
        savedMentorIds,
        goals,
        toggleSaveMentor,
        getMentorById,
        calculateMatchScore,
        requestSession,
        acceptSession,
        holdSession,
        declineSession,
        cancelSession,
        startSession,
        completeSession,
        updateSessionNotes,
        addActionItem,
        toggleActionItem,
        requestCVReview,
        submitCVReview,
        sendCVThanks,
        createGoal,
        updateGoalProgress,
      }}
    >
      {children}
    </MentorshipStoreContext.Provider>
  );
};

export const useMentorshipStore = () => {
  const context = useContext(MentorshipStoreContext);
  if (!context) {
    throw new Error('useMentorshipStore must be used within MentorshipStoreProvider');
  }
  return context;
};
