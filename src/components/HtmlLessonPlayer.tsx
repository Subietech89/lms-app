import React, { useState } from "react";
import {
  FileCode2,
  CheckCircle,
  Copy,
  Check,
  BookOpen,
  Terminal,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { CourseModule } from "../types";
import { sound } from "../utils/audio";

interface HtmlLessonPlayerProps {
  module: CourseModule;
  courseTitle: string;
  onComplete: () => void;
  isCompleted?: boolean;
}

export const HtmlLessonPlayer: React.FC<HtmlLessonPlayerProps> = ({
  module,
  courseTitle,
  onComplete,
  isCompleted = false,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleFinish = () => {
    sound.playSuccess();
    onComplete();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <FileCode2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Interactive HTML5 Lab
              </span>
              <span className="text-xs text-slate-400">{module.durationMinutes} mins read</span>
            </div>
            <h3 className="font-bold text-white text-base mt-0.5">{module.title}</h3>
          </div>
        </div>

        <div>
          {isCompleted ? (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Lesson Completed</span>
            </span>
          ) : (
            <button
              id="complete-html-lesson-btn"
              onClick={handleFinish}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-md shadow-cyan-950"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark Lesson Complete</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Canvas */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 text-slate-200 text-sm leading-relaxed">
        {/* Render markdown-like sections cleanly */}
        <div className="prose prose-invert max-w-none space-y-4">
          {module.htmlContent ? (
            <div className="space-y-4 whitespace-pre-line font-sans">
              {module.htmlContent}
            </div>
          ) : (
            <p className="text-slate-400">Loading interactive module content...</p>
          )}
        </div>

        {/* Interactive Checkpoint Card */}
        <div className="mt-8 p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
            <Terminal className="w-4 h-4" />
            <span>Interactive Comprehension Check</span>
          </div>
          <p className="text-xs text-slate-300">
            Have you reviewed the architectural constraints, TLS configurations, and self-hosted recipes outlined in this lesson?
          </p>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => {
                setHasInteracted(true);
                handleFinish();
              }}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Comprehension & Save Progress</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
