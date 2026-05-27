# Zona: Editor de CV (Persona 2)

## Archivos de este módulo
- `CreateCVPage.jsx` — página principal del editor
- `CVPreviewPage.jsx` — página de vista previa
- `EditorPage.jsx` — editor de dos paneles (WS2)
- `EditorForm.jsx` — formulario con drag & drop (WS2)
- `CvPreview.jsx` — preview en tiempo real (WS2)
- `forms/CVForm.jsx` — formulario por secciones
- `forms/CVPreview.jsx` — preview alternativa
- `forms/TemplateSelector.jsx` — selector de plantilla y fuente
- `forms/PersonalInfoForm.jsx`, `AboutMeForm.jsx`, `EducationForm.jsx`,
  `ExperienceForm.jsx`, `LanguagesForm.jsx`, `CertificationsForm.jsx`,
  `SkillsForm.jsx`, `ProjectsForm.jsx`, `VolunteerForm.jsx`, `FormControls.jsx`

## Archivos compartidos que puedes usar (solo lectura)
- `src/context/CvContext.jsx` — estado del CV (dispatch actions definidas ahí)
- `src/lib/storage.js` — persistencia en localStorage
- `src/services/cvService.js` — exportar PDF, enviar a la nube, corrección
- `src/components/` — widgets genéricos (TextField, DateField…)
- `src/sections/` — secciones del formulario WS2 (PersonalSection, etc.)
- `src/data/example-cv.js` — CV de ejemplo

## Para añadir una ruta nueva
Edita **`src/routes.config.js`** añadiendo tu línea en la sección P2.
No toques `App.jsx` ni `Navbar.jsx`.

## Cambios al modelo de datos CV
Cualquier modificación a la estructura `CV` requiere:
1. Actualizar `docs/data-model.md` primero
2. Incrementar `meta.schemaVersion`
3. Actualizar `src/context/CvContext.jsx` después

## PROHIBIDO tocar
- `src/features/home/` — zona de Persona 1
- `src/features/pdf/` — zona de Persona 3
- `src/features/ope/` — zona de Persona 4
- `server/` — zona de Persona 5
- `src/routes.config.js` — solo añade tu línea, no modifiques las líneas de otros
- `src/App.jsx` y `src/components/Navbar.jsx` — archivos congelados

## Contratos relevantes
Lee `docs/data-model.md`. El objeto `CV` es la fuente de verdad.
Acciones disponibles en CvContext: LOAD_CV, SET_CV, UPDATE_PERSONAL, UPDATE_SUMMARY,
TOGGLE_SECTION_VISIBILITY, ADD_ITEM, UPDATE_ITEM, DELETE_ITEM, ADD_BULLET,
UPDATE_BULLET, DELETE_BULLET, REORDER_BULLETS, REORDER_SECTIONS, UPDATE_STYLE,
SET_INTERESTS, UPDATE_SECTION.
