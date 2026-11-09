/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  AdminDeskService, 
  AdminDeskRequest, 
  NoticeItem, 
  VacancyItem, 
  VacancyApplication, 
  StaffMember, 
  AdminDeskSettings, 
  SupportTicket,
  AdminDeskRequestStatus,
  FinalDeliverableDoc
} from '../types/admindesk';
import { initialServiceCatalog } from '../data/serviceCatalog';
import { initialServiceRequests } from '../data/serviceRequests';
import { initialNotices } from '../data/notices';
import { 
  initialVacancies, 
  initialVacancyApplications, 
  initialStaffMembers, 
  initialAdminDeskSettings 
} from '../data/vacancies';
import { useApp } from '../context/AppContext';

interface AdminDeskContextType {
  services: AdminDeskService[];
  requests: AdminDeskRequest[];
  notices: NoticeItem[];
  vacancies: VacancyItem[];
  applications: VacancyApplication[];
  staffMembers: StaffMember[];
  settings: AdminDeskSettings;
  supportTickets: SupportTicket[];

  // Request Actions
  submitRequest: (newReqData: Omit<AdminDeskRequest, 'id' | 'submittedAt' | 'timeline' | 'status' | 'auditLog' | 'messages' | 'checklist'>) => string;
  updateRequestStatus: (
    requestId: string, 
    status: AdminDeskRequestStatus, 
    staffName?: string, 
    remarks?: string, 
    courierDetails?: { courierName?: string; courierTrackingNumber?: string }
  ) => void;
  verifyPayment: (requestId: string, staffName?: string) => void;
  rejectRequest: (requestId: string, reason: AdminDeskRequest['rejectionReason'], message: string, staffName?: string) => void;
  requestMoreInfo: (requestId: string, reason: string, staffName?: string) => void;
  markReady: (requestId: string, staffName?: string, deliverable?: FinalDeliverableDoc) => void;
  markDelivered: (requestId: string, staffName?: string, courierName?: string, trackingNo?: string) => void;
  cancelRequest: (requestId: string) => void;
  rateRequest: (requestId: string, score: number, comment: string) => void;
  raiseRequestIssue: (requestId: string, topic: string, description: string) => void;
  sendMessageOnRequest: (requestId: string, senderRole: 'alumni' | 'admin', senderName: string, text: string, attachmentUrl?: string) => void;
  updateChecklist: (requestId: string, key: keyof AdminDeskRequest['checklist'], value: boolean) => void;
  assignStaff: (requestId: string, staffId: string, staffName: string) => void;
  reUploadMissingDoc: (requestId: string, doc: AdminDeskRequest['uploadedDocuments'][0]) => void;

  // Catalog Actions
  addService: (service: Omit<AdminDeskService, 'id'>) => void;
  updateService: (id: string, updates: Partial<AdminDeskService>) => void;
  deleteService: (id: string) => void;
  toggleServiceEnabled: (id: string) => void;

  // Notices Actions
  addNotice: (notice: Omit<NoticeItem, 'id' | 'publishedAt' | 'readCount'>) => void;
  updateNotice: (id: string, updates: Partial<NoticeItem>) => void;
  deleteNotice: (id: string) => void;
  toggleNoticePin: (id: string) => void;
  rsvpNotice: (id: string) => void;
  markAllNoticesRead: () => void;

  // Vacancy Actions
  addVacancy: (vac: Omit<VacancyItem, 'id' | 'publishedAt'>) => void;
  updateVacancy: (id: string, updates: Partial<VacancyItem>) => void;
  deleteVacancy: (id: string) => void;
  toggleVacancyStatus: (id: string) => void;
  toggleSaveVacancy: (id: string) => void;
  submitVacancyApplication: (appData: Omit<VacancyApplication, 'id' | 'appliedAt' | 'status'>) => void;
  updateApplicationStatus: (
    appId: string, 
    status: VacancyApplication['status'], 
    interviewDetails?: VacancyApplication['interviewDetails'], 
    adminNotes?: string
  ) => void;

  // Support & Settings
  submitSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>) => void;
  resolveSupportTicket: (id: string, reply: string) => void;
  updateSettings: (newSettings: Partial<AdminDeskSettings>) => void;
  resetToDefaults: () => void;
}

