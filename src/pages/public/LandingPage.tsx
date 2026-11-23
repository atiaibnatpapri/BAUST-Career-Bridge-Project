/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  computeAlumniStats,
  isVerifiedVisibleAlumni,
  BAUST_DEPARTMENTS,
} from '../../constants/baustDataModel';
import { formatLocalizedNumber } from '../../data/translations';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { CampusHeroBackdrop } from '../../components/ui/CampusHeroBackdrop';
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
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { t, alumniList, allUsers, mentorshipRequests, language } = useApp();
  const { firebaseUser, userProfile } = useAuth();
  const servicesPath = '/student/services';

  const isApprovedMember = Boolean(
    firebaseUser && userProfile?.verificationStatus === 'approved' && !userProfile?.suspended
  );

  const liveStats = useMemo(() => computeAlumniStats(allUsers), [allUsers]);

  // Featured alumni strictly matches Verified & Visible Alumni (#42, #50)
  const featuredAlumni = useMemo(() => {
    const visibleMap = new Map(
      (allUsers ?? []).filter((u) => isVerifiedVisibleAlumni(u)).map((u) => [u.id, u])
    );
    const verifiedList = (alumniList ?? []).filter((a) => visibleMap.has(a.id) || a.isVerified);
    const prioritized = [
      ...verifiedList.filter((a) => Boolean(visibleMap.get(a.id)?.isFeatured || a.isFeatured)),
      ...verifiedList.filter((a) => !visibleMap.get(a.id)?.isFeatured && !a.isFeatured),
    ];
    return prioritized.slice(0, 6);
  }, [alumniList, allUsers]);

  const approvedStudentsCount = useMemo(
    () =>
      (allUsers ?? []).filter(
        (u) => u?.role === 'student' && u?.verificationStatus === 'approved' && !u?.suspended
      ).length,
    [allUsers]
  );

  const partnerCompaniesCount = useMemo(() => {
    const set = new Set<string>();
    (allUsers ?? [])
      .filter((u) => isVerifiedVisibleAlumni(u) && u?.company)
      .forEach((u) => set.add(String(u.company).trim().toLowerCase()));
    return set.size;
  }, [allUsers]);

  const scrollToFeatures = () => {
    const el = document.getElementById('features');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const heroCards = [
    {
      to: '/student/mentorship',
      label: language === 'bn' ? 'মেন্টরশিপ ও দিকনির্দেশনা' : 'Mentorship & Guidance',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-[#5EEAD4]" aria-hidden="true">
          <path
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      to: '/student/directory',
      label: language === 'bn' ? 'অ্যালামনাই নেটওয়ার্ক' : 'Alumni Network',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-[#5EEAD4]" aria-hidden="true">
          <path
            d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      to: servicesPath,
      label: language === 'bn' ? 'রিসোর্স ও নথিপত্র' : 'Resources & Documents',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-[#5EEAD4]" aria-hidden="true">
          <path
            d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm5 6h8m-8 4h5"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      to: '/login',
      label: language === 'bn' ? 'অ্যাডমিন পোর্টাল' : 'Admin Portal',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-[#5EEAD4]" aria-hidden="true">
          <path
            d="M12 3l7 4v5c0 4.5-3 8.5-7 9.5-4-1-7-5-7-9.5V7l7-4zm-2.5 9.5l1.75 1.75 3.5-3.5"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ];

  const stats = isApprovedMember
    ? [
        {
          label: t.hero.statsAlumni,
          value: formatLocalizedNumber(liveStats.verifiedApprovedAlumni, language),
          sub: `${formatLocalizedNumber(liveStats.featuredAlumniCount, language)} ${t.common.featured}`,
          icon: <Users className="w-5 h-5 text-[#0F2A4A]" />,
        },
        {
          label: t.hero.statsStudents,
          value: formatLocalizedNumber(approvedStudentsCount, language),
          sub: language === 'bn' ? 'যাচাইকৃত শিক্ষার্থী' : 'Verified Undergrads',
          icon: <GraduationCap className="w-5 h-5 text-[#2E5E3E]" />,
        },
        {
          label: t.hero.statsCompanies,
          value: formatLocalizedNumber(partnerCompaniesCount, language),
          sub: language === 'bn' ? 'কর্মক্ষেত্র ও প্রতিষ্ঠান' : 'Employer Organizations',
          icon: <Building2 className="w-5 h-5 text-[#C9A227]" />,
        },
        {
          label: t.hero.statsMentorships,
          value: formatLocalizedNumber(mentorshipRequests.length, language),
          sub: language === 'bn' ? 'লাইভ মেন্টরশিপ রেকর্ড' : 'Live Mentorship Records',
          icon: <Calendar className="w-5 h-5 text-emerald-600" />,
        },
      ]
    : [
        {
          label: t.hero.statsAlumni,
          value: language === 'bn' ? 'যাচাইকৃত' : 'Verified',
          sub: language === 'bn' ? 'সুপার অ্যাডমিন অনুমোদিত' : 'Super Admin Approved Accounts',
          icon: <ShieldCheck className="w-5 h-5 text-[#0F2A4A]" />,
        },
        {
          label: language === 'bn' ? 'একাডেমিক বিভাগ' : 'Academic Depts',
          value: formatLocalizedNumber(BAUST_DEPARTMENTS.length, language),
          sub: 'CSE, EEE, ME, IPE, DBA, AIS, CE, Eng',
          icon: <GraduationCap className="w-5 h-5 text-[#2E5E3E]" />,
        },
        {
          label: language === 'bn' ? '১-অন-১ মেন্টরশিপ' : '1-on-1 Mentorship',
          value: language === 'bn' ? 'লাইভ' : 'Live',
          sub: language === 'bn' ? 'স্লট বুকিং ও সিভি রিভিউ' : 'Atomic Slot Booking & CV Audit',
          icon: <Calendar className="w-5 h-5 text-[#C9A227]" />,
        },
        {
          label: t.nav.adminDesk,
          value: language === 'bn' ? 'ডিজিটাল' : 'Digital',
          sub: language === 'bn' ? 'ট্রান্সক্রিপ্ট ও সনদ ট্র্যাকিং' : 'Transcript & Document Tracking',
          icon: <FileText className="w-5 h-5 text-emerald-600" />,
        },
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
    <div className="bg-[#F5F7FA]">
      {/* Full-Screen Hero Section */}
      <section
        id="hero-top"
        className="relative min-h-screen flex items-center pt-24 pb-16 sm:pt-28 sm:pb-20 overflow-hidden"
      >
        <CampusHeroBackdrop />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Brand Label, Headline, 1 Supporting Sentence, 2 CTAs */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <p className="text-sm font-bold tracking-wide text-[#2DD4BF]">
                {language === 'bn' ? t.brand : 'BAUST Career Bridge'}
              </p>

              <h1 className="text-[clamp(2rem,4.1vw,3.35rem)] font-bold text-white tracking-tight leading-[1.12] max-w-xl">
                {language === 'bn'
                  ? t.hero.title
                  : 'Connecting Students, Alumni, and Administration.'}
              </h1>

              <p className="text-base sm:text-lg text-slate-200 max-w-xl leading-relaxed">
                {language === 'bn'
                  ? 'ক্যারিয়ার মেন্টরশিপ, যাচাইকৃত অ্যালামনাই নেটওয়ার্ক এবং নিরবচ্ছিন্ন একাডেমিক সেবার নির্ভরযোগ্য প্রবেশদ্বার।'
                  : 'Your gateway to career mentorship, verified alumni networks, and seamless academic support.'}
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-full bg-[#14B8A6] hover:bg-[#2DD4BF] text-[#0B2A3F] font-bold text-sm sm:text-base px-7 min-h-[46px] shadow-md transition-colors duration-150 whitespace-nowrap"
                >
                  {language === 'bn' ? 'শুরু করুন' : 'Get Started'}
                </Link>

                <button
                  type="button"
                  onClick={scrollToFeatures}
                  className="inline-flex items-center justify-center rounded-full border-2 border-white/80 bg-white/5 hover:bg-white/15 text-white font-semibold text-sm sm:text-base px-7 min-h-[46px] transition-colors duration-150 cursor-pointer whitespace-nowrap"
                >
                  {language === 'bn' ? 'আরও জানুন' : 'Learn More'}
                </button>
              </div>
            </div>

            {/* Right Column: 2x2 Frosted Glass Cards */}
            <div className="lg:col-span-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {heroCards.map((card) => (
                  <Link
                    key={card.label}
                    to={card.to}
                    className="group bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-lg hover:-translate-y-1 hover:bg-white/15 hover:border-white/35 transition-all duration-200 flex flex-col justify-between gap-5 min-h-[156px]"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#14B8A6]/20 border border-[#5EEAD4]/30 flex items-center justify-center shrink-0">
                      {card.icon}
                    </div>
                    <span className="text-base font-bold text-white leading-snug">
                      {card.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-20">
        {/* Live Stats Strip */}
        <section aria-label="Platform highlights">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {stats.map((item, idx) => (
              <Card key={idx} className="p-5 flex items-center gap-3.5 text-left border-slate-200">
                <div className="p-3 rounded-xl bg-slate-100 shrink-0">{item.icon}</div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold text-[#0F2A4A] tabular-nums tracking-tight truncate">
                    {item.value}
                  </p>
                  <p className="text-xs font-bold text-slate-700 truncate">{item.label}</p>
                  <p className="text-xs text-slate-500 truncate">{item.sub}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Features Anchor Section */}
        <section id="features" className="scroll-mt-20 space-y-20">
          {/* Problem vs Solution */}
          <div>
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2E5E3E]">
                Purpose &amp; Impact
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0F2A4A]">
                Why BAUST Career Bridge Was Built
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Addressing critical career navigation bottlenecks for the 5,000+ member university community.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {problemSolutions.map((item, idx) => (
                <Card key={idx} className="p-6 space-y-4 border-slate-200 hover:border-slate-300">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 shrink-0 mt-0.5">
                      <XCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 mb-1">
                        The Problem
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{item.problem}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3.5 flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
                        BAUST Career Bridge Solution
                      </h3>
                      <p className="text-sm text-slate-800 font-medium leading-relaxed">{item.solution}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* 4 Core Platform Features */}
          <div>
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488]">
                Core Modules
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0F2A4A]">
                {t.features.sectionTitle}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {t.features.sectionSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card hoverable className="p-6 flex flex-col justify-between space-y-4 border-slate-200">
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-xl bg-[#0F2A4A]/10 text-[#0F2A4A] flex items-center justify-center font-bold">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-[#0F2A4A]">{t.features.verifiedTitle}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{t.features.verifiedDesc}</p>
                </div>
                <div className="pt-2">
                  <Link to="/student/directory" className="text-xs font-bold text-[#0F2A4A] hover:underline inline-flex items-center gap-1">
                    Browse Directory <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>

              <Card hoverable className="p-6 flex flex-col justify-between space-y-4 border-slate-200">
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-xl bg-[#2E5E3E]/10 text-[#2E5E3E] flex items-center justify-center font-bold">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-[#0F2A4A]">{t.features.mentorshipTitle}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{t.features.mentorshipDesc}</p>
                </div>
                <div className="pt-2">
                  <Link to="/student/mentorship" className="text-xs font-bold text-[#2E5E3E] hover:underline inline-flex items-center gap-1">
                    Book a Mentor <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>

              <Card hoverable className="p-6 flex flex-col justify-between space-y-4 border-slate-200">
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-xl bg-[#C9A227]/15 text-[#856208] flex items-center justify-center font-bold">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-[#0F2A4A]">{t.features.chatTitle}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{t.features.chatDesc}</p>
                </div>
                <div className="pt-2">
                  <Link to="/chat" className="text-xs font-bold text-[#856208] hover:underline inline-flex items-center gap-1">
                    Open Messenger <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>

              <Card hoverable className="p-6 flex flex-col justify-between space-y-4 border-slate-200">
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-[#0F2A4A]">{t.features.adminTitle}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{t.features.adminDesc}</p>
                </div>
                <div className="pt-2">
                  <Link to={servicesPath} className="text-xs font-bold text-teal-700 hover:underline inline-flex items-center gap-1">
                    Order Documents <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Resources & Network Showcase Section */}
        <section id="resources" className="scroll-mt-20 space-y-20">
          {/* Featured Alumni Showcase */}
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#2E5E3E]">
                  Our Pride
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#0F2A4A]">
                  Featured BAUST Alumni Mentors
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Connect directly with accomplished graduates leading engineering, research, and governance.
                </p>
              </div>
              {isApprovedMember ? (
                <Link to="/student/directory">
                  <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    View All {formatLocalizedNumber(liveStats.verifiedApprovedAlumni, language)} Alumni
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    {t.nav.login}
                  </Button>
                </Link>
              )}
            </div>

            {!isApprovedMember ? (
              <Card className="p-8 text-center space-y-3 border-slate-200 bg-white">
                <ShieldCheck className="w-10 h-10 text-[#0F2A4A] mx-auto" />
                <h3 className="text-base font-bold text-[#0F2A4A]">
                  {language === 'bn'
                    ? 'যাচাইকৃত অ্যালামনাই প্রোফাইল দেখতে সাইন ইন করুন'
                    : 'Sign In to Browse Verified BAUST Alumni'}
                </h3>
                <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                  {language === 'bn'
                    ? 'শিক্ষার্থী ও প্রাক্তন শিক্ষার্থীদের তথ্যের গোপনীয়তা রক্ষার্থে ডিরেক্টরি শুধুমাত্র অনুমোদিত বাউস্ট সদস্যদের জন্য উন্মুক্ত।'
                    : 'To protect member privacy, live alumni profiles and direct mentor booking are accessible after signing in (or using Quick Demo Access).'}
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Link to="/login">
                    <Button variant="primary" size="md">
                      {t.nav.login}
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="outline" size="md">
                      {t.nav.register}
                    </Button>
                  </Link>
                </div>
              </Card>
            ) : featuredAlumni.length === 0 ? (
              <Card className="p-8 text-center space-y-2 border-dashed border-slate-300">
                <Users className="w-9 h-9 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-700">
                  No verified alumni profiles are currently listed.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredAlumni.map((alumni) => {
                  const safeSkills = Array.isArray(alumni.skills) ? alumni.skills : [];
                  return (
                    <Card key={alumni.id} hoverable className="p-6 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <Avatar
                            src={alumni.avatar}
                            name={alumni.name}
                            size="lg"
                            isVerified={alumni.isVerified}
                          />
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            {alumni.isFeatured && (
                              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                                <Sparkles className="w-3 h-3" /> {t.common.featured}
                              </span>
                            )}
                            <Badge variant={alumni.sector === 'Government' ? 'army' : alumni.sector === 'Higher Studies / Abroad' || alumni.sector === 'Abroad' ? 'gold' : 'navy'}>
                              {alumni.sector}
                            </Badge>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-sm font-bold text-slate-900 leading-snug">{alumni.name}</h3>
                            {alumni.verifiedAlumniBadge && (
                              <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                                {t.common.verifiedAlumni}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-[#0F2A4A] mt-0.5">{alumni.designation}</p>
                          <p className="text-xs text-slate-500">{alumni.company}</p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
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
                          {safeSkills.slice(0, 3).map((skill, sIdx) => (
                            <span key={sIdx} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-medium">
                              {skill}
                            </span>
                          ))}
                          {safeSkills.length > 3 && (
                            <span className="text-xs text-slate-500 px-1 py-0.5">
                              +{safeSkills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                        <Link to={`/student/directory/${alumni.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            {t.common.viewProfile}
                          </Button>
                        </Link>
                        <Link to={`/student/mentorship/mentor/${alumni.id}`}>
                          <Button variant="primary" size="sm" className="text-xs">
                            {t.common.requestMentorship}
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* How It Works in 3 Steps */}
          <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 shadow-[0_2px_10px_rgba(15,42,74,0.04)]">
            <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488]">
                Simple Workflow
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0F2A4A]">
                How BAUST Career Bridge Works
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Three simple steps to unlock direct university networking and administrative ease.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {howItWorks.map((item, idx) => (
                <div key={idx} className="relative space-y-3">
                  <span className="text-4xl font-black text-[#0F2A4A]/20 font-mono tabular-nums">
                    {item.step}
                  </span>
                  <h3 className="text-base font-bold text-[#0F2A4A]">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className="bg-gradient-to-r from-[#0B2A3F] via-[#0F2A4A] to-[#0F4C5C] rounded-2xl p-8 sm:p-12 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Ready to shape your professional journey with BAUST?
            </h2>
            <p className="text-sm text-slate-200 leading-relaxed">
              Join thousands of current students and alumni collaborating today. Register with your BAUST ID or try Quick Demo Access on the Sign In page.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 shrink-0">
            <Link to="/register">
              <Button size="lg" variant="teal">
                Get Started Now
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-white/90 bg-white text-[#0F2A4A] hover:bg-slate-100 hover:text-[#0F2A4A] focus:bg-slate-100 focus:text-[#0F2A4A] active:bg-slate-200 active:text-[#0F2A4A] visited:text-[#0F2A4A] [&_svg]:text-[#0F2A4A] shadow-xs"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
