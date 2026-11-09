/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  FileText, 
  Clock, 
  Truck, 
  CreditCard, 
  Upload, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  Printer, 
  ExternalLink,
  ShieldCheck,
  Building2,
  Trash2,
  Lock
} from 'lucide-react';
import { AdminDeskService, DeliveryMethodType, RequestUrgency, PaymentMethodType, UploadedDocItem } from '../../types/admindesk';
import { useAdminDeskStore } from '../../hooks/useAdminDeskStore';
import { useApp } from '../../context/AppContext';

interface RequestStepperModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedService?: AdminDeskService | null;
  onSuccessTrack?: (trackingId: string) => void;
}

export const RequestStepperModal: React.FC<RequestStepperModalProps> = ({
  isOpen,
  onClose,
  preSelectedService,
  onSuccessTrack
}) => {
  const { services, submitRequest, settings } = useAdminDeskStore();
  const { currentUser } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [createdTrackingId, setCreatedTrackingId] = useState<string | null>(null);

  // Form State
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(() => {
    return preSelectedService ? [preSelectedService.id] : ['srv-transcript'];
  });

  // Per-service options map
  const [serviceOptions, setServiceOptions] = useState<Record<string, {
    copies: number;
    purpose: 'Higher Studies Abroad' | 'Government Job' | 'Private Job Application' | 'Immigration' | 'Personal Record' | 'Other';
    urgency: RequestUrgency;
    programInfo: string;
    teacherName: string;
    recipientName: string;
    recipientOrg: string;
    recipientEmail: string;
    recipientAddress: string;
  }>>({
    'srv-transcript': {
      copies: 1,
      purpose: 'Higher Studies Abroad',
      urgency: 'Normal',
      programInfo: 'M.Sc. in Computer Science',
      teacherName: '',
      recipientName: '',
      recipientOrg: '',
      recipientEmail: '',
      recipientAddress: ''
    }
  });

  // Uploaded docs
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDocItem[]>([
    {
      id: 'doc-id-1',
      name: 'BAUST_Student_ID_Scanned.pdf',
      size: '1.2 MB',
      type: 'application/pdf',
      url: 'https://example.com/docs/id.pdf',
      uploadedAt: 'Just now',
      category: 'ID Card'
    }
  ]);
  const [docCategory, setDocCategory] = useState<UploadedDocItem['category']>('Supporting Doc');

  // Delivery State
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethodType>('Campus Pickup');
  const [pickupDate, setPickupDate] = useState('2026-11-20');
  const [pickupSlot, setPickupSlot] = useState('11:00 AM - 01:00 PM (Exam Controller Counter)');
  const [courierAddress, setCourierAddress] = useState('House 42, Road 11, Banani, Dhaka-1213');
  const [deliveryEmail, setDeliveryEmail] = useState(currentUser.email || 'farhan.kabir@brainstation-23.com');
  const [institutionAddress, setInstitutionAddress] = useState('Admissions Office, TU Munich, Arcisstraße 21, 80333 München, Germany');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('bKash');
  const [transactionId, setTransactionId] = useState('BK9X77812M');
  const [termsAccepted, setTermsAccepted] = useState(true);

  if (!isOpen) return null;

  // Multi-service toggle
  const toggleServiceSelection = (srvId: string) => {
    setSelectedServiceIds((prev) => {
      const exists = prev.includes(srvId);
      const updated = exists ? prev.filter((id) => id !== srvId) : [...prev, srvId];
      if (updated.length === 0) return [srvId]; // Keep at least one

      // Initialize default option if newly added
      if (!serviceOptions[srvId]) {
        setServiceOptions((opt) => ({
          ...opt,
          [srvId]: {
            copies: 1,
            purpose: 'Higher Studies Abroad',
            urgency: 'Normal',
            programInfo: '',
            teacherName: '',
            recipientName: '',
            recipientOrg: '',
            recipientEmail: '',
            recipientAddress: ''
          }
        }));
      }
      return updated;
    });
  };

  const updateServiceOption = (srvId: string, key: string, val: any) => {
    setServiceOptions((prev) => ({
      ...prev,
      [srvId]: {
        ...prev[srvId],
        [key]: val
      }
    }));
  };

  // Fee Calculations
  const calculation = useMemo(() => {
    let subtotal = 0;
    let urgencyFee = 0;
    let courierFee = 0;

    selectedServiceIds.forEach((sId) => {
      const srv = services.find((s) => s.id === sId);
      const opt = serviceOptions[sId] || { copies: 1, urgency: 'Normal' };
      if (srv) {
        const baseCost = srv.fee;
        const extraCopiesCost = Math.max(0, opt.copies - 1) * srv.perCopyFee;
        subtotal += baseCost + extraCopiesCost;

        if (opt.urgency === 'Urgent') {
          urgencyFee += srv.urgentFeeExtra;
        } else if (opt.urgency === 'Express') {
          urgencyFee += srv.expressFeeExtra;
        }
      }
    });

    if (deliveryMethod === 'Courier (Home Delivery)') {
      courierFee = courierAddress.toLowerCase().includes('dhaka')
        ? settings.courierFeeInsideDhaka
        : settings.courierFeeOutsideDhaka;
    } else if (deliveryMethod === 'Direct to Institution') {
      courierFee = 0; // electronic delivery included
    }

    const totalAmount = subtotal + urgencyFee + courierFee;

    return { subtotal, urgencyFee, courierFee, totalAmount };
  }, [selectedServiceIds, serviceOptions, services, deliveryMethod, courierAddress, settings]);

  // Mock File Upload
  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newDoc: UploadedDocItem = {
        id: `doc-${Date.now()}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.type || 'application/pdf',
        url: 'https://example.com/mock-upload.pdf',
        uploadedAt: 'Just now',
        category: docCategory
      };
      setUploadedFiles((prev) => [...prev, newDoc]);
    }
  };

  const handleRemoveFile = (docId: string) => {
    setUploadedFiles((prev) => prev.filter((d) => d.id !== docId));
  };

  // Submit Handler
  const handleSubmit = () => {
    const formattedServices = selectedServiceIds.map((sId) => {
      const srv = services.find((s) => s.id === sId);
      const opt = serviceOptions[sId] || { copies: 1, purpose: 'Higher Studies Abroad', urgency: 'Normal' };
      return {
        serviceId: sId,
        serviceName: srv?.name || sId,
        copies: opt.copies,
        feePerCopy: srv?.perCopyFee || 400,
        purpose: opt.purpose,
        urgency: opt.urgency,
        programInfo: opt.programInfo,
        teacherName: opt.teacherName,
        verificationRecipient: sId === 'srv-verification' ? {
          name: opt.recipientName,
          organization: opt.recipientOrg,
          email: opt.recipientEmail,
          address: opt.recipientAddress
        } : undefined
      };
    });

    const trackingId = submitRequest({
      alumniId: currentUser.id,
      alumniName: currentUser.name,
      alumniEmail: currentUser.email,
      alumniPhone: (currentUser as any).phone || '+880 1712-345678',
      alumniAvatar: currentUser.avatar,
      baustId: (currentUser as any).studentId || (currentUser as any).baustId || '1602012',
      department: (currentUser as any).department || 'CSE',
      batch: (currentUser as any).batch || '4th Batch',
      passingYear: (currentUser as any).passingYear || 2020,
      cgpa: (currentUser as any).cgpa || 3.88,
      services: formattedServices,
      uploadedDocuments: uploadedFiles,
      delivery: {
        method: deliveryMethod,
        pickupDate: deliveryMethod === 'Campus Pickup' ? pickupDate : undefined,
        pickupTimeSlot: deliveryMethod === 'Campus Pickup' ? pickupSlot : undefined,
        courierAddress: deliveryMethod === 'Courier (Home Delivery)' ? courierAddress : undefined,
        courierFee: calculation.courierFee,
        recipientEmail: deliveryMethod === 'Email Soft Copy / PDF' ? deliveryEmail : undefined,
        institutionAddress: deliveryMethod === 'Direct to Institution' ? institutionAddress : undefined
      },
      payment: {
        method: paymentMethod,
        transactionId: transactionId.trim() || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        subtotal: calculation.subtotal,
        urgencyFee: calculation.urgencyFee,
        courierFee: calculation.courierFee,
        totalAmount: calculation.totalAmount,
        isVerified: false,
        paidAt: new Date().toLocaleString()
      },
      urgency: formattedServices.some((s) => s.urgency === 'Express') ? 'Express' : formattedServices.some((s) => s.urgency === 'Urgent') ? 'Urgent' : 'Normal',
      estimatedDelivery: '5 - 7 business days'
    });

    setCreatedTrackingId(trackingId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-navy text-white flex items-center justify-center font-bold">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                Official Document & Service Request Wizard
              </h2>
              <p className="text-xs text-slate-500">
                Paperless application • Registrar & Controller of Examinations Office, BAUST
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Indicator */}
        {!createdTrackingId && (
          <div className="px-5 py-3 border-b border-slate-100 bg-white overflow-x-auto">
            <div className="flex items-center justify-between min-w-[550px]">
              {[
                { step: 1, label: '1. Select Services' },
                { step: 2, label: '2. Document Details' },
                { step: 3, label: '3. Supporting Files' },
                { step: 4, label: '4. Delivery Method' },
                { step: 5, label: '5. Mock Payment' },
                { step: 6, label: '6. Review & Submit' }
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                      currentStep === s.step
                        ? 'bg-navy text-white ring-4 ring-navy/15'
                        : currentStep > s.step
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {currentStep > s.step ? <Check className="w-4 h-4" /> : s.step}
                  </div>
                  <span
                    className={`text-xs font-semibold whitespace-nowrap ${
                      currentStep === s.step ? 'text-navy font-bold' : 'text-slate-500'
                    }`}
                  >
                    {s.label}
                  </span>
                  {s.step < 6 && <ChevronRight className="w-4 h-4 text-slate-300 ml-1 shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {createdTrackingId ? (
            /* Success Screen */
            <div className="text-center py-8 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Application Logged Successfully
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
                  Your Tracking ID: <span className="text-navy">{createdTrackingId}</span>
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Your paperless request has been dispatched to the Office of the Controller of Examinations. A receipt has been generated and you will receive notifications in your bell at every step.
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Applicant:</span>
                  <span className="font-bold text-slate-900">{currentUser.name}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>BAUST Student ID:</span>
                  <span className="font-mono font-bold text-slate-900">{(currentUser as any).studentId || '1602012'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Services:</span>
                  <span className="font-medium text-slate-800 text-right">{selectedServiceIds.length} item(s)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Method:</span>
                  <span className="font-semibold text-navy">{deliveryMethod}</span>
                </div>
                <div className="flex justify-between text-slate-600 border-t border-slate-200 pt-2 font-bold">
                  <span>Total Amount Paid (Mock):</span>
                  <span className="text-base text-emerald-700">BDT {calculation.totalAmount}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4 text-navy" />
                  Print / Download Receipt
                </button>
                <button
                  onClick={() => {
                    onClose();
                    if (onSuccessTrack) onSuccessTrack(createdTrackingId);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-navy text-white text-xs font-bold hover:bg-[#0b1f36] transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  Track This Request Live
                </button>
              </div>
            </div>
          ) : currentStep === 1 ? (
            /* STEP 1: Select Services */
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Choose Academic Document(s)</h3>
                <p className="text-xs text-slate-500">
                  You can select multiple documents to order them simultaneously in a single tracking package.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {services.map((srv) => {
                  const isSelected = selectedServiceIds.includes(srv.id);
                  return (
                    <div
                      key={srv.id}
                      onClick={() => toggleServiceSelection(srv.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-[#0F2A4A] bg-[#0F2A4A]/5 ring-2 ring-[#0F2A4A]/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="mt-1 w-4 h-4 rounded text-navy focus:ring-navy border-slate-300"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-slate-900 leading-tight">{srv.name}</h4>
                          <span className="text-xs font-extrabold text-navy shrink-0 ml-1">BDT {srv.fee}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{srv.description}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1.5 font-medium">
                          <span>{srv.category}</span>
                          <span>•</span>
                          <span>Normal: {srv.processingDaysNormal} days</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : currentStep === 2 ? (
            /* STEP 2: Document Details & Smart Suggestions */
            <div className="space-y-5">
              {/* Smart Suggestion Banner */}
              {selectedServiceIds.some((id) => serviceOptions[id]?.purpose === 'Higher Studies Abroad') && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Smart Advisory for Foreign University Applicants:</span>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Most European, North American, and Australian institutions require a <strong>Medium of Instruction (MOI) Certificate</strong> and <strong>Faculty Recommendation Letters</strong> alongside your official transcript. You can add them from Step 1.
                    </p>
                  </div>
                </div>
              )}

              {/* Verified Profile Snapshot */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Applicant Name</span>
                  <div className="font-bold text-slate-900">{currentUser.name}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">BAUST Student ID</span>
                  <div className="font-mono font-bold text-navy">{(currentUser as any).studentId || '1602012'}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Dept & Batch</span>
                  <div className="font-medium text-slate-800">{(currentUser as any).department || 'CSE'} • {(currentUser as any).batch || '4th Batch'}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Graduation CGPA</span>
                  <div className="font-bold text-amber-800">{(currentUser as any).cgpa?.toFixed(2) || '3.88'} / 4.00</div>
                </div>
              </div>

              {/* Service Details Form */}
              <div className="space-y-4">
                {selectedServiceIds.map((srvId) => {
                  const srv = services.find((s) => s.id === srvId);
                  const opt = serviceOptions[srvId] || {
                    copies: 1,
                    purpose: 'Higher Studies Abroad',
                    urgency: 'Normal',
                    programInfo: '',
                    teacherName: '',
                    recipientName: '',
                    recipientOrg: '',
                    recipientEmail: '',
                    recipientAddress: ''
                  };

                  return (
                    <div key={srvId} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="font-bold text-xs text-navy flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          {srv?.name}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          Base Fee: BDT {srv?.fee}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Number of Copies
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={srv?.maxCopies || 5}
                            value={opt.copies}
                            onChange={(e) => updateServiceOption(srvId, 'copies', parseInt(e.target.value) || 1)}
                            className="w-full text-xs p-2 rounded-xl border border-slate-200"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Application Purpose
                          </label>
                          <select
                            value={opt.purpose}
                            onChange={(e) => updateServiceOption(srvId, 'purpose', e.target.value)}
                            className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white"
                          >
                            <option value="Higher Studies Abroad">Higher Studies Abroad</option>
                            <option value="Government Job">Government Job / BCS</option>
                            <option value="Private Job Application">Private Job Application</option>
                            <option value="Immigration">Immigration / Visa</option>
                            <option value="Personal Record">Personal Record</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Processing Urgency
                          </label>
                          <select
                            value={opt.urgency}
                            onChange={(e) => updateServiceOption(srvId, 'urgency', e.target.value as RequestUrgency)}
                            className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white"
                          >
                            <option value="Normal">Normal ({srv?.processingDaysNormal} days)</option>
                            <option value="Urgent">Urgent ({srv?.processingDaysUrgent} days, +BDT {srv?.urgentFeeExtra})</option>
                            <option value="Express">Express ({srv?.processingDaysExpress} days, +BDT {srv?.expressFeeExtra})</option>
                          </select>
                        </div>
                      </div>

                      {/* Special extra input for Recommendation Letter */}
                      {srvId === 'srv-recommendation' && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Preferred Faculty Member (Teacher Name & Designation)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Dr. Md. Ashraful Islam (Professor & Head, CSE)"
                            value={opt.teacherName}
                            onChange={(e) => updateServiceOption(srvId, 'teacherName', e.target.value)}
                            className="w-full text-xs p-2 rounded-xl border border-slate-200"
                          />
                        </div>
                      )}

                      {/* Special extra inputs for Credential Verification letter */}
                      {srvId === 'srv-verification' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">
                              Recipient Organization / Agency Name
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. World Education Services (WES) Canada"
                              value={opt.recipientOrg}
                              onChange={(e) => updateServiceOption(srvId, 'recipientOrg', e.target.value)}
                              className="w-full text-xs p-1.5 rounded-lg border border-slate-200 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">
                              Verification Reference / Case Number
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. WES Reference # 5621490"
                              value={opt.programInfo}
                              onChange={(e) => updateServiceOption(srvId, 'programInfo', e.target.value)}
                              className="w-full text-xs p-1.5 rounded-lg border border-slate-200 bg-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : currentStep === 3 ? (
            /* STEP 3: Upload Supporting Documents */
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Upload Supporting Verification Documents</h3>
                <p className="text-xs text-slate-500">
                  Please attach required documents according to the university clearance policy.
                </p>
              </div>

              {/* Upload Box */}
              <div className="border-2 border-dashed border-slate-200 hover:border-navy rounded-2xl p-6 text-center bg-slate-50/50 transition-colors">
                <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <div className="text-xs font-bold text-slate-700">Click to choose file or drag & drop</div>
                <p className="text-[11px] text-slate-400 mt-0.5">PDF, PNG, JPG up to 10MB</p>

                <div className="mt-3 flex items-center justify-center gap-2">
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value as any)}
                    className="text-xs p-1.5 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="ID Card">BAUST Student ID / Reg Card</option>
                    <option value="Payment Slip">Bank / Mobile Payment Slip</option>
                    <option value="Application Letter">Application Letter</option>
                    <option value="GD Copy">Police GD Copy (for lost certificate)</option>
                    <option value="Supporting Doc">Other Supporting Doc</option>
                  </select>

                  <label className="text-xs font-bold px-3 py-1.5 rounded-lg bg-navy text-white hover:bg-[#0b1f36] cursor-pointer">
                    Browse File
                    <input type="file" className="hidden" onChange={handleSimulateUpload} />
                  </label>
                </div>
              </div>

              {/* Uploaded Files List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Attached Files ({uploadedFiles.length})
                </span>
                {uploadedFiles.map((doc) => (
                  <div key={doc.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-navy shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900">{doc.name}</div>
                        <div className="text-[10px] text-slate-400">{doc.category} • {doc.size}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(doc.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : currentStep === 4 ? (
            /* STEP 4: Delivery Options */
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Choose Delivery & Dispatch Method</h3>
                <p className="text-xs text-slate-500">
                  Select whether you will pick up the documents from Saidpur campus or have them dispatched.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    method: 'Campus Pickup' as DeliveryMethodType,
                    title: 'Campus Collection (Saidpur)',
                    sub: 'Free pickup from Controller of Examinations Counter',
                    fee: 'Free'
                  },
                  {
                    method: 'Courier (Home Delivery)' as DeliveryMethodType,
                    title: 'Courier Home Delivery',
                    sub: 'SA Paribahan / Sundarban Courier (2-3 business days)',
                    fee: 'BDT 120-150'
                  },
                  {
                    method: 'Email Soft Copy / PDF' as DeliveryMethodType,
                    title: 'Digital PDF by Email',
                    sub: 'High resolution digital copy with QR verification seal',
                    fee: 'Free'
                  },
                  {
                    method: 'Direct to Institution' as DeliveryMethodType,
                    title: 'Direct Dispatch to Foreign Board',
                    sub: 'Direct university-to-university / WES electronic upload',
                    fee: 'Included'
                  }
                ].map((d) => (
                  <div
                    key={d.method}
                    onClick={() => setDeliveryMethod(d.method)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      deliveryMethod === d.method
                        ? 'border-navy bg-navy/5 ring-2 ring-navy/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900">{d.title}</span>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {d.fee}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{d.sub}</p>
                  </div>
                ))}
              </div>

              {/* Dynamic Delivery Form based on Method */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                {deliveryMethod === 'Campus Pickup' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Expected Pickup Date</label>
                      <input
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Counter & Time Slot</label>
                      <input
                        type="text"
                        value={pickupSlot}
                        onChange={(e) => setPickupSlot(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                )}

                {deliveryMethod === 'Courier (Home Delivery)' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Complete Home / Office Mailing Address (with District & Post Code)
                    </label>
                    <textarea
                      rows={2}
                      value={courierAddress}
                      onChange={(e) => setCourierAddress(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white"
                      placeholder="e.g. House 42, Road 11, Banani, Dhaka-1213"
                    />
                  </div>
                )}

                {deliveryMethod === 'Email Soft Copy / PDF' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Email Address</label>
                    <input
                      type="email"
                      value={deliveryEmail}
                      onChange={(e) => setDeliveryEmail(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                )}

                {deliveryMethod === 'Direct to Institution' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Foreign University / Agency Portal or Physical Address
                    </label>
                    <textarea
                      rows={2}
                      value={institutionAddress}
                      onChange={(e) => setInstitutionAddress(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white"
                      placeholder="e.g. WES Reference # 5621490, 2 Carlton Street, Suite 1400, Toronto, ON"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : currentStep === 5 ? (
            /* STEP 5: Payment (Mockup) */
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Payment Breakdown & Method</h3>
                <p className="text-xs text-slate-500">
                  Select payment provider and enter the transaction reference from your bKash / Nagad / Bank transfer slip.
                </p>
              </div>

              {/* Total Calculation Strip */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Document Base Fees:</span>
                  <span className="font-semibold text-slate-900">BDT {calculation.subtotal}</span>
                </div>
                {calculation.urgencyFee > 0 && (
                  <div className="flex justify-between text-amber-700">
                    <span>Urgent / Express Surcharge:</span>
                    <span className="font-semibold">+ BDT {calculation.urgencyFee}</span>
                  </div>
                )}
                {calculation.courierFee > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Courier Delivery Fee:</span>
                    <span className="font-semibold text-slate-900">+ BDT {calculation.courierFee}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-[#0F2A4A] border-t border-slate-200 pt-2 mt-1">
                  <span>Total Payable:</span>
                  <span>BDT {calculation.totalAmount}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Select Payment Gateway
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { method: 'bKash' as PaymentMethodType, label: 'bKash Merchant' },
                    { method: 'Nagad' as PaymentMethodType, label: 'Nagad Pay' },
                    { method: 'Bank Deposit' as PaymentMethodType, label: 'Trust Bank / DBBL' },
                    { method: 'Card' as PaymentMethodType, label: 'Visa / MasterCard' }
                  ].map((m) => (
                    <button
                      key={m.method}
                      type="button"
                      onClick={() => setPaymentMethod(m.method)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                        paymentMethod === m.method
                          ? 'border-navy bg-navy text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transaction Input */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-900">
                    {paymentMethod} Transaction ID / Bank Reference
                  </label>
                  <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-mono">
                    Merchant Acc: 01769-662550
                  </span>
                </div>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. BK9X77812M or TXN-109283"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-mono font-bold"
                />
                <p className="text-[11px] text-slate-500 italic">
                  Note: This is a prototype system. No real money will be deducted from your account.
                </p>
              </div>
            </div>
          ) : (
            /* STEP 6: Review and Submit */
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Final Order Review & University Declaration</h3>
                <p className="text-xs text-slate-500">
                  Please review all details carefully before submitting to the registrar office.
                </p>
              </div>

              {/* Summary Box */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-3">
                <div className="border-b border-slate-200 pb-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Requested Documents</span>
                  <div className="mt-1 space-y-1">
                    {selectedServiceIds.map((sId) => {
                      const srv = services.find((s) => s.id === sId);
                      const opt = serviceOptions[sId];
                      return (
                        <div key={sId} className="flex justify-between font-semibold text-slate-800">
                          <span>{srv?.name} ({opt?.copies} copy)</span>
                          <span className="text-navy">{opt?.urgency}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-b border-slate-200 pb-2 text-slate-600">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Delivery</span>
                    <div className="font-semibold text-slate-900">{deliveryMethod}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Payment</span>
                    <div className="font-semibold text-slate-900">{paymentMethod} ({transactionId})</div>
                  </div>
                </div>

                <div className="flex justify-between font-bold text-sm text-slate-900 pt-1">
                  <span>Grand Total:</span>
                  <span className="text-emerald-700">BDT {calculation.totalAmount}</span>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-white border border-slate-200 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-navy focus:ring-navy"
                />
                <span>
                  I solemnly declare that all personal academic information provided corresponds to my official graduation records at BAUST Saidpur. I understand that submitting fraudulent claims will lead to legal action and cancellation of certificate records.
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {!createdTrackingId && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
              disabled={currentStep === 1}
              className="text-xs font-bold px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {currentStep < 6 ? (
                <button
                  onClick={() => setCurrentStep((s) => Math.min(6, s + 1))}
                  className="text-xs font-bold px-5 py-2.5 rounded-xl bg-navy text-white hover:bg-[#0b1f36] transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!termsAccepted}
                  className="text-xs font-bold px-6 py-2.5 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Submit Request & Pay
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
