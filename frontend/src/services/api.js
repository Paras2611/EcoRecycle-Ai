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

export async function analyzeBatch(files, areaName = 'Karad, Maharashtra', lat = 17.2880, lon = 74.1920, radiusKm = 25.0) {
  const formData = new FormData();
  for (const file of files) {
    formData.append('images', file);
  }
  formData.append('area_name', areaName);
  formData.append('latitude', lat.toString());
  formData.append('longitude', lon.toString());
  formData.append('radius_km', radiusKm.toString());

  const res = await fetch(`${API_BASE_URL}/api/v1/analyze/batch`, {
    method: 'POST',
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
