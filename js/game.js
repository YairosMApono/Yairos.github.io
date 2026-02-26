/**
 * Empire Builder – Spiel-Logik
 */

let game = {
    resources: { wood: 0, clay: 0, iron: 0, crop: 0 },
    buildings: { main: 0, barracks: 0, warehouse: 0, granary: 0, wall: 0, rally: 0 },
    fields: [],
    troops: { militia: 0, sword: 0, spear: 0, axe: 0 },
    queue: [],
    lastTick: Date.now(),
    day: 1,
    reports: []
};

function getCost(base, level) {
    return Object.fromEntries(
        Object.entries(base).map(([k, v]) => [k, Math.floor(v * Math.pow(1.55, level))])
    );
}

function getBuildTime(baseTime, level) {
    const speedBonus = 1 + (game.buildings.main || 0) * 0.05;
    return Math.floor(baseTime * Math.pow(1.5, level) / speedBonus);
}

function load() {
    const s = localStorage.getItem('empire-game');
    if (s) {
        const d = JSON.parse(s);
        game = {
            ...game,
            ...d,
            resources: { ...game.resources, ...d.resources },
            buildings: { ...game.buildings, ...d.buildings },
            troops: { ...game.troops, ...d.troops }
        };
    }
    if (game.fields.length !== 18) {
        game.fields = DEFAULT_FIELDS.map(f => ({ ...f }));
    }
    game.resources = { ...START_RESOURCES, ...game.resources };
    if (game.buildings.main === 0 && game.fields.every(f => f.level === 0)) {
        game.buildings.main = 1;
        game.fields = game.fields.map(f => ({ ...f, level: 1 }));
    }
}

function save() {
    localStorage.setItem('empire-game', JSON.stringify({
        resources: game.resources,
        buildings: game.buildings,
        fields: game.fields,
        troops: game.troops,
        queue: game.queue,
        day: game.day,
        reports: game.reports.slice(-80)
    }));
}

function production() {
    const prod = { wood: 0, clay: 0, iron: 0, crop: 0 };
    game.fields.forEach(f => {
        if (f.level > 0) {
            const type = FIELDS.find(x => x.type === f.type);
            prod[f.type] += Math.floor(type.prodBase * Math.pow(type.prodFactor, f.level - 1));
        }
    });
    return prod;
}

function storage() {
    const w = 2000 + (game.buildings.warehouse || 0) * 2500;
    const g = 2000 + (game.buildings.granary || 0) * 2000;
    return { wood: w, clay: w, iron: w, crop: g };
}

function consume() {
    return Object.entries(game.troops).reduce(
        (s, [id, c]) => s + (TROOPS.find(t => t.id === id)?.consume || 0) * (c || 0),
        0
    );
}

function maxQueueSlots() {
    return (game.buildings.rally || 0) > 0 ? 2 : 1;
}

function canBuild(buildingId) {
    const reqs = BUILD_REQS[buildingId];
    if (!reqs) return true;
    return Object.entries(reqs).every(
        ([bid, lvl]) => (game.buildings[bid] || 0) >= lvl
    );
}

function addReport(text) {
    game.reports.push({ text, time: new Date().toLocaleString('de-DE') });
}

function tick() {
    const now = Date.now();
    const dt = (now - game.lastTick) / 1000;
    game.lastTick = now;

    const prod = production();
    const cons = consume();
    const storageMax = storage();

    game.resources.wood = Math.min(storageMax.wood, game.resources.wood + prod.wood * dt / 3600);
    game.resources.clay = Math.min(storageMax.clay, game.resources.clay + prod.clay * dt / 3600);
    game.resources.iron = Math.min(storageMax.iron, game.resources.iron + prod.iron * dt / 3600);
    game.resources.crop = Math.min(
        storageMax.crop,
        Math.max(0, game.resources.crop + (prod.crop - cons) * dt / 3600)
    );

    const slots = maxQueueSlots();
    for (let i = 0; i < Math.min(slots, game.queue.length); i++) {
        const q = game.queue[i];
        if (!q) continue;
        q.remaining -= dt * 1000;
        if (q.remaining <= 0) {
            game.queue.splice(i, 1);
            if (q.type === 'building') {
                game.buildings[q.id] = (game.buildings[q.id] || 0) + 1;
            } else if (q.type === 'field') {
                game.fields[q.id].level++;
            } else if (q.type === 'troop') {
                game.troops[q.id] = (game.troops[q.id] || 0) + q.count;
            }
            addReport(`${q.name} abgeschlossen!`);
            i--;
        }
    }

    const start = parseInt(localStorage.getItem('empire-start') || now, 10);
    game.day = Math.max(1, Math.floor((now - start) / DAY_DURATION_MS) + 1);

    updateUI();
}

function resetGame() {
    if (confirm('Neues Spiel starten? Fortschritt geht verloren.')) {
        localStorage.removeItem('empire-game');
        localStorage.removeItem('empire-start');
        location.reload();
    }
}
