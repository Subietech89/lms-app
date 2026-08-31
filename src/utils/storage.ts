import {
  User,
  UserRole,
  Course,
  UserProgress,
  Certificate,
  LmsNotification,
  DatabaseConfig,
  AiAgentConfig,
  SelfHostConfig,
  WebsiteSettings,
} from "../types";
import { INITIAL_COURSES } from "../data/coursesData";
import { LMS_USER_MANUAL } from "../data/lmsManual";
import { sound } from "./audio";

export const DEFAULT_WEBSITE_SETTINGS: WebsiteSettings = {
  siteName: "Nexus Academy",
  tagline: "High-Performance Cloud & Systems LMS",
  logoType: "icon",
  logoIcon: "Layers",
  logoImageUrl: "",
  logoTextBadge: "NX",
  colorScheme: "emerald",
  customPrimaryColor: "#10b981",
  customBgColor: "#0f1115",
  customSurfaceColor: "#16191f",
  isDarkMode: true,
  publicWebPortalEnabled: true,
  portalUrl: "https://learn.nexus-academy.internal",
  portalSlug: "learn",
  allowSelfRegistration: true,
  registrationDomainFilter: "",
  organizationName: "Nexus Sovereign Education Systems",
  supportEmail: "support@nexus-academy.internal",
  announcementText: "🚀 Spring Semester Course Catalog is Live — All HTML5 & SCORM modules updated!",
  showAnnouncement: true,
  heroBannerTitle: "Master Systems & Cloud Architecture Anywhere",
  heroBannerSubtitle: "Access self-hosted SCORM labs, coding simulations, and verifiable certifications directly from your browser on any phone, tablet, or PC.",
  showHeroBanner: true,
  customFooterText: "© 2026 Nexus Sovereign Education Systems • 100% Self-Hosted & Data-Sovereign",
  browserFaviconIcon: "Layers",
  embedAllowedDomains: "*",
};

// Preset starter role profiles for initial authentication
export const PRESET_USERS: Record<UserRole, User> = {
  student: {
    id: "usr_student_01",
    name: "Alex Rivera",
    email: "alex.rivera@student.openlms.org",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    role: "student",
    enrolledCourseIds: [],
    completedCourseIds: [],
    totalPoints: 0,
    learningStreakDays: 0,
    lastActive: "Just now",
    department: "Computer Science & Cloud Eng",
  },
  teacher: {
    id: "usr_teacher_01",
    name: "Prof. Marcus Vance",
    email: "m.vance@faculty.openlms.org",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    role: "teacher",
    enrolledCourseIds: [],
    completedCourseIds: [],
    totalPoints: 0,
    learningStreakDays: 0,
    lastActive: "Just now",
    department: "Applied Software Architecture",
  },
  admin: {
    id: "usr_admin_01",
    name: "Sarah Chen (Admin)",
    email: "admin@sovereign-lms.internal",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    role: "admin",
    enrolledCourseIds: [],
    completedCourseIds: [],
    totalPoints: 0,
    learningStreakDays: 0,
    lastActive: "Just now",
    department: "System Operations & Security",
  },
};

const DEFAULT_DB_CONFIG: DatabaseConfig = {
  provider: "supabase",
  supabaseUrl: "https://xyzcompany.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  pgHost: "db.internal.proxmox.lan",
  pgPort: 5432,
  pgDatabase: "openlms_userdata",
  pgUser: "lms_sovereign",
  pgSsl: true,
  firebaseProjectId: "openlms-sovereign-prod",
  restEndpoint: "https://api.internal.university.edu/lms-sync",
  syncStatus: "connected",
  lastSyncTimestamp: new Date().toISOString(),
  autoSyncUserData: true,
  tablesTracked: ["lms_users", "lms_progress", "lms_cmi_states", "lms_certificates", "lms_audit_logs"],
};

const DEFAULT_AI_CONFIG: AiAgentConfig = {
  provider: "gemini_embedded",
  customApiKey: "",
  ollamaEndpoint: "http://localhost:11434",
  modelName: "gemini-3.7-flash",
  agentPersona: "Socratic Academic & Systems Architecture Tutor",
  tone: "Socratic Mentor",
  lmsManualInjected: true,
  customSystemPrompt: "You are the official student tutor for OpenLMS Sovereign. Keep responses insightful, conceptual, and strictly adhere to the injected LMS manual.",
  temperature: 0.7,
};

