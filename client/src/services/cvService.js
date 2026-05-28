const API_URL = import.meta.env.VITE_API_URL || '/api';

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

// ── DESCARGA PDF (jsPDF programático, sin html2canvas) ──────────────────────
//
// Construye el PDF directamente desde el objeto `cv` para evitar que html2canvas
// se bloquee esperando Google Fonts (problema conocido en entornos sin acceso a
// fonts.googleapis.com). La firma acepta el objeto CV completo; el nombre de
// archivo se deriva de cv.personal.fullName si se pasa como objeto.
export async function downloadAsPDF(cvOrName, cvData) {
  // Soporte para llamada antigua: downloadAsPDF(name) sin datos
  // y llamada nueva: downloadAsPDF(cv) con el objeto completo
  let fileName, cv;
  if (cvOrName && typeof cvOrName === 'object') {
    cv = cvOrName;
    fileName = cv.personal?.fullName || 'cv-comillas';
  } else {
    fileName = cvOrName || 'cv-comillas';
    cv = cvData || null;
  }

  const { jsPDF } = await import('jspdf');

  console.log('[PDF] Iniciando generación programática con jsPDF...');

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Si no tenemos datos del CV, intentamos leer el DOM como fallback
  if (!cv) {
    console.warn('[PDF] No se pasaron datos del CV. Generando PDF mínimo.');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(14);
    pdf.text('CV generado desde cvComillas', 20, 20);
    triggerDownload(pdf, fileName);
    return;
  }

  buildCVPdf(pdf, cv);
  triggerDownload(pdf, fileName);
  console.log('[PDF] Descarga disparada.');
}

// ── Constructor del contenido del PDF ────────────────────────────────────────

