// RefriGuía — pantallas de herramientas y cálculos.
'use strict';

const SECCIONES = [
  { t: 'Medir y calcular', items: [
    { r: 'pt', i: '📊', t: 'Tabla presión-temperatura', k: 'presion temperatura saturacion psi bar kpa tabla pt' },
    { r: 'sh', i: '🌡️', t: 'Sobrecalentamiento y subenfriamiento', k: 'sh sc superheat subcooling carga objetivo bulbo humedo' },
    { r: 'diag', i: '🧭', t: 'Diagnóstico por presiones', k: 'diagnostico presiones baja alta falla esperada' },
    { r: 'dt', i: '🌬️', t: 'Temperatura del aire (ΔT)', k: 'delta aire retorno inyeccion salida diferencia enfria poco' },
    { r: 'carga', i: '⚖️', t: 'Carga por metro extra', k: 'carga gas gramos metro tuberia adicional precarga' },
  ] },
  { t: 'Eléctrico', items: [
    { r: 'cap', i: '🔋', t: 'Capacitores', k: 'capacitor microfaradios uf herm fan' },
    { r: 'comp', i: '🔌', t: 'Terminales del compresor', k: 'compresor devanado ohm comun arranque marcha csr uvw inverter' },
    { r: 'sensor', i: '🧪', t: 'Sensores (termistores)', k: 'termistor sensor ntc kohm resistencia temperatura' },
    { r: 'cable', i: '🧵', t: 'Cable y breaker', k: 'cable calibre awg breaker pastilla interruptor mca mop tierra caida voltaje' },
  ] },
  { t: 'Instalación', items: [
    { r: 'vacio', i: '🌀', t: 'Vacío y cronómetro', k: 'vacio micrones bomba prueba retencion cronometro' },
    { r: 'nivel', i: '📏', t: 'Nivel', k: 'nivel burbuja evaporadora placa inclinacion ventana' },
    { r: 'btu', i: '🏠', t: 'Cálculo de BTU del cuarto', k: 'btu toneladas cuarto area m2 tamaño equipo' },
    { r: 'tablas', i: '📐', t: 'Torque, tuberías y presiones', k: 'torque flare tuberia diametro presiones referencia' },
    { r: 'listas', i: '✅', t: 'Listas de revisión', k: 'checklist lista instalacion mantenimiento seguridad pump down desinstalar' },
  ] },
  { t: 'Otros', items: [
    { r: 'conv', i: '🔁', t: 'Conversiones', k: 'convertir unidades btu kw psi bar libras kilos pies' },
    { r: 'glosario', i: '🔤', t: 'Glosario inglés-español', k: 'ingles traduccion palabras manual placa codigo' },
  ] },
];
const HERRAMIENTA = r => SECCIONES.flatMap(s => s.items).find(h => h.r === r);

VISTAS[''] = () => {
  app.innerHTML = SECCIONES.map(s => `<h2 class="seccion">${s.t}</h2><div class="grid">${
    s.items.map(h => `<a class="tile" href="#${h.r}"><span>${h.i}</span>${h.t}</a>`).join('')}</div>`).join('') +
    `<p class="muted" style="margin-top:1rem">Los valores son orientativos. Siempre manda la placa y el manual del fabricante.</p>`;
  return 'RefriGuía';
};

const notaInflamable = gas => gas === 'R290'
  ? '<div class="alerta">🔥 R290 (propano) es A3: <b>muy inflamable</b>. Nada de flama ni chispas, herramienta para A3 y nunca soldar con gas.</div>'
  : gas === 'R32' ? '<div class="nota">R32 es A2L (levemente inflamable). Repasa la lección de seguridad antes de soldar o recuperar.</div>' : '';

// ---------- Tabla P-T ----------
VISTAS.pt = () => {
  let modo = 'p', tRes = null;
  app.innerHTML = `${gasSeg()}
    ${seg('modo', [['p', 'Tengo presión'], ['t', 'Tengo temperatura']], modo)}
    ${puSeg()}${tuSeg()}
    <div id="entrada"></div><div id="res"></div>
    <button class="btn sec" id="verTabla">Ver tabla completa</button>
    <div id="tabla" class="hidden"></div>
    <div id="notaGas"></div>
    <p class="muted">Presión manométrica (la que marca el manómetro). Temperatura de saturación (de rocío). Para R410A la diferencia entre líquido y vapor es menor a 0.2 °C.</p>`;
  const entrada = () => {
    $('#entrada').innerHTML = modo === 'p'
      ? campo('v', `Presión en ${UP}`, { tipo: 'p', ph: 'Ej. 118' })
      : campo('v', `Temperatura en ${UT}`, { tipo: 't', neg: true, ph: 'Ej. 5' });
    pintaUnidades();
    $('#v').addEventListener('input', calc);
  };
  const calc = () => {
    const v = val('v'), g = cfg.gas;
    let html = '';
    tRes = null;
    if (Number.isFinite(v)) {
      if (modo === 'p') {
        const t = satT(g, aPsi(v, cfg.pu));
        if (Number.isFinite(t)) tRes = t;
        const otra = cfg.tu === 'C' ? 'F' : 'C';
        html = Number.isFinite(t)
          ? resultado('', `${fmt(tA(t, cfg.tu))} ${tU(cfg.tu)}`, `${g} a ${fmt(v, 2)} ${cfg.pu} · (${fmt(tA(t, otra))} ${tU(otra)})`)
          : resultado('warn', 'Fuera de rango', `La tabla de ${g} va de ${rangoPT(g)}.`);
      } else {
        const c = aC(v, cfg.tu), p = satP(g, c);
        if (Number.isFinite(p)) tRes = c;
        html = Number.isFinite(p)
          ? resultado('', `${fmt(psiA(p, cfg.pu), pDec(cfg.pu))} ${cfg.pu}`, `${g} a ${fmt(v)} ${tU(cfg.tu)} · ${['psi', 'bar', 'kPa'].filter(u => u !== cfg.pu).map(u => `${fmt(psiA(p, u), pDec(u))} ${u}`).join(' · ')}`)
          : resultado('warn', 'Fuera de rango', 'La tabla va de −40 °C a 70 °C.');
      }
    }
    $('#res').innerHTML = html;
    if (!$('#tabla').classList.contains('hidden')) tabla(false);
  };
  const tabla = desplazar => {
    const filas = [];
    if (cfg.tu === 'C') for (let c = -30; c <= 65; c++) filas.push([c, c]);
    else for (let f = -20; f <= 150; f += 2) filas.push([f, (f - 32) / 1.8]);
    let hl = -1;
    if (tRes != null) {
      let mejor = Infinity;
      filas.forEach(([, c], i) => { const d = Math.abs(c - tRes); if (d < mejor) { mejor = d; hl = i; } });
      if (mejor > 1.2) hl = -1;
    }
    $('#tabla').innerHTML = `<table class="tabla-pt"><thead><tr><th>${tU(cfg.tu)}</th>${GASES.map(g => `<th>${g}<br>${cfg.pu}</th>`).join('')}</tr></thead><tbody>${
      filas.map(([t, c], i) => `<tr class="${i === hl ? 'hl' : ''}"><td>${t}</td>${GASES.map(g => `<td>${fmt(psiA(satP(g, c), cfg.pu), pDec(cfg.pu))}</td>`).join('')}</tr>`).join('')
    }</tbody></table>`;
    if (desplazar) $('#tabla tr.hl')?.scrollIntoView({ block: 'center' });
  };
  bindUnidades(() => { $('#notaGas').innerHTML = notaInflamable(cfg.gas); calc(); });
  bindSeg('modo', v => { modo = v; entrada(); calc(); });
  $('#verTabla').onclick = () => {
    const oculto = $('#tabla').classList.toggle('hidden');
    $('#verTabla').textContent = oculto ? 'Ver tabla completa' : 'Ocultar tabla';
    if (!oculto) tabla(true);
  };
  entrada();
  $('#notaGas').innerHTML = notaInflamable(cfg.gas);
  calc();
  return 'Tabla P-T';
};

