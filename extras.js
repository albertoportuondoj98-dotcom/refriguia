// RefriGuía — códigos de error, diagramas, piezas con dibujo, casos prácticos, refacciones, manómetro y lectura en voz alta.
'use strict';

// ---------- Códigos de error (fuentes: manuales y hojas técnicas de cada marca) ----------
const CODIGOS = [
  { marca: 'Midea', nota: 'Splits Midea y marcas fabricadas por Midea. Algunos modelos cambian la lista.', codigos: [
    ['E0', 'Error de memoria (EEPROM) de la tarjeta interior', 'Desconecta 3 min y reconecta. Si sigue, tarjeta interior.'],
    ['E1', 'Falla de comunicación entre unidad interior y exterior', 'Cable de interconexión, bornes flojos, tarjeta exterior sin corriente.'],
    ['E2', 'Error de señal de cruce por cero', 'Voltaje de alimentación y tarjeta interior.'],
    ['E3', 'Velocidad del ventilador interior fuera de control', 'Turbina trabada, motor o conector del motor, tarjeta.'],
    ['E4', 'Sensor de temperatura del cuarto abierto o en corto', 'Mide el sensor (Herramientas → Sensores) y su conector.'],
    ['E5', 'Sensor del evaporador abierto o en corto', 'Mide el sensor de tubería interior y su conector.'],
    ['P0', 'Protección del módulo IPM (inverter)', 'Voltaje, compresor (U-V-W), tarjeta exterior, disipador sucio.'],
    ['P1', 'Protección por voltaje alto o bajo', 'Mide el voltaje de la línea al arrancar.'],
    ['P2', 'Temperatura alta en la parte de arriba del compresor', 'Falta de gas, condensadora sucia, ventilador exterior.'],
  ] },
  { marca: 'Gree', nota: 'Splits Gree y marcas fabricadas por Gree.', codigos: [
    ['E1', 'Protección por alta presión', 'Condensadora sucia, ventilador exterior, exceso de gas.'],
    ['E2', 'Protección anticongelamiento', 'Filtros sucios, turbina, falta de gas.'],
    ['E3', 'Protección por baja presión / falta de gas', 'Busca fuga, mide presión y sobrecalentamiento.'],
    ['E4', 'Temperatura de descarga del compresor muy alta', 'Falta de gas, restricción, sensor de descarga.'],
    ['E5', 'Protección por sobrecorriente', 'Voltaje, capacitor, compresor, condensadora sucia.'],
    ['E6', 'Falla de comunicación entre unidad interior y exterior', 'Cable de interconexión y conexiones.'],
    ['F1', 'Sensor de ambiente interior dañado', 'Mide el sensor y su conector.'],
    ['F2', 'Sensor del evaporador dañado', 'Mide el sensor de tubería interior.'],
    ['F3', 'Sensor de ambiente exterior dañado', 'Mide el sensor exterior.'],
    ['F4', 'Sensor de tubería exterior dañado', 'Mide el sensor del condensador.'],
    ['F5', 'Sensor de descarga dañado', 'Mide el sensor de descarga (suele ser de 50 kΩ).'],
    ['H6', 'Motor del ventilador interior sin señal o trabado', 'Turbina trabada, motor, conector, tarjeta.'],
  ] },
  { marca: 'LG', nota: 'Splits LG. En el control o en la pantalla sale como CH y el número.', codigos: [
    ['CH01', 'Sensor de aire interior abierto o en corto', 'Mide el sensor.'],
    ['CH02', 'Sensor de tubería de entrada (interior) abierto o en corto', 'Mide el sensor.'],
    ['CH05', 'Falla de comunicación interior ↔ exterior', 'Cable de interconexión y conexiones.'],
    ['CH06', 'Sensor de tubería de salida abierto o en corto', 'Mide el sensor.'],
    ['CH09', 'Error de memoria (EEPROM) de la tarjeta interior', 'Tarjeta interior.'],
    ['CH10', 'Motor BLDC del ventilador interior trabado', 'Turbina, motor o tarjeta.'],
    ['CH21', 'Falla del IPM: sobrecorriente del compresor', 'Mide U-V-W (0.25 a 5 Ω y parejas), tarjeta exterior.'],
    ['CH23', 'Voltaje bajo en el bus de corriente directa', 'Voltaje de línea, tarjeta exterior.'],
    ['CH26', 'Falla de posición del compresor DC (no arranca)', 'Compresor, conexiones U-V-W, tarjeta.'],
    ['CH29', 'Sobrecorriente del compresor inverter', 'Compresor, condensadora sucia, exceso de gas.'],
    ['CH32', 'Temperatura de descarga alta (más de 105 °C)', 'Falta de gas, restricción, sensor de descarga.'],
    ['CH41', 'Sensor de descarga abierto o en corto', 'Mide el sensor.'],
    ['CH44', 'Sensor de aire exterior abierto o en corto', 'Mide el sensor.'],
    ['CH45', 'Sensor de tubería del condensador abierto o en corto', 'Mide el sensor.'],
    ['CH46', 'Sensor de succión abierto o en corto', 'Mide el sensor.'],
    ['CH53', 'Falla de comunicación interior ↔ exterior', 'Cable de interconexión y conexiones.'],
    ['CH60', 'Error de memoria (EEPROM) de la tarjeta exterior', 'Tarjeta exterior.'],
    ['CH61', 'Temperatura del condensador muy alta', 'Condensadora sucia, ventilador exterior, exceso de gas.'],
    ['CH62', 'Temperatura alta del disipador (tarjeta exterior)', 'Disipador sucio, ventilación de la condensadora.'],
    ['CH67', 'Motor BLDC del ventilador exterior trabado', 'Aspa, motor o tarjeta.'],
  ] },
];

