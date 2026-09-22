import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, Sparkles, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { loginUser, registerUser } from '../services/api';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  if (!isOpen) return null;

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    if (isRegister && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (isRegister && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let data;
      if (isRegister) {
        data = await registerUser(name, email, password);
      } else {
        data = await loginUser(email, password);
      }
      onLoginSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setIsRegister(false);
    setEmail('demo@ecorecycle.ai');
    setPassword('demo123');
    setError(null);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(0.75rem, 3vw, 1.5rem)',
        overflowY: 'auto'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '430px',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: 'clamp(1.25rem, 4vw, 2rem)',
          borderRadius: '16px',
          background: 'rgba(15, 23, 42, 0.96)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 25px rgba(16, 185, 129, 0.15)',
          position: 'relative',
          margin: 'auto'
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            minWidth: '40px',
            minHeight: '40px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem', marginTop: '0.25rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.15)',
            color: 'var(--emerald-400)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)'
          }}>
            <Lock size={22} />
          </div>
          <h3 style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.4rem)', color: 'var(--text-primary)', fontWeight: 700 }}>
            {isRegister ? 'Create EcoRecycle Account' : 'Welcome Back'}
          </h3>
          <p style={{ fontSize: 'clamp(0.78rem, 2.5vw, 0.85rem)', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.4 }}>
            {isRegister
              ? 'Save your waste audits & city recycling plans permanently'
              : 'Sign in to access your saved city sessions & facilities'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            marginBottom: '1rem',
            padding: '0.7rem 0.9rem',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#fca5a5',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.6rem',
            lineHeight: 1.4
          }}>
            <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <span>{error}</span>
              {!isRegister && (
                <div style={{ marginTop: '0.25rem' }}>
                  <button
                    type="button"
                    onClick={handleDemoFill}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--emerald-400)',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      padding: 0
                    }}
                  >
                    Use verified Demo Account instead?
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {isRegister && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 500 }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Paras Shinde"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.85rem 0.75rem 2.4rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-glass)',
                    background: 'rgba(0, 0, 0, 0.35)',
                    color: 'var(--text-primary)',
                    fontSize: '16px', // Prevents iOS auto-zoom
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 500 }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                autoFocus={!isRegister}
                placeholder="auditor@ecorecycle.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.85rem 0.75rem 2.4rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-glass)',
                  background: 'rgba(0, 0, 0, 0.35)',
                  color: 'var(--text-primary)',
                  fontSize: '16px', // Prevents iOS auto-zoom
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 500 }}>
              Password {isRegister && <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>(min. 6 characters)</span>}
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 2.5rem 0.75rem 2.4rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-glass)',
                  background: 'rgba(0, 0, 0, 0.35)',
                  color: 'var(--text-primary)',
                  fontSize: '16px', // Prevents iOS auto-zoom
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '0.8rem',
              marginBottom: '0.85rem',
              fontSize: '0.95rem',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spin-animation" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
            )}
          </button>
        </form>

        {/* Quick Demo Mode Login */}
        {!isRegister && (
          <button
            type="button"
            onClick={handleDemoFill}
            style={{
              width: '100%',
              minHeight: '42px',
              padding: '0.65rem 0.8rem',
              borderRadius: '10px',
              border: '1px dashed rgba(16, 185, 129, 0.45)',
              background: 'rgba(16, 185, 129, 0.08)',
              color: 'var(--emerald-400)',
              fontSize: 'clamp(0.78rem, 2.5vw, 0.84rem)',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginBottom: '1rem',
              transition: 'all 0.2s ease'
            }}
          >
            <Sparkles size={14} /> Auto-fill Demo Account (demo@ecorecycle.ai)
          </button>
        )}

        {/* Toggle Mode */}
        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(false); setError(null); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--emerald-400)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  textDecoration: 'underline',
                  padding: '4px'
                }}
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(true); setError(null); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--emerald-400)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  textDecoration: 'underline',
                  padding: '4px'
                }}
              >
                Create One
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