// ---------- Sobrecalentamiento / subenfriamiento ----------
function shObjetivo(tCuarto, hr, tAfuera) {
  // Fórmula práctica de la carta de sobrecalentamiento para equipos con dispositivo fijo (capilar), en °F:
  // SH = (3 × bulbo húmedo interior − 80 − bulbo seco exterior) ÷ 2
  const wb = bulboHumedo(tCuarto, hr);
  const objF = (3 * (wb * 1.8 + 32) - 80 - (tAfuera * 1.8 + 32)) / 2;
  return { wb, objC: objF / 1.8, valido: objF >= 5 };
}

VISTAS.sh = () => {
  let tipo = 'sh';
  app.innerHTML = `${seg('tipo', [['sh', 'SH (succión)'], ['sc', 'SC (líquido)']], tipo)}
    ${gasSeg()}${puSeg()}${tuSeg()}
    <div id="campos"></div><div id="res"></div><div id="objetivo"></div><div id="ayuda"></div>`;
  const campos = () => {
    $('#campos').innerHTML = tipo === 'sh'
      ? campo('p', `Presión de succión (baja) en ${UP}`, { tipo: 'p' }) + campo('t', `Temperatura del tubo de succión (grueso) en ${UT}`, { tipo: 't', neg: true })
      : campo('p', `Presión de alta (línea de líquido) en ${UP}`, { tipo: 'p' }) + campo('t', `Temperatura del tubo de líquido en ${UT}`, { tipo: 't' });
    $('#objetivo').innerHTML = tipo === 'sh' ? `<div class="card"><h3>SH objetivo (equipos con capilar)</h3>
        <p class="muted">Con la temperatura y la humedad del cuarto y la temperatura de afuera te dice cuánto sobrecalentamiento debe tener. No sirve para inverter con válvula electrónica: esos se cargan por peso.</p>
        <div class="row"><div>${campo('tc', `Aire del cuarto ${UT}`, { tipo: 't', valor: preAmb('tc') })}</div><div>${campo('hr', 'Humedad del cuarto %', { valor: store.get('hr', 50), modo: 'numeric' })}</div></div>
        ${campo('te', `Aire de afuera ${UT}`, { tipo: 't', neg: true, valor: preAmb('te') })}
        <p class="muted">Si no tienes medidor de humedad: clima seco 30%, normal 50%, costa o muy húmedo 70%.</p>
        <div id="resObj"></div></div>` : '';
    $('#ayuda').innerHTML = tipo === 'sh'
      ? '<div class="nota">Termómetro en el tubo grueso a 10–15 cm de la válvula de servicio, bien pegado y aislado. Equipo estable 10–15 min (inverter en modo prueba o frío a 16 °C).</div>'
      : '<div class="nota">Termómetro en el tubo de líquido a la salida del condensador. Se usa sobre todo en equipos con válvula de expansión.</div>';
    pintaUnidades();
    $$('#campos input, #objetivo input').forEach(i => i.addEventListener('input', calc));
    ligarAmb('tc', 'tc'); ligarAmb('te', 'te');
    $('#hr')?.addEventListener('input', () => { const v = val('hr'); if (Number.isFinite(v)) store.set('hr', v); });
  };
  const calc = () => {
    const p = val('p'), t = val('t');
    let medido = null;
    if (!Number.isFinite(p) || !Number.isFinite(t)) $('#res').innerHTML = '';
    else {
      const ts = satT(cfg.gas, aPsi(p, cfg.pu));
      if (!Number.isFinite(ts)) $('#res').innerHTML = resultado('warn', 'Presión fuera de rango', `La tabla de ${cfg.gas} va de ${rangoPT(cfg.gas)}.`);
      else {
        const tc = aC(t, cfg.tu);
        const dc = tipo === 'sh' ? tc - ts : ts - tc;
        if (tipo === 'sh') medido = dc;
        let cls, txt;
        if (tipo === 'sh') {
          if (dc < 0) [cls, txt] = ['bad', 'Negativo: revisa la medición. Si está bien, está regresando líquido al compresor.'];
          else if (dc < 3) [cls, txt] = ['bad', 'Muy bajo: posible exceso de gas o poco aire en la evaporadora (filtros, turbina). Riesgo de regresar líquido al compresor.'];
          else if (dc <= 8) [cls, txt] = ['ok', 'Normal para un equipo con capilar trabajando a plena carga.'];
          else if (dc <= 12) [cls, txt] = ['warn', 'Alto: posible falta de gas. Revisa que el aire y la temperatura del cuarto estén normales.'];
          else [cls, txt] = ['bad', 'Muy alto: falta de gas (fuga) o restricción (capilar o filtro tapado).'];
        } else {
          if (dc < 0) [cls, txt] = ['bad', 'Negativo: revisa la medición y el punto donde pusiste el termómetro.'];
          else if (dc < 2) [cls, txt] = ['warn', 'Bajo: posible falta de gas.'];
          else if (dc <= 8) [cls, txt] = ['ok', 'Normal. Compara con lo que pide el fabricante (muchos piden 3–6 °C).'];
          else [cls, txt] = ['warn', 'Alto: posible exceso de gas o restricción (si además la succión está baja).'];
        }
        $('#res').innerHTML = resultado(cls, `${tipo === 'sh' ? 'SH' : 'SC'} = ${fmt(dA(dc, cfg.tu))} ${tU(cfg.tu)}`,
          `Saturación: ${fmt(tA(ts, cfg.tu))} ${tU(cfg.tu)} · ${cfg.tu === 'C' ? `(${fmt(dc * 1.8)} °F)` : `(${fmt(dc)} °C)`}<br><b>${txt}</b>`);
      }
    }
    if (tipo !== 'sh') return;
    const tcu = val('tc'), hr = val('hr'), taf = val('te');
    if (![tcu, hr, taf].every(Number.isFinite)) { $('#resObj').innerHTML = '<p class="muted">Llena los tres datos para ver el objetivo.</p>'; return; }
    const o = shObjetivo(aC(tcu, cfg.tu), hr, aC(taf, cfg.tu));
    const wb = `Bulbo húmedo del cuarto ≈ ${fmt(tA(o.wb, cfg.tu))} ${tU(cfg.tu)}.`;
    if (!o.valido) { $('#resObj').innerHTML = resultado('warn', 'No aplica', `${wb} Con este clima el objetivo sale menor a 3 °C y el método no es confiable. Carga por peso con la placa.`); return; }
    let cls = '', txt = 'Mide el SH arriba para compararlo.';
    if (medido != null) {
      const dif = medido - o.objC;
      if (dif > 1.7) [cls, txt] = ['warn', `Tienes ${fmt(dA(dif, cfg.tu))} ${tU(cfg.tu)} de más: <b>le falta gas</b>. Agrega poco a poco y espera 10–15 min antes de volver a medir.`];
      else if (dif < -1.7) [cls, txt] = ['warn', `Tienes ${fmt(dA(-dif, cfg.tu))} ${tU(cfg.tu)} de menos: <b>le sobra gas o pasa poco aire</b> por la evaporadora. Revisa filtros y turbina; si están bien, recupera un poco.`];
      else [cls, txt] = ['ok', '<b>La carga está bien</b> (dentro de ±1.7 °C del objetivo).'];
    }
    $('#resObj').innerHTML = resultado(cls, `Objetivo: ${fmt(dA(o.objC, cfg.tu))} ${tU(cfg.tu)}`, `${wb}<br>${txt}`);
  };
  bindUnidades(calc);
  bindSeg('tipo', v => { tipo = v; campos(); calc(); });
  campos(); calc();
  return 'Sobrecalentamiento';
};

