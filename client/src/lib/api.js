// En desarrollo, Vite proxea /api → http://localhost:3001
const BASE_URL = '';

async function request(path, options = {}) {
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
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

export function getApplications(token) {
  return request('/api/applications', { token });
}

export function applyToOffer(offerId, token) {
  return request('/api/applications', { method: 'POST', body: { offerId }, token });
}

export function saveOffer(offerId, token) {
  return request('/api/applications/saved', { method: 'POST', body: { offerId }, token });
}

export function advanceApplication(applicationId, token) {
  return request(`/api/applications/${applicationId}/advance`, { method: 'POST', token });
}

export function rejectApplication(applicationId, token) {
  return request(`/api/applications/${applicationId}/reject`, { method: 'POST', token });
}

export function registerUser(data) {
  return request('/api/auth/register', { method: 'POST', body: data });
}

export function loginUser(data) {
  return request('/api/auth/login', { method: 'POST', body: data });
}

export function getCurrentUser(token) {
  return request('/api/auth/me', { token });
}

export function logoutUser(token) {
  return request('/api/auth/logout', { method: 'POST', token });
}

export function getAdvisors() {
  return request('/api/advisors');
}

export function getAdvisorById(id) {
  return request(`/api/advisors/${id}`);
}

export function getAppointments() {
  return request('/api/appointments');
}

export function createAppointment(data) {
  return request('/api/appointments', { method: 'POST', body: data });
}
