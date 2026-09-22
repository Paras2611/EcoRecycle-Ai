import React from 'react';
import { PieChart, CheckCircle, AlertCircle, Filter } from 'lucide-react';

const CATEGORY_COLORS = {
  plastic: '#3b82f6',
  organic: '#10b981',
  paper: '#f59e0b',
  cardboard: '#d97706',
  glass: '#06b6d4',
  metal: '#94a3b8',
  ewaste: '#a855f7',
  textile: '#ec4899',
  wood: '#b45309',
  other: '#64748b'
};

export default function WasteChart({ analysisData, selectedCategory, onSelectCategory }) {
  if (!analysisData || !analysisData.composition) {
    return (
      <div className="glass-panel" style={{ padding: 'clamp(1.5rem, 3vw, 2rem)', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>No analysis data yet. Upload waste photos or load the benchmark above.</p>
      </div>
    );
  }

  const { total_images, composition, recyclable_percentage, recyclable_count, non_recyclable_count } = analysisData;
  const categories = Object.entries(composition).sort((a, b) => b[1].percentage - a[1].percentage);

  return (
    <div className="glass-panel" style={{ padding: 'clamp(1rem, 2.5vw, 1.75rem)' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
        gap: '0.8rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            background: 'rgba(59, 130, 246, 0.15)',
            padding: '0.5rem',
            borderRadius: '10px',
            color: '#60a5fa',
            display: 'flex',
            flexShrink: 0
          }}>
            <PieChart size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: 'var(--text-primary)', fontWeight: 700 }}>
              3. Waste Composition Analytics
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Area-aggregated neural vision analysis across {total_images} detected waste items
            </p>
          </div>
        </div>

        {/* Recyclability Rate Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(0.6rem, 1.5vw, 1rem)',
          background: 'rgba(0, 0, 0, 0.28)',
          padding: '0.5rem clamp(0.75rem, 2vw, 1rem)',
          borderRadius: '10px',
          border: '1px solid var(--border-glass)',
          flexWrap: 'wrap'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Recyclability</div>
            <div style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', fontWeight: 700, color: 'var(--emerald-400)' }}>
              {recyclable_percentage}%
            </div>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            <div>♻️ {recyclable_count} Divertible</div>
            <div>🗑️ {non_recyclable_count} Non-recyclable</div>
          </div>
        </div>
      </div>

      {/* Category Bars with Click to Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {categories.map(([categoryKey, item]) => {
          const color = CATEGORY_COLORS[categoryKey.toLowerCase()] || '#64748b';
          const isSelected = selectedCategory === categoryKey.toLowerCase();

          return (
            <div
              key={categoryKey}
              onClick={() => onSelectCategory(isSelected ? null : categoryKey.toLowerCase())}
              style={{
                cursor: 'pointer',
                padding: '0.6rem 0.8rem',
                borderRadius: '10px',
                background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                border: isSelected ? `1.5px solid ${color}` : '1px solid transparent',
                transition: 'all 0.2s ease',
                touchAction: 'manipulation'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      width: '9px',
                      height: '9px',
                      borderRadius: '50%',
                      backgroundColor: color,
                      display: 'inline-block',
                      flexShrink: 0
                    }}
                  />
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                    {categoryKey}
                  </span>
                  <span className={`badge badge-${categoryKey.toLowerCase()}`} style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                    {item.count}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: color }}>
                    {item.percentage}%
                  </span>
                  {isSelected && (
                    <span style={{ fontSize: '0.68rem', color: 'var(--emerald-400)', fontWeight: 600 }}>
                      [Filtered]
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="meter-bar">
                <div
                  className="meter-fill"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: color
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        fontSize: '0.76rem',
        color: 'var(--text-muted)',
        textAlign: 'center',
        borderTop: '1px solid var(--border-glass)',
        paddingTop: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.4rem'
      }}>
        <Filter size={13} style={{ flexShrink: 0 }} />
        <span>Click any waste category above to filter matching recycling facilities below</span>
      </div>
    </div>
  );
}
