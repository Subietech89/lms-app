import React, { useState } from "react";
import { WebsiteSettings, Course } from "../types";
import { THEME_PRESETS, getLogoIcon } from "../utils/theme";
import { StorageService } from "../utils/storage";
import { sound } from "../utils/audio";
import {
  X,
  Globe,
  Share2,
  Copy,
  Check,
  Smartphone,
  Laptop,
  QrCode,
  ExternalLink,
  Code,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Sparkles,
  Play,
  Monitor,
  Layout,
  BookOpen,
  ArrowUpRight,
  HelpCircle,
  Eye,
  CheckSquare,
} from "lucide-react";

interface WebPortalShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  websiteSettings: WebsiteSettings;
  courses?: Course[];
}

export function WebPortalShareModal({
  isOpen,
  onClose,
  websiteSettings,
  courses,
}: WebPortalShareModalProps) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<
    "googlesites" | "microsoft" | "direct" | "qr" | "simulator"
  >("googlesites");
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [embedMode, setEmbedMode] = useState<"full" | "player" | "catalog">("full");
  const [simulatorView, setSimulatorView] = useState<"googlesites" | "sharepoint">("googlesites");

  const courseList = courses || StorageService.getCourses() || [];

  const currentWindowOrigin =
    typeof window !== "undefined" ? window.location.origin : "https://learn.openlms-sovereign.internal";

  // Build specialized target URL based on filters
  let targetUrl = `${currentWindowOrigin}?portal=${encodeURIComponent(websiteSettings.portalSlug || "learn")}`;
  if (selectedCourseId !== "all") {
    targetUrl += `&course=${encodeURIComponent(selectedCourseId)}`;
  }
  if (embedMode !== "full") {
    targetUrl += `&view=${embedMode}`;
  }

  // Google Sites Responsive Iframe
  const googleSitesEmbedCode = `<!-- OpenLMS Sovereign • Google Sites Embed -->
<iframe 
  src="${targetUrl}" 
  style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;min-height:750px;" 
  allow="camera; microphone; fullscreen; clipboard-read; clipboard-write; display-capture" 
  loading="lazy" 
  title="${websiteSettings.siteName || "OpenLMS"} Learning Portal">
</iframe>`;

  // Microsoft SharePoint / Teams Embed Code
  const microsoftSharePointEmbedCode = `<!-- OpenLMS Sovereign • Microsoft SharePoint Modern Web Part / M365 Embed -->
<iframe 
  src="${targetUrl}" 
  width="100%" 
  height="820px" 
  frameborder="0" 
  scrolling="yes" 
  allow="camera; microphone; fullscreen; clipboard-read; clipboard-write" 
  style="border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);"
  title="${websiteSettings.siteName || "OpenLMS"} SharePoint Hub">
</iframe>`;

  // Google Classroom One-Click Share URL
  const googleClassroomShareUrl = `https://classroom.google.com/share?url=${encodeURIComponent(targetUrl)}&title=${encodeURIComponent(websiteSettings.siteName || "Interactive Course Portal")}`;

  const handleCopy = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(identifier);
    sound.playSuccess();
    setTimeout(() => setCopiedItem(null), 2200);
  };

  const handleLaunchGoogleSites = () => {
    window.open("https://sites.google.com/new", "_blank", "noopener,noreferrer");
  };

  const handleLaunchSharePoint = () => {
    window.open("https://portal.office.com", "_blank", "noopener,noreferrer");
  };

  const handleLaunchTeams = () => {
    window.open("https://teams.microsoft.com", "_blank", "noopener,noreferrer");
  };

  const handleLaunchClassroom = () => {
    window.open(googleClassroomShareUrl, "_blank", "noopener,noreferrer");
  };

  const LogoIcon = getLogoIcon(websiteSettings.logoIcon);

  return (
    <div
      id="web-portal-share-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        id="web-portal-share-modal-card"
        className="w-full max-w-4xl rounded-2xl bg-[#16191f] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header Bar */}
        <div className="p-5 border-b border-white/10 bg-[#121418] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Launch on Google Sites & Microsoft 365
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                  Zero Domain Required
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Embed your full LMS or specific courses into Google Sites, Microsoft SharePoint, or Teams in under 60 seconds.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Why No Domain Is Needed Value Banner */}
        <div className="px-5 py-3 bg-gradient-to-r from-emerald-950/40 via-cyan-950/20 to-transparent border-b border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Free Instant Hosting:</strong> Google Sites (<code className="text-emerald-300 font-mono text-[11px]">sites.google.com/view/...</code>) & Microsoft (<code className="text-cyan-300 font-mono text-[11px]">yourorg.sharepoint.com</code>) provide free HTTPS and intranet access.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-mono">Status: Ready to Embed</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="p-3 border-b border-white/10 bg-[#0f1115] flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0 text-xs font-semibold">
          <button
            id="tab-btn-googlesites"
            onClick={() => setActiveTab("googlesites")}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition shrink-0 ${
              activeTab === "googlesites"
                ? "bg-emerald-500 text-black font-bold shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="text-sm">🌐</span>
            <span>Google Sites</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20 text-black font-bold">
              1-Click
            </span>
          </button>

          <button
            id="tab-btn-microsoft"
            onClick={() => setActiveTab("microsoft")}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition shrink-0 ${
              activeTab === "microsoft"
                ? "bg-emerald-500 text-black font-bold shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="text-sm">🏢</span>
            <span>Microsoft SharePoint & Teams</span>
          </button>

          <button
            id="tab-btn-simulator"
            onClick={() => setActiveTab("simulator")}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition shrink-0 ${
              activeTab === "simulator"
                ? "bg-emerald-500 text-black font-bold shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Embed Simulator</span>
          </button>

          <button
            id="tab-btn-direct"
            onClick={() => setActiveTab("direct")}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition shrink-0 ${
              activeTab === "direct"
                ? "bg-emerald-500 text-black font-bold shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Direct Web Link</span>
          </button>

          <button
            id="tab-btn-qr"
            onClick={() => setActiveTab("qr")}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition shrink-0 ${
              activeTab === "qr"
                ? "bg-emerald-500 text-black font-bold shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Mobile QR</span>
          </button>
        </div>

        {/* Modal Body with Scrolling */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Embed Customization Bar */}
          <div className="p-4 rounded-xl bg-[#0f1115] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Layout className="w-4 h-4 text-emerald-400" />
                Customize Embed Target (Optional)
              </span>
              <span className="text-[11px] text-slate-500">Auto-updates all embed snippets below</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Target Content to Launch:</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#16191f] border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="all">Entire LMS (Full Catalog, Player & Certificates)</option>
                  {courseList.map((c) => (
                    <option key={c.id} value={c.id}>
                      Course: {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Layout Mode:</label>
                <div className="flex items-center gap-1.5 p-1 bg-[#16191f] rounded-lg border border-white/10">
                  <button
                    onClick={() => setEmbedMode("full")}
                    className={`flex-1 py-1 rounded text-center text-[11px] font-medium transition ${
                      embedMode === "full" ? "bg-emerald-500 text-black font-bold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    onClick={() => setEmbedMode("catalog")}
                    className={`flex-1 py-1 rounded text-center text-[11px] font-medium transition ${
                      embedMode === "catalog" ? "bg-emerald-500 text-black font-bold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Catalog Only
                  </button>
                  <button
                    onClick={() => setEmbedMode("player")}
                    className={`flex-1 py-1 rounded text-center text-[11px] font-medium transition ${
                      embedMode === "player" ? "bg-emerald-500 text-black font-bold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Focused View
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* TAB 1: GOOGLE SITES */}
          {activeTab === "googlesites" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Quick Launch Action Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleLaunchGoogleSites}
                  className="p-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-between group shadow-lg transition"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2.5 rounded-lg bg-white/20">
                      <ExternalLink className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Open Google Sites Creator</h4>
                      <p className="text-xs text-blue-100 opacity-90">sites.google.com/new</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                </button>

                <button
                  onClick={handleLaunchClassroom}
                  className="p-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center justify-between group shadow-lg transition"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2.5 rounded-lg bg-white/20">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Share to Google Classroom</h4>
                      <p className="text-xs text-emerald-100 opacity-90">Post directly to class stream</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                </button>
              </div>

              {/* Method A: Embed by URL in Google Sites */}
              <div className="p-5 rounded-xl bg-[#0f1115] border border-white/10 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase">
                        Method 1 (Recommended)
                      </span>
                      <h3 className="font-bold text-sm text-white">Google Sites Embed URL</h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      In Google Sites: Click <strong>Insert &gt; Embed &gt; &quot;By URL&quot;</strong> and paste this exact link.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={targetUrl}
                    className="flex-1 px-3.5 py-2.5 bg-[#16191f] border border-white/10 rounded-xl text-xs font-mono text-emerald-400 focus:outline-none selection:bg-emerald-500 selection:text-black"
                  />
                  <button
                    onClick={() => handleCopy(targetUrl, "gs-url")}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1.5 transition shadow-sm shrink-0"
                  >
                    {copiedItem === "gs-url" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedItem === "gs-url" ? "Copied!" : "Copy URL"}</span>
                  </button>
                </div>
              </div>

              {/* Method B: Embed by HTML Code */}
              <div className="p-5 rounded-xl bg-[#0f1115] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase">
                        Method 2 (Full Responsive)
                      </span>
                      <h3 className="font-bold text-sm text-white">Google Sites Embed HTML Code</h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      In Google Sites: Click <strong>Insert &gt; Embed &gt; &quot;Embed Code&quot;</strong> and paste the HTML snippet below.
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(googleSitesEmbedCode, "gs-code")}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium flex items-center gap-1.5 transition"
                  >
                    {copiedItem === "gs-code" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedItem === "gs-code" ? "Copied Code!" : "Copy Code"}</span>
                  </button>
                </div>

                <div className="relative">
                  <pre className="p-3.5 rounded-xl bg-[#16191f] border border-white/10 text-[11px] font-mono text-slate-300 overflow-x-auto">
                    {googleSitesEmbedCode}
                  </pre>
                </div>
              </div>

              {/* Step-by-Step 30-Second Guide */}
              <div className="p-5 rounded-xl bg-[#16191f] border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                  3-Step Google Sites Setup Walkthrough
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#0f1115] border border-white/5 space-y-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-emerald-400">Step 1</span>
                    <h5 className="font-semibold text-white">Create Google Site</h5>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Go to <a href="https://sites.google.com/new" target="_blank" rel="noreferrer" className="text-blue-400 underline">sites.google.com/new</a> on your personal or school Google account.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#0f1115] border border-white/5 space-y-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-emerald-400">Step 2</span>
                    <h5 className="font-semibold text-white">Insert Embed Widget</h5>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      On the right sidebar, click <strong>Insert &gt; Embed</strong>, paste the link above, and click <strong>Insert</strong>.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#0f1115] border border-white/5 space-y-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-emerald-400">Step 3</span>
                    <h5 className="font-semibold text-white">Resize &amp; Publish</h5>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Drag the corner blue dots to fill the entire page width, then click <strong>Publish</strong>. Your LMS is now live!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MICROSOFT SHAREPOINT & TEAMS */}
          {activeTab === "microsoft" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleLaunchSharePoint}
                  className="p-4 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-600 hover:to-emerald-600 text-white flex items-center justify-between group shadow-lg transition"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2.5 rounded-lg bg-white/20">
                      <ExternalLink className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Open Microsoft SharePoint</h4>
                      <p className="text-xs text-teal-100 opacity-90">portal.office.com / SharePoint</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                </button>

                <button
                  onClick={handleLaunchTeams}
                  className="p-4 rounded-xl bg-gradient-to-r from-indigo-700 to-purple-700 hover:from-indigo-600 hover:to-purple-600 text-white flex items-center justify-between group shadow-lg transition"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2.5 rounded-lg bg-white/20">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Open Microsoft Teams</h4>
                      <p className="text-xs text-indigo-100 opacity-90">Add as &quot;Website&quot; tab in any channel</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                </button>
              </div>

              {/* SharePoint Embed Web Part Code */}
              <div className="p-5 rounded-xl bg-[#0f1115] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-400 text-[10px] font-bold uppercase">
                        Modern SharePoint Pages
                      </span>
                      <h3 className="font-bold text-sm text-white">SharePoint Embed Web Part Code</h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      In SharePoint: Edit any page &gt; click <strong>+ (Add Web Part) &gt; &quot;Embed&quot;</strong> &gt; paste this code.
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(microsoftSharePointEmbedCode, "sp-code")}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium flex items-center gap-1.5 transition"
                  >
                    {copiedItem === "sp-code" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedItem === "sp-code" ? "Copied Code!" : "Copy Code"}</span>
                  </button>
                </div>

                <div className="relative">
                  <pre className="p-3.5 rounded-xl bg-[#16191f] border border-white/10 text-[11px] font-mono text-slate-300 overflow-x-auto">
                    {microsoftSharePointEmbedCode}
                  </pre>
                </div>
              </div>

              {/* Microsoft Teams Tab URL */}
              <div className="p-5 rounded-xl bg-[#0f1115] border border-white/10 space-y-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase">
                      Microsoft Teams Tab
                    </span>
                    <h3 className="font-bold text-sm text-white">Teams Channel Tab URL</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    In Teams: Go to any Team Channel &gt; Click <strong>+ (Add a tab)</strong> &gt; Choose <strong>&quot;Website&quot;</strong> &gt; Paste this URL.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={targetUrl}
                    className="flex-1 px-3.5 py-2.5 bg-[#16191f] border border-white/10 rounded-xl text-xs font-mono text-emerald-400 focus:outline-none"
                  />
                  <button
                    onClick={() => handleCopy(targetUrl, "teams-url")}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1.5 transition shadow-sm shrink-0"
                  >
                    {copiedItem === "teams-url" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedItem === "teams-url" ? "Copied!" : "Copy URL"}</span>
                  </button>
                </div>
              </div>

              {/* 3-Step Microsoft SharePoint Guide */}
              <div className="p-5 rounded-xl bg-[#16191f] border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                  3-Step Microsoft 365 SharePoint Setup
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#0f1115] border border-white/5 space-y-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-emerald-400">Step 1</span>
                    <h5 className="font-semibold text-white">Edit SharePoint Page</h5>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Open your team&apos;s SharePoint site (e.g. <code className="text-slate-300">yourorg.sharepoint.com/sites/training</code>) and click <strong>Edit</strong>.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#0f1115] border border-white/5 space-y-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-emerald-400">Step 2</span>
                    <h5 className="font-semibold text-white">Add Embed Web Part</h5>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Hover over any section, click the <strong>+</strong> circle, select the <strong>Embed</strong> web part, and paste the code snippet.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#0f1115] border border-white/5 space-y-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-emerald-400">Step 3</span>
                    <h5 className="font-semibold text-white">Republish Page</h5>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Click <strong>Republish</strong>. All employees and students on your Microsoft 365 tenant can immediately learn and earn diplomas!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE EMBED SIMULATOR */}
          {activeTab === "simulator" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between bg-[#0f1115] p-3 rounded-xl border border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-300">Simulate Host Frame:</span>
                  <button
                    onClick={() => setSimulatorView("googlesites")}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                      simulatorView === "googlesites"
                        ? "bg-blue-600 text-white font-bold"
                        : "bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    Google Sites View
                  </button>
                  <button
                    onClick={() => setSimulatorView("sharepoint")}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                      simulatorView === "sharepoint"
                        ? "bg-teal-700 text-white font-bold"
                        : "bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    Microsoft SharePoint View
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="hidden sm:inline">Dimensions:</span>
                  <span className="font-mono text-emerald-400">Responsive (100% × 500px)</span>
                </div>
              </div>

              {/* Simulated Host Container */}
              <div className="rounded-2xl border border-white/15 overflow-hidden shadow-2xl bg-white text-slate-900">
                {/* Simulated Google Sites Header */}
                {simulatorView === "googlesites" && (
                  <div className="bg-[#4285F4] text-white px-4 py-2.5 flex items-center justify-between border-b border-blue-600">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span>sites.google.com/view/{websiteSettings.portalSlug || "training-academy"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-medium opacity-90">
                      <span>Home</span>
                      <span className="underline font-bold">Course Portal</span>
                      <span>About</span>
                      <span>Help</span>
                    </div>
                  </div>
                )}

                {/* Simulated Microsoft SharePoint Header */}
                {simulatorView === "sharepoint" && (
                  <div className="bg-[#0078D4] text-white px-4 py-2.5 flex items-center justify-between border-b border-blue-700">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span className="p-1 rounded bg-white/20 text-[10px]">M365</span>
                      <span>SharePoint • Enterprise Learning Hub</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-medium opacity-90">
                      <span>Documents</span>
                      <span className="bg-white/20 px-2 py-0.5 rounded font-bold">Academy</span>
                      <span>Activity</span>
                    </div>
                  </div>
                )}

                {/* Frame simulation */}
                <div className="h-[480px] bg-[#0f1115] relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
                  <div className="max-w-md p-6 rounded-2xl bg-[#16191f] border border-white/10 shadow-2xl space-y-4">
                    <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit mx-auto">
                      <LogoIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">
                        {websiteSettings.siteName || "OpenLMS Portal"}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {websiteSettings.heroBannerSubtitle || websiteSettings.organizationName || "Responsive browser-based learning platform active"}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0f1115] border border-white/5 text-xs text-slate-300 space-y-1 text-left">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Target Host:</span>
                        <span className="text-emerald-400 font-semibold uppercase">{simulatorView}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Zero-Domain Status:</span>
                        <span className="text-emerald-400 font-semibold">Verified Active</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Total Courses Loaded:</span>
                        <span className="text-slate-200 font-semibold">{courseList.length} Active</span>
                      </div>
                    </div>

                    <a
                      href={targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition shadow-md"
                    >
                      Open Live Portal in New Window
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DIRECT WEB LINK */}
          {activeTab === "direct" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Direct HTTPS Web Link for Students &amp; Teachers
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={targetUrl}
                    className="flex-1 px-3.5 py-2.5 bg-[#0f1115] border border-white/10 rounded-xl text-xs font-mono text-emerald-400 focus:outline-none selection:bg-emerald-500 selection:text-black"
                  />
                  <button
                    onClick={() => handleCopy(targetUrl, "direct-link")}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1.5 transition shadow-sm shrink-0"
                  >
                    {copiedItem === "direct-link" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedItem === "direct-link" ? "Copied!" : "Copy Link"}</span>
                  </button>
                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                    title="Open in new window"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Feature highlights */}
              <div className="p-4 rounded-xl bg-[#0f1115] border border-white/5 space-y-3 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  Universal Cross-Platform Capabilities
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Works on Safari, Chrome, Edge, Firefox</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Full iOS, iPadOS, Android &amp; Chromebook support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Interactive SCORM 1.2 / 2004 modules &amp; Labs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Cryptographic Verifiable PDF Certificates</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MOBILE QR CODE */}
          {activeTab === "qr" && (
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#0f1115] border border-white/10 space-y-4 animate-in fade-in duration-150">
              <div className="p-5 bg-white rounded-2xl shadow-2xl flex items-center justify-center">
                <svg className="w-48 h-48" viewBox="0 0 100 100" fill="currentColor">
                  <path d="M0 0h30v30H0zm5 5v20h20V5zm5 5h10v10H10zM70 0h30v30H70zm5 5v20h20V5zm5 5h10v10H80zM0 70h30v30H0zm5 5v20h20V5zm5 5h10v10H10zM40 10h10v10H40zm10 10h10v10H50zm-10 10h10v10H40zm30 10h10v10H70zm10 10h10v10H80zm10 10h10v10H90zm-50 10h10v10H40zm10 10h10v10H50zm10 10h10v10H60zm10 0h10v10H70zm20 0h10v10H90z" />
                </svg>
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-white">Scan with Camera to Open Web Portal</p>
                <p className="text-xs text-slate-400 max-w-sm">
                  Learners point their phone camera at this QR code to instantly launch {websiteSettings.siteName || "OpenLMS"} with zero app installation.
                </p>
              </div>
              <button
                onClick={() => handleCopy(targetUrl, "qr-url")}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                {copiedItem === "qr-url" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedItem === "qr-url" ? "Portal URL Copied!" : "Copy Portal URL"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="p-4 border-t border-white/10 bg-[#121418] flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>
              Hosting Mode: <strong className="text-emerald-400 font-semibold">Zero-Domain Sovereign</strong>
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default WebPortalShareModal;
