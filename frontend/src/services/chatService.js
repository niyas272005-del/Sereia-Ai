/**
 * chatService.js  (Refactored)
 * ─────────────────────────────
 * Modular chat service with:
 *  • Per-session ConversationMemory
 *  • EmotionAnalyser (keyword-based, frontend-only fallback)
 *  • SafetyChecker   (keyword-based)
 *  • ResponseGenerator (rich, varied, non-repetitive fallback responses)
 *  • Full axios integration ready for the real backend
 */

import axios from 'axios';

// ─────────────────────────────────────────────────────────────────────────────
// Axios Client
// ─────────────────────────────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ─────────────────────────────────────────────────────────────────────────────
// ConversationMemory  (per conversation ID)
// ─────────────────────────────────────────────────────────────────────────────
class ConversationMemory {
  constructor() {
    this.turns = [];          // { role: 'user'|'assistant', text, emotion }
    this.userName = null;
    this.emotionsSeen = [];
    this.exercisesSuggested = [];
    this.questionsAsked = [];
    this.turnCount = 0;
  }

  addUserTurn(text, emotion, topic) {
    this.turns.push({ role: 'user', text, emotion, topic });
    if (emotion && !this.emotionsSeen.includes(emotion)) {
      this.emotionsSeen.push(emotion);
    }
    this.turnCount++;
    // Keep rolling window of 12 turns
    if (this.turns.length > 12) this.turns.shift();
  }

  addAssistantTurn(text) {
    this.turns.push({ role: 'assistant', text });
    // Extract and track questions
    const match = text.match(/([^.!?]*\?)/);
    if (match) this.questionsAsked.push(match[1].slice(0, 60));
  }

  recordExercise(title) {
    if (title && !this.exercisesSuggested.includes(title)) {
      this.exercisesSuggested.push(title);
    }
  }

  hasQuestionBeenAsked(q) {
    const snippet = q.slice(0, 40).toLowerCase();
    return this.questionsAsked.some((asked) => asked.toLowerCase().includes(snippet));
  }

  get lastEmotion() {
    for (let i = this.turns.length - 1; i >= 0; i--) {
      if (this.turns[i].role === 'user' && this.turns[i].emotion) {
        return this.turns[i].emotion;
      }
    }
    return null;
  }
}

const _sessions = {};

function getMemory(conversationId) {
  if (!_sessions[conversationId]) {
    _sessions[conversationId] = new ConversationMemory();
  }
  return _sessions[conversationId];
}

// ─────────────────────────────────────────────────────────────────────────────
// SafetyChecker
// ─────────────────────────────────────────────────────────────────────────────
const CRISIS_HIGH = [
  /\bsuicid/i, /\bkill\s*my\s*self\b/i, /\bend\s+my\s+life\b/i,
  /\bwant\s+to\s+die\b/i, /\bself[- ]harm\b/i, /\bcut\s+myself\b/i,
  /\bhurt\s+myself\b/i, /\boverdose\b/i, /\bnot\s+want\s+to\s+live\b/i,
];
const CRISIS_MOD = [
  /\bhopeless\b/i, /\bgive\s+up\s+on\s+everything\b/i,
  /\bwish\s+i\s+(was|were)\s+dead\b/i,
];

function safetyCheck(text) {
  for (const re of CRISIS_HIGH) {
    if (re.test(text)) return { safe: false, level: 'high' };
  }
  for (const re of CRISIS_MOD) {
    if (re.test(text)) return { safe: false, level: 'moderate' };
  }
  return { safe: true, level: 'safe' };
}

const CRISIS_HIGH_RESPONSE =
  "What you're sharing tells me you're carrying something very heavy right now, and that pain is real and it matters — you are not alone in this moment.\n\n" +
  "Please reach out to a crisis line right now, where trained people are ready to help:\n\n" +
  "🇮🇳 **iCall (India):** 9152987821\n" +
  "🇺🇸 **988 Suicide & Crisis Lifeline:** call or text **988**\n" +
  "🇬🇧 **Samaritans:** 116 123\n\n" +
  "If you feel you may act on these thoughts, please call emergency services or ask someone nearby to stay with you. You deserve care and support from another human being right now.";

