/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { doc, getDoc, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { DemoAccountSpec, ENABLE_DEMO_LOGIN } from '../config/demoConfig';
import { buildInitialDocumentStages } from '../constants/baustDataModel';

/**
 * Builds a complete, null-safe Firestore user document payload for a Demo account.
 * All profile fields are initialized cleanly (never undefined).
 */
export function buildDemoUserPayload(
  uid: string,
  spec: DemoAccountSpec,
  existingCreatedAt?: any
): Record<string, any> {
  const isStudent = spec.role === 'student';
  const isAlumni = spec.role === 'alumni';
  const isStaff = spec.role === 'admin' || spec.role === 'superAdmin';

  return {
    id: uid,
    uid,
    ownerId: uid,
    name: spec.name,
    email: spec.email,
    role: spec.role,
    baustId: spec.baustId,
    department: spec.department,
    batch: spec.batch,
    passingYear: spec.passingYear,
    avatar: spec.avatar,
    phone: '+880 1700-000100',
    bio: `${spec.designation} at ${spec.company}. Official BAUST Career Bridge demo workspace.`,
    designation: spec.designation,
    company: spec.company,
    office: spec.office || '',
    employeeId: isStaff ? spec.baustId : '',
    sector: isAlumni ? 'Private' : 'Government',
    location: isAlumni ? 'Dhaka, Bangladesh' : 'Saidpur Cantonment, Nilphamari',
    studentId: isStudent ? spec.baustId : '',
    currentSemester: isStudent ? 'Level-4, Term-I' : '',
    cgpa: isStudent ? 3.82 : 3.75,
    careerGoal: isStudent ? 'Full-Stack & Cloud Systems Engineer' : '',
    interests: isStudent ? ['Full-Stack Web', 'System Design', 'Cloud Computing'] : ['Career Mentoring'],
    cvFileName: isStudent ? 'Demo_Student_BAUST_CV.pdf' : '',
    cvUrl: '',
    headline: isAlumni
      ? `${spec.designation} · BAUST CSE Alumni`
      : isStudent
      ? 'Final Year CSE Undergraduate · BAUST'
      : `${spec.designation} · BAUST`,
    linkedin: '',
    github: '',
    skills: isAlumni
      ? ['React', 'Node.js', 'System Architecture', 'Technical Mentoring']
      : isStudent
      ? ['TypeScript', 'React', 'Python', 'Data Structures']
      : ['University Administration', 'Verification', 'Academic Governance'],
    mentoringAvailable: isAlumni,
    mentorshipTopics: isAlumni ? ['CV Review', 'Interview Prep', 'Career Guidance'] : [],
    availableSlots: isAlumni ? ['Fri 08:00 PM', 'Sat 07:30 PM'] : [],
    experienceTimeline: isAlumni
      ? [
          {
            id: 'exp-demo-1',
            role: 'Senior Software Engineer',
            company: 'Brain Station 23',
            duration: '2022 - Present',
            description: 'Leading web architecture and mentoring junior BAUST graduates.',
          },
        ]
      : [],
    education: [
      {
        id: 'edu-demo-1',
        degree: 'B.Sc. in Computer Science & Engineering',
        institution: 'BAUST, Saidpur',
        year: String(spec.passingYear),
      },
    ],
    achievements: ['BAUST Academic Merit Scholar'],
    totalMentees: isAlumni ? 12 : 0,
    rating: isAlumni ? 4.9 : 0,
    verificationStatus: 'approved',
    accountStatus: 'approved',
    isVerified: true,
    verifiedAlumniBadge: isAlumni,
    isFeatured: isAlumni,
    hidePhone: false,
    hideEmail: false,
    profileVisibility: 'public',
    isDemo: true,
    suspended: false,
    rejectionReason: '',
    documentType: 'Demo Verified Account',
    documentFileName: 'demo_verified_record.pdf',
    documentPreviewUrl: '',
    createdAt: existingCreatedAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

/**
 * Verifies a fetched Firestore users/{uid} record has every essential field populated.
 */
export function isDemoUserDocComplete(
  raw: Record<string, any> | null | undefined,
  spec: DemoAccountSpec
): boolean {
  if (!raw) return false;
  return (
    raw.uid === raw.id &&
    Boolean(raw.name) &&
    raw.email === spec.email &&
    raw.role === spec.role &&
    raw.verificationStatus === 'approved' &&
    raw.isVerified === true &&
    raw.isDemo === true &&
    raw.suspended !== true &&
    Array.isArray(raw.skills) &&
    Array.isArray(raw.interests)
  );
}

/**
 * Idempotently provisions or repairs the demo user document and seeds role-authorized sample data
 * using deterministic IDs so repeated / double-click logins never fail rules or duplicate records.
 */
export async function ensureDemoProfileAndSampleData(
  uid: string,
  spec: DemoAccountSpec
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const existingSnap = await getDoc(userRef);
  const existingData = existingSnap.exists() ? (existingSnap.data() as Record<string, any>) : null;

  // Step 1: Ensure users/{uid} exists & is complete BEFORE dependent writes evaluate Firestore security rules
  if (!isDemoUserDocComplete(existingData, spec)) {
    const userPayload = buildDemoUserPayload(uid, spec, existingData?.createdAt);
    await setDoc(userRef, userPayload, { merge: true });
  }

  // Step 2: Check role-authorized sentinel doc; only write sample data authorized for this exact role
  const sentinelRef = doc(db, 'documentRequests', `DEMO-DOC-${spec.role.toUpperCase()}-1`);
  const sentinelSnap = await getDoc(sentinelRef).catch(() => null);
  const logRef = doc(db, 'activityLogs', `demo-log-${spec.role}-init`);
  const logSnap = await getDoc(logRef).catch(() => null);

  if (sentinelSnap && sentinelSnap.exists() && existingData && isDemoUserDocComplete(existingData, spec)) {
    return;
  }

  const batch = writeBatch(db);
  const todayStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Document Request (allowed for every approved role where userId == uid; Stage 1 done, Stage 2 current)
  const docNowIso = new Date().toISOString();
  batch.set(
    sentinelRef,
    {
      id: `DEMO-DOC-${spec.role.toUpperCase()}-1`,
      trackingId: `DEMO-DOC-${spec.role.toUpperCase()}-1`,
      userId: uid,
      userName: spec.name,
      userEmail: spec.email,
      userRole: spec.role,
      baustId: spec.baustId,
      department: spec.department,
      type: 'Official Academic Transcript',
      serviceId: 'srv-transcript',
      copies: 1,
      purpose: 'Higher Studies Abroad',
      urgency: 'Normal',
      deliveryMethod: 'Campus Pickup',
      deliveryAddress: '',
      paymentMethod: 'bKash',
      transactionId: `BKASH-DEMO-${spec.role.toUpperCase()}`,
      fee: 500,
      status: 'submitted',
      stages: buildInitialDocumentStages(spec.name, docNowIso),
      currentStageIndex: 1,
      currentStageKey: 'payment_verified',
      payment: {
        method: 'bKash',
        transactionId: `BKASH-DEMO-${spec.role.toUpperCase()}`,
        subtotal: 500,
        urgencyFee: 0,
        courierFee: 0,
        totalAmount: 500,
        isVerified: false,
        paidAt: docNowIso,
      },
      isDemo: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // Student-authorized sample data
  if (spec.role === 'student') {
    batch.set(
      doc(db, 'jobApplications', 'demo-app-student-1'),
      {
        jobId: 'demo-job-1',
        jobTitle: 'Junior Software Engineer (React & TypeScript)',
        company: 'Brain Station 23',
        postedBy: 'demo-alumni-sample',
        postedById: 'demo-alumni-sample',
        postedByName: 'Demo Alumni',
        postedByRole: 'alumni',
        studentId: uid,
        studentName: spec.name,
        studentEmail: spec.email,
        department: spec.department,
        batch: spec.batch,
        cgpa: '3.82',
        cvFileName: 'Demo_Student_BAUST_CV.pdf',
        coverNote: 'Built full-stack React & Firebase academic capstones at BAUST.',
        status: 'Applied',
        statusHistory: [
          {
            status: 'Applied',
            at: new Date().toISOString(),
            by: spec.name,
            note: 'Initial application submitted.',
          },
        ],
        isDemo: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    batch.set(
      doc(db, 'mentorships', 'demo-mnt-student-1'),
      {
        studentId: uid,
        studentName: spec.name,
        studentDept: spec.department,
        studentBatch: spec.batch,
        studentAvatar: spec.avatar,
        alumniId: 'demo-alumni-sample',
        mentorId: 'demo-alumni-sample',
        alumniName: 'Demo Alumni',
        mentorName: 'Demo Alumni',
        alumniCompany: 'Brain Station 23',
        topic: 'CV Review',
        note: 'Would appreciate guidance on preparing for software engineering technical interviews.',
        message: 'Would appreciate guidance on preparing for software engineering technical interviews.',
        preferredDate: '2026-12-05',
        preferredTime: '08:00 PM',
        status: 'Pending',
        meetingLink: '',
        feedback: '',
        statusHistory: [
          {
            status: 'Pending',
            at: new Date().toISOString(),
            by: spec.name,
            note: 'Requested mentorship session.',
          },
        ],
        isDemo: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  // Alumni-authorized sample data
  if (spec.role === 'alumni') {
    batch.set(
      doc(db, 'jobs', 'demo-job-1'),
      {
        title: 'Junior Software Engineer (React & TypeScript)',
        company: 'Brain Station 23',
        location: 'Dhaka / Hybrid',
        type: 'Full-Time',
        department: 'CSE',
        salaryRange: 'BDT 55,000 - 75,000',
        deadline: '2026-12-20',
        description:
          'Demo graduate role posted by BAUST Alumni for final-year CSE students and fresh graduates.',
        requirements: ['TypeScript', 'React', 'Node.js', 'REST APIs'],
        postedById: uid,
        postedByName: spec.name,
        postedByRole: 'alumni',
        status: 'Open',
        isDemo: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    batch.set(
      doc(db, 'events', 'demo-event-1'),
      {
        title: 'BAUST Annual Tech & Alumni Career Summit 2026',
        category: 'Career Fair',
        date: '2026-12-18',
        time: '10:00 AM',
        venue: 'BAUST Central Auditorium, Saidpur',
        mode: 'Hybrid',
        description:
          'On-campus engineering interviews, live CV clinics with senior alumni, and industry panel talks.',
        organizerId: uid,
        organizerName: spec.name,
        organizerRole: 'alumni',
        attendeeIds: [uid],
        maxSeats: 250,
        isDemo: true,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );

    batch.set(
      doc(db, 'mentorships', 'demo-mnt-alumni-1'),
      {
        studentId: 'demo-student-sample',
        studentName: 'Demo Student',
        studentDept: 'CSE',
        studentBatch: '19th Batch',
        studentAvatar:
          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        alumniId: uid,
        mentorId: uid,
        alumniName: spec.name,
        mentorName: spec.name,
        alumniCompany: spec.company,
        topic: 'Interview Prep',
        note: 'Seeking mock technical interview feedback before graduation.',
        message: 'Seeking mock technical interview feedback before graduation.',
        preferredDate: '2026-12-08',
        preferredTime: '08:00 PM',
        status: 'Pending',
        meetingLink: '',
        feedback: '',
        statusHistory: [
          {
            status: 'Pending',
            at: new Date().toISOString(),
            by: 'Demo Student',
            note: 'Requested mock technical interview feedback.',
          },
        ],
        isDemo: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    batch.set(
      doc(db, 'contributions', 'demo-contrib-1'),
      {
        alumniId: uid,
        alumniName: spec.name,
        department: spec.department,
        batch: spec.batch,
        category: 'Scholarship Fund',
        amountBdt: 25000,
        pledgeTitle: 'BAUST CSE Merit & Thesis Hardware Stipend',
        note: 'Supporting final-year students in embedded systems and cloud capstone projects.',
        status: 'Acknowledged',
        isDemo: true,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );

    batch.set(
      doc(db, 'knowledgeSessions', 'demo-ks-1'),
      {
        title: 'Cracking Full-Stack & Cloud Engineering Interviews in BD',
        topic: 'Technical Interview Prep',
        description:
          'Interactive alumni-led webinar walking through live system design, portfolio projects, and Git workflows for BAUST undergraduates.',
        hostId: uid,
        hostName: spec.name,
        hostCompany: spec.company,
        hostAvatar: spec.avatar,
        department: 'CSE',
        date: '2026-12-14',
        time: '08:30 PM',
        durationMinutes: 75,
        mode: 'Online',
        meetingLink: 'https://meet.google.com/baust-demo-webinar',
        venue: 'Google Meet',
        maxSeats: 120,
        registeredIds: [uid],
        status: 'Scheduled',
        isDemo: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    batch.set(
      doc(db, 'appointments', 'demo-slot-1'),
      {
        alumniId: uid,
        alumniName: spec.name,
        alumniCompany: spec.company,
        alumniAvatar: spec.avatar,
        date: '2026-12-16',
        timeSlot: '08:00 PM - 08:30 PM',
        mode: 'Google Meet',
        meetingLink: 'https://meet.google.com/baust-slot-demo1',
        topic: 'CV & Portfolio Architecture Review',
        status: 'available',
        bookedByStudentId: '',
        bookedByStudentName: '',
        bookedByStudentEmail: '',
        bookingNote: '',
        isDemo: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  // Admin-authorized sample data
  if (spec.role === 'admin') {
    batch.set(
      doc(db, 'jobs', 'demo-job-2'),
      {
        title: 'Embedded Systems & IoT Trainee Engineer',
        company: 'Walton Digi-Tech Industries',
        location: 'Gazipur, Bangladesh',
        type: 'Internship',
        department: 'EEE',
        salaryRange: 'BDT 22,000 Stipend',
        deadline: '2026-12-28',
        description:
          'Industrial internship program vetted by the BAUST Placement Office for Level-4 students.',
        requirements: ['Embedded C', 'Microcontrollers', 'PCB Design'],
        postedById: uid,
        postedByName: spec.name,
        postedByRole: 'admin',
        status: 'Open',
        isDemo: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    batch.set(
      doc(db, 'announcements', 'demo-ann-1'),
      {
        title: 'Winter 2026 Transcript & Degree Clearance Notice',
        category: 'Notice',
        targetAudience: 'All',
        content:
          'Graduating batches can submit Transcript, Provisional Certificate, and Clearance requests through the University Admin Desk.',
        author: 'Office of the Registrar & Controller of Examinations',
        authorId: uid,
        date: todayStr,
        pinned: true,
        isDemo: true,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );

    batch.set(
      doc(db, 'events', 'demo-event-admin-1'),
      {
        title: 'BAUST Campus Placement Orientation Briefing',
        category: 'Seminar',
        date: '2026-12-10',
        time: '11:00 AM',
        venue: 'BAUST Seminar Hall',
        mode: 'On-Campus',
        description: 'Official campus placement documentation & verification briefing for graduating batches.',
        organizerId: uid,
        organizerName: spec.name,
        organizerRole: 'admin',
        attendeeIds: [uid],
        maxSeats: 180,
        isDemo: true,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  // Super Admin-authorized sample data + config/app
  if (spec.role === 'superAdmin') {
    batch.set(
      doc(db, 'config', 'app'),
      {
        demoEnabled: ENABLE_DEMO_LOGIN,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    batch.set(
      doc(db, 'jobs', 'demo-job-1'),
      {
        title: 'Junior Software Engineer (React & TypeScript)',
        company: 'Brain Station 23',
        location: 'Dhaka / Hybrid',
        type: 'Full-Time',
        department: 'CSE',
        salaryRange: 'BDT 55,000 - 75,000',
        deadline: '2026-12-20',
        description:
          'Demo graduate role posted by BAUST Alumni for final-year CSE students and fresh graduates.',
        requirements: ['TypeScript', 'React', 'Node.js', 'REST APIs'],
        postedById: uid,
        postedByName: 'Demo Alumni',
        postedByRole: 'alumni',
        status: 'Open',
        isDemo: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    batch.set(
      doc(db, 'announcements', 'demo-ann-1'),
      {
        title: 'Winter 2026 Transcript & Degree Clearance Notice',
        category: 'Notice',
        targetAudience: 'All',
        content:
          'Graduating batches can submit Transcript, Provisional Certificate, and Clearance requests through the University Admin Desk.',
        author: 'Office of the Registrar & Controller of Examinations',
        authorId: uid,
        date: todayStr,
        pinned: true,
        isDemo: true,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );

    batch.set(
      doc(db, 'verificationRequests', 'demo-sample-pending-student'),
      {
        id: 'demo-sample-pending-student',
        userId: 'demo-sample-pending-student',
        name: 'Sample Pending Student',
        email: 'sample.pending.student@baustdemo.com',
        phone: '+880 1711-000222',
        role: 'student',
        baustId: '2002088',
        department: 'CSE',
        batch: '20th Batch',
        passingYear: 2027,
        office: '',
        company: '',
        designation: 'Undergraduate Student',
        details: {
          baustId: '2002088',
          phone: '+880 1711-000222',
          department: 'CSE',
          batch: '20th Batch',
        },
        documentType: 'Demo Student ID Verification',
        documentFileName: 'demo_student_id.png',
        documentPreviewUrl:
          'https://images.unsplash.com/photo-1589330694653-dad6d3240a2b?w=600&auto=format&fit=crop&q=80',
        status: 'pending',
        isDemo: true,
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  // Activity Log (create once; rules forbid update on activityLogs)
  if (!logSnap || !logSnap.exists()) {
    batch.set(logRef, {
      actorId: uid,
      actorName: spec.name,
      actorRole: spec.role,
      action: 'DEMO_WORKSPACE_READY',
      targetType: 'demo',
      targetId: uid,
      details: `Auto-provisioned demo workspace and sample data for ${spec.name} (${spec.role}).`,
      isDemo: true,
      createdAt: serverTimestamp(),
    });
  }

  await batch.commit();
}
