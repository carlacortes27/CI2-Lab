const DEFAULT_WEIGHTS = {
  requirements: 0.7,
  preferences: 0.3,
};

const LEVEL_TO_NUMBER = {
  a1: 1,
  a2: 2,
  b1: 3,
  b2: 4,
  c1: 5,
  c2: 5,
  nativo: 5,
  native: 5,
};

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function uniq(values) {
  return [...new Set(values.filter(Boolean))];
}

function toArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function textTokens(value) {
  return normalizeText(value)
    .split(/[^a-z0-9]+/i)
    .filter(token => token.length > 2);
}

function hasTextMatch(needle, haystack) {
  const normalizedNeedle = normalizeText(needle);
  if (!normalizedNeedle) return false;

  return haystack.some(item => {
    const normalizedItem = normalizeText(item);
    if (!normalizedItem) return false;
    if (normalizedItem.includes(normalizedNeedle) || normalizedNeedle.includes(normalizedItem)) {
      return true;
    }

    const needleTokens = textTokens(normalizedNeedle);
    const itemTokens = textTokens(normalizedItem);
    if (needleTokens.length === 0 || itemTokens.length === 0) return false;

    const common = needleTokens.filter(token => itemTokens.includes(token)).length;
    return common / needleTokens.length >= 0.6;
  });
}

function scoreList(requiredItems, userItems) {
  const required = uniq(toArray(requiredItems).map(normalizeText));
  if (required.length === 0) return { score: 100, matched: [], missing: [] };

  const matched = required.filter(item => hasTextMatch(item, userItems));
  const missing = required.filter(item => !matched.includes(item));

  return {
    score: Math.round((matched.length / required.length) * 100),
    matched,
    missing,
  };
}

function languageLevelToNumber(level) {
  if (typeof level === 'number') return Math.max(0, Math.min(5, level));
  const normalized = normalizeText(level);
  return LEVEL_TO_NUMBER[normalized] ?? (Number.parseInt(normalized, 10) || 0);
}

function collectUserProfile(user = {}) {
  const sections = user.sections ?? {};
  const preferences = user.preferences ?? user.matchPreferences ?? {};

  const technicalSkills = Object.values(sections.technicalSkills?.groups ?? {}).flat();
  const personalSkills = sections.personalSkills?.items ?? [];
  const languages = (sections.languages?.items ?? []).map(language => ({
    name: language.name,
    level: languageLevelToNumber(language.level),
  }));

  const educationText = (sections.education?.items ?? []).flatMap(item => [
    item.degree,
    item.field,
    item.institution,
    ...(item.bullets ?? []).map(bullet => bullet.text),
  ]);

  const experienceText = (sections.experience?.items ?? []).flatMap(item => [
    item.role,
    item.company,
    item.location,
    ...(item.bullets ?? []).map(bullet => bullet.text),
  ]);

  const projectText = (sections.projects?.items ?? []).flatMap(item => [
    item.name,
    item.description,
    item.technologies,
    ...(item.bullets ?? []).map(bullet => bullet.text),
  ]);

  const freeText = [
    user.personal?.headline,
    user.personal?.location,
    sections.summary?.text,
    ...educationText,
    ...experienceText,
    ...projectText,
    ...(sections.certifications?.items ?? []).flatMap(item => [item.name, item.issuer, item.level]),
  ];

  return {
    skills: uniq([...technicalSkills, ...personalSkills, ...projectText.flatMap(textTokens)]),
    technicalSkills: uniq([...technicalSkills, ...projectText.flatMap(textTokens)]),
    personalSkills: uniq(personalSkills),
    languages,
    educationText: uniq(educationText),
    freeText: uniq(freeText),
    preferences: {
      sectors: toArray(preferences.sectors ?? preferences.sector),
      locations: toArray(preferences.locations ?? preferences.location),
      modalities: toArray(preferences.modalities ?? preferences.modality),
      types: toArray(preferences.types ?? preferences.type),
      durations: toArray(preferences.durations ?? preferences.duration),
      companies: toArray(preferences.companies ?? preferences.company),
      workdays: toArray(preferences.workdays ?? preferences.workday ?? preferences.jornada),
      schedules: toArray(preferences.schedules ?? preferences.schedule ?? preferences.horario),
      startDate: preferences.startDate ?? preferences.fechaInicio ?? '',
      languages: toArray(preferences.languages ?? preferences.idiomas),
      technologies: toArray(preferences.technologies ?? preferences.tecnologias),
      keywords: toArray(preferences.keywords ?? preferences.interests ?? preferences.areas),
    },
  };
}

