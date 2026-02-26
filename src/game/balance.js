import { FIELDS } from "../data/fields.js";
import { RESOURCE_IDS, createEmptyResources, normalizeCost } from "../data/resources.js";
import { TROOPS } from "../data/troops.js";

/** @type {Record<string, (typeof FIELDS)[number]>} */
const FIELD_BY_TYPE = Object.fromEntries(FIELDS.map((f) => [f.type, f]));

/** @type {Record<string, (typeof TROOPS)[number]>} */
const TROOP_BY_ID = Object.fromEntries(TROOPS.map((t) => [t.id, t]));

/**
 * @param {import('../data/resources.js').Cost} base
 * @param {number} level
 * @returns {import('../data/resources.js').ResourceAmounts}
 */
export function getCostForLevel(base, level) {
  const c = normalizeCost(base);
  /** @type {import('../data/resources.js').ResourceAmounts} */
  const out = createEmptyResources();
  for (const id of RESOURCE_IDS) out[id] = Math.floor(c[id] * Math.pow(1.55, level));
  return out;
}

/**
 * Bau-/Ausbauzeit in ms.
 * - Skaliert pro Level mit 1.5^level
 * - Hauptgebäude beschleunigt global (+5% pro Stufe)
 *
 * @param {number} baseTimeMs
 * @param {number} level
 * @param {number} mainLevel
 * @returns {number}
 */
export function getBuildTimeMs(baseTimeMs, level, mainLevel) {
  const speedBonus = 1 + (mainLevel || 0) * 0.05;
  return Math.floor((baseTimeMs * Math.pow(1.5, level)) / speedBonus);
}

/**
 * Rekrutierungszeit in ms.
 * - Basiszeit * count
 * - Hauptgebäude beschleunigt (+5% pro Stufe)
 * - Kaserne beschleunigt (+10% pro Stufe)
 *
 * @param {number} baseTimeSec
 * @param {number} count
 * @param {number} mainLevel
 * @param {number} barracksLevel
 * @returns {number}
 */
export function getTrainTimeMs(baseTimeSec, count, mainLevel, barracksLevel) {
  const mainBonus = 1 + (mainLevel || 0) * 0.05;
  const barracksBonus = 1 + (barracksLevel || 0) * 0.1;
  return Math.floor((baseTimeSec * 1000 * count) / mainBonus / barracksBonus);
}

/**
 * @param {{fields:{type:string, level:number}[]}} state
 * @returns {import('../data/resources.js').ResourceAmounts} Produktion pro Stunde
 */
export function getProductionPerHour(state) {
  const prod = createEmptyResources();
  for (const f of state.fields) {
    if (!f || f.level <= 0) continue;
    const def = FIELD_BY_TYPE[f.type];
    if (!def) continue;
    prod[f.type] += Math.floor(def.prodBase * Math.pow(def.prodFactor, f.level - 1));
  }
  return prod;
}

/**
 * @param {{buildings:{warehouse:number, granary:number}}} state
 * @returns {import('../data/resources.js').ResourceAmounts} Storage Cap
 */
export function getStorageCap(state) {
  const w = 2000 + (state.buildings?.warehouse || 0) * 2500;
  const g = 2000 + (state.buildings?.granary || 0) * 2000;
  return { wood: w, clay: w, iron: w, crop: g };
}

/**
 * @param {{troops: Record<string, number>}} state
 * @returns {number} Getreideverbrauch pro Stunde
 */
export function getCropConsumptionPerHour(state) {
  let sum = 0;
  for (const [id, count] of Object.entries(state.troops || {})) {
    const t = TROOP_BY_ID[id];
    if (!t || !count) continue;
    sum += t.consumeCropPerHour * count;
  }
  return sum;
}

/**
 * @param {{buildings:{rally:number}}} state
 * @returns {number}
 */
export function getMaxQueueSlots(state) {
  return (state.buildings?.rally || 0) > 0 ? 2 : 1;
}

/**
 * Ressourcenfortschritt für ein Zeitsegment.
 *
 * @param {{resources: import('../data/resources.js').ResourceAmounts}} state
 * @param {number} segmentMs
 * @param {import('../data/resources.js').ResourceAmounts} prodPerHour
 * @param {number} cropConsumePerHour
 * @param {import('../data/resources.js').ResourceAmounts} storageCap
 */
export function advanceResources(state, segmentMs, prodPerHour, cropConsumePerHour, storageCap) {
  const dtHours = segmentMs / 3600000;
  state.resources.wood = Math.min(storageCap.wood, state.resources.wood + prodPerHour.wood * dtHours);
  state.resources.clay = Math.min(storageCap.clay, state.resources.clay + prodPerHour.clay * dtHours);
  state.resources.iron = Math.min(storageCap.iron, state.resources.iron + prodPerHour.iron * dtHours);
  state.resources.crop = Math.min(
    storageCap.crop,
    Math.max(0, state.resources.crop + (prodPerHour.crop - cropConsumePerHour) * dtHours),
  );
}

