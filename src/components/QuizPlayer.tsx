import React, { useState, useEffect } from "react";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Award,
  ChevronRight,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { CourseModule, QuizData, QuizQuestion } from "../types";
import { sound } from "../utils/audio";

interface QuizPlayerProps {
  module: CourseModule;
  courseTitle: string;
  onComplete: (score: number) => void;
  savedScore?: number;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({
  module,
  courseTitle,
  onComplete,
  savedScore,
}) => {
  const quizData: QuizData = module.quizData || {
    passingScorePercent: 80,
    timeLimitMinutes: 10,
    questions: [],
  };

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<number, boolean>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(savedScore !== undefined ? savedScore : null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(
    (quizData.timeLimitMinutes || 10) * 60
  );

  const questions = quizData.questions;
  const currentQ: QuizQuestion | undefined = questions[currentQuestionIdx];

  // Timer
  useEffect(() => {
    if (isQuizSubmitted) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isQuizSubmitted]);

  const handleSelectOption = (optionIdx: number) => {
    if (submittedQuestions[currentQuestionIdx] || isQuizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestionIdx]: optionIdx }));
  };

  const handleCheckCurrentAnswer = () => {
    if (selectedAnswers[currentQuestionIdx] === undefined) return;
    setSubmittedQuestions((prev) => ({ ...prev, [currentQuestionIdx]: true }));

    const isCorrect = selectedAnswers[currentQuestionIdx] === currentQ?.correctAnswerIndex;
    if (isCorrect) {
      sound.playSuccess();
    } else {
      sound.playIncorrect();
    }
  };

  const handleSubmitQuiz = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) {
        correctCount++;
      }
    });

    const scorePercent = Math.round((correctCount / (questions.length || 1)) * 100);
    setFinalScore(scorePercent);
    setIsQuizSubmitted(true);

    const passed = scorePercent >= quizData.passingScorePercent;
    if (passed) {
      sound.playSuccess();
      onComplete(scorePercent);
    } else {
      sound.playIncorrect();
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setSubmittedQuestions({});
    setIsQuizSubmitted(false);
    setFinalScore(null);
    setCurrentQuestionIdx(0);
    setSecondsRemaining((quizData.timeLimitMinutes || 10) * 60);
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const passed = (finalScore || 0) >= quizData.passingScorePercent;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                Knowledge Check Assessment
              </span>
              <span className="text-xs text-slate-400">
                Pass Threshold: {quizData.passingScorePercent}%
              </span>
            </div>
            <h3 className="font-bold text-white text-base mt-0.5">{module.title}</h3>
          </div>
        </div>

        {/* Timer & Progress */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          {!isQuizSubmitted && (
            <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center gap-2 font-mono text-slate-300">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>
                {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
              </span>
            </div>
          )}

          {finalScore !== null && (
            <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center gap-1.5">
              <span className="text-slate-400">Score:</span>
              <span className={`font-mono font-bold ${passed ? "text-emerald-400" : "text-rose-400"}`}>
                {finalScore}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quiz Body */}
      {!isQuizSubmitted && currentQ ? (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
          {/* Question Counter */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
            <span className="text-slate-400 font-semibold">
              Question {currentQuestionIdx + 1} of {questions.length}
            </span>
            <div className="flex gap-1.5">
              {questions.map((_, i) => (
                <span
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition ${
                    selectedAnswers[i] !== undefined
                      ? "bg-indigo-500"
                      : i === currentQuestionIdx
                      ? "bg-amber-400 ring-2 ring-amber-400/40"
                      : "bg-slate-800"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-3">
            <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
              {currentQ.question}
            </h4>

            {currentQ.codeSnippet && (
              <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto">
                <code>{currentQ.codeSnippet}</code>
              </pre>
            )}
          </div>

          {/* Options */}
          <div className="space-y-2.5 pt-2">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedAnswers[currentQuestionIdx] === idx;
              const isSubmitted = submittedQuestions[currentQuestionIdx];
              const isCorrect = idx === currentQ.correctAnswerIndex;

              let style = "bg-slate-950 border-slate-800 text-slate-300 hover:border-indigo-500/50 hover:bg-slate-800/40";
              if (isSelected) {
                style = "bg-indigo-950/70 border-indigo-500 text-white ring-1 ring-indigo-500/40";
              }

              if (isSubmitted) {
                if (isCorrect) {
                  style = "bg-emerald-950/80 border-emerald-500 text-emerald-200";
                } else if (isSelected && !isCorrect) {
                  style = "bg-rose-950/80 border-rose-500 text-rose-200";
                }
              }

              return (
                <button
                  key={idx}
                  id={`quiz-option-${idx}`}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition flex items-start justify-between gap-3 ${style}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-md bg-slate-800/80 text-slate-400 font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {isSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                  {isSubmitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>

          {/* Explanation Box (when submitted or checked) */}
          {submittedQuestions[currentQuestionIdx] && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1 animate-in fade-in">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Explanation & Learning Note:
              </span>
              <p className="text-slate-300 leading-relaxed">{currentQ.explanation}</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentQuestionIdx(Math.max(0, currentQuestionIdx - 1))}
              disabled={currentQuestionIdx === 0}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold disabled:opacity-40 transition"
            >
              Previous
            </button>

            <div className="flex items-center gap-2">
              {!submittedQuestions[currentQuestionIdx] ? (
                <button
                  id="check-answer-btn"
                  onClick={handleCheckCurrentAnswer}
                  disabled={selectedAnswers[currentQuestionIdx] === undefined}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 text-xs font-semibold disabled:opacity-40 transition"
                >
                  Check Answer
                </button>
              ) : null}

              {currentQuestionIdx < questions.length - 1 ? (
                <button
                  id="next-question-btn"
                  onClick={() => setCurrentQuestionIdx(currentQuestionIdx + 1)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  id="submit-quiz-btn"
                  onClick={handleSubmitQuiz}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold transition shadow-lg shadow-indigo-950"
                >
                  Submit Assessment
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-8 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
            {passed ? <Award className="w-8 h-8 text-amber-400" /> : <AlertCircle className="w-8 h-8 text-rose-400" />}
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-white">
              {passed ? "Assessment Passed!" : "Assessment Incomplete"}
            </h3>
            <p className="text-xs text-slate-400">
              {passed
                ? "You demonstrated mastery on all core concepts. Your progress is saved to the database."
                : `You scored ${finalScore}%, which is below the ${quizData.passingScorePercent}% threshold. You can retake the assessment to earn full credit.`}
            </p>
          </div>

          <div className="inline-block p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-center">
            <p className="text-xs text-slate-500">Your Final Score</p>
            <p className={`text-3xl font-extrabold ${passed ? "text-emerald-400" : "text-rose-400"}`}>
              {finalScore}%
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRetake}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Assessment</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
