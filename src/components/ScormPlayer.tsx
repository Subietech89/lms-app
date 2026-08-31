import React, { useState, useEffect } from "react";
import {
  Layers,
  Play,
  RotateCcw,
  CheckCircle,
  CheckCircle2,
  Terminal,
  Activity,
  Award,
  ChevronRight,
  Shield,
  Server,
  Zap,
  Info,
} from "lucide-react";
import { CourseModule, CmiDataModel } from "../types";
import { sound } from "../utils/audio";

interface ScormPlayerProps {
  module: CourseModule;
  courseTitle: string;
  onComplete: (score: number, cmiData: any) => void;
  savedCmiData?: Partial<CmiDataModel>;
}

export const ScormPlayer: React.FC<ScormPlayerProps> = ({
  module,
  courseTitle,
  onComplete,
  savedCmiData,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [cmiState, setCmiState] = useState<CmiDataModel>({
    "cmi.core.lesson_status": savedCmiData?.["cmi.core.lesson_status"] || "incomplete",
    "cmi.core.lesson_location": savedCmiData?.["cmi.core.lesson_location"] || "step_0",
    "cmi.core.score.raw": savedCmiData?.["cmi.core.score.raw"] || 0,
    "cmi.core.score.min": 0,
    "cmi.core.score.max": 100,
    "cmi.core.session_time": "00:00:00",
    "cmi.core.total_time": savedCmiData?.["cmi.core.total_time"] || "00:00:00",
    "cmi.core.exit": "",
    "cmi.suspend_data": savedCmiData?.["cmi.suspend_data"] || '{"cluster_health":"ok","replica_count":3}',
  });

  const [showCmiInspector, setShowCmiInspector] = useState(false);
  const [simulatedClusterPods, setSimulatedClusterPods] = useState(3);
  const [ingressPath, setIngressPath] = useState("/api/v1");
  const [tlsEnabled, setTlsEnabled] = useState(true);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Initialize SCORM API in window
  useEffect(() => {
    const scorm12API = {
      LMSInitialize: () => "true",
      LMSFinish: () => "true",
      LMSGetValue: (element: keyof CmiDataModel) => cmiState[element] || "",
      LMSSetValue: (element: keyof CmiDataModel, val: any) => {
        setCmiState((prev) => ({ ...prev, [element]: val }));
        return "true";
      },
      LMSCommit: () => "true",
      LMSGetLastError: () => "0",
      LMSGetDiagnostic: () => "No error",
    };

    (window as any).API = scorm12API;
    (window as any).API_1484_11 = scorm12API;

    return () => {
      delete (window as any).API;
      delete (window as any).API_1484_11;
    };
  }, [cmiState]);

  const steps = [
    {
      title: "1. Cluster Ingress & Topology Init",
      desc: "Configure your sovereign cluster ingress route and enable TLS termination.",
    },
    {
      title: "2. Zero-Trust Pod Scaling & Replication",
      desc: "Scale microservice pod replicas and simulate high-throughput traffic load.",
    },
    {
      title: "3. Health Check & SCORM CMI Verification",
      desc: "Execute automated cluster diagnostics, validate latency, and commit SCORM runtime state.",
    },
  ];

  const handleRunVerification = () => {
    setIsVerifying(true);
    setTestResult(null);

    setTimeout(() => {
      setIsVerifying(false);
      const calculatedScore = tlsEnabled && simulatedClusterPods >= 3 ? 95 : 75;
      const passed = calculatedScore >= (module.scormConfig?.masteryScore || 80);

      const updatedCmi: CmiDataModel = {
        ...cmiState,
        "cmi.core.lesson_status": passed ? "passed" : "incomplete",
        "cmi.core.score.raw": calculatedScore,
        "cmi.core.lesson_location": "step_finished",
        "cmi.suspend_data": JSON.stringify({
          tlsEnabled,
          ingressPath,
          pods: simulatedClusterPods,
          timestamp: new Date().toISOString(),
        }),
      };

      setCmiState(updatedCmi);
      setTestResult(
        passed
          ? `🎉 Simulation Passed with score ${calculatedScore}/100! Ingress controller and sovereign pods verified.`
          : `⚠️ Score ${calculatedScore}/100 below mastery threshold (80%). Ensure TLS is enabled and pods >= 3.`
      );

      if (passed) {
        sound.playSuccess();
        onComplete(calculatedScore, updatedCmi);
      } else {
        sound.playIncorrect();
      }
    }, 1200);
  };

  const isCompleted = cmiState["cmi.core.lesson_status"] === "passed" || cmiState["cmi.core.lesson_status"] === "completed";

  return (
    <div className="space-y-6">
      {/* SCORM Runtime Header Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                SCORM {module.scormConfig?.schemaVersion || "1.2"} Package
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {module.scormConfig?.identifier}
              </span>
            </div>
            <h3 className="font-bold text-white text-base mt-0.5">{module.title}</h3>
          </div>
        </div>

        {/* CMI Status Pills & Inspector Toggle */}
        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center gap-2">
            <span className="text-slate-400">CMI Status:</span>
            <span
              className={`font-semibold capitalize ${
                isCompleted
                  ? "text-emerald-400"
                  : cmiState["cmi.core.lesson_status"] === "failed"
                  ? "text-rose-400"
                  : "text-amber-400"
              }`}
            >
              {cmiState["cmi.core.lesson_status"]}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center gap-2">
            <span className="text-slate-400">Score:</span>
            <span className="font-mono font-bold text-indigo-400">
              {cmiState["cmi.core.score.raw"]}/100
            </span>
          </div>

          <button
            id="toggle-cmi-inspector-btn"
            onClick={() => setShowCmiInspector(!showCmiInspector)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition"
            title="Inspect SCORM CMI Data Model"
          >
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">CMI Inspector</span>
          </button>
        </div>
      </div>

      {/* CMI Real-Time Debug Drawer (Collapsible) */}
      {showCmiInspector && (
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-indigo-400 pb-2 border-b border-slate-800">
            <span className="font-bold flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              window.API / CMI 1.2 Data Model Inspector
            </span>
            <span className="text-[10px] text-slate-500">Live Synchronized</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 text-[11px]">
            <p><span className="text-slate-500">cmi.core.lesson_status:</span> <span className="text-emerald-400">"{cmiState["cmi.core.lesson_status"]}"</span></p>
            <p><span className="text-slate-500">cmi.core.score.raw:</span> <span className="text-indigo-400">{cmiState["cmi.core.score.raw"]}</span></p>
            <p><span className="text-slate-500">cmi.core.lesson_location:</span> <span>"{cmiState["cmi.core.lesson_location"]}"</span></p>
            <p><span className="text-slate-500">cmi.core.session_time:</span> <span>"{cmiState["cmi.core.session_time"]}"</span></p>
            <p className="col-span-1 md:col-span-2 truncate"><span className="text-slate-500">cmi.suspend_data:</span> <span className="text-amber-300">{cmiState["cmi.suspend_data"]}</span></p>
          </div>
        </div>
      )}

      {/* Interactive Simulation Workspace */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-6 shadow-xl">
        {/* Step Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-slate-800 pb-4">
          {steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`p-3 rounded-xl text-left text-xs transition border ${
                currentStep === idx
                  ? "bg-indigo-950/60 border-indigo-500/50 text-white shadow-sm"
                  : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <p className="font-semibold text-slate-200">{s.title}</p>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{s.desc}</p>
            </button>
          ))}
        </div>

        {/* Step 1 Content: Ingress Setup */}
        {currentStep === 0 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <h4 className="font-bold text-white text-sm">Step 1: Configure Sovereign Ingress Route</h4>
            <p className="text-xs text-slate-400">
              Set up the root path for external client traffic and enable TLS encryption for data sovereignty.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Ingress Route Path</label>
                <input
                  type="text"
                  value={ingressPath}
                  onChange={(e) => setIngressPath(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">TLS Termination & mTLS</label>
                <button
                  type="button"
                  onClick={() => setTlsEnabled(!tlsEnabled)}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between border transition ${
                    tlsEnabled
                      ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                      : "bg-slate-950 border-slate-800 text-slate-400"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    {tlsEnabled ? "Enabled (Encrypted)" : "Disabled (Plaintext)"}
                  </span>
                  <span>{tlsEnabled ? "✓ Active" : "Toggle"}</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <span>Continue to Pod Scaling</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2 Content: Pod Scaling */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <h4 className="font-bold text-white text-sm">Step 2: Scale Microservice Pod Replicas</h4>
            <p className="text-xs text-slate-400">
              Increase the replica count to ensure high availability and resilient failover across your private Proxmox cluster.
            </p>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Desired Pod Replicas:</span>
                <span className="font-mono font-bold text-indigo-400 text-sm">{simulatedClusterPods} Replicas</span>
              </div>
              <input
                type="range"
                min={1}
                max={8}
                value={simulatedClusterPods}
                onChange={(e) => setSimulatedClusterPods(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />

              {/* Visual Pod Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-2">
                {Array.from({ length: simulatedClusterPods }).map((_, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-center animate-in zoom-in-90"
                  >
                    <Server className="w-4 h-4 mx-auto text-indigo-400" />
                    <span className="text-[9px] font-mono text-indigo-300 block mt-1">pod-{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-3">
              <button
                onClick={() => setCurrentStep(0)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <span>Continue to Verification</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 Content: Health Check & SCORM Commit */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <h4 className="font-bold text-white text-sm">Step 3: Run Diagnostic & Commit SCORM State</h4>
            <p className="text-xs text-slate-400">
              Execute runtime latency probes, verify zero-trust policies, and commit the SCORM mastery score to your database.
            </p>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span>Simulation Parameters:</span>
                <span className="text-indigo-400">Mastery Req: {module.scormConfig?.masteryScore || 80}%</span>
              </div>
              <div className="space-y-1 text-slate-300 text-[11px]">
                <p>• Ingress Target: <span className="text-indigo-300">{ingressPath}</span></p>
                <p>• Pod Replicas: <span className="text-indigo-300">{simulatedClusterPods} instances</span></p>
                <p>• mTLS Encryption: <span className={tlsEnabled ? "text-emerald-400" : "text-rose-400"}>{tlsEnabled ? "Active" : "Disabled"}</span></p>
              </div>
            </div>

            {testResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                  isCompleted
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                    : "bg-amber-950/40 border-amber-500/40 text-amber-200"
                }`}
              >
                {testResult}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Back
              </button>

              <button
                id="verify-scorm-btn"
                onClick={handleRunVerification}
                disabled={isVerifying}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold flex items-center gap-2 transition shadow-lg shadow-indigo-950 disabled:opacity-50"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>{isVerifying ? "Verifying Diagnostics..." : "Run Test & Commit SCORM"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
