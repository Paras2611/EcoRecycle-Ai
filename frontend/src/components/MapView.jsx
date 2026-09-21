import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Map, Layers, Navigation } from 'lucide-react';

export default function MapView({ area, facilities = [], selectedFacility, onSelectFacility }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const radiusCircleRef = useRef(null);
  const userMarkerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [area.lat, area.lon],
        zoom: 11,
        zoomControl: true,
      });

      // CartoDB Dark Matter or OpenStreetMap tile layer for dark theme
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map view, center, user pin and radius circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.setView([area.lat, area.lon], 10, { animate: true });

    // Update or create user location pin
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([area.lat, area.lon]);
    } else {
      const userIcon = L.divIcon({
        className: 'user-pin-icon',
        html: `<div style="
          width: 26px;
          height: 26px;
          background: #10b981;
          border: 3px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 15px #10b981;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 11px;
        ">★</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });
      userMarkerRef.current = L.marker([area.lat, area.lon], { icon: userIcon })
        .addTo(map)
        .bindPopup(`<strong>📍 Selected Area Center</strong><br/>${area.name}`);
    }

    // Update or create radius circle
    if (radiusCircleRef.current) {
      radiusCircleRef.current.setLatLng([area.lat, area.lon]);
      radiusCircleRef.current.setRadius(area.radiusKm * 1000);
    } else {
      radiusCircleRef.current = L.circle([area.lat, area.lon], {
        radius: area.radiusKm * 1000,
        color: '#10b981',
        weight: 1.5,
        fillColor: '#10b981',
        fillOpacity: 0.08,
      }).addTo(map);
    }
  }, [area.lat, area.lon, area.radiusKm, area.name]);

  // Update facility markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    facilities.forEach((fac) => {
      const isSelected = selectedFacility && selectedFacility.id === fac.id;
      const isCompatible = fac.is_compatible;

      const markerColor = isCompatible ? (isSelected ? '#f59e0b' : '#3b82f6') : '#64748b';
      const markerSize = isSelected ? 32 : 24;

      const facilityIcon = L.divIcon({
        className: 'facility-pin-icon',
        html: `<div style="
          width: ${markerSize}px;
          height: ${markerSize}px;
          background: ${markerColor};
          border: 2px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 10px ${markerColor};
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 12px;
          cursor: pointer;
        ">🏭</div>`,
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerSize / 2, markerSize / 2],
      });

      const acceptedBadges = fac.accepted_waste
        .map((w) => `<span style="background: rgba(255,255,255,0.15); padding: 2px 6px; border-radius: 4px; font-size: 10px; text-transform: uppercase;">${w}</span>`)
        .join(' ');

      const popupContent = `
        <div style="font-family: sans-serif; font-size: 13px; line-height: 1.4; min-width: 180px;">
          <h4 style="margin: 0 0 4px 0; color: #38bdf8; font-size: 14px;">${fac.name}</h4>
          <div style="color: #94a3b8; font-size: 11px; margin-bottom: 6px;">${fac.address}</div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span><strong>Distance:</strong> ${fac.distance_km} km</span>
            <span><strong>Cap:</strong> ${fac.capacity_tpd} TPD</span>
          </div>
          <div style="margin-bottom: 6px;">${acceptedBadges}</div>
          <div style="font-size: 11px; color: #34d399;">Suitability: ${fac.suitability_score}%</div>
        </div>
      `;

      const marker = L.marker([fac.latitude, fac.longitude], { icon: facilityIcon })
        .addTo(markersLayer)
        .bindPopup(popupContent);

      marker.on('click', () => {
        if (onSelectFacility) onSelectFacility(fac);
      });
    });
  }, [facilities, selectedFacility]);

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            background: 'rgba(99, 102, 241, 0.15)',
            padding: '0.5rem',
            borderRadius: '8px',
            color: 'var(--indigo-500)',
            display: 'flex'
          }}>
            <Map size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>4. Geospatial Intelligence Map</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Interactive OpenStreetMap showing radius boundary & {facilities.length} nearby recycling plants
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span> Area Origin
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></span> Compatible Plant
          </span>
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '440px', borderRadius: '12px', overflow: 'hidden' }} />
    </div>
  );
}
