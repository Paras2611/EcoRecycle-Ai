import React from 'react';
import { MapPin, Compass, Navigation } from 'lucide-react';

const PRESET_LOCATIONS = [
  { name: 'Karad, Maharashtra', lat: 17.2880, lon: 74.1920, state: 'Primary Target Hub' },
  { name: 'Satara, Maharashtra', lat: 17.6805, lon: 74.0183, state: 'Industrial Belt' },
  { name: 'Kolhapur, Maharashtra', lat: 16.7050, lon: 74.2433, state: 'Processing Center' },
  { name: 'Sangli, Maharashtra', lat: 16.8524, lon: 74.5815, state: 'Agri & Bio-Hub' },
  { name: 'Pune, Maharashtra', lat: 18.5204, lon: 73.8567, state: 'Metro Polymer Hub' },
];

export default function AreaSelector({ area, setArea }) {
  const handlePresetChange = (preset) => {
    setArea((prev) => ({
      ...prev,
      name: preset.name,
      lat: preset.lat,
      lon: preset.lon,
    }));
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          padding: '0.5rem',
          borderRadius: '8px',
          color: 'var(--emerald-400)',
          display: 'flex'
        }}>
          <MapPin size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>1. Geographic Area Selection</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Select target locality to analyze waste generation and discover local recyclers
          </p>
        </div>
      </div>

      {/* Preset Quick Chips */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Select Locality Preset
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {PRESET_LOCATIONS.map((preset) => {
            const isSelected = area.name === preset.name;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => handlePresetChange(preset)}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--emerald-400)' : '1px solid var(--border-glass)',
                  background: isSelected ? 'rgba(16, 185, 129, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                  color: isSelected ? 'var(--emerald-400)' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Compass size={14} />
                {preset.name.split(',')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Inputs for Lat, Lon, Radius */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            Latitude (°N)
          </label>
          <input
            type="number"
            step="0.0001"
            value={area.lat}
            onChange={(e) => setArea({ ...area, lat: parseFloat(e.target.value) || 0 })}
            style={{
              width: '100%',
              padding: '0.6rem 0.8rem',
              borderRadius: '8px',
              border: '1px solid var(--border-glass)',
              background: 'rgba(0, 0, 0, 0.25)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            Longitude (°E)
          </label>
          <input
            type="number"
            step="0.0001"
            value={area.lon}
            onChange={(e) => setArea({ ...area, lon: parseFloat(e.target.value) || 0 })}
            style={{
              width: '100%',
              padding: '0.6rem 0.8rem',
              borderRadius: '8px',
              border: '1px solid var(--border-glass)',
              background: 'rgba(0, 0, 0, 0.25)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Discovery Radius
            </label>
            <span style={{ fontSize: '0.8rem', color: 'var(--emerald-400)', fontWeight: 600 }}>
              {area.radiusKm} km
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="80"
            step="5"
            value={area.radiusKm}
            onChange={(e) => setArea({ ...area, radiusKm: parseInt(e.target.value) || 25 })}
            style={{
              width: '100%',
              accentColor: 'var(--emerald-400)',
              cursor: 'pointer'
            }}
          />
        </div>
      </div>

      <div style={{
        padding: '0.75rem 1rem',
        borderRadius: '10px',
        background: 'rgba(16, 185, 129, 0.08)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        fontSize: '0.82rem',
        color: 'var(--text-secondary)'
      }}>
        <Navigation size={15} color="var(--emerald-400)" />
        <span>Active Zone: <strong style={{ color: 'var(--text-primary)' }}>{area.name}</strong> (Radius: {area.radiusKm} km)</span>
      </div>
    </div>
  );
}
