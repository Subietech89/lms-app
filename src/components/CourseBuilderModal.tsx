import React, { useState } from "react";
import {
  PlusCircle,
  X,
  Layers,
  FileCode2,
  HelpCircle,
  Gamepad2,
  Trash2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Course, CourseModule, ModuleType } from "../types";
import { StorageService } from "../utils/storage";
import { sound } from "../utils/audio";

interface CourseBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated: (course: Course) => void;
}

export const CourseBuilderModal: React.FC<CourseBuilderModalProps> = ({
  isOpen,
  onClose,
  onCourseCreated,
}) => {
  const currentUser = StorageService.getCurrentUser();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("DevOps & Cloud");
  const [thumbnail, setThumbnail] = useState(
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"
  );
  const [estimatedHours, setEstimatedHours] = useState(6);
  const [modules, setModules] = useState<CourseModule[]>([
    {
      id: "mod_new_01",
      title: "Interactive SCORM Micro-Lab",
      type: "scorm",
      description: "Hands-on SCORM simulation with automated CMI state tracking.",
      durationMinutes: 30,
      scormConfig: {
        identifier: "NEW-SCORM-PKG",
        schemaVersion: "1.2",
        masteryScore: 85,
      },
    },
    {
      id: "mod_new_02",
      title: "Comprehensive Quiz Assessment",
      type: "quiz",
      description: "Knowledge verification with instant Socratic feedback.",
      durationMinutes: 15,
      quizData: {
        passingScorePercent: 80,
        timeLimitMinutes: 10,
        questions: [
          {
            id: "q_new_1",
            question: "What is the primary advantage of data sovereignty in self-hosted LMS architectures?",
            options: [
              "Zero external vendor telemetry and complete private database ownership",
              "Slower release cycles",
              "Higher cloud licensing overhead",
              "Restricted learner access",
            ],
            correctAnswerIndex: 0,
            explanation: "Data sovereignty guarantees that user progress, grades, and records stay strictly within private or self-hosted databases.",
          },
        ],
      },
    },
  ]);

  if (!isOpen) return null;

  const handleAddModule = (type: ModuleType) => {
    const newMod: CourseModule = {
      id: `mod_${Date.now()}`,
      title: `New ${type.toUpperCase()} Module`,
      type,
      description: `Description for new ${type} module`,
      durationMinutes: 20,
    };

    if (type === "scorm") {
      newMod.scormConfig = {
        identifier: `SCORM-${Date.now()}`,
        title: newMod.title,
        schemaVersion: "1.2",
        masteryScore: 80,
        startingLocation: "step_0",
      };
    } else if (type === "quiz") {
      newMod.quizData = {
        passingScorePercent: 80,
        timeLimitMinutes: 10,
        questions: [
          {
            id: "q_1",
            question: "Sample assessment question?",
            options: ["Correct Answer", "Option B", "Option C", "Option D"],
            correctAnswerIndex: 0,
            explanation: "Sample explanation note.",
          },
        ],
      };
    } else if (type === "html") {
      newMod.htmlContent = "## Course Notes\n\nEnter comprehensive Markdown & HTML5 lesson notes.";
    } else if (type === "game") {
      newMod.gameData = {
        gameType: "term-match",
        instructions: "Match the concepts correctly.",
        targetScore: 800,
        items: [
          { id: "1", term: "Proxmox", definition: "Open-source virtualization management platform" },
          { id: "2", term: "SCORM", definition: "Sharable Content Object Reference Model standard" },
        ],
      };
    }

    setModules([...modules, newMod]);
  };

  const handleRemoveModule = (idx: number) => {
    setModules(modules.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || modules.length === 0) return;

    const newCourse: Course = {
      id: `course_${Date.now()}`,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title,
      description,
      longOverview: description || "Comprehensive course package built with OpenLMS Sovereign.",
      category,
      level: "Intermediate",
      thumbnail,
      version: "1.0.0",
      releaseDate: new Date().toISOString().split("T")[0],
      estimatedHours,
      rating: 5.0,
      totalStudents: 1,
      instructorName: currentUser.name,
      instructorRole: "Faculty Lead",
      instructorAvatar: currentUser.avatar,
      tags: ["New", category, "Self-Hosted"],
      modules,
    };

    StorageService.saveCourse(newCourse);
    sound.playSuccess();
    onCourseCreated(newCourse);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <PlusCircle className="w-5 h-5" />
            </span>
            <h3 className="font-bold text-white text-base">Create New Sovereign Course Package</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Course Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Advanced Microservices & Docker"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="DevOps & Cloud">DevOps & Cloud</option>
                <option value="Full-Stack Web">Full-Stack Web</option>
                <option value="Security & Sovereignty">Security & Sovereignty</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief course objectives and syllabus..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500 leading-relaxed"
            />
          </div>

          {/* Module Stack Builder */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Course Modules ({modules.length})
              </label>

              {/* Add format buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAddModule("scorm")}
                  className="px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800 text-[11px] font-semibold hover:bg-indigo-900 transition"
                >
                  + SCORM
                </button>
                <button
                  type="button"
                  onClick={() => handleAddModule("html")}
                  className="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800 text-[11px] font-semibold hover:bg-cyan-900 transition"
                >
                  + HTML5
                </button>
                <button
                  type="button"
                  onClick={() => handleAddModule("quiz")}
                  className="px-2.5 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-800 text-[11px] font-semibold hover:bg-amber-900 transition"
                >
                  + Quiz
                </button>
                <button
                  type="button"
                  onClick={() => handleAddModule("game")}
                  className="px-2.5 py-1 rounded-lg bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-800 text-[11px] font-semibold hover:bg-fuchsia-900 transition"
                >
                  + Game
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {modules.map((mod, idx) => (
                <div
                  key={mod.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-slate-500 text-[10px]">0{idx + 1}</span>
                    <span className="font-bold uppercase text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {mod.type}
                    </span>
                    <span className="text-white font-medium">{mod.title}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveModule(idx)}
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-950"
            >
              Save & Package Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
