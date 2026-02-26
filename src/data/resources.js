/**
 * Zentrale Definitionen (Single Source of Truth) für Ressourcen-IDs und Meta.
 *
 * @typedef {'wood'|'clay'|'iron'|'crop'} ResourceId
 * @typedef {{wood:number, clay:number, iron:number, crop:number}} ResourceAmounts
 * @typedef {Partial<ResourceAmounts>} Cost
 */

/** @type {readonly ResourceId[]} */
export const RESOURCE_IDS = /** @type {const} */ (["wood", "clay", "iron", "crop"]);

/** @type {Record<ResourceId, {label:string, icon:string}>} */
export const RESOURCE_META = {
  wood: { label: "Holz", icon: "🪵" },
  clay: { label: "Lehm", icon: "🧱" },
  iron: { label: "Eisen", icon: "⚙️" },
  crop: { label: "Getreide", icon: "🌾" },
};

/** @returns {ResourceAmounts} */
export function createEmptyResources() {
  return { wood: 0, clay: 0, iron: 0, crop: 0 };
}

/**
 * @param {Cost | undefined} cost
 * @returns {ResourceAmounts}
 */
export function normalizeCost(cost) {
  return {
    wood: cost?.wood ?? 0,
    clay: cost?.clay ?? 0,
    iron: cost?.iron ?? 0,
    crop: cost?.crop ?? 0,
  };
}

