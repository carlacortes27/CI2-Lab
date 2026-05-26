export const exampleCv = {
  meta: {
    schemaVersion: 1,
    id: 'cv_ejemplo_icai',
    createdAt: '2026-05-26T10:00:00Z',
    updatedAt: '2026-05-26T10:00:00Z',
    language: 'es',
  },
  style: {
    template: 'minimalista',
    fontFamily: 'Inter',
    fontSize: 'medium',
    accentColor: '#1d4ed8',
  },
  personal: {
    fullName: 'Ana García López',
    headline: 'Estudiante de Ingeniería Industrial — ICAI',
    email: 'ana.garcia@alu.comillas.edu',
    phone: '+34 600 123 456',
    location: 'Madrid, España',
    photoUrl: null,
    links: [
      { id: 'lnk_1', label: 'LinkedIn', url: 'https://linkedin.com/in/anagarcia' },
      { id: 'lnk_2', label: 'GitHub', url: 'https://github.com/anagarcia' },
    ],
  },
  sections: {
    summary: {
      visible: true,
      text: 'Estudiante de Máster en Ingeniería Industrial en ICAI con especialización en energía y medio ambiente. Experiencia en análisis de datos y modelización de sistemas energéticos. Orientada a proyectos de sostenibilidad y transición energética.',
    },
    experience: {
      visible: true,
      items: [
        {
          id: 'exp_1',
          role: 'Analista en prácticas',
          company: 'Iberdrola',
          location: 'Madrid',
          startDate: '2025-09',
          endDate: null,
          current: true,
          bullets: [
            { id: 'b_exp1_1', text: 'Análisis de datos de generación renovable con Python y Power BI.' },
            { id: 'b_exp1_2', text: 'Elaboración de informes de seguimiento de parques eólicos.' },
            { id: 'b_exp1_3', text: 'Modelización de escenarios de producción energética en Excel.' },
          ],
        },
        {
          id: 'exp_2',
          role: 'Monitora de prácticas de laboratorio',
          company: 'ICAI — Universidad Pontificia Comillas',
          location: 'Madrid',
          startDate: '2024-09',
          endDate: '2025-06',
          current: false,
          bullets: [
            { id: 'b_exp2_1', text: 'Apoyo a estudiantes de primero en prácticas de termodinámica.' },
          ],
        },
      ],
    },
    education: {
      visible: true,
      items: [
        {
          id: 'edu_1',
          institution: 'Universidad Pontificia Comillas (ICAI)',
          degree: 'Máster en Ingeniería Industrial',
          field: 'Energía y Medio Ambiente',
          location: 'Madrid',
          startDate: '2024-09',
          endDate: '2026-06',
          current: true,
          bullets: [],
        },
        {
          id: 'edu_2',
          institution: 'Universidad Pontificia Comillas (ICAI)',
          degree: 'Grado en Ingeniería en Tecnologías Industriales',
          field: 'Ingeniería Industrial',
          location: 'Madrid',
          startDate: '2020-09',
          endDate: '2024-06',
          current: false,
          bullets: [
            { id: 'b_edu2_1', text: 'Nota media: 7,8 / 10.' },
          ],
        },
      ],
    },
    skills: {
      visible: true,
      items: [
        { id: 'sk_1', name: 'Python', category: 'Programación' },
        { id: 'sk_2', name: 'MATLAB', category: 'Programación' },
        { id: 'sk_3', name: 'Excel avanzado', category: 'Ofimática' },
        { id: 'sk_4', name: 'Power BI', category: 'Análisis de datos' },
        { id: 'sk_5', name: 'AutoCAD', category: 'Ingeniería' },
        { id: 'sk_6', name: 'Modelización financiera', category: null },
      ],
    },
    languages: {
      visible: true,
      items: [
        { id: 'lng_1', name: 'Español', level: 5 },
        { id: 'lng_2', name: 'Inglés', level: 4 },
        { id: 'lng_3', name: 'Francés', level: 2 },
      ],
    },
    projects: {
      visible: true,
      items: [
        {
          id: 'prj_1',
          name: 'Simulación de ciclo termodinámico',
          description: 'Modelo de turbina de gas en Python para el cálculo de eficiencia de ciclos Brayton.',
          link: null,
          startDate: '2024-01',
          endDate: '2024-05',
          bullets: [
            { id: 'b_prj1_1', text: 'Implementación del ciclo Brayton real con irreversibilidades.' },
            { id: 'b_prj1_2', text: 'Validación contra datos experimentales del laboratorio.' },
          ],
        },
      ],
    },
    certifications: {
      visible: true,
      items: [
        { id: 'crt_1', name: 'Excel avanzado', issuer: 'Comillas', date: '2024-03', url: null },
        { id: 'crt_2', name: 'Cambridge B2 First', issuer: 'Cambridge Assessment', date: '2022-06', url: null },
      ],
    },
    interests: {
      visible: true,
      items: ['Fotografía', 'Trail running', 'Senderismo'],
    },
  },
  layout: {
    order: ['summary', 'experience', 'education', 'skills', 'languages', 'projects', 'certifications', 'interests'],
  },
};
