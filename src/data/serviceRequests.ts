/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AdminDeskRequest } from '../types/admindesk';

export const initialServiceRequests: AdminDeskRequest[] = [
  {
    id: 'BCB-2026-000101',
    alumniId: 'alm-1',
    alumniName: 'Kazi Farhan Kabir',
    alumniEmail: 'farhan.kabir@brainstation-23.com',
    alumniPhone: '+880 1712-345678',
    alumniAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    baustId: '1602012',
    department: 'CSE',
    batch: '4th Batch',
    passingYear: 2020,
    cgpa: 3.88,
    services: [
      {
        serviceId: 'srv-transcript',
        serviceName: 'Academic Transcript (Official, Sealed)',
        copies: 2,
        feePerCopy: 400,
        purpose: 'Higher Studies Abroad',
        urgency: 'Urgent',
        programInfo: 'M.Sc. in Computer Science application at TU Munich'
      },
      {
        serviceId: 'srv-moi',
        serviceName: 'Medium of Instruction (MOI) Certificate',
        copies: 1,
        feePerCopy: 300,
        purpose: 'Higher Studies Abroad',
        urgency: 'Urgent'
      }
    ],
    uploadedDocuments: [
      {
        id: 'doc-1',
        name: 'BAUST_Student_ID_1602012.pdf',
        size: '1.2 MB',
        type: 'application/pdf',
        url: 'https://example.com/docs/id.pdf',
        uploadedAt: '2026-11-01 10:30 AM',
        category: 'ID Card'
      },
      {
        id: 'doc-2',
        name: 'bKash_Payment_Slip_TXN889.jpg',
        size: '850 KB',
        type: 'image/jpeg',
        url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80',
        uploadedAt: '2026-11-01 10:32 AM',
        category: 'Payment Slip'
      }
    ],
    delivery: {
      method: 'Courier (Home Delivery)',
      courierAddress: 'House 42, Road 11, Banani, Dhaka-1213, Bangladesh',
      courierFee: 150,
      courierName: 'SA Paribahan Currier',
      courierTrackingNumber: 'SA-DHK-992140',
      expectedDeliveryDate: '2026-11-08'
    },
    payment: {
      method: 'bKash',
      transactionId: 'BK9X77812M',
      subtotal: 1900,
      urgencyFee: 500,
      courierFee: 150,
      totalAmount: 2550,
      isVerified: true,
      paidAt: '2026-11-01 10:35 AM'
    },
    status: 'Ready',
    urgency: 'Urgent',
    submittedAt: '2026-11-01 10:35 AM',
    estimatedDelivery: '2026-11-05',
    assignedStaffId: 'stf-2',
    assignedStaffName: 'Engr. Md. Jahidul Islam (Assistant Controller)',
    adminRemarks: 'Dual security hologram stamped on both transcripts. Packaged in tamper-proof university envelope.',
    internalStaffNotes: [
      'Graduation honors confirmed in Convocation Ledger Vol. 2.',
      'Urgent processing requested for DAAD scholarship deadline.'
    ],
    checklist: {
      baustIdMatches: true,
      academicRecordFound: true,
      paymentVerified: true,
      documentsValid: true
    },
    timeline: [
      { step: 'Request Submitted & Order Placed', timestamp: 'Nov 01, 2026 10:35 AM', completed: true, handledBy: 'Applicant (Online)' },
      { step: 'Payment Verified by Finance Office', timestamp: 'Nov 01, 2026 02:15 PM', completed: true, handledBy: 'Accounts Officer (BAUST)' },
      { step: 'Academic Verification & Controller Review', timestamp: 'Nov 02, 2026 11:30 AM', completed: true, handledBy: 'Exam Controller Office' },
      { step: 'Official Printing & Hologram Seal Affixed', timestamp: 'Nov 03, 2026 04:00 PM', completed: true, handledBy: 'Engr. Md. Jahidul Islam' },
      { step: 'Ready for Dispatch / Collection', timestamp: 'Nov 04, 2026 09:30 AM', completed: true, handledBy: 'Admin Desk Desk Counter' },
      { step: 'Delivered / Handed Over', timestamp: 'Pending Courier Pickup', completed: false }
    ],
    messages: [
      {
        id: 'msg-1',
        senderRole: 'alumni',
        senderName: 'Kazi Farhan Kabir',
        text: 'Assalamu Alaikum. Could you please ensure the transcript envelopes have the official seal over the flap? TUM strictly requires sealed flaps.',
        timestamp: 'Nov 01, 2026 11:00 AM'
      },
      {
        id: 'msg-2',
        senderRole: 'admin',
        senderName: 'Engr. Md. Jahidul Islam',
        text: 'Walaykum Assalam Farhan. Yes, both copies have been individually sealed with the registrar embossing seal and signature across the flap.',
        timestamp: 'Nov 02, 2026 03:20 PM'
      }
    ],
    finalDeliverable: {
      documentNumber: 'BAUST/EXAM/TR/2026/0412',
      title: 'Official Academic Transcript (Digital Copy)',
      issuedDate: '2026-11-04',
      qrCodeUrl: 'https://bcb.baust.edu.bd/verify-document?id=BCB-2026-000101',
      fileUrl: 'https://example.com/transcripts/BCB-2026-000101.pdf',
      watermark: 'DIGITAL STUDENT COPY - OFFICIAL BAUST SEAL',
      digitalSignature: 'MD. JAHIDUL ISLAM, ASST CONTROLLER OF EXAMINATIONS',
      signatoryTitle: 'Assistant Controller of Examinations'
    },
    auditLog: [
      { id: 'aud-1', action: 'STATUS_CHANGE', performedBy: 'Accounts Office', timestamp: '2026-11-01 02:15 PM', details: 'Payment BDT 2550 verified' },
      { id: 'aud-2', action: 'ASSIGNMENT', performedBy: 'Exam Controller', timestamp: '2026-11-02 09:00 AM', details: 'Assigned to Engr. Md. Jahidul Islam' },
      { id: 'aud-3', action: 'STATUS_CHANGE', performedBy: 'Engr. Md. Jahidul Islam', timestamp: '2026-11-04 09:30 AM', details: 'Status marked READY' }
    ]
  },
  {
    id: 'BCB-2026-000102',
    alumniId: 'alm-2',
    alumniName: 'Anika Bushra',
    alumniEmail: 'anika.bushra@samsung.com',
    alumniPhone: '+880 1823-456789',
    alumniAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    baustId: '1502014',
    department: 'CSE',
    batch: '3rd Batch',
    passingYear: 2019,
    cgpa: 3.94,
    services: [
      {
        serviceId: 'srv-moi',
        serviceName: 'Medium of Instruction (MOI) Certificate',
        copies: 1,
        feePerCopy: 300,
        purpose: 'Immigration',
        urgency: 'Normal'
      }
    ],
    uploadedDocuments: [
      {
        id: 'doc-3',
        name: 'Provisional_Cert_Anika.pdf',
        size: '1.5 MB',
        type: 'application/pdf',
        url: 'https://example.com/docs/moi.pdf',
        uploadedAt: '2026-10-15 09:00 AM',
        category: 'Supporting Doc'
      }
    ],
    delivery: {
      method: 'Email Soft Copy / PDF',
      recipientEmail: 'anika.bushra@samsung.com'
    },
    payment: {
      method: 'Nagad',
      transactionId: 'NGD991204X',
      subtotal: 600,
      urgencyFee: 0,
      courierFee: 0,
      totalAmount: 600,
      isVerified: true,
      paidAt: '2026-10-15 09:05 AM'
    },
    status: 'Delivered',
    urgency: 'Normal',
    submittedAt: '2026-10-15 09:05 AM',
    estimatedDelivery: '2026-10-20',
    assignedStaffId: 'stf-3',
    assignedStaffName: 'Md. Tariqul Islam (Administrative Officer)',
    adminRemarks: 'Digitally signed MOI dispatched to verified alumni email. Hardcopy archived in registrar department.',
    checklist: {
      baustIdMatches: true,
      academicRecordFound: true,
      paymentVerified: true,
      documentsValid: true
    },
    timeline: [
      { step: 'Request Submitted & Order Placed', timestamp: 'Oct 15, 2026 09:05 AM', completed: true },
      { step: 'Payment Verified by Finance Office', timestamp: 'Oct 15, 2026 11:30 AM', completed: true },
      { step: 'Academic Verification & Controller Review', timestamp: 'Oct 16, 2026 02:00 PM', completed: true },
      { step: 'Official Printing & Hologram Seal Affixed', timestamp: 'Oct 17, 2026 10:15 AM', completed: true },
      { step: 'Ready for Dispatch / Collection', timestamp: 'Oct 18, 2026 09:00 AM', completed: true },
      { step: 'Delivered / Handed Over', timestamp: 'Oct 18, 2026 09:30 AM', completed: true, remarks: 'Emailed to anika.bushra@samsung.com' }
    ],
    messages: [],
    finalDeliverable: {
      documentNumber: 'BAUST/REG/MOI/2026/0182',
      title: 'Medium of Instruction (MOI) Certificate',
      issuedDate: '2026-10-18',
      qrCodeUrl: 'https://bcb.baust.edu.bd/verify-document?id=BCB-2026-000102',
      fileUrl: 'https://example.com/transcripts/BCB-2026-000102.pdf',
      watermark: 'DIGITAL COPY - BAUST REGISTRAR OFFICE',
      digitalSignature: 'LT COL (RETD) MD. RAFIQUL ISLAM, REGISTRAR',
      signatoryTitle: 'Registrar, BAUST'
    },
    rating: {
      score: 5,
      comment: 'Extremely fast delivery! Received the high resolution PDF in my email within 3 days.',
      ratedAt: '2026-10-19'
    },
    auditLog: [
      { id: 'aud-4', action: 'DELIVERED', performedBy: 'Md. Tariqul Islam', timestamp: '2026-10-18 09:30 AM', details: 'Document emailed successfully' }
    ]
  },
  {
    id: 'BCB-2026-000103',
    alumniId: 'alm-3',
    alumniName: 'Md. Tanvir Hasan (BCS)',
    alumniEmail: 'tanvir.hasan@mopa.gov.bd',
    alumniPhone: '+880 1715-998877',
    alumniAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    baustId: '1501018',
    department: 'EEE',
    batch: '2nd Batch',
    passingYear: 2019,
    cgpa: 3.72,
    services: [
      {
        serviceId: 'srv-original-degree',
        serviceName: 'Original Certificate / Degree Copy',
        copies: 1,
        feePerCopy: 1500,
        purpose: 'Government Job',
        urgency: 'Normal'
      }
    ],
    uploadedDocuments: [
      {
        id: 'doc-4',
        name: 'Provisional_Cert_Original_Surrender.pdf',
        size: '2.1 MB',
        type: 'application/pdf',
        url: 'https://example.com/docs/prov.pdf',
        uploadedAt: '2026-11-04 02:00 PM',
        category: 'Supporting Doc'
      }
    ],
    delivery: {
      method: 'Campus Pickup',
      pickupDate: '2026-11-20',
      pickupTimeSlot: '11:00 AM - 01:00 PM (Exam Controller Counter)'
    },
    payment: {
      method: 'Bank Deposit',
      transactionId: 'TRUST-BNK-774120',
      subtotal: 2500,
      urgencyFee: 0,
      courierFee: 0,
      totalAmount: 2500,
      isVerified: true,
      paidAt: '2026-11-04 02:10 PM'
    },
    status: 'Processing',
    urgency: 'Normal',
    submittedAt: '2026-11-04 02:15 PM',
    estimatedDelivery: '2026-11-19',
    assignedStaffId: 'stf-1',
    assignedStaffName: 'Prof. Dr. Exam Controller Office',
    adminRemarks: 'Original parchment paper printed with Vice Chancellor signature. Awaiting final embossing stamp.',
    checklist: {
      baustIdMatches: true,
      academicRecordFound: true,
      paymentVerified: true,
      documentsValid: true
    },
    timeline: [
      { step: 'Request Submitted & Order Placed', timestamp: 'Nov 04, 2026 02:15 PM', completed: true },
      { step: 'Payment Verified by Finance Office', timestamp: 'Nov 05, 2026 10:00 AM', completed: true },
      { step: 'Academic Verification & Controller Review', timestamp: 'Nov 06, 2026 03:30 PM', completed: true },
      { step: 'Official Printing & Hologram Seal Affixed', timestamp: 'In Progress', completed: false, isCurrent: true },
      { step: 'Ready for Dispatch / Collection', timestamp: 'Pending', completed: false },
      { step: 'Delivered / Handed Over', timestamp: 'Pending', completed: false }
    ],
    messages: [],
    auditLog: [
      { id: 'aud-5', action: 'STATUS_CHANGE', performedBy: 'Exam Controller', timestamp: '2026-11-06 03:30 PM', details: 'Moved to PROCESSING state' }
    ]
  },
  {
    id: 'BCB-2026-000104',
    alumniId: 'alm-4',
    alumniName: 'Sifat E Noor',
    alumniEmail: 'sifat.noor@tum.de',
    alumniPhone: '+49 152 4433221',
    alumniAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    baustId: '1503011',
    department: 'ME',
    batch: '1st Batch',
    passingYear: 2019,
    cgpa: 3.91,
    services: [
      {
        serviceId: 'srv-verification',
        serviceName: 'Credential / Transcript Verification Letter',
        copies: 1,
        feePerCopy: 750,
        purpose: 'Immigration',
        urgency: 'Express',
        verificationRecipient: {
          name: 'World Education Services (WES) Canada',
          organization: 'WES Verification Office',
          email: 'submit@wes.org',
          address: 'WES Reference # 5621490/fs, 2 Carlton Street, Suite 1400, Toronto, ON M5B 1J3'
        }
      }
    ],
    uploadedDocuments: [
      {
        id: 'doc-5',
        name: 'WES_Academic_Request_Form_Signed.pdf',
        size: '950 KB',
        type: 'application/pdf',
        url: 'https://example.com/docs/wes.pdf',
        uploadedAt: '2026-11-06 08:30 PM',
        category: 'Supporting Doc'
      }
    ],
    delivery: {
      method: 'Direct to Institution',
      recipientEmail: 'submit@wes.org',
      institutionAddress: 'World Education Services Canada, Ref # 5621490'
    },
    payment: {
      method: 'Card',
      transactionId: 'VISA-INT-990812',
      subtotal: 1500,
      urgencyFee: 1500,
      courierFee: 0,
      totalAmount: 3000,
      isVerified: true,
      paidAt: '2026-11-06 08:35 PM'
    },
    status: 'Approved',
    urgency: 'Express',
    submittedAt: '2026-11-06 08:35 PM',
    estimatedDelivery: '2026-11-09',
    assignedStaffId: 'stf-2',
    assignedStaffName: 'Engr. Md. Jahidul Islam (Assistant Controller)',
    adminRemarks: 'WES verification package verified against B.Sc. in ME records. Institutional electronic upload scheduled.',
    checklist: {
      baustIdMatches: true,
      academicRecordFound: true,
      paymentVerified: true,
      documentsValid: true
    },
    timeline: [
      { step: 'Request Submitted & Order Placed', timestamp: 'Nov 06, 2026 08:35 PM', completed: true },
      { step: 'Payment Verified by Finance Office', timestamp: 'Nov 07, 2026 09:15 AM', completed: true },
      { step: 'Academic Verification & Controller Review', timestamp: 'Nov 07, 2026 02:00 PM', completed: true },
      { step: 'Official Printing & Hologram Seal Affixed', timestamp: 'Pending', completed: false, isCurrent: true },
      { step: 'Ready for Dispatch / Collection', timestamp: 'Pending', completed: false },
      { step: 'Delivered / Handed Over', timestamp: 'Pending', completed: false }
    ],
    messages: [
      {
        id: 'msg-3',
        senderRole: 'alumni',
        senderName: 'Sifat E Noor',
        text: 'Please include the WES reference number 5621490 on the subject line of the verification email.',
        timestamp: 'Nov 06, 2026 09:00 PM'
      }
    ],
    auditLog: [
      { id: 'aud-6', action: 'APPROVED', performedBy: 'Engr. Md. Jahidul Islam', timestamp: '2026-11-07 02:00 PM', details: 'Direct dispatch approved' }
    ]
  },
  {
    id: 'BCB-2026-000105',
    alumniId: 'alm-5',
    alumniName: 'Abrar Shahriar',
    alumniEmail: 'abrar@optimizely.com',
    alumniPhone: '+880 1718-223344',
    alumniAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    baustId: '1502021',
    department: 'CSE',
    batch: '2nd Batch',
    passingYear: 2019,
    cgpa: 3.82,
    services: [
      {
        serviceId: 'srv-duplicate-doc',
        serviceName: 'Duplicate Certificate / ID Card Replacement',
        copies: 1,
        feePerCopy: 1000,
        purpose: 'Personal Record',
        urgency: 'Normal'
      }
    ],
    uploadedDocuments: [
      {
        id: 'doc-6',
        name: 'Police_GD_Report_Lost_Certificate.jpg',
        size: '1.8 MB',
        type: 'image/jpeg',
        url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&auto=format&fit=crop&q=80',
        uploadedAt: '2026-11-07 10:00 AM',
        category: 'GD Copy'
      }
    ],
    delivery: {
      method: 'Campus Pickup',
      pickupDate: '2026-11-25'
    },
    payment: {
      method: 'bKash',
      transactionId: 'BK9Q88219L',
      subtotal: 2000,
      urgencyFee: 0,
      courierFee: 0,
      totalAmount: 2000,
      isVerified: true,
      paidAt: '2026-11-07 10:05 AM'
    },
    status: 'Action Required',
    urgency: 'Normal',
    submittedAt: '2026-11-07 10:05 AM',
    estimatedDelivery: '2026-11-21',
    assignedStaffId: 'stf-3',
    assignedStaffName: 'Md. Tariqul Islam (Administrative Officer)',
    actionRequiredReason: 'Missing Newspaper Advertisement Clipping. As per BAUST statutory replacement policy, a lost certificate notice must be published in a National Daily newspaper.',
    adminRemarks: 'Please upload the scanned newspaper clipping containing the certificate loss declaration.',
    checklist: {
      baustIdMatches: true,
      academicRecordFound: true,
      paymentVerified: true,
      documentsValid: false
    },
    timeline: [
      { step: 'Request Submitted & Order Placed', timestamp: 'Nov 07, 2026 10:05 AM', completed: true },
      { step: 'Payment Verified by Finance Office', timestamp: 'Nov 07, 2026 01:00 PM', completed: true },
      { step: 'Action Required: Missing Newspaper Ad Clipping', timestamp: 'Nov 08, 2026 11:30 AM', completed: false, isCurrent: true, remarks: 'Newspaper clipping missing' }
    ],
    messages: [
      {
        id: 'msg-4',
        senderRole: 'admin',
        senderName: 'Md. Tariqul Islam',
        text: 'Dear Abrar, thank you for submitting the Police GD. However, University Syndicate regulations mandate an original newspaper advertisement scan for duplicate degree issuance. Please upload it via the Re-upload button below.',
        timestamp: 'Nov 08, 2026 11:30 AM'
      }
    ],
    auditLog: [
      { id: 'aud-7', action: 'ACTION_REQUIRED', performedBy: 'Md. Tariqul Islam', timestamp: '2026-11-08 11:30 AM', details: 'Requested missing newspaper ad clipping' }
    ]
  },
  {
    id: 'BCB-2026-000106',
    alumniId: 'alm-6',
    alumniName: 'Nusrat Jahan',
    alumniEmail: 'nusrat.ce@walton.com.bd',
    alumniPhone: '+880 1716-443322',
    alumniAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    baustId: '1504012',
    department: 'CE',
    batch: '1st Batch',
    passingYear: 2019,
    cgpa: 3.76,
    services: [
      {
        serviceId: 'srv-transcript',
        serviceName: 'Academic Transcript (Official, Sealed)',
        copies: 1,
        feePerCopy: 400,
        purpose: 'Government Job',
        urgency: 'Normal'
      }
    ],
    uploadedDocuments: [],
    delivery: {
      method: 'Campus Pickup',
      pickupDate: '2026-11-15'
    },
    payment: {
      method: 'Nagad',
      transactionId: 'TXN-INVALID-99',
      subtotal: 800,
      urgencyFee: 0,
      courierFee: 0,
      totalAmount: 800,
      isVerified: false,
      paidAt: '2026-11-07 04:00 PM'
    },
    status: 'Rejected',
    urgency: 'Normal',
    submittedAt: '2026-11-07 04:00 PM',
    estimatedDelivery: '2026-11-14',
    rejectionReason: 'Payment not verified',
    rejectionMessage: 'Transaction ID TXN-INVALID-99 was not found in the university bank portal. Please verify with your Nagad account and re-apply with the correct transaction reference.',
    checklist: {
      baustIdMatches: true,
      academicRecordFound: true,
      paymentVerified: false,
      documentsValid: false
    },
    timeline: [
      { step: 'Request Submitted & Order Placed', timestamp: 'Nov 07, 2026 04:00 PM', completed: true },
      { step: 'Payment Verification Failed / Rejected', timestamp: 'Nov 08, 2026 09:45 AM', completed: false, isCurrent: true, remarks: 'Nagad transaction not reconciled' }
    ],
    messages: [
      {
        id: 'msg-5',
        senderRole: 'admin',
        senderName: 'Accounts Officer',
        text: 'The payment transaction ID provided does not match any entry in the university account for Nov 07. Please double-check your receipt and click Re-apply.',
        timestamp: 'Nov 08, 2026 09:45 AM'
      }
    ],
    auditLog: [
      { id: 'aud-8', action: 'REJECTED', performedBy: 'Accounts Officer', timestamp: '2026-11-08 09:45 AM', details: 'Rejected due to invalid transaction ID' }
    ]
  },
  {
    id: 'BCB-2026-000107',
    alumniId: 'alm-7',
    alumniName: 'Sabbir Ahmed Khan',
    alumniEmail: 'sabbir.khan@beximcopharma.com',
    alumniPhone: '+880 1717-556677',
    alumniAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    baustId: '1505016',
    department: 'IPE',
    batch: '2nd Batch',
    passingYear: 2019,
    cgpa: 3.65,
    services: [
      {
        serviceId: 'srv-recommendation',
        serviceName: 'Recommendation Letter (Faculty Endorsed)',
        copies: 1,
        feePerCopy: 250,
        purpose: 'Higher Studies Abroad',
        urgency: 'Normal',
        teacherName: 'Dr. Md. Rafiqul Islam (Professor, IPE)'
      }
    ],
    uploadedDocuments: [
      {
        id: 'doc-7',
        name: 'Sabbir_Ahmed_CV_2026.pdf',
        size: '620 KB',
        type: 'application/pdf',
        url: 'https://example.com/docs/cv.pdf',
        uploadedAt: '2026-11-08 11:00 AM',
        category: 'Supporting Doc'
      }
    ],
    delivery: {
      method: 'Email Soft Copy / PDF',
      recipientEmail: 'sabbir.khan@beximcopharma.com'
    },
    payment: {
      method: 'bKash',
      transactionId: 'BK9T771092',
      subtotal: 500,
      urgencyFee: 0,
      courierFee: 0,
      totalAmount: 500,
      isVerified: true,
      paidAt: '2026-11-08 11:05 AM'
    },
    status: 'Under Review',
    urgency: 'Normal',
    submittedAt: '2026-11-08 11:05 AM',
    estimatedDelivery: '2026-11-15',
    assignedStaffId: 'stf-2',
    assignedStaffName: 'Engr. Md. Jahidul Islam',
    adminRemarks: 'Forwarded to Dr. Md. Rafiqul Islam for faculty review and signature.',
    checklist: {
      baustIdMatches: true,
      academicRecordFound: true,
      paymentVerified: true,
      documentsValid: true
    },
    timeline: [
      { step: 'Request Submitted & Order Placed', timestamp: 'Nov 08, 2026 11:05 AM', completed: true },
      { step: 'Payment Verified by Finance Office', timestamp: 'Nov 08, 2026 02:00 PM', completed: true },
      { step: 'Academic Verification & Controller Review', timestamp: 'Nov 08, 2026 04:30 PM', completed: true, isCurrent: true }
    ],
    messages: [],
    auditLog: [
      { id: 'aud-9', action: 'STATUS_CHANGE', performedBy: 'Accounts Office', timestamp: '2026-11-08 02:00 PM', details: 'Payment BDT 500 verified' }
    ]
  },
  {
    id: 'BCB-2026-000108',
    alumniId: 'alm-8',
    alumniName: 'Tanzina Sultana',
    alumniEmail: 'tanzina.bba@bracbank.com',
    alumniPhone: '+880 1719-887766',
    alumniAvatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80',
    baustId: '1606015',
    department: 'BBA',
    batch: '3rd Batch',
    passingYear: 2020,
    cgpa: 3.86,
    services: [
      {
        serviceId: 'srv-transcript',
        serviceName: 'Academic Transcript (Official, Sealed)',
        copies: 1,
        feePerCopy: 400,
        purpose: 'Private Job Application',
        urgency: 'Normal'
      }
    ],
    uploadedDocuments: [],
    delivery: {
      method: 'Campus Pickup',
      pickupDate: '2026-11-14'
    },
    payment: {
      method: 'bKash',
      transactionId: 'BK9P112233',
      subtotal: 800,
      urgencyFee: 0,
      courierFee: 0,
      totalAmount: 800,
      isVerified: true,
      paidAt: '2026-11-08 01:20 PM'
    },
    status: 'Payment Verified',
    urgency: 'Normal',
    submittedAt: '2026-11-08 01:20 PM',
    estimatedDelivery: '2026-11-15',
    checklist: {
      baustIdMatches: true,
      academicRecordFound: true,
      paymentVerified: true,
      documentsValid: true
    },
    timeline: [
      { step: 'Request Submitted & Order Placed', timestamp: 'Nov 08, 2026 01:20 PM', completed: true },
      { step: 'Payment Verified by Finance Office', timestamp: 'Nov 08, 2026 03:00 PM', completed: true, isCurrent: true }
    ],
    messages: [],
    auditLog: [
      { id: 'aud-10', action: 'STATUS_CHANGE', performedBy: 'Accounts Office', timestamp: '2026-11-08 03:00 PM', details: 'Payment Verified' }
    ]
  },
  {
    id: 'BCB-2026-000109',
    alumniId: 'alm-9',
    alumniName: 'Zahidul Islam Rony',
    alumniEmail: 'rony.textile@squaregroup.com',
    alumniPhone: '+880 1711-223344',
    alumniAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    baustId: '1607012',
    department: 'Textile',
    batch: '2nd Batch',
    passingYear: 2020,
    cgpa: 3.58,
    services: [
      {
        serviceId: 'srv-testimonial',
        serviceName: 'Academic Testimonial & Character Certificate',
        copies: 1,
        feePerCopy: 200,
        purpose: 'Private Job Application',
        urgency: 'Normal'
      }
    ],
    uploadedDocuments: [],
    delivery: {
      method: 'Email Soft Copy / PDF',
      recipientEmail: 'rony.textile@squaregroup.com'
    },
    payment: {
      method: 'bKash',
      transactionId: 'BK9L881920',
      subtotal: 400,
      urgencyFee: 0,
      courierFee: 0,
      totalAmount: 400,
      isVerified: false,
      paidAt: '2026-11-08 04:30 PM'
    },
    status: 'Submitted',
    urgency: 'Normal',
    submittedAt: '2026-11-08 04:30 PM',
    estimatedDelivery: '2026-11-13',
    checklist: {
      baustIdMatches: true,
      academicRecordFound: false,
      paymentVerified: false,
      documentsValid: false
    },
    timeline: [
      { step: 'Request Submitted & Order Placed', timestamp: 'Nov 08, 2026 04:30 PM', completed: true, isCurrent: true }
    ],
    messages: [],
    auditLog: [
      { id: 'aud-11', action: 'CREATED', performedBy: 'Zahidul Islam Rony', timestamp: '2026-11-08 04:30 PM', details: 'Order submitted' }
    ]
  },
  {
    id: 'BCB-2026-000110',
    alumniId: 'alm-10',
    alumniName: 'Mahfuzur Rahman',
    alumniEmail: 'mahfuz@banglalink.net',
    alumniPhone: '+880 1714-332211',
    alumniAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    baustId: '1501025',
    department: 'EEE',
    batch: '1st Batch',
    passingYear: 2019,
    cgpa: 3.69,
    services: [
      {
        serviceId: 'srv-provisional-cert',
        serviceName: 'Provisional Certificate',
        copies: 1,
        feePerCopy: 500,
        purpose: 'Personal Record',
        urgency: 'Normal'
      }
    ],
    uploadedDocuments: [],
    delivery: {
      method: 'Campus Pickup',
      pickupDate: '2026-11-05'
    },
    payment: {
      method: 'Nagad',
      transactionId: 'NGD551299',
      subtotal: 1000,
      urgencyFee: 0,
      courierFee: 0,
      totalAmount: 1000,
      isVerified: false,
      paidAt: '2026-11-02 02:00 PM'
    },
    status: 'Cancelled',
    urgency: 'Normal',
    submittedAt: '2026-11-02 02:00 PM',
    estimatedDelivery: '2026-11-12',
    adminRemarks: 'Cancelled by applicant due to duplicate submission.',
    checklist: {
      baustIdMatches: true,
      academicRecordFound: true,
      paymentVerified: false,
      documentsValid: false
    },
    timeline: [
      { step: 'Request Submitted', timestamp: 'Nov 02, 2026 02:00 PM', completed: true },
      { step: 'Request Cancelled by Applicant', timestamp: 'Nov 03, 2026 10:00 AM', completed: false, isCurrent: true }
    ],
    messages: [],
    auditLog: [
      { id: 'aud-12', action: 'CANCELLED', performedBy: 'Mahfuzur Rahman', timestamp: '2026-11-03 10:00 AM', details: 'Cancelled by applicant' }
    ]
  },
  // Additional 15 requests to reach 25+ requests across all statuses
  {
    id: 'BCB-2026-000111',
    alumniId: 'alm-11',
    alumniName: 'Syeda Nafisa Tabassum',
    alumniEmail: 'nafisa.tabassum@utoronto.ca',
    alumniPhone: '+1 416 990 1234',
    alumniAvatar: 'https://images.unsplash.com/photo-1534751516642-a1714f5a5fe4?w=400&auto=format&fit=crop&q=80',
    baustId: '1508011',
    department: 'English',
    batch: '1st Batch',
    passingYear: 2019,
    cgpa: 3.92,
    services: [
      {
        serviceId: 'srv-transcript',
        serviceName: 'Academic Transcript (Official, Sealed)',
        copies: 3,
        feePerCopy: 400,
        purpose: 'Higher Studies Abroad',
        urgency: 'Express'
      }
    ],
    uploadedDocuments: [],
    delivery: {
      method: 'Direct to Institution',
      recipientEmail: 'admissions.grad@utoronto.ca',
      institutionAddress: 'University of Toronto School of Graduate Studies'
    },
    payment: {
      method: 'Card',
      transactionId: 'CARD-INT-44120',
      subtotal: 2000,
      urgencyFee: 1000,
      courierFee: 0,
      totalAmount: 3000,
      isVerified: true,
      paidAt: '2026-10-25 09:00 AM'
    },
    status: 'Delivered',
    urgency: 'Express',
    submittedAt: '2026-10-25 09:00 AM',
    estimatedDelivery: '2026-10-28',
    assignedStaffId: 'stf-2',
    assignedStaffName: 'Engr. Md. Jahidul Islam',
    adminRemarks: 'Transcript sent via secure university electronic exchange to U of Toronto graduate portal.',
    checklist: { baustIdMatches: true, academicRecordFound: true, paymentVerified: true, documentsValid: true },
    timeline: [
      { step: 'Request Submitted', timestamp: 'Oct 25 09:00 AM', completed: true },
      { step: 'Payment Verified', timestamp: 'Oct 25 10:00 AM', completed: true },
      { step: 'Academic Verification', timestamp: 'Oct 25 02:00 PM', completed: true },
      { step: 'Printed & Sealed', timestamp: 'Oct 26 11:00 AM', completed: true },
      { step: 'Ready', timestamp: 'Oct 26 03:00 PM', completed: true },
      { step: 'Delivered', timestamp: 'Oct 26 04:30 PM', completed: true }
    ],
    messages: [],
    finalDeliverable: {
      documentNumber: 'BAUST/EXAM/TR/2026/0398',
      title: 'Official Academic Transcript',
      issuedDate: '2026-10-26',
      qrCodeUrl: 'https://bcb.baust.edu.bd/verify-document?id=BCB-2026-000111',
      fileUrl: 'https://example.com/transcripts/BCB-2026-000111.pdf',
      watermark: 'DIGITAL STUDENT COPY',
      digitalSignature: 'MD. JAHIDUL ISLAM',
      signatoryTitle: 'Assistant Controller of Examinations'
    },
    rating: { score: 5, comment: 'Flawless service, Toronto confirmed receipt the same afternoon!', ratedAt: '2026-10-27' },
    auditLog: []
  },
  {
    id: 'BCB-2026-000112',
    alumniId: 'alm-12',
    alumniName: 'Imtiaz Ahmed Shuvo',
    alumniEmail: 'imtiaz.shuvo@gmail.com',
    alumniPhone: '+880 1718-990011',
    alumniAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    baustId: '1602035',
    department: 'CSE',
    batch: '4th Batch',
    passingYear: 2020,
    cgpa: 3.42,
    services: [
      {
        serviceId: 'srv-character-cert',
        serviceName: 'Character Certificate (Registrar Office)',
        copies: 1,
        feePerCopy: 200,
        purpose: 'Immigration',
        urgency: 'Normal'
      }
    ],
    uploadedDocuments: [],
    delivery: { method: 'Email Soft Copy / PDF', recipientEmail: 'imtiaz.shuvo@gmail.com' },
    payment: { method: 'bKash', transactionId: 'BK9012948', subtotal: 400, urgencyFee: 0, courierFee: 0, totalAmount: 400, isVerified: true, paidAt: '2026-11-03' },
    status: 'Ready',
    urgency: 'Normal',
    submittedAt: '2026-11-03',
    estimatedDelivery: '2026-11-08',
    checklist: { baustIdMatches: true, academicRecordFound: true, paymentVerified: true, documentsValid: true },
    timeline: [
      { step: 'Request Submitted', timestamp: 'Nov 03', completed: true },
      { step: 'Payment Verified', timestamp: 'Nov 04', completed: true },
      { step: 'Review & Approval', timestamp: 'Nov 05', completed: true },
      { step: 'Ready', timestamp: 'Nov 07', completed: true }
    ],
    messages: [],
    finalDeliverable: {
      documentNumber: 'BAUST/REG/CHAR/2026/0091',
      title: 'Character Certificate',
      issuedDate: '2026-11-07',
      qrCodeUrl: 'https://bcb.baust.edu.bd/verify-document?id=BCB-2026-000112',
      fileUrl: 'https://example.com/docs/BCB-2026-000112.pdf',
      watermark: 'DIGITAL OFFICIAL COPY',
      digitalSignature: 'REGISTRAR, BAUST',
      signatoryTitle: 'Registrar'
    },
    auditLog: []
  },
  {
    id: 'BCB-2026-000113',
    alumniId: 'alm-13',
    alumniName: 'Capt. Tariq Al Hasan',
    alumniEmail: 'tariq.hasan@army.mil.bd',
    alumniPhone: '+880 1711-001122',
    alumniAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    baustId: '1502041',
    department: 'CSE',
    batch: '1st Batch',
    passingYear: 2019,
    cgpa: 3.84,
    services: [
      { serviceId: 'srv-syllabus-outline', serviceName: 'Detailed Syllabus / Course Outline Copy', copies: 1, feePerCopy: 600, purpose: 'Government Job', urgency: 'Normal' }
    ],
    uploadedDocuments: [],
    delivery: { method: 'Campus Pickup', pickupDate: '2026-11-18' },
    payment: { method: 'bKash', transactionId: 'BK9900112', subtotal: 1200, urgencyFee: 0, courierFee: 0, totalAmount: 1200, isVerified: true, paidAt: '2026-11-05' },
    status: 'Processing',
    urgency: 'Normal',
    submittedAt: '2026-11-05',
    estimatedDelivery: '2026-11-15',
    checklist: { baustIdMatches: true, academicRecordFound: true, paymentVerified: true, documentsValid: true },
    timeline: [
      { step: 'Submitted', timestamp: 'Nov 05', completed: true },
      { step: 'Verified', timestamp: 'Nov 06', completed: true },
      { step: 'Processing', timestamp: 'Nov 07', completed: false, isCurrent: true }
    ],
    messages: [],
    auditLog: []
  },
  {
    id: 'BCB-2026-000114',
    alumniId: 'alm-14',
    alumniName: 'Farzana Haque Mim',
    alumniEmail: 'farzana.mim@tigerit.com',
    alumniPhone: '+880 1715-445566',
    alumniAvatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80',
    baustId: '1702018',
    department: 'CSE',
    batch: '5th Batch',
    passingYear: 2021,
    cgpa: 3.79,
    services: [
      { serviceId: 'srv-transcript', serviceName: 'Academic Transcript (Official, Sealed)', copies: 1, feePerCopy: 400, purpose: 'Private Job Application', urgency: 'Normal' }
    ],
    uploadedDocuments: [],
    delivery: { method: 'Courier (Home Delivery)', courierAddress: 'Banani DOHS, Dhaka', courierFee: 120 },
    payment: { method: 'Nagad', transactionId: 'NGD991044', subtotal: 800, urgencyFee: 0, courierFee: 120, totalAmount: 920, isVerified: true, paidAt: '2026-11-06' },
    status: 'Approved',
    urgency: 'Normal',
    submittedAt: '2026-11-06',
    estimatedDelivery: '2026-11-13',
    checklist: { baustIdMatches: true, academicRecordFound: true, paymentVerified: true, documentsValid: true },
    timeline: [
      { step: 'Submitted', timestamp: 'Nov 06', completed: true },
      { step: 'Payment Verified', timestamp: 'Nov 07', completed: true },
      { step: 'Approved', timestamp: 'Nov 08', completed: true, isCurrent: true }
    ],
    messages: [],
    auditLog: []
  },
  {
    id: 'BCB-2026-000115',
    alumniId: 'alm-15',
    alumniName: 'Ashikur Rahman Chowdhury',
    alumniEmail: 'ashik.chowdhury@grameenphone.com',
    alumniPhone: '+880 1716-112233',
    alumniAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    baustId: '1601019',
    department: 'EEE',
    batch: '3rd Batch',
    passingYear: 2020,
    cgpa: 3.71,
    services: [
      { serviceId: 'srv-migration-cert', serviceName: 'Migration Certificate', copies: 1, feePerCopy: 350, purpose: 'Higher Studies Abroad', urgency: 'Normal' }
    ],
    uploadedDocuments: [],
    delivery: { method: 'Campus Pickup', pickupDate: '2026-11-16' },
    payment: { method: 'bKash', transactionId: 'BK9120491', subtotal: 700, urgencyFee: 0, courierFee: 0, totalAmount: 700, isVerified: true, paidAt: '2026-11-08' },
    status: 'Under Review',
    urgency: 'Normal',
    submittedAt: '2026-11-08',
    estimatedDelivery: '2026-11-15',
    checklist: { baustIdMatches: true, academicRecordFound: true, paymentVerified: true, documentsValid: true },
    timeline: [
      { step: 'Submitted', timestamp: 'Nov 08 09:00 AM', completed: true },
      { step: 'Payment Verified', timestamp: 'Nov 08 11:30 AM', completed: true },
      { step: 'Under Review', timestamp: 'Nov 08 03:00 PM', completed: true, isCurrent: true }
    ],
    messages: [],
    auditLog: []
  },
  {
    id: 'BCB-2026-000116',
    alumniId: 'alm-16',
    alumniName: 'Rashidul Hasan Shanto',
    alumniEmail: 'rashidul.shanto@kaust.edu.sa',
    alumniPhone: '+966 50 123 4567',
    alumniAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    baustId: '1603014',
    department: 'ME',
    batch: '2nd Batch',
    passingYear: 2020,
    cgpa: 3.93,
    services: [
      { serviceId: 'srv-moi', serviceName: 'Medium of Instruction (MOI) Certificate', copies: 2, feePerCopy: 300, purpose: 'Higher Studies Abroad', urgency: 'Urgent' }
    ],
    uploadedDocuments: [],
    delivery: { method: 'Email Soft Copy / PDF', recipientEmail: 'rashidul.shanto@kaust.edu.sa' },
    payment: { method: 'Card', transactionId: 'STC-PAY-8812', subtotal: 900, urgencyFee: 400, courierFee: 0, totalAmount: 1300, isVerified: true, paidAt: '2026-10-20' },
    status: 'Delivered',
    urgency: 'Urgent',
    submittedAt: '2026-10-20',
    estimatedDelivery: '2026-10-23',
    checklist: { baustIdMatches: true, academicRecordFound: true, paymentVerified: true, documentsValid: true },
    timeline: [
      { step: 'Submitted', timestamp: 'Oct 20', completed: true },
      { step: 'Payment Verified', timestamp: 'Oct 20', completed: true },
      { step: 'Delivered', timestamp: 'Oct 22', completed: true }
    ],
    messages: [],
    finalDeliverable: {
      documentNumber: 'BAUST/REG/MOI/2026/0164',
      title: 'MOI Certificate',
      issuedDate: '2026-10-22',
      qrCodeUrl: 'https://bcb.baust.edu.bd/verify-document?id=BCB-2026-000116',
      fileUrl: 'https://example.com/docs/BCB-2026-000116.pdf',
      watermark: 'DIGITAL OFFICIAL COPY',
      digitalSignature: 'REGISTRAR, BAUST',
      signatoryTitle: 'Registrar'
    },
    rating: { score: 5, comment: 'Super fast delivery to Saudi Arabia time zone.', ratedAt: '2026-10-23' },
    auditLog: []
  },
  {
    id: 'BCB-2026-000117',
    alumniId: 'alm-17',
    alumniName: 'Sayem Al Mamun',
    alumniEmail: 'sayem.mamun@customs.gov.bd',
    alumniPhone: '+880 1713-994488',
    alumniAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    baustId: '1602055',
    department: 'CSE',
    batch: '3rd Batch',
    passingYear: 2020,
    cgpa: 3.68,
    services: [
      { serviceId: 'srv-testimonial', serviceName: 'Academic Testimonial & Character Certificate', copies: 2, feePerCopy: 200, purpose: 'Government Job', urgency: 'Normal' }
    ],
    uploadedDocuments: [],
    delivery: { method: 'Campus Pickup', pickupDate: '2026-11-10' },
    payment: { method: 'bKash', transactionId: 'BK9129481', subtotal: 600, urgencyFee: 0, courierFee: 0, totalAmount: 600, isVerified: true, paidAt: '2026-11-04' },
    status: 'Ready',
    urgency: 'Normal',
    submittedAt: '2026-11-04',
    estimatedDelivery: '2026-11-09',
    checklist: { baustIdMatches: true, academicRecordFound: true, paymentVerified: true, documentsValid: true },
    timeline: [
      { step: 'Submitted', timestamp: 'Nov 04', completed: true },
      { step: 'Payment Verified', timestamp: 'Nov 05', completed: true },
      { step: 'Ready for Pickup', timestamp: 'Nov 08', completed: true }
    ],
    messages: [],
    finalDeliverable: {
      documentNumber: 'BAUST/TEST/2026/0512',
      title: 'Academic Testimonial',
      issuedDate: '2026-11-08',
      qrCodeUrl: 'https://bcb.baust.edu.bd/verify-document?id=BCB-2026-000117',
      fileUrl: 'https://example.com/docs/BCB-2026-000117.pdf',
      watermark: 'DIGITAL OFFICIAL COPY',
      digitalSignature: 'HEAD OF CSE, BAUST',
      signatoryTitle: 'Head of CSE Department'
    },
    auditLog: []
  },
  {
    id: 'BCB-2026-000118',
    alumniId: 'alm-18',
    alumniName: 'Monirul Islam Shakil',
    alumniEmail: 'monirul.shakil@enosisbd.com',
    alumniPhone: '+880 1719-776655',
    alumniAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    baustId: '1702029',
    department: 'CSE',
    batch: '6th Batch',
    passingYear: 2021,
    cgpa: 3.75,
    services: [
      { serviceId: 'srv-transcript', serviceName: 'Academic Transcript (Official, Sealed)', copies: 1, feePerCopy: 400, purpose: 'Private Job Application', urgency: 'Normal' }
    ],
    uploadedDocuments: [],
    delivery: { method: 'Courier (Home Delivery)', courierAddress: 'Mirpur DOHS, Dhaka', courierFee: 120 },
    payment: { method: 'Nagad', transactionId: 'NGD884192', subtotal: 800, urgencyFee: 0, courierFee: 120, totalAmount: 920, isVerified: true, paidAt: '2026-11-08' },
    status: 'Payment Verified',
    urgency: 'Normal',
    submittedAt: '2026-11-08',
    estimatedDelivery: '2026-11-15',
    checklist: { baustIdMatches: true, academicRecordFound: true, paymentVerified: true, documentsValid: true },
    timeline: [
      { step: 'Submitted', timestamp: 'Nov 08', completed: true },
      { step: 'Payment Verified', timestamp: 'Nov 08', completed: true, isCurrent: true }
    ],
    messages: [],
    auditLog: []
  },
  {
    id: 'BCB-2026-000119',
    alumniId: 'alm-19',
    alumniName: 'Rifat Bin Alam',
    alumniEmail: 'rifat.alam@anu.edu.au',
    alumniPhone: '+61 2 6125 1111',
    alumniAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    baustId: '1604018',
    department: 'CE',
    batch: '2nd Batch',
    passingYear: 2020,
    cgpa: 3.89,
    services: [
      { serviceId: 'srv-verification', serviceName: 'Credential / Transcript Verification Letter', copies: 1, feePerCopy: 750, purpose: 'Higher Studies Abroad', urgency: 'Urgent' }
    ],
    uploadedDocuments: [],
    delivery: { method: 'Email Soft Copy / PDF', recipientEmail: 'rifat.alam@anu.edu.au' },
    payment: { method: 'Card', transactionId: 'AUD-CARD-9921', subtotal: 1500, urgencyFee: 800, courierFee: 0, totalAmount: 2300, isVerified: true, paidAt: '2026-10-12' },
    status: 'Delivered',
    urgency: 'Urgent',
    submittedAt: '2026-10-12',
    estimatedDelivery: '2026-10-16',
    checklist: { baustIdMatches: true, academicRecordFound: true, paymentVerified: true, documentsValid: true },
    timeline: [
      { step: 'Submitted', timestamp: 'Oct 12', completed: true },
      { step: 'Delivered', timestamp: 'Oct 15', completed: true }
    ],
    messages: [],
    finalDeliverable: {
      documentNumber: 'BAUST/VERIF/2026/0119',
      title: 'Credential Verification Letter',
      issuedDate: '2026-10-15',
      qrCodeUrl: 'https://bcb.baust.edu.bd/verify-document?id=BCB-2026-000119',
      fileUrl: 'https://example.com/docs/BCB-2026-000119.pdf',
      watermark: 'DIGITAL OFFICIAL VERIFICATION',
      digitalSignature: 'CONTROLLER OF EXAMINATIONS, BAUST',
      signatoryTitle: 'Controller of Examinations'
    },
    rating: { score: 5, comment: 'ANU engineering faculty validated without any hassle.', ratedAt: '2026-10-16' },
    auditLog: []
  },
  {
    id: 'BCB-2026-000120',
    alumniId: 'alm-20',
    alumniName: 'Shamima Akter Rupa',
    alumniEmail: 'rupa.ipe@squaregroup.com',
    alumniPhone: '+880 1718-334455',
    alumniAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    baustId: '1605018',
    department: 'IPE',
    batch: '3rd Batch',
    passingYear: 2020,
    cgpa: 3.63,
    services: [
      { serviceId: 'srv-provisional-cert', serviceName: 'Provisional Certificate', copies: 1, feePerCopy: 500, purpose: 'Private Job Application', urgency: 'Normal' }
    ],
    uploadedDocuments: [],
    delivery: { method: 'Courier (Home Delivery)', courierAddress: 'Pabna BSCIC Industrial Area', courierFee: 150 },
    payment: { method: 'bKash', transactionId: 'BK9120482', subtotal: 1000, urgencyFee: 0, courierFee: 150, totalAmount: 1150, isVerified: true, paidAt: '2026-11-06' },
    status: 'Processing',
    urgency: 'Normal',
    submittedAt: '2026-11-06',
    estimatedDelivery: '2026-11-16',
    checklist: { baustIdMatches: true, academicRecordFound: true, paymentVerified: true, documentsValid: true },
    timeline: [
      { step: 'Submitted', timestamp: 'Nov 06', completed: true },
      { step: 'Payment Verified', timestamp: 'Nov 07', completed: true },
      { step: 'Processing', timestamp: 'Nov 08', completed: false, isCurrent: true }
    ],
    messages: [],
    auditLog: []
  },
  {
    id: 'BCB-2026-000121',
    alumniId: 'alm-21',
    alumniName: 'Tanvir Mahtab Shovon',
    alumniEmail: 'tanvir.shovon@dhl.com',
    alumniPhone: '+880 1719-001199',
    alumniAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    baustId: '1706019',
    department: 'BBA',
    batch: '4th Batch',
    passingYear: 2021,
    cgpa: 3.73,
    services: [
      { serviceId: 'srv-custom-other', serviceName: 'Other Official Document / Custom Request', copies: 1, feePerCopy: 250, purpose: 'Other', urgency: 'Normal' }
    ],
    uploadedDocuments: [],
    delivery: { method: 'Email Soft Copy / PDF', recipientEmail: 'tanvir.shovon@dhl.com' },
    payment: { method: 'bKash', transactionId: 'BK9001928', subtotal: 500, urgencyFee: 0, courierFee: 0, totalAmount: 500, isVerified: false, paidAt: '2026-11-08' },
    status: 'Submitted',
    urgency: 'Normal',
    submittedAt: '2026-11-08 05:00 PM',
    estimatedDelivery: '2026-11-15',
    checklist: { baustIdMatches: true, academicRecordFound: false, paymentVerified: false, documentsValid: false },
    timeline: [{ step: 'Submitted', timestamp: 'Nov 08 05:00 PM', completed: true, isCurrent: true }],
    messages: [],
    auditLog: []
  },
  {
    id: 'BCB-2026-000122',
    alumniId: 'alm-22',
    alumniName: 'Nayeemur Rahman',
    alumniEmail: 'nayeem.rahman@bcs-police.gov.bd',
    alumniPhone: '+880 1712-445588',
    alumniAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    baustId: '1502062',
    department: 'CSE',
    batch: '2nd Batch',
    passingYear: 2019,
    cgpa: 3.74,
    services: [
      { serviceId: 'srv-transcript', serviceName: 'Academic Transcript (Official, Sealed)', copies: 1, feePerCopy: 400, purpose: 'Government Job', urgency: 'Normal' }
    ],
    uploadedDocuments: [],
    delivery: { method: 'Campus Pickup', pickupDate: '2026-11-12' },
    payment: { method: 'bKash', transactionId: 'BK9182741', subtotal: 800, urgencyFee: 0, courierFee: 0, totalAmount: 800, isVerified: true, paidAt: '2026-11-04' },
    status: 'Approved',
    urgency: 'Normal',
    submittedAt: '2026-11-04',
    estimatedDelivery: '2026-11-11',
    checklist: { baustIdMatches: true, academicRecordFound: true, paymentVerified: true, documentsValid: true },
    timeline: [
      { step: 'Submitted', timestamp: 'Nov 04', completed: true },
      { step: 'Payment Verified', timestamp: 'Nov 05', completed: true },
      { step: 'Approved', timestamp: 'Nov 07', completed: true, isCurrent: true }
    ],
    messages: [],
    auditLog: []
  },
  {
    id: 'BCB-2026-000123',
    alumniId: 'alm-23',
    alumniName: 'Dr. Shahbaz Alam',
    alumniEmail: 'shahbaz.alam@nus.edu.sg',
    alumniPhone: '+65 8123 4567',
    alumniAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    baustId: '1501032',
    department: 'EEE',
    batch: '1st Batch',
    passingYear: 2019,
    cgpa: 3.96,
    services: [
      { serviceId: 'srv-moi', serviceName: 'Medium of Instruction (MOI) Certificate', copies: 1, feePerCopy: 300, purpose: 'Higher Studies Abroad', urgency: 'Normal' }
    ],
    uploadedDocuments: [],
    delivery: { method: 'Email Soft Copy / PDF', recipientEmail: 'shahbaz.alam@nus.edu.sg' },
    payment: { method: 'Card', transactionId: 'SGD-VISA-8812', subtotal: 600, urgencyFee: 0, courierFee: 0, totalAmount: 600, isVerified: true, paidAt: '2026-10-05' },
    status: 'Delivered',
    urgency: 'Normal',
    submittedAt: '2026-10-05',
    estimatedDelivery: '2026-10-10',
    checklist: { baustIdMatches: true, academicRecordFound: true, paymentVerified: true, documentsValid: true },
    timeline: [
      { step: 'Submitted', timestamp: 'Oct 05', completed: true },
      { step: 'Delivered', timestamp: 'Oct 09', completed: true }
    ],
    messages: [],
    finalDeliverable: {
      documentNumber: 'BAUST/REG/MOI/2026/0104',
      title: 'MOI Certificate',
      issuedDate: '2026-10-09',
      qrCodeUrl: 'https://bcb.baust.edu.bd/verify-document?id=BCB-2026-000123',
      fileUrl: 'https://example.com/docs/BCB-2026-000123.pdf',
      watermark: 'DIGITAL OFFICIAL COPY',
      digitalSignature: 'REGISTRAR, BAUST',
      signatoryTitle: 'Registrar'
    },
    rating: { score: 5, comment: 'Very professional, digital signature accepted by NUS Singapore.', ratedAt: '2026-10-10' },
    auditLog: []
  },
  {
    id: 'BCB-2026-000124',
    alumniId: 'alm-24',
    alumniName: 'Fariha Tasnim',
    alumniEmail: 'fariha.tasnim@waltonbd.com',
    alumniPhone: '+880 1714-889900',
    alumniAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    baustId: '1703017',
    department: 'ME',
    batch: '4th Batch',
    passingYear: 2021,
    cgpa: 3.77,
    services: [
      { serviceId: 'srv-transcript', serviceName: 'Academic Transcript (Official, Sealed)', copies: 1, feePerCopy: 400, purpose: 'Private Job Application', urgency: 'Normal' }
    ],
    uploadedDocuments: [],
    delivery: { method: 'Courier (Home Delivery)', courierAddress: 'Gazipur Walton Hi-Tech Complex', courierFee: 120 },
    payment: { method: 'bKash', transactionId: 'BK9128491', subtotal: 800, urgencyFee: 0, courierFee: 120, totalAmount: 920, isVerified: false, paidAt: '2026-11-07' },
    status: 'Rejected',
    urgency: 'Normal',
    submittedAt: '2026-11-07',
    estimatedDelivery: '2026-11-14',
    rejectionReason: 'Invalid documents',
    rejectionMessage: 'Incomplete clearance record in exam database. Please contact Saidpur campus accounts counter or re-apply.',
    checklist: { baustIdMatches: true, academicRecordFound: false, paymentVerified: false, documentsValid: false },
    timeline: [
      { step: 'Submitted', timestamp: 'Nov 07', completed: true },
      { step: 'Rejected', timestamp: 'Nov 08', completed: false, isCurrent: true, remarks: 'Clearance incomplete' }
    ],
    messages: [],
    auditLog: []
  },
  {
    id: 'BCB-2026-000125',
    alumniId: 'alm-25',
    alumniName: 'Sardar Tahmidur Rahman',
    alumniEmail: 'tahmid.sardar@dse.com.bd',
    alumniPhone: '+880 1715-667788',
    alumniAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    baustId: '1506014',
    department: 'BBA',
    batch: '1st Batch',
    passingYear: 2019,
    cgpa: 3.82,
    services: [
      { serviceId: 'srv-original-degree', serviceName: 'Original Certificate / Degree Copy', copies: 1, feePerCopy: 1500, purpose: 'Personal Record', urgency: 'Normal' }
    ],
    uploadedDocuments: [],
    delivery: { method: 'Campus Pickup', pickupDate: '2026-11-19' },
    payment: { method: 'Bank Deposit', transactionId: 'DBBL-991204', subtotal: 2500, urgencyFee: 0, courierFee: 0, totalAmount: 2500, isVerified: true, paidAt: '2026-11-06' },
    status: 'Action Required',
    urgency: 'Normal',
    submittedAt: '2026-11-06',
    estimatedDelivery: '2026-11-20',
    actionRequiredReason: 'Please upload a clearer scan of your Convocation registration clearance token.',
    checklist: { baustIdMatches: true, academicRecordFound: true, paymentVerified: true, documentsValid: false },
    timeline: [
      { step: 'Submitted', timestamp: 'Nov 06', completed: true },
      { step: 'Payment Verified', timestamp: 'Nov 07', completed: true },
      { step: 'Action Required: Clearer token needed', timestamp: 'Nov 08', completed: false, isCurrent: true }
    ],
    messages: [
      {
        id: 'msg-6',
        senderRole: 'admin',
        senderName: 'Controller Office',
        text: 'The uploaded convocation token scan is blurry. Please re-upload.',
        timestamp: 'Nov 08 01:00 PM'
      }
    ],
    auditLog: []
  }
];

export const mockServiceRequests = initialServiceRequests;
