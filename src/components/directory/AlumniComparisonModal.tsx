/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  X, 
  Scale, 
  GraduationCap, 
  Briefcase, 
  Award, 
  Calendar, 
  MessageSquare, 
  Star, 
  CheckCircle2, 
  Lock 
} from 'lucide-react';
import { DirectoryAlumniProfile } from '../../types/directory';

interface AlumniComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  comparedAlumni: DirectoryAlumniProfile[];
  onRemoveFromCompare: (id: string) => void;
}

export const AlumniComparisonModal: React.FC<AlumniComparisonModalProps> = ({
  isOpen,
  onClose,
  comparedAlumni,
  onRemoveFromCompare
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-navy text-white flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Alumni Side-by-Side Comparison
              </h2>
              <p className="text-xs text-slate-500">
                Comparing {comparedAlumni.length} profile{comparedAlumni.length > 1 ? 's' : ''} (up to 3)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Comparison Table */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {comparedAlumni.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Scale className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700">No Alumni Selected for Comparison</p>
              <p className="text-xs text-slate-400 mt-1">Check the "Compare" box on any alumni card to view them side-by-side.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="w-1/4 p-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Metric / Details
                    </th>
                    {comparedAlumni.map((alumnus) => (
                      <th key={alumnus.id} className="p-3 align-top w-1/3">
                        <div className="relative bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <button
                            onClick={() => onRemoveFromCompare(alumnus.id)}
                            className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 p-1"
                            title="Remove from comparison"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <div className="flex items-center gap-3">
                            <img
                              src={alumnus.avatar}
                              alt={alumnus.name}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
                            />
                            <div>
                              <div className="font-bold text-slate-900 text-sm flex items-center gap-1">
                                {alumnus.name}
                                {alumnus.isVerified && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                                )}
                              </div>
                              <div className="text-xs font-medium text-navy">{alumnus.company}</div>
                            </div>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {/* Row: Role & Sector */}
                  <tr>
                    <td className="p-3 font-bold text-slate-500 bg-slate-50/50">Current Role & Sector</td>
                    {comparedAlumni.map((a) => (
                      <td key={a.id} className="p-3">
                        <div className="font-semibold text-slate-900">{a.designation}</div>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {a.sector}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Row: BAUST Academic Credentials */}
                  <tr>
                    <td className="p-3 font-bold text-slate-500 bg-slate-50/50">BAUST Department & Batch</td>
                    {comparedAlumni.map((a) => (
                      <td key={a.id} className="p-3">
                        <div className="font-medium text-slate-800">
                          {a.department} ({a.batch})
                        </div>
                        <div className="text-slate-400 text-[11px]">Class of {a.passingYear} • ID {a.studentIdMasked}</div>
                      </td>
                    ))}
                  </tr>

                  {/* Row: CGPA */}
                  <tr>
                    <td className="p-3 font-bold text-slate-500 bg-slate-50/50">Graduation CGPA</td>
                    {comparedAlumni.map((a) => (
                      <td key={a.id} className="p-3">
                        {a.privacy?.cgpa !== 'hidden' ? (
                          <span className="inline-block px-2 py-0.5 rounded font-bold bg-amber-50 text-amber-900 border border-amber-200 text-xs">
                            {a.cgpa.toFixed(2)} / 4.00
                          </span>
                        ) : (
                          <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                            <Lock className="w-3 h-3" /> Protected
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Row: Thesis Title & Supervisor */}
                  <tr>
                    <td className="p-3 font-bold text-slate-500 bg-slate-50/50">Undergraduate Thesis</td>
                    {comparedAlumni.map((a) => (
                      <td key={a.id} className="p-3">
                        <p className="font-medium text-slate-800 italic line-clamp-2">
                          "{a.thesisTitle}"
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Supervisor: {a.thesisSupervisor}
                        </p>
                      </td>
                    ))}
                  </tr>

                  {/* Row: Top Skills */}
                  <tr>
                    <td className="p-3 font-bold text-slate-500 bg-slate-50/50">Top Skills & Endorsements</td>
                    {comparedAlumni.map((a) => (
                      <td key={a.id} className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {(a.skillsWithLevels?.slice(0, 4) || []).map((sk) => (
                            <span
                              key={sk.id}
                              className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 font-medium border border-slate-200"
                            >
                              {sk.name} {sk.endorsements?.length ? `(${sk.endorsements.length} ✦)` : ''}
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row: Mentorship Impact */}
                  <tr>
                    <td className="p-3 font-bold text-slate-500 bg-slate-50/50">Mentorship Status</td>
                    {comparedAlumni.map((a) => (
                      <td key={a.id} className="p-3">
                        {a.mentoringAvailable ? (
                          <div className="space-y-1">
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                              Active Mentor
                            </span>
                            <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              <span className="font-bold">{a.rating.toFixed(1)}</span>
                              <span>({a.studentsConsulted || a.totalMentees} students consulted)</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">Currently unavailable for 1:1 sessions</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Row: Direct Actions */}
                  <tr>
                    <td className="p-3 font-bold text-slate-500 bg-slate-50/50">Next Step</td>
                    {comparedAlumni.map((a) => (
                      <td key={a.id} className="p-3">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Link
                            to={`/student/directory/${a.id}`}
                            className="text-xs font-semibold px-3 py-1.5 text-center rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors"
                          >
                            Full Profile
                          </Link>
                          {a.mentoringAvailable ? (
                            <Link
                              to={`/student/mentorship/mentor/${a.id}`}
                              className="text-xs font-semibold px-3 py-1.5 text-center rounded-xl bg-[#2E5E3E] text-white hover:bg-[#234930] transition-colors"
                            >
                              Mentorship
                            </Link>
                          ) : (
                            <Link
                              to={`/chat?user=${a.id}`}
                              className="text-xs font-semibold px-3 py-1.5 text-center rounded-xl bg-navy text-white hover:bg-[#091f37] transition-colors"
                            >
                              Message
                            </Link>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="text-xs font-bold px-4 py-2 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
