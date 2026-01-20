async def get_resources_for_subject(subject: str):
    base = subject.lower()

    generic_resources = {
        "youtube": [
            f"{subject} full course",
            f"{subject} exam revision"
        ],
        "strategy": f"Focus on fundamentals and past exam questions for {subject}."
    }

    tech_overrides = {
        "dbms": {
            "youtube": ["Gate Smashers DBMS", "Jenny DBMS"],
            "strategy": "SQL, normalization, and transactions are high scoring."
        },
        "os": {
            "youtube": ["Gate Smashers OS", "Abdul Bari OS"],
            "strategy": "Focus on scheduling, memory, and deadlocks."
        },
        "java": {
            "youtube": ["Telusko Java", "Kunal Kushwaha Java"],
            "strategy": "Revise OOPs, collections, and exception handling."
        }
    }

    return tech_overrides.get(base, generic_resources)