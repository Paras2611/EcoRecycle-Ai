from sqlalchemy.orm import Session
from backend.app.database.session import SessionLocal, engine, Base
from backend.app.models.models import RecyclingFacility, FacilityWasteType

# Realistic Facilities around Western Maharashtra (Karad, Satara, Kolhapur, Sangli, Pune)
INITIAL_FACILITIES = [
    {
        "name": "Sahyadri Eco-Plast Industries",
        "address": "MIDC Phase 2, Ogalewadi, Karad, Maharashtra 415105",
        "latitude": 17.2912,
        "longitude": 74.2045,
        "contact": "+91 98220 11223",
        "capacity_tpd": 25.0,
        "status": "OPERATIONAL",
        "verified": True,
        "waste_types": [
            {"waste_type": "plastic", "processing_method": "Mechanical Shredding & Pelletizing"},
            {"waste_type": "cardboard", "processing_method": "Baling & Pulp Supply"}
        ]
    },
    {
        "name": "Krishna Valley Bio-Compost & Organic Hub",
        "address": "Near Malkapur By-Pass, Karad, Maharashtra 415539",
        "latitude": 17.2740,
        "longitude": 74.1750,
        "contact": "+91 94230 88991",
        "capacity_tpd": 40.0,
        "status": "OPERATIONAL",
        "verified": True,
        "waste_types": [
            {"waste_type": "organic", "processing_method": "Aerobic Composting & Biomethanation"},
            {"waste_type": "wood", "processing_method": "Biomass Briquetting"}
        ]
    },
    {
        "name": "Satara Glass & Bottle Recycling Works",
        "address": "Additional MIDC, Degaon Road, Satara, Maharashtra 415004",
        "latitude": 17.6805,
        "longitude": 74.0183,
        "contact": "+91 91580 44556",
        "capacity_tpd": 15.0,
        "status": "OPERATIONAL",
        "verified": True,
        "waste_types": [
            {"waste_type": "glass", "processing_method": "Color Sorting, Cullet Crushing & Remelting"}
        ]
    },
    {
        "name": "Mahalaxmi Metal & Scrap Processors",
        "address": "Shiroli MIDC, Kolhapur, Maharashtra 416122",
        "latitude": 16.7450,
        "longitude": 74.2690,
        "contact": "+91 98900 66778",
        "capacity_tpd": 50.0,
        "status": "OPERATIONAL",
        "verified": True,
        "waste_types": [
            {"waste_type": "metal", "processing_method": "Hydraulic Shearing, Magnetic Separation & Melting"}
        ]
    },
    {
        "name": "GreenTech E-Waste Recyclers",
        "address": "Kagal 5-Star MIDC, Kolhapur, Maharashtra 416216",
        "latitude": 16.5820,
        "longitude": 74.3150,
        "contact": "+91 99210 33445",
        "capacity_tpd": 10.0,
        "status": "OPERATIONAL",
        "verified": True,
        "waste_types": [
            {"waste_type": "ewaste", "processing_method": "PCB De-soldering, Precious Metal Extraction, Hazardous Neutralization"}
        ]
    },
    {
        "name": "Panchganga Paper & Kraft Recycling Mill",
        "address": "Ichalkaranji Industrial Area, Kolhapur, Maharashtra 416115",
        "latitude": 16.6920,
        "longitude": 74.4580,
        "contact": "+91 98230 77889",
        "capacity_tpd": 60.0,
        "status": "OPERATIONAL",
        "verified": True,
        "waste_types": [
            {"waste_type": "paper", "processing_method": "Hydrapulping, De-inking & Kraft Paper Regeneration"},
            {"waste_type": "cardboard", "processing_method": "Corrugated Board Recycling"}
        ]
    },
    {
        "name": "Karad Municipal Material Recovery Facility (MRF)",
        "address": "Ganesh Nagar, Karad Municipal Council, Maharashtra 415110",
        "latitude": 17.2880,
        "longitude": 74.1920,
        "contact": "+91 2164 222111",
        "capacity_tpd": 18.0,
        "status": "OPERATIONAL",
        "verified": True,
        "waste_types": [
            {"waste_type": "plastic", "processing_method": "Secondary Segregation & Dense Baling"},
            {"waste_type": "paper", "processing_method": "Sorting & Baling"},
            {"waste_type": "metal", "processing_method": "Ferrous/Non-ferrous Sorting"}
        ]
    },
    {
        "name": "Sangli Bio-Energy & Agri-Waste Converters",
        "address": "Miraj MIDC, Sangli-Miraj Twin City, Maharashtra 416410",
        "latitude": 16.8410,
        "longitude": 74.6420,
        "contact": "+91 93700 12345",
        "capacity_tpd": 35.0,
        "status": "OPERATIONAL",
        "verified": True,
        "waste_types": [
            {"waste_type": "organic", "processing_method": "Industrial Biogas Generation & Bio-fertilizer"},
            {"waste_type": "textile", "processing_method": "Shoddy Yarn & Industrial Rags Regeneration"}
        ]
    },
    {
        "name": "Pune CleanTech Circular Polymer Hub",
        "address": "Bhosari Industrial Estate, Pune, Maharashtra 411026",
        "latitude": 18.6280,
        "longitude": 73.8370,
        "contact": "+91 98810 99887",
        "capacity_tpd": 80.0,
        "status": "OPERATIONAL",
        "verified": True,
        "waste_types": [
            {"waste_type": "plastic", "processing_method": "Optical Sorting, Hot Wash & High-Grade Granulation"},
            {"waste_type": "ewaste", "processing_method": "Authorized E-Waste Dismantling"}
        ]
    }
]

def seed_database(db: Session = None):
    """Seed initial recycling facilities and waste types if table is empty."""
    owns_session = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        owns_session = True

    try:
        existing_count = db.query(RecyclingFacility).count()
        if existing_count > 0:
            return existing_count

        for item in INITIAL_FACILITIES:
            facility = RecyclingFacility(
                name=item["name"],
                address=item["address"],
                latitude=item["latitude"],
                longitude=item["longitude"],
                contact=item.get("contact"),
                capacity_tpd=item["capacity_tpd"],
                status=item.get("status", "OPERATIONAL"),
                verified=item.get("verified", True)
            )
            db.add(facility)
            db.flush()

            for wt in item.get("waste_types", []):
                facility_wt = FacilityWasteType(
                    facility_id=facility.id,
                    waste_type=wt["waste_type"].lower(),
                    processing_method=wt["processing_method"]
                )
                db.add(facility_wt)

        db.commit()
        return len(INITIAL_FACILITIES)
    finally:
        if owns_session:
            db.close()

if __name__ == "__main__":
    count = seed_database()
    print(f"Database successfully initialized and seeded with {count} facilities.")
