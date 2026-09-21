from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.models import RecyclingFacility, FacilityWasteType
from backend.app.services.geo_service import haversine_distance

# Knowledge Base: Waste-to-Process Mapping (PRD Section 12)
WASTE_PROCESS_KNOWLEDGE_BASE: Dict[str, Dict[str, Any]] = {
    "plastic": {
        "primary_process": "Mechanical Recycling",
        "methods": ["Optical Sorting", "Hot Washing", "Shredding & Pelletizing"],
        "eco_impact": "Conserves ~1.5 kg CO2 per kg recycled, reduces landfill burden by 85%",
        "best_practice": "Ensure bottles are rinsed and caps separated where required."
    },
    "pet": {
        "primary_process": "Bottle-to-Bottle / Fiber Spinning",
        "methods": ["De-labeling", "Flake Washing", "Extrusion to Polyester Staple Fiber (PSF)"],
        "eco_impact": "Saves up to 60% energy compared to virgin PET production",
        "best_practice": "Keep transparent PET separate from colored containers."
    },
    "paper": {
        "primary_process": "Pulping & De-inking",
        "methods": ["Hydrapulping", "Flotation De-inking", "Bleaching & Drying into Kraft/Newsprint"],
        "eco_impact": "Saves 17 trees and 26,000 liters of water per ton of paper recycled",
        "best_practice": "Avoid mixing with greasy or wet kitchen waste."
    },
    "cardboard": {
        "primary_process": "Corrugated Board Regeneration",
        "methods": ["High-density Baling", "Fiber Repulping", "Corrugation"],
        "eco_impact": "Uses 75% less energy than virgin cardboard manufacturing",
        "best_practice": "Flatten cartons and remove plastic packaging tapes."
    },
    "glass": {
        "primary_process": "Cullet Remelting & Casting",
        "methods": ["Color Sorting (Amber, Green, Clear)", "Cullet Crushing", "Furnace Fusion"],
        "eco_impact": "100% infinitely recyclable with zero quality degradation",
        "best_practice": "Do not mix broken window panes or ceramics with bottle cullet."
    },
    "metal": {
        "primary_process": "Hydraulic Shearing & Smelting",
        "methods": ["Magnetic & Eddy-Current Sorting", "Compacting", "Foundry Melting"],
        "eco_impact": "Aluminum recycling saves up to 95% energy compared to bauxite smelting",
        "best_practice": "Separate ferrous (iron/steel) from non-ferrous (aluminum, copper)."
    },
    "organic": {
        "primary_process": "Biomethanation & Composting",
        "methods": ["Anaerobic Digestion for Biogas", "Aerobic Windrow Composting"],
        "eco_impact": "Prevents methane generation in open dumps, yields organic fertilizer",
        "best_practice": "Ensure zero plastic contamination in wet organic waste streams."
    },
    "ewaste": {
        "primary_process": "Authorized Dismantling & Precious Metal Recovery",
        "methods": ["Safe Battery Extraction", "Circuit Board Pyrolysis / Hydrometallurgy"],
        "eco_impact": "Recovers gold, silver, copper, and prevents lead/cadmium soil leaching",
        "best_practice": "Hand over to CPCB-authorized e-waste recyclers only."
    },
    "textile": {
        "primary_process": "Fiber Shredding & Garnetting",
        "methods": ["Color Sorting", "Mechanical Garnetting into Shoddy Wool", "Non-woven Felt"],
        "eco_impact": "Diverts massive volumes from landfills and saves virgin cotton irrigation",
        "best_practice": "Keep dry and separate synthetics from natural cottons."
    },
    "wood": {
        "primary_process": "Biomass Briquetting & Particle Board",
        "methods": ["Chipping", "Drying", "High-Pressure Briquette Extrusion"],
        "eco_impact": "Replaces coal as carbon-neutral industrial fuel",
        "best_practice": "Remove nails, staples, and toxic chemical coatings."
    },
    "other": {
        "primary_process": "Material Recovery & Refuse-Derived Fuel (RDF)",
        "methods": ["Secondary Screening", "Shredding into RDF for Cement Kilns"],
        "eco_impact": "Replaces fossil fuel in high-temperature kilns, leaves minimum ash",
        "best_practice": "Pre-segregate hazardous household materials."
    }
}

def get_recommendation_for_waste(waste_type: str) -> Dict[str, Any]:
    """Retrieve recycling process details for a specific waste type."""
    normalized = waste_type.lower().strip()
    return WASTE_PROCESS_KNOWLEDGE_BASE.get(
        normalized,
        WASTE_PROCESS_KNOWLEDGE_BASE["other"]
    )

def calculate_suitability_score(
    is_compatible: bool,
    distance_km: float,
    capacity_tpd: float,
    max_radius_km: float = 50.0
) -> float:
    """
    Compute multi-factor suitability score (PRD Section 17):
    Score = W_c * C + W_d * D + W_k * K
    - W_c (0.45): Material compatibility
    - W_d (0.35): Proximity (closer = higher score)
    - W_k (0.20): Facility capacity availability
    """
    if not is_compatible:
        return 0.0

    W_c, W_d, W_k = 0.45, 0.35, 0.20

    # Distance factor D: 1.0 at 0km, smoothly decays
    D = max(0.0, 1.0 - (distance_km / max(max_radius_km, 1.0)))

    # Capacity factor K: normalized up to 100 TPD
    K = min(1.0, capacity_tpd / 100.0)

    score = (W_c * 1.0) + (W_d * D) + (W_k * K)
    return round(score * 100.0, 1)

def find_nearby_facilities(
    db: Session,
    latitude: float,
    longitude: float,
    waste_type: Optional[str] = None,
    radius_km: float = 50.0
) -> List[Dict[str, Any]]:
    """
    Query facilities within geographic radius, optionally matching waste type,
    ordered by distance and suitability score.
    """
    facilities = db.query(RecyclingFacility).all()
    results = []

    normalized_waste = waste_type.lower().strip() if waste_type else None

    for fac in facilities:
        dist = haversine_distance(latitude, longitude, fac.latitude, fac.longitude)
        if dist > radius_km:
            continue

        # Get accepted waste types
        accepted = [wt.waste_type.lower() for wt in fac.waste_types]
        processing_methods = {wt.waste_type.lower(): wt.processing_method for wt in fac.waste_types}

        is_compatible = True
        if normalized_waste:
            is_compatible = (normalized_waste in accepted)

        score = calculate_suitability_score(
            is_compatible=is_compatible,
            distance_km=dist,
            capacity_tpd=fac.capacity_tpd,
            max_radius_km=radius_km
        )

        results.append({
            "id": fac.id,
            "name": fac.name,
            "address": fac.address,
            "latitude": fac.latitude,
            "longitude": fac.longitude,
            "contact": fac.contact,
            "capacity_tpd": fac.capacity_tpd,
            "status": fac.status,
            "verified": fac.verified,
            "distance_km": dist,
            "accepted_waste": accepted,
            "processing_methods": processing_methods,
            "is_compatible": is_compatible,
            "suitability_score": score
        })

    # Sort primarily by compatibility, then by distance ascending
    results.sort(key=lambda x: (-int(x["is_compatible"]), x["distance_km"]))
    return results
