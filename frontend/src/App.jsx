import React, { useState, useEffect } from 'react';
import {
  Recycle,
  Layers,
  Activity,
  Server,
  Sparkles,
  Info,
  ExternalLink,
  ShieldAlert,
  LogIn,
  LogOut,
  User,
  FolderHeart,
  Menu,
  X,
  CheckCircle2
} from 'lucide-react';
import AreaSelector from './components/AreaSelector';
import ImageUploader from './components/ImageUploader';
import WasteChart from './components/WasteChart';
import MapView from './components/MapView';
import FacilityCard from './components/FacilityCard';
import RecommendationPanel from './components/RecommendationPanel';
import AuthModal from './components/AuthModal';
import SavedSessionsModal from './components/SavedSessionsModal';
import { checkHealth, analyzeBatch, getNearbyFacilities, getMe, setAuthToken } from './services/api';

// Initial PRD Benchmark Dataset for Karad (from EcoRecycle_AI_PRD.md Section 2 & 10)
const KARAD_PRD_BENCHMARK = {
  total_images: 100,
  composition: {
    plastic: { count: 32, percentage: 32.0 },
    organic: { count: 28, percentage: 28.0 },
    paper: { count: 18, percentage: 18.0 },
    glass: { count: 12, percentage: 12.0 },
    metal: { count: 7, percentage: 7.0 },
    ewaste: { count: 3, percentage: 3.0 },
  },
  recyclable_count: 97,
  non_recyclable_count: 3,
  recyclable_percentage: 97.0,
  predictions: []
};

