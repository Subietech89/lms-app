import { ThemeColorScheme, WebsiteSettings } from "../types";
import {
  Layers,
  GraduationCap,
  Shield,
  Terminal,
  Sparkles,
  Cpu,
  Globe,
  BookOpen,
  Atom,
  Zap,
  Rocket,
  Code2,
  Compass,
  Bookmark,
  LucideIcon,
} from "lucide-react";

export interface ThemeConfig {
  id: ThemeColorScheme;
  name: string;
  description: string;
  primaryColor: string; // Tailwind hex
  primaryHex: string;
  bgHex: string;
  cardHex: string;
  borderHex: string;
  accentBadgeClass: string;
  primaryButtonClass: string;
  ringClass: string;
  textAccentClass: string;
  isDark: boolean;
}

export const THEME_PRESETS: Record<ThemeColorScheme, ThemeConfig> = {
  emerald: {
    id: "emerald",
    name: "Elegant Dark (Emerald)",
    description: "Deep obsidian canvas with high-contrast emerald green accents.",
    primaryColor: "emerald",
    primaryHex: "#10b981",
    bgHex: "#0f1115",
    cardHex: "#16191f",
    borderHex: "rgba(255, 255, 255, 0.08)",
    accentBadgeClass: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    primaryButtonClass: "bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-xs",
    ringClass: "focus:ring-emerald-500 focus:border-emerald-500",
    textAccentClass: "text-emerald-400",
    isDark: true,
  },
  indigo: {
    id: "indigo",
    name: "Cyber Indigo",
    description: "Deep space navy canvas with vibrant cyber indigo highlights.",
    primaryColor: "indigo",
    primaryHex: "#6366f1",
    bgHex: "#0a0d14",
    cardHex: "#121722",
    borderHex: "rgba(99, 102, 241, 0.15)",
    accentBadgeClass: "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20",
    primaryButtonClass: "bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xs",
    ringClass: "focus:ring-indigo-500 focus:border-indigo-500",
    textAccentClass: "text-indigo-400",
    isDark: true,
  },
  blue: {
    id: "blue",
    name: "Sapphire Tech",
    description: "Modern enterprise dark blue with electric sky accents.",
    primaryColor: "sky",
    primaryHex: "#0ea5e9",
    bgHex: "#090e17",
    cardHex: "#0f172a",
    borderHex: "rgba(14, 165, 233, 0.15)",
    accentBadgeClass: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
    primaryButtonClass: "bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold shadow-xs",
    ringClass: "focus:ring-sky-500 focus:border-sky-500",
    textAccentClass: "text-sky-400",
    isDark: true,
  },
  crimson: {
    id: "crimson",
    name: "Crimson Obsidian",
    description: "Stealth dark mode with vivid ruby and crimson focus states.",
    primaryColor: "rose",
    primaryHex: "#f43f5e",
    bgHex: "#120e10",
    cardHex: "#1a1317",
    borderHex: "rgba(244, 63, 94, 0.15)",
    accentBadgeClass: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    primaryButtonClass: "bg-rose-500 hover:bg-rose-400 text-white font-semibold shadow-xs",
    ringClass: "focus:ring-rose-500 focus:border-rose-500",
    textAccentClass: "text-rose-400",
    isDark: true,
  },
  amber: {
    id: "amber",
    name: "Amber Gold",
    description: "Warm charcoal canvas with regal amber and honey highlights.",
    primaryColor: "amber",
    primaryHex: "#f59e0b",
    bgHex: "#11100d",
    cardHex: "#191813",
    borderHex: "rgba(245, 158, 11, 0.15)",
    accentBadgeClass: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    primaryButtonClass: "bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold shadow-xs",
    ringClass: "focus:ring-amber-500 focus:border-amber-500",
    textAccentClass: "text-amber-400",
    isDark: true,
  },
  violet: {
    id: "violet",
    name: "Deep Amethyst",
    description: "Rich dark violet canvas with luminous neon amethyst trims.",
    primaryColor: "purple",
    primaryHex: "#a855f7",
    bgHex: "#0e0c15",
    cardHex: "#161322",
    borderHex: "rgba(168, 85, 247, 0.15)",
    accentBadgeClass: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    primaryButtonClass: "bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-xs",
    ringClass: "focus:ring-purple-500 focus:border-purple-500",
    textAccentClass: "text-purple-400",
    isDark: true,
  },
  nordic_light: {
    id: "nordic_light",
    name: "Nordic Clean (Light)",
    description: "Crisp architectural off-white with slate typography and emerald accents.",
    primaryColor: "emerald",
    primaryHex: "#059669",
    bgHex: "#f8fafc",
    cardHex: "#ffffff",
    borderHex: "#e2e8f0",
    accentBadgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    primaryButtonClass: "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs",
    ringClass: "focus:ring-emerald-500 focus:border-emerald-500",
    textAccentClass: "text-emerald-600",
    isDark: false,
  },
  custom: {
    id: "custom",
    name: "Custom Palette",
    description: "Fully customized hex color palette configured in Website Settings.",
    primaryColor: "custom",
    primaryHex: "#10b981",
    bgHex: "#0f1115",
    cardHex: "#16191f",
    borderHex: "rgba(255, 255, 255, 0.08)",
    accentBadgeClass: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    primaryButtonClass: "bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-xs",
    ringClass: "focus:ring-emerald-500 focus:border-emerald-500",
    textAccentClass: "text-emerald-400",
    isDark: true,
  },
};

export const AVAILABLE_LOGO_ICONS: Record<string, { label: string; icon: LucideIcon }> = {
  Layers: { label: "Layers / Stack", icon: Layers },
  GraduationCap: { label: "Graduation Cap", icon: GraduationCap },
  Shield: { label: "Shield / Sovereign", icon: Shield },
  Terminal: { label: "Terminal / Code", icon: Terminal },
  Sparkles: { label: "Sparkles / AI", icon: Sparkles },
  Cpu: { label: "Processor / Chip", icon: Cpu },
  Globe: { label: "Globe / Web", icon: Globe },
  BookOpen: { label: "Open Book", icon: BookOpen },
  Atom: { label: "Atom / Science", icon: Atom },
  Zap: { label: "Lightning / Power", icon: Zap },
  Rocket: { label: "Rocket / Launch", icon: Rocket },
  Code2: { label: "Software / Code", icon: Code2 },
  Compass: { label: "Compass / Nav", icon: Compass },
  Bookmark: { label: "Bookmark / Learn", icon: Bookmark },
};

export function getLogoIcon(iconName: string): LucideIcon {
  return AVAILABLE_LOGO_ICONS[iconName]?.icon || Layers;
}

export function applyThemeVariables(settings: WebsiteSettings) {
  if (typeof document === "undefined") return;

  const preset = THEME_PRESETS[settings.colorScheme] || THEME_PRESETS.emerald;
  const root = document.documentElement;

  const primaryHex = settings.colorScheme === "custom" ? settings.customPrimaryColor || preset.primaryHex : preset.primaryHex;
  const bgHex = settings.colorScheme === "custom" ? settings.customBgColor || preset.bgHex : preset.bgHex;
  const cardHex = settings.colorScheme === "custom" ? settings.customSurfaceColor || preset.cardHex : preset.cardHex;

  root.style.setProperty("--color-primary", primaryHex);
  root.style.setProperty("--color-bg", bgHex);
  root.style.setProperty("--color-card", cardHex);

  // Update browser document title
  if (settings.siteName) {
    document.title = `${settings.siteName} — ${settings.tagline || "Self-Hosted Learning Portal"}`;
  }
}
