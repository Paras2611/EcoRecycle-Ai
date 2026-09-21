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
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>No analysis data yet. Upload waste photos or load the benchmark above.</p>
      </div>
    );
  }

  const { total_images, composition, recyclable_percentage, recyclable_count, non_recyclable_count } = analysisData;
  const categories = Object.entries(composition).sort((a, b) => b[1].percentage - a[1].percentage);

  return (
    <div className="glass-panel" style={{ padding: '1.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            background: 'rgba(59, 130, 246, 0.15)',
            padding: '0.5rem',
            borderRadius: '8px',
            color: '#60a5fa',
            display: 'flex'
          }}>
            <PieChart size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>3. Waste Composition Analytics</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Area-aggregated neural vision analysis across {total_images} detected waste items
            </p>
          </div>
        </div>

        {/* Recyclability Rate Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          background: 'rgba(0, 0, 0, 0.25)',
          padding: '0.5rem 1rem',
          borderRadius: '10px',
          border: '1px solid var(--border-glass)'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Recyclability Potential</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--emerald-400)' }}>
              {recyclable_percentage}% Recyclable
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <div>♻️ {recyclable_count} Divertible</div>
            <div>🗑️ {non_recyclable_count} Landfill / Other</div>
          </div>
        </div>
      </div>

      {/* Category Bars with Click to Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
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
                borderRadius: '8px',
                background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                border: isSelected ? `1px solid ${color}` : '1px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: color,
                      display: 'inline-block'
                    }}
                  />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                    {categoryKey}
                  </span>
                  <span className={`badge badge-${categoryKey.toLowerCase()}`}>
                    {item.count} items
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: color }}>
                    {item.percentage}%
                  </span>
                  {isSelected && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--emerald-400)', fontWeight: 600 }}>
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
        fontSize: '0.78rem',
        color: 'var(--text-muted)',
        textAlign: 'center',
        borderTop: '1px solid var(--border-glass)',
        paddingTop: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.4rem'
      }}>
        <Filter size={13} /> Click any waste category above to isolate and find matching recycling facilities below
      </div>
    </div>
  );
}
