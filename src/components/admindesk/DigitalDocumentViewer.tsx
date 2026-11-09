/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Printer, Download, ShieldCheck, CheckCircle2, QrCode } from 'lucide-react';
import { AdminDeskRequest } from '../../types/admindesk';

interface DigitalDocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  request: AdminDeskRequest;
}

export const DigitalDocumentViewer: React.FC<DigitalDocumentViewerProps> = ({
  isOpen,
  onClose,
  request
}) => {
  if (!isOpen) return null;

  const doc = request.finalDeliverable || {
    documentNumber: `BAUST/EXAM/${request.services[0]?.serviceId.toUpperCase()}/2026/${request.id.slice(-4)}`,
    title: `${request.services[0]?.serviceName} (Official Certified Digital Copy)`,
    issuedDate: new Date().toISOString().split('T')[0],
    qrCodeUrl: `https://bcb.baust.edu.bd/verify-document?id=${request.id}`,
    fileUrl: `https://example.com/docs/${request.id}.pdf`,
    watermark: 'DIGITAL OFFICIAL COPY - BAUST EXAM ARCHIVES',
    digitalSignature: 'ENG. MD. JAHIDUL ISLAM, ASST. CONTROLLER',
    signatoryTitle: 'Assistant Controller of Examinations'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header Controls */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">Official Digital Certificate Preview</h3>
              <p className="text-[11px] text-slate-500 font-mono">Serial: {doc.documentNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-navy" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Parchment Certificate Canvas */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 bg-amber-50/20">
          <div className="bg-[#FFFDF9] border-8 border-double border-[#0F2A4A]/40 rounded-2xl p-6 sm:p-10 shadow-lg relative overflow-hidden text-slate-900">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-5 rotate-[-30deg]">
              <span className="text-5xl sm:text-6xl font-black uppercase text-center font-serif leading-tight">
                BANGLADESH ARMY UNIVERSITY<br />OF SCIENCE AND TECHNOLOGY
              </span>
            </div>

            {/* University Crest & Header */}
            <div className="text-center pb-6 border-b-2 border-slate-300/80 relative z-10">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-linear-to-br from-[#0F2A4A] to-[#2E5E3E] text-white flex items-center justify-center font-bold shadow-md mb-2">
                <span className="text-xs font-mono font-black text-amber-400 tracking-wider">BAUST</span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-[#0F2A4A] uppercase tracking-wider font-serif">
                Bangladesh Army University of Science and Technology
              </h1>
              <p className="text-xs text-slate-600 font-medium">Saidpur Cantonment, Nilphamari-5310, Bangladesh</p>
              <p className="text-[11px] text-[#2E5E3E] font-semibold mt-0.5">Office of the Controller of Examinations</p>
            </div>

            {/* Certificate Title */}
            <div className="text-center py-6 relative z-10">
              <div className="inline-block px-5 py-1.5 rounded-full bg-navy/5 text-navy border border-navy/20 font-bold uppercase tracking-wider text-xs font-serif">
                {doc.title}
              </div>
            </div>

            {/* Recipient Details & Body */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed relative z-10 font-serif">
              <p>
                This is to certify that <strong>{request.alumniName}</strong>, bearing BAUST Student ID <strong>{request.baustId}</strong>, was a bona fide undergraduate student of the Department of <strong>{request.department}</strong> (<strong>{request.batch}</strong>).
              </p>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-sans grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs my-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Graduation Year</span>
                  <div className="font-bold text-slate-900">{request.passingYear}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Cumulative GPA</span>
                  <div className="font-bold text-amber-900">{request.cgpa.toFixed(2)} / 4.00</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Document Serial</span>
                  <div className="font-mono font-bold text-slate-800">{doc.documentNumber}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Security Hologram</span>
                  <div className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Affixed
                  </div>
                </div>
              </div>

              <p>
                The academic requirements prescribed by the Academic Council for the Degree of Bachelor of Science in {request.department} have been successfully fulfilled in good standing.
              </p>
            </div>

            {/* Bottom Footer: QR Verification and Dual Signatures */}
            <div className="pt-8 mt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
              {/* QR Code */}
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 p-1 bg-white border border-slate-300 rounded-xl flex items-center justify-center shrink-0">
                  <QrCode className="w-14 h-14 text-slate-800" />
                </div>
                <div className="text-[10px] text-slate-500 font-sans">
                  <span className="font-bold text-slate-800 block">Scan to Verify Authenticity</span>
                  <span>bcb.baust.edu.bd/verify-document</span>
                  <span className="block text-slate-400 font-mono mt-0.5">ID: {request.id}</span>
                </div>
              </div>

              {/* Digital Signatures */}
              <div className="text-right font-sans text-xs">
                <div className="inline-block border-b border-slate-400 pb-1 px-4 mb-1 font-serif italic text-navy font-bold">
                  {doc.digitalSignature}
                </div>
                <div className="font-bold text-slate-900 text-[11px]">{doc.signatoryTitle}</div>
                <div className="text-[10px] text-slate-500">Bangladesh Army University of Science and Technology</div>
                <div className="text-[10px] text-slate-400">Date of Issue: {doc.issuedDate}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            Digital Signature Hash: 77a89f92...bcb-verified
          </span>
          <button
            onClick={() => {
              window.print();
            }}
            className="px-5 py-2 rounded-xl bg-navy text-white hover:bg-[#0b1f36] text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            Download Digital PDF
          </button>
        </div>
      </div>
    </div>
  );
};
