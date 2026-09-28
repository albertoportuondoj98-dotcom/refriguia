// Contenido técnico de RefriGuía: lecciones, fallas, examen, listas, tablas y glosario.
// Los valores son orientativos; siempre manda la placa y el manual del fabricante.

const LECCIONES = [
{ id: 'ciclo', icono: '🔄', titulo: 'El ciclo de refrigeración', html: `
<p>Todo equipo de aire acondicionado mueve calor de adentro hacia afuera con cuatro piezas:</p>
<ol>
<li><b>Compresor:</b> jala vapor frío a baja presión y lo aprieta. Sale vapor muy caliente a alta presión (descarga).</li>
<li><b>Condensador</b> (unidad de afuera): el vapor caliente suelta su calor al aire y se hace líquido. Sale líquido a alta presión, un poco más frío que su temperatura de condensación (subenfriado).</li>
<li><b>Expansión</b> (tubo capilar o válvula electrónica EEV): le baja la presión de golpe. Sale una mezcla fría de líquido y vapor.</li>
<li><b>Evaporador</b> (unidad de adentro): el refrigerante hierve y se roba el calor del cuarto. Sale vapor un poco más caliente que su temperatura de evaporación (sobrecalentado) y regresa al compresor.</li>
</ol>
<div class="nota">🔑 <b>Regla de oro:</b> donde hay líquido y vapor juntos (dentro del evaporador y del condensador), presión y temperatura van amarradas. Por eso sirve la tabla P-T: si sabes una, sabes la otra.</div>
<h3>En un minisplit</h3>
<ul>
<li>Tubo delgado = <b>línea de líquido</b>. Tubo grueso = <b>línea de gas (succión)</b>.</li>
<li>Las válvulas de servicio están en la condensadora. El pivote para manómetro casi siempre está en la válvula del tubo grueso.</li>
<li>En <b>modo calefacción</b> la válvula de 4 vías invierte el ciclo y el tubo grueso trae <b>alta presión</b>. Cuidado al conectar manómetros de baja.</li>
</ul>
<h3>En un equipo de ventana</h3>
<ul>
<li>Todo viene sellado de fábrica y casi nunca trae pivotes. La carga exacta en gramos viene en la placa.</li>
<li>Usa tubo capilar. Si se tapa el capilar o el filtro, la baja se va al piso y la alta sube.</li>
</ul>` },

{ id: 'shsc', icono: '🌡️', titulo: 'Sobrecalentamiento y subenfriamiento', html: `
<p>Son las dos medidas que te dicen si la carga de gas está bien, mucho mejor que sólo ver la presión.</p>
<h3>Sobrecalentamiento (SH)</h3>
<p>Cuántos grados se calentó el vapor <b>después</b> de terminar de hervir.</p>
<div class="formula">SH = temperatura del tubo de succión − temperatura de saturación (de la tabla)</div>
<ol>
<li>Pon el manómetro en el pivote de succión y lee la presión.</li>
<li>Con la tabla P-T convierte esa presión a temperatura de saturación.</li>
<li>Pon el termómetro de gancho en el tubo grueso a unos 10–15 cm de la válvula, bien pegado y aislado.</li>
<li>Resta: tubo − saturación.</li>
</ol>
<p><b>Ejemplo R410A:</b> 118 psi → saturación ≈ 4.4 °C. Tubo a 11 °C. SH = 11 − 4.4 = <b>6.6 °C</b>.</p>
<h3>Subenfriamiento (SC)</h3>
<p>Cuántos grados se enfrió el líquido <b>después</b> de condensarse.</p>
<div class="formula">SC = temperatura de saturación de alta − temperatura del tubo de líquido</div>
<p>Se usa sobre todo en equipos con válvula de expansión. Muchos minisplits no traen pivote de alta, entonces se usa SH o se carga por peso.</p>
<h3>Cómo leerlos (equipos con capilar, a plena carga y clima caluroso)</h3>
<ul>
<li>SH <b>alto</b> (más de 8–10 °C): le falta gas, o hay una restricción.</li>
<li>SH <b>bajo</b> (menos de 3 °C): exceso de gas o poco aire en la evaporadora. Riesgo de regresar líquido al compresor.</li>
<li>SC alto con baja presión de succión: restricción (capilar o filtro tapado).</li>
</ul>
<h3>Sobrecalentamiento objetivo</h3>
<p>El SH correcto cambia con el clima: con calor y cuarto seco se necesita menos, y con cuarto húmedo y fresco afuera, más. En <b>Herramientas → Sobrecalentamiento</b> puedes calcular el SH objetivo con la temperatura y humedad del cuarto y la temperatura de afuera (sólo para equipos con capilar).</p>
<div class="nota">⚠️ En inverter mide con el equipo en modo prueba o frío a 16 °C con ventilador alto, después de 10–15 min. Si el compresor está a baja velocidad las lecturas engañan.</div>` },

{ id: 'placa', icono: '🏷️', titulo: 'Cómo leer la placa de datos', html: `
<p>La placa (etiqueta) de la condensadora o del equipo de ventana trae casi todo lo que necesitas. Tómale foto y guárdala en la bitácora.</p>
<table>
<tr><td><b>Model</b></td><td>Modelo. En minisplit hay uno para la unidad interior y otro para la exterior.</td></tr>
<tr><td><b>Power supply</b></td><td>Voltaje, fases y frecuencia. Ej. 220 V ~ 1 fase 60 Hz, o 127 V.</td></tr>
<tr><td><b>Cooling capacity</b></td><td>Capacidad en BTU/h o en W. 3 517 W = 12 000 BTU/h = 1 tonelada.</td></tr>
<tr><td><b>Rated current / Input</b></td><td>Corriente (A) y potencia (W) de trabajo normal.</td></tr>
<tr><td><b>RLA</b></td><td>Amperaje nominal del compresor. Trabajando normalmente marca menos.</td></tr>
<tr><td><b>LRA</b></td><td>Amperaje con rotor trabado: lo que jala en el instante del arranque.</td></tr>
<tr><td><b>FLA</b></td><td>Amperaje de los motores ventiladores.</td></tr>
<tr><td><b>MCA</b></td><td>Ampacidad mínima del circuito: con esto eliges el calibre del cable.</td></tr>
<tr><td><b>MOP / MOCP</b></td><td>Protección máxima: el breaker no debe ser más grande que esto.</td></tr>
<tr><td><b>Refrigerant / Charge</b></td><td>Tipo de gas y carga de fábrica (g, kg u oz). En minisplit es para cierta longitud de tubería.</td></tr>
<tr><td><b>Design pressure</b></td><td>Presión de diseño (alta y baja). Nunca la rebases, ni en la prueba con nitrógeno.</td></tr>
</table>
<div class="nota">La herramienta <b>Cable y breaker</b> usa el MCA y el MOP de la placa. La etiqueta amarilla de eficiencia energética dice qué tan ahorrador es: número más alto = gasta menos luz.</div>` },

{ id: 'herramientas', icono: '🧰', titulo: 'Herramientas de medición', html: `
<ul>
<li><b>Manómetros (manifold):</b> analógicos o digitales. Los digitales ya traen las tablas P-T y calculan el sobrecalentamiento. Revisa que sirvan para tu gas: R410A y R32 ocupan escala de alta presión.</li>
<li><b>Vacuómetro de micrones:</b> es la única forma de saber si el vacío está bien.</li>
<li><b>Báscula de refrigerante:</b> para cargar por peso, que es lo correcto.</li>
<li><b>Pinza amperimétrica</b> que también mida µF y resistencia.</li>
<li><b>Termómetros:</b> de gancho para la tubería y de aire. Uno que mida humedad (higrómetro) sirve para el sobrecalentamiento objetivo.</li>
<li><b>Detector de fugas electrónico</b> apto para A2L, y espuma o agua con jabón.</li>
<li><b>Bomba de vacío de 2 etapas</b> y <b>recuperadora</b>.</li>
<li><b>Abocinador excéntrico, cortatubo, rimador, dobladora y torquímetro.</b></li>
<li><b>Megóhmetro</b> para revisar el aislamiento del compresor.</li>
<li><b>Nitrógeno con regulador</b> para pruebas y para soldar.</li>
</ul>
<div class="nota">Revisa tus instrumentos de vez en cuando: los manómetros deben marcar cero sin presión, y el termómetro debe marcar 0 °C en un vaso con agua y mucho hielo.</div>` },

{ id: 'r22', icono: '🟢', titulo: 'R22: lo que hay que saber', html: `
<ul>
<li><b>Tipo:</b> HCFC, sustancia pura. Daña la capa de ozono.</li>
<li><b>Situación:</b> por el Protocolo de Montreal su producción e importación se está eliminando. Cada vez hay menos y sale más caro. Lo que se recupera se debe limpiar y reutilizar, nunca tirarlo al aire.</li>
<li><b>Cilindro:</b> verde claro.</li>
<li><b>Aceite:</b> mineral o alquilbenceno.</li>
<li><b>Carga:</b> al ser puro se puede cargar como vapor por la succión.</li>
<li><b>Presiones de referencia</b> (clima caluroso, equipo trabajando bien): baja 60–75 psi, alta 225–275 psi.</li>
</ul>
<h3>Si el cliente tiene equipo de R22</h3>
<ul>
<li><b>No</b> se le puede meter R410A ni R32: trabajan a mucha más presión y usan otro aceite.</li>
<li>Existen gases "sustitutos" para R22 (por ejemplo R-422D o R-407C). Son mezclas: se cargan como líquido, cambian las presiones y a veces piden cambio de aceite. Si lo haces, etiqueta el equipo con el gas nuevo.</li>
<li>Muchas veces conviene más recomendarle al cliente cambiar a un equipo nuevo inverter.</li>
</ul>` },

{ id: 'r410a', icono: '🩷', titulo: 'R410A: lo que hay que saber', html: `
<ul>
<li><b>Tipo:</b> HFC, mezcla 50% R32 + 50% R125. Casi no se separa (casi azeotrópica).</li>
<li><b>Cilindro:</b> rosa.</li>
<li><b>Presión:</b> alrededor de 1.6 veces la del R22. Baja típica 115–140 psi, alta 340–420 psi.</li>
<li><b>Carga:</b> <b>siempre como líquido</b> (cilindro de cabeza o con tubo sifón). Por la succión, despacio y estrangulando la llave para no mandar líquido al compresor.</li>
<li><b>Aceite POE:</b> absorbe humedad muy rápido. Tapa los tubos, no dejes el sistema abierto y siempre haz buen vacío.</li>
<li><b>Herramienta:</b> manómetros y mangueras para alta presión (800 psi en alta). En tubo de 1/2" y 5/8" las tuercas flare de R410A son más grandes que las de R22.</li>
</ul>
<div class="nota">Si hubo fuga, en la práctica se puede completar la carga porque casi no se separa. Lo que piden los fabricantes es recuperar todo y cargar por peso.</div>` },

{ id: 'r32', icono: '🔥', titulo: 'R32 y seguridad (¡importante!)', html: `
<div class="alerta">El R32 es <b>A2L: levemente inflamable</b>. No explota como el gas LP, pero sí puede prender si hay una fuga en un lugar cerrado y una chispa o flama.</div>
<h3>Datos</h3>
<ul>
<li><b>Tipo:</b> HFC puro (difluorometano). Es la mitad del R410A.</li>
<li><b>Presión:</b> muy parecida al R410A, un poco más alta (3–5%). Temperatura de descarga más alta.</li>
<li><b>Carga:</b> al ser puro se puede cargar como vapor o líquido. Los equipos llevan menos gas que uno de R410A del mismo tamaño.</li>
<li><b>Aceite:</b> POE o PVE según la marca. Absorbe humedad igual que el de R410A.</li>
<li><b>Ambiente:</b> calienta el planeta unas 3 veces menos que el R410A.</li>
<li>Es <b>más pesado que el aire</b>: si hay fuga se junta en el piso, en sótanos y en zanjas.</li>
<li>Si se quema, suelta ácido fluorhídrico, que es muy tóxico. No respires humo de un equipo quemado.</li>
</ul>
<h3>Reglas de seguridad</h3>
<ol>
<li>Ventila bien donde trabajas. No fumes y aleja flamas y chispas.</li>
<li><b>Nunca soldar con gas en el sistema.</b> Primero recupera, luego haz vacío, barre con nitrógeno y suelda con nitrógeno corriendo.</li>
<li>Usa detector de fugas que diga que sirve para A2L. Nunca busques fugas con flama.</li>
<li>La bomba de vacío y la recuperadora deben ser aptas para A2L (motor sin chispa).</li>
<li>Algunos cilindros de gases inflamables traen rosca izquierda y ocupan adaptador.</li>
<li>Ten un extintor de polvo a la mano.</li>
<li>Haz abocinados nuevos: no reutilices los viejos. Aprieta con torquímetro.</li>
<li>No le metas más gas del que dice la placa. El fabricante calculó la carga máxima según el tamaño del cuarto.</li>
<li><b>No es lo mismo que R410A:</b> aunque las presiones se parezcan, no se mezclan ni se cambia uno por otro.</li>
</ol>
<h3>Si hay fuga dentro de un cuarto</h3>
<ul>
<li>Abre puertas y ventanas, apaga flamas y sal del cuarto.</li>
<li>No conectes ni desconectes aparatos ahí dentro, porque eso hace chispa.</li>
<li>Regresa cuando se haya ventilado.</li>
</ul>` },

{ id: 'inverter', icono: '⚡', titulo: 'Equipos inverter', html: `
<ul>
<li>El compresor cambia de velocidad. La tarjeta lo controla según la temperatura del cuarto.</li>
<li>Por eso las presiones y el amperaje cambian todo el tiempo. Para medir, pon el <b>modo prueba</b> (test) o frío a 16 °C con ventilador alto y espera 10–15 min.</li>
<li>Lo mejor en inverter es <b>cargar por peso</b> con báscula, usando la carga de la placa.</li>
<li>El compresor inverter casi siempre es <b>trifásico</b> (terminales U, V, W). Entre las tres terminales la resistencia debe ser igual. <b>No lleva capacitor de arranque.</b></li>
<li>Los ventiladores suelen ser motores DC controlados por la tarjeta.</li>
</ul>
<div class="alerta">⚡ Los capacitores grandes de la tarjeta exterior guardan 300–400 V de corriente directa aunque desconectes el equipo. Espera varios minutos y mide que estén descargados antes de meter mano.</div>
<h3>Sensores (termistores)</h3>
<ul>
<li>Miden la temperatura del cuarto, del serpentín, de la descarga y del exterior.</li>
<li>Valores comunes a 25 °C: 5 kΩ, 10 kΩ, 15 kΩ, 20 kΩ o 50 kΩ, según la marca. Si está abierto (OL) o en corto, la tarjeta marca error.</li>
<li>Al calentarlo con la mano la resistencia debe bajar poco a poco. Usa la herramienta <b>Sensores</b> para comparar.</li>
</ul>
<h3>Códigos de error</h3>
<p>Cambian con cada marca y modelo. Busca la tabla en la tapa de la evaporadora o en el manual y guárdala en <b>Bitácora → Mis apuntes</b> para tenerla siempre.</p>` },

{ id: 'ventana', icono: '🪟', titulo: 'Equipos de ventana', html: `
<ul>
<li>Todo viene en una pieza: compresor, condensador (la parte de afuera), evaporador (la de adentro) y un motor de doble flecha que mueve la turbina de adentro y el aspa de afuera.</li>
<li>Usa <b>tubo capilar</b> y lleva poco gas: unos gramos de más o de menos cambian mucho cómo trabaja. Cárgalo siempre por peso con lo que dice la placa.</li>
<li>Casi nunca trae pivotes. Para medir o cargar hay que poner una válvula de perforar o soldar un pivote en el tubo de proceso del compresor. Las válvulas de perforar pueden fugar con el tiempo: si se va a quedar puesta, mejor soldada (nunca con R32 o R290 adentro).</li>
<li>El agua de la charola la salpica el anillo del aspa sobre el condensador para ayudar a enfriarlo. <b>El ruido de agua salpicando es normal.</b></li>
<li>Se instala un poco inclinado hacia afuera (más o menos 6 mm, ¼") para que el agua no escurra hacia adentro.</li>
<li>Los viejos traen termostato mecánico con un bulbo frente al evaporador; los nuevos, sensor electrónico (termistor).</li>
<li>El capacitor casi siempre es doble: compresor (HERM) y ventilador (FAN).</li>
<li>Los modelos nuevos pueden traer <b>R32 o R290</b>. Revisa la placa antes de soldar o perforar.</li>
</ul>
<div class="nota">Si el compresor se dañó, compara el costo de la reparación con el de un equipo nuevo antes de dar precio.</div>` },

{ id: 'calor', icono: '♨️', titulo: 'Calefacción (bomba de calor)', html: `
<ul>
<li>Los minisplits "frío-calor" traen una <b>válvula de 4 vías</b> que invierte el ciclo: la evaporadora se vuelve condensador y la condensadora se vuelve evaporador.</li>
<li>En la mayoría de los minisplits la bobina de la válvula de 4 vías se energiza en calefacción. Si no calienta, mide si le llega voltaje a la bobina y su resistencia.</li>
<li>Al arrancar en calor, la evaporadora tarda en soplar hasta que el serpentín se calienta (protección contra aire frío). Es normal.</li>
<li><b>Deshielo:</b> con frío afuera, la condensadora se escarcha. Cada cierto tiempo el equipo se pasa a frío unos minutos para derretirla y sale agua y vapor por afuera. Es normal.</li>
<li>En calefacción el tubo grueso lleva <b>alta presión</b>. Cuidado con el manómetro de baja.</li>
<li>La carga de gas se revisa en modo frío.</li>
</ul>` },

{ id: 'vacio', icono: '🌀', titulo: 'Vacío y prueba de hermeticidad', html: `
<h3>1. Prueba con nitrógeno</h3>
<ul>
<li>Sólo nitrógeno seco, <b>con regulador</b>. Nunca oxígeno ni aire comprimido.</li>
<li>Presión de prueba según el fabricante, sin pasar la presión de diseño de la placa. Como guía: R410A y R32 unos 400–550 psi; R22 unos 150–300 psi.</li>
<li>Pasa espuma por todas las uniones. Deja la presión un rato y verifica que no baje (si cambia la temperatura, la presión cambia un poco).</li>
</ul>
<h3>2. Vacío</h3>
<ul>
<li>Bomba de 2 etapas con aceite limpio y <b>vacuómetro de micrones</b>. El manómetro normal no sirve para saber si hay buen vacío.</li>
<li>Meta: <b>500 micrones o menos</b>.</li>
<li>Mangueras cortas y gruesas. Si puedes, quita el obús (pivote) con la herramienta para que jale más rápido.</li>
</ul>
<h3>3. Prueba de retención</h3>
<p>Cierra la válvula hacia la bomba y espera 10–15 minutos:</p>
<ul>
<li>Sube un poco y se queda abajo de 1000 micrones: <b>bien</b>.</li>
<li>Sube y se estabiliza alto: hay <b>humedad</b>. Sigue haciendo vacío.</li>
<li>Sube y sigue subiendo sin parar: hay <b>fuga</b>.</li>
</ul>
<div class="nota">La práctica vieja de "purgar con el mismo gas" no quita la humedad, desperdicia gas y está prohibida. Haz vacío siempre.</div>` },

{ id: 'flare', icono: '🔧', titulo: 'Abocinado, torque y soldadura', html: `
<h3>Abocinado (flare)</h3>
<ol>
<li>Corta con cortatubo, no con segueta.</li>
<li>Rima con el tubo hacia abajo para que la rebaba caiga afuera.</li>
<li>Mete la tuerca <b>antes</b> de abocinar.</li>
<li>El abocinado debe quedar liso, parejo y sin grietas. Usa la medida de herramienta para el gas que trabajas.</li>
<li>Aprieta con torquímetro (ve la tabla en <b>Torque, tuberías y presiones</b>). Si aprietas de más se agrieta y si aprietas de menos se fuga.</li>
</ol>
<h3>Soldadura</h3>
<ul>
<li>Cobre con cobre: soldadura de plata fosforada (de 0 a 15% de plata). No necesita fundente.</li>
<li>Cobre con latón o acero: soldadura de plata con fundente.</li>
<li>Siempre <b>con nitrógeno corriendo</b> a bajo flujo por dentro del tubo, para que no se forme cascarilla. La cascarilla tapa el capilar y la válvula.</li>
<li>Protege válvulas y sensores con trapo mojado o pasta térmica.</li>
<li>Con R32 nunca se suelda si hay gas en el sistema.</li>
</ul>` },

{ id: 'carga', icono: '⚖️', titulo: 'Carga de refrigerante', html: `
<ul>
<li><b>La forma correcta es por peso</b>, con báscula y la carga que dice la placa.</li>
<li>Si la tubería del minisplit es más larga que lo que trae precargado (casi siempre 5 m, a veces 7.5 m), se agrega gas por cada metro extra. Usa la calculadora <b>Carga por metro extra</b>.</li>
<li>R410A: siempre en líquido. R22 y R32: son puros y se pueden cargar como vapor.</li>
<li>Cargando líquido por la succión con el equipo trabajando: poco a poco y estrangulando la llave.</li>
<li>Para afinar con el equipo trabajando usa el sobrecalentamiento objetivo, no sólo la presión.</li>
<li>Equipos de ventana: vienen sellados. Hay que poner una válvula de servicio (de perforar o soldada al tubo de proceso). Al terminar, deja la carga exacta de la placa.</li>
</ul>
<div class="nota">Si un equipo "sólo necesita gas", tiene una fuga. Busca y repara la fuga antes de cargar, o en unas semanas va a fallar igual.</div>` },

{ id: 'recuperacion', icono: '♻️', titulo: 'Recuperar el gas y pump down', html: `
<h3>Pump down (guardar el gas en la condensadora)</h3>
<p>Se usa para desinstalar o mover un minisplit sin tirar el gas.</p>
<ol>
<li>Pon el equipo en frío (modo prueba) y déjalo trabajar unos 10 minutos.</li>
<li>Conecta el manómetro en el pivote de la válvula de gas (tubo grueso).</li>
<li>Cierra la válvula de <b>líquido</b> (tubo delgado) con llave Allen.</li>
<li>Cuando la baja llegue a 0 psi (1 a 2 minutos), cierra la válvula de <b>gas</b>.</li>
<li><b>Apaga el equipo de inmediato.</b> No lo dejes trabajando en vacío.</li>
<li>Desconecta la tubería sólo con el equipo apagado. Si el compresor trabaja con la tubería abierta, se mete aire y puede explotar.</li>
<li>Tapa las válvulas y los tubos.</li>
</ol>
<h3>Recuperación con máquina</h3>
<ul>
<li>Máquina recuperadora y cilindro de recuperación (gris con tapa amarilla) sobre la báscula.</li>
<li>No llenes el cilindro a más del 80%. Muchos traen marcado el peso máximo.</li>
<li>Un solo tipo de gas por cilindro, y etiquetado. No mezcles gases.</li>
<li>Recupera primero en líquido (más rápido) y luego en vapor.</li>
<li>Para R32 o R290 la recuperadora debe ser apta para gases inflamables.</li>
<li>Lleva el gas recuperado con tu proveedor o a un centro de acopio para reciclarlo.</li>
</ul>` },

{ id: 'electrico', icono: '🔌', titulo: 'Electricidad: capacitores y compresor', html: `
<h3>Capacitores</h3>
<ul>
<li><b>Descárgalo antes de tocarlo</b>, con una resistencia (por ejemplo 20 kΩ de 5 W). No con desarmador.</li>
<li>Mídelo con el multímetro en µF. Tolerancia normal ±5% o ±6% (viene impresa).</li>
<li>Si está inflado, escurriendo o bajo de valor, cámbialo.</li>
<li>Capacitor doble: <b>C</b> = común, <b>HERM</b> = compresor, <b>FAN</b> = ventilador.</li>
<li>Prueba con el equipo trabajando: µF = 2652 × amperes ÷ voltaje en el capacitor (a 60 Hz). Está en la calculadora de capacitores.</li>
</ul>
<h3>Compresor monofásico (C, S, R)</h3>
<ul>
<li>C-R = marcha (la resistencia más baja). C-S = arranque (media). R-S = la más alta, y es igual a la suma de las otras dos.</li>
<li>Si entre dos terminales marca OL, hay un devanado abierto. Revisa primero el protector térmico: si el compresor está caliente puede estar abierto por temperatura, así que espera a que enfríe.</li>
<li>Cualquier lectura de una terminal a la carcasa (tierra) es mala señal. Con megóhmetro, menos de 1–2 MΩ indica aislamiento dañado.</li>
<li>El amperaje de trabajo casi siempre es menor que el RLA de la placa. Si arranca con el LRA y no baja, está trabado o le falta capacitor.</li>
</ul>
<h3>Voltaje y cableado</h3>
<ul>
<li>Mide el voltaje con el equipo arrancando. Si cae más de 10%, el cable es delgado o hay mala conexión.</li>
<li>El calibre del cable y el breaker salen del MCA y el MOP de la placa. Usa <b>Cable y breaker</b>.</li>
<li>Siempre conecta la tierra física.</li>
</ul>` },

{ id: 'mantto', icono: '🧽', titulo: 'Mantenimiento preventivo', html: `
<ul>
<li>Lava los filtros de la evaporadora.</li>
<li>Lava el serpentín de la evaporadora con líquido limpiador no ácido y bolsa de lavado. Lava también la turbina (blower), que junta mucha mugre.</li>
<li>Limpia la charola y destapa el drenaje. Pruébalo echando agua.</li>
<li>Lava el condensador de adentro hacia afuera con agua a presión moderada, sin doblar las aletas.</li>
<li>Aprieta las conexiones eléctricas y revisa si hay cables quemados o pelados.</li>
<li>Mide voltaje, amperaje y el capacitor.</li>
<li>Mide la diferencia de temperatura entre el aire que entra y el que sale de la evaporadora: normalmente 8–12 °C en frío.</li>
<li>Revisa el aislamiento de la tubería y los soportes.</li>
</ul>
<p>Usa la lista <b>Mantenimiento preventivo</b> en Herramientas para no saltarte nada.</p>` },

{ id: 'futuro', icono: '🌎', titulo: 'Normas y gases nuevos', html: `
<ul>
<li><b>No ventear:</b> el refrigerante se recupera en un cilindro de recuperación (gris con tapa amarilla). Nunca rellenes los cilindros desechables.</li>
<li><b>Protocolo de Montreal:</b> elimina los gases que dañan el ozono (R22).</li>
<li><b>Enmienda de Kigali:</b> va reduciendo los HFC que calientan mucho el planeta (R410A). Por eso las marcas se están pasando a R32.</li>
</ul>
<h3>Gases que vienen</h3>
<ul>
<li><b>R32 (A2L):</b> ya es el estándar en minisplits nuevos.</li>
<li><b>R454B (A2L):</b> sustituto del R410A en equipos centrales, sobre todo en EE.UU. Es mezcla y se carga como líquido.</li>
<li><b>R290 (propano, A3, MUY inflamable):</b> ya aparece en equipos de ventana, portátiles y algunos minisplits chicos. Trabaja a presiones parecidas al R22, lleva cargas pequeñas, se trabaja con herramienta para A3 y nunca se suelda con gas. Si ves la etiqueta de flama en un equipo de ventana, trátalo como gas LP.</li>
</ul>
<div class="nota">Revisa siempre la placa: dice el gas, la carga en gramos y la presión de diseño.</div>` },
];