function scoreLanguages(requiredLanguages, userLanguages) {
  const required = toArray(requiredLanguages);
  if (required.length === 0) return { score: 100, matched: [], missing: [] };

  let total = 0;
  const matched = [];
  const missing = [];

  required.forEach(requiredLanguage => {
    const userLanguage = userLanguages.find(language =>
      normalizeText(language.name) === normalizeText(requiredLanguage.name)
    );
    const requiredLevel = languageLevelToNumber(requiredLanguage.level);
    const userLevel = languageLevelToNumber(userLanguage?.level);

    if (!userLanguage) {
      missing.push(requiredLanguage.name);
      return;
    }

    const itemScore = requiredLevel === 0 ? 100 : Math.min(100, (userLevel / requiredLevel) * 100);
    total += itemScore;
    if (itemScore >= 100) matched.push(requiredLanguage.name);
    else missing.push(`${requiredLanguage.name} nivel ${requiredLevel}/5`);
  });

  return {
    score: Math.round(total / required.length),
    matched,
    missing,
  };
}

function scorePreferredLanguages(requiredLanguages, preferredLanguages) {
  const required = toArray(requiredLanguages);
  const preferred = toArray(preferredLanguages)
    .map(language => (
      typeof language === 'string'
        ? { name: language, level: '' }
        : { name: language.name, level: language.level }
    ))
    .filter(language => language.name);

  if (required.length === 0 || preferred.length === 0) {
    return { score: 100, matched: [], missing: [] };
  }

  let total = 0;
  const matched = [];
  const missing = [];

  required.forEach(requiredLanguage => {
    const preference = preferred.find(language =>
      normalizeText(language.name) === normalizeText(requiredLanguage.name)
    );

    if (!preference) {
      missing.push(requiredLanguage.name);
      return;
    }

    const requiredLevel = languageLevelToNumber(requiredLanguage.level);
    const preferredLevel = languageLevelToNumber(preference.level);
    const itemScore = requiredLevel === 0 || preferredLevel === 0
      ? 100
      : Math.min(100, (preferredLevel / requiredLevel) * 100);

    total += itemScore;
    if (itemScore >= 100) matched.push(`${preference.name}${preference.level ? ` ${preference.level}` : ''}`);
    else missing.push(`${requiredLanguage.name} nivel ${requiredLevel}/5`);
  });

  return {
    score: Math.round(total / required.length),
    matched,
    missing,
  };
}

function averageWeighted(parts) {
  const activeParts = parts.filter(part => part.weight > 0);
  const totalWeight = activeParts.reduce((sum, part) => sum + part.weight, 0);
  if (totalWeight === 0) return 100;

  return activeParts.reduce((sum, part) => sum + part.score * (part.weight / totalWeight), 0);
}

function scoreRequirements(userProfile, offer) {
  const requirements = offer.requirements ?? {};
  const hardSkills = scoreList(requirements.hardSkills, userProfile.technicalSkills);
  const softSkills = scoreList(requirements.softSkills, userProfile.personalSkills);
  const languages = scoreLanguages(requirements.languages, userProfile.languages);
  const education = scoreList(offer.targetDegrees ?? requirements.education, [
    ...userProfile.educationText,
    ...userProfile.freeText,
  ]);
  const keywords = scoreList(requirements.keywords, [
    ...userProfile.skills,
    ...userProfile.freeText,
  ]);

  const score = averageWeighted([
    { score: hardSkills.score, weight: 0.3 },
    { score: softSkills.score, weight: 0.2 },
    { score: languages.score, weight: 0.2 },
    { score: education.score, weight: 0.15 },
    { score: keywords.score, weight: 0.15 },
  ]);

  return {
    score,
    details: { hardSkills, softSkills, languages, education, keywords },
  };
}

