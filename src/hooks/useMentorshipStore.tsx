/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Mentor, 
  MentorshipSession, 
  CVReviewItem, 
  MentorshipGoal, 
  MentorshipStatus, 
  MentorTimeSlot,
  ActionItem,
  CVCategoryScore,
  SectionComment
} from '../types/mentorship';
import { mockMentors } from '../data/mentors';
import { mockMentorshipSessions } from '../data/mentorshipRequests';
import { mockCVReviews } from '../data/cvReviews';
import { useApp } from '../context/AppContext';

interface MentorshipStoreContextType {
  mentors: Mentor[];
  sessions: MentorshipSession[];
  cvReviews: CVReviewItem[];
  savedMentorIds: string[];
  goals: MentorshipGoal[];
  
  // Mentor Actions
  toggleSaveMentor: (mentorId: string) => void;
  getMentorById: (id: string) => Mentor | undefined;
  calculateMatchScore: (mentor: Mentor) => number;
  
  // Session Lifecycle Actions
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
  
  // CV Review Actions
  requestCVReview: (params: {
    mentorId: string;
    targetRole: string;
    targetSector: string;
    version: string;
    cvFileName: string;
    cvFileSize: string;
    deadlinePreference: 'Standard (3-5 days)' | 'Urgent (24-48 hours)';
    studentNotes?: string;
  }) => void;
  
  submitCVReview: (params: {
    reviewId: string;
    overallScore: number;
    categoryScores: CVCategoryScore[];
    strengths: string[];
    areasToImprove: string[];
    sectionComments: SectionComment[];
    mentorSummary: string;
  }) => void;
  
  sendCVThanks: (reviewId: string) => void;
  
  // Goals Actions
  createGoal: (goal: Omit<MentorshipGoal, 'id' | 'linkedSessionIds'>) => void;
  updateGoalProgress: (goalId: string, progress: number) => void;
}

const MentorshipStoreContext = createContext<MentorshipStoreContextType | undefined>(undefined);

