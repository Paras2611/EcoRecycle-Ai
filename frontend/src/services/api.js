const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/health`);
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    console.warn('API health check error:', err);
    return { status: 'offline', facilities_indexed: 0 };
  }
}

export async function analyzeSingleImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_BASE_URL}/api/v1/analyze/image`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Image classification failed');
  }
  return await res.json();
}

// Auth token management
export function getAuthToken() {
  return localStorage.getItem('ecorecycle_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('ecorecycle_token', token);
  } else {
    localStorage.removeItem('ecorecycle_token');
  }
}

export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Login failed');
  }
  const data = await res.json();
  setAuthToken(data.access_token);
  return data;
}

export async function registerUser(name, email, password) {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Registration failed');
  }
  const data = await res.json();
  setAuthToken(data.access_token);
  return data;
}

export async function getMe() {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      setAuthToken(null);
      return null;
    }
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function fetchSavedSessions(city = null) {
  const token = getAuthToken();
  let url = `${API_BASE_URL}/api/v1/user/sessions`;
  if (city && city.trim()) {
    url += `?city=${encodeURIComponent(city.trim())}`;
  }

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error('Failed to load saved sessions');
  return await res.json();
}

export async function fetchSessionFacilities(sessionId) {
  const res = await fetch(`${API_BASE_URL}/api/v1/sessions/${sessionId}/facilities`);
  if (!res.ok) throw new Error('Failed to fetch session facilities');
  return await res.json();
}

export async function analyzeBatch(files, areaName = 'Karad, Maharashtra', cityName = 'Karad', lat = 17.2880, lon = 74.1920, radiusKm = 25.0) {
  const formData = new FormData();
  for (const file of files) {
    formData.append('images', file);
  }
  formData.append('area_name', areaName);
  if (cityName) {
    formData.append('city_name', cityName);
  }
  formData.append('latitude', lat.toString());
  formData.append('longitude', lon.toString());
  formData.append('radius_km', radiusKm.toString());

  const headers = {};
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/api/v1/analyze/batch`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Batch analysis failed');
  }
  return await res.json();
}

export async function getNearbyFacilities(lat, lon, radiusKm = 50.0, wasteType = null) {
  let url = `${API_BASE_URL}/api/v1/facilities/nearby?latitude=${lat}&longitude=${lon}&radius_km=${radiusKm}`;
  if (wasteType) {
    url += `&waste_type=${encodeURIComponent(wasteType)}`;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch nearby facilities');

  }
  return await res.json();
}

export async function getRecommendation(wasteType, quantityKg = 100, lat = 17.2880, lon = 74.1920, radiusKm = 50.0) {
  const res = await fetch(`${API_BASE_URL}/api/v1/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      waste_type: wasteType,
      quantity_kg: quantityKg,
      latitude: lat,
      longitude: lon,
      radius_km: radiusKm,
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch recommendation');
  }
  return await res.json();
}

// --- Mappls (MapmyIndia) Quota-Preserving Client Services ---

export async function fetchMapplsStatus() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/mappls/status`);
    if (!res.ok) return { cost_guard_active: true, error: true };
    return await res.json();
  } catch (err) {
    return { cost_guard_active: true, error: true };
  }
}

export async function fetchMapplsReverseGeocode(lat, lon) {
  // Check client sessionStorage first to avoid ANY network roundtrip
  const cacheKey = `mappls_geo_${lat.toFixed(3)}_${lon.toFixed(3)}`;
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      return { ...parsed, client_cache_hit: true };
    }
  } catch (e) {
    // Ignore storage quota errors
  }

  const res = await fetch(`${API_BASE_URL}/api/v1/mappls/reverse-geocode?latitude=${lat}&longitude=${lon}`);
  if (!res.ok) {
    throw new Error('Locality lookup failed');
  }
  const data = await res.json();
  try {
    sessionStorage.setItem(cacheKey, JSON.stringify(data));
  } catch (e) {}
  return data;
}

export async function fetchMapplsDrivingDistance(originLat, originLon, destLat, destLon) {
  const cacheKey = `mappls_dist_${originLat.toFixed(3)}_${originLon.toFixed(3)}_${destLat.toFixed(3)}_${destLon.toFixed(3)}`;
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      return { ...JSON.parse(cached), client_cache_hit: true };
    }
  } catch (e) {}

  const url = `${API_BASE_URL}/api/v1/mappls/driving-distance?origin_lat=${originLat}&origin_lon=${originLon}&dest_lat=${destLat}&dest_lon=${destLon}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Driving logistics lookup failed');
  }
  const data = await res.json();
  try {
    sessionStorage.setItem(cacheKey, JSON.stringify(data));
  } catch (e) {}
  return data;
}