const CRISIS_MOD_RESPONSE =
  "It sounds like you're carrying something really heavy right now. I hear the depth of what you're feeling, and I don't want to dismiss it.\n\n" +
  "Before we continue — are you having any thoughts of hurting yourself? There's no wrong answer. I just want to make sure you're safe.";

// ─────────────────────────────────────────────────────────────────────────────
// EmotionAnalyser  (lightweight frontend keyword scoring)
// ─────────────────────────────────────────────────────────────────────────────
const EMOTION_SIGNALS = {
  sadness:    ['sad', 'crying', 'cry', 'depressed', 'unhappy', 'miserable', 'grief', 'heartbroken', 'lost', 'hopeless'],
  anxiety:    ['anxious', 'anxiety', 'panic', 'nervous', 'worry', 'scared', 'afraid', 'fear', 'dread', 'racing', 'can\'t breathe'],
  stress:     ['stressed', 'stress', 'overwhelmed', 'pressure', 'deadline', 'too much', 'exhausted', 'overloaded'],
  anger:      ['angry', 'anger', 'furious', 'frustrated', 'annoyed', 'rage', 'mad', 'unfair'],
  loneliness: ['lonely', 'alone', 'isolated', 'no one', 'nobody', 'left out', 'invisible', 'disconnected'],
  burnout:    ['burnout', 'burnt out', 'drained', 'no energy', 'running on empty', 'done', 'can\'t anymore'],
  joy:        ['happy', 'excited', 'great', 'wonderful', 'amazing', 'good', 'grateful', 'thankful', 'blessed'],
};

function detectEmotion(text) {
  const lower = text.toLowerCase();
  const scores = {};
  for (const [emotion, words] of Object.entries(EMOTION_SIGNALS)) {
    scores[emotion] = words.filter((w) => lower.includes(w)).length;
  }
  const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return top[1] > 0 ? top[0] : 'neutral';
}

function detectTopic(text) {
  const lower = text.toLowerCase();
  if (/exam|test|study|school|assignment|grade/.test(lower)) return 'work_school';
  if (/work|boss|deadline|job|office|project/.test(lower)) return 'work_school';
  if (/sleep|insomnia|tired|nightmare/.test(lower)) return 'sleep';
  if (/friend|partner|relationship|breakup|fight/.test(lower)) return 'relationships';
  if (/alone|lonely|isolated/.test(lower)) return 'loneliness';
  return null;
}

