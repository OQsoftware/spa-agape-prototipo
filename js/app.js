const money = (n) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const today = new Date();
const weekday = today.toLocaleDateString("es-CO", { weekday: "long" });
const longDate = today.toLocaleDateString("es-CO", {
  day: "numeric",
  month: "long",
});

function greet() {
  const h = today.getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

function initials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

const state = {
  view: "home",
  cajaFilter: "todos",
  clientQuery: "",
  movements: [
    { id: 1, type: "ingreso", concept: "Masaje relajante · María González", category: "Servicio", amount: 120000, time: "09:40" },
    { id: 2, type: "ingreso", concept: "Limpieza facial · Camila Restrepo", category: "Servicio", amount: 90000, time: "10:55" },
    { id: 3, type: "gasto", concept: "Toallas e insumos", category: "Insumos", amount: 45000, time: "11:20" },
    { id: 4, type: "ingreso", concept: "Ritual Ágape · Laura Méndez", category: "Servicio", amount: 180000, time: "14:20" },
    { id: 5, type: "gasto", concept: "Aromas y aceites", category: "Insumos", amount: 40000, time: "15:05" },
    { id: 6, type: "ingreso", concept: "Manicure spa · Andrea Soto", category: "Servicio", amount: 55000, time: "16:15" },
  ],
  appointments: [
    { id: "a1", time: "09:00", client: "María González", service: "Masaje relajante 60 min", value: 120000, status: "Atendida", note: "Prefiere música suave." },
    { id: "a2", time: "10:30", client: "Camila Restrepo", service: "Limpieza facial", value: 90000, status: "Atendida", note: "Quedó saldo de $60.000." },
    { id: "a3", time: "14:00", client: "Laura Méndez", service: "Ritual Ágape 90 min", value: 180000, status: "En sala", note: "Primera vez en el ritual." },
    { id: "a4", time: "16:00", client: "Andrea Soto", service: "Manicure spa", value: 55000, status: "Confirmada", note: "" },
    { id: "a5", time: "17:30", client: "Valentina Ruiz", service: "Depilación", value: 70000, status: "Pendiente", note: "Confirmar por WhatsApp." },
  ],
  clients: [
    { id: "c1", name: "María González", last: "Masaje relajante · hoy", due: 0 },
    { id: "c2", name: "Camila Restrepo", last: "Limpieza facial · hoy", due: 60000 },
    { id: "c3", name: "Laura Méndez", last: "Ritual Ágape · hoy", due: 0 },
    { id: "c4", name: "Andrea Soto", last: "Manicure spa · hoy", due: 0 },
    { id: "c5", name: "Valentina Ruiz", last: "Depilación · cita 5:30 p. m.", due: 0 },
    { id: "c6", name: "Daniela Herrera", last: "Masaje · 12 sep", due: 0 },
  ],
  week: [
    { d: "L", v: 320000 },
    { d: "M", v: 410000 },
    { d: "X", v: 280000 },
    { d: "J", v: 360000 },
    { d: "V", v: 520000 },
    { d: "S", v: 610000 },
    { d: "D", v: 190000 },
  ],
};

function totals() {
  const ingresos = state.movements.filter((m) => m.type === "ingreso").reduce((a, m) => a + m.amount, 0);
  const gastos = state.movements.filter((m) => m.type === "gasto").reduce((a, m) => a + m.amount, 0);
  const porCobrar = state.clients.reduce((a, c) => a + c.due, 0);
  return { ingresos, gastos, neto: ingresos - gastos, porCobrar, citas: state.appointments.length };
}

function badge(status) {
  if (status === "Atendida") return "badge-ok";
  if (status === "En sala") return "badge-now";
  if (status === "Pendiente") return "badge-due";
  return "badge-wait";
}

function setView(name) {
  state.view = name;
  $$(".view").forEach((el) => el.classList.toggle("active", el.dataset.view === name));
  $$(".tab").forEach((el) => el.classList.toggle("on", el.dataset.view === name));
  render();
  $(".views").scrollTop = 0;
}

function toast(msg) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  $(".shell").appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

function closeSheet() {
  $("#backdrop").classList.add("hidden");
  $("#sheet").classList.add("hidden");
  $("#sheet").innerHTML = "";
}

function openSheet(html) {
  $("#sheet").innerHTML = `<div class="handle"></div>${html}`;
  $("#backdrop").classList.remove("hidden");
  $("#sheet").classList.remove("hidden");
}

function renderHome() {
  const t = totals();
  const next = state.appointments.find((a) => a.status === "En sala") || state.appointments.find((a) => a.status === "Confirmada" || a.status === "Pendiente");
  $("#view-home").innerHTML = `
    <p class="hello">${greet()}</p>
    <h2>Hoy en Ágape<br><span style="font-family:var(--font);font-size:15px;font-weight:500;color:var(--muted)">${weekday[0].toUpperCase()}${weekday.slice(1)}, ${longDate}</span></h2>
    <div class="grid-2">
      <article class="card kpi ingresos"><div class="label">Ingresos</div><div class="value">${money(t.ingresos)}</div></article>
      <article class="card kpi gastos"><div class="label">Gastos</div><div class="value">${money(t.gastos)}</div></article>
      <article class="card kpi"><div class="label">Citas</div><div class="value">${t.citas}</div></article>
      <article class="card kpi"><div class="label">Por cobrar</div><div class="value">${money(t.porCobrar)}</div></article>
    </div>
    <div class="section-title">Siguiente atención <button class="linkish" data-go="agenda">Ver agenda</button></div>
    <div class="card">
      ${next ? `
        <button class="appt" data-cita="${next.id}">
          <div class="time">${next.time}</div>
          <div class="appt-body"><strong>${next.client}</strong><small>${next.service}</small></div>
          <span class="badge ${badge(next.status)}">${next.status}</span>
        </button>` : `<p class="empty">No hay más citas para hoy.</p>`}
    </div>
    <div class="actions">
      <button class="action" data-open="mov">Registrar movimiento</button>
      <button class="action alt" data-go="agenda">Ver citas del día</button>
    </div>
  `;
}

function renderCaja() {
  const t = totals();
  const list = state.movements.filter((m) => state.cajaFilter === "todos" || m.type === state.cajaFilter);
  $("#view-caja").innerHTML = `
    <p class="hello">Caja del día</p>
    <div class="balance"><small>Neto de hoy</small><strong>${money(t.neto)}</strong></div>
    <div class="chips">
      <button class="chip ${state.cajaFilter === "todos" ? "on" : ""}" data-filter="todos">Todos</button>
      <button class="chip ${state.cajaFilter === "ingreso" ? "on" : ""}" data-filter="ingreso">Ingresos</button>
      <button class="chip ${state.cajaFilter === "gasto" ? "on" : ""}" data-filter="gasto">Gastos</button>
    </div>
    <div class="list">
      ${list.map((m) => `
        <div class="card row">
          <span class="dot ${m.type === "ingreso" ? "in" : "out"}"></span>
          <div class="row-body"><strong>${m.concept}</strong><small>${m.category} · ${m.time}</small></div>
          <div class="amount ${m.type === "ingreso" ? "in" : "out"}">${m.type === "ingreso" ? "+" : "−"} ${money(m.amount)}</div>
        </div>
      `).join("")}
    </div>
    <button class="btn btn-teal fab" data-open="mov">Registrar ingreso o gasto</button>
  `;
}

function renderAgenda() {
  $("#view-agenda").innerHTML = `
    <p class="hello">Agenda</p>
    <h2>Atenciones de hoy</h2>
    <div class="list">
      ${state.appointments.map((a) => `
        <button class="card appt" data-cita="${a.id}">
          <div class="time">${a.time}</div>
          <div class="appt-body"><strong>${a.client}</strong><small>${a.service}</small></div>
          <span class="badge ${badge(a.status)}">${a.status}</span>
        </button>
      `).join("")}
    </div>
    <p class="note">En el prototipo la agenda es de ejemplo. Luego definiremos juntos cómo se toma una cita en el día a día de Ágape.</p>
  `;
}

function renderClientes() {
  const q = state.clientQuery.trim().toLowerCase();
  const list = state.clients.filter((c) => c.name.toLowerCase().includes(q));
  $("#view-clientes").innerHTML = `
    <p class="hello">Personas</p>
    <h2>Clientes</h2>
    <input class="search" type="search" placeholder="Buscar por nombre" value="${state.clientQuery}" data-search>
    <div class="list">
      ${list.length ? list.map((c) => `
        <button class="card row" data-cli="${c.id}">
          <div class="avatar">${initials(c.name)}</div>
          <div class="row-body"><strong>${c.name}</strong><small>${c.last}</small></div>
          <span class="badge ${c.due ? "badge-due" : "badge-ok"}">${c.due ? "Saldo " + money(c.due) : "Al día"}</span>
        </button>
      `).join("") : `<p class="empty">No hay coincidencias.</p>`}
    </div>
  `;
}

function renderResumen() {
  const t = totals();
  const max = Math.max(...state.week.map((x) => x.v));
  const weekSum = state.week.reduce((a, x) => a + x.v, 0);
  $("#view-resumen").innerHTML = `
    <p class="hello">Para decidir</p>
    <h2>Resumen de la semana</h2>
    <div class="grid-2">
      <article class="card kpi ingresos full"><div class="label">Ingresos de la semana (ejemplo)</div><div class="value">${money(weekSum)}</div></article>
      <article class="card kpi"><div class="label">Hoy</div><div class="value">${money(t.ingresos)}</div></article>
      <article class="card kpi"><div class="label">Por cobrar</div><div class="value">${money(t.porCobrar)}</div></article>
    </div>
    <div class="section-title">Ingresos por día</div>
    <div class="card">
      <div class="bars">
        ${state.week.map((x) => `<div class="bar-col"><div class="bar" style="height:${Math.max(12, (x.v / max) * 100)}%"></div><span>${x.d}</span></div>`).join("")}
      </div>
    </div>
    <p class="note">Estos indicadores son una muestra. Los que realmente usará Ágape se definirán después de organizar y probar el día a día, primero en Excel.</p>
  `;
}

function render() {
  renderHome();
  renderCaja();
  renderAgenda();
  renderClientes();
  renderResumen();
}

function openMovimiento() {
  openSheet(`
    <h3>Registrar</h3>
    <p class="meta">Pruebe cómo se sentiría anotar un movimiento. En el prototipo queda solo en este teléfono.</p>
    <div class="field">
      <label>Tipo</label>
      <div class="toggle">
        <button type="button" class="on in" data-tipo="ingreso">Ingreso</button>
        <button type="button" data-tipo="gasto">Gasto</button>
      </div>
    </div>
    <div class="field"><label>Valor</label><input id="mov-amount" inputmode="numeric" placeholder="Ej. 120000"></div>
    <div class="field"><label>Concepto</label><input id="mov-concept" placeholder="Ej. Masaje · clienta"></div>
    <button class="btn btn-teal" data-save-mov>Guardar ejemplo</button>
  `);
}

function openCita(id) {
  const a = state.appointments.find((x) => x.id === id);
  if (!a) return;
  openSheet(`
    <h3>${a.client}</h3>
    <p class="meta">${a.time} · ${a.service}</p>
    <div class="card" style="margin-bottom:12px">
      <div class="kpi"><div class="label">Valor</div><div class="value">${money(a.value)}</div></div>
    </div>
    <p><span class="badge ${badge(a.status)}">${a.status}</span></p>
    ${a.note ? `<p class="note">${a.note}</p>` : ""}
    <button class="btn btn-primary" data-close-sheet style="margin-top:14px;background:var(--navy);color:#fff">Cerrar</button>
  `);
}

function openCliente(id) {
  const c = state.clients.find((x) => x.id === id);
  if (!c) return;
  openSheet(`
    <h3>${c.name}</h3>
    <p class="meta">${c.last}</p>
    <div class="card">
      <div class="kpi"><div class="label">Cuenta</div><div class="value">${c.due ? money(c.due) : "Al día"}</div></div>
    </div>
    <p class="note">Más adelante podremos ver aquí historial de servicios, preferencias y saldos, según lo que Ágape realmente necesite.</p>
    <button class="btn btn-primary" data-close-sheet style="margin-top:8px;background:var(--navy);color:#fff">Cerrar</button>
  `);
}

function bind() {
  $("#enter").addEventListener("click", () => {
    $("#splash").classList.add("hidden");
    $("#app").classList.remove("hidden");
    setView("home");
  });

  $$(".tab").forEach((tab) => {
    tab.addEventListener("click", () => setView(tab.dataset.view));
  });

  $("#backdrop").addEventListener("click", closeSheet);

  document.addEventListener("click", (e) => {
    const go = e.target.closest("[data-go]");
    if (go) setView(go.dataset.go);

    const open = e.target.closest("[data-open]");
    if (open?.dataset.open === "mov") openMovimiento();

    const cita = e.target.closest("[data-cita]");
    if (cita) openCita(cita.dataset.cita);

    const cli = e.target.closest("[data-cli]");
    if (cli) openCliente(cli.dataset.cli);

    const filter = e.target.closest("[data-filter]");
    if (filter) {
      state.cajaFilter = filter.dataset.filter;
      renderCaja();
    }

    const tipo = e.target.closest("[data-tipo]");
    if (tipo) {
      $$("[data-tipo]").forEach((b) => b.classList.remove("on", "in", "out"));
      tipo.classList.add("on", tipo.dataset.tipo === "ingreso" ? "in" : "out");
    }

    if (e.target.closest("[data-save-mov]")) {
      const amount = Number(String($("#mov-amount")?.value || "").replace(/\D/g, ""));
      const concept = $("#mov-concept")?.value.trim();
      const typeBtn = $("[data-tipo].on");
      const type = typeBtn?.dataset.tipo || "ingreso";
      if (!amount || !concept) {
        toast("Escriba un valor y un concepto para probar.");
        return;
      }
      const now = new Date();
      const time = now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
      state.movements.unshift({
        id: Date.now(),
        type,
        concept,
        category: type === "ingreso" ? "Servicio" : "Otro",
        amount,
        time,
      });
      closeSheet();
      setView("caja");
      toast("Quedó registrado en esta vista previa. No es el sistema final.");
    }

    if (e.target.closest("[data-close-sheet]")) closeSheet();
    if (e.target.closest("[data-hide-disc]")) $("#disclaimer").classList.add("hidden");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSheet();
  });

  document.addEventListener("input", (e) => {
    if (e.target.matches("[data-search]")) {
      state.clientQuery = e.target.value;
      renderClientes();
      const input = $("[data-search]");
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }
  });
}

bind();
render();
