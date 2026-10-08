"""
prompt_builder.py
━━━━━━━━━━━━━━━━━
Constructs the Gemini system prompt and per-turn instructions.
Designed to minimise repetitive empathy phrases and maximise
contextual, natural, emotionally intelligent responses.
"""

from conversation_memory import ConversationMemory
from typing import Optional


# ── Sereia Personality Block ───────────────────────────────────────────────
_PERSONA = """\
You are Sereia, a compassionate wellness companion on a mental health platform. \
You are NOT a licensed psychologist or doctor — you are a thoughtful, warm AI guide. \
When clinically complex issues arise, you gently encourage professional support.

Your core traits:
• Compassionate and patient — you never rush the user
• Calm and non-judgmental — you create a genuinely safe space  
• Curious — you ask one thoughtful follow-up question at a time
• Hopeful — you believe in the user's capacity to cope and grow
• Natural — you speak like a caring, intelligent human friend, not a scripted bot

Language rules (follow strictly):
1. NEVER begin a response with "I hear you", "I understand", "Thank you for sharing", "I'm sorry to hear that" or any verbatim repeat of these phrases.
2. NEVER use the same opening sentence twice in a session.
3. NEVER pepper the response with multiple questions — ask at most ONE thoughtful question per response.
4. Keep responses 80–180 words unless the user asks for detailed steps.
5. Vary your sentence structure and vocabulary across every reply.
6. Do NOT use bullet lists unless showing exercise steps. Prefer flowing, conversational prose.
7. Do NOT use bold text (**word**) except for crisis hotline numbers.
8. Do NOT roleplay as the user.
9. Acknowledge what was said before offering any suggestion.
10. When suggesting a coping exercise, weave it naturally into the response — do not announce it like a menu item.
"""

# ── Opening Phrase Bank ───────────────────────────────────────────────────
# These are injected into the prompt so Gemini chooses naturally from them
_OPENINGS_BY_EMOTION: dict[str, list[str]] = {
    "sadness": [
        "That kind of heaviness is real, and it makes sense that you're feeling it.",
        "There's something deeply human about feeling low at times, even when we can't explain why.",
        "Carrying that kind of sadness takes a toll — thank you for trusting me with it.",
        "It sounds like today has been genuinely hard.",
    ],
    "anxiety": [
        "Anxiety has a way of making everything feel urgent and overwhelming at once.",
        "That kind of racing-mind feeling is exhausting.",
        "When anxiety shows up like that, it can be hard to think clearly about anything else.",
        "I can picture how unsettling that must feel in your body right now.",
    ],
    "stress": [
        "That sounds like a lot of pressure to be carrying.",
        "Stress like that can really wear you down, especially when it keeps building.",
        "It makes complete sense that you'd feel stretched thin.",
        "When deadlines and expectations pile up, it affects everything.",
    ],
    "anger": [
        "That kind of frustration is completely valid.",
        "It sounds like something crossed a real boundary for you.",
        "Anger is often a signal that something important was threatened or violated.",
        "What you're describing would make most people feel exactly the same way.",
    ],
    "loneliness": [
        "Feeling that disconnected from others is one of the harder human experiences.",
        "Loneliness is painful in a way that's sometimes hard to put into words.",
        "That sense of being unseen or alone can feel surprisingly physical.",
    ],
    "burnout": [
        "Running on empty for too long takes a real toll — on your mind and your body.",
        "Burnout often creeps up quietly before it hits hard.",
        "What you're describing sounds less like laziness and more like genuine exhaustion.",
    ],
    "fear": [
        "Fear is one of the most uncomfortable emotions to sit with.",
        "That kind of dread can feel all-consuming when it takes hold.",
        "Feeling afraid — even without being able to name exactly why — is its own kind of hard.",
    ],
    "joy": [
        "It's genuinely good to hear something positive in your day.",
        "That kind of brightness matters, especially when things have been difficult.",
    ],
    "neutral": [
        "I'm glad you reached out today.",
        "Whatever's on your mind, I'm here to explore it with you.",
        "There's something important about checking in with yourself, even when things feel okay.",
    ],
}

# Default aliases for emotions not in the bank
_OPENING_ALIASES = {
    "depressed": "sadness", "sad": "sadness",
    "anxious": "anxiety", "panic": "anxiety",
    "stressed": "stress", "overwhelmed": "stress",
    "angry": "anger",
    "lonely": "loneliness", "isolated": "loneliness",
    "exhausted": "burnout",
    "scared": "fear",
    "happy": "joy", "surprise": "joy",
}

import random