// Diagnóstico por síntomas. "h" = herramientas relacionadas.
const FALLAS = [
{ t: 'No enfría o enfría poco', h: ['dt', 'diag', 'sh', 'cap'], causas: [
  'Filtros o serpentín de la evaporadora sucios (poco aire)',
  'Condensador sucio o ventilador exterior fallando',
  'Falta de gas por una fuga',
  'Capacitor débil: el compresor trabaja mal o no arranca',
  'Compresor sin compresión (válvulas internas dañadas)',
  'Equipo chico para el cuarto, o mucho sol y puertas abiertas',
  'Inverter: sensor dañado o tarjeta limitando la velocidad'],
  revisar: [
  'Mide la diferencia de temperatura entre el aire que entra y el que sale de la evaporadora (normal 8–12 °C)',
  'Mira si el compresor y el ventilador de afuera trabajan',
  'Mide presiones y sobrecalentamiento',
  'Mide el amperaje y compáralo con el RLA de la placa',
  'Revisa el capacitor en µF'] },
{ t: 'No enciende nada', h: [], causas: [
  'No llega voltaje (breaker, fusible, clavija, cable)',
  'Fusible de la tarjeta quemado',
  'Transformador o fuente de la tarjeta dañada',
  'Control remoto sin pilas, o receptor dañado',
  'Equipo de ventana: selector o termostato dañado'],
  revisar: [
  'Mide el voltaje en la clema de la evaporadora',
  'Revisa el fusible de la tarjeta; si está quemado, busca por qué antes de cambiarlo (corto en un motor o en el compresor)',
  'Prueba el control con la cámara del celular: al apretar un botón se ve un foquito',
  'Busca el botón de encendido manual en la evaporadora'] },
{ t: 'El compresor no arranca, zumba o bota el térmico', h: ['cap', 'comp', 'cable'], causas: [
  'Capacitor dañado',
  'Voltaje bajo al arrancar',
  'Contactor o relé con los contactos quemados',
  'Devanado abierto o en corto',
  'Compresor trabado (mecánico)',
  'Presiones sin igualar: arrancó recién apagado'],
  revisar: [
  'Mide el capacitor',
  'Mide el voltaje en el compresor al momento del arranque',
  'Mide los devanados con la herramienta de terminales',
  'Espera 3–5 min a que se igualen las presiones y vuelve a intentar',
  'Si es inverter: mide U-V-W (deben ser iguales) y revisa el código de error'] },
{ t: 'Se bota el breaker o se quema el fusible', h: ['comp', 'cable', 'cap'], causas: [
  'Compresor aterrizado (devanado en corto a la carcasa)',
  'Corto en un motor ventilador o en el cableado',
  'Capacitor en corto',
  'Breaker más chico de lo que pide la placa, o breaker débil por uso',
  'Compresor trabado: jala el LRA y no baja',
  'Cable delgado o conexiones flojas que se calientan'],
  revisar: [
  'Mide cada terminal del compresor a la carcasa (con megóhmetro si tienes)',
  'Mide los devanados del compresor',
  'Compara el breaker y el cable con el MCA y MOP de la placa',
  'Mide el amperaje al arrancar y trabajando',
  'Revisa que no haya cables quemados o derretidos'] },
{ t: 'El ventilador de afuera no gira', h: ['cap'], causas: [
  'Capacitor del ventilador (FAN) dañado',
  'Motor con baleros trabados o devanado abierto',
  'Relé de la tarjeta que no activa (inverter o tarjeta exterior)',
  'Aspa atorada con basura'],
  revisar: [
  'Con el equipo apagado, gira el aspa con la mano: debe girar libre',
  'Mide la parte FAN del capacitor',
  'Mide si llega voltaje al motor',
  'Si el motor es DC (de 5 cables), el problema puede ser la tarjeta'] },
{ t: 'Se congela la evaporadora o el tubo', h: ['dt', 'sh', 'diag'], causas: [
  'Filtros o turbina sucios (poco aire)',
  'Motor de la evaporadora lento',
  'Falta de gas (se congela sólo una parte o la entrada)',
  'Restricción en el capilar o el filtro',
  'Temperatura exterior muy baja con el equipo en frío'],
  revisar: [
  'Primero apaga y deja descongelar. Luego lava filtros y turbina',
  'Mide el sobrecalentamiento con el hielo ya derretido',
  'Si se congela sólo después de un punto de la tubería: restricción ahí'] },
{ t: 'Gotea agua dentro de la casa', h: ['nivel'], causas: [
  'Drenaje tapado (lodo, lama, insectos)',
  'Manguera de drenaje sin caída o doblada',
  'Evaporadora mal nivelada',
  'Equipo de ventana sin inclinación hacia afuera',
  'Charola rota',
  'Tubería sin aislamiento que "suda"',
  'Evaporador congelado que se derrite de golpe'],
  revisar: [
  'Echa agua en la charola y verifica que salga afuera',
  'Sopla el drenaje con nitrógeno a baja presión o con bomba de agua',
  'Revisa el nivel de la evaporadora con la herramienta Nivel (nivelada o con caída ligera hacia el lado del drenaje)',
  'El equipo de ventana debe quedar unos 6 mm más bajo hacia afuera'] },
{ t: 'El equipo prende y se apaga solo (ciclos cortos)', h: ['sensor', 'cable'], causas: [
  'Sensor de temperatura del cuarto dañado o mal colocado',
  'Condensador sucio: se dispara por alta presión o temperatura',
  'Protector térmico del compresor abriendo por calentamiento',
  'Equipo muy grande para el cuarto',
  'Voltaje inestable'],
  revisar: [
  'Mide el sensor del cuarto con la herramienta Sensores',
  'Lava el condensador',
  'Mide amperaje y voltaje durante un ciclo completo'] },
{ t: 'No calienta (modo calefacción)', h: ['sensor'], causas: [
  'La válvula de 4 vías no cambia (bobina abierta, sin voltaje o válvula pegada)',
  'Está haciendo deshielo: es normal que pare unos minutos',
  'Protección de aire frío: todavía no se calienta el serpentín',
  'Sensor exterior o de tubería dañado',
  'Falta de gas',
  'El equipo es sólo frío (revisa el modelo)'],
  revisar: [
  'Mide la resistencia de la bobina de la 4 vías y si le llega voltaje en modo calor',
  'Toca los tubos: en calor el tubo grueso debe estar caliente',
  'Revisa los sensores',
  'Revisa la carga de gas en modo frío'] },
{ t: 'Ruido o vibración', h: ['sh'], causas: [
  'Tornillos o soportes flojos',
  'Tubería tocando la lámina',
  'Aspa o turbina desbalanceada o rota',
  'Baleros del motor gastados',
  'Compresor con golpe: le llega líquido (exceso de gas o SH muy bajo)'],
  revisar: [
  'Aprieta tornillería y revisa las gomas del compresor',
  'Separa las tuberías que vibran',
  'Mide el sobrecalentamiento'] },
{ t: 'Mal olor', h: [], causas: [
  'Hongos y lama en el serpentín, la turbina o la charola',
  'Agua estancada en la charola',
  'Filtros muy sucios'],
  revisar: [
  'Lavado profundo de evaporadora y turbina con limpiador y bolsa',
  'Destapa el drenaje',
  'Recomienda al cliente usar el modo ventilador unos minutos antes de apagar'] },
{ t: 'Presiones raras', h: ['diag'], causas: [
  'Usa Diagnóstico por presiones: pones las temperaturas y lo que marcan los manómetros, y te dice si la baja y la alta están bien y las causas probables'],
  revisar: ['Mide siempre con el equipo estable, después de 10–15 min trabajando'] },
];

