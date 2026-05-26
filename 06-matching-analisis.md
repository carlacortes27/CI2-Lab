# WS6 — Matching y análisis CV↔oferta

> Spec de workstream. Lee primero `CLAUDE.md` y `docs/data-model.md`.
> No redefinas contratos: `data-model.md` es la única fuente de verdad.

## 1. Objetivo

Comparar el `CV` del usuario con ofertas y simular su compatibilidad con sistemas ATS.
Toda la lógica se ejecuta en cliente, sin endpoint ni coste de API.

## 2. Alcance

**Incluido**
- Extracción de keywords de una `Offer`: análisis de `requirements` y `description`.
- Comparación `CV` ↔ `Offer` → `MatchResult` (score, skills coincidentes y ausentes,
  puntos fuertes y débiles, cobertura de keywords).
- Match contra texto de oferta **pegado por el usuario** (no solo ofertas del dataset):
  el usuario pega texto libre → extracción de keywords → comparación.
- Simulador ATS: análisis rule-based del `CV` → `AtsResult` (score 0–100, incidencias).
- UI: vista de resultados de match y vista de resultados ATS.

**Excluido** (pertenece a otros workstreams)
- El dataset de ofertas y su API → WS1. WS6 consume las ofertas que WS1 expone.
- El editor del `CV` → WS2.

## 3. Dependencias

- `docs/data-model.md`: contratos `CV`, `Offer`, `MatchResult`, `AtsResult`.
- WS1: ofertas del portal para comparar.

## 4. Contratos

- **Produce:** `MatchResult`, `AtsResult`.
- **Consume:** `CV`, `Offer`.

## 5. Ubicación de archivos

- `client/src/features/matching/`
- `client/src/lib/` (utilidades de normalización y extracción de keywords)

## 6. Tareas y entregables

1. Utilidad de normalización de texto: minúsculas, sin acentos, sin signos de puntuación,
   tokenización.
2. Extracción de keywords de una `Offer` a partir de `requirements` y `description`.
3. Función de comparación `CV` ↔ `Offer` que produce un `MatchResult`.
4. Soporte para comparar contra texto de oferta pegado libremente por el usuario.
5. Simulador ATS rule-based que produce un `AtsResult`.
6. UI de resultados de match y de resultados ATS.

## 7. Decisiones técnicas

**Fórmula de score de match** (transparente y documentada en el código; ajustable):

```
skillMatch      = nº skills de la oferta presentes en el CV / nº skills de la oferta
keywordCoverage = nº keywords de la oferta presentes en el CV / nº keywords de la oferta
languageMatch   = nº idiomas de la oferta cubiertos (nivel CV >= nivel oferta) / nº idiomas
score = redondear( 100 * (0.5 * skillMatch + 0.3 * keywordCoverage + 0.2 * languageMatch) )
```

**Reglas del simulador ATS** (ejemplos; `severity` `info` / `warning` / `error`):
- Secciones estándar presentes (experiencia, educación, contacto).
- Foto presente → `warning` (algunos parsers ATS no procesan imágenes).
- Bullets vacíos → `error`. Fechas incoherentes → `warning`.
- Datos de contacto presentes y completos.

## 8. Limitaciones

- `compromise` está orientado al inglés; con CVs y ofertas en español su NLP es limitado.
  La estrategia se apoya en la normalización de texto y en el matching contra listas de
  skills y keywords curadas, más que en el NLP de la librería. La precisión del match es
  heurística, no semántica. Documentarlo en el código y en la UI cuando proceda.

## 9. Criterios de aceptación

- Comparar un `CV` con una oferta del dataset produce un `MatchResult` válido.
- Pegar texto libre de oferta produce también un `MatchResult` válido.
- El simulador ATS produce un `AtsResult` con incidencias coherentes.
- `score` está en el rango 0–100; `keywordCoverage` en el rango 0–1.
- La fórmula de score está implementada de forma transparente y documentada.