// ---------- Diagnóstico por presiones ----------
function diagnosticar(b, a, s) {
  const FALTA = ['Falta de refrigerante (fuga)', 'Sobrecalentamiento alto. Busca la fuga (uniones flare, válvulas, serpentín), repárala, haz vacío y carga por peso.'];
  const AIRE_EVAP = ['Poco aire en la evaporadora', 'Filtros o serpentín sucios, turbina sucia o motor lento. Sobrecalentamiento bajo o normal. Lava y vuelve a medir.'];
  const RESTR = ['Restricción (capilar, filtro o tubo aplastado)', 'Baja muy baja con alta normal o alta. Sobrecalentamiento y subenfriamiento altos. Busca un punto frío o escarchado en la tubería.'];
  const COND = ['Condensadora con problema', 'Condensador sucio, ventilador exterior lento o parado (revisa el capacitor FAN), aire caliente recirculando o equipo al sol sin espacio.'];
  const EXCESO = ['Exceso de refrigerante', 'Presiones altas con sobrecalentamiento bajo. Recupera el excedente y ajusta la carga por peso.'];
  const COMPRESOR = ['Compresor ineficiente', 'No hace diferencia de presión: válvulas internas dañadas. En bomba de calor, también la válvula de 4 vías pasando. Mide el amperaje (suele estar bajo).'];
  const NOCOND = ['Aire o no condensables en el sistema', 'Alta muy alta y el equipo no enfría bien. Pasa cuando no se hizo buen vacío. Recupera, haz vacío y carga de nuevo.'];
  const CARGA = ['Mucho calor en el cuarto', 'Recién arrancó, cuarto muy caliente, puertas abiertas o mucho sol. Espera a que se estabilice y vuelve a medir.'];
  const INV = ['Inverter a baja velocidad', 'Si es inverter, pon el modo prueba o frío a 16 °C con ventilador alto antes de medir.'];
  const LIGERA_FALTA = ['Ligera falta de gas', 'Las presiones parecen bien pero el sobrecalentamiento dice que falta un poco. Busca fuga.'];
  const LIGERO_EXCESO = ['Ligero exceso de gas o poco aire', 'Revisa filtros y turbina. Si están bien, sobra un poco de gas.'];
  const BIEN = ['Presiones correctas', 'Si aun así no enfría: revisa el flujo de aire, el aislamiento de la tubería, el tamaño del equipo para el cuarto y los sensores (en inverter).'];

  if (a === '?') { // sin pivote de alta: se diagnostica con la baja y el sobrecalentamiento
    if (b === 'b') return s === 'alto' ? [FALTA, RESTR] : s === 'bajo' ? [AIRE_EVAP, INV] : s === 'normal' ? [AIRE_EVAP, FALTA, INV] : [FALTA, AIRE_EVAP, RESTR, INV];
    if (b === 'a') return s === 'bajo' ? [EXCESO, COND] : s === 'alto' ? [CARGA, COMPRESOR] : s === 'normal' ? [COND, CARGA, COMPRESOR] : [EXCESO, COND, CARGA, COMPRESOR];
    return s === 'alto' ? [LIGERA_FALTA, RESTR] : s === 'bajo' ? [LIGERO_EXCESO, AIRE_EVAP] : s === 'normal' ? [BIEN]
      : [['La baja está normal', 'Mide la temperatura del tubo de succión para confirmar con el sobrecalentamiento.'], BIEN];
  }
  const k = b + a;
  if (k === 'bb') return s === 'alto' ? [FALTA, RESTR] : s === 'bajo' ? [AIRE_EVAP, INV] : s === 'normal' ? [AIRE_EVAP, FALTA, INV] : [FALTA, AIRE_EVAP, INV];
  if (k === 'bn' || k === 'ba') return s === 'bajo' ? [AIRE_EVAP, COND] : [RESTR, AIRE_EVAP, FALTA];
  if (k === 'ab') return [COMPRESOR, INV];
  if (k === 'aa') return s === 'bajo' ? [EXCESO, COND] : s === 'nose' ? [COND, EXCESO, NOCOND, CARGA] : [COND, NOCOND, CARGA];
  if (k === 'an') return s === 'bajo' ? [EXCESO, CARGA] : [CARGA, COMPRESOR];
  if (k === 'na') return [COND, NOCOND, s === 'bajo' ? EXCESO : CARGA];
  if (k === 'nb') return s === 'alto' ? [FALTA, INV] : [['Temperatura exterior baja', 'Si hace fresco afuera, la alta baja sola. Es normal.'], FALTA, COMPRESOR];
  if (s === 'alto') return [LIGERA_FALTA, RESTR];
  if (s === 'bajo') return [LIGERO_EXCESO, AIRE_EVAP];
  return [BIEN];
}
const listaCausas = l => `<h3>Causas probables</h3>${l.map((c, i) => `<div class="card"><b>${i + 1}. ${c[0]}</b><br>${c[1]}</div>`).join('')}`;
const estado = e => e === 'b' ? '<span class="estado warn">Baja</span>' : e === 'a' ? '<span class="estado warn">Alta</span>' : '<span class="estado ok">Normal</span>';

VISTAS.diag = () => {
  let modo = store.get('diag_modo', 'medir');
  app.innerHTML = `${seg('modo', [['medir', 'Con mediciones'], ['mano', 'Elegir a mano']], modo)}<div id="cuerpo"></div>`;
  const medir = () => {
    $('#cuerpo').innerHTML = `${gasSeg()}${puSeg()}${tuSeg()}
      <div class="row"><div>${campo('te', `Aire de afuera ${UT}`, { tipo: 't', neg: true, valor: preAmb('te') })}</div><div>${campo('tc', `Aire del cuarto ${UT}`, { tipo: 't', valor: preAmb('tc') })}</div></div>
      ${campo('pb', `Presión de baja (succión) en ${UP}`, { tipo: 'p' })}
      ${campo('pa', `Presión de alta en ${UP} (si tiene pivote)`, { tipo: 'p', ph: 'Déjalo vacío si no hay' })}
      ${campo('ts', `Temperatura del tubo de succión ${UT} (opcional)`, { tipo: 't', neg: true })}
      <div id="res"></div>
      <p class="muted">Reglas prácticas: la evaporación queda de ${REGLAS.evap[0]} a ${REGLAS.evap[1]} °C abajo del aire del cuarto, y la condensación de ${REGLAS.cond[0]} a ${REGLAS.cond[1]} °C arriba del aire de afuera (equipos eficientes o inverter cerca de lo bajo; ventana y equipos viejos cerca de lo alto). Mide con filtros limpios y el equipo estable 10–15 min.</p>`;
    bindUnidades(calc);
    ligarAmb('te', 'te'); ligarAmb('tc', 'tc');
    $$('#cuerpo input').forEach(i => i.addEventListener('input', calc));
    calc();
  };
  const calc = () => {
    const g = cfg.gas, pu = cfg.pu, u = cfg.tu;
    const te = aC(val('te'), u), tc = aC(val('tc'), u), pb = val('pb'), pa = val('pa'), ts = aC(val('ts'), u);
    if (![te, tc, pb].every(Number.isFinite)) { $('#res').innerHTML = '<p class="muted">Llena al menos la temperatura de afuera, la del cuarto y la presión de baja.</p>'; return; }
    const ev = [tc - REGLAS.evap[1], tc - REGLAS.evap[0]], co = [te + REGLAS.cond[0], te + REGLAS.cond[1]];
    const tb = satT(g, aPsi(pb, pu));
    if (!Number.isFinite(tb)) { $('#res').innerHTML = resultado('warn', 'Baja fuera de rango', `La tabla de ${g} va de ${rangoPT(g)}.`); return; }
    const hayAlta = Number.isFinite(pa);
    if (hayAlta && pa <= pb) { $('#res').innerHTML = resultado('warn', 'Revisa las presiones', 'La alta debe ser mayor que la baja.'); return; }
    const ta = hayAlta ? satT(g, aPsi(pa, pu)) : NaN;
    if (hayAlta && !Number.isFinite(ta)) { $('#res').innerHTML = resultado('warn', 'Alta fuera de rango', `La tabla de ${g} va de ${rangoPT(g)}.`); return; }
    const b = tb < ev[0] ? 'b' : tb > ev[1] ? 'a' : 'n';
    const a = !hayAlta ? '?' : ta < co[0] ? 'b' : ta > co[1] ? 'a' : 'n';
    const sh = Number.isFinite(ts) ? ts - tb : null;
    const s = sh == null ? 'nose' : sh < 3 ? 'bajo' : sh > 8 ? 'alto' : 'normal';
    const P = c => fmt(psiA(satP(g, c), pu), pDec(pu));
    const T = c => `${fmt(tA(c, u))}${tU(u)}`;
    const shTxt = sh == null ? '<span class="muted">Sin dato</span>'
      : `${fmt(dA(sh, u))} ${tU(u)} <span class="estado ${s === 'normal' ? 'ok' : 'warn'}">${s === 'normal' ? 'Normal' : s === 'bajo' ? 'Bajo' : 'Alto'}</span>`;
    $('#res').innerHTML = `<div class="card"><table>
      <tr><th></th><th>Medido</th><th>Esperado</th></tr>
      <tr><td><b>Baja</b></td><td>${fmt(pb, pDec(pu))} ${pu}<br><span class="muted">${T(tb)}</span><br>${estado(b)}</td><td>${P(ev[0])}–${P(ev[1])} ${pu}<br><span class="muted">${T(ev[0])} a ${T(ev[1])}</span></td></tr>
      <tr><td><b>Alta</b></td><td>${hayAlta ? `${fmt(pa, pDec(pu))} ${pu}<br><span class="muted">${T(ta)}</span><br>${estado(a)}` : '<span class="muted">Sin dato</span>'}</td><td>${P(co[0])}–${P(co[1])} ${pu}<br><span class="muted">${T(co[0])} a ${T(co[1])}</span></td></tr>
      <tr><td><b>SH</b></td><td>${shTxt}</td><td>${fmt(dA(3, u))}–${fmt(dA(8, u))} ${tU(u)}</td></tr>
    </table></div>${listaCausas(diagnosticar(b, a, s))}`;
  };
  const aMano = () => {
    const st = { b: '', a: '', s: 'nose' };
    const nba = [['b', 'Baja'], ['n', 'Normal'], ['a', 'Alta']];
    $('#cuerpo').innerHTML = `${gasSeg()}<div id="ref" class="card"></div>
      <label>Presión de succión (baja)</label>${seg('b', nba, st.b)}
      <label>Presión de descarga (alta)</label>${seg('a', [...nba, ['?', 'No tengo']], st.a)}
      <label>Sobrecalentamiento</label>${seg('s', [['nose', 'No sé'], ['bajo', 'Bajo'], ['normal', 'Normal'], ['alto', 'Alto']], st.s)}
      <div id="res"></div>`;
    const ref = () => {
      const r = PRESIONES.find(x => x.gas === cfg.gas);
      $('#ref').innerHTML = `<b>Referencia ${r.gas}</b> (35 °C afuera, cuarto 24–27 °C):<br>Baja ${r.baja} · Alta ${r.alta}`;
    };
    const pinta = () => {
      $('#res').innerHTML = !st.b || !st.a ? '<p class="muted">Elige cómo están la baja y la alta.</p>' : listaCausas(diagnosticar(st.b, st.a, st.s));
    };
    bindSeg('gas', v => { cfg.gas = v; saveCfg(); ref(); });
    ['b', 'a', 's'].forEach(k => bindSeg(k, v => { st[k] = v; pinta(); }));
    ref(); pinta();
  };
  const cuerpo = () => (modo === 'medir' ? medir : aMano)();
  bindSeg('modo', v => { modo = v; store.set('diag_modo', v); cuerpo(); });
  cuerpo();
  return 'Diagnóstico por presiones';
};

