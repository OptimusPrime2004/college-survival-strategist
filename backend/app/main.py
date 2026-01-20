from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import List

app = FastAPI()

# -------------------------
# CORS (for frontend)
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Request / Response Models
# -------------------------
class AnalyzeRequest(BaseModel):
    subjects: List[str]
    exam_dates: List[str]  # YYYY-MM-DD
    attendance: int
    daily_hours: int


class AnalyzeResponse(BaseModel):
    risk_level: str
    subject_priority: List[str]
    weekly_plan: List[str]


# -------------------------
# Helper Functions
# -------------------------
def calculate_risk(attendance: int, daily_hours: int) -> str:
    if attendance < 65 or daily_hours < 2:
        return "High"
    if attendance < 75 or daily_hours < 3:
        return "Medium"
    return "Low"


def sort_subjects_by_exam_date(subjects: List[str], exam_dates: List[str]) -> List[str]:
    parsed = []
    for subject, date_str in zip(subjects, exam_dates):
        try:
            date_obj = datetime.strptime(date_str.strip(), "%Y-%m-%d")
            parsed.append((subject.strip().lower(), date_obj))
        except ValueError:
            # If date parsing fails, push subject to end
            parsed.append((subject.strip().lower(), datetime.max))

    parsed.sort(key=lambda x: x[1])
    return [s[0] for s in parsed]


def build_weekly_plan(priorities: List[str]) -> List[str]:
    plan = []
    days = [
        "Day 1", "Day 2", "Day 3", "Day 4",
        "Day 5", "Day 6", "Day 7"
    ]

    for i, day in enumerate(days):
        subject = priorities[i % len(priorities)]
        if i == 5:
            plan.append(f"{day}: Practice questions + mock tests for {subject}")
        elif i == 6:
            plan.append(f"{day}: Light revision + rest ({subject})")
        else:
            plan.append(f"{day}: Focus on {subject}")

    return plan


# -------------------------
# API Endpoint
# -------------------------
@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest):
    # Validate lengths
    if len(request.subjects) != len(request.exam_dates):
        return AnalyzeResponse(
            risk_level="Error",
            subject_priority=[],
            weekly_plan=[]
        )

    # Risk calculation
    risk_level = calculate_risk(
        request.attendance,
        request.daily_hours
    )

    # Priority by exam urgency
    subject_priority = sort_subjects_by_exam_date(
        request.subjects,
        request.exam_dates
    )

    # Weekly survival plan
    weekly_plan = build_weekly_plan(subject_priority)

    return AnalyzeResponse(
        risk_level=risk_level,
        subject_priority=subject_priority,
        weekly_plan=weekly_plan
    )


# -------------------------
# Health Check
# -------------------------
@app.get("/")
def health():
    return {"status": "ok"}