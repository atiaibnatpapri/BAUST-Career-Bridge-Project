/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Save, 
  RotateCcw, 
  Camera, 
  Lock, 
  Globe2, 
  Briefcase, 
  GraduationCap, 
  Sparkles, 
  Check, 
  X, 
  Plus, 
  Trash2, 
  BarChart2, 
  Users, 
  Calendar,
  Layers,
  Clock,
  ExternalLink
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { useDirectoryStore } from '../../../hooks/useDirectoryStore';
import { DirectoryAlumniProfile, PrivacySetting, SkillProficiency } from '../../../types/directory';
import { Department, JobSector, MentorshipTopic } from '../../../types';

export const AlumniOwnProfilePage: React.FC = () => {
  const { alumniProfiles, updateAlumniProfile, connections, respondConnectionRequest } = useDirectoryStore();

  // For demo, logged-in alumni profile is Farhan Kabir (alm-1)
  const currentAlumniId = 'alm-1';
  const profile = useDirectoryStore().getProfileById(currentAlumniId) || alumniProfiles[0];

  // Tab State: 'edit' | 'privacy' | 'analytics' | 'connections'
  const [activeTab, setActiveTab] = useState<'edit' | 'privacy' | 'analytics' | 'connections'>('edit');

  // Local Form State for Draft Edits
  const [formData, setFormData] = useState<DirectoryAlumniProfile>(profile);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [previewAsStudent, setPreviewAsStudent] = useState(false);

  // Sync when profile in store updates
  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  // Track draft modifications
  const handleChange = (field: keyof DirectoryAlumniProfile, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handlePrivacyChange = (field: keyof DirectoryAlumniProfile['privacy'], value: PrivacySetting) => {
    setFormData((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [field]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  // Profile Completion Meter Calculation
  const completionStats = useMemo(() => {
    const checklist = [
      { label: 'Profile Headline & Bio', completed: Boolean(formData.headline && formData.bio) },
      { label: 'Avatar Photo', completed: Boolean(formData.avatar) },
      { label: 'Cover Photo', completed: Boolean(formData.coverImage) },
      { label: 'Undergraduate Thesis Title', completed: Boolean(formData.thesisTitle) },
      { label: 'Thesis Supervisor', completed: Boolean(formData.thesisSupervisor) },
      { label: 'At least 3 Technical Skills', completed: Boolean(formData.skills && formData.skills.length >= 3) },
      { label: 'Work Experience Timeline', completed: Boolean(formData.experienceTimeline && formData.experienceTimeline.length > 0) },
      { label: 'Mentorship Availability Set', completed: Boolean(formData.availableSlots && formData.availableSlots.length > 0) },
      { label: 'Privacy Preferences Configured', completed: Boolean(formData.privacy?.cgpa) },
    ];

    const completedCount = checklist.filter((c) => c.completed).length;
    const percentage = Math.round((completedCount / checklist.length) * 100);

    return { checklist, percentage };
  }, [formData]);

  // Save changes handler
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAlumniProfile(formData.id, formData);
    setHasUnsavedChanges(false);
    setSaveSuccessMsg('Profile changes saved successfully! Live directory updated.');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // Skill Add / Remove
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<SkillProficiency>('Intermediate');

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const newSkill = {
      id: `sk-${Date.now()}`,
      name: newSkillName.trim(),
      level: newSkillLevel,
      endorsements: []
    };
    const updatedWithLevels = [...(formData.skillsWithLevels || []), newSkill];
    const updatedFlat = Array.from(new Set([...formData.skills, newSkillName.trim()]));
    handleChange('skillsWithLevels', updatedWithLevels);
    handleChange('skills', updatedFlat);
    setNewSkillName('');
  };

  const handleRemoveSkill = (skillId: string) => {
    const updatedWithLevels = (formData.skillsWithLevels || []).filter((s) => s.id !== skillId);
    handleChange('skillsWithLevels', updatedWithLevels);
  };

  // Connection Requests for this alumni
  const myConnections = useMemo(() => {
    return connections.filter((c) => c.alumniId === currentAlumniId);
  }, [connections, currentAlumniId]);

  return (
    <div className="space-y-6 pb-24">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F2A4A] tracking-tight">
              My Public Alumni Profile & Editor
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              Alumni Portal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your verified university credentials, career timeline, privacy controls, and student connection requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/student/directory/${formData.id}`}
            className="text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Eye className="w-4 h-4 text-navy" />
            View Live Public Profile
          </Link>
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className="text-xs font-bold px-4 py-2.5 rounded-xl bg-navy text-white hover:bg-[#091e36] disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-md"
          >
            <Save className="w-4 h-4" />
            Save Profile
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Sensitive Academic Field Re-verification Warning */}
      {formData.isReverificationPending && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm">Academic Re-Verification Required</div>
            <p className="mt-0.5 text-amber-800">
              {formData.reverificationNotice || 'You modified your department or student identity. BAUST Registrar is auditing your updated graduation credentials.'}
            </p>
          </div>
        </div>
      )}

      {/* Profile Completion Meter Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Profile Completeness: <span className="text-navy font-extrabold">{completionStats.percentage}%</span>
              </h3>
              <p className="text-xs text-slate-500">
                Complete profiles receive 4.5x more student mentorship requests and campus honors.
              </p>
            </div>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
            {completionStats.checklist.filter((c) => c.completed).length} / {completionStats.checklist.length} Complete
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-linear-to-r from-[#0F2A4A] to-[#2E5E3E] transition-all duration-500"
            style={{ width: `${completionStats.percentage}%` }}
          />
        </div>

        {/* Checklist Badges */}
        <div className="flex flex-wrap gap-2 pt-1">
          {completionStats.checklist.map((item, idx) => (
            <span
              key={idx}
              className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 font-medium ${
                item.completed
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              {item.completed ? <Check className="w-3 h-3 text-emerald-600" /> : <div className="w-2 h-2 rounded-full bg-slate-300" />}
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs Navigation Strip */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('edit')}
          className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'edit'
              ? 'bg-navy text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          Edit Profile Sections
        </button>

        <button
          onClick={() => setActiveTab('privacy')}
          className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'privacy'
              ? 'bg-navy text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-4 h-4" />
          Field-by-Field Privacy Controls
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'bg-navy text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          Directory Analytics & Views
        </button>

        <button
          onClick={() => setActiveTab('connections')}
          className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'connections'
              ? 'bg-navy text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          Student Connections ({myConnections.filter((c) => c.status === 'Pending').length} Pending)
        </button>
      </div>

      {/* TAB 1: Edit Profile Sections */}
      {activeTab === 'edit' && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section A: Visual Branding (Photos) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Camera className="w-4 h-4 text-navy" />
              Profile Photos & Cover
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Avatar Preview & URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Profile Avatar Image
                </label>
                <div className="flex items-center gap-4 mb-3">
                  <img
                    src={formData.avatar}
                    alt=""
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-navy shadow-sm"
                  />
                  <div className="text-xs text-slate-500">
                    <p className="font-semibold text-slate-700">Official Profile Avatar</p>
                    <p className="text-[11px]">Recommended 400x400 square photo</p>
                  </div>
                </div>
                <input
                  type="text"
                  value={formData.avatar}
                  onChange={(e) => handleChange('avatar', e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-navy focus:outline-hidden"
                />
              </div>

              {/* Cover Image Preview & URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Header Cover Banner
                </label>
                <div className="h-16 w-full rounded-2xl bg-linear-to-r from-navy to-[#2E5E3E] overflow-hidden relative mb-3">
                  {formData.coverImage && (
                    <img
                      src={formData.coverImage}
                      alt=""
                      className="w-full h-full object-cover opacity-40"
                    />
                  )}
                  <span className="absolute bottom-1 right-2 text-[10px] text-white/80 font-mono">
                    Cover Preview
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.coverImage || ''}
                  onChange={(e) => handleChange('coverImage', e.target.value)}
                  placeholder="Cover photo image URL..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-navy focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section B: Basic & Professional Headline */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-navy" />
              General Identity & Current Employment
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name (English)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-navy focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name (বাংলা)
                </label>
                <input
                  type="text"
                  value={formData.nameBn || ''}
                  onChange={(e) => handleChange('nameBn', e.target.value)}
                  placeholder="e.g. কাজী ফারহান কবির"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-navy focus:outline-hidden font-serif"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Job Designation
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => handleChange('designation', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-navy focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-navy focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Job Sector
                </label>
                <select
                  value={formData.sector}
                  onChange={(e) => handleChange('sector', e.target.value as JobSector)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-navy focus:outline-hidden"
                >
                  <option value="Private">Private Sector / MNC</option>
                  <option value="Government">Government / BCS Cadre</option>
                  <option value="Abroad">Higher Study Abroad</option>
                  <option value="Research">Research & Development</option>
                  <option value="Business">Business & Entrepreneurship</option>
                  <option value="Freelancing">Freelancing & Consulting</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Current Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="e.g. Dhaka, Bangladesh"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-navy focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Headline / One-Liner Summary
              </label>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => handleChange('headline', e.target.value)}
                placeholder="Staff Software Engineer at Optimizely | Ex-BJIT | BAUST CSE 4th"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-navy focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Professional Bio (English)
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-navy focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Professional Bio (বাংলা - ঐচ্ছিক)
              </label>
              <textarea
                rows={2}
                value={formData.bioBn || ''}
                onChange={(e) => handleChange('bioBn', e.target.value)}
                placeholder="বাংলা ভাষায় আপনার অভিজ্ঞতার সংক্ষিপ্ত বিবরণ..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-navy focus:outline-hidden font-serif"
              />
            </div>
          </div>

          {/* Section C: BAUST Academic Records & Thesis */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-navy" />
                BAUST Academic Credentials & Thesis
              </h2>
              <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Sensitive Academic Data
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value as Department)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-navy focus:outline-hidden"
                >
                  <option value="CSE">CSE</option>
                  <option value="EEE">EEE</option>
                  <option value="CE">CE</option>
                  <option value="ME">ME</option>
                  <option value="IPE">IPE</option>
                  <option value="Textile">Textile</option>
                  <option value="BBA">BBA</option>
                  <option value="English">English</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Batch
                </label>
                <input
                  type="text"
                  value={formData.batch}
                  onChange={(e) => handleChange('batch', e.target.value)}
                  placeholder="e.g. 4th Batch"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-navy focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Graduation CGPA (Scale 4.00)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="2.00"
                  max="4.00"
                  value={formData.cgpa}
                  onChange={(e) => handleChange('cgpa', parseFloat(e.target.value) || 0)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-navy focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Undergrad Thesis / Capstone Title
                </label>
                <input
                  type="text"
                  value={formData.thesisTitle}
                  onChange={(e) => handleChange('thesisTitle', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-navy focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Faculty Supervisor Name
                </label>
                <input
                  type="text"
                  value={formData.thesisSupervisor}
                  onChange={(e) => handleChange('thesisSupervisor', e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-navy focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section D: Technical Skills Management */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Technical Skills & Endorsement Counts
            </h2>

            {/* Existing Skills List */}
            <div className="space-y-2">
              {formData.skillsWithLevels?.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-800">{skill.name}</span>
                    <span className="px-2 py-0.5 rounded-md bg-white border text-slate-600 font-semibold text-[10px]">
                      {skill.level}
                    </span>
                    <span className="text-[11px] text-amber-700 font-medium">
                      ✦ {skill.endorsements?.length || 0} student endorsements
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Skill Row */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="Add skill (e.g. Next.js, Kafka, BNBC Code)..."
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="w-full sm:flex-1 text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-1 focus:ring-navy focus:outline-hidden"
              />
              <select
                value={newSkillLevel}
                onChange={(e) => setNewSkillLevel(e.target.value as SkillProficiency)}
                className="w-full sm:w-auto text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
              <button
                type="button"
                onClick={handleAddSkill}
                className="w-full sm:w-auto text-xs font-bold px-4 py-2.5 rounded-xl bg-navy text-white hover:bg-[#0b1f36] transition-colors"
              >
                + Add Skill
              </button>
            </div>
          </div>

          {/* Section E: Mentorship & Campus Collaboration */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              Mentorship, Referrals & Availability Toggles
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between cursor-pointer hover:bg-slate-100/70">
                <div>
                  <div className="text-xs font-bold text-slate-800">Open to Mentoring</div>
                  <div className="text-[11px] text-slate-500">Allow students to book 1:1 sessions</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.mentoringAvailable}
                  onChange={(e) => handleChange('mentoringAvailable', e.target.checked)}
                  className="w-4 h-4 rounded text-navy focus:ring-navy"
                />
              </label>

              <label className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between cursor-pointer hover:bg-slate-100/70">
                <div>
                  <div className="text-xs font-bold text-slate-800">Open to Referrals</div>
                  <div className="text-[11px] text-slate-500">Provide job referrals for {formData.company}</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.openToReferrals}
                  onChange={(e) => handleChange('openToReferrals', e.target.checked)}
                  className="w-4 h-4 rounded text-navy focus:ring-navy"
                />
              </label>

              <label className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between cursor-pointer hover:bg-slate-100/70">
                <div>
                  <div className="text-xs font-bold text-slate-800">Actively Hiring</div>
                  <div className="text-[11px] text-slate-500">Mark profile with hiring tag</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.openToHiring}
                  onChange={(e) => handleChange('openToHiring', e.target.checked)}
                  className="w-4 h-4 rounded text-navy focus:ring-navy"
                />
              </label>
            </div>
          </div>

          {/* Sticky Save Bar */}
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-md">
            <span className="text-xs text-slate-500">
              {hasUnsavedChanges ? '⚠️ You have unsaved changes.' : '✓ All changes are currently up to date.'}
            </span>
            <button
              type="submit"
              disabled={!hasUnsavedChanges}
              className="text-xs font-bold px-6 py-2.5 rounded-xl bg-navy text-white hover:bg-[#091e36] disabled:opacity-50 transition-colors shadow-sm"
            >
              Save & Publish Changes
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Field-by-Field Privacy Controls */}
      {activeTab === 'privacy' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-navy" />
              Granular Privacy Preferences
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Control exactly who can view your grades, direct contact details, and precise physical location in the BAUST directory.
            </p>
          </div>

          <div className="space-y-4 divide-y divide-slate-100">
            {/* 1. CGPA Privacy */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-bold text-xs text-slate-800">Undergraduate CGPA Visibility</div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your graduation result ({formData.cgpa.toFixed(2)} / 4.00)
                </p>
              </div>

              <select
                value={formData.privacy?.cgpa || 'public'}
                onChange={(e) => handlePrivacyChange('cgpa', e.target.value as PrivacySetting)}
                className="text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-medium"
              >
                <option value="public">Public to All Registered Users</option>
                <option value="students_only">Visible Only to Verified BAUST Students</option>
                <option value="hidden">Hidden / Private</option>
              </select>
            </div>

            {/* 2. Email Address Privacy */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-bold text-xs text-slate-800">Email Address Visibility</div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {formData.email}
                </p>
              </div>

              <select
                value={formData.privacy?.email || 'students_only'}
                onChange={(e) => handlePrivacyChange('email', e.target.value as PrivacySetting)}
                className="text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-medium"
              >
                <option value="public">Publicly Visible</option>
                <option value="students_only">Masked (Students can request via platform)</option>
                <option value="connections_only">Connected Students Only</option>
                <option value="hidden">Hidden Completely</option>
              </select>
            </div>

            {/* 3. Phone Number Privacy */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-bold text-xs text-slate-800">Phone & WhatsApp Number</div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {formData.phone || '+880 1712-345678'}
                </p>
              </div>

              <select
                value={formData.privacy?.phone || 'connections_only'}
                onChange={(e) => handlePrivacyChange('phone', e.target.value as PrivacySetting)}
                className="text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-medium"
              >
                <option value="connections_only">Visible to Accepted Connections Only</option>
                <option value="students_only">Visible to BAUST Students with Active Session</option>
                <option value="hidden">Hidden Completely</option>
              </select>
            </div>

            {/* 4. Current City/Location */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-bold text-xs text-slate-800">Current Work Location</div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {formData.location}
                </p>
              </div>

              <select
                value={formData.privacy?.location || 'public'}
                onChange={(e) => handlePrivacyChange('location', e.target.value as PrivacySetting)}
                className="text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-medium"
              >
                <option value="public">Full City & Country (e.g. Dhaka, Bangladesh)</option>
                <option value="students_only">Country Only (e.g. Bangladesh)</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSave}
              className="text-xs font-bold px-5 py-2.5 rounded-xl bg-navy text-white hover:bg-[#091e36] transition-colors shadow-sm"
            >
              Update Privacy Preferences
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: Directory Analytics & Views */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
              <div className="text-xs text-slate-400 font-medium">Profile Views This Month</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {formData.stats?.profileViewsThisMonth || 142}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">+18% vs last month</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
              <div className="text-xs text-slate-400 font-medium">Student Search Appearances</div>
              <div className="text-2xl font-extrabold text-navy mt-1">
                {formData.stats?.searchAppearances || 389}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Top rank for 'Fintech'</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
              <div className="text-xs text-slate-400 font-medium">Bookmarked by Students</div>
              <div className="text-2xl font-extrabold text-amber-600 mt-1">
                {formData.stats?.bookmarksCount || 45}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">In student watchlists</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
              <div className="text-xs text-slate-400 font-medium">Peer Endorsements</div>
              <div className="text-2xl font-extrabold text-emerald-700 mt-1">
                {formData.stats?.endorsementsReceived || 27}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Verified skill proofs</div>
            </div>
          </div>

          {/* Monthly Views Chart */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-navy" />
              Monthly Profile Views Trajectory
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={formData.stats?.monthlyViewHistory || [
                    { month: 'Oct', views: 88 },
                    { month: 'Nov', views: 115 },
                    { month: 'Dec', views: 120 },
                    { month: 'Jan', views: 138 },
                    { month: 'Feb', views: 142 }
                  ]}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F2A4A" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0F2A4A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: any) => [`${value} views`, 'Student Views']}
                    contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="views" stroke="#0F2A4A" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Student Connections Management */}
      {activeTab === 'connections' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" />
                Connection Requests from BAUST Undergraduates
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Students wishing to stay in touch for career advice, referral guidance, and research discussions.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {myConnections.length} Total Requests
            </span>
          </div>

          {myConnections.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No connection requests received yet.
            </div>
          ) : (
            <div className="space-y-3">
              {myConnections.map((conn) => (
                <div
                  key={conn.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={conn.studentAvatar}
                      alt={conn.studentName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{conn.studentName}</span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                          {conn.studentDept} • {conn.studentBatch}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                          {conn.purpose}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 italic">
                        "{conn.note}"
                      </p>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Sent on {new Date(conn.sentAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {conn.status === 'Pending' ? (
                      <>
                        <button
                          onClick={() => respondConnectionRequest(conn.id, 'Declined')}
                          className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-200 text-slate-600 font-semibold"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => respondConnectionRequest(conn.id, 'Accepted')}
                          className="text-xs px-4 py-1.5 rounded-xl bg-[#2E5E3E] text-white hover:bg-[#234930] font-bold shadow-xs"
                        >
                          Accept
                        </button>
                      </>
                    ) : conn.status === 'Accepted' ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                        ✓ Connected
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-xl">
                        Declined
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