// ---------- Diferencia de temperatura del aire ----------
VISTAS.dt = () => {
  app.innerHTML = `${tuSeg()}
    <div class="row"><div>${campo('ret', `Aire que entra (retorno) ${UT}`, { tipo: 't', valor: preAmb('tc') })}</div><div>${campo('iny', `Aire que sale (rejilla) ${UT}`, { tipo: 't', neg: true })}</div></div>
    <div id="res"></div>
    <div class="nota">Mide el aire que entra por los filtros y el que sale por la rejilla, con el equipo 10–15 min en frío y ventilador alto.</div>
    <h3>Cómo leerlo (modo frío)</h3>
    <ul><li><b>8–12 °C (14–22 °F):</b> normal.</li>
    <li><b>Menos de 8 °C:</b> enfría poco: falta de gas, compresor débil, condensadora sucia o cuarto muy húmedo.</li>
    <li><b>Más de 12 °C:</b> pasa poco aire: filtros o turbina sucios, velocidad baja o serpentín tapado. Riesgo de que se congele.</li></ul>
    <p class="muted">Con mucha humedad (costa) la diferencia sale más baja aunque el equipo esté bien.</p>`;
  const calc = () => {
    const r = val('ret'), i = val('iny');
    if (!Number.isFinite(r) || !Number.isFinite(i)) { $('#res').innerHTML = ''; return; }
    const d = aC(r, cfg.tu) - aC(i, cfg.tu);
    let cls, txt;
    if (d < 6) [cls, txt] = ['bad', 'Muy baja: el equipo casi no enfría. Revisa que el compresor trabaje, la carga de gas y la condensadora.'];
    else if (d < 8) [cls, txt] = ['warn', 'Algo baja: posible falta de gas, condensadora sucia o mucha humedad.'];
    else if (d <= 12) [cls, txt] = ['ok', 'Normal.'];
    else if (d <= 14) [cls, txt] = ['warn', 'Algo alta: revisa filtros, turbina y velocidad del ventilador.'];
    else [cls, txt] = ['bad', 'Muy alta: pasa muy poco aire. Lava filtros y turbina; riesgo de congelamiento.'];
    $('#res').innerHTML = resultado(cls, `ΔT = ${fmt(dA(d, cfg.tu))} ${tU(cfg.tu)}`, `<b>${txt}</b>`);
  };
  bindUnidades(calc);
  ligarAmb('ret', 'tc');
  onInputs(calc);
  return 'Temperatura del aire';
};

// ---------- Carga por metro extra ----------
VISTAS.carga = () => {
  let diam = '1/4"';
  let gas = GASES_TRABAJO.includes(cfg.gas) ? cfg.gas : 'R410A';
  app.innerHTML = `${gasSeg(GASES_TRABAJO, gas)}
    <label>Diámetro de la línea de líquido (tubo delgado)</label>${seg('diam', [['1/4"', '1/4"'], ['3/8"', '3/8"']], diam)}
    <div class="row"><div>${campo('lt', 'Tubería total (m)', { ph: 'Ej. 8' })}</div><div>${campo('lp', 'Precargada (m)', { valor: 5 })}</div></div>
    ${campo('gm', 'Gramos por metro extra')}
    <div id="res"></div>
    <div class="nota">La placa o el manual dicen cuántos metros trae precargados y cuántos gramos por metro extra. Si no lo encuentras, el valor sugerido es el típico de marcas comunes (Midea, Mirage y parecidas).</div>
    <p class="muted">1 pie = 0.3048 m. Si la tubería es más corta que la precarga, no se le quita gas.</p>`;
  const sugerido = () => { $('#gm').value = GRAMOS_METRO[diam][gas]; };
  const calc = () => {
    const lt = val('lt'), lp = val('lp'), gm = val('gm');
    if (![lt, lp, gm].every(Number.isFinite)) { $('#res').innerHTML = ''; return; }
    const extra = lt - lp;
    $('#res').innerHTML = extra <= 0
      ? resultado('ok', 'No se agrega gas', `La tubería (${fmt(lt)} m) no pasa de la precarga (${fmt(lp)} m).`)
      : resultado('', `${fmt(extra * gm, 0)} g`, `${fmt(extra)} m extra × ${fmt(gm)} g/m · ${fmt(extra * gm / 28.3495)} oz · ${fmt(extra * gm / 1000, 3)} kg`);
  };
  bindSeg('gas', v => { gas = v; cfg.gas = v; saveCfg(); sugerido(); calc(); });
  bindSeg('diam', v => { diam = v; sugerido(); calc(); });
  sugerido(); onInputs(calc);
  return 'Carga por metro extra';
};