function tryExtractName(text) {
  const m = text.match(/(?:i'm|i am|my name is|call me)\s+([A-Z][a-z]+)/i);
  if (m) {
    const skip = ['feeling', 'going', 'okay', 'good', 'fine', 'not', 'just', 'having'];
    if (!skip.includes(m[1].toLowerCase())) return m[1];
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// ExerciseRecommender  (frontend version)
// ─────────────────────────────────────────────────────────────────────────────
const EXERCISES = {
  sadness:    [
    { title: 'Full Body Scan Meditation', desc: 'Systematically bring awareness to each part of your body to release accumulated tension.', action: 'start_breathing' },
    { title: 'Coherent Heart-Rate Variability (HRV) Breathing', desc: 'Rhythmic breathing to sync heart rate rhythm with respiration.', action: 'start_breathing' },
  ],
  anxiety:    [
    { title: '4-7-8 Deep Relaxation Breathing', desc: 'A clinically proven breathing pattern to rapidly lower heart rate and soothe anxiety.', action: 'start_breathing' },
    { title: 'Interactive 5-4-3-2-1 Grounding', desc: 'An acute panic reduction technique using your 5 senses.', action: 'start_breathing' },
    { title: 'The Worry Balloon', desc: 'A CBT visual exercise to inflate a balloon with anxieties and let them go.', action: 'start_breathing' },
  ],
  stress:     [
    { title: 'Box Breathing (Square Breathing)', desc: 'Equal 4-second intervals to restore focus and mental clarity.', action: 'start_breathing' },
    { title: 'Desk Neck & Shoulder De-Stresser', desc: 'Gentle stretches to relieve tech-neck and restore upper back mobility.', action: 'start_breathing' },
    { title: 'Progressive Muscle Relaxation (PMR)', desc: 'Tense and release muscle groups to distinguish stress-tension from physical ease.', action: 'start_breathing' },
  ],
  anger:      [
    { title: 'Box Breathing (Square Breathing)', desc: 'Equal 4-second intervals to activate the parasympathetic response.', action: 'start_breathing' },
    { title: 'Progressive Muscle Relaxation (PMR)', desc: 'Systematically release physical tension associated with anger.', action: 'start_breathing' },
  ],
  loneliness: [
    { title: 'Full Body Scan Meditation', desc: 'A guided somatic mindfulness journey to reconnect with yourself.', action: 'start_breathing' },
    { title: 'Coherent Heart-Rate Variability (HRV) Breathing', desc: 'Rhythmic breathing to build emotional coherence and resilience.', action: 'start_breathing' },
  ],
  burnout:    [
    { title: 'Desk Neck & Shoulder De-Stresser', desc: 'Physical stretches to unclench tight muscles and reset your energy.', action: 'start_breathing' },
    { title: 'Deep Sleep Wind-Down & Visualization', desc: 'A serene journey to silence overactive thoughts and ease you into restful sleep.', action: 'start_breathing' },
  ],
  fear:       [
    { title: 'Interactive 5-4-3-2-1 Grounding', desc: 'Re-anchors your mind in the physical environment when panicked.', action: 'start_breathing' },
    { title: '4-7-8 Deep Relaxation Breathing', desc: 'A clinically proven breathing pattern to rapidly lower heart rate.', action: 'start_breathing' },
  ],
  neutral:    [
    { title: 'Coherent Heart-Rate Variability (HRV) Breathing', desc: 'Rhythmic breathing to build emotional coherence and resilience.', action: 'start_breathing' },
  ],
};

function getExercise(emotion, alreadySuggested) {
  const pool = EXERCISES[emotion] || EXERCISES.neutral;
  const available = pool.filter((e) => !alreadySuggested.includes(e.title));
  if (!available.length) return null;
  return available[Math.floor(Math.random() * available.length)];
}

// ─────────────────────────────────────────────────────────────────────────────
// ResponseGenerator  (rich, varied, non-repetitive fallback responses)
// ─────────────────────────────────────────────────────────────────────────────
const RESPONSE_POOLS = {
  sadness: [
    (name, ex, q) => `Sadness like this can feel like carrying something invisible that nobody else sees. There's nothing wrong with you for feeling it — it's a signal worth listening to, not something to push through. ${ex} ${q}`.trim(),
    (name, ex, q) => `That kind of heaviness is real, and it makes complete sense that you're feeling it right now. Sometimes our emotions catch up with us in unexpected ways. ${ex} ${q}`.trim(),
    (name, ex, q) => `Carrying sadness is genuinely exhausting, and it can make even simple things feel like an effort. You don't have to fix it right now — sometimes just naming it helps. ${ex} ${q}`.trim(),
  ],
  anxiety: [
    (name, ex, q) => `When anxiety takes hold like that, it can feel like your mind is stuck in a loop and your body is trying to keep up. Your nervous system is working hard, even when there's no immediate danger. ${ex} ${q}`.trim(),
    (name, ex, q) => `That unsettled feeling — the racing thoughts, the tension — is your body's alarm system firing. It's uncomfortable, but it's not dangerous. ${ex} ${q}`.trim(),
    (name, ex, q) => `Anxiety has a way of making everything feel urgent at once. When that happens, even small steps can help interrupt the pattern. ${ex} ${q}`.trim(),
  ],
  stress: [
    (name, ex, q) => `That sounds like a genuinely heavy load to be carrying. When we're stretched that thin, even routine tasks can feel like mountains. ${ex} ${q}`.trim(),
    (name, ex, q) => `When pressure builds like that, it affects your ability to think clearly — which makes everything feel harder than it needs to be. ${ex} ${q}`.trim(),
    (name, ex, q) => `Stress like that tends to accumulate quietly until suddenly everything feels overwhelming. It makes sense that you're feeling the weight of it right now. ${ex} ${q}`.trim(),
  ],
  anger: [
    (name, ex, q) => `What you're feeling makes sense. Anger is often a signal that something important was crossed or ignored — it deserves to be acknowledged, not just suppressed. ${ex} ${q}`.trim(),
    (name, ex, q) => `That kind of frustration can be really draining, especially when it feels like it wasn't resolved. It's valid to feel this way. ${ex} ${q}`.trim(),
  ],
  loneliness: [
    (name, ex, q) => `Loneliness has a way of making the world feel very quiet and small. That feeling doesn't mean anything is wrong with you — it means you need connection, which is deeply human. ${ex} ${q}`.trim(),
    (name, ex, q) => `Feeling that disconnected from others is one of the harder human experiences. It can be surprisingly physical — a kind of ache. ${ex} ${q}`.trim(),
  ],
  burnout: [
    (name, ex, q) => `Running on empty for too long takes a real toll. What you're describing sounds less like laziness and more like genuine exhaustion that's been building for a while. ${ex} ${q}`.trim(),
    (name, ex, q) => `Burnout often sneaks up quietly before it hits hard. Your mind and body are clearly telling you something important right now. ${ex} ${q}`.trim(),
  ],
  joy: [
    (name, ex, q) => `It's genuinely good to hear something positive. Those lighter moments really do matter — they're worth holding onto. ${q}`.trim(),
    (name, ex, q) => `That kind of brightness is worth noticing and appreciating. ${q}`.trim(),
  ],
  neutral: [
    (name, ex, q) => `I'm glad you reached out. Whatever's on your mind, this is a safe space to explore it. ${q}`.trim(),
    (name, ex, q) => `Sometimes the most important check-ins happen when nothing specific is wrong — just a feeling that something needs attention. ${q}`.trim(),
  ],
};

const FOLLOW_UP_QUESTIONS = {
  sadness:    [
    'When you look back at today, was there a particular moment when this feeling got stronger?',
    'Has this been going on for a while, or did something specific happen recently?',
    'What would even a small amount of comfort look like for you right now?',
  ],
  anxiety:    [
    'Is there one particular "what if" thought that keeps circling back?',
    'What does the anxiety feel like in your body right now — is there tension anywhere?',
    'Has this level of anxiety been new, or does it come and go?',
  ],
  stress:     [
    'Of everything on your plate, which part feels most urgent to you right now?',
    'When was the last time you felt genuinely relaxed, even for a few minutes?',
    'Is there anything on your list today that could actually wait?',
  ],
  anger:      [
    'What part of this situation feels most unfair to you?',
    'Has something like this happened before with this person or situation?',
    'What would need to change for you to feel even a little resolved?',
  ],
  loneliness: [
    "Is there someone in your life you feel even a little close to, even if you haven't talked recently?",
    "What does genuine connection feel like for you when it's at its best?",
    'Is this loneliness mostly about one relationship, or does it feel more general?',
  ],
  burnout:    [
    "How long do you think you've been running this close to empty?",
    'What does rest actually look like for you when you allow yourself to have it?',
    'Is there anything on your list today that could genuinely wait until tomorrow?',
  ],
  neutral:    [
    "What's been on your mind the most lately?",
    'Is there something in particular that brought you here today?',
    'How have you been feeling overall this week?',
  ],
  joy:        [
    'What made today feel that way?',
    'Is this kind of feeling unusual for you recently, or has it been building?',
  ],
};

function pickQuestion(emotion, asked) {
  const pool = FOLLOW_UP_QUESTIONS[emotion] || FOLLOW_UP_QUESTIONS.neutral;
  const available = pool.filter(
    (q) => !asked.some((a) => a.toLowerCase().includes(q.slice(0, 35).toLowerCase()))
  );
  const source = available.length ? available : pool;
  return source[Math.floor(Math.random() * source.length)];
}

function formatExercise(exercise) {
  if (!exercise) return '';
  return `\n\nOne thing that might help: **${exercise.title}** — ${exercise.desc}`;
}

function buildResponse(memory, emotion, userText) {
  const pool = RESPONSE_POOLS[emotion] || RESPONSE_POOLS.neutral;
  const template = pool[Math.floor(Math.random() * pool.length)];

  const exercise = getExercise(emotion, memory.exercisesSuggested);
  if (exercise) memory.recordExercise(exercise.title);

  // Don't ask a follow-up on every single turn — vary it
  let questionText = '';
  if (memory.turnCount % 2 !== 0 || memory.turnCount === 1) {
    const q = pickQuestion(emotion, memory.questionsAsked);
    questionText = `\n\n${q}`;
  }

  const exText = formatExercise(exercise);
    const response = template(memory.userName, exText, questionText);

    return { text: response, exercise };
}

// ─────────────────────────────────────────────────────────────────────────────
// Local Smart Action Builder (for fallback pipeline)
// ─────────────────────────────────────────────────────────────────────────────
function buildLocalSmartActions(emotion, exercise) {
    const actions = [];
    
    if (exercise) {
        actions.push({
            type: "exercise",
            title: exercise.title,
            subtitle: "Recommended Exercise",
            duration: "2-5 mins",
            benefit: "Helps manage " + emotion,
            emoji: "✨",
            gradient: "from-indigo-500 to-violet-600",
            route: "/dashboard/wellness",
            target_id: exercise.title 
        });
    }
    
    if (["sadness", "loneliness", "burnout"].includes(emotion)) {
        actions.push({
            type: "journal",
            title: "Today's Reflection",
            subtitle: "Recommended Journal",
            duration: "2 mins",
            benefit: "Helps process feelings of " + emotion,
            emoji: "📝",
            gradient: "from-blue-500 to-cyan-500",
            route: "/dashboard/journal",
            target_id: "today"
        });
    }
    
    if (actions.length < 3) {
        actions.push({
            type: "mood",
            title: "Mood Updated",
            subtitle: "Current Emotion: " + (emotion.charAt(0).toUpperCase() + emotion.slice(1)),
            duration: "View Tracker",
            benefit: "Track your emotional journey",
            emoji: "📊",
            gradient: "from-emerald-500 to-teal-500",
            route: "/dashboard/mood",
            target_id: "today"
        });
    }
    
    return actions;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data Store
// ─────────────────────────────────────────────────────────────────────────────
let mockConversations = [
  {
    id: '1',
    title: 'Morning Check-in',
    updatedAt: new Date(Date.now() - 3_600_000).toISOString(),
  },
  {
    id: '2',
    title: 'Dealing with work stress',
    updatedAt: new Date(Date.now() - 86_400_000).toISOString(),
  },
];

let mockMessages = {
  '1': [
    {
      id: 'm1',
      sender: 'user',
      text: 'Hi Sereia, I had a hard time sleeping last night.',
      timestamp: new Date(Date.now() - 3_600_000).toISOString(),
    },
    {
      id: 'm2',
      sender: 'bot',
      text: "Sleep struggles can make everything feel heavier — even things that would normally feel manageable. Poor rest affects your mood, focus, and emotional resilience in ways that sneak up on you.\n\nOne thing that sometimes helps is a simple 4-count breath before bed: inhale for 4, hold for 2, exhale for 6. It signals to your nervous system that it's safe to wind down.\n\nHow long has this been affecting your sleep?",
      timestamp: new Date(Date.now() - 3_590_000).toISOString(),
    },
  ],
  '2': [
    {
      id: 'm3',
      sender: 'user',
      text: 'I am completely overwhelmed with my project deadline.',
      timestamp: new Date(Date.now() - 86_400_000).toISOString(),
    },
    {
      id: 'm4',
      sender: 'bot',
      text: "That sounds like a genuinely heavy load. When pressure builds like that, your brain goes into a kind of overload mode where even clear thinking becomes harder — which only adds to the stress.\n\n**Box Breathing** can help interrupt that cycle in under two minutes: inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat until your shoulders drop.\n\nOf everything on your plate right now, which part feels most urgent to you?",
      timestamp: new Date(Date.now() - 86_390_000).toISOString(),
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Chat Service  (Public API)
// ─────────────────────────────────────────────────────────────────────────────
export const chatService = {

  getConversations: async () => {
    await delay(300);
    return [...mockConversations].sort((a, b) =>
      new Date(b.updatedAt) - new Date(a.updatedAt)
    );
  },

  getConversation: async (id) => {
    await delay(300);
    return mockMessages[id] || [];
  },

  sendMessage: async (conversationId, text) => {
    // ── Try real backend first ──────────────────────────────────────────
    try {
      const userId = parseInt(localStorage.getItem('user_id') || '1', 10);
      const response = await apiClient.post('/chat', { user_id: userId, text });
      const data = response.data;
      const aiMessage = {
        id: `m_${Date.now()}`,
        sender: 'bot',
        text: data.bot_response,
        classification: data.classification,
        emotion: data.emotion,
        timestamp: new Date().toISOString(),
        smartActions: data.smart_actions || []
      };
      if (!mockMessages[conversationId]) mockMessages[conversationId] = [];
      mockMessages[conversationId].push(
        { id: `u_${Date.now()}`, sender: 'user', text, timestamp: new Date().toISOString() },
        aiMessage
      );
      return aiMessage;
    } catch {
      // Backend unavailable → use rich local pipeline
    }

    // ── Local pipeline fallback ─────────────────────────────────────────
    await delay(900 + Math.random() * 600); // Realistic thinking delay

    const memory = getMemory(conversationId);

    // Extract name if not known
    if (!memory.userName) {
      const name = tryExtractName(text);
      if (name) memory.userName = name;
    }

    // Safety check
    const safety = safetyCheck(text);
    if (!safety.safe) {
      const safetyText =
        safety.level === 'high' ? CRISIS_HIGH_RESPONSE : CRISIS_MOD_RESPONSE;
      const safetyMsg = {
        id: `m_${Date.now()}`,
        sender: 'bot',
        text: safetyText,
        classification: 'Severe',
        emotion: 'crisis',
        timestamp: new Date().toISOString(),
      };
      if (!mockMessages[conversationId]) mockMessages[conversationId] = [];
      mockMessages[conversationId].push(
        { id: `u_${Date.now()}`, sender: 'user', text, timestamp: new Date().toISOString() },
        safetyMsg
      );
      return safetyMsg;
    }

    // Emotion + topic analysis
    const emotion = detectEmotion(text);
    const topic = detectTopic(text);

    // Generate response
    const { text: botText, exercise } = buildResponse(memory, emotion, text);

    // Update memory
    memory.addUserTurn(text, emotion, topic);
    memory.addAssistantTurn(botText);

    const aiMessage = {
      id: `m_${Date.now()}`,
      sender: 'bot',
      text: botText,
      classification: 'Normal',
      emotion,
      actions: exercise ? [exercise.action] : [],
      timestamp: new Date().toISOString(),
      smartActions: buildLocalSmartActions(emotion, exercise)
    };

    if (!mockMessages[conversationId]) mockMessages[conversationId] = [];
    mockMessages[conversationId].push(
      { id: `u_${Date.now()}`, sender: 'user', text, timestamp: new Date().toISOString() },
      aiMessage
    );

    return aiMessage;
  },

  deleteConversation: async (id) => {
    await delay(200);
    mockConversations = mockConversations.filter((c) => c.id !== id);
    delete mockMessages[id];
    delete _sessions[id]; // Free conversation memory
    return true;
  },

  getUserTrends: async (userId) => {
    const uid = userId || parseInt(localStorage.getItem('user_id') || '1', 10);
    try {
      const response = await apiClient.get(`/users/${uid}/trends`);
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch user trends from API, using fallback:', error);
      return null;
    }
  },

  logManualMood: async (moodData, userId) => {
    const uid = userId || parseInt(localStorage.getItem('user_id') || '1', 10);
    try {
      const response = await apiClient.post(`/users/${uid}/mood`, {
        user_id: uid,
        ...moodData
      });
      return response.data;
    } catch (error) {
      console.warn('Failed to submit manual mood to backend:', error);
      return { success: true, message: 'Logged locally' };
    }
  },

  getDashboardData: async (userId) => {
    const uid = userId || parseInt(localStorage.getItem('user_id') || '1', 10);
    try {
      const response = await apiClient.get(`/dashboard/${uid}`);
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch dashboard data:', error);
      return null;
    }
  },

  getAnalyticsData: async (userId) => {
    const uid = userId || parseInt(localStorage.getItem('user_id') || '1', 10);
    try {
      const response = await apiClient.get(`/analytics/${uid}`);
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch analytics data:', error);
      return null;
    }
  },

  getReportsData: async (userId) => {
    const uid = userId || parseInt(localStorage.getItem('user_id') || '1', 10);
    try {
      const response = await apiClient.get(`/reports/${uid}`);
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch reports data:', error);
      return null;
    }
  },
};