VISTAS.codigos = () => {
  let marca = store.get('cod_marca', 'Midea');
  if (!CODIGOS.some(c => c.marca === marca)) marca = 'Midea';
  app.innerHTML = `<div class="alerta">${ico('triangle-alert')} Los códigos cambian entre modelos de la misma marca. Úsalos como guía y confírmalos con la tabla de la tapa o del manual del equipo.</div>
    ${seg('marca', CODIGOS.map(c => [c.marca, c.marca]), marca)}
    <input id="q" type="search" placeholder="Buscar código o palabra (ej. E1, sensor)" autocomplete="off">
    <div id="lista"></div>
    ${item('#apuntes', 'notebook-pen', 'ambar', '¿Otra marca?', 'Guarda su tabla en Mis apuntes y la encuentras con el buscador')}`;
  const pinta = () => {
    const c = CODIGOS.find(x => x.marca === marca), w = norm($('#q').value).trim();
    const l = c.codigos.filter(k => !w || norm(k.join(' ')).includes(w));
    $('#lista').innerHTML = `<p class="muted">${c.nota}</p>` + (l.map(([cod, sig, rev]) =>
      `<div class="card codigo"><span class="cod">${cod}</span><div><b>${sig}</b><br><span class="muted">Revisa: ${rev}</span></div></div>`).join('') || '<p class="muted">Sin resultados.</p>');
  };
  bindSeg('marca', v => { marca = v; store.set('cod_marca', v); pinta(); });
  $('#q').addEventListener('input', pinta);
  pinta();
  return 'Códigos de error';
};

// ---------- Diagramas (SVG, se adaptan a tema claro u oscuro) ----------
const flecha = `<defs><marker id="fl" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="currentColor"/></marker></defs>`;
const serpentin = (x, y, w, h) => { let d = `M${x} ${y}`; const n = 6; for (let i = 0; i < n; i++) { const yy = y + (h / n) * (i + 0.5); d += ` L${i % 2 ? x : x + w} ${yy}`; } return `<path d="${d} L${x + (n % 2 ? w : 0)} ${y + h}" fill="none" stroke="currentColor" stroke-width="2.5"/>`; };