// ---------- Capacitores ----------
VISTAS.cap = () => {
  let tol = 6;
  app.innerHTML = `<h2>¿Está bueno el capacitor?</h2>
    <div class="row"><div>${campo('nom', 'Valor de la etiqueta (µF)', { ph: 'Ej. 35' })}</div><div>${campo('med', 'Lo que mide (µF)', { ph: 'Ej. 33.5' })}</div></div>
    <label>Tolerancia (viene impresa)</label>${seg('tol', [[5, '±5%'], [6, '±6%'], [10, '±10%']], tol)}
    <div id="res1"></div>
    <h2>Calcular µF con el equipo trabajando</h2>
    <p class="muted">Mide el amperaje en el cable del devanado de arranque (el que va del capacitor al compresor o motor) y el voltaje entre las terminales del capacitor. Fórmula para 60 Hz: µF = 2652 × A ÷ V.</p>
    <div class="row"><div>${campo('amp', 'Amperes (A)')}</div><div>${campo('vol', 'Voltaje en el capacitor (V)')}</div></div>
    <div id="res2"></div>
    <div class="alerta">Descarga el capacitor con una resistencia antes de tocarlo. Un capacitor inflado o escurriendo se cambia aunque mida bien.</div>`;
  const calc = () => {
    const n = val('nom'), m = val('med');
    if (Number.isFinite(n) && Number.isFinite(m) && n > 0) {
      const min = n * (1 - tol / 100), max = n * (1 + tol / 100), dif = (m - n) / n * 100;
      $('#res1').innerHTML = m < min
        ? resultado('bad', 'Bajo: cámbialo', `Mínimo aceptable ${fmt(min, 2)} µF · está ${fmt(dif)}%`)
        : m > max ? resultado('warn', 'Alto: revísalo', `Máximo aceptable ${fmt(max, 2)} µF · está +${fmt(dif)}%`)
        : resultado('ok', 'Bueno', `Rango aceptable ${fmt(min, 2)}–${fmt(max, 2)} µF · está ${dif >= 0 ? '+' : ''}${fmt(dif)}%`);
    } else $('#res1').innerHTML = '';
    const a = val('amp'), v = val('vol');
    $('#res2').innerHTML = Number.isFinite(a) && Number.isFinite(v) && v > 0
      ? resultado('', `${fmt(2652 * a / v)} µF`, 'Compáralo con la etiqueta. Si es mucho menor, el capacitor está débil.') : '';
  };
  bindSeg('tol', v => { tol = +v; calc(); });
  onInputs(calc);
  return 'Capacitores';
};

// ---------- Terminales del compresor ----------
VISTAS.comp = () => {
  let tipo = 'mono';
  app.innerHTML = `${seg('tipo', [['mono', 'Monofásico (C-S-R)'], ['inv', 'Inverter (U-V-W)']], tipo)}
    <p class="muted" id="ayuda"></p>
    ${campo('r12', 'Entre terminal 1 y 2 (Ω)')}${campo('r13', 'Entre terminal 1 y 3 (Ω)')}${campo('r23', 'Entre terminal 2 y 3 (Ω)')}
    <div id="res"></div>
    <div class="nota">Con el equipo desconectado y los cables quitados. Si marca OL entre dos terminales, hay un devanado abierto o el protector térmico abrió (espera a que enfríe). Mide también de cada terminal a la carcasa: cualquier lectura ahí es mala señal.</div>`;
  const ayuda = () => $('#ayuda').textContent = tipo === 'mono'
    ? 'Numera las terminales 1, 2 y 3 como quieras y mide entre cada par. La app te dice cuál es cuál.'
    : 'En el compresor inverter las tres lecturas deben ser iguales y bajas (casi siempre menos de 5 Ω).';
  const calc = () => {
    const r = { '12': val('r12'), '13': val('r13'), '23': val('r23') };
    const vals = Object.values(r);
    if (!vals.every(Number.isFinite)) { $('#res').innerHTML = ''; return; }
    if (vals.some(v => v <= 0.05)) { $('#res').innerHTML = resultado('bad', 'Posible corto', 'Una lectura en cero indica devanado en corto (o puntas mal puestas).'); return; }
    if (tipo === 'inv') {
      const max = Math.max(...vals), min = Math.min(...vals), dif = (max - min) / min * 100;
      $('#res').innerHTML = dif <= 10
        ? resultado('ok', 'Devanados parejos', `Diferencia ${fmt(dif)}%. Los devanados se ven bien. Si no arranca, revisa la tarjeta o el módulo IPM.`)
        : resultado('bad', 'Devanados disparejos', `Diferencia ${fmt(dif)}%. Un devanado está dañado.`);
      return;
    }
    const [parMax] = Object.entries(r).sort((a, b) => b[1] - a[1])[0];
    const C = ['1', '2', '3'].find(t => !parMax.includes(t));
    const rc = t => r[[C, t].sort().join('')];
    const [R, S] = ['1', '2', '3'].filter(t => t !== C).sort((a, b) => rc(a) - rc(b));
    const suma = rc(R) + rc(S), rs = r[parMax], dif = Math.abs(rs - suma) / rs * 100;
    $('#res').innerHTML = resultado(dif <= 15 ? 'ok' : 'warn',
      `C = ${C} · R = ${R} · S = ${S}`,
      `Común: terminal ${C}. Marcha (R): terminal ${R} (${fmt(rc(R), 2)} Ω). Arranque (S): terminal ${S} (${fmt(rc(S), 2)} Ω).<br>
       R-S = ${fmt(rs, 2)} Ω y C-R + C-S = ${fmt(suma, 2)} Ω → ${dif <= 15 ? '<b>cuadra, los devanados se ven bien.</b>' : '<b>no cuadra: revisa las mediciones o hay un devanado dañado.</b>'}`);
  };
  bindSeg('tipo', v => { tipo = v; ayuda(); calc(); });
  ayuda(); onInputs(calc);
  return 'Terminales del compresor';
};

// ---------- Sensores (termistores NTC) ----------
VISTAS.sensor = () => {
  let r25 = store.get('ntc_r25', 10), beta = store.get('ntc_b', 3950);
  app.innerHTML = `<p class="muted">Desconecta el sensor de la tarjeta y mide su resistencia. Compárala con la temperatura real del lugar donde está (mídela con tu termómetro).</p>
    <label>Valor del sensor a 25 °C</label>${seg('r25', [[5, '5k'], [10, '10k'], [15, '15k'], [20, '20k'], [50, '50k']], r25)}
    <label>Constante B</label>${seg('beta', [[3380, '3380'], [3435, '3435'], [3950, '3950']], beta)}
    <p class="muted">El valor a 25 °C y la B vienen en el manual de servicio. Si no sabes la B, deja 3950: cerca de 25 °C casi no cambia, pero lejos de 25 °C la diferencia entre valores de B puede ser de 10–15%.</p>
    ${tuSeg()}
    <div class="row"><div>${campo('rm', 'Resistencia medida (kΩ)')}</div><div>${campo('tr', `Temperatura real ${UT}`, { tipo: 't', neg: true })}</div></div>
    <div id="res"></div>
    <p class="muted">Si marca OL, el sensor está abierto (o el cable roto). Si marca casi 0, está en corto.</p>
    <h3>Tabla del sensor</h3><div class="card" id="tabla"></div>`;
  const R = tC => r25 * Math.exp(beta * (1 / (tC + 273.15) - 1 / 298.15));
  const T = rk => 1 / (1 / 298.15 + Math.log(rk / r25) / beta) - 273.15;
  const kohm = x => fmt(x, x < 10 ? 2 : 1);
  const calc = () => {
    const rm = val('rm'), tr = val('tr');
    if (!Number.isFinite(rm)) $('#res').innerHTML = '';
    else if (rm <= 0.05) $('#res').innerHTML = resultado('bad', 'En corto', 'Una lectura de casi 0 kΩ indica sensor en corto.');
    else {
      const tEq = T(rm);
      if (Number.isFinite(tr)) {
        const esperado = R(aC(tr, cfg.tu)), dif = (rm - esperado) / esperado * 100;
        const cls = Math.abs(dif) <= 10 ? 'ok' : Math.abs(dif) <= 25 ? 'warn' : 'bad';
        const big = cls === 'ok' ? 'Sensor bien' : cls === 'warn' ? 'Revísalo' : 'Sensor dañado o de otro valor';
        $('#res').innerHTML = resultado(cls, big, `A ${fmt(tr)} ${tU(cfg.tu)} debería marcar unos ${kohm(esperado)} kΩ; mide ${dif >= 0 ? '+' : ''}${fmt(dif, 0)}%.<br>Esa resistencia equivale a ${fmt(tA(tEq, cfg.tu))} ${tU(cfg.tu)}.`);
      } else $('#res').innerHTML = resultado('', `${fmt(tA(tEq, cfg.tu))} ${tU(cfg.tu)}`, 'Temperatura que indica esa resistencia.');
    }
    const temps = [-10, 0, 10, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100];
    $('#tabla').innerHTML = `<table><tr><th>${tU(cfg.tu)}</th><th class="num">kΩ</th></tr>${temps.map(t => `<tr><td>${fmt(tA(t, cfg.tu), 0)}</td><td class="num">${kohm(R(t))}</td></tr>`).join('')}</table>`;
  };
  bindSeg('r25', v => { r25 = +v; store.set('ntc_r25', r25); calc(); });
  bindSeg('beta', v => { beta = +v; store.set('ntc_b', beta); calc(); });
  bindUnidades(calc);
  onInputs(calc);
  return 'Sensores';
};

