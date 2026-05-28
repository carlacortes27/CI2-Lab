export function createBlankCv() {
  const now = new Date().toISOString();

  return {
    meta: {
      schemaVersion: 1,
      id: `cv_${crypto.randomUUID()}`,
      createdAt: now,
      updatedAt: now,
      language: 'es',
    },
    style: {
      template: 'clasica',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 'medium',
      accentColor: '#f5b21b',
      blockStyles: {},
    },
    personal: {
      fullName: '',
      headline: '',
      email: '',
      phoneCountry: '',
      phoneNumber: '',
      phone: '',
      location: '',
      photoUrl: '',
      links: [{ id: 'linkedin', label: 'LinkedIn', url: '' }],
    },
    sections: {
      summary: { visible: true, text: '' },
      education: { visible: true, items: [] },
      experience: { visible: true, items: [] },
      projects: { visible: true, items: [] },
      technicalSkills: {
        visible: true,
        groups: {
          lenguajes: [],
          software: [],
          herramientas: [],
          tecnologias: [],
        },
      },
      personalSkills: { visible: true, items: [] },
      languages: { visible: true, items: [] },
      certifications: { visible: true, items: [] },
      volunteering: { visible: true, items: [] },
    },
    layout: {
      order: [
        'summary',
        'education',
        'experience',
        'projects',
        'technicalSkills',
        'personalSkills',
        'languages',
        'certifications',
        'volunteering',
      ],
    },
  };
}
