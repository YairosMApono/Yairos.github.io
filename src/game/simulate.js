import { getCropConsumptionPerHour, getMaxQueueSlots, getProductionPerHour, getStorageCap, advanceResources } from "./balance.js";

/**
 * @typedef {{text:string, atMs:number}} Report
 */

/**
 * @param {{reports: Report[]}} state
 * @param {string} text
 * @param {number} atMs
 */
export function addReport(state, text, atMs) {
  state.reports.push({ text, atMs });
  if (state.reports.length > 80) state.reports.splice(0, state.reports.length - 80);
}

/**
 * Simuliert Zeitfortschritt für Ressourcen + Queue (segmentweise bis zum nächsten Abschluss).
 *
 * @param {any} state
 * @param {number} deltaMs
 * @param {(text:string)=>void} onReport
 */
export function simulateTime(state, deltaMs, onReport) {
  let remainingMs = Math.max(0, deltaMs);
  while (remainingMs > 0) {
    const slots = Math.min(getMaxQueueSlots(state), state.queue.length);
    let nextCompleteMs = Infinity;
    for (let i = 0; i < slots; i++) {
      const q = state.queue[i];
      if (!q) continue;
      nextCompleteMs = Math.min(nextCompleteMs, Math.max(0, q.remainingMs));
    }

    const segmentMs = Math.min(remainingMs, Number.isFinite(nextCompleteMs) ? nextCompleteMs : remainingMs);
    if (segmentMs > 0) {
      const prod = getProductionPerHour(state);
      const cons = getCropConsumptionPerHour(state);
      const cap = getStorageCap(state);
      advanceResources(state, segmentMs, prod, cons, cap);

      for (let i = 0; i < slots; i++) {
        const q = state.queue[i];
        if (!q) continue;
        q.remainingMs -= segmentMs;
      }

      remainingMs -= segmentMs;
    } else {
      // Segment ist 0ms, aber ein Item kann abgeschlossen sein.
      remainingMs = Math.max(0, remainingMs);
    }

    // Abschlüsse verarbeiten (ggf. mehrere auf einmal).
    const slotsAfter = Math.min(getMaxQueueSlots(state), state.queue.length);
    for (let i = 0; i < slotsAfter; i++) {
      const q = state.queue[i];
      if (!q || q.remainingMs > 0) continue;

      state.queue.splice(i, 1);
      if (q.type === "building") state.buildings[q.id] = (state.buildings[q.id] || 0) + 1;
      else if (q.type === "field" && state.fields[q.id]) state.fields[q.id].level++;
      else if (q.type === "troop") state.troops[q.id] = (state.troops[q.id] || 0) + (q.count || 0);

      onReport?.(`${q.name} abgeschlossen!`);
      i--;
    }
  }
}

