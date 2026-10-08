import React, { useEffect, useState } from 'react';
import {
  Download, RefreshCw, AlertTriangle, CheckCircle, Info,
  ArrowLeft, Heart, Brain, Moon, Dumbbell, BookOpen, MessageCircle,
  TrendingUp, Shield
} from 'lucide-react';
import { useToast } from '../common/ToastContext';

// ─── Circular score meter ────────────────────────────────────────────────────
const RiskMeter = ({ score, maxScore, percentage, strokeColor }) => {
  const [animated, setAnimated] = useState(0);
  const circumference = 2 * Math.PI * 45; // r=45

  useEffect(() => {
    const t = setTimeout(() => setAnimated(percentage), 200);
    return () => clearTimeout(t);
  }, [percentage]);

  return (
    <div className="relative w-44 h-44 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Track */}
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor"
          strokeWidth="8" className="text-slate-100 dark:text-slate-800" />
        {/* Progress */}
        <circle cx="50" cy="50" r="45" fill="none" stroke={strokeColor}
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (circumference * animated) / 100}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-slate-900 dark:text-white">{score}</span>
        <span className="text-sm font-medium text-slate-400">/ {maxScore}</span>
      </div>
    </div>
  );
};

// ─── Risk configuration per assessment ───────────────────────────────────────
const getRisk = (id, score) => {
  const levels = {
    phq9: [
      { min: 20, label: 'Severe Depression',          pct: 100, color: '#ef4444', bg: 'bg-red-50 dark:bg-red-900/20',    text: 'text-red-600 dark:text-red-400',    icon: AlertTriangle },
      { min: 15, label: 'Moderately Severe',          pct: 80,  color: '#f97316', bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', icon: AlertTriangle },
      { min: 10, label: 'Moderate Depression',        pct: 55,  color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-900/20',  text: 'text-amber-600 dark:text-amber-400',  icon: Info },
      { min: 5,  label: 'Mild Depression',            pct: 30,  color: '#84cc16', bg: 'bg-lime-50 dark:bg-lime-900/20',   text: 'text-lime-600 dark:text-lime-400',   icon: Info },
      { min: 0,  label: 'Minimal / None',             pct: 8,   color: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', icon: CheckCircle },
    ],
    gad7: [
      { min: 15, label: 'Severe Anxiety',             pct: 100, color: '#ef4444', bg: 'bg-red-50 dark:bg-red-900/20',    text: 'text-red-600',    icon: AlertTriangle },
      { min: 10, label: 'Moderate Anxiety',           pct: 65,  color: '#f97316', bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600', icon: Info },
      { min: 5,  label: 'Mild Anxiety',               pct: 33,  color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-900/20',  text: 'text-amber-600',  icon: Info },
      { min: 0,  label: 'Minimal Anxiety',            pct: 8,   color: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600', icon: CheckCircle },
    ],
    stress: [
      { min: 27, label: 'High Stress',                pct: 100, color: '#ef4444', bg: 'bg-red-50 dark:bg-red-900/20',    text: 'text-red-600',    icon: AlertTriangle },
      { min: 14, label: 'Moderate Stress',            pct: 50,  color: '#f97316', bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600', icon: Info },
      { min: 0,  label: 'Low Stress',                 pct: 8,   color: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600', icon: CheckCircle },
    ],
    sleep: [
      { min: 10, label: 'Poor Sleep Quality',         pct: 100, color: '#ef4444', bg: 'bg-red-50 dark:bg-red-900/20',    text: 'text-red-600',    icon: AlertTriangle },
      { min: 5,  label: 'Fair Sleep Quality',         pct: 50,  color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-900/20',  text: 'text-amber-600',  icon: Info },
      { min: 0,  label: 'Good Sleep Quality',         pct: 8,   color: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600', icon: CheckCircle },
    ],
    lifestyle: [
      { min: 17, label: 'Needs Improvement',          pct: 100, color: '#ef4444', bg: 'bg-red-50 dark:bg-red-900/20',    text: 'text-red-600',    icon: AlertTriangle },
      { min: 9,  label: 'Fair Lifestyle',             pct: 50,  color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-900/20',  text: 'text-amber-600',  icon: Info },
      { min: 0,  label: 'Excellent Lifestyle',        pct: 8,   color: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: CheckCircle, text: 'text-emerald-600' },
    ],
  };

  const list = levels[id] || levels.phq9;
  return list.find(l => score >= l.min) || list[list.length - 1];
};

const getMaxScore = (id, questionCount) => {
  const map = { phq9: 27, gad7: 21, stress: 40, sleep: 15, lifestyle: 24 };
  return map[id] ?? questionCount * 3;
};

// ─── Recommendations per risk level ──────────────────────────────────────────
const getRecommendations = (id, label) => {
  const isHigh = ['Severe', 'High', 'Poor', 'Needs'].some(k => label.includes(k));
  const isMod  = ['Moderate', 'Mild', 'Fair'].some(k => label.includes(k));

  const base = [
    { icon: MessageCircle, text: 'Chat with the AI about how you\'re feeling — early support makes a big difference.' },
    { icon: BookOpen,      text: 'Keep a daily journal to track what triggers your mood changes.' },
    { icon: TrendingUp,    text: 'Retake this assessment in 2 weeks to measure your progress.' },
  ];

  const highExtra = {
    phq9:      [{ icon: Shield,    text: 'Please consult a licensed therapist or psychiatrist. A score in this range warrants professional support.' }],
    gad7:      [{ icon: Shield,    text: 'Consider speaking to a mental health professional about anxiety management strategies.' }],
    stress:    [{ icon: Brain,     text: 'Practice daily stress-reduction: try 10-min meditation or a 20-min walk.' }],
    sleep:     [{ icon: Moon,      text: 'Set a consistent bedtime, avoid screens 1hr before sleep, and limit caffeine after 2 PM.' }],
    lifestyle: [{ icon: Dumbbell,  text: 'Start with small changes: a 15-min walk daily and one extra glass of water.' }],
  };

  const modExtra = {
    phq9:      [{ icon: Heart,     text: 'Practice mindfulness exercises 5 minutes daily and maintain a sleep routine.' }],
    gad7:      [{ icon: Heart,     text: 'Try the 4-7-8 breathing technique when feeling anxious: inhale 4, hold 7, exhale 8.' }],
    stress:    [{ icon: Heart,     text: 'Identify your top 3 stressors and create a small action plan for each.' }],
    sleep:     [{ icon: Moon,      text: 'Try a consistent wind-down routine: dim lights, avoid news, and read for 20 min.' }],
    lifestyle: [{ icon: Dumbbell,  text: 'Add 1 more balanced meal and 30 more minutes of movement to your week.' }],
  };

  const lowExtra = {
    phq9:      [{ icon: Heart,     text: 'Keep up your current wellness habits. Journaling and social connection help sustain good mental health.' }],
    gad7:      [{ icon: CheckCircle, text: 'Your anxiety levels are well-managed. Share your strategies with others!' }],
    stress:    [{ icon: CheckCircle, text: 'Great stress management! Keep using whatever coping strategies are working for you.' }],
    sleep:     [{ icon: Moon,      text: 'Excellent sleep hygiene! Consistent sleep is one of the best things for mental health.' }],
    lifestyle: [{ icon: Heart,     text: 'Your lifestyle habits are exemplary. Keep inspiring others around you.' }],
  };

  const extras = isHigh ? highExtra[id] || [] : isMod ? modExtra[id] || [] : lowExtra[id] || [];
  return [...extras, ...base];
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AssessmentResults = ({ assessment, score, onRetake, onBack }) => {
  const { addToast } = useToast();
  const risk     = getRisk(assessment.id, score);
  const maxScore = getMaxScore(assessment.id, assessment.questions.length);
  const RiskIcon = risk.icon;
  const recs     = getRecommendations(assessment.id, risk.label);

  const handleDownload = () => {
    addToast('Report downloaded!', 'success');
    const report = {
      assessment: assessment.title,
      date: new Date().toLocaleDateString(),
      score, maxScore,
      riskLevel: risk.label,
      recommendations: recs.map(r => r.text),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: `${assessment.id}-report.json` });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">

      {/* Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 text-center">

        {/* Completion badge */}
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full mb-6">
          <CheckCircle size={14} /> Assessment Complete
        </div>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Your Results</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          {assessment.title} · {new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}
        </p>

        {/* Meter */}
        <div className="mb-6">
          <RiskMeter score={score} maxScore={maxScore} percentage={risk.pct} strokeColor={risk.color} />
        </div>

        {/* Risk badge */}
        <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl mb-8 ${risk.bg} ${risk.text}`}>
          <RiskIcon size={18} />
          <span className="font-bold text-lg">{risk.label}</span>
        </div>

        {/* Score breakdown bar */}
        <div className="mb-8 text-left px-2">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Your score</span>
            <span className="font-semibold">{score} / {maxScore} points</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
              className="h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${(score / maxScore) * 100}%`, backgroundColor: risk.color }}
            />
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 text-left mb-8">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Brain size={18} className="text-indigo-500" />
            Personalised Recommendations
          </h3>
          <ul className="space-y-4">
            {recs.map((rec, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg shrink-0 mt-0.5">
                  <rec.icon size={14} className="text-indigo-500" />
                </div>
                <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{rec.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-8 leading-relaxed">
          ⚠️ This assessment is a screening tool, not a clinical diagnosis. Please consult a qualified mental health professional for medical advice.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Assessments
          </button>
          <button
            onClick={onRetake}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
          >
            <RefreshCw size={16} /> Retake
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-500/20"
          >
            <Download size={16} /> Download Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentResults;