const DIAGRAMAS = [
  { id: 'ciclo', t: 'Ciclo de refrigeración', txt: 'Rojo = alta presión caliente. Naranja = líquido de alta. Azul claro = mezcla fría después del capilar. Azul = succión de baja. En calefacción la válvula de 4 vías invierte el sentido.',
    svg: `<svg viewBox="0 0 340 258" class="diagrama" role="img" aria-label="Ciclo de refrigeración">
      <defs>${[['r', '#dc2626'], ['o', '#ea580c'], ['c', '#38bdf8'], ['b', '#2563eb']].map(([k, c]) =>
        `<marker id="fl-${k}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="3" markerHeight="3" orient="auto"><path d="M0 0 10 5 0 10z" fill="${c}"/></marker>`).join('')}</defs>
      <rect x="20" y="62" width="100" height="136" rx="10" class="caja"/><rect x="220" y="62" width="100" height="136" rx="10" class="caja"/>
      <text x="70" y="80" class="tx" text-anchor="middle">Evaporador</text><text x="70" y="93" class="tx2" text-anchor="middle">adentro</text>
      <text x="270" y="80" class="tx" text-anchor="middle">Condensador</text><text x="270" y="93" class="tx2" text-anchor="middle">afuera</text>
      ${serpentin(43, 100, 54, 88)}${serpentin(243, 100, 54, 88)}
      <path d="M190 228 H300 V204" stroke="#dc2626" stroke-width="4" fill="none" marker-end="url(#fl-r)"/>
      <path d="M300 62 V30 H190" stroke="#ea580c" stroke-width="4" fill="none" marker-end="url(#fl-o)"/>
      <path d="M150 30 H40 V56" stroke="#38bdf8" stroke-width="4" fill="none" marker-end="url(#fl-c)"/>
      <path d="M40 198 V228 H143" stroke="#2563eb" stroke-width="4" fill="none" marker-end="url(#fl-b)"/>
      <circle cx="169" cy="228" r="19" class="caja"/><text x="169" y="233" class="tx" text-anchor="middle">C</text>
      <text x="169" y="256" class="tx2" text-anchor="middle">Compresor</text>
      <path d="M152 30 c4 -10 8 10 12 0 s8 10 12 0 s8 10 12 0" fill="none" stroke="currentColor" stroke-width="2.5"/>
      <text x="170" y="16" class="tx2" text-anchor="middle">Capilar / EEV</text>
      <text x="92" y="220" class="tx2" text-anchor="middle" style="fill:#2563eb">Succión</text>
      <text x="246" y="220" class="tx2" text-anchor="middle" style="fill:#dc2626">Descarga</text>
      <text x="245" y="24" class="tx2" text-anchor="middle" style="fill:#ea580c">Líquido</text>
    </svg>` },
  { id: 'capacitor', t: 'Conexión del capacitor doble', txt: 'C del capacitor y la R del compresor van a la línea 1 (fase). HERM va a la S (arranque) del compresor. FAN va al cable de arranque del motor ventilador. La C del compresor y el común del ventilador van a la línea 2 (neutro en 110 V, otra fase en 220 V). Los colores de los cables del motor cambian por marca: sigue el diagrama de la tapa.',
    svg: `<svg viewBox="0 0 340 250" class="diagrama" role="img" aria-label="Conexión del capacitor doble">
      <text x="10" y="22" class="tx" style="fill:#dc2626">L1 (fase)</text><path d="M10 30 H330" stroke="#dc2626" stroke-width="3"/>
      <text x="10" y="244" class="tx" style="fill:#2563eb">L2 (neutro o fase)</text><path d="M10 226 H330" stroke="#2563eb" stroke-width="3"/>
      <rect x="120" y="92" width="100" height="54" rx="12" class="caja"/><text x="170" y="160" class="tx2" text-anchor="middle">Capacitor doble</text>
      <circle cx="138" cy="104" r="7" class="borne"/><circle cx="170" cy="104" r="7" class="borne"/><circle cx="202" cy="104" r="7" class="borne"/>
      <text x="138" y="131" class="tx2" text-anchor="middle">HERM</text><text x="170" y="131" class="tx2" text-anchor="middle">C</text><text x="202" y="131" class="tx2" text-anchor="middle">FAN</text>
      <circle cx="60" cy="150" r="34" class="caja"/><text x="60" y="198" class="tx2" text-anchor="middle">Compresor</text>
      <circle cx="48" cy="140" r="6" class="borne"/><text x="36" y="144" class="tx2" text-anchor="middle">R</text>
      <circle cx="72" cy="140" r="6" class="borne"/><text x="72" y="130" class="tx2" text-anchor="middle">S</text>
      <circle cx="60" cy="163" r="6" class="borne"/><text x="48" y="167" class="tx2" text-anchor="middle">C</text>
      <circle cx="280" cy="150" r="34" class="caja"/><text x="280" y="198" class="tx2" text-anchor="middle">Ventilador</text>
      <text x="280" y="155" class="tx2" text-anchor="middle">motor</text>
      <path d="M170 97 V30" stroke="#dc2626" stroke-width="2.5" fill="none"/>
      <path d="M48 134 V30" stroke="#dc2626" stroke-width="2.5" fill="none"/>
      <path d="M138 110 V70 H86 V140 H78" stroke="#16a34a" stroke-width="2.5" fill="none"/>
      <path d="M66 163 H104 V226" stroke="#2563eb" stroke-width="2.5" fill="none"/>
      <path d="M262 124 V30" stroke="#dc2626" stroke-width="2.5" fill="none"/><text x="256" y="60" class="tx2" text-anchor="end">marcha</text>
      <path d="M202 110 V76 H282 V116" stroke="#ca8a04" stroke-width="2.5" fill="none"/><text x="292" y="92" class="tx2">arranque</text>
      <path d="M306 168 H320 V226" stroke="#2563eb" stroke-width="2.5" fill="none"/><text x="314" y="216" class="tx2" text-anchor="end">común</text>

    </svg>` },
  { id: 'devanados', t: 'Medir el compresor (C, S, R)', txt: 'Con el equipo desconectado. La lectura más alta (R-S) es la suma de las otras dos. La más baja (C-R) es la marcha. Cualquier lectura de una terminal a la carcasa indica falla de aislamiento.',
    svg: `<svg viewBox="0 0 340 220" class="diagrama" role="img" aria-label="Medición de devanados">
      <circle cx="170" cy="115" r="92" class="caja"/>
      <circle cx="110" cy="80" r="16" class="borne"/><text x="110" y="86" class="tx" text-anchor="middle">R</text>
      <circle cx="230" cy="80" r="16" class="borne"/><text x="230" y="86" class="tx" text-anchor="middle">S</text>
      <circle cx="170" cy="170" r="16" class="borne"/><text x="170" y="176" class="tx" text-anchor="middle">C</text>
      <path d="M126 80 H214" stroke="#dc2626" stroke-width="3"/><text x="170" y="72" class="tx2" text-anchor="middle" style="fill:#dc2626">R-S = 7 Ω (la mayor)</text>
      <path d="M118 94 L160 157" stroke="#16a34a" stroke-width="3"/><text x="70" y="140" class="tx2" style="fill:#16a34a">C-R = 2 Ω</text>
      <path d="M222 94 L180 157" stroke="#2563eb" stroke-width="3"/><text x="212" y="140" class="tx2" style="fill:#2563eb">C-S = 5 Ω</text>
      <text x="170" y="212" class="tx2" text-anchor="middle">2 + 5 = 7 → los devanados están bien</text>
    </svg>` },
  { id: 'split', t: 'Tubería y válvulas de un split', txt: 'Tubo delgado = líquido; tubo grueso = gas (succión en frío). Las válvulas de servicio están en la condensadora y se abren con llave Allen. El pivote para el manómetro está en la válvula del tubo grueso. El drenaje debe tener caída todo el recorrido.',
    svg: `<svg viewBox="0 0 340 220" class="diagrama" role="img" aria-label="Tubería de un split">
      <rect x="14" y="20" width="130" height="50" rx="10" class="caja"/><text x="79" y="50" class="tx" text-anchor="middle">Evaporadora</text>
      <rect x="200" y="120" width="126" height="86" rx="10" class="caja"/><text x="263" y="170" class="tx" text-anchor="middle">Condensadora</text>
      <path d="M40 70 V150 H196" stroke="#ea580c" stroke-width="3" fill="none"/><text x="60" y="144" class="tx2" style="fill:#ea580c">Líquido (delgado)</text>
      <path d="M60 70 V120 H196" stroke="#2563eb" stroke-width="7" fill="none"/><text x="80" y="114" class="tx2" style="fill:#2563eb">Gas (grueso)</text>
      <rect x="190" y="112" width="14" height="16" rx="3" class="borne"/><rect x="190" y="142" width="14" height="16" rx="3" class="borne"/>
      <path d="M197 112 V96" stroke="currentColor" stroke-width="2"/><circle cx="197" cy="92" r="5" class="borne"/><text x="206" y="94" class="tx2">pivote</text>
      <path d="M120 70 C125 110 110 180 150 206" stroke="#16a34a" stroke-width="2.5" stroke-dasharray="6 4" fill="none"/><text x="120" y="200" class="tx2" style="fill:#16a34a">drenaje</text>
      <path d="M90 70 C100 100 150 188 200 190" stroke="#ca8a04" stroke-width="2" fill="none"/><text x="150" y="214" class="tx2" style="fill:#ca8a04">cable de interconexión</text>
    </svg>` },
];

VISTAS.diagramas = () => {
  app.innerHTML = DIAGRAMAS.map(d => `<div class="card"><h3>${d.t}</h3>${d.svg}<p>${d.txt}</p></div>`).join('') +
    '<p class="muted">Diagramas generales. El diagrama eléctrico de la tapa del equipo siempre manda.</p>';
  return 'Diagramas';
};

// ---------- Piezas con dibujo ----------
const PIEZAS = [
  { t: 'Compresor', d: 'Bombea el gas. Rotativo en splits y ventanas. Terminales C-S-R (convencional) o U-V-W (inverter).',
    svg: '<rect x="18" y="16" width="44" height="52" rx="16" class="caja"/><circle cx="32" cy="30" r="3.5" class="borne"/><circle cx="48" cy="30" r="3.5" class="borne"/><circle cx="40" cy="42" r="3.5" class="borne"/><path d="M62 50 H74 M18 56 H6" stroke="currentColor" stroke-width="3"/>' },
  { t: 'Capacitor', d: 'Ayuda a arrancar y mantener trabajando motores. Se mide en µF; tolerancia ±5–6%.',
    svg: '<rect x="24" y="18" width="32" height="50" rx="8" class="caja"/><circle cx="32" cy="14" r="3.5" class="borne"/><circle cx="40" cy="14" r="3.5" class="borne"/><circle cx="48" cy="14" r="3.5" class="borne"/><text x="40" y="48" class="tx2" text-anchor="middle">µF</text>' },
  { t: 'Tubo capilar', d: 'Tubo muy delgado que baja la presión antes del evaporador. Si se tapa: baja muy baja, SH alto.',
    svg: '<path d="M8 40 H20 c4 -16 12 -16 16 0 s12 16 16 0 s12 -16 16 0 H74" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="8" cy="40" r="3" class="borne"/>' },
  { t: 'Filtro deshidratador', d: 'Atrapa humedad y basura. Si está tapado se escarcha a la salida. Cámbialo cada vez que abras el sistema (si lleva).',
    svg: '<path d="M6 40 H20 M60 40 H74" stroke="currentColor" stroke-width="3"/><rect x="20" y="28" width="40" height="24" rx="10" class="caja"/><path d="M30 34 V46 M40 34 V46 M50 34 V46" stroke="currentColor" stroke-width="1.5"/>' },
  { t: 'Válvula de servicio', d: 'En la condensadora del split. Se abre y cierra con llave Allen. La de gas trae el pivote.',
    svg: '<rect x="26" y="26" width="28" height="28" rx="5" class="caja"/><path d="M6 40 H26 M54 40 H74 M40 26 V12" stroke="currentColor" stroke-width="3"/><circle cx="40" cy="10" r="4" class="borne"/><path d="M40 54 V66" stroke="currentColor" stroke-width="3"/>' },
  { t: 'Contactor', d: 'Interruptor que conecta el compresor cuando la tarjeta o el termostato lo pide. Revisa que los contactos no estén quemados.',
    svg: '<rect x="18" y="14" width="44" height="52" rx="6" class="caja"/><circle cx="30" cy="22" r="3.5" class="borne"/><circle cx="50" cy="22" r="3.5" class="borne"/><circle cx="30" cy="58" r="3.5" class="borne"/><circle cx="50" cy="58" r="3.5" class="borne"/><rect x="30" y="34" width="20" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>' },
  { t: 'Termistor (sensor)', d: 'Resistencia que cambia con la temperatura. Al calentarse baja su resistencia. Valores comunes: 5k, 10k, 15k, 20k, 50k.',
    svg: '<rect x="10" y="34" width="22" height="12" rx="6" class="caja"/><path d="M32 38 C48 30 56 50 74 42 M32 42 C48 34 56 54 74 46" fill="none" stroke="currentColor" stroke-width="2"/>' },
  { t: 'Válvula de 4 vías', d: 'Sólo en frío-calor. Invierte el ciclo. Su bobina se energiza normalmente en calefacción.',
    svg: '<rect x="14" y="30" width="52" height="20" rx="8" class="caja"/><path d="M40 30 V12 M24 50 V68 M40 50 V68 M56 50 V68" stroke="currentColor" stroke-width="3"/><rect x="50" y="14" width="18" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="2"/>' },
  { t: 'Válvula de expansión electrónica (EEV)', d: 'La mueve la tarjeta con un motor de pasos. Regula el gas en inverters. Bobina de 5 o 6 cables.',
    svg: '<rect x="30" y="30" width="20" height="30" rx="4" class="caja"/><rect x="24" y="12" width="32" height="20" rx="6" class="caja"/><path d="M10 50 H30 M50 50 H70" stroke="currentColor" stroke-width="3"/>' },
];

VISTAS.piezas = () => {
  app.innerHTML = PIEZAS.map(p => `<div class="card pieza"><svg viewBox="0 0 80 80" class="dib">${p.svg}</svg><div><b>${p.t}</b><br><span>${p.d}</span></div></div>`).join('') +
    item('#diagramas', 'layers', 'azul', 'Ver diagramas', 'Ciclo, capacitor doble, compresor y tubería');
  return 'Piezas del equipo';
};

// ---------- Casos prácticos ----------
const CASOS = [
  { t: 'Split que enfría poco', d: 'Split R410A convencional. Afuera 35 °C, cuarto 26 °C. Baja 95 psi, sobrecalentamiento 16 °C, diferencia de aire 5 °C. Filtros limpios.',
    o: ['Exceso de gas', 'Falta de gas por una fuga', 'Condensadora sucia', 'Todo normal'], r: 1,
    e: 'Baja baja + SH alto + poca diferencia de aire = le falta gas. Busca la fuga, repárala, haz vacío y carga por peso.' },
  { t: 'Tubería escarchada', d: 'Split R22. Baja 50 psi, SH 2 °C, diferencia de aire 16 °C. La tubería de succión tiene hielo. Hace meses que no le dan mantenimiento.',
    o: ['Falta de gas', 'Poco aire en la evaporadora (filtros o turbina sucios)', 'Compresor dañado', 'Exceso de gas'], r: 1,
    e: 'Con SH bajo y mucha diferencia de aire, el problema es que pasa poco aire. Lava filtros y turbina antes de tocar el gas.' },
  { t: 'Compresor que zumba', d: 'Equipo de ventana R22. El compresor zumba unos segundos y se bota el térmico. El capacitor de 35 µF mide 20 µF.',
    o: ['Compresor quemado', 'Capacitor dañado', 'Falta de gas', 'Termostato'], r: 1,
    e: '20 µF está muy abajo del mínimo (32.9 µF). Cambia el capacitor por uno del mismo µF y voltaje igual o mayor.' },
  { t: 'Recién cargado "a ojo"', d: 'Otro técnico le cargó gas "a ojo" a un split R410A. Ahora: baja 150 psi, alta 480 psi, SH 1 °C, el compresor suena con golpeteo.',
    o: ['Exceso de gas', 'Falta de gas', 'Restricción', 'Válvula cerrada'], r: 0,
    e: 'Presiones altas y SH casi cero: sobra gas y regresa líquido al compresor. Recupera todo y carga por peso.' },
  { t: 'Se para por calor', d: 'Split convencional. El aspa de la condensadora no gira; la alta sube muchísimo y el compresor se para por el protector térmico.',
    o: ['Capacitor FAN o motor del ventilador exterior', 'Falta de gas', 'Sensor del cuarto', 'Capilar tapado'], r: 0,
    e: 'Sin aire en el condensador la alta se dispara. Gira el aspa con la mano (apagado) y mide la parte FAN del capacitor.' },
  { t: 'Inverter con error de comunicación', d: 'Split inverter R32 marca el código de comunicación entre unidades (E1 en Midea). La condensadora no arranca. El cable de interconexión pasa por una pared con humedad y tiene un empalme.',
    o: ['Falta de gas', 'Cable de interconexión o conexión dañada', 'Compresor quemado', 'Filtros sucios'], r: 1,
    e: 'Los errores de comunicación casi siempre son cable, empalmes o bornes flojos. Revisa continuidad y cambia el cable dañado.' },
  { t: 'Compresor sin fuerza', d: 'Split R410A. Afuera 35 °C. Baja 145 psi y alta 250 psi con el equipo estable. Amperaje muy abajo del RLA. No enfría.',
    o: ['Exceso de gas', 'Compresor ineficiente (no comprime)', 'Poco aire en la evaporadora', 'Normal'], r: 1,
    e: 'La baja alta y la alta baja al mismo tiempo, con amperaje bajo: el compresor no hace diferencia de presión.' },
  { t: 'Un punto escarchado', d: 'Equipo de ventana. La baja está casi en cero, la alta normal y el SH muy alto. Justo a la salida del filtro deshidratador el tubo está escarchado.',
    o: ['Restricción en el filtro', 'Exceso de gas', 'Condensadora sucia', 'Voltaje bajo'], r: 0,
    e: 'Donde hay restricción el tubo se enfría o escarcha. Recupera, cambia el filtro (y revisa el capilar), haz vacío y carga por peso.' },
  { t: 'Gotea dentro del cuarto', d: 'La evaporadora gotea sobre la pared. Al echar agua en la charola, no sale por la manguera de afuera.',
    o: ['Falta de gas', 'Drenaje tapado', 'Exceso de gas', 'Sensor dañado'], r: 1,
    e: 'Destapa el drenaje (nitrógeno a baja presión o bomba de agua) y revisa que la manguera tenga caída todo el recorrido.' },
  { t: 'Prueba de vacío', d: 'Llegaste a 450 micrones. Cerraste la válvula hacia la bomba y en 10 minutos subió a 3000 micrones y sigue subiendo.',
    o: ['Humedad', 'Fuga', 'Está bien', 'Bomba dañada'], r: 1,
    e: 'Si sube sin detenerse hay fuga. Presuriza con nitrógeno y busca con espuma antes de volver a hacer vacío.' },
  { t: 'Equipo recién instalado no enfría', d: 'Split nuevo. El compresor trabaja, pero la baja marca en vacío y la condensadora está caliente sin soplar aire caliente. Los tapones de las válvulas siguen puestos y sin marcas.',
    o: ['Válvulas de servicio cerradas', 'Exceso de gas', 'Capacitor', 'Filtros sucios'], r: 0,
    e: 'Si no se abrieron las válvulas, el gas sigue guardado en la condensadora. Apaga y abre completas primero la de líquido y luego la de gas.' },
];

VISTAS.casos = () => {
  const hechos = store.get('casos', {});
  app.innerHTML = `<p class="muted">Situaciones reales de trabajo. Lee el caso, elige qué tiene el equipo y ve la explicación.</p>` +
    CASOS.map((c, i) => item(`#caso/${i}`, hechos[i] == null ? 'circle-help' : 'check', hechos[i] == null ? 'azul' : hechos[i] ? 'verde' : 'rojo', c.t,
      hechos[i] == null ? 'Sin resolver' : hechos[i] ? 'Acertaste' : 'Fallaste: vuelve a intentarlo')).join('');
  return 'Casos prácticos';
};

