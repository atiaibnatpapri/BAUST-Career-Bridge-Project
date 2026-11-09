import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Clock,
  Search,
  Plus,
  Settings,
  Briefcase,
  Bell,
  Users,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Sliders,
  DollarSign,
  ShieldCheck,
  Calendar,
  Save
} from 'lucide-react';
import { useAdminDeskStore } from '../../../hooks/useAdminDeskStore';
import { AdminOverviewCharts } from '../../../components/admindesk/AdminOverviewCharts';
import { NoticeCreateModal } from '../../../components/admindesk/NoticeCreateModal';
import { VacancyCreateModal } from '../../../components/admindesk/VacancyCreateModal';
import { ServiceEditModal } from '../../../components/admindesk/ServiceEditModal';
import { ApplicationDetailModal } from '../../../components/admindesk/ApplicationDetailModal';
import {
  AdminDeskRequest,
  AdminDeskService,
  NoticeItem,
  VacancyItem,
  VacancyApplication,
  AdminDeskSettings
} from '../../../types/admindesk';

type AdminTabKey = 'overview' | 'requests' | 'catalog' | 'notices' | 'vacancies' | 'settings';

export const AdminAdminDeskPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as AdminTabKey) || 'overview';

  const {
    services,
    requests,
    notices,
    vacancies,
    applications,
    staffMembers,
    settings,
    addService,
    updateService,
    deleteService,
    addNotice,
    updateNotice,
    deleteNotice,
    addVacancy,
    updateVacancy,
    deleteVacancy,
    updateApplicationStatus,
    updateSettings
  } = useAdminDeskStore();

  // Modals state
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null);

  const [isVacancyModalOpen, setIsVacancyModalOpen] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<VacancyItem | null>(null);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<AdminDeskService | null>(null);

  const [selectedApplication, setSelectedApplication] = useState<VacancyApplication | null>(null);

  // Filters for Requests
  const [requestSearch, setRequestSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [urgencyFilter, setUrgencyFilter] = useState('All');

  // Vacancy Sub-tab
  const [vacancySubTab, setVacancySubTab] = useState<'openings' | 'applications'>('openings');

  // Settings local state
  const [localSettings, setLocalSettings] = useState<AdminDeskSettings>(settings);
  const [isSettingsSaved, setIsSettingsSaved] = useState(false);

  const setTab = (tab: AdminTabKey) => {
    setSearchParams({ tab });
  };

  // Filtered Requests Table
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      if (statusFilter !== 'All' && r.status !== statusFilter) return false;
      if (serviceFilter !== 'All' && r.services[0]?.serviceName !== serviceFilter) return false;
      if (urgencyFilter !== 'All' && r.urgency !== urgencyFilter) return false;
      if (requestSearch.trim()) {
        const query = requestSearch.toLowerCase();
        return (
          r.id.toLowerCase().includes(query) ||
          r.alumniName.toLowerCase().includes(query) ||
          r.baustId.toLowerCase().includes(query) ||
          r.services.some(s => s.serviceName.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [requests, statusFilter, serviceFilter, urgencyFilter, requestSearch]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(localSettings);
    setIsSettingsSaved(true);
    setTimeout(() => setIsSettingsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-20">
      {/* Admin Header */}
      <div className="bg-[#0F2A4A] text-white pt-7 pb-8 px-4 md:px-8 border-b border-white/10 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 bg-[#C9A227] text-white text-[11px] font-black uppercase tracking-widest rounded-md">
                Admin Console
              </span>
              <span className="text-xs text-white/70">
                Office of the Registrar & Academic Affairs, BAUST
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              University Admin Desk Management
            </h1>
            <p className="text-white/80 text-xs md:text-sm mt-0.5">
              Verify student documents, process transcripts, dispatch circulars, and manage recruitment applications.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {activeTab === 'catalog' && (
              <button
                onClick={() => {
                  setEditingService(null);
                  setIsServiceModalOpen(true);
                }}
                className="px-4 py-2 bg-[#C9A227] hover:bg-[#b08d20] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" /> Add Service
              </button>
            )}
            {activeTab === 'notices' && (
              <button
                onClick={() => {
                  setEditingNotice(null);
                  setIsNoticeModalOpen(true);
                }}
                className="px-4 py-2 bg-[#C9A227] hover:bg-[#b08d20] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" /> Publish Notice
              </button>
            )}
            {activeTab === 'vacancies' && (
              <button
                onClick={() => {
                  setEditingVacancy(null);
                  setIsVacancyModalOpen(true);
                }}
                className="px-4 py-2 bg-[#C9A227] hover:bg-[#b08d20] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" /> Post Job Vacancy
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-gray-200 no-scrollbar">
          <button
            onClick={() => setTab('overview')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-[#0F2A4A] text-white shadow-sm'
                : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Overview & Analytics</span>
          </button>

          <button
            onClick={() => setTab('requests')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'bg-[#0F2A4A] text-white shadow-sm'
                : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Service Requests</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'requests' ? 'bg-[#C9A227] text-white font-black' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {requests.length}
            </span>
          </button>

          <button
            onClick={() => setTab('catalog')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'catalog'
                ? 'bg-[#0F2A4A] text-white shadow-sm'
                : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Service Catalog</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'catalog' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {services.length}
            </span>
          </button>

          <button
            onClick={() => setTab('notices')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'notices'
                ? 'bg-[#0F2A4A] text-white shadow-sm'
                : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notices & Circulars</span>
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
                ? 'bg-[#0F2A4A] text-white shadow-sm'
                : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Vacancies & Applications</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'vacancies' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {applications.length}
            </span>
          </button>

          <button
            onClick={() => setTab('settings')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-[#0F2A4A] text-white shadow-sm'
                : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="mt-6">
            <AdminOverviewCharts
              requests={requests}
              onSelectRequest={id => navigate(`/admin/admin-desk/requests/${id}`)}
              onFilterStatus={status => {
                setStatusFilter(status);
                setTab('requests');
              }}
            />
          </div>
        )}

        {/* TAB 2: SERVICE REQUESTS TABLE */}
        {activeTab === 'requests' && (
          <div className="mt-6 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              <div className="relative grow max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={requestSearch}
                  onChange={e => setRequestSearch(e.target.value)}
                  placeholder="Search by Tracking ID, Student Name, Student ID..."
                  className="w-full pl-9 pr-4 py-2 text-xs md:text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F2A4A] focus:border-[#0F2A4A] outline-hidden"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#0F2A4A] outline-hidden"
                >
                  <option value="All">All Statuses</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Payment Verified">Payment Verified</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Action Required">Action Required</option>
                  <option value="Approved">Approved</option>
                  <option value="Processing">Processing</option>
                  <option value="Ready">Ready</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <select
                  value={urgencyFilter}
                  onChange={e => setUrgencyFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#0F2A4A] outline-hidden"
                >
                  <option value="All">All Urgency</option>
                  <option value="Normal">Normal SLA</option>
                  <option value="Urgent">Urgent SLA</option>
                  <option value="Express">Express SLA</option>
                </select>

                {(statusFilter !== 'All' || urgencyFilter !== 'All' || requestSearch) && (
                  <button
                    onClick={() => {
                      setStatusFilter('All');
                      setUrgencyFilter('All');
                      setRequestSearch('');
                    }}
                    className="px-3 py-2 text-xs text-gray-500 hover:text-gray-800 underline"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Tracking ID</th>
                      <th className="py-3.5 px-4">Applicant</th>
                      <th className="py-3.5 px-4">Service</th>
                      <th className="py-3.5 px-4">Requested</th>
                      <th className="py-3.5 px-4">Payment</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Assigned</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-gray-500 text-sm">
                          No service requests match the specified criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map(r => (
                        <tr
                          key={r.id}
                          onClick={() => navigate(`/admin/admin-desk/requests/${r.id}`)}
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-[#0F2A4A] bg-blue-50 px-2 py-0.5 rounded">
                              {r.id}
                            </span>
                            {(r.urgency === 'Urgent' || r.urgency === 'Express') && (
                              <span className="block mt-1 text-[10px] font-extrabold uppercase text-red-600">
                                {r.urgency}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-gray-900">{r.alumniName}</div>
                            <div className="text-[11px] text-gray-500">
                              {r.baustId} &bull; {r.department}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-gray-800 line-clamp-1">{r.services[0]?.serviceName}</div>
                            <div className="text-[11px] text-gray-500">{r.delivery.method}</div>
                          </td>
                          <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                            {r.submittedAt}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-gray-900">৳{r.payment.totalAmount}</div>
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                                r.payment.isVerified
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {r.payment.isVerified ? 'Verified' : 'Unverified'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap ${
                                r.status === 'Action Required'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                                  : r.status === 'Delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : r.status === 'Ready'
                                  ? 'bg-green-100 text-green-800'
                                  : r.status === 'Rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : r.status === 'Approved'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-gray-600 text-[11px] whitespace-nowrap">
                            {r.assignedStaffName || 'Unassigned'}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                navigate(`/admin/admin-desk/requests/${r.id}`);
                              }}
                              className="px-3 py-1.5 bg-[#0F2A4A] hover:bg-[#1a3d66] text-white font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-1"
                            >
                              <span>Manage</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SERVICE CATALOG MANAGEMENT */}
        {activeTab === 'catalog' && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0F2A4A]">University Document Offerings</h3>
                <p className="text-xs text-gray-500">
                  Configure document fees, SLAs, required supporting files, and allowed delivery channels
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingService(null);
                  setIsServiceModalOpen(true);
                }}
                className="px-4 py-2 bg-[#0F2A4A] hover:bg-[#1a3d66] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" /> Add New Service
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map(service => (
                <div
                  key={service.id}
                  className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                        {service.category}
                      </span>
                      <button
                        onClick={() =>
                          updateService(service.id, { enabled: !service.enabled })
                        }
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                          service.enabled
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {service.enabled ? 'Active' : 'Disabled'}
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-[#0F2A4A]">{service.name}</h4>
                    {service.nameBn && (
                      <p className="text-xs text-gray-500 font-['Noto_Sans_Bengali'] mt-0.5">
                        {service.nameBn}
                      </p>
                    )}
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                      {service.description}
                    </p>

                    <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Base Fee</span>
                        <span className="font-bold text-gray-900">৳{service.fee}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Urgent SLA</span>
                        <span className="font-bold text-amber-700">{service.processingDaysUrgent} Days</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingService(service);
                        setIsServiceModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete service "${service.name}"?`)) {
                          deleteService(service.id);
                        }
                      }}
                      className="px-2 py-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: NOTICES MANAGEMENT */}
        {activeTab === 'notices' && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0F2A4A]">University Circulars & Notices</h3>
                <p className="text-xs text-gray-500">
                  Broadcast administrative updates, convocation schedules, and policy advisories
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingNotice(null);
                  setIsNoticeModalOpen(true);
                }}
                className="px-4 py-2 bg-[#0F2A4A] hover:bg-[#1a3d66] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" /> Publish Circular
              </button>
            </div>

            <div className="space-y-3">
              {notices.map(notice => (
                <div
                  key={notice.id}
                  className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 grow">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        {notice.category}
                      </span>
                      {notice.isPinned && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          Pinned
                        </span>
                      )}
                      {notice.isUrgent && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-100 text-red-800">
                          Urgent
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        Published {notice.publishedAt} &bull; {notice.readCount} Views
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-[#0F2A4A]">{notice.title}</h4>
                    <p className="text-xs text-gray-600 line-clamp-1">{notice.content}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditingNotice(notice);
                        setIsNoticeModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete notice "${notice.title}"?`)) {
                          deleteNotice(notice.id);
                        }
                      }}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: VACANCIES & APPLICATIONS */}
        {activeTab === 'vacancies' && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setVacancySubTab('openings')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  vacancySubTab === 'openings'
                    ? 'bg-[#0F2A4A] text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900'
                }`}
              >
                Job Openings ({vacancies.length})
              </button>
              <button
                onClick={() => setVacancySubTab('applications')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  vacancySubTab === 'applications'
                    ? 'bg-[#0F2A4A] text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>Candidate Applications ({applications.length})</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </button>
            </div>

            {vacancySubTab === 'openings' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#0F2A4A]">Faculty & Staff Openings</h3>
                  <button
                    onClick={() => {
                      setEditingVacancy(null);
                      setIsVacancyModalOpen(true);
                    }}
                    className="px-4 py-2 bg-[#0F2A4A] hover:bg-[#1a3d66] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Post New Opening
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vacancies.map(v => (
                    <div
                      key={v.id}
                      className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                            {v.department} &bull; {v.type}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              v.status === 'Open'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {v.status}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-[#0F2A4A]">{v.title}</h4>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{v.description}</p>

                        <div className="mt-3 pt-3 border-t border-gray-100 text-xs space-y-1">
                          <div className="text-gray-500">
                            <strong>Deadline:</strong> {v.deadline} &bull;{' '}
                            <strong>Posts:</strong> {v.numberOfPosts}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingVacancy(v);
                            setIsVacancyModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete vacancy "${v.title}"?`)) {
                              deleteVacancy(v.id);
                            }
                          }}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {vacancySubTab === 'applications' && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-3.5 px-4">Applicant</th>
                        <th className="py-3.5 px-4">Position</th>
                        <th className="py-3.5 px-4">CGPA / Academics</th>
                        <th className="py-3.5 px-4">Applied Date</th>
                        <th className="py-3.5 px-4">CV File</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {applications.map(app => (
                        <tr
                          key={app.id}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => setSelectedApplication(app)}
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-gray-900">{app.alumniName}</div>
                            <div className="text-[11px] text-gray-500">{app.alumniEmail}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-gray-800">{app.vacancyTitle}</div>
                            <div className="text-[11px] text-gray-500">{app.department}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-[#0F2A4A]">CGPA: {app.cgpa}</span>
                            <div className="text-[11px] text-gray-500">Batch: {app.batch}</div>
                          </td>
                          <td className="py-3.5 px-4 text-gray-500">{app.appliedAt}</td>
                          <td className="py-3.5 px-4 text-gray-600 font-mono text-[11px]">
                            {app.cvFileName}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
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
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setSelectedApplication(app);
                              }}
                              className="px-3 py-1.5 bg-[#0F2A4A] hover:bg-[#1a3d66] text-white font-bold text-xs rounded-lg transition-colors"
                            >
                              Evaluate
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: SETTINGS */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="mt-6 space-y-6 max-w-4xl">
            {isSettingsSaved && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Admin desk configuration settings successfully saved!</span>
              </div>
            )}

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-[#0F2A4A] border-b border-gray-100 pb-2">
                Operational Office Hours & Contact
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Office Hours
                  </label>
                  <input
                    type="text"
                    value={localSettings.officeHours}
                    onChange={e =>
                      setLocalSettings({ ...localSettings, officeHours: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Working Days
                  </label>
                  <input
                    type="text"
                    value={localSettings.workingDays}
                    onChange={e =>
                      setLocalSettings({ ...localSettings, workingDays: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Helpline Phone
                  </label>
                  <input
                    type="text"
                    value={localSettings.supportPhone}
                    onChange={e =>
                      setLocalSettings({ ...localSettings, supportPhone: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Official Support Email
                  </label>
                  <input
                    type="email"
                    value={localSettings.supportEmail}
                    onChange={e =>
                      setLocalSettings({ ...localSettings, supportEmail: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-[#0F2A4A] border-b border-gray-100 pb-2">
                Postal & Courier Logistics Charges
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Standard Courier Inside Dhaka (BDT)
                  </label>
                  <input
                    type="number"
                    value={localSettings.courierFeeInsideDhaka}
                    onChange={e =>
                      setLocalSettings({
                        ...localSettings,
                        courierFeeInsideDhaka: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Courier Outside Dhaka (BDT)
                  </label>
                  <input
                    type="number"
                    value={localSettings.courierFeeOutsideDhaka}
                    onChange={e =>
                      setLocalSettings({
                        ...localSettings,
                        courierFeeOutsideDhaka: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#0F2A4A] hover:bg-[#1a3d66] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all"
              >
                <Save className="w-4 h-4" /> Save Configuration
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Modals */}
      <NoticeCreateModal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        editingNotice={editingNotice}
        onSave={noticeData => {
          if (editingNotice) {
            updateNotice(editingNotice.id, noticeData);
          } else {
            addNotice(noticeData);
          }
        }}
      />

      <VacancyCreateModal
        isOpen={isVacancyModalOpen}
        onClose={() => setIsVacancyModalOpen(false)}
        editingVacancy={editingVacancy}
        onSave={vacancyData => {
          if (editingVacancy) {
            updateVacancy(editingVacancy.id, vacancyData);
          } else {
            addVacancy(vacancyData);
          }
        }}
      />

      <ServiceEditModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        editingService={editingService}
        onSave={serviceData => {
          if (editingService) {
            updateService(editingService.id, serviceData);
          } else {
            addService(serviceData);
          }
        }}
      />

      <ApplicationDetailModal
        isOpen={Boolean(selectedApplication)}
        onClose={() => setSelectedApplication(null)}
        application={selectedApplication}
        onUpdateStatus={(appId, newStatus, schedule, notes) => {
          updateApplicationStatus(appId, newStatus, schedule, notes);
        }}
      />
    </div>
  );
};