const DEFAULT_SELF_HOST: SelfHostConfig = {
  containerName: "openlms_app",
  containerPort: 3000,
  databaseDriver: "PostgreSQL 16 / Supabase",
  enableTelemetry: false,
  dockerComposeYaml: `version: "3.8"
services:
  openlms:
    image: openlms-sovereign:latest
    container_name: openlms_app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
      - DB_PROVIDER=postgres
      - PG_HOST=postgres_db
    restart: unless-stopped
    depends_on:
      - postgres_db

  postgres_db:
    image: postgres:16-alpine
    container_name: openlms_postgres
    environment:
      POSTGRES_DB: openlms_userdata
      POSTGRES_USER: lms_admin
      POSTGRES_PASSWORD: SovereignSecurePassword2026!
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  pgdata:`,
  dockerfile: `FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.ts ./
RUN npm install --omit=dev
EXPOSE 3000
CMD ["npm", "start"]`,
  proxmoxLxcScript: `#!/bin/bash
# Proxmox VE Automated LXC Container Provisioning for OpenLMS
# Run directly in Proxmox VE Host Shell

CTID=250
HOSTNAME="openlms-sovereign"
STORAGE="local-lvm"
TEMPLATE="local:vztmpl/debian-12-standard_12.2-1_amd64.tar.zst"

echo "[1/4] Creating Unprivileged Proxmox LXC Container ID: $CTID..."
pct create $CTID $TEMPLATE \\
  --hostname $HOSTNAME \\
  --cores 2 \\
  --memory 2048 \\
  --swap 512 \\
  --rootfs $STORAGE:20 \\
  --net0 name=eth0,bridge=vmbr0,ip=dhcp,type=veth \\
  --features nesting=1 \\
  --unprivileged 1 \\
  --onboot 1

echo "[2/4] Starting LXC Container..."
pct start $CTID
sleep 5

echo "[3/4] Installing Docker and Dependencies inside Container..."
pct exec $CTID -- bash -c "apt-get update && apt-get install -y curl git docker.io docker-compose"

echo "[4/4] OpenLMS Sovereign ready for deployment on port 3000!"
echo "Status: 100% On-Premise Data Sovereignty Achieved."`,
};

const INITIAL_NOTIFICATIONS: LmsNotification[] = [
  {
    id: "notif_01",
    roleTarget: "all",
    title: "⚡ Welcome to OpenLMS Sovereign",
    message: "Your private, high-speed learning environment is live. Explore SCORM modules, interactive simulations, and test your skills with gamified challenges.",
    type: "announcement",
    timestamp: "10 minutes ago",
    read: false,
  },
  {
    id: "notif_02",
    roleTarget: "student",
    title: "🚀 Live Course Update: Kubernetes 2.4.0 Released",
    message: "Instructor Dr. Elena Rostova pushed an updated Ingress Controller SCORM module with new live telemetry.",
    type: "course_update",
    timestamp: "1 hour ago",
    read: false,
    actionLabel: "View Course",
    payload: { courseId: "course-cloud-k8s", version: "2.4.0" },
  },
  {
    id: "notif_03",
    roleTarget: "all",
    title: "🤖 Bring-Your-Own-AI Ready",
    message: "Link your Gemini, OpenAI, or local Ollama API in Settings to enable the Socratic Learning Tutor.",
    type: "system",
    timestamp: "3 hours ago",
    read: true,
  },
];

// LocalStorage Keys
const KEYS = {
  USER_ROLE: "openlms_active_role",
  ACTIVE_USER_ID: "openlms_active_user_id",
  IS_LOGGED_IN: "openlms_is_logged_in",
  CUSTOM_COURSES: "openlms_courses_list",
  PROGRESS: "openlms_user_progress",
  CERTIFICATES: "openlms_certificates",
  NOTIFICATIONS: "openlms_notifications",
  DB_CONFIG: "openlms_db_config",
  AI_CONFIG: "openlms_ai_config",
  SELF_HOST: "openlms_selfhost_config",
  USERS: "openlms_users_state",
  CUSTOM_USERS_LIST: "openlms_registered_users",
  WEBSITE_SETTINGS: "openlms_website_settings",
};

export class StorageService {
  static setCurrentRole(role: UserRole) {
    this.setRole(role);
  }