// Examen de repaso. "r" = índice de la respuesta correcta (las opciones se revuelven al mostrarlas).
const QUIZ = [
{ p: '¿Qué componente convierte el vapor de alta presión en líquido?', o: ['Evaporador', 'Condensador', 'Compresor', 'Tubo capilar'], r: 1, e: 'El condensador (unidad exterior) saca el calor y el vapor se hace líquido.' },
{ p: 'En un minisplit en modo frío, el tubo grueso es…', o: ['La línea de líquido', 'La línea de gas o succión', 'La descarga', 'El drenaje'], r: 1, e: 'Tubo delgado = líquido; tubo grueso = gas o succión (en modo frío).' },
{ p: '¿Cómo se debe cargar el R410A?', o: ['Como vapor siempre', 'Como líquido', 'Da igual', 'Sólo por la alta'], r: 1, e: 'Es una mezcla. Se carga como líquido, poco a poco y estrangulando por la succión.' },
{ p: 'El R32 está clasificado como…', o: ['A1: no inflamable', 'A2L: levemente inflamable', 'A3: muy inflamable', 'B1: tóxico'], r: 1, e: 'A2L: baja toxicidad y levemente inflamable.' },
{ p: 'Antes de soldar en un equipo de R32 debes…', o: ['Soldar rápido', 'Recuperar el gas, hacer vacío y barrer con nitrógeno', 'Sólo abrir las válvulas', 'Echar agua'], r: 1, e: 'Nunca se suelda con gas inflamable en el sistema.' },
{ p: '¿Cuál es la meta de vacío recomendada?', o: ['30 inHg en el manómetro', '500 micrones o menos', '5000 micrones', '0 psi'], r: 1, e: '500 micrones o menos, medido con vacuómetro de micrones.' },
{ p: 'En la prueba de retención el vacuómetro sube y no deja de subir. ¿Qué hay?', o: ['Humedad', 'Una fuga', 'Está perfecto', 'Exceso de aceite'], r: 1, e: 'Si sube sin parar hay fuga. Si sube y se estabiliza alto, es humedad.' },
{ p: 'Sobrecalentamiento es…', o: ['Temperatura de saturación menos la del tubo de líquido', 'Temperatura del tubo de succión menos la de saturación', 'La temperatura de descarga', 'La diferencia de aire'], r: 1, e: 'SH = T tubo de succión − T de saturación (de la tabla).' },
{ p: 'Sobrecalentamiento muy alto (más de 12 °C) en un equipo con capilar indica casi siempre…', o: ['Exceso de gas', 'Falta de gas o restricción', 'Todo bien', 'Condensador sucio'], r: 1, e: 'Llega poco refrigerante al evaporador: falta de gas o capilar o filtro tapado.' },
{ p: 'Baja ALTA y alta BAJA al mismo tiempo sugiere…', o: ['Falta de gas', 'Compresor ineficiente o válvula de 4 vías pasando', 'Exceso de gas', 'Filtro sucio'], r: 1, e: 'El compresor no hace diferencia de presión: válvulas dañadas o fuga interna de alta a baja.' },
{ p: 'Baja ALTA y alta ALTA con sobrecalentamiento bajo indica…', o: ['Exceso de refrigerante', 'Falta de refrigerante', 'Restricción', 'Todo bien'], r: 0, e: 'Sobra gas: presiones altas y el sobrecalentamiento se va abajo.' },
{ p: 'Con R410A, una succión de 118 psi equivale a una saturación de aproximadamente…', o: ['−5 °C', '4.4 °C', '15 °C', '25 °C'], r: 1, e: '118 psi en R410A ≈ 40 °F ≈ 4.4 °C.' },
{ p: 'Con R22, una succión de 68 psi equivale a una saturación de aproximadamente…', o: ['4.4 °C', '−10 °C', '12 °C', '20 °C'], r: 0, e: '68.5 psi en R22 ≈ 40 °F ≈ 4.4 °C.' },
{ p: 'En un compresor monofásico, la resistencia más alta está entre…', o: ['C y R', 'C y S', 'R y S', 'C y tierra'], r: 2, e: 'R-S es la más alta y es igual a la suma de C-R y C-S.' },
{ p: 'Mides C-R = 2 Ω y C-S = 5 Ω. ¿Cuánto debería dar R-S?', o: ['3 Ω', '7 Ω', '10 Ω', '2.5 Ω'], r: 1, e: 'R-S = C-R + C-S = 2 + 5 = 7 Ω.' },
{ p: 'El compresor de un minisplit inverter normalmente…', o: ['Usa capacitor de arranque grande', 'Es trifásico (U, V, W) y no usa capacitor', 'Tiene terminales C, S, R', 'Trabaja siempre a la misma velocidad'], r: 1, e: 'Lo mueve la tarjeta con 3 fases. Entre U, V y W la resistencia debe ser igual.' },
{ p: 'Un capacitor de 35 µF ±6% mide 31 µF. ¿Está bien?', o: ['Sí', 'No, está bajo', 'No, está alto', 'Sólo si es doble'], r: 1, e: 'El mínimo es 35 × 0.94 = 32.9 µF. 31 µF está bajo: se cambia.' },
{ p: 'La fórmula para calcular µF con el equipo trabajando (60 Hz) es…', o: ['µF = V ÷ A', 'µF = 2652 × A ÷ V', 'µF = A × V', 'µF = 1000 ÷ V'], r: 1, e: 'µF = 2652 × amperes del devanado de arranque ÷ voltaje en el capacitor.' },
{ p: '¿Con qué se hace la prueba de hermeticidad?', o: ['Oxígeno', 'Aire comprimido', 'Nitrógeno seco con regulador', 'El mismo refrigerante'], r: 2, e: 'Nitrógeno seco. El oxígeno con aceite puede explotar.' },
{ p: '¿Por qué se suelda con nitrógeno corriendo por dentro?', o: ['Para enfriar', 'Para que no se forme cascarilla (óxido)', 'Para detectar fugas', 'No es necesario'], r: 1, e: 'La cascarilla se despega y tapa el capilar, la EEV y el filtro.' },
{ p: 'El aceite POE (R410A y R32)…', o: ['No absorbe humedad', 'Absorbe humedad muy rápido', 'Es igual al mineral', 'Se usa en R22'], r: 1, e: 'Absorbe mucha humedad. Tapa tubos y haz buen vacío.' },
{ p: '¿Se puede meter R410A en un equipo de R22?', o: ['Sí, enfría más', 'No: más presión y otro aceite', 'Sólo en ventana', 'Sí, mezclado'], r: 1, e: 'El R410A trabaja a ~1.6 veces la presión y usa aceite POE.' },
{ p: 'Si hay una fuga de R32, ¿dónde se acumula?', o: ['En el techo', 'En el piso y lugares bajos', 'Se va de inmediato', 'Dentro de la evaporadora'], r: 1, e: 'Es más pesado que el aire: se junta abajo.' },
{ p: 'La diferencia de temperatura de aire (entra vs. sale) normal en frío es…', o: ['1–3 °C', '8–12 °C', '20–25 °C', '30 °C'], r: 1, e: 'Normalmente 8–12 °C, dependiendo de la humedad y la velocidad.' },
{ p: 'Una tonelada de refrigeración equivale a…', o: ['1000 BTU/h', '12 000 BTU/h', '9000 BTU/h', '3.5 BTU/h'], r: 1, e: '1 TR = 12 000 BTU/h ≈ 3.52 kW.' },
{ p: 'Un minisplit de 24 000 BTU/h es de…', o: ['1 tonelada', '1.5 toneladas', '2 toneladas', '3 toneladas'], r: 2, e: '24 000 ÷ 12 000 = 2 toneladas.' },
{ p: 'Antes de tocar la tarjeta exterior de un inverter hay que…', o: ['Nada', 'Esperar y medir que los capacitores estén descargados', 'Mojarla', 'Quitar el gas'], r: 1, e: 'Los capacitores guardan 300–400 V DC por varios minutos.' },
{ p: 'Un equipo de ventana con etiqueta de flama y gas R290 es…', o: ['No inflamable', 'Muy inflamable (A3)', 'Igual al R22', 'Tóxico'], r: 1, e: 'El R290 es propano: A3, muy inflamable. Trátalo como gas LP.' },
{ p: 'Al terminar la instalación de un minisplit, ¿qué válvula se abre primero?', o: ['La de gas', 'La de líquido', 'Las dos juntas', 'Ninguna'], r: 1, e: 'Normalmente primero la de líquido y luego la de gas. Sigue el manual del equipo.' },
{ p: 'Si un equipo "sólo necesita gas", lo correcto es…', o: ['Cargar y listo', 'Buscar y reparar la fuga, hacer vacío y cargar por peso', 'Ventear el resto', 'Cambiar el compresor'], r: 1, e: 'Si le falta gas es porque hay una fuga.' },
{ p: 'El dato MCA de la placa sirve para elegir…', o: ['El calibre del cable', 'La carga de gas', 'El capacitor', 'La tubería'], r: 0, e: 'MCA = ampacidad mínima del circuito: el cable debe aguantar al menos eso.' },
{ p: 'El dato MOP (o MOCP) de la placa indica…', o: ['El breaker más grande permitido', 'La presión máxima', 'El amperaje de arranque', 'La potencia del ventilador'], r: 0, e: 'Es la protección máxima contra sobrecorriente: el breaker no debe pasar de ese valor.' },
{ p: '¿Qué significa LRA en la placa?', o: ['Amperaje de trabajo', 'Amperaje con rotor trabado (arranque)', 'Voltaje mínimo', 'Carga de gas'], r: 1, e: 'Locked Rotor Amps: lo que jala el compresor en el instante del arranque o si está trabado.' },
{ p: 'Un equipo de ventana se instala…', o: ['Perfectamente nivelado', 'Un poco inclinado hacia afuera', 'Inclinado hacia adentro', 'Da igual'], r: 1, e: 'Unos 6 mm más bajo hacia afuera, para que el agua no escurra dentro de la casa.' },
{ p: 'En un equipo de ventana se oye agua salpicando. Eso es…', o: ['Fuga de gas', 'Normal: el aspa salpica el agua sobre el condensador', 'Compresor dañado', 'Drenaje tapado'], r: 1, e: 'El anillo del aspa salpica el agua de la charola para ayudar a enfriar el condensador.' },
{ p: 'En el pump down, ¿qué válvula se cierra primero?', o: ['La de gas (tubo grueso)', 'La de líquido (tubo delgado)', 'Las dos a la vez', 'Ninguna'], r: 1, e: 'Primero la de líquido; cuando la baja llega a 0 psi se cierra la de gas y se apaga el equipo.' },
{ p: 'Durante el pump down, ¿cuándo se desconecta la tubería?', o: ['Con el compresor trabajando', 'Con el equipo ya apagado', 'Antes de cerrar las válvulas', 'Da igual'], r: 1, e: 'Con el compresor trabajando y la tubería abierta entra aire y puede explotar.' },
{ p: 'Un cilindro de recuperación se llena como máximo al…', o: ['50%', '80%', '100%', '120%'], r: 1, e: 'Máximo 80%, para dejar espacio a la expansión del líquido.' },
{ p: 'En modo calefacción, el tubo grueso de un minisplit lleva…', o: ['Baja presión', 'Alta presión', 'Agua', 'Nada'], r: 1, e: 'La válvula de 4 vías invierte el ciclo y el tubo grueso se vuelve descarga.' },
{ p: 'En invierno sale vapor de la condensadora y el equipo deja de calentar unos minutos. Es…', o: ['Una fuga', 'El deshielo: es normal', 'Falta de gas', 'Corto en la tarjeta'], r: 1, e: 'El equipo invierte a frío un rato para derretir la escarcha de la condensadora.' },
{ p: 'Al calentar un termistor NTC con la mano, su resistencia…', o: ['Sube', 'Baja', 'No cambia', 'Se va a cero'], r: 1, e: 'NTC = coeficiente negativo: a más temperatura, menos resistencia.' },
{ p: 'Un sensor de 10 kΩ a 25 °C marca OL (abierto). Eso indica…', o: ['Que está bien', 'Sensor abierto o cable roto', 'Que hace mucho calor', 'Falta de gas'], r: 1, e: 'OL = circuito abierto. La tarjeta marca error de sensor.' },
{ p: 'Para calcular el sobrecalentamiento objetivo (equipos con capilar) necesitas…', o: ['Sólo la presión de alta', 'Temperatura y humedad del cuarto, y temperatura de afuera', 'El amperaje', 'El modelo del equipo'], r: 1, e: 'Se usa el bulbo húmedo del cuarto (sale de temperatura y humedad) y la temperatura exterior.' },
{ p: 'La diferencia de aire es de 16 °C y los filtros están muy sucios. Pasa…', o: ['Que enfría de más', 'Poco flujo de aire: riesgo de congelamiento', 'Falta de gas', 'Todo normal'], r: 1, e: 'Con poco aire, el aire sale muy frío pero el equipo enfría menos y se puede congelar.' },
{ p: 'El R290 trabaja a presiones parecidas a las del…', o: ['R410A', 'R22', 'R32', 'Nitrógeno'], r: 1, e: 'El propano tiene presiones muy parecidas al R22.' },
{ p: 'Un cable calibre 12 AWG de cobre soporta (columna de 60 °C)…', o: ['15 A', '20 A', '30 A', '40 A'], r: 1, e: '14 AWG = 15 A, 12 AWG = 20 A, 10 AWG = 30 A, 8 AWG = 40 A.' },
{ p: 'La placa dice MCA 18 A. El calibre mínimo de cable de cobre es…', o: ['14 AWG', '12 AWG', '10 AWG', '8 AWG'], r: 1, e: '12 AWG aguanta 20 A, que es más que 18 A.' },
{ p: '¿Para qué sirve la báscula de refrigerante?', o: ['Para pesar el equipo', 'Para cargar el gas por peso', 'Para medir vacío', 'Para medir presión'], r: 1, e: 'La forma correcta de cargar es por peso, con la carga de la placa.' },
{ p: '¿Qué pasa si aprietas de más una tuerca flare?', o: ['Nada', 'Se agrieta el abocinado y fuga', 'Enfría más', 'Se tapa el capilar'], r: 1, e: 'Por eso se usa torquímetro con el valor de la tabla.' },
{ p: '¿Qué se hace antes de abocinar el tubo?', o: ['Meter la tuerca', 'Soldar', 'Hacer vacío', 'Poner aceite en el compresor'], r: 0, e: 'Si se te olvida la tuerca, hay que cortar y abocinar otra vez.' },
{ p: 'El cilindro de R410A es de color…', o: ['Verde claro', 'Rosa', 'Gris con tapa amarilla', 'Azul'], r: 1, e: 'R410A rosa, R22 verde claro, recuperación gris con tapa amarilla.' },
{ p: '¿Por qué conviene quitar los obuses (pivotes) al hacer vacío?', o: ['Para que jale más rápido', 'Para meter aceite', 'Para medir amperaje', 'No se deben quitar'], r: 0, e: 'El obús estorba el paso del aire; sin él, el vacío se hace más rápido.' },
{ p: 'La prueba de nitrógeno nunca debe pasar…', o: ['100 psi', 'La presión de diseño de la placa', '50 psi', 'La presión de baja'], r: 1, e: 'La placa trae la presión de diseño: arriba de eso puedes dañar el equipo.' },
{ p: 'Diferencia de aire de 4 °C con presiones bajas y SH alto indica…', o: ['Exceso de gas', 'Falta de gas', 'Filtros sucios', 'Todo bien'], r: 1, e: 'Poco refrigerante: enfría poco, presiones bajas y sobrecalentamiento alto.' },
{ p: 'En un compresor inverter mides U-V = 1.2 Ω, V-W = 1.2 Ω y U-W = 3.5 Ω. Está…', o: ['Bien', 'Con un devanado dañado', 'Descargado', 'Sin gas'], r: 1, e: 'En inverter las tres lecturas deben ser iguales.' },
{ p: 'A la misma temperatura, el R32 comparado con el R410A tiene presión…', o: ['Mucho más baja', 'Un poco más alta', 'Igual a la del R22', 'La mitad'], r: 1, e: 'El R32 trabaja 3–5% arriba del R410A.' },
{ p: 'Con 35 °C afuera, la temperatura de condensación normal está más o menos entre…', o: ['20 y 30 °C', '41 y 52 °C', '60 y 70 °C', '35 y 36 °C'], r: 1, e: 'Condensación ≈ temperatura exterior más 6 a 17 °C.' },
{ p: 'Con el cuarto a 25 °C, la evaporación normal está más o menos entre…', o: ['−10 y −5 °C', '2 y 9 °C', '15 y 20 °C', '25 y 30 °C'], r: 1, e: 'Evaporación ≈ temperatura del cuarto menos 16 a 23 °C.' },
];

