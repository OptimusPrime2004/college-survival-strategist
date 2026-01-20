from pydantic import BaseModel
from typing import List, Dict, Union

class AnalyzeRequest(BaseModel):
    subjects: List[str]
    exam_dates: List[str]
    attendance: int
    daily_hours: int

class PriorityExplanation(BaseModel):
    subject: str
    reason: str

class AnalyzeResponse(BaseModel):
    risk_level: str
    subject_priority: List[str]
    priority_explanations: List[PriorityExplanation]
    weekly_plan: List[str]
    resources: Dict[str, Dict[str, Union[List[str], str]]]