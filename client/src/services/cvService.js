const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Error del servidor (${response.status})`);
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
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_URL}/cv/analyze`, { method: 'POST', body: formData });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Error analizando PDF (${response.status})`);
  }
  return response.json();
}

export async function improveUploadedCV(file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_URL}/cv/improve`, { method: 'POST', body: formData });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Error procesando PDF (${response.status})`);
  }
  return response.json();
}

// ── DESCARGA PDF REAL (html2canvas + jsPDF) ─────────────────────────────────
export async function downloadAsPDF(cvName = 'cv-comillas') {
  const sheet = document.querySelector('.cv-sheet');
  if (!sheet) throw new Error('Vista previa no encontrada. Abre el editor primero.');

  const { default: html2canvas } = await import('html2canvas');
  const { jsPDF } = await import('jspdf');

  // Clonar fuera de pantalla para capturar a tamaño real sin transforms
  const clone = sheet.cloneNode(true);
  Object.assign(clone.style, {
    position: 'fixed',
    top: '-9999px',
    left: '-9999px',
    width: '794px',
    height: '1123px',
    transform: 'none',
    overflow: 'visible',
    boxShadow: 'none',
  });
  document.body.appendChild(clone);

  try {
    console.log('[PDF] Iniciando html2canvas...');
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      height: 1123,
    });
    console.log('[PDF] Canvas generado:', canvas.width, 'x', canvas.height);

    const imgData = canvas.toDataURL('image/jpeg', 0.93);
    console.log('[PDF] imgData length:', imgData.length);

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    console.log('[PDF] Imagen añadida al PDF, descargando...');

    const blob = pdf.output('blob');
    console.log('[PDF] Blob size:', blob.size);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slugify(cvName)}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    console.log('[PDF] Descarga disparada.');
  } finally {
    if (document.body.contains(clone)) document.body.removeChild(clone);
  }
}

function slugify(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'cv-comillas';
}
