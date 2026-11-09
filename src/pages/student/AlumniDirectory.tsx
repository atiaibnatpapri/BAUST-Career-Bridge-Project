/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Input, Select } from '../../components/ui/Input';
import { JobSector, Department } from '../../types';
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  MessageSquare, 
  Calendar,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const AlumniDirectory: React.FC = () => {
  const { alumniList, role } = useApp();
  const navigate = useNavigate();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedBatch, setSelectedBatch] = useState<string>('All');
  const [mentoringOnly, setMentoringOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Extract unique batches and departments from data
  const batches = useMemo(() => {
    const set = new Set(alumniList.map((a) => a.batch));
    return ['All', ...Array.from(set).sort()];
  }, [alumniList]);

  const departments = ['All', 'CSE', 'EEE', 'CE', 'ME', 'IPE', 'Textile', 'BBA', 'English'];
  const sectors = ['All', 'Government', 'Private', 'Abroad', 'Research', 'Business'];

  // Filter Logic
  const filteredAlumni = useMemo(() => {
    return alumniList.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSector = selectedSector === 'All' || item.sector === selectedSector;
      const matchesDept = selectedDepartment === 'All' || item.department === selectedDepartment;
      const matchesBatch = selectedBatch === 'All' || item.batch === selectedBatch;
      const matchesMentoring = !mentoringOnly || item.mentoringAvailable;

      return matchesSearch && matchesSector && matchesDept && matchesBatch && matchesMentoring;
    });
  }, [alumniList, searchTerm, selectedSector, selectedDepartment, selectedBatch, mentoringOnly]);

  // Paginated Slices
  const totalPages = Math.ceil(filteredAlumni.length / itemsPerPage);
  const paginatedAlumni = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAlumni.slice(start, start + itemsPerPage);
  }, [filteredAlumni, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSector('All');
    setSelectedDepartment('All');
    setSelectedBatch('All');
    setMentoringOnly(false);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F2A4A] tracking-tight">
            Verified BAUST Alumni Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover and connect with {alumniList.length} verified graduates across Bangladesh and overseas
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#0F2A4A] text-white'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              aria-label="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#0F2A4A] text-white'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              aria-label="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5 border-slate-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="md:col-span-2">
            <Input
              type="text"
              placeholder="Search by name, company (bKash, Brain Station, GP), skills, or location..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-slate-300 text-xs font-semibold rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F2A4A]"
            >
              <option value="All">All Departments</option>
              {departments.filter((d) => d !== 'All').map((dept) => (
                <option key={dept} value={dept}>
                  Dept of {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Job Sector Filter */}
          <div>
            <select
              value={selectedSector}
              onChange={(e) => {
                setSelectedSector(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-slate-300 text-xs font-semibold rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F2A4A]"
            >
              <option value="All">All Job Sectors</option>
              {sectors.filter((s) => s !== 'All').map((sec) => (
                <option key={sec} value={sec}>
                  {sec} Sector
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Filter Chips & Mentoring Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-500 text-[11px] uppercase tracking-wider">
              Batch:
            </span>
            {batches.map((b) => (
              <button
                key={b}
                onClick={() => {
                  setSelectedBatch(b);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedBatch === b
                    ? 'bg-[#0F2A4A] text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium select-none">
              <input
                type="checkbox"
                checked={mentoringOnly}
                onChange={(e) => {
                  setMentoringOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                className="rounded text-[#0F2A4A]"
              />
              <span>Available for 1-on-1 Mentorship</span>
            </label>

            {(searchTerm || selectedSector !== 'All' || selectedDepartment !== 'All' || selectedBatch !== 'All' || mentoringOnly) && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Clear Filters
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{filteredAlumni.length}</strong> verified alumni
        </span>
        <span>
          Page {currentPage} of {totalPages || 1}
        </span>
      </div>

      {/* Directory Grid / List View */}
      {filteredAlumni.length === 0 ? (
        <Card className="p-12 text-center space-y-3 border-dashed border-slate-300">
          <Search className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Alumni Match Your Search</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, sector, or batch filters to see more results.
          </p>
          <Button variant="outline" size="sm" onClick={handleResetFilters}>
            Reset All Filters
          </Button>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {paginatedAlumni.map((alumni) => (
            <Card
              key={alumni.id}
              hoverable
              className="p-5 flex flex-col justify-between space-y-4 border-slate-200"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <Avatar
                    src={alumni.avatar}
                    name={alumni.name}
                    size="lg"
                    isVerified={alumni.isVerified}
                  />
                  <Badge
                    variant={
                      alumni.sector === 'Government'
                        ? 'army'
                        : alumni.sector === 'Abroad'
                        ? 'gold'
                        : alumni.sector === 'Research'
                        ? 'approved'
                        : 'navy'
                    }
                    size="sm"
                  >
                    {alumni.sector}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug truncate">
                    {alumni.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#0F2A4A] truncate">{alumni.designation}</p>
                  <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                    <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{alumni.company}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span className="font-semibold text-slate-700">{alumni.department}</span>
                  <span>·</span>
                  <span>{alumni.batch}</span>
                  <span>·</span>
                  <span className="truncate flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" />
                    {alumni.location.split(',')[0]}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {alumni.skills.slice(0, 3).map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {alumni.skills.length > 3 && (
                    <span className="text-[10px] text-slate-400 px-1 py-0.5">
                      +{alumni.skills.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <Link to={`/student/alumni/${alumni.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    View Profile
                  </Button>
                </Link>
                <Link to={`/chat?user=${alumni.id}`}>
                  <Button
                    variant="primary"
                    size="sm"
                    className="p-2 text-xs"
                    title={`Message ${alumni.name}`}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {paginatedAlumni.map((alumni) => (
            <Card
              key={alumni.id}
              hoverable
              className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-slate-200"
            >
              <div className="flex items-start gap-4">
                <Avatar
                  src={alumni.avatar}
                  name={alumni.name}
                  size="lg"
                  isVerified={alumni.isVerified}
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{alumni.name}</h3>
                    <Badge variant={alumni.sector === 'Government' ? 'army' : 'navy'} size="sm">
                      {alumni.sector}
                    </Badge>
                    {alumni.mentoringAvailable && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                        Mentoring Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-[#0F2A4A]">
                    {alumni.designation} <span className="text-slate-400">at</span> {alumni.company}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{alumni.department}</span>
                    <span>·</span>
                    <span>{alumni.batch} (Passing: {alumni.passingYear})</span>
                    <span>·</span>
                    <span>{alumni.location}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <Link to={`/student/alumni/${alumni.id}`} className="flex-1 sm:flex-initial">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    View Profile
                  </Button>
                </Link>
                <Link to={`/student/mentorship?mentor=${alumni.id}`}>
                  <Button variant="primary" size="sm" className="text-xs">
                    Request Mentorship
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Previous
          </Button>

          <div className="flex items-center gap-1 text-xs font-bold text-slate-700 px-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg transition-colors cursor-pointer ${
                  currentPage === i + 1
                    ? 'bg-[#0F2A4A] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Next
          </Button>
        </div>
      )}

    </div>
  );
};
