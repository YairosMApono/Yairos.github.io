/**
 * Empire Builder - Spiel-Engine
 * Verwaltet Spielzustand, Ressourcen-Produktion, Bau-Queue und Spiellogik
 */
import {
    BUILDINGS, FIELDS, BUILD_REQS, TROOPS, FIELD_LAYOUT, MILESTONES,
    MAX_LEVEL, SAVE_KEY, START_KEY, MAX_REPORTS,
    COST_FACTOR, BUILD_TIME_FACTOR, MAIN_SPEED_BONUS, BARRACKS_SPEED_BONUS,
    WALL_DEF_BONUS, FIELD_BASE_TIME, START_RESOURCES,
    BASE_STORAGE, STORAGE_PER_LEVEL, DAY_DURATION, COST_TO_RES
} from './config.js';

export default class GameEngine {
    constructor() {
        this.state = this._createDefault();
        this._listeners = [];
        this._achieved = new Set();
    }

    onChange(fn) { this._listeners.push(fn); }

    _notify() { this._listeners.forEach(fn => fn(this.state)); }

    _createDefault() {
        return {
            resources: { wood: 0, clay: 0, iron: 0, crop: 0 },
            buildings: { main: 0, barracks: 0, warehouse: 0, granary: 0, wall: 0, rally: 0 },
            fields: FIELD_LAYOUT.map(type => ({ type, level: 0 })),
            troops: { militia: 0, sword: 0, spear: 0, axe: 0 },
            queue: [],
            lastTick: Date.now(),
            day: 1,
            reports: [],
            milestones: []
        };
    }

    load() {
        const saved = localStorage.getItem(SAVE_KEY);
        if (saved) {
            try {
                const d = JSON.parse(saved);
                this.state = {
                    ...this.state, ...d,
                    resources: { ...this.state.resources, ...d.resources },
                    buildings: { ...this.state.buildings, ...d.buildings },
                    troops: { ...this.state.troops, ...d.troops }
                };
            } catch { /* corrupt save – use defaults */ }
        }

        if (this.state.fields.length !== 18) {
            this.state.fields = FIELD_LAYOUT.map(type => ({ type, level: 0 }));
        }
        this.state.resources = { ...START_RESOURCES, ...this.state.resources };

        if (this.state.buildings.main === 0 && this.state.fields.every(f => f.level === 0)) {
            this.state.buildings.main = 1;
            this.state.fields = this.state.fields.map(f => ({ ...f, level: 1 }));
        }

        this.state.milestones = this.state.milestones || [];
        this._achieved = new Set(this.state.milestones);

        if (!localStorage.getItem(START_KEY)) {
            localStorage.setItem(START_KEY, Date.now().toString());
        }
    }

    save() {
        localStorage.setItem(SAVE_KEY, JSON.stringify({
            resources: this.state.resources,
            buildings: this.state.buildings,
            fields: this.state.fields,
            troops: this.state.troops,
            queue: this.state.queue,
            day: this.state.day,
            reports: this.state.reports.slice(-MAX_REPORTS),
            milestones: [...this._achieved]
        }));
    }

    reset() {
        localStorage.removeItem(SAVE_KEY);
        localStorage.removeItem(START_KEY);
        this.state = this._createDefault();
        this._achieved.clear();
    }

    // --- Berechnungen ---

    getCost(baseCost, level) {
        return Object.fromEntries(
            Object.entries(baseCost).map(([k, v]) => [k, Math.floor(v * Math.pow(COST_FACTOR, level))])
        );
    }

    getBuildTime(baseTime, level) {
        const bonus = 1 + (this.state.buildings.main || 0) * MAIN_SPEED_BONUS;
        return Math.floor(baseTime * Math.pow(BUILD_TIME_FACTOR, level) / bonus);
    }

    getProduction() {
        const prod = { wood: 0, clay: 0, iron: 0, crop: 0 };
        for (const field of this.state.fields) {
            if (field.level > 0) {
                const def = FIELDS.find(f => f.type === field.type);
                prod[field.type] += Math.floor(def.prodBase * Math.pow(def.prodFactor, field.level - 1));
            }
        }
        return prod;
    }

