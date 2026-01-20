from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import datetime
from app.agent import generate_survival_plan

app = FastAPI()

# CORS (allow frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://college-survival-strategist.vercel.app",
        "http://localhost:5173",
        "http://localhost:5174",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- MODELS ----------

class PlanRequest(BaseModel):
    subjects: List[str]
    exam_dates: List[str]
    attendance_percentage: int
    daily_study_hours: int


# ---------- ROUTES ----------

@app.get("/")
def health():
    return {"status": "ok"}


@app.post("/analyze")
async def analyze(req: PlanRequest):
    try:
        result = await generate_survival_plan(req)
        
        # Convert agent response to frontend-expected format
        plan = [
            {
                "subject": subject["name"],
                "days_left": subject["days_to_exam"],
                "urgency_score": subject["urgency_score"],
                "difficulty": subject["difficulty"],
                "priority_score": subject["priority_score"],
                "reason": subject["reason"]
            }
            for subject in result["priority_debug"]
        ]
        
        return {
            "summary": f"Study plan generated successfully. Risk level: {result['risk_level']}",
            "risk_level": result["risk_level"],
            "attendance_advice": result["attendance_advice"],
            "weekly_plan": result["weekly_plan"],
            "resources": result["resources"],
            "plan": plan
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating plan: {str(e)}")

