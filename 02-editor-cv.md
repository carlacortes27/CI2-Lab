# WS2 — Editor de CV (frontend core)

> Spec de workstream. Lee primero `CLAUDE.md` y `docs/data-model.md`.
> No redefinas contratos: `data-model.md` es la única fuente de verdad.

## 1. Objetivo

Construir el núcleo de la aplicación: el editor de dos paneles con previsualización en
tiempo real, la gestión del objeto `CV`, el drag & drop y el autoguardado. WS2 es la
columna vertebral del frontend; el resto de workstreams se integran sobre su estado.

## 2. Alcance

**Incluido**
- Layout del editor: dos paneles (formulario a la izquierda, preview a la derecha).
- Estado global del `CV` mediante Context API + `useReducer`.
- Componentes de edición para cada sección: datos personales, resumen, experiencia,
  educación, habilidades, idiomas, certificaciones, proyectos, intereses.
- Añadir, editar y eliminar items y bullets en cada sección.
- Drag & drop (API HTML5 nativa) para reordenar secciones (`layout.order`) y para
  reordenar bullets dentro de una sección.
- Escala visual de 5 puntos para el nivel de idiomas (control de edición).
- Persistencia en `localStorage` según el esquema de `data-model.md`: autoguardado cada
  30 s y ante cambios relevantes.
- Migración de `meta.schemaVersion` al cargar datos almacenados.
- CV de ejemplo precargado (perfil ICAI ficticio) cuando no hay datos guardados.
- Panel de preview como **slot**: renderiza el componente de plantilla que provee WS4.

**Excluido** (pertenece a otros workstreams)
- Las plantillas visuales y los selectores de estilo → WS4.
- Importación de PDF → WS3. Generación de PDF → WS5.
- Matching → WS6. Corrección y traducción → WS7.

## 3. Dependencias

- `docs/data-model.md`: contrato `CV` y esquema de `localStorage`.
- WS4 provee el renderizador del panel de preview. Durante el desarrollo de WS2, usar un
  componente de preview mínimo de marcador de posición; WS4 lo sustituye.

## 4. Contratos

- **Produce y consume:** objeto `CV`.
- **Consume:** esquema de claves de `localStorage`.

## 5. Ubicación de archivos

- `client/src/App.jsx`, `client/src/main.jsx`
- `client/src/pages/` (página del editor)
- `client/src/features/editor/`, `client/src/context/`
- `client/src/components/` (campos reutilizables: TextField, etc.)
- `client/src/lib/storage.js`
- `client/src/data/example-cv.js`

## 6. Tareas y entregables

1. Inicializar `client/` con Vite + React + Tailwind.
2. Definir el contexto del `CV` con `useReducer`: acciones para editar campos, añadir y
   eliminar items y bullets, reordenar secciones y bullets, cambiar `style`.
3. Construir el layout de dos paneles, responsive.
4. Implementar los editores de las 9 secciones del contrato `CV`.
5. Implementar drag & drop nativo para secciones y bullets.
6. Implementar `storage.js`: guardar, cargar, autoguardado (debounce + intervalo 30 s),
   migración de `schemaVersion`.
7. Crear el CV de ejemplo con datos ficticios de perfil ICAI.
8. Definir el slot del panel de preview para que WS4 lo rellene.

## 7. Decisiones técnicas

- Estado con Context API + `useReducer`; sin librerías de estado externas.
- IDs generados con `crypto.randomUUID()`.
- Drag & drop con atributos `draggable` y eventos `onDragStart/Over/Drop` nativos.
- Autoguardado: debounce sobre cambios + temporizador de 30 s como red de seguridad.

## 8. Limitaciones

- Sin autenticación ni base de datos: la persistencia es local al navegador.

## 9. Criterios de aceptación

- Editar cualquier campo se refleja inmediatamente en el preview.
- Añadir y eliminar items y bullets funciona en las 9 secciones.
- Reordenar secciones y bullets por drag & drop persiste en `layout.order` y en los arrays.
- `localStorage` guarda y restaura el `CV`; el autoguardado opera a 30 s.
- El CV de ejemplo se carga al inicio si no hay datos guardados.
- Cargar datos con un `schemaVersion` anterior aplica la migración sin pérdida de datos.
