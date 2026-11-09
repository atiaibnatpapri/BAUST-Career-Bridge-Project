/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { UserCheck, ShieldAlert, GraduationCap, Briefcase, ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const DemoRoleSwitcher: React.FC = () => {
  const { role, setRole, currentUser } = useApp();
  const { firebaseUser, userProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const roles: {
    id: UserRole;
    name: string;
    persona: string;
    subtext: string;
    icon: React.ReactNode;
    color: string;
    defaultRoute: string;
  }[] = [
    {
      id: 'student',
      name: 'Current Student',
      persona: 'Md. Tanvir Ahmed',
      subtext: 'CSE 18th Batch (Seeking Mentorship & Jobs)',
      icon: <GraduationCap className="w-4 h-4 text-emerald-600" />,
      color: 'hover:border-emerald-500',
      defaultRoute: '/student/dashboard',
    },
    {
      id: 'alumni',
      name: 'Verified Alumni',
      persona: 'Kazi Farhan Kabir',
      subtext: 'Senior Software Engineer @ Brain Station 23',
      icon: <Briefcase className="w-4 h-4 text-sky-600" />,
      color: 'hover:border-sky-500',
      defaultRoute: '/alumni/dashboard',
    },
    {
      id: 'admin',
      name: 'University Admin',
      persona: 'Prof. Dr. Registrar Office',
      subtext: 'Verification Queue & Exam Service Desk',
      icon: <ShieldAlert className="w-4 h-4 text-amber-600" />,
      color: 'hover:border-amber-500',
      defaultRoute: '/admin/dashboard',
    },
  ];

  const handleSwitch = (newRole: UserRole, targetRoute: string) => {
    setRole(newRole);
    setIsOpen(false);
    navigate(targetRoute);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C9A227]">
                Live Evaluator & Roles
              </span>
              <h4 className="text-sm font-bold text-[#0F2A4A]">Switch Persona Instantly</h4>
            </div>
            {firebaseUser ? (
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Firebase Auth
              </span>
            ) : (
              <span className="text-[11px] font-medium bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">
                Persona Mode
              </span>
            )}
          </div>

          <div className="mt-3 space-y-2">
            {roles.map((item) => {
              const isCurrent = role === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSwitch(item.id, item.defaultRoute)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${item.color} ${
                    isCurrent
                      ? 'border-[#0F2A4A] bg-[#0F2A4A]/5 ring-1 ring-[#0F2A4A]'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white shadow-xs border border-slate-100">
                      {item.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">{item.name}</span>
                        {isCurrent && (
                          <span className="text-[9px] font-bold bg-[#0F2A4A] text-white px-1.5 py-0.2 rounded">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-slate-700">{item.persona}</p>
                      <p className="text-[10px] text-slate-500">{item.subtext}</p>
                    </div>
                  </div>
                  {isCurrent && <UserCheck className="w-4 h-4 text-[#0F2A4A] shrink-0" />}
                </button>
              );
            })}
          </div>

          <p className="text-[10px] text-slate-400 mt-3 text-center">
            Review all 17 features & roles seamlessly for faculty evaluation.
          </p>
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-4 py-2.5 bg-[#0F2A4A] hover:bg-[#1A3E68] text-white rounded-full shadow-xl border-2 border-[#C9A227] transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="Switch Demo Role"
      >
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="text-xs font-bold tracking-wide">
          Role: <span className="text-[#C9A227] uppercase">{role}</span>
        </span>
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </button>
    </div>
  );
};
