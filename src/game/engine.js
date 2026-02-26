import { simulateTime } from "./simulate.js";

/**
 * @param {{
 *  getState: ()=>any,
 *  onReport: (text:string, atMs:number)=>void,
 *  onAfterTick: (nowEpochMs:number)=>void,
 *  tickIntervalMs: number,
 * }} deps
 */
export function startEngine(deps) {
  const timer = window.setInterval(() => {
    const state = deps.getState();
    const now = Date.now();
    const last = Number.isFinite(state.lastTickEpochMs) ? state.lastTickEpochMs : now;
    const dt = Math.max(0, Math.min(10_000, now - last));
    state.lastTickEpochMs = now;

    simulateTime(state, dt, (text) => deps.onReport(text, now));
    deps.onAfterTick(now);
  }, deps.tickIntervalMs);

  return {
    stop() {
      window.clearInterval(timer);
    },
  };
}

