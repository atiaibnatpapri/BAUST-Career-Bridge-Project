import React, { useState } from 'react';
import { X, FileText, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { AdminDeskService, ServiceCategory, DeliveryMethodType } from '../../types/admindesk';

interface ServiceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: Omit<AdminDeskService, 'id'> & { id?: string }) => void;
  editingService?: AdminDeskService | null;
}

const CATEGORIES: ServiceCategory[] = [
  'Academic Documents',
  'Verification',
  'Letters',
  'Certificates',
  'Others'
];

export const ServiceEditModal: React.FC<ServiceEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingService
}) => {
  const [name, setName] = useState(editingService?.name || '');
  const [nameBn, setNameBn] = useState(editingService?.nameBn || '');
  const [description, setDescription] = useState(editingService?.description || '');
  const [category, setCategory] = useState<ServiceCategory>(editingService?.category || 'Academic Documents');
  const [fee, setFee] = useState<string>(
    editingService?.fee !== undefined ? String(editingService.fee) : '500'
  );
  const [urgentFeeExtra, setUrgentFeeExtra] = useState<string>(
    editingService?.urgentFeeExtra !== undefined ? String(editingService.urgentFeeExtra) : '500'
  );
  const [processingDaysNormal, setProcessingDaysNormal] = useState<string>(
    editingService?.processingDaysNormal !== undefined ? String(editingService.processingDaysNormal) : '7'
  );
  const [processingDaysUrgent, setProcessingDaysUrgent] = useState<string>(
    editingService?.processingDaysUrgent !== undefined ? String(editingService.processingDaysUrgent) : '2'
  );
  const [enabled, setEnabled] = useState(
    editingService?.enabled !== undefined ? editingService.enabled : true
  );

  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryMethodType[]>(
    editingService?.deliveryOptions || ['Campus Pickup', 'Courier (Home Delivery)', 'Email Soft Copy / PDF']
  );

  const [docInput, setDocInput] = useState('');
  const [requiredDocs, setRequiredDocs] = useState<string[]>(
    editingService?.requiredDocuments || ['BAUST Student ID Card or National NID']
  );

  if (!isOpen) return null;

  const handleAddDoc = () => {
    if (!docInput.trim()) return;
    setRequiredDocs(prev => [...prev, docInput.trim()]);
    setDocInput('');
  };

  const handleRemoveDoc = (idx: number) => {
    setRequiredDocs(prev => prev.filter((_, i) => i !== idx));
  };

  const toggleDelivery = (method: DeliveryMethodType) => {
    setDeliveryOptions(prev =>
      prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      ...(editingService ? { id: editingService.id } : {}),
      name: name.trim(),
      nameBn: nameBn.trim() || name.trim(),
      description: description.trim(),
      descriptionBn: description.trim(),
      category,
      fee: parseFloat(fee) || 0,
      urgentFeeExtra: parseFloat(urgentFeeExtra) || 0,
      expressFeeExtra: (parseFloat(urgentFeeExtra) || 0) * 1.5,
      processingDaysNormal: parseInt(processingDaysNormal, 10) || 7,
      processingDaysUrgent: parseInt(processingDaysUrgent, 10) || 2,
      processingDaysExpress: 1,
      requiredDocuments: requiredDocs,
      deliveryOptions: deliveryOptions.length > 0 ? deliveryOptions : ['Campus Pickup'],
      perCopyFee: 400,
      maxCopies: 5,
      icon: 'FileText',
      enabled
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 bg-[#0F2A4A] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-white/10 rounded-xl">
              <FileText className="w-5 h-5 text-[#C9A227]" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white">
                {editingService ? 'Configure Service Offering' : 'Add New Service to Catalog'}
              </h2>
              <p className="text-xs text-white/70">
                Manage document issuance fees, processing SLAs, and delivery modes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Service Name (English) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Official Academic Transcript"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F2A4A] outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 font-['Noto_Sans_Bengali']">
                Service Name (বাংলা)
              </label>
              <input
                type="text"
                value={nameBn}
                onChange={e => setNameBn(e.target.value)}
                placeholder="যেমন: প্রাতিষ্ঠানিক একাডেমিক ট্রান্সক্রিপ্ট"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F2A4A] outline-hidden font-['Noto_Sans_Bengali']"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ServiceCategory)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F2A4A] outline-hidden bg-white"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-4 pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-800">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={e => setEnabled(e.target.checked)}
                  className="w-4 h-4 text-[#0F2A4A] rounded border-gray-300 focus:ring-[#0F2A4A]"
                />
                <span>Active in Catalog</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Description & Scope of Service *
            </label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Explain the document validity, grading scale, and university registrar clearance..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F2A4A] outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                Base Fee (BDT)
              </label>
              <input
                type="number"
                min="0"
                value={fee}
                onChange={e => setFee(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                Urgent Surcharge
              </label>
              <input
                type="number"
                min="0"
                value={urgentFeeExtra}
                onChange={e => setUrgentFeeExtra(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                Normal SLA (Days)
              </label>
              <input
                type="number"
                min="1"
                value={processingDaysNormal}
                onChange={e => setProcessingDaysNormal(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                Urgent SLA (Days)
              </label>
              <input
                type="number"
                min="1"
                value={processingDaysUrgent}
                onChange={e => setProcessingDaysUrgent(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Allowed Delivery Channels
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {[
                'Campus Pickup',
                'Courier (Home Delivery)',
                'Email Soft Copy / PDF',
                'Direct to Institution'
              ].map(method => (
                <label
                  key={method}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                    deliveryOptions.includes(method as DeliveryMethodType)
                      ? 'bg-blue-50/70 border-blue-200 text-[#0F2A4A] font-semibold'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={deliveryOptions.includes(method as DeliveryMethodType)}
                    onChange={() => toggleDelivery(method as DeliveryMethodType)}
                    className="w-4 h-4 text-[#0F2A4A] rounded border-gray-300"
                  />
                  <span>{method}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Required Supporting Documents from Applicant
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={docInput}
                onChange={e => setDocInput(e.target.value)}
                placeholder="e.g. Police Clearance or GD Copy (if lost certificate)"
                className="grow px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F2A4A] outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddDoc}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold rounded-xl flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Doc
              </button>
            </div>

            <div className="mt-2 space-y-1.5">
              {requiredDocs.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                >
                  <span className="font-medium text-gray-800">&bull; {doc}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDoc(idx)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-[#0F2A4A] hover:bg-[#1a3d66] rounded-xl flex items-center gap-2 shadow-sm transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              {editingService ? 'Save Changes' : 'Create Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
