// RefriGuía — núcleo: almacenamiento, unidades, tabla P-T, piezas de interfaz, navegación, ajustes y búsqueda.
// Las pantallas viven en herramientas.js, aprender.js y bitacora.js (se agregan a VISTAS).
'use strict';

const VERSION = '3.1';
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const app = $('#app');
const GASES = ['R22', 'R410A', 'R32', 'R290'];
const GASES_TRABAJO = ['R22', 'R410A', 'R32'];

// ---------- Almacenamiento local (todo se guarda en el teléfono) ----------
const store = {
  get(k, def) { try { const v = localStorage.getItem(k); return v == null ? def : JSON.parse(v); } catch { return def; } },
  set(k, v) {
    try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); return true; }
    catch { alert('No se pudo guardar. Revisa el espacio del teléfono.'); return false; }
  },
};
const cfg = Object.assign({ gas: 'R410A', tu: 'C', pu: 'psi', tema: 'auto', letra: 'normal', pais: 'CU', alt: 0 }, store.get('cfg', {}));
if (!GASES.includes(cfg.gas)) cfg.gas = 'R410A';
const saveCfg = () => store.set('cfg', cfg);

// Lo que cambia según el país donde se trabaja
const PAISES = {
  CU: { n: 'Cuba', tel: '53', digitos: 8, volts: [110, 220], norma: 'la norma eléctrica cubana', clima: 800, hr: 75 },
  MX: { n: 'México', tel: '52', digitos: 10, volts: [127, 220], norma: 'la NOM-001-SEDE', clima: 650, hr: 50 },
};
const pais = () => PAISES[cfg.pais] || PAISES.CU;

// Temperaturas del lugar (se comparten entre herramientas por 3 horas)
const amb = {
  todo() { const a = store.get('amb', {}); return a.t && Date.now() - a.t < 3 * 3600e3 ? a : {}; },
  poner(k, v) { const a = this.todo(); a[k] = v; a.t = Date.now(); store.set('amb', a); },
};

