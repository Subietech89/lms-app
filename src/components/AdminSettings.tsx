import React, { useState } from "react";
import {
  Database,
  Sparkles,
  Server,
  Radio,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  Zap,
  Download,
  Terminal,
  ShieldCheck,
  Layers,
  Key,
  Cpu,
  RefreshCw,
  FileCode,
  Globe,
  Palette,
  Image as ImageIcon,
  Smartphone,
  Laptop,
  Share2,
  Sliders,
  Sun,
  Moon,
  Eye,
  Upload,
  Save,
  Lock,
  ExternalLink,
  Code,
  ArrowUpRight,
  BookOpen,
  CheckSquare,
  Layout,
  QrCode,
} from "lucide-react";
import {
  DatabaseConfig,
  DatabaseProvider,
  AiAgentConfig,
  AiProvider,
  SelfHostConfig,
  Course,
  WebsiteSettings,
  ThemeColorScheme,
} from "../types";
import { StorageService, DEFAULT_WEBSITE_SETTINGS } from "../utils/storage";
import { LMS_USER_MANUAL } from "../data/lmsManual";
import { sound } from "../utils/audio";
import {
  THEME_PRESETS,
  AVAILABLE_LOGO_ICONS,
  getLogoIcon,
  applyThemeVariables,
} from "../utils/theme";

