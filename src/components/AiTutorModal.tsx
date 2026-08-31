import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  BookOpen,
  ShieldCheck,
  RotateCcw,
  Settings,
  HelpCircle,
  Code2,
  Terminal,
} from "lucide-react";
import { Course, CourseModule } from "../types";
import { StorageService } from "../utils/storage";
import { LMS_USER_MANUAL } from "../data/lmsManual";

interface AiTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCourse?: Course | null;
  currentModule?: CourseModule | null;
  onOpenSettings?: () => void;
}

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  source?: string;
}

export const AiTutorModal: React.FC<AiTutorModalProps> = ({
  isOpen,
  onClose,
  currentCourse,
  currentModule,
  onOpenSettings,
}) => {
  const aiConfig = StorageService.getAiConfig();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg_init",
      sender: "ai",
      text: `Hello! I am your official OpenLMS Learning Tutor. I have been configured with the **${aiConfig.agentPersona}** persona and grounded with the **LMS System Manual**.\n\nHow can I help you master ${
        currentCourse ? `"${currentCourse.title}"` : "your coursework"
      } today?`,
      timestamp: "Just now",
      source: "gemini-3.7-flash",
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const quickPrompts = [
    "Explain this concept with an analogy",
    "Quiz me on key principles",
    "Give me a Socratic hint without spoiling",
    "How does SCORM CMI state tracking work?",
  ];

  const handleSendMessage = async (promptToSend?: string) => {
    const text = (promptToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: "usr_" + Date.now(),
      sender: "user",
      text,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt("");
    setIsLoading(true);

    // Formulate course context
    const courseContext = currentCourse
      ? `Active Course: "${currentCourse.title}". Active Module: "${currentModule?.title || "Overview"}" (Type: ${
          currentModule?.type || "General"
        }). Description: "${currentModule?.description || currentCourse.description}".`
      : "The student is exploring the course catalog.";

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text,
          persona: `${aiConfig.agentPersona} (Tone: ${aiConfig.tone})`,
          lmsManual: aiConfig.lmsManualInjected ? LMS_USER_MANUAL : "",
          courseContext,
          customApiKey: aiConfig.customApiKey,
          provider: aiConfig.provider,
        }),
      });

      const data = await res.json();
      const reply = data.reply || data.fallback || "I processed your request.";

      setMessages((prev) => [
        ...prev,
        {
          id: "ai_" + Date.now(),
          sender: "ai",
          text: reply,
          timestamp: "Just now",
          source: data.source,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: "ai_err_" + Date.now(),
          sender: "ai",
          text: `[Offline Fallback Mode]: I am unable to contact the external inference server. ${
            aiConfig.customApiKey ? "Please verify your BYO-AI API key in settings." : "You can configure your Bring-Your-Own-AI key in Admin Settings."
          }\n\nRegarding your question: I recommend reviewing the module checkpoints!`,
          timestamp: "Just now",
          source: "offline_fallback",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm">AI Study Tutor</h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800">
                  {aiConfig.provider === "gemini_embedded" ? "Gemini 3.7" : "BYO-AI Key"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[220px]">
                Persona: {aiConfig.agentPersona}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                title="Configure AI Agent & BYO-AI Keys"
                className="p-2 rounded-xl text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Safety & Persona Badge Ribbon */}
        <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>LMS System Manual Injected</span>
          </span>
          <span className="text-slate-500 font-mono">Zero-Leak Guardrails Active</span>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isAi = msg.sender === "ai";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAi ? "items-start" : "items-start flex-row-reverse"}`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isAi
                      ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40"
                      : "bg-slate-700 text-slate-200"
                  }`}
                >
                  {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[82%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isAi
                      ? "bg-slate-800/90 border border-slate-700/80 text-slate-200"
                      : "bg-indigo-600 text-white shadow-sm"
                  }`}
                >
                  <div className="whitespace-pre-line font-sans">{msg.text}</div>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] opacity-60">
                    <span>{msg.timestamp}</span>
                    {msg.source && <span className="font-mono">{msg.source}</span>}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700/80 text-xs text-indigo-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse delay-75"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse delay-150"></span>
                <span className="text-slate-400 ml-1">Consulting LMS course notes...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp)}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-indigo-950 text-slate-300 hover:text-indigo-200 border border-slate-700 text-[11px] whitespace-nowrap transition"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              id="ai-tutor-input"
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask a question or request a Socratic hint..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              id="ai-tutor-send-btn"
              type="submit"
              disabled={!inputPrompt.trim() || isLoading}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
