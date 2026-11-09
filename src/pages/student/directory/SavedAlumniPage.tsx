/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ArrowLeft, GraduationCap, Users } from 'lucide-react';
import { useDirectoryStore } from '../../../hooks/useDirectoryStore';
import { AlumniDirectoryCard } from '../../../components/directory/AlumniDirectoryCard';

export const SavedAlumniPage: React.FC = () => {
  const { alumniProfiles, savedAlumniIds, toggleSaveAlumni } = useDirectoryStore();

  const savedProfiles = useMemo(() => {
    return alumniProfiles.filter((p) => savedAlumniIds.includes(p.id));
  }, [alumniProfiles, savedAlumniIds]);

  return (
    <div className="space-y-6 pb-20">
      {/* Top Navigation */}
      <div className="flex items-center gap-3">
        <Link
          to="/student/directory"
          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#0F2A4A] tracking-tight">
              Saved Alumni Bookmarks
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
              {savedProfiles.length} Saved
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Keep track of alumni you want to reach out to for mentorship, referrals, or technical guidance.
          </p>
        </div>
      </div>

      {savedProfiles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <Bookmark className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Saved Alumni Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You can bookmark any alumni card in the directory to quickly access their profiles and contact options here.
          </p>
          <Link
            to="/student/directory"
            className="inline-block mt-4 px-4 py-2 bg-navy text-white text-xs font-bold rounded-xl hover:bg-[#0b1f36] transition-colors"
          >
            Explore Alumni Directory
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {savedProfiles.map((alumnus) => (
            <AlumniDirectoryCard
              key={alumnus.id}
              profile={alumnus}
              isSaved={true}
              onToggleSave={toggleSaveAlumni}
            />
          ))}
        </div>
      )}
    </div>
  );
};