  static saveCourse(course: Course) {
    const courses = this.getCourses();
    const idx = courses.findIndex((c) => c.id === course.id);
    if (idx >= 0) {
      courses[idx] = course;
    } else {
      courses.unshift(course);
    }
    this.saveCourses(courses);
  }

  static saveProgress(
    userId: string,
    courseId: string,
    moduleId: string,
    score: number = 100,
    cmiData?: any
  ): UserProgress {
    const res = this.saveModuleProgress(userId, courseId, moduleId, true, score, cmiData);
    return res.progress;
  }

  static issueCertificate(
    userId: string,
    userName: string,
    courseId: string,
    courseTitle: string,
    instructorName: string,
    gradeScore: number = 100
  ): Certificate {
    const course = this.getCourses().find((c) => c.id === courseId) || {
      id: courseId,
      title: courseTitle,
      instructorName,
      tags: ["Certified"],
    } as Course;
    return this.generateCertificate(userId, course);
  }

  // Get active role
  static getRole(): UserRole {
    if (typeof window === "undefined") return "student";
    return (localStorage.getItem(KEYS.USER_ROLE) as UserRole) || "student";
  }

  static setRole(role: UserRole) {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEYS.USER_ROLE, role);
  }

  // Get current user
  static getCurrentUser(): User {
    const role = this.getRole();
    const allUsers = this.getUsers();
    return allUsers[role] || PRESET_USERS[role];
  }

  static getUsers(): Record<UserRole, User> {
    if (typeof window === "undefined") return PRESET_USERS;
    const raw = localStorage.getItem(KEYS.USERS);
    if (!raw) return PRESET_USERS;
    try {
      return JSON.parse(raw);
    } catch {
      return PRESET_USERS;
    }
  }

  static saveUser(user: User) {
    const all = this.getUsers();
    all[user.role] = user;
    localStorage.setItem(KEYS.USERS, JSON.stringify(all));
  }

  // Courses
  static getCourses(): Course[] {
    if (typeof window === "undefined") return INITIAL_COURSES;
    const raw = localStorage.getItem(KEYS.CUSTOM_COURSES);
    if (!raw) return INITIAL_COURSES;
    try {
      const parsed: Course[] = JSON.parse(raw);
      return parsed.length > 0 ? parsed : INITIAL_COURSES;
    } catch {
      return INITIAL_COURSES;
    }
  }

  static saveCourses(courses: Course[]) {
    localStorage.setItem(KEYS.CUSTOM_COURSES, JSON.stringify(courses));
  }

  static pushNewCourse(course: Course, broadcastMsg: string, instructorName: string): LmsNotification {
    const courses = this.getCourses();
    const existingIdx = courses.findIndex((c) => c.id === course.id);
    if (existingIdx >= 0) {
      courses[existingIdx] = course;
    } else {
      courses.unshift(course);
    }
    this.saveCourses(courses);

    // Create real-time notification
    const newNotif: LmsNotification = {
      id: "notif_push_" + Date.now(),
      roleTarget: "all",
      title: `📦 Course Update: ${course.title} (v${course.version})`,
      message: broadcastMsg || `New course update published by ${instructorName}. Click to download & review latest modules.`,
      type: "course_update",
      timestamp: "Just now",
      read: false,
      actionLabel: "Launch Update",
      payload: { courseId: course.id, version: course.version },
    };

    this.addNotification(newNotif);
    sound.playNotification();
    return newNotif;
  }

  // User Progress
  static getProgress(userId: string, courseId: string): UserProgress {
    const allProgress = this.getAllProgress();
    const key = `${userId}_${courseId}`;
    if (allProgress[key]) return allProgress[key];

    return {
      userId,
      courseId,
      overallPercent: 0,
      isCompleted: false,
      moduleProgress: {},
    };
  }

  static getAllProgress(): Record<string, UserProgress> {
    if (typeof window === "undefined") return {};
    const raw = localStorage.getItem(KEYS.PROGRESS);
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  static saveModuleProgress(
    userId: string,
    courseId: string,
    moduleId: string,
    completed: boolean,
    score?: number,
    cmiData?: any
  ): { progress: UserProgress; newlyCompletedCourse: boolean } {
    const allProgress = this.getAllProgress();
    const key = `${userId}_${courseId}`;
    const course = this.getCourses().find((c) => c.id === courseId);
    const existing = allProgress[key] || {
      userId,
      courseId,
      overallPercent: 0,
      isCompleted: false,
      moduleProgress: {},
    };

    const prevMod = existing.moduleProgress[moduleId] || {
      moduleId,
      courseId,
      completed: false,
      timeSpentSeconds: 0,
      lastAccessed: new Date().toISOString(),
    };

    existing.moduleProgress[moduleId] = {
      ...prevMod,
      completed: completed || prevMod.completed,
      score: score !== undefined ? score : prevMod.score,
      lastAccessed: new Date().toISOString(),
      cmiData: cmiData || prevMod.cmiData,
    };

    existing.lastModuleId = moduleId;

    // Recalculate course percentage
    const totalModules = course?.modules.length || 1;
    const completedCount = Object.values(existing.moduleProgress).filter((m) => m.completed).length;
    const percent = Math.min(100, Math.round((completedCount / totalModules) * 100));
    existing.overallPercent = percent;

    let newlyCompletedCourse = false;
    if (percent === 100 && !existing.isCompleted) {
      existing.isCompleted = true;
      existing.completedAt = new Date().toISOString();
      newlyCompletedCourse = true;

      // Automatically issue certificate
      if (course) {
        this.generateCertificate(userId, course);
      }
    }

    allProgress[key] = existing;
    localStorage.setItem(KEYS.PROGRESS, JSON.stringify(allProgress));

    return { progress: existing, newlyCompletedCourse };
  }

  // Certificates
  static getCertificates(userId?: string): Certificate[] {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(KEYS.CERTIFICATES);
    let certs: Certificate[] = [];
    if (raw) {
      try {
        certs = JSON.parse(raw);
      } catch {}
    }

    if (userId) {
      return certs.filter((c) => c.userId === userId);
    }
    return certs;
  }

  static generateCertificate(userId: string, course: Course): Certificate {
    const user = this.getCurrentUser();
    const certs = this.getCertificates();
    const existing = certs.find((c) => c.userId === userId && c.courseId === course.id);
    if (existing) return existing;

    const certId = "CERT-" + Math.random().toString(36).substring(2, 9).toUpperCase();
    const hash = "SHA256-" + Math.random().toString(36).substring(2, 12).toUpperCase() + "-" + Date.now();

    const newCert: Certificate = {
      id: certId,
      userId,
      userName: user.name || "Student Scholar",
      courseId: course.id,
      courseTitle: course.title,
      issueDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      gradeScore: 98,
      verificationHash: hash,
      instructorName: course.instructorName,
      skillsAcquired: course.tags,
    };

    certs.push(newCert);
    localStorage.setItem(KEYS.CERTIFICATES, JSON.stringify(certs));

    // Also award points
    user.totalPoints += 500;
    if (!user.completedCourseIds.includes(course.id)) {
      user.completedCourseIds.push(course.id);
    }
    this.saveUser(user);

    // Send real-time notification
    this.addNotification({
      id: "cert_notif_" + Date.now(),
      recipientId: userId,
      roleTarget: "student",
      title: "🎓 Certificate of Completion Issued!",
      message: `Congratulations! You officially completed '${course.title}' and your verified cryptographic certificate is ready for download.`,
      type: "certificate",
      timestamp: "Just now",
      read: false,
      actionLabel: "View Certificate",
      payload: { certificateId: certId, courseId: course.id },
    });

    sound.playFanfare();
    return newCert;
  }

  // Notifications
  static getNotifications(): LmsNotification[] {
    if (typeof window === "undefined") return INITIAL_NOTIFICATIONS;
    const raw = localStorage.getItem(KEYS.NOTIFICATIONS);
    if (!raw) return INITIAL_NOTIFICATIONS;
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  }

  static addNotification(notif: LmsNotification) {
    const list = this.getNotifications();
    list.unshift(notif);
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(list));
  }

  static markNotificationRead(id: string) {
    const list = this.getNotifications();
    const item = list.find((n) => n.id === id);
    if (item) {
      item.read = true;
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(list));
    }
  }

  static markAllNotificationsRead() {
    const list = this.getNotifications();
    list.forEach((n) => (n.read = true));
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(list));
  }

  // Configs
  static getDatabaseConfig(): DatabaseConfig {
    if (typeof window === "undefined") return DEFAULT_DB_CONFIG;
    const raw = localStorage.getItem(KEYS.DB_CONFIG);
    if (!raw) return DEFAULT_DB_CONFIG;
    try {
      return { ...DEFAULT_DB_CONFIG, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_DB_CONFIG;
    }
  }

  static saveDatabaseConfig(config: DatabaseConfig) {
    localStorage.setItem(KEYS.DB_CONFIG, JSON.stringify(config));
  }

  static getAiConfig(): AiAgentConfig {
    if (typeof window === "undefined") return DEFAULT_AI_CONFIG;
    const raw = localStorage.getItem(KEYS.AI_CONFIG);
    if (!raw) return DEFAULT_AI_CONFIG;
    try {
      return { ...DEFAULT_AI_CONFIG, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_AI_CONFIG;
    }
  }

  static saveAiConfig(config: AiAgentConfig) {
    localStorage.setItem(KEYS.AI_CONFIG, JSON.stringify(config));
  }

  static getSelfHostConfig(): SelfHostConfig {
    if (typeof window === "undefined") return DEFAULT_SELF_HOST;
    const raw = localStorage.getItem(KEYS.SELF_HOST);
    if (!raw) return DEFAULT_SELF_HOST;
    try {
      return { ...DEFAULT_SELF_HOST, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SELF_HOST;
    }
  }

  static saveSelfHostConfig(config: SelfHostConfig) {
    localStorage.setItem(KEYS.SELF_HOST, JSON.stringify(config));
  }

  // Website & Portal Settings
  static getWebsiteSettings(): WebsiteSettings {
    if (typeof window === "undefined") return DEFAULT_WEBSITE_SETTINGS;
    const raw = localStorage.getItem(KEYS.WEBSITE_SETTINGS);
    if (!raw) return DEFAULT_WEBSITE_SETTINGS;
    try {
      return { ...DEFAULT_WEBSITE_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_WEBSITE_SETTINGS;
    }
  }

  static saveWebsiteSettings(settings: WebsiteSettings) {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEYS.WEBSITE_SETTINGS, JSON.stringify(settings));
  }

  // Registered Users list & Auth
  static getAllRegisteredUsers(): User[] {
    if (typeof window === "undefined") return Object.values(PRESET_USERS);
    const raw = localStorage.getItem(KEYS.CUSTOM_USERS_LIST);
    let list: User[] = [];
    if (raw) {
      try {
        list = JSON.parse(raw);
      } catch {
        list = [];
      }
    }
    if (list.length === 0) {
      list = Object.values(PRESET_USERS);
      localStorage.setItem(KEYS.CUSTOM_USERS_LIST, JSON.stringify(list));
    }
    return list;
  }

  static registerUser(
    name: string,
    email: string,
    role: UserRole = "student",
    department?: string
  ): User {
    const list = this.getAllRegisteredUsers();
    const existing = list.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return existing;
    }

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      email,
      role,
      department: department || (role === "student" ? "General Studies" : "Faculty Department"),
      avatar: `https://images.unsplash.com/photo-${role === "teacher" ? "1507003211169-0a1dd7228f2d" : "1535713875002-d1d0cf377fde"}?auto=format&fit=crop&w=200&q=80`,
      enrolledCourseIds: [],
      completedCourseIds: [],
      totalPoints: 0,
      learningStreakDays: 0,
      lastActive: "Just now",
    };

    list.push(newUser);
    localStorage.setItem(KEYS.CUSTOM_USERS_LIST, JSON.stringify(list));
    this.setActiveUser(newUser);
    return newUser;
  }

  static setActiveUser(user: User) {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEYS.ACTIVE_USER_ID, user.id);
    this.setRole(user.role);
    this.saveUser(user);
  }

  static isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(KEYS.IS_LOGGED_IN) === "true";
  }

  static login(user: User) {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEYS.IS_LOGGED_IN, "true");
    this.setActiveUser(user);
  }

  static logout() {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEYS.IS_LOGGED_IN, "false");
  }

  static getActiveUser(): User {
    const all = this.getAllRegisteredUsers();
    const activeId = typeof window !== "undefined" ? localStorage.getItem(KEYS.ACTIVE_USER_ID) : null;
    if (activeId) {
      const found = all.find((u) => u.id === activeId);
      if (found) return found;
    }
    return this.getCurrentUser();
  }
}

