export type UserRole = "student" | "teacher" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  enrolledCourseIds: string[];
  completedCourseIds: string[];
  totalPoints: number;
  learningStreakDays: number;
  lastActive: string;
  department?: string;
}

export type ModuleType = "scorm" | "html" | "quiz" | "game" | "video";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  codeSnippet?: string;
}

export interface QuizData {
  passingScorePercent: number;
  timeLimitMinutes?: number;
  questions: QuizQuestion[];
}

export interface ScormManifestData {
  schemaVersion: "1.2" | "2004 4th Edition";
  masteryScore: number;
  identifier: string;
  title: string;
  startingLocation: string;
  totalTimeAllowed?: string;
}

export interface GameItem {
  id: string;
  term: string;
  definition: string;
  category?: string;
}

export interface GameData {
  gameType: "term-match" | "speed-trivia" | "code-syntax-runner";
  instructions: string;
  targetScore: number;
  items: GameItem[];
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  type: ModuleType;
  durationMinutes: number;
  scormConfig?: ScormManifestData;
  htmlContent?: string;
  quizData?: QuizData;
  gameData?: GameData;
  videoUrl?: string;
  resources?: { name: string; url: string; size: string }[];
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  longOverview: string;
  category: "DevOps & Cloud" | "Full-Stack Web" | "Data & AI" | "Security & Sovereignty" | "General Tech";
  level: "Beginner" | "Intermediate" | "Advanced";
  estimatedHours: number;
  thumbnail: string;
  instructorName: string;
  instructorRole: string;
  instructorAvatar: string;
  rating: number;
  totalStudents: number;
  tags: string[];
  version: string;
  releaseDate: string;
  modules: CourseModule[];
}

export interface CmiDataModel {
  "cmi.core.lesson_status": "not attempted" | "incomplete" | "completed" | "passed" | "failed";
  "cmi.core.lesson_location": string;
  "cmi.core.score.raw": number;
  "cmi.core.score.min": number;
  "cmi.core.score.max": number;
  "cmi.core.session_time": string;
  "cmi.core.total_time": string;
  "cmi.core.exit": "time-out" | "suspend" | "logout" | "";
  "cmi.suspend_data": string;
  "cmi.comments"?: string;
  "cmi.interactions"?: Array<{ id: string; result: string; latency: string; time: string }>;
}

export interface ModuleProgress {
  moduleId: string;
  courseId: string;
  completed: boolean;
  score?: number;
  timeSpentSeconds: number;
  lastAccessed: string;
  cmiData?: Partial<CmiDataModel>;
}

export interface UserProgress {
  userId: string;
  courseId: string;
  overallPercent: number;
  isCompleted: boolean;
  completedAt?: string;
  moduleProgress: Record<string, ModuleProgress>;
  lastModuleId?: string;
  cmiData?: Record<string, any>;
}

export interface Certificate {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  issueDate: string;
  gradeScore: number;
  verificationHash: string;
  instructorName: string;
  skillsAcquired: string[];
}

export type NotificationType = "course_update" | "announcement" | "certificate" | "grade" | "alert" | "system";

export interface LmsNotification {
  id: string;
  recipientId?: string; // specific user or undefined for all
  roleTarget?: "all" | "student" | "teacher" | "admin";
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  payload?: {
    courseId?: string;
    version?: string;
    score?: number;
    certificateId?: string;
    downloadUrl?: string;
  };
}

export type DatabaseProvider = "supabase" | "postgres" | "firebase" | "local_sqlite" | "rest_webhook";

export type ThemeColorScheme = "emerald" | "indigo" | "blue" | "crimson" | "amber" | "violet" | "nordic_light" | "custom";

export interface WebsiteSettings {
  siteName: string;
  tagline: string;
  logoType: "icon" | "image" | "text";
  logoIcon: string;
  logoImageUrl: string;
  logoTextBadge: string;
  colorScheme: ThemeColorScheme;
  customPrimaryColor: string;
  customBgColor: string;
  customSurfaceColor: string;
  isDarkMode: boolean;
  publicWebPortalEnabled: boolean;
  portalUrl: string;
  portalSlug: string;
  allowSelfRegistration: boolean;
  registrationDomainFilter: string;
  organizationName: string;
  supportEmail: string;
  announcementText: string;
  showAnnouncement: boolean;
  heroBannerTitle: string;
  heroBannerSubtitle: string;
  showHeroBanner: boolean;
  customFooterText: string;
  browserFaviconIcon: string;
  embedAllowedDomains: string;
}

export interface DatabaseConfig {
  provider: DatabaseProvider;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey?: string;
  pgHost: string;
  pgPort: number;
  pgDatabase: string;
  pgUser: string;
  pgPassword?: string;
  pgSsl: boolean;
  firebaseProjectId: string;
  firebaseApiKey?: string;
  restEndpoint: string;
  restAuthHeader?: string;
  syncStatus: "connected" | "offline_fallback" | "testing" | "error";
  lastSyncTimestamp: string;
  autoSyncUserData: boolean;
  tablesTracked: string[];
}

export type AiProvider = "gemini_embedded" | "byo_gemini" | "byo_openai" | "byo_anthropic" | "byo_ollama";

export interface AiAgentConfig {
  provider: AiProvider;
  customApiKey: string;
  ollamaEndpoint: string;
  modelName: string;
  agentPersona: string;
  tone: "Socratic Mentor" | "Technical Expert" | "Friendly Tutor" | "Exam Coach";
  lmsManualInjected: boolean;
  customSystemPrompt: string;
  temperature: number;
}

export interface SelfHostConfig {
  containerName: string;
  containerPort: number;
  databaseDriver: string;
  enableTelemetry: boolean;
  dockerComposeYaml: string;
  dockerfile: string;
  proxmoxLxcScript: string;
}

export interface BroadcastUpdateEvent {
  id: string;
  courseId: string;
  courseTitle: string;
  version: string;
  changelog: string[];
  timestamp: string;
  instructorName: string;
}
