// RefriGuía — bitácora de servicios, fotos, notas de cobro, apuntes, precios y respaldo.
'use strict';

// ---------- Fotos (se guardan en IndexedDB, dentro del teléfono) ----------
const fotosDB = (() => {
  let abierta = null;
  const abrir = () => abierta ??= new Promise((ok, mal) => {
    const r = indexedDB.open('refriguia', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('fotos', { keyPath: 'id' });
    r.onsuccess = () => ok(r.result);
    r.onerror = () => mal(r.error);
  });
  const tx = async (modo, fn) => {
    const db = await abrir();
    return new Promise((ok, mal) => {
      const t = db.transaction('fotos', modo);
      const req = fn(t.objectStore('fotos'));
      t.oncomplete = () => ok(req?.result);
      t.onerror = () => mal(t.error);
      t.onabort = () => mal(t.error);
    });
  };
  return {
    poner: f => tx('readwrite', s => s.put(f)),
    leer: id => tx('readonly', s => s.get(id)),
    borrar: id => tx('readwrite', s => s.delete(id)),
    claves: () => tx('readonly', s => s.getAllKeys()),
  };
})();

async function comprimirFoto(archivo, max = 1600, calidad = 0.78) {
  let img;
  try { img = await createImageBitmap(archivo, { imageOrientation: 'from-image' }); }
  catch { img = await createImageBitmap(archivo); }
  const k = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement('canvas');
  c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  img.close?.();
  return new Promise((ok, mal) => c.toBlob(b => b ? ok(b) : mal(new Error('foto')), 'image/jpeg', calidad));
}

const urlsFotos = new Map();
async function urlFoto(id) {
  if (urlsFotos.has(id)) return urlsFotos.get(id);
  const f = await fotosDB.leer(id).catch(() => null);
  if (!f) return null;
  const u = URL.createObjectURL(f.blob);
  urlsFotos.set(id, u);
  return u;
}
function olvidarFoto(id) { const u = urlsFotos.get(id); if (u) URL.revokeObjectURL(u); urlsFotos.delete(id); }

// Pinta miniaturas; con "quitar" muestra la ✕ en cada una
function pintaFotos(cont, ids, quitar) {
  cont.innerHTML = ids.map(id => `<div class="foto" data-foto="${esc(id)}"><img alt="Foto"></div>`).join('');
  $$('[data-foto]', cont).forEach(async el => {
    const id = el.dataset.foto, u = await urlFoto(id);
    if (u) el.querySelector('img').src = u;
    else el.remove();
    el.onclick = () => abrirVisor(id);
    if (quitar) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'quitar'; b.textContent = '✕'; b.setAttribute('aria-label', 'Quitar foto');
      b.onclick = e => { e.stopPropagation(); quitar(id); };
      el.appendChild(b);
    }
  });
}

// Visor a pantalla completa (el botón de atrás del teléfono lo cierra)
let visorId = null;
async function abrirVisor(id) {
  const u = await urlFoto(id);
  if (!u) return;
  visorId = id;
  $('#visorImg').src = u;
  $('#visor').classList.remove('hidden');
  history.pushState({ ...(history.state || {}), visor: true }, '');
}
function cerrarVisor(desdeHistorial) {
  if ($('#visor').classList.contains('hidden')) return;
  $('#visor').classList.add('hidden');
  $('#visorImg').removeAttribute('src');
  visorId = null;
  if (!desdeHistorial && history.state?.visor) history.back();
}
window.addEventListener('popstate', () => cerrarVisor(true));
$('#visorCerrar').onclick = () => cerrarVisor(false);
$('#visorCompartir').onclick = async () => {
  const f = visorId && await fotosDB.leer(visorId).catch(() => null);
  if (!f) return;
  const archivo = new File([f.blob], `foto-${visorId}.jpg`, { type: 'image/jpeg' });
  if (navigator.canShare?.({ files: [archivo] })) navigator.share({ files: [archivo] }).catch(() => {});
  else descargar(archivo);
};

// Borra fotos que ya no pertenecen a ningún servicio (una vez por sesión)
let fotosRevisadas = false;
async function limpiarFotosHuerfanas() {
  if (fotosRevisadas) return;
  fotosRevisadas = true;
  try {
    const usadas = new Set(store.get('servicios', []).flatMap(s => s.fotos || []));
    (store.get('borrador', null)?.datos?.fotos || []).forEach(id => usadas.add(id));
    for (const id of await fotosDB.claves()) if (!usadas.has(id)) await fotosDB.borrar(id);
  } catch {}
}

// ---------- Datos de servicios ----------
const servicios = { todos: () => store.get('servicios', []), guardar: l => store.set('servicios', l) };
const totalServicio = s => Array.isArray(s.conceptos) && s.conceptos.length
  ? s.conceptos.reduce((t, c) => t + (num(c.p) || 0), 0) : (num(s.cobro) || 0);
