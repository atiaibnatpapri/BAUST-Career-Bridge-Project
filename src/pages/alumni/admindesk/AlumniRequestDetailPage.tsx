import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Download,
  AlertTriangle,
  Upload,
  Send,
  Truck,
  Building,
  Star,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useAdminDeskStore } from '../../../hooks/useAdminDeskStore';
import { useApp } from '../../../context/AppContext';
import { RequestTimeline } from '../../../components/admindesk/RequestTimeline';
import { DigitalDocumentViewer } from '../../../components/admindesk/DigitalDocumentViewer';
import { RequestStepperModal } from '../../../components/admindesk/RequestStepperModal';

export const AlumniRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const {
    requests,
    updateRequestStatus,
    sendMessageOnRequest,
    rateRequest,
    reUploadMissingDoc,
    cancelRequest,
    services
  } = useAdminDeskStore();

  const request = requests.find(r => r.id === id);

  // Message input
  const [replyText, setReplyText] = useState('');
  // Action required upload input
  const [reuploadFileName, setReuploadFileName] = useState('');
  const [isSubmittingFix, setIsSubmittingFix] = useState(false);
  // Rating state
  const [selectedStars, setSelectedStars] = useState(request?.rating?.score || 5);
  const [ratingComment, setRatingComment] = useState(request?.rating?.comment || '');
  const [hasRated, setHasRated] = useState(Boolean(request?.rating));
  // Deliverable modal
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  // Re-apply modal
  const [isReapplyOpen, setIsReapplyOpen] = useState(false);

  if (!request) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center max-w-md shadow-sm">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900">Request Not Found</h2>
          <p className="text-xs text-gray-500 mt-1">
            The service request ID "{id}" could not be located in your records.
          </p>
          <button
            onClick={() => navigate('/alumni/admin-desk?tab=requests')}
            className="mt-5 px-4 py-2 bg-[#0F2A4A] text-white text-xs font-bold rounded-xl"
          >
            Back to Admin Desk
          </button>
        </div>
      </div>
    );
  }

  // Handle message sending
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    sendMessageOnRequest(
      request.id,
      'alumni',
      currentUser?.name || request.alumniName,
      replyText.trim()
    );
    setReplyText('');
  };

  // Handle submitting missing action-required document
  const handleSubmitActionRequired = () => {
    if (!reuploadFileName.trim()) return;
    setIsSubmittingFix(true);

    setTimeout(() => {
      reUploadMissingDoc(request.id, {
        id: `doc-${Date.now()}`,
        name: reuploadFileName.trim(),
        size: '1.4 MB',
        type: 'application/pdf',
        url: 'https://example.com/mock-upload.pdf',
        uploadedAt: 'Just now',
        category: 'Supporting Doc'
      });

      setReuploadFileName('');
      setIsSubmittingFix(false);
    }, 400);
  };

  // Handle cancellation
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this service request? Any processed fees might require manual refund verification.')) {
      cancelRequest(request.id);
    }
  };

  // Handle rating submit
  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();
    rateRequest(request.id, selectedStars, ratingComment);
    setHasRated(true);
  };

  const isCompleted = request.status === 'Delivered' || request.status === 'Ready';
  const isCancellable = ['Submitted', 'Payment Verified'].includes(request.status);
  const matchedService = services.find(s => s.name === request.services[0]?.serviceName);

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-20">
      {/* Header Bar */}
      <div className="bg-[#0F2A4A] text-white px-4 md:px-8 py-6 border-b border-white/10 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate('/alumni/admin-desk?tab=requests')}
            className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Requests</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="font-mono text-xs font-bold bg-[#C9A227] text-white px-2.5 py-0.5 rounded-md">
                  {request.id}
                </span>
                <span
                  className={`text-xs font-bold px-3 py-0.5 rounded-full ${
                    request.status === 'Action Required'
                      ? 'bg-amber-400 text-amber-950 font-black animate-pulse'
                      : request.status === 'Delivered'
                      ? 'bg-emerald-400 text-emerald-950'
                      : request.status === 'Ready'
                      ? 'bg-green-400 text-green-950'
                      : request.status === 'Rejected'
                      ? 'bg-red-400 text-white'
                      : 'bg-white/20 text-white'
                  }`}
                >
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
                Submitted on {request.submittedAt} &bull; Expected by:{' '}
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
                  onClick={handleCancel}
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
        {/* Left Column (2 Cols): Timeline & Deliverable & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Action Required Alert Banner */}
          {request.status === 'Action Required' && (
            <div className="bg-gradient-to-r from-amber-50 to-amber-100/70 border-2 border-amber-300 p-5 rounded-2xl shadow-xs">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div className="grow">
                  <h3 className="text-sm font-bold text-amber-900">
                    Action Required by Applicant
                  </h3>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    {request.actionRequiredReason ||
                      'The registrar office requires clarification or an updated document before processing can resume.'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-amber-200">
                    <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1.5">
                      Upload Requested File / Document
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={reuploadFileName}
                        onChange={e => setReuploadFileName(e.target.value)}
                        placeholder="e.g., Clear_Scan_NID_Back.pdf or GD_Copy_2026.pdf"
                        className="grow px-3.5 py-2 text-xs rounded-xl border border-amber-300 bg-white focus:ring-2 focus:ring-amber-500 outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={handleSubmitActionRequired}
                        disabled={!reuploadFileName.trim() || isSubmittingFix}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Submit Fix</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rejected Banner */}
          {request.status === 'Rejected' && (
            <div className="bg-red-50 border-2 border-red-200 p-5 rounded-2xl">
              <div className="flex items-start gap-3">
                <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                <div className="grow">
                  <h3 className="text-sm font-bold text-red-900">Request Rejected by University Admin</h3>
                  <p className="text-xs text-red-700 mt-1">
                    <strong>Reason:</strong> {request.rejectionReason || 'Non-compliance with registrar criteria'}
                  </p>
                  {request.rejectionMessage && (
                    <p className="text-xs text-red-600 mt-1">
                      <strong>Remarks:</strong> {request.rejectionMessage}
                    </p>
                  )}

                  <button
                    onClick={() => setIsReapplyOpen(true)}
                    className="mt-3 px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                  >
                    Re-apply with Corrected Information
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stamped Live 6-Step Timeline */}
          <RequestTimeline
            request={request}
            onReApply={() => setIsReapplyOpen(true)}
            onReUpload={() => {
              const el = document.getElementById('action-reupload-input');
              if (el) el.focus();
            }}
          />

          {/* Official Digital Deliverable Viewer Button / Preview */}
          {isCompleted && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0F2A4A] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Official Digital Document Available
                </h3>
                <p className="text-xs text-gray-500">
                  Certified digital specimen with QR code and cryptographic signatures
                </p>
              </div>
              <button
                onClick={() => setIsViewerOpen(true)}
                className="px-4 py-2 bg-[#2E5E3E] hover:bg-[#234930] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>View & Download Certificate</span>
              </button>
            </div>
          )}

          {/* Interactive Message Thread */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <h3 className="text-base font-bold text-[#0F2A4A] mb-1">
              Communication Thread with Registrar Desk
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              All messages, clarifications, and verification notes are recorded in this audit-stamped thread.
            </p>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {request.messages.length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-xl text-center text-xs text-gray-500">
                  No direct messages yet. Send a note below if you have any questions.
                </div>
              ) : (
                request.messages.map(msg => {
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
                            <span className="px-1.5 py-0.2 bg-[#0F2A4A] text-white rounded text-[10px]">
                              Admin Desk
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 bg-gray-600 text-white rounded text-[10px]">
                              You (Applicant)
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

            {/* Post Message Input */}
            <form onSubmit={handleSendMessage} className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Ask a question or clarify details regarding your request..."
                className="grow px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F2A4A] focus:border-[#0F2A4A] outline-hidden"
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

          {/* Rating Section (If Completed) */}
          {isCompleted && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
              <h3 className="text-base font-bold text-[#0F2A4A] mb-1">
                Rate Service & Turnaround Quality
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Help BAUST Administration enhance official document delivery speeds and service accuracy.
              </p>

              {hasRated ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    Thank you! Your rating of {selectedStars} stars has been recorded.
                  </span>
                </div>
              ) : (
                <form onSubmit={handleSubmitRating} className="space-y-3">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedStars(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= selectedStars
                              ? 'text-[#C9A227] fill-[#C9A227]'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-gray-700 ml-2">
                      {selectedStars} of 5 Stars
                    </span>
                  </div>

                  <input
                    type="text"
                    value={ratingComment}
                    onChange={e => setRatingComment(e.target.value)}
                    placeholder="Optional feedback (e.g., prompt courier dispatch, smooth verification)"
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

        {/* Right Column (1 Col): Request Summary & Logistics */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0F2A4A] uppercase tracking-wider border-b border-gray-100 pb-2">
              Request Details
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-400 block font-medium">Applicant Name</span>
                <span className="font-semibold text-gray-900">{request.alumniName}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-400 block font-medium">Student ID</span>
                  <span className="font-semibold text-gray-900">{request.baustId}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Department</span>
                  <span className="font-semibold text-gray-900">{request.department}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-400 block font-medium">Batch / Year</span>
                  <span className="font-semibold text-gray-900">
                    {request.batch} ({request.passingYear})
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Contact Phone</span>
                  <span className="font-semibold text-gray-900">{request.alumniPhone}</span>
                </div>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Email Address</span>
                <span className="font-semibold text-gray-900">{request.alumniEmail}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Purpose</span>
                <span className="font-medium text-gray-800 bg-gray-50 p-2 rounded-lg block">
                  {request.services[0]?.purpose}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery & Logistics */}
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

              {request.delivery.courierName && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5 mt-2">
                  <div className="font-bold text-[#0F2A4A] flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" /> Courier Dispatched
                  </div>
                  <div>
                    <strong>Service:</strong> {request.delivery.courierName}
                  </div>
                  <div>
                    <strong>Tracking No:</strong>{' '}
                    <span className="font-mono font-bold text-blue-900">
                      {request.delivery.courierTrackingNumber || 'N/A'}
                    </span>
                  </div>
                </div>
              )}

              {request.delivery.pickupTimeSlot && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 mt-2">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" /> Campus Pickup Slot
                  </div>
                  <div className="text-emerald-800">
                    <strong>Time Slot:</strong> {request.delivery.pickupTimeSlot}
                  </div>
                  <div className="text-emerald-800">
                    <strong>Pickup Date:</strong> {request.delivery.pickupDate}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment & Fee Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#0F2A4A] uppercase tracking-wider border-b border-gray-100 pb-2">
              Payment Summary
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Service Subtotal</span>
                <span className="font-semibold text-gray-800">৳{request.payment.subtotal}</span>
              </div>
              {request.payment.urgencyFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-red-600">Urgent Processing Surcharge</span>
                  <span className="font-semibold text-red-600">৳{request.payment.urgencyFee}</span>
                </div>
              )}
              {request.payment.courierFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Courier Shipping</span>
                  <span className="font-semibold text-gray-800">৳{request.payment.courierFee}</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-100 flex justify-between font-bold text-sm text-[#0F2A4A]">
                <span>Total Amount Paid</span>
                <span>৳{request.payment.totalAmount}</span>
              </div>

              <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Method:</span>
                  <span className="font-bold text-gray-800">{request.payment.method}</span>
                </div>
                {request.payment.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">TrxID:</span>
                    <span className="font-mono font-bold text-gray-900">{request.payment.transactionId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Status:</span>
                  <span className="font-bold text-emerald-600">
                    {request.payment.isVerified ? 'Verified by Accounts' : 'Pending Verification'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Public Verification Link */}
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-2">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Public Verification Portal</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-800">
              Foreign universities or employers can verify this document online at any time:
            </p>
            <button
              onClick={() => navigate(`/verify-document?id=${request.id}`)}
              className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition-colors"
            >
              <span>Test Public Verification</span>
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
        onSuccessTrack={newId => {
          setIsReapplyOpen(false);
          navigate(`/alumni/admin-desk/requests/${newId}`);
        }}
      />
    </div>
  );
};
