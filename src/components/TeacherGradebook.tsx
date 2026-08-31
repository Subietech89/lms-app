import React, { useState } from "react";
import {
  Users,
  BookOpen,
  Trophy,
  Award,
  Radio,
  Send,
  CheckCircle2,
  Clock,
  Search,
  Download,
  Filter,
  Layers,
  FileCode2,
  HelpCircle,
  Gamepad2,
  PlusCircle,
} from "lucide-react";
import { Course, User, UserRole } from "../types";
import { StorageService, PRESET_USERS } from "../utils/storage";

interface TeacherGradebookProps {
  courses: Course[];
  onOpenPushModal: () => void;
  onOpenCourseBuilder: () => void;
  onSelectCourse: (course: Course) => void;
}

export const TeacherGradebook: React.FC<TeacherGradebookProps> = ({
  courses,
  onOpenPushModal,
  onOpenCourseBuilder,
  onSelectCourse,
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || "");
  const [studentSearch, setStudentSearch] = useState<string>("");
  const [announcementText, setAnnouncementText] = useState<string>("");
  const [announcementSent, setAnnouncementSent] = useState<boolean>(false);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const allRegistered = StorageService.getAllRegisteredUsers();
  const allProgress = StorageService.getAllProgress();
  const allCerts = StorageService.getCertificates();

  // Find quiz and scorm module IDs for selected course
  const quizMod = selectedCourse?.modules.find((m) => m.type === "quiz");
  const scormMod = selectedCourse?.modules.find((m) => m.type === "scorm");

  // Read actual registered students without hardcoded progress
  const rawStudentList = allRegistered.filter((u) => u.role === "student");
  const studentList = rawStudentList.length > 0 ? rawStudentList : [PRESET_USERS.student];

  const studentCohort = studentList.map((student) => {
    const prog = StorageService.getProgress(student.id, selectedCourse?.id || "");
    const studentCerts = StorageService.getCertificates(student.id);
    const hasCert = studentCerts.some((c) => c.courseId === selectedCourse?.id);

    // Quiz score
    const quizProgress = quizMod ? prog.moduleProgress[quizMod.id] : undefined;
    const quizScore = quizProgress?.score !== undefined ? quizProgress.score : null;

    // SCORM status
    const scormProgress = scormMod ? prog.moduleProgress[scormMod.id] : undefined;
    let scormStatus = "not started";
    if (scormProgress) {
      if (scormProgress.cmiData?.["cmi.core.lesson_status"]) {
        scormStatus = scormProgress.cmiData["cmi.core.lesson_status"];
      } else if (scormProgress.completed) {
        scormStatus = "passed";
      } else {
        scormStatus = "incomplete";
      }
    }

    return {
      id: student.id,
      name: student.name,
      email: student.email,
      avatar: student.avatar,
      progressPercent: prog.overallPercent || 0,
      quizScore,
      scormStatus,
      gameScore: student.totalPoints || 0,
      hasCert,
      lastActive: student.lastActive || "Just now",
    };
  });

  // Calculate real cohort stats
  const totalEnrolled = studentCohort.length;
  const avgCompletionRate = totalEnrolled > 0
    ? (studentCohort.reduce((sum, s) => sum + s.progressPercent, 0) / totalEnrolled).toFixed(1)
    : "0.0";

  const studentsWithQuiz = studentCohort.filter((s) => s.quizScore !== null);
  const avgQuizScore = studentsWithQuiz.length > 0
    ? (studentsWithQuiz.reduce((sum, s) => sum + (s.quizScore || 0), 0) / studentsWithQuiz.length).toFixed(1) + "%"
    : "No attempts";

  const totalCertsIssued = studentCohort.filter((s) => s.hasCert).length;

  const handleBroadcastAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;

    StorageService.addNotification({
      id: "teacher_announcement_" + Date.now(),
      roleTarget: "student",
      title: `📢 Announcement for ${selectedCourse?.title || "Class"}`,
      message: announcementText,
      type: "announcement",
      timestamp: "Just now",
      read: false,
      payload: { courseId: selectedCourse?.id },
    });

    setAnnouncementText("");
    setAnnouncementSent(true);
    setTimeout(() => setAnnouncementSent(false), 3000);
  };

  const filteredStudents = studentCohort.filter((s) => {
    const q = studentSearch.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
  });

  const currentUser = StorageService.getActiveUser();

  return (
    <div className="space-y-8 pb-16">
      {/* Teacher Welcome & Command Center Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#16191f] via-[#1a1e29] to-[#16191f] border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-blue-500/40 shadow-md"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  Teacher Dashboard: {currentUser.name}
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider border border-blue-500/30">
                  Faculty Lead
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {currentUser.department || "Systems & Cloud Computing"} • Live cohort monitoring & curriculum broadcasting
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenPushModal}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Radio className="w-4 h-4 text-blue-400" />
              <span>Broadcast Update</span>
            </button>

            <button
              onClick={onOpenCourseBuilder}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition shadow-md shadow-emerald-950 flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Course</span>
            </button>
          </div>
        </div>
      </div>

      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Teacher Gradebook & Cohort Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Monitor cohort progress across SCORM packages, assessments, and broadcast live alerts.
          </p>
        </div>
      </div>

      {/* Cohort Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Total Enrolled</p>
          <p className="text-xl font-extrabold text-white mt-1">{totalEnrolled} Active</p>
          <p className="text-[11px] text-indigo-400 mt-1">100% cloud sync</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Avg Completion Rate</p>
          <p className="text-xl font-extrabold text-emerald-400 mt-1">{avgCompletionRate}%</p>
          <p className="text-[11px] text-slate-500 mt-1">Real-time progress tracking</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Avg Assessment Score</p>
          <p className="text-xl font-extrabold text-amber-400 mt-1">{avgQuizScore}</p>
          <p className="text-[11px] text-emerald-400 mt-1">Passing threshold: 80%</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Certificates Awarded</p>
          <p className="text-xl font-extrabold text-purple-400 mt-1">
            {totalCertsIssued} Issued
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Cryptographically verified</p>
        </div>
      </div>

      {/* Quick Announcement Broadcaster */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <h3 className="font-bold text-white text-sm">Broadcast Real-Time Student Announcement</h3>
          </div>
          <span className="text-[11px] text-slate-400">Instantly alerts all enrolled students</span>
        </div>

        <form onSubmit={handleBroadcastAnnouncement} className="flex gap-2">
          <input
            type="text"
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            placeholder="e.g. Please remember to complete the SCORM simulation before tomorrow's lab!"
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={!announcementText.trim()}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Alert</span>
          </button>
        </form>

        {announcementSent && (
          <p className="text-xs text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Real-time announcement broadcasted successfully to all student dashboards!</span>
          </p>
        )}
      </div>

      {/* Student Roster Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-white text-sm">Student Cohort Performance</h3>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search students..."
                className="pl-8 pr-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Course Progress</th>
                <th className="py-3.5 px-4">Quiz Score</th>
                <th className="py-3.5 px-4">SCORM Status</th>
                <th className="py-3.5 px-4">Game Points</th>
                <th className="py-3.5 px-4">Certificate</th>
                <th className="py-3.5 px-4">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 flex items-center gap-3">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
                    />
                    <div>
                      <p className="font-semibold text-white">{student.name}</p>
                      <p className="text-[11px] text-slate-500">{student.email}</p>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="w-28 space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span>{student.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5">
                        <div
                          className="bg-indigo-500 h-full rounded-full"
                          style={{ width: `${student.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                    {student.quizScore !== null ? `${student.quizScore}%` : <span className="text-slate-500 font-normal text-xs">—</span>}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${
                        student.scormStatus === "passed"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : student.scormStatus === "incomplete"
                          ? "bg-amber-950 text-amber-400 border border-amber-800"
                          : "bg-slate-800/80 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {student.scormStatus}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-fuchsia-300 font-semibold">
                    {student.gameScore} pts
                  </td>

                  <td className="py-3.5 px-4">
                    {student.hasCert ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-medium">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="text-slate-500">In Progress</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                    {student.lastActive}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
