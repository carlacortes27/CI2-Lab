const API_URL = import.meta.env.VITE_API_URL || '';
const BUCKET_ENDPOINT = import.meta.env.VITE_BUCKET_ENDPOINT || '';

async function request(path, options = {}) {
  if (!API_URL) {
    throw new Error('Backend no configurado. Define VITE_API_URL para activar este servicio.');
  }

  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Error del backend (${response.status})`);
  }

  return response.json();
}

export async function correctSpelling(cvData) {
  return request('/cv/correct-spelling', {
    method: 'POST',
    body: JSON.stringify({ cvData }),
  });
}

export async function translateCV(cvData, targetLanguage) {
  return request('/cv/translate', {
    method: 'POST',
    body: JSON.stringify({ cvData, targetLanguage }),
  });
}

export async function analyzeUploadedCV(file) {
  if (!API_URL) {
    throw new Error('Backend no configurado. Define VITE_API_URL para analizar PDFs.');
  }
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_URL}/cv/analyze`, { method: 'POST', body: formData });
  if (!response.ok) throw new Error(`Error analizando CV (${response.status})`);
  return response.json();
}

export async function improveUploadedCV(file) {
  if (!API_URL) {
    throw new Error('Backend no configurado. Define VITE_API_URL para mejorar PDFs.');
  }
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_URL}/cv/improve`, { method: 'POST', body: formData });
  if (!response.ok) throw new Error(`Error mejorando CV (${response.status})`);
  return response.json();
}

export async function uploadCVToBucket(file) {
  if (!BUCKET_ENDPOINT) {
    throw new Error('Bucket no configurado. Define VITE_BUCKET_ENDPOINT o crea un endpoint backend seguro.');
  }
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(BUCKET_ENDPOINT, { method: 'POST', body: formData });
  if (!response.ok) throw new Error(`Error subiendo CV (${response.status})`);
  return response.json();
}

export async function getCVDownloadUrl(fileName) {
  return request(`/cv/download-url?fileName=${encodeURIComponent(fileName)}`);
}

export async function generateCVPdf(cvData) {
  if (!API_URL) {
    throw new Error('Backend no configurado. Define VITE_API_URL para generar un PDF subible al bucket.');
  }
  const response = await fetch(`${API_URL}/cv/export-pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cvData }),
  });
  if (!response.ok) throw new Error(`Error generando PDF (${response.status})`);
  return response.blob();
}

export function exportToPDF() {
  document.body.classList.add('printing-cv');
  window.print();
  window.setTimeout(() => document.body.classList.remove('printing-cv'), 500);
}

export async function savePreviewToCloud(cvData) {
  const pdfBlob = await generateCVPdf(cvData);
  const file = new File([pdfBlob], `${slugify(cvData.personal?.fullName || 'cv-comillas')}.pdf`, {
    type: 'application/pdf',
  });
  return uploadCVToBucket(file);
}

function slugify(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'cv-comillas';
}

export const cvService = {
  correctSpelling,
  translateCV,
  analyzeUploadedCV,
  improveUploadedCV,
  uploadCVToBucket,
  getCVDownloadUrl,
  generateCVPdf,
};
