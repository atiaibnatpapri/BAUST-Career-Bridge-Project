/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { ServiceRequest, RequestStatus } from '../../types';
import { 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Truck, 
  CreditCard, 
  Search, 
  ChevronRight, 
  ExternalLink,
  ShieldAlert,
  Building,
  PackageCheck
} from 'lucide-react';

export const UniversityAdminDesk: React.FC = () => {
  const { serviceRequests, currentUser, addServiceRequest } = useApp();

  const [activeTab, setActiveTab] = useState<'requests' | 'new'>('requests');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

  // Form State
  const [documentType, setDocumentType] = useState<ServiceRequest['documentType']>('Transcript');
  const [copies, setCopies] = useState<number>(2);
  const [purpose, setPurpose] = useState<ServiceRequest['purpose']>('Higher Studies Abroad');
  const [deliveryMethod, setDeliveryMethod] = useState<ServiceRequest['deliveryMethod']>('Courier (Home Delivery)');
  const [deliveryAddress, setDeliveryAddress] = useState('Flat 4B, Concord Tower, Banani, Dhaka-1213');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Bank Transfer'>('bKash');
  const [transactionId, setTransactionId] = useState('BK9X77812M');
  const [phone, setPhone] = useState('+880 1712-345678');

  // Filter requests for currently active alumni (or all if admin)
  const userRequests = currentUser.role === 'admin'
    ? serviceRequests
    : serviceRequests.filter((r) => r.alumniId === currentUser.id || r.alumniId === 'alm-1');

  // Fee calculation (500 BDT per copy for transcript, 1500 for certificate)
  const feePerCopy = documentType.includes('Certificate') ? 1500 : 500;
  const courierFee = deliveryMethod.includes('Courier') ? 200 : 0;
  const totalAmount = feePerCopy * copies + courierFee;

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    addServiceRequest({
      alumniId: currentUser.id,
      alumniName: currentUser.name,
      alumniEmail: currentUser.email,
      alumniPhone: phone,
      baustId: (currentUser as any).baustId || '1602012',
      department: (currentUser as any).department || 'CSE',
      passingYear: (currentUser as any).passingYear || 2020,
      documentType,
      copies,
      purpose,
      deliveryMethod,
      deliveryAddress: deliveryMethod.includes('Courier') ? deliveryAddress : undefined,
      paymentMethod,
      transactionId,
      amount: totalAmount,
    });

    setActiveTab('requests');
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="pending">Pending Audit</Badge>;
      case 'Under Review':
        return <Badge variant="in-progress">Under Review</Badge>;
      case 'Approved':
        return <Badge variant="approved">Approved & Stamped</Badge>;
      case 'Ready':
        return <Badge variant="ready">Ready for Dispatch</Badge>;
      case 'Delivered':
        return <Badge variant="delivered">Delivered</Badge>;
      case 'Rejected':
        return <Badge variant="rejected">Rejected</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const columns = [
    {
      header: 'Application ID',
      cell: (item: ServiceRequest) => (
        <div>
          <span className="font-mono font-bold text-xs text-[#0F2A4A]">{item.id}</span>
          <p className="text-[10px] text-slate-400">{item.submittedAt}</p>
        </div>
      ),
    },
    {
      header: 'Document Requested',
      cell: (item: ServiceRequest) => (
        <div>
          <p className="font-bold text-xs text-slate-900">{item.documentType}</p>
          <p className="text-[11px] text-slate-500">
            {item.copies} {item.copies > 1 ? 'copies' : 'copy'} · {item.purpose}
          </p>
        </div>
      ),
    },
    {
      header: 'Delivery & Fee',
      cell: (item: ServiceRequest) => (
        <div>
          <p className="text-xs text-slate-800 font-medium">{item.deliveryMethod.split(' ')[0]}</p>
          <p className="text-[11px] text-emerald-700 font-bold tabular-nums">
            {item.amount} BDT ({item.paymentMethod})
          </p>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (item: ServiceRequest) => getStatusBadge(item.status),
    },
    {
      header: 'Action',
      align: 'right' as const,
      cell: (item: ServiceRequest) => (
        <Button
          variant="outline"
          size="sm"
          className="text-xs py-1"
          onClick={() => setSelectedRequest(item)}
        >
          Track Timeline
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F2A4A] tracking-tight">
            University Admin Desk & Document Services
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Request official Academic Transcripts, Certificates, and Testimonials with live tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'requests' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('requests')}
            leftIcon={<Clock className="w-4 h-4" />}
          >
            My Requests ({userRequests.length})
          </Button>
          <Button
            variant={activeTab === 'new' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('new')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Document Request
          </Button>
        </div>
      </div>

      {/* VIEW 1: MY REQUESTS TABLE */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <Card className="p-4 border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Building className="w-4 h-4 text-[#2E5E3E]" />
              <span>
                Processed directly by the <strong>Office of the Controller of Examinations, BAUST Saidpur</strong>
              </span>
            </div>
            <span className="text-xs font-semibold text-[#0F2A4A]">
              Average processing turnaround: 5–7 working days
            </span>
          </Card>

          <Table
            columns={columns}
            data={userRequests}
            keyExtractor={(item) => item.id}
            emptyMessage="No official document applications submitted yet."
          />
        </div>
      )}

      {/* VIEW 2: NEW REQUEST FORM */}
      {activeTab === 'new' && (
        <div className="max-w-3xl mx-auto">
          <Card className="p-6 sm:p-8 border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-[#0F2A4A]">
                Submit Official University Document Request
              </h2>
              <p className="text-xs text-slate-500">
                Ensure your BAUST ID and contact details match university examination records.
              </p>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-5">
              
              {/* Document Type & Copies */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Document Type"
                  options={[
                    { value: 'Transcript', label: 'Official Academic Transcript (500 BDT/copy)' },
                    { value: 'Provisional Certificate', label: 'Provisional Degree Certificate (1,500 BDT)' },
                    { value: 'Original Certificate', label: 'Original Degree Certificate (3,000 BDT)' },
                    { value: 'Testimonial', label: 'Testimonial from Registrar (500 BDT)' },
                    { value: 'Medium of Instruction (MOI)', label: 'Medium of Instruction Certificate (800 BDT)' },
                    { value: 'Character Certificate', label: 'Character Certificate (500 BDT)' },
                  ]}
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as any)}
                />

                <Input
                  label="Number of Copies"
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={copies}
                  onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
                />
              </div>

              {/* Purpose & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Purpose of Application"
                  options={[
                    { value: 'Higher Studies Abroad', label: 'Higher Studies Abroad (University Admission / WES)' },
                    { value: 'Government Job', label: 'Government Job / BCS Verification' },
                    { value: 'Private Job Application', label: 'Private Job Application' },
                    { value: 'Immigration', label: 'Immigration & Visa Processing' },
                    { value: 'Personal Record', label: 'Personal Official Archive' },
                  ]}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value as any)}
                />

                <Input
                  label="Contact Mobile (for courier SMS updates)"
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {/* Delivery Method & Address */}
              <div className="space-y-3">
                <Select
                  label="Delivery Method"
                  options={[
                    { value: 'Courier (Home Delivery)', label: 'Courier Home Delivery across Bangladesh (+200 BDT fee)' },
                    { value: 'On-Campus Collection (BAUST Saidpur)', label: 'On-Campus Collection (Room 104, Admin Building)' },
                  ]}
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value as any)}
                />

                {deliveryMethod.includes('Courier') && (
                  <Textarea
                    label="Complete Courier Shipping Address"
                    rows={2}
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="House, Road, Area, Thana, District, Postal Code..."
                  />
                )}
              </div>

              {/* Payment Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Payment Summary
                  </span>
                  <span className="text-base font-extrabold text-[#0F2A4A] tabular-nums">
                    Total: {totalAmount} BDT
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <Select
                    label="Payment Method"
                    options={[
                      { value: 'bKash', label: 'bKash Merchant Pay (01769-675556)' },
                      { value: 'Nagad', label: 'Nagad Merchant (01769-675557)' },
                      { value: 'Bank Transfer', label: 'Trust Bank / DBBL Online Transfer' },
                    ]}
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                  />

                  <Input
                    label="Transaction ID (TrxID)"
                    placeholder="e.g. BK9X77812M"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>

                <p className="text-[11px] text-slate-500">
                  * For test evaluations, sample transaction ID is pre-filled.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="outline" type="button" onClick={() => setActiveTab('requests')}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" size="lg" leftIcon={<PackageCheck className="w-4 h-4" />}>
                  Submit Application & Pay {totalAmount} BDT
                </Button>
              </div>

            </form>
          </Card>
        </div>
      )}

      {/* TRACKING TIMELINE MODAL */}
      <Modal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title={`Application Tracking: ${selectedRequest?.id}`}
        description={`${selectedRequest?.documentType} (${selectedRequest?.copies} copies)`}
      >
        {selectedRequest && (
          <div className="space-y-6">
            
            {/* Status Header */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">Current Stage</p>
                <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">Estimated Fulfillment</p>
                <p className="text-xs font-bold text-slate-900 mt-1">{selectedRequest.estimatedDelivery}</p>
              </div>
              {selectedRequest.trackingNumber && (
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase">Courier Airway Bill</p>
                  <p className="text-xs font-mono font-bold text-[#0F2A4A] mt-1">
                    {selectedRequest.trackingNumber}
                  </p>
                </div>
              )}
            </div>

            {/* Stepper Timeline */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Progress Stepper
              </h4>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {selectedRequest.timeline.map((item, idx) => (
                  <div key={idx} className="relative space-y-0.5">
                    <span
                      className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-white ${
                        item.completed ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-slate-300'
                      }`}
                    />
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-bold ${item.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                        {item.step}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.timestamp}
                      </span>
                    </div>
                    {item.remarks && (
                      <p className="text-[11px] text-slate-500 bg-slate-100/70 p-2 rounded-lg mt-1">
                        Note: {item.remarks}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Remarks */}
            {selectedRequest.adminRemarks && (
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                <span className="font-bold block mb-0.5">Registrar Desk Note:</span>
                {selectedRequest.adminRemarks}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                Close
              </Button>
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
};
