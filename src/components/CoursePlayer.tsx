import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Layers,
  FileCode2,
  HelpCircle,
  Gamepad2,
  CheckCircle2,
  Award,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Share2,
} from "lucide-react";
import { Course, CourseModule, UserProgress, Certificate } from "../types";
import { ScormPlayer } from "./ScormPlayer";
import { HtmlLessonPlayer } from "./HtmlLessonPlayer";
import { QuizPlayer } from "./QuizPlayer";
import { GamePlayer } from "./GamePlayer";
import { StorageService } from "../utils/storage";
import { sound } from "../utils/audio";

interface CoursePlayerProps {
  course: Course;
  onBack: () => void;
  onOpenCertificate: (course: Course) => void;
  onOpenAiTutor: (module?: CourseModule) => void;
}

export const CoursePlayer: React.FC<CoursePlayerProps> = ({
  course,
  onBack,
  onOpenCertificate,
  onOpenAiTutor,
}) => {
  const currentUser = StorageService.getActiveUser();
  const [userProgress, setUserProgress] = useState<UserProgress>(
    StorageService.getProgress(currentUser.id, course.id)
  );

  const [activeModuleId, setActiveModuleId] = useState<string>(
    course.modules[0]?.id || ""
  );

  const activeModule = course.modules.find((m) => m.id === activeModuleId) || course.modules[0];
  const activeModuleIndex = course.modules.findIndex((m) => m.id === activeModuleId);

  // Sync progress state on module completion
  const handleModuleCompleted = (
    score: number = 100,
    extraCmiData?: any
  ) => {
    const updated = StorageService.saveProgress(
      currentUser.id,
      course.id,
      activeModule.id,
      score,
      extraCmiData
    );
    setUserProgress(updated);

    // If whole course completed, play fanfare and alert
    if (updated.isCompleted && !userProgress.isCompleted) {
      sound.playFanfare();
    }
  };

  const isModuleCompleted = (modId: string) => {
    return userProgress.moduleProgress[modId]?.completed || false;
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case "scorm":
        return <Layers className="w-4 h-4 text-indigo-400" />;
      case "html":
        return <FileCode2 className="w-4 h-4 text-cyan-400" />;
      case "quiz":
        return <HelpCircle className="w-4 h-4 text-amber-400" />;
      case "game":
        return <Gamepad2 className="w-4 h-4 text-fuchsia-400" />;
      default:
        return <BookOpen className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            id="course-player-back-btn"
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
                {course.category}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400 font-mono">v{course.version}</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{course.title}</h2>
          </div>
        </div>

        {/* Course Progress & Certificate trigger */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end text-xs">
              <span className="text-slate-400 font-medium">Course Mastery:</span>
              <span className="font-mono font-bold text-indigo-400">
                {userProgress.overallPercent}%
              </span>
            </div>
            <div className="w-32 bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${userProgress.overallPercent}%` }}
              />
            </div>
          </div>

          {userProgress.isCompleted && (
            <button
              id="view-course-cert-btn"
              onClick={() => onOpenCertificate(course)}
              className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>View Certificate</span>
            </button>
          )}

          <button
            id="open-ai-tutor-fab"
            onClick={() => onOpenAiTutor(activeModule)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-md shadow-indigo-950"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Tutor</span>
          </button>
        </div>
      </div>

      {/* Main Learning Canvas with Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Module Sidebar */}
        <div className="lg:col-span-4 bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60">
            <h3 className="font-bold text-white text-sm">Course Curriculum</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {course.modules.length} interactive modules
            </p>
          </div>

          <div className="divide-y divide-slate-800/60 max-h-[560px] overflow-y-auto">
            {course.modules.map((mod, idx) => {
              const isCurrent = mod.id === activeModuleId;
              const completed = isModuleCompleted(mod.id);

              return (
                <button
                  key={mod.id}
                  id={`module-select-${mod.id}`}
                  onClick={() => setActiveModuleId(mod.id)}
                  className={`w-full p-4 text-left transition flex items-start justify-between gap-3 ${
                    isCurrent
                      ? "bg-indigo-950/60 border-l-4 border-l-indigo-500 text-white"
                      : "hover:bg-slate-800/40 text-slate-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                      {getModuleIcon(mod.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase text-slate-500">
                          0{idx + 1}
                        </span>
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          {mod.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold mt-0.5 line-clamp-1">
                        {mod.title}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{mod.durationMinutes} mins</span>
                      </p>
                    </div>
                  </div>

                  {completed && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Module Player Container */}
        <div className="lg:col-span-8 space-y-6">
          {activeModule.type === "scorm" && (
            <ScormPlayer
              module={activeModule}
              courseTitle={course.title}
              onComplete={(score, cmi) => handleModuleCompleted(score, cmi)}
              savedCmiData={userProgress.cmiData}
            />
          )}

          {activeModule.type === "html" && (
            <HtmlLessonPlayer
              module={activeModule}
              courseTitle={course.title}
              onComplete={() => handleModuleCompleted(100)}
              isCompleted={isModuleCompleted(activeModule.id)}
            />
          )}

          {activeModule.type === "quiz" && (
            <QuizPlayer
              module={activeModule}
              courseTitle={course.title}
              onComplete={(score) => handleModuleCompleted(score)}
              savedScore={userProgress.moduleProgress[activeModule.id]?.score}
            />
          )}

          {activeModule.type === "game" && (
            <GamePlayer
              module={activeModule}
              courseTitle={course.title}
              onComplete={(score) => handleModuleCompleted(score)}
              savedScore={userProgress.moduleProgress[activeModule.id]?.score}
            />
          )}

          {/* Module Prev / Next Navigation Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                if (activeModuleIndex > 0) {
                  setActiveModuleId(course.modules[activeModuleIndex - 1].id);
                }
              }}
              disabled={activeModuleIndex === 0}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Module</span>
            </button>

            <span className="text-xs text-slate-500 font-medium">
              Module {activeModuleIndex + 1} of {course.modules.length}
            </span>

            <button
              onClick={() => {
                if (activeModuleIndex < course.modules.length - 1) {
                  setActiveModuleId(course.modules[activeModuleIndex + 1].id);
                }
              }}
              disabled={activeModuleIndex === course.modules.length - 1}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-30"
            >
              <span>Next Module</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