export default function App() {
  const [area, setArea] = useState({
    name: 'Karad, Maharashtra',
    lat: 17.2880,
    lon: 74.1920,
    radiusKm: 25,
  });

  const [backendHealth, setBackendHealth] = useState({ status: 'checking', facilities_indexed: 0 });
  const [analysisData, setAnalysisData] = useState(KARAD_PRD_BENCHMARK);
  const [facilities, setFacilities] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('plastic');
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Authentication & Demo Mode State
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check health, initial facilities, and current user
  useEffect(() => {
    async function init() {
      const health = await checkHealth();
      setBackendHealth(health);
      loadFacilities(area.lat, area.lon, area.radiusKm, selectedCategory);

      // Check for logged-in user
      const user = await getMe();
      if (user) {
        setCurrentUser(user);
      }
    }
    init();
  }, []);

  // Reload facilities whenever area or category changes
  useEffect(() => {
    loadFacilities(area.lat, area.lon, area.radiusKm, selectedCategory);
  }, [area.lat, area.lon, area.radiusKm, selectedCategory]);

  const loadFacilities = async (lat, lon, radius, category) => {
    try {
      const data = await getNearbyFacilities(lat, lon, radius, category);
      setFacilities(data);
      if (data.length > 0 && !selectedFacility) {
        setSelectedFacility(data[0]);
      }
    } catch (err) {
      console.error('Failed to load facilities:', err);
    }
  };

  const handleAnalyzeImages = async (files, cityName) => {
    setLoading(true);
    setStatusMessage(`Running MobileNetV2 deep learning on ${files.length} image(s) for ${cityName}...`);
    try {
      const res = await analyzeBatch(files, area.name, cityName, area.lat, area.lon, area.radiusKm);
      setAnalysisData(res);
      // Auto-select the top category
      const topCat = Object.entries(res.composition).sort((a, b) => b[1].count - a[1].count)[0]?.[0];
      if (topCat) setSelectedCategory(topCat);
      setStatusMessage(`Success: Classified ${res.total_images} waste item(s) for ${cityName}. Saved to database!`);
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err) {
      console.error('Analysis error:', err);
      setStatusMessage(`Analysis Notice: ${err.message}. Using simulated composition.`);
      setTimeout(() => setStatusMessage(null), 6000);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadBenchmark = () => {
    setAnalysisData(KARAD_PRD_BENCHMARK);
    setSelectedCategory('plastic');
    setStatusMessage('Loaded official Karad Waste Survey Benchmark (100 sample items from PRD Section 10).');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleSelectSession = (session) => {
    setArea({
      name: session.area_name,
      lat: session.latitude,
      lon: session.longitude,
      radiusKm: session.radius_km,
    });
    // Set dominant category if available
    if (session.waste_summary) {
      const top = Object.entries(session.waste_summary).sort((a, b) => b[1] - a[1])[0]?.[0];
      if (top) setSelectedCategory(top);
    }
    setStatusMessage(`Loaded saved city session: "${session.city_name}". Map and recyclers re-centered!`);
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setStatusMessage('Signed out. You are now in Demo Guest Mode.');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <header className="app-navbar">
        <div className="brand-badge">
          <div className="brand-icon">
            <Recycle size={24} color="#ffffff" />
          </div>
          <div>
            <div className="brand-name">EcoRecycle AI</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Spatial Waste Intelligence</div>
          </div>
        </div>

        {/* Desktop Nav Controls */}
        <div className="nav-actions desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Demo Mode or User Badge */}
          {currentUser ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: 'var(--emerald-400)',
              fontSize: '0.8rem',
              fontWeight: 500
            }}>
              <User size={13} /> {currentUser.name}
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#818cf8',
              fontSize: '0.8rem',
              fontWeight: 500
            }}>
              <Sparkles size={13} /> Demo Guest Mode
            </div>
          )}

          {/* Saved City Sessions Button */}
          <button
            type="button"
            onClick={() => setIsSavedOpen(true)}
            className="btn-secondary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', gap: '5px' }}
          >
            <FolderHeart size={14} color="var(--cyan-400)" />
            Saved City Sessions
          </button>

          {/* Login / Logout Button */}
          {currentUser ? (
            <button
              type="button"
              onClick={handleLogout}
              className="btn-secondary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', gap: '5px' }}
            >
              <LogOut size={13} /> Sign Out
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="btn-primary"
              style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', gap: '5px' }}
            >
              <LogIn size={13} /> Sign In / Register
            </button>
          )}

          <div className="status-pill">
            <span className="status-dot" style={{ backgroundColor: backendHealth.status === 'healthy' ? 'var(--emerald-400)' : '#f59e0b' }} />
            <span>FastAPI: {backendHealth.status === 'healthy' ? 'Online' : 'Connecting'}</span>
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="mobile-only"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.4rem' }}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {currentUser ? `Logged in: ${currentUser.name}` : '⚡ Demo Mode Active'}
              </span>
              <div className="status-pill" style={{ padding: '2px 8px' }}>
                <span className="status-dot" style={{ backgroundColor: backendHealth.status === 'healthy' ? 'var(--emerald-400)' : '#f59e0b' }} />
                <span>{backendHealth.status === 'healthy' ? 'Online' : 'Connecting'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => { setIsSavedOpen(true); setMobileMenuOpen(false); }}
              className="btn-secondary"
              style={{ width: '100%', justifyContent: 'flex-start', padding: '0.6rem 0.9rem', fontSize: '0.85rem' }}
            >
              <FolderHeart size={16} color="var(--cyan-400)" />
              Saved City Sessions
            </button>

            {currentUser ? (
              <button
                type="button"
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.6rem 0.9rem', fontSize: '0.85rem' }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setIsAuthOpen(true); setMobileMenuOpen(false); }}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.65rem 0.9rem', fontSize: '0.85rem' }}
              >
                <LogIn size={16} /> Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setStatusMessage(`Welcome, ${user.name}! Your analysis history will now be saved.`);
          setTimeout(() => setStatusMessage(null), 5000);
        }}
      />

      <SavedSessionsModal
        isOpen={isSavedOpen}
        onClose={() => setIsSavedOpen(false)}
        onSelectSession={handleSelectSession}
      />


      {/* Main Content */}
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <h1 className="hero-title">
            Deep Learning <span className="hero-highlight">Spatial Waste Intelligence</span>
          </h1>
          <p className="hero-subtitle">
            Analyze area-wise waste generation and seamlessly route materials to nearby certified recycling facilities based on composition, material compatibility, and transportation proximity.
          </p>

          {statusMessage && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.25rem',
              borderRadius: '9999px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: 'var(--emerald-400)',
              fontSize: '0.88rem',
              marginBottom: '1rem',
              animation: 'fadeIn 0.3s ease-in'
            }}>
              <Sparkles size={16} /> {statusMessage}
            </div>
          )}
        </section>

        {/* Two Column Grid: Inputs */}
        <div className="two-column-grid">
          <AreaSelector area={area} setArea={setArea} />
          <ImageUploader
            onAnalyze={handleAnalyzeImages}
            loading={loading}
            onLoadBenchmark={handleLoadBenchmark}
          />
        </div>

        {/* Waste Analytics Breakdown */}
        <WasteChart
          analysisData={analysisData}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Recycling Process Knowledge Blueprint */}
        <RecommendationPanel dominantCategory={selectedCategory || 'plastic'} />

        {/* Geospatial Map View */}
        <MapView
          area={area}
          facilities={facilities}
          selectedFacility={selectedFacility}
          onSelectFacility={setSelectedFacility}
        />

        {/* Recommended Facilities Card Grid */}
        <FacilityCard
          facilities={facilities}
          selectedCategory={selectedCategory}
          selectedFacility={selectedFacility}
          onSelectFacility={setSelectedFacility}
          area={area}
        />
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-glass)',
        padding: '1.75rem 2rem',
        textAlign: 'center',
        background: 'rgba(9, 13, 22, 0.95)',
        color: 'var(--text-muted)',
        fontSize: '0.85rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <span>Framework: <strong>FastAPI + React Vite</strong></span>
          <span>•</span>
          <span>Mapping: <strong>Leaflet + Mappls (MapmyIndia) Quota-Preserved</strong></span>
          <span>•</span>
          <span>Vision: <strong>MobileNetV3 / EfficientNet-B0</strong></span>
          <span>•</span>
          <span>Region: <strong>Western Maharashtra (Karad Hub)</strong></span>
        </div>

        <p>© 2026 EcoRecycle AI — Engineered according to PRD Specifications for MCA Major Project.</p>
      </footer>
    </div>
  );
}
