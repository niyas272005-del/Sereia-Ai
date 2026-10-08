import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Play, Pause, RotateCcw, CheckCircle, ChevronRight, Plus } from 'lucide-react';
import { recommendationService } from '../../services/recommendationService';

const isValidInput = (str) => {
  const val = str.trim();
  if (val.length < 2) return false;
  if (!/[aeiouyAEIOUY]/.test(val)) return false;
  if (/(.)\1{3,}/.test(val)) return false;
  return true;
};

// ─── Passive Breathing Animation ──────────────────────────────────────────────
const BreathingCircle = ({ phase, phaseDuration }) => {
  const phaseConfig = {
    inhale:  { scale: 1.4, bg: 'from-indigo-400 to-purple-500', label: 'Inhale',  shadow: '0 0 60px 20px rgba(99,102,241,0.3)' },
    hold:    { scale: 1.4, bg: 'from-purple-400 to-pink-400',   label: 'Hold',    shadow: '0 0 60px 20px rgba(168,85,247,0.3)' },
    exhale:  { scale: 0.75, bg: 'from-cyan-400 to-blue-500',    label: 'Exhale',  shadow: '0 0 40px 10px rgba(34,211,238,0.2)' },
    rest:    { scale: 0.75, bg: 'from-slate-400 to-slate-500',   label: 'Rest',    shadow: '0 0 30px 8px rgba(148,163,184,0.2)' },
  };
  const cfg = phaseConfig[phase] || phaseConfig.inhale;

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-8">
      <div className="relative w-56 h-56 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-indigo-300/40 dark:border-indigo-500/30" style={{ transform: `scale(${cfg.scale * 1.2})`, transition: `transform ${phaseDuration}s cubic-bezier(0.4,0,0.2,1)` }} />
        <div className="absolute inset-0 rounded-full border border-indigo-200/30 dark:border-indigo-500/20" style={{ transform: `scale(${cfg.scale * 1.4})`, transition: `transform ${phaseDuration}s cubic-bezier(0.4,0,0.2,1)` }} />
        <div className={`w-36 h-36 rounded-full bg-gradient-to-br ${cfg.bg} flex items-center justify-center text-white font-bold text-lg shadow-2xl`} style={{ transform: `scale(${cfg.scale})`, transition: `transform ${phaseDuration}s cubic-bezier(0.4,0,0.2,1), background 1s ease`, boxShadow: cfg.shadow }}>
          <div className="text-3xl mb-0.5">{phase === 'inhale' ? '↑' : phase === 'exhale' ? '↓' : phase === 'hold' ? '◯' : '—'}</div>
        </div>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-slate-800 dark:text-white">{cfg.label}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{phaseDuration}s · breathe {phase === 'inhale' ? 'in slowly' : phase === 'exhale' ? 'out slowly' : phase === 'hold' ? 'and hold' : 'naturally'}</p>
      </div>
    </div>
  );
};

// ─── Phase countdown ──────────────────────────────────────────────────────────
const PhaseCountdown = ({ remaining, total }) => {
  const pct = total > 0 ? ((total - remaining) / total) * 100 : 0;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-16 h-16">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-200 dark:text-slate-700" />
          <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4" className="text-indigo-500" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 24}`} strokeDashoffset={`${2 * Math.PI * 24 * (1 - pct / 100)}`} style={{ transition: 'stroke-dashoffset 1s linear' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-slate-800 dark:text-white">{remaining}</span>
        </div>
      </div>
      <span className="text-xs text-slate-500">seconds</span>
    </div>
  );
};

