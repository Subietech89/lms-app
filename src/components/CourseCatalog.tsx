import React, { useState } from "react";
import {
  Sparkles,
  Trophy,
  Flame,
  Award,
  BookOpen,
  Filter,
  PlusCircle,
  Radio,
  Layers,
  ArrowRight,
  Download,
  CheckCircle2,
  RefreshCw,
  Globe,
  Share2,
  Smartphone,
  Laptop,
  Monitor,
  ShieldCheck,
} from "lucide-react";
import { Course, UserRole, WebsiteSettings } from "../types";
import { CourseCard } from "./CourseCard";
import { StorageService } from "../utils/storage";

interface CourseCatalogProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
  onOpenCertificate: (course: Course) => void;
  currentRole: UserRole;
  searchQuery: string;
  onOpenCourseBuilder: () => void;
  onOpenPushModal: () => void;
  websiteSettings: WebsiteSettings;
  onOpenSharePortalModal?: () => void;
  latestBroadcast?: {
    courseId: string;
    courseTitle: string;
    version: string;
    message: string;
  } | null;
  onDismissBroadcast?: () => void;
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({
  courses,
  onSelectCourse,
  onOpenCertificate,
  currentRole,
  searchQuery,
  onOpenCourseBuilder,
  onOpenPushModal,
  websiteSettings,
  onOpenSharePortalModal,
  latestBroadcast,
  onDismissBroadcast,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [formatFilter, setFormatFilter] = useState<string>("all");
  const currentUser = StorageService.getActiveUser();
  const certificates = StorageService.getCertificates(currentUser.id);

  const categories = [
    "All",
    "DevOps & Cloud",
    "Full-Stack Web",
    "Security & Sovereignty",
  ];

  // Filter logic
  const safeCourses = Array.isArray(courses) ? courses : [];
  const filteredCourses = safeCourses.filter((c) => {
    if (!c) return false;
    // Search query filter
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (c.title || "").toLowerCase().includes(q);
      const matchDesc = (c.description || "").toLowerCase().includes(q);
      const matchTags = Array.isArray(c.tags) && c.tags.some((t) => (t || "").toLowerCase().includes(q));
      const matchInstructor = (c.instructorName || "").toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchTags && !matchInstructor) {
        return false;
      }
    }

    // Category filter
    if (selectedCategory !== "All" && c.category !== selectedCategory) {
      return false;
    }

    // Format filter
    if (formatFilter !== "all") {
      const hasType = Array.isArray(c.modules) && c.modules.some((m) => m && m.type === formatFilter);
      if (!hasType) return false;
    }

    return true;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Real-Time Course Update Broadcast Banner */}
      {latestBroadcast && (
        <div className="relative overflow-hidden rounded-2xl bg-[#16191f] border border-emerald-500/30 p-4 sm:p-5 shadow-2xl shadow-emerald-950/30 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Live Launch Update
                  </span>
                  <span className="text-xs text-slate-400 font-mono">v{latestBroadcast.version}</span>
                </div>
                <h3 className="font-bold text-white text-sm sm:text-base mt-1">
                  {latestBroadcast.courseTitle}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {latestBroadcast.message}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                id="sync-course-update-btn"
                onClick={() => {
                  const target = courses.find((c) => c.id === latestBroadcast.courseId);
                  if (target) onSelectCourse(target);
                  if (onDismissBroadcast) onDismissBroadcast();
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Sync & Open Course</span>
              </button>
              {onDismissBroadcast && (
                <button
                  onClick={onDismissBroadcast}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-xs transition"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Website Hero Landing Banner (Customizable in Admin Settings) */}
      {websiteSettings.showHeroBanner && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#16191f] via-[#1a202c] to-[#0f1115] border border-white/10 p-6 sm:p-8 shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Globe className="w-3.5 h-3.5" />
              <span>Browser Web Access • No App Install Needed</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {websiteSettings.heroBannerTitle || "Master Systems & Cloud Architecture Anywhere"}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              {websiteSettings.heroBannerSubtitle || "Access self-hosted SCORM labs, coding simulations, and verifiable certifications directly from your browser on any phone, tablet, or PC."}
            </p>

            {/* Device Compatibility chips & Quick Launch */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-slate-300">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>iOS & Android Phones</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-slate-300">
                <Laptop className="w-4 h-4 text-emerald-400" />
                <span>Mac, PC & Chromebooks</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Downloads</span>
              </div>

              {onOpenSharePortalModal && (
                <button
                  onClick={onOpenSharePortalModal}
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex items-center gap-1.5 transition ml-auto"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Web Link / QR Code</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Student Welcome & Progress Stats Ribbon */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#16191f] via-[#1b202a] to-[#16191f] border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-md"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  Welcome back, {currentUser.name}!
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                  Student Dashboard
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {currentUser.department || "Self-Paced Web Learner"} • Ready to continue your hands-on modules
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Offline Ready & SCORM Sync</span>
            </div>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-[#0f1115]/80 border border-white/5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/5 text-slate-300 border border-white/10">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Available Courses</p>
              <p className="text-lg font-extrabold text-white">{courses.length}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0f1115]/80 border border-white/5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Mastery Points</p>
              <p className="text-lg font-extrabold text-emerald-400">{currentUser.totalPoints}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0f1115]/80 border border-white/5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Verified Certs</p>
              <p className="text-lg font-extrabold text-amber-400">{certificates.length}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0f1115]/80 border border-white/5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Daily Streak</p>
              <p className="text-lg font-extrabold text-rose-400">{currentUser.learningStreakDays} Days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Course Curriculum</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Self-contained learning packages supporting SCORM 1.2/2004, interactive HTML5, quizzes, and mini-games.
          </p>
        </div>

        {/* Teacher / Admin Action Buttons */}
        <div className="flex items-center gap-2.5">
          {(currentRole === "teacher" || currentRole === "admin") && (
            <>
              <button
                id="push-course-update-btn"
                onClick={onOpenPushModal}
                className="px-3.5 py-2 rounded-xl bg-[#16191f] hover:bg-white/5 text-emerald-400 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
              >
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>Broadcast Update</span>
              </button>

              <button
                id="create-new-course-btn"
                onClick={onOpenCourseBuilder}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold flex items-center gap-1.5 transition shadow-md shadow-emerald-950"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Course</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Categories & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              id={`filter-cat-${cat.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? "bg-emerald-500 text-black font-semibold shadow-xs"
                  : "bg-[#16191f] text-slate-400 hover:text-slate-200 border border-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Format selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            id="format-filter-select"
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="bg-[#16191f] border border-white/10 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Formats</option>
            <option value="scorm">SCORM Packages</option>
            <option value="html">HTML5 Labs</option>
            <option value="quiz">Quizzes</option>
            <option value="game">Mini-Games</option>
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-20 bg-[#16191f]/40 rounded-2xl border border-white/5">
          <BookOpen className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No courses match your filter criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Try selecting a different category or search term.</p>
          <button
            onClick={() => {
              setSelectedCategory("All");
              setFormatFilter("all");
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const prog = StorageService.getProgress(currentUser.id, course.id);
            return (
              <CourseCard
                key={course.id}
                course={course}
                progress={prog}
                onSelect={onSelectCourse}
                onOpenCertificate={onOpenCertificate}
              />
            );
          })}
        </div>
      )}

      {/* Custom Footer */}
      <footer className="pt-12 border-t border-white/5 text-center text-xs text-slate-500">
        <p>{websiteSettings.customFooterText || "© 2026 Nexus Sovereign Education Systems • 100% Self-Hosted & Data-Sovereign"}</p>
        <p className="text-[11px] text-slate-600 mt-1">
          Accessible in modern browsers on any smartphone, tablet, Mac, or PC.
        </p>
      </footer>
    </div>
  );
};
