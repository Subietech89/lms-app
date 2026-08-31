import React from "react";
import {
  Clock,
  Star,
  Users,
  CheckCircle,
  PlayCircle,
  Award,
  Layers,
  Sparkles,
  Gamepad2,
  FileCode2,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import { Course, UserProgress } from "../types";

interface CourseCardProps {
  course: Course;
  progress?: UserProgress;
  onSelect: (course: Course) => void;
  onOpenCertificate?: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  progress,
  onSelect,
  onOpenCertificate,
}) => {
  const percent = progress?.overallPercent || 0;
  const isCompleted = progress?.isCompleted || false;

  // Gather format icons available in this course
  const hasScorm = course.modules.some((m) => m.type === "scorm");
  const hasHtml = course.modules.some((m) => m.type === "html");
  const hasQuiz = course.modules.some((m) => m.type === "quiz");
  const hasGame = course.modules.some((m) => m.type === "game");

  return (
    <div
      id={`course-card-${course.id}`}
      className="group flex flex-col bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-xl hover:shadow-indigo-950/40"
    >
      {/* Thumbnail & Version Badge */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-800">
        <img
          src={course.thumbnail}
          alt={course.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-950/80 backdrop-blur-md text-indigo-300 border border-indigo-500/30">
            {course.category}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-slate-900/90 text-slate-300 border border-slate-700">
            v{course.version}
          </span>
        </div>

        {/* Format Feature Badges overlay */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 flex-wrap">
          {hasScorm && (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-950/90 text-indigo-300 border border-indigo-800/80 flex items-center gap-1">
              <Layers className="w-3 h-3" />
              <span>SCORM</span>
            </span>
          )}
          {hasHtml && (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-cyan-950/90 text-cyan-300 border border-cyan-800/80 flex items-center gap-1">
              <FileCode2 className="w-3 h-3" />
              <span>HTML5</span>
            </span>
          )}
          {hasQuiz && (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-950/90 text-amber-300 border border-amber-800/80 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              <span>Quiz</span>
            </span>
          )}
          {hasGame && (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-fuchsia-950/90 text-fuchsia-300 border border-fuchsia-800/80 flex items-center gap-1">
              <Gamepad2 className="w-3 h-3" />
              <span>Game</span>
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="font-semibold text-slate-200">{course.rating.toFixed(2)}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {course.estimatedHours} hrs ({course.modules.length} modules)
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {course.totalStudents.toLocaleString()}
            </span>
          </div>

          <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition line-clamp-2 leading-snug">
            {course.title}
          </h3>

          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {course.description}
          </p>

          {/* Instructor snippet */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/60">
            <img
              src={course.instructorAvatar}
              alt={course.instructorName}
              referrerPolicy="no-referrer"
              className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-700"
            />
            <span className="text-xs text-slate-300 truncate font-medium">
              {course.instructorName}
            </span>
          </div>
        </div>

        {/* Progress & Actions */}
        <div className="mt-5 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-medium">
              {isCompleted ? "Course Completed" : percent > 0 ? "In Progress" : "Not Started"}
            </span>
            <span className="font-mono font-semibold text-indigo-400">{percent}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mb-4">
            <div
              className={`h-full transition-all duration-500 ${
                isCompleted
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                  : "bg-gradient-to-r from-indigo-500 to-indigo-400"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <button
              id={`start-course-${course.id}`}
              onClick={() => onSelect(course)}
              className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm"
            >
              <PlayCircle className="w-4 h-4" />
              <span>{percent > 0 ? (isCompleted ? "Review Course" : "Resume Learning") : "Start Course"}</span>
            </button>

            {isCompleted && onOpenCertificate && (
              <button
                id={`cert-btn-${course.id}`}
                onClick={() => onOpenCertificate(course)}
                title="View Verified Certificate"
                className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition"
              >
                <Award className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