// ---------- Cable y breaker ----------
const CABLES = [ // cobre, columna de 60 °C; r = resistencia aproximada en Ω/km
  { c: '14 AWG', mm: 2.08, a: 15, r: 10.2 },
  { c: '12 AWG', mm: 3.31, a: 20, r: 6.4 },
  { c: '10 AWG', mm: 5.26, a: 30, r: 4.0 },
  { c: '8 AWG', mm: 8.37, a: 40, r: 2.5 },
  { c: '6 AWG', mm: 13.3, a: 55, r: 1.6 },
];
const BREAKERS = [15, 20, 25, 30, 35, 40, 45, 50, 60];

VISTAS.cable = () => {
  let volt = store.get('cable_v', 220);
  app.innerHTML = `<p class="muted">Busca en la placa de la condensadora o del equipo de ventana: <b>MCA</b> (Min. Circuit Ampacity) y <b>MOP</b> o <b>MOCP</b> (Max. Overcurrent Protection).</p>
    <div class="row"><div>${campo('mca', 'MCA (A)')}</div><div>${campo('mop', 'MOP (A)')}</div></div>
    <details><summary>¿La placa no trae MCA?</summary>
      <p class="muted">MCA = 1.25 × RLA del compresor + FLA de los ventiladores.</p>
      <div class="row"><div>${campo('rla', 'RLA (A)')}</div><div>${campo('fla', 'FLA (A)')}</div></div>
    </details>
    <label>Voltaje</label>${seg('volt', [[127, '127 V'], [220, '220 V']], volt)}
    ${campo('dist', 'Distancia del tablero al equipo (m)', { ph: 'Ej. 15' })}
    <div id="res"></div>
    <div class="nota">Cable de cobre THW o THHN, con la capacidad de la columna de 60 °C (NOM-001-SEDE). Si el manual del equipo pide otra cosa, manda el manual.</div>`;
  const calc = () => {
    let mca = val('mca'), calculado = false;
    if (!Number.isFinite(mca)) {
      const rla = val('rla'), fla = val('fla');
      if (Number.isFinite(rla)) { mca = 1.25 * rla + (Number.isFinite(fla) ? fla : 0); calculado = true; }
    }
    if (!Number.isFinite(mca) || mca <= 0) { $('#res').innerHTML = '<p class="muted">Escribe el MCA de la placa (o el RLA y el FLA).</p>'; return; }
    const mop = val('mop');
    if (Number.isFinite(mop) && mop < mca) { $('#res').innerHTML = resultado('warn', 'Revisa los datos', 'El MOP no puede ser menor que el MCA.'); return; }
    let i = CABLES.findIndex(k => k.a >= mca);
    if (i < 0) { $('#res').innerHTML = resultado('warn', 'Más de 55 A', 'Es un circuito grande: consulta a un electricista.'); return; }
    const porAmperaje = i;
    const dist = val('dist');
    let caida = null;
    if (Number.isFinite(dist) && dist > 0) {
      const corriente = mca / 1.25; // corriente aproximada de trabajo
      const pct = k => 2 * dist * corriente * k.r / 1000 / volt * 100;
      while (i < CABLES.length - 1 && pct(CABLES[i]) > 3) i++;
      caida = pct(CABLES[i]);
    }
    const k = CABLES[i];
    let brk = BREAKERS.find(b => b >= mca) ?? BREAKERS[BREAKERS.length - 1];
    if (Number.isFinite(mop) && brk > mop) brk = [...BREAKERS].reverse().find(b => b <= mop) ?? mop;
    // Tierra según el breaker; si el cable se subió de calibre por distancia, la tierra sube igual
    const tierra = CABLES[Math.min((brk <= 15 ? 0 : brk <= 20 ? 1 : 2) + (i - porAmperaje), i)];
    $('#res').innerHTML =
      resultado('ok', `Cable ${k.c}`, `${fmt(k.mm, 2)} mm² de cobre · aguanta ${k.a} A (MCA ${fmt(mca, 1)} A${calculado ? ', calculado' : ''})` +
        (caida != null ? `<br>Caída de voltaje estimada: ${fmt(caida, 1)}% en ${fmt(dist)} m${i > porAmperaje ? '. <b>Se subió de calibre por la distancia.</b>' : '.'}` : '')) +
      resultado('', `Breaker ${brk} A`, Number.isFinite(mop)
        ? `Máximo permitido por la placa (MOP): ${fmt(mop)} A. Si se bota al arrancar, revisa primero el capacitor y el voltaje.`
        : 'Sin el MOP no se sabe el máximo permitido: búscalo en la placa o el manual.') +
      `<div class="card">Tierra física: <b>${tierra.c}</b> de cobre.</div>`;
  };
  bindSeg('volt', v => { volt = +v; store.set('cable_v', volt); calc(); });
  onInputs(calc);
  return 'Cable y breaker';
};

// ---------- Vacío y cronómetro (sigue corriendo aunque cambies de pantalla) ----------
const vacio = {
  estado: () => store.get('vacio', null), // { fin, min, ini, avisado }
  guardar: v => store.set('vacio', v),
  reloj: null,
  vigilar() {
    clearInterval(this.reloj);
    const v = this.estado();
    if (!v || v.avisado) return;
    if (Date.now() - v.fin > 30 * 60e3) { v.avisado = true; this.guardar(v); return; } // prueba vieja: sin alarma
    this.reloj = setInterval(() => {
      const v = this.estado();
      if (!v || v.avisado) { clearInterval(this.reloj); return; }
      if (Date.now() >= v.fin) {
        v.avisado = true; this.guardar(v); clearInterval(this.reloj);
        pantalla.soltar(); alarma();
        if (location.hash.startsWith('#vacio')) render();
        else aviso('Terminó la prueba de vacío.', 'Ver', () => ir('vacio'));
      }
    }, 500);
  },
};
vacio.vigilar();
document.addEventListener('visibilitychange', () => {
  const v = vacio.estado();
  if (document.visibilityState === 'visible' && v && !v.avisado && Date.now() < v.fin) pantalla.pedir();
});

VISTAS.vacio = () => {
  let v = vacio.estado();
  const corriendo = v && !v.avisado && Date.now() < v.fin;
  const terminado = v && (v.avisado || Date.now() >= v.fin);
  let min = v?.min || 15;
  app.innerHTML = `<div class="card"><b>Meta:</b> 500 micrones o menos. Luego cierra la válvula hacia la bomba y empieza la prueba.</div>
    <label>Tiempo de la prueba de retención</label>${seg('min', [[10, '10 min'], [15, '15 min'], [20, '20 min']], min)}
    ${campo('ini', 'Micrones al cerrar la válvula', { ph: 'Ej. 450', valor: v?.ini ?? '' })}
    <div class="timer" id="reloj"></div>
    <button class="btn" id="go"></button>
    <div id="final" class="${terminado ? '' : 'hidden'}">${campo('fin', 'Micrones al terminar')}</div>
    <div id="res"></div>
    <p class="muted">La pantalla se queda encendida mientras corre. Puedes ir a otra herramienta: cuando termine suena y vibra.</p>
    <h3>Cómo leer el resultado</h3>
    <ul><li>Sube poco y se queda abajo de 1000 micrones: <b>bien</b>.</li>
    <li>Sube y se estabiliza alto: <b>humedad</b>. Sigue haciendo vacío.</li>
    <li>Sube y sigue subiendo sin parar: <b>fuga</b>. Presuriza con nitrógeno y busca.</li></ul>`;
  const pinta = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); $('#reloj').textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
  const boton = () => { const c = vacio.estado(); $('#go').textContent = c && !c.avisado && Date.now() < c.fin ? '■ Detener' : terminado ? '↻ Nueva prueba' : '▶ Iniciar prueba'; };
  const calc = () => {
    const i = val('ini'), f = val('fin');
    if (!Number.isFinite(f)) { $('#res').innerHTML = ''; return; }
    const sube = Number.isFinite(i) ? ` Subió ${fmt(f - i, 0)} micrones.` : '';
    $('#res').innerHTML = f <= 1000
      ? resultado('ok', 'Pasó la prueba', `Terminó en ${fmt(f, 0)} micrones.${sube} Puedes abrir las válvulas o cargar.`)
      : resultado('warn', 'No pasó', `Terminó en ${fmt(f, 0)} micrones.${sube} Observa 2–3 min más: si sigue subiendo es <b>fuga</b>; si se detuvo es <b>humedad</b> y hay que seguir con el vacío.`);
  };
  bindSeg('min', m => { if (vacio.estado() && !vacio.estado().avisado) return; min = +m; pinta(min * 60000); });
  $('#ini').addEventListener('input', () => { const c = vacio.estado(); if (c) { c.ini = $('#ini').value; vacio.guardar(c); } });
  $('#go').onclick = () => {
    const c = vacio.estado();
    if (c && !c.avisado && Date.now() < c.fin) { vacio.guardar(null); pantalla.soltar(); }
    else if (terminado) vacio.guardar(null);
    else { vacio.guardar({ fin: Date.now() + min * 60000, min, ini: $('#ini').value, avisado: false }); vacio.vigilar(); pantalla.pedir(); }
    render();
  };
  $('#fin').addEventListener('input', calc);
  boton();
  if (corriendo) {
    pantalla.pedir();
    const tick = setInterval(() => pinta(v.fin - Date.now()), 250);
    alSalir(() => clearInterval(tick));
    pinta(v.fin - Date.now());
  } else pinta(terminado ? 0 : min * 60000);
  return 'Vacío';
};

