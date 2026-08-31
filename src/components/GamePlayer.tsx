import React, { useState, useEffect } from "react";
import {
  Gamepad2,
  Trophy,
  Flame,
  RotateCcw,
  Sparkles,
  Zap,
  Timer,
  CheckCircle2,
} from "lucide-react";
import { CourseModule, GameData, GameItem } from "../types";
import { sound } from "../utils/audio";

interface GamePlayerProps {
  module: CourseModule;
  courseTitle: string;
  onComplete: (score: number) => void;
  savedScore?: number;
}

export const GamePlayer: React.FC<GamePlayerProps> = ({
  module,
  courseTitle,
  onComplete,
  savedScore,
}) => {
  const gameData: GameData = module.gameData || {
    gameType: "term-match",
    instructions: "Match the corresponding terminology with their definitions.",
    targetScore: 1000,
    items: [],
  };

  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [selectedDef, setSelectedDef] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [isGameFinished, setIsGameFinished] = useState<boolean>(false);

  // Shuffle terms and definitions separately
  const [shuffledTerms, setShuffledTerms] = useState<GameItem[]>([]);
  const [shuffledDefs, setShuffledDefs] = useState<GameItem[]>([]);

  useEffect(() => {
    initGame();
  }, [module]);

  const initGame = () => {
    const items = [...gameData.items];
    setShuffledTerms([...items].sort(() => Math.random() - 0.5));
    setShuffledDefs([...items].sort(() => Math.random() - 0.5));
    setMatchedIds([]);
    setSelectedTerm(null);
    setSelectedDef(null);
    setScore(0);
    setCombo(1);
    setTimerSeconds(60);
    setIsGameFinished(false);
  };

  // Game countdown timer
  useEffect(() => {
    if (isGameFinished) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameFinished, matchedIds]);

  const handleSelectTerm = (id: string) => {
    if (matchedIds.includes(id) || isGameFinished) return;
    setSelectedTerm(id);
    if (selectedDef) {
      evaluateMatch(id, selectedDef);
    }
  };

  const handleSelectDef = (id: string) => {
    if (matchedIds.includes(id) || isGameFinished) return;
    setSelectedDef(id);
    if (selectedTerm) {
      evaluateMatch(selectedTerm, id);
    }
  };

  const evaluateMatch = (termId: string, defId: string) => {
    if (termId === defId) {
      // Match found!
      sound.playSuccess();
      const pointsAwarded = 200 * combo;
      setScore((prev) => prev + pointsAwarded);
      setCombo((prev) => Math.min(5, prev + 1));
      setMatchedIds((prev) => {
        const updated = [...prev, termId];
        if (updated.length === gameData.items.length) {
          setTimeout(() => finishGame(score + pointsAwarded), 500);
        }
        return updated;
      });
    } else {
      // Mismatch
      sound.playIncorrect();
      setCombo(1);
      setScore((prev) => Math.max(0, prev - 50));
    }
    setSelectedTerm(null);
    setSelectedDef(null);
  };

  const finishGame = (finalCalculatedScore?: number) => {
    setIsGameFinished(true);
    const finalVal = finalCalculatedScore !== undefined ? finalCalculatedScore : score;
    sound.playFanfare();
    onComplete(finalVal);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-800">
                Active Recall Mini-Game
              </span>
              <span className="text-xs text-slate-400">Target Score: {gameData.targetScore}</span>
            </div>
            <h3 className="font-bold text-white text-base mt-0.5">{module.title}</h3>
          </div>
        </div>

        {/* Score & Combo HUD */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center gap-1.5">
            <Timer className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-slate-200">{timerSeconds}s</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-rose-400" />
            <span className="font-mono text-rose-300 font-bold">{combo}x Combo</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-xs flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="font-mono font-bold text-white">{score} pts</span>
          </div>
        </div>
      </div>

      {/* Game Canvas */}
      {!isGameFinished ? (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs text-slate-400">
            <span>{gameData.instructions}</span>
            <span className="font-mono text-indigo-400">
              Matched: {matchedIds.length}/{gameData.items.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Terms */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Select Term
              </h4>
              {shuffledTerms.map((item) => {
                const isMatched = matchedIds.includes(item.id);
                const isSelected = selectedTerm === item.id;

                return (
                  <button
                    key={item.id}
                    id={`game-term-${item.id}`}
                    onClick={() => handleSelectTerm(item.id)}
                    disabled={isMatched}
                    className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm font-semibold transition ${
                      isMatched
                        ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300 opacity-60 cursor-default"
                        : isSelected
                        ? "bg-indigo-950 border-indigo-500 text-white ring-2 ring-indigo-500/40 scale-[1.02]"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{item.term}</span>
                      {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Definitions */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Select Matching Definition
              </h4>
              {shuffledDefs.map((item) => {
                const isMatched = matchedIds.includes(item.id);
                const isSelected = selectedDef === item.id;

                return (
                  <button
                    key={item.id}
                    id={`game-def-${item.id}`}
                    onClick={() => handleSelectDef(item.id)}
                    disabled={isMatched}
                    className={`w-full p-3.5 rounded-xl border text-left text-xs leading-relaxed transition ${
                      isMatched
                        ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300 opacity-60 cursor-default"
                        : isSelected
                        ? "bg-indigo-950 border-indigo-500 text-white ring-2 ring-indigo-500/40 scale-[1.02]"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span>{item.definition}</span>
                      {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Game Over Ribbon */
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-8 text-center space-y-6 shadow-xl animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-white">Challenge Completed!</h3>
            <p className="text-xs text-slate-400">
              You matched {matchedIds.length} concepts and earned points for your student profile.
            </p>
          </div>

          <div className="inline-block p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-center">
            <p className="text-xs text-slate-500">Total Mastery Score</p>
            <p className="text-3xl font-extrabold text-fuchsia-400">{score} PTS</p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={initGame}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
