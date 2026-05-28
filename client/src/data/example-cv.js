export const exampleCv = {
  meta: {
    schemaVersion: 1,
    id: 'cv_marta_saldana',
    createdAt: '2026-05-26T10:00:00Z',
    updatedAt: '2026-05-26T10:00:00Z',
    language: 'es',
  },
  style: {
    template: 'clasica',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 'medium',
    accentColor: '#f5b21b',
  },
  preferences: {
    locations: ['Madrid'],
    modalities: ['hibrido'],
    workdays: ['completa'],
    sectors: ['Energia', 'Tecnologia'],
    durations: ['6 meses'],
    startDate: '',
    schedules: ['manana'],
    languages: [{ name: 'Inglés', level: 'C1' }],
    technologies: ['Python', 'SQL', 'Power BI'],
    keywords: ['datos', 'renovables', 'eficiencia energetica'],
  },
  personal: {
    fullName: 'Marta Saldana Buil',
    headline: 'Estudiante de Ingenieria en Tecnologias Industriales',
    email: 'marta.saldana@alu.comillas.edu',
    phoneCountry: '+34',
    phoneNumber: '600 123 456',
    phone: '+34 600 123 456',
    location: 'Madrid, Espana',
    photoUrl: null,
    links: [
      { id: 'lnk_1', label: 'LinkedIn', url: 'linkedin.com/in/marta-saldana' },
      { id: 'lnk_2', label: 'Portfolio', url: 'portfolio.com/marta-saldana' },
    ],
  },
  sections: {
    summary: {
      visible: true,
      text: 'Estudiante de Ingenieria en Tecnologias Industriales en la Universidad Pontificia Comillas ICAI, con interes en analisis de datos, eficiencia energetica e innovacion tecnologica.',
    },
    education: {
      visible: true,
      items: [
        {
          id: 'edu_1',
          institution: 'Universidad Pontificia Comillas ICAI',
          degree: 'Grado en Ingenieria en Tecnologias Industriales',
          field: 'Intensificacion en energia y organizacion industrial',
          location: 'Madrid, Espana',
          startDate: '2022-09',
          endDate: '',
          current: true,
          duration: '2022 - Actualidad',
          bullets: [
            { id: 'b_edu_1', text: 'Asignaturas principales: analisis de datos, sistemas electricos y gestion de proyectos.' },
            { id: 'b_edu_2', text: 'Participacion en proyectos academicos orientados a sostenibilidad y eficiencia.' },
          ],
        },
      ],
    },
    experience: {
      visible: true,
      items: [
        {
          id: 'exp_1',
          role: 'Becaria en Operaciones y Mercado Electrico',
          company: 'Aura A&M',
          location: 'Madrid',
          startDate: '2025-06',
          endDate: '2025-07',
          current: false,
          duration: 'Jun 2025 - Jul 2025',
          bullets: [
            { id: 'b_exp_1', text: 'Seguimiento y analisis de activos renovables mediante revision de indicadores operativos.' },
            { id: 'b_exp_2', text: 'Preparacion de informes de mercado con Excel y herramientas de visualizacion.' },
          ],
        },
      ],
    },
    projects: {
      visible: true,
      items: [
        {
          id: 'prj_1',
          name: 'Analisis de consumo energetico en edificio universitario',
          description: 'Proyecto academico de recopilacion y analisis de datos de consumo.',
          technologies: 'Python, Excel, Power BI',
          link: '',
          startDate: '2024-01',
          endDate: '2024-05',
          bullets: [
            { id: 'b_prj_1', text: 'Limpieza de datos y creacion de visualizaciones para detectar patrones de consumo.' },
          ],
        },
      ],
    },
    technicalSkills: {
      visible: true,
      groups: {
        lenguajes: ['Python', 'SQL'],
        software: ['Office', 'MATLAB', 'Power BI'],
        herramientas: ['Git', 'Excel avanzado'],
        tecnologias: ['Docker', 'AWS'],
      },
    },
    personalSkills: {
      visible: true,
      items: ['Comunicacion efectiva', 'Trabajo en equipo', 'Pensamiento analitico', 'Proactividad'],
    },
    languages: {
      visible: true,
      items: [
        { id: 'lng_1', name: 'Espanol', level: 'Nativo', certificate: '', note: '' },
        { id: 'lng_2', name: 'Ingles', level: 'C1', certificate: 'Cambridge', note: 'Advanced' },
        { id: 'lng_3', name: 'Frances', level: 'A2', certificate: '', note: '' },
      ],
    },
    certifications: {
      visible: true,
      items: [
        { id: 'crt_1', name: 'Python basico', issuer: 'Comillas', level: 'Inicial', date: '2024-03' },
        { id: 'crt_2', name: 'Cambridge C1 Advanced', issuer: 'Cambridge', level: 'C1', date: '2023-06' },
      ],
    },
    volunteering: {
      visible: true,
      items: [
        {
          id: 'vol_1',
          organization: 'Voluntariado Comillas',
          date: '2024',
          description: 'Apoyo en actividades universitarias de orientacion a nuevos estudiantes.',
        },
      ],
    },
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
