import React from 'react';
import { Sparkles, Lightbulb, Leaf, ShieldCheck } from 'lucide-react';

const PROCESS_KNOWLEDGE = {
  plastic: {
    title: "Mechanical Recycling & Pelletizing",
    process: "Optical sorting followed by high-temperature caustic washing, dry shredding into flakes, and single-screw extrusion into rPET pellets.",
    impact: "Recycling 1 ton of plastic saves ~5,774 kWh of electricity, 16.3 barrels of oil, and prevents 1.5 tons of carbon emissions.",
    tips: "Segregate clear PET bottles from opaque HDPE caps to ensure high scrap grade value."
  },
  organic: {
    title: "Aerobic Windrow Composting & Biomethanation",
    process: "Segregated biodegradable solids are fed into high-rate anaerobic digesters producing methane fuel, followed by aerobic microbial curing for bio-fertilizer.",
    impact: "Prevents fugitive methane emission from open dump pits and restores vital soil nitrogen.",
    tips: "Ensure source segregation is 100% free of thin plastic wrap and hygiene items."
  },
  paper: {
    title: "Hydrapulping & De-inking",
    process: "Suspension in water with mechanical agitation, screening for staple/adhesive removal, and flotation de-inking for virgin pulp replacement.",
    impact: "Every ton of recycled paper conserves 17 mature trees and 26,000 liters of fresh water.",
    tips: "Do not wet or grease paper; keep corrugated kraft boards separate from office grade."
  },
  glass: {
    title: "Cullet Crushing & Regenerative Furnace Remelting",
    process: "Color segregation (amber, flint, emerald), magnetic metal extraction, impact crushing into cullet, and energy-efficient furnace fusion.",
    impact: "Glass is 100% infinitely recyclable without quality loss; every 10% cullet used lowers furnace energy by 3%.",
    tips: "Remove bottle caps and labels; avoid mixing window/ceramic heat-resistant glass."
  },
  metal: {
    title: "Eddy-Current Separation & Induction Smelting",
    process: "Non-ferrous metal separation via high-frequency magnetic rotors followed by high-temperature smelting into standardized ingots.",
    impact: "Recycled aluminum uses 95% less energy than mining and smelting virgin bauxite ore.",
    tips: "Crush beverage cans to optimize storage volume and transportation density."
  },
  ewaste: {
    title: "CPCB-Authorized Dismantling & Hydrometallurgy",
    process: "Manual depopulation of components, safe battery removal, mechanical shredding, and chemical leaching of gold, silver, and copper.",
    impact: "Prevents toxic lead, mercury, and flame-retardant leachates into groundwater.",
    tips: "Store e-waste in moisture-proof containers away from heat sources."
  },
  cardboard: {
    title: "Corrugated OCC Fiber Repulping & Converting",
    process: "High-density baling, high-consistency hydrapulping, fiber fractionation, contaminant screening, and wet-end paperboard forming for new boxes.",
    impact: "Recycling 1 ton of cardboard saves 17 trees, 4,000 kWh of electricity, and avoids 3 cubic yards of landfill congestion.",
    tips: "Flatten boxes completely and strip all non-soluble plastic packing tapes and metallic staples."
  },
  wood: {
    title: "Biomass Briquetting & Particle Board Extrusion",
    process: "Industrial chipping and grinding, moisture reduction drying, and high-pressure hydraulic extrusion into clean solid biomass briquettes.",
    impact: "Directly displaces fossil coal fuel in industrial boilers, producing carbon-neutral clean energy.",
    tips: "Inspect and remove any nails, screws, and hazardous chemical preservative coatings."
  },
  textile: {
    title: "Fiber Garnetting & Shoddy Yarn Spinning",
    process: "Optical color sorting, mechanical rotary garnetting into shredded rag fibers, and re-spinning into acoustic insulation or carpet underlays.",
    impact: "Diverts high-volume post-consumer garments from landfills and saves thousands of liters of cotton crop irrigation.",
    tips: "Ensure materials are dry and pre-sorted between natural cottons and synthetic polyesters."
  }
};

export default function RecommendationPanel({ dominantCategory = 'plastic', availableCategories = [], onSelectCategory }) {
  const normCategory = dominantCategory ? dominantCategory.toLowerCase() : 'plastic';
  const info = PROCESS_KNOWLEDGE[normCategory] || PROCESS_KNOWLEDGE['plastic'];

  // Categories to display as selector pills
  const displayTabs = availableCategories.length > 0 
    ? availableCategories 
    : ['plastic', 'metal', 'paper', 'cardboard'];

  return (
    <div className="glass-panel" style={{ padding: 'clamp(1rem, 2.5vw, 1.5rem)', background: 'rgba(15, 23, 42, 0.8)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            background: 'rgba(251, 191, 36, 0.15)',
            padding: '0.5rem',
            borderRadius: '10px',
            color: 'var(--amber-400)',
            display: 'flex',
            flexShrink: 0
          }}>
            <Lightbulb size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: 'var(--text-primary)', fontWeight: 700 }}>
              4. Recycling Process Blueprint: <span style={{ textTransform: 'capitalize', color: 'var(--amber-400)' }}>{normCategory}</span>
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Domain-specific environmental workflow & processing methods for detected waste
            </p>
          </div>
        </div>

        {/* Multi-Stream Category Quick-Pills */}
        {displayTabs && displayTabs.length > 0 && (
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {displayTabs.map((cat) => {
              const active = cat.toLowerCase() === normCategory;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onSelectCategory && onSelectCategory(cat.toLowerCase())}
                  style={{
                    padding: '0.28rem 0.65rem',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    borderRadius: '20px',
                    border: active ? '1px solid var(--amber-400)' : '1px solid var(--border-glass)',
                    background: active ? 'rgba(245, 158, 11, 0.2)' : 'rgba(0, 0, 0, 0.25)',
                    color: active ? 'var(--amber-400)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.2s'
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
        gap: '0.85rem'
      }}>
        <div style={{ background: 'rgba(0,0,0,0.28)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--cyan-400)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={14} /> Recommended Industrial Method
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            {info.title}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
            {info.process}
          </p>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.28)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--emerald-400)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Leaf size={14} /> Environmental & Energy Savings
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
            {info.impact}
          </p>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.28)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f59e0b', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={14} /> Source Segregation Guidelines
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
            {info.tips}
          </p>
        </div>
      </div>
    </div>
  );
}
