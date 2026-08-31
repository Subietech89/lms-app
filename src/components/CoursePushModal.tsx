import React, { useState } from "react";
import {
  Radio,
  X,
  Send,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  Download,
  Bell,
  RefreshCw,
} from "lucide-react";
import { Course } from "../types";
import { StorageService } from "../utils/storage";
import { sound } from "../utils/audio";

interface CoursePushModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  onCoursePushed: (broadcastInfo: {
    courseId: string;
    courseTitle: string;
    version: string;
    message: string;
  }) => void;
}

export const CoursePushModal: React.FC<CoursePushModalProps> = ({
  isOpen,
  onClose,
  courses,
  onCoursePushed,
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || "");
  const [versionBump, setVersionBump] = useState<string>("3.5.0");
  const [releaseNotes, setReleaseNotes] = useState<string>(
    "Added new interactive zero-trust SCORM simulation lab, updated Kubernetes ingress manifests, and refreshed assessment quiz bank."
  );
  const [isPushing, setIsPushing] = useState<boolean>(false);
  const [pushSuccess, setPushSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const targetCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  const handleExecutePush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCourse || isPushing) return;

    setIsPushing(true);

    try {
      const res = await fetch("/api/courses/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: targetCourse.id,
          courseTitle: targetCourse.title,
          version: versionBump,
          releaseNotes,
        }),
      });
      const data = await res.json();

      // Dispatch local notification to students
      StorageService.addNotification({
        id: "push_update_" + Date.now(),
        roleTarget: "student",
        title: `🚀 Course Update Available: ${targetCourse.title} (v${versionBump})`,
        message: releaseNotes,
        type: "course_update",
        timestamp: "Just now",
        read: false,
        payload: {
          courseId: targetCourse.id,
          version: versionBump,
          downloadUrl: `/packages/${targetCourse.id}-v${versionBump}.lms.zip`,
        },
      });

      // Update course version in storage
      targetCourse.version = versionBump;
      StorageService.saveCourse(targetCourse);

      sound.playFanfare();
      setPushSuccess(true);

      onCoursePushed({
        courseId: targetCourse.id,
        courseTitle: targetCourse.title,
        version: versionBump,
        message: releaseNotes,
      });

      setTimeout(() => {
        setPushSuccess(false);
        onClose();
      }, 1800);
    } catch {
      setIsPushing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Radio className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                Integrated Course Launch & Push Function
              </h3>
              <p className="text-[11px] text-slate-400">
                Broadcast updates and trigger student download prompts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Push Form */}
        <form onSubmit={handleExecutePush} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Select Course Package to Update
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} (Current: v{c.version})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              New Release Version String
            </label>
            <input
              type="text"
              value={versionBump}
              onChange={(e) => setVersionBump(e.target.value)}
              placeholder="e.g. 3.5.0"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Changelog & Student Broadcast Message
            </label>
            <textarea
              rows={3}
              value={releaseNotes}
              onChange={(e) => setReleaseNotes(e.target.value)}
              placeholder="Describe what changed in this version..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
            />
          </div>

          {pushSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Broadcast live! All student dashboards have received the update prompt.
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>

            <button
              id="confirm-push-broadcast-btn"
              type="submit"
              disabled={isPushing}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-indigo-950 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isPushing ? "Broadcasting Update..." : "Launch Update Broadcast"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
