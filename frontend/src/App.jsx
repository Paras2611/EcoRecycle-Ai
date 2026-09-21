import React, { useState, useEffect } from 'react';
import {
  Recycle,
  Layers,
  Activity,
  Server,
  Sparkles,
  Info,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import AreaSelector from './components/AreaSelector';
import ImageUploader from './components/ImageUploader';
import WasteChart from './components/WasteChart';
import MapView from './components/MapView';
import FacilityCard from './components/FacilityCard';
import RecommendationPanel from './components/RecommendationPanel';
import { checkHealth, analyzeBatch, getNearbyFacilities } from './services/api';

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

  // Check health and initialize facilities
  useEffect(() => {
    async function init() {
      const health = await checkHealth();
      setBackendHealth(health);
      loadFacilities(area.lat, area.lon, area.radiusKm, selectedCategory);
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

  const handleAnalyzeImages = async (files) => {
    setLoading(true);
    setStatusMessage(`Running deep learning inference on ${files.length} waste image(s)...`);
    try {
      const res = await analyzeBatch(files, area.name, area.lat, area.lon, area.radiusKm);
      setAnalysisData(res);
      // Auto-select the top category
      const topCat = Object.entries(res.composition).sort((a, b) => b[1].count - a[1].count)[0]?.[0];
      if (topCat) setSelectedCategory(topCat);
      setStatusMessage(`Success: Classified ${res.total_images} waste items across ${Object.keys(res.composition).length} categories.`);
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err) {
      console.error('Analysis error:', err);
      setStatusMessage(`Analysis Notice: ${err.message}. Using simulated area composition.`);
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

        <div className="nav-actions">
          <div className="status-pill">
            <span className="status-dot" style={{ backgroundColor: backendHealth.status === 'healthy' ? 'var(--emerald-400)' : '#f59e0b' }} />
            <span>FastAPI: {backendHealth.status === 'healthy' ? 'Online' : 'Connecting'}</span>
            {backendHealth.facilities_indexed > 0 && (
              <span style={{ color: 'var(--text-primary)', marginLeft: '4px' }}>
                ({backendHealth.facilities_indexed} facilities)
              </span>
            )}
          </div>
        </div>
      </header>

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
          <span>Mapping: <strong>Leaflet + OpenStreetMap</strong></span>
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
