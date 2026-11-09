import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Truck,
  Building,
  User,
  Clock,
  Printer,
  Send,
  ShieldCheck,
  CreditCard,
  FileText,
  UploadCloud,
  FileCheck2,
  Download
} from 'lucide-react';
import { useAdminDeskStore } from '../../../hooks/useAdminDeskStore';
import { useApp } from '../../../context/AppContext';
import { AdminVerificationChecklist } from '../../../components/admindesk/AdminVerificationChecklist';
import { ActionRequiredModal } from '../../../components/admindesk/ActionRequiredModal';
import { RejectRequestModal } from '../../../components/admindesk/RejectRequestModal';
import { DigitalDocumentViewer } from '../../../components/admindesk/DigitalDocumentViewer';

export const AdminRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const adminName = currentUser?.name || 'Controller of Examinations Desk';

  const {
    requests,
    updateRequestStatus,
    verifyPayment,
    rejectRequest,
    requestMoreInfo,
    markReady,
    markDelivered,
    assignStaff,
    sendMessageOnRequest,
    updateChecklist,
    staffMembers
  } = useAdminDeskStore();

  const request = requests.find(r => r.id === id);

  // Modals
  const [isActionReqOpen, setIsActionReqOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Message reply
  const [replyText, setReplyText] = useState('');
  const [remarksText, setRemarksText] = useState(request?.adminRemarks || '');
  const [isRemarksSaved, setIsRemarksSaved] = useState(false);

  // Dispatch modal
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [courierService, setCourierService] = useState('Sundarban Courier Service');
  const [courierTrackNo, setCourierTrackNo] = useState(`SND-${Math.floor(100000 + Math.random() * 900000)}`);

  if (!request) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center max-w-md shadow-sm">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900">Request Not Found</h2>
          <p className="text-xs text-gray-500 mt-1">
            Service request ID "{id}" does not exist in the administrative repository.
          </p>
          <button
            onClick={() => navigate('/admin/admin-desk?tab=requests')}
            className="mt-5 px-4 py-2 bg-[#0F2A4A] text-white text-xs font-bold rounded-xl"
          >
            Return to Request Management
          </button>
        </div>
      </div>
    );
  }

  // Handle message send
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    sendMessageOnRequest(request.id, 'admin', adminName, replyText.trim());
    setReplyText('');
  };

  // Handle remarks save
  const handleSaveRemarks = () => {
    updateRequestStatus(
      request.id,
      request.status,
      adminName,
      remarksText.trim()
    );
    setIsRemarksSaved(true);
    setTimeout(() => setIsRemarksSaved(false), 2500);
  };

  // Workflow transitions
  const handleVerifyPayment = () => {
    verifyPayment(request.id, adminName);
  };

  const handleStartReview = () => {
    updateRequestStatus(
      request.id,
      'Under Review',
      adminName,
      'Registrar desk initiated academic record and clearance review.'
    );
  };

  const handleApprove = () => {
    updateRequestStatus(
      request.id,
      'Approved',
      adminName,
      'All prerequisites and academic grade records verified. Ready for printing.'
    );
  };

  const handleStartProcessing = () => {
    updateRequestStatus(
      request.id,
      'Processing',
      adminName,
      'Document sent to official security printing and registrar signature desk.'
    );
  };

  const handleMarkReady = () => {
    markReady(request.id, adminName);
  };

  const handleConfirmDispatch = () => {
    markDelivered(request.id, adminName, courierService, courierTrackNo);
    setIsDispatchModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24">
      {/* Top Banner */}
      <div className="bg-[#0F2A4A] text-white px-4 md:px-8 py-6 border-b border-white/10 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/admin/admin-desk?tab=requests')}
            className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Service Requests</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="font-mono text-xs font-bold bg-[#C9A227] text-white px-2.5 py-0.5 rounded-md">
                  {request.id}
                </span>
                <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-white/20 text-white">
                  {request.status}
                </span>
                {(request.urgency === 'Urgent' || request.urgency === 'Express') && (
                  <span className="text-[10px] font-extrabold uppercase bg-red-500 text-white px-2 py-0.5 rounded-md">
                    {request.urgency} SLA
                  </span>
                )}
              </div>

              <h1 className="text-xl md:text-2xl font-black text-white">
                {request.services.map(s => s.serviceName).join(', ')}
              </h1>
              <p className="text-xs text-white/70 mt-0.5">
                Applicant: <strong className="text-white">{request.alumniName}</strong> ({request.baustId}) &bull; Submitted {request.submittedAt}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 border border-white/20 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Application</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Verification Checklist & Workflow Engine */}
        <div className="lg:col-span-2 space-y-6">
          {/* Action Toolbar / Workflow Controls */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Workflow Stage & Next Actions
            </h3>

            <div className="flex flex-wrap items-center gap-2.5">
              {!request.payment.isVerified && (
                <button
                  onClick={handleVerifyPayment}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Verify Payment (৳{request.payment.totalAmount})</span>
                </button>
              )}

              {['Submitted', 'Payment Verified'].includes(request.status) && (
                <button
                  onClick={handleStartReview}
                  className="px-4 py-2 bg-[#0F2A4A] hover:bg-[#1a3d66] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <Clock className="w-4 h-4" />
                  <span>Start Review</span>
                </button>
              )}

              {['Submitted', 'Payment Verified', 'Under Review'].includes(request.status) && (
                <button
                  onClick={() => setIsActionReqOpen(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Request More Info</span>
                </button>
              )}

              {request.status === 'Under Review' && (
                <button
                  onClick={handleApprove}
                  className="px-4 py-2 bg-[#2E5E3E] hover:bg-[#234930] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Application</span>
                </button>
              )}

              {request.status === 'Approved' && (
                <button
                  onClick={handleStartProcessing}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>Send to Printing / Processing</span>
                </button>
              )}

              {request.status === 'Processing' && (
                <button
                  onClick={handleMarkReady}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Mark Ready & Generate Certificate</span>
                </button>
              )}

              {request.status === 'Ready' && (
                <button
                  onClick={() => setIsDispatchModalOpen(true)}
                  className="px-4 py-2 bg-[#0F2A4A] hover:bg-[#1a3d66] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <Truck className="w-4 h-4 text-[#C9A227]" />
                  <span>Dispatch via Courier / Hand Over</span>
                </button>
              )}

              {!['Delivered', 'Cancelled', 'Rejected'].includes(request.status) && (
                <button
                  onClick={() => setIsRejectOpen(true)}
                  className="px-3.5 py-2 text-red-600 hover:bg-red-50 border border-red-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              )}
            </div>
          </div>

          {/* 4-Point Administrative Verification Checklist */}
          <AdminVerificationChecklist
            request={request}
            onToggleChecklist={(key, val) => updateChecklist(request.id, key, val)}
          />

          {/* Digital Deliverable Preview */}
          {request.finalDeliverable && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0F2A4A] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Cryptographic Digital Deliverable Active
                </h3>
                <span className="text-xs font-mono text-gray-500">
                  Doc #: {request.finalDeliverable.documentNumber}
                </span>
              </div>
              <button
                onClick={() => setIsViewerOpen(true)}
                className="px-4 py-2 bg-[#0F2A4A] text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> View Certificate Specimen
              </button>
            </div>
          )}

          {/* Communication Thread with Applicant */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <h3 className="text-base font-bold text-[#0F2A4A] mb-1">
              Communication Thread with Applicant
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Send questions or instructions to {request.alumniName}. They will receive an instant notification in their bell.
            </p>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {request.messages.length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-xl text-center text-xs text-gray-500">
                  No messages exchanged yet.
                </div>
              ) : (
                request.messages.map(msg => {
                  const isAdmin = msg.senderRole === 'admin';
                  return (
                    <div
                      key={msg.id}
                      className={`p-3.5 rounded-xl text-xs space-y-1 ${
                        isAdmin
                          ? 'bg-blue-50/80 border border-blue-100 mr-4'
                          : 'bg-amber-50/80 border border-amber-200 ml-4'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#0F2A4A] flex items-center gap-1.5">
                          {isAdmin ? (
                            <span className="px-1.5 py-0.2 bg-[#0F2A4A] text-white rounded text-[10px]">
                              Admin (You)
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 bg-amber-600 text-white rounded text-[10px]">
                              Applicant
                            </span>
                          )}
                          <span>{msg.senderName}</span>
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">{msg.timestamp}</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{msg.text}</p>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSendMessage} className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder={`Type a note or message to ${request.alumniName}...`}
                className="grow px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F2A4A] outline-hidden"
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="px-4 py-2 bg-[#0F2A4A] hover:bg-[#1a3d66] disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Note</span>
              </button>
            </form>
          </div>

          {/* Audit Trail Log */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <h3 className="text-sm font-bold text-[#0F2A4A] uppercase tracking-wider mb-3">
              Immutable Audit Trail
            </h3>

            <div className="space-y-3">
              {request.auditLog.map(log => (
                <div key={log.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-[#0F2A4A] mt-1.5 shrink-0" />
                  <div className="grow">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">{log.action}</span>
                      <span className="text-[11px] text-gray-400 font-mono">{log.timestamp}</span>
                    </div>
                    <p className="text-gray-600 mt-0.5">{log.details}</p>
                    <span className="text-[10px] text-gray-400">By {log.performedBy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Assignment, Remarks, Payment Info */}
        <div className="space-y-6">
          {/* Staff Assignment & Urgency */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0F2A4A] uppercase tracking-wider border-b border-gray-100 pb-2">
              Desk Responsibility
            </h3>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Assigned Staff Member
              </label>
              <select
                value={request.assignedStaffName || ''}
                onChange={e => {
                  const s = staffMembers.find(st => st.name === e.target.value);
                  assignStaff(request.id, s?.id || 'staff-1', e.target.value);
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#0F2A4A] outline-hidden"
              >
                <option value="">Unassigned</option>
                {staffMembers.map(s => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 border-t border-gray-100 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Target SLA Date:</span>
                <span className="font-bold text-[#0F2A4A]">{request.estimatedDelivery}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Urgency:</span>
                <span className="font-bold text-amber-700">{request.urgency} SLA</span>
              </div>
            </div>
          </div>

          {/* Internal Administrative Remarks */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-sm font-bold text-[#0F2A4A] uppercase tracking-wider">
                Admin Remarks
              </h3>
              {isRemarksSaved && (
                <span className="text-[10px] text-emerald-600 font-bold">Saved!</span>
              )}
            </div>

            <p className="text-xs text-gray-500">
              Visible on applicant receipt and status updates.
            </p>

            <textarea
              rows={3}
              value={remarksText}
              onChange={e => setRemarksText(e.target.value)}
              placeholder="e.g. Records verified with CSE Exam Cell. Transcript ready for sealing."
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F2A4A] outline-hidden"
            />

            <button
              type="button"
              onClick={handleSaveRemarks}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors"
            >
              Update Remarks
            </button>
          </div>

          {/* Payment Details */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#0F2A4A] uppercase tracking-wider border-b border-gray-100 pb-2">
              Financial Status
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Charged:</span>
                <span className="font-extrabold text-[#0F2A4A] text-sm">৳{request.payment.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Channel:</span>
                <span className="font-bold text-gray-800">{request.payment.method}</span>
              </div>
              {request.payment.transactionId && (
                <div className="flex justify-between">
                  <span className="text-gray-400">TrxID:</span>
                  <span className="font-mono font-bold text-blue-900">{request.payment.transactionId}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="text-gray-400">Audit Status:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                    request.payment.isVerified
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {request.payment.isVerified ? 'Accounts Verified' : 'Awaiting Audit'}
                </span>
              </div>
            </div>
          </div>

          {/* Applicant Dossier */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#0F2A4A] uppercase tracking-wider border-b border-gray-100 pb-2">
              Applicant Dossier
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-gray-400 block">Full Name:</span>
                <span className="font-bold text-gray-900">{request.alumniName}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-400 block">Student ID:</span>
                  <span className="font-bold text-gray-900">{request.baustId}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Department:</span>
                  <span className="font-bold text-gray-900">{request.department}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-400 block">Batch:</span>
                  <span className="font-semibold">{request.batch}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Grad Year:</span>
                  <span className="font-semibold">{request.passingYear}</span>
                </div>
              </div>
              <div>
                <span className="text-gray-400 block">Contact Phone:</span>
                <span className="font-semibold">{request.alumniPhone}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Official Email:</span>
                <span className="font-semibold">{request.alumniEmail}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Purpose:</span>
                <p className="bg-gray-50 p-2 rounded-lg text-gray-700">{request.services[0]?.purpose}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Required Modal */}
      <ActionRequiredModal
        isOpen={isActionReqOpen}
        onClose={() => setIsActionReqOpen(false)}
        request={request}
        onConfirmActionRequired={note => {
          requestMoreInfo(request.id, note, adminName);
        }}
      />

      {/* Reject Modal */}
      <RejectRequestModal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        request={request}
        onConfirmReject={(reason, remarks) => {
          rejectRequest(request.id, reason, remarks, adminName);
        }}
      />

      {/* Digital Document Viewer Modal */}
      <DigitalDocumentViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        request={request}
      />

      {/* Courier Dispatch Prompt Modal */}
      {isDispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#C9A227]" />
              <h3 className="text-base font-bold text-[#0F2A4A]">Dispatch Consignment</h3>
            </div>
            <p className="text-xs text-gray-500">
              Provide courier dispatch details so {request.alumniName} can track the physical envelope.
            </p>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Courier Service Name
              </label>
              <select
                value={courierService}
                onChange={e => setCourierService(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white"
              >
                <option value="Sundarban Courier Service">Sundarban Courier Service</option>
                <option value="SA Paribahan">SA Paribahan</option>
                <option value="DHL Express International">DHL Express International</option>
                <option value="FedEx International">FedEx International</option>
                <option value="Campus Pickup Counter">Campus Pickup Counter</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Consignment / Tracking Number
              </label>
              <input
                type="text"
                value={courierTrackNo}
                onChange={e => setCourierTrackNo(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDispatchModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDispatch}
                className="px-5 py-2 text-xs font-bold text-white bg-[#0F2A4A] hover:bg-[#1a3d66] rounded-xl flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
