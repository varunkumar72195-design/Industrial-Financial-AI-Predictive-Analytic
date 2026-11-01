import React, { useState } from 'react';
import {
  Code2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Award,
  Sparkles,
  BookOpen,
  Terminal,
} from 'lucide-react';
import { PYTHON_PRACTICE_QUESTIONS } from '../../data/quizQuestions';

export const PythonQuizModule: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentQ = PYTHON_PRACTICE_QUESTIONS[currentIndex];
  const totalQuestions = PYTHON_PRACTICE_QUESTIONS.length;

  const currentSelected = selectedAnswers[currentQ.id];
  const isAnswered = currentSelected !== undefined;
  const isCorrect = currentSelected === currentQ.correctOptionId;

  const handleSelectOption = (optionId: string) => {
    if (selectedAnswers[currentQ.id]) return; // lock once answered
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQ.id]: optionId,
    });
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsSubmitted(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setIsSubmitted(false);
  };

  // Calculate score
  const score = PYTHON_PRACTICE_QUESTIONS.reduce((acc, q) => {
    return selectedAnswers[q.id] === q.correctOptionId ? acc + 1 : acc;
  }, 0);
  const percentage = Math.round((score / totalQuestions) * 100);

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-[#0e172a] border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              MODULE 06
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Technical Skill Assessment
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Python for Data Science & ML Practice Quiz
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Test and sharpen core Python concepts: NumPy indexing & vectorized masking, pandas aggregation, scikit-learn stratified splitting, and memory optimization. Instant answer feedback and architectural explanations.
          </p>
        </div>

        {/* Quick Restart */}
        <button
          onClick={handleRestart}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700 flex items-center gap-2 transition self-start md:self-auto shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restart Quiz
        </button>
      </div>

      {!isSubmitted ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Question Box (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
              {/* Progress Bar & Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                  <span className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono">
                      {currentQ.category}
                    </span>
                    <span>{currentQ.difficulty}</span>
                  </span>
                  <span className="font-mono text-cyan-300">
                    Question {currentIndex + 1} of {totalQuestions}
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                  />
                </div>
              </div>

              {/* Title & Prompt */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">{currentQ.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{currentQ.prompt}</p>
              </div>

              {/* Code Snippet if applicable */}
              {currentQ.code && (
                <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 bg-slate-900/50 text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3 h-3 text-cyan-400" />
                      python
                    </span>
                    <span>Python 3.12+</span>
                  </div>
                  <pre className="p-4 text-xs font-mono text-cyan-300/95 overflow-x-auto leading-relaxed">
                    {currentQ.code}
                  </pre>
                </div>
              )}

              {/* Options List */}
              <div className="space-y-2.5 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Select the Correct Option:
                </span>
                <div className="space-y-2">
                  {currentQ.options.map((opt) => {
                    const isSelected = currentSelected === opt.id;
                    const isOptionCorrect = opt.id === currentQ.correctOptionId;

                    let optionStyle =
                      'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50';

                    if (isAnswered) {
                      if (isOptionCorrect) {
                        optionStyle =
                          'bg-emerald-500/15 border-emerald-500/50 text-emerald-200 shadow-md shadow-emerald-950/40';
                      } else if (isSelected && !isOptionCorrect) {
                        optionStyle =
                          'bg-rose-500/15 border-rose-500/50 text-rose-200 shadow-md shadow-rose-950/40';
                      }
                    }

                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectOption(opt.id)}
                        disabled={isAnswered}
                        className={`w-full p-3.5 rounded-xl border text-left text-xs font-medium transition flex items-start gap-3 ${optionStyle}`}
                      >
                        <span
                          className={`w-6 h-6 rounded-lg font-bold flex items-center justify-center shrink-0 uppercase font-mono text-xs ${
                            isSelected
                              ? isOptionCorrect
                                ? 'bg-emerald-400 text-slate-950'
                                : 'bg-rose-400 text-slate-950'
                              : isAnswered && isOptionCorrect
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {opt.id}
                        </span>
                        <div className="flex-1 mt-0.5 leading-relaxed">
                          <span>{opt.text}</span>
                        </div>
                        {isAnswered && (
                          <div className="shrink-0 mt-0.5">
                            {isOptionCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : isSelected ? (
                              <XCircle className="w-5 h-5 text-rose-400" />
                            ) : null}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Instant Answer Feedback Card */}
              {isAnswered && (
                <div
                  className={`p-4 rounded-xl border space-y-2 animate-in fade-in duration-200 ${
                    isCorrect
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Correct! Well done.</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span>
                          Incorrect. Option {currentQ.correctOptionId.toUpperCase()} is the correct answer.
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <span className="font-bold text-white">Explanation: </span>
                    {currentQ.explanation}
                  </p>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 disabled:opacity-30 transition flex items-center gap-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Previous
                </button>

                <button
                  onClick={handleNext}
                  disabled={!isAnswered}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-950/50 disabled:opacity-40 transition flex items-center gap-2"
                >
                  <span>{currentIndex === totalQuestions - 1 ? 'Finish & Review' : 'Next Question'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Questions Grid & Live Score (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Quiz Navigator
              </h4>

              <div className="grid grid-cols-5 gap-2">
                {PYTHON_PRACTICE_QUESTIONS.map((q, idx) => {
                  const answered = selectedAnswers[q.id];
                  const qCorrect = answered === q.correctOptionId;
                  const isCur = idx === currentIndex;

                  let boxColor = 'bg-slate-950 border-slate-800 text-slate-400';
                  if (answered) {
                    boxColor = qCorrect
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                      : 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-bold';
                  }
                  if (isCur) {
                    boxColor += ' ring-2 ring-cyan-400';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-10 rounded-xl border text-xs font-mono transition flex items-center justify-center ${boxColor}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Live Score Counter */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Answered:</span>
                  <span className="font-mono text-white font-bold">
                    {Object.keys(selectedAnswers).length} / {totalQuestions}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Current Accuracy:</span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {Object.keys(selectedAnswers).length > 0
                      ? `${Math.round((score / Object.keys(selectedAnswers).length) * 100)}%`
                      : '0%'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Final Score & Review Report */
        <div className="space-y-6">
          <div className="p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-[#0e172a] border border-slate-800 shadow-2xl text-center space-y-4 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mx-auto flex items-center justify-center">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest text-cyan-400 font-bold">
                Assessment Completed
              </span>
              <h2 className="text-2xl font-extrabold text-white">Your Final Score</h2>
              <div className="text-5xl font-extrabold font-mono text-cyan-300 mt-2">
                {score} / {totalQuestions}
              </div>
              <p className="text-sm font-semibold text-slate-300 mt-1">
                {percentage >= 90
                  ? 'Outstanding Mastery! Data Science & ML Pro.'
                  : percentage >= 70
                    ? 'Solid Foundation! Strong ML Engineering Fundamentals.'
                    : 'Good Effort! Review explanations below to strengthen concepts.'}
              </p>
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={handleRestart}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-950/50 flex items-center gap-2 transition"
              >
                <RotateCcw className="w-4 h-4" />
                Retake Quiz
              </button>
            </div>
          </div>

          {/* Full Answers Review List */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              Complete Answer Keys & Technical Notes
            </h3>

            <div className="space-y-4">
              {PYTHON_PRACTICE_QUESTIONS.map((q, idx) => {
                const userAns = selectedAnswers[q.id];
                const isUserCorrect = userAns === q.correctOptionId;

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border space-y-2 text-xs ${
                      isUserCorrect
                        ? 'bg-slate-950/70 border-emerald-500/30'
                        : 'bg-slate-950/70 border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">
                        Q{idx + 1}: {q.title}
                      </span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          isUserCorrect
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {isUserCorrect ? 'Correct' : 'Needs Review'}
                      </span>
                    </div>

                    <p className="text-slate-300">{q.prompt}</p>

                    <div className="text-slate-400">
                      Correct Answer:{' '}
                      <span className="font-mono text-cyan-300 font-bold">
                        Option {q.correctOptionId.toUpperCase()}:{' '}
                        {q.options.find((o) => o.id === q.correctOptionId)?.text}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 leading-relaxed">
                      <span className="font-bold text-white">Why: </span>
                      {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