VISTAS.caso = i => {
  const c = CASOS[+i];
  if (!c) { ir('casos', true); return; }
  const orden = barajar(c.o.map((_, k) => k));
  app.innerHTML = `<h2>${c.t}</h2><div class="card">${c.d}</div><h3>¿Qué tiene el equipo?</h3>
    ${orden.map(k => `<button class="quiz-op" data-i="${k}">${c.o[k]}</button>`).join('')}<div id="exp"></div>`;
  $$('.quiz-op').forEach(b => b.onclick = () => {
    if ($('#exp').innerHTML) return;
    const k = +b.dataset.i, bien = k === c.r;
    const h = store.get('casos', {}); h[i] = bien; store.set('casos', h);
    $$('.quiz-op').forEach(x => { if (+x.dataset.i === c.r) x.classList.add('ok'); });
    if (!bien) b.classList.add('no');
    const sig = CASOS[+i + 1];
    $('#exp').innerHTML = `<div class="result ${bien ? 'ok' : 'bad'}"><b>${bien ? 'Correcto' : 'Incorrecto'}</b><br>${c.e}</div>` +
      (sig ? `<a class="btn" href="#caso/${+i + 1}">Siguiente caso</a>` : '<a class="btn" href="#casos">Ver todos los casos</a>');
  });
  return 'Caso práctico';
};

