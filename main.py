from fastapi import FastAPI, Depends, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import os

import hashlib

from db_models import Base, engine, get_db, init_db, User, Message, MoodLog, Recommendation
from nlp_engine import analyze_user_input
import response_generator
from smart_action_builder import build_smart_actions

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

app = FastAPI(title="AI Mental Health Chatbot API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database
@app.on_event("startup")
def on_startup():
    init_db()
    # Create a default user for demonstration
    db = next(get_db())
    if not db.query(User).filter_by(username="demo_user").first():
        demo_user = User(username="demo_user", hashed_password=hash_password("password123"))
        db.add(demo_user)
        db.commit()

# Ensure static folder exists
os.makedirs("static", exist_ok=True)
# Mount frontend
app.mount("/static", StaticFiles(directory="static"), name="static")

# Pydantic Schemas
class MessageInput(BaseModel):
    user_id: int
    text: str

from typing import List, Optional, Dict, Any

class BotResponse(BaseModel):
    user_id: int
    text: str
    bot_response: str
    emotion: str
    classification: str
    actions: List[str] = []
    suggestion_data: Optional[Dict[str, Any]] = None
    smart_actions: List[Dict[str, Any]] = []

class LoginInput(BaseModel):
    username: str
    password: str

class RegisterInput(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    user_id: Optional[int] = None
    username: Optional[str] = None
    message: str

@app.post("/api/register", response_model=LoginResponse)
def register_endpoint(creds: RegisterInput, db: Session = Depends(get_db)):
    # Check if username exists
    existing = db.query(User).filter(User.username == creds.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already in use")
        
    new_user = User(
        username=creds.username,
        hashed_password=hash_password(creds.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return LoginResponse(
        success=True,
        user_id=new_user.id,
        username=new_user.username,
        message="Registration successful!"
    )

@app.post("/api/login", response_model=LoginResponse)
def login_endpoint(creds: LoginInput, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == creds.username).first()
    if not user or user.hashed_password != hash_password(creds.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    return LoginResponse(
        success=True,
        user_id=user.id,
        username=user.username,
        message="Login successful"
    )

@app.post("/api/chat", response_model=BotResponse)
def chat_endpoint(msg: MessageInput, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == msg.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Process text through NLP
    analysis = analyze_user_input(msg.text)

    # Generate context-aware, memory-backed response
    bot_reply_obj = response_generator.generate(
        conversation_id=str(msg.user_id),  # Use user_id as session key
        user_text=msg.text,
        analysis=analysis,
    )

    bot_text      = bot_reply_obj["text"]
    bot_actions   = bot_reply_obj["actions"]
    bot_suggestion = bot_reply_obj["suggestion_data"]
    
    # ── Enriched Smart Actions Generation ──
    # Determine user's current session stats to feed the builder
    turn_count = db.query(Message).filter(Message.user_id == user.id).count() // 2
    
    smart_actions = build_smart_actions(
        emotion=analysis["dominant_emotion"],
        classification=analysis["classification"],
        topics=analysis.get("detected_topics", []),
        exercise=bot_suggestion if bot_suggestion else None,
        turn_count=turn_count,
        depression_score=analysis["depression_score"]
    )
    
    # Save user message
    user_msg = Message(user_id=user.id, sender="user", text=msg.text)
    db.add(user_msg)
    
    # Save bot message
    bot_message = Message(user_id=user.id, sender="bot", text=bot_text)
    db.add(bot_message)
    
    # Extract exercise title from suggestion_data if available
    exercise_title = None
    if bot_suggestion and isinstance(bot_suggestion, dict):
        exercise_title = bot_suggestion.get("title")

    # Save enriched mood log with all new fields
    mood_log = MoodLog(
        user_id=user.id,
        depression_score=analysis["depression_score"],
        dominant_emotion=analysis["dominant_emotion"],
        classification=analysis["classification"],
        stress_score=analysis.get("stress_score"),
        mood_score=analysis.get("mood_score"),
        energy_level=analysis.get("energy_level"),
        risk_level=analysis.get("risk_level"),
        confidence=analysis.get("confidence"),
        sentiment=analysis.get("sentiment"),
        exercise_recommended=exercise_title,
    )
    db.add(mood_log)
    
    # Pre-record the smart actions in the Recommendations table as generated
    for action in smart_actions:
        rec = Recommendation(
            user_id=user.id,
            recommended_module=action["type"],
            recommended_item=str(action.get("target_id", "")),
        )
        db.add(rec)
        
    db.commit()
    
    return BotResponse(
        user_id=user.id,
        text=msg.text,
        bot_response=bot_text,
        emotion=analysis["dominant_emotion"],
        classification=analysis["classification"],
        actions=bot_actions,
        suggestion_data=bot_suggestion,
        smart_actions=smart_actions
    )

@app.get("/api/users")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [{"id": u.id, "username": u.username, "created_at": u.created_at} for u in users]

class ManualMoodInput(BaseModel):
    user_id: int
    mood: str
    intensity: Optional[int] = 5
    note: Optional[str] = ""

@app.post("/api/users/{user_id}/mood")
def add_manual_mood(user_id: int, data: ManualMoodInput, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    mood_map = {
        "great": ("joy", 0.0, "Normal"),
        "good": ("joy", 0.15, "Normal"),
        "okay": ("neutral", 0.3, "Normal"),
        "bad": ("sadness", 0.6, "Moderate"),
        "awful": ("sadness", 0.85, "Severe"),
    }
    emotion, score_base, classification = mood_map.get(data.mood.lower(), ("neutral", 0.3, "Normal"))
    
    if data.note and data.note.strip():
        analysis = analyze_user_input(data.note)
        emotion = analysis["dominant_emotion"]
        score = analysis["depression_score"]
        classification = analysis["classification"]
    else:
        score = score_base
        analysis = None

    mood_log = MoodLog(
        user_id=user.id,
        depression_score=score,
        dominant_emotion=emotion,
        classification=classification,
        stress_score=analysis.get("stress_score") if analysis else None,
        mood_score=analysis.get("mood_score") if analysis else None,
        energy_level=analysis.get("energy_level") if analysis else None,
        risk_level=analysis.get("risk_level") if analysis else None,
        confidence=analysis.get("confidence") if analysis else None,
        sentiment=analysis.get("sentiment") if analysis else None,
    )
    db.add(mood_log)
    
    if data.note and data.note.strip():
        user_msg = Message(user_id=user.id, sender="user", text=f"[Mood Check-in - {data.mood.capitalize()}]: {data.note}")
        db.add(user_msg)
        
    db.commit()
    return {"success": True, "message": "Mood logged successfully", "log_id": mood_log.id}

@app.get("/api/users/{user_id}/trends")
def get_user_trends(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    mood_logs = db.query(MoodLog).filter(MoodLog.user_id == user_id).order_by(MoodLog.timestamp).all()
    history = db.query(Message).filter(Message.user_id == user_id).order_by(Message.timestamp).all()
    
    # Calculate statistics
    logs_data = []
    emotion_counts = {}
    total_score = 0.0
    
    for m in mood_logs:
        mood_value = round((1.0 - m.depression_score) * 10, 1)
        total_score += mood_value
        
        emo = m.dominant_emotion.capitalize()
        emotion_counts[emo] = emotion_counts.get(emo, 0) + 1
        
        logs_data.append({
            "id": m.id,
            "timestamp": m.timestamp.isoformat() if m.timestamp else datetime.utcnow().isoformat(),
            "score": m.depression_score,
            "mood_value": mood_value,
            "emotion": m.dominant_emotion,
            "classification": m.classification
        })
        
    total_logs = len(logs_data)
    avg_mood = round(total_score / total_logs, 1) if total_logs > 0 else 7.5
    
    return {
        "mood_logs": logs_data,
        "history": [{"sender": m.sender, "text": m.text, "timestamp": m.timestamp.isoformat() if m.timestamp else datetime.utcnow().isoformat()} for m in history],
        "summary": {
            "total_logs": total_logs,
            "average_mood": avg_mood,
            "emotion_counts": emotion_counts,
            "total_messages": len(history)
        }
    }

# ─── Dashboard endpoint ───────────────────────────────────────────────────────

@app.get("/api/dashboard/{user_id}")
def get_dashboard(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    all_logs = db.query(MoodLog).filter(MoodLog.user_id == user_id).order_by(MoodLog.timestamp).all()
    total_msgs = db.query(Message).filter(Message.user_id == user_id).count()

    if not all_logs:
        return {
            "has_data": False,
            "today_mood": None,
            "today_emotion": None,
            "today_classification": None,
            "stress_score": None,
            "stress_label": "N/A",
            "avg_weekly_mood": None,
            "total_conversations": 0,
            "chat_sessions": 0,
            "exercises_completed": 0,
            "most_frequent_emotion": None,
            "latest_recommendation": None,
            "wellness_status": "No Data",
            "recent_conversations": [],
        }

    # Today's data
    today = datetime.utcnow().date()
    today_logs = [l for l in all_logs if l.timestamp and l.timestamp.date() == today]
    last_log = all_logs[-1]

    today_mood = None
    today_emotion = last_log.dominant_emotion
    today_classification = last_log.classification
    if today_logs:
        today_mood = round(sum((1.0 - l.depression_score) * 10 for l in today_logs) / len(today_logs), 1)

    # Average stress score (today or last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    weekly_logs = [l for l in all_logs if l.timestamp and l.timestamp >= week_ago]
    
    stress_scores_valid = [l.stress_score for l in (weekly_logs or all_logs) if l.stress_score is not None]
    avg_stress = round(sum(stress_scores_valid) / len(stress_scores_valid), 1) if stress_scores_valid else None

    def stress_label(score):
        if score is None: return "N/A"
        if score >= 70: return "High"
        if score >= 40: return "Moderate"
        return "Low"

    # Weekly avg mood
    weekly_moods = [(1.0 - l.depression_score) * 10 for l in weekly_logs]
    avg_weekly_mood = round(sum(weekly_moods) / len(weekly_moods), 1) if weekly_moods else None

    # Emotion frequency
    emotion_counts: Dict[str, int] = {}
    for l in all_logs:
        e = l.dominant_emotion
        emotion_counts[e] = emotion_counts.get(e, 0) + 1
    most_frequent = max(emotion_counts, key=emotion_counts.get) if emotion_counts else None

    # Exercises completed
    exercises_completed = db.query(Recommendation).filter(
        Recommendation.user_id == user_id,
        Recommendation.completed == True,
        Recommendation.recommended_module == "exercise"
    ).count()

    # Latest recommendation
    latest_rec_log = next((l for l in reversed(all_logs) if l.exercise_recommended), None)
    latest_recommendation = latest_rec_log.exercise_recommended if latest_rec_log else None

    # Wellness status derived from last classification
    wellness_map = {"Normal": "Good", "Mild": "Fair", "Moderate": "At Risk", "Severe": "Needs Support"}
    wellness_status = wellness_map.get(last_log.classification, "Good")

    # Recent conversations (last 5 logs)
    recent = []
    for l in reversed(all_logs[-5:]):
        mood_val = round((1.0 - l.depression_score) * 10, 1)
        recent.append({
            "timestamp": l.timestamp.isoformat() if l.timestamp else None,
            "emotion": l.dominant_emotion,
            "classification": l.classification,
            "mood_value": mood_val,
            "stress_score": l.stress_score,
        })

    chat_sessions = total_msgs // 2

    return {
        "has_data": True,
        "today_mood": today_mood,
        "today_emotion": today_emotion,
        "today_classification": today_classification,
        "stress_score": avg_stress,
        "stress_label": stress_label(avg_stress),
        "avg_weekly_mood": avg_weekly_mood,
        "total_conversations": len(all_logs),
        "chat_sessions": chat_sessions,
        "exercises_completed": exercises_completed,
        "most_frequent_emotion": most_frequent,
        "latest_recommendation": latest_recommendation,
        "wellness_status": wellness_status,
        "recent_conversations": recent,
    }

# ─── Analytics endpoint ───────────────────────────────────────────────────────

@app.get("/api/analytics/{user_id}")
def get_analytics(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    all_logs = db.query(MoodLog).filter(MoodLog.user_id == user_id).order_by(MoodLog.timestamp).all()
    total_msgs = db.query(Message).filter(Message.user_id == user_id).count()

    if not all_logs:
        return {"has_data": False, "weekly_trend": [], "monthly_trend": [], "emotion_distribution": [], "summary_stats": {}}

    # Weekly trend (last 7 days)
    weekly_trend = []
    for i in range(6, -1, -1):
        day = datetime.utcnow().date() - timedelta(days=i)
        day_logs = [l for l in all_logs if l.timestamp and l.timestamp.date() == day]
        if day_logs:
            avg_mood = round(sum((1.0 - l.depression_score) * 10 for l in day_logs) / len(day_logs), 1)
            avg_stress = round(sum(l.stress_score or 0 for l in day_logs) / len(day_logs), 1)
            energy_counts: Dict[str, int] = {}
            for l in day_logs:
                e = l.energy_level or "Medium"
                energy_counts[e] = energy_counts.get(e, 0) + 1
            energy = max(energy_counts, key=energy_counts.get)
            energy_val = {"Low": 30, "Medium": 60, "High": 90}.get(energy, 60)
        else:
            avg_mood = None
            avg_stress = None
            energy_val = None

        weekly_trend.append({
            "day": day.strftime("%a"),
            "date": day.isoformat(),
            "mood": avg_mood,
            "stress": avg_stress,
            "energy": energy_val,
        })

    # Monthly trend (last 4 weeks)
    monthly_trend = []
    for w in range(4, 0, -1):
        start = datetime.utcnow() - timedelta(weeks=w)
        end = datetime.utcnow() - timedelta(weeks=w - 1)
        week_logs = [l for l in all_logs if l.timestamp and start <= l.timestamp <= end]
        avg_mood = round(sum((1.0 - l.depression_score) * 10 for l in week_logs) / len(week_logs), 1) if week_logs else None
        avg_stress = round(sum(l.stress_score or 0 for l in week_logs) / len(week_logs), 1) if week_logs else None
        monthly_trend.append({
            "week": f"Week {5 - w}",
            "mood": avg_mood,
            "stress": avg_stress,
        })

    # Emotion distribution
    emotion_counts: Dict[str, int] = {}
    for l in all_logs:
        e = l.dominant_emotion.capitalize()
        emotion_counts[e] = emotion_counts.get(e, 0) + 1
    total_emo = sum(emotion_counts.values())
    emotion_distribution = [
        {"emotion": e, "count": c, "percentage": round(c / total_emo * 100, 1)}
        for e, c in sorted(emotion_counts.items(), key=lambda x: -x[1])
    ]

    # Activity timeline (daily chat message counts last 30 days)
    activity_timeline = []
    for i in range(29, -1, -1):
        day = datetime.utcnow().date() - timedelta(days=i)
        count = sum(1 for l in all_logs if l.timestamp and l.timestamp.date() == day)
        activity_timeline.append({"date": day.isoformat(), "day": day.strftime("%a"), "sessions": count})

    # Summary stats
    total_logs = len(all_logs)
    avg_mood_all = round(sum((1.0 - l.depression_score) * 10 for l in all_logs) / total_logs, 1)
    stress_vals = [l.stress_score for l in all_logs if l.stress_score is not None]
    avg_stress_all = round(sum(stress_vals) / len(stress_vals), 1) if stress_vals else None
    recovery = min(100, round(avg_mood_all * 9 + total_logs * 0.5))
    exercises_done = db.query(Recommendation).filter(
        Recommendation.user_id == user_id,
        Recommendation.completed == True,
        Recommendation.recommended_module == "exercise"
    ).count()
    exercises_rec = db.query(Recommendation).filter(
        Recommendation.user_id == user_id,
        Recommendation.recommended_module == "exercise"
    ).count()
    exercise_pct = round(exercises_done / exercises_rec * 100) if exercises_rec else (100 if exercises_done else 0)
    chat_sessions = total_msgs // 2

    summary_stats = {
        "avg_mood": avg_mood_all,
        "avg_stress": avg_stress_all,
        "recovery_progress": recovery,
        "exercise_completion": exercise_pct,
        "exercises_completed": exercises_done,
        "total_logs": total_logs,
        "chat_sessions": chat_sessions,
    }

    return {
        "has_data": True,
        "weekly_trend": weekly_trend,
        "monthly_trend": monthly_trend,
        "emotion_distribution": emotion_distribution,
        "activity_timeline": activity_timeline,
        "summary_stats": summary_stats,
    }

# ─── Reports endpoint ─────────────────────────────────────────────────────────

@app.get("/api/reports/{user_id}")
def get_reports(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    all_logs = db.query(MoodLog).filter(MoodLog.user_id == user_id).order_by(MoodLog.timestamp).all()
    total_msgs = db.query(Message).filter(Message.user_id == user_id).count()

    if not all_logs:
        return {"has_data": False}

    total_logs = len(all_logs)
    avg_mood = round(sum((1.0 - l.depression_score) * 10 for l in all_logs) / total_logs, 1)
    stress_vals = [l.stress_score for l in all_logs if l.stress_score is not None]
    avg_stress = round(sum(stress_vals) / len(stress_vals), 1) if stress_vals else 50.0
    recovery = min(100, round(avg_mood * 9 + total_logs * 0.5))
    exercises_done = db.query(Recommendation).filter(
        Recommendation.user_id == user_id,
        Recommendation.completed == True,
        Recommendation.recommended_module == "exercise"
    ).count()
    exercises_rec = db.query(Recommendation).filter(
        Recommendation.user_id == user_id,
        Recommendation.recommended_module == "exercise"
    ).count()
    exercise_pct = round(exercises_done / exercises_rec * 100) if exercises_rec else (100 if exercises_done else 0)
    chat_sessions = total_msgs // 2

    # Dominant emotion for recommendations
    emotion_counts: Dict[str, int] = {}
    for l in all_logs:
        e = l.dominant_emotion
        emotion_counts[e] = emotion_counts.get(e, 0) + 1
    dominant_emotion = max(emotion_counts, key=emotion_counts.get) if emotion_counts else "neutral"

    rec_map = {
        "sadness":    "Continue daily mindfulness sessions and gentle journaling to process difficult emotions.",
        "anxiety":    "Practice box breathing or 4-7-8 breathing exercises daily to regulate your nervous system.",
        "stress":     "Schedule short breaks and set boundaries with tasks. Even 5-minute walks significantly reduce cortisol.",
        "anger":      "Use grounding techniques and body-based exercises to discharge emotional tension safely.",
        "loneliness": "Consider reaching out to one person you trust. Small acts of connection matter greatly.",
        "burnout":    "Rest is not a luxury — prioritise intentional recovery time and limit non-essential commitments.",
        "joy":        "Your positive momentum is a strength. Journal what's working so you can return to it.",
        "neutral":    "Maintain your consistent check-ins and explore wellness exercises in the app.",
    }

    recommendations = [
        rec_map.get(dominant_emotion, rec_map["neutral"]),
        "Share this report with your healthcare provider for professional context.",
        "Schedule a follow-up assessment in 2 weeks to track progress.",
        "Increase exercise frequency if currently below 3 sessions per week.",
        "Maintain journaling habit for improved emotional clarity and self-awareness.",
    ]

    key_metrics = [
        {"metric": "Average Mood Score", "value": f"{avg_mood}/10", "status": "Good" if avg_mood >= 6 else "Needs Attention"},
        {"metric": "Stress Level", "value": f"{avg_stress}/100", "status": "Low" if avg_stress < 40 else ("Moderate" if avg_stress < 70 else "High")},
        {"metric": "Recovery Progress", "value": f"{recovery}%", "status": "Good" if recovery >= 60 else "Fair"},
        {"metric": "Exercise Completion", "value": f"{exercise_pct}%", "status": "Excellent" if exercise_pct >= 80 else ("Good" if exercise_pct >= 50 else "Low")},
        {"metric": "Chat Sessions", "value": f"{chat_sessions} sessions", "status": "Active" if chat_sessions >= 5 else "Getting Started"},
        {"metric": "Mood Logs", "value": f"{total_logs} entries", "status": "Active" if total_logs >= 10 else "Getting Started"},
    ]

    period_start = all_logs[0].timestamp.strftime("%b %d, %Y") if all_logs[0].timestamp else "N/A"
    period_end = all_logs[-1].timestamp.strftime("%b %d, %Y") if all_logs[-1].timestamp else "N/A"

    return {
        "has_data": True,
        "period_start": period_start,
        "period_end": period_end,
        "avg_mood": avg_mood,
        "avg_stress": avg_stress,
        "recovery_progress": recovery,
        "exercise_completion": exercise_pct,
        "chat_sessions": chat_sessions,
        "total_logs": total_logs,
        "dominant_emotion": dominant_emotion,
        "key_metrics": key_metrics,
        "recommendations": recommendations,
    }


# Provide fallback to serve index.html for unknown routes if we use a Single Page App (SPA)
from fastapi.responses import HTMLResponse
@app.get("/", response_class=HTMLResponse)
def get_index():
    path = "static/index.html"
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    return "<h1>API running. Frontend static/index.html not found.</h1>"


# ─── Recommendation Endpoints ──────────────────────────────────────────────────

class RecommendationInput(BaseModel):
    user_id: int
    recommended_module: str
    recommended_item: str

@app.post("/api/recommendations")
def create_recommendation(data: RecommendationInput, db: Session = Depends(get_db)):
    rec = Recommendation(
        user_id=data.user_id,
        recommended_module=data.recommended_module,
        recommended_item=data.recommended_item
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return {"success": True, "id": rec.id}

@app.patch("/api/recommendations/{rec_id}/click")
def mark_recommendation_clicked(rec_id: int, db: Session = Depends(get_db)):
    rec = db.query(Recommendation).filter(Recommendation.id == rec_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    rec.clicked = True
    db.commit()
    return {"success": True}

@app.patch("/api/recommendations/{rec_id}/complete")
def mark_recommendation_completed(rec_id: int, db: Session = Depends(get_db)):
    rec = db.query(Recommendation).filter(Recommendation.id == rec_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    rec.completed = True
    rec.completion_time = datetime.utcnow()
    db.commit()
    return {"success": True}