function buildCVPdf(pdf, cv) {
  const p   = cv.personal  || {};
  const s   = cv.sections  || {};
  const order = cv.layout?.order || Object.keys(s);
  const blockStyles = cv.style?.blockStyles || {};

  // Dimensiones A4 en mm
  const pageW  = 210;
  const pageH  = 297;
  const marginL = 18;
  const marginR = 18;
  const contentW = pageW - marginL - marginR;

  // Colores
  const accent = hexToRgb(cv.style?.accentColor || '#1e40af');
  const black  = { r: 30,  g: 30,  b: 30  };
  const gray   = { r: 90,  g: 90,  b: 90  };
  const light  = { r: 150, g: 150, b: 150 };

  let y = 46; // cursor vertical

  // ── Cabecera ──────────────────────────────────────────────────────────────
  pdf.setFillColor(accent.r, accent.g, accent.b);
  pdf.rect(0, 0, pageW, 38, 'F');

  // Nombre
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  const name = p.fullName || 'Nombre completo';
  pdf.text(name, marginL, 15);

  // Titular
  if (p.headline) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(p.headline, marginL, 23);
  }

  // Contacto
  const contactItems = [p.phone, p.email, p.location, ...(p.links || []).map(l => l.url)].filter(Boolean);
  if (contactItems.length) {
    pdf.setFontSize(8);
    pdf.setTextColor(220, 220, 220);
    const contactLine = contactItems.join('  ·  ');
    pdf.text(contactLine, marginL, 31, { maxWidth: contentW });
  }

  // ── Secciones ─────────────────────────────────────────────────────────────
  const sectionLabels = {
    summary:        'Sobre mí',
    education:      'Educación',
    experience:     'Experiencia laboral',
    projects:       'Proyectos destacados',
    technicalSkills:'Competencias técnicas',
    personalSkills: 'Competencias personales',
    languages:      'Idiomas',
    certifications: 'Certifications',
    volunteering:   'Voluntariados',
  };

  for (const key of order) {
    const sec = s[key];
    if (!sec?.visible) continue;

    // Asegurar espacio mínimo para el título de sección (evitar huérfanos)
    if (y > pageH - 20) {
      pdf.addPage();
      y = 18;
    }

    // Título de sección con línea separadora
    pdf.setTextColor(accent.r, accent.g, accent.b);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text((sectionLabels[key] || key).toUpperCase(), marginL, y);
    y += 1.5;
    pdf.setDrawColor(accent.r, accent.g, accent.b);
    pdf.setLineWidth(0.4);
    pdf.line(marginL, y, marginL + contentW, y);
    y += 4;

    // Contenido según tipo de sección
    switch (key) {
      case 'summary':
        y = addWrappedText(pdf, sec.text || '', marginL, y, contentW, black, textOptions(blockStyles.summary, 9, 'normal'));
        break;

      case 'education':
      case 'experience':
        for (const item of sec.items || []) {
          y = ensureSpace(pdf, y, pageH, 18);
          const title    = key === 'education' ? item.degree : item.role;
          const subtitle = key === 'education'
            ? [item.institution, item.location].filter(Boolean).join(' | ')
            : item.company;
          const date     = item.duration || dateRange(item);
          y = addTimelineItem(pdf, {
            sectionKey: key,
            item,
            title,
            titleField: key === 'education' ? 'degree' : 'role',
            subtitle,
            date,
            bullets: item.bullets,
            blockStyles,
          }, marginL, y, contentW, black, gray, light);
        }
        break;

      case 'projects':
        for (const item of sec.items || []) {
          y = ensureSpace(pdf, y, pageH, 16);
          const subtitle = [item.description, item.technologies].filter(Boolean).join(' | ');
          y = addTimelineItem(pdf, {
            sectionKey: key,
            item,
            title: item.name,
            titleField: 'name',
            subtitle,
            date: item.link,
            bullets: item.bullets,
            blockStyles,
          }, marginL, y, contentW, black, gray, light);
        }
        break;

      case 'technicalSkills': {
        const allSkills = Object.values(sec.groups || {}).flat().filter(Boolean);
        y = addBulletList(pdf, allSkills, marginL, y, contentW, 9, black);
        break;
      }

      case 'personalSkills':
        y = addBulletList(pdf, sec.items || [], marginL, y, contentW, 9, black);
        break;

      case 'languages':
        for (const item of sec.items || []) {
          y = ensureSpace(pdf, y, pageH, 6);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);
          pdf.setTextColor(black.r, black.g, black.b);
          const lvlText = [item.level, item.certificate, item.note].filter(Boolean).join(' | ');
          pdf.text(item.name, marginL, y);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(gray.r, gray.g, gray.b);
          pdf.text(lvlText, marginL + 30, y);
          y += 5.5;
        }
        break;

      case 'certifications':
        for (const item of sec.items || []) {
          y = ensureSpace(pdf, y, pageH, 6);
          applyTextStyle(pdf, blockStyles[`certifications:${item.id}:name`], 9, black, 'bold');
          pdf.text(item.name, marginL, y);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(gray.r, gray.g, gray.b);
          const detail = [item.issuer, item.level, item.date].filter(Boolean).join(' | ');
          pdf.text(detail, marginL + 60, y);
          y += 5.5;
        }
        break;

      case 'volunteering':
        for (const item of sec.items || []) {
          y = ensureSpace(pdf, y, pageH, 10);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);
          pdf.setTextColor(black.r, black.g, black.b);
          pdf.text(item.organization || '', marginL, y);
          y += 4.5;
          if (item.description) {
            y = addWrappedText(
              pdf,
              [item.date, item.description].filter(Boolean).join(' | '),
              marginL + 3,
              y,
              contentW - 3,
              gray,
              textOptions(blockStyles[`volunteering:${item.id}:description`], 8, 'normal')
            );
          }
        }
        break;

      default:
        break;
    }

    y += 4; // espacio entre secciones
  }
}

// ── Helpers de renderizado ────────────────────────────────────────────────────