// ---------- Utilidades ----------
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = v => { v = String(v ?? '').replace(',', '.').trim(); return v === '' ? NaN : Number(v); };
const fmt = (n, d = 1) => Number.isFinite(n) ? n.toLocaleString('es-MX', { maximumFractionDigits: d, minimumFractionDigits: 0 }) : '—';
const dinero = n => '$' + fmt(n, 2);
const hoy = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const fechaBonita = f => f ? new Date(f + 'T12:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
const sumaDias = (f, dias) => { const d = new Date(f + 'T12:00'); d.setDate(d.getDate() + dias); return d.toISOString().slice(0, 10); };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const norm = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
function barajar(a, azar = Math.random) {
  a = [...a];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(azar() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function azarCon(semilla) { // números al azar repetibles (para la pregunta del día)
  return () => { semilla |= 0; semilla = semilla + 0x6D2B79F5 | 0; let t = Math.imul(semilla ^ semilla >>> 15, 1 | semilla); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

// ---------- Unidades ----------
const P_UNI = { psi: 1, bar: 0.0689476, kPa: 6.89476 };
const psiA = (psi, u) => psi * P_UNI[u];
const aPsi = (v, u) => v / P_UNI[u];
const tA = (c, u) => u === 'F' ? c * 1.8 + 32 : c;
const aC = (v, u) => u === 'F' ? (v - 32) / 1.8 : v;
const dA = (dc, u) => u === 'F' ? dc * 1.8 : dc;
const tU = u => u === 'F' ? '°F' : '°C';
const pDec = u => u === 'kPa' ? 0 : u === 'bar' ? 2 : 1;
// Marcas que se reemplazan por la unidad elegida
const UP = '<span class="u-p"></span>';
const UT = '<span class="u-t"></span>';
function pintaUnidades() {
  $$('.u-p').forEach(e => e.textContent = cfg.pu);
  $$('.u-t').forEach(e => e.textContent = tU(cfg.tu));
}
function convierte(tipo, de, a) {
  if (de === a) return;
  $$(`input[data-tipo="${tipo}"]`, app).forEach(i => {
    const v = num(i.value);
    if (!Number.isFinite(v)) return;
    const x = tipo === 'p' ? psiA(aPsi(v, de), a) : tA(aC(v, de), a);
    i.value = String(+x.toFixed(tipo === 'p' ? pDec(a) : 1));
  });
}

// ---------- Tabla presión-temperatura ----------
// PT está en psig a nivel del mar. El manómetro mide contra la presión atmosférica del lugar,
// que baja con la altura: se corrige con la altitud de Ajustes (en Cuba casi no cambia nada).
const ATM_MAR = 14.6959;
const patm = (alt = cfg.alt) => ATM_MAR * Math.pow(1 - 2.25577e-5 * (+alt || 0), 5.25588);
const dAlt = () => ATM_MAR - patm();
function satP(gas, tC) {
  const d = PT[gas], a = d.psig, x = tC - d.tmin;
  if (!(x >= 0 && x <= a.length - 1)) return NaN;
  const i = Math.min(Math.floor(x), a.length - 2);
  return a[i] + (a[i + 1] - a[i]) * (x - i) + dAlt();
}
function satT(gas, psigLocal) {
  const d = PT[gas], a = d.psig, psig = psigLocal - dAlt();
  if (!(psig >= a[0] && psig <= a[a.length - 1])) return NaN;
  for (let i = 0; i < a.length - 1; i++) if (psig <= a[i + 1]) return d.tmin + i + (psig - a[i]) / (a[i + 1] - a[i]);
  return NaN;
}
const rangoPT = gas => { const a = PT[gas].psig, k = dAlt(); return `${fmt(psiA(a[0] + k, cfg.pu), pDec(cfg.pu))}–${fmt(psiA(a[a.length - 1] + k, cfg.pu), pDec(cfg.pu))} ${cfg.pu}`; };

// Bulbo húmedo a partir de temperatura (°C) y humedad relativa (%). Fórmula de Stull (2011), error < 1 °C.
function bulboHumedo(t, hr) {
  hr = Math.min(99, Math.max(5, hr));
  return t * Math.atan(0.151977 * Math.sqrt(hr + 8.313659)) + Math.atan(t + hr) - Math.atan(hr - 1.676331)
    + 0.00391838 * Math.pow(hr, 1.5) * Math.atan(0.023101 * hr) - 4.686035;
}

// ---------- Piezas de interfaz ----------
function seg(name, opts, cur, extraCls = '') {
  return `<div class="seg">${opts.map(([v, l]) =>
    `<button type="button" data-seg="${name}" data-v="${esc(v)}" class="${extraCls ? extraCls + v : ''} ${String(v) === String(cur) ? 'on' : ''}">${l}</button>`).join('')}</div>`;
}
function bindSeg(name, fn) {
  $$(`[data-seg="${name}"]`).forEach(b => b.onclick = () => {
    $$(`[data-seg="${name}"]`).forEach(x => x.classList.toggle('on', x === b));
    fn(b.dataset.v);
  });
}
const gasSeg = (lista = GASES, actual = cfg.gas) => seg('gas', lista.map(g => [g, g]), actual, 'gas-');
const puSeg = () => seg('pu', [['psi', 'psi'], ['bar', 'bar'], ['kPa', 'kPa']], cfg.pu);
const tuSeg = () => seg('tu', [['C', '°C'], ['F', '°F']], cfg.tu);
function bindUnidades(recalc) {
  bindSeg('gas', v => { cfg.gas = v; saveCfg(); recalc(); });
  bindSeg('pu', v => { const de = cfg.pu; cfg.pu = v; saveCfg(); convierte('p', de, v); pintaUnidades(); recalc(); });
  bindSeg('tu', v => { const de = cfg.tu; cfg.tu = v; saveCfg(); convierte('t', de, v); pintaUnidades(); recalc(); });
  pintaUnidades();
}
// Campo numérico. o: { tipo: 'p' | 't' (se convierte al cambiar unidades), neg (botón ±), ph, valor, modo }
function campo(id, label, o = {}) {
  const input = `<input id="${id}" inputmode="${o.modo || 'decimal'}" autocomplete="off"${o.tipo ? ` data-tipo="${o.tipo}"` : ''}${o.ph ? ` placeholder="${esc(o.ph)}"` : ''}${o.valor != null && o.valor !== '' ? ` value="${esc(o.valor)}"` : ''}>`;
  return `<label for="${id}">${label}</label>${o.neg
    ? `<div class="con-signo">${input}<button type="button" class="signo" data-signo="${id}" aria-label="Cambiar signo">±</button></div>`
    : input}`;
}
// Valor guardado de temperatura ambiente, en la unidad actual
const preAmb = k => { const v = amb.todo()[k]; return Number.isFinite(v) ? +tA(v, cfg.tu).toFixed(1) : undefined; };
function ligarAmb(id, k) { const i = $('#' + id); i?.addEventListener('input', () => { const v = num(i.value); if (Number.isFinite(v)) amb.poner(k, aC(v, cfg.tu)); }); }
const resultado = (cls, big, texto) => `<div class="result ${cls}"><div class="big">${big}</div>${texto ? `<div>${texto}</div>` : ''}</div>`;
// Barra de colores con marcador. zonas: [[hasta, 'ok' | 'warn' | 'bad'], ...] empezando en "min"
function escala(v, min, max, zonas, etiquetas = []) {
  const pct = x => Math.max(0, Math.min(100, (x - min) / (max - min) * 100));
  let desde = min;
  const partes = zonas.map(([hasta, c]) => { const w = pct(hasta) - pct(desde); desde = hasta; return `<i class="z-${c}" style="flex:${w}"></i>`; }).join('');
  return `<div class="escala"><div class="zonas">${partes}</div><b class="marca" style="left:${pct(v)}%"></b>${
    etiquetas.map(x => `<span class="etq" style="left:${pct(x)}%">${fmt(x, 0)}</span>`).join('')}</div>`;
}
const val = id => num($('#' + id)?.value);
const item = (href, icono, tono, titulo, sub = '') =>
  `<a class="item t-${tono}" href="${href}"><span class="badge">${ico(icono)}</span><span class="grow">${titulo}${sub ? `<span class="sub">${sub}</span>` : ''}</span>${ico('chevron-right', 'chev')}</a>`;
function onInputs(fn) { $$('input, select', app).forEach(el => el.addEventListener('input', fn)); fn(); }

// Botón ± de los campos (el teclado numérico de algunos teléfonos no trae el signo menos)
app.addEventListener('click', e => {
  const b = e.target.closest('[data-signo]');
  if (!b) return;
  const i = document.getElementById(b.dataset.signo);
  if (!i) return;
  const v = i.value.trim();
  i.value = v.startsWith('-') ? v.slice(1) : '-' + v;
  i.dispatchEvent(new Event('input', { bubbles: true }));
});

// ---------- Avisos, alarma, pantalla encendida y compartir ----------
let avisoAccion = null;
function aviso(texto, boton, accion) {
  $('#avisoTxt').textContent = texto;
  $('#avisoBtn').textContent = boton || '';
  $('#avisoBtn').classList.toggle('hidden', !boton);
  avisoAccion = accion || null;
  $('#aviso').classList.remove('hidden');
}
$('#avisoBtn').onclick = () => { $('#aviso').classList.add('hidden'); avisoAccion?.(); };
$('#avisoX').onclick = () => $('#aviso').classList.add('hidden');

function alarma() {
  try { navigator.vibrate?.([400, 200, 400, 200, 400]); } catch {}
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.5, 1].forEach(t => {
      const o = ctx.createOscillator();
      o.frequency.value = 880; o.connect(ctx.destination);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.3);
    });
  } catch {}
}

const pantalla = { // mantiene la pantalla encendida (cronómetro de vacío, nivel)
  lock: null,
  async pedir() { try { this.lock = await navigator.wakeLock?.request('screen') ?? null; } catch { this.lock = null; } },
  soltar() { try { this.lock?.release(); } catch {} this.lock = null; },
};

async function compartir(texto) {
  if (navigator.share) { try { await navigator.share({ text: texto }); return; } catch (e) { if (e.name === 'AbortError') return; } }
  try { await navigator.clipboard.writeText(texto); alert('Copiado. Pégalo en WhatsApp.'); }
  catch { prompt('Copia este texto:', texto); }
}
function descargar(archivo) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(archivo); a.download = archivo.name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 10000);
}

