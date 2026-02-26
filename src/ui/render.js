import { BUILDINGS } from "../data/buildings.js";
import { FIELDS } from "../data/fields.js";
import { TROOPS } from "../data/troops.js";
import { getCropConsumptionPerHour, getMaxQueueSlots, getProductionPerHour, getStorageCap } from "../game/balance.js";

/** @type {Record<string, (typeof FIELDS)[number]>} */
const FIELD_BY_TYPE = Object.fromEntries(FIELDS.map((f) => [f.type, f]));

/** @type {Intl.DateTimeFormat} */
const REPORT_TIME_FORMAT = new Intl.DateTimeFormat("de-DE", { dateStyle: "short", timeStyle: "medium" });

/**
 * @param {number} ms
 */
function formatSeconds(ms) {
  return `${Math.max(0, Math.ceil(ms / 1000))}s`;
}

/**
 * @param {any} state
 * @param {number} nowEpochMs
 */
export function updateResourceBar(state, nowEpochMs) {
  const prod = getProductionPerHour(state);
  const cons = getCropConsumptionPerHour(state);
  const store = getStorageCap(state);

  document.getElementById("resWood").textContent = String(Math.floor(state.resources.wood));
  document.getElementById("resClay").textContent = String(Math.floor(state.resources.clay));
  document.getElementById("resIron").textContent = String(Math.floor(state.resources.iron));
  document.getElementById("resCrop").textContent = String(Math.floor(state.resources.crop));

  document.getElementById("rateWood").textContent = `+${prod.wood}/h`;
  document.getElementById("rateClay").textContent = `+${prod.clay}/h`;
  document.getElementById("rateIron").textContent = `+${prod.iron}/h`;

  const cropNet = prod.crop - cons;
  const cropRateEl = document.getElementById("rateCrop");
  cropRateEl.textContent = `${cropNet >= 0 ? "+" : ""}${cropNet}/h`;
  cropRateEl.classList.toggle("negative", cropNet < 0);

  document.getElementById("storeWood").textContent = `/${store.wood}`;
  document.getElementById("storeClay").textContent = `/${store.clay}`;
  document.getElementById("storeIron").textContent = `/${store.iron}`;
  document.getElementById("storeCrop").textContent = `/${store.crop}`;

  const day = Math.max(1, Math.floor((nowEpochMs - state.startEpochMs) / 90000) + 1);
  document.getElementById("gameTime").textContent = `Tag ${day}`;
}

/**
 * @param {any} state
 */
export function renderQueue(state) {
  const queueContainer = document.getElementById("queueContainer");
  const queueList = document.getElementById("queueList");

  if (!state.queue.length) {
    queueContainer.style.display = "none";
    return;
  }

  queueContainer.style.display = "block";
  const slots = getMaxQueueSlots(state);
  const items = state.queue.slice(0, slots);
  queueList.innerHTML = items
    .map((q) => {
      const total = q.totalMs || q.remainingMs;
      const pct = Math.max(0, (1 - q.remainingMs / Math.max(1, total)) * 100);
      return `<div class="queue-item"><span>${q.icon || "🔨"} ${q.name}</span><div class="progress"><div class="progress-fill" style="width:${pct}%"></div></div><span>${formatSeconds(q.remainingMs)}</span></div>`;
    })
    .join("");
}

export function renderMap() {
  const grid = document.getElementById("mapGrid");
  grid.innerHTML = "";
  for (let i = 0; i < 49; i++) {
    const t = document.createElement("button");
    t.type = "button";
    t.className = `map-tile${i === 24 ? " village" : " empty"}`;
    t.setAttribute("aria-label", i === 24 ? "Dein Dorf" : "Unentdecktes Gebiet");
    t.dataset.tile = String(i);
    grid.appendChild(t);
  }
}

/**
 * @param {any} state
 */
export function renderVillage(state) {
  const layout = document.getElementById("villageLayout");
  const slots = /** @type {const} */ (["main", "barracks", "warehouse", "granary", "wall", "rally"]);
  layout.innerHTML = slots
    .map((id) => {
      const b = BUILDINGS[id];
      const lvl = state.buildings[id] || 0;
      return `<button type="button" class="building-slot ${lvl ? "" : "empty"}" data-building-id="${id}" aria-label="${b.name} ${lvl ? `Stufe ${lvl}` : "leer"}"><span class="icon">${b.icon}</span><span class="name">${b.name}</span><span class="level">${lvl ? `Stufe ${lvl}` : "Leer"}</span></button>`;
    })
    .join("");

  const fields = document.getElementById("resourceFields");
  fields.innerHTML = state.fields
    .map((f, i) => {
      const type = FIELD_BY_TYPE[f.type];
      return `<button type="button" class="field" data-field-idx="${i}" aria-label="${type.name} Stufe ${f.level}"><span class="icon">${type.icon}</span><span class="name">${type.name}</span><span class="lvl">St. ${f.level}</span></button>`;
    })
    .join("");
}

/**
 * @param {any} state
 */
export function renderTroops(state) {
  const grid = document.getElementById("troopsGrid");
  const canTrain = (state.buildings.barracks || 0) > 0;
  const queueFull = state.queue.length >= getMaxQueueSlots(state);

  grid.innerHTML = TROOPS.map((t) => {
    const count = state.troops[t.id] || 0;
    const canAffordOne = Object.entries(t.cost).every(([k, v]) => state.resources[k] >= v);
    const trainControls = canTrain
      ? `<input type="number" inputmode="numeric" id="train${t.id}" min="1" value="1" max="99" aria-label="Anzahl ${t.name}"><button class="btn btn-sm" data-train-id="${t.id}" ${!canAffordOne || queueFull ? "disabled" : ""}>Rekrutieren</button>`
      : `<p style="font-size:0.85rem;color:#8fbc8f;margin-top:4px">Kaserne bauen</p>`;
    return `<div class="troop-card"><div class="icon">${t.icon}</div><div class="name">${t.name}</div><div class="count">${count} Einheiten</div><small style="opacity:0.7">${t.consumeCropPerHour} Getr./h</small>${trainControls}</div>`;
  }).join("");
}

/**
 * @param {any} state
 */
export function renderReports(state) {
  const list = document.getElementById("reportList");
  if (!state.reports.length) {
    list.innerHTML = '<p style="text-align:center;padding:2rem;color:#8fbc8f">Noch keine Berichte</p>';
    return;
  }

  const items = state.reports
    .slice()
    .reverse()
    .map((r) => `<div class="report"><div class="time">${REPORT_TIME_FORMAT.format(new Date(r.atMs))}</div>${r.text}</div>`)
    .join("");
  list.innerHTML = items;
}

/**
 * @param {string} name
 */
export function switchTab(name) {
  document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === name));
  document.querySelectorAll(".village-view").forEach((v) => v.classList.remove("active"));
  const tab = document.getElementById(`${name}Tab`);
  if (tab) tab.classList.add("active");
}