// ─── Interactive Breathing (Hold/Release) ────────────────────────────────────
const InteractiveBreathing = ({ onComplete }) => {
  const [isHolding, setIsHolding] = useState(false);
  const [breathTime, setBreathTime] = useState(0);
  const [phase, setPhase] = useState('Wait'); // Wait, Inhale, Hold, Exhale
  const [feedback, setFeedback] = useState('Press and hold to inhale');
  const [cycles, setCycles] = useState(0);
  const timerRef = useRef(null);
  
  useEffect(() => {
    if (isHolding) {
      timerRef.current = setInterval(() => {
        setBreathTime(prev => {
          const next = prev + 0.1;
          if (next <= 4) {
             setPhase('Inhale');
             setFeedback('Keep inhaling...');
          } else if (next <= 11) {
             setPhase('Hold');
             setFeedback('Hold your breath!');
          } else {
             setPhase('Hold');
             setFeedback('You can release to exhale now!');
          }
          return next;
        });
      }, 100);
    } else {
      clearInterval(timerRef.current);
      if (breathTime > 0) {
        if (breathTime >= 4) {
           setFeedback('Great! Now exhale slowly.');
           setCycles(c => c + 1);
        } else {
           setFeedback('Try to match the 4-7-8 rhythm.');
        }
        setPhase('Exhale');
        setBreathTime(0);
        setTimeout(() => {
           setPhase('Wait');
           setFeedback('Press and hold to inhale');
        }, 4000);
      }
    }
    return () => clearInterval(timerRef.current);
  }, [isHolding, breathTime]);

  useEffect(() => {
     if (cycles >= 3) {
        onComplete();
     }
  }, [cycles, onComplete]);

  useEffect(() => {
     const down = (e) => { if(e.code === 'Space' && !e.repeat) { e.preventDefault(); setIsHolding(true); } }
     const up = (e) => { if(e.code === 'Space') { e.preventDefault(); setIsHolding(false); } }
     window.addEventListener('keydown', down);
     window.addEventListener('keyup', up);
     return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); }
  }, []);

  const scale = phase === 'Wait' ? 1 : phase === 'Inhale' || phase === 'Hold' ? 1.5 : 0.8;

  return (
    <div className="flex flex-col items-center gap-8 py-8 select-none">
      <div className="relative w-48 h-48 flex items-center justify-center mt-4">
         <div 
           className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 ease-out"
           style={{ transform: `scale(${scale})`, transition: phase === 'Wait' ? 'transform 0.3s' : 'transform 4s ease-out' }}
         >
           <span className="text-white font-bold text-xl">{phase}</span>
         </div>
      </div>
      <div className="text-center mb-4">
         <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{feedback}</h3>
         <p className="text-slate-500">Cycles completed: {cycles} / 3</p>
      </div>
      <button 
        onMouseDown={() => setIsHolding(true)}
        onMouseUp={() => setIsHolding(false)}
        onTouchStart={(e) => { e.preventDefault(); setIsHolding(true); }}
        onTouchEnd={(e) => { e.preventDefault(); setIsHolding(false); }}
        className={`w-full max-w-sm py-5 rounded-2xl font-bold text-lg text-white transition-all shadow-xl active:scale-95 ${isHolding ? 'bg-indigo-700 shadow-indigo-700/40 translate-y-1' : 'bg-indigo-500 shadow-indigo-500/40 hover:bg-indigo-600'}`}
      >
        {isHolding ? 'Release to Exhale' : 'Hold to Inhale (Spacebar)'}
      </button>
    </div>
  )
};

