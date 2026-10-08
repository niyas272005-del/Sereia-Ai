import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Flame, Clock, Heart, Award, Sparkles, Filter } from 'lucide-react';
import WellnessCard from '../../components/dashboard/WellnessCard';
import WellnessPlayer from '../../components/dashboard/WellnessPlayer'; // triggers HMR

const CATEGORIES = ['All', 'Breathing', 'Meditation', 'Mindfulness', 'Stretching', 'Relaxation', 'Sleep'];

const RICH_EXERCISES = [
  {
    id: 1,
    title: '4-7-8 Deep Relaxation Breathing',
    description: 'A clinically proven breathing pattern (Inhale 4s, Hold 7s, Exhale 8s) that activates the parasympathetic nervous system to rapidly lower heart rate and soothe anxiety.',
    duration: '5 mins',
    durationSeconds: 300,
    difficulty: 'Beginner',
    category: 'Breathing',
    type: 'interactive-breathing',
    emoji: '🫁',
    gradient: 'from-blue-500 via-indigo-500 to-purple-600',
    benefits: ['Lowers Anxiety', 'Reduces Blood Pressure', 'Promotes Sleep'],
    breathPattern: { inhale: 4, hold: 7, exhale: 8, rest: 0 },
  },
  {
    id: 2,
    title: 'Box Breathing (Square Breathing)',
    description: 'Used by Navy SEALs to stay calm under intense pressure. Equal 4-second intervals of inhaling, holding, exhaling, and pausing restore focus and mental clarity.',
    duration: '4 mins',
    durationSeconds: 240,
    difficulty: 'Beginner',
    category: 'Breathing',
    type: 'breathing',
    emoji: '📦',
    gradient: 'from-cyan-500 via-blue-500 to-indigo-600',
    benefits: ['Enhances Focus', 'Regulates Nervous System', 'Quick Calm'],
    breathPattern: { inhale: 4, hold: 4, exhale: 4, rest: 4 },
  },
  {
    id: 3,
    title: 'Full Body Scan Meditation',
    description: 'A guided somatic mindfulness journey. Systematically bring awareness to each part of your body from toes to head to release accumulated muscle tension.',
    duration: '10 mins',
    durationSeconds: 600,
    difficulty: 'Beginner',
    category: 'Meditation',
    type: 'steps',
    emoji: '🧘‍♂️',
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
    benefits: ['Physical De-tension', 'Body Awareness', 'Stress Release'],
    steps: [
      { title: 'Ground & Settle', instruction: 'Close your eyes. Take 3 deep breaths into your belly and notice the weight of your body supported by the seat.', emoji: '🪑', duration: 90 },
      { title: 'Feet & Legs', instruction: 'Shift attention to your feet and toes. Breathe into any tightness, then exhale and let your leg muscles go completely heavy.', emoji: '🦶', duration: 120 },
      { title: 'Abdomen & Chest', instruction: 'Feel your stomach rise and fall. Release any held tightness in your gut, ribs, and shoulders with every breath out.', emoji: '🫀', duration: 150 },
      { title: 'Neck, Jaw & Face', instruction: 'Unclench your jaw, soften your tongue away from the roof of your mouth, and smooth out your forehead.', emoji: '😌', duration: 120 },
      { title: 'Full Body Harmony', instruction: 'Feel your whole body breathing in unison as a single wave of calm and resting presence.', emoji: '✨', duration: 120 },
    ],
  },
  {
    id: 4,
    title: 'Desk Neck & Shoulder De-Stresser',
    description: 'Gentle physical stretches specifically engineered for desk workers to unclench tight trapezii, relieve tech-neck, and restore upper back mobility.',
    duration: '6 mins',
    durationSeconds: 360,
    difficulty: 'Beginner',
    category: 'Stretching',
    type: 'steps',
    emoji: '💆‍♀️',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    benefits: ['Relieves Neck Pain', 'Postural Reset', 'Energy Boost'],
    steps: [
      { title: 'Gentle Neck Rolls', instruction: 'Slowly drop your chin to your chest. Roll your right ear towards your right shoulder, hold 5s, then roll to the left.', emoji: '🔄', duration: 90 },
      { title: 'Shoulder Blade Squeezes', instruction: 'Draw your shoulders back and pinch your shoulder blades together like squeezing a pencil between them. Hold for 5s and release.', emoji: '🧍', duration: 90 },
      { title: 'Seated Torso Twist', instruction: 'Place your right hand on your left knee and gently rotate your spine towards the left wall. Hold for 30s each side.', emoji: '🌀', duration: 90 },
      { title: 'Overhead Reach & Side Stretch', instruction: 'Interlace fingers, push hands toward ceiling, then lean gently to the left and right to stretch your ribs.', emoji: '🙆', duration: 90 },
    ],
  },
  {
    id: 5,
    title: 'Progressive Muscle Relaxation (PMR)',
    description: 'Systematically tense specific muscle groups for 5 seconds and release them abruptly. Teaches your brain to distinguish between stress-tension and true physical ease.',
    duration: '8 mins',
    durationSeconds: 480,
    difficulty: 'Intermediate',
    category: 'Relaxation',
    type: 'steps',
    emoji: '⚡',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    benefits: ['Deep Physical Ease', 'Anxiety Relief', 'Sleep Readiness'],
    steps: [
      { title: 'Hands & Arms', instruction: 'Clench both fists as tight as you can. Hold for 5 seconds... 3, 2, 1... and completely let go! Notice the sensation of warm relaxation.', emoji: '✊', duration: 120 },
      { title: 'Shoulders & Neck', instruction: 'Shrug your shoulders up toward your ears as hard as possible. Hold 5s... and drop them instantly.', emoji: '🤷', duration: 120 },
      { title: 'Face & Jaw', instruction: 'Scrunch up your entire face tightly like eating a lemon. Hold 5s... and smooth it out into complete stillness.', emoji: '😬', duration: 120 },
      { title: 'Legs & Feet', instruction: 'Point your toes and flex your thighs tight. Hold 5s... and release into total limpness.', emoji: '🦵', duration: 120 },
    ],
  },
  {
    id: 6,
    title: 'Deep Sleep Wind-Down & Visualization',
    description: 'A serene visualization journey designed to silence overactive night thoughts, lower core body temperature signals, and ease you into restful REM sleep.',
    duration: '12 mins',
    durationSeconds: 720,
    difficulty: 'Beginner',
    category: 'Sleep',
    type: 'steps',
    emoji: '🌙',
    gradient: 'from-indigo-600 via-purple-700 to-slate-900',
    benefits: ['Combats Insomnia', 'Quiets Racing Mind', 'Deeper REM Sleep'],
    steps: [
      { title: 'Dimming External World', instruction: 'Lie back, close your eyes, and picture all your daytime worries being gently stored away inside a wooden box beside your bed.', emoji: '📦', duration: 180 },
      { title: '4-7-8 Sleep Breathing', instruction: 'Breathe in through nose for 4s, hold for 7s, exhale slowly through mouth for 8s. Repeat until your body feels heavy.', emoji: '💤', duration: 180 },
      { title: 'Warm Forest Walk', instruction: 'Imagine walking along a peaceful moonlit path surrounded by towering pines and a soft warm breeze. Step by step, deeper into rest.', emoji: '🌲', duration: 180 },
      { title: 'Drifting into Slumber', instruction: 'Let go of keeping time. Feel your limbs sink comfortably into the mattress as peaceful sleep washes over you.', emoji: '🌌', duration: 180 },
    ],
  },
  {
    id: 7,
    title: 'Interactive 5-4-3-2-1 Grounding',
    description: 'An acute panic & anxiety reduction technique. Re-anchors your mind in the physical environment by actively identifying objects through your 5 senses.',
    duration: '5 mins',
    durationSeconds: 300,
    difficulty: 'Beginner',
    category: 'Mindfulness',
    type: 'interactive-grounding',
    emoji: '👁️',
    gradient: 'from-teal-500 via-emerald-600 to-green-700',
    benefits: ['Stops Panic Attacks', 'Re-anchors Reality', 'Instant Calm'],
    steps: [
      { title: 'Things You Can SEE', count: 5, emoji: '👀' },
      { title: 'Things You Can TOUCH', count: 4, emoji: '🖐️' },
      { title: 'Things You Can HEAR', count: 3, emoji: '👂' },
      { title: 'Things You Can SMELL', count: 2, emoji: '👃' },
      { title: 'Thing You Can TASTE', count: 1, emoji: '👅' },
    ],
  },
  {
    id: 9,
    title: 'The Worry Balloon',
    description: 'A cognitive behavioral therapy (CBT) visual exercise. Inflate a balloon with your specific anxieties and physically let them go into the sky.',
    duration: '3 mins',
    durationSeconds: 180,
    difficulty: 'Beginner',
    category: 'Relaxation',
    type: 'worry-balloon',
    emoji: '🎈',
    gradient: 'from-sky-400 via-cyan-500 to-blue-500',
    benefits: ['Releases Rumination', 'CBT Grounding', 'Letting Go'],
  },
  {
    id: 8,
    title: 'Coherent Heart-Rate Variability (HRV) Breathing',
    description: 'Rhythmic 5.5-second inhalation and 5.5-second exhalation to sync heart rate rhythm with respiration, inducing peak autonomic balance.',
    duration: '6 mins',
    durationSeconds: 360,
    difficulty: 'Intermediate',
    category: 'Breathing',
    type: 'breathing',
    emoji: '❤️',
    gradient: 'from-rose-500 via-red-500 to-orange-500',
    benefits: ['Maximizes HRV', 'Emotional Coherence', 'Resilience Boost'],
    breathPattern: { inhale: 5, hold: 0, exhale: 5, rest: 0 },
  },
];

