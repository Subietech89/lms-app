import React, { useState } from "react";
import {
  GraduationCap,
  Bell,
  Sparkles,
  Database,
  Server,
  UserCheck,
  Award,
  BookOpen,
  ChevronDown,
  Layers,
  ShieldCheck,
  Search,
  Globe,
  Share2,
  User as UserIcon,
  LogOut,
  Smartphone,
  Laptop,
} from "lucide-react";
import { UserRole, WebsiteSettings } from "../types";
import { StorageService } from "../utils/storage";
import { getLogoIcon } from "../utils/theme";

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeView: "catalog" | "course" | "gradebook" | "admin" | "certificates";
  onViewChange: (view: "catalog" | "course" | "gradebook" | "admin" | "certificates") => void;
  onOpenAiTutor: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  websiteSettings: WebsiteSettings;
  onOpenAuthModal: () => void;
  onOpenSharePortalModal: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  activeView,
  onViewChange,
  onOpenAiTutor,
  onOpenNotifications,
  unreadCount,
  searchQuery,
  onSearchChange,
  websiteSettings,
  onOpenAuthModal,
  onOpenSharePortalModal,
  onLogout,
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const currentUser = StorageService.getActiveUser();
  const dbConfig = StorageService.getDatabaseConfig();
  const LogoIcon = getLogoIcon(websiteSettings.logoIcon);

  const roleLabels: Record<UserRole, { label: string; icon: any; color: string; desc: string }> = {
    student: {
      label: "Student Web Portal",
      icon: GraduationCap,
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      desc: "Browser Course Player, SCORM, Quizzes & Certs",
    },
    teacher: {
      label: "Teacher Portal",
      icon: BookOpen,
      color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      desc: "Gradebook, Course Builder & Broadcasts",
    },
    admin: {
      label: "Admin & Control Center",
      icon: ShieldCheck,
      color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      desc: "Website Settings, DB Sovereignty, Docker & AI",
    },
  };

  const RoleIcon = roleLabels[currentRole].icon;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#16191f]/95 backdrop-blur-md border-b border-white/10">
      {/* Top Announcement Marquee Banner (if enabled) */}
      {websiteSettings.showAnnouncement && websiteSettings.announcementText && (
        <div
          id="website-announcement-banner"
          className="w-full bg-gradient-to-r from-emerald-950 via-[#10b981]/20 to-emerald-950 border-b border-emerald-500/20 px-4 py-1.5 text-center text-xs text-emerald-300 flex items-center justify-center gap-2"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium truncate">{websiteSettings.announcementText}</span>
          <span className="hidden sm:inline text-[11px] text-emerald-400/80 font-mono">
            • Web Access Live
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-6">
          <button
            id="brand-logo-btn"
            onClick={() => {
              if (currentRole === "admin") {
                onViewChange("admin");
              } else if (currentRole === "teacher") {
                onViewChange("gradebook");
              } else {
                onViewChange("catalog");
              }
            }}
            className="flex items-center gap-3 text-left group transition"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/30 group-hover:scale-105 transition text-black font-bold shrink-0">
              {websiteSettings.logoType === "image" && websiteSettings.logoImageUrl ? (
                <img
                  src={websiteSettings.logoImageUrl}
                  alt="Site Logo"
                  className="w-8 h-8 rounded object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : websiteSettings.logoType === "text" ? (
                <span className="text-sm font-black tracking-tighter">
                  {websiteSettings.logoTextBadge || "NX"}
                </span>
              ) : (
                <LogoIcon className="w-5 h-5 text-black" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white group-hover:text-emerald-400 transition">
                  {websiteSettings.siteName || "Nexus Academy"}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-white/5 text-emerald-400 border border-white/10">
                  {currentRole === "admin" ? "Admin" : currentRole === "teacher" ? "Faculty" : "Learner"}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block truncate max-w-xs">
                {websiteSettings.tagline || "Self-Hosted Cloud & Systems LMS"}
              </p>
            </div>
          </button>

          {/* Primary Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Student Dashboard / Catalog */}
            <button
              id="nav-catalog-btn"
              onClick={() => onViewChange("catalog")}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
                activeView === "catalog"
                  ? "bg-white/10 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              {currentRole === "student" ? "My Dashboard & Courses" : "Course Catalog"}
            </button>

            {currentRole === "student" && (
              <button
                id="nav-certs-btn"
                onClick={() => onViewChange("certificates")}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                  activeView === "certificates"
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>My Certificates</span>
              </button>
            )}

            {(currentRole === "teacher" || currentRole === "admin") && (
              <button
                id="nav-gradebook-btn"
                onClick={() => onViewChange("gradebook")}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                  activeView === "gradebook"
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>{currentRole === "teacher" ? "Teacher Dashboard" : "Instructor Gradebook"}</span>
              </button>
            )}

            {currentRole === "admin" && (
              <button
                id="nav-admin-btn"
                onClick={() => onViewChange("admin")}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                  activeView === "admin"
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Admin Dashboard & M365</span>
              </button>
            )}
          </nav>
        </div>

        {/* Center Search (when in catalog view) */}
        {activeView === "catalog" && (
          <div className="hidden lg:flex items-center flex-1 max-w-xs relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
            <input
              id="header-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search SCORM, HTML, Quizzes..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#0f1115] border border-white/10 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
            />
          </div>
        )}

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Share Web Portal Link Button (Launch on Google Sites, Microsoft 365, Teams) */}
          <button
            id="launch-web-portal-share-btn"
            onClick={onOpenSharePortalModal}
            title="Launch on Google Sites or Microsoft SharePoint without your own domain"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-semibold text-emerald-300 transition"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Launch on Google Sites / M365</span>
            <span className="sm:hidden">Launch</span>
          </button>

          {/* BYO-AI Study Buddy Trigger */}
          <button
            id="ai-study-tutor-btn"
            onClick={onOpenAiTutor}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 text-xs font-semibold transition shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-black animate-pulse" />
            <span className="hidden sm:inline">AI Tutor</span>
          </button>

          {/* Real-time Notifications Bell */}
          <button
            id="notifications-bell-btn"
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 transition"
            aria-label="Student Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-black text-[10px] font-bold flex items-center justify-center ring-2 ring-[#16191f] animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Account / Role Switcher Trigger */}
          <div className="relative">
            <button
              id="role-switcher-dropdown-btn"
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${roleLabels[currentRole].color}`}
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-5 h-5 rounded-full object-cover border border-white/20"
                referrerPolicy="no-referrer"
              />
              <span className="hidden md:inline truncate max-w-[110px]">{currentUser.name}</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {roleDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#16191f] border border-white/10 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setRoleDropdownOpen(false)}
              >
                {/* Active User Card */}
                <div className="p-3 rounded-xl bg-[#0f1115] border border-white/5 mb-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-9 h-9 rounded-full object-cover border border-emerald-500/30"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Streak: {currentUser.learningStreakDays}d 🔥</span>
                    <span className="text-emerald-400 font-mono font-bold">{currentUser.totalPoints} pts</span>
                  </div>
                </div>

                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Switch Active Portal Role
                </div>

                {(["student", "teacher", "admin"] as UserRole[]).map((r) => {
                  const Info = roleLabels[r];
                  const Icon = Info.icon;
                  const isSelected = currentRole === r;
                  return (
                    <button
                      key={r}
                      id={`select-role-${r}`}
                      onClick={() => {
                        onRoleChange(r);
                        StorageService.setRole(r);
                      }}
                      className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left text-xs transition mt-1 ${
                        isSelected
                          ? "bg-white/10 text-white ring-1 ring-white/15"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${Info.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold flex items-center justify-between">
                          <span>{Info.label}</span>
                          {isSelected && <span className="text-[10px] text-emerald-400">✓ Active</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{Info.desc}</p>
                      </div>
                    </button>
                  );
                })}

                {/* Sign In / Switch Account & Log Out */}
                <div className="mt-2 pt-2 border-t border-white/5 space-y-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRoleDropdownOpen(false);
                      onOpenAuthModal();
                    }}
                    className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Switch Profile / Custom Login</span>
                  </button>

                  {onLogout && (
                    <button
                      id="navbar-logout-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRoleDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-semibold flex items-center justify-center gap-2 transition border border-red-500/20"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out of Dashboard</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
