import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  Calendar,
  Building,
  GraduationCap,
  ExternalLink,
  ArrowLeft,
  Award,
  AlertCircle,
  Download
} from 'lucide-react';
import { useAdminDeskStore } from '../../hooks/useAdminDeskStore';
import { DigitalDocumentViewer } from '../../components/admindesk/DigitalDocumentViewer';

export const VerifyDocumentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { requests } = useAdminDeskStore();

  const initialQuery =
    searchParams.get('trackingId') || searchParams.get('id') || searchParams.get('doc') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searched, setSearched] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Match lookup
  const matchedRequest = requests.find(r => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.trim().toLowerCase();
    const matchesTracking = r.id.toLowerCase() === q;
    const matchesDocNumber =
      r.finalDeliverable && r.finalDeliverable.documentNumber.toLowerCase() === q;
    return matchesTracking || matchesDocNumber;
  });

  useEffect(() => {
    if (initialQuery) {
      setSearched(true);
    }
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearched(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24">
      {/* Top Banner */}
      <header className="bg-[#0F2A4A] text-white py-10 px-4 md:px-8 border-b border-[#C9A227]/30 shadow-md">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to BAUST Career Bridge</span>
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-[#C9A227] border border-[#C9A227]/40">
            <ShieldCheck className="w-4 h-4" />
            <span>Official University Document Authentication Portal</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Verify Academic Document Authenticity
          </h1>
          <p className="text-xs md:text-sm text-white/80 max-w-xl mx-auto leading-relaxed">
            Verify official transcripts, degree certificates, and letters issued by Bangladesh Army University of Science and Technology (BAUST) using the Tracking ID or Document Serial Number.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="pt-4 max-w-xl mx-auto">
            <div className="flex bg-white rounded-2xl p-1.5 shadow-xl border-2 border-[#C9A227]">
              <div className="relative grow flex items-center pl-3">
                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  required
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Enter Tracking ID (e.g. BCB-2026-000123) or Doc #"
                  className="w-full px-3 py-2 text-xs md:text-sm text-gray-900 placeholder-gray-400 outline-hidden font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#0F2A4A] hover:bg-[#1a3d66] text-white text-xs md:text-sm font-bold rounded-xl transition-all shadow-sm shrink-0 flex items-center gap-1.5"
              >
                <span>Verify</span>
              </button>
            </div>
            <div className="text-[11px] text-white/60 mt-2 text-left px-2">
              Sample queries: <button type="button" onClick={() => { setSearchQuery('BCB-2026-000123'); setSearched(true); }} className="underline hover:text-white font-mono">BCB-2026-000123</button> &bull; <button type="button" onClick={() => { setSearchQuery('BCB-2026-000125'); setSearched(true); }} className="underline hover:text-white font-mono">BCB-2026-000125</button>
            </div>
          </form>
        </div>
      </header>

      {/* Main Result Body */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 mt-8">
        {!searched ? (
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xs text-center space-y-4">
            <GraduationCap className="w-12 h-12 text-[#0F2A4A] mx-auto opacity-80" />
            <h3 className="text-base font-bold text-[#0F2A4A]">Zero Counterfeits &bull; Instant Verification</h3>
            <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
              Employers, embassies, and admissions officers worldwide can instantly validate credentials without physical paper queries or lengthy embassy attestations.
            </p>
          </div>
        ) : matchedRequest ? (
          <div className="space-y-6">
            {/* Authenticity Certificate Banner */}
            <div className="bg-gradient-to-r from-emerald-800 to-[#0F2A4A] text-white p-6 rounded-2xl shadow-lg border border-emerald-500/30">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl shrink-0">
                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-400 text-emerald-950 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Official Verified Record
                    </div>
                    <h2 className="text-xl font-black text-white">
                      Document Validated & Registered
                    </h2>
                    <p className="text-xs text-emerald-100/80 mt-0.5">
                      Issued under the seal of the Controller of Examinations, BAUST
                    </p>
                  </div>
                </div>

                <div className="text-left md:text-right bg-white/10 p-3 rounded-xl border border-white/10">
                  <span className="text-[10px] text-white/60 block uppercase font-bold">Verification Hash</span>
                  <span className="font-mono text-xs text-[#C9A227] font-bold">
                    BAUST-SHA256-{matchedRequest.id.toUpperCase()}-VERIFIED
                  </span>
                </div>
              </div>
            </div>

            {/* Document Details Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#0F2A4A] uppercase tracking-wider border-b border-gray-100 pb-2">
                Document Credentials
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 block font-medium">Document Title:</span>
                  <span className="text-sm font-bold text-gray-900">
                    {matchedRequest.services[0]?.serviceName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Tracking ID:</span>
                  <span className="font-mono font-bold text-[#0F2A4A] text-sm">
                    {matchedRequest.id}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Student Name:</span>
                  <span className="text-sm font-bold text-gray-900">{matchedRequest.alumniName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Student ID Number:</span>
                  <span className="font-mono font-bold text-gray-900 text-sm">
                    {matchedRequest.baustId}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Academic Department:</span>
                  <span className="font-semibold text-gray-800">{matchedRequest.department}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Graduation Year / Batch:</span>
                  <span className="font-semibold text-gray-800">
                    {matchedRequest.batch} ({matchedRequest.passingYear})
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Registration Date:</span>
                  <span className="font-medium text-gray-800">{matchedRequest.submittedAt}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Lifecycle Status:</span>
                  <span
                    className={`font-bold px-2.5 py-0.5 rounded-full inline-block ${
                      matchedRequest.status === 'Delivered' || matchedRequest.status === 'Ready'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {matchedRequest.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Digital Document Preview */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0F2A4A] flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#C9A227]" />
                  Registered Institutional Specimen
                </h3>
                <span className="text-xs font-mono text-gray-500">
                  {matchedRequest.finalDeliverable?.documentNumber || 'Certified Record On File'}
                </span>
              </div>
              <button
                onClick={() => setIsViewerOpen(true)}
                className="px-4 py-2 bg-[#0F2A4A] text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> View Full Certificate
              </button>
            </div>

            {/* Viewer Modal */}
            <DigitalDocumentViewer
              isOpen={isViewerOpen}
              onClose={() => setIsViewerOpen(false)}
              request={matchedRequest}
            />
          </div>
        ) : (
          <div className="bg-white p-10 rounded-2xl border-2 border-red-200 shadow-xs text-center space-y-4">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-red-900">Document Record Not Found</h3>
              <p className="text-xs text-gray-600 max-w-md mx-auto mt-1 leading-relaxed">
                The identifier <strong className="font-mono text-red-700">"{searchQuery}"</strong> is not registered in the Bangladesh Army University of Science and Technology central records repository.
              </p>
            </div>

            <div className="p-4 bg-red-50/70 border border-red-200 rounded-xl max-w-lg mx-auto text-left text-xs text-red-800 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>Notice to Employers & Embassies:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                If an applicant presents a paper certificate bearing this tracking number, it has not been validated by BAUST Career Bridge and may be forged. Please email <span className="font-mono font-bold">registrar@baust.edu.bd</span> or call <span className="font-bold">+880 1769-662550</span> for physical verification.
              </p>
            </div>

            <button
              onClick={() => {
                setSearchQuery('');
                setSearched(false);
              }}
              className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors"
            >
              Try Another Number
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
