import React, { useState } from "react";
import { User, UserRole, WebsiteSettings, DatabaseConfig } from "../types";
import { StorageService, PRESET_USERS } from "../utils/storage";
import { THEME_PRESETS, getLogoIcon } from "../utils/theme";
import {
  getEffectiveSupabaseConfig,
  supabaseSignIn,
  supabaseSignUp,
  supabaseResetPassword,
} from "../utils/supabase";
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
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
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

  const dbConfig: DatabaseConfig = StorageService.getDatabaseConfig();
  const supabaseConfig = getEffectiveSupabaseConfig();
  const isSupabaseActive = supabaseConfig.isConfigured && dbConfig.enforceSupabaseAuth !== false;
  const hidePresets = dbConfig.disablePresetLogins;

  const [mode, setMode] = useState<"switch" | "login" | "register" | "forgot_password">(
    hidePresets ? "login" : "switch"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [department, setDepartment] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successNotice, setSuccessNotice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const LogoIcon = getLogoIcon(websiteSettings.logoIcon);
  const currentUser = StorageService.getActiveUser();
  const registeredUsers = StorageService.getAllRegisteredUsers();

  const handleSelectPreset = (roleTarget: UserRole) => {
    if (hidePresets) {
      setErrorMessage("Preset switching is disabled in production. Please sign in with your Supabase credentials.");
      return;
    }
    const user = PRESET_USERS[roleTarget];
    StorageService.login(user);
    onUserChanged(user);
    onClose();
  };

  const handleSelectUser = (user: User) => {
    if (hidePresets) {
      setErrorMessage("Please enter your account email and password.");
      return;
    }
    StorageService.login(user);
    onUserChanged(user);
    onClose();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessNotice("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Please enter an email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);
    try {
      if (isSupabaseActive) {
        const result = await supabaseSignIn(trimmedEmail, password);
        if (!result.success || !result.user) {
          setErrorMessage(
            result.error || "Authentication failed. Invalid email or password."
          );
          setIsLoading(false);
          return;
        }
        onUserChanged(result.user);
        onClose();
      } else {
        const found = registeredUsers.find(
          (u) => u.email.toLowerCase() === trimmedEmail.toLowerCase()
        );

        if (found) {
          StorageService.login(found);
          onUserChanged(found);
          onClose();
        } else {
          const newUser = StorageService.registerUser(
            trimmedEmail.split("@")[0].replace(/[._]/g, " "),
            trimmedEmail,
            role,
            "Self-Enrolled Web Learner"
          );
          StorageService.login(newUser);
          onUserChanged(newUser);
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessNotice("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail) {
      setErrorMessage("Please fill in both name and email.");
      return;
    }

    if (!password) {
      setErrorMessage("Please create a password.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (
      websiteSettings.registrationDomainFilter &&
      !trimmedEmail.endsWith(websiteSettings.registrationDomainFilter)
    ) {
      setErrorMessage(
        `Registration restricted to domains matching ${websiteSettings.registrationDomainFilter}`
      );
      return;
    }

    setIsLoading(true);
    try {
      if (isSupabaseActive) {
        const res = await supabaseSignUp(trimmedEmail, password, trimmedName, role, department);
        if (!res.success) {
          setErrorMessage(res.error || "Failed to register account in Supabase.");
          setIsLoading(false);
          return;
        }

        if (res.needsEmailVerification) {
          setSuccessNotice(
            `Account created! A confirmation email was sent to ${trimmedEmail}. Please verify before logging in.`
          );
          setMode("login");
          setIsLoading(false);
          return;
        }

        if (res.user) {
          onUserChanged(res.user);
          onClose();
        }
      } else {
        const newUser = StorageService.registerUser(trimmedName, trimmedEmail, role, department);
        StorageService.login(newUser);
        onUserChanged(newUser);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessNotice("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Please enter your account email address.");
      return;
    }

    setIsLoading(true);
    try {
      if (isSupabaseActive) {
        const res = await supabaseResetPassword(trimmedEmail);
        if (res.success) {
          setSuccessNotice(`Password reset link dispatched to ${trimmedEmail}.`);
          setMode("login");
        } else {
          setErrorMessage(res.error || "Failed to send reset link.");
        }
      } else {
        setSuccessNotice(`Demo reset simulated for ${trimmedEmail}.`);
        setMode("login");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Error sending reset email.");
    } finally {
      setIsLoading(false);
    }
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
              {isSupabaseActive ? "Supabase Identity Authentication" : "Portal Account Management"}
            </p>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#0f1115] border border-white/10 mb-6 text-xs">
          {!hidePresets && (
            <button
              onClick={() => {
                setMode("switch");
                setErrorMessage("");
                setSuccessNotice("");
              }}
              className={`py-1.5 rounded-lg font-semibold transition ${
                mode === "switch"
                  ? "bg-white/10 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Profiles
            </button>
          )}
          <button
            onClick={() => {
              setMode("login");
              setErrorMessage("");
              setSuccessNotice("");
            }}
            className={`py-1.5 rounded-lg font-semibold transition ${
              mode === "login" || mode === "forgot_password"
                ? "bg-white/10 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode("register");
              setErrorMessage("");
              setSuccessNotice("");
            }}
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
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successNotice && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* 1. Quick Switch / Preset Accounts */}
        {mode === "switch" && !hidePresets && (
          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Demo Access Roles
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
                      alex.rivera@student.openlms.org
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
                      m.vance@faculty.openlms.org
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
                    ? "bg-purple-500/10 border-purple-500/30 text-white"
                    : "bg-[#0f1115] border-white/5 hover:border-white/15 text-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold flex items-center gap-2">
                      Sarah Chen (Admin)
                      {currentUser.role === "admin" && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-bold">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      admin@openlms.org
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
        )}

        {/* 2. Login Form */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@institution.edu"
                  className="w-full pl-9 pr-3 py-2 bg-[#0f1115] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-400">
                  Password
                </label>
                {isSupabaseActive && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot_password");
                      setErrorMessage("");
                      setSuccessNotice("");
                    }}
                    className="text-[11px] text-slate-400 hover:text-emerald-400 transition"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2 bg-[#0f1115] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying Credentials...</span>
                </span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* 3. Register Form */}
        {mode === "register" && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Jane Doe"
                className="w-full px-3 py-2 bg-[#0f1115] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className="w-full pl-9 pr-3 py-2 bg-[#0f1115] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Create Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-9 pr-10 py-2 bg-[#0f1115] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Role / Access Level
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 bg-[#0f1115] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="student">Student (Course Catalog &amp; Player)</option>
                <option value="teacher">Teacher (Gradebook &amp; SCORM Studio)</option>
                <option value="admin">Administrator (Settings &amp; Database)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Department / Program (Optional)
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. School of Computing"
                className="w-full px-3 py-2 bg-[#0f1115] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Registering in Supabase...</span>
                </span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Register &amp; Enter Portal</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* 4. Forgot Password Form */}
        {mode === "forgot_password" && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter your registered Supabase email address and we will dispatch a password recovery link.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@institution.edu"
                  className="w-full pl-9 pr-3 py-2 bg-[#0f1115] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50"
            >
              {isLoading ? <span>Dispatching Email...</span> : <span>Send Password Reset Link</span>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
