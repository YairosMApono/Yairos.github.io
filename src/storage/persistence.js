import { STORAGE_KEY, SCHEMA_VERSION } from "../config.js";
import { createInitialFields } from "../data/fields.js";
import { createDefaultState } from "../game/defaultState.js";

const LEGACY_START_KEY = "empire-start";

/**
 * @param {string | null} text
 * @returns {any | null}
 */
function parseJsonSafe(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * @param {any} raw
 * @param {number} now
 * @returns {import('../game/defaultState.js').GameState}
 */
function normalizeState(raw, now) {
  const fallback = createDefaultState(now);
  if (!raw || typeof raw !== "object") return fallback;

  /** @type {any} */
  const state = { ...fallback, ...raw };

  // startEpochMs (legacy: separate key)
  const legacyStart = Number.parseInt(String(localStorage.getItem(LEGACY_START_KEY) || ""), 10);
  state.startEpochMs = Number.isFinite(state.startEpochMs) ? state.startEpochMs : Number.isFinite(legacyStart) ? legacyStart : now;

  // resources (legacy: w/c/i/r)
  const r = raw.resources && typeof raw.resources === "object" ? raw.resources : {};
  state.resources = {
    wood: Number.isFinite(r.wood) ? r.wood : Number.isFinite(r.w) ? r.w : fallback.resources.wood,
    clay: Number.isFinite(r.clay) ? r.clay : Number.isFinite(r.c) ? r.c : fallback.resources.clay,
    iron: Number.isFinite(r.iron) ? r.iron : Number.isFinite(r.i) ? r.i : fallback.resources.iron,
    crop: Number.isFinite(r.crop) ? r.crop : Number.isFinite(r.r) ? r.r : fallback.resources.crop,
  };

  // buildings / troops defaults
  state.buildings = { ...fallback.buildings, ...(raw.buildings || {}) };
  state.troops = { ...fallback.troops, ...(raw.troops || {}) };

  // fields length / schema
  if (!Array.isArray(raw.fields)) state.fields = createInitialFields();
  if (!Array.isArray(state.fields) || state.fields.length !== 18) state.fields = createInitialFields();
  state.fields = state.fields.map((f, idx) => {
    const base = fallback.fields[idx] || { type: "wood", level: 0 };
    return { type: f?.type ?? base.type, level: Number.isFinite(f?.level) ? f.level : base.level };
  });

  // queue (legacy: remaining/total)
  if (!Array.isArray(raw.queue)) state.queue = [];
  state.queue = (state.queue || []).filter(Boolean).map((q) => {
    const remainingMs = Number.isFinite(q.remainingMs) ? q.remainingMs : Number.isFinite(q.remaining) ? q.remaining : 0;
    const totalMs = Number.isFinite(q.totalMs) ? q.totalMs : Number.isFinite(q.total) ? q.total : Math.max(remainingMs, 0);
    return { ...q, remainingMs, totalMs };
  });

  // reports (legacy: time:string)
  if (!Array.isArray(raw.reports)) state.reports = [];
  state.reports = (state.reports || [])
    .filter((x) => x && typeof x === "object")
    .map((rep) => ({
      text: String(rep.text ?? ""),
      atMs: Number.isFinite(rep.atMs) ? rep.atMs : now,
    }))
    .slice(-80);

  state.schemaVersion = SCHEMA_VERSION;
  state.lastTickEpochMs = Number.isFinite(state.lastTickEpochMs) ? state.lastTickEpochMs : now;
  state.lastSavedEpochMs = Number.isFinite(state.lastSavedEpochMs) ? state.lastSavedEpochMs : now;

  return state;
}

/**
 * @param {number} nowEpochMs
 * @returns {import('../game/defaultState.js').GameState}
 */
export function loadState(nowEpochMs) {
  const raw = parseJsonSafe(localStorage.getItem(STORAGE_KEY));
  return normalizeState(raw, nowEpochMs);
}

/**
 * @param {import('../game/defaultState.js').GameState} state
 */
export function saveState(state) {
  state.lastSavedEpochMs = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * @param {(state: import('../game/defaultState.js').GameState)=>void} doSave
 * @param {number} debounceMs
 */
export function createSaveScheduler(doSave, debounceMs) {
  /** @type {number | null} */
  let timer = null;

  /**
   * @param {import('../game/defaultState.js').GameState} state
   */
  function requestSave(state) {
    if (timer != null) window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      timer = null;
      doSave(state);
    }, debounceMs);
  }

  return { requestSave };
}

export function clearLegacyStorage() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_START_KEY);
}