const STORAGE_KEYS = {
  SERVICES: 'baust_admindesk_services_v2',
  REQUESTS: 'baust_admindesk_requests_v2',
  NOTICES: 'baust_admindesk_notices_v2',
  VACANCIES: 'baust_admindesk_vacancies_v2',
  APPLICATIONS: 'baust_admindesk_applications_v2',
  SETTINGS: 'baust_admindesk_settings_v2',
  TICKETS: 'baust_admindesk_tickets_v2'
};

const initialSupportTickets: SupportTicket[] = [
  {
    id: 'TCK-101',
    alumniId: 'alm-1',
    alumniName: 'Kazi Farhan Kabir',
    alumniEmail: 'farhan.kabir@brainstation-23.com',
    subject: 'Urgent inquiry regarding WES electronic verification delivery',
    message: 'Could you confirm whether the transcript for WES was dispatched electronically or via postal courier?',
    category: 'Service Request Delay',
    priority: 'High',
    status: 'Resolved',
    createdAt: '2026-11-02 03:00 PM',
    reply: 'Your verification was uploaded directly to the WES institutional portal on Nov 03.'
  }
];

const AdminDeskContext = createContext<AdminDeskContextType | undefined>(undefined);

export const AdminDeskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { addToast } = useApp();

  // Helper to push notification into existing bell
  const pushNotificationToBell = (title: string, message: string, link: string, type: 'service' | 'announcement' | 'mentorship' = 'service') => {
    try {
      const existing = localStorage.getItem('baust_notifications');
      const list = existing ? JSON.parse(existing) : [];
      const newNotif = {
        id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title,
        message,
        timestamp: 'Just now',
        read: false,
        type,
        link
      };
      const updated = [newNotif, ...list];
      localStorage.setItem('baust_notifications', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.warn('Could not push notification to bell', e);
    }
  };

  // State 1: Services Catalog
  const [services, setServices] = useState<AdminDeskService[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SERVICES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 10) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return initialServiceCatalog;
  });

  // State 2: Service Requests
  const [requests, setRequests] = useState<AdminDeskRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 20) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return initialServiceRequests;
  });

  // State 3: Notices
  const [notices, setNotices] = useState<NoticeItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTICES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 8) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return initialNotices;
  });

  // State 4: Vacancies
  const [vacancies, setVacancies] = useState<VacancyItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VACANCIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 4) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return initialVacancies;
  });

  // State 5: Applications
  const [applications, setApplications] = useState<VacancyApplication[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 8) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return initialVacancyApplications;
  });

  // State 6: Staff Members
  const [staffMembers] = useState<StaffMember[]>(initialStaffMembers);

  // State 7: Settings
  const [settings, setSettings] = useState<AdminDeskSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : initialAdminDeskSettings;
    } catch {
      return initialAdminDeskSettings;
    }
  });

  // State 8: Support Tickets
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TICKETS);
      return saved ? JSON.parse(saved) : initialSupportTickets;
    } catch {
      return initialSupportTickets;
    }
  });

  // LocalStorage Sync
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VACANCIES, JSON.stringify(vacancies));
  }, [vacancies]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(supportTickets));
  }, [supportTickets]);

  // Request Handlers
  const submitRequest = (newReqData: Omit<AdminDeskRequest, 'id' | 'submittedAt' | 'timeline' | 'status' | 'auditLog' | 'messages' | 'checklist'>): string => {
    const trackingId = `BCB-2026-${Math.floor(100000 + Math.random() * 900000).toString().substring(0, 6)}`;
    const now = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const newRequest: AdminDeskRequest = {
      ...newReqData,
      id: trackingId,
      status: 'Submitted',
      submittedAt: now,
      checklist: {
        baustIdMatches: true,
        academicRecordFound: true,
        paymentVerified: newReqData.payment.isVerified,
        documentsValid: newReqData.uploadedDocuments.length > 0
      },
      timeline: [
        { step: 'Request Submitted & Order Placed', timestamp: `${now} (Online Portal)`, completed: true, handledBy: 'Applicant', isCurrent: true },
        { step: 'Payment Verified by Finance Office', timestamp: 'Pending Verification', completed: false },
        { step: 'Academic Verification & Controller Review', timestamp: 'Pending', completed: false },
        { step: 'Official Printing & Hologram Seal Affixed', timestamp: 'Pending', completed: false },
        { step: 'Ready for Dispatch / Collection', timestamp: 'Pending', completed: false },
        { step: 'Delivered / Handed Over', timestamp: 'Pending', completed: false }
      ],
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderRole: 'admin',
          senderName: 'BAUST Admin Desk System',
          text: `Welcome! Your request #${trackingId} has been queued. You can track each processing step here or message the exam controller counter if needed.`,
          timestamp: now
        }
      ],
      auditLog: [
        {
          id: `aud-${Date.now()}`,
          action: 'REQUEST_SUBMITTED',
          performedBy: newReqData.alumniName,
          timestamp: now,
          details: `Order created for ${newReqData.services.map((s) => s.serviceName).join(', ')} - Total: BDT ${newReqData.payment.totalAmount}`
        }
      ]
    };

    // TODO: replace with API call: POST /api/admindesk/requests
    setRequests((prev) => [newRequest, ...prev]);

    // Push notification to bell
    pushNotificationToBell(
      'Document Request Submitted',
      `Your request (${trackingId}) for ${newReqData.services[0]?.serviceName} was received and is awaiting payment review.`,
      `/alumni/admin-desk/requests/${trackingId}`
    );

    addToast('success', 'Order Submitted Successfully', `Tracking ID: ${trackingId}`);
    return trackingId;
  };

  const updateRequestStatus = (
    requestId: string, 
    status: AdminDeskRequestStatus, 
    staffName: string = 'Registrar Office Staff', 
    remarks?: string, 
    courierDetails?: { courierName?: string; courierTrackingNumber?: string }
  ) => {
    const now = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    setRequests((prev) =>
      prev.map((req) => {
        if (req.id !== requestId) return req;

        const updatedTimeline = req.timeline.map((item) => {
          if (status === 'Payment Verified' && item.step.includes('Payment Verified')) {
            return { ...item, completed: true, timestamp: now, handledBy: staffName };
          }
          if (status === 'Under Review' && item.step.includes('Academic Verification')) {
            return { ...item, completed: true, timestamp: now, handledBy: staffName, isCurrent: true };
          }
          if (status === 'Approved' && item.step.includes('Academic Verification')) {
            return { ...item, completed: true, timestamp: now, handledBy: staffName, remarks: remarks || 'Approved by Controller' };
          }
          if (status === 'Processing' && item.step.includes('Printing & Hologram')) {
            return { ...item, completed: true, timestamp: now, handledBy: staffName, isCurrent: true };
          }
          if (status === 'Ready' && item.step.includes('Ready for Dispatch')) {
            return { ...item, completed: true, timestamp: now, handledBy: staffName, isCurrent: true };
          }
          if (status === 'Delivered' && item.step.includes('Delivered')) {
            return { ...item, completed: true, timestamp: now, handledBy: staffName, isCurrent: true };
          }
          return item;
        });

        // Create default digital deliverable if ready
        let finalDeliverable = req.finalDeliverable;
        if (status === 'Ready' && !finalDeliverable) {
          finalDeliverable = {
            documentNumber: `BAUST/EXAM/${req.services[0]?.serviceId.toUpperCase()}/2026/${req.id.slice(-4)}`,
            title: `${req.services[0]?.serviceName} (Digital Certified Copy)`,
            issuedDate: new Date().toISOString().split('T')[0],
            qrCodeUrl: `https://bcb.baust.edu.bd/verify-document?id=${req.id}`,
            fileUrl: `https://example.com/docs/${req.id}.pdf`,
            watermark: 'DIGITAL OFFICIAL COPY - BAUST EXAM CONTROLLER SEAL',
            digitalSignature: `${staffName.toUpperCase()}, BAUST`,
            signatoryTitle: 'Authorized Exam Controller Signatory'
          };
        }

        const updatedReq: AdminDeskRequest = {
          ...req,
          status,
          adminRemarks: remarks || req.adminRemarks,
          finalDeliverable,
          delivery: {
            ...req.delivery,
            courierName: courierDetails?.courierName || req.delivery.courierName,
            courierTrackingNumber: courierDetails?.courierTrackingNumber || req.delivery.courierTrackingNumber
          },
          timeline: updatedTimeline,
          auditLog: [
            {
              id: `aud-${Date.now()}`,
              action: `STATUS_CHANGE_TO_${status.toUpperCase()}`,
              performedBy: staffName,
              timestamp: now,
              details: remarks || `Status updated to ${status}`
            },
            ...req.auditLog
          ]
        };

        // Notify alumni
        pushNotificationToBell(
          `Request Status: ${status}`,
          `Your document request (${req.id}) has been updated to "${status}".`,
          `/alumni/admin-desk/requests/${req.id}`
        );

        return updatedReq;
      })
    );

    // TODO: replace with API call: PATCH /api/admindesk/requests/:id
    addToast('success', 'Status Updated', `Request #${requestId} is now ${status}`);
  };

  const verifyPayment = (requestId: string, staffName: string = 'Accounts Office') => {
    const now = new Date().toLocaleString();
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        return {
          ...r,
          status: 'Payment Verified',
          payment: { ...r.payment, isVerified: true },
          checklist: { ...r.checklist, paymentVerified: true },
          auditLog: [
            {
              id: `aud-${Date.now()}`,
              action: 'PAYMENT_VERIFIED',
              performedBy: staffName,
              timestamp: now,
              details: `Payment of BDT ${r.payment.totalAmount} manually reconciled`
            },
            ...r.auditLog
          ]
        };
      })
    );
    pushNotificationToBell(
      'Payment Confirmed',
      `Your payment for request #${requestId} was verified by the Accounts Office. Processing started.`,
      `/alumni/admin-desk/requests/${requestId}`
    );
    addToast('success', 'Payment Verified', `Request #${requestId} marked as Payment Verified`);
  };

  const rejectRequest = (requestId: string, reason: AdminDeskRequest['rejectionReason'], message: string, staffName: string = 'Exam Controller') => {
    const now = new Date().toLocaleString();
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        const newMsg = {
          id: `msg-${Date.now()}`,
          senderRole: 'admin' as const,
          senderName: staffName,
          text: `[REQUEST REJECTED - Reason: ${reason}]: ${message}`,
          timestamp: now
        };
        return {
          ...r,
          status: 'Rejected',
          rejectionReason: reason,
          rejectionMessage: message,
          messages: [...r.messages, newMsg],
          timeline: [
            ...r.timeline,
            { step: `Request Rejected (${reason})`, timestamp: now, completed: false, isCurrent: true, remarks: message }
          ],
          auditLog: [
            {
              id: `aud-${Date.now()}`,
              action: 'REQUEST_REJECTED',
              performedBy: staffName,
              timestamp: now,
              details: `Rejected due to: ${reason} - ${message}`
            },
            ...r.auditLog
          ]
        };
      })
    );
    pushNotificationToBell(
      'Document Request Rejected',
      `Request #${requestId} was rejected: ${reason}. Click to view details and re-apply.`,
      `/alumni/admin-desk/requests/${requestId}`
    );
    addToast('error', 'Request Rejected', `Rejection notice sent to alumni with re-apply option.`);
  };

  const requestMoreInfo = (requestId: string, reason: string, staffName: string = 'Admin Staff') => {
    const now = new Date().toLocaleString();
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        const newMsg = {
          id: `msg-${Date.now()}`,
          senderRole: 'admin' as const,
          senderName: staffName,
          text: `[ACTION REQUIRED]: ${reason}. Please use the upload button to supply the requested file.`,
          timestamp: now
        };
        return {
          ...r,
          status: 'Action Required',
          actionRequiredReason: reason,
          messages: [...r.messages, newMsg],
          timeline: [
            ...r.timeline,
            { step: `Action Required: ${reason}`, timestamp: now, completed: false, isCurrent: true, remarks: reason }
          ],
          auditLog: [
            {
              id: `aud-${Date.now()}`,
              action: 'ACTION_REQUIRED',
              performedBy: staffName,
              timestamp: now,
              details: `Requested missing info: ${reason}`
            },
            ...r.auditLog
          ]
        };
      })
    );
    pushNotificationToBell(
      'Action Required on Document Request',
      `Your request #${requestId} requires additional information: ${reason}`,
      `/alumni/admin-desk/requests/${requestId}`
    );
    addToast('warning', 'Action Required Flagged', `Alumni notified to upload missing details.`);
  };

  const markReady = (requestId: string, staffName: string = 'Controller Office', deliverable?: FinalDeliverableDoc) => {
    updateRequestStatus(requestId, 'Ready', staffName, 'Document printed and ready for pickup / courier');
  };

  const markDelivered = (requestId: string, staffName: string = 'Dispatch Counter', courierName?: string, trackingNo?: string) => {
    updateRequestStatus(requestId, 'Delivered', staffName, `Handed over / dispatched via ${courierName || 'SA Paribahan'}`, {
      courierName,
      courierTrackingNumber: trackingNo
    });
  };

  const cancelRequest = (requestId: string) => {
    const now = new Date().toLocaleString();
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        return {
          ...r,
          status: 'Cancelled',
          auditLog: [
            { id: `aud-${Date.now()}`, action: 'CANCELLED_BY_ALUMNI', performedBy: r.alumniName, timestamp: now, details: 'Cancelled by applicant' },
            ...r.auditLog
          ]
        };
      })
    );
    addToast('info', 'Request Cancelled', `Request #${requestId} has been cancelled.`);
  };

  const rateRequest = (requestId: string, score: number, comment: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, rating: { score, comment, ratedAt: new Date().toISOString() } } : r))
    );
    addToast('success', 'Feedback Submitted', 'Thank you for rating the Admin Desk service!');
  };

  const raiseRequestIssue = (requestId: string, topic: string, description: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              issueRaised: { topic, description, raisedAt: new Date().toISOString(), resolved: false }
            }
          : r
      )
    );
    addToast('info', 'Complaint Registered', 'University admin desk has logged your ticket.');
  };

  const sendMessageOnRequest = (requestId: string, senderRole: 'alumni' | 'admin', senderName: string, text: string, attachmentUrl?: string) => {
    const now = new Date().toLocaleString();
    const newMsg = {
      id: `msg-${Date.now()}`,
      senderRole,
      senderName,
      text,
      timestamp: now,
      attachmentUrl
    };

    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, messages: [...r.messages, newMsg] } : r))
    );

    // Push notification to opposite party
    if (senderRole === 'admin') {
      pushNotificationToBell(`New message on #${requestId}`, `${senderName}: ${text}`, `/alumni/admin-desk/requests/${requestId}`);
    } else {
      pushNotificationToBell(`Alumni reply on #${requestId}`, `${senderName}: ${text}`, `/admin/admin-desk/requests/${requestId}`);
    }
  };

  const updateChecklist = (requestId: string, key: keyof AdminDeskRequest['checklist'], value: boolean) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, checklist: { ...r.checklist, [key]: value } }
          : r
      )
    );
  };

  const assignStaff = (requestId: string, staffId: string, staffName: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              assignedStaffId: staffId,
              assignedStaffName: staffName,
              auditLog: [
                {
                  id: `aud-${Date.now()}`,
                  action: 'ASSIGNED',
                  performedBy: 'Admin Desk Coordinator',
                  timestamp: new Date().toLocaleString(),
                  details: `Assigned to ${staffName}`
                },
                ...r.auditLog
              ]
            }
          : r
      )
    );
    addToast('info', 'Staff Assigned', `Request #${requestId} assigned to ${staffName}`);
  };

  const reUploadMissingDoc = (requestId: string, doc: AdminDeskRequest['uploadedDocuments'][0]) => {
    const now = new Date().toLocaleString();
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        return {
          ...r,
          status: 'Under Review',
          uploadedDocuments: [...r.uploadedDocuments, doc],
          checklist: { ...r.checklist, documentsValid: true },
          messages: [
            ...r.messages,
            {
              id: `msg-${Date.now()}`,
              senderRole: 'alumni',
              senderName: r.alumniName,
              text: `I have re-uploaded the requested document: ${doc.name}. Kindly resume review.`,
              timestamp: now
            }
          ],
          auditLog: [
            {
              id: `aud-${Date.now()}`,
              action: 'DOCUMENT_RE_UPLOADED',
              performedBy: r.alumniName,
              timestamp: now,
              details: `Uploaded ${doc.name} (${doc.size})`
            },
            ...r.auditLog
          ]
        };
      })
    );
    addToast('success', 'Document Uploaded', 'Document received. Status returned to Under Review.');
  };

  // Catalog Handlers
  const addService = (srv: Omit<AdminDeskService, 'id'>) => {
    const id = `srv-${Date.now()}`;
    setServices((prev) => [...prev, { ...srv, id }]);
    addToast('success', 'Service Added', `${srv.name} is now available in the catalog.`);
  };

  const updateService = (id: string, updates: Partial<AdminDeskService>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    addToast('success', 'Catalog Updated', 'Service configuration saved.');
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    addToast('info', 'Service Deleted', 'The service has been removed from the catalog.');
  };

  const toggleServiceEnabled = (id: string) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  // Notices Handlers
  const addNotice = (notice: Omit<NoticeItem, 'id' | 'publishedAt' | 'readCount'>) => {
    const id = `not-${Date.now()}`;
    const newNotice: NoticeItem = {
      ...notice,
      id,
      publishedAt: new Date().toISOString().split('T')[0],
      readCount: 0,
      isRead: false
    };
    setNotices((prev) => [newNotice, ...prev]);
    pushNotificationToBell('New University Notice', notice.title, '/alumni/admin-desk', 'announcement');
    addToast('success', 'Notice Published', notice.title);
  };

  const updateNotice = (id: string, updates: Partial<NoticeItem>) => {
    setNotices((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)));
    addToast('success', 'Notice Updated', 'Changes saved.');
  };

  const deleteNotice = (id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
    addToast('info', 'Notice Removed', 'The notice has been removed.');
  };

  const toggleNoticePin = (id: string) => {
    setNotices((prev) => prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n)));
  };

  const rsvpNotice = (id: string) => {
    setNotices((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n;
        const userRsvpd = !n.userRsvpd;
        const rsvpCount = (n.rsvpCount || 0) + (userRsvpd ? 1 : -1);
        return { ...n, userRsvpd, rsvpCount: Math.max(0, rsvpCount) };
      })
    );
    addToast('success', 'Event RSVP Recorded', 'Your participation interest has been noted!');
  };

  const markAllNoticesRead = () => {
    setNotices((prev) => prev.map((n) => ({ ...n, isRead: true })));
    addToast('info', 'Notices Marked as Read');
  };

  // Vacancy Handlers
  const addVacancy = (vac: Omit<VacancyItem, 'id' | 'publishedAt'>) => {
    const id = `vac-${Date.now()}`;
    const newVac: VacancyItem = {
      ...vac,
      id,
      publishedAt: new Date().toISOString().split('T')[0]
    };
    setVacancies((prev) => [newVac, ...prev]);
    pushNotificationToBell('New University Job Circular', `${vac.title} (${vac.department})`, '/alumni/admin-desk', 'announcement');
    addToast('success', 'Vacancy Posted', vac.title);
  };

  const updateVacancy = (id: string, updates: Partial<VacancyItem>) => {
    setVacancies((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
    addToast('success', 'Vacancy Updated');
  };

  const deleteVacancy = (id: string) => {
    setVacancies((prev) => prev.filter((v) => v.id !== id));
    addToast('info', 'Vacancy Deleted');
  };

  const toggleVacancyStatus = (id: string) => {
    setVacancies((prev) => prev.map((v) => (v.id === id ? { ...v, status: v.status === 'Open' ? 'Closed' : 'Open' } : v)));
  };

  const toggleSaveVacancy = (id: string) => {
    setVacancies((prev) => prev.map((v) => (v.id === id ? { ...v, isSaved: !v.isSaved } : v)));
  };

  const submitVacancyApplication = (appData: Omit<VacancyApplication, 'id' | 'appliedAt' | 'status'>) => {
    const id = `app-${Date.now()}`;
    const newApp: VacancyApplication = {
      ...appData,
      id,
      status: 'Applied',
      appliedAt: new Date().toISOString().split('T')[0]
    };
    setApplications((prev) => [newApp, ...prev]);
    pushNotificationToBell(
      'Job Application Submitted',
      `Your application for ${appData.vacancyTitle} has been received by the University Recruitment Board.`,
      '/alumni/admin-desk'
    );
    addToast('success', 'Application Submitted', `Applied for ${appData.vacancyTitle}`);
  };

  const updateApplicationStatus = (
    appId: string, 
    status: VacancyApplication['status'], 
    interviewDetails?: VacancyApplication['interviewDetails'], 
    adminNotes?: string
  ) => {
    setApplications((prev) =>
      prev.map((a) => {
        if (a.id !== appId) return a;
        return {
          ...a,
          status,
          interviewDetails: interviewDetails || a.interviewDetails,
          adminNotes: adminNotes || a.adminNotes
        };
      })
    );

    const app = applications.find((a) => a.id === appId);
    if (app) {
      pushNotificationToBell(
        `Application Update: ${status}`,
        `Your application for ${app.vacancyTitle} status changed to ${status}.`,
        '/alumni/admin-desk'
      );
    }
    addToast('success', 'Applicant Status Updated', `Status changed to ${status}`);
  };

  // Support & Settings
  const submitSupportTicket = (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>) => {
    const id = `TCK-${Math.floor(100 + Math.random() * 900)}`;
    const newTicket: SupportTicket = {
      ...ticket,
      id,
      status: 'Open',
      createdAt: new Date().toLocaleString()
    };
    setSupportTickets((prev) => [newTicket, ...prev]);
    addToast('success', 'Ticket Submitted', `Ticket #${id} created. Registrar office will reply within 24 hours.`);
  };

  const resolveSupportTicket = (id: string, reply: string) => {
    setSupportTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'Resolved', reply } : t)));
    addToast('success', 'Ticket Resolved', `Reply dispatched to alumni.`);
  };

  const updateSettings = (newSettings: Partial<AdminDeskSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addToast('success', 'Settings Saved', 'Office hours and service charges updated.');
  };

  const resetToDefaults = () => {
    localStorage.removeItem(STORAGE_KEYS.SERVICES);
    localStorage.removeItem(STORAGE_KEYS.REQUESTS);
    localStorage.removeItem(STORAGE_KEYS.NOTICES);
    localStorage.removeItem(STORAGE_KEYS.VACANCIES);
    localStorage.removeItem(STORAGE_KEYS.APPLICATIONS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    setServices(initialServiceCatalog);
    setRequests(initialServiceRequests);
    setNotices(initialNotices);
    setVacancies(initialVacancies);
    setApplications(initialVacancyApplications);
    setSettings(initialAdminDeskSettings);
    addToast('info', 'Reset Admin Desk to Initial State');
  };

  return (
    <AdminDeskContext.Provider
      value={{
        services,
        requests,
        notices,
        vacancies,
        applications,
        staffMembers,
        settings,
        supportTickets,
        submitRequest,
        updateRequestStatus,
        verifyPayment,
        rejectRequest,
        requestMoreInfo,
        markReady,
        markDelivered,
        cancelRequest,
        rateRequest,
        raiseRequestIssue,
        sendMessageOnRequest,
        updateChecklist,
        assignStaff,
        reUploadMissingDoc,
        addService,
        updateService,
        deleteService,
        toggleServiceEnabled,
        addNotice,
        updateNotice,
        deleteNotice,
        toggleNoticePin,
        rsvpNotice,
        markAllNoticesRead,
        addVacancy,
        updateVacancy,
        deleteVacancy,
        toggleVacancyStatus,
        toggleSaveVacancy,
        submitVacancyApplication,
        updateApplicationStatus,
        submitSupportTicket,
        resolveSupportTicket,
        updateSettings,
        resetToDefaults
      }}
    >
      {children}
    </AdminDeskContext.Provider>
  );
};

export const useAdminDeskStore = (): AdminDeskContextType => {
  const context = useContext(AdminDeskContext);
  if (!context) {
    throw new Error('useAdminDeskStore must be used within an AdminDeskProvider');
  }
  return context;
};
