/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  Users, 
  ShieldCheck, 
  GraduationCap, 
  Building2, 
  Globe2, 
  Sparkles,
  PieChart as PieIcon,
  BarChart3
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { DirectoryAlumniProfile } from '../../types/directory';

interface DirectoryInsightsStripProps {
  profiles: DirectoryAlumniProfile[];
  onSectorClick?: (sector: string) => void;
}

const SECTOR_COLORS: Record<string, string> = {
  Private: '#0F2A4A',
  Government: '#2E5E3E',
  Abroad: '#0284C7',
  Research: '#7C3AED',
  Business: '#D97706',
  Freelancing: '#059669',
  'Higher Study': '#DC2626'
};

export const DirectoryInsightsStrip: React.FC<DirectoryInsightsStripProps> = ({ profiles, onSectorClick }) => {
  const stats = useMemo(() => {
    const total = profiles.length;
    const verified = profiles.filter((p) => p.isVerified).length;
    const openToMentor = profiles.filter((p) => p.mentoringAvailable).length;
    const openToRefer = profiles.filter((p) => p.openToReferrals).length;
    
    // Unique companies
    const companies = new Set(profiles.map((p) => p.company.trim()).filter(Boolean));
    // Unique countries
    const countries = new Set(profiles.map((p) => p.country?.trim() || 'Bangladesh'));

    // Sector breakdown
    const sectorCountMap: Record<string, number> = {};
    profiles.forEach((p) => {
      const sec = p.sector || 'Private';
      sectorCountMap[sec] = (sectorCountMap[sec] || 0) + 1;
    });

    const sectorData = Object.entries(sectorCountMap).map(([name, value]) => ({
      name,
      value,
      color: SECTOR_COLORS[name] || '#64748B'
    }));

    // Batch breakdown (e.g. 1st to 8th)
    const batchMap: Record<string, number> = {};
    profiles.forEach((p) => {
      const b = p.batch?.split(' ')[0] || `${p.batchNumber}th`;
      batchMap[b] = (batchMap[b] || 0) + 1;
    });

    const batchData = Object.entries(batchMap)
      .map(([name, count]) => ({
        name,
        count
      }))
      .slice(0, 8);

    return {
      total,
      verified,
      openToMentor,
      openToRefer,
      companyCount: companies.size,
      countryCount: countries.size,
      sectorData,
      batchData
    };
  }, [profiles]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 mb-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-navy/10 text-navy flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5 text-[#0F2A4A]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              BAUST Alumni Network Pulse
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                Live Directory
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Verified graduate placements across 14+ global tech hubs, civil services, and top universities
            </p>
          </div>
        </div>
      </div>

      {/* Grid: 5 Quick Stats + 2 Mini Charts */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 items-center">
        {/* Metric 1 */}
        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/60">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Users className="w-3.5 h-3.5 text-navy" />
            <span className="text-xs font-medium">Total Alumni</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-800">{stats.total}</div>
          <div className="text-[11px] text-emerald-600 font-medium">100% BAUST Grads</div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/60">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs font-medium">Verified Profiles</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-800">{stats.verified}</div>
          <div className="text-[11px] text-slate-500">Registrar verified</div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/60">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-medium">Open to Mentoring</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-800">{stats.openToMentor}</div>
          <div className="text-[11px] text-amber-600 font-medium">Active Mentors</div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/60">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Building2 className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-xs font-medium">Companies</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-800">{stats.companyCount}+</div>
          <div className="text-[11px] text-slate-500">MNC, Govt & Startups</div>
        </div>

        {/* Mini Chart 1: Sector Donut */}
        <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/60 flex flex-col justify-between h-[98px]">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-1">
            <span className="flex items-center gap-1">
              <PieIcon className="w-3 h-3 text-indigo-500" /> Sectors
            </span>
            <span className="text-[10px] text-slate-400">By Career</span>
          </div>
          <div className="h-14 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height={56}>
              <PieChart>
                <Pie
                  data={stats.sectorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={15}
                  outerRadius={26}
                  paddingAngle={2}
                  dataKey="value"
                  onClick={(entry: any) => onSectorClick && entry?.name && onSectorClick(entry.name)}
                  cursor="pointer"
                >
                  {stats.sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} alumni`, name]}
                  contentStyle={{ fontSize: '11px', borderRadius: '8px', padding: '4px 8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mini Chart 2: Batch Distribution Bar */}
        <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/60 flex flex-col justify-between h-[98px]">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-1">
            <span className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3 text-emerald-600" /> Batches
            </span>
            <span className="text-[10px] text-slate-400">1st - 8th</span>
          </div>
          <div className="h-14 w-full">
            <ResponsiveContainer width="100%" height={56}>
              <BarChart data={stats.batchData} margin={{ top: 2, right: 2, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} />
                <YAxis hide />
                <Tooltip
                  formatter={(val: any) => [`${val} alumni`, 'Graduates']}
                  contentStyle={{ fontSize: '11px', borderRadius: '8px', padding: '4px 8px' }}
                />
                <Bar dataKey="count" fill="#2E5E3E" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
