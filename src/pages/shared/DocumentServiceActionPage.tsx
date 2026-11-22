/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  History,
  Loader2,
  PlusCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAdminDeskStore } from '../../hooks/useAdminDeskStore';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DeliveryMethodType, PaymentMethodType, RequestUrgency } from '../../types/admindesk';

export type DocumentServiceMode = 'new' | 'transcript' | 'certificate' | 'history' | 'clearance';

interface DocumentServiceActionPageProps {
  mode: DocumentServiceMode;
}

const MODE_CONFIG: Record<
  DocumentServiceMode,
  { title: string; subtitle: string; defaultServiceId: string; defaultType: string }
> = {
  new: {
    title: 'New Academic Document Request',
    subtitle: 'Submit a digital request directly to the BAUST Registrar & Controller of Examinations.',
    defaultServiceId: 'srv-transcript',
    defaultType: 'Official Academic Transcript',
  },
  transcript: {
    title: 'Official Academic Transcript Application',
    subtitle: 'Order sealed university transcripts for higher studies, WES verification, or employment.',
    defaultServiceId: 'srv-transcript',
    defaultType: 'Official Academic Transcript',
  },
  certificate: {
    title: 'Provisional / Original Certificate Request',
    subtitle: 'Apply for Provisional Certificate, Original Degree Certificate, or Duplicate Issuance.',
    defaultServiceId: 'srv-provisional',
    defaultType: 'Provisional Certificate',
  },
  clearance: {
    title: 'University Fee Schedule & Clearance Policy',
    subtitle: 'Official BAUST administrative fee matrix, SLA timelines, and departmental clearance rules.',
    defaultServiceId: 'srv-transcript',
    defaultType: 'Official Academic Transcript',
  },
  history: {
    title: 'My Submitted Document Requests',
    subtitle: 'Live Cloud Firestore request tracking and historical records.',
    defaultServiceId: 'srv-transcript',
    defaultType: 'Official Academic Transcript',
  },
};

