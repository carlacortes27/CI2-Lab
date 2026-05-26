const SCHEMA_VERSION = 1;
const PREFIX = 'cvcomillas.';

export function saveCv(cv) {
  localStorage.setItem(`${PREFIX}cv.${cv.meta.id}`, JSON.stringify(cv));
  const index = getIndex();
  if (!index.includes(cv.meta.id)) {
    index.push(cv.meta.id);
    localStorage.setItem(`${PREFIX}index`, JSON.stringify(index));
  }
}

export function loadCv(id) {
  const raw = localStorage.getItem(`${PREFIX}cv.${id}`);
  if (!raw) return null;
  const cv = JSON.parse(raw);
  return migrateIfNeeded(cv);
}

export function getIndex() {
  const raw = localStorage.getItem(`${PREFIX}index`);
  return raw ? JSON.parse(raw) : [];
}

export function getActiveCvId() {
  return localStorage.getItem(`${PREFIX}activeCvId`);
}

export function setActiveCvId(id) {
  localStorage.setItem(`${PREFIX}activeCvId`, id);
}

export function getSchemaVersion() {
  const raw = localStorage.getItem(`${PREFIX}schemaVersion`);
  return raw ? parseInt(raw, 10) : null;
}

export function setSchemaVersion(v) {
  localStorage.setItem(`${PREFIX}schemaVersion`, String(v));
}

// Aplica migraciones si schemaVersion es anterior a la actual
export function migrateIfNeeded(cv) {
  const v = cv.meta?.schemaVersion ?? 0;
  if (v >= SCHEMA_VERSION) return cv;

  // Migraciones futuras se añaden aquí: if (v < 2) { ... }
  return { ...cv, meta: { ...cv.meta, schemaVersion: SCHEMA_VERSION } };
}
