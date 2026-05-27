# Zona: Importación y exportación de PDF (Persona 3)

## Archivos de este módulo
- `UploadCVPage.jsx` — página de subida y análisis de PDF

## Archivos compartidos que puedes usar (solo lectura)
- `src/context/CvContext.jsx` — dispatch `SET_CV` cuando el PDF se analiza
- `src/services/cvService.js` — `analyzeUploadedCV`, `improveUploadedCV`, `exportToPDF`, `generateCVPdf`
- `src/features/editor/forms/CVPreview.jsx` — preview del CV (importa desde ahí, no lo copies)
- `src/features/editor/forms/TemplateSelector.jsx` — selector de plantilla
- `src/components/` — widgets genéricos

## Endpoints de servidor (WS3)
Cuando el backend esté listo, los endpoints serán:
- `POST /api/cv/analyze` — recibe PDF, devuelve `ImportResult`
- `POST /api/cv/improve` — recibe PDF, devuelve CV mejorado

## Para añadir una ruta nueva
Edita **`src/routes.config.js`** añadiendo tu línea en la sección P3.
No toques `App.jsx` ni `Navbar.jsx`.

## PROHIBIDO tocar
- `src/features/home/` — zona de Persona 1
- `src/features/editor/` — zona de Persona 2 (puedes importar desde ahí, no editar)
- `src/features/ope/` — zona de Persona 4
- `server/src/data/` y `server/src/routes/offers.js` — zona de Persona 5
- `src/routes.config.js` — solo añade tu línea, no modifiques las líneas de otros
- `src/App.jsx` y `src/components/Navbar.jsx` — archivos congelados

## Contratos relevantes
Lee `docs/data-model.md`, especialmente `ImportResult`.
El stack de PDF usa: Multer (subida) + `pdf-parse` (extracción) en el servidor.
