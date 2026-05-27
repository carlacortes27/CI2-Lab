import express from 'express';
import multer from 'multer';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ── TRADUCCIÓN ──────────────────────────────────────────────────────────────
router.post('/translate', async (req, res, next) => {
  try {
    const { cvData, targetLanguage = 'en' } = req.body;
    if (!cvData) return res.status(400).json({ error: 'cvData requerido' });
    const translated = await translateCvData(cvData, targetLanguage);
    res.json({ cvData: translated });
  } catch (error) {
    next(error);
  }
});

// ── CORRECCIÓN ORTOGRÁFICA ──────────────────────────────────────────────────
router.post('/correct-spelling', async (req, res, next) => {
  try {
    const { cvData } = req.body;
    if (!cvData) return res.status(400).json({ error: 'cvData requerido' });
    const corrected = await correctCvSpelling(cvData);
    res.json({ cvData: corrected });
  } catch (error) {
    next(error);
  }
});

// ── ANÁLISIS PDF ────────────────────────────────────────────────────────────
router.post('/analyze', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se recibió ningún archivo PDF' });
    const data = await pdfParse(req.file.buffer);
    const cvData = parsePdfTextToCv(data.text);
    res.json({ cvData });
  } catch (error) {
    next(error);
  }
});

// ── MEJORAR CV DESDE PDF ────────────────────────────────────────────────────
router.post('/improve', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se recibió ningún archivo PDF' });
    const data = await pdfParse(req.file.buffer);
    const cvData = parsePdfTextToCv(data.text);
    res.json({ cvData });
  } catch (error) {
    next(error);
  }
});