// ---------- Nivel (usa el sensor de movimiento del teléfono) ----------
VISTAS.nivel = () => {
  const cal = Object.assign({ canto: 0, x: 0, y: 0 }, store.get('nivel_cal', {}));
  app.innerHTML = `<p class="muted" id="modo" style="text-align:center">Esperando el sensor…</p>
    <div class="nivel-giro" id="giro"><div id="caja"></div><div class="nivel-valor" id="valor">—</div><p id="lado"></p></div>
    <p class="muted" style="text-align:center" id="mm"></p>
    <div id="sinSensor" class="alerta hidden">No se detecta el sensor de movimiento. Esta herramienta necesita abrir la app en el teléfono.</div>
    <button class="btn sec hidden" id="permiso">Permitir el sensor</button>
    <div class="row"><button class="btn sec" id="cal">🎯 Calibrar</button><button class="btn sec" id="quitarCal">Quitar calibración</button></div>
    <div class="nota">Apoya el canto del teléfono sobre la placa de montaje, o acuéstalo sobre la evaporadora. La evaporadora va nivelada o con una caída ligera hacia el lado del drenaje. El equipo de ventana va unos 6 mm más bajo hacia afuera.</div>
    <p class="muted">Para calibrar, pon el teléfono sobre una superficie que sepas que está nivelada y toca "Calibrar".</p>`;
  let g = null, modo = null, crudo = null;
  const onMotion = e => {
    const a = e.accelerationIncludingGravity;
    if (!a || a.x == null) return;
    const n = [a.x, a.y, a.z];
    g = g ? g.map((v, i) => v + (n[i] - v) * 0.2) : n;
  };
  window.addEventListener('devicemotion', onMotion);
  const rad = 180 / Math.PI;
  const dibuja = () => {
    if (!g) return;
    const [x, y, z] = g, m = Math.hypot(x, y, z);
    if (m < 5) return;
    if (Math.abs(z) / m > 0.82) { // teléfono acostado
      const rx = Math.asin(Math.max(-1, Math.min(1, x / m))) * rad, ry = Math.asin(Math.max(-1, Math.min(1, y / m))) * rad;
      crudo = { modo: 'plano', x: rx, y: ry };
      const ax = rx - cal.x, ay = ry - cal.y;
      if (modo !== 'plano') {
        modo = 'plano';
        $('#caja').innerHTML = '<div class="nivel-circulo"><div class="burbuja" id="burbuja"></div></div>';
        $('#modo').textContent = 'Teléfono acostado';
        $('#giro').style.transform = '';
      }
      const k = v => Math.max(-1, Math.min(1, v / 10)) * 4.5;
      $('#burbuja').style.transform = `translate(${k(ax)}rem, ${-k(ay)}rem)`;
      const peor = Math.max(Math.abs(ax), Math.abs(ay)), bien = peor < 0.3;
      $('#valor').textContent = `${fmt(peor, 1)}°`;
      $('#valor').classList.toggle('ok', bien);
      $('#lado').textContent = bien ? '✔ Nivelado' : `Lados: ${fmt(Math.abs(ax), 1)}° · Frente-atrás: ${fmt(Math.abs(ay), 1)}°`;
      $('#mm').textContent = bien ? '' : `≈ ${fmt(Math.tan(peor / rad) * 1000, 0)} mm por metro`;
    } else { // teléfono de canto
      const phi = Math.atan2(x, y) * rad, base = Math.round(phi / 90) * 90;
      crudo = { modo: 'canto', d: phi - base };
      const d = phi - base - cal.canto, bien = Math.abs(d) < 0.3;
      if (modo !== 'canto') {
        modo = 'canto';
        $('#caja').innerHTML = '<div class="nivel-tubo"><div class="burbuja" id="burbuja"></div></div>';
        $('#modo').textContent = 'Teléfono de canto';
      }
      $('#giro').style.transform = `rotate(${base}deg)`;
      $('#burbuja').style.transform = `translateX(${Math.max(-1, Math.min(1, d / 5)) * 7.5}rem)`;
      $('#valor').textContent = `${fmt(Math.abs(d), 1)}°`;
      $('#valor').classList.toggle('ok', bien);
      $('#lado').textContent = bien ? '✔ Nivelado' : d < 0 ? '← Más alto el lado izquierdo' : 'Más alto el lado derecho →';
      $('#mm').textContent = bien ? '' : `≈ ${fmt(Math.tan(Math.abs(d) / rad) * 1000, 0)} mm por metro`;
    }
  };
  const t = setInterval(dibuja, 100);
  const aviso2s = setTimeout(() => { if (!g) $('#sinSensor').classList.remove('hidden'); }, 2000);
  if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
    $('#permiso').classList.remove('hidden');
    $('#permiso').onclick = () => DeviceMotionEvent.requestPermission().catch(() => {});
  }
  $('#cal').onclick = () => {
    if (!crudo) return;
    if (crudo.modo === 'plano') { cal.x = crudo.x; cal.y = crudo.y; } else cal.canto = crudo.d;
    store.set('nivel_cal', cal);
  };
  $('#quitarCal').onclick = () => { cal.canto = cal.x = cal.y = 0; store.set('nivel_cal', cal); };
  pantalla.pedir();
  alSalir(() => { window.removeEventListener('devicemotion', onMotion); clearInterval(t); clearTimeout(aviso2s); pantalla.soltar(); });
  return 'Nivel';
};

