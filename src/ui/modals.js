import { BUILDINGS, BUILD_REQS } from "../data/buildings.js";
import { FIELDS } from "../data/fields.js";
import { RESOURCE_META } from "../data/resources.js";
import { getBuildTimeMs, getCostForLevel, getMaxQueueSlots } from "../game/balance.js";
import { enqueueBuilding, enqueueFieldUpgrade, meetsBuildingReqs } from "../game/actions.js";

/** @type {Record<string, (typeof FIELDS)[number]>} */
const FIELD_BY_TYPE = Object.fromEntries(FIELDS.map((f) => [f.type, f]));

/**
 * @param {{
 *  modalEl: HTMLElement,
 *  titleEl: HTMLElement,
 *  descEl: HTMLElement,
 *  costsEl: HTMLElement,
 *  timeEl: HTMLElement,
 *  cancelBtn: HTMLButtonElement,
 *  buildBtn: HTMLButtonElement,
 * }} els
 * @param {{
 *  getState: ()=>any,
 *  onStateChanged: (reportText?:string)=>void,
 *  help: { setModalHelp:(text:string)=>void },
 * }} deps
 */
export function createBuildModalController(els, deps) {
  function close() {
    els.modalEl.classList.remove("show");
  }

  function openBuildingModal(buildingId) {
    const state = deps.getState();
    const b = BUILDINGS[buildingId];
    if (!b) return;

    const currentLevel = state.buildings[buildingId] || 0;
    const reqOk = meetsBuildingReqs(state, buildingId);
    const cost = getCostForLevel(b.base, currentLevel);
    const timeMs = getBuildTimeMs(b.timeMs, currentLevel, state.buildings.main || 0);
    const canAfford = Object.entries(cost).every(([k, v]) => state.resources[k] >= v);
    const queueFull = state.queue.length >= getMaxQueueSlots(state);

    deps.help.setModalHelp(b.help || "");

    els.titleEl.textContent = `${b.name} (Stufe ${currentLevel + 1})`;
    els.descEl.textContent = reqOk
      ? b.desc
      : `Voraussetzungen: ${
          BUILD_REQS[buildingId]
            ? Object.entries(BUILD_REQS[buildingId])
                .map(([x, y]) => `${BUILDINGS[x]?.name ?? x} St.${y}`)
                .join(", ")
            : ""
        }`;
    els.costsEl.innerHTML = Object.entries(cost)
      .map(([k, v]) => {
        const ok = state.resources[k] >= v;
        return `<span class="cost ${ok ? "can" : "cannot"}">${RESOURCE_META[k]?.icon ?? "❔"} ${Math.floor(v)}</span>`;
      })
      .join("");
    els.timeEl.textContent = `⏱️ Bauzeit: ${Math.ceil(timeMs / 1000)} Sekunden`;

    els.buildBtn.disabled = !reqOk || !canAfford || queueFull;
    els.buildBtn.onclick = () => {
      const s = deps.getState();
      const res = enqueueBuilding(s, buildingId);
      if (!res.ok) return;
      close();
      deps.onStateChanged(`Bau: ${b.name} Stufe ${currentLevel + 1}`);
    };

    els.modalEl.classList.add("show");
    els.cancelBtn.focus?.();
  }

  function openFieldModal(fieldIdx) {
    const state = deps.getState();
    const f = state.fields[fieldIdx];
    if (!f) return;

    const def = FIELD_BY_TYPE[f.type];
    if (!def) return;

    deps.help.setModalHelp(def.help || "");

    const cost = getCostForLevel(def.base, f.level);
    const timeMs = getBuildTimeMs(6000, f.level, state.buildings.main || 0);
    const canAfford = Object.entries(cost).every(([k, v]) => state.resources[k] >= v);
    const queueFull = state.queue.length >= getMaxQueueSlots(state);

    const nextProd = Math.floor(def.prodBase * Math.pow(def.prodFactor, f.level));
    els.titleEl.textContent = `${def.name} (Stufe ${f.level + 1})`;
    els.descEl.textContent = `Produziert ${RESOURCE_META[def.type]?.label ?? def.type}. Stufe ${f.level + 1}: +${nextProd}/h`;
    els.costsEl.innerHTML = Object.entries(cost)
      .map(([k, v]) => {
        const ok = state.resources[k] >= v;
        return `<span class="cost ${ok ? "can" : "cannot"}">${RESOURCE_META[k]?.icon ?? "❔"} ${Math.floor(v)}</span>`;
      })
      .join("");
    els.timeEl.textContent = `⏱️ Bauzeit: ${Math.ceil(timeMs / 1000)} Sekunden`;

    els.buildBtn.disabled = !canAfford || queueFull;
    els.buildBtn.onclick = () => {
      const s = deps.getState();
      const res = enqueueFieldUpgrade(s, fieldIdx);
      if (!res.ok) return;
      close();
      deps.onStateChanged(`Ausbau: ${def.name} Stufe ${f.level + 1}`);
    };

    els.modalEl.classList.add("show");
    els.cancelBtn.focus?.();
  }

  els.cancelBtn.addEventListener("click", close);
  els.modalEl.addEventListener("click", (e) => {
    if (e.target === els.modalEl) close();
  });

  return { openBuildingModal, openFieldModal, close };
}

