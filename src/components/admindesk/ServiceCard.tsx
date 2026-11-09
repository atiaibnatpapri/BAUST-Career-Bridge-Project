/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  FileText, 
  Award, 
  GraduationCap, 
  CheckCircle2, 
  FileSpreadsheet, 
  Globe, 
  ShieldCheck, 
  FileWarning, 
  BookOpen, 
  FileCheck, 
  ArrowRightLeft, 
  HelpCircle,
  Clock,
  Truck,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { AdminDeskService } from '../../types/admindesk';

interface ServiceCardProps {
  service: AdminDeskService;
  onRequest: (service: AdminDeskService) => void;
  isAdminView?: boolean;
  onEdit?: (service: AdminDeskService) => void;
  onToggleEnabled?: (serviceId: string) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  FileText: <FileText className="w-5 h-5" />,
  Award: <Award className="w-5 h-5" />,
  GraduationCap: <GraduationCap className="w-5 h-5" />,
  CheckCircle2: <CheckCircle2 className="w-5 h-5" />,
  FileSpreadsheet: <FileSpreadsheet className="w-5 h-5" />,
  Globe: <Globe className="w-5 h-5" />,
  ShieldCheck: <ShieldCheck className="w-5 h-5" />,
  FileWarning: <FileWarning className="w-5 h-5" />,
  BookOpen: <BookOpen className="w-5 h-5" />,
  FileCheck: <FileCheck className="w-5 h-5" />,
  ArrowRightLeft: <ArrowRightLeft className="w-5 h-5" />,
  HelpCircle: <HelpCircle className="w-5 h-5" />
};

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onRequest,
  isAdminView = false,
  onEdit,
  onToggleEnabled
}) => {
  const icon = ICON_MAP[service.icon] || <FileText className="w-5 h-5" />;

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between p-5 relative overflow-hidden group ${
      !service.enabled ? 'opacity-60 bg-slate-50 border-slate-200' : 'border-slate-200/90 hover:border-[#0F2A4A]/30'
    }`}>
      {/* Category Tag & Fee */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {service.category}
          </span>
          <div className="text-right">
            <span className="text-base font-extrabold text-[#0F2A4A]">
              BDT {service.fee}
            </span>
            <span className="text-[10px] text-slate-400 block -mt-0.5">
              + BDT {service.perCopyFee}/extra copy
            </span>
          </div>
        </div>

        {/* Title & Icon */}
        <div className="flex items-start gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#0F2A4A]/5 text-[#0F2A4A] flex items-center justify-center shrink-0 border border-[#0F2A4A]/10 group-hover:bg-[#0F2A4A] group-hover:text-white transition-colors">
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm leading-snug">
              {service.name}
            </h3>
            {service.nameBn && (
              <p className="text-[11px] text-slate-400 font-serif mt-0.5">
                {service.nameBn}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
          {service.description}
        </p>

        {/* Processing Time & Delivery Badges */}
        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-xs text-slate-600 space-y-1 mb-3">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-700 font-medium">
              <Clock className="w-3.5 h-3.5 text-navy" />
              Standard: {service.processingDaysNormal} days
            </span>
            <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.2 rounded">
              Urgent: {service.processingDaysUrgent}d (+BDT {service.urgentFeeExtra})
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pt-1 border-t border-slate-200/50">
            <Truck className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">
              {service.deliveryOptions.join(', ')}
            </span>
          </div>
        </div>

        {/* Suggested tags */}
        {service.suggestedFor && service.suggestedFor.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {service.suggestedFor.map((tag, idx) => (
              <span key={idx} className="text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded">
                ✦ {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 mt-1">
        {isAdminView ? (
          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => onToggleEnabled && onToggleEnabled(service.id)}
              className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                service.enabled
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {service.enabled ? 'Enabled' : 'Disabled'}
            </button>
            <button
              onClick={() => onEdit && onEdit(service)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold"
            >
              Edit Specs
            </button>
          </div>
        ) : (
          <button
            onClick={() => onRequest(service)}
            disabled={!service.enabled}
            className="w-full py-2.5 px-4 rounded-xl bg-navy text-white text-xs font-bold hover:bg-[#0b1f36] transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            <span>Request Document</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
