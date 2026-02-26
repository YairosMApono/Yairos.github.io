/**
 * @typedef {'militia'|'sword'|'spear'|'axe'} TroopId
 */

/** @type {{id:TroopId, name:string, icon:string, cost:{wood:number,clay:number,iron:number,crop:number}, timeSec:number, consumeCropPerHour:number}[]} */
export const TROOPS = [
  { id: "militia", name: "Miliz", icon: "🛡️", cost: { wood: 60, clay: 70, iron: 40, crop: 20 }, timeSec: 400, consumeCropPerHour: 1 },
  { id: "sword", name: "Schwertkämpfer", icon: "⚔️", cost: { wood: 60, clay: 70, iron: 40, crop: 20 }, timeSec: 500, consumeCropPerHour: 1 },
  { id: "spear", name: "Speerträger", icon: "🔱", cost: { wood: 50, clay: 60, iron: 30, crop: 60 }, timeSec: 450, consumeCropPerHour: 1 },
  { id: "axe", name: "Axtkämpfer", icon: "🪓", cost: { wood: 60, clay: 70, iron: 40, crop: 20 }, timeSec: 600, consumeCropPerHour: 2 },
];

/** @type {Record<TroopId, (typeof TROOPS)[number]>} */
export const TROOPS_BY_ID = /** @type {any} */ (Object.fromEntries(TROOPS.map((t) => [t.id, t])));

