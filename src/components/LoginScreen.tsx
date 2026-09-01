import React, { useState, useEffect } from "react";
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
  KeyRound,
  Layers,
  Award,
  Users,
  Radio,
  ChevronRight,
  Eye,
  EyeOff,
  AlertCircle,
  Database,
  RefreshCw,
  HelpCircle,
} from "lucide-react";

interface LoginScreenProps {
  websiteSettings: WebsiteSettings;
  onLoginSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  websiteSettings,
  onLoginSuccess,
}) => {
  const dbConfig: DatabaseConfig = StorageService.getDatabaseConfig();
  const supabaseConfig = getEffectiveSupabaseConfig();
  const isSupabaseActive = supabaseConfig.isConfigured && dbConfig.enforceSupabaseAuth !== false;
  const hidePresets = dbConfig.disablePresetLogins || (isSupabaseActive && dbConfig.disablePresetLogins);

  const [authMode, setAuthMode] = useState<"preset" | "credentials" | "register" | "forgot_password">(
    hidePresets ? "credentials" : "preset"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [department, setDepartment] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successNotice, setSuccessNotice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const LogoIcon = getLogoIcon(websiteSettings.logoIcon);
  const registeredUsers = StorageService.getAllRegisteredUsers();

  // 1-Click Role Quick Login (Only allowed when preset logins are not disabled)
  const handleRoleQuickLogin = (role: UserRole) => {
    if (hidePresets) {
      setErrorMessage("Preset quick-logins have been disabled in production. Please sign in with your Supabase credentials.");
      return;
    }
    setIsLoading(true);
    setErrorMessage("");
    setSuccessNotice("");
    const user = PRESET_USERS[role];
    setTimeout(() => {
      StorageService.login(user);
      onLoginSuccess(user);
      setIsLoading(false);
    }, 200);
  };

  const handleUserClick = (user: User) => {
    if (hidePresets) {
      setErrorMessage("Please enter your account email and password to authenticate.");
      return;
    }
    setIsLoading(true);
    setErrorMessage("");
    setSuccessNotice("");
    setTimeout(() => {
      StorageService.login(user);
      onLoginSuccess(user);
      setIsLoading(false);
    }, 200);
  };

  // Sign In Handler
  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessNotice("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      if (isSupabaseActive) {
        // Authenticate directly against Supabase Auth API
        const result = await supabaseSignIn(trimmedEmail, password);

        if (!result.success || !result.user) {
          setErrorMessage(
            result.error || "Authentication failed. Please verify your email and password in Supabase."
          );
          setIsLoading(false);
          return;
        }

        onLoginSuccess(result.user);
      } else {
        // Local sovereign fallback
        const found = registeredUsers.find(
          (u) => u.email.toLowerCase() === trimmedEmail.toLowerCase()
        );

        if (found) {
          StorageService.login(found);
          onLoginSuccess(found);
        } else {
          // Auto-register as active role
          const cleanName = trimmedEmail.split("@")[0].replace(/[._]/g, " ");
          const capitalizedName = cleanName
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");

          const newUser = StorageService.registerUser(
            capitalizedName || "New Learner",
            trimmedEmail,
            selectedRole,
            department || (selectedRole === "student" ? "General Studies" : "Faculty Department")
          );
          StorageService.login(newUser);
          onLoginSuccess(newUser);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up / Register Handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessNotice("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail) {
      setErrorMessage("Please enter both your full name and email.");
      return;
    }

    if (!password) {
      setErrorMessage("Please create a password for your account.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (
      websiteSettings.registrationDomainFilter &&
      !trimmedEmail.endsWith(websiteSettings.registrationDomainFilter)
    ) {
      setErrorMessage(
        `Registration is restricted to domains matching ${websiteSettings.registrationDomainFilter}`
      );
      return;
    }

    setIsLoading(true);

    try {
      if (isSupabaseActive) {
        const result = await supabaseSignUp(
          trimmedEmail,
          password,
          trimmedName,
          selectedRole,
          department.trim()
        );

        if (!result.success) {
          setErrorMessage(result.error || "Failed to create Supabase account.");
          setIsLoading(false);
          return;
        }

        if (result.needsEmailVerification) {
          setSuccessNotice(
            `Account created in Supabase! We sent a confirmation link to ${trimmedEmail}. Please verify your email, then return here to sign in.`
          );
          setAuthMode("credentials");
          setIsLoading(false);
          return;
        }

        if (result.user) {
          onLoginSuccess(result.user);
        }
      } else {
        const newUser = StorageService.registerUser(
          trimmedName,
          trimmedEmail,
          selectedRole,
          department.trim() || (selectedRole === "student" ? "General Studies" : "Faculty Department")
        );
        StorageService.login(newUser);
        onLoginSuccess(newUser);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  // Password Reset Handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessNotice("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Please enter the email address for your Supabase account.");
      return;
    }

    setIsLoading(true);
    try {
      if (isSupabaseActive) {
        const res = await supabaseResetPassword(trimmedEmail);
        if (res.success) {
          setSuccessNotice(
            `Password reset link has been dispatched to ${trimmedEmail}. Check your inbox to set a new password.`
          );
          setAuthMode("credentials");
        } else {
          setErrorMessage(res.error || "Failed to dispatch password reset email.");
        }
      } else {
        setSuccessNotice(
          `Local demo mode: Password reset simulated for ${trimmedEmail}. You can sign in directly.`
        );
        setAuthMode("credentials");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to send password reset email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090b0e] text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Top Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 blur-[130px] rounded-full" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-blue-500/5 blur-[140px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-teal-500/5 blur-[140px] rounded-full" />
      </div>

      {/* Header Branding */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/30 text-black font-bold">
            {websiteSettings.logoType === "image" && websiteSettings.logoImageUrl ? (
              <img
                src={websiteSettings.logoImageUrl}
                alt="Logo"
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
              <span className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                {websiteSettings.siteName || "Nexus Academy"}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Portal Auth
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {websiteSettings.organizationName || "Self-Hosted Enterprise LMS"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          {isSupabaseActive ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Supabase Auth Protected</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-slate-300">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Google Sites & M365 Ready</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Online</span>
          </div>
        </div>
      </header>

      {/* Main Login Interface Card / Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Context & Overview */}
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isSupabaseActive ? "Supabase Cloud Authentication" : "Unified Single Sign-On"}</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Welcome to the Learning Portal
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                {isSupabaseActive
                  ? "Sign in with your verified Supabase user credentials to access your course catalog, faculty gradebooks, or administrator controls."
                  : "Sign in with your access level to immediately enter your personalized dashboard, courses, and tools."}
              </p>
            </div>

            {/* Quick Access Matrix Features */}
            <div className="space-y-3 pt-2 text-left hidden sm:block">
              <div className="p-3 rounded-xl bg-[#13171f] border border-white/5 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Student Dashboard</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Launch SCORM modules, HTML5 coding labs, AI study buddy, and earn certificates.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#13171f] border border-white/5 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Teacher & Faculty Dashboard</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Manage student gradebooks, build SCORM/HTML5 courses, and broadcast live alerts.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#13171f] border border-white/5 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Admin Control Center</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Google Sites & M365 embedding, branding, Supabase database sync, and AI model setup.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Login Box */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-[#141820] border border-white/10 shadow-2xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
              {/* Top Selector Tabs */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {authMode === "forgot_password"
                      ? "Reset Password"
                      : authMode === "register"
                      ? "Create Account"
                      : "Sign In to Continue"}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isSupabaseActive
                      ? "Secured by Supabase Identity & Access Management"
                      : "Select a fast-launch profile or enter credentials"}
                  </p>
                </div>

                {!hidePresets && (
                  <div className="flex items-center p-1 rounded-xl bg-[#0b0d11] border border-white/10 text-xs">
                    <button
                      id="tab-fast-login"
                      onClick={() => {
                        setAuthMode("preset");
                        setErrorMessage("");
                        setSuccessNotice("");
                      }}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                        authMode === "preset"
                          ? "bg-white/10 text-white shadow-xs"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      1-Click Roles
                    </button>
                    <button
                      id="tab-custom-login"
                      onClick={() => {
                        setAuthMode("credentials");
                        setErrorMessage("");
                        setSuccessNotice("");
                      }}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                        authMode !== "preset"
                          ? "bg-white/10 text-white shadow-xs"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Email Login
                    </button>
                  </div>
                )}
              </div>

              {/* Status & Error Messages */}
              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold">Authentication Error:</span>
                    <p className="text-slate-300 leading-relaxed">{errorMessage}</p>
                  </div>
                </div>
              )}

              {successNotice && (
                <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold">Success:</span>
                    <p className="text-slate-300 leading-relaxed">{successNotice}</p>
                  </div>
                </div>
              )}

              {/* VIEW 1: PRESET FAST-LAUNCH PROFILES */}
              {authMode === "preset" && !hidePresets && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Choose Your Access Level to Open Dashboard:
                  </div>

                  {/* 1. Student Access Card */}
                  <div
                    className="group p-4 rounded-2xl bg-[#0e1117] border border-emerald-500/30 hover:border-emerald-400 hover:bg-[#12161f] transition cursor-pointer shadow-lg relative overflow-hidden"
                    onClick={() => handleRoleQuickLogin("student")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={PRESET_USERS.student.avatar}
                          alt="Alex Rivera"
                          className="w-12 h-12 rounded-xl object-cover border border-emerald-500/40 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">
                              {PRESET_USERS.student.name}
                            </h3>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Student Access
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {PRESET_USERS.student.department}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                            <span>Ready to Begin</span>
                            <span>•</span>
                            <span>Course Progress Tracking</span>
                          </div>
                        </div>
                      </div>

                      <button
                        id="login-as-student-btn"
                        disabled={isLoading}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 transition shrink-0 group-hover:translate-x-1"
                      >
                        <span>Student Portal</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 2. Teacher Access Card */}
                  <div
                    className="group p-4 rounded-2xl bg-[#0e1117] border border-blue-500/30 hover:border-blue-400 hover:bg-[#12161f] transition cursor-pointer shadow-lg relative overflow-hidden"
                    onClick={() => handleRoleQuickLogin("teacher")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={PRESET_USERS.teacher.avatar}
                          alt="Prof. Marcus Vance"
                          className="w-12 h-12 rounded-xl object-cover border border-blue-500/40 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition">
                              {PRESET_USERS.teacher.name}
                            </h3>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                              Faculty Access
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {PRESET_USERS.teacher.department}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                            <span>Gradebook &amp; SCORM Studio</span>
                          </div>
                        </div>
                      </div>

                      <button
                        id="login-as-teacher-btn"
                        disabled={isLoading}
                        className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-black font-bold text-xs flex items-center gap-1.5 transition shrink-0 group-hover:translate-x-1"
                      >
                        <span>Faculty Portal</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 3. Administrator Access Card */}
                  <div
                    className="group p-4 rounded-2xl bg-[#0e1117] border border-purple-500/30 hover:border-purple-400 hover:bg-[#12161f] transition cursor-pointer shadow-lg relative overflow-hidden"
                    onClick={() => handleRoleQuickLogin("admin")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={PRESET_USERS.admin.avatar}
                          alt="Sarah Chen"
                          className="w-12 h-12 rounded-xl object-cover border border-purple-500/40 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition">
                              {PRESET_USERS.admin.name}
                            </h3>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                              Admin Access
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {PRESET_USERS.admin.department}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                            <span>Google Sites &amp; Database Settings</span>
                          </div>
                        </div>
                      </div>

                      <button
                        id="login-as-admin-btn"
                        disabled={isLoading}
                        className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs flex items-center gap-1.5 transition shrink-0 group-hover:translate-x-1"
                      >
                        <span>Admin Portal</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 2: CUSTOM CREDENTIALS LOGIN / REGISTER / FORGOT PASSWORD */}
              {(authMode === "credentials" || authMode === "register" || authMode === "forgot_password") && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-semibold text-slate-300">
                      {authMode === "register"
                        ? "Create New Account"
                        : authMode === "forgot_password"
                        ? "Recover Account Access"
                        : "Sign In with Email & Password"}
                    </span>
                    <div className="flex items-center gap-3 text-xs">
                      {authMode !== "register" && (
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode("register");
                            setErrorMessage("");
                            setSuccessNotice("");
                          }}
                          className="text-emerald-400 hover:underline font-medium"
                        >
                          Need an account? Register
                        </button>
                      )}
                      {authMode !== "credentials" && (
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode("credentials");
                            setErrorMessage("");
                            setSuccessNotice("");
                          }}
                          className="text-emerald-400 hover:underline font-medium"
                        >
                          Sign In Instead
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Forgot Password View */}
                  {authMode === "forgot_password" ? (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Enter your registered Supabase email address below. We will send you a secure link to reset your password.
                      </p>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1 font-medium">
                          Account Email Address
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@institution.edu"
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0b0d11] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg disabled:opacity-50"
                      >
                        {isLoading ? (
                          <span>Sending Reset Email...</span>
                        ) : (
                          <>
                            <span>Send Password Reset Link</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    /* Standard Login & Registration Form */
                    <form
                      onSubmit={authMode === "register" ? handleRegister : handleCredentialLogin}
                      className="space-y-3.5"
                    >
                      {authMode === "register" && (
                        <div>
                          <label className="block text-xs text-slate-400 mb-1 font-medium">
                            Full Name
                          </label>
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Jordan Miller"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0d11] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-xs text-slate-400 mb-1 font-medium">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@institution.edu or student@domain.com"
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0b0d11] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs text-slate-400 font-medium">
                            Password
                          </label>
                          {authMode === "credentials" && isSupabaseActive && (
                            <button
                              type="button"
                              onClick={() => {
                                setAuthMode("forgot_password");
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
                          <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0b0d11] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-2.5 text-slate-400 hover:text-white"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Role Selector (For registration or default entry portal) */}
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                          {authMode === "register" ? "Account Role (Permissions Level)" : "Primary Target Portal"}
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: "student", label: "Student", desc: "Courses & Labs", color: "text-emerald-400" },
                            { id: "teacher", label: "Teacher", desc: "Gradebook", color: "text-blue-400" },
                            { id: "admin", label: "Admin", desc: "System Config", color: "text-purple-400" },
                          ].map((r) => (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => setSelectedRole(r.id as UserRole)}
                              className={`p-2.5 rounded-xl border text-left transition ${
                                selectedRole === r.id
                                  ? "bg-white/10 border-emerald-500 ring-1 ring-emerald-500 text-white"
                                  : "bg-[#0b0d11] border-white/5 text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              <span className={`text-xs font-bold block ${r.color}`}>{r.label}</span>
                              <span className="text-[10px] text-slate-500 block truncate">{r.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {authMode === "register" && (
                        <div>
                          <label className="block text-xs text-slate-400 mb-1 font-medium">
                            Department / Institution (Optional)
                          </label>
                          <input
                            type="text"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            placeholder="e.g. Computer Science, Grade 11, Medical Faculty"
                            className="w-full px-3.5 py-2 rounded-xl bg-[#0b0d11] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg mt-4 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Authenticating with {isSupabaseActive ? "Supabase" : "Portal"}...</span>
                          </span>
                        ) : (
                          <>
                            <span>
                              {authMode === "register"
                                ? "Register Account & Open Dashboard"
                                : "Sign In & Enter Dashboard"}
                            </span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Bottom Support / Domain Note */}
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isSupabaseActive ? "Supabase RLS & JWT Auth Active" : "Sovereign Storage Secured"}</span>
                </span>
                <span>{websiteSettings.supportEmail || "support@nexus-academy.internal"}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/5 text-xs text-slate-400">
        <div>
          <span>{websiteSettings.customFooterText || "© 2026 Nexus Sovereign Education Systems • 100% Self-Hosted & Data-Sovereign"}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><Smartphone className="w-3.5 h-3.5 text-slate-400" /> Mobile</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Laptop className="w-3.5 h-3.5 text-slate-400" /> Desktop</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-slate-400" /> Google Sites / M365</span>
        </div>
      </footer>
    </div>
  );
};
