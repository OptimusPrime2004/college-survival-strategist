def get_subject_difficulty(subject: str) -> int:
    """
    Returns difficulty score:
    1 = Easy
    2 = Medium
    3 = Hard
    """

    subject = subject.lower()

    hard_keywords = [
        "os", "operating", "dbms", "database",
        "cn", "network", "networks",
        "algorithm", "algorithms",
        "data structures", "compiler",
        "math", "calculus", "linear algebra"
    ]

    medium_keywords = [
        "java", "python", "c++", "programming",
        "software", "engineering",
        "web", "javascript"
    ]

    if any(k in subject for k in hard_keywords):
        return 3
    if any(k in subject for k in medium_keywords):
        return 2

    return 1