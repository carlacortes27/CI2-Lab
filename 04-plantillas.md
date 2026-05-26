# WS4 — Plantillas y maquetación

> Spec de workstream. Lee primero `CLAUDE.md` y `docs/data-model.md`.
> No redefinas contratos: `data-model.md` es la única fuente de verdad.

## 1. Objetivo

Renderizar el objeto `CV` en plantillas visuales y ofrecer los controles de estilo. El
renderizador de WS4 ocupa el panel de preview de WS2 y es la base que WS5 usa para generar
el PDF.

## 2. Alcance

**Incluido**
- Componente renderizador de CV: recibe un `CV` por props y produce el CV visual.
- Dos plantillas: `minimalista` (una columna) y `clasico` (dos columnas con barra
  lateral). Corresponden a los valores de `style.template` en `data-model.md`.
- Selectores de estilo (UI): plantilla, fuente, tamaño y color de acento. Escriben en
  `cv.style` a través de las acciones del contexto de WS2.
- Respeto de `layout.order` para el orden de secciones y de `visible` para mostrarlas u
  ocultarlas.
- Render del nivel de idiomas como escala visual de 5 puntos.
- Diseño responsive del preview.
- Registro de plantillas preparado para incorporar nuevas.

**Excluido** (pertenece a otros workstreams)
- El estado del `CV` y las acciones del contexto → WS2.
- La conversión a PDF → WS5 (WS5 reutiliza el renderizador de WS4).

## 3. Dependencias

- `docs/data-model.md`: contrato `CV` (campos `style`, `sections`, `layout`).
- WS2: el contexto del `CV` y sus acciones de edición ya existen.

## 4. Contratos

- **Consume:** `CV`.
- No produce ninguna entidad nueva.

## 5. Ubicación de archivos

- `client/src/templates/` (las plantillas y el registro)
- `client/src/features/editor/` (integración del renderizador en el panel de preview)
- `client/src/components/` (controles de estilo reutilizables)

## 6. Tareas y entregables

1. Definir un componente `CvRenderer` que recibe `cv` por props y delega en la plantilla
   indicada por `cv.style.template`.
2. Implementar la plantilla `minimalista` (una columna).
3. Implementar la plantilla `clasico` (dos columnas con barra lateral).
4. Implementar los selectores de estilo: plantilla, fuente, tamaño (`small/medium/large`)
   y color de acento, conectados a `cv.style`.
5. Render del nivel de idiomas como escala de 5 puntos.
6. Asegurar que el renderizador respeta `layout.order` y `visible`.
7. Sustituir el slot de preview de WS2 por el `CvRenderer`.
8. Crear un registro de plantillas que facilite añadir nuevas.

## 7. Decisiones técnicas

- Las plantillas son componentes React **puros**: reciben el `CV` por props, sin estado
  propio ni efectos. Esto las hace deterministas.
- El render debe ser apto tanto para pantalla como para Puppeteer (WS5). Evitar
  dependencias del entorno de navegador que impidan el render server-side.
- Los estilos de plantilla deben poder inlinearse o extraerse para el PDF de WS5.

## 8. Limitaciones

- En el alcance entran dos plantillas. Añadir más es trabajo posterior, no de este spec.

## 9. Criterios de aceptación

- Ambas plantillas renderizan correctamente un `CV` completo.
- Cambiar plantilla, fuente, tamaño o color de acento se refleja al instante en el preview.
- Las secciones con `visible: false` no se muestran; el orden respeta `layout.order`.
- El nivel de idiomas se muestra con la escala de 5 puntos.
- El preview es responsive en escritorio, tablet y móvil.
- El renderizador es determinista: el mismo `CV` produce siempre el mismo resultado.
