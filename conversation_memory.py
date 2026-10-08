"""
conversation_memory.py
──────────────────────
Per-session state tracker for the AI Mental Health Chatbot.

Stores conversation history, detected emotions, topics, user name,
and exercises already suggested — so the bot can give contextually
aware, non-repetitive responses.
"""

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Turn:
    role: str        # "user" or "model"
    text: str
    emotion: Optional[str] = None
    topic: Optional[str] = None
    classification: Optional[str] = None


class ConversationMemory:
    """
    Holds all session state for a single conversation.

    Attributes
    ----------
    user_name          : Detected or provided user name (if any).
    turns              : Ordered list of conversation turns.
    exercises_suggested: Set of exercise titles already recommended.
    questions_asked    : Set of questions the bot has already posed.
    """

    def __init__(self, max_turns: int = 20):
        self.user_name: Optional[str] = None
        self.turns: list[Turn] = []
        self.exercises_suggested: set[str] = set()
        self.questions_asked: set[str] = set()
        self.max_turns = max_turns

    # ── Mutators ────────────────────────────────────────────────────────────

    def add_user_turn(
        self,
        text: str,
        emotion: Optional[str] = None,
        topic: Optional[str] = None,
        classification: Optional[str] = None,
    ):
        self.turns.append(
            Turn(role="user", text=text, emotion=emotion, topic=topic, classification=classification)
        )
        self._trim()

    def add_assistant_turn(self, text: str):
        self.turns.append(Turn(role="model", text=text))
        self._trim()

    def record_exercise(self, title: str):
        self.exercises_suggested.add(title)

    def record_question(self, question: str):
        self.questions_asked.add(question.strip())

    # ── Queries ─────────────────────────────────────────────────────────────

    def last_emotion(self) -> Optional[str]:
        for turn in reversed(self.turns):
            if turn.role == "user" and turn.emotion:
                return turn.emotion
        return None

    def last_classification(self) -> Optional[str]:
        for turn in reversed(self.turns):
            if turn.role == "user" and turn.classification:
                return turn.classification
        return None

    def recent_topics(self, n: int = 5) -> list[str]:
        topics = []
        for turn in reversed(self.turns):
            if turn.role == "user" and turn.topic and turn.topic not in topics:
                topics.append(turn.topic)
            if len(topics) >= n:
                break
        return list(reversed(topics))

    # ── Gemini Integration ──────────────────────────────────────────────────

    def to_gemini_history(self) -> list[dict]:
        """
        Convert stored turns to the format expected by Gemini's
        multi-turn chat API:  [{"role": ..., "parts": [{"text": ...}]}, ...]
        """
        history = []
        for turn in self.turns:
            history.append({
                "role": turn.role,
                "parts": [{"text": turn.text}],
            })
        return history

    # ── Helpers ─────────────────────────────────────────────────────────────

    def _trim(self):
        """Keep only the last max_turns turns to avoid unbounded growth."""
        if len(self.turns) > self.max_turns:
            self.turns = self.turns[-self.max_turns:]

    def __repr__(self) -> str:
        return (
            f"<ConversationMemory turns={len(self.turns)} "
            f"user={self.user_name!r} exercises={self.exercises_suggested}>"
        )
