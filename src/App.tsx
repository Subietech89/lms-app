import React, { useState, useEffect } from "react";
import { Course, CourseModule, UserRole, User, Certificate, WebsiteSettings, LmsNotification } from "./types";
import { StorageService } from "./utils/storage";
import { applyThemeVariables } from "./utils/theme";
import { Navbar } from "./components/Navbar";
import { LoginScreen } from "./components/LoginScreen";
import { NotificationCenter } from "./components/NotificationCenter";
import { CourseCatalog } from "./components/CourseCatalog";
import { CoursePlayer } from "./components/CoursePlayer";
import { TeacherGradebook } from "./components/TeacherGradebook";
import { AdminSettings } from "./components/AdminSettings";
import { AiTutorModal } from "./components/AiTutorModal";
import { CertificateModal } from "./components/CertificateModal";
import { CoursePushModal } from "./components/CoursePushModal";
import { CourseBuilderModal } from "./components/CourseBuilderModal";
import { AuthModal } from "./components/AuthModal";
import { WebPortalShareModal } from "./components/WebPortalShareModal";
import { Award, BookOpen, Sparkles, CheckCircle2 } from "lucide-react";

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => StorageService.isAuthenticated());
  const [currentRole, setCurrentRole] = useState<UserRole>(StorageService.getRole());
  const [activeView, setActiveView] = useState<"catalog" | "course" | "gradebook" | "admin" | "certificates">(() => {
    const role = StorageService.getRole();
    if (role === "admin") return "admin";
    if (role === "teacher") return "gradebook";
    return "catalog";
  });
  const [courses, setCourses] = useState<Course[]>(() => StorageService.getCourses() || []);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings>(() => StorageService.getWebsiteSettings());
  const [notifications, setNotifications] = useState<LmsNotification[]>(() => StorageService.getNotifications() || []);

  // Modals
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAiTutorOpen, setIsAiTutorOpen] = useState(false);
  const [activeTutorModule, setActiveTutorModule] = useState<CourseModule | null>(null);
  const [activeCertificate, setActiveCertificate] = useState<Certificate | null>(null);
  const [certCourse, setCertCourse] = useState<Course | null>(null);
  const [isPushModalOpen, setIsPushModalOpen] = useState(false);
  const [isBuilderModalOpen, setIsBuilderModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSharePortalModalOpen, setIsSharePortalModalOpen] = useState(false);

  // Real-time broadcast notice
  const [latestBroadcast, setLatestBroadcast] = useState<{
    courseId: string;
    courseTitle: string;
    version: string;
    message: string;
  } | null>(null);

  const refreshNotifications = () => {
    setNotifications(StorageService.getNotifications() || []);
  };

  // Apply CSS theme variables whenever websiteSettings change
  useEffect(() => {
    applyThemeVariables(websiteSettings);
    // Update browser title
    if (websiteSettings.siteName) {
      document.title = `${websiteSettings.siteName} • Web LMS`;
    }
  }, [websiteSettings]);

  // Handle URL deep-linking for Google Sites & Microsoft embeds (e.g. ?course=c1 or ?view=catalog)
  useEffect(() => {
    if (typeof window !== "undefined" && isAuthenticated) {
      const params = new URLSearchParams(window.location.search);
      const courseParam = params.get("course");
      const viewParam = params.get("view");

      if (courseParam && courses.length > 0) {
        const found = courses.find((c) => c.id === courseParam);
        if (found) {
          setSelectedCourse(found);
          setActiveView("course");
        }
      } else if (viewParam && ["catalog", "course", "gradebook", "admin", "certificates"].includes(viewParam)) {
        setActiveView(viewParam as "catalog" | "course" | "gradebook" | "admin" | "certificates");
      }
    }
  }, [courses, isAuthenticated]);

  // Login handler: open dashboard based on access level
  const handleLoginSuccess = (user: User) => {
    setIsAuthenticated(true);
    setCurrentRole(user.role);
    if (user.role === "admin") {
      setActiveView("admin");
    } else if (user.role === "teacher") {
      setActiveView("gradebook");
    } else {
      setActiveView("catalog");
    }
    setSelectedCourse(null);
  };

  // Logout handler
  const handleLogout = () => {
    StorageService.logout();
    setIsAuthenticated(false);
    setActiveView("catalog");
    setSelectedCourse(null);
  };

  // Sync role changes
  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    StorageService.setCurrentRole(newRole);
    if (newRole === "admin") {
      setActiveView("admin");
    } else if (newRole === "teacher") {
      setActiveView("gradebook");
    } else {
      setActiveView("catalog");
    }
    setSelectedCourse(null);
  };

  const handleUpdateWebsiteSettings = (newSettings: WebsiteSettings) => {
    setWebsiteSettings(newSettings);
    StorageService.saveWebsiteSettings(newSettings);
    applyThemeVariables(newSettings);
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    setActiveView("course");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenCertificate = (course: Course) => {
    const currentUser = StorageService.getActiveUser();
    const certs = StorageService.getCertificates(currentUser.id);
    const existingCert = certs.find((c) => c.courseId === course.id);

    if (existingCert) {
      setActiveCertificate(existingCert);
      setCertCourse(course);
    } else {
      // Generate certificate for completed course
      const newCert = StorageService.issueCertificate(
        currentUser.id,
        currentUser.name,
        course.id,
        course.title,
        course.instructorName,
        100
      );
      setActiveCertificate(newCert);
      setCertCourse(course);
    }
  };

  const handleOpenAiTutorWithModule = (module?: CourseModule) => {
    if (module) setActiveTutorModule(module);
    setIsAiTutorOpen(true);
  };

  const handleCoursePushed = (broadcastInfo: {
    courseId: string;
    courseTitle: string;
    version: string;
    message: string;
  }) => {
    setCourses(StorageService.getCourses());
    setLatestBroadcast(broadcastInfo);
  };

  const activeUser = StorageService.getActiveUser();
  const unreadNotifications = (notifications || []).filter((n) => n && !n.read).length;
  const userCerts = StorageService.getCertificates(activeUser?.id) || [];

  // When user is not authenticated, launch the Login Interface first
  if (!isAuthenticated) {
    return (
      <LoginScreen
        websiteSettings={websiteSettings}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-200 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Top Navigation Bar with Dynamic Branding & Quick Controls */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        activeView={activeView}
        onViewChange={(v) => {
          setActiveView(v);
          if (v === "catalog") setSelectedCourse(null);
        }}
        onOpenAiTutor={() => setIsAiTutorOpen(true)}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        unreadCount={unreadNotifications}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        websiteSettings={websiteSettings}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenSharePortalModal={() => setIsSharePortalModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeView === "catalog" && (
          <CourseCatalog
            courses={courses}
            onSelectCourse={handleSelectCourse}
            onOpenCertificate={handleOpenCertificate}
            currentRole={currentRole}
            searchQuery={searchQuery}
            onOpenCourseBuilder={() => setIsBuilderModalOpen(true)}
            onOpenPushModal={() => setIsPushModalOpen(true)}
            websiteSettings={websiteSettings}
            onOpenSharePortalModal={() => setIsSharePortalModalOpen(true)}
            latestBroadcast={latestBroadcast}
            onDismissBroadcast={() => setLatestBroadcast(null)}
          />
        )}

        {activeView === "course" && selectedCourse && (
          <CoursePlayer
            course={selectedCourse}
            onBack={() => {
              setActiveView("catalog");
              setSelectedCourse(null);
            }}
            onOpenCertificate={handleOpenCertificate}
            onOpenAiTutor={handleOpenAiTutorWithModule}
          />
        )}

        {activeView === "gradebook" && (
          <TeacherGradebook
            courses={courses}
            onOpenPushModal={() => setIsPushModalOpen(true)}
            onOpenCourseBuilder={() => setIsBuilderModalOpen(true)}
            onSelectCourse={handleSelectCourse}
          />
        )}

        {activeView === "admin" && (
          <AdminSettings
            courses={courses}
            onOpenPushModal={() => setIsPushModalOpen(true)}
            onRefreshCourses={() => setCourses(StorageService.getCourses())}
            websiteSettings={websiteSettings}
            onUpdateWebsiteSettings={handleUpdateWebsiteSettings}
            onOpenSharePortalModal={() => setIsSharePortalModalOpen(true)}
          />
        )}

        {/* Certificates View */}
        {activeView === "certificates" && (
          <div className="space-y-6 pb-16 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
                  <Award className="w-6 h-6 text-amber-400" />
                  <span>My Verified Certificates</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Tamper-evident cryptographically signed course credentials earned on {websiteSettings.siteName || "Nexus Academy"}.
                </p>
              </div>
              <button
                onClick={() => setActiveView("catalog")}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 transition"
              >
                Back to Courses
              </button>
            </div>

            {userCerts.length === 0 ? (
              <div className="text-center py-20 bg-[#16191f]/40 rounded-2xl border border-white/5 space-y-3">
                <Award className="w-12 h-12 mx-auto text-slate-600" />
                <h3 className="text-base font-semibold text-slate-300">No Certificates Earned Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Complete all modules, quizzes, and SCORM labs in any course to instantly receive your verifiable digital diploma.
                </p>
                <button
                  onClick={() => setActiveView("catalog")}
                  className="mt-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition"
                >
                  Explore Course Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userCerts.map((cert) => {
                  const matchedCourse = courses.find((c) => c.id === cert.courseId);
                  return (
                    <div
                      key={cert.id}
                      className="p-5 rounded-2xl bg-[#16191f] border border-white/10 hover:border-amber-500/40 transition space-y-4 shadow-xl"
                    >
                      <div className="flex items-start justify-between">
                        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Award className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-emerald-400 border border-white/5">
                          Grade: {cert.gradeScore}%
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-white text-base leading-tight">
                          {cert.courseTitle}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Instructor: {cert.instructorName}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Issued: {new Date(cert.issueDate).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]">
                          ID: {cert.id}
                        </span>
                        <button
                          onClick={() => {
                            setActiveCertificate(cert);
                            if (matchedCourse) setCertCourse(matchedCourse);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/20 transition"
                        >
                          View Diploma
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Global Modals & Drawers */}
      <NotificationCenter
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onRefreshNotifications={refreshNotifications}
        onSelectCourse={(courseId) => {
          const target = courses.find((c) => c.id === courseId);
          if (target) {
            handleSelectCourse(target);
            setIsNotificationOpen(false);
          }
        }}
      />

      <AiTutorModal
        isOpen={isAiTutorOpen}
        onClose={() => {
          setIsAiTutorOpen(false);
          setActiveTutorModule(null);
        }}
        currentCourse={selectedCourse}
        currentModule={activeTutorModule}
        onOpenSettings={() => {
          setIsAiTutorOpen(false);
          setActiveView("admin");
        }}
      />

      <CertificateModal
        certificate={activeCertificate}
        course={certCourse}
        onClose={() => {
          setActiveCertificate(null);
          setCertCourse(null);
        }}
      />

      <CoursePushModal
        isOpen={isPushModalOpen}
        onClose={() => setIsPushModalOpen(false)}
        courses={courses}
        onCoursePushed={handleCoursePushed}
      />

      <CourseBuilderModal
        isOpen={isBuilderModalOpen}
        onClose={() => setIsBuilderModalOpen(false)}
        onCourseCreated={(newC) => {
          setCourses(StorageService.getCourses());
          handleSelectCourse(newC);
        }}
      />

      {/* Web Portal Authentication & Account Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        websiteSettings={websiteSettings}
        onUserChanged={(user) => {
          setCurrentRole(user.role);
          StorageService.setCurrentRole(user.role);
        }}
      />

      {/* Web Portal Share & Link Launcher Modal */}
      <WebPortalShareModal
        isOpen={isSharePortalModalOpen}
        onClose={() => setIsSharePortalModalOpen(false)}
        websiteSettings={websiteSettings}
        courses={courses}
      />
    </div>
  );
}

export default App;