const Wellness = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeExercise, setActiveExercise] = useState(null);
  const [completedCount, setCompletedCount] = useState(3);
  const [totalMinutes, setTotalMinutes] = useState(45);
  
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const openId = params.get('open') || params.get('exercise') || params.get('id');
    if (openId) {
      const target = decodeURIComponent(openId).trim().toLowerCase();
      
      const found = RICH_EXERCISES.find(ex => {
        const titleLower = ex.title.toLowerCase();
        const categoryLower = ex.category.toLowerCase();
        const typeLower = ex.type.toLowerCase();
        const idStr = ex.id.toString();

        return (
          titleLower === target ||
          idStr === target ||
          titleLower.includes(target) ||
          target.includes(titleLower) ||
          target.split(/\s+/).every(w => w.length > 2 && (titleLower.includes(w) || categoryLower.includes(w) || typeLower.includes(w)))
        );
      });

      if (found) {
        setActiveExercise(found);
      }
    }
  }, [location.search]);

  const handleStartExercise = (exercise) => {
    setActiveExercise(exercise);
  };

  const filteredExercises = RICH_EXERCISES.filter((ex) => {
    const matchesCategory = activeCategory === 'All' || ex.category === activeCategory;
    const matchesSearch =
      ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.benefits.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full space-y-8 animate-fade-in-up">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-0 right-20 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 mb-4 border border-white/10">
            <Sparkles size={14} className="text-amber-400" /> Guided Science-Backed Relief
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3 leading-tight">
            Interactive Wellness & Stress Relief
          </h1>
          <p className="text-indigo-200 text-sm sm:text-base leading-relaxed mb-6">
            Pacing visuals, guided breath meters, somatic muscle releases, and grounding techniques scientifically engineered to lower cortisol and soothe anxiety.
          </p>

          {/* Quick Stats Strip */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-md">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
              <div className="flex justify-center text-amber-400 mb-1">
                <Flame size={18} />
              </div>
              <p className="text-lg font-bold">5 Days</p>
              <p className="text-xs text-indigo-200">Current Streak</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
              <div className="flex justify-center text-emerald-400 mb-1">
                <Award size={18} />
              </div>
              <p className="text-lg font-bold">{completedCount}</p>
              <p className="text-xs text-indigo-200">Done Today</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
              <div className="flex justify-center text-cyan-400 mb-1">
                <Clock size={18} />
              </div>
              <p className="text-lg font-bold">{totalMinutes}m</p>
              <p className="text-xs text-indigo-200">Total Minutes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search exercises, anxiety relief, sleep..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex overflow-x-auto pb-2 sm:pb-0 gap-2 scrollbar-hide">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap px-4 py-2 rounded-2xl text-xs font-semibold transition-all duration-200 ${
                activeCategory === category
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-105'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Exercises */}
      {filteredExercises.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredExercises.map((exercise) => (
            <WellnessCard key={exercise.id} exercise={exercise} onStart={handleStartExercise} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No exercises found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            Try searching for something else or switch category filters.
          </p>
          <button
            onClick={() => {
              setActiveCategory('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold text-xs rounded-xl hover:bg-indigo-100 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Modal Player */}
      {activeExercise && (
        <WellnessPlayer
          exercise={activeExercise}
          onClose={() => {
            setActiveExercise(null);
            setCompletedCount((c) => c + 1);
            setTotalMinutes((m) => m + Math.round((activeExercise.durationSeconds || 300) / 60));
          }}
        />
      )}
    </div>
  );
};

export default Wellness;
