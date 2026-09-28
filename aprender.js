// RefriGuía — fallas, lecciones, examen, pregunta del día y glosario.
'use strict';

const botonesHerramientas = rs => rs.map(HERRAMIENTA).filter(Boolean)
  .map(itemHerramienta).join('');

VISTAS.fallas = () => {
  app.innerHTML = `${botonesHerramientas(['diag', 'dt'])}
    <h2>¿Qué le pasa al equipo?</h2>
    ${FALLAS.map((f, i) => item(`#falla/${i}`, 'stethoscope', 'rojo', f.t)).join('')}`;
  return 'Fallas';
};

VISTAS.falla = i => {
  const f = FALLAS[+i];
  if (!f) { ir('fallas', true); return; }
  app.innerHTML = `<h2>${f.t}</h2>
    <div class="card"><h3>Causas más comunes</h3><ol>${f.causas.map(c => `<li>${c}</li>`).join('')}</ol></div>
    <div class="card"><h3>Qué revisar</h3><ul>${f.revisar.map(c => `<li>${c}</li>`).join('')}</ul></div>
    ${f.h.length ? `<h3>Herramientas para esta falla</h3>${botonesHerramientas(f.h)}` : ''}`;
  return 'Falla';
};

// ---------- Aprender ----------
const quizDatos = {
  falladas: () => store.get('quiz_falladas', []),
  marcar(q, bien) {
    const s = new Set(this.falladas());
    bien ? s.delete(q.p) : s.add(q.p);
    store.set('quiz_falladas', [...s]);
    const st = store.get('quiz_stats', { resp: 0, buenas: 0 });
    st.resp++; if (bien) st.buenas++;
    store.set('quiz_stats', st);
  },
};

function preguntaDelDia() {
  const dia = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
  const q = QUIZ[dia % QUIZ.length];
  const orden = barajar(q.o.map((_, i) => i), azarCon(dia));
  const r = store.get('pdia', {});
  const elegida = r.dia === dia ? r.i : null;
  const cont = $('#pdia');
  cont.innerHTML = `<h3>${ico('lightbulb')} Pregunta del día</h3><p><b>${q.p}</b></p>
    ${orden.map(i => {
      const cls = elegida == null ? '' : i === q.r ? 'ok' : i === elegida ? 'no' : '';
      return `<button class="quiz-op ${cls}" data-i="${i}">${q.o[i]}</button>`;
    }).join('')}
    ${elegida == null ? '' : `<div class="result ${elegida === q.r ? 'ok' : 'bad'}"><b>${elegida === q.r ? '✔ Correcto' : '✘ Incorrecto'}</b><br>${q.e}</div>`}`;
  if (elegida == null) $$('.quiz-op', cont).forEach(b => b.onclick = () => {
    const i = +b.dataset.i;
    store.set('pdia', { dia, i });
    quizDatos.marcar(q, i === q.r);
    preguntaDelDia();
  });
}

VISTAS.aprender = () => {
  const ult = store.get('quiz_ultimo', null);
  const st = store.get('quiz_stats', { resp: 0, buenas: 0 });
  const falladas = quizDatos.falladas().filter(p => QUIZ.some(q => q.p === p)).length;
  const leidas = new Set(store.get('leidas', []));
  const nLeidas = LECCIONES.filter(l => leidas.has(l.id)).length;
  app.innerHTML = `<div class="card" id="pdia"></div>
    ${item('#quiz', 'graduation-cap', 'azul', 'Examen de repaso', ult ? `Último: ${ult.b} de ${ult.t} (${fechaBonita(ult.f)})` : `10 preguntas al azar de ${QUIZ.length}`)}
    ${falladas ? item('#quiz/errores', 'refresh-cw', 'naranja', 'Repasar las que fallé', `${falladas} pregunta${falladas === 1 ? '' : 's'}`) : ''}
    ${item('#gases', 'flask-conical', 'verde', 'Fichas de los gases', 'R22, R410A, R32, R290 y otros')}
    ${item('#glosario', 'languages', 'rosa', 'Glosario inglés-español', 'Lo que viene en placas, manuales y códigos')}
    ${st.resp ? `<p class="muted">Llevas ${st.resp} respuestas, ${fmt(st.buenas / st.resp * 100, 0)}% correctas.</p>` : ''}
    <h2>Lecciones</h2>
    <div class="bar"><i style="width:${nLeidas / LECCIONES.length * 100}%"></i></div>
    <p class="muted">${nLeidas} de ${LECCIONES.length} leídas</p>
    ${LECCIONES.map(l => item(`#leccion/${l.id}`, l.icono, leidas.has(l.id) ? 'verde' : 'morado', l.titulo, leidas.has(l.id) ? '✓ Leída' : '')).join('')}`;
  preguntaDelDia();
  return 'Aprender';
};

