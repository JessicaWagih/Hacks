"""
Simple, explainable matching algorithm - good enough for a hackathon demo
and easy to talk through with judges.

Score = weighted mix of:
  - description similarity (text overlap)
  - location similarity (exact / partial string match)
  - date/time closeness (within a 7-day window)

Threshold (0.45) decides if it counts as a "match".
Tune WEIGHTS or THRESHOLD live during the demo if needed.
"""

from difflib import SequenceMatcher
from datetime import timedelta

WEIGHTS = {"description": 0.5, "location": 0.3, "date": 0.2}
THRESHOLD = 0.45
DATE_WINDOW_DAYS = 7


def text_similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio()


def location_similarity(a: str, b: str) -> float:
    a, b = a.lower().strip(), b.lower().strip()
    if a == b:
        return 1.0
    if a in b or b in a:
        return 0.7
    return text_similarity(a, b)


def date_similarity(a, b) -> float:
    diff = abs((a - b).total_seconds()) / 86400  # days apart
    if diff > DATE_WINDOW_DAYS:
        return 0.0
    return 1 - (diff / DATE_WINDOW_DAYS)


def score_pair(lost_item, found_item) -> float:
    d_score = text_similarity(lost_item.description, found_item.description)
    l_score = location_similarity(lost_item.location, found_item.location)
    t_score = date_similarity(lost_item.date_time, found_item.date_time)

    return (
        d_score * WEIGHTS["description"]
        + l_score * WEIGHTS["location"]
        + t_score * WEIGHTS["date"]
    )


def find_matches_for_lost_item(lost_item, found_items):
    """Returns list of (found_item, score) sorted best-first, above threshold only."""
    scored = []
    for found_item in found_items:
        score = score_pair(lost_item, found_item)
        if score >= THRESHOLD:
            scored.append((found_item, score))
    scored.sort(key=lambda pair: pair[1], reverse=True)
    return scored
