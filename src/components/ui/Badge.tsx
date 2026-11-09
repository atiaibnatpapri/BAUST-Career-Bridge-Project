/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export type BadgeVariant = 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'in-progress' 
  | 'ready' 
  | 'delivered'
  | 'navy'
  | 'army'
  | 'gold'
  | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  icon,
}) => {
  const sizeClasses = {
    sm: 'text-[11px] font-medium px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
  };

  const variantClasses: Record<BadgeVariant, string> = {
    pending: 'bg-amber-50 text-amber-800 border border-amber-200',
    approved: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    rejected: 'bg-rose-50 text-rose-800 border border-rose-200',
    'in-progress': 'bg-sky-50 text-sky-800 border border-sky-200',
    ready: 'bg-teal-50 text-teal-800 border border-teal-200',
    delivered: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
    navy: 'bg-[#0F2A4A]/10 text-[#0F2A4A] border border-[#0F2A4A]/20',
    army: 'bg-[#2E5E3E]/10 text-[#2E5E3E] border border-[#2E5E3E]/20',
    gold: 'bg-[#C9A227]/15 text-[#916E0A] border border-[#C9A227]/30',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg whitespace-nowrap ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {icon}
      <span>{children}</span>
    </span>
  );
};
