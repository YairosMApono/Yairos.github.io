import { BUILDINGS, BUILD_REQS } from "../data/buildings.js";
import { FIELDS } from "../data/fields.js";
import { RESOURCE_IDS } from "../data/resources.js";
import { TROOPS } from "../data/troops.js";

/**
 * @param {string} msg
 */
function fail(msg) {
  throw new Error(`Definitionen ungültig: ${msg}`);
}

/**
 * @param {any} obj
 * @param {string} ctx
 */
function validateCostKeys(obj, ctx) {
  if (!obj || typeof obj !== "object") fail(`${ctx}: cost fehlt`);
  for (const k of Object.keys(obj)) {
    if (!RESOURCE_IDS.includes(/** @type {any} */ (k))) fail(`${ctx}: unbekannter Ressourcen-Key '${k}' (erlaubt: ${RESOURCE_IDS.join(", ")})`);
  }
}

export function validateStaticData() {
  // Buildings
  for (const [id, b] of Object.entries(BUILDINGS)) {
    if (!b?.name || !b?.icon) fail(`BUILDINGS.${id}: name/icon fehlt`);
    validateCostKeys(b.base, `BUILDINGS.${id}.base`);
    if (!Number.isFinite(b.timeMs) || b.timeMs <= 0) fail(`BUILDINGS.${id}.timeMs ungültig`);
  }

  for (const [id, reqs] of Object.entries(BUILD_REQS)) {
    if (!(id in BUILDINGS)) fail(`BUILD_REQS referenziert unbekanntes Gebäude '${id}'`);
    for (const [rid, lvl] of Object.entries(reqs || {})) {
      if (!(rid in BUILDINGS)) fail(`BUILD_REQS.${id} referenziert unbekanntes Gebäude '${rid}'`);
      if (!Number.isFinite(lvl) || lvl < 0) fail(`BUILD_REQS.${id}.${rid} ungültiges Level`);
    }
  }

  // Fields
  const seenFieldTypes = new Set();
  for (const f of FIELDS) {
    if (!f?.type || !f?.name || !f?.icon) fail(`FIELDS: type/name/icon fehlt`);
    if (!RESOURCE_IDS.includes(/** @type {any} */ (f.type))) fail(`FIELDS: type '${f.type}' ist keine ResourceId`);
    if (seenFieldTypes.has(f.type)) fail(`FIELDS: type '${f.type}' doppelt`);
    seenFieldTypes.add(f.type);
    validateCostKeys(f.base, `FIELDS.${f.type}.base`);
    if (!Number.isFinite(f.prodBase) || !Number.isFinite(f.prodFactor)) fail(`FIELDS.${f.type}: Produktion ungültig`);
  }

  // Troops
  const troopIds = new Set();
  for (const t of TROOPS) {
    if (troopIds.has(t.id)) fail(`TROOPS: id '${t.id}' doppelt`);
    troopIds.add(t.id);
    validateCostKeys(t.cost, `TROOPS.${t.id}.cost`);
    if (!Number.isFinite(t.timeSec) || t.timeSec <= 0) fail(`TROOPS.${t.id}.timeSec ungültig`);
    if (!Number.isFinite(t.consumeCropPerHour) || t.consumeCropPerHour < 0) fail(`TROOPS.${t.id}.consumeCropPerHour ungültig`);
  }
}

