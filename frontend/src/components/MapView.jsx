import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Map, ShieldCheck, Crosshair, ZoomIn } from 'lucide-react';

export default function MapView({ area, setArea, facilities = [], selectedFacility, onSelectFacility }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const labelLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const radiusCircleRef = useRef(null);
  const userMarkerRef = useRef(null);

  // Basemap toggle: 'esri_dark' (Clean Dark, Zero Watermark) or 'osm' (OpenStreetMap)
  const [mapLayer, setMapLayer] = useState('esri_dark');

  // Helper to attach appropriate tile layer
  const applyTileLayer = (map, layerType) => {
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }
    if (labelLayerRef.current) {
      map.removeLayer(labelLayerRef.current);
      labelLayerRef.current = null;
    }

    if (layerType === 'osm') {
      // OpenStreetMap Standard Layer (100% Free, reliable)
      const osmTiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      });
      osmTiles.addTo(map);
      tileLayerRef.current = osmTiles;
    } else {
      // Esri ArcGIS World Dark Gray Base + Reference Labels (Clean, dark aesthetic, NO watermarks, 100% Free)
      const esriDarkTiles = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, HERE, Garmin, OpenStreetMap contributors',
          maxZoom: 16,
        }
      );
      const esriLabels = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 16,
        }
      );

      esriDarkTiles.addTo(map);
      esriLabels.addTo(map);
      tileLayerRef.current = esriDarkTiles;
      labelLayerRef.current = esriLabels;
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [area.lat, area.lon],
        zoom: 11,
        zoomControl: true,
      });

      applyTileLayer(map, mapLayer);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Allow user to click anywhere on map to reposition the selected area
      map.on('click', (e) => {
        if (setArea) {
          setArea((prev) => ({
            ...prev,
            lat: parseFloat(e.latlng.lat.toFixed(4)),
            lon: parseFloat(e.latlng.lng.toFixed(4)),
            name: `Location (${e.latlng.lat.toFixed(3)}°N, ${e.latlng.lng.toFixed(3)}°E)`
          }));
        }
      });
    }

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);
    const timer = setTimeout(handleResize, 300);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update tile layer when toggled
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    applyTileLayer(mapInstanceRef.current, mapLayer);
  }, [mapLayer]);

  // Synchronize map center, user marker and discovery radius circle with selected area
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Smoothly fly to the newly selected area
    map.flyTo([area.lat, area.lon], map.getZoom() || 11, { duration: 1.0 });

    // Update or create Area Origin pin
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([area.lat, area.lon]);
      userMarkerRef.current.setPopupContent(`
        <div style="font-family: sans-serif; font-size: 13px; line-height: 1.4;">
          <strong style="color: #34d399;">📍 Selected Area Origin</strong><br/>
          <strong>${area.name}</strong><br/>
          <span style="color: #94a3b8; font-size: 11px;">Coord: ${area.lat.toFixed(4)}°N, ${area.lon.toFixed(4)}°E</span><br/>
          <span style="color: #38bdf8; font-size: 11px;">Discovery Radius: ${area.radiusKm} km</span>
        </div>
      `);
    } else {
      const userIcon = L.divIcon({
        className: 'user-pin-icon',
        html: `<div style="
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #10b981, #059669);
          border: 3px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 16px #10b981;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 13px;
          cursor: pointer;
        ">★</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      userMarkerRef.current = L.marker([area.lat, area.lon], { icon: userIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 13px; line-height: 1.4;">
            <strong style="color: #34d399;">📍 Selected Area Origin</strong><br/>
            <strong>${area.name}</strong><br/>
            <span style="color: #94a3b8; font-size: 11px;">Coord: ${area.lat.toFixed(4)}°N, ${area.lon.toFixed(4)}°E</span><br/>
            <span style="color: #38bdf8; font-size: 11px;">Discovery Radius: ${area.radiusKm} km</span>
          </div>
        `);
    }

    // Update or create discovery radius circle
    if (radiusCircleRef.current) {
      radiusCircleRef.current.setLatLng([area.lat, area.lon]);
      radiusCircleRef.current.setRadius(area.radiusKm * 1000);
    } else {
      radiusCircleRef.current = L.circle([area.lat, area.lon], {
        radius: area.radiusKm * 1000,
        color: '#10b981',
        weight: 2,
        dashArray: '4, 6',
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
      const markerSize = isSelected ? 34 : 26;

      const facilityIcon = L.divIcon({
        className: 'facility-pin-icon',
        html: `<div style="
          width: ${markerSize}px;
          height: ${markerSize}px;
          background: ${markerColor};
          border: 2.5px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 12px ${markerColor};
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: ${isSelected ? '14px' : '12px'};
          cursor: pointer;
          transition: transform 0.2s ease;
        ">🏭</div>`,
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerSize / 2, markerSize / 2],
      });

      const acceptedBadges = (fac.accepted_waste || [])
        .map((w) => `<span style="background: rgba(255,255,255,0.15); padding: 2px 6px; border-radius: 4px; font-size: 10px; text-transform: uppercase;">${w}</span>`)
        .join(' ');

      const popupContent = `
        <div style="font-family: sans-serif; font-size: 13px; line-height: 1.4; min-width: 200px;">
          <h4 style="margin: 0 0 4px 0; color: #38bdf8; font-size: 14px; font-weight: 700;">${fac.name}</h4>
          <div style="color: #94a3b8; font-size: 11px; margin-bottom: 6px;">${fac.address}</div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span><strong>Distance:</strong> ${fac.distance_km} km</span>
            <span><strong>Capacity:</strong> ${fac.capacity_tpd} TPD</span>
          </div>
          <div style="margin-bottom: 6px;">${acceptedBadges}</div>
          <div style="font-size: 11px; color: #34d399; font-weight: 600;">Suitability Score: ${fac.suitability_score}%</div>
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

  // Recenter to area center
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([area.lat, area.lon], 11, { duration: 1.0 });
    }
  };

  // Fit bounds to entire radius circle
  const handleFitRadius = () => {
    if (mapInstanceRef.current && radiusCircleRef.current) {
      mapInstanceRef.current.fitBounds(radiusCircleRef.current.getBounds(), { padding: [25, 25] });
    }
  };

  return (
    <div className="glass-panel" style={{ padding: 'clamp(1rem, 2.5vw, 1.5rem)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '0.8rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            background: 'rgba(99, 102, 241, 0.15)',
            padding: '0.5rem',
            borderRadius: '10px',
            color: 'var(--indigo-500)',
            display: 'flex',
            flexShrink: 0
          }}>
            <Map size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: 'var(--text-primary)', fontWeight: 700 }}>
                4. Geospatial Intelligence Map
              </h3>
              <span style={{
                fontSize: '0.72rem',
                padding: '2px 8px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.14)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                <ShieldCheck size={12} /> Live Sync with {area.name.split(',')[0]}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Click anywhere on the map to set a new zone, or inspect recycling facilities within {area.radiusKm} km
            </p>
          </div>
        </div>

        {/* Controls Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Quick Action Buttons */}
          <button
            type="button"
            onClick={handleRecenter}
            className="btn-secondary"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.76rem', gap: '4px', minHeight: '32px' }}
            title="Recenter map to selected area center"
          >
            <Crosshair size={13} color="var(--emerald-400)" />
            <span>Center Area</span>
          </button>

          <button
            type="button"
            onClick={handleFitRadius}
            className="btn-secondary"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.76rem', gap: '4px', minHeight: '32px' }}
            title="Zoom to fit the full discovery radius"
          >
            <ZoomIn size={13} color="var(--cyan-400)" />
            <span>Fit Radius</span>
          </button>

          {/* Basemap Layer Selector */}
          <div style={{
            display: 'flex',
            background: 'rgba(0, 0, 0, 0.35)',
            padding: '3px',
            borderRadius: '10px',
            border: '1px solid var(--border-glass)'
          }}>
            <button
              type="button"
              onClick={() => setMapLayer('esri_dark')}
              style={{
                padding: '4px 10px',
                borderRadius: '7px',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: mapLayer === 'esri_dark' ? 'var(--emerald-600)' : 'transparent',
                color: mapLayer === 'esri_dark' ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all 0.2s ease'
              }}
              title="Clean High-Contrast Dark Basemap (No Watermark)"
            >
              Dark Canvas
            </button>
            <button
              type="button"
              onClick={() => setMapLayer('osm')}
              style={{
                padding: '4px 10px',
                borderRadius: '7px',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: mapLayer === 'osm' ? 'var(--blue-500)' : 'transparent',
                color: mapLayer === 'osm' ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all 0.2s ease'
              }}
              title="OpenStreetMap Standard Street Layer"
            >
              Street (OSM)
            </button>
          </div>
        </div>
      </div>

      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        className="map-view-canvas"
        style={{
          width: '100%',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid var(--border-glass)'
        }}
      />

      {/* Map Legend & Active Zone Footer */}
      <div style={{
        marginTop: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        fontSize: '0.76rem',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }}></span>
            <span>Area Origin ({area.name.split(',')[0]})</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#3b82f6' }}></span>
            <span>Compatible Facility</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#f59e0b' }}></span>
            <span>Selected Facility</span>
          </span>
        </div>

        <span style={{ color: 'var(--text-muted)' }}>
          Tip: Click any point on the map to set that location as your analysis zone
        </span>
      </div>
    </div>
  );
}
