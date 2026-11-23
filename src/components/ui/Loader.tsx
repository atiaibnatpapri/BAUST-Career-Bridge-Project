/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GraduationCap } from 'lucide-react';

interface LoaderProps {
  label?: string;
  fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({
  label = 'Loading BAUST Career Bridge...',
  fullScreen = false,
}) => {
  return (
    <div
      className={`${
        fullScreen ? 'min-h-screen' : 'min-h-[50vh]'
      } flex flex-col items-center justify-center p-6 text-center`}
      role="status"
      aria-live="polite"
    >
      <div className="relative flex items-center justify-center mb-4">
        <div className="w-14 h-14 rounded-2xl border-4 border-slate-200 border-t-[#0F2A4A] border-r-[#C9A227] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-[#0F2A4A]" />
        </div>
      </div>
      <p className="text-xs font-bold text-[#0F2A4A] tracking-wide">{label}</p>
      <p className="text-xs text-slate-500 mt-1">
        Synchronizing university portal data...
      </p>
    </div>
  );
};
