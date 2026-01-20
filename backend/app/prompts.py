def explain_priority(subject: str, days_left: int) -> str:
    if days_left <= 3:
        return f"{subject} exam is very close, requires immediate focus."
    elif days_left <= 7:
        return f"{subject} exam is approaching, needs consistent revision."
    else:
        return f"{subject} exam is later, can be revised after higher priority subjects."