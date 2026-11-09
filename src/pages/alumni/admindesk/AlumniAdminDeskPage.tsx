import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Clock,
  Search,
  Plus,
  HelpCircle,
  Briefcase,
  Bell,
  ChevronRight,
  ShieldCheck,
  Send,
  Building,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useAdminDeskStore } from '../../../hooks/useAdminDeskStore';
import { useApp } from '../../../context/AppContext';
import { ServiceCard } from '../../../components/admindesk/ServiceCard';
import { RequestStepperModal } from '../../../components/admindesk/RequestStepperModal';
import { NoticeCard } from '../../../components/admindesk/NoticeCard';
import { NoticeDetailDrawer } from '../../../components/admindesk/NoticeDetailDrawer';
import { VacancyCard } from '../../../components/admindesk/VacancyCard';
import { VacancyApplyModal } from '../../../components/admindesk/VacancyApplyModal';
import { ContactSupportModal } from '../../../components/admindesk/ContactSupportModal';
import { AdminDeskService, NoticeItem, VacancyItem } from '../../../types/admindesk';

type TabKey = 'services' | 'requests' | 'notices' | 'vacancies' | 'applications' | 'faq';

const FAQS = [
  {
    q: 'How long does an Official Transcript take to process?',
    a: 'Regular processing takes 7 working days. If you select Urgent SLA during application, it is expedited within 2 working days after payment verification and departmental grade check.'
  },
  {
    q: 'Can BAUST send my sealed transcript directly to WES or a foreign university?',
    a: 'Yes. Select the "Direct to Institution" delivery method in the application wizard. Provide the foreign recipient address and your WES / CAS Reference Number. We stamp and seal the envelope with the Registrar wax seal before dispatch.'
  },
  {
    q: 'What if I lost my Original Degree Certificate?',
    a: 'You can apply for a "Duplicate Certificate / Degree". You must upload a scanned copy of a Police General Diary (GD) report and a copy of the public daily newspaper announcement.'
  },
  {
    q: 'How can I pay for document fees from abroad?',
    a: 'You can pay via bKash / Nagad merchant gateway, or have a relative pay directly at Trust Bank BAUST Branch. We also accept international wire transfers; please submit a ticket for the university swift routing details.'
  },
  {
    q: 'How do employers verify my BAUST degree authenticity?',
    a: 'Every official document issued through the Career Bridge portal contains a unique Tracking ID (e.g., BCB-2026-000123) and a cryptographic QR code. Any employer or embassy can verify authenticity instantly at baust.ac.bd/verify-document without sending manual email queries.'
  },
  {
    q: 'Can I apply for faculty positions at BAUST through this desk?',
    a: 'Yes! The "Career Vacancies" tab lists all open faculty, research assistant, and officer positions. As a registered BAUST alumnus, you can apply with one click with your verified academic records.'
  }
];