// Listas de revisión (checklists)
const LISTAS = [
{ id: 'instalacion', t: 'Instalación de minisplit', items: [
  'Revisé la placa: gas, carga, voltaje y breaker',
  'Evaporadora nivelada, con espacio arriba y lejos de fuentes de calor',
  'El drenaje tiene caída todo el recorrido',
  'Condensadora con espacio para respirar y bien fija',
  'Tubería del diámetro correcto, cada tubo aislado por separado',
  'Tubos tapados mientras se instalan',
  'Abocinados nuevos, lisos, y tuerca metida antes de abocinar',
  'Tuercas apretadas con el torque correcto',
  'Prueba con nitrógeno con espuma en todas las uniones',
  'Vacío de 500 micrones o menos y prueba de retención',
  'Carga adicional si la tubería es más larga que la precarga',
  'Abrí las válvulas de servicio completas (primero líquido y luego gas)',
  'Tapones de las válvulas puestos y apretados',
  'Cable y breaker del calibre que pide el manual, con tierra física',
  'Probé el equipo 15 min: amperaje, presión y diferencia de aire',
  'Probé que el drenaje saque el agua afuera',
  'Le expliqué al cliente cómo usarlo y cada cuándo darle mantenimiento'] },
{ id: 'mantto', t: 'Mantenimiento preventivo', items: [
  'Pregunté al cliente qué falla ha notado',
  'Medí temperatura de aire antes del servicio',
  'Lavé los filtros',
  'Lavé el serpentín y la turbina de la evaporadora',
  'Limpié la charola y destapé el drenaje',
  'Lavé el condensador sin doblar aletas',
  'Apreté las conexiones eléctricas',
  'Medí el capacitor (µF)',
  'Medí voltaje y amperaje',
  'Medí presión y sobrecalentamiento (si tiene pivote)',
  'Medí la diferencia de aire (8–12 °C)',
  'Revisé el aislamiento y los soportes',
  'Anoté el servicio en la bitácora con la fecha del próximo'] },
{ id: 'desinstalacion', t: 'Desinstalar minisplit (pump down)', items: [
  'Equipo en frío (modo prueba) trabajando unos 10 minutos',
  'Manómetro en el pivote de la válvula de gas (tubo grueso)',
  'Cerré la válvula de líquido (tubo delgado)',
  'Cuando la baja llegó a 0 psi, cerré la válvula de gas',
  'Apagué el equipo de inmediato y quité la corriente',
  'Desconecté la tubería con el equipo apagado',
  'Tapé las válvulas y los tubos',
  'Marqué los cables antes de desconectarlos',
  'Guardé tornillos, soporte y control remoto juntos'] },
{ id: 'r32', t: 'Seguridad antes de trabajar con R32', items: [
  'Confirmé en la placa el tipo de gas (R32, R290, etc.)',
  'Área ventilada; puertas y ventanas abiertas',
  'Sin flamas, cigarros ni chispas cerca',
  'Extintor de polvo a la mano',
  'Detector de fugas apto para A2L',
  'Bomba de vacío y recuperadora aptas para A2L',
  'Cilindro de recuperación correcto y etiquetado',
  'Si voy a soldar: gas recuperado, vacío hecho y nitrógeno corriendo',
  'No cargar más de lo que dice la placa'] },
];

