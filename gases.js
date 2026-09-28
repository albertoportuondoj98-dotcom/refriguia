// RefriGuía — documentación de los gases: fichas, comparación y otros gases.
'use strict';

const claseTxt = { A1: 'No inflamable', A2L: 'Levemente inflamable', A3: 'Muy inflamable' };
const tarjetaGas = g => `<a class="gas-card c-${g.id}" href="#gas/${g.id}"><span class="clase">${g.seguridad}</span><b>${g.nombre}</b><span>${esc(g.apodo || g.familia)}</span><span>${claseTxt[g.seguridad]}</span></a>`;
const itemGas = g => `<a class="item" href="#gas/${g.id}"><span class="badge" style="background:var(--${g.id.toLowerCase()});color:#fff">${ico('flask-conical')}</span><span class="grow">${g.nombre}<span class="sub">${esc(g.quimico)} · ${g.seguridad}</span></span>${ico('chevron-right', 'chev')}</a>`;

VISTAS.gases = () => {
  app.innerHTML = `<p class="muted">Toca un gas para ver su ficha: datos, presiones, cómo se carga y seguridad.</p>
    <div class="gases-grid">${GASES_INFO.map(tarjetaGas).join('')}</div>
    <h2>Comparación rápida</h2>
    <div class="card" style="overflow-x:auto"><table class="comparar">
      <tr><th></th>${GASES_INFO.map(g => `<th>${g.nombre}</th>`).join('')}</tr>
      <tr><td><b>Seguridad</b></td>${GASES_INFO.map(g => `<td>${g.seguridad}</td>`).join('')}</tr>
      <tr><td><b>Presión a 5 °C</b></td>${GASES_INFO.map(g => `<td>${fmt(psiA(satP(g.id, 5), cfg.pu), pDec(cfg.pu))}</td>`).join('')}</tr>
      <tr><td><b>Presión a 45 °C</b></td>${GASES_INFO.map(g => `<td>${fmt(psiA(satP(g.id, 45), cfg.pu), pDec(cfg.pu))}</td>`).join('')}</tr>
      <tr><td><b>Carga</b></td>${GASES_INFO.map(g => `<td>${g.id === 'R410A' ? 'Líquido' : g.id === 'R290' ? 'Peso exacto' : 'Vapor o líquido'}</td>`).join('')}</tr>
      <tr><td><b>Aceite</b></td>${GASES_INFO.map(g => `<td>${g.id === 'R22' ? 'Mineral' : g.id === 'R290' ? 'Según fabricante' : 'POE'}</td>`).join('')}</tr>
      <tr><td><b>GWP</b></td>${GASES_INFO.map(g => `<td>${g.gwp}</td>`).join('')}</tr>
    </table>
    <p class="muted">Presiones en ${cfg.pu} (manómetro). A 5 °C es una evaporación típica; a 45 °C, una condensación típica.</p></div>
    <h2>¿Qué significa A1, A2L y A3?</h2>
    <div class="card"><table>
      <tr><td><b>A1</b></td><td>No inflamable. R22, R410A, R134a.</td></tr>
      <tr><td><b>A2L</b></td><td>Levemente inflamable: prende con dificultad y la flama avanza lento. R32, R454B.</td></tr>
      <tr><td><b>A3</b></td><td>Muy inflamable, como el gas LP. R290 (propano), R600a (isobutano).</td></tr>
    </table><p class="muted">La "A" quiere decir baja toxicidad.</p></div>
    <h2>Nunca mezcles gases</h2>
    <div class="alerta">Cada equipo trabaja con el gas de su placa. Mezclar gases o cambiar uno por otro sin hacer la conversión completa daña el compresor y es peligroso.</div>
    <h2>Otros gases que puedes encontrar</h2>
    ${OTROS_GASES.map(o => `<div class="card"><b>${o.gas}</b><br>${o.txt}</div>`).join('')}`;
  return 'Gases';
};

VISTAS.gas = id => {
  const g = GASES_INFO.find(x => x.id === id);
  if (!g) { ir('gases', true); return; }
  const pres = PRESIONES.find(p => p.gas === g.id);
  const temps = [-10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
  const stat = (t, v, ancho) => `<div class="stat${ancho ? ' ancho' : ''}"><small>${t}</small><b>${v}</b></div>`;
  app.innerHTML = `<section class="ficha-top c-${g.id}">
      <svg class="copo" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${ICONOS.snowflake}</svg>
      <h2>${g.nombre}</h2>
      <p>${esc(g.quimico)}${g.apodo ? ` · ${esc(g.apodo)}` : ''}</p>
      <span class="pill">${g.seguridad} · ${g.seguridadTxt}</span><span class="pill">${g.familia}</span><span class="pill">${g.tipo}</span>
    </section>
    ${g.seguridad !== 'A1' ? `<div class="alerta">${ico('triangle-alert')} <b>${g.seguridadTxt}.</b> ${g.seguridad === 'A3' ? 'Trátalo como gas LP.' : 'Ventila, sin flamas ni chispas, y nunca soldar con gas adentro.'}</div>` : ''}
    <div class="stats">
      ${stat('Presión de baja típica', pres.baja)}${stat('Presión de alta típica', pres.alta)}
      ${stat('Cómo se carga', g.carga, true)}
      ${stat('Aceite', g.aceite, true)}
      ${stat('Hierve a (1 atm)', g.ebull)}${stat('Temp. crítica', g.tcrit)}
      ${stat('Presión crítica', g.pcrit)}${stat('Cilindro', g.cilindro)}
      ${stat('Daño al ozono (ODP)', g.odp)}${stat('Calentamiento (GWP)', g.gwp)}
    </div>
    <p class="muted">Presiones típicas con ~35 °C afuera y el cuarto a 24–27 °C.</p>
    <h2>Dónde se usa</h2>
    <div class="card">${g.usos}</div>
    <h2>Lo que debes saber</h2>
    <div class="card"><ul class="claves">${g.claves.map(c => `<li>${ico('check')}<span>${c}</span></li>`).join('')}</ul></div>
    <h2>Tabla P-T rápida</h2>
    <div class="card"><table class="tabla-pt"><tr><th>${tU(cfg.tu)}</th><th class="num">${cfg.pu}</th><th>${tU(cfg.tu)}</th><th class="num">${cfg.pu}</th></tr>${
      temps.slice(0, 8).map((t, i) => { const t2 = temps[i + 8];
        return `<tr><td>${fmt(tA(t, cfg.tu), 0)}</td><td class="num">${fmt(psiA(satP(g.id, t), cfg.pu), pDec(cfg.pu))}</td>${t2 != null
          ? `<td>${fmt(tA(t2, cfg.tu), 0)}</td><td class="num">${fmt(psiA(satP(g.id, t2), cfg.pu), pDec(cfg.pu))}</td>` : '<td></td><td></td>'}</tr>`; }).join('')
    }</table></div>
    <a class="btn" href="#pt" id="abrirPT">${ico('table')} Abrir la tabla P-T completa de ${g.nombre}</a>
    <a class="btn sec" href="#leccion/${g.leccion}">${ico('book-open')} Leer la lección</a>`;
  $('#abrirPT').onclick = () => { cfg.gas = g.id; saveCfg(); };
  return g.nombre;
};
