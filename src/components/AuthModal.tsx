import React, { useState } from "react";
import { User, UserRole, WebsiteSettings } from "../types";
import { StorageService, PRESET_USERS } from "../utils/storage";
import { THEME_PRESETS, getLogoIcon } from "../utils/theme";
import {
  X,
  UserCheck,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  Mail,
  Lock,
  UserPlus,
  ArrowRight,
  Sparkles,
  Globe,
  Smartphone,
  Laptop,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  websiteSettings: WebsiteSettings;
  onUserChanged: (user: User) => void;
}

export function AuthModal({
  isOpen,
  onClose,
  websiteSettings,
  onUserChanged,
}: AuthModalProps) {
  if (!isOpen) return null;

  const [mode, setMode] = useState<"switch" | "login" | "register">("switch");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [department, setDepartment] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const theme = THEME_PRESETS[websiteSettings.colorScheme] || THEME_PRESETS.emerald;
  const LogoIcon = getLogoIcon(websiteSettings.logoIcon);
  const currentUser = StorageService.getActiveUser();
  const registeredUsers = StorageService.getAllRegisteredUsers();

  const handleSelectPreset = (roleTarget: UserRole) => {
    const user = PRESET_USERS[roleTarget];
    StorageService.login(user);
    onUserChanged(user);
    onClose();
  };

  const handleSelectUser = (user: User) => {
    StorageService.login(user);
    onUserChanged(user);
    onClose();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!email) {
      setErrorMessage("Please enter an email address.");
      return;
    }

    const found = registeredUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (found) {
      StorageService.login(found);
      onUserChanged(found);
      onClose();
    } else {
      // Auto-register or prompt
      const newUser = StorageService.registerUser(
        email.split("@")[0].replace(".", " "),
        email,
        "student",
        "Self-Enrolled Web Learner"
      );
      StorageService.login(newUser);
      onUserChanged(newUser);
      onClose();
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!name || !email) {
      setErrorMessage("Please fill in both name and email.");
      return;
    }

    if (
      websiteSettings.registrationDomainFilter &&
      !email.endsWith(websiteSettings.registrationDomainFilter)
    ) {
      setErrorMessage(
        `Registration restricted to domains matching ${websiteSettings.registrationDomainFilter}`
      );
      return;
    }

    const newUser = StorageService.registerUser(name, email, role, department);
    StorageService.login(newUser);
    onUserChanged(newUser);
    onClose();
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        id="auth-modal-card"
        className="w-full max-w-md rounded-2xl bg-[#16191f] border border-white/10 shadow-2xl p-6 relative overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Portal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg text-black font-bold">
            {websiteSettings.logoType === "image" && websiteSettings.logoImageUrl ? (
              <img
                src={websiteSettings.logoImageUrl}
                alt="Logo"
                className="w-8 h-8 rounded object-contain"
                referrerPolicy="no-referrer"
              />
            ) : websiteSettings.logoType === "text" ? (
              <span className="text-sm font-black">{websiteSettings.logoTextBadge || "NX"}</span>
            ) : (
              <LogoIcon className="w-5 h-5 text-black" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {websiteSettings.siteName}
            </h2>
            <p className="text-xs text-slate-400">
              Web Portal Login • No app download required
            </p>
          </div>
        </div>

        {/* Device compatibility badge */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs text-slate-400 mb-5">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Accessible on any device:</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <span className="flex items-center gap-1"><Smartphone className="w-3 h-3 text-slate-400" /> Phone</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Laptop className="w-3 h-3 text-slate-400" /> PC/Mac</span>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#0f1115] border border-white/10 mb-6 text-xs">
          <button
            onClick={() => setMode("switch")}
            className={`py-1.5 rounded-lg font-semibold transition ${
              mode === "switch"
                ? "bg-white/10 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Role Switch
          </button>
          <button
            onClick={() => setMode("login")}
            className={`py-1.5 rounded-lg font-semibold transition ${
              mode === "login"
                ? "bg-white/10 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Web Sign In
          </button>
          <button
            onClick={() => setMode("register")}
            className={`py-1.5 rounded-lg font-semibold transition ${
              mode === "register"
                ? "bg-white/10 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Sign Up
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {errorMessage}
          </div>
        )}

        {/* 1. Quick Switch / Preset Accounts */}
        {mode === "switch" && (
          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Demo & Preset Accounts
            </div>

            <div className="space-y-2">
              {/* Student */}
              <button
                onClick={() => handleSelectPreset("student")}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition text-left ${
                  currentUser.role === "student"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                    : "bg-[#0f1115] border-white/5 hover:border-white/15 text-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold flex items-center gap-2">
                      Alex Rivera (Student)
                      {currentUser.role === "student" && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      alex.rivera@student.openlms.org • 450 pts
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>

              {/* Teacher */}
              <button
                onClick={() => handleSelectPreset("teacher")}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition text-left ${
                  currentUser.role === "teacher"
                    ? "bg-blue-500/10 border-blue-500/30 text-white"
                    : "bg-[#0f1115] border-white/5 hover:border-white/15 text-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold flex items-center gap-2">
                      Prof. Marcus Vance (Teacher)
                      {currentUser.role === "teacher" && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      m.vance@faculty.openlms.org • Gradebook Access
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>

              {/* Admin */}
              <button
                onClick={() => handleSelectPreset("admin")}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition text-left ${
                  currentUser.role === "admin"
                    ? "bg-amber-500/10 border-amber-500/30 text-white"
                    : "bg-[#0f1115] border-white/5 hover:border-white/15 text-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold flex items-center gap-2">
                      Sarah Chen (Super Admin)
                      {currentUser.role === "admin" && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      admin@sovereign-lms.internal • Full LMS & Server Control
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Custom registered users */}
            {registeredUsers.length > 3 && (
              <div className="pt-3 border-t border-white/5">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Other Registered Web Users ({registeredUsers.length - 3})
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {registeredUsers.slice(3).map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition ${
                        currentUser.id === u.id
                          ? "bg-white/10 text-white font-medium"
                          : "text-slate-300 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="capitalize text-slate-400">[{u.role}]</span>
                        <span>{u.name}</span>
                      </div>
                      <span className="text-slate-500 font-mono text-[11px]">{u.email}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Web Sign In Form */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@school.edu"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-[#0f1115] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Password (or Single Sign-On PIN)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-[#0f1115] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Passwordless / Instant web authentication enabled for self-hosted instances.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition shadow-md"
            >
              <UserCheck className="w-4 h-4" />
              <span>Sign In to Web Portal</span>
            </button>
          </form>
        )}

        {/* 3. Register New Account */}
        {mode === "register" && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jordan Lee"
                required
                className="w-full px-3 py-2 bg-[#0f1115] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jordan.lee@university.edu"
                required
                className="w-full px-3 py-2 bg-[#0f1115] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              {websiteSettings.registrationDomainFilter && (
                <p className="text-[10px] text-emerald-400 mt-1">
                  Must end with: {websiteSettings.registrationDomainFilter}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-[#0f1115] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="student">Student (Learner)</option>
                  <option value="teacher">Teacher (Instructor)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Computer Science"
                  className="w-full px-3 py-2 bg-[#0f1115] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition shadow-md mt-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Web Account & Start</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
