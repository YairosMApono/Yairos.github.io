import { createInitialFields } from "../data/fields.js";
import { createEmptyResources } from "../data/resources.js";

/**
 * @typedef {'building'|'field'|'troop'} QueueType
 * @typedef {{type:'building', id: import('../data/buildings.js').BuildingId, name:string, icon:string, remainingMs:number, totalMs:number}} BuildingQueueItem
 * @typedef {{type:'field', id:number, name:string, icon:string, remainingMs:number, totalMs:number}} FieldQueueItem
 * @typedef {{type:'troop', id: import('../data/troops.js').TroopId, count:number, name:string, icon:string, remainingMs:number, totalMs:number}} TroopQueueItem
 * @typedef {BuildingQueueItem|FieldQueueItem|TroopQueueItem} QueueItem
 *
 * @typedef {{text:string, atMs:number}} Report
 *
 * @typedef {{
 *  schemaVersion:number,
 *  startEpochMs:number,
 *  lastTickEpochMs:number,
 *  lastSavedEpochMs:number,
 *  resources: import('../data/resources.js').ResourceAmounts,
 *  buildings: Record<import('../data/buildings.js').BuildingId, number>,
 *  fields: {type: import('../data/fields.js').FieldType, level:number}[],
 *  troops: Record<import('../data/troops.js').TroopId, number>,
 *  queue: QueueItem[],
 *  reports: Report[],
 * }} GameState
 */

/**
 * @param {number} nowEpochMs
 * @returns {GameState}
 */
export function createDefaultState(nowEpochMs) {
  const state = {
    schemaVersion: 2,
    startEpochMs: nowEpochMs,
    lastTickEpochMs: nowEpochMs,
    lastSavedEpochMs: nowEpochMs,
    resources: { ...createEmptyResources(), wood: 750, clay: 750, iron: 750, crop: 750 },
    buildings: { main: 0, barracks: 0, warehouse: 0, granary: 0, wall: 0, rally: 0 },
    fields: createInitialFields(),
    troops: { militia: 0, sword: 0, spear: 0, axe: 0 },
    queue: [],
    reports: [],
  };

  // "Schnellstart" wie bisher: Start mit Dorfkern + Basisfelder auf Stufe 1.
  state.buildings.main = 1;
  state.fields = state.fields.map((f) => ({ ...f, level: 1 }));

  return state;
}

