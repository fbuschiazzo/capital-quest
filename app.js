const fmt = new Intl.NumberFormat("es-UY", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const levels = [
  { name: "Aprendiz", threshold: 0 },
  { name: "Ahorrador estrategico", threshold: 5000 },
  { name: "Inversor disciplinado", threshold: 20000 },
  { name: "Constructor de negocios", threshold: 80000 },
  { name: "Capitalista global", threshold: 250000 },
];

const jobs = [
  {
    id: "delivery",
    title: "Repartos express",
    pay: 170,
    energy: 1,
    unlock: 0,
    meta: "Paga inmediata, poco aprendizaje financiero.",
  },
  {
    id: "assistant",
    title: "Asistente comercial",
    pay: 330,
    energy: 2,
    unlock: 0,
    meta: "Mejor ingreso y contacto con ventas.",
  },
  {
    id: "analyst",
    title: "Analista junior",
    pay: 760,
    energy: 3,
    unlock: 5000,
    meta: "Desbloquea criterio para activos mas complejos.",
  },
  {
    id: "consultant",
    title: "Consultoria financiera",
    pay: 1450,
    energy: 4,
    unlock: 20000,
    meta: "Alta paga, alto desgaste mensual.",
  },
];

const assets = [
  {
    id: "bonds",
    name: "Bonos conservadores",
    type: "Renta fija",
    cost: 500,
    monthlyReturn: 0.012,
    volatility: 0.01,
    risk: "Bajo",
    unlock: 0,
    description: "Flujo lento pero estable para proteger liquidez.",
    gradient: "linear-gradient(135deg, #39755b, #8cc86f)",
  },
  {
    id: "stocks",
    name: "ETF de empresas lideres",
    type: "Acciones",
    cost: 1200,
    monthlyReturn: 0.022,
    volatility: 0.07,
    risk: "Medio",
    unlock: 0,
    description: "Crecimiento diversificado con meses buenos y malos.",
    gradient: "linear-gradient(135deg, #1f6f9d, #66d0d8)",
  },
  {
    id: "crypto",
    name: "Cartera cripto emergente",
    type: "Cripto",
    cost: 1800,
    monthlyReturn: 0.035,
    volatility: 0.18,
    risk: "Alto",
    unlock: 5000,
    description: "Puede acelerar tu capital o golpearlo fuerte.",
    gradient: "linear-gradient(135deg, #6336a6, #f5b94e)",
  },
  {
    id: "apartment",
    name: "Apartamento para renta",
    type: "Inmueble",
    cost: 15000,
    monthlyReturn: 0.017,
    volatility: 0.025,
    risk: "Bajo",
    unlock: 20000,
    description: "Ingreso recurrente y apreciacion moderada.",
    gradient: "linear-gradient(135deg, #384c60, #c2a46d)",
  },
  {
    id: "franchise",
    name: "Franquicia urbana",
    type: "Negocio",
    cost: 38000,
    monthlyReturn: 0.028,
    volatility: 0.06,
    risk: "Medio",
    unlock: 80000,
    description: "Requiere capital, entrega escala y caja mensual.",
    gradient: "linear-gradient(135deg, #8c3c52, #f08d5e)",
  },
  {
    id: "startup",
    name: "Startup propia",
    type: "Empresa",
    cost: 85000,
    monthlyReturn: 0.055,
    volatility: 0.22,
    risk: "Alto",
    unlock: 250000,
    description: "Apuesta grande: maxima volatilidad, maximo potencial.",
    gradient: "linear-gradient(135deg, #172a59, #40d894)",
  },
];

const state = loadGame();

const nodes = {
  netWorth: document.querySelector("#netWorth"),
  cash: document.querySelector("#cash"),
  passiveIncome: document.querySelector("#passiveIncome"),
  month: document.querySelector("#month"),
  energy: document.querySelector("#energy"),
  levelName: document.querySelector("#levelName"),
  levelProgressText: document.querySelector("#levelProgressText"),
  levelProgressBar: document.querySelector("#levelProgressBar"),
  jobsList: document.querySelector("#jobsList"),
  investmentsList: document.querySelector("#investmentsList"),
  portfolioList: document.querySelector("#portfolioList"),
  eventLog: document.querySelector("#eventLog"),
  monthlyInsight: document.querySelector("#monthlyInsight"),
  riskBadge: document.querySelector("#riskBadge"),
  chart: document.querySelector("#chartCanvas"),
  nextMonth: document.querySelector("#nextMonthButton"),
  rebalance: document.querySelector("#rebalanceButton"),
  reset: document.querySelector("#resetButton"),
};

function initialGame() {
  return {
    cash: 1000,
    month: 1,
    energy: 5,
    holdings: {},
    history: [1000],
    events: ["Arrancas con USD 1.000 y una meta: comprar tu libertad financiera."],
    marketMood: 0,
  };
}

function loadGame() {
  const saved = localStorage.getItem("capitalQuestSave");
  return saved ? JSON.parse(saved) : initialGame();
}

function saveGame() {
  localStorage.setItem("capitalQuestSave", JSON.stringify(state));
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function getHoldingValue(asset) {
  return state.holdings[asset.id]?.value ?? 0;
}

function getNetWorth() {
  return state.cash + assets.reduce((sum, asset) => sum + getHoldingValue(asset), 0);
}

function getLevel() {
  const netWorth = getNetWorth();
  return levels.reduce((current, level) => (netWorth >= level.threshold ? level : current), levels[0]);
}

function getNextLevel() {
  const netWorth = getNetWorth();
  return levels.find((level) => level.threshold > netWorth) ?? levels[levels.length - 1];
}

function getPassiveIncome() {
  return assets.reduce((sum, asset) => {
    const holding = state.holdings[asset.id];
    if (!holding) return sum;
    return sum + holding.value * Math.max(asset.monthlyReturn + state.marketMood * 0.004, 0);
  }, 0);
}

function work(jobId) {
  const job = jobs.find((item) => item.id === jobId);
  if (!job || state.energy < job.energy || getNetWorth() < job.unlock) return;
  state.energy -= job.energy;
  state.cash += job.pay;
  pushEvent(`Completaste "${job.title}" y sumaste ${fmt.format(job.pay)}.`);
  render();
}

function buyAsset(assetId, amount = null) {
  const asset = assets.find((item) => item.id === assetId);
  if (!asset || getNetWorth() < asset.unlock) return;
  const investment = amount ?? asset.cost;
  if (state.cash < investment || investment <= 0) return;
  state.cash -= investment;
  state.holdings[asset.id] ??= { units: 0, value: 0, invested: 0 };
  state.holdings[asset.id].units += investment / asset.cost;
  state.holdings[asset.id].value += investment;
  state.holdings[asset.id].invested += investment;
  pushEvent(`Invertiste ${fmt.format(investment)} en ${asset.name}.`);
  render();
}

function nextMonth() {
  state.month += 1;
  state.energy = 5;
  state.marketMood = randomBetween(-1, 1);
  const monthlyCosts = Math.min(550 + state.month * 8, Math.max(420, getNetWorth() * 0.008));
  state.cash -= monthlyCosts;

  assets.forEach((asset) => {
    const holding = state.holdings[asset.id];
    if (!holding) return;
    const performance = asset.monthlyReturn + state.marketMood * 0.01 + randomBetween(-asset.volatility, asset.volatility);
    const change = holding.value * performance;
    holding.value = Math.max(0, holding.value + change);
    state.cash += Math.max(0, holding.value * asset.monthlyReturn * 0.18);
  });

  if (state.cash < 0) {
    liquidateForDebt();
  }

  state.history.push(Math.round(getNetWorth()));
  pushMarketEvent();
  render();
}

function liquidateForDebt() {
  const debt = Math.abs(state.cash);
  const richest = assets
    .map((asset) => ({ asset, holding: state.holdings[asset.id] }))
    .filter((item) => item.holding?.value > 0)
    .sort((a, b) => b.holding.value - a.holding.value)[0];

  if (!richest) return;
  const sale = Math.min(richest.holding.value, debt * 1.08);
  richest.holding.value -= sale;
  state.cash += sale;
  pushEvent(`Vendiste parte de ${richest.asset.name} para cubrir gastos y proteger tu puntaje financiero.`);
}

function rebalance() {
  const available = Math.floor(state.cash * 0.25);
  if (available < 500) return;
  const unlocked = assets.filter((asset) => getNetWorth() >= asset.unlock && asset.cost <= available);
  if (!unlocked.length) return;
  const safest = unlocked.sort((a, b) => a.volatility - b.volatility)[0];
  buyAsset(safest.id, Math.min(available, safest.cost));
}

function pushMarketEvent() {
  const text =
    state.marketMood > 0.35
      ? "El mercado esta optimista: las inversiones de crecimiento tuvieron viento a favor."
      : state.marketMood < -0.35
        ? "Mes defensivo: hubo volatilidad y la liquidez importo mas de lo habitual."
        : "Mes mixto: la diversificacion sostuvo el avance del portfolio.";
  pushEvent(text);
}

function pushEvent(text) {
  state.events.unshift(text);
  state.events = state.events.slice(0, 5);
  saveGame();
}

function resetGame() {
  Object.assign(state, initialGame());
  saveGame();
  render();
}

function renderJobs() {
  const template = document.querySelector("#jobTemplate");
  nodes.jobsList.replaceChildren();
  jobs.forEach((job) => {
    const item = template.content.firstElementChild.cloneNode(true);
    const locked = getNetWorth() < job.unlock;
    item.disabled = locked || state.energy < job.energy;
    item.querySelector(".job-title").textContent = job.title;
    item.querySelector(".job-meta").textContent = locked
      ? `Requiere patrimonio de ${fmt.format(job.unlock)}`
      : `${job.energy} energia | ${job.meta}`;
    item.querySelector(".job-pay").textContent = fmt.format(job.pay);
    item.addEventListener("click", () => work(job.id));
    nodes.jobsList.appendChild(item);
  });
}

function renderInvestments() {
  const template = document.querySelector("#investmentTemplate");
  nodes.investmentsList.replaceChildren();
  assets.forEach((asset) => {
    const item = template.content.firstElementChild.cloneNode(true);
    const locked = getNetWorth() < asset.unlock;
    const affordable = state.cash >= asset.cost;
    item.style.setProperty("--asset-gradient", asset.gradient);
    item.querySelector(".asset-type").textContent = asset.type;
    item.querySelector(".asset-risk").textContent = asset.risk;
    item.querySelector(".asset-risk").classList.add(riskClass(asset.risk));
    item.querySelector("h3").textContent = asset.name;
    item.querySelector("p").textContent = locked
      ? `Se desbloquea con ${fmt.format(asset.unlock)} de patrimonio.`
      : asset.description;
    item.querySelector(".asset-cost").innerHTML = `<b>Costo</b>${fmt.format(asset.cost)}`;
    item.querySelector(".asset-return").innerHTML = `<b>Retorno</b>${Math.round(asset.monthlyReturn * 1000) / 10}%/mes`;
    item.querySelector(".asset-volatility").innerHTML = `<b>Riesgo</b>${Math.round(asset.volatility * 100)}%`;
    const button = item.querySelector(".buy-button");
    button.disabled = locked || !affordable;
    button.textContent = locked ? "Bloqueado" : affordable ? "Invertir" : "Falta efectivo";
    button.addEventListener("click", () => buyAsset(asset.id));
    nodes.investmentsList.appendChild(item);
  });
}

function riskClass(risk) {
  if (risk === "Alto") return "high";
  if (risk === "Medio") return "medium";
  return "low";
}

function renderPortfolio() {
  nodes.portfolioList.replaceChildren();
  const owned = assets.filter((asset) => getHoldingValue(asset) > 1);
  if (!owned.length) {
    const empty = document.createElement("p");
    empty.className = "insight-copy";
    empty.textContent = "Todavia no compraste activos. Gana efectivo y hace tu primera inversion.";
    nodes.portfolioList.appendChild(empty);
    return;
  }
  owned.forEach((asset) => {
    const holding = state.holdings[asset.id];
    const row = document.createElement("article");
    row.className = "portfolio-row";
    const pnl = holding.value - holding.invested;
    row.innerHTML = `
      <span><strong>${asset.name}</strong><small>${holding.units.toFixed(2)} unidades</small></span>
      <span><strong>${fmt.format(holding.value)}</strong><small>${pnl >= 0 ? "+" : ""}${fmt.format(pnl)}</small></span>
    `;
    nodes.portfolioList.appendChild(row);
  });
}

function renderEvents() {
  nodes.eventLog.replaceChildren();
  state.events.forEach((event) => {
    const item = document.createElement("div");
    item.className = "event-item";
    item.textContent = event;
    nodes.eventLog.appendChild(item);
  });
}

function renderChart() {
  const canvas = nodes.chart;
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = rect.width * scale;
  canvas.height = rect.height * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
  ctx.clearRect(0, 0, rect.width, rect.height);
  ctx.strokeStyle = "rgba(255,255,255,0.09)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 5; i += 1) {
    const y = (rect.height / 5) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(rect.width, y);
    ctx.stroke();
  }

  const values = state.history.slice(-12);
  const min = Math.min(...values);
  const max = Math.max(...values, min + 100);
  ctx.beginPath();
  values.forEach((value, index) => {
    const x = values.length === 1 ? 0 : (rect.width / (values.length - 1)) * index;
    const y = rect.height - ((value - min) / (max - min)) * (rect.height - 28) - 14;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = "#40d894";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function render() {
  const netWorth = getNetWorth();
  const level = getLevel();
  const next = getNextLevel();
  const levelStart = level.threshold;
  const levelEnd = next.threshold === level.threshold ? netWorth : next.threshold;
  const progress = Math.min(100, ((netWorth - levelStart) / (levelEnd - levelStart || 1)) * 100);
  nodes.netWorth.textContent = fmt.format(netWorth);
  nodes.cash.textContent = fmt.format(state.cash);
  nodes.passiveIncome.textContent = fmt.format(getPassiveIncome());
  nodes.month.textContent = state.month;
  nodes.energy.textContent = `${state.energy}/5`;
  nodes.levelName.textContent = level.name;
  nodes.levelProgressText.textContent =
    next.threshold === level.threshold ? "Nivel maximo alcanzado" : `${fmt.format(next.threshold - netWorth)} para ${next.name}`;
  nodes.levelProgressBar.style.width = `${progress}%`;
  nodes.riskBadge.textContent =
    state.marketMood > 0.35 ? "Optimista" : state.marketMood < -0.35 ? "Defensivo" : "Neutral";
  nodes.monthlyInsight.textContent = buildInsight(netWorth);
  nodes.rebalance.disabled = state.cash < 500;
  renderJobs();
  renderInvestments();
  renderPortfolio();
  renderEvents();
  renderChart();
  saveGame();
}

function buildInsight(netWorth) {
  const invested = assets.reduce((sum, asset) => sum + getHoldingValue(asset), 0);
  const ratio = invested / Math.max(netWorth, 1);
  if (ratio < 0.25) return "Tenes mucha liquidez. Es comodo, pero el dinero quieto pierde potencia frente a activos productivos.";
  if (ratio > 0.85) return "Tu capital esta casi todo invertido. Creces mas rapido, pero necesitas efectivo para resistir meses dificiles.";
  return "Tu equilibrio entre efectivo e inversiones permite tomar oportunidades sin quedar expuesto a una sola decision.";
}

nodes.nextMonth.addEventListener("click", nextMonth);
nodes.rebalance.addEventListener("click", rebalance);
nodes.reset.addEventListener("click", resetGame);
window.addEventListener("resize", render);
render();
