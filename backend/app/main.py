from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import datetime

app = FastAPI()

# CORS (allow frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- MODELS ----------

class AnalyzeRequest(BaseModel):
    subjects: List[str]
    exam_dates: List[str]  # YYYY-MM-DD
    attendance: int
    daily_hours: int


# ---------- ROUTES ----------

@app.get("/")
def health():
    return {"status": "ok"}


@app.post("/analyze")
def analyze(data: AnalyzeRequest):
    try:
        subjects = [s.strip() for s in data.subjects]
        dates = [datetime.strptime(d, "%Y-%m-%d") for d in data.exam_dates]

        if len(subjects) != len(dates):
            raise HTTPException(
                status_code=422,
                detail="Subjects and exam dates count mismatch"
            )

        today = datetime.today()

        # Calculate days left per subject
        plan = []
        for subject, exam_date in zip(subjects, dates):
            days_left = (exam_date - today).days
            urgency = max(1, 30 - days_left)

            plan.append({
                "subject": subject,
                "days_left": days_left,
                "urgency_score": urgency
            })

        # Sort by urgency
        plan.sort(key=lambda x: x["urgency_score"], reverse=True)

        return {
            "summary": "Study plan generated successfully",
            "daily_hours": data.daily_hours,
            "attendance": data.attendance,
            "plan": plan
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))