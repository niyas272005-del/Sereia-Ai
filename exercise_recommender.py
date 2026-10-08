"""
exercise_recommender.py
━━━━━━━━━━━━━━━━━━━━━━
Emotion, topic, and keyword-aware coping exercise recommendation engine.
Returns a relevant, non-repeated exercise recommendation per session.
"""

import random
from typing import Optional, List, Dict, Any

# ── Exercise Catalog ────────────────────────────────────────────────────────
EXERCISES_CATALOG: List[Dict[str, Any]] = [
    {
        "title": "4-7-8 Deep Relaxation Breathing",
        "description": "A clinically proven breathing pattern (Inhale 4s, Hold 7s, Exhale 8s) to rapidly lower heart rate and soothe anxiety.",
        "action": "start_breathing",
        "category": "Breathing",
        "emoji": "🫁",
        "gradient": "from-blue-500 via-indigo-500 to-purple-600",
        "keywords": ["anxiety", "anxious", "panic", "breathe", "breathing", "heart", "fear", "scared", "soothe", "calm", "inhale"],
        "topics": ["panic"],
        "emotions": ["anxiety", "fear"],
        "duration": "5 mins",
    },
    {
        "title": "Box Breathing (Square Breathing)",
        "description": "Used by Navy SEALs to stay calm under intense pressure. Equal 4-second intervals restore focus and mental clarity.",
        "action": "start_breathing",
        "category": "Breathing",
        "emoji": "📦",
        "gradient": "from-cyan-500 via-blue-500 to-indigo-600",
        "keywords": ["stress", "stressed", "work", "focus", "pressure", "angry", "anger", "calm", "square", "navy seal"],
        "topics": ["work_school", "career"],
        "emotions": ["stress", "anger"],
        "duration": "4 mins",
    },
    {
        "title": "Full Body Scan Meditation",
        "description": "A guided somatic mindfulness journey. Systematically bring awareness to each part of your body to release accumulated tension.",
        "action": "start_breathing",
        "category": "Meditation",
        "emoji": "🧘‍♂️",
        "gradient": "from-purple-500 via-pink-500 to-rose-500",
        "keywords": ["meditation", "mindfulness", "sad", "sadness", "lonely", "loneliness", "body", "scan", "grief", "depressed"],
        "topics": ["relationships", "loneliness"],
        "emotions": ["sadness", "loneliness"],
        "duration": "10 mins",
    },
    {
        "title": "Desk Neck & Shoulder De-Stresser",
        "description": "Gentle physical stretches engineered for desk workers to unclench tight neck and shoulder muscles.",
        "action": "start_breathing",
        "category": "Stretching",
        "emoji": "💆‍♀️",
        "gradient": "from-amber-500 via-orange-500 to-red-500",
        "keywords": ["neck", "shoulder", "desk", "stretch", "stretching", "burnout", "exhausted", "work", "posture", "stiff", "back"],
        "topics": ["burnout", "work_school"],
        "emotions": ["burnout", "stress"],
        "duration": "6 mins",
    },
    {
        "title": "Progressive Muscle Relaxation (PMR)",
        "description": "Systematically tense specific muscle groups for 5 seconds and release them abruptly to release deep physical stress.",
        "action": "start_breathing",
        "category": "Relaxation",
        "emoji": "⚡",
        "gradient": "from-emerald-500 via-teal-500 to-cyan-600",
        "keywords": ["muscle", "tense", "tension", "stiff", "release", "relax", "physical", "tight", "clenching"],
        "topics": ["physical_pain"],
        "emotions": ["stress", "anger"],
        "duration": "8 mins",
    },
    {
        "title": "Deep Sleep Wind-Down & Visualization",
        "description": "A serene visualization journey designed to silence overactive night thoughts and ease you into restful sleep.",
        "action": "start_breathing",
        "category": "Sleep",
        "emoji": "🌙",
        "gradient": "from-indigo-600 via-purple-700 to-slate-900",
        "keywords": ["sleep", "insomnia", "night", "bed", "tired", "rest", "cant sleep", "can't sleep", "dream", "bedtime"],
        "topics": ["sleep"],
        "emotions": ["burnout", "anxiety", "sadness"],
        "duration": "12 mins",
    },
    {
        "title": "Interactive 5-4-3-2-1 Grounding",
        "description": "An acute panic & anxiety reduction technique. Re-anchors your mind in the physical environment using your 5 senses.",
        "action": "start_breathing",
        "category": "Mindfulness",
        "emoji": "👁️",
        "gradient": "from-teal-500 via-emerald-600 to-green-700",
        "keywords": ["grounding", "panic", "attack", "overwhelmed", "senses", "54321", "reality", "dissociate", "freaking out"],
        "topics": ["panic"],
        "emotions": ["anxiety", "fear"],
        "duration": "5 mins",
    },
    {
        "title": "Coherent Heart-Rate Variability (HRV) Breathing",
        "description": "Rhythmic 5.5-second breathing to sync heart rate rhythm with respiration, inducing peak autonomic balance.",
        "action": "start_breathing",
        "category": "Breathing",
        "emoji": "❤️",
        "gradient": "from-rose-500 via-red-500 to-orange-500",
        "keywords": ["heart", "hrv", "rhythm", "resilience", "coherence", "balance", "emotional", "pulse"],
        "topics": [],
        "emotions": ["neutral", "sadness", "loneliness"],
        "duration": "6 mins",
    },
    {
        "title": "The Worry Balloon",
        "description": "A cognitive behavioral therapy (CBT) visual exercise. Inflate a balloon with your anxieties and let them go.",
        "action": "start_breathing",
        "category": "Relaxation",
        "emoji": "🎈",
        "gradient": "from-sky-400 via-cyan-500 to-blue-500",
        "keywords": ["worry", "worried", "balloon", "cbt", "overthinking", "rumination", "thoughts", "let go"],
        "topics": [],
        "emotions": ["anxiety", "stress"],
        "duration": "3 mins",
    }
]