// ---------- Tema y tamaño de letra ----------
function aplicaTema() {
  if (cfg.tema === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', cfg.tema);
}
function aplicaLetra() {
  document.documentElement.style.fontSize = { normal: '100%', grande: '112.5%', enorme: '125%' }[cfg.letra] || '100%';
}
aplicaTema(); aplicaLetra();

// ---------- Navegación ----------
const VISTAS = {};
let limpiezas = [];
const alSalir = fn => limpiezas.push(fn); // lo que hay que apagar al cambiar de pantalla

const PADRE = {
  lista: 'listas', falla: 'fallas', leccion: 'aprender', quiz: 'aprender', glosario: 'aprender', caso: 'casos',
  servicio: 'bitacora', editar: a => (a[0] && a[0] !== 'nuevo' ? 'servicio/' + a[0] : 'bitacora'),
  apuntes: 'bitacora', apunte: 'apuntes', precios: 'ajustes', gas: 'gases',
};
const TAB_DE = {
  fallas: 'fallas', falla: 'fallas',
  aprender: 'aprender', leccion: 'aprender', quiz: 'aprender', glosario: 'aprender',
  bitacora: 'bitacora', servicio: 'bitacora', editar: 'bitacora', apuntes: 'bitacora', apunte: 'bitacora',
  gases: 'gases', gas: 'gases', codigos: 'fallas',
  casos: 'aprender', caso: 'aprender', piezas: 'aprender', diagramas: 'aprender',
  buscar: '', ajustes: '', precios: '',
};
const RAICES = ['', 'gases', 'fallas', 'aprender', 'bitacora'];

// Barra inferior y botones del encabezado con iconos
$('nav.tabs').innerHTML = [['', 'inicio', 'house', 'Inicio'], ['gases', 'gases', 'flask-conical', 'Gases'], ['fallas', 'fallas', 'stethoscope', 'Fallas'],
  ['aprender', 'aprender', 'graduation-cap', 'Aprender'], ['bitacora', 'bitacora', 'clipboard-list', 'Bitácora']]
  .map(([h, t, i, n]) => `<a href="#${h}" data-tab="${t}"><span class="pastilla">${ico(i)}</span>${n}</a>`).join('');
$('#atras').innerHTML = ico('arrow-left');
$('#btnBuscar').innerHTML = ico('search');
$('#btnAjustes').innerHTML = ico('settings');

// Cada entrada del historial lleva un número, para que "←" regrese igual que el botón de atrás del teléfono.
let contador = 0;
try { contador = +sessionStorage.getItem('rg_i') || 0; } catch {}
function marcarEntrada() {
  if (history.state && history.state.i != null) return;
  contador++;
  try { sessionStorage.setItem('rg_i', contador); } catch {}
  history.replaceState({ i: contador }, '');
}
marcarEntrada();
const INICIO = history.state.i;
let indicePendiente = null;

function ir(hash, reemplazar = false) {
  const actual = location.hash.replace(/^#/, '');
  if (decodeURIComponent(actual) === hash) { render(); return; }
  if (reemplazar) { indicePendiente = history.state?.i ?? null; location.replace('#' + hash); }
  else location.hash = hash;
}
window.addEventListener('hashchange', () => {
  if (indicePendiente != null) { history.replaceState({ i: indicePendiente }, ''); indicePendiente = null; }
  else marcarEntrada();
  render();
});

function render() {
  limpiezas.splice(0).forEach(fn => { try { fn(); } catch {} });
  const [ruta = '', ...args] = decodeURIComponent(location.hash.slice(1)).split('/');
  const clave = VISTAS[ruta] ? ruta : '';
  const tab = TAB_DE[clave] ?? 'inicio';
  $$('nav.tabs a').forEach(a => a.classList.toggle('on', a.dataset.tab === tab));
  $('#atras').classList.toggle('hidden', RAICES.includes(clave));
  $('#atras').onclick = () => {
    if ((history.state?.i ?? 0) > INICIO) history.back();
    else { const p = PADRE[clave]; ir(typeof p === 'function' ? p(args) : (p || ''), true); }
  };
  const titulo = VISTAS[clave](...args) || 'RefriGuía';
  $('#titulo').textContent = titulo;
  document.title = titulo === 'RefriGuía' ? titulo : `${titulo} · RefriGuía`;
  window.scrollTo(0, 0);
}

$('#btnBuscar').onclick = () => ir('buscar');
$('#btnAjustes').onclick = () => ir('ajustes');

// ---------- Ajustes ----------
VISTAS.ajustes = () => {
  const perfil = store.get('perfil', {});
  app.innerHTML = `<h2>Pantalla</h2>
    <label>Tamaño de letra</label>${seg('letra', [['normal', 'Normal'], ['grande', 'Grande'], ['enorme', 'Muy grande']], cfg.letra)}
    <label>Colores</label>${seg('tema', [['auto', 'Automático'], ['light', 'Claro'], ['dark', 'Oscuro']], cfg.tema)}
    <p class="muted">En el sol se lee mejor en "Claro"; de noche, en "Oscuro".</p>
    <h2>Lugar de trabajo</h2>
    <label>País</label>${seg('pais', Object.entries(PAISES).map(([k, p]) => [k, p.n]), cfg.pais)}
    <p class="muted">Cambia el código de WhatsApp, los voltajes y los valores de clima que se sugieren.</p>
    <label for="alt">Altitud sobre el nivel del mar (metros)</label><input id="alt" inputmode="numeric" value="${esc(cfg.alt)}">
    <p class="muted" id="altNota"></p>
    <h2>Unidades</h2>
    <label>Presión</label>${puSeg()}
    <label>Temperatura</label>${tuSeg()}
    <h2>Tus datos para las notas</h2>
    <p class="muted">Salen en las notas y recordatorios que mandas por WhatsApp.</p>
    <label for="pNombre">Nombre o negocio</label><input id="pNombre" value="${esc(perfil.nombre)}" autocomplete="off" placeholder="Ej. Refrigeración Hernández">
    <label for="pTel">Teléfono</label><input id="pTel" type="tel" value="${esc(perfil.tel)}">
    <label for="pPie">Texto al final de la nota</label><textarea id="pPie" placeholder="Ej. Garantía de 30 días en mano de obra.">${esc(perfil.pie)}</textarea>
    ${item('#precios', 'banknote', 'verde', 'Mis precios', 'Conceptos que cobras seguido, para armar notas rápido')}
    <h2>Respaldo</h2>
    <p class="muted">La bitácora, los apuntes y las fotos se guardan sólo en este teléfono. Guarda un respaldo de vez en cuando y mándatelo por WhatsApp o correo.</p>
    <label class="chk"><input type="checkbox" id="conFotos" checked><span>Incluir fotos (el archivo sale más grande)</span></label>
    <div class="row"><button class="btn sec" id="exp">${ico('download')} Guardar</button><button class="btn sec" id="imp">${ico('upload')} Cargar</button></div>
    <button class="btn sec" id="csv">${ico('table')} Pasar la bitácora a Excel</button>
    <input type="file" id="archivo" accept=".json,application/json" class="hidden">
    <p class="muted" id="espacio"></p>
    <h2>Acerca de</h2>
    <p>RefriGuía versión ${VERSION}. Funciona sin internet.</p>
    <p class="muted">Tablas P-T calculadas con CoolProp. Los demás valores son orientativos: manda la placa y el manual del fabricante.</p>
    <button class="btn sec" id="compartirApp">${ico('share-2')} Compartir la app con otro técnico</button>
    <h2>¿Qué le mejorarías?</h2>
    <p class="muted">Escribe qué te estorba, qué no se entiende o qué le falta, y mándalo por WhatsApp a quien te pasó la app.</p>
    <textarea id="coment" placeholder="Ej. La tabla P-T la uso mucho, pero me gustaría…"></textarea>
    <button class="btn" id="mandarComent">${ico('message-circle')} Mandar comentarios</button>`;
  $('#csv').onclick = exportarCSV;
  $('#mandarComent').onclick = () => {
    const t = $('#coment').value.trim();
    if (!t) { $('#coment').focus(); return; }
    compartir(`Comentarios sobre RefriGuía ${VERSION}:\n\n${t}`);
  };


  bindSeg('letra', v => { cfg.letra = v; saveCfg(); aplicaLetra(); });
  bindSeg('tema', v => { cfg.tema = v; saveCfg(); aplicaTema(); });
  bindSeg('pu', v => { cfg.pu = v; saveCfg(); });
  bindSeg('tu', v => { cfg.tu = v; saveCfg(); });
  bindSeg('pais', v => { cfg.pais = v; saveCfg(); });
  const notaAlt = () => {
    const d = dAlt();
    $('#altNota').textContent = Math.abs(d) < 0.25
      ? `A esta altura el manómetro lee prácticamente igual que a nivel del mar (diferencia de ${fmt(d, 2)} psi). No hace falta corregir nada.`
      : `A esta altura el aire pesa menos: el manómetro marca ${fmt(d, 1)} psi más que a nivel del mar para la misma temperatura. La app ya lo corrige en todas las tablas y cálculos.`;
  };
  $('#alt').addEventListener('input', () => { const v = num($('#alt').value); cfg.alt = Number.isFinite(v) ? Math.max(0, Math.min(5000, v)) : 0; saveCfg(); notaAlt(); });
  notaAlt();
  const guardaPerfil = () => store.set('perfil', { nombre: $('#pNombre').value.trim(), tel: $('#pTel').value.trim(), pie: $('#pPie').value.trim() });
  ['pNombre', 'pTel', 'pPie'].forEach(id => $('#' + id).addEventListener('input', guardaPerfil));
  $('#exp').onclick = () => exportar($('#conFotos').checked);
  $('#imp').onclick = () => $('#archivo').click();
  $('#archivo').onchange = e => { importar(e.target.files[0]); e.target.value = ''; };
  navigator.storage?.estimate?.().then(e => {
    const el = $('#espacio');
    if (el && e.usage != null) el.textContent = `Espacio usado en el teléfono: ${fmt(e.usage / 1048576, 1)} MB`;
  }).catch(() => {});
  const publica = location.protocol.startsWith('http') && !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  const url = location.origin + location.pathname;
  $('#compartirApp').classList.toggle('hidden', !publica);
  $('#compartirApp').onclick = () => compartir(`RefriGuía: tablas P-T, diagnóstico y bitácora para técnicos de aire acondicionado. Funciona sin internet. Ábrela en Chrome y toca "Instalar app": ${url}`);
  return 'Ajustes';
};

// ---------- Búsqueda en toda la app ----------
function fragmento(texto, palabras) {
  const n = norm(texto);
  let p = -1;
  for (const w of palabras) { p = n.indexOf(w); if (p >= 0) break; }
  if (p < 0) return '';
  const ini = Math.max(0, p - 40), fin = Math.min(texto.length, p + 90);
  return (ini > 0 ? '…' : '') + esc(texto.slice(ini, fin)) + (fin < texto.length ? '…' : '');
}
const textoPlano = html => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

VISTAS.buscar = () => {
  let ultima = '';
  try { ultima = sessionStorage.getItem('rg_q') || ''; } catch {}
  app.innerHTML = `<input id="q" type="search" placeholder="Ej. capacitor, R32, fuga, cliente…" autocomplete="off" value="${esc(ultima)}"><div id="res"></div>`;
  const pinta = t => {
    try { sessionStorage.setItem('rg_q', t); } catch {}
    const palabras = norm(t).split(/\s+/).filter(w => w.length > 1);
    if (!palabras.length) { $('#res').innerHTML = '<p class="muted">Busca en herramientas, lecciones, fallas, glosario, apuntes y servicios.</p>'; return; }
    const coincide = s => { const n = norm(s); return palabras.every(w => n.includes(w)); };
    const grupos = [];
    const hs = SECCIONES.flatMap(s => s.items).filter(h => coincide(h.t + ' ' + h.k));
    if (hs.length) grupos.push(['Herramientas', hs.map(itemHerramienta)]);
    const gs0 = GASES_INFO.filter(g => coincide([g.nombre, g.apodo, g.quimico, g.familia, g.seguridadTxt, g.usos, ...g.claves].join(' ')));
    if (gs0.length) grupos.push(['Gases', gs0.map(itemGas)]);
    const ls = LECCIONES.map(l => ({ l, txt: textoPlano(l.html) })).filter(x => coincide(x.l.titulo + ' ' + x.txt));
    if (ls.length) grupos.push(['Lecciones', ls.map(({ l, txt }) => item(`#leccion/${l.id}`, l.icono, 'morado', l.titulo, fragmento(txt, palabras)))]);
    const fs = FALLAS.map((f, i) => ({ f, i, txt: [f.t, ...f.causas, ...f.revisar].join('. ') })).filter(x => coincide(x.txt));
    if (fs.length) grupos.push(['Fallas', fs.map(({ f, i, txt }) => item(`#falla/${i}`, 'stethoscope', 'rojo', esc(f.t), fragmento(txt, palabras)))]);
    const cs = CODIGOS.flatMap(m => m.codigos.map(c => [m.marca, ...c])).filter(c => coincide(c.join(' '))).slice(0, 12);
    if (cs.length) grupos.push(['Códigos de error', cs.map(([m, c, s]) => item('#codigos', 'triangle-alert', 'rojo', `${esc(m)} ${esc(c)}`, esc(s)))]);
    const gs = GLOSARIO.filter(
([en, es]) => coincide(en + ' ' + es)).slice(0, 12);
    if (gs.length) grupos.push(['Glosario', gs.map(([en, es]) => `<div class="glosa"><b>${esc(en)}</b><div>${esc(es)}</div></div>`)]);
    const as = store.get('apuntes', []).filter(a => coincide(a.titulo + ' ' + a.texto)).slice(0, 15);
    if (as.length) grupos.push(['Mis apuntes', as.map(a => item(`#apunte/${a.id}`, 'notebook-pen', 'ambar', esc(a.titulo || 'Sin título'), fragmento(a.texto || '', palabras)))]);
    const ss = store.get('servicios', []).filter(s => coincide([s.cliente, s.tel, s.direccion, s.marca, s.modelo, s.tipo, s.notas, s.gas].join(' ')))
      .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || '')).slice(0, 20);
    if (ss.length) grupos.push(['Servicios', ss.map(s => filaServicio(s))]);
    $('#res').innerHTML = grupos.length
      ? grupos.map(([t, items]) => `<h2 class="seccion">${t}</h2>${items.join('')}`).join('')
      : '<p class="muted">No encontré nada. Prueba con otra palabra.</p>';
  };
  $('#q').addEventListener('input', e => pinta(e.target.value));
  pinta(ultima);
  if (!ultima) $('#q').focus();
  return 'Buscar';
};

// ---------- Arranque ----------
document.addEventListener('DOMContentLoaded', render);

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  let actualizando = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (actualizando) { actualizando = false; location.reload(); } });
  navigator.serviceWorker.register('sw.js').then(reg => {
    const ofrecer = w => aviso('Hay una versión nueva de RefriGuía.', 'Actualizar', () => { actualizando = true; w.postMessage('activar'); });
    if (reg.waiting && navigator.serviceWorker.controller) ofrecer(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      w?.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) ofrecer(w); });
    });
    // Al volver a abrir la app (con internet) revisa si hay versión nueva
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
  }).catch(() => {});
}
navigator.storage?.persist?.().catch(() => {});