    getStorage() {
        const wLvl = this.state.buildings.warehouse || 0;
        const gLvl = this.state.buildings.granary || 0;
        const w = BASE_STORAGE.warehouse + wLvl * STORAGE_PER_LEVEL.warehouse;
        const g = BASE_STORAGE.granary + gLvl * STORAGE_PER_LEVEL.granary;
        return { wood: w, clay: w, iron: w, crop: g };
    }

    getConsumption() {
        return Object.entries(this.state.troops).reduce((sum, [id, count]) => {
            const troop = TROOPS.find(t => t.id === id);
            return sum + (troop?.consume || 0) * (count || 0);
        }, 0);
    }

    getMaxQueueSlots() {
        return (this.state.buildings.rally || 0) > 0 ? 2 : 1;
    }

    getScore() {
        let score = 0;
        for (const [id, level] of Object.entries(this.state.buildings)) {
            const b = BUILDINGS[id];
            if (b) for (let i = 1; i <= level; i++) score += b.points * i;
        }
        for (const field of this.state.fields) {
            const def = FIELDS.find(f => f.type === field.type);
            if (def) for (let i = 1; i <= field.level; i++) score += def.points * i;
        }
        for (const [id, count] of Object.entries(this.state.troops)) {
            const troop = TROOPS.find(t => t.id === id);
            if (troop) score += troop.points * count;
        }
        return score;
    }

    getTotalTroops() {
        return Object.values(this.state.troops).reduce((s, v) => s + (v || 0), 0);
    }

    getAttackPower() {
        return Object.entries(this.state.troops).reduce((sum, [id, count]) => {
            const t = TROOPS.find(x => x.id === id);
            return sum + (t?.attack || 0) * (count || 0);
        }, 0);
    }

    getDefensePower() {
        const base = Object.entries(this.state.troops).reduce((sum, [id, count]) => {
            const t = TROOPS.find(x => x.id === id);
            return sum + (t?.defInf || 0) * (count || 0);
        }, 0);
        const wallBonus = 1 + (this.state.buildings.wall || 0) * WALL_DEF_BONUS;
        return Math.floor(base * wallBonus);
    }

    canAfford(cost) {
        return Object.entries(cost).every(([k, v]) => {
            const key = COST_TO_RES[k] || k;
            return this.state.resources[key] >= v;
        });
    }

    canBuild(id) {
        const reqs = BUILD_REQS[id];
        if (!reqs || Object.keys(reqs).length === 0) return true;
        return Object.entries(reqs).every(([bid, lvl]) => (this.state.buildings[bid] || 0) >= lvl);
    }

    isQueueFull() {
        return this.state.queue.length >= this.getMaxQueueSlots();
    }

    // --- Aktionen ---

    _deduct(cost) {
        for (const [k, v] of Object.entries(cost)) {
            const key = COST_TO_RES[k] || k;
            this.state.resources[key] -= v;
        }
    }

    addReport(text) {
        this.state.reports.push({ text, time: new Date().toLocaleString('de-DE') });
    }

    startBuilding(id) {
        const b = BUILDINGS[id];
        if (!b) return false;
        const lvl = this.state.buildings[id] || 0;
        if (lvl >= MAX_LEVEL) return false;

        const cost = this.getCost(b.base, lvl);
        if (!this.canAfford(cost) || !this.canBuild(id) || this.isQueueFull()) return false;

        this._deduct(cost);
        const time = this.getBuildTime(b.time, lvl);
        this.state.queue.push({
            type: 'building', id,
            name: `${b.name} St.${lvl + 1}`,
            icon: b.icon, remaining: time, total: time
        });
        this.addReport(`🔨 Bau gestartet: ${b.name} Stufe ${lvl + 1}`);
        return true;
    }

