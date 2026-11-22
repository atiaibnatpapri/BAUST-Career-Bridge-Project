import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Download,
  AlertTriangle,
  Send,
  Truck,
  Building,
  Star,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useAdminDeskStore } from '../../../hooks/useAdminDeskStore';
import { useApp } from '../../../context/AppContext';
import { DOC_STAGES } from '../../../constants/baustDataModel';
import { RequestTimeline } from '../../../components/admindesk/RequestTimeline';
import { DigitalDocumentViewer } from '../../../components/admindesk/DigitalDocumentViewer';
import { RequestStepperModal } from '../../../components/admindesk/RequestStepperModal';
import { Modal } from '../../../components/ui/Modal';

export const AlumniRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, allUsers } = useApp();
  const deskBase =
    currentUser?.role === 'student' || location.pathname.startsWith('/student')
      ? '/student'
      : '/alumni';

  const {
    requests,
    sendMessageOnRequest,
    rateRequest,
    cancelRequest,
    services,
  } = useAdminDeskStore();

  const request = requests.find((r) => r.id === id);

  const [replyText, setReplyText] = useState('');
  const [selectedStars, setSelectedStars] = useState(request?.rating?.score || 5);
  const [ratingComment, setRatingComment] = useState(request?.rating?.comment || '');
  const [hasRated, setHasRated] = useState(Boolean(request?.rating));
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isReapplyOpen, setIsReapplyOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (request?.rating) {
      setSelectedStars(request.rating.score);
      setRatingComment(request.rating.comment || '');
      setHasRated(true);
    } else {
      setHasRated(false);
    }
  }, [request?.id, request?.rating]);

  // Real Firestore profile of requester (for clean role-appropriate fields)
  const requesterProfile = useMemo(() => {
    if (!request) return undefined;
    return (
      allUsers.find((u) => u.uid === request.alumniId) ||
      (currentUser?.id === request.alumniId ? (currentUser as any) : undefined)
    );
  }, [allUsers, request, currentUser]);

  if (!request) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center max-w-md shadow-sm">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900">Request Not Found</h2>
          <p className="text-xs text-gray-500 mt-1">
            Document request ID "{id}" could not be found in your records.
          </p>
          <button
            onClick={() => navigate(`${deskBase}/admin-desk?tab=requests`)}
            className="mt-5 px-4 py-2 bg-[#0F2A4A] text-white text-xs font-bold rounded-xl"
          >
            Back to Document Requests
          </button>
        </div>
      </div>
    );
  }

  const currentStageIndex =
    typeof request.currentStageIndex === 'number' ? request.currentStageIndex : 1;
  const currentStageDef = DOC_STAGES[currentStageIndex] || DOC_STAGES[1];
  const isCompleted =
    request.status === 'Delivered' ||
    request.status === 'Ready' ||
    currentStageIndex >= 4;
  // Stage-2-only cancel rule: permitted only while payment verification is still pending (stage index <= 1)
  const isCancellable =
    currentStageIndex <= 1 &&
    !['Rejected', 'Cancelled', 'Delivered', 'Ready'].includes(request.status);

  const matchedService = services.find((s) => s.name === request.services[0]?.serviceName);

  // Clean role-aware requester details (zero fake fallbacks)
  const reqRole = requesterProfile?.role || request.applicantRole || currentUser?.role || 'student';
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

  const effectiveDeliveryLink = request.deliveryInfo?.link || request.deliveryUrl;
  const effectivePickupLocation =
    request.deliveryInfo?.pickupLocation || request.pickupInfo || request.delivery.pickupInfo;
  const effectiveDeliveryNote = request.deliveryInfo?.note;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    sendMessageOnRequest(
      request.id,
      'alumni',
      currentUser?.name || reqName,
      replyText.trim()
    );
    setReplyText('');
  };

  const confirmCancelRequest = async () => {
    if (isCancelling) return;
    setIsCancelling(true);
    const res = await cancelRequest(request.id);
    setIsCancelling(false);
    if (res.success) {
      setIsCancelModalOpen(false);
    }
  };

  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();
    rateRequest(request.id, selectedStars, ratingComment);
    setHasRated(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-20">
      {/* Header Bar */}
      <div className="bg-[#0F2A4A] text-white px-4 md:px-8 py-6 border-b border-white/10 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(`${deskBase}/admin-desk?tab=requests`)}
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
                <span
                  className={`text-xs font-bold px-3 py-0.5 rounded-full ${
                    request.status === 'Delivered'
                      ? 'bg-emerald-400 text-emerald-950'
                      : request.status === 'Ready'
                      ? 'bg-green-400 text-green-950'
                      : request.status === 'Rejected'
                      ? 'bg-red-400 text-white'
                      : request.status === 'Cancelled'
                      ? 'bg-slate-400 text-slate-950'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {request.status === 'Rejected' || request.status === 'Cancelled'
                    ? request.status
                    : request.status === 'Delivered'
                    ? 'Step 6 of 6: Delivered'
                    : `Step ${currentStageIndex + 1} of 6: ${currentStageDef.label}`}
                </span>
              </div>

              <h1 className="text-xl md:text-2xl font-black text-white">
                {request.services.map((s) => s.serviceName).join(', ')}
              </h1>
              <p className="text-xs text-white/70 mt-0.5">
                Submitted {request.submittedAt} &bull; Estimated turnaround:{' '}
                <span className="text-[#C9A227] font-semibold">{request.estimatedDelivery}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 border border-white/20 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
              {isCancellable && (
                <button
                  onClick={() => setIsCancelModalOpen(true)}
                  className="px-3.5 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-red-500/30 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Cancel Request</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Read-Only 6-Stage Stepper, Delivery Output & Thread */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stamped Live 6-Step Timeline */}
          <RequestTimeline
            request={request}
            onReApply={() => setIsReapplyOpen(true)}
          />

          {/* Delivery Info Box (Admin note, pickup location, clickable download link) */}
          {(effectiveDeliveryNote || effectiveDeliveryLink || effectivePickupLocation || isCompleted) && (
            <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-[#0F2A4A] flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Delivery &amp; Collection Updates
                  </h3>
                  <p className="text-xs text-gray-500">
                    Updated directly by the Office of the Controller of Examinations
                  </p>
                </div>
                {isCompleted && (
                  <button
                    onClick={() => setIsViewerOpen(true)}
                    className="px-4 py-2 bg-[#2E5E3E] hover:bg-[#234930] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>View Certificate Specimen</span>
                  </button>
                )}
              </div>

              {effectiveDeliveryNote && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <span className="font-bold text-[#0F2A4A] block mb-0.5">Delivery Note</span>
                  {effectiveDeliveryNote}
                </div>
              )}

              {effectivePickupLocation && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
                  <Building className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Pickup / Dispatch Location</span>
                    {effectivePickupLocation}
                  </div>
                </div>
              )}

              {effectiveDeliveryLink && /^https?:\/\//i.test(effectiveDeliveryLink) && (
                <a
                  href={effectiveDeliveryLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F2A4A] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3.5 py-2 rounded-xl transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Official Digital Document Link
                </a>
              )}
            </div>
          )}

          {/* Communication Thread */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <h3 className="text-base font-bold text-[#0F2A4A] mb-1">
              Communication Thread with Admin Desk
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Questions or clarifications exchanged regarding this request.
            </p>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {request.messages.length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-xl text-center text-xs text-gray-500">
                  No direct messages yet. Send a note below if you have questions.
                </div>
              ) : (
                request.messages.map((msg) => {
                  const isAdmin = msg.senderRole === 'admin';
                  return (
                    <div
                      key={msg.id}
                      className={`p-3.5 rounded-xl text-xs space-y-1 ${
                        isAdmin
                          ? 'bg-blue-50/80 border border-blue-100 ml-4'
                          : 'bg-gray-100/80 border border-gray-200 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#0F2A4A] flex items-center gap-1.5">
                          {isAdmin ? (
                            <span className="px-1.5 py-0.5 bg-[#0F2A4A] text-white rounded text-[10px]">
                              Admin Desk
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-gray-600 text-white rounded text-[10px]">
                              You
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
                placeholder="Ask a question about your document request..."
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

          {/* Rating Section (If Ready or Delivered) */}
          {isCompleted && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
              <h3 className="text-base font-bold text-[#0F2A4A] mb-1">
                Rate Service &amp; Turnaround Quality
              </h3>
              {hasRated ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 mt-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Thank you! Your {selectedStars}-star rating has been saved.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmitRating} className="space-y-3 mt-3">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedStars(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= selectedStars ? 'text-[#C9A227] fill-[#C9A227]' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-gray-700 ml-2">{selectedStars} of 5 Stars</span>
                  </div>
                  <input
                    type="text"
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    placeholder="Optional feedback..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F2A4A] outline-hidden"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0F2A4A] hover:bg-[#1a3d66] text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Submit Feedback
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Clean Request Details, Delivery Logistics & Payment Summary */}
        <div className="space-y-6">
          {/* Request Details Card (Real Firestore profile, hide empty fields, no fake defaults) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3">
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
                <span className="text-gray-400 block font-medium">Applicant Name</span>
                <span className="font-semibold text-gray-900">{reqName}</span>
              </div>

              {reqRole === 'student' && reqBaustId && (
                <div>
                  <span className="text-gray-400 block font-medium">Student ID</span>
                  <span className="font-mono font-semibold text-gray-900">{reqBaustId}</span>
                </div>
              )}

              {reqRole === 'alumni' && reqBaustId && (
                <div>
                  <span className="text-gray-400 block font-medium">Alumni ID</span>
                  <span className="font-mono font-semibold text-gray-900">{reqBaustId}</span>
                </div>
              )}

              {reqDept && (
                <div>
                  <span className="text-gray-400 block font-medium">Department</span>
                  <span className="font-semibold text-gray-900">{reqDept}</span>
                </div>
              )}

              {(reqBatch || reqPassingYear > 0) && (
                <div>
                  <span className="text-gray-400 block font-medium">Batch / Graduation</span>
                  <span className="font-semibold text-gray-900">
                    {[reqBatch, reqPassingYear > 0 ? String(reqPassingYear) : '']
                      .filter(Boolean)
                      .join(' • ')}
                  </span>
                </div>
              )}

              {reqPhone && (
                <div>
                  <span className="text-gray-400 block font-medium">Contact Phone</span>
                  <span className="font-semibold text-gray-900">{reqPhone}</span>
                </div>
              )}

              {reqEmail && (
                <div>
                  <span className="text-gray-400 block font-medium">Email Address</span>
                  <span className="font-semibold text-gray-900 break-all">{reqEmail}</span>
                </div>
              )}

              {request.services[0]?.purpose && (
                <div>
                  <span className="text-gray-400 block font-medium">Purpose</span>
                  <span className="font-medium text-gray-800 bg-gray-50 p-2 rounded-lg block mt-0.5">
                    {request.services[0].purpose}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Logistics */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#0F2A4A] uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#C9A227]" />
              Delivery Information
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-gray-400 block font-medium">Delivery Channel</span>
                <span className="font-bold text-[#0F2A4A]">{request.delivery.method}</span>
              </div>

              {request.delivery.courierAddress && (
                <div>
                  <span className="text-gray-400 block font-medium">Recipient Address</span>
                  <p className="font-medium text-gray-800 bg-gray-50 p-2 rounded-lg mt-0.5">
                    {request.delivery.courierAddress}
                  </p>
                </div>
              )}

              {request.delivery.pickupTimeSlot && (
                <div>
                  <span className="text-gray-400 block font-medium">Requested Slot</span>
                  <span className="font-medium text-gray-800">{request.delivery.pickupTimeSlot}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#0F2A4A] uppercase tracking-wider border-b border-gray-100 pb-2">
              Payment Summary
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between font-bold text-sm text-[#0F2A4A]">
                <span>Total Amount</span>
                <span>৳{request.payment.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="font-bold text-gray-800">{request.payment.method}</span>
              </div>
              {request.payment.transactionId && (
                <div className="flex justify-between">
                  <span className="text-gray-500">TrxID</span>
                  <span className="font-mono font-bold text-gray-900">{request.payment.transactionId}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="text-gray-500">Verification</span>
                <span
                  className={`font-bold ${
                    request.payment.isVerified ? 'text-emerald-600' : 'text-amber-700'
                  }`}
                >
                  {request.payment.isVerified ? 'Verified by Admin' : 'Pending Verification'}
                </span>
              </div>
            </div>
          </div>

          {/* Public Verification */}
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-2">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Public Verification Portal</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-800">
              Employers or universities can verify issued document authenticity using your Tracking ID.
            </p>
            <button
              onClick={() => navigate(`/verify-document?id=${request.id}`)}
              className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition-colors"
            >
              <span>Open Verification Portal</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Digital Document Viewer Modal */}
      <DigitalDocumentViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        request={request}
      />

      {/* Re-apply modal if rejected */}
      <RequestStepperModal
        isOpen={isReapplyOpen}
        onClose={() => setIsReapplyOpen(false)}
        preSelectedService={matchedService || services[0]}
        onSuccessTrack={(newId) => {
          setIsReapplyOpen(false);
          navigate(`${deskBase}/admin-desk/requests/${newId}`);
        }}
      />

      {/* Cancel Request Confirmation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => !isCancelling && setIsCancelModalOpen(false)}
        title="Cancel Document Request"
        description={`Request ID: ${request.id}`}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            You can cancel this request now while Stage 2 (Payment Verification) is still pending. Proceed with cancellation?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={isCancelling}
              onClick={() => setIsCancelModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Keep Request
            </button>
            <button
              type="button"
              disabled={isCancelling}
              onClick={confirmCancelRequest}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-xs font-bold text-white cursor-pointer"
            >
              {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
