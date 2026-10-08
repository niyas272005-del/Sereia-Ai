import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, X, AlertCircle } from 'lucide-react';

/**
 * AssessmentForm
 *
 * BUG FIXED: was reading `assessment.options` which doesn't exist at the assessment
 * level — each *question* has its own `options` array. Fixed to use
 * `currentQuestion.options`.
 */
const AssessmentForm = ({ assessment, onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers]         = useState({});
  const [animating, setAnimating]     = useState(false);

  const questions      = assessment.questions;
  const currentQuestion = questions[currentStep];
  const totalSteps     = questions.length;
  const progress       = ((currentStep + 1) / totalSteps) * 100;
  const isAnswered     = answers[currentStep] !== undefined;
  const isLastQuestion = currentStep === totalSteps - 1;

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' && isAnswered) goNext();
      if (e.key === 'ArrowLeft' && currentStep > 0) goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentStep, isAnswered]);

  const goNext = () => {
    if (animating) return;
    if (isLastQuestion) {
      const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
      onComplete(totalScore, answers);
    } else {
      setAnimating(true);
      setTimeout(() => {
        setCurrentStep(s => s + 1);
        setAnimating(false);
      }, 180);
    }
  };

  const goPrev = () => {
    if (animating || currentStep === 0) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrentStep(s => s - 1);
      setAnimating(false);
    }, 180);
  };

  const handleSelect = (score) => {
    setAnswers(prev => ({ ...prev, [currentStep]: score }));
  };

  // Answered count for status
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <X size={16} /> Cancel
        </button>

        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{assessment.title}</p>
          <p className="text-xs text-slate-400">{answeredCount} of {totalSteps} answered</p>
        </div>

        <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
          {Math.round(progress)}%
        </div>
      </div>

      {/* ── Progress Bar ── */}
      <div className="mb-8">
        {/* Step dots */}
        <div className="flex gap-1.5 mb-3 justify-center flex-wrap">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentStep
                  ? 'w-6 bg-indigo-600'
                  : answers[i] !== undefined
                    ? 'w-2 bg-emerald-500'
                    : 'w-2 bg-slate-200 dark:bg-slate-700'
              }`}
              title={`Question ${i + 1}${answers[i] !== undefined ? ' ✓' : ''}`}
            />
          ))}
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-2">
          <span>Question {currentStep + 1} of {totalSteps}</span>
          <span className="text-emerald-500 font-medium">{answeredCount} answered</span>
        </div>
      </div>

      {/* ── Question Card ── */}
      <div
        className={`bg-white dark:bg-slate-900 rounded-3xl p-7 md:p-10 shadow-sm border border-slate-200 dark:border-slate-800 mb-6 transition-opacity duration-150 ${
          animating ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* Question number badge */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {currentStep + 1}
          </div>
          <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
        </div>

        <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-8 leading-relaxed">
          {currentQuestion.text}
        </h3>

        {/* ── Options ── */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const selected = answers[currentStep] === option.score;
            return (
              <button
                key={index}
                onClick={() => handleSelect(option.score)}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 flex items-center gap-4 group ${
                  selected
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-md shadow-indigo-500/10'
                    : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                {/* Radio circle */}
                <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                  selected
                    ? 'border-indigo-500 bg-indigo-500'
                    : 'border-slate-300 dark:border-slate-600 group-hover:border-indigo-400'
                }`}>
                  {selected && <CheckCircle2 size={12} className="text-white" strokeWidth={3} />}
                </div>

                {/* Option label */}
                <span className={`font-medium text-sm flex-1 ${
                  selected
                    ? 'text-indigo-900 dark:text-indigo-100'
                    : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {option.text}
                </span>

                {/* Score badge */}
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                  selected
                    ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                }`}>
                  {option.score} pt{option.score !== 1 ? 's' : ''}
                </span>
              </button>
            );
          })}
        </div>

        {/* Hint */}
        {!isAnswered && (
          <p className="text-xs text-slate-400 text-center mt-4 flex items-center justify-center gap-1">
            <AlertCircle size={12} /> Select an answer to continue
          </p>
        )}
      </div>

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={goPrev}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl font-medium text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={18} /> Previous
        </button>

        {/* Keyboard hint */}
        <span className="text-xs text-slate-400 hidden sm:block">Use ← → keys to navigate</span>

        <button
          onClick={goNext}
          disabled={!isAnswered}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm text-white transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed ${
            isLastQuestion
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/20'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/20'
          }`}
        >
          {isLastQuestion ? (
            <><CheckCircle2 size={18} /> Submit Assessment</>
          ) : (
            <>Next <ChevronRight size={18} /></>
          )}
        </button>
      </div>
    </div>
  );
};

export default AssessmentForm;
