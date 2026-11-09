/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DirectoryAlumniProfile } from '../types/directory';

export const initialAlumniProfiles: DirectoryAlumniProfile[] = [
  {
    id: 'alm-1',
    name: 'Kazi Farhan Kabir',
    nameBn: 'কাজী ফারহান কবির',
    email: 'farhan.kabir@brainstation-23.com',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
    department: 'CSE',
    batch: '4th Batch',
    batchNumber: 4,
    admissionYear: 2016,
    passingYear: 2020,
    studentIdMasked: '160201***',
    phone: '+880 1712-345678',
    headline: 'Senior Full Stack Engineer at Brain Station 23 | Ex-BJIT | Former BAUST PC President',
    bio: 'Passionate software craftsman with 5+ years building enterprise fintech, microservices, and distributed cloud applications. Mentor to 50+ junior developers across northern Bangladesh universities.',
    bioBn: '৫+ বছরের অভিজ্ঞ ফুল-স্ট্যাক ইঞ্জিনিয়ার, ফিনটেক ও ডিস্ট্রিবিউটেড সিস্টেম তৈরিতে বিশেষ পারদর্শী। বাউস্টের সাবেক প্রোগ্রামিং ক্লাব সভাপতি।',
    isVerified: true,
    verificationBadgeLevel: 'Top Mentor',
    designation: 'Senior Software Engineer',
    company: 'Brain Station 23',
    sector: 'Private',
    location: 'Dhaka, Bangladesh',
    country: 'Bangladesh',
    city: 'Dhaka',
    cgpa: 3.88,
    thesisTitle: 'Distributed Microservice Orchestration for Real-time Financial Settlement',
    thesisSupervisor: 'Prof. Dr. Md. Ashraful Islam',
    honors: ["Dean's Honor List 2019", "Champion, Inter-University Hackathon 2019", "Best Project Award BAUST TechFest"],
    clubs: ['BAUST Programming Club (President)', 'Robotics & Automation Club', 'Debating Society'],
    scholarships: ['BAUST Merit Scholarship (4 Semesters)'],
    education: [
      {
        id: 'edu-1',
        degree: 'B.Sc. in Computer Science & Engineering',
        institution: 'Bangladesh Army University of Science and Technology (BAUST)',
        department: 'CSE',
        period: '2016 - 2020',
        cgpa: 3.88,
        thesisTitle: 'Distributed Microservice Orchestration',
        thesisSupervisor: 'Prof. Dr. Md. Ashraful Islam'
      }
    ],
    publications: [
      {
        id: 'pub-1',
        title: 'Optimizing Latency in Financial Microservices using Event-Driven Message Brokers',
        conferenceOrJournal: 'IEEE Region 10 Humanitarian Technology Conference (R10-HTC)',
        year: 2021,
        doiOrUrl: 'https://doi.org/10.1109/R10-HTC53172.2021',
        field: 'Distributed Systems'
      }
    ],
    skillsWithLevels: [
      {
        id: 'sk-1',
        name: 'React.js',
        level: 'Expert',
        endorsements: [
          { studentId: 'stu-1', studentName: 'Tamim Al Mahmud', studentDept: 'CSE', date: '2024-10-12', comment: 'Guided my final year React project architecture.' },
          { studentId: 'stu-2', studentName: 'Fabiha Rahman', studentDept: 'CSE', date: '2024-11-03' }
        ]
      },
      {
        id: 'sk-2',
        name: 'TypeScript',
        level: 'Expert',
        endorsements: [
          { studentId: 'stu-3', studentName: 'Naimul Hasan', studentDept: 'CSE', date: '2024-09-18' }
        ]
      },
      {
        id: 'sk-3',
        name: 'Node.js & NestJS',
        level: 'Advanced',
        endorsements: [
          { studentId: 'stu-4', studentName: 'Sadia Akhter', studentDept: 'CSE', date: '2024-12-01' }
        ]
      },
      { id: 'sk-4', name: 'PostgreSQL', level: 'Advanced', endorsements: [] },
      { id: 'sk-5', name: 'Docker & Kubernetes', level: 'Intermediate', endorsements: [] },
      { id: 'sk-6', name: 'System Design', level: 'Expert', endorsements: [] }
    ],
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'System Design'],
    topExpertise: ['Fintech Systems', 'Scalable Architecture', 'MERN & NestJS'],
    experienceTimeline: [
      {
        id: 'exp-1',
        period: '2022 - Present',
        role: 'Senior Software Engineer',
        company: 'Brain Station 23',
        location: 'Dhaka, Bangladesh',
        isCurrent: true,
        description: 'Leading fintech core transaction engine supporting 2.5M daily requests with 99.99% uptime.'
      },
      {
        id: 'exp-2',
        period: '2020 - 2022',
        role: 'Software Engineer',
        company: 'BJIT Group',
        location: 'Dhaka, Bangladesh',
        isCurrent: false,
        description: 'Engineered Japanese enterprise SaaS solutions using TypeScript and automated CI/CD pipelines.'
      }
    ],
    certifications: ['AWS Certified Solutions Architect – Associate', 'Certified ScrumMaster (CSM)'],
    interestedFields: ['Fintech', 'Distributed Systems', 'Cloud Native'],
    mentoringAvailable: true,
    openToReferrals: true,
    openToHiring: true,
    mentorshipTopics: ['CV Review', 'Interview Prep', 'Career Guidance'],
    availableSlots: ['Friday 7:00 PM', 'Saturday 8:00 PM', 'Tuesday 9:00 PM'],
    totalMentees: 24,
    studentsConsulted: 78,
    rating: 4.9,
    reviewCount: 31,
    linkedin: 'https://linkedin.com/in/farhan-kabir-baust',
    github: 'https://github.com/farhankabir',
    portfolio: 'https://farhankabir.dev',
    privacy: {
      cgpa: 'public',
      email: 'students_only',
      phone: 'connections_only',
      location: 'public'
    },
    stats: {
      profileViewsThisMonth: 142,
      searchAppearances: 389,
      bookmarksCount: 45,
      endorsementsReceived: 27,
      monthlyViewHistory: [
        { month: 'Oct', views: 88 },
        { month: 'Nov', views: 115 },
        { month: 'Dec', views: 120 },
        { month: 'Jan', views: 138 },
        { month: 'Feb', views: 142 }
      ]
    },
    lastUpdated: '2025-02-15'
  },
  {
    id: 'alm-2',
    name: 'Anika Bushra',
    nameBn: 'আনিকা বুশরা',
    email: 'anika.bushra@samsung.com',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
    department: 'CSE',
    batch: '3rd Batch',
    batchNumber: 3,
    admissionYear: 2015,
    passingYear: 2019,
    studentIdMasked: '150201***',
    headline: 'Senior AI/ML Researcher at Samsung R&D Institute Bangladesh',
    bio: 'Pioneering speech recognition, natural language processing for low-resource South Asian languages. Advised dozens of BAUST undergraduates on publishing in top IEEE/ACM venues.',
    isVerified: true,
    verificationBadgeLevel: 'Official BAUST',
    designation: 'Senior Machine Learning Researcher',
    company: 'Samsung R&D Institute Bangladesh',
    sector: 'Research',
    location: 'Dhaka, Bangladesh',
    country: 'Bangladesh',
    city: 'Dhaka',
    cgpa: 3.94,
    thesisTitle: 'Acoustic Model Adaptations for Bangla Regional Dialects using Deep Neural Networks',
    thesisSupervisor: 'Dr. Mohammad Nazrul Islam',
    honors: ['Chancellor Gold Medal Nominee', "BAUST Dean's Award 2018 & 2019"],
    clubs: ['BAUST Robotics & Research Guild (Founder Member)', 'Women in Tech BAUST'],
    scholarships: ['BAUST Full Merit Waiver'],
    education: [
      {
        id: 'edu-2',
        degree: 'B.Sc. in Computer Science & Engineering',
        institution: 'Bangladesh Army University of Science and Technology (BAUST)',
        department: 'CSE',
        period: '2015 - 2019',
        cgpa: 3.94
      }
    ],
    publications: [
      {
        id: 'pub-2',
        title: 'Dialect-Robust End-to-End ASR for Low-Resource Bengali Dialects',
        conferenceOrJournal: 'Interspeech 2022',
        year: 2022,
        doiOrUrl: 'https://doi.org/10.21437/Interspeech.2022-1082',
        field: 'Speech Processing'
      }
    ],
    skillsWithLevels: [
      { id: 'sk-7', name: 'PyTorch', level: 'Expert', endorsements: [{ studentId: 'stu-1', studentName: 'Tamim', studentDept: 'CSE', date: '2024-08-10' }] },
      { id: 'sk-8', name: 'NLP & Transformers', level: 'Expert', endorsements: [] },
      { id: 'sk-9', name: 'Python', level: 'Expert', endorsements: [] },
      { id: 'sk-10', name: 'Computer Vision', level: 'Advanced', endorsements: [] }
    ],
    skills: ['PyTorch', 'NLP', 'Computer Vision', 'Deep Learning', 'Python'],
    topExpertise: ['Bengali NLP/ASR', 'LLM Fine-tuning', 'Research Paper Publishing'],
    experienceTimeline: [
      {
        id: 'exp-3',
        period: '2021 - Present',
        role: 'Senior Machine Learning Researcher',
        company: 'Samsung R&D Institute Bangladesh',
        location: 'Dhaka',
        isCurrent: true,
        description: 'Developing on-device multilingual voice assistants for Galaxy ecosystem.'
      }
    ],
    certifications: ['DeepLearning.AI TensorFlow Specialization'],
    interestedFields: ['Multimodal AI', 'Speech Tech', 'Edge AI'],
    mentoringAvailable: true,
    openToReferrals: true,
    openToHiring: false,
    mentorshipTopics: ['Research & Publication', 'Higher Studies', 'CV Review'],
    availableSlots: ['Sunday 8:00 PM', 'Thursday 9:00 PM'],
    totalMentees: 31,
    studentsConsulted: 94,
    rating: 4.95,
    reviewCount: 39,
    linkedin: 'https://linkedin.com/in/anika-bushra-srdb',
    googleScholar: 'https://scholar.google.com/citations?user=anika-bushra',
    privacy: {
      cgpa: 'public',
      email: 'students_only',
      phone: 'hidden',
      location: 'public'
    },
    stats: {
      profileViewsThisMonth: 189,
      searchAppearances: 420,
      bookmarksCount: 62,
      endorsementsReceived: 34,
      monthlyViewHistory: [
        { month: 'Oct', views: 110 },
        { month: 'Nov', views: 135 },
        { month: 'Dec', views: 150 },
        { month: 'Jan', views: 175 },
        { month: 'Feb', views: 189 }
      ]
    },
    lastUpdated: '2025-02-10'
  },
  {
    id: 'alm-3',
    name: 'Md. Tanvir Hasan (BCS)',
    nameBn: 'মোঃ তানভীর হাসান',
    email: 'tanvir.hasan@mopa.gov.bd',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=1200&auto=format&fit=crop&q=80',
    department: 'EEE',
    batch: '2nd Batch',
    batchNumber: 2,
    admissionYear: 2015,
    passingYear: 2019,
    studentIdMasked: '150101***',
    headline: 'Assistant Commissioner & Executive Magistrate (38th BCS Admin Cadre) | Govt of Bangladesh',
    bio: 'Ranked in the 38th BCS (Administration). Formerly served in field administration and public land governance. Mentors BAUST graduates preparing for Civil Services and Bank recruitment.',
    isVerified: true,
    verificationBadgeLevel: 'Official BAUST',
    designation: 'Assistant Commissioner & Executive Magistrate',
    company: 'Ministry of Public Administration (38th BCS Admin)',
    sector: 'Government',
    location: 'Rangpur Division, Bangladesh',
    country: 'Bangladesh',
    city: 'Rangpur',
    cgpa: 3.72,
    thesisTitle: 'Smart Grid Load Balancing and Power Factor Correction in Rural Microgrids',
    thesisSupervisor: 'Prof. Engr. Golam Morshed',
    honors: ['38th BCS Merit Stand', 'BAUST Debating Champion 2017'],
    clubs: ['BAUST Debating Society (General Secretary)', 'Cultural Club'],
    scholarships: ['University Board Merit Scholarship'],
    education: [
      {
        id: 'edu-3',
        degree: 'B.Sc. in Electrical and Electronic Engineering',
        institution: 'Bangladesh Army University of Science and Technology (BAUST)',
        department: 'EEE',
        period: '2015 - 2019',
        cgpa: 3.72
      }
    ],
    publications: [],
    skillsWithLevels: [
      { id: 'sk-11', name: 'BCS Preliminary Strategy', level: 'Expert', endorsements: [] },
      { id: 'sk-12', name: 'Written & Viva Preparation', level: 'Expert', endorsements: [] },
      { id: 'sk-13', name: 'Public Administration', level: 'Advanced', endorsements: [] }
    ],
    skills: ['BCS Preparation', 'General Knowledge', 'Public Policy', 'Civil Service Viva', 'Govt Job Strategy'],
    topExpertise: ['38th BCS Admin Cadre', 'Written Strategy', 'Viva Board Navigation'],
    experienceTimeline: [
      {
        id: 'exp-4',
        period: '2021 - Present',
        role: 'Assistant Commissioner & Executive Magistrate',
        company: 'Government of Bangladesh',
        location: 'Rangpur Division',
        isCurrent: true,
        description: 'Handling mobile courts, district protocol, revenue administration, and citizen grievance redressal.'
      }
    ],
    certifications: ['BPATC Foundation Training Course (FTC)'],
    interestedFields: ['Public Policy', 'E-Governance', 'Administrative Reforms'],
    mentoringAvailable: true,
    openToReferrals: false,
    openToHiring: false,
    mentorshipTopics: ['Government / BCS', 'Career Guidance'],
    availableSlots: ['Friday 4:00 PM', 'Saturday 5:00 PM'],
    totalMentees: 45,
    studentsConsulted: 118,
    rating: 4.98,
    reviewCount: 52,
    privacy: {
      cgpa: 'public',
      email: 'students_only',
      phone: 'hidden',
      location: 'public'
    },
    stats: {
      profileViewsThisMonth: 230,
      searchAppearances: 512,
      bookmarksCount: 92,
      endorsementsReceived: 41,
      monthlyViewHistory: [
        { month: 'Oct', views: 140 },
        { month: 'Nov', views: 180 },
        { month: 'Dec', views: 200 },
        { month: 'Jan', views: 215 },
        { month: 'Feb', views: 230 }
      ]
    },
    lastUpdated: '2025-02-14'
  },
  {
    id: 'alm-4',
    name: 'Sifat E Noor',
    nameBn: 'সিফাত ই নূর',
    email: 'sifat.noor@tum.de',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80',
    department: 'ME',
    batch: '1st Batch',
    batchNumber: 1,
    admissionYear: 2015,
    passingYear: 2019,
    studentIdMasked: '150301***',
    headline: 'Ph.D. Researcher in Sustainable Thermal Systems at Technical University of Munich (TUM), Germany',
    bio: 'BAUST Mechanical pioneer now conducting cutting-edge thermal fluid dynamics and hydrogen fuel cell simulations in Munich. Mentors students seeking DAAD, Erasmus Mundus, and European master/doctoral admissions.',
    isVerified: true,
    verificationBadgeLevel: 'Top Mentor',
    designation: 'Doctoral Researcher',
    company: 'Technical University of Munich (TUM)',
    sector: 'Abroad',
    location: 'Munich, Bavaria, Germany',
    country: 'Germany',
    city: 'Munich',
    cgpa: 3.91,
    thesisTitle: 'CFD Analysis of Nanofluid Heat Exchangers for Solar Thermal Storage',
    thesisSupervisor: 'Brig. Gen. (Retd.) Prof. Engr. M. Zahid Hossain',
    honors: ['DAAD Full Scholarship Recipient', 'BAUST Best Thesis in ME 2019'],
    clubs: ['BAUST Mechanical Society (Founding President)'],
    scholarships: ['DAAD Master Scholarship 2020-2022', 'TUM Doctoral Grant'],
    education: [
      {
        id: 'edu-4',
        degree: 'M.Sc. in Power Engineering',
        institution: 'Technical University of Munich (TUM)',
        department: 'Mechanical Engineering',
        period: '2020 - 2022',
        cgpa: 3.95
      },
      {
        id: 'edu-5',
        degree: 'B.Sc. in Mechanical Engineering',
        institution: 'Bangladesh Army University of Science and Technology (BAUST)',
        department: 'ME',
        period: '2015 - 2019',
        cgpa: 3.91
      }
    ],
    publications: [
      {
        id: 'pub-3',
        title: 'Thermal conductivity enhancement in hybrid nanofluid direct absorption solar collectors',
        conferenceOrJournal: 'Applied Thermal Engineering (Elsevier)',
        year: 2023,
        doiOrUrl: 'https://doi.org/10.1016/j.applthermaleng.2023.120451',
        field: 'Thermal Engineering'
      }
    ],
    skillsWithLevels: [
      { id: 'sk-14', name: 'ANSYS Fluent & CFD', level: 'Expert', endorsements: [] },
      { id: 'sk-15', name: 'DAAD Scholarship SOP', level: 'Expert', endorsements: [] },
      { id: 'sk-16', name: 'IELTS / GRE Prep', level: 'Advanced', endorsements: [] },
      { id: 'sk-17', name: 'MATLAB & Simulink', level: 'Expert', endorsements: [] }
    ],
    skills: ['CFD Simulation', 'ANSYS', 'DAAD Prep', 'German Higher Study', 'SOP Writing'],
    topExpertise: ['DAAD Scholarships', 'German University Admissions', 'Computational Fluid Dynamics'],
    experienceTimeline: [
      {
        id: 'exp-5',
        period: '2022 - Present',
        role: 'Doctoral Researcher',
        company: 'Technical University of Munich (TUM)',
        location: 'Munich, Germany',
        isCurrent: true,
        description: 'Conducting experimental & numerical investigations into zero-emission hydrogen combustors.'
      }
    ],
    certifications: ['Certified SolidWorks Professional (CSWP)'],
    interestedFields: ['Green Hydrogen', 'Renewable Energy', 'Thermal Storage'],
    mentoringAvailable: true,
    openToReferrals: true,
    openToHiring: false,
    mentorshipTopics: ['Higher Studies', 'Research & Publication', 'CV Review'],
    availableSlots: ['Saturday 4:00 PM CET', 'Sunday 3:00 PM CET'],
    totalMentees: 29,
    studentsConsulted: 87,
    rating: 4.96,
    reviewCount: 36,
    linkedin: 'https://linkedin.com/in/sifat-e-noor-tum',
    privacy: {
      cgpa: 'public',
      email: 'students_only',
      phone: 'hidden',
      location: 'public'
    },
    stats: {
      profileViewsThisMonth: 175,
      searchAppearances: 460,
      bookmarksCount: 83,
      endorsementsReceived: 29,
      monthlyViewHistory: [
        { month: 'Oct', views: 95 },
        { month: 'Nov', views: 130 },
        { month: 'Dec', views: 155 },
        { month: 'Jan', views: 168 },
        { month: 'Feb', views: 175 }
      ]
    },
    lastUpdated: '2025-02-12'
  },
  {
    id: 'alm-5',
    name: 'Abrar Shahriar',
    nameBn: 'আবরার শাহরিয়ার',
    email: 'abrar@optimizely.com',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
    department: 'CSE',
    batch: '2nd Batch',
    batchNumber: 2,
    admissionYear: 2015,
    passingYear: 2019,
    studentIdMasked: '150202***',
    headline: 'Staff Software Engineer at Optimizely | Ex-Therap (BD) | Distributed Systems Architect',
    bio: '8+ years designing high-throughput SaaS web architecture. Active tech blogger, open source contributor, and technical interview trainer for global product firms.',
    isVerified: true,
    verificationBadgeLevel: 'Top Mentor',
    designation: 'Staff Software Engineer',
    company: 'Optimizely',
    sector: 'Private',
    location: 'Dhaka, Bangladesh',
    country: 'Bangladesh',
    city: 'Dhaka',
    cgpa: 3.82,
    thesisTitle: 'Fault-tolerant Consensus in Asynchronous Peer-to-Peer Networks',
    thesisSupervisor: 'Prof. Dr. Md. Ashraful Islam',
    honors: ["BAUST Vice Chancellor's Merit Award", 'National Hackathon Runner-up'],
    clubs: ['BAUST Programming Club (Vice President)'],
    scholarships: ['BAUST Merit Scholarship'],
    education: [
      {
        id: 'edu-6',
        degree: 'B.Sc. in Computer Science & Engineering',
        institution: 'Bangladesh Army University of Science and Technology (BAUST)',
        department: 'CSE',
        period: '2015 - 2019',
        cgpa: 3.82
      }
    ],
    publications: [],
    skillsWithLevels: [
      { id: 'sk-18', name: 'Go / Golang', level: 'Expert', endorsements: [] },
      { id: 'sk-19', name: 'Distributed Systems', level: 'Expert', endorsements: [] },
      { id: 'sk-20', name: 'Kafka & Redis', level: 'Expert', endorsements: [] },
      { id: 'sk-21', name: 'Java Spring Boot', level: 'Advanced', endorsements: [] }
    ],
    skills: ['Golang', 'Java', 'Distributed Systems', 'Kafka', 'System Design', 'GCP'],
    topExpertise: ['High Volume Systems', 'Mock Coding Interviews', 'Global Remote Careers'],
    experienceTimeline: [
      {
        id: 'exp-6',
        period: '2023 - Present',
        role: 'Staff Software Engineer',
        company: 'Optimizely',
        location: 'Dhaka',
        isCurrent: true,
        description: 'Architecting experimentation experimentation SDK pipelines delivering 10B+ events/month.'
      },
      {
        id: 'exp-7',
        period: '2019 - 2023',
        role: 'Senior Software Engineer',
        company: 'Therap (BD) Ltd.',
        location: 'Dhaka',
        isCurrent: false,
        description: 'Built HIPAA-compliant electronic healthcare records software for US state agencies.'
      }
    ],
    certifications: ['Certified Kubernetes Administrator (CKA)'],
    interestedFields: ['Edge Computing', 'Event Sourcing', 'Engineering Leadership'],
    mentoringAvailable: true,
    openToReferrals: true,
    openToHiring: true,
    mentorshipTopics: ['Interview Prep', 'Career Guidance', 'CV Review'],
    availableSlots: ['Saturday 8:00 PM', 'Sunday 9:00 PM'],
    totalMentees: 42,
    studentsConsulted: 110,
    rating: 4.97,
    reviewCount: 46,
    linkedin: 'https://linkedin.com/in/abrar-shahriar',
    github: 'https://github.com/abrarshahriar',
    privacy: {
      cgpa: 'students_only',
      email: 'students_only',
      phone: 'hidden',
      location: 'public'
    },
    stats: {
      profileViewsThisMonth: 210,
      searchAppearances: 540,
      bookmarksCount: 98,
      endorsementsReceived: 42,
      monthlyViewHistory: [
        { month: 'Oct', views: 130 },
        { month: 'Nov', views: 165 },
        { month: 'Dec', views: 190 },
        { month: 'Jan', views: 205 },
        { month: 'Feb', views: 210 }
      ]
    },
    lastUpdated: '2025-02-16'
  },
  {
    id: 'alm-6',
    name: 'Nusrat Jahan',
    nameBn: 'নুসরাত জাহান',
    email: 'nusrat.ce@walton.com.bd',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    department: 'CE',
    batch: '1st Batch',
    batchNumber: 1,
    admissionYear: 2015,
    passingYear: 2019,
    studentIdMasked: '150401***',
    headline: 'Senior Structural Design Engineer at Walton Hi-Tech Industries PLC',
    bio: 'Lead civil engineer overseeing seismic-resistant industrial superstructure designs for 100+ acre manufacturing plants. Passionate about inspiring women engineers in heavy construction.',
    isVerified: true,
    verificationBadgeLevel: 'Official BAUST',
    designation: 'Senior Structural Engineer',
    company: 'Walton Hi-Tech Industries PLC',
    sector: 'Private',
    location: 'Gazipur, Bangladesh',
    country: 'Bangladesh',
    city: 'Gazipur',
    cgpa: 3.76,
    thesisTitle: 'Performance-Based Seismic Assessment of Reinforced Concrete Industrial Buildings',
    thesisSupervisor: 'Col. Engr. Md. Tariqul Islam',
    honors: ['IEB Student Chapter Best Organizer 2018'],
    clubs: ['BAUST Civil Engineering Association (Founding Member)', 'IEB BAUST Chapter'],
    scholarships: ['BAUST Academic Excellence Award'],
    education: [
      {
        id: 'edu-7',
        degree: 'B.Sc. in Civil Engineering',
        institution: 'Bangladesh Army University of Science and Technology (BAUST)',
        department: 'CE',
        period: '2015 - 2019',
        cgpa: 3.76
      }
    ],
    publications: [],
    skillsWithLevels: [
      { id: 'sk-22', name: 'ETABS & SAP2000', level: 'Expert', endorsements: [] },
      { id: 'sk-23', name: 'AutoCAD Structural Detailing', level: 'Expert', endorsements: [] },
      { id: 'sk-24', name: 'BNBC 2020 Compliance', level: 'Expert', endorsements: [] }
    ],
    skills: ['ETABS', 'STAAD Pro', 'BNBC Codes', 'Structural Analysis', 'AutoCAD Civil'],
    topExpertise: ['Industrial Structural Design', 'BNBC 2020 Code', 'Site Safety & Project Management'],
    experienceTimeline: [
      {
        id: 'exp-8',
        period: '2021 - Present',
        role: 'Senior Structural Engineer',
        company: 'Walton Hi-Tech Industries PLC',
        location: 'Chandra, Gazipur',
        isCurrent: true,
        description: 'Supervised structural calculations and retrofitting for mega-scale industrial complexes.'
      }
    ],
    certifications: ['IEB Chartered Engineer (MIEB)'],
    interestedFields: ['Earthquake Engineering', 'Steel Structures', 'Sustainable Building Materials'],
    mentoringAvailable: true,
    openToReferrals: true,
    openToHiring: true,
    mentorshipTopics: ['Career Guidance', 'CV Review', 'Interview Prep'],
    availableSlots: ['Friday 5:00 PM', 'Saturday 6:00 PM'],
    totalMentees: 18,
    studentsConsulted: 54,
    rating: 4.88,
    reviewCount: 22,
    linkedin: 'https://linkedin.com/in/nusrat-jahan-ce',
    privacy: {
      cgpa: 'public',
      email: 'students_only',
      phone: 'hidden',
      location: 'public'
    },
    stats: {
      profileViewsThisMonth: 95,
      searchAppearances: 280,
      bookmarksCount: 38,
      endorsementsReceived: 19,
      monthlyViewHistory: [
        { month: 'Oct', views: 50 },
        { month: 'Nov', views: 72 },
        { month: 'Dec', views: 85 },
        { month: 'Jan', views: 90 },
        { month: 'Feb', views: 95 }
      ]
    },
    lastUpdated: '2025-01-29'
  },
  {
    id: 'alm-7',
    name: 'Sabbir Ahmed Khan',
    nameBn: 'সাব্বির আহমেদ খান',
    email: 'sabbir.khan@beximcopharma.com',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&auto=format&fit=crop&q=80',
    department: 'IPE',
    batch: '2nd Batch',
    batchNumber: 2,
    admissionYear: 2015,
    passingYear: 2019,
    studentIdMasked: '150501***',
    headline: 'Assistant General Manager, Supply Chain & Lean Manufacturing at Beximco Pharma',
    bio: 'Six Sigma Black Belt professional heading global pharmaceutical distribution logistics, GMP warehouse automation, and operational efficiency transformations.',
    isVerified: true,
    verificationBadgeLevel: 'Official BAUST',
    designation: 'Assistant General Manager (Supply Chain)',
    company: 'Beximco Pharmaceuticals Ltd.',
    sector: 'Private',
    location: 'Dhaka, Bangladesh',
    country: 'Bangladesh',
    city: 'Dhaka',
    cgpa: 3.65,
    thesisTitle: 'Supply Chain Resiliency Optimization during Unprecedented Global Health Crises',
    thesisSupervisor: 'Dr. Md. Rafiqul Islam',
    honors: ['Dean’s List for Outstanding Leadership in Industry Collabs'],
    clubs: ['BAUST IPE Society (President)', 'Sports Club'],
    scholarships: [],
    education: [
      {
        id: 'edu-8',
        degree: 'B.Sc. in Industrial and Production Engineering',
        institution: 'Bangladesh Army University of Science and Technology (BAUST)',
        department: 'IPE',
        period: '2015 - 2019',
        cgpa: 3.65
      }
    ],
    publications: [],
    skillsWithLevels: [
      { id: 'sk-25', name: 'Lean Six Sigma', level: 'Expert', endorsements: [] },
      { id: 'sk-26', name: 'Supply Chain Strategy', level: 'Expert', endorsements: [] },
      { id: 'sk-27', name: 'SAP S/4HANA (MM/PP)', level: 'Advanced', endorsements: [] }
    ],
    skills: ['Six Sigma', 'Supply Chain', 'Operations Research', 'SAP ERP', 'Quality Control'],
    topExpertise: ['Pharmaceutical Supply Chain', 'Lean Six Sigma Black Belt', 'FMCG Corporate Interviews'],
    experienceTimeline: [
      {
        id: 'exp-9',
        period: '2022 - Present',
        role: 'Assistant General Manager',
        company: 'Beximco Pharmaceuticals Ltd.',
        location: 'Dhaka',
        isCurrent: true,
        description: 'Overseeing export logistics to 50+ countries including US FDA and UK MHRA compliance.'
      }
    ],
    certifications: ['Certified Supply Chain Professional (CSCP - APICS)', 'Six Sigma Black Belt (ASQ)'],
    interestedFields: ['Pharma Logistics', 'Smart Warehousing', 'Circular Economy'],
    mentoringAvailable: true,
    openToReferrals: true,
    openToHiring: true,
    mentorshipTopics: ['Career Guidance', 'Interview Prep', 'CV Review'],
    availableSlots: ['Friday 8:00 PM', 'Sunday 8:30 PM'],
    totalMentees: 22,
    studentsConsulted: 62,
    rating: 4.91,
    reviewCount: 26,
    linkedin: 'https://linkedin.com/in/sabbir-ahmed-ipe',
    privacy: {
      cgpa: 'students_only',
      email: 'students_only',
      phone: 'hidden',
      location: 'public'
    },
    stats: {
      profileViewsThisMonth: 120,
      searchAppearances: 340,
      bookmarksCount: 51,
      endorsementsReceived: 23,
      monthlyViewHistory: [
        { month: 'Oct', views: 70 },
        { month: 'Nov', views: 88 },
        { month: 'Dec', views: 105 },
        { month: 'Jan', views: 115 },
        { month: 'Feb', views: 120 }
      ]
    },
    lastUpdated: '2025-02-05'
  },
  {
    id: 'alm-8',
    name: 'Tanzina Sultana',
    nameBn: 'তানজিনা সুলতানা',
    email: 'tanzina.bba@bracbank.com',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
    department: 'BBA',
    batch: '3rd Batch',
    batchNumber: 3,
    admissionYear: 2016,
    passingYear: 2020,
    studentIdMasked: '160601***',
    headline: 'Senior Manager, Digital Banking & Fintech Partnerships at BRAC Bank PLC',
    bio: 'Product manager bridging banking, SME credit scoring, and digital payments in Bangladesh. Helps students crack management trainee (MTO) exams and business case competitions.',
    isVerified: true,
    verificationBadgeLevel: 'Official BAUST',
    designation: 'Senior Manager (Digital Banking)',
    company: 'BRAC Bank PLC',
    sector: 'Private',
    location: 'Dhaka, Bangladesh',
    country: 'Bangladesh',
    city: 'Dhaka',
    cgpa: 3.86,
    thesisTitle: 'Fintech Adoption Trends and Financial Inclusion in Rural North Bengal',
    thesisSupervisor: 'Prof. Dr. M. Mahbubur Rahman',
    honors: ['BAUST Business Case Competition Champion 2019', 'Dean’s Honor Roll'],
    clubs: ['BAUST Business & Entrepreneurship Club (President)'],
    scholarships: ['BAUST Academic Scholarship'],
    education: [
      {
        id: 'edu-9',
        degree: 'Bachelor of Business Administration (Finance & Marketing)',
        institution: 'Bangladesh Army University of Science and Technology (BAUST)',
        department: 'BBA',
        period: '2016 - 2020',
        cgpa: 3.86
      }
    ],
    publications: [],
    skillsWithLevels: [
      { id: 'sk-28', name: 'Fintech Product Management', level: 'Expert', endorsements: [] },
      { id: 'sk-29', name: 'Bank MTO Preparation', level: 'Expert', endorsements: [] },
      { id: 'sk-30', name: 'Financial Modeling', level: 'Advanced', endorsements: [] }
    ],
    skills: ['Fintech', 'Digital Banking', 'Bank MTO Exam', 'Product Strategy', 'Financial Analysis'],
    topExpertise: ['Bank MTO Strategy', 'Fintech Product Roadmapping', 'Assessment Center Cases'],
    experienceTimeline: [
      {
        id: 'exp-10',
        period: '2022 - Present',
        role: 'Senior Manager (Digital Banking)',
        company: 'BRAC Bank PLC',
        location: 'Dhaka',
        isCurrent: true,
        description: 'Managing Astha App digital lending portfolio with over BDT 500 Crore disbursed.'
      }
    ],
    certifications: ['Certified Digital Finance Practitioner (CDFP)'],
    interestedFields: ['Open Banking', 'Microfinance Tech', 'Digital Wallets'],
    mentoringAvailable: true,
    openToReferrals: true,
    openToHiring: true,
    mentorshipTopics: ['Career Guidance', 'Interview Prep', 'CV Review'],
    availableSlots: ['Friday 6:00 PM', 'Saturday 7:00 PM'],
    totalMentees: 27,
    studentsConsulted: 81,
    rating: 4.93,
    reviewCount: 34,
    linkedin: 'https://linkedin.com/in/tanzina-sultana-bba',
    privacy: {
      cgpa: 'public',
      email: 'students_only',
      phone: 'hidden',
      location: 'public'
    },
    stats: {
      profileViewsThisMonth: 160,
      searchAppearances: 410,
      bookmarksCount: 74,
      endorsementsReceived: 31,
      monthlyViewHistory: [
        { month: 'Oct', views: 80 },
        { month: 'Nov', views: 110 },
        { month: 'Dec', views: 135 },
        { month: 'Jan', views: 150 },
        { month: 'Feb', views: 160 }
      ]
    },
    lastUpdated: '2025-02-11'
  },
  {
    id: 'alm-9',
    name: 'Zahidul Islam Rony',
    nameBn: 'জাহিদুল ইসলাম রনি',
    email: 'rony.textile@squaregroup.com',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&auto=format&fit=crop&q=80',
    department: 'Textile',
    batch: '2nd Batch',
    batchNumber: 2,
    admissionYear: 2016,
    passingYear: 2020,
    studentIdMasked: '160701***',
    headline: 'Deputy Manager (R&D, Sustainable Fabric Processing) at Square Textiles Division',
    bio: 'Textile engineer leading eco-friendly enzymatic dyeing, zero-liquid-discharge (ZLD) effluent innovations for European luxury fashion exporters.',
    isVerified: true,
    verificationBadgeLevel: 'Official BAUST',
    designation: 'Deputy Manager (R&D)',
    company: 'Square Textiles Ltd.',
    sector: 'Private',
    location: 'Habiganj, Bangladesh',
    country: 'Bangladesh',
    city: 'Habiganj',
    cgpa: 3.58,
    thesisTitle: 'Eco-Friendly Bio-Finishing of Cotton Fabrics Using Fungal Cellulase Enzymes',
    thesisSupervisor: 'Engr. Md. Jahangir Alam',
    honors: ['Best Innovative Project, Textile Olympiad 2019'],
    clubs: ['BAUST Textile Club (Co-founder)'],
    scholarships: [],
    education: [
      {
        id: 'edu-10',
        degree: 'B.Sc. in Textile Engineering',
        institution: 'Bangladesh Army University of Science and Technology (BAUST)',
        department: 'Textile',
        period: '2016 - 2020',
        cgpa: 3.58
      }
    ],
    publications: [],
    skillsWithLevels: [
      { id: 'sk-31', name: 'Sustainable Wet Processing', level: 'Expert', endorsements: [] },
      { id: 'sk-32', name: 'Fabric Dyeing Chemistry', level: 'Expert', endorsements: [] },
      { id: 'sk-33', name: 'Apparel Merchandising', level: 'Advanced', endorsements: [] }
    ],
    skills: ['Wet Processing', 'Textile Chemistry', 'Apparel R&D', 'Zero Discharge', 'OEKO-TEX Standards'],
    topExpertise: ['RMG Export Standards', 'Eco-friendly Dyeing', 'Textile R&D Labs'],
    experienceTimeline: [
      {
        id: 'exp-11',
        period: '2021 - Present',
        role: 'Deputy Manager (R&D)',
        company: 'Square Textiles Ltd.',
        location: 'Habiganj',
        isCurrent: true,
        description: 'Reduced water consumption in dyeing processes by 35% through enzymatic pretreatments.'
      }
    ],
    certifications: ['OEKO-TEX Standard 100 Internal Auditor'],
    interestedFields: ['Smart Textiles', 'Circular Garments', 'Nanotech Fibers'],
    mentoringAvailable: true,
    openToReferrals: true,
    openToHiring: true,
    mentorshipTopics: ['Career Guidance', 'CV Review'],
    availableSlots: ['Saturday 5:00 PM', 'Sunday 6:00 PM'],
    totalMentees: 15,
    studentsConsulted: 48,
    rating: 4.85,
    reviewCount: 18,
    linkedin: 'https://linkedin.com/in/zahidul-islam-textile',
    privacy: {
      cgpa: 'hidden',
      email: 'students_only',
      phone: 'hidden',
      location: 'public'
    },
    stats: {
      profileViewsThisMonth: 78,
      searchAppearances: 210,
      bookmarksCount: 29,
      endorsementsReceived: 14,
      monthlyViewHistory: [
        { month: 'Oct', views: 40 },
        { month: 'Nov', views: 55 },
        { month: 'Dec', views: 68 },
        { month: 'Jan', views: 72 },
        { month: 'Feb', views: 78 }
      ]
    },
    lastUpdated: '2025-01-20'
  },
  {
    id: 'alm-10',
    name: 'Mahfuzur Rahman',
    nameBn: 'মাহফুজুর রহমান',
    email: 'mahfuz@banglalink.net',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80',
    department: 'EEE',
    batch: '1st Batch',
    batchNumber: 1,
    admissionYear: 2015,
    passingYear: 2019,
    studentIdMasked: '150102***',
    headline: 'Senior Core Network & 5G Rollout Specialist at Banglalink Telecom',
    bio: 'Telecom engineer instrumental in 4G+ expansion and 5G testbed deployments across northern divisions of Bangladesh. Mentor for telecom, RF, and network careers.',
    isVerified: true,
    verificationBadgeLevel: 'Official BAUST',
    designation: 'Senior Core Network Specialist',
    company: 'Banglalink Digital Communications Ltd.',
    sector: 'Private',
    location: 'Dhaka, Bangladesh',
    country: 'Bangladesh',
    city: 'Dhaka',
    cgpa: 3.69,
    thesisTitle: 'Millimeter Wave Beamforming in Next-Generation 5G Cellular Networks',
    thesisSupervisor: 'Prof. Engr. Golam Morshed',
    honors: ['BAUST EEE Project Fair Winner 2018'],
    clubs: ['IEEE BAUST Student Branch (Founding Chair)'],
    scholarships: [],
    education: [
      {
        id: 'edu-11',
        degree: 'B.Sc. in Electrical and Electronic Engineering',
        institution: 'Bangladesh Army University of Science and Technology (BAUST)',
        department: 'EEE',
        period: '2015 - 2019',
        cgpa: 3.69
      }
    ],
    publications: [],
    skillsWithLevels: [
      { id: 'sk-34', name: '5G Core Architecture', level: 'Expert', endorsements: [] },
      { id: 'sk-35', name: 'Cisco Routing & Switching (CCNP)', level: 'Expert', endorsements: [] },
      { id: 'sk-36', name: 'Telecom Radio Planning', level: 'Advanced', endorsements: [] }
    ],
    skills: ['5G Network', 'CCNA/CCNP', 'Telecom RF', 'Microwave Link', 'Core EPC'],
    topExpertise: ['5G Deployments', 'Telecom MNC Job Prep', 'Cisco Certification Roadmap'],
    experienceTimeline: [
      {
        id: 'exp-12',
        period: '2020 - Present',
        role: 'Senior Core Network Specialist',
        company: 'Banglalink',
        location: 'Dhaka',
        isCurrent: true,
        description: 'Optimized voice over LTE (VoLTE) and cloud-native packet core infrastructure.'
      }
    ],
    certifications: ['CCNP Enterprise Core', 'Huawei Certified ICT Expert (HCIE)'],
    interestedFields: ['Open RAN', 'Satellite Internet', 'Network Virtualization'],
    mentoringAvailable: true,
    openToReferrals: true,
    openToHiring: true,
    mentorshipTopics: ['Career Guidance', 'Interview Prep', 'CV Review'],
    availableSlots: ['Friday 7:30 PM', 'Saturday 8:00 PM'],
    totalMentees: 20,
    studentsConsulted: 58,
    rating: 4.89,
    reviewCount: 24,
    linkedin: 'https://linkedin.com/in/mahfuz-telecom-eee',
    privacy: {
      cgpa: 'students_only',
      email: 'students_only',
      phone: 'hidden',
      location: 'public'
    },
    stats: {
      profileViewsThisMonth: 104,
      searchAppearances: 295,
      bookmarksCount: 42,
      endorsementsReceived: 21,
      monthlyViewHistory: [
        { month: 'Oct', views: 60 },
        { month: 'Nov', views: 78 },
        { month: 'Dec', views: 92 },
        { month: 'Jan', views: 99 },
        { month: 'Feb', views: 104 }
      ]
    },
    lastUpdated: '2025-02-02'
  },
  {
    id: 'alm-11',
    name: 'Syeda Nafisa Tabassum',
    nameBn: 'সৈয়দা নাফিসা তাবাসসুম',
    email: 'nafisa.tabassum@utoronto.ca',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1534751516642-a1714f5a5fe4?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&auto=format&fit=crop&q=80',
    department: 'English',
    batch: '1st Batch',
    batchNumber: 1,
    admissionYear: 2015,
    passingYear: 2019,
    studentIdMasked: '150801***',
    headline: 'Lecturer in Applied Linguistics & Researcher at University of Toronto, Canada',
    bio: 'BAUST English department valedictorian now pursuing second graduate research in cognitive sociolinguistics. Mentors students for North American graduate admissions, SOP polish, and IELTS 8.5+ prep.',
    isVerified: true,
    verificationBadgeLevel: 'Top Mentor',
    designation: 'Research Fellow & Teaching Assistant',
    company: 'University of Toronto',
    sector: 'Abroad',
    location: 'Toronto, Ontario, Canada',
    country: 'Canada',
    city: 'Toronto',
    cgpa: 3.92,
    thesisTitle: 'Code-Switching Pedagogies in Rural Bangladeshi Tertiary Classrooms',
    thesisSupervisor: 'Prof. Dr. Syed Manzoorul Islam',
    honors: ['Chancellor Gold Medal Nominee 2019', 'BAUST Departmental First Position'],
    clubs: ['BAUST English Language & Literary Club (Founding President)', 'Debating Society'],
    scholarships: ['Ontario Graduate Scholarship (OGS)', 'BAUST Full Waiver'],
    education: [
      {
        id: 'edu-12',
        degree: 'M.A. in Applied Linguistics',
        institution: 'University of Toronto',
        department: 'Linguistics & Education',
        period: '2021 - 2023',
        cgpa: 3.96
      },
      {
        id: 'edu-13',
        degree: 'B.A. (Hons) in English',
        institution: 'Bangladesh Army University of Science and Technology (BAUST)',
        department: 'English',
        period: '2015 - 2019',
        cgpa: 3.92
      }
    ],
    publications: [
      {
        id: 'pub-4',
        title: 'Bilingual Classroom Dynamics in South Asian STEM Universities',
        conferenceOrJournal: 'TESOL Quarterly Journal',
        year: 2022,
        doiOrUrl: 'https://doi.org/10.1002/tesq.3114',
        field: 'Applied Linguistics'
      }
    ],
    skillsWithLevels: [
      { id: 'sk-37', name: 'SOP & Personal Statement Review', level: 'Expert', endorsements: [] },
      { id: 'sk-38', name: 'IELTS Academic (Band 8.5)', level: 'Expert', endorsements: [] },
      { id: 'sk-39', name: 'Academic Publishing', level: 'Advanced', endorsements: [] }
    ],
    skills: ['SOP Writing', 'IELTS 8.5', 'Canada Study Visa', 'Academic Writing', 'Linguistics'],
    topExpertise: ['Canada Graduate Admissions', 'High Impact SOP Editing', 'IELTS Speaking & Writing'],
    experienceTimeline: [
      {
        id: 'exp-13',
        period: '2023 - Present',
        role: 'Research Fellow & TA',
        company: 'University of Toronto',
        location: 'Toronto, Canada',
        isCurrent: true,
        description: 'Instructing undergraduate academic writing seminars and supervising language lab research.'
      }
    ],
    certifications: ['CELTA Cambridge Certified'],
    interestedFields: ['Discourse Analysis', 'Educational Equity', 'Cross-Cultural Communication'],
    mentoringAvailable: true,
    openToReferrals: true,
    openToHiring: false,
    mentorshipTopics: ['Higher Studies', 'CV Review', 'Career Guidance'],
    availableSlots: ['Saturday 7:00 PM EST', 'Sunday 8:00 AM EST'],
    totalMentees: 34,
    studentsConsulted: 96,
    rating: 4.97,
    reviewCount: 41,
    linkedin: 'https://linkedin.com/in/nafisa-tabassum-utoronto',
    privacy: {
      cgpa: 'public',
      email: 'students_only',
      phone: 'hidden',
      location: 'public'
    },
    stats: {
      profileViewsThisMonth: 182,
      searchAppearances: 470,
      bookmarksCount: 88,
      endorsementsReceived: 35,
      monthlyViewHistory: [
        { month: 'Oct', views: 98 },
        { month: 'Nov', views: 130 },
        { month: 'Dec', views: 160 },
        { month: 'Jan', views: 174 },
        { month: 'Feb', views: 182 }
      ]
    },
    lastUpdated: '2025-02-13'
  },
  {
    id: 'alm-12',
    name: 'Imtiaz Ahmed Shuvo',
    nameBn: 'ইমতিয়াজ আহমেদ শুভ',
    email: 'imtiaz.shuvo@gmail.com',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80',
    department: 'CSE',
    batch: '4th Batch',
    batchNumber: 4,
    admissionYear: 2016,
    passingYear: 2020,
    studentIdMasked: '160203***',
    headline: 'Founder & CEO at CodeCraft Innovations | Top-Rated Plus Freelance Consultant on Upwork',
    bio: 'Built a 20-person software agency from Saidpur. Generated over $350K on global freelancing platforms serving US and European startup founders. Passionate about empowering rural tech entrepreneurs.',
    isVerified: true,
    verificationBadgeLevel: 'Top Mentor',
    designation: 'Founder & Managing Director',
    company: 'CodeCraft Innovations (Upwork Top-Rated Plus)',
    sector: 'Business',
    location: 'Saidpur / Dhaka, Bangladesh',
    country: 'Bangladesh',
    city: 'Saidpur',
    cgpa: 3.42,
    thesisTitle: 'Automated Client-Freelancer Matching Framework using Collaborative Filtering',
    thesisSupervisor: 'Prof. Dr. Md. Ashraful Islam',
    honors: ['BASIS National ICT Award 2022 Finalist', 'BAUST Startup Showcase Winner'],
    clubs: ['BAUST Entrepreneurship Cell', 'Programming Club'],
    scholarships: [],
    education: [
      {
        id: 'edu-14',
        degree: 'B.Sc. in Computer Science & Engineering',
        institution: 'Bangladesh Army University of Science and Technology (BAUST)',
        department: 'CSE',
        period: '2016 - 2020',
        cgpa: 3.42
      }
    ],
    publications: [],
    skillsWithLevels: [
      { id: 'sk-40', name: 'Upwork & Global Freelancing', level: 'Expert', endorsements: [] },
      { id: 'sk-41', name: 'Next.js & Supabase', level: 'Expert', endorsements: [] },
      { id: 'sk-42', name: 'Agency Operations & Pitching', level: 'Expert', endorsements: [] }
    ],
    skills: ['Freelancing', 'Upwork Strategy', 'Next.js', 'Startup Building', 'Tech Sales', 'Agency Ops'],
    topExpertise: ['Upwork Top Rated Plus Secrets', 'Agency Building from Scratch', 'US Client Negotiation'],
    experienceTimeline: [
      {
        id: 'exp-14',
        period: '2020 - Present',
        role: 'Founder & CEO',
        company: 'CodeCraft Innovations',
        location: 'Saidpur & Remote',
        isCurrent: true,
        description: 'Managing remote agency delivering mobile and web SaaS solutions for 60+ global founders.'
      }
    ],
    certifications: ['Upwork Certified Expert In Full Stack Web Development'],
    interestedFields: ['Micro SaaS', 'No-Code / Low-Code Ops', 'Venture Capital'],
    mentoringAvailable: true,
    openToReferrals: true,
    openToHiring: true,
    mentorshipTopics: ['Career Guidance', 'Interview Prep', 'CV Review'],
    availableSlots: ['Friday 9:00 PM', 'Tuesday 8:00 PM'],
    totalMentees: 38,
    studentsConsulted: 105,
    rating: 4.94,
    reviewCount: 44,
    linkedin: 'https://linkedin.com/in/imtiaz-ahmed-codecraft',
    github: 'https://github.com/imtiaz-shuvo',
    privacy: {
      cgpa: 'hidden',
      email: 'students_only',
      phone: 'connections_only',
      location: 'public'
    },
    stats: {
      profileViewsThisMonth: 195,
      searchAppearances: 505,
      bookmarksCount: 94,
      endorsementsReceived: 38,
      monthlyViewHistory: [
        { month: 'Oct', views: 110 },
        { month: 'Nov', views: 145 },
        { month: 'Dec', views: 170 },
        { month: 'Jan', views: 185 },
        { month: 'Feb', views: 195 }
      ]
    },
    lastUpdated: '2025-02-15'
  },
  {
    id: 'alm-13',
    name: 'Capt. Tariq Al Hasan',
    nameBn: 'ক্যাপ্টেন তারিক আল হাসান',
    email: 'tariq.hasan@army.mil.bd',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&auto=format&fit=crop&q=80',
    department: 'CSE',
    batch: '1st Batch',
    batchNumber: 1,
    admissionYear: 2015,
    passingYear: 2019,
    studentIdMasked: '150204***',
    headline: 'Captain, Corps of Signals | Bangladesh Army (Special Commission / Technical Officer)',
    bio: 'BAUST graduate serving as a commissioned technical officer in Bangladesh Army. Specializes in military communications, cyber-defense warfare, and satellite communications.',
    isVerified: true,
    verificationBadgeLevel: 'Official BAUST',
    designation: 'Captain (Signals)',
    company: 'Bangladesh Army (Armed Forces)',
    sector: 'Government',
    location: 'Dhaka Cantonment, Bangladesh',
    country: 'Bangladesh',
    city: 'Dhaka',
    cgpa: 3.84,
    thesisTitle: 'Cryptographic Hardening of Tactical Ad-hoc Military Mesh Networks',
    thesisSupervisor: 'Col. Engr. Md. Tariqul Islam',
    honors: ['Sword of Honour Contender', 'BAUST Best Cadet Alumnus'],
    clubs: ['BAUST Cadet Forum', 'Robotics Club'],
    scholarships: [],
    education: [
      {
        id: 'edu-15',
        degree: 'B.Sc. in Computer Science & Engineering',
        institution: 'Bangladesh Army University of Science and Technology (BAUST)',
        department: 'CSE',
        period: '2015 - 2019',
        cgpa: 3.84
      }
    ],
    publications: [],
    skillsWithLevels: [
      { id: 'sk-43', name: 'Tactical Cyber Security', level: 'Expert', endorsements: [] },
      { id: 'sk-44', name: 'Armed Forces Technical Commissioning', level: 'Expert', endorsements: [] },
      { id: 'sk-45', name: 'ISSB Guidelines', level: 'Expert', endorsements: [] }
    ],
    skills: ['Armed Forces ISSB', 'Tactical Comms', 'Cyber Defense', 'Leadership', 'Signals'],
    topExpertise: ['Bangladesh Army Technical Entry', 'ISSB Preparation', 'Signals Corps Tech'],
    experienceTimeline: [
      {
        id: 'exp-15',
        period: '2020 - Present',
        role: 'Commissioned Officer (Captain)',
        company: 'Bangladesh Army',
        location: 'Dhaka Cantonment',
        isCurrent: true,
        description: 'Managing secure data links, cryptographic key infrastructure, and field telemetry.'
      }
    ],
    certifications: ['Military Signal Intelligence Course', 'CEH Certified Ethical Hacker'],
    interestedFields: ['National Cyber Defense', 'Electronic Warfare', 'Tactical UAVs'],
    mentoringAvailable: true,
    openToReferrals: false,
    openToHiring: false,
    mentorshipTopics: ['Government / BCS', 'Career Guidance'],
    availableSlots: ['Friday 4:00 PM', 'Sunday 6:00 PM'],
    totalMentees: 25,
    studentsConsulted: 74,
    rating: 4.96,
    reviewCount: 30,
    privacy: {
      cgpa: 'public',
      email: 'students_only',
      phone: 'hidden',
      location: 'public'
    },
    stats: {
      profileViewsThisMonth: 165,
      searchAppearances: 430,
      bookmarksCount: 78,
      endorsementsReceived: 28,
      monthlyViewHistory: [
        { month: 'Oct', views: 85 },
        { month: 'Nov', views: 120 },
        { month: 'Dec', views: 140 },
        { month: 'Jan', views: 155 },
        { month: 'Feb', views: 165 }
      ]
    },
    lastUpdated: '2025-02-09'
  },
  {
    id: 'alm-14',
    name: 'Farzana Haque Mim',
    nameBn: 'ফারজানা হক মিম',
    email: 'farzana.mim@tigerit.com',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    department: 'CSE',
    batch: '5th Batch',
    batchNumber: 5,
    admissionYear: 2017,
    passingYear: 2021,
    studentIdMasked: '170201***',
    headline: 'Senior QA Automation Engineer at TigerIT Bangladesh | Lead Cypress & Selenium Instructor',
    bio: 'Quality engineering specialist specializing in Automated Testing, Load Testing, and CI/CD quality gates for national identity and biometric voting systems.',
    isVerified: true,
    verificationBadgeLevel: 'Official BAUST',
    designation: 'Senior QA Automation Engineer',
    company: 'TigerIT Bangladesh Ltd.',
    sector: 'Private',
    location: 'Dhaka, Bangladesh',
    country: 'Bangladesh',
    city: 'Dhaka',
    cgpa: 3.79,
    thesisTitle: 'Machine Learning Driven Predictive Bug Triaging in Automated Testing Pipelines',
    thesisSupervisor: 'Prof. Dr. Md. Ashraful Islam',
    honors: ['BAUST TechFest Hackathon 2nd Runner Up'],
    clubs: ['BAUST Programming Club', 'Women Techmakers BAUST'],
    scholarships: ['BAUST Merit Scholarship'],
    education: [
      {
        id: 'edu-16',
        degree: 'B.Sc. in Computer Science & Engineering',
        institution: 'Bangladesh Army University of Science and Technology (BAUST)',
        department: 'CSE',
        period: '2017 - 2021',
        cgpa: 3.79
      }
    ],
    publications: [],
    skillsWithLevels: [
      { id: 'sk-46', name: 'Cypress & Playwright', level: 'Expert', endorsements: [] },
      { id: 'sk-47', name: 'Selenium WebDriver (Java)', level: 'Expert', endorsements: [] },
      { id: 'sk-48', name: 'JMeter & Performance Testing', level: 'Advanced', endorsements: [] }
    ],
    skills: ['Cypress', 'Playwright', 'Selenium', 'Test Automation', 'JMeter', 'CI/CD Pipeline'],
    topExpertise: ['QA Automation Career Path', 'Cypress & Playwright Frameworks', 'ISTQB Certification Prep'],
    experienceTimeline: [
      {
        id: 'exp-16',
        period: '2021 - Present',
        role: 'Senior QA Automation Engineer',
        company: 'TigerIT Bangladesh',
        location: 'Dhaka',
        isCurrent: true,
        description: 'Engineered regression suites of 2000+ tests reducing manual release testing from 3 days to 40 minutes.'
      }
    ],
    certifications: ['ISTQB Certified Tester Foundation Level (CTFL)'],
    interestedFields: ['AI-Assisted Testing', 'Security Automation', 'Site Reliability'],
    mentoringAvailable: true,
    openToReferrals: true,
    openToHiring: true,
    mentorshipTopics: ['Career Guidance', 'Interview Prep', 'CV Review'],
    availableSlots: ['Friday 8:00 PM', 'Monday 8:30 PM'],
    totalMentees: 21,
    studentsConsulted: 63,
    rating: 4.92,
    reviewCount: 27,
    linkedin: 'https://linkedin.com/in/farzana-mim-qa',
    github: 'https://github.com/farzanamim',
    privacy: {
      cgpa: 'public',
      email: 'students_only',
      phone: 'hidden',
      location: 'public'
    },
    stats: {
      profileViewsThisMonth: 115,
      searchAppearances: 330,
      bookmarksCount: 49,
      endorsementsReceived: 24,
      monthlyViewHistory: [
        { month: 'Oct', views: 65 },
        { month: 'Nov', views: 82 },
        { month: 'Dec', views: 98 },
        { month: 'Jan', views: 108 },
        { month: 'Feb', views: 115 }
      ]
    },
    lastUpdated: '2025-01-28'
  },
  {
    id: 'alm-15',
    name: 'Ashikur Rahman Chowdhury',
    nameBn: 'আশিকুর রহমান চৌধুরী',
    email: 'ashik.chowdhury@grameenphone.com',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1520607164022-723659228414?w=1200&auto=format&fit=crop&q=80',
    department: 'EEE',
    batch: '3rd Batch',
    batchNumber: 3,
    admissionYear: 2016,
    passingYear: 2020,
    studentIdMasked: '160101***',
    headline: 'IoT & Telemetry Solutions Lead at Grameenphone Ltd (Telenor Group)',
    bio: 'Engineering enterprise IoT platforms, smart metering, and automated solar cell telemetry solutions across 14,000+ base stations nationwide.',
    isVerified: true,
    verificationBadgeLevel: 'Official BAUST',
    designation: 'IoT & Smart Solutions Lead',
    company: 'Grameenphone Ltd.',
    sector: 'Private',
    location: 'Dhaka, Bangladesh',
    country: 'Bangladesh',
    city: 'Dhaka',
    cgpa: 3.71,
    thesisTitle: 'Smart IoT-Enabled Solar Hybrid Microgrid Monitoring over LoRaWAN',
    thesisSupervisor: 'Prof. Engr. Golam Morshed',
    honors: ['Telenor Intra-Hackathon Innovation Winner 2023'],
    clubs: ['BAUST Robotics & Automation Club (Vice President)'],
    scholarships: [],
    education: [
      {
        id: 'edu-17',
        degree: 'B.Sc. in Electrical and Electronic Engineering',
        institution: 'Bangladesh Army University of Science and Technology (BAUST)',
        department: 'EEE',
        period: '2016 - 2020',
        cgpa: 3.71
      }
    ],
    publications: [],
    skillsWithLevels: [
      { id: 'sk-49', name: 'IoT Architecture & LoRaWAN', level: 'Expert', endorsements: [] },
      { id: 'sk-50', name: 'Embedded C / Arduino / ESP32', level: 'Expert', endorsements: [] },
      { id: 'sk-51', name: 'Cloud MQTT & Telemetry', level: 'Advanced', endorsements: [] }
    ],
    skills: ['IoT', 'Embedded Systems', 'LoRaWAN', 'Firmware', 'Telecom', 'ESP32'],
    topExpertise: ['IoT Commercial Products', 'Telecom Tech Trainee Hiring', 'Embedded Firmware'],
    experienceTimeline: [
      {
        id: 'exp-17',
        period: '2021 - Present',
        role: 'IoT Solutions Lead',
        company: 'Grameenphone',
        location: 'Dhaka',
        isCurrent: true,
        description: 'Developed automated green telecom energy monitors saving 4.2 GWh of diesel generator consumption annually.'
      }
    ],
    certifications: ['Certified IoT Architect (CITA)'],
    interestedFields: ['Smart Grids', 'Edge AI', 'Industrial IoT'],
    mentoringAvailable: true,
    openToReferrals: true,
    openToHiring: true,
    mentorshipTopics: ['Career Guidance', 'Interview Prep', 'CV Review'],
    availableSlots: ['Friday 9:00 PM', 'Sunday 8:00 PM'],
    totalMentees: 23,
    studentsConsulted: 67,
    rating: 4.88,
    reviewCount: 29,
    linkedin: 'https://linkedin.com/in/ashikur-chowdhury-eee',
    privacy: {
      cgpa: 'students_only',
      email: 'students_only',
      phone: 'hidden',
      location: 'public'
    },
    stats: {
      profileViewsThisMonth: 122,
      searchAppearances: 345,
      bookmarksCount: 52,
      endorsementsReceived: 22,
      monthlyViewHistory: [
        { month: 'Oct', views: 68 },
        { month: 'Nov', views: 88 },
        { month: 'Dec', views: 104 },
        { month: 'Jan', views: 115 },
        { month: 'Feb', views: 122 }
      ]
    },
    lastUpdated: '2025-02-04'
  },
  {
    id: 'alm-16',
    name: 'Rashidul Hasan Shanto',
    nameBn: 'রাশিদুল হাসান শান্ত',
    email: 'rashidul.shanto@kaust.edu.sa',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
    department: 'ME',
    batch: '2nd Batch',
    batchNumber: 2,
    admissionYear: 2016,
    passingYear: 2020,
    studentIdMasked: '160301***',
    headline: 'Ph.D. Candidate in Advanced Combustion & Clean Fuels at KAUST, Saudi Arabia',
    bio: 'Fellow at King Abdullah University of Science and Technology (KAUST). Published in Combustion and Flame (Elsevier). Guides BAUST mechanical students in winning 100% funded Gulf and European fellowships.',
    isVerified: true,
    verificationBadgeLevel: 'Top Mentor',
    designation: 'Doctoral Fellow',
    company: 'King Abdullah University of Science and Technology (KAUST)',
    sector: 'Abroad',
    location: 'Thuwal, Makkah, Saudi Arabia',
    country: 'Saudi Arabia',
    city: 'Thuwal',
    cgpa: 3.93,
    thesisTitle: 'Experimental and Kinetic Modeling of Biodiesel Fuel Combustion and Soot Reduction',
    thesisSupervisor: 'Brig. Gen. (Retd.) Prof. Engr. M. Zahid Hossain',
    honors: ['KAUST Global Fellowship ($75,000/year package)', "BAUST Dean's List"],
    clubs: ['BAUST Mechanical Society (Vice President)'],
    scholarships: ['KAUST Fellowship', 'BAUST Merit Award'],
    education: [
      {
        id: 'edu-18',
        degree: 'M.S. in Mechanical Engineering',
        institution: 'KAUST',
        department: 'Clean Combustion Research Center',
        period: '2021 - 2023',
        cgpa: 3.98
      },
      {
        id: 'edu-19',
        degree: 'B.Sc. in Mechanical Engineering',
        institution: 'Bangladesh Army University of Science and Technology (BAUST)',
        department: 'ME',
        period: '2016 - 2020',
        cgpa: 3.93
      }
    ],
    publications: [
      {
        id: 'pub-5',
        title: 'Laser Diagnostics of Optical Soot Volume Fractions in Oxygenated Synthetic Biofuels',
        conferenceOrJournal: 'Combustion and Flame (Elsevier)',
        year: 2023,
        doiOrUrl: 'https://doi.org/10.1016/j.combustflame.2023.112990',
        field: 'Clean Energy'
      }
    ],
    skillsWithLevels: [
      { id: 'sk-52', name: 'Combustion Kinetics & CHEMKIN', level: 'Expert', endorsements: [] },
      { id: 'sk-53', name: 'Laser Diagnostic Spectroscopy', level: 'Expert', endorsements: [] },
      { id: 'sk-54', name: 'KAUST / US Scholarship SOP', level: 'Expert', endorsements: [] }
    ],
    skills: ['KAUST Fellowship', 'Combustion Kinetics', 'Laser Diagnostics', 'Scholarship SOP', 'Thermodynamics'],
    topExpertise: ['KAUST Full Fellowships ($75k)', 'High-Impact Q1 Journals', 'GRE Quantitative 168+ Prep'],
    experienceTimeline: [
      {
        id: 'exp-18',
        period: '2021 - Present',
        role: 'Doctoral Researcher',
        company: 'KAUST',
        location: 'Thuwal, Saudi Arabia',
        isCurrent: true,
        description: 'Directing supersonic shock tube chemical kinetics investigations for aviation e-fuels.'
      }
    ],
    certifications: ['Laser Safety Officer Certification'],
    interestedFields: ['Zero-Carbon Aviation', 'E-Fuels', 'Laser Spectroscopy'],
    mentoringAvailable: true,
    openToReferrals: true,
    openToHiring: false,
    mentorshipTopics: ['Higher Studies', 'Research & Publication', 'CV Review'],
    availableSlots: ['Friday 5:00 PM AST', 'Sunday 7:00 PM AST'],
    totalMentees: 26,
    studentsConsulted: 84,
    rating: 4.95,
    reviewCount: 35,
    linkedin: 'https://linkedin.com/in/rashidul-hasan-kaust',
    googleScholar: 'https://scholar.google.com/citations?user=rashidul-shanto',
    privacy: {
      cgpa: 'public',
      email: 'students_only',
      phone: 'hidden',
      location: 'public'
    },
    stats: {
      profileViewsThisMonth: 168,
      searchAppearances: 440,
      bookmarksCount: 82,
      endorsementsReceived: 33,
      monthlyViewHistory: [
        { month: 'Oct', views: 88 },
        { month: 'Nov', views: 125 },
        { month: 'Dec', views: 148 },
        { month: 'Jan', views: 159 },
        { month: 'Feb', views: 168 }
      ]
    },
    lastUpdated: '2025-02-12'
  },
  {
    id: 'alm-17',
    name: 'Sayem Al Mamun',
    nameBn: 'সায়েম আল মামুন',
    email: 'sayem.mamun@customs.gov.bd',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&auto=format&fit=crop&q=80',
    department: 'CSE',
    batch: '3rd Batch',
    batchNumber: 3,
    admissionYear: 2016,
    passingYear: 2020,
    studentIdMasked: '160205***',
    headline: 'Assistant Commissioner of Customs & Excise (40th BCS Customs Cadre) | NBR',
    bio: 'Ranked in the 40th BCS (Customs & Excise Cadre). Managing international port tariff assessment, ASYCUDA World automated customs, and anti-smuggling enforcement.',
    isVerified: true,
    verificationBadgeLevel: 'Official BAUST',
    designation: 'Assistant Commissioner',
    company: 'National Board of Revenue (40th BCS Customs & Excise)',
    sector: 'Government',
    location: 'Chattogram Custom House, Bangladesh',
    country: 'Bangladesh',
    city: 'Chattogram',
    cgpa: 3.68,
    thesisTitle: 'Deep Neural Approaches to Non-Intrusive Cargo Container X-Ray Anomaly Detection',
    thesisSupervisor: 'Prof. Dr. Md. Ashraful Islam',
    honors: ['40th BCS Merit Rank Holder', 'BAUST Inter-Batch Football Captain'],
    clubs: ['BAUST Sports Club (General Secretary)'],
    scholarships: [],
    education: [
      {
        id: 'edu-20',
        degree: 'B.Sc. in Computer Science & Engineering',
        institution: 'Bangladesh Army University of Science and Technology (BAUST)',
        department: 'CSE',
        period: '2016 - 2020',
        cgpa: 3.68
      }
    ],
    publications: [],
    skillsWithLevels: [
      { id: 'sk-55', name: 'BCS Preliminary & Written Drill', level: 'Expert', endorsements: [] },
      { id: 'sk-56', name: 'Customs & Tax Law', level: 'Expert', endorsements: [] },
      { id: 'sk-57', name: 'ASYCUDA World Systems', level: 'Advanced', endorsements: [] }
    ],
    skills: ['40th BCS', 'Customs Cadre', 'Govt Job Preparation', 'ASYCUDA World', 'Tax Laws'],
    topExpertise: ['40th BCS Customs Strategy', 'Math & Mental Ability for BCS', 'Customs Career Trajectory'],
    experienceTimeline: [
      {
        id: 'exp-19',
        period: '2023 - Present',
        role: 'Assistant Commissioner',
        company: 'National Board of Revenue (NBR)',
        location: 'Chattogram Port',
        isCurrent: true,
        description: 'Supervising trade facilitation, export valuation, and customs audit at the largest sea port.'
      }
    ],
    certifications: ['Customs Academy Foundation Course (Top 5%)'],
    interestedFields: ['Smart Customs', 'Trade Compliance', 'Cyber Forensics'],
    mentoringAvailable: true,
    openToReferrals: false,
    openToHiring: false,
    mentorshipTopics: ['Government / BCS', 'Career Guidance'],
    availableSlots: ['Friday 3:00 PM', 'Saturday 4:00 PM'],
    totalMentees: 33,
    studentsConsulted: 95,
    rating: 4.97,
    reviewCount: 40,
    privacy: {
      cgpa: 'public',
      email: 'students_only',
      phone: 'hidden',
      location: 'public'
    },
    stats: {
      profileViewsThisMonth: 198,
      searchAppearances: 485,
      bookmarksCount: 91,
      endorsementsReceived: 37,
      monthlyViewHistory: [
        { month: 'Oct', views: 115 },
        { month: 'Nov', views: 155 },
        { month: 'Dec', views: 178 },
        { month: 'Jan', views: 190 },
        { month: 'Feb', views: 198 }
      ]
    },
    lastUpdated: '2025-02-14'
  },
  {
    id: 'alm-18',
    name: 'Monirul Islam Shakil',
    nameBn: 'মনিরুল ইসলাম শাকিল',
    email: 'monirul.shakil@enosisbd.com',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
    department: 'CSE',
    batch: '6th Batch',
    batchNumber: 6,
    admissionYear: 2017,
    passingYear: 2021,
    studentIdMasked: '170202***',
    headline: 'Senior Backend Engineer at Enosis Solutions | High Performance Java & AWS',
    bio: 'Specialist in low-latency Java 21, Spring Boot microservices, and distributed streaming using Apache Flink and Kafka for US healthcare clients.',
    isVerified: true,
    verificationBadgeLevel: 'Official BAUST',
    designation: 'Senior Software Engineer',
    company: 'Enosis Solutions',
    sector: 'Private',
    location: 'Dhaka, Bangladesh',
    country: 'Bangladesh',
    city: 'Dhaka',
    cgpa: 3.75,
    thesisTitle: 'Stream Processing Optimization in Cloud Environments using Adaptive Windowing',
    thesisSupervisor: 'Prof. Dr. Md. Ashraful Islam',
    honors: ['BAUST Intra-University Code Contest 2nd Place'],
    clubs: ['BAUST Programming Club (Competitive Programming Lead)'],
    scholarships: [],
    education: [
      {
        id: 'edu-21',
        degree: 'B.Sc. in Computer Science & Engineering',
        institution: 'Bangladesh Army University of Science and Technology (BAUST)',
        department: 'CSE',
        period: '2017 - 2021',
        cgpa: 3.75
      }
    ],
    publications: [],
    skillsWithLevels: [
      { id: 'sk-58', name: 'Java 21 & Spring Boot 3', level: 'Expert', endorsements: [] },
      { id: 'sk-59', name: 'Apache Kafka & Flink', level: 'Expert', endorsements: [] },
      { id: 'sk-60', name: 'AWS DynamoDB & ECS', level: 'Advanced', endorsements: [] }
    ],
    skills: ['Java', 'Spring Boot', 'Kafka', 'PostgreSQL', 'Microservices', 'AWS'],
    topExpertise: ['Enosis Written & Tech Coding Rounds', 'Java Concurrency', 'Spring Boot Best Practices'],
    experienceTimeline: [
      {
        id: 'exp-20',
        period: '2021 - Present',
        role: 'Senior Software Engineer',
        company: 'Enosis Solutions',
        location: 'Dhaka',
        isCurrent: true,
        description: 'Built distributed telemetry and real-time medical patient data synchronization.'
      }
    ],
    certifications: ['Oracle Certified Professional: Java SE 17 Developer'],
    interestedFields: ['Distributed Database Internals', 'Reactive Architecture'],
    mentoringAvailable: true,
    openToReferrals: true,
    openToHiring: true,
    mentorshipTopics: ['Interview Prep', 'Career Guidance', 'CV Review'],
    availableSlots: ['Friday 8:30 PM', 'Saturday 9:00 PM'],
    totalMentees: 22,
    studentsConsulted: 71,
    rating: 4.9,
    reviewCount: 28,
    linkedin: 'https://linkedin.com/in/monirul-shakil-java',
    github: 'https://github.com/monirul-shakil',
    privacy: {
      cgpa: 'students_only',
      email: 'students_only',
      phone: 'hidden',
      location: 'public'
    },
    stats: {
      profileViewsThisMonth: 135,
      searchAppearances: 360,
      bookmarksCount: 56,
      endorsementsReceived: 26,
      monthlyViewHistory: [
        { month: 'Oct', views: 75 },
        { month: 'Nov', views: 95 },
        { month: 'Dec', views: 118 },
        { month: 'Jan', views: 128 },
        { month: 'Feb', views: 135 }
      ]
    },
    lastUpdated: '2025-02-08'
  },
  {
    id: 'alm-19',
    name: 'Rifat Bin Alam',
    nameBn: 'রিফাত বিন আলম',
    email: 'rifat.alam@anu.edu.au',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&auto=format&fit=crop&q=80',
    department: 'CE',
    batch: '2nd Batch',
    batchNumber: 2,
    admissionYear: 2016,
    passingYear: 2020,
    studentIdMasked: '160401***',
    headline: 'Ph.D. Scholar in Geotechnical Risk & Disaster Resilience at Australian National University (ANU)',
    bio: 'Researching landslide mechanics, riverbank erosion dynamics in deltaic floodplains, and satellite InSAR telemetry in Canberra. Mentors students targeting Australian AGRTP full scholarships.',
    isVerified: true,
    verificationBadgeLevel: 'Top Mentor',
    designation: 'Doctoral Scholar',
    company: 'Australian National University (ANU)',
    sector: 'Abroad',
    location: 'Canberra, ACT, Australia',
    country: 'Australia',
    city: 'Canberra',
    cgpa: 3.89,
    thesisTitle: 'Geotechnical Characterization and Slope Failure Modeling along Teesta Riverbanks',
    thesisSupervisor: 'Col. Engr. Md. Tariqul Islam',
    honors: ['Australian Government Research Training Program (AGRTP) Recipient ($35,000 AUD/year)', 'BAUST Civil Department Gold Medalist'],
    clubs: ['BAUST Civil Engineering Association', 'Environment Society'],
    scholarships: ['AGRTP Scholarship', 'BAUST Full Waiver'],
    education: [
      {
        id: 'edu-22',
        degree: 'Ph.D. in Geotechnical Engineering',
        institution: 'Australian National University (ANU)',
        department: 'School of Engineering',
        period: '2022 - Present'
      },
      {
        id: 'edu-23',
        degree: 'B.Sc. in Civil Engineering',
        institution: 'Bangladesh Army University of Science and Technology (BAUST)',
        department: 'CE',
        period: '2016 - 2020',
        cgpa: 3.89
      }
    ],
    publications: [
      {
        id: 'pub-6',
        title: 'Coupled Hydro-Mechanical Numerical Modeling of Riverbank Collapse in Brahmaputra Floodplains',
        conferenceOrJournal: 'Canadian Geotechnical Journal',
        year: 2023,
        doiOrUrl: 'https://doi.org/10.1139/cgj-2023-0182',
        field: 'Geotechnical Risk'
      }
    ],
    skillsWithLevels: [
      { id: 'sk-61', name: 'PLAXIS 2D/3D & GeoStudio', level: 'Expert', endorsements: [] },
      { id: 'sk-62', name: 'Australian AGRTP Scholarship Strategy', level: 'Expert', endorsements: [] },
      { id: 'sk-63', name: 'InSAR Satellite Telemetry', level: 'Advanced', endorsements: [] }
    ],
    skills: ['Geotechnical', 'PLAXIS', 'Australia Scholarship', 'Soil Mechanics', 'Remote Sensing'],
    topExpertise: ['Australian AGRTP Scholarships', 'Civil Engineering Higher Studies', 'Cold Emailing Aussie Professors'],
    experienceTimeline: [
      {
        id: 'exp-21',
        period: '2022 - Present',
        role: 'Doctoral Researcher',
        company: 'Australian National University',
        location: 'Canberra, Australia',
        isCurrent: true,
        description: 'Modeling seismic soil-structure interaction using finite element analysis.'
      }
    ],
    certifications: ['IEAust Graduate Member'],
    interestedFields: ['Coastal Protection', 'Climate Adaptation', 'Deep Foundation Design'],
    mentoringAvailable: true,
    openToReferrals: true,
    openToHiring: false,
    mentorshipTopics: ['Higher Studies', 'Research & Publication', 'CV Review'],
    availableSlots: ['Saturday 2:00 PM AEST', 'Sunday 4:00 PM AEST'],
    totalMentees: 27,
    studentsConsulted: 83,
    rating: 4.96,
    reviewCount: 37,
    linkedin: 'https://linkedin.com/in/rifat-alam-anu',
    privacy: {
      cgpa: 'public',
      email: 'students_only',
      phone: 'hidden',
      location: 'public'
    },
    stats: {
      profileViewsThisMonth: 155,
      searchAppearances: 390,
      bookmarksCount: 76,
      endorsementsReceived: 31,
      monthlyViewHistory: [
        { month: 'Oct', views: 82 },
        { month: 'Nov', views: 110 },
        { month: 'Dec', views: 135 },
        { month: 'Jan', views: 148 },
        { month: 'Feb', views: 155 }
      ]
    },
    lastUpdated: '2025-02-07'
  },
  {
    id: 'alm-20',
    name: 'Shamima Akter Rupa',
    nameBn: 'শামীমা আক্তার রুপা',
    email: 'rupa.ipe@squaregroup.com',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=1200&auto=format&fit=crop&q=80',
    department: 'IPE',
    batch: '3rd Batch',
    batchNumber: 3,
    admissionYear: 2016,
    passingYear: 2020,
    studentIdMasked: '160501***',
    headline: 'Senior Industrial Engineer (Total Productive Maintenance) at Square Toiletries Ltd.',
    bio: 'Spearheading Overall Equipment Effectiveness (OEE) metrics, SMED rapid tool changeovers, and workplace ergonomic ergonomics across 12 high-speed packaging lines.',
    isVerified: true,
    verificationBadgeLevel: 'Official BAUST',
    designation: 'Senior Industrial Engineer',
    company: 'Square Toiletries Ltd.',
    sector: 'Private',
    location: 'Pabna, Bangladesh',
    country: 'Bangladesh',
    city: 'Pabna',
    cgpa: 3.63,
    thesisTitle: 'Implementation of Single-Minute Exchange of Die (SMED) in High-Speed FMCG Packaging',
    thesisSupervisor: 'Dr. Md. Rafiqul Islam',
    honors: ['Dean’s Commendation for Industrial Safety Innovation'],
    clubs: ['BAUST IPE Society', 'Cultural Club'],
    scholarships: [],
    education: [
      {
        id: 'edu-24',
        degree: 'B.Sc. in Industrial and Production Engineering',
        institution: 'Bangladesh Army University of Science and Technology (BAUST)',
        department: 'IPE',
        period: '2016 - 2020',
        cgpa: 3.63
      }
    ],
    publications: [],
    skillsWithLevels: [
      { id: 'sk-64', name: 'OEE & TPM Implementation', level: 'Expert', endorsements: [] },
      { id: 'sk-65', name: 'Time & Motion Study (MOST)', level: 'Expert', endorsements: [] },
      { id: 'sk-66', name: 'Industrial Ergonomics', level: 'Advanced', endorsements: [] }
    ],
    skills: ['Industrial Engineering', 'TPM', 'OEE', 'FMCG Manufacturing', 'Lean Tools'],
    topExpertise: ['FMCG Plant IE Roles', 'OEE Optimization', 'Square / Unilever IE Interview Rounds'],
    experienceTimeline: [
      {
        id: 'exp-22',
        period: '2021 - Present',
        role: 'Senior Industrial Engineer',
        company: 'Square Toiletries Ltd.',
        location: 'Pabna',
        isCurrent: true,
        description: 'Increased bottle packaging line efficiency from 64% to 83% saving BDT 1.8 Crore/year.'
      }
    ],
    certifications: ['Lean Manufacturing Practitioner (Kaizen Institute)'],
    interestedFields: ['Automation in Packaging', 'Factory 4.0', 'Industrial Safety'],
    mentoringAvailable: true,
    openToReferrals: true,
    openToHiring: true,
    mentorshipTopics: ['Career Guidance', 'Interview Prep', 'CV Review'],
    availableSlots: ['Friday 6:00 PM', 'Sunday 7:00 PM'],
    totalMentees: 19,
    studentsConsulted: 59,
    rating: 4.88,
    reviewCount: 23,
    linkedin: 'https://linkedin.com/in/shamima-rupa-ipe',
    privacy: {
      cgpa: 'hidden',
      email: 'students_only',
      phone: 'hidden',
      location: 'public'
    },
    stats: {
      profileViewsThisMonth: 92,
      searchAppearances: 260,
      bookmarksCount: 36,
      endorsementsReceived: 18,
      monthlyViewHistory: [
        { month: 'Oct', views: 50 },
        { month: 'Nov', views: 68 },
        { month: 'Dec', views: 79 },
        { month: 'Jan', views: 88 },
        { month: 'Feb', views: 92 }
      ]
    },
    lastUpdated: '2025-01-25'
  },
  {
    id: 'alm-21',
    name: 'Tanvir Mahtab Shovon',
    nameBn: 'তানভীর মাহতাব শোভন',
    email: 'tanvir.shovon@dhl.com',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&auto=format&fit=crop&q=80',
    department: 'BBA',
    batch: '4th Batch',
    batchNumber: 4,
    admissionYear: 2017,
    passingYear: 2021,
    studentIdMasked: '170601***',
    headline: 'Regional Operations Manager at DHL Express Bangladesh | Cross-Border Supply Chain',
    bio: 'Overseeing air cargo customs clearance, customs brokerage, and hub distribution across North Bengal and Dhaka airport gateways. Mentoring students for multinational supply chain and operations careers.',
    isVerified: true,
    verificationBadgeLevel: 'Official BAUST',
    designation: 'Regional Operations Manager',
    company: 'DHL Express Bangladesh',
    sector: 'Private',
    location: 'Dhaka, Bangladesh',
    country: 'Bangladesh',
    city: 'Dhaka',
    cgpa: 3.73,
    thesisTitle: 'Cross-Border E-Commerce Delivery Friction and Reverse Logistics in Emerging Markets',
    thesisSupervisor: 'Prof. Dr. M. Mahbubur Rahman',
    honors: ['DHL Excellence Award 2023'],
    clubs: ['BAUST Business & Entrepreneurship Club', 'Sports Club'],
    scholarships: [],
    education: [
      {
        id: 'edu-25',
        degree: 'Bachelor of Business Administration (Supply Chain Management)',
        institution: 'Bangladesh Army University of Science and Technology (BAUST)',
        department: 'BBA',
        period: '2017 - 2021',
        cgpa: 3.73
      }
    ],
    publications: [],
    skillsWithLevels: [
      { id: 'sk-67', name: 'Cross-Border Air Freight', level: 'Expert', endorsements: [] },
      { id: 'sk-68', name: 'Customs Clearance Logistics', level: 'Expert', endorsements: [] },
      { id: 'sk-69', name: 'Hub Turnaround Optimization', level: 'Advanced', endorsements: [] }
    ],
    skills: ['Logistics', 'Supply Chain', 'DHL Operations', 'Freight Forwarding', 'Trade Compliance'],
    topExpertise: ['Global Logistics MNCs', 'DHL / Maersk Trainee Recruitment', 'Operations Management'],
    experienceTimeline: [
      {
        id: 'exp-23',
        period: '2021 - Present',
        role: 'Regional Operations Manager',
        company: 'DHL Express',
        location: 'Dhaka Airport Hub',
        isCurrent: true,
        description: 'Managing 120-person ramp operations handling 80 tons of daily cross-border express shipments.'
      }
    ],
    certifications: ['IATA Dangerous Goods Regulations (DGR) Cat 6'],
    interestedFields: ['Aviation Logistics', 'Green Warehousing', 'Trade Policy'],
    mentoringAvailable: true,
    openToReferrals: true,
    openToHiring: true,
    mentorshipTopics: ['Career Guidance', 'Interview Prep', 'CV Review'],
    availableSlots: ['Saturday 6:00 PM', 'Sunday 7:30 PM'],
    totalMentees: 17,
    studentsConsulted: 52,
    rating: 4.87,
    reviewCount: 21,
    linkedin: 'https://linkedin.com/in/tanvir-shovon-dhl',
    privacy: {
      cgpa: 'students_only',
      email: 'students_only',
      phone: 'hidden',
      location: 'public'
    },
    stats: {
      profileViewsThisMonth: 108,
      searchAppearances: 310,
      bookmarksCount: 44,
      endorsementsReceived: 20,
      monthlyViewHistory: [
        { month: 'Oct', views: 60 },
        { month: 'Nov', views: 80 },
        { month: 'Dec', views: 95 },
        { month: 'Jan', views: 102 },
        { month: 'Feb', views: 108 }
      ]
    },
    lastUpdated: '2025-01-31'
  },
  {
    id: 'alm-22',
    name: 'Nayeemur Rahman',
    nameBn: 'নাঈমুর রহমান',
    email: 'nayeem.rahman@bcs-police.gov.bd',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&auto=format&fit=crop&q=80',
    department: 'CSE',
    batch: '2nd Batch',
    batchNumber: 2,
    admissionYear: 2015,
    passingYear: 2019,
    studentIdMasked: '150206***',
    headline: 'Assistant Superintendent of Police (ASP, 41st BCS Police Cadre) | Bangladesh Police',
    bio: 'BAUST CSE graduate who placed into the Bangladesh Police Cadre through the 41st BCS. Passionate about applying computational forensics, cybercrime intelligence, and modern policing.',
    isVerified: true,
    verificationBadgeLevel: 'Official BAUST',
    designation: 'Assistant Superintendent of Police (ASP)',
    company: 'Bangladesh Police (41st BCS Police Cadre)',
    sector: 'Government',
    location: 'Bangladesh Police Academy (Sarda) / Dhaka',
    country: 'Bangladesh',
    city: 'Rajshahi / Dhaka',
    cgpa: 3.74,
    thesisTitle: 'Deepfake Video Detection and Digital Forensic Authenticity Verification',
    thesisSupervisor: 'Prof. Dr. Md. Ashraful Islam',
    honors: ['41st BCS Police Cadre Meritorious Entrant', 'Inter-University Debater of the Year 2018'],
    clubs: ['BAUST Debating Society', 'Cadet Club'],
    scholarships: [],
    education: [
      {
        id: 'edu-26',
        degree: 'B.Sc. in Computer Science & Engineering',
        institution: 'Bangladesh Army University of Science and Technology (BAUST)',
        department: 'CSE',
        period: '2015 - 2019',
        cgpa: 3.74
      }
    ],
    publications: [],
    skillsWithLevels: [
      { id: 'sk-70', name: 'BCS Preliminary, Written & Physical', level: 'Expert', endorsements: [] },
      { id: 'sk-71', name: 'Digital Forensics & OSINT', level: 'Expert', endorsements: [] },
      { id: 'sk-72', name: 'Public Safety Law & Penal Code', level: 'Advanced', endorsements: [] }
    ],
    skills: ['41st BCS', 'Police Cadre', 'Digital Forensics', 'Cybercrime Investigation', 'Civil Service Prep'],
    topExpertise: ['41st BCS Police Cadre', 'Physical & Viva Stage Strategy', 'Cyber Crime Forensics'],
    experienceTimeline: [
      {
        id: 'exp-24',
        period: '2023 - Present',
        role: 'Assistant Superintendent of Police (Probationer)',
        company: 'Bangladesh Police',
        location: 'Police Academy, Sarda',
        isCurrent: true,
        description: 'Undergoing intensive basic training in law, tactical marksmanship, cyber investigations, and leadership.'
      }
    ],
    certifications: ['Police Basic Training Diploma', 'CHFI Computer Hacking Forensic Investigator'],
    interestedFields: ['Cyber Threat Intel', 'Biometrics in Law Enforcement', 'Community Policing'],
    mentoringAvailable: true,
    openToReferrals: false,
    openToHiring: false,
    mentorshipTopics: ['Government / BCS', 'Career Guidance'],
    availableSlots: ['Friday 3:30 PM', 'Saturday 4:00 PM'],
    totalMentees: 29,
    studentsConsulted: 88,
    rating: 4.96,
    reviewCount: 38,
    privacy: {
      cgpa: 'public',
      email: 'students_only',
      phone: 'hidden',
      location: 'public'
    },
    stats: {
      profileViewsThisMonth: 215,
      searchAppearances: 495,
      bookmarksCount: 89,
      endorsementsReceived: 36,
      monthlyViewHistory: [
        { month: 'Oct', views: 120 },
        { month: 'Nov', views: 160 },
        { month: 'Dec', views: 185 },
        { month: 'Jan', views: 202 },
        { month: 'Feb', views: 215 }
      ]
    },
    lastUpdated: '2025-02-14'
  },
  // Additional profiles alm-23 through alm-32 to reach 32+ diverse profiles across sectors and departments
  {
    id: 'alm-23',
    name: 'Dr. Shahbaz Alam',
    nameBn: 'ড. শাহবাজ আলম',
    email: 'shahbaz.alam@nus.edu.sg',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    department: 'EEE',
    batch: '1st Batch',
    batchNumber: 1,
    admissionYear: 2015,
    passingYear: 2019,
    studentIdMasked: '150103***',
    headline: 'Postdoctoral Research Scientist in Nanophotonics at National University of Singapore (NUS)',
    bio: 'Pioneering silicon photonics, on-chip optical communication, and quantum photonic integrated circuits. Completed Ph.D. from NTU Singapore. Guides BAUST researchers aiming for top Singaporean and Asian scholarships.',
    isVerified: true,
    verificationBadgeLevel: 'Top Mentor',
    designation: 'Postdoctoral Fellow',
    company: 'National University of Singapore (NUS)',
    sector: 'Abroad',
    location: 'Singapore',
    country: 'Singapore',
    city: 'Singapore',
    cgpa: 3.96,
    thesisTitle: 'Plasmonic Nanoresonators for Ultra-Sensitive Biochemical Refractive Index Sensing',
    thesisSupervisor: 'Prof. Engr. Golam Morshed',
    honors: ['Chancellor Gold Medal Nominee', 'SINGA Award Winner 2019 ($30,000 SGD/year)'],
    clubs: ['IEEE BAUST (Chair)', 'Robotics Club'],
    scholarships: ['Singapore International Graduate Award (SINGA)'],
    education: [
      {
        id: 'edu-27',
        degree: 'Ph.D. in Electrical & Electronic Engineering',
        institution: 'Nanyang Technological University (NTU)',
        department: 'Photonics Lab',
        period: '2019 - 2023',
        cgpa: 3.98
      },
      {
        id: 'edu-28',
        degree: 'B.Sc. in Electrical and Electronic Engineering',
        institution: 'Bangladesh Army University of Science and Technology (BAUST)',
        department: 'EEE',
        period: '2015 - 2019',
        cgpa: 3.96
      }
    ],
    publications: [
      {
        id: 'pub-7',
        title: 'Monolithic Silicon Optical Transceivers for Terabit Datacenter Interconnects',
        conferenceOrJournal: 'Nature Communications Photonics',
        year: 2023,
        doiOrUrl: 'https://doi.org/10.1038/s41467-023-38912-x',
        field: 'Silicon Photonics'
      }
    ],
    skillsWithLevels: [
      { id: 'sk-73', name: 'Silicon Photonics & Lumerical FDTD', level: 'Expert', endorsements: [] },
      { id: 'sk-74', name: 'SINGA / NTU Scholarship Guidance', level: 'Expert', endorsements: [] },
      { id: 'sk-75', name: 'Cleanroom Nanofabrication', level: 'Advanced', endorsements: [] }
    ],
    skills: ['Silicon Photonics', 'SINGA Scholarship', 'Nanotechnology', 'Optics', 'FDTD Simulation'],
    topExpertise: ['Singapore SINGA PhD Scholarships', 'Nature/Optica Publishing', 'Academic CV Building'],
    experienceTimeline: [
      {
        id: 'exp-25',
        period: '2023 - Present',
        role: 'Postdoctoral Research Scientist',
        company: 'NUS',
        location: 'Singapore',
        isCurrent: true,
        description: 'Leading quantum photonic transmitter fabrication for ultra-secure optical cryptography.'
      }
    ],
    certifications: ['Cleanroom Class 100 Safety & Lithography Lead'],
    interestedFields: ['Quantum Photonics', 'Optical Computing', 'Metamaterials'],
    mentoringAvailable: true,
    openToReferrals: true,
    openToHiring: false,
    mentorshipTopics: ['Higher Studies', 'Research & Publication', 'CV Review'],
    availableSlots: ['Saturday 5:00 PM SGT', 'Sunday 6:00 PM SGT'],
    totalMentees: 30,
    studentsConsulted: 92,
    rating: 4.98,
    reviewCount: 42,
    linkedin: 'https://linkedin.com/in/shahbaz-alam-nus',
    googleScholar: 'https://scholar.google.com/citations?user=shahbaz-alam',
    privacy: {
      cgpa: 'public',
      email: 'students_only',
      phone: 'hidden',
      location: 'public'
    },
    stats: {
      profileViewsThisMonth: 180,
      searchAppearances: 450,
      bookmarksCount: 86,
      endorsementsReceived: 34,
      monthlyViewHistory: [
        { month: 'Oct', views: 90 },
        { month: 'Nov', views: 125 },
        { month: 'Dec', views: 152 },
        { month: 'Jan', views: 170 },
        { month: 'Feb', views: 180 }
      ]
    },
    lastUpdated: '2025-02-14'
  },
  {
    id: 'alm-24',
    name: 'Fariha Tasnim',
    nameBn: 'ফারিহা তাসনিম',
    email: 'fariha.tasnim@waltonbd.com',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80',
    department: 'ME',
    batch: '4th Batch',
    batchNumber: 4,
    admissionYear: 2017,
    passingYear: 2021,
    studentIdMasked: '170301***',
    headline: 'Senior HVAC & Thermal Design Engineer at Walton Micro-Tech Corporation',
    bio: 'Designs inverter refrigeration cycles, eco-friendly hydrocarbon refrigerants (R290/R600a), and automated thermodynamic test chambers for home appliances.',
    isVerified: true,
    verificationBadgeLevel: 'Official BAUST',
    designation: 'Senior Thermal Design Engineer',
    company: 'Walton Micro-Tech Corporation',
    sector: 'Private',
    location: 'Chandra, Gazipur, Bangladesh',
    country: 'Bangladesh',
    city: 'Gazipur',
    cgpa: 3.77,
    thesisTitle: 'Energy Efficiency Optimization of Domestic Refrigeration using Hydrocarbon Blend Refrigerants',
    thesisSupervisor: 'Brig. Gen. (Retd.) Prof. Engr. M. Zahid Hossain',
    honors: ['Walton Green Tech Innovation Award 2023'],
    clubs: ['BAUST Mechanical Society', 'Women in STEM BAUST'],
    scholarships: [],
    education: [
      {
        id: 'edu-29',
        degree: 'B.Sc. in Mechanical Engineering',
        institution: 'Bangladesh Army University of Science and Technology (BAUST)',
        department: 'ME',
        period: '2017 - 2021',
        cgpa: 3.77
      }
    ],
    publications: [],
    skillsWithLevels: [
      { id: 'sk-76', name: 'Thermodynamic Cycle Simulation (Refprop)', level: 'Expert', endorsements: [] },
      { id: 'sk-77', name: 'HVAC Duct & Psychrometric Design', level: 'Expert', endorsements: [] },
      { id: 'sk-78', name: 'SolidWorks Simulation', level: 'Advanced', endorsements: [] }
    ],
    skills: ['HVAC', 'Refrigeration', 'SolidWorks', 'Thermal Simulation', 'Appliance R&D'],
    topExpertise: ['R&D Inverter Compressors', 'Eco Refrigerants', 'Walton Engineering Trainee Prep'],
    experienceTimeline: [
      {
        id: 'exp-26',
        period: '2021 - Present',
        role: 'Senior Thermal Design Engineer',
        company: 'Walton Micro-Tech',
        location: 'Gazipur',
        isCurrent: true,
        description: 'Engineered high-efficiency 5-star inverter refrigerators saving 65% household electricity.'
      }
    ],
    certifications: ['ASHRAE Certified HVAC Design Level 1'],
    interestedFields: ['Green Cooling', 'Heat Pumps', 'Cryogenics'],
    mentoringAvailable: true,
    openToReferrals: true,
    openToHiring: true,
    mentorshipTopics: ['Career Guidance', 'Interview Prep', 'CV Review'],
    availableSlots: ['Saturday 7:00 PM', 'Sunday 8:00 PM'],
    totalMentees: 16,
    studentsConsulted: 53,
    rating: 4.89,
    reviewCount: 22,
    linkedin: 'https://linkedin.com/in/fariha-tasnim-me',
    privacy: {
      cgpa: 'public',
      email: 'students_only',
      phone: 'hidden',
      location: 'public'
    },
    stats: {
      profileViewsThisMonth: 89,
      searchAppearances: 270,
      bookmarksCount: 39,
      endorsementsReceived: 17,
      monthlyViewHistory: [
        { month: 'Oct', views: 48 },
        { month: 'Nov', views: 65 },
        { month: 'Dec', views: 76 },
        { month: 'Jan', views: 83 },
        { month: 'Feb', views: 89 }
      ]
    },
    lastUpdated: '2025-01-27'
  },
  {
    id: 'alm-25',
    name: 'Sardar Tahmidur Rahman',
    nameBn: 'সরদার তাহমিদুর রহমান',
    email: 'tahmid.sardar@dse.com.bd',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
    department: 'BBA',
    batch: '1st Batch',
    batchNumber: 1,
    admissionYear: 2015,
    passingYear: 2019,
    studentIdMasked: '150601***',
    headline: 'Senior Investment Analyst at IDLC Investments Ltd | CFA Level III Candidate',
    bio: 'Conducting equity research, macroeconomic valuations, and portfolio restructuring for Bangladesh stock markets and sovereign bond portfolios.',
    isVerified: true,
    verificationBadgeLevel: 'Official BAUST',
    designation: 'Senior Investment Analyst',
    company: 'IDLC Investments Ltd.',
    sector: 'Private',
    location: 'Dhaka, Bangladesh',
    country: 'Bangladesh',
    city: 'Dhaka',
    cgpa: 3.82,
    thesisTitle: 'Interest Rate Volatility and Stock Market Performance: An Empirical Study on DSE',
    thesisSupervisor: 'Prof. Dr. M. Mahbubur Rahman',
    honors: ['CFA Institute Research Challenge National Finalist 2019'],
    clubs: ['BAUST Business Club (Founding President)'],
    scholarships: ['BAUST Merit Award'],
    education: [
      {
        id: 'edu-30',
        degree: 'Bachelor of Business Administration (Accounting & Finance)',
        institution: 'Bangladesh Army University of Science and Technology (BAUST)',
        department: 'BBA',
        period: '2015 - 2019',
        cgpa: 3.82
      }
    ],
    publications: [],
    skillsWithLevels: [
      { id: 'sk-79', name: 'Equity Valuation (DCF / Comps)', level: 'Expert', endorsements: [] },
      { id: 'sk-80', name: 'CFA Exam Prep (Level I & II)', level: 'Expert', endorsements: [] },
      { id: 'sk-81', name: 'Financial Statement Modeling', level: 'Expert', endorsements: [] }
    ],
    skills: ['CFA', 'Equity Research', 'DCF Valuation', 'Financial Modeling', 'Stock Markets'],
    topExpertise: ['CFA Level I & II Strategy', 'Investment Banking Interview Prep', 'Financial Modeling Tests'],
    experienceTimeline: [
      {
        id: 'exp-27',
        period: '2020 - Present',
        role: 'Senior Investment Analyst',
        company: 'IDLC Investments',
        location: 'Dhaka',
        isCurrent: true,
        description: 'Managing research coverage on banking and pharmaceutical sectors representing BDT 450 Crore in AUM.'
      }
    ],
    certifications: ['Passed CFA Level I & Level II on First Attempt'],
    interestedFields: ['Asset Management', 'Private Equity', 'Venture Capital'],
    mentoringAvailable: true,
    openToReferrals: true,
    openToHiring: true,
    mentorshipTopics: ['Career Guidance', 'Interview Prep', 'CV Review'],
    availableSlots: ['Friday 6:00 PM', 'Saturday 7:30 PM'],
    totalMentees: 25,
    studentsConsulted: 76,
    rating: 4.93,
    reviewCount: 32,
    linkedin: 'https://linkedin.com/in/tahmid-sardar-idlc',
    privacy: {
      cgpa: 'public',
      email: 'students_only',
      phone: 'hidden',
      location: 'public'
    },
    stats: {
      profileViewsThisMonth: 140,
      searchAppearances: 380,
      bookmarksCount: 65,
      endorsementsReceived: 27,
      monthlyViewHistory: [
        { month: 'Oct', views: 78 },
        { month: 'Nov', views: 98 },
        { month: 'Dec', views: 120 },
        { month: 'Jan', views: 132 },
        { month: 'Feb', views: 140 }
      ]
    },
    lastUpdated: '2025-02-09'
  },
  {
    id: 'alm-26',
    name: 'Asif Ur Rahman',
    nameBn: 'আসিফ উর রহমান',
    email: 'asif.rahman@freelance.io',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80',
    department: 'CSE',
    batch: '7th Batch',
    batchNumber: 7,
    admissionYear: 2018,
    passingYear: 2022,
    studentIdMasked: '180201***',
    headline: 'Senior UI/UX & Product Designer (Figma Certified) | Top Rated on Upwork & Dribbble Pro',
    bio: 'Designs digital experiences for Silicon Valley startups. Mentors BAUST students on product design systems, user research, wireframing, and building standout portfolios.',
    isVerified: true,
    verificationBadgeLevel: 'Top Mentor',
    designation: 'Senior Product Designer',
    company: 'Independent Consultant (Upwork Top Rated)',
    sector: 'Freelancing',
    location: 'Dhaka, Bangladesh',
    country: 'Bangladesh',
    city: 'Dhaka',
    cgpa: 3.35,
    thesisTitle: 'User Experience Heuristics in Voice-Assisted Mobile Banking Interfaces',
    thesisSupervisor: 'Prof. Dr. Md. Ashraful Islam',
    honors: ['Best UI Design, Digital Bangladesh Hackathon 2021'],
    clubs: ['BAUST Creative & Design Guild (Founder)'],
    scholarships: [],
    education: [
      {
        id: 'edu-31',
        degree: 'B.Sc. in Computer Science & Engineering',
        institution: 'Bangladesh Army University of Science and Technology (BAUST)',
        department: 'CSE',
        period: '2018 - 2022',
        cgpa: 3.35
      }
    ],
    publications: [],
    skillsWithLevels: [
      { id: 'sk-82', name: 'Figma & Design Systems', level: 'Expert', endorsements: [] },
      { id: 'sk-83', name: 'User Research & Prototyping', level: 'Expert', endorsements: [] },
      { id: 'sk-84', name: 'Freelance Design Pitching', level: 'Expert', endorsements: [] }
    ],
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Upwork', 'Prototyping', 'Product Strategy'],
    topExpertise: ['Portfolio Review (Dribbble/Behance)', 'Figma Advanced Components', 'Upwork Design Bidding'],
    experienceTimeline: [
      {
        id: 'exp-28',
        period: '2022 - Present',
        role: 'Independent Lead Designer',
        company: 'Self-Employed',
        location: 'Remote',
        isCurrent: true,
        description: 'Delivered design systems for 25+ US and European seed-stage startups.'
      }
    ],
    certifications: ['Google UX Design Professional Certificate'],
    interestedFields: ['Spatial Design (VisionOS)', 'Micro-Interactions', 'Design Operations'],
    mentoringAvailable: true,
    openToReferrals: true,
    openToHiring: true,
    mentorshipTopics: ['Career Guidance', 'CV Review', 'Interview Prep'],
    availableSlots: ['Friday 8:00 PM', 'Sunday 9:00 PM'],
    totalMentees: 32,
    studentsConsulted: 98,
    rating: 4.95,
    reviewCount: 40,
    linkedin: 'https://linkedin.com/in/asif-ur-rahman-uiux',
    portfolio: 'https://dribbble.com/asifdesign',
    privacy: {
      cgpa: 'hidden',
      email: 'students_only',
      phone: 'connections_only',
      location: 'public'
    },
    stats: {
      profileViewsThisMonth: 172,
      searchAppearances: 435,
      bookmarksCount: 81,
      endorsementsReceived: 33,
      monthlyViewHistory: [
        { month: 'Oct', views: 95 },
        { month: 'Nov', views: 130 },
        { month: 'Dec', views: 150 },
        { month: 'Jan', views: 165 },
        { month: 'Feb', views: 172 }
      ]
    },
    lastUpdated: '2025-02-13'
  },
  {
    id: 'alm-27',
    name: 'Lt. Rezwanul Haque (Retd.)',
    nameBn: 'লেঃ রেজওয়ানুল হক',
    email: 'rezwan.haque@bangladesh-aerospace.com',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1517976487502-5f69c5e31707?w=1200&auto=format&fit=crop&q=80',
    department: 'ME',
    batch: '3rd Batch',
    batchNumber: 3,
    admissionYear: 2016,
    passingYear: 2020,
    studentIdMasked: '160302***',
    headline: 'Avionics & Structural Maintenance Engineer at Biman Bangladesh Airlines',
    bio: 'Oversees Boeing 787 Dreamliner fleet structural integrity, non-destructive testing (NDT), and engine ground runs at Hazrat Shahjalal International Airport.',
    isVerified: true,
    verificationBadgeLevel: 'Official BAUST',
    designation: 'Senior Aviation Maintenance Engineer',
    company: 'Biman Bangladesh Airlines Ltd.',
    sector: 'Government',
    location: 'Dhaka, Bangladesh',
    country: 'Bangladesh',
    city: 'Dhaka',
    cgpa: 3.66,
    thesisTitle: 'Fatigue Life Prediction of Aircraft Wing Spars Subjected to Aerodynamic Gust Loading',
    thesisSupervisor: 'Brig. Gen. (Retd.) Prof. Engr. M. Zahid Hossain',
    honors: ['Civil Aviation Authority of Bangladesh (CAAB) License Holder'],
    clubs: ['BAUST Mechanical Society'],
    scholarships: [],
    education: [
      {
        id: 'edu-32',
        degree: 'B.Sc. in Mechanical Engineering',
        institution: 'Bangladesh Army University of Science and Technology (BAUST)',
        department: 'ME',
        period: '2016 - 2020',
        cgpa: 3.66
      }
    ],
    publications: [],
    skillsWithLevels: [
      { id: 'sk-85', name: 'Boeing 787 / 777 Systems', level: 'Expert', endorsements: [] },
      { id: 'sk-86', name: 'CAAB Part-66 License Exam', level: 'Expert', endorsements: [] },
      { id: 'sk-87', name: 'Non-Destructive Testing (NDT)', level: 'Advanced', endorsements: [] }
    ],
    skills: ['Aviation Maintenance', 'CAAB License', 'Boeing Systems', 'NDT Testing', 'Aeronautics'],
    topExpertise: ['Aviation Engineer License Paths', 'Airline Recruitment Exams', 'Aircraft Structural Inspection'],
    experienceTimeline: [
      {
        id: 'exp-29',
        period: '2021 - Present',
        role: 'Aircraft Maintenance Engineer',
        company: 'Biman Bangladesh Airlines',
        location: 'Dhaka Airport',
        isCurrent: true,
        description: 'Certified release engineer for international Boeing line and base heavy checks.'
      }
    ],
    certifications: ['CAAB Aircraft Maintenance Engineer License (Category B1.1)'],
    interestedFields: ['Commercial Aviation', 'Aerospace Composites', 'Drone Regulations'],
    mentoringAvailable: true,
    openToReferrals: true,
    openToHiring: true,
    mentorshipTopics: ['Career Guidance', 'Interview Prep', 'CV Review'],
    availableSlots: ['Friday 5:00 PM', 'Saturday 6:00 PM'],
    totalMentees: 18,
    studentsConsulted: 56,
    rating: 4.88,
    reviewCount: 22,
    linkedin: 'https://linkedin.com/in/rezwanul-haque-aviation',
    privacy: {
      cgpa: 'students_only',
      email: 'students_only',
      phone: 'hidden',
      location: 'public'
    },
    stats: {
      profileViewsThisMonth: 112,
      searchAppearances: 320,
      bookmarksCount: 46,
      endorsementsReceived: 21,
      monthlyViewHistory: [
        { month: 'Oct', views: 60 },
        { month: 'Nov', views: 82 },
        { month: 'Dec', views: 98 },
        { month: 'Jan', views: 106 },
        { month: 'Feb', views: 112 }
      ]
    },
    lastUpdated: '2025-02-01'
  },
  {
    id: 'alm-28',
    name: 'Shamrat Hossain',
    nameBn: 'সম্রাট হোসেন',
    email: 'shamrat.ce@padmabridge.gov.bd',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=1200&auto=format&fit=crop&q=80',
    department: 'CE',
    batch: '3rd Batch',
    batchNumber: 3,
    admissionYear: 2016,
    passingYear: 2020,
    studentIdMasked: '160402***',
    headline: 'Assistant Engineer at Bangladesh Bridge Authority (BBA) | Mega Infrastructure Projects',
    bio: 'Civil engineer working on national mega-bridge maintenance, scour monitoring sensors, and pre-stressed concrete girder inspections.',
    isVerified: true,
    verificationBadgeLevel: 'Official BAUST',
    designation: 'Assistant Engineer (Civil)',
    company: 'Bangladesh Bridge Authority (Govt of Bangladesh)',
    sector: 'Government',
    location: 'Dhaka, Bangladesh',
    country: 'Bangladesh',
    city: 'Dhaka',
    cgpa: 3.71,
    thesisTitle: 'Hydrodynamic Scour Vulnerability Assessment around Mega Bridge Piers',
    thesisSupervisor: 'Col. Engr. Md. Tariqul Islam',
    honors: ['BBA Best Young Engineer Citation 2023'],
    clubs: ['BAUST Civil Engineering Association', 'Sports Club'],
    scholarships: [],
    education: [
      {
        id: 'edu-33',
        degree: 'B.Sc. in Civil Engineering',
        institution: 'Bangladesh Army University of Science and Technology (BAUST)',
        department: 'CE',
        period: '2016 - 2020',
        cgpa: 3.71
      }
    ],
    publications: [],
    skillsWithLevels: [
      { id: 'sk-88', name: 'Bridge Engineering & Pier Scour', level: 'Expert', endorsements: [] },
      { id: 'sk-89', name: 'PWD / BBA / RHD Recruitment Exam', level: 'Expert', endorsements: [] },
      { id: 'sk-90', name: 'Public Procurement Rules (PPR-2008)', level: 'Advanced', endorsements: [] }
    ],
    skills: ['Bridge Engineering', 'Govt Assistant Engineer', 'PPR 2008', 'Civil Inspection', 'RHD / BBA'],
    topExpertise: ['Govt Assistant Engineer (BPSC) Prep', 'Bridge Structural Maintenance', 'PPR & Tender Evaluation'],
    experienceTimeline: [
      {
        id: 'exp-30',
        period: '2021 - Present',
        role: 'Assistant Engineer',
        company: 'Bangladesh Bridge Authority',
        location: 'Dhaka',
        isCurrent: true,
        description: 'Managing structural health telemetry and periodic load tests on national toll bridges.'
      }
    ],
    certifications: ['IEB Certified (AMIEB)'],
    interestedFields: ['Cable-Stayed Bridges', 'Smart Transportation Systems'],
    mentoringAvailable: true,
    openToReferrals: false,
    openToHiring: false,
    mentorshipTopics: ['Government / BCS', 'Career Guidance'],
    availableSlots: ['Friday 4:30 PM', 'Sunday 6:30 PM'],
    totalMentees: 24,
    studentsConsulted: 77,
    rating: 4.91,
    reviewCount: 31,
    linkedin: 'https://linkedin.com/in/shamrat-ce-bridge',
    privacy: {
      cgpa: 'public',
      email: 'students_only',
      phone: 'hidden',
      location: 'public'
    },
    stats: {
      profileViewsThisMonth: 130,
      searchAppearances: 365,
      bookmarksCount: 60,
      endorsementsReceived: 25,
      monthlyViewHistory: [
        { month: 'Oct', views: 72 },
        { month: 'Nov', views: 95 },
        { month: 'Dec', views: 114 },
        { month: 'Jan', views: 122 },
        { month: 'Feb', views: 130 }
      ]
    },
    lastUpdated: '2025-02-06'
  },
  {
    id: 'alm-29',
    name: 'Jannatul Ferdous Laboni',
    nameBn: 'জান্নাতুল ফেরদৌস লাবণী',
    email: 'laboni.textile@dbbl.com.bd',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1520607164022-723659228414?w=1200&auto=format&fit=crop&q=80',
    department: 'Textile',
    batch: '1st Batch',
    batchNumber: 1,
    admissionYear: 2015,
    passingYear: 2019,
    studentIdMasked: '150701***',
    headline: 'Senior RMG Buyer Compliance & Merchandising Manager at H&M Production Office Dhaka',
    bio: 'Handles $40M annual knitwear production contracts for Scandinavian high street fashion brands. Expert in fast-fashion merchandising, pricing negotiations, and HIGG Index sustainability audits.',
    isVerified: true,
    verificationBadgeLevel: 'Official BAUST',
    designation: 'Senior Merchandising Manager',
    company: 'H&M Hennes & Mauritz (Dhaka Liaison Office)',
    sector: 'Private',
    location: 'Gulshan, Dhaka, Bangladesh',
    country: 'Bangladesh',
    city: 'Dhaka',
    cgpa: 3.61,
    thesisTitle: 'Supply Chain Traceability in Certified Organic Cotton Garment Manufacturing',
    thesisSupervisor: 'Engr. Md. Jahangir Alam',
    honors: ['Best Merchandiser of the Year H&M South Asia 2022'],
    clubs: ['BAUST Textile Club (Founding President)'],
    scholarships: [],
    education: [
      {
        id: 'edu-34',
        degree: 'B.Sc. in Textile Engineering',
        institution: 'Bangladesh Army University of Science and Technology (BAUST)',
        department: 'Textile',
        period: '2015 - 2019',
        cgpa: 3.61
      }
    ],
    publications: [],
    skillsWithLevels: [
      { id: 'sk-91', name: 'Apparel Merchandising & Costing', level: 'Expert', endorsements: [] },
      { id: 'sk-92', name: 'Buyer Negotiation & FOB Pricing', level: 'Expert', endorsements: [] },
      { id: 'sk-93', name: 'HIGG Index Sustainability Audits', level: 'Advanced', endorsements: [] }
    ],
    skills: ['Merchandising', 'Apparel Buying', 'H&M Compliance', 'Knitwear Costing', 'HIGG Index'],
    topExpertise: ['RMG Merchandiser Entry Paths', 'Foreign Buying House Interviews', 'FOB Price Calculations'],
    experienceTimeline: [
      {
        id: 'exp-31',
        period: '2020 - Present',
        role: 'Senior Merchandiser',
        company: 'H&M Production Office',
        location: 'Dhaka',
        isCurrent: true,
        description: 'Managing 14 tier-1 supplier factories meeting zero carbon emission commitments.'
      }
    ],
    certifications: ['HIGG FEM & FSLM Certified Auditor'],
    interestedFields: ['Circular Fashion', 'Decarbonized Garments', 'Global Sourcing'],
    mentoringAvailable: true,
    openToReferrals: true,
    openToHiring: true,
    mentorshipTopics: ['Career Guidance', 'Interview Prep', 'CV Review'],
    availableSlots: ['Friday 7:00 PM', 'Saturday 8:00 PM'],
    totalMentees: 21,
    studentsConsulted: 65,
    rating: 4.9,
    reviewCount: 26,
    linkedin: 'https://linkedin.com/in/laboni-hm-merchandising',
    privacy: {
      cgpa: 'hidden',
      email: 'students_only',
      phone: 'hidden',
      location: 'public'
    },
    stats: {
      profileViewsThisMonth: 125,
      searchAppearances: 350,
      bookmarksCount: 54,
      endorsementsReceived: 23,
      monthlyViewHistory: [
        { month: 'Oct', views: 68 },
        { month: 'Nov', views: 90 },
        { month: 'Dec', views: 110 },
        { month: 'Jan', views: 118 },
        { month: 'Feb', views: 125 }
      ]
    },
    lastUpdated: '2025-02-03'
  },
  {
    id: 'alm-30',
    name: 'Khandaker Tanvir Ahmed',
    nameBn: 'খন্দকার তানভীর আহমেদ',
    email: 'tanvir.ahmed@roby.com.bd',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
    department: 'CSE',
    batch: '8th Batch',
    batchNumber: 8,
    admissionYear: 2018,
    passingYear: 2022,
    studentIdMasked: '180202***',
    headline: 'Cyber Security Operations Center (SOC) Specialist at Robi Axiata Ltd.',
    bio: 'Defends telecom infrastructure against advanced persistent threats (APT), ransomware, and telecom SS7/Diameter signaling exploits. Active CTF player and security mentor.',
    isVerified: true,
    verificationBadgeLevel: 'Official BAUST',
    designation: 'Cyber Security Specialist',
    company: 'Robi Axiata Ltd.',
    sector: 'Private',
    location: 'Dhaka, Bangladesh',
    country: 'Bangladesh',
    city: 'Dhaka',
    cgpa: 3.7,
    thesisTitle: 'Behavioral Threat Hunting in SIEM Using Graph Convolutional Networks',
    thesisSupervisor: 'Prof. Dr. Md. Ashraful Islam',
    honors: ['Cyber Security Challenge Bangladesh Finalist 2021'],
    clubs: ['BAUST Cyber Security & Ethical Hacking Club (Founding Lead)'],
    scholarships: [],
    education: [
      {
        id: 'edu-35',
        degree: 'B.Sc. in Computer Science & Engineering',
        institution: 'Bangladesh Army University of Science and Technology (BAUST)',
        department: 'CSE',
        period: '2018 - 2022',
        cgpa: 3.7
      }
    ],
    publications: [],
    skillsWithLevels: [
      { id: 'sk-94', name: 'SIEM (Splunk / QRadar)', level: 'Expert', endorsements: [] },
      { id: 'sk-95', name: 'SOC Incident Response & Forensics', level: 'Expert', endorsements: [] },
      { id: 'sk-96', name: 'Telecom SS7 & Signaling Security', level: 'Advanced', endorsements: [] }
    ],
    skills: ['Cyber Security', 'SOC', 'Splunk', 'Incident Response', 'Network Security', 'CTF'],
    topExpertise: ['Blue Team / SOC Analyst Roadmap', 'Splunk Power User Cert', 'Telecom Security Architecture'],
    experienceTimeline: [
      {
        id: 'exp-32',
        period: '2022 - Present',
        role: 'SOC Specialist',
        company: 'Robi Axiata',
        location: 'Dhaka',
        isCurrent: true,
        description: 'Analyzing 25M daily security events protecting 55M mobile customer accounts.'
      }
    ],
    certifications: ['CompTIA Security+', 'Splunk Certified Core Power User'],
    interestedFields: ['Zero Trust Architecture', 'Threat Intelligence', 'Cloud Security'],
    mentoringAvailable: true,
    openToReferrals: true,
    openToHiring: true,
    mentorshipTopics: ['Career Guidance', 'Interview Prep', 'CV Review'],
    availableSlots: ['Friday 9:00 PM', 'Sunday 8:30 PM'],
    totalMentees: 20,
    studentsConsulted: 68,
    rating: 4.92,
    reviewCount: 29,
    linkedin: 'https://linkedin.com/in/tanvir-ahmed-cyber-robi',
    privacy: {
      cgpa: 'students_only',
      email: 'students_only',
      phone: 'hidden',
      location: 'public'
    },
    stats: {
      profileViewsThisMonth: 145,
      searchAppearances: 395,
      bookmarksCount: 64,
      endorsementsReceived: 29,
      monthlyViewHistory: [
        { month: 'Oct', views: 80 },
        { month: 'Nov', views: 105 },
        { month: 'Dec', views: 125 },
        { month: 'Jan', views: 138 },
        { month: 'Feb', views: 145 }
      ]
    },
    lastUpdated: '2025-02-10'
  },
  {
    id: 'alm-31',
    name: 'Nabila Mehjabin',
    nameBn: 'নাবিলা মেহজাবিন',
    email: 'nabila.mehjabin@ox.ac.uk',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80',
    department: 'English',
    batch: '2nd Batch',
    batchNumber: 2,
    admissionYear: 2016,
    passingYear: 2020,
    studentIdMasked: '160801***',
    headline: 'Doctoral Candidate in Postcolonial Literature & World Bank Consultant at University of Oxford, UK',
    bio: 'BAUST English Department alumna studying at Oxford on the Clarendon Fund Scholarship. Consultant on South Asian higher education policy. Mentors students for Chevening, Oxford Clarendon, and Commonwealth scholarships.',
    isVerified: true,
    verificationBadgeLevel: 'Top Mentor',
    designation: 'Doctoral Candidate & Clarendon Scholar',
    company: 'University of Oxford',
    sector: 'Abroad',
    location: 'Oxford, England, United Kingdom',
    country: 'United Kingdom',
    city: 'Oxford',
    cgpa: 3.95,
    thesisTitle: 'Eco-Critical Narratives of Flood Resilience in Contemporary South Asian Fiction',
    thesisSupervisor: 'Prof. Dr. Syed Manzoorul Islam',
    honors: ['Oxford Clarendon Fund Full Scholarship ($45,000 GBP/year)', 'BAUST Gold Medalist in Arts'],
    clubs: ['BAUST Literary Society (President)', 'Debating Society'],
    scholarships: ['Clarendon Fund Scholarship', 'BAUST Full Waiver'],
    education: [
      {
        id: 'edu-36',
        degree: 'M.St. in English (1900-Present)',
        institution: 'University of Oxford',
        department: 'Faculty of English',
        period: '2021 - 2022',
        cgpa: 3.98
      },
      {
        id: 'edu-37',
        degree: 'B.A. (Hons) in English',
        institution: 'Bangladesh Army University of Science and Technology (BAUST)',
        department: 'English',
        period: '2016 - 2020',
        cgpa: 3.95
      }
    ],
    publications: [
      {
        id: 'pub-8',
        title: 'Ecological Grief and Riverine Displacement in Postcolonial Bengal Writing',
        conferenceOrJournal: 'Oxford Interdisciplinary Literary Review',
        year: 2023,
        doiOrUrl: 'https://doi.org/10.1080/08905436.2023.2189912',
        field: 'Postcolonial Literature'
      }
    ],
    skillsWithLevels: [
      { id: 'sk-97', name: 'Oxford Clarendon & Chevening Essays', level: 'Expert', endorsements: [] },
      { id: 'sk-98', name: 'Critical Academic Writing', level: 'Expert', endorsements: [] },
      { id: 'sk-99', name: 'UK University Admissions', level: 'Expert', endorsements: [] }
    ],
    skills: ['Oxford Clarendon', 'Chevening Prep', 'Academic Essays', 'Literature', 'SOP Review'],
    topExpertise: ['Oxford / Cambridge Scholarship Applications', 'Chevening Leadership Essays', 'SOP Deep Re-Writing'],
    experienceTimeline: [
      {
        id: 'exp-33',
        period: '2022 - Present',
        role: 'Doctoral Researcher',
        company: 'University of Oxford',
        location: 'Oxford, UK',
        isCurrent: true,
        description: 'Conducting archival research at the Bodleian Library on climate fiction in the Global South.'
      }
    ],
    certifications: ['Oxford Academic Teaching Fellow (FHEA)'],
    interestedFields: ['Environmental Humanities', 'Global Education Reform'],
    mentoringAvailable: true,
    openToReferrals: true,
    openToHiring: false,
    mentorshipTopics: ['Higher Studies', 'Research & Publication', 'CV Review'],
    availableSlots: ['Saturday 4:00 PM GMT', 'Sunday 5:00 PM GMT'],
    totalMentees: 33,
    studentsConsulted: 99,
    rating: 4.98,
    reviewCount: 45,
    linkedin: 'https://linkedin.com/in/nabila-mehjabin-oxford',
    privacy: {
      cgpa: 'public',
      email: 'students_only',
      phone: 'hidden',
      location: 'public'
    },
    stats: {
      profileViewsThisMonth: 210,
      searchAppearances: 520,
      bookmarksCount: 97,
      endorsementsReceived: 42,
      monthlyViewHistory: [
        { month: 'Oct', views: 110 },
        { month: 'Nov', views: 150 },
        { month: 'Dec', views: 180 },
        { month: 'Jan', views: 195 },
        { month: 'Feb', views: 210 }
      ]
    },
    lastUpdated: '2025-02-15'
  },
  {
    id: 'alm-32',
    name: 'S. M. Mahbubul Alam',
    nameBn: 'এস. এম. মাহবুবুল আলম',
    email: 'mahbubul.alam@unilever.com',
    role: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80',
    department: 'IPE',
    batch: '1st Batch',
    batchNumber: 1,
    admissionYear: 2015,
    passingYear: 2019,
    studentIdMasked: '150502***',
    headline: 'Manufacturing Excellence & Industry 4.0 Lead at Unilever Bangladesh Ltd.',
    bio: 'Directing automated robotics, computer vision quality assurance, and predictive maintenance algorithms across Unilever personal care production lines in Kalurghat.',
    isVerified: true,
    verificationBadgeLevel: 'Top Mentor',
    designation: 'Manufacturing Excellence Lead',
    company: 'Unilever Bangladesh Ltd.',
    sector: 'Private',
    location: 'Chattogram / Dhaka, Bangladesh',
    country: 'Bangladesh',
    city: 'Chattogram',
    cgpa: 3.84,
    thesisTitle: 'Predictive Vibration Analytics in Rotary Equipment Using Wavelet Transform & Machine Learning',
    thesisSupervisor: 'Dr. Md. Rafiqul Islam',
    honors: ['Unilever South Asia Hero Award 2023', 'BAUST Department First'],
    clubs: ['BAUST IPE Association (Founding Vice President)'],
    scholarships: ['BAUST Merit Scholarship'],
    education: [
      {
        id: 'edu-38',
        degree: 'B.Sc. in Industrial and Production Engineering',
        institution: 'Bangladesh Army University of Science and Technology (BAUST)',
        department: 'IPE',
        period: '2015 - 2019',
        cgpa: 3.84
      }
    ],
    publications: [],
    skillsWithLevels: [
      { id: 'sk-100', name: 'Industry 4.0 & SCADA', level: 'Expert', endorsements: [] },
      { id: 'sk-101', name: 'Unilever UFLP / Assessment Prep', level: 'Expert', endorsements: [] },
      { id: 'sk-102', name: 'Predictive Maintenance Analytics', level: 'Expert', endorsements: [] }
    ],
    skills: ['Industry 4.0', 'Unilever UFLP', 'Predictive Maintenance', 'Smart Factory', 'Supply Chain'],
    topExpertise: ['Unilever Future Leaders Programme (UFLP)', 'Smart Factory Automation', 'FMCG Technical Management'],
    experienceTimeline: [
      {
        id: 'exp-34',
        period: '2021 - Present',
        role: 'Manufacturing Excellence Lead',
        company: 'Unilever Bangladesh',
        location: 'Chattogram Factory',
        isCurrent: true,
        description: 'Digitized line operations reducing unplanned mechanical stops by 42% across 8 production units.'
      }
    ],
    certifications: ['Certified Smart Factory Practitioner (TÜV SÜD)'],
    interestedFields: ['Industrial AI', 'Cobots', 'Sustainable Manufacturing'],
    mentoringAvailable: true,
    openToReferrals: true,
    openToHiring: true,
    mentorshipTopics: ['Career Guidance', 'Interview Prep', 'CV Review'],
    availableSlots: ['Friday 7:30 PM', 'Sunday 8:00 PM'],
    totalMentees: 35,
    studentsConsulted: 104,
    rating: 4.96,
    reviewCount: 44,
    linkedin: 'https://linkedin.com/in/mahbubul-alam-unilever',
    privacy: {
      cgpa: 'public',
      email: 'students_only',
      phone: 'hidden',
      location: 'public'
    },
    stats: {
      profileViewsThisMonth: 185,
      searchAppearances: 490,
      bookmarksCount: 92,
      endorsementsReceived: 39,
      monthlyViewHistory: [
        { month: 'Oct', views: 95 },
        { month: 'Nov', views: 135 },
        { month: 'Dec', views: 160 },
        { month: 'Jan', views: 175 },
        { month: 'Feb', views: 185 }
      ]
    },
    lastUpdated: '2025-02-14'
  }
];
