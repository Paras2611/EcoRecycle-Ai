import React from 'react';
import { Building2, Navigation, CheckCircle, Phone, Award, ArrowRight } from 'lucide-react';

export default function FacilityCard({ facilities = [], selectedCategory, selectedFacility, onSelectFacility }) {
  if (!facilities || facilities.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>No recycling facilities discovered in this radius. Try extending the search radius.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '1.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            padding: '0.5rem',
            borderRadius: '8px',
            color: 'var(--emerald-400)',
            display: 'flex'
          }}>
            <Building2 size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>5. Recommended Recycling Facilities</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Ranked by multi-factor suitability (material compatibility + distance + processing capacity)
            </p>
          </div>
        </div>

        {selectedCategory && (
          <span style={{ fontSize: '0.8rem', color: 'var(--cyan-400)', background: 'rgba(6, 182, 212, 0.12)', padding: '0.3rem 0.75rem', borderRadius: '6px' }}>
            Filtered for: <strong style={{ textTransform: 'capitalize' }}>{selectedCategory}</strong>
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
        {facilities.map((fac) => {
          const isSelected = selectedFacility && selectedFacility.id === fac.id;
          const isCompatible = fac.is_compatible;

          return (
            <div
              key={fac.id}
              onClick={() => onSelectFacility(fac)}
              style={{
                borderRadius: '12px',
                padding: '1.25rem',
                background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                border: isSelected
                  ? '1.5px solid var(--emerald-400)'
                  : isCompatible
                  ? '1px solid rgba(255, 255, 255, 0.08)'
                  : '1px solid rgba(255, 255, 255, 0.04)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                opacity: isCompatible ? 1 : 0.6
              }}
            >
              <div>
                {/* Header with Distance & Suitability */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                  <span style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: 'var(--emerald-400)',
                    background: 'rgba(16, 185, 129, 0.15)',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}>
                    <Navigation size={12} /> {fac.distance_km} km away
                  </span>

                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: fac.suitability_score > 70 ? 'var(--cyan-400)' : 'var(--text-secondary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <Award size={12} /> Score: {fac.suitability_score}%
                  </span>
                </div>

                <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  {fac.name}
                </h4>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                  {fac.address}
                </p>

                {/* Accepted Waste Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.85rem' }}>
                  {fac.accepted_waste.map((wt) => (
                    <span
                      key={wt}
                      className={`badge badge-${wt.toLowerCase()}`}
                      style={{
                        outline: selectedCategory && selectedCategory.toLowerCase() === wt.toLowerCase() ? '2px solid white' : 'none'
                      }}
                    >
                      {wt}
                    </span>
                  ))}
                </div>

                {/* Processing info */}
                {Object.entries(fac.processing_methods).length > 0 && (
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    background: 'rgba(0, 0, 0, 0.25)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    marginBottom: '0.75rem'
                  }}>
                    <strong>Processing:</strong> {Object.values(fac.processing_methods)[0]}
                  </div>
                )}
              </div>

              {/* Footer Meta */}
              <div style={{
                borderTop: '1px solid var(--border-glass)',
                paddingTop: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)'
              }}>
                <span>Daily Cap: <strong style={{ color: 'var(--text-primary)' }}>{fac.capacity_tpd} TPD</strong></span>
                {fac.contact && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                    <Phone size={12} /> {fac.contact}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
