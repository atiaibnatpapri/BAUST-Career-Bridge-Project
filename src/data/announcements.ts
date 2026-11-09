/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Announcement } from '../types';

export const mockAnnouncements: Announcement[] = [
  {
    id: 'ANC-01',
    title: 'BAUST Annual Career & Tech Expo 2026',
    category: 'Career Fair',
    targetAudience: 'All',
    content: 'The Office of Student Welfare & Alumni Affairs is organizing the 4th BAUST National Career & Tech Expo on November 15-16, 2026 at the BAUST Central Auditorium, Saidpur Cantonment. Over 35 multinational & local tech companies, fintech firms, and engineering conglomerates will conduct on-spot interviews and CV drops.',
    author: 'Registrar & Student Affairs Office',
    date: 'Oct 24, 2026',
    pinned: true,
    linkText: 'Register for CV Drop',
    linkUrl: '#',
  },
  {
    id: 'ANC-02',
    title: 'Digital Academic Document Delivery System Launched',
    category: 'Notice',
    targetAudience: 'Alumni',
    content: 'Graduated students can now request official academic transcripts, provisional certificates, and medium of instruction (MOI) certificates online through the BAUST Career Bridge Admin Desk. Track real-time status with delivery via courier or direct campus collection.',
    author: 'Controller of Examinations',
    date: 'Oct 20, 2026',
    pinned: true,
  },
  {
    id: 'ANC-03',
    title: 'Alumni Mentorship Circle: Fall 2026 Cohort Registration Open',
    category: 'Webinar',
    targetAudience: 'Students',
    content: 'Level-3 and Level-4 students can now connect 1-on-1 with verified BAUST alumni across Government, Tech, Private, and Higher Studies abroad sectors for structured CV audits and mock technical interviews.',
    author: 'BAUST Alumni Association Executive Committee',
    date: 'Oct 18, 2026',
    pinned: false,
    linkText: 'Browse Mentors',
    linkUrl: '/student/directory',
  },
  {
    id: 'ANC-04',
    title: 'Masterclass: Preparing for 47th BCS Preliminary & Written Strategy',
    category: 'Event',
    targetAudience: 'All',
    content: 'Join our distinguished alumni cadre officers including Mohammad Rashedul Islam (ASP, 38th BCS) and Shakil Ahmed (Assistant Director) for a virtual interactive session on November 2, 2026 at 7:30 PM.',
    author: 'BAUST Career Club',
    date: 'Oct 15, 2026',
    pinned: false,
  }
];