    startField(idx) {
        const field = this.state.fields[idx];
        if (!field || field.level >= MAX_LEVEL) return false;

        const def = FIELDS.find(f => f.type === field.type);
        const cost = this.getCost(def.base, field.level);
        if (!this.canAfford(cost) || this.isQueueFull()) return false;

        this._deduct(cost);
        const time = this.getBuildTime(FIELD_BASE_TIME, field.level);
        this.state.queue.push({
            type: 'field', id: idx,
            name: `${def.name} St.${field.level + 1}`,
            icon: def.icon, remaining: time, total: time
        });
        this.addReport(`🔨 Ausbau gestartet: ${def.name} Stufe ${field.level + 1}`);
        return true;
    }

    trainTroops(troopId, count) {
        const troop = TROOPS.find(t => t.id === troopId);
        if (!troop || this.state.buildings.barracks < 1) return false;

        count = Math.min(99, Math.max(1, count));
        const totalCost = Object.fromEntries(
            Object.entries(troop.cost).map(([k, v]) => [k, v * count])
        );
        if (!this.canAfford(totalCost) || this.isQueueFull()) return false;

        const prod = this.getProduction();
        const cons = this.getConsumption();
        if (prod.crop - cons < troop.consume * count) {
            this.addReport(`⚠️ Warnung: Getreide-Produktion reicht nicht für ${count}× ${troop.name}!`);
        }

        this._deduct(totalCost);
        const mainBonus = 1 + (this.state.buildings.main || 0) * MAIN_SPEED_BONUS;
        const barracksBonus = 1 + (this.state.buildings.barracks || 0) * BARRACKS_SPEED_BONUS;
        const time = troop.time * count * 1000 / mainBonus / barracksBonus;

        this.state.queue.push({
            type: 'troop', id: troopId, count,
            name: `${count}× ${troop.name}`,
            icon: troop.icon, remaining: time, total: time
        });
        this.addReport(`📋 Rekrutierung gestartet: ${count}× ${troop.name}`);
        return true;
    }

    // --- Game Loop ---

    _checkMilestones() {
        const score = this.getScore();
        for (const m of MILESTONES) {
            if (!this._achieved.has(m.id) && m.check(this.state, score)) {
                this._achieved.add(m.id);
                this.state.milestones = [...this._achieved];
                this.addReport(m.text);
                return m;
            }
        }
        return null;
    }

    tick() {
        const now = Date.now();
        const dt = (now - this.state.lastTick) / 1000;
        this.state.lastTick = now;

        const prod = this.getProduction();
        const cons = this.getConsumption();
        const store = this.getStorage();

        this.state.resources.wood = Math.min(store.wood, this.state.resources.wood + prod.wood * dt / 3600);
        this.state.resources.clay = Math.min(store.clay, this.state.resources.clay + prod.clay * dt / 3600);
        this.state.resources.iron = Math.min(store.iron, this.state.resources.iron + prod.iron * dt / 3600);
        this.state.resources.crop = Math.min(store.crop, Math.max(0, this.state.resources.crop + (prod.crop - cons) * dt / 3600));

        const slots = this.getMaxQueueSlots();
        const completed = [];
        for (let i = 0; i < Math.min(slots, this.state.queue.length); i++) {
            const q = this.state.queue[i];
            if (!q) continue;
            q.remaining -= dt * 1000;
            if (q.remaining <= 0) {
                this.state.queue.splice(i, 1);
                if (q.type === 'building') this.state.buildings[q.id] = (this.state.buildings[q.id] || 0) + 1;
                else if (q.type === 'field') this.state.fields[q.id].level++;
                else if (q.type === 'troop') this.state.troops[q.id] = (this.state.troops[q.id] || 0) + q.count;
                this.addReport(`✅ ${q.name} abgeschlossen!`);
                completed.push(q);
                i--;
            }
        }

        const start = parseInt(localStorage.getItem(START_KEY) || now);
        this.state.day = Math.max(1, Math.floor((now - start) / DAY_DURATION) + 1);

        const milestone = this._checkMilestones();
        this.save();
        this._notify();
        return { completed, milestone };
    }
}