// ── HELPER: traducir texto via MyMemory ─────────────────────────────────────
async function translateText(text, from, to) {
  if (!text || typeof text !== 'string' || !text.trim()) return text;
  const limited = text.slice(0, 450);
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(limited)}&langpair=${from}|${to}`;
    const response = await fetch(url);
    if (!response.ok) return text;
    const data = await response.json();
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
  } catch {
    // caída silenciosa → devuelve original
  }
  return text;
}

async function translateCvData(cv, targetLang) {
  const fromLang = targetLang === 'en' ? 'es' : 'en';
  const result = JSON.parse(JSON.stringify(cv));

  // Headline personal
  if (result.personal?.headline) {
    result.personal.headline = await translateText(result.personal.headline, fromLang, targetLang);
  }

  // Sobre mí
  if (result.sections?.summary?.text) {
    result.sections.summary.text = await translateText(result.sections.summary.text, fromLang, targetLang);
  }

  // Experiencia
  for (const item of result.sections?.experience?.items || []) {
    if (item.role) item.role = await translateText(item.role, fromLang, targetLang);
    for (const b of item.bullets || []) {
      if (b.text) b.text = await translateText(b.text, fromLang, targetLang);
    }
  }

  // Educación
  for (const item of result.sections?.education?.items || []) {
    if (item.degree) item.degree = await translateText(item.degree, fromLang, targetLang);
    for (const b of item.bullets || []) {
      if (b.text) b.text = await translateText(b.text, fromLang, targetLang);
    }
  }

  // Competencias personales
  if (Array.isArray(result.sections?.personalSkills?.items)) {
    result.sections.personalSkills.items = await Promise.all(
      result.sections.personalSkills.items.map(s => translateText(s, fromLang, targetLang))
    );
  }

  // Competencias técnicas
  const groups = result.sections?.technicalSkills?.groups;
  if (groups && typeof groups === 'object') {
    for (const key of Object.keys(groups)) {
      groups[key] = await Promise.all(groups[key].map(s => translateText(s, fromLang, targetLang)));
    }
  }

  // Proyectos
  for (const item of result.sections?.projects?.items || []) {
    if (item.name) item.name = await translateText(item.name, fromLang, targetLang);
    if (item.description) item.description = await translateText(item.description, fromLang, targetLang);
    for (const b of item.bullets || []) {
      if (b.text) b.text = await translateText(b.text, fromLang, targetLang);
    }
  }

  // Certificaciones
  for (const item of result.sections?.certifications?.items || []) {
    if (item.name) item.name = await translateText(item.name, fromLang, targetLang);
  }

  // Voluntariados
  for (const item of result.sections?.volunteering?.items || []) {
    if (item.organization) item.organization = await translateText(item.organization, fromLang, targetLang);
    if (item.description) item.description = await translateText(item.description, fromLang, targetLang);
  }

  return result;
}

// ── HELPER: corrección via LanguageTool public API ──────────────────────────
async function correctText(text, language = 'es') {
  if (!text || typeof text !== 'string' || !text.trim()) return text;
  try {
    const body = new URLSearchParams({ text, language });
    const response = await fetch('https://api.languagetool.org/v2/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    if (!response.ok) return text;
    const data = await response.json();
    const matches = (data.matches || []).sort((a, b) => b.offset - a.offset);
    let corrected = text;
    for (const match of matches) {
      if (match.replacements?.length > 0) {
        const rep = match.replacements[0].value;
        corrected = corrected.slice(0, match.offset) + rep + corrected.slice(match.offset + match.length);
      }
    }
    return corrected;
  } catch {
    return text;
  }
}

async function correctCvSpelling(cv) {
  const result = JSON.parse(JSON.stringify(cv));

  if (result.personal?.headline) {
    result.personal.headline = await correctText(result.personal.headline);
  }
  if (result.sections?.summary?.text) {
    result.sections.summary.text = await correctText(result.sections.summary.text);
  }
  for (const item of result.sections?.experience?.items || []) {
    for (const b of item.bullets || []) {
      if (b.text) b.text = await correctText(b.text);
    }
  }
  for (const item of result.sections?.education?.items || []) {
    for (const b of item.bullets || []) {
      if (b.text) b.text = await correctText(b.text);
    }
  }
  for (const item of result.sections?.projects?.items || []) {
    if (item.description) item.description = await correctText(item.description);
    for (const b of item.bullets || []) {
      if (b.text) b.text = await correctText(b.text);
    }
  }
  for (const item of result.sections?.volunteering?.items || []) {
    if (item.description) item.description = await correctText(item.description);
  }
  return result;
}

// ── HELPER: parsear texto PDF → estructura CV ───────────────────────────────
function newId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const SECTION_PATTERNS = {
  summary: /^(sobre\s*m[ií]|resumen|perfil\s*profesional|summary|profile|about\s*me)/i,
  experience: /^(experiencia|experience|professional\s*experience|historial\s*laboral|trayectoria)/i,
  education: /^(educaci[oó]n|formaci[oó]n|estudios|education|academic)/i,
  skills: /^(habilidades|competencias|skills|tecnolog[ií]as|conocimientos|aptitudes)/i,
  languages: /^(idiomas|languages|lenguas)/i,
  certifications: /^(certificaciones|certifications|certificados|t[ií]tulos)/i,
  projects: /^(proyectos|projects|trabajos\s*realizados)/i,
  volunteering: /^(voluntariado|volunteering|actividades\s*extracurriculares)/i,
};

function parsePdfTextToCv(rawText) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  // Extraer campos de cabecera
  const emailMatch = rawText.match(/[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = rawText.match(/(\+?[\d][\d\s().-]{7,14}\d)/);
  const linkedinMatch = rawText.match(/linkedin\.com\/in\/[\w-]+/i);

  const firstLine = lines[0] || '';
  const secondLine = lines[1] || '';

  // Detectar secciones
  const sectionLines = {};
  let currentSection = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let matched = false;
    for (const [key, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (pattern.test(line) && line.length < 50) {
        currentSection = key;
        sectionLines[key] = [];
        matched = true;
        break;
      }
    }
    // Ignorar las 2 primeras líneas (nombre y headline) y la propia cabecera de sección
    if (!matched && currentSection && i > 1) {
      sectionLines[currentSection].push(line);
    }
  }

  return {
    personal: {
      fullName: firstLine,
      headline: secondLine,
      email: emailMatch?.[0] || '',
      phone: phoneMatch?.[1]?.trim() || '',
      location: '',
      phoneCountry: '+34',
      phoneNumber: phoneMatch?.[1]?.trim().replace(/^\+\d+\s*/, '') || '',
      links: linkedinMatch
        ? [{ id: 'linkedin', label: 'LinkedIn', url: `https://www.${linkedinMatch[0]}` }]
        : [],
      photoUrl: '',
    },
    sections: {
      summary: {
        visible: true,
        text: (sectionLines.summary || []).join(' '),
      },
      experience: {
        visible: true,
        items: parseExperienceSection(sectionLines.experience || []),
      },
      education: {
        visible: true,
        items: parseEducationSection(sectionLines.education || []),
      },
      technicalSkills: {
        visible: true,
        groups: parseSkillsSection(sectionLines.skills || []),
      },
      personalSkills: {
        visible: true,
        items: [],
      },
      languages: {
        visible: true,
        items: parseLanguagesSection(sectionLines.languages || []),
      },
      certifications: {
        visible: true,
        items: parseCertificationsSection(sectionLines.certifications || []),
      },
      projects: {
        visible: true,
        items: parseProjectsSection(sectionLines.projects || []),
      },
      volunteering: {
        visible: true,
        items: parseVolunteeringSection(sectionLines.volunteering || []),
      },
    },
    layout: {
      order: ['summary', 'experience', 'education', 'technicalSkills', 'personalSkills', 'languages', 'certifications', 'projects', 'volunteering'],
    },
    style: {
      template: 'clasica',
      accentColor: '#111827',
      fontFamily: 'Arial, sans-serif',
      fontSize: 'medium',
    },
    meta: { schemaVersion: 1 },
  };
}