export const AlumniAdminDeskPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as TabKey) || 'services';

  const {
    services,
    requests,
    notices,
    vacancies,
    applications,
    settings,
    rsvpNotice
  } = useAdminDeskStore();

  const { currentUser } = useApp();
  const currentUserId = currentUser?.id || 'alm-1';

  // Modal states
  const [isStepperOpen, setIsStepperOpen] = useState(false);
  const [selectedServiceForOrder, setSelectedServiceForOrder] = useState<AdminDeskService | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
  const [selectedVacancy, setSelectedVacancy] = useState<VacancyItem | null>(null);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // Filters
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceCategory, setServiceCategory] = useState<string>('All');
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>('All');
  const [requestSearch, setRequestSearch] = useState('');
  const [noticeSearch, setNoticeSearch] = useState('');
  const [vacancyDeptFilter, setVacancyDeptFilter] = useState('All');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const setTab = (tab: TabKey) => {
    setSearchParams({ tab });
  };

  // User's own requests
  const userRequests = useMemo(() => {
    return requests.filter(r => r.alumniId === currentUserId || r.alumniName.toLowerCase().includes('farhan'));
  }, [requests, currentUserId]);

  // Filtered Services
  const filteredServices = useMemo(() => {
    return services.filter(s => {
      if (!s.enabled) return false;
      if (serviceCategory !== 'All' && s.category !== serviceCategory) return false;
      if (serviceSearch.trim()) {
        const query = serviceSearch.toLowerCase();
        return (
          s.name.toLowerCase().includes(query) ||
          (s.nameBn && s.nameBn.toLowerCase().includes(query)) ||
          s.description.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [services, serviceCategory, serviceSearch]);

  // Filtered Requests
  const filteredRequests = useMemo(() => {
    return userRequests.filter(r => {
      if (requestStatusFilter !== 'All') {
        if (requestStatusFilter === 'In Progress') {
          if (!['Submitted', 'Payment Verified', 'Under Review', 'Processing'].includes(r.status)) return false;
        } else if (requestStatusFilter === 'Ready / Delivered') {
          if (!['Ready', 'Delivered'].includes(r.status)) return false;
        } else if (r.status !== requestStatusFilter) {
          return false;
        }
      }
      if (requestSearch.trim()) {
        const query = requestSearch.toLowerCase();
        return (
          r.id.toLowerCase().includes(query) ||
          r.services.some(s => s.serviceName.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [userRequests, requestStatusFilter, requestSearch]);

  // Filtered Notices
  const filteredNotices = useMemo(() => {
    return notices.filter(n => {
      if (n.audience === 'Students') return false;
      if (noticeSearch.trim()) {
        const query = noticeSearch.toLowerCase();
        return (
          n.title.toLowerCase().includes(query) ||
          n.content.toLowerCase().includes(query) ||
          n.category.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [notices, noticeSearch]);

  // Filtered Vacancies
  const filteredVacancies = useMemo(() => {
    return vacancies.filter(v => {
      if (v.status !== 'Open') return false;
      if (vacancyDeptFilter !== 'All' && !v.department.includes(vacancyDeptFilter)) return false;
      return true;
    });
  }, [vacancies, vacancyDeptFilter]);

  // User applications
  const userApplications = useMemo(() => {
    return applications.filter(a => a.alumniId === currentUserId || a.alumniName.toLowerCase().includes('farhan'));
  }, [applications, currentUserId]);

  const handleOpenOrderModal = (service?: AdminDeskService) => {
    if (service) {
      setSelectedServiceForOrder(service);
    } else {
      setSelectedServiceForOrder(services[0] || null);
    }
    setIsStepperOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-16">
      {/* Top Banner & Header */}
      <div className="bg-linear-to-r from-[#0F2A4A] via-[#16385F] to-[#2E5E3E] text-white pt-8 pb-10 px-4 md:px-8 border-b border-white/10 shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 bg-[#C9A227] text-white text-[11px] font-black uppercase tracking-widest rounded-md">
                  BAUST Digital Services
                </span>
                <span className="text-xs text-white/70 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  Office Hours: {settings.officeHours} ({settings.workingDays})
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                University Admin Desk & Document Services
              </h1>
              <p className="text-white/80 text-sm mt-1 max-w-2xl">
                Official, paperless gateway for academic transcripts, provisional certificates, testimonials, degree verification, and recruitment notices.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSupportModalOpen(true)}
                className="px-4 py-2.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 transition-all flex items-center gap-2"
              >
                <HelpCircle className="w-4 h-4 text-[#C9A227]" />
                Helpdesk Support
              </button>
              <button
                onClick={() => handleOpenOrderModal()}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#C9A227] hover:bg-[#b08d20] rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Request Document
              </button>
            </div>
          </div>

          {/* Quick Stats Pill Strip */}
          <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <span className="text-white/60 block text-[11px]">My Active Requests</span>
              <span className="text-lg font-bold text-white mt-0.5 block">
                {userRequests.filter(r => !['Delivered', 'Cancelled'].includes(r.status)).length} ongoing
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <span className="text-white/60 block text-[11px]">Turnaround Time</span>
              <span className="text-lg font-bold text-[#C9A227] mt-0.5 block">2 to 7 Days SLA</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <span className="text-white/60 block text-[11px]">Official Notices</span>
              <span className="text-lg font-bold text-white mt-0.5 block">{notices.length} active circulars</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <span className="text-white/60 block text-[11px]">Security Standard</span>
              <span className="text-lg font-bold text-emerald-300 mt-0.5 block flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> QR Verified
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-gray-200 no-scrollbar">
          <button
            onClick={() => setTab('services')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'services'
                ? 'bg-[#0F2A4A] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Document Services</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'services' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {services.length}
            </span>
          </button>

          <button
            onClick={() => setTab('requests')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'bg-[#0F2A4A] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>My Requests</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'requests' ? 'bg-[#C9A227] text-white font-black' : 'bg-amber-100 text-amber-800 font-bold'
              }`}
            >
              {userRequests.length}
            </span>
          </button>

          <button
            onClick={() => setTab('notices')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'notices'
                ? 'bg-[#0F2A4A] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>University Notices</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'notices' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {notices.length}
            </span>
          </button>

          <button
            onClick={() => setTab('vacancies')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'vacancies'
                ? 'bg-[#0F2A4A] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Career Vacancies</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'vacancies' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {vacancies.filter(v => v.status === 'Open').length}
            </span>
          </button>

          <button
            onClick={() => setTab('applications')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'applications'
                ? 'bg-[#0F2A4A] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>My Applications</span>
            {userApplications.length > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === 'applications' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
                }`}
              >
                {userApplications.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setTab('faq')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'faq'
                ? 'bg-[#0F2A4A] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Help & FAQ</span>
          </button>
        </div>

        {/* TAB 1: SERVICES CATALOG */}
        {activeTab === 'services' && (
          <div className="mt-6 space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="relative grow max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={serviceSearch}
                  onChange={e => setServiceSearch(e.target.value)}
                  placeholder="Search transcript, degree, testimonial, verification..."
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F2A4A] focus:border-[#0F2A4A] outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                {['All', 'Academic Documents', 'Certificates', 'Verification', 'Letters', 'Others'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setServiceCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      serviceCategory === cat
                        ? 'bg-[#0F2A4A] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredServices.map(service => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onRequest={() => handleOpenOrderModal(service)}
                />
              ))}
            </div>

            {filteredServices.length === 0 && (
              <div className="bg-white p-12 text-center rounded-2xl border border-gray-200">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-800">No Services Found</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Try adjusting your search terms or category filter.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY REQUESTS */}
        {activeTab === 'requests' && (
          <div className="mt-6 space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="relative grow max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={requestSearch}
                  onChange={e => setRequestSearch(e.target.value)}
                  placeholder="Search by Tracking ID (e.g. BCB-2026-...) or document..."
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F2A4A] focus:border-[#0F2A4A] outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                {['All', 'In Progress', 'Action Required', 'Ready / Delivered', 'Rejected'].map(status => (
                  <button
                    key={status}
                    onClick={() => setRequestStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      requestStatusFilter === status
                        ? 'bg-[#0F2A4A] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {filteredRequests.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-gray-200">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-800">No Service Requests Found</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  You have not submitted any service requests under this filter. Need official transcripts or certificates?
                </p>
                <button
                  onClick={() => handleOpenOrderModal()}
                  className="mt-4 px-4 py-2 bg-[#0F2A4A] text-white text-xs font-bold rounded-xl hover:bg-[#1a3d66] transition-colors"
                >
                  Create New Request
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map(req => {
                  const isActionReq = req.status === 'Action Required';

                  return (
                    <div
                      key={req.id}
                      onClick={() => navigate(`/alumni/admin-desk/requests/${req.id}`)}
                      className={`bg-white p-5 rounded-2xl border transition-all hover:shadow-md cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isActionReq
                          ? 'border-amber-300 bg-linear-to-r from-amber-50/40 to-white'
                          : 'border-gray-200 hover:border-blue-200'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold bg-[#0F2A4A]/10 text-[#0F2A4A] px-2.5 py-0.5 rounded-md">
                            {req.id}
                          </span>
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              req.status === 'Action Required'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                                : req.status === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : req.status === 'Ready'
                                ? 'bg-green-100 text-green-800'
                                : req.status === 'Rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {req.status}
                          </span>
                          {(req.urgency === 'Urgent' || req.urgency === 'Express') && (
                            <span className="text-[10px] font-extrabold uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded-md">
                              {req.urgency} SLA
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            Requested: {req.submittedAt}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-[#0F2A4A] hover:underline flex items-center gap-2">
                            {req.services[0]?.serviceName}
                          </h3>
                          <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">
                            Purpose: {req.services[0]?.purpose} &bull; Delivery: {req.delivery.method}
                          </p>
                        </div>

                        {req.adminRemarks && (
                          <div className="text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-gray-700 flex items-start gap-2">
                            <span className="font-bold text-[#0F2A4A] shrink-0">Admin Update:</span>
                            <span className="line-clamp-1">{req.adminRemarks}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 shrink-0">
                        <div className="text-left md:text-right">
                          <span className="text-[11px] text-gray-400 block uppercase font-bold">Total Fee</span>
                          <span className="text-base font-black text-[#0F2A4A]">৳{req.payment.totalAmount}</span>
                        </div>

                        <button
                          onClick={e => {
                            e.stopPropagation();
                            navigate(`/alumni/admin-desk/requests/${req.id}`);
                          }}
                          className="px-4 py-2 bg-[#0F2A4A] hover:bg-[#1a3d66] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <span>Track & View</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: UNIVERSITY NOTICES */}
        {activeTab === 'notices' && (
          <div className="mt-6 space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between gap-4">
              <div className="relative grow max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={noticeSearch}
                  onChange={e => setNoticeSearch(e.target.value)}
                  placeholder="Search notices, convocation, gala, clearances..."
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F2A4A] focus:border-[#0F2A4A] outline-hidden"
                />
              </div>
              <span className="text-xs text-gray-500 font-medium">
                Showing {filteredNotices.length} circulars
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredNotices.map(notice => (
                <NoticeCard
                  key={notice.id}
                  notice={notice}
                  onOpenDetail={n => setSelectedNotice(n)}
                  onRsvp={id => rsvpNotice(id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CAREER VACANCIES */}
        {activeTab === 'vacancies' && (
          <div className="mt-6 space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-600 uppercase">Filter Department:</span>
                {['All', 'CSE', 'EEE', 'ME', 'BBA'].map(dept => (
                  <button
                    key={dept}
                    onClick={() => setVacancyDeptFilter(dept)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      vacancyDeptFilter === dept
                        ? 'bg-[#0F2A4A] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
              <span className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-bold">
                {filteredVacancies.length} Active Openings
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredVacancies.map(vacancy => (
                <VacancyCard
                  key={vacancy.id}
                  vacancy={vacancy}
                  onApply={() => setSelectedVacancy(vacancy)}
                />
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: MY APPLICATIONS */}
        {activeTab === 'applications' && (
          <div className="mt-6 space-y-6">
            {userApplications.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-gray-200">
                <Building className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-800">No Job Applications Yet</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Browse open faculty and administrative positions at BAUST under Career Vacancies and submit your CV.
                </p>
                <button
                  onClick={() => setTab('vacancies')}
                  className="mt-4 px-4 py-2 bg-[#0F2A4A] text-white text-xs font-bold rounded-xl hover:bg-[#1a3d66] transition-colors"
                >
                  Browse Open Vacancies
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {userApplications.map(app => (
                  <div
                    key={app.id}
                    className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            app.status === 'Selected'
                              ? 'bg-emerald-100 text-emerald-800'
                              : app.status === 'Interview Scheduled'
                              ? 'bg-purple-100 text-purple-800 font-extrabold'
                              : app.status === 'Shortlisted'
                              ? 'bg-blue-100 text-blue-800'
                              : app.status === 'Not Selected'
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {app.status}
                        </span>
                        <span className="text-xs text-gray-400">Applied on {app.appliedAt}</span>
                      </div>
                      <h3 className="text-base font-bold text-[#0F2A4A]">{app.vacancyTitle}</h3>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Applicant: {app.alumniName} ({app.alumniEmail}) &bull; CGPA: {app.cgpa}
                      </p>

                      {app.interviewDetails && (
                        <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs space-y-1">
                          <div className="font-bold text-purple-900 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" /> Interview Scheduled
                          </div>
                          <div className="text-purple-800">
                            <strong>Date & Time:</strong> {app.interviewDetails.date} at{' '}
                            {app.interviewDetails.time}
                          </div>
                          <div className="text-purple-800">
                            <strong>Venue / Link:</strong> {app.interviewDetails.venueOrLink}
                          </div>
                        </div>
                      )}

                      {app.adminNotes && (
                        <p className="mt-2 text-xs text-gray-500 italic">
                          Feedback: "{app.adminNotes}"
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-3">
                      <span className="text-xs font-semibold px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg">
                        CV: {app.cvFileName}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: HELP & FAQ */}
        {activeTab === 'faq' && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
                <h3 className="text-base font-bold text-[#0F2A4A] mb-1">Frequently Asked Questions</h3>
                <p className="text-xs text-gray-500 mb-4">
                  Find fast answers regarding academic document fees, dispatch modes, WES verification, and courier timelines.
                </p>

                <div className="space-y-3">
                  {FAQS.map((faq, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-xl overflow-hidden transition-colors"
                    >
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                        className="w-full p-4 text-left font-bold text-sm text-[#0F2A4A] bg-gray-50/50 hover:bg-gray-100/70 flex items-center justify-between gap-3"
                      >
                        <span>{faq.q}</span>
                        <ChevronRight
                          className={`w-4 h-4 text-gray-400 transition-transform ${
                            expandedFaq === idx ? 'rotate-90' : ''
                          }`}
                        />
                      </button>
                      {expandedFaq === idx && (
                        <div className="p-4 bg-white text-xs leading-relaxed text-gray-600 border-t border-gray-100">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Support Desk Sidebar Card */}
            <div className="space-y-4">
              <div className="bg-[#0F2A4A] text-white p-6 rounded-2xl shadow-md border border-[#0F2A4A]">
                <HelpCircle className="w-8 h-8 text-[#C9A227] mb-3" />
                <h4 className="text-base font-bold">Need Personal Assistance?</h4>
                <p className="text-xs text-white/80 mt-1 leading-relaxed">
                  Have an urgent embassy deadline or custom clearance requirement? Submit a priority inquiry directly to the Academic Section.
                </p>

                <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-xs">
                  <div>
                    <span className="text-white/60 block">Registrar Helpline:</span>
                    <span className="font-semibold">{settings.supportPhone}</span>
                  </div>
                  <div>
                    <span className="text-white/60 block">Official Email:</span>
                    <span className="font-semibold">{settings.supportEmail}</span>
                  </div>
                  <div>
                    <span className="text-white/60 block">Working Hours:</span>
                    <span>{settings.officeHours} ({settings.workingDays})</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsSupportModalOpen(true)}
                  className="mt-5 w-full py-2.5 bg-[#C9A227] hover:bg-[#b08d20] text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Support Ticket
                </button>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 text-xs text-gray-600 space-y-2">
                <span className="font-bold text-[#0F2A4A] block text-sm">Physical Office Location:</span>
                <p>
                  Room 104, Administrative Building, Bangladesh Army University of Science and Technology (BAUST), Saidpur Cantonment, Nilphamari - 5310.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODALS & DRAWERS */}
      <RequestStepperModal
        isOpen={isStepperOpen}
        onClose={() => setIsStepperOpen(false)}
        preSelectedService={selectedServiceForOrder}
        onSuccessTrack={trackId => {
          navigate(`/alumni/admin-desk/requests/${trackId}`);
        }}
      />

      <NoticeDetailDrawer
        isOpen={Boolean(selectedNotice)}
        onClose={() => setSelectedNotice(null)}
        notice={selectedNotice}
      />

      <VacancyApplyModal
        isOpen={Boolean(selectedVacancy)}
        onClose={() => setSelectedVacancy(null)}
        vacancy={selectedVacancy}
      />

      <ContactSupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
    </div>
  );
};
