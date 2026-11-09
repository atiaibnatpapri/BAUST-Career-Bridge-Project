/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  SlidersHorizontal, 
  LayoutGrid, 
  List, 
  Table as TableIcon, 
  Scale, 
  Bookmark, 
  Sparkles, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  GraduationCap, 
  Building2, 
  Briefcase, 
  MapPin, 
  Award,
  Lock,
  Calendar,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { useDirectoryStore } from '../../../hooks/useDirectoryStore';
import { DirectoryAlumniProfile } from '../../../types/directory';
import { DirectoryInsightsStrip } from '../../../components/directory/DirectoryInsightsStrip';
import { AlumniDirectoryCard } from '../../../components/directory/AlumniDirectoryCard';
import { DirectoryFiltersSidebar, FilterState } from '../../../components/directory/DirectoryFiltersSidebar';
import { AlumniComparisonModal } from '../../../components/directory/AlumniComparisonModal';

export const AlumniDirectoryPage: React.FC = () => {
  const { alumniProfiles, isAlumniSaved, toggleSaveAlumni } = useDirectoryStore();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search and view modes
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'consulted' | 'newest' | 'rating' | 'name'>('recommended');

  // Comparison State (up to 3 alumni)
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Search Autocomplete state
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: searchParams.get('q') || '',
    sector: searchParams.get('sector') || 'All',
    departments: [],
    batchMin: 1,
    batchMax: 16,
    cgpaMin: 0,
    mentoringOnly: searchParams.get('mentor') === 'true',
    referralsOnly: false,
    hiringOnly: false,
    country: 'All',
    hasPublications: false
  });

  // Quick Preset Tabs
  const [activePresetTab, setActivePresetTab] = useState<'all' | 'mentors' | 'abroad' | 'govt' | 'tech'>('all');

  const handlePresetTabChange = (tab: 'all' | 'mentors' | 'abroad' | 'govt' | 'tech') => {
    setActivePresetTab(tab);
    if (tab === 'all') {
      setFilters((prev) => ({ ...prev, sector: 'All', mentoringOnly: false }));
    } else if (tab === 'mentors') {
      setFilters((prev) => ({ ...prev, mentoringOnly: true, sector: 'All' }));
    } else if (tab === 'abroad') {
      setFilters((prev) => ({ ...prev, sector: 'Abroad', mentoringOnly: false }));
    } else if (tab === 'govt') {
      setFilters((prev) => ({ ...prev, sector: 'Government', mentoringOnly: false }));
    } else if (tab === 'tech') {
      setFilters((prev) => ({ ...prev, sector: 'Private', mentoringOnly: false }));
    }
  };

  // Compare Toggle
  const handleCompareToggle = (id: string) => {
    setComparedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 alumni at a time.');
        return prev;
      }
      return [...prev, id];
    });
  };

  // Autocomplete Suggestions
  const searchSuggestions = useMemo(() => {
    if (!filters.searchTerm.trim() || filters.searchTerm.length < 2) return null;
    const term = filters.searchTerm.toLowerCase();

    const matchedNames = alumniProfiles
      .filter((p) => p.name.toLowerCase().includes(term))
      .slice(0, 3)
      .map((p) => ({ type: 'Alumni', text: p.name, id: p.id }));

    const matchedCompanies = Array.from(
      new Set(
        alumniProfiles
          .filter((p) => p.company.toLowerCase().includes(term))
          .map((p) => p.company)
      )
    ).slice(0, 3).map((c) => ({ type: 'Company', text: c }));

    const matchedSkills = Array.from(
      new Set(
        alumniProfiles
          .flatMap((p) => p.skills)
          .filter((s) => s.toLowerCase().includes(term))
      )
    ).slice(0, 3).map((s) => ({ type: 'Skill', text: s }));

    return [...matchedNames, ...matchedCompanies, ...matchedSkills];
  }, [alumniProfiles, filters.searchTerm]);

  // Filtering Logic
  const filteredAlumni = useMemo(() => {
    return alumniProfiles.filter((item) => {
      // 1. Search Term (Name, Company, Designation, Skills, Thesis, Supervisor)
      if (filters.searchTerm.trim()) {
        const term = filters.searchTerm.toLowerCase();
        const inName = item.name.toLowerCase().includes(term);
        const inCompany = item.company.toLowerCase().includes(term);
        const inDesignation = item.designation.toLowerCase().includes(term);
        const inSkills = item.skills.some((s) => s.toLowerCase().includes(term));
        const inThesis = item.thesisTitle?.toLowerCase().includes(term);
        const inSupervisor = item.thesisSupervisor?.toLowerCase().includes(term);
        if (!inName && !inCompany && !inDesignation && !inSkills && !inThesis && !inSupervisor) {
          return false;
        }
      }

      // 2. Sector
      if (filters.sector !== 'All' && item.sector !== filters.sector) {
        return false;
      }

      // 3. Departments
      if (filters.departments.length > 0 && !filters.departments.includes(item.department)) {
        return false;
      }

      // 4. Batch range
      if (item.batchNumber < filters.batchMin || item.batchNumber > filters.batchMax) {
        return false;
      }

      // 5. CGPA
      if (filters.cgpaMin > 0 && item.cgpa < filters.cgpaMin) {
        return false;
      }

      // 6. Country
      if (filters.country !== 'All' && item.country !== filters.country) {
        return false;
      }

      // 7. Toggles
      if (filters.mentoringOnly && !item.mentoringAvailable) return false;
      if (filters.referralsOnly && !item.openToReferrals) return false;
      if (filters.hiringOnly && !item.openToHiring) return false;
      if (filters.hasPublications && (!item.publications || item.publications.length === 0)) return false;

      return true;
    });
  }, [alumniProfiles, filters]);

  // Sorting Logic
  const sortedAlumni = useMemo(() => {
    const list = [...filteredAlumni];
    if (sortBy === 'recommended') {
      // Prioritize verified, high rating, and open to mentor
      return list.sort((a, b) => {
        const scoreA = (a.isVerified ? 10 : 0) + (a.mentoringAvailable ? 5 : 0) + (a.rating || 0);
        const scoreB = (b.isVerified ? 10 : 0) + (b.mentoringAvailable ? 5 : 0) + (b.rating || 0);
        return scoreB - scoreA;
      });
    }
    if (sortBy === 'consulted') {
      return list.sort((a, b) => (b.studentsConsulted || 0) - (a.studentsConsulted || 0));
    }
    if (sortBy === 'newest') {
      return list.sort((a, b) => b.passingYear - a.passingYear);
    }
    if (sortBy === 'rating') {
      return list.sort((a, b) => b.rating - a.rating);
    }
    if (sortBy === 'name') {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [filteredAlumni, sortBy]);

  // Pagination (9 cards per page for grid, 10 for list/table)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === 'grid' ? 9 : 10;
  const totalPages = Math.ceil(sortedAlumni.length / itemsPerPage) || 1;

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedAlumni.slice(start, start + itemsPerPage);
  }, [sortedAlumni, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setFilters({
      searchTerm: '',
      sector: 'All',
      departments: [],
      batchMin: 1,
      batchMax: 16,
      cgpaMin: 0,
      mentoringOnly: false,
      referralsOnly: false,
      hiringOnly: false,
      country: 'All',
      hasPublications: false
    });
    setActivePresetTab('all');
    setCurrentPage(1);
  };

  const comparedAlumniObjects = useMemo(() => {
    return alumniProfiles.filter((p) => comparedIds.includes(p.id));
  }, [alumniProfiles, comparedIds]);

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F2A4A] tracking-tight">
              BAUST Alumni Directory
            </h1>
            <span className="text-xs px-2.5 py-1 rounded-full bg-navy/10 text-navy font-bold">
              {alumniProfiles.length} Graduates
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Connect, discover career pathways, and request mentorship from verified BAUST graduates worldwide.
          </p>
        </div>

        {/* Quick Shortcut Buttons */}
        <div className="flex items-center gap-2">
          <Link
            to="/student/directory/saved"
            className="text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />
            Saved Alumni
          </Link>
          <Link
            to="/student/mentorship"
            className="text-xs font-bold px-3.5 py-2.5 rounded-xl bg-[#2E5E3E] text-white hover:bg-[#234930] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Calendar className="w-4 h-4" />
            Mentorship Hub
          </Link>
        </div>
      </div>

      {/* 2. Top Analytics Insights Strip */}
      <DirectoryInsightsStrip
        profiles={alumniProfiles}
        onSectorClick={(sec) => setFilters((prev) => ({ ...prev, sector: sec }))}
      />

      {/* 3. Search Bar with Grouped Autocomplete Suggestions */}
      <div className="relative">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-2 flex items-center gap-2">
          <div className="pl-3 text-slate-400">
            <Search className="w-5 h-5 text-navy" />
          </div>
          <input
            type="text"
            placeholder="Search by Alumni Name, Company (e.g. Brain Station, Samsung), Role, Skill, Thesis..."
            value={filters.searchTerm}
            onChange={(e) => {
              setFilters({ ...filters, searchTerm: e.target.value });
              setCurrentPage(1);
            }}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
            className="w-full text-sm text-slate-800 placeholder-slate-400 py-2 focus:outline-hidden"
          />
          {filters.searchTerm && (
            <button
              onClick={() => setFilters({ ...filters, searchTerm: '' })}
              className="p-1.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 text-xs font-semibold"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Autocomplete Dropdown */}
        {isSearchFocused && searchSuggestions && searchSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl z-30 p-2 text-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
              Suggestions
            </div>
            {searchSuggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onMouseDown={() => {
                  if (item.type === 'Alumni') {
                    setFilters({ ...filters, searchTerm: item.text });
                  } else {
                    setFilters({ ...filters, searchTerm: item.text });
                  }
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{item.text}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                  {item.type}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. Filter Preset Tabs & View Switcher Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Preset Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Alumni' },
            { id: 'mentors', label: 'Mentors Available' },
            { id: 'tech', label: 'Software & Private' },
            { id: 'abroad', label: 'Higher Study Abroad' },
            { id: 'govt', label: 'Civil Service & BCS' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handlePresetTabChange(tab.id as any)}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                activePresetTab === tab.id
                  ? 'bg-navy text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View Switcher and Sort */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs font-semibold rounded-xl border border-slate-200 px-3 py-1.5 bg-slate-50 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-navy"
          >
            <option value="recommended">Sort: Recommended</option>
            <option value="consulted">Sort: Most Consulted</option>
            <option value="newest">Sort: Newest Batch</option>
            <option value="rating">Sort: Highest Rating</option>
            <option value="name">Sort: Name (A-Z)</option>
          </select>

          {/* Grid / List / Table View Modes */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-xs text-navy' : 'text-slate-500 hover:text-slate-700'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-xs text-navy' : 'text-slate-500 hover:text-slate-700'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white shadow-xs text-navy' : 'text-slate-500 hover:text-slate-700'}`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Main Content: Sidebar + Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column: Filter Sidebar */}
        <div className={`lg:col-span-1 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
          <DirectoryFiltersSidebar
            filters={filters}
            onChange={(newFilters) => {
              setFilters(newFilters);
              setCurrentPage(1);
            }}
            onReset={handleResetFilters}
            totalFilteredCount={sortedAlumni.length}
          />
        </div>

        {/* Right Column: Alumni Display */}
        <div className="lg:col-span-3 space-y-5">
          {sortedAlumni.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-xs">
              <GraduationCap className="w-14 h-14 mx-auto text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Alumni Matched Your Filters</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Try loosening your search keywords, broadening your batch range, or clearing department filters to explore more BAUST graduates.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 bg-navy text-white text-xs font-bold rounded-xl hover:bg-[#0b1f36] transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {currentItems.map((alumnus) => (
                <AlumniDirectoryCard
                  key={alumnus.id}
                  profile={alumnus}
                  isSaved={isAlumniSaved(alumnus.id)}
                  onToggleSave={toggleSaveAlumni}
                  onCompareToggle={handleCompareToggle}
                  isCompared={comparedIds.includes(alumnus.id)}
                  viewMode="grid"
                />
              ))}
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-3">
              {currentItems.map((alumnus) => (
                <AlumniDirectoryCard
                  key={alumnus.id}
                  profile={alumnus}
                  isSaved={isAlumniSaved(alumnus.id)}
                  onToggleSave={toggleSaveAlumni}
                  onCompareToggle={handleCompareToggle}
                  isCompared={comparedIds.includes(alumnus.id)}
                  viewMode="list"
                />
              ))}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3 w-8"></th>
                      <th className="p-3">Alumni</th>
                      <th className="p-3">Role & Company</th>
                      <th className="p-3">Dept & Batch</th>
                      <th className="p-3">Sector</th>
                      <th className="p-3">CGPA</th>
                      <th className="p-3">Mentoring</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {currentItems.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={comparedIds.includes(a.id)}
                            onChange={() => handleCompareToggle(a.id)}
                            className="w-3.5 h-3.5 rounded text-navy focus:ring-navy border-slate-300"
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={a.avatar}
                              alt={a.name}
                              className="w-9 h-9 rounded-lg object-cover border border-slate-200"
                            />
                            <div>
                              <Link
                                to={`/student/directory/${a.id}`}
                                className="font-bold text-slate-900 hover:text-navy"
                              >
                                {a.name}
                              </Link>
                              <div className="text-[11px] text-slate-400">{a.location.split(',')[0]}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-800">{a.designation}</div>
                          <div className="text-navy font-medium text-[11px]">{a.company}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-slate-800">{a.department}</div>
                          <div className="text-slate-400 text-[11px]">{a.batch} ('{a.passingYear})</div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                            {a.sector}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-amber-900">
                          {a.privacy?.cgpa !== 'hidden' ? a.cgpa.toFixed(2) : <Lock className="w-3 h-3 text-slate-400" />}
                        </td>
                        <td className="p-3">
                          {a.mentoringAvailable ? (
                            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                              Available ({a.studentsConsulted || 40}+)
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">No</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <Link
                            to={`/student/directory/${a.id}`}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-navy text-white hover:bg-[#0b1f36] transition-colors"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">
                Showing <span className="font-bold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-bold text-slate-800">{Math.min(currentPage * itemsPerPage, sortedAlumni.length)}</span> of{' '}
                <span className="font-bold text-slate-800">{sortedAlumni.length}</span> graduates
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 text-slate-600 hover:bg-slate-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                      currentPage === page
                        ? 'bg-navy text-white'
                        : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 text-slate-600 hover:bg-slate-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Compare Tray (Shows when 1 or more alumni are selected) */}
      {comparedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#0F2A4A] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 border border-navy/40 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold">
              {comparedIds.length} of 3 Alumni Selected
            </span>
          </div>

          <div className="flex items-center -space-x-2">
            {comparedAlumniObjects.map((a) => (
              <img
                key={a.id}
                src={a.avatar}
                alt={a.name}
                className="w-8 h-8 rounded-full border-2 border-[#0F2A4A] object-cover"
                title={a.name}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-amber-400 text-slate-900 hover:bg-amber-300 transition-colors shadow-xs"
            >
              Compare Side-by-Side
            </button>
            <button
              onClick={() => setComparedIds([])}
              className="text-xs text-slate-300 hover:text-white underline px-1"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      <AlumniComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        comparedAlumni={comparedAlumniObjects}
        onRemoveFromCompare={(id) => setComparedIds((prev) => prev.filter((i) => i !== id))}
      />
    </div>
  );
};