export const DocumentServiceActionPage: React.FC<DocumentServiceActionPageProps> = ({ mode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const deskBase = location.pathname.startsWith('/student') ? '/student' : '/alumni';

  const { currentUser } = useApp();
  const { userProfile } = useAuth();
  const {
    services,
    documentRequests,
    documentRequestsLoading,
    settings,
    submitQuickDocumentRequest,
  } = useAdminDeskStore();

  const cfg = MODE_CONFIG[mode] || MODE_CONFIG.new;

  const [selectedServiceId, setSelectedServiceId] = useState<string>(cfg.defaultServiceId);
  const [copies, setCopies] = useState<number>(1);
  const [purpose, setPurpose] = useState<string>('Higher Studies Abroad');
  const [urgency, setUrgency] = useState<RequestUrgency>('Normal');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethodType>('Campus Pickup');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('bKash');
  const [transactionId, setTransactionId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedTrackingId, setSubmittedTrackingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const safeServices = useMemo(() => (Array.isArray(services) ? services.filter((s) => s.enabled) : []), [services]);

  const activeService = useMemo(() => {
    return (
      safeServices.find((s) => s.id === selectedServiceId) ||
      safeServices[0] || {
        id: cfg.defaultServiceId,
        name: cfg.defaultType,
        fee: 500,
        perCopyFee: 300,
        urgentFeeExtra: 400,
        expressFeeExtra: 800,
        processingDaysNormal: 7,
        processingDaysUrgent: 3,
        processingDaysExpress: 1,
        maxCopies: 5,
      }
    );
  }, [safeServices, selectedServiceId, cfg.defaultServiceId, cfg.defaultType]);

  const totalFee = useMemo(() => {
    const base = activeService?.fee ?? 500;
    const extraCopies = Math.max(0, copies - 1) * (activeService?.perCopyFee ?? 300);
    const urgencyExtra =
      urgency === 'Urgent'
        ? activeService?.urgentFeeExtra ?? 400
        : urgency === 'Express'
        ? activeService?.expressFeeExtra ?? 800
        : 0;
    const courierFee =
      deliveryMethod === 'Courier (Home Delivery)' ? settings?.courierFeeInsideDhaka ?? 120 : 0;
    return base + extraCopies + urgencyExtra + courierFee;
  }, [activeService, copies, urgency, deliveryMethod, settings]);

  const applicantName = userProfile?.name || currentUser?.name || 'BAUST Member';
  const applicantBaustId = userProfile?.baustId || (currentUser as any)?.studentId || '';
  const applicantDepartment = userProfile?.department || (currentUser as any)?.department || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (deliveryMethod === 'Courier (Home Delivery)' && !deliveryAddress.trim()) {
      setFormError('Please enter your full courier delivery address.');
      return;
    }

    setIsSubmitting(true);
    const res = await submitQuickDocumentRequest({
      type: activeService?.name || cfg.defaultType,
      serviceId: activeService?.id || cfg.defaultServiceId,
      copies,
      purpose,
      urgency,
      deliveryMethod,
      deliveryAddress: deliveryAddress.trim(),
      paymentMethod,
      transactionId: transactionId.trim(),
      fee: totalFee,
    });
    setIsSubmitting(false);

    if (res.success && res.trackingId) {
      setSubmittedTrackingId(res.trackingId);
    } else if (res.error) {
      setFormError(res.error);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-linear-to-r from-[#0F2A4A] via-[#16385F] to-[#2E5E3E] text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Link
              to={`${deskBase}/admin-desk`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Document Services Hub</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{cfg.title}</h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl">{cfg.subtitle}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link to={`${deskBase}/document-requests/history`}>
              <Button variant="outline" size="sm" className="text-white border-white/30 hover:bg-white/10" leftIcon={<History className="w-4 h-4" />}>
                My Request History ({documentRequests.length})
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Mode Navigation Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: 'new', label: 'New Request', to: `${deskBase}/document-requests/new` },
          { key: 'transcript', label: 'Transcript Form', to: `${deskBase}/document-requests/transcript` },
          { key: 'certificate', label: 'Certificate Form', to: `${deskBase}/document-requests/certificate` },
          { key: 'clearance', label: 'Clearance & Fees', to: `${deskBase}/document-requests/clearance` },
          { key: 'history', label: `Live History (${documentRequests.length})`, to: `${deskBase}/document-requests/history` },
        ].map((tab) => (
          <Link
            key={tab.key}
            to={tab.to}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
              mode === tab.key
                ? 'bg-[#0F2A4A] text-white border-[#0F2A4A] shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* CLEARANCE & FEE SCHEDULE VIEW */}
      {mode === 'clearance' && (
        <div className="space-y-6">
          <Card className="p-6 border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#0F2A4A] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#2E5E3E]" />
                  Official BAUST Fee Schedule & Processing SLA
                </h2>
                <p className="text-xs text-slate-500">
                  Standard administrative charges authorized by the Office of the Registrar & Controller of Examinations
                </p>
              </div>
              <Link to={`${deskBase}/document-requests/new`}>
                <Button size="sm" variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
                  Start Application
                </Button>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                    <th className="py-3 px-4">Document / Service</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Base Fee</th>
                    <th className="py-3 px-4">Normal SLA</th>
                    <th className="py-3 px-4">Urgent Extra</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {safeServices.map((srv) => (
                    <tr key={srv.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-bold text-[#0F2A4A]">{srv.name}</td>
                      <td className="py-3 px-4 text-slate-600">{srv.category}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">BDT {srv.fee}</td>
                      <td className="py-3 px-4 text-slate-600">{srv.processingDaysNormal} working days</td>
                      <td className="py-3 px-4 text-amber-700 font-semibold">+BDT {srv.urgentFeeExtra}</td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedServiceId(srv.id);
                            navigate(`${deskBase}/document-requests/new`);
                          }}
                        >
                          Request
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-6 border-slate-200 bg-slate-50/60 space-y-3">
            <h3 className="text-sm font-bold text-[#0F2A4A]">Departmental & Library Clearance Checklist</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
              <li className="p-3 bg-white rounded-xl border border-slate-200">
                <strong className="text-[#0F2A4A] block">1. Central Library Clearance</strong>
                Return all borrowed textbooks & settle any overdue library fines before Provisional Certificate issuance.
              </li>
              <li className="p-3 bg-white rounded-xl border border-slate-200">
                <strong className="text-[#0F2A4A] block">2. Accounts & Tuition Clearance</strong>
                All semester tuition, lab fees, and convocation charges must reflect zero outstanding balance.
              </li>
              <li className="p-3 bg-white rounded-xl border border-slate-200">
                <strong className="text-[#0F2A4A] block">3. Departmental Lab No-Dues</strong>
                Confirm equipment handover with your Departmental Lab Officer (CSE/EEE/ME/CE/IPE).
              </li>
              <li className="p-3 bg-white rounded-xl border border-slate-200">
                <strong className="text-[#0F2A4A] block">4. Provost / Hall Clearance</strong>
                Resident students must attach Hall Clearance slip for Original Degree Certificate applications.
              </li>
            </ul>
          </Card>
        </div>
      )}

      {/* LIVE FIRESTORE REQUEST HISTORY VIEW */}
      {mode === 'history' && (
        <Card className="p-6 border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-[#0F2A4A] flex items-center gap-2">
                <History className="w-5 h-5 text-[#0F2A4A]" />
                Cloud Firestore Document Requests
              </h2>
              <p className="text-xs text-slate-500">
                Persisted document applications synced live for {applicantName} ({applicantBaustId})
              </p>
            </div>
            <Link to={`${deskBase}/document-requests/new`}>
              <Button size="sm" variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
                New Document Request
              </Button>
            </Link>
          </div>

          {documentRequestsLoading ? (
            <div className="py-12 text-center space-y-2">
              <Loader2 className="w-6 h-6 text-[#0F2A4A] animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Loading your document requests from Firestore...</p>
            </div>
          ) : documentRequests.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <div>
                <h3 className="text-sm font-bold text-slate-800">No Document Requests Yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Submit a transcript, provisional certificate, or testimonial request and track it live here.
                </p>
              </div>
              <Link to={`${deskBase}/document-requests/new`}>
                <Button size="sm" variant="primary">Create Your First Request</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {documentRequests.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`${deskBase}/admin-desk/requests/${item.trackingId}`)}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-[#0F2A4A] hover:shadow-sm transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-[#0F2A4A]/10 text-[#0F2A4A] px-2.5 py-0.5 rounded-md">
                        {item.trackingId}
                      </span>
                      <Badge
                        variant={
                          item.status.toLowerCase() === 'ready' || item.status.toLowerCase() === 'delivered'
                            ? 'ready'
                            : item.status.toLowerCase() === 'rejected'
                            ? 'rejected'
                            : 'pending'
                        }
                        size="sm"
                      >
                        {item.status.toUpperCase()}
                      </Badge>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {item.createdAtLabel}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#0F2A4A]">{item.type}</h4>
                    <p className="text-xs text-slate-500">
                      Copies: {item.copies} · Delivery: {item.deliveryMethod} · Purpose: {item.purpose}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-[#0F2A4A]">BDT {item.fee}</span>
                    <Button size="sm" variant="outline">
                      Track
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* REQUEST SUBMISSION FORM (new / transcript / certificate) */}
      {(mode === 'new' || mode === 'transcript' || mode === 'certificate') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 sm:p-7 border-slate-200">
            {submittedTrackingId ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                    Saved to Cloud Firestore
                  </span>
                  <h2 className="text-xl font-black text-[#0F2A4A] pt-2">
                    Request Submitted: {submittedTrackingId}
                  </h2>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Your application for <strong>{activeService?.name}</strong> has been persisted and queued with the Registrar Office.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <Button
                    variant="primary"
                    onClick={() => navigate(`${deskBase}/admin-desk/requests/${submittedTrackingId}`)}
                  >
                    Track Live Status
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`${deskBase}/document-requests/history`)}
                  >
                    View Request History
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSubmittedTrackingId(null)}
                  >
                    Submit Another
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-base font-bold text-[#0F2A4A]">Document Application Form</h2>
                  <p className="text-xs text-slate-500">
                    Applicant: <strong>{applicantName}</strong>
                    {[applicantBaustId, applicantDepartment].filter(Boolean).length > 0 &&
                      ` (${[applicantBaustId, applicantDepartment].filter(Boolean).join(' · ')})`}
                  </p>
                </div>

                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Document Type
                    </label>
                    <select
                      value={selectedServiceId}
                      onChange={(e) => setSelectedServiceId(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#0F2A4A] outline-hidden"
                    >
                      {safeServices.map((srv) => (
                        <option key={srv.id} value={srv.id}>
                          {srv.name} (BDT {srv.fee})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Number of Copies
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={activeService?.maxCopies || 5}
                      value={copies}
                      onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#0F2A4A] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Application Purpose
                    </label>
                    <select
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#0F2A4A] outline-hidden"
                    >
                      <option value="Higher Studies Abroad">Higher Studies Abroad</option>
                      <option value="Government Job">Government Job / BCS</option>
                      <option value="Private Job Application">Private Job Application</option>
                      <option value="Immigration">Immigration / WES</option>
                      <option value="Personal Record">Personal Academic Record</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Processing Urgency
                    </label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value as RequestUrgency)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#0F2A4A] outline-hidden"
                    >
                      <option value="Normal">Normal ({activeService?.processingDaysNormal ?? 7} days)</option>
                      <option value="Urgent">
                        Urgent ({activeService?.processingDaysUrgent ?? 3} days, +BDT {activeService?.urgentFeeExtra ?? 400})
                      </option>
                      <option value="Express">
                        Express ({activeService?.processingDaysExpress ?? 1} day, +BDT {activeService?.expressFeeExtra ?? 800})
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Delivery Method
                    </label>
                    <select
                      value={deliveryMethod}
                      onChange={(e) => setDeliveryMethod(e.target.value as DeliveryMethodType)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#0F2A4A] outline-hidden"
                    >
                      <option value="Campus Pickup">Campus Collection (Saidpur)</option>
                      <option value="Courier (Home Delivery)">Courier Home Delivery</option>
                      <option value="Email Soft Copy / PDF">Email Soft Copy / PDF</option>
                      <option value="Direct to Institution">Direct Dispatch to Institution / WES</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Payment Method & Reference
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethodType)}
                        className="w-1/2 text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="bKash">bKash</option>
                        <option value="Nagad">Nagad</option>
                        <option value="Bank Deposit">Trust Bank</option>
                        <option value="Card">Card</option>
                      </select>
                      <input
                        type="text"
                        placeholder="TrxID (optional)"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-1/2 text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {(deliveryMethod === 'Courier (Home Delivery)' || deliveryMethod === 'Direct to Institution') && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {deliveryMethod === 'Courier (Home Delivery)'
                        ? 'Full Courier Delivery Address'
                        : 'Recipient University / WES Address & Reference'}
                    </label>
                    <textarea
                      rows={2}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter recipient street, city, postal code, or institution reference..."
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#0F2A4A] outline-hidden"
                    />
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-bold block">Total Payable Fee</span>
                    <span className="text-2xl font-black text-[#0F2A4A]">BDT {totalFee}</span>
                  </div>
                  <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting}>
                    Submit Document Request
                  </Button>
                </div>
              </form>
            )}
          </Card>

          <Card className="p-6 border-slate-200 space-y-4 h-fit bg-slate-50/60">
            <div className="flex items-center gap-2 text-[#0F2A4A]">
              <Sparkles className="w-4 h-4 text-[#C9A227]" />
              <h3 className="text-sm font-bold">Submission Notes</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every document request submitted here is saved to Cloud Firestore with your BAUST ID and verified profile, and receives a cryptographically verifiable Tracking ID.
            </p>
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-[#0F2A4A]">Registrar Helpdesk</div>
              <div className="text-slate-600">{settings?.supportEmail || 'registrar@baust.edu.bd'}</div>
              <div className="text-slate-500">{settings?.officeHours || '08:30 AM - 04:00 PM'}</div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
