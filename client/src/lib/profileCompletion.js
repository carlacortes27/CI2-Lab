const CHECKS = [
  { label: 'Nombre',            fn: cv => !!cv.personal?.fullName?.trim() },
  { label: 'Email',             fn: cv => !!cv.personal?.email?.trim() },
  { label: 'Resumen',           fn: cv => !!cv.sections?.summary?.text?.trim() },
  { label: 'Educación',         fn: cv => (cv.sections?.education?.items?.length ?? 0) > 0 },
  { label: 'Idiomas (CV)',      fn: cv => (cv.sections?.languages?.items?.length ?? 0) > 0 },
  { label: 'Ubicación',         fn: cv => (cv.preferences?.locations?.length ?? 0) > 0 },
  { label: 'Modalidad',         fn: cv => (cv.preferences?.modalities?.length ?? 0) > 0 },
  { label: 'Sector',            fn: cv => (cv.preferences?.sectors?.length ?? 0) > 0 },
  { label: 'Disponibilidad',    fn: cv => !!cv.preferences?.startDate },
  { label: 'Tecnologías',       fn: cv => (cv.preferences?.technologies?.length ?? 0) > 0 },
];

export function calcProfileCompletion(cv) {
  if (!cv) return 0;
  return CHECKS.filter(c => c.fn(cv)).length * 10;
}
