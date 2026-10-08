"""
safety_checker.py
─────────────────
Crisis / safety detection for the AI Mental Health Chatbot.

Scans user messages for high-risk language (suicidal ideation, self-harm)
and returns a SafetyResult with an appropriate crisis response.

Usage
-----
    from safety_checker import check as safety_check

    result = safety_check("I want to hurt myself")
    if not result.is_safe:
        # show result.response to user immediately
        ...
"""

import re
from dataclasses import dataclass
from typing import Literal


# ── Crisis phrase patterns ────────────────────────────────────────────────────

_HIGH_RISK_PATTERNS = [
    # Suicidal ideation
    r"\bkill\s+myself\b",
    r"\bend\s+(my\s+)?life\b",
    r"\bwant\s+to\s+die\b",
    r"\bdon'?t\s+want\s+to\s+(live|be\s+alive)\b",
    r"\bsuicid(e|al)\b",
    r"\bno\s+reason\s+to\s+live\b",
    r"\bbetter\s+off\s+(dead|without\s+me)\b",
    # Self-harm
    r"\bhurt\s+(myself|my\s+self)\b",
    r"\bcut\s+(myself|my\s+wrists?|my\s+arms?)\b",
    r"\bself[- ]harm\b",
    r"\bself[- ]injur\b",
    # Immediate danger
    r"\boverdos(e|ing)\b",
    r"\btak(e|ing)\s+(all\s+(the|my)\s+)?(pills?|medication)\b",
]

_MEDIUM_RISK_PATTERNS = [
    r"\bfeeling\s+hopeless\b",
    r"\bno\s+hope\b",
    r"\bcan'?t\s+go\s+on\b",
    r"\bgive\s+up\b",
    r"\bnumb\b",
    r"\bworthless\b",
    r"\bburden\b",
]

_HIGH_RISK_RE   = re.compile("|".join(_HIGH_RISK_PATTERNS),   re.IGNORECASE)
_MEDIUM_RISK_RE = re.compile("|".join(_MEDIUM_RISK_PATTERNS), re.IGNORECASE)

# ── Crisis responses ──────────────────────────────────────────────────────────

_HIGH_RISK_RESPONSE = (
    "I'm really glad you reached out, and I want you to know I'm taking what "
    "you've said seriously. You don't have to face this alone.\n\n"
    "**Please reach out to a crisis line right now:**\n"
    "- 🇮🇳 **iCall (India):** 9152987821\n"
    "- 🌍 **Crisis Text Line:** Text HOME to 741741\n"
    "- 🌍 **Befrienders Worldwide:** https://www.befrienders.org\n\n"
    "If you are in immediate danger, please call your local emergency services "
    "(e.g. 112 in India, 911 in the US).\n\n"
    "I'm here with you. Can you tell me where you are right now?"
)

_MEDIUM_RISK_RESPONSE = (
    "It sounds like you're going through something really difficult right now, "
    "and I want to make sure you're okay.\n\n"
    "When you say that, are you having any thoughts of harming yourself? "
    "It's okay to be honest — I'm here to listen without judgement.\n\n"
    "If things ever feel overwhelming, please know that support is available:\n"
    "- 🇮🇳 **iCall:** 9152987821\n"
    "- 🌍 **Crisis Text Line:** Text HOME to 741741"
)


# ── Public API ────────────────────────────────────────────────────────────────

@dataclass
class SafetyResult:
    is_safe: bool
    level: Literal["safe", "medium_risk", "high_risk"]
    response: str = ""


def check(text: str) -> SafetyResult:
    """
    Analyse *text* for crisis / self-harm language.

    Returns
    -------
    SafetyResult
        .is_safe  → True if no risk detected, False otherwise.
        .level    → "safe" | "medium_risk" | "high_risk"
        .response → Pre-written crisis response (only meaningful when not safe).
    """
    if not text or not text.strip():
        return SafetyResult(is_safe=True, level="safe")

    if _HIGH_RISK_RE.search(text):
        return SafetyResult(
            is_safe=False,
            level="high_risk",
            response=_HIGH_RISK_RESPONSE,
        )

    if _MEDIUM_RISK_RE.search(text):
        return SafetyResult(
            is_safe=False,
            level="medium_risk",
            response=_MEDIUM_RISK_RESPONSE,
        )

    return SafetyResult(is_safe=True, level="safe")
