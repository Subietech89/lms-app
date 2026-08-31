import React, { useEffect } from "react";
import {
  Award,
  Download,
  Printer,
  X,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Calendar,
  User,
  Layers,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Certificate, Course } from "../types";
import { StorageService } from "../utils/storage";

interface CertificateModalProps {
  certificate: Certificate | null;
  course?: Course | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  certificate,
  course,
  onClose,
}) => {
  useEffect(() => {
    if (certificate) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  }, [certificate]);

  if (!certificate) return null;

  const websiteSettings = StorageService.getWebsiteSettings();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div
        className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Action Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Award className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-white">Cryptographic Certificate Verification</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              id="print-cert-btn"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Display Canvas */}
        <div className="p-6 sm:p-10">
          <div className="relative p-8 sm:p-12 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/40 text-center space-y-6 shadow-inner ring-1 ring-amber-400/20">
            {/* Corner Ornamental Accents */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-amber-400/60" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-amber-400/60" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-amber-400/60" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-amber-400/60" />

            {/* Seal & Logo */}
            <div className="flex items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 ring-4 ring-amber-500/20">
                <Award className="w-6 h-6" />
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-amber-400 font-bold">
                {websiteSettings.organizationName || websiteSettings.siteName || "Nexus Sovereign Education Systems"}
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Certificate of Mastery & Completion
              </h2>
            </div>

            <p className="text-xs text-slate-400 italic">This is officially presented to</p>

            {/* Recipient Name */}
            <div className="border-b border-amber-500/30 pb-2 max-w-md mx-auto">
              <h3 className="text-xl sm:text-2xl font-bold text-amber-200 tracking-wide">
                {certificate.userName}
              </h3>
            </div>

            <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
              for successfully completing all modular coursework, interactive SCORM simulations, and passing final assessments for
            </p>

            {/* Course Title */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 max-w-lg mx-auto">
              <h4 className="text-base font-bold text-white">{certificate.courseTitle}</h4>
            </div>

            {/* Signatures & Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 text-xs">
              <div className="space-y-1">
                <p className="text-[11px] text-slate-500">Instructor Signature</p>
                <p className="font-semibold text-slate-200">{certificate.instructorName}</p>
                <p className="text-[10px] text-slate-500">Faculty Chair</p>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] text-slate-500">Issued On</p>
                <p className="font-semibold text-slate-200">{certificate.issueDate}</p>
                <p className="text-[10px] text-emerald-400">Score: {certificate.gradeScore}%</p>
              </div>

              <div className="space-y-1 font-mono text-[10px]">
                <p className="text-slate-500">Verification Hash</p>
                <p className="text-amber-400 truncate" title={certificate.verificationHash}>
                  {certificate.verificationHash.slice(0, 16)}...
                </p>
                <p className="text-emerald-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Sovereign Verified</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono">Cert ID: {certificate.id}</span>
          <span>Stored in user sovereign database</span>
        </div>
      </div>
    </div>
  );
};
