/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  DirectoryAlumniProfile, 
  AlumniConnectionRequest, 
  SavedSearchSet, 
  ProfileReportSubmission, 
  SkillItem 
} from '../types/directory';
import { initialAlumniProfiles } from '../data/alumniProfiles';
import { Department } from '../types';

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

const STORAGE_KEYS = {
  PROFILES: 'baust_directory_profiles_v2',
  SAVED_IDS: 'baust_saved_alumni_ids',
  CONNECTIONS: 'baust_alumni_connections',
  SAVED_SEARCHES: 'baust_saved_searches',
  REPORTS: 'baust_profile_reports'
};

const initialConnections: AlumniConnectionRequest[] = [
  {
    id: 'conn-1',
    studentId: 'stu-current',
    studentName: 'Tanvir Hossain Fahim',
    studentEmail: 'tanvir.fahim@baust.edu.bd',
    studentDept: 'CSE',
    studentBatch: '10th Batch',
    studentAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    alumniId: 'alm-1',
    purpose: 'Career Advice',
    note: 'Assalamu Alaikum brother Farhan, I am preparing for software engineering roles in MERN stack and would love to connect for occasional advice.',
    status: 'Pending',
    sentAt: '2025-02-14T10:30:00Z'
  },
  {
    id: 'conn-2',
    studentId: 'stu-current',
    studentName: 'Tanvir Hossain Fahim',
    studentEmail: 'tanvir.fahim@baust.edu.bd',
    studentDept: 'CSE',
    studentBatch: '10th Batch',
    studentAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    alumniId: 'alm-2',
    purpose: 'Higher Study Guidance',
    note: 'Interested in your Bengali NLP research publications. Seeking guidance on undergraduate paper publishing.',
    status: 'Accepted',
    sentAt: '2025-02-01T14:15:00Z',
    respondedAt: '2025-02-02T09:00:00Z'
  }
];

const initialSavedSearches: SavedSearchSet[] = [
  {
    id: 'search-1',
    title: 'CSE Top Mentors in Dhaka',
    searchTerm: '',
    department: 'CSE',
    sector: 'Private',
    batchMin: 1,
    batchMax: 10,
    cgpaMin: 3.5,
    mentoringOnly: true,
    referralsOnly: false,
    hiringOnly: false,
    createdAt: '2025-02-10'
  },
  {
    id: 'search-2',
    title: 'Govt & BCS Officers (EEE/CSE/ME)',
    searchTerm: 'BCS',
    department: 'All',
    sector: 'Government',
    batchMin: 1,
    batchMax: 10,
    cgpaMin: 0,
    mentoringOnly: false,
    referralsOnly: false,
    hiringOnly: false,
    createdAt: '2025-02-12'
  }
];

const DirectoryStoreContext = createContext<DirectoryStoreContextType | undefined>(undefined);