// ---------- Cálculo de BTU ----------
VISTAS.btu = () => {
  let clima = 650, sol = 1;
  app.innerHTML = `<div class="row"><div>${campo('largo', 'Largo (m)')}</div><div>${campo('ancho', 'Ancho (m)')}</div></div>
    <div class="row"><div>${campo('alto', 'Altura (m)', { valor: 2.5 })}</div><div>${campo('pers', 'Personas', { valor: 2, modo: 'numeric' })}</div></div>
    <label>Clima</label>${seg('clima', [[450, 'Templado'], [650, 'Caluroso'], [800, 'Muy caluroso / costa']], clima)}
    <label>Sol</label>${seg('sol', [[0.9, 'Sombra'], [1, 'Normal'], [1.15, 'Mucho sol / último piso']], sol)}
    <label class="chk"><input type="checkbox" id="coc"><span>Es cocina o tiene muchos aparatos (computadoras, TV grande)</span></label>
    <div id="res"></div>
    <p class="muted">Cálculo rápido y orientativo. Cuartos con mucho vidrio, techo de lámina o sin aislamiento pueden necesitar más.</p>`;
  const calc = () => {
    const l = val('largo'), a = val('ancho'), h = val('alto') || 2.5, p = Math.max(0, val('pers') || 0);
    if (!Number.isFinite(l) || !Number.isFinite(a)) { $('#res').innerHTML = ''; return; }
    const area = l * a;
    const btu = area * clima * (h / 2.5) * sol + Math.max(0, p - 2) * 600 + ($('#coc').checked ? 3000 : 0);
    const tam = [9000, 12000, 18000, 24000, 30000, 36000].find(x => x >= btu * 0.95);
    $('#res').innerHTML = resultado('', `${fmt(Math.round(btu / 100) * 100, 0)} BTU/h`,
      `${fmt(area)} m² · ${fmt(btu / 12000, 2)} TR<br>` + (tam
        ? `<b>Equipo recomendado: ${fmt(tam, 0)} BTU (${fmt(tam / 12000, 2)} TR)</b>`
        : '<b>Más de 3 TR: conviene dividir en dos equipos o hacer un cálculo más detallado.</b>'));
  };
  bindSeg('clima', v => { clima = +v; calc(); });
  bindSeg('sol', v => { sol = +v; calc(); });
  onInputs(calc);
  $('#coc').addEventListener('change', calc);
  return 'Cálculo de BTU';
};

// ---------- Conversiones ----------
VISTAS.conv = () => {
  const CAT = {
    cap: { n: 'Capacidad', u: { 'BTU/h': 1, 'TR (toneladas)': 12000, kW: 3412.14, W: 3.41214, 'kcal/h': 3.96832 } },
    pre: { n: 'Presión', u: { psi: 1, bar: 14.5038, kPa: 0.145038, MPa: 145.038, 'kg/cm²': 14.2233 } },
    tem: { n: 'Temperatura', u: { '°C': 0, '°F': 0, K: 0 } },
    lon: { n: 'Longitud', u: { m: 1, cm: 0.01, pulgada: 0.0254, pie: 0.3048 } },
    pes: { n: 'Peso', u: { kg: 1, g: 0.001, lb: 0.453592, oz: 0.0283495 } },
    vac: { n: 'Vacío', u: { micrones: 1, Pa: 7.50062, mbar: 750.062, 'mmHg (Torr)': 1000 } },
  };
  let cat = store.get('conv_cat', 'cap');
  if (!CAT[cat]) cat = 'cap';
  app.innerHTML = `${seg('cat', Object.entries(CAT).map(([k, c]) => [k, c.n]), cat)}
    <div class="row"><div>${campo('v', 'Valor', { valor: 1, neg: true })}</div><div><label for="u">Unidad</label><select id="u"></select></div></div>
    <div id="res" class="card"></div>`;
  const unidades = () => { $('#u').innerHTML = Object.keys(CAT[cat].u).map(u => `<option>${esc(u)}</option>`).join(''); };
  const calc = () => {
    const v = val('v'), u = $('#u').value, c = CAT[cat];
    if (!Number.isFinite(v)) { $('#res').innerHTML = '<span class="muted">Escribe un valor.</span>'; return; }
    let filas;
    if (cat === 'tem') {
      const C = u === '°C' ? v : u === '°F' ? (v - 32) / 1.8 : v - 273.15;
      filas = [['°C', C], ['°F', C * 1.8 + 32], ['K', C + 273.15]];
    } else {
      const base = v * c.u[u];
      filas = Object.entries(c.u).map(([k, f]) => [k, base / f]);
    }
    $('#res').innerHTML = `<table>${filas.map(([k, x]) => `<tr><td>${esc(k)}</td><td class="num"><b>${fmt(x, Math.abs(x) < 1 ? 4 : 2)}</b></td></tr>`).join('')}</table>
      ${cat === 'tem' ? '<p class="muted">Ojo: una <b>diferencia</b> de temperatura (como el SH) se convierte multiplicando por 1.8, sin sumar 32.</p>' : ''}`;
  };
  bindSeg('cat', v => { cat = v; store.set('conv_cat', v); unidades(); calc(); });
  unidades(); onInputs(calc);
  return 'Conversiones';
};

// ---------- Tablas de referencia ----------
VISTAS.tablas = () => {
  app.innerHTML = `<h2>Presiones típicas de trabajo</h2>
    <div class="card"><table><tr><th>Gas</th><th>Baja</th><th>Alta</th></tr>${PRESIONES.map(r => `<tr><td><span class="pill ${r.gas}">${r.gas}</span></td><td>${r.baja}</td><td>${r.alta}</td></tr>`).join('')}</table>
    <p class="muted">Con ~35 °C afuera, cuarto a 24–27 °C y equipo estable. Cambian con el clima: para comparar con las temperaturas del día usa <a href="#diag">Diagnóstico por presiones</a>. El R290 es muy inflamable (A3).</p></div>
    <h2>Torque de tuercas flare</h2>
    <div class="card"><table><tr><th>Tubo</th><th>N·m</th><th>lb·pie</th></tr>${TORQUE.map(r => `<tr><td><b>${r.tubo}</b></td><td>${r.nm}</td><td>${r.ftlb}</td></tr>`).join('')}</table>
    <p class="muted">Valores típicos de fabricantes. Si el manual trae otro, manda el manual.</p></div>
    <h2>Tubería de minisplit</h2>
    <div class="card"><table><tr><th>Capacidad</th><th>Líquido</th><th>Gas</th></tr>${TUBERIA.map(r => `<tr><td>${r.cap}</td><td>${r.liq}</td><td>${r.gas}</td></tr>`).join('')}</table>
    <p class="muted">Diámetros más comunes. Cada marca puede variar: confirma con las válvulas de la condensadora.</p></div>
    <h2>Cable de cobre (60 °C)</h2>
    <div class="card"><table><tr><th>Calibre</th><th>mm²</th><th class="num">Amperes</th></tr>${CABLES.map(k => `<tr><td><b>${k.c}</b></td><td>${fmt(k.mm, 2)}</td><td class="num">${k.a} A</td></tr>`).join('')}</table>
    <p class="muted">Para elegir cable y breaker con la placa usa <a href="#cable">Cable y breaker</a>.</p></div>
    <h2>Equivalencias rápidas</h2>
    <div class="card"><table>
      <tr><td>1 TR (tonelada)</td><td>12 000 BTU/h · 3.52 kW</td></tr>
      <tr><td>1 kW</td><td>3412 BTU/h</td></tr>
      <tr><td>1 bar</td><td>14.5 psi · 100 kPa</td></tr>
      <tr><td>1 kg</td><td>2.2 lb · 35.3 oz</td></tr>
      <tr><td>Diferencia de 1 °C</td><td>diferencia de 1.8 °F</td></tr>
    </table></div>`;
  return 'Tablas de referencia';
};

// ---------- Listas de revisión ----------
VISTAS.listas = () => {
  app.innerHTML = LISTAS.map(l => {
    const hechos = store.get('lista_' + l.id, []).length;
    return `<a class="item" href="#lista/${l.id}"><span class="ico">✅</span><span class="grow">${l.t}<span class="sub">${hechos} de ${l.items.length} marcados</span></span>›</a>`;
  }).join('');
  return 'Listas de revisión';
};

VISTAS.lista = id => {
  const l = LISTAS.find(x => x.id === id);
  if (!l) { ir('listas', true); return; }
  const key = 'lista_' + l.id;
  const pinta = () => {
    const hechos = new Set(store.get(key, []));
    app.innerHTML = `<div class="bar"><i style="width:${hechos.size / l.items.length * 100}%"></i></div>
      <p class="muted">${hechos.size} de ${l.items.length}</p>
      ${l.items.map((t, i) => `<label class="chk ${hechos.has(i) ? 'done' : ''}"><input type="checkbox" data-i="${i}" ${hechos.has(i) ? 'checked' : ''}><span>${t}</span></label>`).join('')}
      <button class="btn sec" id="reset">Empezar de nuevo</button>`;
    $$('input[data-i]').forEach(c => c.onchange = () => {
      const s = new Set(store.get(key, []));
      c.checked ? s.add(+c.dataset.i) : s.delete(+c.dataset.i);
      store.set(key, [...s]); pinta();
    });
    $('#reset').onclick = () => { store.set(key, []); pinta(); };
  };
  pinta();
  return l.t;
};
