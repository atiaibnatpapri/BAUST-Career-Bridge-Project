/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { 
  GraduationCap, 
  ShieldCheck, 
  Users, 
  Calendar, 
  MessageSquare, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Building2, 
  Sparkles, 
  MapPin, 
  Search,
  BookOpen,
  ChevronRight,
  Award
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { t, alumniList } = useApp();
  const [selectedSector, setSelectedSector] = useState<string>('All');

  const featuredAlumni = alumniList.slice(0, 6);

  const stats = [
    { label: t.hero.statsAlumni, value: '1,450+', sub: 'Across 12 Countries', icon: <Users className="w-5 h-5 text-[#0F2A4A]" /> },
    { label: t.hero.statsStudents, value: '3,800+', sub: 'Current Undergrads', icon: <GraduationCap className="w-5 h-5 text-[#2E5E3E]" /> },
    { label: t.hero.statsCompanies, value: '280+', sub: 'Top Employers & MNCs', icon: <Building2 className="w-5 h-5 text-[#C9A227]" /> },
    { label: t.hero.statsMentorships, value: '920+', sub: 'Completed 1-on-1 Sessions', icon: <Calendar className="w-5 h-5 text-emerald-600" /> },
  ];

  const problemSolutions = [
    {
      problem: 'Unverified and scattered alumni profiles across LinkedIn & Facebook make finding real seniors difficult.',
      solution: 'Centrally authenticated alumni database verified with official BAUST student ID and graduation records.',
    },
    {
      problem: 'Students have no structured pathway to seek CV audits, technical interview guidance, or BCS strategy.',
      solution: 'Dedicated 1-on-1 mentorship scheduler with predefined topics, available calendar slots, and feedback tracking.',
    },
    {
      problem: 'Alumni living abroad or in Dhaka struggle to request transcripts, certificates, or testimonials from Saidpur campus.',
      solution: 'Digital University Admin Desk with online bKash/bank payment, real-time application tracking, and doorstep courier delivery.',
    },
    {
      problem: 'Communication breakdown between graduating seniors, departmental faculties, and recruiting companies.',
      solution: 'Direct in-app messaging, verified job boards, university announcements, and campus career fairs.',
    },
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Create & Verify Your Profile',
      desc: 'Students and alumni register with their BAUST ID and department. University admin validates credentials against exam records.',
    },
    {
      step: '02',
      title: 'Connect & Schedule Mentorship',
      desc: 'Filter alumni by sector (Govt, Tech, Abroad, Research) and book personalized 1-on-1 sessions for CV audit and mock interviews.',
    },
    {
      step: '03',
      title: 'Access Campus Administrative Desk',
      desc: 'Order official transcripts, provisional certificates, and testimonials digitally with doorstep tracking to your home or office.',
    },
  ];

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 pb-12 lg:pt-14 lg:pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F2A4A]/5 via-transparent to-transparent pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F2A4A]/10 border border-[#0F2A4A]/15 text-xs font-semibold text-[#0F2A4A]">
            <Award className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>Official Digital Network of BAUST Saidpur</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#0F2A4A] tracking-tight leading-[1.15] text-balance">
            Connecting BAUST Students, Alumni & Administration
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The unified platform bridging academic life at Saidpur Cantonment with professional excellence worldwide. From structured mentorship to digital certificate requests.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
            <Link to="/student/directory">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                {t.hero.exploreBtn}
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="border-slate-300">
                {t.hero.joinBtn}
              </Button>
            </Link>
          </div>

          {/* Quick Notice Tag */}
          <div className="pt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Free and exclusively accessible for all BAUST students & alumni</span>
          </div>
        </div>

        {/* Live Stats Bar */}
        <div className="mt-14 max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((item, idx) => (
            <Card key={idx} className="p-4 sm:p-5 flex items-center gap-3.5 text-left border-slate-200">
              <div className="p-2.5 rounded-xl bg-slate-100/90 shrink-0">{item.icon}</div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-[#0F2A4A] tabular-nums tracking-tight">
                  {item.value}
                </p>
                <p className="text-xs font-bold text-slate-700">{item.label}</p>
                <p className="text-[10px] text-slate-400">{item.sub}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Problem vs Solution Section */}
      <section className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2E5E3E]">
            Purpose & Impact
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2A4A]">
            Why BAUST Career Bridge Was Built
          </h2>
          <p className="text-sm text-slate-600">
            Addressing critical career navigation bottlenecks for the 5,000+ member university community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problemSolutions.map((item, idx) => (
            <Card key={idx} className="p-6 space-y-4 border-slate-200 hover:border-slate-300 transition-all">
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-lg bg-rose-50 text-rose-600 shrink-0 mt-0.5">
                  <XCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 mb-1">
                    The Problem
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.problem}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 flex items-start gap-3">
                <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
                    BAUST Career Bridge Solution
                  </h4>
                  <p className="text-xs text-slate-800 font-medium leading-relaxed">{item.solution}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 4 Core Platform Features */}
      <section className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C9A227]">
            Core Modules
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2A4A]">
            {t.features.sectionTitle}
          </h2>
          <p className="text-sm text-slate-600">
            {t.features.sectionSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 space-y-3.5 border-slate-200 hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-[#0F2A4A]/10 text-[#0F2A4A] flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#0F2A4A]">{t.features.verifiedTitle}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t.features.verifiedDesc}</p>
            <div className="pt-2">
              <Link to="/student/directory" className="text-xs font-bold text-[#0F2A4A] hover:underline inline-flex items-center gap-1">
                Browse Directory <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>

          <Card className="p-6 space-y-3.5 border-slate-200 hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-[#2E5E3E]/10 text-[#2E5E3E] flex items-center justify-center font-bold">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#0F2A4A]">{t.features.mentorshipTitle}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t.features.mentorshipDesc}</p>
            <div className="pt-2">
              <Link to="/student/mentorship" className="text-xs font-bold text-[#2E5E3E] hover:underline inline-flex items-center gap-1">
                Book a Mentor <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>

          <Card className="p-6 space-y-3.5 border-slate-200 hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-[#C9A227]/15 text-[#967104] flex items-center justify-center font-bold">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#0F2A4A]">{t.features.chatTitle}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t.features.chatDesc}</p>
            <div className="pt-2">
              <Link to="/chat" className="text-xs font-bold text-[#967104] hover:underline inline-flex items-center gap-1">
                Open Messenger <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>

          <Card className="p-6 space-y-3.5 border-slate-200 hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#0F2A4A]">{t.features.adminTitle}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t.features.adminDesc}</p>
            <div className="pt-2">
              <Link to="/alumni/services" className="text-xs font-bold text-indigo-700 hover:underline inline-flex items-center gap-1">
                Order Documents <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Featured Alumni Showcase */}
      <section className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#2E5E3E]">
              Our Pride
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2A4A]">
              Featured BAUST Alumni Mentors
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Connect directly with accomplished graduates leading engineering, research, and governance.
            </p>
          </div>
          <Link to="/student/directory">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All {alumniList.length} Alumni
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredAlumni.map((alumni) => (
            <Card key={alumni.id} hoverable className="p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <Avatar
                    src={alumni.avatar}
                    name={alumni.name}
                    size="lg"
                    isVerified={alumni.isVerified}
                  />
                  <Badge variant={alumni.sector === 'Government' ? 'army' : alumni.sector === 'Abroad' ? 'gold' : 'navy'}>
                    {alumni.sector}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{alumni.name}</h3>
                  <p className="text-xs font-semibold text-[#0F2A4A]">{alumni.designation}</p>
                  <p className="text-xs text-slate-500">{alumni.company}</p>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 pt-1 border-t border-slate-100">
                  <span className="font-semibold text-slate-700">{alumni.department}</span>
                  <span>·</span>
                  <span>{alumni.batch}</span>
                  <span>·</span>
                  <span>Class of {alumni.passingYear}</span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {alumni.bio}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {alumni.skills.slice(0, 3).map((skill, sIdx) => (
                    <span key={sIdx} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                      {skill}
                    </span>
                  ))}
                  {alumni.skills.length > 3 && (
                    <span className="text-[11px] text-slate-400 px-1 py-0.5">
                      +{alumni.skills.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <Link to={`/student/alumni/${alumni.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    View Profile
                  </Button>
                </Link>
                <Link to={`/student/mentorship?mentor=${alumni.id}`}>
                  <Button variant="primary" size="sm" className="text-xs">
                    Request Mentor
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works in 3 Steps */}
      <section className="max-w-6xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xs">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C9A227]">
            Simple Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2A4A]">
            How BAUST Career Bridge Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Three simple steps to unlock direct university networking and administrative ease.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {howItWorks.map((item, idx) => (
            <div key={idx} className="relative space-y-3">
              <span className="text-4xl font-black text-[#0F2A4A]/20 font-mono">
                {item.step}
              </span>
              <h3 className="text-base font-bold text-[#0F2A4A]">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-6xl mx-auto bg-gradient-to-r from-[#0F2A4A] via-[#1A3E68] to-[#2E5E3E] rounded-3xl p-8 sm:p-12 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
        <div className="space-y-2 max-w-xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to shape your professional journey with BAUST?
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            Join thousands of current students and alumni collaborating today. Sign in or switch your demo persona at the bottom right.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/register">
            <Button size="lg" variant="accent">
              Get Started Now
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
};
