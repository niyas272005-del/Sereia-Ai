"""
nlp_engine.py  (Refactored)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Responsible ONLY for emotion analysis.
AI response generation has been moved to response_generator.py.
"""

from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import re
import os

# ── Optional Hugging Face emotion classifier ──────────────────────────────
try:
    from transformers import pipeline as hf_pipeline
    emotion_classifier = hf_pipeline(
        "text-classification",
        model="bhadresh-savani/distilbert-base-uncased-emotion",
        return_all_scores=True,
    )
    HAS_TRANSFORMERS = True
except Exception as e:
    print(f"[nlp_engine] HuggingFace not available, using rule-based fallback: {e}")
    HAS_TRANSFORMERS = False

analyzer = SentimentIntensityAnalyzer()

# ── Keyword Lists ─────────────────────────────────────────────────────────
DEPRESSION_KEYWORDS = [
    "hopeless", "worthless", "tired", "sad", "empty", "guilty", "suicide", "giving up",
    "can't sleep", "crying", "miserable", "die", "pointless", "alone", "exhausted",
    "overwhelmed", "anxious", "pain", "hurt", "despair", "numb", "dread", "afraid",
    "panic", "helpless", "trapped", "burden", "broken",
]

TOPIC_KEYWORDS = {
    "sleep":         ["sleep", "insomnia", "tired", "exhausted", "nightmare", "wake up", "rest"],
    "work_school":   ["work", "school", "exam", "test", "study", "boss", "job", "career",
                      "manager", "homework", "deadline", "assignment", "project", "office"],
    "relationships": ["boyfriend", "girlfriend", "partner", "wife", "husband", "friend",
                      "family", "breakup", "fight", "argue", "dating", "toxic", "divorce"],
    "loneliness":    ["alone", "lonely", "isolated", "no friends", "nobody", "ignored", "left out", "invisible"],
    "panic":         ["panic", "heart racing", "can't breathe", "attack", "freaking out",
                      "hyperventilating", "shaking", "trembling"],
    "physical_pain": ["pain", "hurt", "headache", "stomach", "sick", "ill", "ache", "nauseous"],
    "burnout":       ["burnout", "burn out", "drained", "no energy", "exhausted", "can't cope",
                      "too much", "running on empty"],
    "family":        ["parent", "mother", "father", "sibling", "brother", "sister", "home", "conflict"],
    "career":        ["job loss", "unemployed", "fired", "promotion", "career", "interview", "salary"],
}

def map_score_to_classification(score: float) -> str:
    if score >= 0.7:  return "Severe"
    if score >= 0.4:  return "Moderate"
    if score >= 0.2:  return "Mild"
    return "Normal"


# ── Derived Metric Helpers ────────────────────────────────────────────────────

def compute_stress_score(depression_score: float, compound: float) -> float:
    """Return a 0–100 stress score. Higher = more stressed."""
    # Weight: 60% from depression_score, 40% from negative sentiment
    neg_sentiment = max(0.0, (compound * -1 + 1) / 2)
    raw = (depression_score * 0.6 + neg_sentiment * 0.4) * 100
    return round(min(100.0, max(0.0, raw)), 1)


def compute_mood_score(depression_score: float) -> float:
    """Return a 0–10 mood wellness score. Higher = better mood."""
    return round((1.0 - depression_score) * 10, 1)


def compute_energy_level(depression_score: float, compound: float) -> str:
    """Derive energy level from depression score and compound sentiment."""
    score = depression_score - (compound * 0.1)  # more negative compound → lower energy
    if score >= 0.55:
        return "Low"
    if score >= 0.25:
        return "Medium"
    return "High"


def compute_risk_level(depression_score: float) -> str:
    """Map depression score to a human-readable risk level."""
    if depression_score >= 0.7:  return "Severe"
    if depression_score >= 0.4:  return "High"
    if depression_score >= 0.2:  return "Moderate"
    return "Low"


def compute_confidence(emotion_list: list) -> float:
    """
    Return model confidence % based on the top emotion score.
    Falls back to a rule-based estimate when transformers are unavailable.
    """
    if emotion_list:
        try:
            best = max(emotion_list, key=lambda x: x["score"])
            return round(best["score"] * 100, 1)
        except Exception:
            pass
    return 75.0  # default rule-based confidence


def compute_sentiment_label(compound: float) -> str:
    """Map VADER compound score to a readable label."""
    if compound >= 0.05:
        return "Positive"
    if compound <= -0.05:
        return "Negative"
    return "Neutral"


def analyze_user_input(text: str) -> dict:
    """
    Returns emotion analysis dict consumed by response_generator.generate().
    Keys: depression_score, dominant_emotion, classification,
          compound_sentiment, keyword_hits, detected_topics,
          stress_score, mood_score, energy_level, risk_level,
          confidence, sentiment.
    """
    text_lower = text.lower()

    sentiment = analyzer.polarity_scores(text)
    compound  = sentiment["compound"]

    keyword_count   = sum(1 for w in DEPRESSION_KEYWORDS if w in text_lower)
    detected_topics = [t for t, words in TOPIC_KEYWORDS.items()
                       if any(w in text_lower for w in words)]

    base_negative  = ((compound * -1) + 1) / 2
    depression_score = min(1.0, (base_negative * 0.4) + (keyword_count * 0.2))

    dominant_emotion = "neutral"
    emotion_list_raw = []

    if HAS_TRANSFORMERS:
        try:
            emotions     = emotion_classifier(text)
            emotion_list_raw = emotions[0] if isinstance(emotions[0], list) else emotions
            best         = max(emotion_list_raw, key=lambda x: x["score"])
            dominant_emotion = best["label"]
            if dominant_emotion in ("sadness", "fear", "anger"):
                depression_score = min(1.0, depression_score + best["score"] * 0.3)
        except Exception:
            pass
    else:
        # Rule-based emotion fallback
        if compound <= -0.5 or keyword_count >= 3:
            dominant_emotion = "sadness"
        elif compound <= -0.2:
            dominant_emotion = "anxiety"
        elif "panic" in detected_topics:
            dominant_emotion = "anxiety"
        elif "burnout" in detected_topics:
            dominant_emotion = "burnout"
        elif "loneliness" in detected_topics:
            dominant_emotion = "loneliness"
        elif compound >= 0.4:
            dominant_emotion = "joy"

    depression_score = round(min(depression_score, 1.0), 2)
    classification   = map_score_to_classification(depression_score)

    # ── Derived rich metrics ──────────────────────────────────────────────────
    stress_score   = compute_stress_score(depression_score, compound)
    mood_score     = compute_mood_score(depression_score)
    energy_level   = compute_energy_level(depression_score, compound)
    risk_level     = compute_risk_level(depression_score)
    confidence     = compute_confidence(emotion_list_raw)
    sentiment_lbl  = compute_sentiment_label(compound)

    return {
        "depression_score":   depression_score,
        "dominant_emotion":   dominant_emotion,
        "classification":     classification,
        "compound_sentiment": compound,
        "keyword_hits":       keyword_count,
        "detected_topics":    detected_topics,
        # Extended metrics
        "stress_score":       stress_score,
        "mood_score":         mood_score,
        "energy_level":       energy_level,
        "risk_level":         risk_level,
        "confidence":         confidence,
        "sentiment":          sentiment_lbl,
    }
