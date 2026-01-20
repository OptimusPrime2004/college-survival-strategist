from datetime import datetime
from app.difficulty_agent import get_subject_difficulty
from app.resource_agent import get_resources_for_subject


async def generate_survival_plan(data):
    # ----------------------------
    # INPUT NORMALIZATION
    # ----------------------------
    subjects = [s.strip().lower() for s in data.subjects]
    exam_dates = data.exam_dates
    attendance = data.attendance_percentage

    if len(subjects) != len(exam_dates):
        raise ValueError(
            "Each subject must have a corresponding exam date."
        )

    today = datetime.today().date()
    subject_objects = []

    # ----------------------------
    # SUBJECT ↔ EXAM PAIRING (FIXED)
    # ----------------------------
    for i in range(len(subjects)):
        subject = subjects[i]
        exam_date_str = exam_dates[i]

        exam_date = datetime.strptime(exam_date_str, "%Y-%m-%d").date()
        days_to_exam = max(1, (exam_date - today).days)

        urgency_score = max(1, 30 - days_to_exam)
        difficulty = await get_subject_difficulty(subject)

        priority_score = round(
            (urgency_score * 0.7) + (difficulty * 0.3),
            2
        )

        subject_objects.append({
            "name": subject,
            "exam_date": exam_date_str,
            "days_to_exam": days_to_exam,
            "difficulty": difficulty,
            "urgency_score": urgency_score,
            "priority_score": priority_score,
            "reason": (
                f"Exam in {days_to_exam} days, "
                f"difficulty level {difficulty}"
            )
        })

    # ----------------------------
    # SORT BY PRIORITY
    # ----------------------------
    subject_objects.sort(
        key=lambda x: x["priority_score"],
        reverse=True
    )

    subject_priority = [s["name"] for s in subject_objects]

    # ----------------------------
    # RISK LOGIC (CORRECT)
    # ----------------------------
    if attendance >= 85:
        risk_level = "Low"
    elif attendance >= 75:
        risk_level = "Medium"
    else:
        risk_level = "High"

    if attendance >= 85:
        attendance_advice = "Your attendance is strong. Maintain consistency."
    elif attendance >= 75:
        attendance_advice = (
            "Attendance is acceptable, but avoid unnecessary absences."
        )
    else:
        attendance_advice = (
            "Attendance is below the safe threshold. "
            "Prioritize classes immediately."
        )

    # ----------------------------
    # WEEKLY PLAN
    # ----------------------------
    weekly_plan = [
        "Day 1: Focus on highest priority subject",
        "Day 2: Revise second priority subject",
        "Day 3: Practice previous exam questions",
        "Day 4: Light revision + attendance recovery",
        "Day 5: Full syllabus revision",
        "Day 6: Weak areas practice",
        "Day 7: Rest + light review",
    ]

    # ----------------------------
    # RESOURCE GENERATION (NEW)
    # ----------------------------
    TOP_K = 2  # only high-priority subjects
    resources = {}

    for subject in subject_objects[:TOP_K]:
        resources[subject["name"]] = await get_resources_for_subject(
            subject["name"]
        )

    # ----------------------------
    # FINAL RESPONSE
    # ----------------------------
    return {
        "risk_level": risk_level,
        "subject_priority": subject_priority,
        "priority_debug": subject_objects,
        "weekly_plan": weekly_plan,
        "attendance_advice": attendance_advice,
        "resources": resources
    }