// ---------- Refacciones de uso común ----------
VISTAS.refacciones = () => {
  app.innerHTML = `<div class="nota"><b>Regla de oro:</b> cambia el capacitor por uno del <b>mismo µF</b> y con voltaje <b>igual o mayor</b> (370 o 440 VAC). Nunca uno de menor voltaje.</div>
    <h2>Capacitor del compresor (220 V, equipos convencionales)</h2>
    <div class="card"><table><tr><th>Equipo</th><th>Valor típico</th></tr>
      <tr><td>9 000–12 000 BTU</td><td>25–35 µF</td></tr>
      <tr><td>18 000 BTU</td><td>35–45 µF</td></tr>
      <tr><td>24 000 BTU</td><td>40–50 µF</td></tr>
      <tr><td>36 000 BTU</td><td>50–60 µF</td></tr>
    </table><p class="muted">Orientativo: cada compresor pide su valor. Siempre copia el µF del capacitor original o de la placa. Los equipos de 110 V usan capacitores más grandes.</p></div>
    <h2>Capacitor de ventiladores</h2>
    <div class="card"><table>
      <tr><td>Ventilador exterior</td><td>2–5 µF</td></tr>
      <tr><td>Ventilador interior (convencional)</td><td>1–3 µF</td></tr>
      <tr><td>Capacitor doble (ventana y condensadoras)</td><td>Ej. 35 + 5 µF: HERM + FAN</td></tr>
    </table></div>
    <h2>Contactor</h2>
    <div class="card"><ul><li>De 1 o 2 polos, de 20 a 40 A según el equipo.</li><li>Fíjate en el voltaje de la <b>bobina</b> (24 V o 220 V): tiene que ser el mismo que el original.</li><li>Si los contactos están picados o quemados, cámbialo.</li></ul></div>
    <h2>Sensores</h2>
    <div class="card"><p>Pide el mismo valor a 25 °C (5k, 10k, 15k, 20k o 50k) y la misma forma de la punta. Revisa el valor con la herramienta Sensores.</p></div>
    ${item('#sensor', 'microchip', 'morado', 'Probar un sensor')}${item('#cap', 'zap', 'ambar', 'Probar un capacitor')}`;
  return 'Refacciones';
};