VISTAS.leccion = id => {
  const i = LECCIONES.findIndex(l => l.id === id);
  if (i < 0) { ir('aprender', true); return; }
  const l = LECCIONES[i], sig = LECCIONES[i + 1];
  const leidas = new Set(store.get('leidas', [])); leidas.add(l.id); store.set('leidas', [...leidas]);
  app.innerHTML = `<h2>${l.titulo}</h2>${l.html}

    ${sig ? `<a class="btn" href="#leccion/${sig.id}">Siguiente: ${sig.titulo} →</a>` : '<a class="btn" href="#quiz">Hacer el examen →</a>'}`;
  return 'Lección';
};

VISTAS.quiz = modo => {
  const errores = modo === 'errores';
  const fall = new Set(quizDatos.falladas());
  const banco = errores ? QUIZ.filter(q => fall.has(q.p)) : QUIZ;
  if (!banco.length) {
    app.innerHTML = resultado('ok', '¡Sin pendientes!', 'Ya no tienes preguntas falladas por repasar.') + '<a class="btn" href="#quiz">Hacer un examen</a>';
    return 'Examen';
  }
  const preguntas = barajar(banco).slice(0, 10).map(q => ({ q, orden: barajar(q.o.map((_, i) => i)) }));
  let n = 0, buenas = 0;
  const malas = [];
  const pinta = () => {
    if (n >= preguntas.length) {
      if (!errores) store.set('quiz_ultimo', { b: buenas, t: preguntas.length, f: hoy() });
      const cls = buenas >= preguntas.length * 0.8 ? 'ok' : buenas >= preguntas.length * 0.6 ? 'warn' : 'bad';
      app.innerHTML = resultado(cls, `${buenas} de ${preguntas.length}`, cls === 'ok' ? '¡Muy bien!' : cls === 'warn' ? 'Bien, pero vale la pena repasar.' : 'Repasa las lecciones y vuelve a intentarlo.') +
        (malas.length ? `<h3>Para repasar</h3>${malas.map(q => `<div class="card"><b>${q.p}</b><br>✔ ${q.o[q.r]}<br><span class="muted">${q.e}</span></div>`).join('')}` : '') +
        '<button class="btn" id="otra">Otro examen</button><a class="btn sec" href="#aprender">Volver</a>';
      $('#otra').onclick = () => ir('quiz');
      return;
    }
    const { q, orden } = preguntas[n];
    app.innerHTML = `<div class="bar"><i style="width:${n / preguntas.length * 100}%"></i></div>
      <p class="muted">Pregunta ${n + 1} de ${preguntas.length} · ${buenas} buenas</p>
      <h2>${q.p}</h2>${orden.map(i => `<button class="quiz-op" data-i="${i}">${q.o[i]}</button>`).join('')}
      <div id="exp"></div>`;
    $$('.quiz-op').forEach(b => b.onclick = () => {
      if ($('#exp').innerHTML) return;
      const i = +b.dataset.i, bien = i === q.r;
      quizDatos.marcar(q, bien);
      if (bien) buenas++; else malas.push(q);
      $$('.quiz-op').forEach(x => { if (+x.dataset.i === q.r) x.classList.add('ok'); });
      if (!bien) b.classList.add('no');
      $('#exp').innerHTML = `<div class="result ${bien ? 'ok' : 'bad'}"><b>${bien ? '✔ Correcto' : '✘ Incorrecto'}</b><br>${q.e}</div><button class="btn" id="sig">Siguiente →</button>`;
      $('#sig').onclick = () => { n++; pinta(); window.scrollTo(0, 0); };
      $('#sig').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };
  pinta();
  return errores ? 'Repaso de errores' : 'Examen';
};

VISTAS.glosario = () => {
  app.innerHTML = `<input id="q" type="search" placeholder="Buscar en inglés o español…" autocomplete="off">
    <p class="muted">Palabras que vienen en placas, manuales y códigos de error.</p><div id="lista"></div>`;
  const pinta = t => {
    const w = norm(t).trim();
    const l = GLOSARIO.filter(([en, es]) => !w || norm(en + ' ' + es).includes(w));
    $('#lista').innerHTML = l.map(([en, es]) => `<div class="glosa"><b>${esc(en)}</b><div>${esc(es)}</div></div>`).join('') || '<p class="muted">Sin resultados.</p>';
  };
  $('#q').addEventListener('input', e => pinta(e.target.value));
  pinta('');
  return 'Glosario';
};
