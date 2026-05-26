# WS7 — Texto: corrección y traducción

> Spec de workstream. Lee primero `CLAUDE.md` y `docs/data-model.md`.
> No redefinas contratos: `data-model.md` es la única fuente de verdad.

## 1. Objetivo

Ofrecer corrección ortográfica y de redacción básica del `CV`, y traducción del contenido
a otros idiomas. Este es el workstream más afectado por la ausencia de LLM; su alcance se
define en consecuencia.

## 2. Alcance

**Incluido**
- Corrección ortográfica client-side por diccionario (español e inglés).
- Detección de problemas de redacción mediante reglas simples y deterministas.
- Traducción del contenido del `CV` a otro idioma vía LibreTranslate.
- UI: vista de revisión de texto (sugerencias) y selector de idioma de traducción.
- Al traducir, actualización de `cv.meta.language`.

**Excluido** (no es viable sin LLM — ver sección 8)
- Reescritura o mejora de frases, adaptación del tono al puesto, conversión "inteligente"
  de párrafos en bullets con calidad real. Estas funciones del diseño inicial quedan fuera.
- El editor del `CV` → WS2.

## 3. Dependencias

- `docs/data-model.md`: contrato `CV`.

## 4. Contratos

- **Consume y produce:** `CV` (el corrector señala; la traducción devuelve un `CV`
  traducido).

## 5. Ubicación de archivos

- `client/src/features/text/`
- `client/src/lib/` (utilidades de corrección y reglas de redacción)

## 6. Tareas y entregables

1. Integrar corrección ortográfica por diccionario (sugerencia: `nspell` con diccionarios
   Hunspell de español e inglés).
2. Implementar reglas de redacción deterministas: bullets vacíos, bullets excesivamente
   largos, dobles espacios, falta de mayúscula inicial, espacios antes de signos.
3. Integrar la traducción vía LibreTranslate: la URL de la instancia se configura en
   `.env`.
4. Implementar la traducción del `CV`: recorrer los campos de texto, traducirlos y
   producir un `CV` conforme al contrato, con `meta.language` actualizado.
5. UI: revisión de texto con sugerencias y selector de idioma de traducción.
6. Manejo de error si LibreTranslate no está disponible o no está configurado.

## 7. Decisiones técnicas

- La corrección es ortográfica (diccionario) y de reglas. No hay análisis semántico.
- La traducción requiere una instancia **self-hosted** de LibreTranslate: la instancia
  pública está limitada y puede requerir clave. La URL se toma de una variable de entorno.

## 8. Limitaciones

- **Sin LLM.** La corrección no reescribe ni reformula texto: solo señala errores de
  ortografía y de reglas. "Mejorar frases", "adaptar el tono" o reorganizar contenido con
  criterio editorial **no son viables** sin un LLM y quedan explícitamente fuera de
  alcance.
- La traducción de LibreTranslate es automática y genérica, no un estilo profesional
  adaptado al CV.
- Es una decisión consciente de proyecto que la calidad de este workstream sea inferior a
  la de una solución con LLM.

## 9. Criterios de aceptación

- La corrección detecta errores ortográficos evidentes y los señala al usuario.
- Las reglas de redacción detectan bullets vacíos o largos, dobles espacios y fallos de
  mayúscula.
- La traducción produce un `CV` conforme al contrato, con `meta.language` actualizado.
- Si LibreTranslate no está configurado o disponible, la funcionalidad falla con un
  mensaje claro, sin romper la aplicación.
