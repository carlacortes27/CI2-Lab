// En desarrollo, Vite proxea /api → http://localhost:3001
const BASE_URL = '';

async function request(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error ${res.status}`);
  }
  return res.json();
}

export function checkHealth() {
  return request('/api/health');
}

export function getOffers(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.append(k, v);
  });
  const qs = params.toString();
  return request(`/api/offers${qs ? `?${qs}` : ''}`);
}

export function getOfferById(id) {
  return request(`/api/offers/${id}`);
}

export function getEvents() {
  return request('/api/events');
}
