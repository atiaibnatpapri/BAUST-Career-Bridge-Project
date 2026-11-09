/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, MapPin, Mail, Phone, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0F2A4A] text-white border-t border-[#0F2A4A]/20 pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-white/10">
          
          {/* Col 1 & 2: University Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2E5E3E] border border-[#C9A227] flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-[#C9A227]" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold tracking-tight">
                  BAUST <span className="text-[#C9A227]">Career Bridge</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Bangladesh Army University of Science and Technology
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              The official centralized career development, alumni engagement, and digital administrative document network for BAUST students, graduates, and faculty.
            </p>

            <div className="space-y-2 text-xs text-slate-300 pt-2">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
                <span>Saidpur Cantonment, Saidpur, Nilphamari-5311, Bangladesh</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#C9A227] shrink-0" />
                <span>careerbridge@baust.edu.bd / info@baust.edu.bd</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#C9A227] shrink-0" />
                <span>+880 5526 73400, +880 1769-675556</span>
              </div>
            </div>
          </div>

          {/* Col 3: Academic Faculties */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A227]">
              Academic Faculties
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>Computer Science & Eng. (CSE)</li>
              <li>Electrical & Electronic Eng. (EEE)</li>
              <li>Civil Engineering (CE)</li>
              <li>Mechanical Engineering (ME)</li>
              <li>Industrial & Production Eng. (IPE)</li>
              <li>Textile Engineering</li>
              <li>School of Business (BBA)</li>
              <li>Department of English</li>
            </ul>
          </div>

          {/* Col 4: Platform Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A227]">
              Career Network
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link to="/student/directory" className="hover:text-white transition-colors">
                  Verified Alumni Directory
                </Link>
              </li>
              <li>
                <Link to="/student/mentorship" className="hover:text-white transition-colors">
                  1-on-1 Mentorship Booking
                </Link>
              </li>
              <li>
                <Link to="/alumni/services" className="hover:text-white transition-colors">
                  University Document Desk
                </Link>
              </li>
              <li>
                <Link to="/chat" className="hover:text-white transition-colors">
                  Direct In-App Messaging
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Profile Verification Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Administration & Notice */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A227]">
              Administration
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>Office of the Registrar</li>
              <li>Controller of Examinations</li>
              <li>Alumni Relations Committee</li>
              <li>Training & Placement Cell</li>
              <li>
                <a 
                  href="https://www.baust.edu.bd" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-1 text-[#C9A227] hover:underline"
                >
                  Official BAUST Portal <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} Bangladesh Army University of Science and Technology (BAUST). All Rights Reserved.</p>
          <p className="flex items-center gap-4">
            <span>Administered by Bangladesh Army</span>
            <span>·</span>
            <span>Accredited by UGC Bangladesh & IEB</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