function addTimelineItem(pdf, { sectionKey, item, title, titleField, subtitle, date, bullets = [], blockStyles = {} }, x, y, maxW, black, gray, light) {
  // Título + fecha en la misma línea
  const titleOptions = applyTextStyle(pdf, blockStyles[`${sectionKey}:${item.id}:${titleField}`], 9.5, black, 'bold');
  if (date) {
    const dateW = pdf.getStringUnitWidth(date) * titleOptions.fontSize / pdf.internal.scaleFactor;
    pdf.text(title || '', x, y, { maxWidth: maxW - dateW - 4 });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(light.r, light.g, light.b);
    pdf.text(date, x + maxW - dateW, y, { align: 'right' });
  } else {
    pdf.text(title || '', x, y, { maxWidth: maxW });
  }
  y += Math.max(4.5, titleOptions.lineH);

  if (subtitle) {
    y = addWrappedText(pdf, subtitle, x, y, maxW, gray, textOptions(null, 8.5, 'italic'));
  }

  const validBullets = (bullets || []).filter(b => b.text);
  if (validBullets.length) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(black.r, black.g, black.b);
    for (const b of validBullets) {
      y = addWrappedText(
        pdf,
        `• ${b.text}`,
        x + 3,
        y,
        maxW - 3,
        black,
        textOptions(blockStyles[`${sectionKey}:${item.id}:bullet:${b.id}`], 8.5, 'normal')
      );
    }
  }

  y += 2;
  return y;
}

function addBulletList(pdf, items, x, y, maxW, fontSize, color) {
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(fontSize);
  pdf.setTextColor(color.r, color.g, color.b);

  // Mostrar como lista inline separada por comas para ahorrar espacio
  const line = items.join('  ·  ');
  y = addWrappedText(pdf, line, x, y, maxW, fontSize, color, 'normal', 4.5);
  return y;
}

function addWrappedText(pdf, text, x, y, maxW, fontSizeOrColor, colorOrOptions, style, lineH) {
  if (!text) return y;
  const isStyledCall = typeof fontSizeOrColor === 'object' && typeof colorOrOptions === 'object' && 'fontSize' in colorOrOptions;
  const color = isStyledCall ? fontSizeOrColor : colorOrOptions;
  const options = isStyledCall
    ? colorOrOptions
    : textOptions(null, fontSizeOrColor, style || 'normal', lineH);
  pdf.setFont(options.font, options.fontFace);
  pdf.setFontSize(options.fontSize);
  pdf.setTextColor(color.r, color.g, color.b);
  const lines = pdf.splitTextToSize(String(text), maxW);
  const pageH = pdf.internal.pageSize.getHeight();
  for (const line of lines) {
    if (y > pageH - 15) {
      pdf.addPage();
      y = 18;
    }
    pdf.text(line, x, y);
    y += options.lineH;
  }
  return y;
}

function textOptions(style, baseSize, defaultFace, customLineH) {
  const fontSize = Number(style?.fontSize) || baseSize;
  return {
    font: pdfFont(style?.fontFamily),
    fontFace: pdfFontFace(style, defaultFace),
    fontSize,
    lineH: customLineH || Math.max(3.8, fontSize * 0.48),
  };
}

function applyTextStyle(pdf, style, baseSize, color, defaultFace) {
  const options = textOptions(style, baseSize, defaultFace);
  pdf.setFont(options.font, options.fontFace);
  pdf.setFontSize(options.fontSize);
  pdf.setTextColor(color.r, color.g, color.b);
  return options;
}

function pdfFont(fontFamily = '') {
  const normalized = String(fontFamily).toLowerCase();
  if (normalized.includes('times') || normalized.includes('georgia')) return 'times';
  return 'helvetica';
}

function pdfFontFace(style = {}, defaultFace = 'normal') {
  const bold = style?.fontWeight === '700' || defaultFace === 'bold' || defaultFace === 'bolditalic';
  const italic = style?.fontStyle === 'italic' || defaultFace === 'italic' || defaultFace === 'bolditalic';
  if (bold && italic) return 'bolditalic';
  if (bold) return 'bold';
  if (italic) return 'italic';
  return 'normal';
}

function ensureSpace(pdf, y, pageH, needed) {
  if (y + needed > pageH - 15) {
    pdf.addPage();
    return 18;
  }
  return y;
}

function dateRange(item) {
  return [item.startDate, item.current ? 'Actualidad' : item.endDate].filter(Boolean).join(' - ');
}

function hexToRgb(hex) {
  const clean = String(hex).replace('#', '');
  const num   = parseInt(clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function triggerDownload(pdf, name) {
  const blob = pdf.output('blob');
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${slugify(name)}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function slugify(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'cv-comillas';
}
