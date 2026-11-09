/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, X, Send, CheckCircle2, Phone, Mail, Clock } from 'lucide-react';
import { useAdminDeskStore } from '../../hooks/useAdminDeskStore';
import { useApp } from '../../context/AppContext';
import { SupportTicket } from '../../types/admindesk';

interface ContactSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactSupportModal: React.FC<ContactSupportModalProps> = ({
  isOpen,
  onClose
}) => {
  const { submitSupportTicket, settings } = useAdminDeskStore();
  const { currentUser } = useApp();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<SupportTicket['category']>('Service Request Delay');
  const [priority, setPriority] = useState<SupportTicket['priority']>('Normal');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    submitSupportTicket({
      alumniId: currentUser.id,
      alumniName: currentUser.name,
      alumniEmail: currentUser.email,
      subject: subject.trim(),
      message: message.trim(),
      category,
      priority
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-navy text-white flex items-center justify-center font-bold">
              <HelpCircle className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Contact University Admin Desk</h3>
              <p className="text-[11px] text-slate-500">Controller of Examinations & Registrar Helpdesk</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600 animate-bounce" />
            <h4 className="font-bold text-slate-800 text-base">Support Ticket Created!</h4>
            <p className="text-xs text-slate-500">
              Your inquiry has been assigned to the Registrar Office duty officer. You will receive an email and notification update once reviewed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {/* Quick Contact Strip */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-slate-600 space-y-1">
              <div className="flex items-center gap-2 font-medium">
                <Clock className="w-3.5 h-3.5 text-navy shrink-0" />
                <span>{settings.officeHours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{settings.supportPhone}</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Ticket Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Service Request Delay">Service Request Status / Delay</option>
                <option value="Payment Issue">Payment Verification / Transaction Query</option>
                <option value="Document Correction">Spelling / Grade Correction on Certificate</option>
                <option value="Lost Certificate Inquiry">Lost Certificate / Replacement Process</option>
                <option value="Other">Other Administrative Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Urgent query about transcript courier SA-DHK-992140"
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Detailed Message
              </label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe your query with any relevant Tracking ID or BAUST Student ID..."
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-navy"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-navy text-white font-bold hover:bg-[#0b1f36] transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Submit Support Ticket
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
