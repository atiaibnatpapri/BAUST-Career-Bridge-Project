/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { QrCode, X, Copy, Check, Share2, ExternalLink } from 'lucide-react';
import { DirectoryAlumniProfile } from '../../types/directory';

interface AlumniQrCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  alumnus: DirectoryAlumniProfile;
}

export const AlumniQrCardModal: React.FC<AlumniQrCardModalProps> = ({
  isOpen,
  onClose,
  alumnus
}) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const profileUrl = `${window.location.origin}/student/directory/${alumnus.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden text-center">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 text-slate-800">
            <Share2 className="w-4 h-4 text-navy" />
            <h3 className="font-bold text-sm">Share Alumni Profile</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-4">
          {/* Virtual Card Preview */}
          <div className="p-4 rounded-2xl bg-linear-to-br from-[#0F2A4A] to-[#2E5E3E] text-white shadow-md text-left relative overflow-hidden">
            <div className="absolute top-2 right-2 text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
              BAUST Saidpur
            </div>
            <div className="flex items-center gap-3 mb-3">
              <img
                src={alumnus.avatar}
                alt={alumnus.name}
                className="w-12 h-12 rounded-xl object-cover border-2 border-white/50"
              />
              <div>
                <div className="font-bold text-sm leading-snug">{alumnus.name}</div>
                <div className="text-[11px] text-slate-200">{alumnus.designation}</div>
                <div className="text-[10px] text-amber-300 font-semibold">{alumnus.company}</div>
              </div>
            </div>
            <div className="text-[10px] text-slate-200 border-t border-white/20 pt-2 flex justify-between">
              <span>{alumnus.department} • {alumnus.batch}</span>
              <span>Class of {alumnus.passingYear}</span>
            </div>
          </div>

          {/* QR Code SVG Mock */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl inline-block mx-auto">
            <div className="w-40 h-40 bg-white p-2 border border-slate-200 rounded-xl flex items-center justify-center">
              {/* Scalable SVG QR code representation */}
              <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900" fill="currentColor">
                <rect x="0" y="0" width="30" height="30" rx="3" />
                <rect x="5" y="5" width="20" height="20" fill="white" />
                <rect x="10" y="10" width="10" height="10" fill="currentColor" />
                
                <rect x="70" y="0" width="30" height="30" rx="3" />
                <rect x="75" y="5" width="20" height="20" fill="white" />
                <rect x="80" y="10" width="10" height="10" fill="currentColor" />

                <rect x="0" y="70" width="30" height="30" rx="3" />
                <rect x="5" y="75" width="20" height="20" fill="white" />
                <rect x="10" y="80" width="10" height="10" fill="currentColor" />

                {/* Random QR data points */}
                <rect x="40" y="10" width="8" height="8" />
                <rect x="52" y="15" width="8" height="8" />
                <rect x="40" y="25" width="8" height="8" />
                <rect x="10" y="45" width="8" height="8" />
                <rect x="25" y="40" width="8" height="8" />
                <rect x="40" y="45" width="20" height="10" />
                <rect x="70" y="45" width="10" height="15" />
                <rect x="45" y="65" width="15" height="10" />
                <rect x="70" y="75" width="10" height="10" />
                <rect x="85" y="85" width="8" height="8" />
              </svg>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 font-medium">Scan to open on smartphone</p>
          </div>

          {/* Copy Link Input */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-xl border border-slate-200 bg-slate-50">
            <input
              type="text"
              readOnly
              value={profileUrl}
              className="text-xs bg-transparent text-slate-600 px-2 flex-1 focus:outline-hidden truncate"
            />
            <button
              onClick={handleCopy}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all ${
                copied ? 'bg-emerald-600 text-white' : 'bg-navy text-white hover:bg-[#0b1f36]'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
