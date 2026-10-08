"""
response_generator.py
━━━━━━━━━━━━━━━━━━━━━
Orchestrates all AI response logic.

Architecture:
    EmotionAnalyser   → analyse_user_input()
    SafetyChecker     → check()
    ConversationMemory → per-session state
    ExerciseRecommender → get_recommendation()
    PromptBuilder     → build_system_prompt()
    ResponseGenerator → generate()   ← main entry point

The generate() function replaces the old generate_bot_response() in nlp_engine.py
and is the only function main.py needs to call.
"""

import os
import re
import random

try:
    import google.generativeai as genai
    HAS_GEMINI = True
except ImportError:
    HAS_GEMINI = False

from conversation_memory import ConversationMemory
from safety_checker import check as safety_check
from exercise_recommender import get_recommendation
from prompt_builder import build_system_prompt

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
_gemini_model = None

if HAS_GEMINI and GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    _gemini_model = genai.GenerativeModel("gemini-1.5-flash")


# ── Per-Session Memory Store ───────────────────────────────────────────────
# Key: conversation_id (str)  →  Value: ConversationMemory
_sessions: dict[str, ConversationMemory] = {}


def _get_memory(conversation_id: str) -> ConversationMemory:
    if conversation_id not in _sessions:
        _sessions[conversation_id] = ConversationMemory()
    return _sessions[conversation_id]


# ── Fallback Responses (when Gemini unavailable) ───────────────────────────
_FALLBACKS: dict[str, list[str]] = {
    "sadness": [
        "It makes sense that you're feeling low right now. Sadness, even when it feels bottomless, is a signal worth listening to — not something to push away. What would feel most supportive for you in this moment?",
        "Carrying sadness is genuinely exhausting, and there's no quick fix I can offer — but you don't have to sit with it alone. Can you tell me a bit more about what's been weighing on you most?",
    ],
    "anxiety": [
        "When anxiety takes hold like this, everything can feel louder and more urgent than it really is. Your nervous system is just trying to protect you — even when it overcorrects. What does the anxiety feel like in your body right now?",
        "That kind of unsettled feeling in the chest or gut is your body's alarm system firing — often when the threat isn't as immediate as it feels. Would it help to try a brief grounding exercise together?",
    ],
    "stress": [
        "When you're stretched that thin, even small things can feel enormous. Stress has a way of making everything feel equally urgent, when in reality, some things can wait. Which part of this feels most pressing to you?",
        "That sounds like a genuinely heavy load. Sometimes just naming what's stressing us — rather than carrying it silently — can reduce its weight a little. What's at the top of the pile right now?",
    ],
    "anger": [
        "What you're feeling makes sense given what you've described. Anger is often a signal that something important was crossed. It doesn't need to be fixed right away — just felt. What happened?",
        "Frustration like that can be really draining. It's valid to feel it. Would it help to talk through what led to this point?",
    ],
    "loneliness": [
        "Loneliness has a way of making the world feel very quiet and small. It doesn't mean anything is wrong with you — it means you're human and you need connection. Is there anyone in your life you feel at least a little close to?",
    ],
    "burnout": [
        "Running on empty for a long time takes a serious toll — mentally and physically. Your mind and body are telling you something important. When did you last truly rest, without guilt?",
    ],
    "neutral": [
        "It's good to check in with yourself, even when everything feels 'okay'. Sometimes the most important conversations start when nothing specific is wrong. What's been on your mind?",
        "I'm glad you're here. What's going on for you today?",
    ],
    "joy": [
        "It's genuinely good to hear that. Those lighter moments matter — hold onto them. What made today feel that way?",
    ],
}

_ALIASES = {
    "depressed": "sadness", "sad": "sadness",
    "anxious": "anxiety", "panic": "anxiety",
    "stressed": "stress", "overwhelmed": "stress",
    "angry": "anger",
    "lonely": "loneliness", "isolated": "loneliness",
    "exhausted": "burnout",
    "scared": "fear", "fear": "anxiety",
    "happy": "joy", "surprise": "joy",
}


def _get_fallback(emotion: str) -> str:
    key = _ALIASES.get(emotion.lower(), emotion.lower())
    pool = _FALLBACKS.get(key, _FALLBACKS["neutral"])
    return random.choice(pool)


