import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Printer,
  Send,
  ShieldCheck,
  RotateCcw,
  Truck,
  Save,
  Download,
} from 'lucide-react';
import { useAdminDeskStore } from '../../../hooks/useAdminDeskStore';
import { useApp } from '../../../context/AppContext';
import { DOC_STAGES } from '../../../constants/baustDataModel';
import { RequestTimeline } from '../../../components/admindesk/RequestTimeline';
import { RejectRequestModal } from '../../../components/admindesk/RejectRequestModal';
import { DigitalDocumentViewer } from '../../../components/admindesk/DigitalDocumentViewer';
import { Modal } from '../../../components/ui/Modal';

export const AdminRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, allUsers } = useApp();
  const adminName = currentUser?.name || 'Controller of Examinations Desk';

  const {
    requests,
    advanceDocumentStage,
    undoLastDocumentStage,
    rejectDocumentRequest,
    updateDocumentDeliveryInfo,
    assignStaff,
    sendMessageOnRequest,
    staffMembers,
  } = useAdminDeskStore();

  const request = requests.find((r) => r.id === id);

  // Action modals & submitting locks
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [advanceNote, setAdvanceNote] = useState('');
  const [isAdvancing, setIsAdvancing] = useState(false);

  const [isUndoModalOpen, setIsUndoModalOpen] = useState(false);
  const [undoReason, setUndoReason] = useState('');
  const [isUndoing, setIsUndoing] = useState(false);

  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Delivery info form state (used at Ready / Delivered stages)
  const [deliveryNote, setDeliveryNote] = useState('');
  const [deliveryLink, setDeliveryLink] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [isSavingDelivery, setIsSavingDelivery] = useState(false);

  // Message reply
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    setDeliveryNote(request?.deliveryInfo?.note || '');
    setDeliveryLink(request?.deliveryInfo?.link || request?.deliveryUrl || '');
    setPickupLocation(
      request?.deliveryInfo?.pickupLocation ||
        request?.pickupInfo ||
        request?.delivery?.pickupInfo ||
        ''
    );
  }, [
    request?.id,
    request?.deliveryInfo?.note,
    request?.deliveryInfo?.link,
    request?.deliveryInfo?.pickupLocation,
    request?.deliveryUrl,
    request?.pickupInfo,
    request?.delivery?.pickupInfo,
  ]);

  // Pull real requester Firestore profile from allUsers
  const requesterProfile = useMemo(() => {
    if (!request) return undefined;
    return allUsers.find(
      (u) => u.uid === request.alumniId || (request.alumniEmail && u.email === request.alumniEmail)
    );
  }, [allUsers, request]);

  if (!request) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center max-w-md shadow-sm">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900">Request Not Found</h2>
          <p className="text-xs text-gray-500 mt-1">
            Document request ID "{id}" does not exist or is still loading.
          </p>
          <button
            onClick={() => navigate('/admin/admin-desk?tab=requests')}
            className="mt-5 px-4 py-2 bg-[#0F2A4A] text-white text-xs font-bold rounded-xl"
          >
            Return to Document Requests
          </button>
        </div>
      </div>
    );
  }

  const isRejected = request.status === 'Rejected';
  const isCancelled = request.status === 'Cancelled';
  const allDone = Boolean(request.stages?.length === DOC_STAGES.length && request.stages.every((s) => s.status === 'done'));
  const currentStageIndex =
    typeof request.currentStageIndex === 'number' ? request.currentStageIndex : 1;
  const currentStageDef = DOC_STAGES[currentStageIndex] || DOC_STAGES[1];
  const canAdvance = !isRejected && !isCancelled && !allDone;
  const canUndo =
    !isRejected &&
    !isCancelled &&
    Boolean(request.stages?.slice(1).some((s) => s.status === 'done'));
  const showDeliveryForm =
    !isRejected && !isCancelled && (currentStageIndex >= 4 || allDone);

  // Clean role-aware requester details (zero fake fallbacks)
  const reqRole = requesterProfile?.role || request.applicantRole || 'student';
  const reqName = requesterProfile?.name || request.alumniName;
  const reqEmail = requesterProfile?.email || request.alumniEmail || '';
  const rawPhone = requesterProfile?.phone || request.alumniPhone || '';
  const reqPhone = rawPhone === '+880 1700-000000' ? '' : rawPhone;
  const reqDept = requesterProfile?.department || request.department || '';
  const reqBaustId =
    requesterProfile?.studentId || requesterProfile?.baustId || request.baustId || '';
  const reqBatch = requesterProfile?.batch || request.batch || '';
  const reqPassingYear =
    typeof requesterProfile?.passingYear === 'number' && requesterProfile.passingYear > 0
      ? requesterProfile.passingYear
      : typeof request.passingYear === 'number' && request.passingYear > 0
      ? request.passingYear
      : 0;
  const reqCgpa =
    typeof requesterProfile?.cgpa === 'number' && requesterProfile.cgpa > 0
      ? requesterProfile.cgpa
      : typeof request.cgpa === 'number' && request.cgpa > 0
      ? request.cgpa
      : 0;

  const handleConfirmAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdvancing || !canAdvance) return;
    setIsAdvancing(true);
    const res = await advanceDocumentStage(
      request.id,
      currentStageIndex,
      advanceNote,
      currentStageIndex >= 4
        ? {
            note: deliveryNote,
            link: deliveryLink,
            pickupLocation,
          }
        : undefined
    );
    setIsAdvancing(false);
    if (res.success) {
      setAdvanceNote('');
      setIsAdvanceModalOpen(false);
    }
  };

  const handleConfirmUndo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUndoing || !undoReason.trim()) return;
    setIsUndoing(true);
    const res = await undoLastDocumentStage(request.id, undoReason);
    setIsUndoing(false);
    if (res.success) {
      setUndoReason('');
      setIsUndoModalOpen(false);
    }
  };

  const handleSaveDeliveryInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingDelivery) return;
    setIsSavingDelivery(true);
    await updateDocumentDeliveryInfo(request.id, {
      note: deliveryNote,
      link: deliveryLink,
      pickupLocation,
    });
    setIsSavingDelivery(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    sendMessageOnRequest(request.id, 'admin', adminName, replyText.trim());
    setReplyText('');
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
            <span>Back to Document Requests</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="font-mono text-xs font-bold bg-[#C9A227] text-white px-2.5 py-0.5 rounded-md">
                  {request.id}
                </span>
                <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-white/20 text-white">
                  {isRejected
                    ? 'Rejected'
                    : isCancelled
                    ? 'Cancelled'
                    : allDone
                    ? 'Step 6 of 6: Delivered'
                    : `Step ${currentStageIndex + 1} of 6: ${currentStageDef.label}`}
                </span>
              </div>

              <h1 className="text-xl md:text-2xl font-black text-white">
                {request.services.map((s) => s.serviceName).join(', ')}
              </h1>
              <p className="text-xs text-white/70 mt-0.5">
                Requester: <strong className="text-white">{reqName}</strong> &bull; Submitted {request.submittedAt}
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
        {/* Left Column: Action Panel, Live 6-Stage Stepper, Delivery Info & Thread */}
        <div className="lg:col-span-2 space-y-6">
          {/* Focused Stage Control Bar — ONE primary advance CTA + Reject + Undo */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Admin Stage Control
                </h3>
                <p className="text-sm font-bold text-[#0F2A4A] mt-0.5">
                  {isRejected
                    ? 'This request has been rejected.'
                    : isCancelled
                    ? 'This request was cancelled by the requester.'
                    : allDone
                    ? 'All 6 stages completed & delivered.'
                    : `Current Stage (${currentStageIndex + 1}/6): ${currentStageDef.label}`}
                </p>
              </div>
              {canUndo && (
                <button
                  type="button"
                  onClick={() => setIsUndoModalOpen(true)}
                  disabled={isUndoing}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 inline-flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Undo last step</span>
                </button>
              )}
            </div>

            {(canAdvance || (!isRejected && !isCancelled && !allDone)) && (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {canAdvance && (
                  <button
                    type="button"
                    disabled={isAdvancing}
                    onClick={() => setIsAdvanceModalOpen(true)}
                    className="px-5 py-2.5 bg-[#0F2A4A] hover:bg-[#1a3d66] disabled:opacity-50 text-white font-bold text-xs rounded-xl inline-flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Mark &apos;{currentStageDef.label}&apos; as Done</span>
                  </button>
                )}

                {!isRejected && !isCancelled && !allDone && (
                  <button
                    type="button"
                    onClick={() => setIsRejectOpen(true)}
                    className="px-4 py-2.5 text-rose-600 hover:bg-rose-50 border border-rose-200 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject request</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Delivery Info Form (Stage 5 Ready / Stage 6 Delivered) */}
          {showDeliveryForm && (
            <form
              onSubmit={handleSaveDeliveryInfo}
              className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-3"
            >
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <Truck className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-[#0F2A4A]">
                  Delivery &amp; Pickup Information (Visible to Requester)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Pickup Location / Courier Info
                  </label>
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="e.g. Exam Controller Counter 2, Admin Building"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#0F2A4A] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Soft Copy / Tracking Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={deliveryLink}
                    onChange={(e) => setDeliveryLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#0F2A4A] outline-hidden"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block font-bold text-gray-700 mb-1">Delivery Note</label>
                <textarea
                  rows={2}
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="Instructions for pickup hours, tracking number, or verified digital download..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#0F2A4A] outline-hidden"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingDelivery}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingDelivery ? 'Saving...' : 'Save Delivery Info'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Live 6-Stage Stepper */}
          <RequestTimeline request={request} />

          {/* Digital Deliverable Preview (if present) */}
          {request.finalDeliverable && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0F2A4A] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Digital Certificate Specimen
                </h3>
                <span className="text-xs font-mono text-gray-500">
                  Doc #: {request.finalDeliverable.documentNumber}
                </span>
              </div>
              <button
                onClick={() => setIsViewerOpen(true)}
                className="px-4 py-2 bg-[#0F2A4A] text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> View Specimen
              </button>
            </div>
          )}

          {/* Communication Thread */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <h3 className="text-base font-bold text-[#0F2A4A] mb-1">
              Communication Thread with Requester
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Send clarifications or updates to {reqName}. They receive a notification immediately.
            </p>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {request.messages.length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-xl text-center text-xs text-gray-500">
                  No messages exchanged yet.
                </div>
              ) : (
                request.messages.map((msg) => {
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
                            <span className="px-1.5 py-0.5 bg-[#0F2A4A] text-white rounded text-[10px]">
                              Admin
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-amber-600 text-white rounded text-[10px]">
                              Requester
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
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Type a message to ${reqName}...`}
                className="grow px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F2A4A] outline-hidden"
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="px-4 py-2 bg-[#0F2A4A] hover:bg-[#1a3d66] disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>

          {/* Persisted Status History Log */}
          {request.statusHistory && request.statusHistory.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
              <h3 className="text-sm font-bold text-[#0F2A4A] uppercase tracking-wider mb-3">
                Stage Audit History
              </h3>
              <div className="space-y-2.5">
                {request.statusHistory.map((h, idx) => (
                  <div
                    key={`${h.at}-${idx}`}
                    className="flex items-start justify-between gap-3 text-xs border-b border-gray-100 last:border-0 pb-2 last:pb-0"
                  >
                    <div>
                      <span className="font-bold text-[#0F2A4A]">{h.status}</span>
                      {h.note && <p className="text-gray-600 mt-0.5">{h.note}</p>}
                      {(h.byName || h.by) && (
                        <span className="text-[10px] text-gray-400">By {h.byName || h.by}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono shrink-0">
                      {new Date(h.at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Clean Request Details, Financial & Desk Assignment */}
        <div className="space-y-6">
          {/* Role-Appropriate Request Details (Real Firestore data, no fake defaults) */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-sm font-bold text-[#0F2A4A] uppercase tracking-wider">
                Request Details
              </h3>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {reqRole}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-gray-400 block">Requester Name</span>
                <span className="font-bold text-gray-900">{reqName}</span>
              </div>

              {reqRole === 'student' && reqBaustId && (
                <div>
                  <span className="text-gray-400 block">Student ID</span>
                  <span className="font-mono font-bold text-gray-900">{reqBaustId}</span>
                </div>
              )}

              {reqRole === 'alumni' && reqBaustId && (
                <div>
                  <span className="text-gray-400 block">Alumni BAUST ID</span>
                  <span className="font-mono font-bold text-gray-900">{reqBaustId}</span>
                </div>
              )}

              {reqDept && (
                <div>
                  <span className="text-gray-400 block">Department</span>
                  <span className="font-bold text-gray-900">{reqDept}</span>
                </div>
              )}

              {reqBatch && (
                <div>
                  <span className="text-gray-400 block">Batch</span>
                  <span className="font-semibold text-gray-900">{reqBatch}</span>
                </div>
              )}

              {reqPassingYear > 0 && (
                <div>
                  <span className="text-gray-400 block">Graduation Year</span>
                  <span className="font-semibold text-gray-900">{reqPassingYear}</span>
                </div>
              )}

              {reqCgpa > 0 && (
                <div>
                  <span className="text-gray-400 block">CGPA</span>
                  <span className="font-semibold text-gray-900">{reqCgpa.toFixed(2)} / 4.00</span>
                </div>
              )}

              {reqPhone && (
                <div>
                  <span className="text-gray-400 block">Contact Phone</span>
                  <span className="font-semibold text-gray-900">{reqPhone}</span>
                </div>
              )}

              {reqEmail && (
                <div>
                  <span className="text-gray-400 block">Official Email</span>
                  <span className="font-semibold text-gray-900 break-all">{reqEmail}</span>
                </div>
              )}

              <div>
                <span className="text-gray-400 block">Delivery Method</span>
                <span className="font-semibold text-[#0F2A4A]">{request.delivery.method}</span>
              </div>

              {request.delivery.courierAddress && (
                <div>
                  <span className="text-gray-400 block">Delivery Address</span>
                  <p className="bg-gray-50 p-2 rounded-lg text-gray-700 mt-0.5">
                    {request.delivery.courierAddress}
                  </p>
                </div>
              )}

              {request.services[0]?.purpose && (
                <div>
                  <span className="text-gray-400 block">Purpose</span>
                  <p className="bg-gray-50 p-2 rounded-lg text-gray-700 mt-0.5">
                    {request.services[0].purpose}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#0F2A4A] uppercase tracking-wider border-b border-gray-100 pb-2">
              Payment Info
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Amount</span>
                <span className="font-extrabold text-[#0F2A4A] text-sm">
                  BDT {request.payment.totalAmount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Channel</span>
                <span className="font-bold text-gray-800">{request.payment.method}</span>
              </div>
              {request.payment.transactionId && (
                <div className="flex justify-between">
                  <span className="text-gray-400">TrxID</span>
                  <span className="font-mono font-bold text-blue-900">
                    {request.payment.transactionId}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="text-gray-400">Verification</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                    request.payment.isVerified
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {request.payment.isVerified ? 'Verified by Admin' : 'Pending Admin Verification'}
                </span>
              </div>
            </div>
          </div>

          {/* Desk Assignment */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#0F2A4A] uppercase tracking-wider border-b border-gray-100 pb-2">
              Desk Assignment
            </h3>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Assigned Officer
              </label>
              <select
                value={request.assignedStaffName || ''}
                onChange={(e) => {
                  const s = staffMembers.find((st) => st.name === e.target.value);
                  assignStaff(request.id, s?.id || 'staff-1', e.target.value);
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#0F2A4A] outline-hidden"
              >
                <option value="">Unassigned</option>
                {staffMembers.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Advance Stage Confirmation Modal */}
      <Modal
        isOpen={isAdvanceModalOpen}
        onClose={() => !isAdvancing && setIsAdvanceModalOpen(false)}
        title={`Complete Stage: ${currentStageDef.label}`}
        description={`Request #${request.id} • Step ${currentStageIndex + 1} of 6`}
        maxWidth="sm"
      >
        <form onSubmit={handleConfirmAdvance} className="space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Confirm marking <strong>{currentStageDef.label}</strong> as done. The requester will be notified immediately.
          </p>
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Optional Note for Requester
            </label>
            <textarea
              rows={2}
              value={advanceNote}
              onChange={(e) => setAdvanceNote(e.target.value)}
              placeholder={`e.g. Verified by ${adminName}...`}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0F2A4A] outline-hidden"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={isAdvancing}
              onClick={() => setIsAdvanceModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAdvancing}
              className="px-5 py-2 rounded-xl bg-[#0F2A4A] hover:bg-[#1a3d66] disabled:opacity-50 text-white font-bold"
            >
              {isAdvancing ? 'Updating...' : 'Confirm & Mark Done'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Undo Last Step Modal (Requires Reason) */}
      <Modal
        isOpen={isUndoModalOpen}
        onClose={() => !isUndoing && setIsUndoModalOpen(false)}
        title="Undo Last Completed Stage"
        description={`Request #${request.id}`}
        maxWidth="sm"
      >
        <form onSubmit={handleConfirmUndo} className="space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Reverting the last completed stage moves the request back to that step and logs your reason in the audit history.
          </p>
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Reason for Undo (Required)
            </label>
            <textarea
              rows={2}
              required
              value={undoReason}
              onChange={(e) => setUndoReason(e.target.value)}
              placeholder="Explain why this stage needs to be reverted..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0F2A4A] outline-hidden"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={isUndoing}
              onClick={() => setIsUndoModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUndoing || !undoReason.trim()}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold"
            >
              {isUndoing ? 'Reverting...' : 'Confirm Undo'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reject Modal */}
      <RejectRequestModal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        request={request}
        onConfirmReject={(reason, remarks) => {
          void rejectDocumentRequest(request.id, reason, remarks);
        }}
      />

      {/* Digital Document Viewer Modal */}
      <DigitalDocumentViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        request={request}
      />
    </div>
  );
};