// Tablas de referencia
const TORQUE = [
  // Valores típicos de fabricantes para tuercas flare
  { tubo: '1/4"', nm: '14–18', ftlb: '10–13' },
  { tubo: '3/8"', nm: '33–42', ftlb: '24–31' },
  { tubo: '1/2"', nm: '50–62', ftlb: '37–46' },
  { tubo: '5/8"', nm: '62–76', ftlb: '46–56' },
  { tubo: '3/4"', nm: '90–110', ftlb: '66–81' },
];

const TUBERIA = [
  // Diámetros comunes de minisplit (líquido / gas). Verifica siempre en el manual.
  { cap: '9 000 BTU (¾ TR)', liq: '1/4"', gas: '3/8"' },
  { cap: '12 000 BTU (1 TR)', liq: '1/4"', gas: '3/8" o 1/2"' },
  { cap: '18 000 BTU (1.5 TR)', liq: '1/4"', gas: '1/2"' },
  { cap: '24 000 BTU (2 TR)', liq: '1/4" o 3/8"', gas: '5/8"' },
  { cap: '36 000 BTU (3 TR)', liq: '3/8"', gas: '5/8" o 3/4"' },
];

const PRESIONES = [
  // Referencia con ~35 °C afuera y cuarto a 24–27 °C, equipo estable
  { gas: 'R22', baja: '60–75 psi', alta: '225–275 psi' },
  { gas: 'R410A', baja: '115–140 psi', alta: '340–420 psi' },
  { gas: 'R32', baja: '120–145 psi', alta: '350–430 psi' },
  { gas: 'R290', baja: '55–70 psi', alta: '200–240 psi' },
];