# Emotion aliases from NLP classifier → catalog emotion keys
_ALIASES = {
    "sadness": "sadness", "depressed": "sadness", "sad": "sadness",
    "anxious": "anxiety", "anxiety": "anxiety", "panic": "anxiety",
    "stressed": "stress", "stress": "stress", "overwhelmed": "stress",
    "angry": "anger", "anger": "anger",
    "lonely": "loneliness", "loneliness": "loneliness", "isolated": "loneliness",
    "exhausted": "burnout", "burnout": "burnout",
    "fear": "fear", "scared": "fear",
    "surprise": "neutral", "neutral": "neutral",
    "joy": "joy", "happy": "joy",
}


def get_recommendation(
    emotion: str,
    already_suggested: List[str],
    user_text: str = "",
    topics: Optional[List[str]] = None
) -> Optional[Dict[str, Any]]:
    """
    Returns an exercise dict tailored to user_text, topics, and emotion.
    Filters out already_suggested titles for variety in the session.
    """
    norm_emotion = _ALIASES.get(emotion.lower(), "neutral")
    user_text_lower = (user_text or "").lower()
    topics_set = set(topics or [])

    # Exclude already suggested exercises if possible
    available = [ex for ex in EXERCISES_CATALOG if ex["title"] not in already_suggested]
    if not available:
        # Fallback to full catalog if all have been suggested once
        available = EXERCISES_CATALOG.copy()

    # If the user expresses pure joy and no explicit need/request for exercise, return None
    has_exercise_request = any(w in user_text_lower for w in ["exercise", "help", "breathe", "stretch", "sleep", "calm", "relax"])
    if norm_emotion == "joy" and not has_exercise_request:
        return None

    # Score each available exercise based on relevance
    scored_candidates = []
    for ex in available:
        score = 0

        # Topic match (+8)
        for t in ex["topics"]:
            if t in topics_set:
                score += 8

        # Keyword match (+5 per match)
        for kw in ex["keywords"]:
            if kw in user_text_lower:
                score += 5

        # Category match (+6 if user asked for "sleep", "breathing", "stretching", etc.)
        if ex["category"].lower() in user_text_lower:
            score += 6

        # Emotion match (+3)
        if norm_emotion in ex["emotions"]:
            score += 3

        scored_candidates.append((score, ex))

    # Sort candidates by score descending
    scored_candidates.sort(key=lambda x: x[0], reverse=True)

    # Pick top candidate
    top_score, best_ex = scored_candidates[0]

    # Return structured dict
    return {
        "title": best_ex["title"],
        "description": best_ex["description"],
        "action": best_ex["action"],
        "mapped_emotion": norm_emotion,
        "emoji": best_ex["emoji"],
        "gradient": best_ex["gradient"],
        "category": best_ex["category"],
        "duration": best_ex["duration"],
    }

