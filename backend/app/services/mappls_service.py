import os
import time
import urllib.request
import urllib.parse
import json
from typing import Dict, Any, Optional
from backend.app.services.geo_service import haversine_distance

# Pre-seeded local Indian localities to avoid calling paid API for known points
PRE_SEEDED_LOCALITIES = {
    (17.288, 74.192): {
        "formatted_address": "Karad, Satara District, Maharashtra, 415110, India",
        "locality": "Karad",
        "district": "Satara",
        "state": "Maharashtra",
        "pincode": "415110",
        "source": "pre_seeded_cache"
    },
    (17.681, 74.018): {
        "formatted_address": "Satara, Satara District, Maharashtra, 415001, India",
        "locality": "Satara",
        "district": "Satara",
        "state": "Maharashtra",
        "pincode": "415001",
        "source": "pre_seeded_cache"
    },
    (16.705, 74.243): {
        "formatted_address": "Kolhapur, Kolhapur District, Maharashtra, 416003, India",
        "locality": "Kolhapur",
        "district": "Kolhapur",
        "state": "Maharashtra",
        "pincode": "416003",
        "source": "pre_seeded_cache"
    },
    (16.852, 74.582): {
        "formatted_address": "Sangli, Sangli District, Maharashtra, 416416, India",
        "locality": "Sangli",
        "district": "Sangli",
        "state": "Maharashtra",
        "pincode": "416416",
        "source": "pre_seeded_cache"
    },
    (18.520, 73.857): {
        "formatted_address": "Pune, Pune District, Maharashtra, 411001, India",
        "locality": "Pune",
        "district": "Pune",
        "state": "Maharashtra",
        "pincode": "411001",
        "source": "pre_seeded_cache"
    },
}

class MapplsService:
    def __init__(self):
        self.api_key = os.environ.get("MAPPLS_API_KEY", "vsigazhrbgssyvwteecwxjllwdyiyyygjlri")
        self.client_secret = os.environ.get("MAPPLS_CLIENT_SECRET", "")
        
        # Quota-protection memory caches
        self._reverse_cache: Dict[tuple, Dict[str, Any]] = dict(PRE_SEEDED_LOCALITIES)
        self._distance_cache: Dict[str, Dict[str, Any]] = {}
        
        # Usage metrics to track API expense
        self.stats = {
            "api_requests_made": 0,
            "cache_hits": 0,
            "errors_handled": 0
        }

    def _round_coords(self, lat: float, lon: float) -> tuple:
        """Round coordinates to 3 decimal places (~110m) to maximize cache hits."""
        return (round(lat, 3), round(lon, 3))

    def get_status(self) -> Dict[str, Any]:
        """Return service configuration and usage metrics."""
        return {
            "api_key_configured": bool(self.api_key),
            "api_key_masked": f"{self.api_key[:6]}...{self.api_key[-4:]}" if self.api_key else None,
            "cached_locations_count": len(self._reverse_cache),
            "cached_distances_count": len(self._distance_cache),
            "metrics": self.stats,
            "cost_guard_active": True
        }

    def reverse_geocode(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Reverse geocode latitude & longitude with strict caching to preserve quota.
        """
        key = self._round_coords(lat, lon)
        
        # 1. Check memory cache (includes pre-seeded hubs)
        if key in self._reverse_cache:
            self.stats["cache_hits"] += 1
            result = dict(self._reverse_cache[key])
            result["cache_hit"] = True
            return result

        # 2. If not cached, call Mappls Reverse Geocoding API if key configured
        if not self.api_key:
            return self._fallback_locality(lat, lon, "No API key configured")

        url = f"https://apis.mappls.com/advancedmaps/v1/{self.api_key}/rev_geocode?lat={lat}&lng={lon}"
        headers = {"User-Agent": "EcoRecycleAI/1.0 (Resource-Conscious Integration)"}
        
        try:
            self.stats["api_requests_made"] += 1
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=4.0) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                
                # Parse Mappls response
                results = data.get("results", [])
                if results:
                    first = results[0]
                    formatted = first.get("formatted_address", f"{lat:.4f}°N, {lon:.4f}°E")
                    locality_data = {
                        "formatted_address": formatted,
                        "locality": first.get("locality", "Regional Hub"),
                        "district": first.get("district", "Maharashtra"),
                        "state": first.get("state", "Maharashtra"),
                        "pincode": first.get("pincode", ""),
                        "source": "mappls_live",
                        "cache_hit": False
                    }
                    # Save to cache to prevent any future paid calls for this zone
                    self._reverse_cache[key] = locality_data
                    return locality_data
                else:
                    return self._fallback_locality(lat, lon, "No results returned by Mappls")

        except Exception as e:
            self.stats["errors_handled"] += 1
            # Graceful fallback without crashing or retrying repeatedly
            fallback = self._fallback_locality(lat, lon, f"Mappls fallback: {str(e)[:60]}")
            # Cache the fallback briefly so transient network errors don't trigger repeated failed hits
            self._reverse_cache[key] = fallback
            return fallback

    def get_driving_distance(self, origin_lat: float, origin_lon: float, dest_lat: float, dest_lon: float) -> Dict[str, Any]:
        """
        Calculate route distance between origin and facility.
        Uses cached road distance or free mathematical Haversine with standard road factor.
        """
        orig_key = self._round_coords(origin_lat, origin_lon)
        dest_key = self._round_coords(dest_lat, dest_lon)
        cache_id = f"{orig_key[0]},{orig_key[1]}->{dest_key[0]},{dest_key[1]}"

        if cache_id in self._distance_cache:
            self.stats["cache_hits"] += 1
            cached = dict(self._distance_cache[cache_id])
            cached["cache_hit"] = True
            return cached

        # Haversine great-circle distance is 100% free and instantaneous
        aerial_km = haversine_distance(origin_lat, origin_lon, dest_lat, dest_lon)
        # Standard Indian highway winding factor is ~1.25x of straight-line distance
        estimated_road_km = round(aerial_km * 1.22, 2)
        estimated_duration_min = round(estimated_road_km / 45.0 * 60) # ~45 km/h avg logistics speed

        distance_info = {
            "aerial_km": aerial_km,
            "road_distance_km": estimated_road_km,
            "estimated_duration_minutes": estimated_duration_min,
            "source": "haversine_road_model",
            "cache_hit": False,
            "cost_consumed": "0_free"
        }

        self._distance_cache[cache_id] = distance_info
        return distance_info

    def _fallback_locality(self, lat: float, lon: float, reason: str) -> Dict[str, Any]:
        """Generate safe, meaningful locality description without paid calls."""
        # Find nearest pre-seeded city
        nearest = None
        min_dist = float("inf")
        for coords, data in PRE_SEEDED_LOCALITIES.items():
            d = haversine_distance(lat, lon, coords[0], coords[1])
            if d < min_dist:
                min_dist = d
                nearest = data

        if nearest and min_dist <= 30.0:
            formatted = f"{nearest['locality']} Region (~{min_dist:.1f} km from center)"
        else:
            formatted = f"Zone at {lat:.4f}°N, {lon:.4f}°E (Maharashtra)"

        return {
            "formatted_address": formatted,
            "locality": nearest["locality"] if nearest else "Maharashtra Zone",
            "district": nearest["district"] if nearest else "Western Maharashtra",
            "state": "Maharashtra",
            "pincode": nearest["pincode"] if nearest else "",
            "source": "algorithmic_fallback",
            "cache_hit": False,
            "fallback_note": reason
        }

mappls_service = MapplsService()