const claveCliente = s => { const d = String(s.tel || '').replace(/\D/g, '').slice(-10); return d.length >= 7 ? 't' + d : 'n' + norm(s.cliente).trim(); };
const equipoDe = s => [s.marca, s.modelo, s.btu, s.gas].filter(Boolean).join(' · ');

function filaServicio(s) {
  const total = totalServicio(s);
  return `<a class="item" href="#servicio/${s.id}"><span class="grow">${esc(s.cliente || 'Sin nombre')}
    <span class="sub">${fechaBonita(s.fecha)} · ${esc(s.tipo || '')} ${esc([s.marca, s.btu].filter(Boolean).join(' '))}${total ? ` · ${dinero(total)}` : ''}</span></span>
    ${s.gas ? `<span class="pill ${esc(s.gas)}">${esc(s.gas)}</span>` : ''}</a>`;
}

function abrirWhatsApp(tel, texto) {
  let d = String(tel || '').replace(/\D/g, '');
  const p = pais(); // Cuba: +53 y 8 dígitos; México: +52 y 10 dígitos
  if (p.tel === '52' && d.length === 13 && d.startsWith('521')) d = '52' + d.slice(3);
  if (d.length === p.digitos) d = p.tel + d;
  if (d.length >= 10) window.open(`https://wa.me/${d}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
  else compartir(texto);
}

function textoServicio(s) {
  const perfil = store.get('perfil', {});
  const cot = s.tipo === 'Cotización';
  const l = [`*${cot ? 'Cotización' : 'Nota de servicio'}*${perfil.nombre ? ' – ' + perfil.nombre : ''}`];
  if (perfil.tel) l.push(`Tel. ${perfil.tel}`);
  l.push('', `Fecha: ${fechaBonita(s.fecha)}`, `Cliente: ${s.cliente}`);
  if (s.direccion) l.push(`Dirección: ${s.direccion}`);
  const eq = equipoDe(s);
  if (eq) l.push(`Equipo: ${eq}`);
  if (s.tipo && !cot) l.push(`Trabajo: ${s.tipo}`);
  const med = [s.baja && `baja ${s.baja}`, s.alta && `alta ${s.alta}`, s.amps && `${s.amps} A`, s.volts && `${s.volts} V`, s.sh && `SH ${s.sh}`].filter(Boolean).join(', ');
  if (med) l.push(`Mediciones: ${med}`);
  if (s.notas) l.push(`Notas: ${s.notas}`);
  const cs = (s.conceptos || []).filter(c => c.d || num(c.p));
  if (cs.length) { l.push(''); cs.forEach(c => l.push(`• ${c.d || 'Concepto'}: ${dinero(num(c.p) || 0)}`)); }
  const total = totalServicio(s);
  if (total) l.push(`*Total: ${dinero(total)}*`);
  if (s.proximo && !cot) l.push('', `Próximo mantenimiento: ${fechaBonita(s.proximo)}`);
  if (perfil.pie) l.push('', perfil.pie);
  return l.join('\n');
}

function recordatorio(s) {
  const perfil = store.get('perfil', {});
  const equipo = [s.marca, s.btu].filter(Boolean).join(' ');
  return `Hola ${s.cliente}, le saluda ${perfil.nombre || 'su técnico de aire acondicionado'}. ` +
    `Ya le toca el mantenimiento a su ${equipo ? 'equipo ' + equipo : 'aire acondicionado'}; el último fue el ${fechaBonita(s.fecha)}. ¿Le gustaría agendar una visita?`;
}

// ---------- Pantalla principal de la bitácora ----------
VISTAS.bitacora = () => {
  limpiarFotosHuerfanas();
  const lista = servicios.todos();
  // El último servicio de cada cliente decide si le toca mantenimiento
  const ultimo = new Map();
  for (const s of lista) {
    const k = claveCliente(s), u = ultimo.get(k);
    if (!u || (s.fecha || '') > (u.fecha || '') || ((s.fecha || '') === (u.fecha || '') && (s.editado || 0) > (u.editado || 0))) ultimo.set(k, s);
  }
  const limite = sumaDias(hoy(), 30);
  const proximos = [...ultimo.values()].filter(s => s.proximo && s.proximo <= limite).sort((a, b) => a.proximo.localeCompare(b.proximo));
  const mes = hoy().slice(0, 7);
  const d = new Date(mes + '-15T12:00'); d.setMonth(d.getMonth() - 1);
  const mesAnt = d.toISOString().slice(0, 7);
  const resumen = m => { const l = lista.filter(s => (s.fecha || '').startsWith(m) && s.tipo !== 'Cotización'); return [l.length, l.reduce((t, s) => t + totalServicio(s), 0)]; };
  const [nMes, $Mes] = resumen(mes), [nAnt, $Ant] = resumen(mesAnt);
  const respaldo = store.get('ultimo_respaldo', 0);
  const pideRespaldo = lista.length >= 5 && Date.now() - respaldo > 30 * 864e5;
  const borr = store.get('borrador', null);
  const nombreBorr = borr?.datos?.cliente;

  app.innerHTML = `${borr ? `<div class="nota aviso-borrador"><span>Tienes un servicio sin guardar${nombreBorr ? ` de <b>${esc(nombreBorr)}</b>` : ''}.</span><a class="btn chico" href="#editar/${esc(borr.para)}">Continuar</a></div>` : ''}
    <a class="btn" href="#editar/nuevo">${ico('plus')} Nuevo servicio</a>
    ${pideRespaldo ? `<div class="nota">${ico('save')} ${respaldo ? 'Hace más de un mes que no guardas un respaldo.' : 'Todavía no guardas ningún respaldo.'} Si se pierde o se cambia el teléfono, se pierde la bitácora.<div class="acciones"><button class="btn chico" id="respaldar">Guardar respaldo</button></div></div>` : ''}
    ${lista.length ? `<div class="card"><b>Este mes:</b> ${nMes} servicio${nMes === 1 ? '' : 's'} · ${dinero($Mes)}<br><span class="muted">Mes pasado: ${nAnt} · ${dinero($Ant)}</span></div>` : ''}
    ${proximos.length ? `<h2>Mantenimientos por hacer</h2>${proximos.map(s => {
      const vencido = s.proximo < hoy();
      return `<div class="card"><a href="#servicio/${s.id}" style="color:inherit;text-decoration:none"><b>${esc(s.cliente)}</b><br><span class="muted">${esc(equipoDe(s) || s.tipo || '')}</span></a>
        <div><span class="pill ${vencido ? 'vencido' : 'vence'}">${vencido ? 'Venció' : 'Toca'} ${fechaBonita(s.proximo)}</span></div>
        <div class="acciones"><button class="btn chico ok" data-recordar="${s.id}">${ico('message-circle')} Recordarle</button><button class="btn chico sec" data-quitar="${s.id}">Quitar</button></div></div>`;
    }).join('')}` : ''}
    ${item('#apuntes', 'notebook-pen', 'ambar', 'Mis apuntes', 'Códigos de error, notas, proveedores')}
    <h2>Servicios (${lista.length})</h2>
    ${lista.length ? `<button class="btn sec" id="csv">${ico('table')} Pasar a Excel</button>` : ''}
    ${lista.length ? '<input id="buscar" placeholder="Buscar cliente, marca, zona…" type="search" autocomplete="off">' : '<p class="muted">Aquí se guardan los servicios que hagas: cliente, equipo, mediciones, fotos, cobro y cuándo toca el siguiente mantenimiento.</p>'}
    <div id="lista"></div>`;
  const pintaLista = q => {
    const w = norm(q).split(/\s+/).filter(Boolean);
    const l = lista.filter(s => { const t = norm([s.cliente, s.direccion, s.tel, s.marca, s.modelo, s.tipo, s.notas, s.gas].join(' ')); return w.every(x => t.includes(x)); })
      .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || '') || (b.editado || 0) - (a.editado || 0));
    $('#lista').innerHTML = l.map(s => filaServicio(s)).join('') || (q ? '<p class="muted">Sin resultados.</p>' : '');
  };
  $('#buscar')?.addEventListener('input', e => pintaLista(e.target.value));
  pintaLista('');
  $('#respaldar')?.addEventListener('click', () => exportar(true));
  $('#csv')?.addEventListener('click', exportarCSV);

  $$('[data-recordar]').forEach(b => b.onclick = () => {
    const s = lista.find(x => x.id === b.dataset.recordar);
    if (s) abrirWhatsApp(s.tel, recordatorio(s));
  });
  $$('[data-quitar]').forEach(b => b.onclick = () => {
    const l = servicios.todos(), s = l.find(x => x.id === b.dataset.quitar);
    if (!s || !confirm(`¿Quitar el recordatorio de ${s.cliente}?`)) return;
    s.proximo = ''; servicios.guardar(l); render();
  });
  return 'Bitácora';
};

// ---------- Detalle de un servicio ----------
VISTAS.servicio = id => {
  const lista = servicios.todos();
  const s = lista.find(x => x.id === id);
  if (!s) { ir('bitacora', true); return; }
  const otros = lista.filter(x => x.id !== id && claveCliente(x) === claveCliente(s)).sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
  const dato = (l, v) => v ? `<tr><td class="muted">${l}</td><td><b>${esc(v)}</b></td></tr>` : '';
  const cs = (s.conceptos || []).filter(c => c.d || num(c.p));
  const total = totalServicio(s);
  app.innerHTML = `<h2>${esc(s.cliente || 'Sin nombre')}</h2>
    <p>${s.gas ? `<span class="pill ${esc(s.gas)}">${esc(s.gas)}</span> ` : ''}${esc(s.tipo || '')} · ${fechaBonita(s.fecha)}</p>
    <div class="card"><table>
      ${dato('Teléfono', s.tel)}${dato('Dirección', s.direccion)}
      ${dato('Equipo', [s.marca, s.modelo].filter(Boolean).join(' '))}${dato('Capacidad', s.btu)}
      ${dato('Presión baja', s.baja)}${dato('Presión alta', s.alta)}${dato('Amperaje', s.amps)}${dato('Voltaje', s.volts)}
      ${dato('Sobrecalentamiento', s.sh)}${dato('Próximo mantenimiento', fechaBonita(s.proximo))}
    </table></div>
    ${s.notas ? `<div class="card"><b>Notas</b><br>${esc(s.notas).replace(/\n/g, '<br>')}</div>` : ''}
    ${cs.length || total ? `<div class="card"><b>Cobro</b><table>${cs.map(c => `<tr><td>${esc(c.d || 'Concepto')}</td><td class="num">${dinero(num(c.p) || 0)}</td></tr>`).join('')}</table>
      <div class="total"><span>Total</span><span>${dinero(total)}</span></div></div>` : ''}
    ${(s.fotos || []).length ? '<h3>Fotos</h3><div class="fotos" id="fotos"></div>' : ''}
    ${s.tel ? `<div class="acciones"><a class="btn sec" href="tel:${esc(s.tel.replace(/[^\d+]/g, ''))}">${ico('phone')} Llamar</a><button class="btn sec" id="wa">${ico('message-circle')} WhatsApp</button></div>` : ''}
    ${s.tel ? `<button class="btn" id="nota">${ico('message-circle')} Mandarle la nota</button>` : ''}
    <button class="btn ${s.tel ? 'sec' : ''}" id="comp">${ico('share-2')} Compartir nota</button>
    <a class="btn sec" href="#editar/${s.id}">${ico('pencil')} Editar</a>
    <a class="btn sec" href="#editar/nuevo/${s.id}">${ico('plus')} Nuevo servicio para este cliente</a>
    ${otros.length ? `<h3>Otros servicios de este cliente</h3>${otros.map(x => filaServicio(x)).join('')}` : ''}
    <button class="btn bad" id="borrar">${ico('trash-2')} Borrar servicio</button>`;
  if ((s.fotos || []).length) pintaFotos($('#fotos'), s.fotos);
  $('#wa')?.addEventListener('click', () => abrirWhatsApp(s.tel, `Hola ${s.cliente}, `));
  $('#nota')?.addEventListener('click', () => abrirWhatsApp(s.tel, textoServicio(s)));
  $('#comp').onclick = () => compartir(textoServicio(s));
  $('#borrar').onclick = () => {
    if (!confirm('¿Borrar este servicio y sus fotos? No se puede deshacer.')) return;
    servicios.guardar(servicios.todos().filter(x => x.id !== id));
    (s.fotos || []).forEach(f => { olvidarFoto(f); fotosDB.borrar(f).catch(() => {}); });
    ir('bitacora', true);
  };
  return 'Servicio';
};

// ---------- Nuevo / editar servicio (se guarda un borrador mientras escribes) ----------
const CAMPOS = ['cliente', 'tel', 'fecha', 'direccion', 'tipo', 'marca', 'modelo', 'btu', 'gas', 'baja', 'alta', 'amps', 'volts', 'sh', 'notas', 'proximo'];

VISTAS.editar = (id, desde) => {
  const nuevo = id === 'nuevo';
  const lista = servicios.todos();
  const base = nuevo
    ? { id: uid(), fecha: hoy(), gas: GASES_TRABAJO.includes(cfg.gas) ? cfg.gas : 'R410A', tipo: 'Mantenimiento', conceptos: [], fotos: [] }
    : lista.find(x => x.id === id);
  if (!base) { ir('bitacora', true); return; }
  if (nuevo && desde) {
    const o = lista.find(x => x.id === desde);
    if (o) ['cliente', 'tel', 'direccion', 'marca', 'modelo', 'btu', 'gas'].forEach(k => { if (o[k]) base[k] = o[k]; });
  }
  let s = { ...base, conceptos: (base.conceptos || []).map(c => ({ ...c })), fotos: [...(base.fotos || [])] };
  if (!s.conceptos.length && num(s.cobro)) s.conceptos = [{ d: 'Servicio', p: String(s.cobro) }]; // servicios de la versión 1
  const para = nuevo ? 'nuevo' : id;
  const borr = store.get('borrador', null);
  let recuperado = false;
  if (borr && borr.para === para) {
    const usar = !(nuevo && desde) || confirm(`Tienes un servicio nuevo sin guardar${borr.datos.cliente ? ' de ' + borr.datos.cliente : ''}. ¿Quieres continuarlo?\n\nAceptar = continuar ese · Cancelar = empezar uno nuevo para este cliente`);
    if (usar) { s = borr.datos; recuperado = true; } else store.set('borrador', null);
  }
  const precios = store.get('precios', []);
  const txt = (k, l, attrs = '') => `<label for="f_${k}">${l}</label><input id="f_${k}" value="${esc(s[k])}" ${attrs}>`;
  const sel = (k, l, ops) => `<label for="f_${k}">${l}</label><select id="f_${k}">${
    [...new Set([...(s[k] && !ops.includes(s[k]) ? [s[k]] : []), ...ops])].map(o => `<option ${o === (s[k] || '') ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
  app.innerHTML = `${recuperado ? '<div class="nota aviso-borrador"><span>Recuperé lo que estabas escribiendo.</span><button type="button" class="btn chico sec" id="descartar">Descartar</button></div>' : ''}
    <form id="form" autocomplete="off">
    ${txt('cliente', 'Cliente')}
    <div class="row"><div>${txt('tel', 'Teléfono', 'type="tel"')}</div><div>${txt('fecha', 'Fecha', 'type="date"')}</div></div>
    ${txt('direccion', 'Dirección / colonia')}
    ${sel('tipo', 'Tipo de servicio', ['Mantenimiento', 'Instalación', 'Reparación', 'Diagnóstico', 'Carga de gas', 'Desinstalación', 'Cotización', 'Otro'])}
    <div class="row"><div>${txt('marca', 'Marca')}</div><div>${txt('modelo', 'Modelo')}</div></div>
    <div class="row"><div>${sel('btu', 'Capacidad', ['', '5 000 BTU', '8 000 BTU', '9 000 BTU', '12 000 BTU (1 TR)', '18 000 BTU (1.5 TR)', '24 000 BTU (2 TR)', '30 000 BTU (2.5 TR)', '36 000 BTU (3 TR)', 'Otro'])}</div>
    <div>${sel('gas', 'Gas', ['R22', 'R410A', 'R32', 'R290', 'Otro'])}</div></div>
    <h3>Mediciones</h3>
    <div class="row"><div>${txt('baja', 'Baja', 'placeholder="psi"')}</div><div>${txt('alta', 'Alta', 'placeholder="psi"')}</div></div>
    <div class="row"><div>${txt('amps', 'Amperes')}</div><div>${txt('volts', 'Voltaje')}</div></div>
    ${txt('sh', 'Sobrecalentamiento', 'placeholder="°C"')}
    <label for="f_notas">Notas (qué se hizo, refacciones, fallas)</label><textarea id="f_notas">${esc(s.notas)}</textarea>
    <h3>Fotos</h3>
    <p class="muted">La placa de datos, antes y después, piezas dañadas.</p>
    <div class="fotos" id="fotos"></div>
    <div class="row"><button type="button" class="btn sec" id="camara">${ico('camera')} Tomar foto</button><button type="button" class="btn sec" id="galeria">${ico('image')} Galería</button></div>
    <p class="muted hidden" id="fotoEstado">Guardando foto…</p>
    <input type="file" id="inCamara" accept="image/*" capture="environment" class="hidden">
    <input type="file" id="inGaleria" accept="image/*" multiple class="hidden">
    <h3>Cobro</h3>
    <div id="conceptos"></div>
    ${precios.length ? `<p class="muted">Toca para agregar:</p><div class="chips">${precios.map(p => `<button type="button" class="chip" data-precio="${p.id}">${esc(p.t)}${num(p.p) ? ' · ' + dinero(num(p.p)) : ''}</button>`).join('')}</div>` : '<p class="muted">Guarda tus precios en Ajustes → Mis precios para agregarlos con un toque.</p>'}
    <button type="button" class="btn sec" id="agregar">${ico('plus')} Agregar concepto</button>
    <div class="total"><span>Total</span><span id="total">$0</span></div>
    <h3>Próximo mantenimiento</h3>
    ${txt('proximo', 'Fecha', 'type="date"')}
    <div class="seg"><button type="button" data-meses="3">+3 meses</button><button type="button" data-meses="6">+6 meses</button><button type="button" data-meses="12">+1 año</button><button type="button" data-meses="0">Ninguno</button></div>
    <button class="btn" type="submit">${ico('save')} Guardar</button>
    </form>`;

  const leerForm = () => { CAMPOS.forEach(k => { const el = $('#f_' + k); if (el) s[k] = el.value.trim(); }); };
  const guardarBorrador = () => { leerForm(); store.set('borrador', { para, datos: s }); };
  const pintaTotal = () => { $('#total').textContent = dinero(totalServicio(s)); };
  const pintaConceptos = () => {
    $('#conceptos').innerHTML = s.conceptos.map((c, i) => `<div class="concepto"><input data-c="${i}" data-k="d" value="${esc(c.d)}" placeholder="Concepto"><input class="precio" data-c="${i}" data-k="p" value="${esc(c.p)}" inputmode="decimal" placeholder="$"><button type="button" data-q="${i}" aria-label="Quitar concepto">✕</button></div>`).join('');
    pintaTotal();
  };
  const fotosForm = () => pintaFotos($('#fotos'), s.fotos, fid => { s.fotos = s.fotos.filter(x => x !== fid); fotosForm(); guardarBorrador(); });

  $('#conceptos').addEventListener('input', e => {
    const i = e.target.dataset.c;
    if (i == null) return;
    s.conceptos[+i][e.target.dataset.k] = e.target.value;
    pintaTotal();
  });
  $('#conceptos').addEventListener('click', e => {
    const q = e.target.closest('[data-q]');
    if (!q) return;
    s.conceptos.splice(+q.dataset.q, 1);
    pintaConceptos(); guardarBorrador();
  });
  $('#agregar').onclick = () => { s.conceptos.push({ d: '', p: '' }); pintaConceptos(); guardarBorrador(); $$('#conceptos input[data-k="d"]').pop()?.focus(); };
  $$('[data-precio]').forEach(b => b.onclick = () => {
    const p = precios.find(x => x.id === b.dataset.precio);
    if (!p) return;
    s.conceptos.push({ d: p.t, p: String(p.p ?? '') });
    pintaConceptos(); guardarBorrador();
  });
  $$('[data-meses]').forEach(b => b.onclick = () => {
    const m = +b.dataset.meses;
    if (!m) { $('#f_proximo').value = ''; guardarBorrador(); return; }
    const d = new Date(($('#f_fecha').value || hoy()) + 'T12:00'); d.setMonth(d.getMonth() + m);
    $('#f_proximo').value = d.toISOString().slice(0, 10);
    guardarBorrador();
  });
  const agregarFotos = async archivos => {
    if (!archivos?.length) return;
    $('#fotoEstado').classList.remove('hidden');
    for (const a of archivos) {
      try {
        const blob = await comprimirFoto(a);
        const fid = uid();
        await fotosDB.poner({ id: fid, servicio: s.id, blob, fecha: Date.now() });
        s.fotos.push(fid);
      } catch { alert('No se pudo guardar una foto.'); }
    }
    $('#fotoEstado').classList.add('hidden');
    fotosForm(); guardarBorrador();
  };
  $('#camara').onclick = () => $('#inCamara').click();
  $('#galeria').onclick = () => $('#inGaleria').click();
  $('#inCamara').onchange = e => { agregarFotos([...e.target.files]); e.target.value = ''; };
  $('#inGaleria').onchange = e => { agregarFotos([...e.target.files]); e.target.value = ''; };
  $('#form').addEventListener('input', guardarBorrador);
  $('#descartar')?.addEventListener('click', () => {
    if (!confirm('¿Descartar lo que no has guardado?')) return;
    store.set('borrador', null);
    render();
  });
  $('#form').onsubmit = e => {
    e.preventDefault();
    leerForm();
    if (!s.cliente) { alert('Escribe el nombre del cliente.'); $('#f_cliente').focus(); return; }
    s.conceptos = s.conceptos.map(c => ({ d: String(c.d || '').trim(), p: String(c.p || '').trim() })).filter(c => c.d || num(c.p));
    const total = totalServicio(s);
    s.cobro = total ? String(total) : '';
    s.editado = Date.now();
    const l = servicios.todos();
    const i = l.findIndex(x => x.id === s.id);
    if (i >= 0) l[i] = s; else l.push(s);
    if (!servicios.guardar(l)) return;
    (base.fotos || []).filter(f => !s.fotos.includes(f)).forEach(f => { olvidarFoto(f); fotosDB.borrar(f).catch(() => {}); });
    store.set('borrador', null);
    ir('servicio/' + s.id, true);
  };
  pintaConceptos(); fotosForm();
  if (nuevo && !recuperado && !desde) $('#f_cliente').focus();
  return nuevo ? 'Nuevo servicio' : 'Editar servicio';
};

// ---------- Mis precios ----------
VISTAS.precios = () => {
  const pinta = () => {
    const l = store.get('precios', []);
    app.innerHTML = `<p class="muted">Guarda lo que cobras seguido. Al hacer una nota los tocas y se agregan al cobro.</p>
      <div id="lista">${l.map(p => `<div class="concepto"><input data-id="${p.id}" data-k="t" value="${esc(p.t)}" placeholder="Concepto"><input class="precio" data-id="${p.id}" data-k="p" value="${esc(p.p)}" inputmode="decimal" placeholder="$"><button type="button" data-q="${p.id}" aria-label="Quitar precio">✕</button></div>`).join('')}</div>
      <button class="btn sec" id="agregar">${ico('plus')} Agregar precio</button>
      ${l.length ? '' : '<button class="btn sec" id="ejemplos">Poner conceptos de ejemplo</button>'}`;
    $('#lista').addEventListener('input', e => {
      const l = store.get('precios', []), p = l.find(x => x.id === e.target.dataset.id);
      if (!p) return;
      p[e.target.dataset.k] = e.target.value.trim();
      store.set('precios', l);
    });
    $('#lista').addEventListener('click', e => {
      const q = e.target.closest('[data-q]');
      if (!q) return;
      store.set('precios', store.get('precios', []).filter(x => x.id !== q.dataset.q));
      pinta();
    });
    $('#agregar').onclick = () => {
      store.set('precios', [...store.get('precios', []), { id: uid(), t: '', p: '' }]);
      pinta();
      $$('#lista input[data-k="t"]').pop()?.focus();
    };
    $('#ejemplos')?.addEventListener('click', () => {
      const ej = ['Mantenimiento minisplit', 'Mantenimiento equipo de ventana', 'Instalación minisplit 1 TR', 'Carga de gas', 'Capacitor', 'Visita de diagnóstico'];
      store.set('precios', ej.map(t => ({ id: uid(), t, p: '' })));
      pinta();
    });
  };
  pinta();
  return 'Mis precios';
};

// ---------- Apuntes ----------
VISTAS.apuntes = () => {
  const a = store.get('apuntes', []).sort((x, y) => (y.editado || 0) - (x.editado || 0));
  app.innerHTML = `<a class="btn" href="#apunte/nuevo">${ico('plus')} Nuevo apunte</a>
    <p class="muted">Guarda aquí las tablas de códigos de error de cada marca, precios de refacciones, proveedores o lo que quieras recordar.</p>
    ${a.length ? '<input id="buscar" type="search" placeholder="Buscar en apuntes…" autocomplete="off">' : ''}<div id="lista"></div>`;
  const pinta = q => {
    const w = norm(q);
    $('#lista').innerHTML = a.filter(x => !w || norm(x.titulo + ' ' + x.texto).includes(w))
      .map(x => item(`#apunte/${x.id}`, 'notebook-pen', 'ambar', esc(x.titulo || 'Sin título'), esc((x.texto || '').slice(0, 80)))).join('');
  };
  $('#buscar')?.addEventListener('input', e => pinta(e.target.value));
  pinta('');
  return 'Mis apuntes';
};

VISTAS.apunte = id => {
  const nuevo = id === 'nuevo';
  const x = nuevo ? { titulo: '', texto: '' } : store.get('apuntes', []).find(a => a.id === id);
  if (!x) { ir('apuntes', true); return; }
  app.innerHTML = `<label for="t">Título</label><input id="t" value="${esc(x.titulo)}" placeholder="Ej. Códigos de error Midea">
    <label for="x">Texto</label><textarea id="x" style="min-height:17rem">${esc(x.texto)}</textarea>
    <button class="btn" id="guardar">${ico('save')} Guardar</button>
    ${nuevo ? '' : `<button class="btn sec" id="comp">${ico('share-2')} Compartir</button><button class="btn bad" id="borrar">${ico('trash-2')} Borrar</button>`}`;

  $('#guardar').onclick = () => {
    const lista = store.get('apuntes', []);
    const reg = { id: nuevo ? uid() : id, titulo: $('#t').value.trim(), texto: $('#x').value, editado: Date.now() };
    if (!reg.titulo && !reg.texto.trim()) { alert('El apunte está vacío.'); return; }
    if (nuevo) lista.push(reg); else lista[lista.findIndex(a => a.id === id)] = reg;
    if (store.set('apuntes', lista)) ir('apuntes', true);
  };
  if (!nuevo) {
    $('#comp').onclick = () => compartir(`${x.titulo}\n\n${x.texto}`);
    $('#borrar').onclick = () => {
      if (!confirm('¿Borrar este apunte?')) return;
      store.set('apuntes', store.get('apuntes', []).filter(a => a.id !== id));
      ir('apuntes', true);
    };
  } else $('#t').focus();
  return nuevo ? 'Nuevo apunte' : 'Apunte';
};

// ---------- Respaldo ----------
const aDataURL = blob => new Promise((ok, mal) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = () => mal(r.error); r.readAsDataURL(blob); });

async function exportar(conFotos = true) {
  const datos = {
    app: 'RefriGuía', version: 2, fecha: new Date().toISOString(),
    servicios: store.get('servicios', []), apuntes: store.get('apuntes', []),
    precios: store.get('precios', []), perfil: store.get('perfil', {}), fotos: [],
  };
  if (conFotos) {
    aviso('Preparando el respaldo…');
    for (const id of new Set(datos.servicios.flatMap(s => s.fotos || []))) {
      const f = await fotosDB.leer(id).catch(() => null);
      if (f) datos.fotos.push({ id, servicio: f.servicio, fecha: f.fecha, data: await aDataURL(f.blob) });
    }
  }
  const nombre = `refriguia-respaldo-${hoy()}.json`;
  const archivo = new File([JSON.stringify(datos)], nombre, { type: 'application/json' });
  const mb = fmt(archivo.size / 1048576, 1);
  const listo = () => { store.set('ultimo_respaldo', Date.now()); $('#aviso').classList.add('hidden'); };
  const mandar = async reintento => {
    if (!navigator.canShare?.({ files: [archivo] })) { descargar(archivo); listo(); return; }
    try { await navigator.share({ files: [archivo], title: nombre }); listo(); }
    catch (e) {
      if (e.name === 'AbortError') { $('#aviso').classList.add('hidden'); return; }
      // Si tardó mucho en preparar las fotos, Android pide que se vuelva a tocar un botón
      if (e.name === 'NotAllowedError' && !reintento) { aviso(`Respaldo listo (${mb} MB).`, 'Compartir', () => mandar(true)); return; }
      descargar(archivo); listo();
    }
  };
  await mandar(false);
}

async function importar(archivo) {
  if (!archivo) return;
  let d;
  try { d = JSON.parse(await archivo.text()); } catch { alert('Ese archivo no es un respaldo de RefriGuía.'); return; }
  if (!d || !Array.isArray(d.servicios) || !Array.isArray(d.apuntes)) { alert('Ese archivo no es un respaldo de RefriGuía.'); return; }
  const nf = Array.isArray(d.fotos) ? d.fotos.length : 0;
  if (!confirm(`El respaldo tiene ${d.servicios.length} servicios, ${d.apuntes.length} apuntes${nf ? ` y ${nf} fotos` : ''}. Se van a juntar con lo que ya tienes. ¿Continuar?`)) return;
  const junta = (k, nuevos) => {
    const m = new Map(store.get(k, []).map(x => [x.id, x]));
    nuevos.forEach(x => { if (x && x.id && (!m.has(x.id) || (x.editado || 0) >= (m.get(x.id).editado || 0))) m.set(x.id, x); });
    store.set(k, [...m.values()]);
  };
  junta('servicios', d.servicios);
  junta('apuntes', d.apuntes);
  if (Array.isArray(d.precios)) junta('precios', d.precios);
  if (d.perfil && !store.get('perfil', {}).nombre) store.set('perfil', d.perfil);
  let malas = 0;
  for (const f of d.fotos || []) {
    try { const blob = await (await fetch(f.data)).blob(); await fotosDB.poner({ id: f.id, servicio: f.servicio, fecha: f.fecha, blob }); }
    catch { malas++; }
  }
  alert(malas ? `Respaldo cargado, pero ${malas} foto(s) no se pudieron recuperar.` : 'Respaldo cargado.');
  render();
}

// ---------- Pasar la bitácora a Excel (archivo CSV) ----------
function exportarCSV() {
  const l = store.get('servicios', []).sort((a, b) => (a.fecha || '').localeCompare(b.fecha || ''));
  if (!l.length) { alert('Todavía no hay servicios en la bitácora.'); return; }
  const cols = [['Fecha', 'fecha'], ['Cliente', 'cliente'], ['Teléfono', 'tel'], ['Dirección', 'direccion'], ['Tipo', 'tipo'], ['Marca', 'marca'], ['Modelo', 'modelo'],
    ['Capacidad', 'btu'], ['Gas', 'gas'], ['Baja', 'baja'], ['Alta', 'alta'], ['Amperes', 'amps'], ['Voltaje', 'volts'], ['SH', 'sh'], ['Notas', 'notas'], ['Próximo mantenimiento', 'proximo']];
  const celda = v => `"${String(v ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
  const filas = [[...cols.map(c => c[0]), 'Conceptos', 'Total'].map(celda).join(';'),
    ...l.map(s => [...cols.map(c => s[c[1]]), (s.conceptos || []).map(c => `${c.d} ${c.p}`).join(' / '), String(totalServicio(s)).replace('.', ',')].map(celda).join(';'))];
  const archivo = new File(['\ufeff' + filas.join('\r\n')], `refriguia-bitacora-${hoy()}.csv`, { type: 'text/csv' });
  if (navigator.canShare?.({ files: [archivo] })) navigator.share({ files: [archivo], title: archivo.name }).catch(e => { if (e.name !== 'AbortError') descargar(archivo); });
  else descargar(archivo);
}