export const MentorshipStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, addToast } = useApp();

  // 1. Mentors State
  const [mentors, setMentors] = useState<Mentor[]>(() => {
    const saved = localStorage.getItem('baust_mentors_data');
    return saved ? JSON.parse(saved) : mockMentors;
  });

  // 2. Mentorship Sessions State
  const [sessions, setSessions] = useState<MentorshipSession[]>(() => {
    const saved = localStorage.getItem('baust_mentorship_sessions');
    return saved ? JSON.parse(saved) : mockMentorshipSessions;
  });

  // 3. CV Reviews State
  const [cvReviews, setCvReviews] = useState<CVReviewItem[]>(() => {
    const saved = localStorage.getItem('baust_cv_reviews');
    return saved ? JSON.parse(saved) : mockCVReviews;
  });

  // 4. Saved / Bookmarked Mentors
  const [savedMentorIds, setSavedMentorIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('baust_saved_mentor_ids');
    return saved ? JSON.parse(saved) : ['alm-1', 'alm-2'];
  });

  // 5. Goals Tracker
  const [goals, setGoals] = useState<MentorshipGoal[]>(() => {
    const saved = localStorage.getItem('baust_mentorship_goals');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'goal-1',
            studentId: 'std-1',
            title: 'Land Junior Full-Stack Engineer Job at Top BD Tech Firm',
            targetDate: 'Dec 2026',
            category: 'Tech Job Prep',
            progressPercentage: 65,
            linkedSessionIds: ['MNT-2026-001', 'MNT-2026-005'],
          },
          {
            id: 'goal-2',
            studentId: 'std-1',
            title: 'Prepare DAAD Scholarship Documents for Germany',
            targetDate: 'Feb 2027',
            category: 'Higher Studies',
            progressPercentage: 30,
            linkedSessionIds: ['MNT-2026-002'],
          },
        ];
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('baust_mentors_data', JSON.stringify(mentors));
  }, [mentors]);

  useEffect(() => {
    localStorage.setItem('baust_mentorship_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('baust_cv_reviews', JSON.stringify(cvReviews));
  }, [cvReviews]);

  useEffect(() => {
    localStorage.setItem('baust_saved_mentor_ids', JSON.stringify(savedMentorIds));
  }, [savedMentorIds]);

  useEffect(() => {
    localStorage.setItem('baust_mentorship_goals', JSON.stringify(goals));
  }, [goals]);

  // Actions
  const toggleSaveMentor = (mentorId: string) => {
    setSavedMentorIds((prev) => {
      const isSaved = prev.includes(mentorId);
      const updated = isSaved ? prev.filter((id) => id !== mentorId) : [...prev, mentorId];
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

  // Mock match score algorithm based on student department & interests
  const calculateMatchScore = (mentor: Mentor): number => {
    let score = 70;
    const studentDept = (currentUser as any).department || 'CSE';
    if (mentor.department === studentDept) score += 15;
    if (mentor.mentoringTopics.includes('CV Review')) score += 5;
    if (mentor.rating >= 4.9) score += 5;
    if (mentor.isAvailableNow) score += 4;
    return Math.min(score, 99);
  };

  // Session Request Lifecycle
  const requestSession = async (params: {
    mentorId: string;
    topic: MentorshipSession['topic'];
    goal: string;
    message: string;
    mode: MentorshipSession['mode'];
    slot: MentorTimeSlot;
    attachmentName?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    // TODO: replace with API call: POST /api/mentorship/requests

    // Prevent duplicate pending requests to same mentor for same topic
    const hasDuplicate = sessions.some(
      (s) =>
        s.studentId === currentUser.id &&
        s.mentorId === params.mentorId &&
        s.topic === params.topic &&
        s.status === 'PENDING'
    );

    if (hasDuplicate) {
      addToast('warning', 'Duplicate Request', 'You already have a pending request with this mentor for this topic.');
      return { success: false, error: 'Duplicate pending request exists' };
    }

    const mentor = getMentorById(params.mentorId) || mentors[0];
    const newSessionId = `MNT-2026-${Math.floor(100 + Math.random() * 900)}`;
    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newSession: MentorshipSession = {
      id: newSessionId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentEmail: currentUser.email,
      studentAvatar: currentUser.avatar,
      studentDept: (currentUser as any).department || 'CSE',
      studentBatch: (currentUser as any).batch || '18th Batch',
      mentorId: mentor.id,
      mentorName: mentor.name,
      mentorAvatar: mentor.avatar,
      mentorDesignation: mentor.designation,
      mentorCompany: mentor.company,
      topic: params.topic,
      goal: params.goal,
      message: params.message,
      mode: params.mode,
      scheduledSlot: params.slot,
      attachmentName: params.attachmentName,
      status: 'PENDING',
      statusHistory: [
        {
          status: 'PENDING',
          timestamp: `${nowStr} ${nowTimeStr}`,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          note: `Requested for ${params.slot.day} at ${params.slot.time}`,
        },
      ],
      sharedNotes: '',
      actionItems: [],
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    setSessions((prev) => [newSession, ...prev]);
    addToast('success', 'Mentorship Requested', `Request sent to ${mentor.name}. They will be notified.`);
    return { success: true };
  };

  const acceptSession = (sessionId: string, meetingLink?: string) => {
    // TODO: replace with API call: PATCH /api/mentorship/requests/:id/accept
    const nowStr = new Date().toLocaleString();
    const link = meetingLink || `https://meet.google.com/bau-${Math.random().toString(36).substring(2, 6)}-live`;

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          status: 'ACCEPTED',
          meetingLink: link,
          updatedAt: nowStr,
          statusHistory: [
            ...s.statusHistory,
            {
              status: 'ACCEPTED',
              timestamp: nowStr,
              actorName: currentUser.name,
              actorRole: currentUser.role,
              note: `Session confirmed. Video link: ${link}`,
            },
          ],
        };
      })
    );
    addToast('success', 'Session Accepted', 'Google Meet link has been generated and student has been notified.');
  };

  const declineSession = (sessionId: string, reason: string, note?: string) => {
    // TODO: replace with API call: PATCH /api/mentorship/requests/:id/decline
    const nowStr = new Date().toLocaleString();

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          status: 'REJECTED',
          rejectionReason: reason + (note ? `: ${note}` : ''),
          rejectionSuggestions: ['alm-1', 'alm-2', 'alm-22'],
          updatedAt: nowStr,
          statusHistory: [
            ...s.statusHistory,
            {
              status: 'REJECTED',
              timestamp: nowStr,
              actorName: currentUser.name,
              actorRole: currentUser.role,
              note: reason,
            },
          ],
        };
      })
    );
    addToast('info', 'Request Declined', 'Student has been informed with suggestions for alternative mentors.');
  };

  const cancelSession = (sessionId: string, reason?: string) => {
    // TODO: replace with API call: PATCH /api/mentorship/requests/:id/cancel
    const nowStr = new Date().toLocaleString();

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          status: 'CANCELLED',
          updatedAt: nowStr,
          statusHistory: [
            ...s.statusHistory,
            {
              status: 'CANCELLED',
              timestamp: nowStr,
              actorName: currentUser.name,
              actorRole: currentUser.role,
              note: reason || 'Cancelled by user',
            },
          ],
        };
      })
    );
    addToast('warning', 'Session Cancelled', 'The session slot has been released.');
  };

  const startSession = (sessionId: string) => {
    // TODO: replace with API call: PATCH /api/mentorship/requests/:id/start
    const nowStr = new Date().toLocaleString();

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          status: 'IN_PROGRESS',
          updatedAt: nowStr,
          statusHistory: [
            ...s.statusHistory,
            {
              status: 'IN_PROGRESS',
              timestamp: nowStr,
              actorName: currentUser.name,
              actorRole: currentUser.role,
              note: 'Call initiated',
            },
          ],
        };
      })
    );
  };

  const completeSession = (
    sessionId: string,
    rating: number,
    review: string,
    tags: string[],
    recommended: boolean
  ) => {
    // TODO: replace with API call: POST /api/mentorship/sessions/:id/complete
    const nowStr = new Date().toLocaleString();
    const session = sessions.find((s) => s.id === sessionId);

    if (session) {
      // Update mentor's live rating and reviews
      setMentors((prev) =>
        prev.map((m) => {
          if (m.id !== session.mentorId) return m;

          const newTotalReviews = m.reviewCount + 1;
          const newAvgRating = parseFloat(
            ((m.rating * m.reviewCount + rating) / newTotalReviews).toFixed(2)
          );
          const ratingKey = Math.min(Math.max(Math.round(rating), 1), 5) as 1 | 2 | 3 | 4 | 5;

          const newReviewObj = {
            id: 'rev-' + Date.now(),
            studentId: session.studentId,
            studentName: session.studentName,
            studentAvatar: session.studentAvatar,
            studentDept: session.studentDept,
            studentBatch: session.studentBatch,
            rating,
            tags,
            comment: review,
            recommended,
            date: 'Today',
          };

          return {
            ...m,
            rating: newAvgRating,
            reviewCount: newTotalReviews,
            sessionsCompleted: m.sessionsCompleted + 1,
            studentsMentored: m.studentsMentored + 1,
            ratingBreakdown: {
              ...m.ratingBreakdown,
              [ratingKey]: m.ratingBreakdown[ratingKey] + 1,
            },
            reviews: [newReviewObj, ...m.reviews],
          };
        })
      );
    }

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          status: 'COMPLETED',
          studentRating: rating,
          studentReview: review,
          studentTags: tags,
          studentRecommended: recommended,
          updatedAt: nowStr,
          statusHistory: [
            ...s.statusHistory,
            {
              status: 'COMPLETED',
              timestamp: nowStr,
              actorName: currentUser.name,
              actorRole: currentUser.role,
              note: `Session marked complete with ${rating}-star review`,
            },
          ],
        };
      })
    );

    addToast('success', 'Session Completed', 'Thank you! Your feedback has been recorded and mentor rating updated live.');
  };

  const updateSessionNotes = (sessionId: string, notes: string) => {
    // TODO: replace with API call: PATCH /api/mentorship/sessions/:id/notes
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, sharedNotes: notes } : s))
    );
  };

  const addActionItem = (sessionId: string, text: string) => {
    // TODO: replace with API call: POST /api/mentorship/sessions/:id/actions
    const newItem: ActionItem = {
      id: 'act-' + Date.now(),
      text,
      completed: false,
      addedBy: currentUser.name,
    };
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, actionItems: [...(s.actionItems || []), newItem] }
          : s
      )
    );
    addToast('info', 'Action Item Added', text);
  };

  const toggleActionItem = (sessionId: string, itemId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          actionItems: s.actionItems.map((a) =>
            a.id === itemId ? { ...a, completed: !a.completed } : a
          ),
        };
      })
    );
  };

  // CV Review Actions
  const requestCVReview = (params: {
    mentorId: string;
    targetRole: string;
    targetSector: string;
    version: string;
    cvFileName: string;
    cvFileSize: string;
    deadlinePreference: 'Standard (3-5 days)' | 'Urgent (24-48 hours)';
    studentNotes?: string;
  }) => {
    // TODO: replace with API call: POST /api/cv-reviews
    const mentor = getMentorById(params.mentorId) || mentors[0];
    const newId = `CVR-${Math.floor(200 + Math.random() * 800)}`;
    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const newReview: CVReviewItem = {
      id: newId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentAvatar: currentUser.avatar,
      studentDept: (currentUser as any).department || 'CSE',
      studentBatch: (currentUser as any).batch || '18th Batch',
      mentorId: mentor.id,
      mentorName: mentor.name,
      mentorAvatar: mentor.avatar,
      mentorCompany: mentor.company,
      targetRole: params.targetRole,
      targetSector: params.targetSector,
      version: params.version,
      cvFileName: params.cvFileName,
      cvFileSize: params.cvFileSize,
      submittedAt: nowStr,
      deadlinePreference: params.deadlinePreference,
      status: 'SUBMITTED',
      studentNotes: params.studentNotes,
    };

    setCvReviews((prev) => [newReview, ...prev]);
    addToast('success', 'CV Review Submitted', `Sent to ${mentor.name} (${params.version}).`);
  };

  const submitCVReview = (params: {
    reviewId: string;
    overallScore: number;
    categoryScores: CVCategoryScore[];
    strengths: string[];
    areasToImprove: string[];
    sectionComments: SectionComment[];
    mentorSummary: string;
  }) => {
    // TODO: replace with API call: POST /api/cv-reviews/:id/evaluation
    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const ratingOutOf5 = parseFloat(((params.overallScore / 100) * 5).toFixed(1));

    setCvReviews((prev) =>
      prev.map((c) => {
        if (c.id !== params.reviewId) return c;
        return {
          ...c,
          status: 'REVIEWED',
          overallScore: params.overallScore,
          overallRating: ratingOutOf5,
          categoryScores: params.categoryScores,
          strengths: params.strengths,
          areasToImprove: params.areasToImprove,
          sectionComments: params.sectionComments,
          mentorSummary: params.mentorSummary,
          reviewedAt: nowStr,
        };
      })
    );
    addToast('success', 'CV Review Published', 'Your rating and constructive feedback are now visible to the student.');
  };

  const sendCVThanks = (reviewId: string) => {
    setCvReviews((prev) =>
      prev.map((c) => (c.id === reviewId ? { ...c, thanksSent: true } : c))
    );
    addToast('success', 'Thank You Note Sent', 'Sent your appreciation to your alumni mentor!');
  };

  // Goals
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
        savedMentorIds,
        goals,
        toggleSaveMentor,
        getMentorById,
        calculateMatchScore,
        requestSession,
        acceptSession,
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