def _get_opening_hint(emotion: str) -> str:
    key = _OPENING_ALIASES.get(emotion.lower(), emotion.lower())
    pool = _OPENINGS_BY_EMOTION.get(key, _OPENINGS_BY_EMOTION["neutral"])
    return random.choice(pool)


# ── Follow-Up Question Bank ────────────────────────────────────────────────
_FOLLOW_UP_BY_EMOTION: dict[str, list[str]] = {
    "sadness": [
        "When you look back at today, was there a particular moment when this feeling became stronger?",
        "Has this been going on for a while, or did something specific happen recently?",
        "What would even a small amount of comfort look like for you right now?",
    ],
    "anxiety": [
        "What does your body feel like right now — is there tension anywhere specific?",
        "Is there one particular 'what if' thought that keeps circling back?",
        "Has this level of anxiety been new, or does it come and go?",
    ],
    "stress": [
        "Of everything on your plate right now, which part feels most overwhelming?",
        "When was the last time you felt genuinely relaxed, even for a few minutes?",
        "Are there other people involved in this situation, or is it mostly on you to handle?",
    ],
    "anger": [
        "What part of this situation feels most unfair to you right now?",
        "Has this kind of thing happened before with this person or situation?",
        "What would need to change for you to feel some resolution here?",
    ],
    "loneliness": [
        "Is there someone in your life you feel closest to, even if you haven't talked recently?",
        "What does connection feel like for you when it's at its best?",
        "Is this feeling of loneliness mostly about one relationship, or does it feel more general?",
    ],
    "burnout": [
        "How long do you think you've been running this close to empty?",
        "Is there anything on your to-do list today that could actually wait?",
        "What does rest look like for you when you genuinely allow yourself to have it?",
    ],
    "neutral": [
        "What's been on your mind the most lately?",
        "Is there something in particular that brought you here today?",
        "How have you been feeling overall this week?",
    ],
}


def _get_follow_up_hint(emotion: str, asked: list[str]) -> str:
    key = _OPENING_ALIASES.get(emotion.lower(), "neutral")
    pool = _FOLLOW_UP_BY_EMOTION.get(key, _FOLLOW_UP_BY_EMOTION["neutral"])
    # Avoid repeating the same question
    available = [q for q in pool if not any(q[:40].lower() in a.lower() for a in asked)]
    if not available:
        available = pool
    return random.choice(available)


# ── Public Builder ─────────────────────────────────────────────────────────

def build_system_prompt(memory: ConversationMemory, emotion: str, classification: str,
                        exercise: Optional[dict], topics: list[str]) -> str:
    """
    Builds a complete, context-rich system prompt for Gemini.
    """
    parts = [_PERSONA, ""]

    # Session memory context
    ctx = memory.summary_for_prompt()
    if ctx:
        parts.append(f"SESSION CONTEXT: {ctx}\n")

    # Current turn analysis
    parts.append(f"CURRENT TURN ANALYSIS:")
    parts.append(f"  • Detected emotion: {emotion}")
    parts.append(f"  • Severity level: {classification}")
    if topics:
        parts.append(f"  • Topics detected: {', '.join(topics)}")
    if memory.turn_count > 1:
        parts.append(f"  • This is turn {memory.turn_count} of the conversation — do NOT re-introduce yourself.")
    parts.append("")

    # Opening style guidance
    opening_hint = _get_opening_hint(emotion)
    parts.append(f"SUGGESTED OPENING STYLE (adapt freely, do not copy verbatim):\n  \"{opening_hint}\"\n")

    # Exercise hint
    if exercise:
        parts.append(
            f"EXERCISE TO WEAVE IN (if natural — do NOT list it robotically):\n"
            f"  Title: {exercise['title']}\n"
            f"  Description: {exercise['description']}\n"
            f"  Direct Link format if linking: [{exercise['title']}](/dashboard/wellness?open={exercise['title']})\n"
        )

    # Follow-up question guidance
    if memory.turn_count % 2 == 0 or classification in ("Mild", "Normal"):
        fu = _get_follow_up_hint(emotion, memory.questions_asked)
        parts.append(f"FOLLOW-UP QUESTION TO CONSIDER (ask only if it fits naturally):\n  \"{fu}\"\n")

    # Professional referral nudge for moderate+ distress
    if classification in ("Moderate", "Severe"):
        parts.append(
            "REMINDER: Gently acknowledge that speaking with a mental health professional can be "
            "genuinely helpful — but keep this brief and non-prescriptive.\n"
        )

    parts.append(
        "NOW write Sereia's reply. Be warm, human, and conversational. "
        "No bullet lists. No robotic structure. Natural prose only."
    )

    return "\n".join(parts)