// ─── Interactive Grounding (5-4-3-2-1) ───────────────────────────────────────
const InteractiveGrounding = ({ steps, onComplete }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [items, setItems] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  if (!steps || steps.length === 0) return null;
  const step = steps[currentStepIdx];
  const required = step.count;

  const handleAdd = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if(inputValue.trim() && items.length < required) {
       if (!isValidInput(inputValue)) {
         setErrorMsg("Please enter a valid word or phrase.");
         return;
       }
       const newItems = [...items, inputValue.trim()];
       setItems(newItems);
       setInputValue('');

       if(newItems.length >= required) {
          setTimeout(() => {
             if (currentStepIdx === steps.length - 1) {
                onComplete();
             } else {
                setCurrentStepIdx(s => s + 1);
                setItems([]);
             }
          }, 1000);
       }
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 py-6 w-full animate-fade-in-up">
      <div className="text-5xl">{step.emoji}</div>
      <div className="text-center">
         <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{step.count} {step.title}</h3>
         <p className="text-slate-500 text-sm mt-1">Look around you and type them below to anchor yourself.</p>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-3 min-h-[200px]">
         {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800 animate-fade-in-up">
               <CheckCircle size={18} />
               <span className="font-medium">{item}</span>
            </div>
         ))}
         {items.length < required && (
            <form onSubmit={handleAdd} className="flex gap-2">
               <input 
                 type="text" 
                 autoFocus
                 placeholder={`Type item ${items.length + 1} of ${required}...`}
                 value={inputValue}
                 onChange={e => setInputValue(e.target.value)}
                 className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
               />
               <button type="submit" disabled={!inputValue.trim()} className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 transition-colors">
                  <Plus size={20} />
               </button>
            </form>
         )}
         {errorMsg && <div className="text-red-500 text-sm font-medium animate-fade-in">{errorMsg}</div>}
         {items.length >= required && (
            <div className="text-center text-emerald-600 font-bold mt-4 animate-fade-in-up">
               Excellent! Moving to next sense...
            </div>
         )}
      </div>

      <div className="flex gap-1.5 mt-2">
         {steps.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all ${i === currentStepIdx ? 'w-8 bg-indigo-600' : i < currentStepIdx ? 'w-3 bg-emerald-500' : 'w-3 bg-slate-200 dark:bg-slate-700'}`} />
         ))}
      </div>
    </div>
  )
};

// ─── Worry Balloon ───────────────────────────────────────────────────────────
const WorryBalloon = ({ onComplete }) => {
  const [worry, setWorry] = useState('');
  const [balloons, setBalloons] = useState([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const handleInflate = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if(worry.trim()) {
       if (!isValidInput(worry)) {
         setErrorMsg("Please enter a meaningful word or phrase.");
         return;
       }
       setBalloons(prev => [...prev, { id: Date.now(), text: worry.trim(), active: true }]);
       setWorry('');
    }
  }

  const handlePop = (id) => {
    setBalloons(prev => prev.map(b => b.id === id ? { ...b, active: false } : b));
    setPoppedCount(c => c + 1);
  }

  useEffect(() => {
     if(poppedCount >= 3) {
        setTimeout(onComplete, 1200);
     }
  }, [poppedCount, onComplete]);

  return (
    <div className="flex flex-col items-center gap-4 py-4 w-full h-[450px] relative overflow-hidden bg-gradient-to-t from-sky-50 to-white dark:from-sky-900/10 dark:to-slate-900 rounded-3xl border border-sky-100 dark:border-sky-900/30">
      
      {/* Balloons Container */}
      <div className="absolute inset-0 pb-36 pt-10 flex flex-wrap items-end justify-center gap-4 px-4 overflow-hidden">
         {balloons.map(b => b.active ? (
            <button 
               key={b.id} 
               onClick={() => handlePop(b.id)}
               className="relative group animate-fade-in-up hover:-translate-y-2 transition-transform duration-300 ease-out"
               style={{ animation: 'float 4s ease-in-out infinite alternate' }}
            >
               <div className="w-32 h-36 bg-gradient-to-br from-red-400 to-pink-500 rounded-[40%] shadow-lg shadow-red-500/20 flex items-center justify-center p-3 text-white text-center font-bold text-xs sm:text-sm break-words leading-tight border-b-4 border-red-600/30 before:content-[''] before:absolute before:-bottom-3 before:left-1/2 before:-translate-x-1/2 before:border-[6px] before:border-transparent before:border-t-red-600/60">
                  {b.text}
               </div>
               <div className="absolute -bottom-16 left-1/2 w-0.5 h-16 bg-slate-300 dark:bg-slate-600 group-hover:bg-red-400" />
               
               {/* Hover pop icon */}
               <div className="absolute -top-3 -right-3 w-8 h-8 bg-white text-red-500 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                 <X size={16} strokeWidth={3} />
               </div>
            </button>
         ) : null)}
      </div>

      <style>{`
        @keyframes float { 0% { transform: translateY(0px) rotate(-2deg); } 100% { transform: translateY(-15px) rotate(2deg); } }
      `}</style>

      {/* Input area fixed at bottom */}
      <div className="absolute bottom-4 left-0 w-full px-4 sm:px-8 z-10">
         <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center mb-3">
               <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Type a worry to inflate it, then tap to pop.
               </p>
               <span className="text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/30 px-2 py-1 rounded-full">
                 {poppedCount}/3 Popped
               </span>
            </div>
            <form onSubmit={handleInflate} className="flex gap-2">
               <input 
                 type="text" 
                 placeholder="What's on your mind?"
                 value={worry}
                 onChange={e => setWorry(e.target.value)}
                 className="flex-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
               />
               <button type="submit" disabled={!worry.trim()} className="px-5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl disabled:opacity-50 font-bold transition-colors shadow-md">
                  Inflate
               </button>
            </form>
            {errorMsg && <div className="text-red-500 text-sm font-medium mt-2 text-center animate-fade-in">{errorMsg}</div>}
         </div>
      </div>
    </div>
  )
};

// ─── Step-by-step player (Passive) ───────────────────────────────────────────
const StepPlayer = ({ steps, currentStep, elapsed, totalSeconds }) => {
  const step = steps[currentStep];
  if (!step) return null;
  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="flex gap-2">
        {steps.map((_, i) => (
          <div key={i} className={`rounded-full transition-all duration-300 ${i < currentStep ? 'w-3 h-3 bg-emerald-500' : i === currentStep ? 'w-6 h-3 bg-indigo-600' : 'w-3 h-3 bg-slate-200 dark:bg-slate-700'}`} />
        ))}
      </div>
      <div className="w-full max-w-md bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-3xl p-8 text-center border border-indigo-100 dark:border-indigo-800/50">
        <div className="text-5xl mb-4">{step.emoji || '🧘'}</div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{step.instruction}</p>
      </div>
      <div className="w-full max-w-md">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')} / {Math.floor(totalSeconds / 60)}:{String(totalSeconds % 60).padStart(2, '0')}</span>
        </div>
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000" style={{ width: `${(elapsed / totalSeconds) * 100}%` }} />
        </div>
      </div>
    </div>
  );
};

// ─── Completion screen ────────────────────────────────────────────────────────
const CompletionScreen = ({ title, onRetry, onClose }) => (
  <div className="flex flex-col items-center justify-center gap-6 py-8 text-center animate-fade-in-up">
    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-500/30 animate-bounce">
      <CheckCircle size={44} className="text-white" />
    </div>
    <div>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Well done! 🎉</h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-xs">
        You completed <strong className="text-slate-700 dark:text-slate-300">{title}</strong>. Active participation is key to mastering these techniques.
      </p>
    </div>
    <div className="flex gap-3 mt-4">
      <button onClick={onRetry} className="flex items-center gap-2 px-6 py-3 rounded-2xl font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
        <RotateCcw size={18} /> Again
      </button>
      <button onClick={onClose} className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20">
        Done <ChevronRight size={18} />
      </button>
    </div>
  </div>
);

// ─── Main Player Modal ────────────────────────────────────────────────────────
const WellnessPlayer = ({ exercise, onClose }) => {
  const [isPlaying,    setIsPlaying]    = useState(false);
  const [isComplete,   setIsComplete]   = useState(false);
  const [elapsed,      setElapsed]      = useState(0);         // total seconds elapsed
  const [breathPhase,  setBreathPhase]  = useState('inhale');  // for passive breathing exercises
  const [phaseTime,    setPhaseTime]    = useState(0);         // seconds in current phase
  const [currentStep,  setCurrentStep]  = useState(0);         // for passive step exercises
  const [stepElapsed,  setStepElapsed]  = useState(0);         // seconds in current step
  const timerRef = useRef(null);

  const totalSeconds    = exercise.durationSeconds || 300;
  
  // Exercise Types
  const isPassiveBreathing = exercise.type === 'breathing';
  const isInteractiveBreathing = exercise.type === 'interactive-breathing';
  const isPassiveSteps = exercise.type === 'steps' && exercise.steps?.length > 0;
  const isInteractiveGrounding = exercise.type === 'interactive-grounding';
  const isWorryBalloon = exercise.type === 'worry-balloon';

  const breathPattern   = exercise.breathPattern || { inhale: 4, hold: 4, exhale: 4, rest: 0 };
  const cycleDuration   = (breathPattern.inhale || 0) + (breathPattern.hold || 0) + (breathPattern.exhale || 0) + (breathPattern.rest || 0);

  // Passive logic
  const getBreathPhase = useCallback((sec) => {
    const pos = sec % cycleDuration;
    if (pos < breathPattern.inhale) return { phase: 'inhale', remaining: breathPattern.inhale - pos, duration: breathPattern.inhale };
    const afterInhale = breathPattern.inhale + (breathPattern.hold || 0);
    if (pos < afterInhale) return { phase: 'hold', remaining: afterInhale - pos, duration: breathPattern.hold || 0 };
    const afterHold = afterInhale + breathPattern.exhale;
    if (pos < afterHold) return { phase: 'exhale', remaining: afterHold - pos, duration: breathPattern.exhale };
    return { phase: 'rest', remaining: cycleDuration - pos, duration: breathPattern.rest || 1 };
  }, [breathPattern, cycleDuration]);

  const getStepIndex = useCallback((sec) => {
    if (!exercise.steps) return { index: 0, stepElapsed: sec, stepDuration: totalSeconds };
    let acc = 0;
    for (let i = 0; i < exercise.steps.length; i++) {
      acc += exercise.steps[i].duration;
      if (sec < acc) {
        const prev = acc - exercise.steps[i].duration;
        return { index: i, stepElapsed: sec - prev, stepDuration: exercise.steps[i].duration };
      }
    }
    const lastIdx = exercise.steps.length - 1;
    return { index: lastIdx, stepElapsed: exercise.steps[lastIdx].duration, stepDuration: exercise.steps[lastIdx].duration };
  }, [exercise.steps, totalSeconds]);

  useEffect(() => {
    if (isPlaying && !isComplete && (isPassiveBreathing || isPassiveSteps || exercise.type === 'timer')) {
      timerRef.current = setInterval(() => {
        setElapsed(prev => {
          const next = prev + 1;
          if (next >= totalSeconds) {
            setIsPlaying(false);
            setIsComplete(true);
            recommendationService.recordExerciseCompletion(exercise.title);
            return totalSeconds;
          }
          if (isPassiveBreathing) {
            const { phase } = getBreathPhase(next);
            setBreathPhase(phase);
            setPhaseTime(next);
          }
          if (isPassiveSteps) {
            const { index, stepElapsed: se } = getStepIndex(next);
            setCurrentStep(index);
            setStepElapsed(se);
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, isComplete, totalSeconds, isPassiveBreathing, isPassiveSteps, exercise.type, getBreathPhase, getStepIndex]);

  const handleRetry = () => {
    setElapsed(0);
    setIsComplete(false);
    setIsPlaying(false);
    setBreathPhase('inhale');
    setPhaseTime(0);
    setCurrentStep(0);
    setStepElapsed(0);
  };

  const handleInteractiveComplete = () => {
    setIsComplete(true);
    recommendationService.recordExerciseCompletion(exercise.title);
  };

  const { phase: currentPhase, remaining: phaseRemaining, duration: phaseDuration } = isPassiveBreathing ? getBreathPhase(elapsed) : { phase: 'inhale', remaining: 0, duration: 4 };
  const overallPct = (elapsed / totalSeconds) * 100;
  const timeLeft   = totalSeconds - elapsed;
  const mins       = Math.floor(timeLeft / 60);
  const secs       = timeLeft % 60;

  // Determine if it requires Play/Pause wrapper
  const isInteractive = isInteractiveBreathing || isInteractiveGrounding || isWorryBalloon;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">

        {/* Header */}
        <div className={`bg-gradient-to-br ${exercise.gradient || 'from-indigo-500 to-purple-600'} p-6 text-white relative`}>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
            <X size={18} />
          </button>
          <div className="text-3xl mb-2">{exercise.emoji}</div>
          <h2 className="text-xl font-bold">{exercise.title}</h2>
          <div className="flex items-center gap-3 mt-2 text-white/80 text-sm font-medium">
            <span className="bg-white/10 px-2 py-0.5 rounded-full border border-white/20">{isInteractive ? 'Interactive Activity' : 'Guided Timer'}</span>
            <span>·</span>
            <span>{exercise.duration}</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 min-h-[400px] flex flex-col justify-center">
          {isComplete ? (
            <CompletionScreen title={exercise.title} onRetry={handleRetry} onClose={onClose} />
          ) : (
            <>
              {/* Interactive Renders */}
              {isInteractiveBreathing && <InteractiveBreathing onComplete={handleInteractiveComplete} />}
              {isInteractiveGrounding && <InteractiveGrounding steps={exercise.steps} onComplete={handleInteractiveComplete} />}
              {isWorryBalloon && <WorryBalloon onComplete={handleInteractiveComplete} />}

              {/* Passive Renders */}
              {!isInteractive && (
                <>
                  {isPassiveBreathing ? (
                    <BreathingCircle phase={currentPhase} phaseDuration={phaseDuration} />
                  ) : isPassiveSteps ? (
                    <StepPlayer steps={exercise.steps} currentStep={currentStep} elapsed={elapsed} totalSeconds={totalSeconds} />
                  ) : (
                    <div className="flex flex-col items-center gap-4 py-8">
                      <div className="text-6xl">{exercise.emoji}</div>
                      <div className="text-center max-w-xs">
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{exercise.description}</p>
                      </div>
                      <div className="text-5xl font-black text-slate-800 dark:text-white">
                        {mins}:{String(secs).padStart(2, '0')}
                      </div>
                      <p className="text-xs text-slate-400">remaining</p>
                    </div>
                  )}

                  {isPassiveBreathing && (
                    <div className="flex justify-center mb-4">
                      <PhaseCountdown remaining={phaseRemaining} total={phaseDuration} />
                    </div>
                  )}

                  {/* Overall progress for passive */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                      <span>Overall Progress</span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {mins}:{String(secs).padStart(2, '0')} left
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-2 rounded-full bg-gradient-to-r ${exercise.gradient || 'from-indigo-500 to-purple-600'} transition-all duration-1000`} style={{ width: `${overallPct}%` }} />
                    </div>
                  </div>

                  {/* Play Controls for passive */}
                  <div className="flex items-center justify-center gap-4">
                    <button onClick={handleRetry} className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                      <RotateCcw size={20} />
                    </button>
                    <button onClick={() => setIsPlaying(p => !p)} className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-200 bg-gradient-to-br ${exercise.gradient || 'from-indigo-500 to-purple-600'} hover:scale-105 active:scale-95`}>
                      {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                    </button>
                    <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 w-12 h-12 flex items-center justify-center">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{Math.round(overallPct)}%</span>
                    </div>
                  </div>

                  {!isPlaying && elapsed === 0 && (
                    <p className="text-center text-xs text-slate-400 mt-3">Press ▶ to begin · Find a comfortable position</p>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WellnessPlayer;