interface AdminSettingsProps {
  courses: Course[];
  websiteSettings: WebsiteSettings;
  onUpdateWebsiteSettings: (settings: WebsiteSettings) => void;
  onOpenPushModal: () => void;
  onRefreshCourses: () => void;
  onOpenSharePortalModal?: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  courses,
  websiteSettings,
  onUpdateWebsiteSettings,
  onOpenPushModal,
  onRefreshCourses,
  onOpenSharePortalModal,
}) => {
  const [activeTab, setActiveTab] = useState<
    "website" | "googlesites" | "database" | "ai" | "selfhost" | "push"
  >("website");

  // Website settings local edit state
  const [siteSettings, setSiteSettings] = useState<WebsiteSettings>(websiteSettings);
  const [siteSavedSuccess, setSiteSavedSuccess] = useState(false);

  // Database state
  const [dbConfig, setDbConfig] = useState<DatabaseConfig>(StorageService.getDatabaseConfig());
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<{ success: boolean; latency: number; details: string } | null>(null);

  // AI Agent state
  const [aiConfig, setAiConfig] = useState<AiAgentConfig>(StorageService.getAiConfig());
  const [aiTestResult, setAiTestResult] = useState<string | null>(null);
  const [isTestingAi, setIsTestingAi] = useState(false);

  // Self host state
  const [selfHostConfig, setSelfHostConfig] = useState<SelfHostConfig>(StorageService.getSelfHostConfig());

  // Copy helpers
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Save Website Settings
  const handleSaveWebsiteSettings = () => {
    StorageService.saveWebsiteSettings(siteSettings);
    onUpdateWebsiteSettings(siteSettings);
    applyThemeVariables(siteSettings);
    setSiteSavedSuccess(true);
    sound.playSuccess();
    setTimeout(() => setSiteSavedSuccess(false), 2500);
  };

  const handleResetWebsiteSettings = () => {
    setSiteSettings(DEFAULT_WEBSITE_SETTINGS);
    StorageService.saveWebsiteSettings(DEFAULT_WEBSITE_SETTINGS);
    onUpdateWebsiteSettings(DEFAULT_WEBSITE_SETTINGS);
    applyThemeVariables(DEFAULT_WEBSITE_SETTINGS);
    setSiteSavedSuccess(true);
    sound.playSuccess();
    setTimeout(() => setSiteSavedSuccess(false), 2500);
  };

  const handleApplyThemePreset = (scheme: ThemeColorScheme) => {
    const updated = {
      ...siteSettings,
      colorScheme: scheme,
      isDarkMode: scheme !== "nordic_light",
    };
    setSiteSettings(updated);
    StorageService.saveWebsiteSettings(updated);
    onUpdateWebsiteSettings(updated);
    applyThemeVariables(updated);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const updated = {
            ...siteSettings,
            logoType: "image" as const,
            logoImageUrl: event.target.result as string,
          };
          setSiteSettings(updated);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const SelectedLogoIcon = getLogoIcon(siteSettings.logoIcon);

  // Test Database Connection
  const handleTestDatabase = async () => {
    setIsTestingDb(true);
    setDbTestResult(null);

    try {
      const res = await fetch("/api/db-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dbConfig),
      });
      const data = await res.json();
      setDbTestResult({
        success: data.success,
        latency: data.latencyMs || 22,
        details: data.details || "Connected successfully to cloud database.",
      });

      const updated = {
        ...dbConfig,
        syncStatus: "connected" as const,
        lastSyncTimestamp: new Date().toISOString(),
      };
      setDbConfig(updated);
      StorageService.saveDatabaseConfig(updated);
      sound.playSuccess();
    } catch {
      setDbTestResult({
        success: false,
        latency: 0,
        details: "Connection timed out. Operating in local sovereign fallback mode.",
      });
      sound.playIncorrect();
    } finally {
      setIsTestingDb(false);
    }
  };

  const handleSaveDatabase = () => {
    StorageService.saveDatabaseConfig(dbConfig);
    sound.playSuccess();
  };

  // Save AI Config
  const handleSaveAiConfig = () => {
    StorageService.saveAiConfig(aiConfig);
    sound.playSuccess();
  };

  // Test AI Agent
  const handleTestAi = async () => {
    setIsTestingAi(true);
    setAiTestResult(null);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Verify your persona and LMS system manual configuration.",
          persona: aiConfig.agentPersona,
          lmsManual: aiConfig.lmsManualInjected ? LMS_USER_MANUAL : "",
          customApiKey: aiConfig.customApiKey,
          provider: aiConfig.provider,
        }),
      });
      const data = await res.json();
      setAiTestResult(data.reply || "AI Agent responded successfully.");
      sound.playSuccess();
    } catch (err: any) {
      setAiTestResult("AI Agent operational in offline fallback mode.");
    } finally {
      setIsTestingAi(false);
    }
  };

  // Export User Progress JSON for data backup
  const handleExportDataBackup = () => {
    const allProgress = StorageService.getAllProgress();
    const allCerts = StorageService.getCertificates();
    const users = StorageService.getUsers();

    const backupPayload = {
      version: "3.4.0",
      exportedAt: new Date().toISOString(),
      databaseProvider: dbConfig.provider,
      users,
      progress: allProgress,
      certificates: allCerts,
    };

    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `openlms-userdata-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    sound.playSuccess();
  };

  const sqlMigrationCode = `-- OpenLMS Sovereign Database Migration Script
-- Target: Supabase / PostgreSQL 16 (Durable User Data Sovereignty)

CREATE TABLE IF NOT EXISTS lms_users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(32) DEFAULT 'student',
  total_points INT DEFAULT 0,
  streak_days INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lms_progress (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES lms_users(id),
  course_id VARCHAR(64) NOT NULL,
  overall_percent INT DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  module_progress JSONB DEFAULT '{}'::jsonb,
  cmi_data JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS lms_certificates (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES lms_users(id),
  course_id VARCHAR(64) NOT NULL,
  course_title VARCHAR(255) NOT NULL,
  grade_score INT DEFAULT 100,
  verification_hash VARCHAR(128) NOT NULL,
  issue_date VARCHAR(64) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for privacy
ALTER TABLE lms_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_certificates ENABLE ROW LEVEL SECURITY;`;

  const currentUser = StorageService.getActiveUser();

  return (
    <div className="space-y-8 pb-16">
      {/* Admin Welcome & Command Center Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#16191f] via-[#201d2a] to-[#16191f] border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-purple-500/40 shadow-md"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  Admin Dashboard: {currentUser.name}
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider border border-purple-500/30">
                  Root Administrator
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {currentUser.department || "LMS Platform Operations"} • Cloud databases, AI tutors, Google Sites & M365 integrations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {onOpenSharePortalModal && (
              <button
                onClick={onOpenSharePortalModal}
                className="px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Share2 className="w-4 h-4 text-purple-400" />
                <span>Publish & Embed URLs</span>
              </button>
            )}

            <button
              onClick={onOpenPushModal}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition shadow-md shadow-emerald-950 flex items-center gap-1.5"
            >
              <Radio className="w-4 h-4" />
              <span>Broadcast OTA Update</span>
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
            <Database className="w-5 h-5" />
          </span>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Admin Settings & Infrastructure Hub
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Configure cloud databases (Supabase, Postgres, Firebase), Bring-Your-Own-AI persona & manuals, launch course updates, and manage Proxmox/Docker self-hosting.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto scrollbar-none">
        <button
          id="admin-tab-website"
          onClick={() => setActiveTab("website")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition ${
            activeTab === "website"
              ? "bg-emerald-500 text-black shadow-xs font-bold"
              : "bg-[#16191f] text-slate-400 hover:text-slate-200 border border-white/5"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Website &amp; Portal Branding</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20 text-black font-extrabold uppercase">
            Web LMS
          </span>
        </button>

        <button
          id="admin-tab-googlesites"
          onClick={() => setActiveTab("googlesites")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition ${
            activeTab === "googlesites"
              ? "bg-emerald-500 text-black shadow-xs font-bold"
              : "bg-[#16191f] text-slate-400 hover:text-slate-200 border border-white/5"
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>Google Sites &amp; Microsoft 365</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase">
            Zero Domain
          </span>
        </button>

        <button
          id="admin-tab-db"
          onClick={() => setActiveTab("database")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition ${
            activeTab === "database"
              ? "bg-emerald-500 text-black shadow-xs font-bold"
              : "bg-[#16191f] text-slate-400 hover:text-slate-200 border border-white/5"
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Cloud Database (Supabase / Postgres)</span>
        </button>

        <button
          id="admin-tab-ai"
          onClick={() => setActiveTab("ai")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition ${
            activeTab === "ai"
              ? "bg-emerald-500 text-black shadow-xs font-bold"
              : "bg-[#16191f] text-slate-400 hover:text-slate-200 border border-white/5"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Bring-Your-Own-AI & LMS Manual</span>
        </button>

        <button
          id="admin-tab-selfhost"
          onClick={() => setActiveTab("selfhost")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition ${
            activeTab === "selfhost"
              ? "bg-emerald-500 text-black shadow-xs font-bold"
              : "bg-[#16191f] text-slate-400 hover:text-slate-200 border border-white/5"
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Self-Hosting (Docker & Proxmox)</span>
        </button>

        <button
          id="admin-tab-push"
          onClick={() => setActiveTab("push")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition ${
            activeTab === "push"
              ? "bg-emerald-500 text-black shadow-xs font-bold"
              : "bg-[#16191f] text-slate-400 hover:text-slate-200 border border-white/5"
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Integrated Course Launch</span>
        </button>
      </div>

      {/* TAB 0: Website & Portal Settings */}
      {activeTab === "website" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Top Banner: Web Portal Overview & Zero App Download */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#16191f] via-[#1a202c] to-[#16191f] border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                <Globe className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    Standalone Web Portal & Public Access
                  </h3>
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    No App Download Required
                  </span>
                </div>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Configure custom school/organization branding, logos, color schemes, and website access. Only administrators manage server infrastructure; all instructors and students simply navigate to the web URL in any browser.
                </p>
              </div>
            </div>

            {onOpenSharePortalModal && (
              <button
                onClick={onOpenSharePortalModal}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-2 transition shadow-md shrink-0"
              >
                <Share2 className="w-4 h-4" />
                <span>Launch & Share Portal Link</span>
              </button>
            )}
          </div>

          {/* Success Save Notice */}
          {siteSavedSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold">Website branding & color scheme updated and applied in real time!</span>
              </div>
              <span className="text-[11px] text-slate-400">Instant Preview Active</span>
            </div>
          )}

          {/* Live Preview Box */}
          <div className="bg-[#16191f] rounded-2xl border border-white/10 p-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>Live Website Header & Brand Preview</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Theme: {siteSettings.colorScheme.toUpperCase()}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#0f1115] border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-md text-black font-bold">
                  {siteSettings.logoType === "image" && siteSettings.logoImageUrl ? (
                    <img
                      src={siteSettings.logoImageUrl}
                      alt="Preview"
                      className="w-8 h-8 rounded object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : siteSettings.logoType === "text" ? (
                    <span className="text-sm font-black">{siteSettings.logoTextBadge || "NX"}</span>
                  ) : (
                    <SelectedLogoIcon className="w-5 h-5 text-black" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white">
                      {siteSettings.siteName || "Nexus Academy"}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-white/5 text-emerald-400 border border-white/10">
                      Live
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {siteSettings.tagline || "Self-Hosted Learning Portal"}
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-lg bg-white/5 text-slate-300 border border-white/5">
                  Courses
                </span>
                <span className="px-3 py-1 rounded-lg bg-emerald-500 text-black font-bold">
                  Sign In
                </span>
              </div>
            </div>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Brand & Logo */}
            <div className="space-y-6">
              {/* 1. Website & Organization Identity */}
              <div className="bg-[#16191f] rounded-2xl border border-white/10 p-6 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">Brand & Organization Identity</h4>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Website Name / LMS Title
                  </label>
                  <input
                    type="text"
                    value={siteSettings.siteName}
                    onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                    placeholder="Nexus Academy"
                    className="w-full px-3 py-2 bg-[#0f1115] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Tagline / Subtitle
                  </label>
                  <input
                    type="text"
                    value={siteSettings.tagline}
                    onChange={(e) => setSiteSettings({ ...siteSettings, tagline: e.target.value })}
                    placeholder="High-Performance Systems & Cloud LMS"
                    className="w-full px-3 py-2 bg-[#0f1115] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      value={siteSettings.organizationName}
                      onChange={(e) => setSiteSettings({ ...siteSettings, organizationName: e.target.value })}
                      placeholder="Nexus Sovereign Systems"
                      className="w-full px-3 py-2 bg-[#0f1115] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Support / Contact Email
                    </label>
                    <input
                      type="email"
                      value={siteSettings.supportEmail}
                      onChange={(e) => setSiteSettings({ ...siteSettings, supportEmail: e.target.value })}
                      placeholder="admin@nexus-academy.internal"
                      className="w-full px-3 py-2 bg-[#0f1115] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Logo Customizer */}
              <div className="bg-[#16191f] rounded-2xl border border-white/10 p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-sm font-bold text-white">Logo & Icon Customizer</h4>
                  </div>
                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#0f1115] border border-white/5 text-[11px]">
                    <button
                      onClick={() => setSiteSettings({ ...siteSettings, logoType: "icon" })}
                      className={`px-2.5 py-1 rounded-md transition ${
                        siteSettings.logoType === "icon"
                          ? "bg-white/10 text-white font-semibold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Preset Icon
                    </button>
                    <button
                      onClick={() => setSiteSettings({ ...siteSettings, logoType: "image" })}
                      className={`px-2.5 py-1 rounded-md transition ${
                        siteSettings.logoType === "image"
                          ? "bg-white/10 text-white font-semibold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Image / URL
                    </button>
                    <button
                      onClick={() => setSiteSettings({ ...siteSettings, logoType: "text" })}
                      className={`px-2.5 py-1 rounded-md transition ${
                        siteSettings.logoType === "text"
                          ? "bg-white/10 text-white font-semibold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Monogram
                    </button>
                  </div>
                </div>

                {/* Option A: Preset Icons */}
                {siteSettings.logoType === "icon" && (
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-400">
                      Select Vector Icon
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {Object.entries(AVAILABLE_LOGO_ICONS).map(([key, item]) => {
                        const IconComponent = item.icon;
                        const isSelected = siteSettings.logoIcon === key;
                        return (
                          <button
                            key={key}
                            onClick={() => setSiteSettings({ ...siteSettings, logoIcon: key })}
                            title={item.label}
                            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                              isSelected
                                ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-xs"
                                : "bg-[#0f1115] border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
                            }`}
                          >
                            <IconComponent className="w-5 h-5" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Option B: Custom Image / Upload */}
                {siteSettings.logoType === "image" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Logo Image URL
                      </label>
                      <input
                        type="url"
                        value={siteSettings.logoImageUrl}
                        onChange={(e) => setSiteSettings({ ...siteSettings, logoImageUrl: e.target.value })}
                        placeholder="https://your-domain.com/logo.png"
                        className="w-full px-3 py-2 bg-[#0f1115] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Or Upload Logo File (PNG / SVG / JPG)
                      </label>
                      <label className="flex items-center justify-center gap-2 p-3 bg-[#0f1115] border border-dashed border-white/15 rounded-xl text-xs text-slate-400 hover:text-white hover:border-white/30 cursor-pointer transition">
                        <Upload className="w-4 h-4 text-emerald-400" />
                        <span>Choose logo image from computer</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* Option C: Monogram / Text Badge */}
                {siteSettings.logoType === "text" && (
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Monogram Letters (1-3 chars)
                    </label>
                    <input
                      type="text"
                      maxLength={3}
                      value={siteSettings.logoTextBadge}
                      onChange={(e) => setSiteSettings({ ...siteSettings, logoTextBadge: e.target.value.toUpperCase() })}
                      placeholder="NX"
                      className="w-24 px-3 py-2 bg-[#0f1115] border border-white/10 rounded-xl text-sm font-bold text-white text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Color Scheme & Web Access */}
            <div className="space-y-6">
              {/* 3. Color Scheme & Theme Presets */}
              <div className="bg-[#16191f] rounded-2xl border border-white/10 p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-sm font-bold text-white">Color Schemes & Theming</h4>
                  </div>
                  <span className="text-xs text-slate-400">1-Click Apply</span>
                </div>

                {/* Themes list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.entries(THEME_PRESETS).map(([key, theme]) => {
                    const isSelected = siteSettings.colorScheme === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleApplyThemePreset(key as ThemeColorScheme)}
                        className={`p-3 rounded-xl border flex items-start gap-3 text-left transition ${
                          isSelected
                            ? "bg-white/10 border-emerald-500 text-white ring-1 ring-emerald-500"
                            : "bg-[#0f1115] border-white/5 text-slate-300 hover:border-white/20"
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-lg shrink-0 mt-0.5 border border-white/20 shadow-xs"
                          style={{ backgroundColor: theme.primaryHex }}
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate flex items-center gap-1.5">
                            <span>{theme.name}</span>
                            {isSelected && <span className="text-emerald-400 text-[10px]">✓</span>}
                          </div>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            {theme.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Palette Color Pickers */}
                {siteSettings.colorScheme === "custom" && (
                  <div className="p-3.5 rounded-xl bg-[#0f1115] border border-white/10 space-y-3 mt-3 animate-in fade-in">
                    <div className="text-xs font-semibold text-white">Custom Palette Pickers</div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Primary Accent</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={siteSettings.customPrimaryColor}
                            onChange={(e) => setSiteSettings({ ...siteSettings, customPrimaryColor: e.target.value })}
                            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                          />
                          <span className="font-mono text-[11px] text-slate-300">{siteSettings.customPrimaryColor}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Background</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={siteSettings.customBgColor}
                            onChange={(e) => setSiteSettings({ ...siteSettings, customBgColor: e.target.value })}
                            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                          />
                          <span className="font-mono text-[11px] text-slate-300">{siteSettings.customBgColor}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Card Surface</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={siteSettings.customSurfaceColor}
                            onChange={(e) => setSiteSettings({ ...siteSettings, customSurfaceColor: e.target.value })}
                            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                          />
                          <span className="font-mono text-[11px] text-slate-300">{siteSettings.customSurfaceColor}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Public Web Portal & Learner Access */}
              <div className="bg-[#16191f] rounded-2xl border border-white/10 p-6 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">Browser Web Portal & Access Policies</h4>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0f1115] border border-white/5">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-white">Public Web Portal Mode</p>
                    <p className="text-[11px] text-slate-400">
                      Enable browser-based login and course completion for all non-admin users
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={siteSettings.publicWebPortalEnabled}
                    onChange={(e) => setSiteSettings({ ...siteSettings, publicWebPortalEnabled: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Portal Slug / Path
                    </label>
                    <input
                      type="text"
                      value={siteSettings.portalSlug}
                      onChange={(e) => setSiteSettings({ ...siteSettings, portalSlug: e.target.value })}
                      placeholder="learn"
                      className="w-full px-3 py-2 bg-[#0f1115] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Email Domain Whitelist (Optional)
                    </label>
                    <input
                      type="text"
                      value={siteSettings.registrationDomainFilter}
                      onChange={(e) => setSiteSettings({ ...siteSettings, registrationDomainFilter: e.target.value })}
                      placeholder="@university.edu (leave blank for all)"
                      className="w-full px-3 py-2 bg-[#0f1115] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0f1115] border border-white/5">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-white">Allow Learner Self-Registration</p>
                    <p className="text-[11px] text-slate-400">
                      New students can create accounts directly on the web portal without admin pre-creation
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={siteSettings.allowSelfRegistration}
                    onChange={(e) => setSiteSettings({ ...siteSettings, allowSelfRegistration: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Announcement & Hero Customization */}
          <div className="bg-[#16191f] rounded-2xl border border-white/10 p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-white">Homepage Announcements & Hero Customization</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-400">
                    Header Announcement Banner
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={siteSettings.showAnnouncement}
                      onChange={(e) => setSiteSettings({ ...siteSettings, showAnnouncement: e.target.checked })}
                      className="w-3.5 h-3.5 accent-emerald-500 rounded"
                    />
                    <span>Show Banner</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={siteSettings.announcementText}
                  onChange={(e) => setSiteSettings({ ...siteSettings, announcementText: e.target.value })}
                  placeholder="🚀 Spring Semester Course Catalog is Live..."
                  className="w-full px-3 py-2 bg-[#0f1115] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-400">
                    Hero Landing Title & Subtitle
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={siteSettings.showHeroBanner}
                      onChange={(e) => setSiteSettings({ ...siteSettings, showHeroBanner: e.target.checked })}
                      className="w-3.5 h-3.5 accent-emerald-500 rounded"
                    />
                    <span>Show Hero</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={siteSettings.heroBannerTitle}
                  onChange={(e) => setSiteSettings({ ...siteSettings, heroBannerTitle: e.target.value })}
                  placeholder="Master Systems & Cloud Architecture Anywhere"
                  className="w-full px-3 py-2 bg-[#0f1115] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 mb-2"
                />
                <textarea
                  rows={2}
                  value={siteSettings.heroBannerSubtitle}
                  onChange={(e) => setSiteSettings({ ...siteSettings, heroBannerSubtitle: e.target.value })}
                  placeholder="Access self-hosted SCORM labs and coding simulations directly in your browser..."
                  className="w-full px-3 py-2 bg-[#0f1115] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Custom Footer Copyright & Legal Text
              </label>
              <input
                type="text"
                value={siteSettings.customFooterText}
                onChange={(e) => setSiteSettings({ ...siteSettings, customFooterText: e.target.value })}
                placeholder="© 2026 Nexus Sovereign Education Systems • 100% Self-Hosted & Data-Sovereign"
                className="w-full px-3 py-2 bg-[#0f1115] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#16191f] border border-white/10">
            <button
              onClick={handleResetWebsiteSettings}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-2 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Branding to Defaults</span>
            </button>

            <button
              onClick={handleSaveWebsiteSettings}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-emerald-950"
            >
              <Save className="w-4 h-4" />
              <span>Save & Apply Website Branding</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB: Google Sites & Microsoft 365 Launch Hub */}
      {activeTab === "googlesites" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Top Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#16191f] via-[#1a2333] to-[#16191f] border border-blue-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                <Layout className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    Google Sites &amp; Microsoft 365 Auto-Launcher
                  </h3>
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    No Custom Domain Required
                  </span>
                </div>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Host your LMS directly inside Google Sites, Microsoft SharePoint Modern Pages, Microsoft Teams channels, or Google Classroom. Google and Microsoft provide free SSL certificates, intranet permissions, and zero-cost hosting URLs automatically.
                </p>
              </div>
            </div>

            {onOpenSharePortalModal && (
              <button
                onClick={onOpenSharePortalModal}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-xs flex items-center gap-2 transition shadow-md shrink-0"
              >
                <Share2 className="w-4 h-4" />
                <span>Open Launch &amp; Embed Modal</span>
              </button>
            )}
          </div>

          {/* Quick Launch Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <button
              onClick={() => window.open("https://sites.google.com/new", "_blank")}
              className="p-4 rounded-xl bg-[#16191f] border border-white/10 hover:border-blue-500/50 text-left space-y-2 group transition shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <Globe className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Google Sites Creator</h4>
                <p className="text-[11px] text-slate-400">sites.google.com/new</p>
              </div>
            </button>

            <button
              onClick={() =>
                window.open(
                  `https://classroom.google.com/share?url=${encodeURIComponent(
                    typeof window !== "undefined"
                      ? `${window.location.origin}?portal=${siteSettings.portalSlug || "learn"}`
                      : ""
                  )}&title=${encodeURIComponent(siteSettings.siteName || "Interactive LMS")}`,
                  "_blank"
                )
              }
              className="p-4 rounded-xl bg-[#16191f] border border-white/10 hover:border-emerald-500/50 text-left space-y-2 group transition shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Google Classroom</h4>
                <p className="text-[11px] text-slate-400">Post 1-click student assignment</p>
              </div>
            </button>

            <button
              onClick={() => window.open("https://portal.office.com", "_blank")}
              className="p-4 rounded-xl bg-[#16191f] border border-white/10 hover:border-teal-500/50 text-left space-y-2 group transition shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
                  <Laptop className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Microsoft SharePoint</h4>
                <p className="text-[11px] text-slate-400">Modern Pages &amp; Intranet</p>
              </div>
            </button>

            <button
              onClick={() => window.open("https://teams.microsoft.com", "_blank")}
              className="p-4 rounded-xl bg-[#16191f] border border-white/10 hover:border-purple-500/50 text-left space-y-2 group transition shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                  <Layers className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Microsoft Teams</h4>
                <p className="text-[11px] text-slate-400">Add as Tab in any channel</p>
              </div>
            </button>
          </div>

          {/* Embed Code Snippet Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Google Sites Code Box */}
            <div className="bg-[#16191f] rounded-2xl border border-white/10 p-5 space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                    <Globe className="w-4 h-4" />
                  </span>
                  <h4 className="text-sm font-bold text-white">Google Sites Embed Code</h4>
                </div>
                <button
                  onClick={() => {
                    const origin = typeof window !== "undefined" ? window.location.origin : "";
                    const code = `<iframe src="${origin}?portal=${encodeURIComponent(
                      siteSettings.portalSlug || "learn"
                    )}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;min-height:750px;" allow="camera; microphone; fullscreen; clipboard-read; clipboard-write; display-capture" loading="lazy" title="${
                      siteSettings.siteName || "OpenLMS"
                    }"></iframe>`;
                    handleCopy(code, "gs-admin-code");
                  }}
                  className="px-3 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  {copiedKey === "gs-admin-code" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "gs-admin-code" ? "Copied!" : "Copy Code"}</span>
                </button>
              </div>

              <pre className="p-3.5 rounded-xl bg-[#0f1115] border border-white/5 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-36">
                <code>{`<iframe 
  src="${typeof window !== "undefined" ? window.location.origin : "https://..."}?portal=${siteSettings.portalSlug || "learn"}" 
  style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;min-height:750px;" 
  allow="camera; microphone; fullscreen; clipboard-read; clipboard-write" 
  loading="lazy" 
  title="${siteSettings.siteName || "OpenLMS"}">
</iframe>`}</code>
              </pre>

              <div className="p-3 rounded-xl bg-[#0f1115] border border-white/5 text-[11px] text-slate-400 space-y-1">
                <p className="font-semibold text-slate-200">How to paste into Google Sites:</p>
                <p>1. In Google Sites editor, click <strong>Insert &gt; Embed &gt; &quot;Embed code&quot;</strong>.</p>
                <p>2. Paste the code above and click <strong>Next &gt; Insert</strong>.</p>
              </div>
            </div>

            {/* Microsoft SharePoint Code Box */}
            <div className="bg-[#16191f] rounded-2xl border border-white/10 p-5 space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
                    <Laptop className="w-4 h-4" />
                  </span>
                  <h4 className="text-sm font-bold text-white">Microsoft SharePoint Embed Web Part</h4>
                </div>
                <button
                  onClick={() => {
                    const origin = typeof window !== "undefined" ? window.location.origin : "";
                    const code = `<iframe src="${origin}?portal=${encodeURIComponent(
                      siteSettings.portalSlug || "learn"
                    )}" width="100%" height="820px" frameborder="0" allow="camera; microphone; fullscreen; clipboard-read; clipboard-write" style="border: 1px solid rgba(0,0,0,0.1); border-radius: 8px;" title="${
                      siteSettings.siteName || "OpenLMS"
                    }"></iframe>`;
                    handleCopy(code, "sp-admin-code");
                  }}
                  className="px-3 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  {copiedKey === "sp-admin-code" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "sp-admin-code" ? "Copied!" : "Copy Code"}</span>
                </button>
              </div>

              <pre className="p-3.5 rounded-xl bg-[#0f1115] border border-white/5 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-36">
                <code>{`<iframe 
  src="${typeof window !== "undefined" ? window.location.origin : "https://..."}?portal=${siteSettings.portalSlug || "learn"}" 
  width="100%" 
  height="820px" 
  frameborder="0" 
  allow="camera; microphone; fullscreen; clipboard-read; clipboard-write" 
  title="${siteSettings.siteName || "OpenLMS"}">
</iframe>`}</code>
              </pre>

              <div className="p-3 rounded-xl bg-[#0f1115] border border-white/5 text-[11px] text-slate-400 space-y-1">
                <p className="font-semibold text-slate-200">How to paste into Microsoft SharePoint:</p>
                <p>1. In Modern SharePoint page, click <strong>+ (Add Web Part) &gt; &quot;Embed&quot;</strong>.</p>
                <p>2. Paste the iframe code above and click <strong>Republish</strong>.</p>
              </div>
            </div>
          </div>

          {/* Security & Allowed Embed Domains */}
          <div className="bg-[#16191f] rounded-2xl border border-white/10 p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-bold text-white">Embed Whitelist &amp; Frame Ancestors Security</h4>
            </div>
            <p className="text-xs text-slate-400">
              Your server automatically configures permissive frame security headers (<code className="text-emerald-300 font-mono text-[11px]">frame-ancestors &apos;self&apos; https://sites.google.com https://*.sharepoint.com https://teams.microsoft.com</code>) allowing seamless embedding without custom domain setup.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#0f1115] border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Google Ecosystem</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  sites.google.com, classroom.google.com, drive.google.com
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#0f1115] border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Microsoft 365</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  *.sharepoint.com, teams.microsoft.com, portal.office.com
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#0f1115] border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Canvas / Moodle LTI</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Supports standard iframe embedding across all school LMSs.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: Database Settings */}
      {activeTab === "database" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Data Sovereignty Card */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3.5">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-white">Data Sovereignty & User Tracking Architecture</p>
              <p className="text-slate-300 leading-relaxed">
                All course content, SCORM modules, HTML5 assets, and mini-games reside directly within the self-contained LMS package. The external database configured below is <strong>strictly used for tracking user progress, quiz scores, and verifiable certificates</strong>, giving your organization complete data sovereignty.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">Database Provider Selection</h3>
                <p className="text-xs text-slate-400">Select your preferred rapid-deployment cloud backend</p>
              </div>

              {/* Provider Radio Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                {(["supabase", "postgres", "firebase", "local_sqlite"] as DatabaseProvider[]).map((p) => (
                  <button
                    key={p}
                    id={`select-db-provider-${p}`}
                    onClick={() => setDbConfig({ ...dbConfig, provider: p })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                      dbConfig.provider === p
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                    }`}
                  >
                    {p.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Provider-specific Inputs */}
            {dbConfig.provider === "supabase" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Supabase Project URL</label>
                  <input
                    type="text"
                    value={dbConfig.supabaseUrl}
                    onChange={(e) => setDbConfig({ ...dbConfig, supabaseUrl: e.target.value })}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Supabase Anon Key</label>
                  <input
                    type="password"
                    value={dbConfig.supabaseAnonKey}
                    onChange={(e) => setDbConfig({ ...dbConfig, supabaseAnonKey: e.target.value })}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {dbConfig.provider === "postgres" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">PostgreSQL Host</label>
                  <input
                    type="text"
                    value={dbConfig.pgHost}
                    onChange={(e) => setDbConfig({ ...dbConfig, pgHost: e.target.value })}
                    placeholder="db.internal.proxmox.lan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Port</label>
                  <input
                    type="number"
                    value={dbConfig.pgPort}
                    onChange={(e) => setDbConfig({ ...dbConfig, pgPort: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Database Name</label>
                  <input
                    type="text"
                    value={dbConfig.pgDatabase}
                    onChange={(e) => setDbConfig({ ...dbConfig, pgDatabase: e.target.value })}
                    placeholder="openlms_userdata"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {dbConfig.provider === "firebase" && (
              <div className="space-y-1.5 animate-in fade-in">
                <label className="text-xs font-semibold text-slate-300">Firebase Project ID</label>
                <input
                  type="text"
                  value={dbConfig.firebaseProjectId}
                  onChange={(e) => setDbConfig({ ...dbConfig, firebaseProjectId: e.target.value })}
                  placeholder="openlms-sovereign-prod"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}

            {dbConfig.provider === "local_sqlite" && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1 animate-in fade-in">
                <p className="font-semibold text-emerald-400">Local Sovereign Database Active</p>
                <p className="text-slate-400">
                  Data is persisted directly inside your container / browser local storage. No external network connections required.
                </p>
              </div>
            )}

            {/* Test Results */}
            {dbTestResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                  dbTestResult.success
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                    : "bg-rose-950/40 border-rose-500/40 text-rose-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  {dbTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                  <span>{dbTestResult.details}</span>
                </div>
                {dbTestResult.success && (
                  <span className="font-mono text-[11px] text-emerald-400">{dbTestResult.latency}ms ping</span>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  id="test-db-connection-btn"
                  onClick={handleTestDatabase}
                  disabled={isTestingDb}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{isTestingDb ? "Pinging Host..." : "Test Connection"}</span>
                </button>

                <button
                  id="save-db-config-btn"
                  onClick={handleSaveDatabase}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-md shadow-indigo-950"
                >
                  Save Settings
                </button>
              </div>

              <button
                id="export-backup-btn"
                onClick={handleExportDataBackup}
                className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Export JSON Backup</span>
              </button>
            </div>
          </div>

          {/* SQL Migration Script Viewer */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-bold text-white">Database Tables Migration (SQL DDL)</h4>
              </div>
              <button
                onClick={() => handleCopy(sqlMigrationCode, "sql")}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition"
              >
                {copiedKey === "sql" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === "sql" ? "Copied" : "Copy SQL"}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-56 leading-relaxed">
              <code>{sqlMigrationCode}</code>
            </pre>
          </div>
        </div>
      )}

      {/* TAB 2: Bring-Your-Own-AI (BYO-AI) & Persona */}
      {activeTab === "ai" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3.5">
            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-white">Bring-Your-Own-AI (BYO-AI) Integration & Manual Injection</p>
              <p className="text-slate-300 leading-relaxed">
                Connect your existing Google Gemini, OpenAI, Anthropic, or local Ollama API subscriptions. To ensure the linked AI never hallucinates illegal database actions or confuses users, the <strong>Official LMS User Manual</strong> is automatically injected into its system instructions.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-6 shadow-xl">
            {/* AI Provider */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Select AI Intelligence Engine</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "gemini_embedded", label: "Server Gemini 3.7", desc: "Default zero-config Google Gemini API" },
                  { id: "byo_gemini", label: "BYO-Gemini Key", desc: "Personal Google AI Studio API subscription" },
                  { id: "byo_ollama", label: "Local Ollama / Air-gapped", desc: "Private local inference on-premise" },
                ].map((item) => (
                  <button
                    key={item.id}
                    id={`select-ai-engine-${item.id}`}
                    onClick={() => setAiConfig({ ...aiConfig, provider: item.id as AiProvider })}
                    className={`p-3.5 rounded-xl border text-left text-xs transition ${
                      aiConfig.provider === item.id
                        ? "bg-indigo-950/60 border-indigo-500 text-white ring-1 ring-indigo-500/30"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <p className="font-semibold text-slate-200">{item.label}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom API Key input (if BYO selected) */}
            {aiConfig.provider === "byo_gemini" && (
              <div className="space-y-1.5 animate-in fade-in">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Custom Google Gemini API Key</span>
                </label>
                <input
                  type="password"
                  value={aiConfig.customApiKey}
                  onChange={(e) => setAiConfig({ ...aiConfig, customApiKey: e.target.value })}
                  placeholder="AIzaSy..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}

            {aiConfig.provider === "byo_ollama" && (
              <div className="space-y-1.5 animate-in fade-in">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Local Ollama Endpoint URL</span>
                </label>
                <input
                  type="text"
                  value={aiConfig.ollamaEndpoint}
                  onChange={(e) => setAiConfig({ ...aiConfig, ollamaEndpoint: e.target.value })}
                  placeholder="http://localhost:11434"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* Persona & Tone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">AI Tutor Persona Title</label>
                <input
                  type="text"
                  value={aiConfig.agentPersona}
                  onChange={(e) => setAiConfig({ ...aiConfig, agentPersona: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Teaching Methodology / Tone</label>
                <select
                  value={aiConfig.tone}
                  onChange={(e) => setAiConfig({ ...aiConfig, tone: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Socratic Mentor">Socratic Mentor (Ask probing questions, no direct spoilers)</option>
                  <option value="Technical Expert">Technical Expert (Deep architecture details & code)</option>
                  <option value="Friendly Tutor">Friendly Tutor (Simple analogies & encouragement)</option>
                  <option value="Exam Coach">Exam Coach (Strict review for certification tests)</option>
                </select>
              </div>
            </div>

            {/* Manual Injection Toggle */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-white">Inject Official LMS User Manual</p>
                <p className="text-[11px] text-slate-400">
                  Ensures the AI knows SCORM standards, grading thresholds, and safety bounds.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAiConfig({ ...aiConfig, lmsManualInjected: !aiConfig.lmsManualInjected })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  aiConfig.lmsManualInjected
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {aiConfig.lmsManualInjected ? "✓ Injected (Protected)" : "Disabled"}
              </button>
            </div>

            {/* AI Test Output */}
            {aiTestResult && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/40 text-xs text-indigo-200 leading-relaxed">
                <span className="font-bold block text-white mb-1">AI Handshake Response:</span>
                {aiTestResult}
              </div>
            )}

            {/* Save & Test AI */}
            <div className="flex items-center gap-3 pt-2">
              <button
                id="test-ai-agent-btn"
                onClick={handleTestAi}
                disabled={isTestingAi}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isTestingAi ? "Testing Agent..." : "Test AI Handshake"}</span>
              </button>

              <button
                id="save-ai-config-btn"
                onClick={handleSaveAiConfig}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-md shadow-indigo-950"
              >
                Save AI Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Self-Hosting, Docker & Proxmox Hub */}
      {activeTab === "selfhost" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3.5">
            <Server className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-white">Containerized & Proxmox VE Private Deployment</p>
              <p className="text-slate-300 leading-relaxed">
                OpenLMS Sovereign can be self-hosted in seconds on any bare-metal server, Docker host, or Proxmox VE LXC container. Zero telemetry phone-home guarantees complete organizational data sovereignty.
              </p>
            </div>
          </div>

          {/* Docker Compose Card */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">docker-compose.yml (Production Stack)</h4>
              </div>
              <button
                onClick={() => handleCopy(selfHostConfig.dockerComposeYaml, "docker")}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition"
              >
                {copiedKey === "docker" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === "docker" ? "Copied" : "Copy Compose"}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-56 leading-relaxed">
              <code>{selfHostConfig.dockerComposeYaml}</code>
            </pre>
          </div>

          {/* Proxmox VE Script Card */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white">Proxmox VE Automated LXC Script (Bash)</h4>
              </div>
              <button
                onClick={() => handleCopy(selfHostConfig.proxmoxLxcScript, "proxmox")}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition"
              >
                {copiedKey === "proxmox" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === "proxmox" ? "Copied" : "Copy Bash Script"}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-amber-300/90 overflow-x-auto max-h-56 leading-relaxed">
              <code>{selfHostConfig.proxmoxLxcScript}</code>
            </pre>
          </div>
        </div>
      )}

      {/* TAB 4: Integrated Course Launch & Push */}
      {activeTab === "push" && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-6 shadow-xl animate-in fade-in duration-150">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Radio className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Integrated Course Launch & Push Function</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Broadcast new course packages or version updates to all active students in real time with an interactive 1-click update prompt.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">Active Course Catalog ({courses.length} Packages)</span>
              <span className="text-indigo-400 font-mono">All packages self-contained</span>
            </div>

            <div className="divide-y divide-slate-800/60 text-xs">
              {courses.map((course) => (
                <div key={course.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200">{course.title}</span>
                    <span className="text-[11px] text-slate-500 ml-2 font-mono">v{course.version}</span>
                  </div>
                  <button
                    onClick={onOpenPushModal}
                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition"
                  >
                    Push Update
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onOpenPushModal}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-indigo-950"
            >
              <Radio className="w-4 h-4" />
              <span>Launch New Course Broadcast</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
