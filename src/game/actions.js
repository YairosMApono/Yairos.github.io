import { BUILDINGS, BUILD_REQS } from "../data/buildings.js";
import { FIELDS } from "../data/fields.js";
import { TROOPS, TROOPS_BY_ID } from "../data/troops.js";
import { getBuildTimeMs, getCostForLevel, getMaxQueueSlots, getProductionPerHour, getCropConsumptionPerHour, getTrainTimeMs } from "./balance.js";

/** @type {Record<string, (typeof FIELDS)[number]>} */
const FIELD_BY_TYPE = Object.fromEntries(FIELDS.map((f) => [f.type, f]));

/**
 * @param {any} state
 * @param {string} buildingId
 */
export function meetsBuildingReqs(state, buildingId) {
  const reqs = BUILD_REQS[buildingId];
  if (!reqs) return true;
  return Object.entries(reqs).every(([bid, lvl]) => (state.buildings[bid] || 0) >= lvl);
}

/**
 * @param {any} state
 * @param {import('../data/resources.js').ResourceAmounts} cost
 */
export function canAfford(state, cost) {
  return Object.entries(cost).every(([k, v]) => state.resources[k] >= v);
}

/**
 * @param {any} state
 */
export function isQueueFull(state) {
  return state.queue.length >= getMaxQueueSlots(state);
}

/**
 * @param {any} state
 * @param {string} buildingId
 * @returns {{ok:true} | {ok:false, reason:string}}
 */
export function enqueueBuilding(state, buildingId) {
  const b = BUILDINGS[buildingId];
  if (!b) return { ok: false, reason: "Unbekanntes Gebäude." };
  if (!meetsBuildingReqs(state, buildingId)) return { ok: false, reason: "Voraussetzungen nicht erfüllt." };
  if (isQueueFull(state)) return { ok: false, reason: "Bau-Queue ist voll." };

  const currentLevel = state.buildings[buildingId] || 0;
  const cost = getCostForLevel(b.base, currentLevel);
  if (!canAfford(state, cost)) return { ok: false, reason: "Nicht genug Rohstoffe." };

  const timeMs = getBuildTimeMs(b.timeMs, currentLevel, state.buildings.main || 0);
  state.resources.wood -= cost.wood;
  state.resources.clay -= cost.clay;
  state.resources.iron -= cost.iron;
  state.resources.crop -= cost.crop;

  state.queue.push({
    type: "building",
    id: buildingId,
    name: `${b.name} St.${currentLevel + 1}`,
    icon: b.icon,
    remainingMs: timeMs,
    totalMs: timeMs,
  });
  return { ok: true };
}

/**
 * @param {any} state
 * @param {number} fieldIdx
 * @returns {{ok:true} | {ok:false, reason:string}}
 */
export function enqueueFieldUpgrade(state, fieldIdx) {
  const f = state.fields[fieldIdx];
  if (!f) return { ok: false, reason: "Unbekanntes Feld." };
  if (isQueueFull(state)) return { ok: false, reason: "Bau-Queue ist voll." };

  const def = FIELD_BY_TYPE[f.type];
  if (!def) return { ok: false, reason: "Unbekannter Feldtyp." };

  const cost = getCostForLevel(def.base, f.level);
  if (!canAfford(state, cost)) return { ok: false, reason: "Nicht genug Rohstoffe." };

  const timeMs = getBuildTimeMs(6000, f.level, state.buildings.main || 0);
  state.resources.wood -= cost.wood;
  state.resources.clay -= cost.clay;
  state.resources.iron -= cost.iron;
  state.resources.crop -= cost.crop;

  state.queue.push({
    type: "field",
    id: fieldIdx,
    name: `${def.name} St.${f.level + 1}`,
    icon: def.icon,
    remainingMs: timeMs,
    totalMs: timeMs,
  });
  return { ok: true };
}

/**
 * @param {any} state
 * @param {string} troopId
 * @param {number} count
 * @returns {{ok:true} | {ok:false, reason:string, warn?:string}}
 */
export function enqueueTroopTraining(state, troopId, count) {
  const t = TROOPS_BY_ID[troopId];
  if (!t) return { ok: false, reason: "Unbekannte Einheit." };
  if ((state.buildings.barracks || 0) <= 0) return { ok: false, reason: "Kaserne fehlt." };
  if (isQueueFull(state)) return { ok: false, reason: "Bau-Queue ist voll." };

  const n = Math.min(99, Math.max(1, Math.floor(count || 1)));
  const cost = {
    wood: t.cost.wood * n,
    clay: t.cost.clay * n,
    iron: t.cost.iron * n,
    crop: t.cost.crop * n,
  };
  if (!canAfford(state, cost)) return { ok: false, reason: "Nicht genug Rohstoffe." };

  const prod = getProductionPerHour(state);
  const cons = getCropConsumptionPerHour(state);
  const warn =
    prod.crop - cons < t.consumeCropPerHour * n ? `Warnung: Nicht genug Getreide-Produktion für ${n}x ${t.name}!` : undefined;

  state.resources.wood -= cost.wood;
  state.resources.clay -= cost.clay;
  state.resources.iron -= cost.iron;
  state.resources.crop -= cost.crop;

  const timeMs = getTrainTimeMs(t.timeSec, n, state.buildings.main || 0, state.buildings.barracks || 0);
  state.queue.push({
    type: "troop",
    id: troopId,
    count: n,
    name: `${n}x ${t.name}`,
    icon: t.icon,
    remainingMs: timeMs,
    totalMs: timeMs,
  });

  return { ok: true, ...(warn ? { warn } : {}) };
}

/**
 * Export nur für Doku/Checks: Liste aller Troops.
 * @returns {string[]}
 */
export function listTroopIds() {
  return TROOPS.map((t) => t.id);
}

