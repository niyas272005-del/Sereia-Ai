"""
smart_action_builder.py
━━━━━━━━━━━━━━━━━━━━━━
Generates Smart Action Cards based on AI conversation context.
"""

def build_smart_actions(emotion: str, classification: str, topics: list[str], exercise: dict | None, turn_count: int, depression_score: float) -> list[dict]:
    actions = []
    
    # Priority 1: Exercise
    if exercise:
        title = exercise.get("title") or exercise.get("relaxation_title", "Wellness Exercise")
        desc = exercise.get("description") or exercise.get("relaxation_desc") or ("Helps manage " + str(exercise.get("mapped_emotion", "stress")))
        emoji = exercise.get("emoji", "✨")
        gradient = exercise.get("gradient", "from-indigo-500 to-violet-600")
        duration = exercise.get("duration", "3-5 mins")

        actions.append({
            "type": "exercise",
            "title": title,
            "subtitle": "Recommended Exercise",
            "duration": duration,
            "benefit": desc,
            "emoji": emoji,
            "gradient": gradient,
            "route": "/dashboard/wellness",
            "target_id": title
        })
        
    # Priority 2: Journal
    if emotion in ["sadness", "loneliness", "burnout"]:
        actions.append({
            "type": "journal",
            "title": "Today's Reflection",
            "subtitle": "Recommended Journal",
            "duration": "2 mins",
            "benefit": "Helps process feelings of " + emotion,
            "emoji": "📝",
            "gradient": "from-blue-500 to-cyan-500",
            "route": "/dashboard/journal",
            "target_id": "today"
        })
        
    # Priority 3: Assessment
    if classification in ["Moderate", "Severe"] or any(t in topics for t in ["anxiety", "panic", "sleep", "burnout"]):
        assessment_id = "phq9"
        title = "PHQ-9 Depression Assessment"
        if emotion == "anxiety" or "anxiety" in topics or "panic" in topics:
            assessment_id = "gad7"
            title = "GAD-7 Anxiety Assessment"
        elif "sleep" in topics:
            assessment_id = "sleep"
            title = "Sleep Quality Assessment"
        elif "burnout" in topics or "work_school" in topics:
            assessment_id = "stress"
            title = "Perceived Stress Test"
            
        actions.append({
            "type": "assessment",
            "title": title,
            "subtitle": "Recommended Assessment",
            "duration": "3-5 mins",
            "benefit": "Helps understand your current state",
            "emoji": "🧠",
            "gradient": "from-purple-500 to-pink-500",
            "route": "/dashboard/assessments",
            "target_id": assessment_id
        })
        
    # Priority 4: Mood Tracker (always when emotion changes/present)
    if not any(a["type"] == "mood" for a in actions):
        actions.append({
            "type": "mood",
            "title": "Mood Updated",
            "subtitle": "Current Emotion: " + emotion.capitalize(),
            "duration": "View Tracker",
            "benefit": "Track your emotional journey",
            "emoji": "📊",
            "gradient": "from-emerald-500 to-teal-500",
            "route": "/dashboard/mood",
            "target_id": "today"
        })
    
    # Priority 5: Analytics
    if turn_count > 3 and emotion == "joy":
        actions.append({
            "type": "analytics",
            "title": "Positive Pattern Detected",
            "subtitle": "Insight Card",
            "duration": "View Insights",
            "benefit": "Your mood is improving",
            "emoji": "📈",
            "gradient": "from-amber-400 to-orange-500",
            "route": "/dashboard/analytics",
            "target_id": "mood_trend"
        })
        
    # Priority 6: Report
    if classification == "Severe":
        actions.append({
            "type": "report",
            "title": "Progress Report",
            "subtitle": "View your long-term progress",
            "duration": "View Report",
            "benefit": "Share with a professional",
            "emoji": "📋",
            "gradient": "from-slate-500 to-slate-700",
            "route": "/dashboard/reports",
            "target_id": "latest"
        })

    # Limit to 3 cards max
    return actions[:3]