// ---------- Manómetro dibujado ----------
function manometro(valor, max, rango, color, titulo, sub) {
  // arco de 270°: de 135° a 405°
  const cx = 70, cy = 70, r = 54;
  const ang = v => (135 + Math.max(0, Math.min(1, v / max)) * 270) * Math.PI / 180;
  const pt = (v, rr = r) => [cx + rr * Math.cos(ang(v)), cy + rr * Math.sin(ang(v))];
  const arco = (a, b, rr) => { const [x1, y1] = pt(a, rr), [x2, y2] = pt(b, rr); const grande = (b - a) / max * 270 > 180 ? 1 : 0; return `M${x1} ${y1} A${rr} ${rr} 0 ${grande} 1 ${x2} ${y2}`; };
  const marcas = [0, 0.25, 0.5, 0.75, 1].map(f => { const [x1, y1] = pt(max * f, r - 2), [x2, y2] = pt(max * f, r - 10), [xt, yt] = pt(max * f, r - 20);
    return `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="currentColor" stroke-width="2"/><text x="${xt}" y="${yt + 4}" class="tx3" text-anchor="middle">${fmt(max * f, 0)}</text>`; }).join('');
  const [nx, ny] = pt(valor, r - 14);
  return `<figure class="mano"><svg viewBox="0 0 140 130" role="img" aria-label="${titulo}">
    <circle cx="${cx}" cy="${cy}" r="${r + 8}" class="caja"/>
    <path d="${arco(0, max, r)}" stroke="var(--line)" stroke-width="8" fill="none"/>
    ${rango ? `<path d="${arco(rango[0], rango[1], r)}" stroke="var(--ok)" stroke-width="8" fill="none"/>` : ''}
    ${marcas}
    <path d="M${cx} ${cy} L${nx} ${ny}" stroke="${color}" stroke-width="4" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="6" fill="${color}"/>
    <text x="${cx}" y="${cy + 34}" class="tx" text-anchor="middle">${fmt(valor, 0)}</text>
  </svg><figcaption><b style="color:${color}">${titulo}</b><br><span class="muted">${sub}</span></figcaption></figure>`;
}

// ---------- Lectura en voz alta ----------
const voz = {
  hablando: false,
  disponible: () => 'speechSynthesis' in window,
  leer(texto, boton) {
    if (!this.disponible()) return;
    if (this.hablando) { this.parar(); return; }
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = 'es-ES'; u.rate = 0.95;
    const v = speechSynthesis.getVoices().find(x => /^es/i.test(x.lang));
    if (v) u.voice = v;
    u.onend = u.onerror = () => { this.hablando = false; if (boton) boton.innerHTML = `${ico('bell')} Escuchar`; };
    speechSynthesis.cancel(); speechSynthesis.speak(u);
    this.hablando = true; if (boton) boton.innerHTML = `${ico('x')} Parar`;
  },
  parar() { try { speechSynthesis.cancel(); } catch {} this.hablando = false; },
};