def _try_extract_name(text: str) -> str | None:
    """Attempt to extract a name if the user introduces themselves."""
    patterns = [
        r"(?:i'm|i am|my name is|call me)\s+([A-Z][a-z]+)",
        r"^([A-Z][a-z]+)\s+here\b",
    ]
    for pat in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            candidate = m.group(1)
            # Ignore common false positives
            if candidate.lower() not in {"feeling", "going", "okay", "good", "fine", "not", "just"}:
                return candidate
    return None


# ── Main Entry Point ───────────────────────────────────────────────────────

def generate(conversation_id: str, user_text: str, analysis: dict) -> dict:
    """
    Full response pipeline.

    Args:
        conversation_id: Unique chat session ID.
        user_text:       Raw message from the user.
        analysis:        Output from nlp_engine.analyze_user_input().

    Returns:
        dict with keys: text, classification, emotion, actions, suggestion_data
    """
    emotion        = analysis.get("dominant_emotion", "neutral")
    classification = analysis.get("classification", "Normal")
    topics         = analysis.get("detected_topics", [])

    # ── 1. Safety Check ────────────────────────────────────────────────────
    safety = safety_check(user_text)
    if not safety.is_safe:
        return {
            "text": safety.response,
            "classification": "Severe" if safety.level == "high_risk" else "Moderate",
            "emotion": emotion,
            "actions": [],
            "suggestion_data": None,
        }

    # ── 2. Retrieve / Init Memory ──────────────────────────────────────────
    memory = _get_memory(conversation_id)

    # Try to extract user name if not known
    if not memory.user_name:
        name = _try_extract_name(user_text)
        if name:
            memory.user_name = name

    # ── 3. Exercise Recommendation ─────────────────────────────────────────
    exercise = get_recommendation(
        emotion=emotion,
        already_suggested=memory.exercises_suggested,
        user_text=user_text,
        topics=topics,
    )
    if exercise:
        memory.record_exercise(exercise["title"])

    # ── 4. Build System Prompt ─────────────────────────────────────────────
    system_prompt = build_system_prompt(
        memory=memory,
        emotion=emotion,
        classification=classification,
        exercise=exercise,
        topics=topics,
    )

    # ── 5. Generate Response (Gemini preferred, fallback otherwise) ────────
    bot_text = ""

    if _gemini_model and user_text:
        try:
            # Use multi-turn history for richer context
            history = memory.to_gemini_history()
            chat = _gemini_model.start_chat(history=history)
            # Prepend system prompt to the user turn
            combined_user_turn = f"[SYSTEM INSTRUCTIONS]\n{system_prompt}\n\n[USER MESSAGE]\n{user_text}"
            response = chat.send_message(combined_user_turn)
            bot_text = response.text.strip()
        except Exception as e:
            print(f"[ResponseGenerator] Gemini error: {e}")
            bot_text = ""

    if not bot_text:
        bot_text = _get_fallback(emotion)

    # ── 6. Update Memory ───────────────────────────────────────────────────
    memory.add_user_turn(
        text=user_text,
        emotion=emotion,
        topic=topics[0] if topics else None,
        classification=classification,
    )
    memory.add_assistant_turn(bot_text)

    # Extract any question that was asked in the response and record it
    q_match = re.search(r'([^.!?]*\?)', bot_text)
    if q_match:
        memory.record_question(q_match.group(1))

    # ── 7. Build Action List ───────────────────────────────────────────────
    actions = []
    suggestion_data = None
    if exercise:
        suggestion_data = {
            "affirmation": "",
            "relaxation_title": exercise["title"],
            "relaxation_desc": exercise["description"],
            "exercise_title": exercise["title"],
            "exercise_desc": exercise["description"],
            "ui_actions": [exercise["action"]],
            "mapped_emotion": exercise["mapped_emotion"],
            "emoji": exercise.get("emoji", "✨"),
            "gradient": exercise.get("gradient", "from-indigo-500 to-purple-600"),
            "duration": exercise.get("duration", "5 mins"),
        }
        actions = [exercise["action"]]

    return {
        "text": bot_text,
        "classification": classification,
        "emotion": emotion,
        "actions": actions,
        "suggestion_data": suggestion_data,
    }


def clear_session(conversation_id: str):
    """Call this when a conversation is deleted to free memory."""
    _sessions.pop(conversation_id, None)
