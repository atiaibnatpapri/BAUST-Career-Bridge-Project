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
  Search, 
  Edit3, 
  Truck, 
  Clock, 
  CheckCircle2, 
  Filter, 
  ArrowRight,
  Printer,
  Package
} from 'lucide-react';

export const ServiceRequestManagementPage: React.FC = () => {
  const { serviceRequests, updateServiceRequestStatus } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

  // Edit / Status Drawer State
  const [editRequest, setEditRequest] = useState<ServiceRequest | null>(null);
  const [newStatus, setNewStatus] = useState<RequestStatus>('Under Review');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  const handleOpenEdit = (req: ServiceRequest) => {
    setEditRequest(req);
    setNewStatus(req.status);
    setAdminRemarks(req.adminRemarks || '');
    setTrackingNumber(req.trackingNumber || '');
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRequest) return;
    updateServiceRequestStatus(editRequest.id, newStatus, adminRemarks, trackingNumber);
    setEditRequest(null);
  };

  const filteredRequests = serviceRequests.filter((req) => {
    const matchesSearch =
      req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.alumniName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.baustId.includes(searchTerm) ||
      req.documentType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="pending">Pending</Badge>;
      case 'Under Review':
        return <Badge variant="in-progress">Under Review</Badge>;
      case 'Approved':
        return <Badge variant="approved">Approved</Badge>;
      case 'Ready':
        return <Badge variant="ready">Ready</Badge>;
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
      header: 'App ID & Date',
      cell: (item: ServiceRequest) => (
        <div>
          <span className="font-mono font-bold text-xs text-[#0F2A4A]">{item.id}</span>
          <p className="text-[10px] text-slate-400">{item.submittedAt}</p>
        </div>
      ),
    },
    {
      header: 'Alumni Applicant',
      cell: (item: ServiceRequest) => (
        <div>
          <p className="font-bold text-xs text-slate-900">{item.alumniName}</p>
          <p className="text-[11px] text-slate-500 font-mono">
            ID: {item.baustId} · {item.department} ({item.passingYear})
          </p>
        </div>
      ),
    },
    {
      header: 'Document & Purpose',
      cell: (item: ServiceRequest) => (
        <div>
          <p className="font-bold text-xs text-slate-900">{item.documentType}</p>
          <p className="text-[11px] text-slate-500">
            {item.copies} copy · {item.purpose}
          </p>
        </div>
      ),
    },
    {
      header: 'Fee Paid',
      cell: (item: ServiceRequest) => (
        <div>
          <span className="font-bold text-xs text-emerald-800 tabular-nums">
            {item.amount} BDT
          </span>
          <p className="text-[10px] text-slate-400 font-mono">Trx: {item.transactionId}</p>
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
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="text-xs py-1"
            onClick={() => setSelectedRequest(item)}
          >
            Details
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="text-xs py-1"
            onClick={() => handleOpenEdit(item)}
            leftIcon={<Edit3 className="w-3.5 h-3.5" />}
          >
            Update
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F2A4A] tracking-tight">
            Academic Service Request Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Process official transcripts, original certificates, and courier dispatch logs
          </p>
        </div>

        <Badge variant="navy">
          Total Applications: {serviceRequests.length}
        </Badge>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            placeholder="Search by ID, applicant name, BAUST ID or document..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-white border border-slate-300 text-xs font-semibold rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F2A4A]"
          >
            <option value="All">All Application Statuses</option>
            <option value="Pending">Pending Audit</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved & Signed</option>
            <option value="Ready">Ready for Collection / Courier</option>
            <option value="Delivered">Delivered</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </Card>

      {/* Service Request Table */}
      <Table
        columns={columns}
        data={filteredRequests}
        keyExtractor={(item) => item.id}
        emptyMessage="No service requests match the filter criteria."
      />

      {/* UPDATE STATUS / REMARKS MODAL */}
      <Modal
        isOpen={!!editRequest}
        onClose={() => setEditRequest(null)}
        title={`Update Application: ${editRequest?.id}`}
        description={`${editRequest?.documentType} for ${editRequest?.alumniName}`}
      >
        <form onSubmit={handleSaveStatus} className="space-y-4">
          <Select
            label="Change Processing Status"
            options={[
              { value: 'Pending', label: 'Pending Audit' },
              { value: 'Under Review', label: 'Under Review (Archives & Clearance Check)' },
              { value: 'Approved', label: 'Approved & Stamped by Controller' },
              { value: 'Ready', label: 'Ready for Dispatch / Campus Pickup' },
              { value: 'Delivered', label: 'Delivered / Handed Over' },
              { value: 'Rejected', label: 'Rejected (Missing clearance / dues)' },
            ]}
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as RequestStatus)}
          />

          <Input
            label="Courier Tracking Number / Airway Bill (if applicable)"
            placeholder="e.g. SA-PARCEL-88912 or SUN-EXPR-449102"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
          />

          <Textarea
            label="Official Administrative Remarks"
            rows={3}
            placeholder="Enter instructions, sealed envelope status, or reason for delay..."
            value={adminRemarks}
            onChange={(e) => setAdminRemarks(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setEditRequest(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Status & Notify Alumni
            </Button>
          </div>
        </form>
      </Modal>

      {/* DETAIL DRAWER / MODAL */}
      <Modal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title={`Request Dossier: ${selectedRequest?.id}`}
        description="Comprehensive official document application summary"
      >
        {selectedRequest && (
          <div className="space-y-5">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Applicant</span>
                <span className="font-bold text-slate-900">{selectedRequest.alumniName}</span>
                <span className="text-slate-500 block font-mono">ID: {selectedRequest.baustId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact</span>
                <span className="text-slate-800">{selectedRequest.alumniEmail}</span>
                <span className="text-slate-500 block">{selectedRequest.alumniPhone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Document</span>
                <span className="font-bold text-[#0F2A4A]">{selectedRequest.documentType}</span>
                <span className="text-slate-500 block">{selectedRequest.copies} copies</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Verified</span>
                <span className="font-bold text-emerald-700">{selectedRequest.amount} BDT</span>
                <span className="text-slate-500 block font-mono">Trx: {selectedRequest.transactionId}</span>
              </div>
            </div>

            {selectedRequest.deliveryAddress && (
              <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200 text-xs text-sky-950">
                <span className="font-bold block mb-0.5">Courier Delivery Destination:</span>
                {selectedRequest.deliveryAddress}
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Audit Trail & Status History
              </h4>
              <div className="space-y-2 text-xs">
                {selectedRequest.timeline.map((step, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${step.completed ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      <span className={step.completed ? 'font-semibold text-slate-800' : 'text-slate-400'}>
                        {step.step}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{step.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.print();
                }}
                leftIcon={<Printer className="w-3.5 h-3.5" />}
              >
                Print Voucher
              </Button>
              <Button variant="primary" size="sm" onClick={() => setSelectedRequest(null)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};
