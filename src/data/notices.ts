/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NoticeItem } from '../types/admindesk';

export const initialNotices: NoticeItem[] = [
  {
    id: 'not-1',
    title: '3rd BAUST Convocation Registration & Degree Certificate Collection Guidelines',
    titleBn: '৩য় বাউস্ট সমাবর্তন নিবন্ধন ও মূল সনদপত্র সংগ্রহ সংক্রান্ত জরুরি বিজ্ঞপ্তি',
    content: 'All graduates of 1st through 6th batches of all departments are cordially notified that the 3rd Convocation will take place at the Main Parade Ground, Saidpur Cantonment. Degree gown distribution starts from December 10. Clearance slips and payment confirmation receipts must be submitted online through the Career Bridge Admin Desk.',
    category: 'Convocation',
    audience: 'All',
    isPinned: true,
    isUrgent: false,
    publishedAt: '2026-11-05',
    expiryDate: '2026-12-20',
    eventDate: '2026-12-18',
    eventLocation: 'Main Parade Ground, BAUST Saidpur Cantonment',
    rsvpCount: 342,
    userRsvpd: true,
    status: 'Published',
    attachments: [
      { name: '3rd_Convocation_Brochure_2026.pdf', size: '2.4 MB', url: 'https://example.com/notices/convocation.pdf' },
      { name: 'Degree_Gown_Measurement_Form.pdf', size: '520 KB', url: 'https://example.com/notices/gown.pdf' }
    ],
    readCount: 1420,
    isRead: true
  },
  {
    id: 'not-2',
    title: 'Urgent: Paperless Digital Document Dispatch & Verification Protocol Implemented',
    titleBn: 'জরুরি: ডিজিটালাইজড একাডেমিক সনদ বিতরণ ও সত্যায়ন পদ্ধতি চালু',
    content: 'Under directive from the BAUST Syndicate, the Office of the Controller of Examinations and Registrar has completely transitioned to digital QR-verifiable documents. Alumni no longer need to travel to Saidpur for transcripts or MOI certificates. Foreign universities and employers can verify authenticity in real-time at bcb.baust.edu.bd/verify-document.',
    category: 'Urgent',
    audience: 'Alumni',
    isPinned: true,
    isUrgent: true,
    publishedAt: '2026-11-02',
    status: 'Published',
    attachments: [
      { name: 'Official_Syndicate_Notification_Digital_Docs.pdf', size: '1.1 MB', url: 'https://example.com/notices/digital.pdf' }
    ],
    readCount: 2150,
    isRead: false
  },
  {
    id: 'not-3',
    title: 'Annual BAUST Alumni Reunion & Gala Night 2026 in Dhaka',
    titleBn: 'ঢাকা চ্যাপ্টার বাউস্ট অ্যালামনাই রিইউনিয়ন ও গালা নাইট ২০২৬',
    content: 'Join fellow alumni across all 8 departments for an evening of networking, dinner, and faculty interactions at the Golf Garden, Army Golf Club, Dhaka. Distinguished guests include the Chairman Board of Trustees and university leadership. Early bird registration is open for alumni and their spouses.',
    category: 'Alumni Event',
    audience: 'Alumni',
    isPinned: false,
    isUrgent: false,
    publishedAt: '2026-10-28',
    eventDate: '2026-11-28',
    eventLocation: 'Golf Garden, Army Golf Club, Airport Road, Dhaka',
    rsvpCount: 188,
    userRsvpd: false,
    status: 'Published',
    attachments: [
      { name: 'Gala_Night_Event_Schedule.pdf', size: '890 KB', url: 'https://example.com/notices/gala.pdf' }
    ],
    readCount: 980,
    isRead: true
  },
  {
    id: 'not-4',
    title: 'Special Academic Clearance Window for 7th & 8th Batch Graduates',
    titleBn: '৭ম ও ৮ম ব্যাচের গ্র্যাজুয়েটদের জন্য বিশেষ একাডেমিক ক্লিয়ারেন্স সময়সূচি',
    content: 'The Exam Controller office is holding a special online clearance round for recent graduates. Submit your hall and departmental dues through the admin desk before November 20 to receive provisional certificates in the upcoming batch issuance.',
    category: 'Academic',
    audience: 'Alumni',
    isPinned: false,
    isUrgent: false,
    publishedAt: '2026-10-22',
    expiryDate: '2026-11-20',
    status: 'Published',
    readCount: 750,
    isRead: false
  },
  {
    id: 'not-5',
    title: 'Recruitment Circular: Full-time Faculty Positions in CSE, EEE & ME Departments',
    titleBn: 'নিয়োগ বিজ্ঞপ্তি: সিএসই, ট্রিপল-ই এবং মেকানিক্যাল বিভাগে শিক্ষক নিয়োগ',
    content: 'Applications are invited from high-achieving BAUST alumni and external candidates for the posts of Lecturer and Assistant Professor. First-class B.Sc. with minimum CGPA 3.75 required. Apply via the Vacancies tab in Career Bridge.',
    category: 'Job/Recruitment',
    audience: 'All',
    isPinned: false,
    isUrgent: false,
    publishedAt: '2026-10-18',
    expiryDate: '2026-11-30',
    status: 'Published',
    attachments: [
      { name: 'Faculty_Recruitment_Circular_Fall2026.pdf', size: '1.5 MB', url: 'https://example.com/notices/jobs.pdf' }
    ],
    readCount: 1640,
    isRead: false
  },
  {
    id: 'not-6',
    title: 'Policy Update: Revised Courier Service & Express Delivery Timelines',
    titleBn: 'নীতিমালা সংশোধন: কুরিয়ার সার্ভিস ও এক্সপ্রেস ডেলিভারি সময়সীমা',
    content: 'Domestic home delivery via SA Paribahan and Sundarban Courier now supports 48-hour delivery across all divisional cities in Bangladesh. International dispatch through DHL Express is integrated directly for overseas graduates.',
    category: 'Policy',
    audience: 'All',
    isPinned: false,
    isUrgent: false,
    publishedAt: '2026-10-10',
    status: 'Published',
    readCount: 520,
    isRead: true
  },
  {
    id: 'not-7',
    title: 'Webinar: Navigating DAAD, Erasmus & US Graduate Fellowships from BAUST',
    titleBn: 'ওয়েবিনার: বাউস্ট থেকে ড্যাড, ইরাসমাস ও মার্কিন স্কলারশিপ পাওয়ার উপায়',
    content: 'Featuring BAUST alumni currently pursuing PhDs in Germany, Canada, and Australia. Topic covers SOP writing, cold emailing professors, and preparing verified academic transcripts.',
    category: 'Alumni Event',
    audience: 'All',
    isPinned: false,
    isUrgent: false,
    publishedAt: '2026-10-05',
    eventDate: '2026-11-14',
    eventLocation: 'Zoom Online Meeting (Link sent to registered participants)',
    rsvpCount: 260,
    userRsvpd: true,
    status: 'Published',
    readCount: 1100,
    isRead: true
  },
  {
    id: 'not-8',
    title: 'Lost Certificate Declaration Protocol and Police GD Guidelines',
    titleBn: 'সনদপত্র হারালে করণীয় ও পুলিশ জিডি সংক্রান্ত প্রাতিষ্ঠানিক নির্দেশিকা',
    content: 'Guidelines on re-issuance of original certificates in case of loss or theft. A certified copy of the Police General Diary (GD) and clipping of an advertisement published in a national newspaper are required.',
    category: 'Policy',
    audience: 'Alumni',
    isPinned: false,
    isUrgent: false,
    publishedAt: '2026-09-25',
    status: 'Published',
    readCount: 430,
    isRead: true
  },
  {
    id: 'not-9',
    title: 'Call for Nominations: BAUST Distinguished Alumni Award 2026',
    titleBn: 'বাউস্ট বিশিষ্ট অ্যালামনাই অ্যাওয়ার্ড ২০২৬ এর মনোনয়ন আহ্বান',
    content: 'Recognizing alumni who have demonstrated exceptional leadership in civil service, scientific research, industry innovation, and social impact. Submit self-nomination or nominate a batchmate.',
    category: 'Alumni Event',
    audience: 'Alumni',
    isPinned: false,
    isUrgent: false,
    publishedAt: '2026-09-15',
    expiryDate: '2026-11-25',
    status: 'Published',
    readCount: 890,
    isRead: false
  },
  {
    id: 'not-10',
    title: 'Holiday Notice: University Offices Closed on Victory Day (16 December)',
    titleBn: 'ছুটির বিজ্ঞপ্তি: মহান বিজয় দিবস উপলক্ষে বিশ্ববিদ্যালয় অফিস বন্ধ সংক্রান্ত',
    content: 'The administrative offices, registrar desk, and exam controller counter will remain closed on 16 December. Online service desk applications submitted during this period will be processed on the next working day.',
    category: 'Academic',
    audience: 'All',
    isPinned: false,
    isUrgent: false,
    publishedAt: '2026-09-01',
    status: 'Published',
    readCount: 610,
    isRead: true
  }
];
