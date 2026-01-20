from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# -----------------------------
# CORS (important for Vercel)
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Request Model
# -----------------------------
class AnalyzeRequest(BaseModel):
    subjects: List[str]
    exam_dates: List[str]  # YYYY-MM-DD
    attendance: int
    daily_hours: int


# -----------------------------
# Health Check
# -----------------------------
@app.get("/")
def root():
    return {"status": "ok"}


# -----------------------------
# Main Logic
# -----------------------------
@app.post("/analyze")
def analyze(data: AnalyzeRequest):
    try:
        subjects = data.subjects
        exam_dates = data.exam_dates
        attendance = data.attendance
        daily_hours = data.daily_hours

        # Basic validation
        if not subjects or not exam_dates:
            raise ValueError("Subjects and exam dates cannot be empty")

        if len(subjects) != len(exam_dates):
            raise ValueError("Subjects and exam dates count must match")

        # Parse dates safely
        parsed_dates = [
            datetime.strptime(d, "%Y-%m-%d") for d in exam_dates
        ]

        today = datetime.today()

        # Calculate urgency
        subject_plan = []
        for subject, exam_date in zip(subjects, parsed_dates):
            days_left = max((exam_date - today).days, 0)

            priority = "High" if days_left <= 7 else "Medium" if days_left <= 14 else "Low"

            subject_plan.append({
                "subject": subject,
                "exam_date": exam_date.strftime("%Y-%m-%d"),
                "days_left": days_left,
                "priority": priority,
                "recommended_daily_hours": round(daily_hours / len(subjects), 1),
            })

        return {
            "success": True,
            "attendance": attendance,
            "daily_study_hours": daily_hours,
            "plan": subject_plan,
        }

    except Exception as e:
        # This prevents silent crashes & 422 confusion
        raise HTTPException(status_code=400, detail=str(e))