from difflib import SequenceMatcher
from datetime import datetime
from math import radians, sin, cos, sqrt, atan2


WEIGHTS = {
    "description": 0.50,
    "location": 0.30,
    "date": 0.20,
}

THRESHOLD = 0.45

DATE_WINDOW_DAYS = 7

MAX_LOCATION_DISTANCE_KM = 5.0


# DESCRIPTION

def text_similarity(a: str, b: str) -> float:
    if not a or not b:
        return 0.0

    return SequenceMatcher(
        None,
        a.lower().strip(),
        b.lower().strip()
    ).ratio()


# DATE/TIME

def parse_datetime(date_string: str, time_string: str):
    try:
        return datetime.fromisoformat(
            f"{date_string}T{time_string}"
        )
    except ValueError:
        return None


def date_similarity(
    lost_date: str,
    lost_time: str,
    found_date: str,
    found_time: str,
) -> float:

    lost_dt = parse_datetime(lost_date, lost_time)
    found_dt = parse_datetime(found_date, found_time)

    if not lost_dt or not found_dt:
        return 0.0

    diff = abs(
        (lost_dt - found_dt).total_seconds()
    ) / 86400

    if diff > DATE_WINDOW_DAYS:
        return 0.0

    return 1 - (diff / DATE_WINDOW_DAYS)




# GEOGRAPHIC DISTANCE

def haversine_distance_km(
    lat1,
    lon1,
    lat2,
    lon2,
):
    """
    Calculates distance between two coordinates.
    """

    if None in (lat1, lon1, lat2, lon2):
        return None

    earth_radius_km = 6371.0

    lat1 = radians(lat1)
    lat2 = radians(lat2)

    delta_lat = radians(lat2 - lat1)
    delta_lon = radians(lon2 - radians(lon1))

    a = (
        sin(delta_lat / 2) ** 2
        + cos(lat1)
        * cos(lat2)
        * sin(delta_lon / 2) ** 2
    )

    c = 2 * atan2(
        sqrt(a),
        sqrt(1 - a)
    )

    return earth_radius_km * c


def location_similarity(lost_item, found_item):

    distance = haversine_distance_km(
        lost_item.latitude,
        lost_item.longitude,
        found_item.latitude,
        found_item.longitude,
    )

    # use actual distance If coordinates are available
    if distance is not None:

        if distance > MAX_LOCATION_DISTANCE_KM:
            return 0.0

        return max(
            0.0,
            1 - ( distance / MAX_LOCATION_DISTANCE_KM )
        )

    # Fallback to text comparison.
    return text_similarity(
        lost_item.location,
        found_item.location
    )



# MATCH SCORE

def score_pair(
    lost_item,
    found_item,
):

    description_score = text_similarity(
        lost_item.description,
        found_item.description,
    )

    location_score = location_similarity(
        lost_item,
        found_item,
    )

    date_score = date_similarity(
        lost_item.lost_date,
        lost_item.lost_time,
        found_item.found_date,
        found_item.found_time,
    )

    score = (
        description_score
        * WEIGHTS["description"]
        +
        location_score
        * WEIGHTS["location"]
        +
        date_score
        * WEIGHTS["date"]
    )

    return score



# FIND MATCHES

def find_matches_for_lost_item(
    lost_item,
    found_items,
):

    scored = []

    for found_item in found_items:

        # Don't match a user's item against their own report.
        if lost_item.user_id == found_item.user_id:
            continue

        score = score_pair(
            lost_item,
            found_item,
        )

        if score >= THRESHOLD:

            scored.append(
                (
                    found_item,
                    score
                )
            )

    scored.sort(
        key=lambda pair: pair[1],
        reverse=True
    )

    return scored