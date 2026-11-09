/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBg = 'bg-[#0F2A4A]/10 text-[#0F2A4A]',
  trend,
}) => {
  return (
    <Card className="flex items-start justify-between p-5">
      <div className="space-y-1">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl md:text-3xl font-extrabold text-[#0F2A4A] tabular-nums tracking-tight">
          {value}
        </p>
        {(subtitle || trend) && (
          <div className="flex items-center gap-1.5 text-xs pt-1">
            {trend && (
              <span
                className={`font-semibold ${
                  trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {trend.value}
              </span>
            )}
            {subtitle && <span className="text-slate-500">{subtitle}</span>}
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl shrink-0 ${iconBg}`}>{icon}</div>
    </Card>
  );
};
