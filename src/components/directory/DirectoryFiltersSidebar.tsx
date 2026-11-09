/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Filter, 
  RotateCcw, 
  Bookmark, 
  Search, 
  Check, 
  Sliders, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Trash2,
  Save
} from 'lucide-react';
import { Department } from '../../types';
import { SavedSearchSet } from '../../types/directory';
import { useDirectoryStore } from '../../hooks/useDirectoryStore';

export interface FilterState {
  searchTerm: string;
  sector: string;
  departments: Department[];
  batchMin: number;
  batchMax: number;
  cgpaMin: number;
  mentoringOnly: boolean;
  referralsOnly: boolean;
  hiringOnly: boolean;
  country: string;
  hasPublications: boolean;
}

interface DirectoryFiltersSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  totalFilteredCount: number;
}

const DEPARTMENTS: Department[] = ['CSE', 'EEE', 'CE', 'ME', 'IPE', 'Textile', 'BBA', 'English'];
const SECTORS = ['All', 'Private', 'Government', 'Abroad', 'Research', 'Business', 'Freelancing'];
const COUNTRIES = ['All', 'Bangladesh', 'Germany', 'Canada', 'Australia', 'Singapore', 'Saudi Arabia', 'United Kingdom'];

export const DirectoryFiltersSidebar: React.FC<DirectoryFiltersSidebarProps> = ({
  filters,
  onChange,
  onReset,
  totalFilteredCount
}) => {
  const { savedSearches, saveSearchSet, deleteSavedSearch } = useDirectoryStore();
  const [saveTitle, setSaveTitle] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [showSavedSearches, setShowSavedSearches] = useState(true);

  const handleDepartmentToggle = (dept: Department) => {
    const exists = filters.departments.includes(dept);
    const updated = exists
      ? filters.departments.filter((d) => d !== dept)
      : [...filters.departments, dept];
    onChange({ ...filters, departments: updated });
  };

  const handleSaveCurrentSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveTitle.trim()) return;

    saveSearchSet({
      title: saveTitle.trim(),
      searchTerm: filters.searchTerm,
      department: filters.departments.length === 1 ? filters.departments[0] : 'All',
      sector: filters.sector,
      batchMin: filters.batchMin,
      batchMax: filters.batchMax,
      cgpaMin: filters.cgpaMin,
      mentoringOnly: filters.mentoringOnly,
      referralsOnly: filters.referralsOnly,
      hiringOnly: filters.hiringOnly
    });

    setSaveTitle('');
    setShowSaveInput(false);
  };

  const handleApplySavedSearch = (s: SavedSearchSet) => {
    onChange({
      ...filters,
      searchTerm: s.searchTerm,
      sector: s.sector || 'All',
      departments: s.department !== 'All' ? [s.department as Department] : [],
      batchMin: s.batchMin || 1,
      batchMax: s.batchMax || 16,
      cgpaMin: s.cgpaMin || 0,
      mentoringOnly: s.mentoringOnly || false,
      referralsOnly: s.referralsOnly || false,
      hiringOnly: s.hiringOnly || false
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-navy" />
          <h3 className="font-bold text-sm text-slate-800">Advanced Filters</h3>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
            {totalFilteredCount} matches
          </span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
          title="Reset all filters"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* 1. Job Sector Chips */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Sector
        </label>
        <div className="flex flex-wrap gap-1.5">
          {SECTORS.map((sec) => {
            const active = filters.sector === sec;
            return (
              <button
                key={sec}
                onClick={() => onChange({ ...filters, sector: sec })}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                  active
                    ? 'bg-navy text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sec}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Department Checkboxes */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            BAUST Department
          </label>
          {filters.departments.length > 0 && (
            <button
              onClick={() => onChange({ ...filters, departments: [] })}
              className="text-[11px] text-navy font-semibold hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {DEPARTMENTS.map((dept) => {
            const isSelected = filters.departments.includes(dept);
            return (
              <button
                key={dept}
                type="button"
                onClick={() => handleDepartmentToggle(dept)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium border text-left transition-all ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                    : 'border-slate-200/80 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{dept}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Batch Range Slider */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <label className="font-bold text-slate-700 uppercase tracking-wider">
            Batch Range
          </label>
          <span className="font-semibold text-navy">
            {filters.batchMin}th – {filters.batchMax}th Batch
          </span>
        </div>
        <div className="space-y-2">
          <input
            type="range"
            min={1}
            max={filters.batchMax}
            value={filters.batchMin}
            onChange={(e) => onChange({ ...filters, batchMin: Number(e.target.value) })}
            className="w-full accent-[#0F2A4A] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>1st Batch (Pioneers)</span>
            <span>16th Batch</span>
          </div>
        </div>
      </div>

      {/* 4. Minimum CGPA Slider */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <label className="font-bold text-slate-700 uppercase tracking-wider">
            Minimum CGPA
          </label>
          <span className="font-semibold text-amber-700">
            {filters.cgpaMin > 0 ? `≥ ${filters.cgpaMin.toFixed(2)}` : 'Any CGPA'}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={3.9}
          step={0.1}
          value={filters.cgpaMin}
          onChange={(e) => onChange({ ...filters, cgpaMin: Number(e.target.value) })}
          className="w-full accent-amber-500 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>All Grades</span>
          <span>Dean's List (3.80+)</span>
        </div>
      </div>

      {/* 5. Country / Location Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Country / Base
        </label>
        <select
          value={filters.country}
          onChange={(e) => onChange({ ...filters, country: e.target.value })}
          className="w-full text-xs rounded-xl border border-slate-200 p-2 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-navy"
        >
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* 6. Quick Toggles */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
          Availability & Badges
        </label>

        {/* Mentoring */}
        <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/70 cursor-pointer hover:bg-slate-100/70 transition-colors">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-slate-800">Open to Mentoring</span>
          </div>
          <input
            type="checkbox"
            checked={filters.mentoringOnly}
            onChange={(e) => onChange({ ...filters, mentoringOnly: e.target.checked })}
            className="w-4 h-4 rounded text-navy focus:ring-navy border-slate-300"
          />
        </label>

        {/* Referrals */}
        <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/70 cursor-pointer hover:bg-slate-100/70 transition-colors">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span className="text-xs font-medium text-slate-800">Open to Referrals</span>
          </div>
          <input
            type="checkbox"
            checked={filters.referralsOnly}
            onChange={(e) => onChange({ ...filters, referralsOnly: e.target.checked })}
            className="w-4 h-4 rounded text-navy focus:ring-navy border-slate-300"
          />
        </label>

        {/* Hiring */}
        <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/70 cursor-pointer hover:bg-slate-100/70 transition-colors">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-xs font-medium text-slate-800">Actively Hiring</span>
          </div>
          <input
            type="checkbox"
            checked={filters.hiringOnly}
            onChange={(e) => onChange({ ...filters, hiringOnly: e.target.checked })}
            className="w-4 h-4 rounded text-navy focus:ring-navy border-slate-300"
          />
        </label>

        {/* Publications */}
        <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/70 cursor-pointer hover:bg-slate-100/70 transition-colors">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs font-medium text-slate-800">Has Research Publications</span>
          </div>
          <input
            type="checkbox"
            checked={filters.hasPublications}
            onChange={(e) => onChange({ ...filters, hasPublications: e.target.checked })}
            className="w-4 h-4 rounded text-navy focus:ring-navy border-slate-300"
          />
        </label>
      </div>

      {/* 7. Saved Search Sets Section */}
      <div className="pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setShowSavedSearches(!showSavedSearches)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider"
          >
            <Bookmark className="w-3.5 h-3.5 text-navy" />
            Saved Search Sets ({savedSearches.length})
            {showSavedSearches ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            onClick={() => setShowSaveInput(!showSaveInput)}
            className="text-[11px] font-semibold text-navy hover:underline flex items-center gap-0.5"
          >
            <Save className="w-3 h-3" />
            Save Filter
          </button>
        </div>

        {/* Save Current Search Form */}
        {showSaveInput && (
          <form onSubmit={handleSaveCurrentSearch} className="mb-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <input
              type="text"
              placeholder="e.g. Govt Officers in Rangpur"
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              className="w-full text-xs p-1.5 rounded-lg border border-slate-200 bg-white mb-2 focus:ring-1 focus:ring-navy focus:outline-hidden"
              autoFocus
            />
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setShowSaveInput(false)}
                className="text-xs px-2 py-1 rounded text-slate-500 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-xs px-2.5 py-1 rounded bg-navy text-white font-semibold"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* List of Saved Searches */}
        {showSavedSearches && (
          <div className="space-y-1.5">
            {savedSearches.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No saved search sets yet.</p>
            ) : (
              savedSearches.map((s) => (
                <div
                  key={s.id}
                  className="group flex items-center justify-between p-2 rounded-xl text-xs bg-slate-50 hover:bg-navy/5 border border-slate-200/60 transition-colors"
                >
                  <button
                    onClick={() => handleApplySavedSearch(s)}
                    className="text-left font-medium text-slate-700 hover:text-navy truncate flex-1 pr-2"
                    title={`Apply ${s.title}`}
                  >
                    ✦ {s.title}
                  </button>
                  <button
                    onClick={() => deleteSavedSearch(s.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity p-0.5"
                    title="Delete saved search"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
