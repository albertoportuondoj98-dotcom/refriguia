# RefriGuía

App para técnico de aire acondicionado (ventana y minisplit hasta 3 TR; R22, R410A, R32 y R290).
Funciona sin internet una vez instalada en el teléfono.

## Qué trae (versión 2.0)
- **Herramientas:** tabla P-T, sobrecalentamiento/subenfriamiento con SH objetivo (capilar),
  diagnóstico por presiones con temperaturas reales, ΔT de aire, carga por metro extra,
  capacitores, terminales C-S-R / U-V-W, sensores NTC, cable y breaker (MCA/MOP),
  vacío con cronómetro, nivel con el sensor del teléfono, BTU, conversiones, tablas y listas.
- **Fallas:** 12 síntomas con causas, qué revisar y herramientas relacionadas.
- **Aprender:** 17 lecciones, examen de 58 preguntas (opciones revueltas), repaso de errores,
  pregunta del día y glosario inglés-español.
- **Bitácora:** servicios con fotos, cobro por conceptos, lista de precios, nota y recordatorio
  por WhatsApp, historial por cliente, resumen del mes, borrador automático y respaldo con fotos.
- **Ajustes:** tamaño de letra, tema, unidades, datos del técnico para las notas.

## Archivos
- `index.html`, `styles.css`
- `app.js` (núcleo: navegación, unidades, P-T, ajustes, búsqueda), `herramientas.js`,
  `aprender.js`, `bitacora.js`
- `data.js` (contenido técnico), `pt.js` (tablas P-T generadas con `gen_pt.py` y CoolProp)
- `sw.js` (funcionamiento sin internet), `manifest.webmanifest`, íconos

## Instalar en Android
1. Publicar esta carpeta en un hosting con HTTPS (por ejemplo GitHub Pages o Netlify).
2. En el teléfono abrir la dirección en Chrome (con internet, sólo esta vez).
3. Menú ⋮ → "Instalar app" o "Agregar a la pantalla principal".
4. Desde ahí funciona sin internet. Manteniendo presionado el ícono salen accesos directos
   (Tabla P-T, Sobrecalentamiento, Nuevo servicio).

## Actualizar
Después de cambiar cualquier archivo, subir la versión en `sw.js` (`refriguia-v2` → `refriguia-v3`)
y volver a publicar. Cuando el teléfono abra la app con internet, sale el aviso
"Hay una versión nueva" con el botón Actualizar.

## Datos
Todo se guarda sólo en el teléfono (localStorage y, las fotos, IndexedDB).
Usar "Guardar respaldo" (Ajustes o Bitácora) de vez en cuando; la app lo recuerda cada mes.