export const DirectoryStoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Profiles State
  const [alumniProfiles, setAlumniProfiles] = useState<DirectoryAlumniProfile[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 30) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load alumni profiles from storage', e);
    }
    return initialAlumniProfiles;
  });

  // 2. Saved Alumni IDs
  const [savedAlumniIds, setSavedAlumniIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SAVED_IDS);
      return stored ? JSON.parse(stored) : ['alm-1', 'alm-4', 'alm-3'];
    } catch {
      return ['alm-1', 'alm-4', 'alm-3'];
    }
  });

  // 3. Connections
  const [connections, setConnections] = useState<AlumniConnectionRequest[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CONNECTIONS);
      return stored ? JSON.parse(stored) : initialConnections;
    } catch {
      return initialConnections;
    }
  });

  // 4. Saved Search Sets
  const [savedSearches, setSavedSearches] = useState<SavedSearchSet[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SAVED_SEARCHES);
      return stored ? JSON.parse(stored) : initialSavedSearches;
    } catch {
      return initialSavedSearches;
    }
  });

  // 5. Reports
  const [reports, setReports] = useState<ProfileReportSubmission[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REPORTS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(alumniProfiles));
    } catch (e) {
      console.warn('Failed to save profiles to localStorage', e);
    }
  }, [alumniProfiles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SAVED_IDS, JSON.stringify(savedAlumniIds));
  }, [savedAlumniIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify(connections));
  }, [connections]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SAVED_SEARCHES, JSON.stringify(savedSearches));
  }, [savedSearches]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  }, [reports]);

  // Methods
  const getProfileById = (id: string): DirectoryAlumniProfile | undefined => {
    return alumniProfiles.find((p) => p.id === id);
  };

  const toggleSaveAlumni = (id: string) => {
    setSavedAlumniIds((prev) => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter((i) => i !== id) : [...prev, id];
      
      // Update bookmark count on profile
      setAlumniProfiles((profiles) =>
        profiles.map((p) => {
          if (p.id === id) {
            const currentCount = p.stats?.bookmarksCount || 0;
            return {
              ...p,
              stats: {
                ...p.stats,
                bookmarksCount: exists ? Math.max(0, currentCount - 1) : currentCount + 1
              }
            };
          }
          return p;
        })
      );

      // TODO: replace with API call: POST /api/directory/save
      return updated;
    });
  };

  const isAlumniSaved = (id: string): boolean => {
    return savedAlumniIds.includes(id);
  };

  const updateAlumniProfile = (id: string, updates: Partial<DirectoryAlumniProfile>) => {
    setAlumniProfiles((prev) =>
      prev.map((profile) => {
        if (profile.id !== id) return profile;

        // Detect sensitive changes that trigger re-verification notice
        const sensitiveChange = 
          (updates.department && updates.department !== profile.department) ||
          (updates.batchNumber && updates.batchNumber !== profile.batchNumber) ||
          (updates.studentIdMasked && updates.studentIdMasked !== profile.studentIdMasked);

        const merged: DirectoryAlumniProfile = {
          ...profile,
          ...updates,
          isReverificationPending: sensitiveChange ? true : profile.isReverificationPending,
          reverificationNotice: sensitiveChange 
            ? 'Department, batch or student ID changes require re-verification by BAUST registrar office.' 
            : profile.reverificationNotice,
          lastUpdated: new Date().toISOString().split('T')[0]
        };

        // TODO: replace with API call: PUT /api/directory/profiles/:id
        return merged;
      })
    );
  };

  const endorseSkill = (
    alumniId: string, 
    skillName: string, 
    studentInfo: { studentId: string; studentName: string; studentDept: Department; comment?: string }
  ): boolean => {
    let success = false;
    setAlumniProfiles((prev) =>
      prev.map((profile) => {
        if (profile.id !== alumniId) return profile;

        // Find or create skill
        let skillFound = false;
        const updatedSkills: SkillItem[] = (profile.skillsWithLevels || []).map((sk) => {
          if (sk.name.toLowerCase() === skillName.toLowerCase()) {
            skillFound = true;
            // Check if student already endorsed
            const alreadyEndorsed = sk.endorsements?.some((e) => e.studentId === studentInfo.studentId);
            if (alreadyEndorsed) return sk;

            success = true;
            return {
              ...sk,
              endorsements: [
                ...(sk.endorsements || []),
                {
                  studentId: studentInfo.studentId,
                  studentName: studentInfo.studentName,
                  studentDept: studentInfo.studentDept,
                  date: new Date().toISOString().split('T')[0],
                  comment: studentInfo.comment
                }
              ]
            };
          }
          return sk;
        });

        if (!skillFound) {
          // If skill not in withLevels, add it
          success = true;
          updatedSkills.push({
            id: `sk-${Date.now()}`,
            name: skillName,
            level: 'Intermediate',
            endorsements: [
              {
                studentId: studentInfo.studentId,
                studentName: studentInfo.studentName,
                studentDept: studentInfo.studentDept,
                date: new Date().toISOString().split('T')[0],
                comment: studentInfo.comment
              }
            ]
          });
        }

        const totalEndorsements = updatedSkills.reduce((sum, s) => sum + (s.endorsements?.length || 0), 0);

        // TODO: replace with API call: POST /api/directory/profiles/:id/endorse
        return {
          ...profile,
          skillsWithLevels: updatedSkills,
          skills: Array.from(new Set([...profile.skills, skillName])),
          stats: {
            ...profile.stats,
            endorsementsReceived: totalEndorsements
          }
        };
      })
    );

    return success;
  };

  const sendConnectionRequest = (req: Omit<AlumniConnectionRequest, 'id' | 'status' | 'sentAt'>) => {
    const newReq: AlumniConnectionRequest = {
      ...req,
      id: `conn-${Date.now()}`,
      status: 'Pending',
      sentAt: new Date().toISOString()
    };
    // TODO: replace with API call: POST /api/directory/connections
    setConnections((prev) => [newReq, ...prev]);
  };

  const respondConnectionRequest = (requestId: string, status: 'Accepted' | 'Declined') => {
    setConnections((prev) =>
      prev.map((c) =>
        c.id === requestId
          ? { ...c, status, respondedAt: new Date().toISOString() }
          : c
      )
    );
    // TODO: replace with API call: PATCH /api/directory/connections/:id
  };

  const saveSearchSet = (search: Omit<SavedSearchSet, 'id' | 'createdAt'>) => {
    const newSearch: SavedSearchSet = {
      ...search,
      id: `search-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setSavedSearches((prev) => [newSearch, ...prev]);
    // TODO: replace with API call: POST /api/directory/saved-searches
  };

  const deleteSavedSearch = (id: string) => {
    setSavedSearches((prev) => prev.filter((s) => s.id !== id));
    // TODO: replace with API call: DELETE /api/directory/saved-searches/:id
  };

  const submitProfileReport = (report: Omit<ProfileReportSubmission, 'id' | 'status' | 'submittedAt'>) => {
    const newReport: ProfileReportSubmission = {
      ...report,
      id: `rep-${Date.now()}`,
      status: 'Pending',
      submittedAt: new Date().toISOString()
    };
    setReports((prev) => [newReport, ...prev]);
    // TODO: replace with API call: POST /api/directory/reports
  };

  const resetProfilesToDefault = () => {
    localStorage.removeItem(STORAGE_KEYS.PROFILES);
    setAlumniProfiles(initialAlumniProfiles);
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
        resetProfilesToDefault
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