function scorePreferences(userProfile, offer) {
  const prefs = userProfile.preferences;

  if (Object.values(prefs).flat().length === 0) {
    return {
      score: 50,
      details: {},
      hasPreferences: false,
    };
  }

  const preferenceCheck = (label, offerValues, preferredValues, weight = 1) => {
    const preferred = toArray(preferredValues);
    const offered = toArray(offerValues).filter(Boolean);
    return {
      label,
      score: scoreList(offered, preferred),
      weight: preferred.length && offered.length ? weight : 0,
    };
  };

  const activeChecks = [
    preferenceCheck('sector', offer.sector, prefs.sectors),
    preferenceCheck('ubicacion', offer.location, prefs.locations),
    preferenceCheck('modalidad', offer.modality, prefs.modalities),
    preferenceCheck('tipo', offer.type, prefs.types),
    preferenceCheck('duracion', offer.duration, prefs.durations),
    preferenceCheck('empresa', offer.company, prefs.companies),
    preferenceCheck('jornada', offer.workday ?? offer.jornada, prefs.workdays),
    preferenceCheck('horario', offer.schedule ?? offer.horario, prefs.schedules),
    preferenceCheck('fechaInicio', offer.startDate ?? offer.fechaInicio, prefs.startDate ? [prefs.startDate] : []),
    {
      label: 'idiomas',
      score: scorePreferredLanguages(offer.requirements?.languages, prefs.languages),
      weight: prefs.languages.length && offer.requirements?.languages?.length ? 1 : 0,
    },
    preferenceCheck('tecnologias', offer.requirements?.hardSkills, prefs.technologies, 1.5),
    preferenceCheck('intereses', offer.requirements?.keywords, prefs.keywords, 1.5),
  ];

  return {
    score: averageWeighted(activeChecks.map(check => ({ score: check.score.score, weight: check.weight }))),
    details: Object.fromEntries(activeChecks.map(check => [check.label, check.score])),
    hasPreferences: true,
  };
}

function buildExplanation(percentage, requirementsScore, preferencesScore, requirementsDetails, hasPreferences) {
  const matchedSkills = [
    ...requirementsDetails.hardSkills.matched,
    ...requirementsDetails.softSkills.matched,
  ].slice(0, 3);
  const missingSkills = [
    ...requirementsDetails.hardSkills.missing,
    ...requirementsDetails.languages.missing,
  ].slice(0, 3);

  const strengths = matchedSkills.length
    ? `Encaja especialmente en ${matchedSkills.join(', ')}`
    : 'Faltan datos del perfil para detectar fortalezas claras';
  const gaps = missingSkills.length
    ? `areas a reforzar: ${missingSkills.join(', ')}`
    : 'sin brechas relevantes en los requisitos principales';
  const preferencesText = hasPreferences
    ? `preferencias ${Math.round(preferencesScore)}%`
    : 'preferencias sin configurar';

  return `${percentage}% match: requisitos ${Math.round(requirementsScore)}%, ${preferencesText}. ${strengths}; ${gaps}.`;
}

export function calculateMatchScore(user, offer, options = {}) {
  const weights = { ...DEFAULT_WEIGHTS, ...(options.weights ?? {}) };
  const totalWeight = weights.requirements + weights.preferences;
  const requirementWeight = totalWeight > 0 ? weights.requirements / totalWeight : DEFAULT_WEIGHTS.requirements;
  const preferenceWeight = totalWeight > 0 ? weights.preferences / totalWeight : DEFAULT_WEIGHTS.preferences;
  const userProfile = collectUserProfile(user);
  const requirements = scoreRequirements(userProfile, offer);
  const preferences = scorePreferences(userProfile, offer);
  const rawScore = requirements.score * requirementWeight + preferences.score * preferenceWeight;
  const percentage = Math.max(0, Math.min(100, Math.round(rawScore)));

  return {
    percentage,
    explanation: buildExplanation(
      percentage,
      requirements.score,
      preferences.score,
      requirements.details,
      preferences.hasPreferences
    ),
    breakdown: {
      requirements: Math.round(requirements.score),
      preferences: Math.round(preferences.score),
      weights: {
        requirements: requirementWeight,
        preferences: preferenceWeight,
      },
      details: {
        requirements: requirements.details,
        preferences: preferences.details,
      },
    },
  };
}
