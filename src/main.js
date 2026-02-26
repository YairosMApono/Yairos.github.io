import { OFFLINE_PROGRESS_CAP_MS, SAVE_DEBOUNCE_MS, TICK_INTERVAL_MS } from "./config.js";
import { createDefaultState } from "./game/defaultState.js";
import { startEngine } from "./game/engine.js";
import { addReport as pushReport, simulateTime } from "./game/simulate.js";
import { enqueueTroopTraining } from "./game/actions.js";
import { TROOPS_BY_ID } from "./data/troops.js";
import { createSaveScheduler, loadState, saveState, clearLegacyStorage } from "./storage/persistence.js";
import { createHelpController } from "./ui/help.js";
import { createBuildModalController } from "./ui/modals.js";
import { renderMap, renderQueue, renderReports, renderTroops, renderVillage, switchTab, updateResourceBar } from "./ui/render.js";
import { validateStaticData } from "./validate/validate.js";

function main() {
  try {
    validateStaticData();
  } catch (e) {
    // Fails fast wenn Definitionen inkonsistent sind.
    alert(String(e?.message || e));
    throw e;
  }

  const now = Date.now();
  /** @type {any} */
  let state = loadState(now);

  // Offline-Fortschritt (basierend auf letzter Speicherung)
  const offlineMsRaw = Math.max(0, now - (state.lastSavedEpochMs || now));
  const offlineMs = Math.min(OFFLINE_PROGRESS_CAP_MS, offlineMsRaw);
  if (offlineMs > 2500) {
    simulateTime(state, offlineMs, (text) => pushReport(state, text, now));
    pushReport(state, `Offline-Fortschritt: ${Math.floor(offlineMs / 60000)} Minuten simuliert.`, now);
  }
  state.lastTickEpochMs = now;

  const help = createHelpController({
    modalEl: document.getElementById("helpModal"),
    titleEl: document.getElementById("helpTitle"),
    textEl: document.getElementById("helpText"),
    closeBtn: document.getElementById("helpCloseBtn"),
    modalHelpBtn: document.getElementById("modalHelpBtn"),
  });

  const buildModal = createBuildModalController(
    {
      modalEl: document.getElementById("buildingModal"),
      titleEl: document.getElementById("modalTitle"),
      descEl: document.getElementById("modalDesc"),
      costsEl: document.getElementById("modalCosts"),
      timeEl: document.getElementById("modalTime"),
      cancelBtn: document.getElementById("modalCancel"),
      buildBtn: document.getElementById("modalBuild"),
    },
    {
      getState: () => state,
      help,
      onStateChanged: (reportText) => {
        if (reportText) pushReport(state, reportText, Date.now());
        requestSave();
        renderActiveTab();
        renderQueue(state);
      },
    },
  );

  const saveScheduler = createSaveScheduler((s) => saveState(s), SAVE_DEBOUNCE_MS);
  const requestSave = () => saveScheduler.requestSave(state);

  function renderActiveTab() {
    const active = document.querySelector(".tab.active")?.getAttribute("data-tab") || "map";
    if (active === "map") {
      // Map bleibt statisch
      return;
    }
    if (active === "village") renderVillage(state);
    if (active === "troops") renderTroops(state);
    if (active === "reports") renderReports(state);
  }

  function renderAll(nowEpochMs) {
    updateResourceBar(state, nowEpochMs);
    renderQueue(state);
    renderActiveTab();
  }

  // Initial render
  renderMap();
  renderVillage(state);
  renderTroops(state);
  renderReports(state);
  renderAll(now);

  // Tabs
  document.querySelectorAll(".tab").forEach((t) =>
    t.addEventListener("click", () => {
      switchTab(t.dataset.tab);
      renderActiveTab();
    }),
  );

  // Hilfe: Delegation über data-help
  document.addEventListener("click", (e) => {
    const btn = e.target?.closest?.("[data-help]");
    if (!btn) return;
    help.showHelp(btn.getAttribute("data-help"));
  });

  // Map: Dorf-Klick
  document.getElementById("mapGrid").addEventListener("click", (e) => {
    const tile = e.target?.closest?.("[data-tile]");
    if (!tile) return;
    if (tile.getAttribute("data-tile") === "24") {
      switchTab("village");
      renderVillage(state);
    }
  });

  // Gebäude / Felder: Delegation
  document.getElementById("villageLayout").addEventListener("click", (e) => {
    const btn = e.target?.closest?.("[data-building-id]");
    if (!btn) return;
    buildModal.openBuildingModal(btn.getAttribute("data-building-id"));
  });
  document.getElementById("resourceFields").addEventListener("click", (e) => {
    const btn = e.target?.closest?.("[data-field-idx]");
    if (!btn) return;
    buildModal.openFieldModal(Number.parseInt(btn.getAttribute("data-field-idx"), 10));
  });

  // Truppen: Delegation
  document.getElementById("troopsGrid").addEventListener("click", (e) => {
    const btn = e.target?.closest?.("[data-train-id]");
    if (!btn) return;
    const id = btn.getAttribute("data-train-id");
    const input = document.getElementById(`train${id}`);
    const count = Number.parseInt(input?.value || "1", 10);
    const res = enqueueTroopTraining(state, id, count);
    if (!res.ok) return;
    const troop = TROOPS_BY_ID[id];
    const n = Math.min(99, Math.max(1, Math.floor(count || 1)));
    if (res.warn) pushReport(state, res.warn, Date.now());
    pushReport(state, `Rekrutierung: ${n}x ${troop?.name ?? id}`, Date.now());
    requestSave();
    renderTroops(state);
    renderQueue(state);
    renderActiveTab();
  });

  // Neues Spiel
  document.getElementById("btnNewGame").addEventListener("click", () => {
    if (!confirm("Neues Spiel starten? Fortschritt geht verloren.")) return;
    clearLegacyStorage();
    state = createDefaultState(Date.now());
    saveState(state);
    switchTab("map");
    renderMap();
    renderVillage(state);
    renderTroops(state);
    renderReports(state);
    renderAll(Date.now());
  });

  // Engine
  let dirty = false;
  startEngine({
    getState: () => state,
    onReport: (text, atMs) => {
      dirty = true;
      pushReport(state, text, atMs);
      requestSave();
    },
    onAfterTick: (nowEpochMs) => {
      updateResourceBar(state, nowEpochMs);
      renderQueue(state);
      if (dirty) {
        dirty = false;
        renderActiveTab();
      }
      if (nowEpochMs - (state.lastSavedEpochMs || 0) > 5000) saveState(state);
    },
    tickIntervalMs: TICK_INTERVAL_MS,
  });
}

main();

