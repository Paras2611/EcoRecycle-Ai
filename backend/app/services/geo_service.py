import math
from typing import Tuple

EARTH_RADIUS_KM = 6371.0

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great-circle distance between two points on the Earth
    in kilometers using the Haversine formula (PRD Section 15).
    """
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    distance = EARTH_RADIUS_KM * c
    return round(distance, 2)

def calculate_bounding_box(latitude: float, longitude: float, radius_km: float) -> Tuple[float, float, float, float]:
    """
    Calculate bounding box min_lat, max_lat, min_lon, max_lon for rough indexing.
    """
    delta_lat = radius_km / 111.0
    delta_lon = radius_km / (111.0 * math.cos(math.radians(latitude)))
    return (
        latitude - delta_lat,
        latitude + delta_lat,
        longitude - delta_lon,
        longitude + delta_lon
    )
