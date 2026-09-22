import React, { useState, useEffect } from 'react';
import { X, FolderHeart, MapPin, Calendar, Layers, ArrowRight, Search, Building2, RefreshCw } from 'lucide-react';
import { fetchSavedSessions } from '../services/api';

export default function SavedSessionsModal({ isOpen, onClose, onSelectSession }) {
  if (!isOpen) return null;

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState('');
  const [error, setError] = useState(null);

  const loadSessions = async (city = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSavedSessions(city);
      setSessions(data);
    } catch (err) {
      setError(err.message || 'Failed to load saved sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadSessions(cityFilter);
    }
  }, [isOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadSessions(cityFilter);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '680px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        background: 'rgba(15, 23, 42, 0.96)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-glass)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              background: 'rgba(56, 189, 248, 0.15)',
              padding: '0.5rem',
              borderRadius: '8px',
              color: 'var(--cyan-400)',
              display: 'flex'
            }}>
              <FolderHeart size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>Saved City Waste Sessions</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Browse past image audits saved by city to find nearest recycling plants
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Bar */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-glass)', background: 'rgba(255, 255, 255, 0.02)' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Filter by city (e.g., Karad, Satara, Kolhapur, Pune)..."
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.8rem 0.55rem 2.2rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-glass)',
                  background: 'rgba(0, 0, 0, 0.3)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>
            <button
              type="submit"
              className="btn-secondary"
              style={{ padding: '0.55rem 1rem', fontSize: '0.82rem' }}
            >
              Filter
            </button>
            <button
              type="button"
              onClick={() => { setCityFilter(''); loadSessions(''); }}
              style={{ background: 'transparent', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '0.55rem', color: 'var(--text-secondary)', cursor: 'pointer' }}
              title="Reset Filter"
            >
              <RefreshCw size={15} />
            </button>
          </form>
        </div>

        {/* Session List */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              Loading city sessions...
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#f87171' }}>
              {error}
            </div>
          ) : sessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
              <MapPin size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.92rem' }}>No saved sessions found {cityFilter ? `for "${cityFilter}"` : ''}.</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                Upload waste images and specify your city name to save them here!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {sessions.map((sess) => {
                const dateStr = sess.created_at ? new Date(sess.created_at).toLocaleDateString() : 'Recent';
                return (
                  <div
                    key={sess.id}
                    style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-glass)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: 'rgba(56, 189, 248, 0.15)',
                          color: '#38bdf8',
                          border: '1px solid rgba(56, 189, 248, 0.3)'
                        }}>
                          📍 {sess.city_name || 'City Zone'}
                        </span>
                        <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', margin: 0 }}>
                          {sess.area_name}
                        </h4>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        <span>Total Items: <strong style={{ color: 'var(--text-secondary)' }}>{sess.total_items}</strong></span>
                        <span>Radius: <strong style={{ color: 'var(--text-secondary)' }}>{sess.radius_km} km</strong></span>
                        <span>Date: <strong style={{ color: 'var(--text-secondary)' }}>{dateStr}</strong></span>
                      </div>

                      {/* Waste Breakdown Tags */}
                      {sess.waste_summary && Object.keys(sess.waste_summary).length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                          {Object.entries(sess.waste_summary).map(([wt, count]) => (
                            <span
                              key={wt}
                              className={`badge badge-${wt.toLowerCase()}`}
                              style={{ fontSize: '0.68rem', padding: '1px 5px' }}
                            >
                              {count} {wt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectSession(sess);
                        onClose();
                      }}
                      className="btn-primary"
                      style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem', gap: '4px' }}
                    >
                      <Building2 size={13} />
                      Find Nearest Recyclers
                      <ArrowRight size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