function parseExperienceSection(lines) {
  const items = [];
  let current = null;

  for (const line of lines) {
    const hasYear = /\b(19|20)\d{2}\b/.test(line);
    const isShort = line.length < 80;

    if (hasYear && isShort) {
      if (current) flushItem(items, current);
      current = { id: newId(), role: '', company: line, startDate: '', endDate: '', current: false, bullets: [], _lines: [] };
    } else if (current) {
      if (!current.role) {
        current.role = line;
      } else {
        current._lines.push(line);
      }
    } else {
      current = { id: newId(), role: line, company: '', startDate: '', endDate: '', current: false, bullets: [], _lines: [] };
    }
  }
  if (current) flushItem(items, current);
  return items;
}

function parseEducationSection(lines) {
  const items = [];
  let current = null;

  for (const line of lines) {
    const hasYear = /\b(19|20)\d{2}\b/.test(line);
    const isShort = line.length < 80;

    if (hasYear && isShort) {
      if (current) flushItem(items, current);
      current = { id: newId(), degree: '', institution: line, location: '', startDate: '', endDate: '', current: false, bullets: [], _lines: [] };
    } else if (current) {
      if (!current.degree) {
        current.degree = line;
      } else {
        current._lines.push(line);
      }
    } else {
      current = { id: newId(), degree: line, institution: '', location: '', startDate: '', endDate: '', current: false, bullets: [], _lines: [] };
    }
  }
  if (current) flushItem(items, current);
  return items;
}

function flushItem(items, current) {
  current.bullets = (current._lines || []).slice(0, 4).map(t => ({ id: newId(), text: t }));
  delete current._lines;
  items.push(current);
}

function parseSkillsSection(lines) {
  const all = lines.join(' ');
  const raw = all.split(/[,;·•\n\t|]+/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 35 && !/^\d+$/.test(s));
  const quarter = Math.ceil(raw.length / 4);
  return {
    lenguajes: raw.slice(0, quarter),
    software: raw.slice(quarter, quarter * 2),
    herramientas: raw.slice(quarter * 2, quarter * 3),
    tecnologias: raw.slice(quarter * 3),
  };
}

function parseLanguagesSection(lines) {
  return lines.slice(0, 6).map(line => {
    const parts = line.split(/[-–:|]/);
    return {
      id: newId(),
      name: parts[0]?.trim() || line,
      level: parts[1]?.trim() || '',
      certificate: '',
      note: '',
    };
  });
}

function parseCertificationsSection(lines) {
  return lines.slice(0, 10).map(line => ({
    id: newId(),
    name: line,
    issuer: '',
    level: '',
    date: '',
  }));
}

function parseProjectsSection(lines) {
  const items = [];
  let current = null;

  for (const line of lines) {
    if (line.length < 70 && !line.startsWith('-') && !line.startsWith('•')) {
      if (current) items.push(current);
      current = { id: newId(), name: line, description: '', technologies: '', link: '', bullets: [] };
    } else if (current) {
      current.bullets.push({ id: newId(), text: line.replace(/^[-•]\s*/, '') });
    } else {
      current = { id: newId(), name: line, description: '', technologies: '', link: '', bullets: [] };
    }
  }
  if (current) items.push(current);
  return items.slice(0, 5);
}

function parseVolunteeringSection(lines) {
  return lines.slice(0, 5).map(line => ({
    id: newId(),
    organization: line,
    date: '',
    description: '',
  }));
}

export default router;