// Reglas prácticas para las presiones esperadas (°C)
const REGLAS = {
  evap: [16, 23], // la evaporación queda de 16 a 23 °C abajo del aire del cuarto
  cond: [6, 17],  // la condensación queda de 6 a 17 °C arriba del aire exterior
};

// Gramos por metro extra de línea de líquido (valores típicos; manda la placa)
const GRAMOS_METRO = {
  '1/4"': { R22: 20, R410A: 15, R32: 12 },
  '3/8"': { R22: 40, R410A: 30, R32: 24 },
};

// Glosario inglés → español (lo que viene en placas, manuales y códigos de error)
const GLOSARIO = [
  ['Accumulator', 'Acumulador de succión'],
  ['Ambient temperature', 'Temperatura ambiente'],
  ['Anti-cold air', 'Protección contra aire frío (en calefacción)'],
  ['Auto restart', 'Reinicio automático después de un apagón'],
  ['Blower / Indoor fan', 'Turbina o ventilador de la evaporadora'],
  ['Brazing', 'Soldadura fuerte (con plata)'],
  ['Capacitor', 'Capacitor'],
  ['Capillary tube', 'Tubo capilar'],
  ['Charge (refrigerant)', 'Carga de gas'],
  ['Check valve', 'Válvula check (deja pasar en un solo sentido)'],
  ['Coil', 'Serpentín'],
  ['Communication error', 'Error de comunicación entre la unidad interior y la exterior'],
  ['Compressor', 'Compresor'],
  ['Condensate', 'Agua condensada'],
  ['Condenser', 'Condensador'],
  ['Contactor', 'Contactor'],
  ['Cooling capacity', 'Capacidad de enfriamiento'],
  ['Crankcase heater', 'Resistencia de cárter del compresor'],
  ['Defrost', 'Deshielo'],
  ['Design pressure', 'Presión de diseño (máxima)'],
  ['Discharge', 'Descarga (salida del compresor)'],
  ['Discharge temperature sensor', 'Sensor de temperatura de descarga'],
  ['Drain', 'Drenaje'],
  ['Dry mode', 'Modo deshumidificar'],
  ['Dual capacitor (HERM / FAN / C)', 'Capacitor doble: compresor / ventilador / común'],
  ['EEPROM error', 'Error en la memoria de la tarjeta'],
  ['EEV (Electronic Expansion Valve)', 'Válvula de expansión electrónica'],
  ['Evaporator', 'Evaporador'],
  ['Fan motor stall', 'Motor del ventilador trabado o sin girar'],
  ['Fan only', 'Sólo ventilador'],
  ['Filter drier', 'Filtro deshidratador'],
  ['FLA (Full Load Amps)', 'Amperaje a plena carga (motores ventiladores)'],
  ['Flare', 'Abocinado'],
  ['Flare nut', 'Tuerca flare (cónica)'],
  ['Forced cooling / Test mode', 'Enfriamiento forzado / modo prueba'],
  ['Four-way valve / Reversing valve', 'Válvula de 4 vías'],
  ['Gauge manifold', 'Juego de manómetros'],
  ['Ground', 'Tierra física'],
  ['Heat pump', 'Bomba de calor (frío-calor)'],
  ['High pressure protection', 'Protección por alta presión'],
  ['High side', 'Lado de alta'],
  ['Indoor unit (IDU)', 'Unidad interior (evaporadora)'],
  ['IPM (Intelligent Power Module)', 'Módulo de potencia que mueve el compresor inverter'],
  ['Leak', 'Fuga'],
  ['Line set', 'Juego de tubería'],
  ['Liquid line', 'Línea de líquido (tubo delgado)'],
  ['Low pressure protection', 'Protección por baja presión'],
  ['Low side', 'Lado de baja'],
  ['LRA (Locked Rotor Amps)', 'Amperaje con rotor trabado (arranque)'],
  ['MCA (Minimum Circuit Ampacity)', 'Ampacidad mínima del circuito (para el cable)'],
  ['Megohmmeter', 'Megóhmetro'],
  ['Micron gauge', 'Vacuómetro de micrones'],
  ['MOP / MOCP (Max. Overcurrent Protection)', 'Protección máxima (breaker más grande permitido)'],
  ['Nitrogen', 'Nitrógeno'],
  ['Open circuit', 'Circuito abierto'],
  ['Outdoor unit (ODU)', 'Unidad exterior (condensadora)'],
  ['Overcurrent', 'Sobrecorriente'],
  ['Overload protector', 'Protector térmico'],
  ['PCB / Control board', 'Tarjeta electrónica'],
  ['Piercing valve', 'Válvula de perforar'],
  ['Pipe (coil) sensor', 'Sensor de tubería o serpentín'],
  ['Power supply', 'Alimentación eléctrica'],
  ['Pressure switch', 'Presostato'],
  ['Pump down', 'Recoger el gas en la condensadora'],
  ['Rated current', 'Corriente nominal'],
  ['Recovery', 'Recuperación de gas'],
  ['Relay', 'Relé'],
  ['RLA (Rated Load Amps)', 'Amperaje nominal del compresor'],
  ['Room temperature sensor', 'Sensor de temperatura del cuarto'],
  ['Saturation', 'Saturación'],
  ['Schrader valve', 'Pivote u obús'],
  ['Service valve', 'Válvula de servicio'],
  ['Setpoint', 'Temperatura programada'],
  ['Short circuit', 'Corto circuito'],
  ['Sight glass', 'Mirilla'],
  ['Sleep mode', 'Modo dormir'],
  ['Subcooling', 'Subenfriamiento'],
  ['Suction line', 'Línea de succión (tubo grueso)'],
  ['Superheat', 'Sobrecalentamiento'],
  ['Swing / Louver', 'Aleta que mueve el aire'],
  ['Terminal block', 'Clema o bornera'],
  ['Thermistor', 'Termistor (sensor de temperatura)'],
  ['Tonnage', 'Tonelaje (capacidad)'],
  ['Transformer', 'Transformador'],
  ['Vacuum pump', 'Bomba de vacío'],
  ['Wet bulb / Dry bulb', 'Bulbo húmedo / bulbo seco'],
  ['Wiring diagram', 'Diagrama eléctrico'],
];
