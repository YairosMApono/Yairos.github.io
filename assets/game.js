(() => {
    "use strict";

    const STORAGE_KEY = "empire-game";
    const START_KEY = "empire-start";
    const TUTORIAL_KEY = "empire-tutorial-done";
    const SAVE_VERSION = 4;

    const DAY_LENGTH_MS = 90_000;
    const TICK_INTERVAL_MS = 250;
    const SAVE_INTERVAL_MS = 2_000;
    const MAX_OFFLINE_SECONDS = 8 * 3_600;
    const MAX_REPORTS = 120;
    const MAX_QUEUE_LENGTH = 8;
    const EVENT_FREQUENCY_DAYS = 3;
    const STARVATION_TICK_SECONDS = 25;

    const RESOURCE_KEYS = ["wood", "clay", "iron", "crop"];
    const RESOURCE_ICONS = {
        wood: "🪵",
        clay: "🧱",
        iron: "⚙️",
        crop: "🌾",
        gold: "🪙",
    };
    const RESOURCE_NAMES = {
        wood: "Holz",
        clay: "Lehm",
        iron: "Eisen",
        crop: "Getreide",
    };

    const BUILDINGS = {
        main: {
            name: "Hauptgebaeude",
            icon: "🏛️",
            desc: "Reduziert Bau- und Rekrutierungszeiten um 5% pro Stufe.",
            baseCost: { wood: 70, clay: 40, iron: 60, crop: 20 },
            timeMs: 8_000,
            help: "Das Hauptgebaeude ist das Zentrum deines Dorfes. Hoehere Stufen beschleunigen Bau und Rekrutierung.",
        },
        barracks: {
            name: "Kaserne",
            icon: "⚔️",
            desc: "Ermoeglicht Rekrutierung. +10% Rekrutierungsgeschwindigkeit pro Stufe.",
            baseCost: { wood: 175, clay: 160, iron: 80, crop: 80 },
            timeMs: 12_000,
            help: "Trainiert Miliz, Schwertkaempfer, Speertraeger und Axtkaempfer.",
        },
        warehouse: {
            name: "Lagerhaus",
            icon: "📦",
            desc: "Erhoeht Speicher fuer Holz, Lehm, Eisen um +2500 pro Stufe.",
            baseCost: { wood: 130, clay: 160, iron: 90, crop: 40 },
            timeMs: 10_000,
            help: "Mehr Lagerkapazitaet verhindert Rohstoffverlust durch volle Speicher.",
        },
        granary: {
            name: "Getreidespeicher",
            icon: "🌾",
            desc: "Erhoeht Getreidespeicher um +2000 pro Stufe.",
            baseCost: { wood: 80, clay: 100, iron: 70, crop: 20 },
            timeMs: 8_000,
            help: "Wichtig fuer Truppenaufbau und stabile Versorgung.",
        },
        wall: {
            name: "Stadtmauer",
            icon: "🧱",
            desc: "Verteidigungsbonus fuer dein Dorf.",
            baseCost: { wood: 70, clay: 90, iron: 170, crop: 70 },
            timeMs: 10_000,
            help: "Sichert dein Dorf gegen spaetere Angriffe.",
        },
        rally: {
            name: "Versammlungsplatz",
            icon: "🏕️",
            desc: "Aktiviert den zweiten parallelen Bauslot.",
            baseCost: { wood: 110, clay: 160, iron: 90, crop: 70 },
            timeMs: 11_000,
            help: "Mit Versammlungsplatz laufen bis zu 2 Auftraege gleichzeitig.",
        },
        smithy: {
            name: "Schmiede",
            icon: "⚒️",
            desc: "Ermoeglicht Ausruestung. +5% ATK/DEF pro Ausruestungsstufe.",
            baseCost: { wood: 120, clay: 150, iron: 200, crop: 50 },
            timeMs: 15_000,
            help: "Schmiede Schwerter, Schilde und Ruestungen fuer staerkere Truppen.",
        },
    };

    const BUILDING_ORDER = ["main", "barracks", "warehouse", "granary", "wall", "rally", "smithy"];

    const BUILD_REQS = {
        barracks: { main: 1 },
        warehouse: { main: 1 },
        granary: { main: 1 },
        wall: { main: 3, rally: 1 },
        rally: { main: 1, barracks: 1 },
        smithy: { main: 4, barracks: 1 },
    };

    const EQUIPMENT = [
        { id: "sword", name: "Schwert", icon: "🗡️", bonus: "atk", cost: { gold: 50, iron: 80, wood: 40 }, maxLevel: 5 },
        { id: "shield", name: "Schild", icon: "🛡️", bonus: "def", cost: { gold: 50, iron: 60, clay: 50, wood: 30 }, maxLevel: 5 },
        { id: "armor", name: "Ruestung", icon: "⚔️", bonus: "def", cost: { gold: 60, iron: 100, clay: 60 }, maxLevel: 5 },
        { id: "bow", name: "Bogen", icon: "🏹", bonus: "atk", cost: { gold: 45, wood: 80, iron: 40 }, maxLevel: 5 },
    ];
    const EQUIPMENT_BY_ID = Object.fromEntries(EQUIPMENT.map((e) => [e.id, e]));

    const ACHIEVEMENTS = [
        { id: "firstWin", title: "Erster Sieg", desc: "Besiege den ersten Gegner.", reward: 20, check: (s) => (s.statsEnemiesKilled || 0) >= 1 },
        { id: "army10", title: "Kleine Streitmacht", desc: "Rekrutiere 10 Truppen.", reward: 15, check: (s) => getTotalTroops(s) >= 10 },
        { id: "dungeonNoLoss", title: "Perfekter Dungeon", desc: "Dungeon ohne Truppenverlust beenden.", reward: 50, check: (s) => (s.achievements || {}).dungeonNoLoss },
        { id: "army100", title: "Hundert Mann", desc: "Rekrutiere 100 Truppen.", reward: 80, check: (s) => getTotalTroops(s) >= 100 },
        { id: "allObjectives", title: "Imperator", desc: "Alle 12 Ziele abschliessen.", reward: 150, check: (s) => OBJECTIVES.every((o) => s.objectives[o.id]) },
        { id: "waves10", title: "Unbezwingbar", desc: "10 Wellen in einem Angriff ueberstehen.", reward: 100, check: (s) => (s.wavesSurvived || 0) >= 10 },
    ];

    const FIELD_LAYOUT = [
        ...Array(4).fill("wood"),
        ...Array(4).fill("clay"),
        ...Array(4).fill("iron"),
        ...Array(6).fill("crop"),
    ];

    const FIELDS = [
        {
            type: "wood",
            name: "Holzfaeller",
            icon: "🪵",
            baseCost: { wood: 40, clay: 50, iron: 30, crop: 50 },
            prodBase: 25,
            prodFactor: 1.22,
            help: "Produziert Holz fuer Gebaeude und Truppen.",
        },
        {
            type: "clay",
            name: "Lehmgrube",
            icon: "🧱",
            baseCost: { wood: 40, clay: 50, iron: 30, crop: 50 },
            prodBase: 25,
            prodFactor: 1.22,
            help: "Produziert Lehm als zentrale Bauressource.",
        },
        {
            type: "iron",
            name: "Eisenmine",
            icon: "⚙️",
            baseCost: { wood: 40, clay: 50, iron: 30, crop: 50 },
            prodBase: 25,
            prodFactor: 1.22,
            help: "Produziert Eisen, besonders fuer Militaer wichtig.",
        },
        {
            type: "crop",
            name: "Acker",
            icon: "🌾",
            baseCost: { wood: 50, clay: 60, iron: 40, crop: 80 },
            prodBase: 20,
            prodFactor: 1.25,
            help: "Produziert Getreide, das deine Truppen verbrauchen.",
        },
    ];
    const FIELDS_BY_TYPE = Object.fromEntries(FIELDS.map((field) => [field.type, field]));

    const TROOPS = [
        { id: "militia", name: "Miliz", icon: "🛡️", cost: { wood: 60, clay: 70, iron: 40, crop: 20 }, trainSeconds: 400, consume: 1, atk: 8, def: 2 },
        { id: "sword", name: "Schwertkaempfer", icon: "⚔️", cost: { wood: 60, clay: 70, iron: 40, crop: 20 }, trainSeconds: 500, consume: 1, atk: 12, def: 5 },
        { id: "spear", name: "Speertraeger", icon: "🔱", cost: { wood: 50, clay: 60, iron: 30, crop: 60 }, trainSeconds: 450, consume: 1, atk: 10, def: 8 },
        { id: "axe", name: "Axtkaempfer", icon: "🪓", cost: { wood: 60, clay: 70, iron: 40, crop: 20 }, trainSeconds: 600, consume: 2, atk: 15, def: 4 },
    ];
    const TROOPS_BY_ID = Object.fromEntries(TROOPS.map((troop) => [troop.id, troop]));

    const ENEMIES = [
        { id: "wolf", name: "Wolf", icon: "🐺", atk: 5, def: 2, hp: 20, reward: { wood: 10, clay: 5, iron: 5, gold: 5 }, xp: 2 },
        { id: "bandit", name: "Bandit", icon: "🗡️", atk: 12, def: 8, hp: 50, reward: { wood: 30, clay: 25, iron: 20, gold: 25 }, xp: 5 },
        { id: "mercenary", name: "Soeldner", icon: "⚔️", atk: 25, def: 15, hp: 100, reward: { wood: 50, clay: 40, iron: 60, gold: 50 }, xp: 12 },
        { id: "chieftain", name: "Raeuberhauptmann", icon: "👹", atk: 40, def: 25, hp: 200, reward: { wood: 100, clay: 80, iron: 120, gold: 80 }, xp: 25 },
    ];
    const ENEMIES_BY_ID = Object.fromEntries(ENEMIES.map((e) => [e.id, e]));

    const DUNGEONS = [
        { id: "mine", name: "Verlassene Mine", icon: "⛏️", levels: 5, enemies: ["wolf", "bandit", "bandit", "bandit", "chieftain"], rewardBonus: { iron: 1.5 } },
        { id: "forest", name: "Verfluchter Wald", icon: "🌲", levels: 7, enemies: ["wolf", "wolf", "bandit", "bandit", "mercenary", "mercenary", "chieftain"], rewardBonus: { wood: 1.5 } },
        { id: "ruins", name: "Ruinen der Alten", icon: "🏛️", levels: 10, enemies: ["bandit", "bandit", "mercenary", "mercenary", "mercenary", "chieftain", "chieftain", "chieftain", "chieftain", "chieftain"], rewardBonus: { gold: 2 } },
    ];
    const DUNGEONS_BY_ID = Object.fromEntries(DUNGEONS.map((d) => [d.id, d]));

    const MAP_NEIGHBORS = {
        24: [17, 23, 25, 31],
        17: [10, 16, 18, 24],
        23: [16, 22, 24, 30],
        25: [18, 24, 26, 32],
        31: [24, 30, 32, 38],
    };

    const OBJECTIVES = [
        { id: "main-3", title: "Verwaltung staerken", desc: "Baue das Hauptgebaeude auf Stufe 3.", reward: { wood: 280, clay: 280, iron: 280, crop: 220 }, isComplete: (s) => (s.buildings.main || 0) >= 3 },
        { id: "crop-plus-60", title: "Stabile Versorgung", desc: "Erreiche mindestens +60 Netto-Getreide pro Stunde.", reward: { wood: 180, clay: 180, iron: 120, crop: 360 }, isComplete: (s) => getNetCropPerHour(s) >= 60 },
        { id: "army-20", title: "Kleine Armee", desc: "Rekrutiere insgesamt 20 Truppen.", reward: { wood: 300, clay: 250, iron: 320, crop: 260 }, isComplete: (s) => getTotalTroops(s) >= 20 },
        { id: "expand-1", title: "Erste Expansion", desc: "Erweitere dein Dorf auf ein Nachbarfeld.", reward: { wood: 200, clay: 200, iron: 150, crop: 150, gold: 30 }, isComplete: (s) => (s.expansion || []).length >= 1 },
        { id: "dungeon-1", title: "Dungeon-Eroberer", desc: "Besiege den ersten Dungeon (Verlassene Mine).", reward: { wood: 150, clay: 150, iron: 200, gold: 50 }, isComplete: (s) => (s.dungeonsCleared || {}).mine >= 5 },
        { id: "wall-5", title: "Befestigung", desc: "Baue die Stadtmauer auf Stufe 5.", reward: { wood: 250, clay: 300, iron: 350, crop: 200 }, isComplete: (s) => (s.buildings.wall || 0) >= 5 },
        { id: "army-50", title: "Starke Armee", desc: "Rekrutiere insgesamt 50 Truppen.", reward: { wood: 400, clay: 350, iron: 450, crop: 400, gold: 80 }, isComplete: (s) => getTotalTroops(s) >= 50 },
        { id: "waves-5", title: "Wellenmeister", desc: "Ueberstehe einen 5-Wellen-Angriff.", reward: { wood: 300, clay: 300, iron: 300, crop: 300, gold: 100 }, isComplete: (s) => (s.wavesSurvived || 0) >= 5 },
        { id: "dungeon-ruins", title: "Ruinen-Eroberer", desc: "Besiege den Dungeon Ruinen der Alten komplett.", reward: { wood: 500, clay: 500, iron: 500, crop: 500, gold: 200 }, isComplete: (s) => (s.dungeonsCleared || {}).ruins >= 10 },
        { id: "expand-4", title: "Reich expandieren", desc: "Erweitere dein Dorf auf 4 Nachbarfelder.", reward: { wood: 400, clay: 400, iron: 400, crop: 400, gold: 150 }, isComplete: (s) => (s.expansion || []).length >= 4 },
        { id: "main-10", title: "Imperium", desc: "Baue das Hauptgebaeude auf Stufe 10.", reward: { wood: 800, clay: 800, iron: 800, crop: 800, gold: 300 }, isComplete: (s) => (s.buildings.main || 0) >= 10 },
        { id: "army-100", title: "Endgame-Armee", desc: "Rekrutiere insgesamt 100 Truppen.", reward: { wood: 1000, clay: 1000, iron: 1000, crop: 1000, gold: 500 }, isComplete: (s) => getTotalTroops(s) >= 100 },
    ];

    const ENDLESS_OBJECTIVES = [
        { id: "main-15", title: "Endlos: Haupt St.15", desc: "Baue das Hauptgebaeude auf Stufe 15.", reward: { wood: 1500, clay: 1500, iron: 1500, crop: 1500, gold: 500 }, isComplete: (s) => (s.buildings.main || 0) >= 15 },
        { id: "army-200", title: "Endlos: 200 Truppen", desc: "Rekrutiere insgesamt 200 Truppen.", reward: { wood: 2000, clay: 2000, iron: 2000, crop: 2000, gold: 800 }, isComplete: (s) => getTotalTroops(s) >= 200 },
        { id: "waves-10", title: "Endlos: 10 Wellen", desc: "Ueberstehe 10 Wellen in einem Angriff.", reward: { wood: 1000, clay: 1000, iron: 1000, crop: 1000, gold: 400 }, isComplete: (s) => (s.wavesSurvived || 0) >= 10 },
    ];

    const WORLD_EVENTS = [
        { id: "harvest-festival", title: "Erntefest", summary: "+450 Getreide", apply: (s) => addResources({ crop: 450 }, s) },
        { id: "craftsman-boom", title: "Handwerksboom", summary: "+240 Holz, Lehm, Eisen", apply: (s) => addResources({ wood: 240, clay: 240, iron: 240 }, s) },
        { id: "bandit-raid", title: "Raubzug", summary: "Bis zu 8% Holz, Lehm, Eisen verloren", apply: (s) => {
            const factor = 0.08;
            ["wood", "clay", "iron"].forEach((k) => { s.resources[k] = Math.max(0, s.resources[k] - Math.floor(s.resources[k] * factor)); });
        }},
        { id: "treasure", title: "Schatz gefunden", summary: "+80 Gold", apply: (s) => addResources({ gold: 80 }, s) },
        { id: "trader", title: "Haendler", summary: "Tausch", apply: (s) => applyTraderEvent(s) },
    ];

    function getRandomTrade() {
        const trades = [
            { give: { wood: 200 }, get: { clay: 150 }, desc: "200 Holz gegen 150 Lehm" },
            { give: { clay: 180 }, get: { iron: 120 }, desc: "180 Lehm gegen 120 Eisen" },
            { give: { iron: 100 }, get: { wood: 180 }, desc: "100 Eisen gegen 180 Holz" },
            { give: { crop: 250 }, get: { wood: 150, clay: 100 }, desc: "250 Getreide gegen 150 Holz, 100 Lehm" },
        ];
        return trades[Math.floor(pseudoRandomUnit(Date.now()) * trades.length)];
    }

    function applyTraderEvent(s) {
        const trade = getRandomTrade();
        let canAfford = true;
        Object.entries(trade.give).forEach(([k, v]) => { if ((s.resources[k] || 0) < v) canAfford = false; });
        if (canAfford) {
            Object.entries(trade.give).forEach(([k, v]) => { s.resources[k] = Math.max(0, (s.resources[k] || 0) - v); });
            Object.entries(trade.get).forEach(([k, v]) => { addResources({ [k]: v }, s); });
            s.lastTradeSummary = "Getauscht: " + trade.desc;
        } else {
            s.lastTradeSummary = "Haendler bot " + trade.desc + " an, aber du hattest nicht genug.";
        }
    }

    const HELP_TEXTS = {
        resources:
            "Rohstoffe: Holz, Lehm, Eisen, Getreide, Gold.\n\nGold erhaeltst du durch Kämpfe, Dungeons und Ziele.",
        map:
            "Weltkarte: Dein Dorf (🏰), erweiterte Felder (🏘️). Leere Felder (🔲) können expandiert werden.",
        village:
            "Im Dorfzentrum baust du Gebaeude und Rohstofffelder aus.\n\nAchte auf Voraussetzungen und Kapazitaeten.",
        fields:
            "Rohstofffelder produzieren kontinuierlich.\n\nJede Stufe erhoeht Produktion und Ausbaukosten.",
        troops:
            "Truppen verbrauchen Getreide. Sie sammeln XP in Kämpfen (Angriffe, Dungeons) und werden stärker.",
        reports:
            "Berichte protokollieren Bauabschluesse, Kämpfe, Ziele und Weltereignisse.",
        objectives:
            "Ziele geben strukturierte Fortschritte vor.\n\nBeim Abschluss wird die Belohnung automatisch gutgeschrieben.",
        dungeons:
            "Dungeons: Sende Truppen, um Level zu erobern. Belohnung: Gold, Ressourcen, XP. Ein Dungeon pro Tag.",
    };

    let game = createInitialGameState();
    let activeTab = "map";
    let currentModalHelp = "";
    let saveAccumulatorMs = 0;

    const dom = {};

    function asNumber(value, fallback = 0) {
        const num = Number(value);
        return Number.isFinite(num) ? num : fallback;
    }

    function createInitialGameState() {
        return {
            version: SAVE_VERSION,
            resources: { wood: 750, clay: 750, iron: 750, crop: 750, gold: 0 },
            buildings: { main: 1, barracks: 0, warehouse: 0, granary: 0, wall: 0, rally: 0, smithy: 0 },
            fields: FIELD_LAYOUT.map((type) => ({ type, level: 1 })),
            troops: { militia: 0, sword: 0, spear: 0, axe: 0 },
            troopXp: { militia: 0, sword: 0, spear: 0, axe: 0 },
            equipment: { sword: 0, shield: 0, armor: 0, bow: 0 },
            queue: [],
            reports: [],
            day: 1,
            lastTick: Date.now(),
            lastEventDay: 0,
            starvationSeconds: 0,
            objectives: Object.fromEntries(OBJECTIVES.map((o) => [o.id, false])),
            expansion: [],
            dungeonsCleared: {},
            pendingAttack: null,
            attackWarningDay: 0,
            wavesSurvived: 0,
            lastDungeonDay: 0,
            gameSpeed: 1,
            gamePaused: false,
            gamePausedAt: 0,
            difficulty: "normal",
            achievements: {},
            statsEnemiesKilled: 0,
            statsDaysPlayed: 0,
        };
    }

    function normalizeResourceBundle(rawBundle) {
        const raw = rawBundle && typeof rawBundle === "object" ? rawBundle : {};
        return {
            wood: Math.max(0, asNumber(raw.wood ?? raw.w, 0)),
            clay: Math.max(0, asNumber(raw.clay ?? raw.c, 0)),
            iron: Math.max(0, asNumber(raw.iron ?? raw.i, 0)),
            crop: Math.max(0, asNumber(raw.crop ?? raw.r, 0)),
            gold: Math.max(0, asNumber(raw.gold ?? raw.g, 0)),
        };
    }

    function normalizeBuildings(rawBuildings) {
        const raw = rawBuildings && typeof rawBuildings === "object" ? rawBuildings : {};
        const normalized = {};
        BUILDING_ORDER.forEach((buildingId) => {
            normalized[buildingId] = Math.max(0, Math.floor(asNumber(raw[buildingId], 0)));
        });
        return normalized;
    }

    let reportFilter = "all";

    function normalizeTroops(rawTroops) {
        const raw = rawTroops && typeof rawTroops === "object" ? rawTroops : {};
        const normalized = {};
        TROOPS.forEach((troop) => {
            normalized[troop.id] = Math.max(0, Math.floor(asNumber(raw[troop.id], 0)));
        });
        return normalized;
    }

    function normalizeFields(rawFields) {
        const source = Array.isArray(rawFields) ? rawFields : [];
        return FIELD_LAYOUT.map((defaultType, index) => {
            const current = source[index] && typeof source[index] === "object" ? source[index] : null;
            const type = current && FIELDS_BY_TYPE[current.type] ? current.type : defaultType;
            const level = Math.max(0, Math.floor(asNumber(current ? current.level : 0, 0)));
            return { type, level };
        });
    }

    function normalizeQueue(rawQueue) {
        if (!Array.isArray(rawQueue)) {
            return [];
        }

        return rawQueue
            .map((item) => normalizeQueueItem(item))
            .filter(Boolean)
            .slice(0, MAX_QUEUE_LENGTH);
    }

    function normalizeQueueItem(rawItem) {
        if (!rawItem || typeof rawItem !== "object") {
            return null;
        }

        if (!["building", "field", "troop"].includes(rawItem.type)) {
            return null;
        }

        if (rawItem.type === "building" && !BUILDINGS[rawItem.id]) {
            return null;
        }

        if (rawItem.type === "field") {
            const fieldIndex = Math.floor(asNumber(rawItem.id, -1));
            if (fieldIndex < 0 || fieldIndex >= FIELD_LAYOUT.length) {
                return null;
            }
        }

        if (rawItem.type === "troop" && !TROOPS_BY_ID[rawItem.id]) {
            return null;
        }

        const remaining = Math.max(0, asNumber(rawItem.remaining, 0));
        const total = Math.max(1, asNumber(rawItem.total, remaining || 1));

        return {
            type: rawItem.type,
            id: rawItem.id,
            count: Math.max(1, Math.floor(asNumber(rawItem.count, 1))),
            name: String(rawItem.name || "Auftrag"),
            icon: String(rawItem.icon || "🔨"),
            remaining,
            total,
        };
    }

    function normalizeReports(rawReports) {
        if (!Array.isArray(rawReports)) {
            return [];
        }

        return rawReports
            .slice(-MAX_REPORTS)
            .filter((report) => report && typeof report === "object")
            .map((report) => ({
                text: String(report.text || ""),
                time: String(report.time || new Date().toLocaleString("de-DE")),
                type: report.type || "general",
            }))
            .filter((report) => report.text);
    }

    function normalizeObjectives(rawObjectives) {
        const all = [...OBJECTIVES, ...ENDLESS_OBJECTIVES];
        const normalized = Object.fromEntries(all.map((o) => [o.id, false]));
        if (!rawObjectives || typeof rawObjectives !== "object") return normalized;
        all.forEach((o) => { normalized[o.id] = Boolean(rawObjectives[o.id]); });
        return normalized;
    }

    function ensureStarterDefaults() {
        if ((game.buildings.main || 0) === 0 && game.fields.every((field) => field.level === 0)) {
            game.buildings.main = 1;
            game.fields = game.fields.map((field) => ({ ...field, level: 1 }));
        }
        RESOURCE_KEYS.forEach((resourceKey) => {
            game.resources[resourceKey] = Math.max(0, asNumber(game.resources[resourceKey], 0));
        });
    }

    function loadGame() {
        const initial = createInitialGameState();
        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) {
            game = initial;
            const savedDiff = localStorage.getItem("empire-difficulty");
            if (savedDiff) game.difficulty = savedDiff;
            return;
        }

        try {
            const parsed = JSON.parse(raw);
            game = {
                ...initial,
                ...parsed,
                version: SAVE_VERSION,
                resources: {
                    ...initial.resources,
                    ...normalizeResourceBundle(parsed.resources),
                },
                buildings: {
                    ...initial.buildings,
                    ...normalizeBuildings(parsed.buildings),
                },
                troops: {
                    ...initial.troops,
                    ...normalizeTroops(parsed.troops),
                },
                fields: normalizeFields(parsed.fields),
                queue: normalizeQueue(parsed.queue),
                reports: normalizeReports(parsed.reports),
                day: Math.max(1, Math.floor(asNumber(parsed.day, 1))),
                lastTick: asNumber(parsed.lastTick, Date.now()),
                lastEventDay: Math.max(0, Math.floor(asNumber(parsed.lastEventDay, 0))),
                starvationSeconds: Math.max(0, asNumber(parsed.starvationSeconds, 0)),
                objectives: normalizeObjectives(parsed.objectives),
            };
        } catch (error) {
            console.warn("Spielstand konnte nicht geladen werden, starte neu.", error);
            game = initial;
        }

        ensureStarterDefaults();
        if (!Array.isArray(game.expansion)) game.expansion = [];
        if (!game.dungeonsCleared || typeof game.dungeonsCleared !== "object") game.dungeonsCleared = {};
        if (!game.troopXp || typeof game.troopXp !== "object") game.troopXp = { militia: 0, sword: 0, spear: 0, axe: 0 };
        if (!game.equipment || typeof game.equipment !== "object") game.equipment = { sword: 0, shield: 0, armor: 0, bow: 0 };
        if (game.buildings.smithy == null) game.buildings.smithy = 0;
        if (game.wavesSurvived == null) game.wavesSurvived = 0;
        if (game.lastDungeonDay == null) game.lastDungeonDay = 0;
        if (game.resources.gold == null) game.resources.gold = 0;
        if (game.gameSpeed == null) game.gameSpeed = 1;
        if (game.gamePaused == null) game.gamePaused = false;
        if (game.difficulty == null) game.difficulty = "normal";
        if (!game.achievements || typeof game.achievements !== "object") game.achievements = {};
        if (game.statsEnemiesKilled == null) game.statsEnemiesKilled = 0;
        if (game.statsDaysPlayed == null) game.statsDaysPlayed = 0;
        if (game.attackWarningDay == null) game.attackWarningDay = 0;
    }

    function saveGame() {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                version: SAVE_VERSION,
                resources: game.resources,
                buildings: game.buildings,
                fields: game.fields,
                troops: game.troops,
                troopXp: game.troopXp,
                queue: game.queue,
                day: game.day,
                lastTick: game.lastTick,
                lastEventDay: game.lastEventDay,
                starvationSeconds: game.starvationSeconds,
                objectives: game.objectives,
                reports: game.reports.slice(-MAX_REPORTS),
                expansion: game.expansion,
                dungeonsCleared: game.dungeonsCleared,
                wavesSurvived: game.wavesSurvived,
                lastDungeonDay: game.lastDungeonDay,
                equipment: game.equipment,
                gameSpeed: game.gameSpeed,
                gamePaused: game.gamePaused,
                difficulty: game.difficulty,
                achievements: game.achievements,
                statsEnemiesKilled: game.statsEnemiesKilled,
                statsDaysPlayed: game.statsDaysPlayed,
                attackWarningDay: game.attackWarningDay,
            })
        );
    }

    function ensureStartTimestamp() {
        const current = asNumber(localStorage.getItem(START_KEY), 0);
        if (current > 0) {
            return current;
        }
        const now = Date.now();
        localStorage.setItem(START_KEY, String(now));
        return now;
    }

    function getScaledCost(baseCost, level) {
        const factor = Math.pow(1.55, level);
        const result = {};
        RESOURCE_KEYS.forEach((resourceKey) => {
            result[resourceKey] = Math.floor(asNumber(baseCost[resourceKey], 0) * factor);
        });
        return result;
    }

    function multiplyCost(cost, multiplier) {
        const result = {};
        RESOURCE_KEYS.forEach((resourceKey) => {
            result[resourceKey] = Math.floor(asNumber(cost[resourceKey], 0) * multiplier);
        });
        return result;
    }

    function getBuildTimeMs(baseTimeMs, level) {
        const speedBonus = 1 + (game.buildings.main || 0) * 0.05;
        return Math.max(1_000, Math.floor(baseTimeMs * Math.pow(1.5, level) / speedBonus));
    }

    function getRecruitTimeMs(troop, count) {
        const mainBonus = 1 + (game.buildings.main || 0) * 0.05;
        const barracksBonus = 1 + (game.buildings.barracks || 0) * 0.1;
        return Math.max(1_000, Math.floor((troop.trainSeconds * 1_000 * count) / mainBonus / barracksBonus));
    }

    function getFieldProduction(fieldType, level) {
        if (level <= 0) {
            return 0;
        }
        const field = FIELDS_BY_TYPE[fieldType];
        if (!field) {
            return 0;
        }
        return Math.floor(field.prodBase * Math.pow(field.prodFactor, level - 1));
    }

    function getProductionPerHour(state = game) {
        const production = { wood: 0, clay: 0, iron: 0, crop: 0 };
        state.fields.forEach((field) => {
            production[field.type] += getFieldProduction(field.type, field.level);
        });
        return production;
    }

    function getStorageCapacity(state = game) {
        const warehouseCap = 2_000 + (state.buildings.warehouse || 0) * 2_500;
        const granaryCap = 2_000 + (state.buildings.granary || 0) * 2_000;
        return {
            wood: warehouseCap,
            clay: warehouseCap,
            iron: warehouseCap,
            crop: granaryCap,
        };
    }

    function getCropConsumptionPerHour(state = game) {
        return Object.entries(state.troops).reduce((sum, [troopId, count]) => {
            const troop = TROOPS_BY_ID[troopId];
            if (!troop) {
                return sum;
            }
            return sum + troop.consume * count;
        }, 0);
    }

    function getNetCropPerHour(state = game) {
        const production = getProductionPerHour(state);
        return production.crop - getCropConsumptionPerHour(state);
    }

    function getTotalTroops(state = game) {
        return Object.values(state.troops).reduce((sum, count) => sum + (typeof count === "number" ? count : 0), 0);
    }

    const XP_PER_LEVEL = [0, 10, 25, 50, 100, 175, 275, 400, 550, 750];
    function getTroopLevel(xp) {
        let level = 1;
        for (let i = 1; i < XP_PER_LEVEL.length; i++) {
            if (xp >= XP_PER_LEVEL[i]) level = i + 1;
        }
        return Math.min(10, level);
    }

    function getEquipmentBonus(state = game) {
        const eq = state.equipment || {};
        let atkBonus = 1, defBonus = 1;
        EQUIPMENT.forEach((e) => {
            const lvl = eq[e.id] || 0;
            const b = 1 + lvl * 0.05;
            if (e.bonus === "atk") atkBonus *= b;
            else defBonus *= b;
        });
        return { atkBonus, defBonus };
    }

    function getTroopPower(troopId, count, xp, state = game) {
        const troop = TROOPS_BY_ID[troopId];
        if (!troop) return { atk: 0, def: 0 };
        const level = getTroopLevel(xp || 0);
        const bonus = 1 + (level - 1) * 0.05;
        const wallBonus = 1 + ((state.buildings.wall || 0) * 0.2);
        const { atkBonus, defBonus } = getEquipmentBonus(state);
        return {
            atk: Math.floor(troop.atk * count * bonus * atkBonus),
            def: Math.floor(troop.def * count * bonus * defBonus * (troopId === "militia" || troopId === "spear" ? wallBonus : 1)),
        };
    }

    function getTotalArmyPower(state = game) {
        let atk = 0, def = 0;
        TROOPS.forEach((troop) => {
            const count = state.troops[troop.id] || 0;
            const xp = (state.troopXp || {})[troop.id] || 0;
            const p = getTroopPower(troop.id, count, xp, state);
            atk += p.atk;
            def += p.def;
        });
        return { atk, def };
    }

    function runCombat(enemyId, state = game) {
        const enemy = ENEMIES_BY_ID[enemyId];
        if (!enemy) return { victory: false, playerLosses: {}, rewards: {}, xp: 0 };
        const totalTroops = getTotalTroops(state);
        if (totalTroops === 0) return { victory: false, playerLosses: {}, rewards: {}, xp: 0 };
        const power = getTotalArmyPower(state);
        const playerDamage = Math.max(1, power.atk - enemy.def);
        const enemyDamage = Math.max(1, Math.floor(enemy.atk * 0.8) - Math.floor(power.def / Math.max(1, totalTroops)));
        const roundsToKillEnemy = Math.ceil(enemy.hp / playerDamage);
        const roundsWeSurvive = enemyDamage > 0 ? Math.floor((totalTroops * 8) / enemyDamage) : 999;
        const victory = roundsToKillEnemy <= roundsWeSurvive;
        if (!victory) {
            const lossPct = 0.1;
            const losses = {};
            TROOPS.forEach((t) => {
                const c = state.troops[t.id] || 0;
                if (c > 0) losses[t.id] = Math.max(0, Math.floor(c * lossPct));
            });
            return { victory: false, playerLosses: losses, rewards: {}, xp: 0 };
        }
        const rewards = { ...enemy.reward };
        Object.keys(rewards).forEach((k) => {
            rewards[k] = Math.floor((rewards[k] || 0) * (0.8 + pseudoRandomUnit(state.day + enemyId.length) * 0.4));
        });
        const xpGain = enemy.xp;
        return { victory: true, playerLosses: {}, rewards, xp: xpGain };
    }

    function applyCombatResult(result, state = game) {
        Object.entries(result.playerLosses || {}).forEach(([tid, loss]) => {
            state.troops[tid] = Math.max(0, (state.troops[tid] || 0) - loss);
        });
        if (result.victory) state.statsEnemiesKilled = (state.statsEnemiesKilled || 0) + 1;
        if (result.rewards) {
            const mult = state.difficulty === "einfach" ? 1.2 : state.difficulty === "schwer" ? 0.8 : 1;
            const adjusted = {};
            Object.entries(result.rewards).forEach(([k, v]) => { adjusted[k] = Math.floor(v * mult); });
            addResources(adjusted, state);
        }
        if (result.xp && result.victory) {
            const totalTroops = getTotalTroops(state);
            if (totalTroops > 0) {
                TROOPS.forEach((t) => {
                    const c = state.troops[t.id] || 0;
                    if (c > 0) {
                        state.troopXp = state.troopXp || {};
                        const share = Math.floor((result.xp * c) / totalTroops);
                        state.troopXp[t.id] = (state.troopXp[t.id] || 0) + share;
                    }
                });
            }
        }
    }

    function maybeTriggerAttack(day) {
        if (day < 5) return;
        if (game.pendingAttack) return;
        const diff = game.difficulty || "normal";
        const chance = diff === "einfach" ? 0.12 : diff === "schwer" ? 0.25 : 0.18;
        const r = pseudoRandomUnit(day * 7 + 3);
        if (r > chance) return;
        const waveCount = Math.min(5, Math.floor(2 + day / 5));
        const waves = [];
        for (let w = 0; w < waveCount; w++) {
            const idx = Math.min(ENEMIES.length - 1, Math.floor(pseudoRandomUnit(day + w * 11) * ENEMIES.length));
            waves.push(ENEMIES[idx].id);
        }
        game.attackWarningDay = day;
        game.pendingAttack = { day, waves, currentWave: 0, warning: true };
        addReport(`Spaeher melden: Angriff in 1 Tag! ${waveCount} Welle(n).`, "combat");
    }


    function resolveAttackWave() {
        if (!game.pendingAttack || game.pendingAttack.currentWave >= game.pendingAttack.waves.length) {
            if (game.pendingAttack) {
                game.wavesSurvived = Math.max(game.wavesSurvived || 0, game.pendingAttack.currentWave);
                addReport(`Angriff beendet. ${game.pendingAttack.currentWave} Welle(n) ueberstanden.`);
            }
            game.pendingAttack = null;
            renderAll();
            return;
        }
        const enemyId = game.pendingAttack.waves[game.pendingAttack.currentWave];
        const enemy = ENEMIES_BY_ID[enemyId];
        const result = runCombat(enemyId);
        applyCombatResult(result);
        game.pendingAttack.currentWave += 1;
        if (result.victory) {
            addReport(`Welle ${game.pendingAttack.currentWave}: ${enemy.name} besiegt! Belohnung: ${formatResourceList(result.rewards)}.`, "combat");
        } else {
            addReport(`Welle ${game.pendingAttack.currentWave}: Niederlage gegen ${enemy.name}. Truppenverluste.`, "combat");
        }
        if (game.pendingAttack.currentWave >= game.pendingAttack.waves.length) {
            game.wavesSurvived = Math.max(game.wavesSurvived || 0, game.pendingAttack.currentWave);
            game.pendingAttack = null;
        }
        renderAll();
        saveGame();
    }

    function canExpandTile(tileIndex) {
        if (game.expansion.includes(tileIndex)) return false;
        const neighbors = MAP_NEIGHBORS[24] || [];
        if (game.expansion.length > 0) {
            const allOwned = [24, ...game.expansion];
            const tileNeighbors = MAP_NEIGHBORS[tileIndex];
            if (!tileNeighbors) return false;
            const hasNeighbor = tileNeighbors.some((n) => allOwned.includes(n));
            if (!hasNeighbor) return false;
        } else {
            if (!neighbors.includes(tileIndex)) return false;
        }
        const mainLvl = game.buildings.main || 0;
        const req = 5 + game.expansion.length * 2;
        return mainLvl >= req;
    }

    function getExpansionCost(tileIndex) {
        const base = { wood: 300, clay: 300, iron: 200, crop: 200 };
        const mult = Math.pow(1.4, game.expansion.length);
        return {
            wood: Math.floor(base.wood * mult),
            clay: Math.floor(base.clay * mult),
            iron: Math.floor(base.iron * mult),
            crop: Math.floor(base.crop * mult),
        };
    }

    function startExpansion(tileIndex) {
        if (!canExpandTile(tileIndex)) return false;
        const cost = getExpansionCost(tileIndex);
        if (!canAfford(cost)) return false;
        spendResources(cost);
        game.expansion.push(tileIndex);
        addReport(`Expansion gestartet: Feld ${tileIndex} wird besiedelt.`);
        return true;
    }

    function canStartDungeon(dungeonId) {
        if (game.lastDungeonDay >= game.day) return false;
        if (getTotalTroops(game) < 5) return false;
        if (!dungeonId) return true;
        const d = DUNGEONS_BY_ID[dungeonId];
        if (!d) return false;
        if (d.id === "ruins" && ((game.dungeonsCleared || {}).forest || 0) < 7) return false;
        return true;
    }

    function runDungeon(dungeonId) {
        const dungeon = DUNGEONS_BY_ID[dungeonId];
        if (!dungeon || !canStartDungeon(dungeonId)) return;
        game.lastDungeonDay = game.day;
        game.dungeonsCleared[dungeonId] = game.dungeonsCleared[dungeonId] || 0;
        let cleared = 0;
        for (let i = 0; i < dungeon.levels; i++) {
            const enemyId = dungeon.enemies[i] || dungeon.enemies[dungeon.enemies.length - 1];
            const result = runCombat(enemyId);
            applyCombatResult(result);
            if (result.victory) {
                cleared++;
                let rewards = { ...result.rewards };
                Object.keys(dungeon.rewardBonus || {}).forEach((k) => {
                    rewards[k] = Math.floor((rewards[k] || 0) * (dungeon.rewardBonus[k] || 1));
                });
                addResources(rewards);
            } else {
                addReport(`Dungeon ${dungeon.name}: Level ${i + 1} verloren. ${cleared} Level erobert.`);
                break;
            }
        }
        game.dungeonsCleared[dungeonId] = Math.max(game.dungeonsCleared[dungeonId] || 0, cleared);
        if (cleared >= dungeon.levels) {
            game.achievements = game.achievements || {};
            game.achievements.dungeonNoLoss = true;
            addReport(`Dungeon ${dungeon.name} komplett erobert!`, "combat");
        }
        renderAll();
        saveGame();
    }

    function getEquipmentCost(equipId, level) {
        const eq = EQUIPMENT_BY_ID[equipId];
        if (!eq || level >= eq.maxLevel) return null;
        const mult = Math.pow(1.5, level);
        const cost = {};
        Object.entries(eq.cost).forEach(([k, v]) => { cost[k] = Math.floor(v * mult); });
        return cost;
    }

    function craftEquipment(equipId) {
        const eq = EQUIPMENT_BY_ID[equipId];
        if (!eq || (game.buildings.smithy || 0) < 1) return false;
        const level = (game.equipment || {})[equipId] || 0;
        if (level >= eq.maxLevel) return false;
        const cost = getEquipmentCost(equipId, level);
        if (!cost || !canAfford(cost)) return false;
        spendResources(cost);
        game.equipment[equipId] = level + 1;
        addReport(`Ausrüstung: ${eq.name} Stufe ${level + 1} hergestellt.`, "build");
        return true;
    }

    function evaluateAchievements() {
        ACHIEVEMENTS.forEach((a) => {
            if (game.achievements[a.id]) return;
            if (!a.check(game)) return;
            game.achievements[a.id] = true;
            addResources({ gold: a.reward });
            addReport(`Achievement: ${a.title}! +${a.reward} Gold.`, "objective");
        });
    }

    function canAfford(cost) {
        const keys = ["wood", "clay", "iron", "crop", "gold"];
        return keys.every((k) => (game.resources[k] || 0) >= asNumber(cost[k], 0));
    }

    function spendResources(cost) {
        ["wood", "clay", "iron", "crop", "gold"].forEach((k) => {
            game.resources[k] = Math.max(0, (game.resources[k] || 0) - asNumber(cost[k], 0));
        });
    }

    function addResources(resourceBundle, state = game) {
        const caps = getStorageCapacity(state);
        ["wood", "clay", "iron", "crop"].forEach((resourceKey) => {
            const delta = asNumber(resourceBundle[resourceKey], 0);
            state.resources[resourceKey] = Math.max(
                0,
                Math.min(caps[resourceKey], (state.resources[resourceKey] || 0) + delta)
            );
        });
        const goldDelta = asNumber(resourceBundle.gold, 0);
        if (goldDelta > 0) {
            state.resources.gold = (state.resources.gold || 0) + goldDelta;
        }
    }

    function getQueueSlots() {
        return (game.buildings.rally || 0) > 0 ? 2 : 1;
    }

    function isQueueFull() {
        return game.queue.length >= MAX_QUEUE_LENGTH;
    }

    function canBuildBuilding(buildingId) {
        const requirements = BUILD_REQS[buildingId];
        if (!requirements) {
            return true;
        }
        return Object.entries(requirements).every(
            ([requiredId, requiredLevel]) => (game.buildings[requiredId] || 0) >= requiredLevel
        );
    }

    function getRequirementsText(requirements) {
        if (!requirements) {
            return "Keine Voraussetzungen.";
        }
        return Object.entries(requirements)
            .map(([requiredId, requiredLevel]) => `${BUILDINGS[requiredId].name} St.${requiredLevel}`)
            .join(", ");
    }

    function addReport(text, type = "general") {
        game.reports.push({
            text,
            time: new Date().toLocaleString("de-DE"),
            type,
        });
        if (game.reports.length > MAX_REPORTS) {
            game.reports = game.reports.slice(-MAX_REPORTS);
        }
    }

    function formatResourceList(resourceBundle) {
        const keys = ["wood", "clay", "iron", "crop", "gold"];
        return keys
            .filter((k) => asNumber(resourceBundle[k], 0) > 0)
            .map((k) => `${RESOURCE_ICONS[k] || "🪙"} ${Math.floor(resourceBundle[k])}`)
            .join(", ");
    }

    function formatDurationSeconds(totalSeconds) {
        if (totalSeconds < 60) {
            return `${Math.ceil(totalSeconds)}s`;
        }
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.ceil(totalSeconds % 60);
        return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
    }

    function renderCostHtml(cost) {
        return RESOURCE_KEYS.map((resourceKey) => {
            const value = Math.floor(asNumber(cost[resourceKey], 0));
            if (value <= 0) {
                return "";
            }
            const canPay = game.resources[resourceKey] >= value;
            return `<span class="cost ${canPay ? "can" : "cannot"}">${RESOURCE_ICONS[resourceKey]} ${value}</span>`;
        }).join("");
    }

    function updateDayAndEvents(nowMs) {
        const start = ensureStartTimestamp();
        const nextDay = Math.max(1, Math.floor((nowMs - start) / DAY_LENGTH_MS) + 1);

        if (nextDay > game.day) {
            for (let day = game.day + 1; day <= nextDay; day += 1) {
                if (game.pendingAttack?.warning && day > game.attackWarningDay) {
                    game.pendingAttack.warning = false;
                    addReport(`Angriff! ${game.pendingAttack.waves.length} Welle(n) greifen an.`, "combat");
                }
                maybeTriggerWorldEvent(day);
                maybeTriggerAttack(day);
            }
            game.statsDaysPlayed = (game.statsDaysPlayed || 0) + (nextDay - game.day);
        }

        game.day = nextDay;
    }

    function pseudoRandomUnit(seedValue) {
        const x = Math.sin(seedValue * 9_173.13) * 10_000;
        return x - Math.floor(x);
    }

    function maybeTriggerWorldEvent(day) {
        if (day % EVENT_FREQUENCY_DAYS !== 0) {
            return;
        }
        if (game.lastEventDay >= day) {
            return;
        }

        const random = pseudoRandomUnit(day);
        const index = Math.min(WORLD_EVENTS.length - 1, Math.floor(random * WORLD_EVENTS.length));
        const event = WORLD_EVENTS[index];
        event.apply(game);
        game.lastEventDay = day;
        const summary = event.id === "trader" && game.lastTradeSummary ? game.lastTradeSummary : event.summary;
        addReport(`Weltereignis (Tag ${day}): ${event.title} - ${summary}.`, "event");
    }

    function evaluateObjectives() {
        let changed = false;
        const list = OBJECTIVES.every((o) => game.objectives[o.id]) ? [...OBJECTIVES, ...ENDLESS_OBJECTIVES] : OBJECTIVES;
        list.forEach((objective) => {
            if (game.objectives[objective.id]) return;
            if (!objective.isComplete(game)) return;
            game.objectives[objective.id] = true;
            addResources(objective.reward);
            addReport(`Ziel erreicht: ${objective.title}. Belohnung: ${formatResourceList(objective.reward)}.`, "objective");
            changed = true;
        });
        return changed;
    }

    function processQueue(deltaMs) {
        const slots = getQueueSlots();
        let remainingDeltaMs = Math.max(0, deltaMs);

        while (remainingDeltaMs > 0 && game.queue.length > 0) {
            const activeCount = Math.min(slots, game.queue.length);
            let minRemainingMs = Infinity;

            for (let index = 0; index < activeCount; index += 1) {
                minRemainingMs = Math.min(minRemainingMs, game.queue[index].remaining);
            }

            const safeMin = Number.isFinite(minRemainingMs) ? Math.max(0, minRemainingMs) : 0;
            const stepMs = Math.min(remainingDeltaMs, safeMin);

            if (stepMs <= 0) {
                let completedAtLeastOne = false;
                for (let index = activeCount - 1; index >= 0; index -= 1) {
                    if (game.queue[index].remaining > 0) {
                        continue;
                    }
                    const [completedItem] = game.queue.splice(index, 1);
                    completeQueueItem(completedItem);
                    completedAtLeastOne = true;
                }
                if (!completedAtLeastOne) {
                    break;
                }
                continue;
            }

            for (let index = 0; index < activeCount; index += 1) {
                game.queue[index].remaining = Math.max(0, game.queue[index].remaining - stepMs);
            }
            remainingDeltaMs -= stepMs;

            for (let index = activeCount - 1; index >= 0; index -= 1) {
                if (game.queue[index].remaining > 0) {
                    continue;
                }
                const [completedItem] = game.queue.splice(index, 1);
                completeQueueItem(completedItem);
            }
        }
    }

    function completeQueueItem(item) {
        if (item.type === "building") {
            game.buildings[item.id] = (game.buildings[item.id] || 0) + 1;
        } else if (item.type === "field") {
            const field = game.fields[item.id];
            if (field) {
                field.level += 1;
            }
        } else if (item.type === "troop") {
            game.troops[item.id] = (game.troops[item.id] || 0) + item.count;
        }

        addReport(`${item.name} abgeschlossen.`, "build");
    }

    function applyEconomyTick(deltaSeconds) {
        const production = getProductionPerHour();
        const cropConsumption = getCropConsumptionPerHour();
        const capacities = getStorageCapacity();

        game.resources.wood = Math.min(capacities.wood, game.resources.wood + (production.wood * deltaSeconds) / 3_600);
        game.resources.clay = Math.min(capacities.clay, game.resources.clay + (production.clay * deltaSeconds) / 3_600);
        game.resources.iron = Math.min(capacities.iron, game.resources.iron + (production.iron * deltaSeconds) / 3_600);

        const netCropPerHour = production.crop - cropConsumption;
        game.resources.crop = Math.max(
            0,
            Math.min(capacities.crop, game.resources.crop + (netCropPerHour * deltaSeconds) / 3_600)
        );
    }

    function handleStarvation(deltaSeconds) {
        const netCrop = getNetCropPerHour();
        if (netCrop >= 0 || game.resources.crop > 0) {
            game.starvationSeconds = 0;
            return;
        }

        game.starvationSeconds += deltaSeconds;
        if (game.starvationSeconds < STARVATION_TICK_SECONDS) {
            return;
        }

        game.starvationSeconds = 0;
        const availableTroops = Object.keys(game.troops).filter((troopId) => game.troops[troopId] > 0);
        if (!availableTroops.length) {
            return;
        }

        const targetId = availableTroops[Math.floor(Math.random() * availableTroops.length)];
        const current = game.troops[targetId];
        const loss = Math.max(1, Math.min(current, Math.ceil(current * 0.05)));
        game.troops[targetId] -= loss;
        addReport(`Hungersnot: ${loss}x ${TROOPS_BY_ID[targetId].name} desertiert.`);
    }

    function advanceSimulation(deltaSeconds, nowMs) {
        if (deltaSeconds <= 0) {
            return;
        }

        applyEconomyTick(deltaSeconds);
        processQueue(deltaSeconds * 1_000);
        handleStarvation(deltaSeconds);
        updateDayAndEvents(nowMs);
        evaluateObjectives();
        evaluateAchievements();
    }

    function applyOfflineProgress() {
        const now = Date.now();
        const rawOfflineSeconds = Math.max(0, (now - game.lastTick) / 1_000);
        const offlineSeconds = Math.min(MAX_OFFLINE_SECONDS, rawOfflineSeconds);

        if (offlineSeconds < 2) {
            game.lastTick = now;
            return;
        }

        let simulatedSeconds = 0;
        let remaining = offlineSeconds;
        const baseTick = game.lastTick;

        while (remaining > 0) {
            const step = Math.min(5, remaining);
            simulatedSeconds += step;
            const simulatedNow = baseTick + simulatedSeconds * 1_000;
            advanceSimulation(step, simulatedNow);
            remaining -= step;
        }

        game.lastTick = now;
        addReport(`Offline-Fortschritt verarbeitet: ${Math.floor(simulatedSeconds)} Sekunden.`);
    }

    function tick() {
        if (game.gamePaused) {
            renderAll();
            return;
        }
        const now = Date.now();
        let deltaSeconds = Math.max(0, (now - game.lastTick) / 1_000);
        const speed = game.gameSpeed || 1;
        deltaSeconds *= speed;
        game.lastTick = now;

        advanceSimulation(deltaSeconds, now);
        renderAll();

        saveAccumulatorMs += deltaSeconds * 1_000;
        if (saveAccumulatorMs >= SAVE_INTERVAL_MS) {
            saveGame();
            saveAccumulatorMs = 0;
        }
    }

    function renderResourceBar() {
        const production = getProductionPerHour();
        const cropConsumption = getCropConsumptionPerHour();
        const capacity = getStorageCapacity();
        const netCrop = production.crop - cropConsumption;

        if (dom.resGold) dom.resGold.textContent = Math.floor(game.resources.gold || 0).toLocaleString("de-DE");
        dom.resWood.textContent = Math.floor(game.resources.wood).toLocaleString("de-DE");
        dom.resClay.textContent = Math.floor(game.resources.clay).toLocaleString("de-DE");
        dom.resIron.textContent = Math.floor(game.resources.iron).toLocaleString("de-DE");
        dom.resCrop.textContent = Math.floor(game.resources.crop).toLocaleString("de-DE");

        dom.rateWood.textContent = `+${production.wood}/h`;
        dom.rateClay.textContent = `+${production.clay}/h`;
        dom.rateIron.textContent = `+${production.iron}/h`;
        dom.rateCrop.textContent = `${netCrop >= 0 ? "+" : ""}${netCrop}/h`;

        dom.storeWood.textContent = `/${capacity.wood.toLocaleString("de-DE")}`;
        dom.storeClay.textContent = `/${capacity.clay.toLocaleString("de-DE")}`;
        dom.storeIron.textContent = `/${capacity.iron.toLocaleString("de-DE")}`;
        dom.storeCrop.textContent = `/${capacity.crop.toLocaleString("de-DE")}`;

        dom.gameTime.textContent = `Tag ${game.day}`;
        dom.economySummary.textContent = `Netto-Getreide: ${netCrop >= 0 ? "+" : ""}${netCrop}/h | Auftraege: ${game.queue.length}/${MAX_QUEUE_LENGTH}`;
        dom.economySummary.classList.toggle("warning", netCrop < 0);
    }

    function renderQueue() {
        if (!game.queue.length) {
            dom.queueContainer.hidden = true;
            dom.queueList.innerHTML = "";
            dom.queueSlotsInfo.textContent = `${getQueueSlots()} Slot${getQueueSlots() > 1 ? "s" : ""} aktiv`;
            return;
        }

        dom.queueContainer.hidden = false;
        const slots = getQueueSlots();
        const waitingCount = Math.max(0, game.queue.length - slots);
        dom.queueSlotsInfo.textContent = `${slots} aktiv${waitingCount ? ` | ${waitingCount} wartend` : ""}`;

        dom.queueList.innerHTML = game.queue
            .map((queueItem, index) => {
                const active = index < slots;
                const total = Math.max(queueItem.total, 1);
                const progress = active ? Math.max(0, (1 - queueItem.remaining / total) * 100) : 0;
                const durationText = active
                    ? formatDurationSeconds(queueItem.remaining / 1_000)
                    : "wartend";
                return `
                    <div class="queue-item">
                        <span>${queueItem.icon} ${queueItem.name}</span>
                        <div class="progress"><div class="progress-fill" style="width:${progress.toFixed(2)}%"></div></div>
                        <span>${durationText}</span>
                    </div>
                `;
            })
            .join("");
    }

    function renderMap() {
        dom.mapGrid.innerHTML = "";
        const expanded = game.expansion || [];
        const allOwned = [24, ...expanded];
        for (let index = 0; index < 49; index += 1) {
            const tile = document.createElement("button");
            tile.type = "button";
            tile.dataset.index = String(index);
            let label = "Leeres Kartenfeld";
            if (index === 24) {
                tile.className = "map-tile village";
                label = "Eigenes Dorf";
            } else if (expanded.includes(index)) {
                tile.className = "map-tile expanded";
                label = "Erweitertes Dorf";
            } else if (canExpandTile(index)) {
                tile.className = "map-tile expandable empty";
                label = "Expandieren";
            } else {
                tile.className = "map-tile empty";
            }
            tile.setAttribute("aria-label", label);
            dom.mapGrid.appendChild(tile);
        }
        if (dom.mapBadge) dom.mapBadge.hidden = !game.pendingAttack;
        if (dom.attackAlert) {
            const showAlert = game.pendingAttack && (!game.pendingAttack.warning || !game.attackWarningDismissed);
            dom.attackAlert.hidden = !showAlert;
            if (game.pendingAttack) {
                if (game.pendingAttack.warning) {
                    dom.attackAlertText.textContent = `Spaeher melden: Angriff in 1 Tag! ${game.pendingAttack.waves.length} Welle(n). Bereite deine Truppen vor.`;
                    if (dom.attackResolveBtn) {
                        dom.attackResolveBtn.textContent = "Verstanden";
                        dom.attackResolveBtn.style.display = "inline-block";
                    }
                } else {
                    const w = game.pendingAttack.waves.length;
                    const c = game.pendingAttack.currentWave;
                    dom.attackAlertText.textContent = `Welle ${c + 1}/${w}: ${ENEMIES_BY_ID[game.pendingAttack.waves[c]]?.name || "Gegner"}. Klicke um Kampf auszufuehren.`;
                    if (dom.attackResolveBtn) {
                        dom.attackResolveBtn.textContent = "Kampf ausfuehren";
                        dom.attackResolveBtn.style.display = "inline-block";
                    }
                }
            }
        }
    }

    const BUILDING_ICONS_BY_LEVEL = {
        main: ["🏠", "🏠", "🏛️", "🏛️", "🏛️", "🏰", "🏰", "🏰", "🏰", "🏰"],
        barracks: ["⚔️", "⚔️", "⚔️", "⚔️", "⚔️"],
        warehouse: ["📦", "📦", "📦", "📦", "📦"],
        granary: ["🌾", "🌾", "🌾", "🌾", "🌾"],
        wall: ["🧱", "🧱", "🧱", "🧱", "🧱"],
        rally: ["🏕️", "🏕️", "🏕️", "🏕️", "🏕️"],
        smithy: ["⚒️", "⚒️", "⚒️", "⚒️", "⚒️"],
    };
    function getBuildingIcon(buildingId, level) {
        const arr = BUILDING_ICONS_BY_LEVEL[buildingId];
        if (!arr) return BUILDINGS[buildingId]?.icon || "🏠";
        return arr[Math.min(level - 1, arr.length - 1)] || arr[0];
    }

    function renderVillage() {
        dom.villageLayout.innerHTML = BUILDING_ORDER.map((buildingId) => {
            const building = BUILDINGS[buildingId];
            const level = game.buildings[buildingId] || 0;
            const icon = level > 0 ? getBuildingIcon(buildingId, level) : building.icon;
            return `
                <button type="button" class="building-slot ${level ? "" : "empty"}" data-building-id="${buildingId}">
                    <span class="icon">${icon}</span>
                    <span class="name">${building.name}</span>
                    <span class="level">${level ? `Stufe ${level}` : "Leer"}</span>
                </button>
            `;
        }).join("");

        dom.resourceFields.innerHTML = game.fields
            .map((field, index) => {
                const fieldDef = FIELDS_BY_TYPE[field.type];
                return `
                    <button type="button" class="field" data-field-id="${index}">
                        <span class="icon">${fieldDef.icon}</span>
                        <span class="name">${fieldDef.name}</span>
                        <span class="lvl">St. ${field.level}</span>
                    </button>
                `;
            })
            .join("");
    }

    function renderTroops() {
        const canTrain = (game.buildings.barracks || 0) > 0;
        const queueFull = isQueueFull();

        dom.troopsGrid.innerHTML = TROOPS.map((troop) => {
            const owned = game.troops[troop.id] || 0;
            const xp = (game.troopXp || {})[troop.id] || 0;
            const level = getTroopLevel(xp);
            const canPayOne = canAfford(troop.cost);
            const buttonDisabled = !canTrain || queueFull || !canPayOne;

            return `
                <article class="troop-card">
                    <div class="icon">${troop.icon}</div>
                    <div class="name">${troop.name}</div>
                    <div class="count">${owned} Einheiten</div>
                    ${owned > 0 ? `<div class="troop-xp">St. ${level} (${xp} XP) | ATK ${troop.atk} DEF ${troop.def}</div>` : ""}
                    <div class="meta">${troop.consume} Getreide/h Verbrauch</div>
                    <div class="meta">${formatResourceList(troop.cost)}</div>
                    ${
                        canTrain
                            ? `
                                <input type="number" id="train-${troop.id}" min="1" max="99" value="1" aria-label="Menge ${troop.name}">
                                <button type="button" class="btn btn-sm" data-train-id="${troop.id}" ${buttonDisabled ? "disabled" : ""}>
                                    Rekrutieren
                                </button>
                            `
                            : `<p class="empty-state">Kaserne Stufe 1 erforderlich.</p>`
                    }
                </article>
            `;
        }).join("");
    }

    function renderReports() {
        if (!game.reports.length) {
            dom.reportList.innerHTML = '<p class="empty-state">Noch keine Berichte vorhanden.</p>';
            return;
        }
        let list = game.reports.slice().reverse();
        if (reportFilter !== "all") {
            list = list.filter((r) => (r.type || "general") === reportFilter);
        }
        dom.reportList.innerHTML = list
            .map(
                (report) => `
                    <article class="report report-${report.type || "general"}">
                        <div class="time">${report.time}</div>
                        <p>${report.text}</p>
                    </article>
                `
            )
            .join("");
    }

    function renderObjectives() {
        const allComplete = OBJECTIVES.every((o) => game.objectives[o.id]);
        const list = allComplete ? [...OBJECTIVES, ...ENDLESS_OBJECTIVES] : OBJECTIVES;
        game.objectives = game.objectives || {};
        ENDLESS_OBJECTIVES.forEach((o) => { if (!(o.id in game.objectives)) game.objectives[o.id] = false; });
        const completed = list.filter((o) => game.objectives[o.id]).length;
        const prog = document.getElementById("objectiveProgress");
        if (prog) prog.textContent = `${completed}/${list.length}` + (allComplete ? " (Endlos)" : "");
        dom.objectiveList.innerHTML = list.map((objective) => {
            const completed = game.objectives[objective.id];
            return `
                <article class="objective-item ${completed ? "completed" : ""}">
                    <h4>${objective.title}</h4>
                    <p>${objective.desc}</p>
                    <small>${completed ? "Belohnung erhalten." : `Belohnung: ${formatResourceList(objective.reward)}`}</small>
                </article>
            `;
        }).join("");

        const nextObjective = list.find((objective) => !game.objectives[objective.id]);
        dom.activeObjectiveSummary.textContent = nextObjective
            ? `${nextObjective.title}: ${nextObjective.desc}`
            : "Alle Ziele abgeschlossen! Endlos-Modus aktiv.";
    }

    function renderDungeons() {
        if (!dom.dungeonList) return;
        if (dom.dungeonCooldown) {
            dom.dungeonCooldown.textContent = game.lastDungeonDay >= game.day
                ? `Naechster Dungeon: Tag ${game.day + 1}`
                : "Bereit – betritte einen Dungeon.";
        }
        const canDo = canStartDungeon();
        dom.dungeonList.innerHTML = DUNGEONS.map((d) => {
            const cleared = (game.dungeonsCleared || {})[d.id] || 0;
            const locked = d.id === "ruins" && ((game.dungeonsCleared || {}).forest || 0) < 7;
            const ready = !locked && canStartDungeon(d.id);
            return `
                <article class="dungeon-card ${locked ? "locked" : ""}">
                    <div class="dungeon-header">
                        <span class="dungeon-icon">${d.icon}</span>
                        <div>
                            <h4>${d.name}</h4>
                            <small>${cleared}/${d.levels} Level erobert</small>
                        </div>
                    </div>
                    <div class="dungeon-levels">
                        ${Array.from({ length: d.levels }, (_, i) =>
                            `<span class="dungeon-level-dot ${i < cleared ? "cleared" : ""}" title="Level ${i + 1}"></span>`
                        ).join("")}
                    </div>
                    <p class="meta">Gegner: ${d.enemies.map((eid) => ENEMIES_BY_ID[eid]?.name || eid).join(", ")}</p>
                    ${ready ? `<button type="button" class="btn btn-sm" data-dungeon-id="${d.id}">Betreten</button>` : ""}
                    ${locked ? `<p class="empty-state">Schließe zuerst Verfluchter Wald ab.</p>` : ""}
                </article>
            `;
        }).join("");
    }

    function renderEquipment() {
        const el = document.getElementById("equipmentList");
        const sub = document.getElementById("equipmentSubtitle");
        if (!el) return;
        const smithyLvl = game.buildings.smithy || 0;
        if (smithyLvl < 1) {
            sub.textContent = "Schmiede Stufe 1 erforderlich.";
            el.innerHTML = "";
            return;
        }
        sub.textContent = "Verbessere deine Truppen mit Ausrüstung.";
        el.innerHTML = EQUIPMENT.map((eq) => {
            const lvl = (game.equipment || {})[eq.id] || 0;
            const cost = getEquipmentCost(eq.id, lvl);
            const canCraft = cost && canAfford(cost) && lvl < eq.maxLevel;
            return `
                <div class="equipment-item">
                    <span class="icon">${eq.icon}</span>
                    <div>
                        <strong>${eq.name}</strong> St. ${lvl}/${eq.maxLevel} (+${lvl * 5}% ${eq.bonus === "atk" ? "ATK" : "DEF"})
                    </div>
                    ${lvl < eq.maxLevel ? `
                        <button type="button" class="btn btn-sm" data-craft="${eq.id}" ${!canCraft ? "disabled" : ""}>
                            ${cost ? formatResourceList(cost) : "Max"} – Herstellen
                        </button>
                    ` : "<span class=\"ok\">Max</span>"}
                </div>
            `;
        }).join("");
    }

    function renderAchievements() {
        const el = document.getElementById("achievementList");
        if (!el) return;
        el.innerHTML = ACHIEVEMENTS.map((a) => {
            const done = game.achievements[a.id];
            return `
                <div class="achievement-item ${done ? "completed" : ""}">
                    <span>${done ? "✓" : "○"}</span>
                    <div>
                        <strong>${a.title}</strong> – ${a.desc}
                        ${done ? ` (+${a.reward} Gold)` : ""}
                    </div>
                </div>
            `;
        }).join("");
    }

    function renderCurrentTab() {
        if (activeTab === "village") {
            renderVillage();
            renderEquipment();
            renderAchievements();
        } else if (activeTab === "troops") {
            renderTroops();
        } else if (activeTab === "dungeons") {
            renderDungeons();
        } else if (activeTab === "reports") {
            renderReports();
        }
    }

    function renderAll() {
        renderResourceBar();
        renderQueue();
        renderObjectives();
        if (activeTab === "map") renderMap();
        renderCurrentTab();
    }

    function switchTab(tabName) {
        activeTab = tabName;
        document.querySelectorAll(".tab").forEach((tabButton) => {
            tabButton.classList.toggle("active", tabButton.dataset.tab === tabName);
        });
        document.querySelectorAll(".village-view").forEach((view) => {
            view.classList.toggle("active", view.id === `${tabName}Tab`);
        });
        renderCurrentTab();
    }

    function openHelp(key, title = "Hilfe") {
        dom.helpTitle.textContent = title;
        dom.helpText.textContent = HELP_TEXTS[key] || "Keine Hilfe verfuegbar.";
        dom.helpModal.classList.add("show");
    }

    function closeHelpModal() {
        dom.helpModal.classList.remove("show");
    }

    function closeBuildingModal() {
        dom.buildingModal.classList.remove("show");
        currentModalHelp = "";
        dom.modalHelpBtn.hidden = true;
        dom.modalBuild.onclick = null;
    }

    function openActionModal({ title, desc, cost, timeMs, helpText, buttonLabel, disabled, onConfirm }) {
        currentModalHelp = helpText || "";
        dom.modalHelpBtn.hidden = !currentModalHelp;

        dom.modalTitle.textContent = title;
        dom.modalDesc.textContent = desc;
        dom.modalCosts.innerHTML = renderCostHtml(cost);
        dom.modalTime.textContent = `⏱️ Dauer: ${Math.ceil(timeMs / 1_000)} Sekunden`;
        dom.modalBuild.textContent = buttonLabel;
        dom.modalBuild.disabled = Boolean(disabled);
        dom.modalBuild.onclick = () => {
            if (dom.modalBuild.disabled) {
                return;
            }
            onConfirm();
            closeBuildingModal();
            renderAll();
            saveGame();
        };
        dom.buildingModal.classList.add("show");
    }

    function openBuildingModal(buildingId) {
        const building = BUILDINGS[buildingId];
        const level = game.buildings[buildingId] || 0;
        const nextLevel = level + 1;
        const cost = getScaledCost(building.baseCost, level);
        const timeMs = getBuildTimeMs(building.timeMs, level);
        const meetsRequirements = canBuildBuilding(buildingId);
        const queueFull = isQueueFull();
        const affordable = canAfford(cost);

        let description = building.desc;
        if (!meetsRequirements) {
            description = `Voraussetzungen fehlen: ${getRequirementsText(BUILD_REQS[buildingId])}`;
        } else if (queueFull) {
            description = `Warteschlange voll (${MAX_QUEUE_LENGTH} Auftraege).`;
        } else if (!affordable) {
            description = "Nicht genug Rohstoffe vorhanden.";
        }

        openActionModal({
            title: `${building.name} (Stufe ${nextLevel})`,
            desc: description,
            cost,
            timeMs,
            helpText: building.help,
            buttonLabel: "Ausbauen",
            disabled: !meetsRequirements || queueFull || !affordable,
            onConfirm: () => {
                spendResources(cost);
                game.queue.push({
                    type: "building",
                    id: buildingId,
                    count: 1,
                    name: `${building.name} St.${nextLevel}`,
                    icon: building.icon,
                    remaining: timeMs,
                    total: timeMs,
                });
                addReport(`Bau gestartet: ${building.name} Stufe ${nextLevel}.`);
            },
        });
    }

    function openFieldModal(fieldIndex) {
        const field = game.fields[fieldIndex];
        if (!field) {
            return;
        }

        const fieldDef = FIELDS_BY_TYPE[field.type];
        const nextLevel = field.level + 1;
        const cost = getScaledCost(fieldDef.baseCost, field.level);
        const timeMs = getBuildTimeMs(6_000, field.level);
        const queueFull = isQueueFull();
        const affordable = canAfford(cost);
        const nextProduction = getFieldProduction(field.type, nextLevel);

        const description = queueFull
            ? `Warteschlange voll (${MAX_QUEUE_LENGTH} Auftraege).`
            : affordable
              ? `Produziert ${RESOURCE_NAMES[field.type]}. Geplante Produktion auf Stufe ${nextLevel}: +${nextProduction}/h`
              : "Nicht genug Rohstoffe vorhanden.";

        openActionModal({
            title: `${fieldDef.name} (Stufe ${nextLevel})`,
            desc: description,
            cost,
            timeMs,
            helpText: fieldDef.help,
            buttonLabel: "Ausbauen",
            disabled: queueFull || !affordable,
            onConfirm: () => {
                spendResources(cost);
                game.queue.push({
                    type: "field",
                    id: fieldIndex,
                    count: 1,
                    name: `${fieldDef.name} St.${nextLevel}`,
                    icon: fieldDef.icon,
                    remaining: timeMs,
                    total: timeMs,
                });
                addReport(`Feld-Ausbau gestartet: ${fieldDef.name} Stufe ${nextLevel}.`);
            },
        });
    }

    function trainTroop(troopId) {
        const troop = TROOPS_BY_ID[troopId];
        if (!troop) {
            return;
        }

        if ((game.buildings.barracks || 0) < 1) {
            addReport(`Rekrutierung fehlgeschlagen: Kaserne fehlt fuer ${troop.name}.`);
            return;
        }

        if (isQueueFull()) {
            addReport(`Rekrutierung fehlgeschlagen: Warteschlange ist voll (${MAX_QUEUE_LENGTH}).`);
            return;
        }

        const input = document.getElementById(`train-${troop.id}`);
        const requested = Math.floor(asNumber(input ? input.value : 1, 1));
        const count = Math.max(1, Math.min(99, requested));
        const totalCost = multiplyCost(troop.cost, count);

        if (!canAfford(totalCost)) {
            addReport(`Rekrutierung fehlgeschlagen: Nicht genug Rohstoffe fuer ${count}x ${troop.name}.`);
            renderAll();
            return;
        }

        const netCrop = getNetCropPerHour();
        const additionalConsumption = troop.consume * count;
        if (netCrop < additionalConsumption) {
            addReport(`Warnung: ${count}x ${troop.name} verschlechtert deine Getreidebilanz.`);
        }

        spendResources(totalCost);
        const timeMs = getRecruitTimeMs(troop, count);
        game.queue.push({
            type: "troop",
            id: troop.id,
            count,
            name: `${count}x ${troop.name}`,
            icon: troop.icon,
            remaining: timeMs,
            total: timeMs,
        });
        addReport(`Rekrutierung gestartet: ${count}x ${troop.name}.`);
        renderAll();
        saveGame();
    }

    function handleResetGame() {
        if (dom.newGameModal) {
            dom.newGameModal.classList.add("show");
            if (dom.newGameConfirm) dom.newGameConfirm.value = "";
            if (dom.newGameConfirmBtn) dom.newGameConfirmBtn.disabled = true;
        }
    }

    function doResetGame() {
        const diff = document.querySelector('input[name="difficulty"]:checked');
        if (diff) localStorage.setItem("empire-difficulty", diff.value);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(START_KEY);
        localStorage.removeItem(TUTORIAL_KEY);
        window.location.reload();
    }

    function handleHelpClick(event) {
        const button = event.target.closest("[data-help]");
        if (!button) {
            return;
        }
        const key = button.dataset.help;
        openHelp(key);
    }

    function handleMapClick(event) {
        const tile = event.target.closest(".map-tile");
        if (!tile) return;
        const index = Math.floor(asNumber(tile.dataset.index, -1));
        if (index === 24) {
            switchTab("village");
        } else if (tile.classList.contains("expandable")) {
            if (startExpansion(index)) {
                renderMap();
                renderAll();
                saveGame();
            } else {
                const cost = getExpansionCost(index);
                addReport(`Expansion fehlgeschlagen: Benoetigt ${formatResourceList(cost)} und Hauptgebaeude St. ${5 + (game.expansion || []).length * 2}.`);
                renderAll();
            }
        }
    }

    function handleVillageClick(event) {
        const slot = event.target.closest("[data-building-id]");
        if (!slot) {
            return;
        }
        openBuildingModal(slot.dataset.buildingId);
    }

    function handleFieldClick(event) {
        const field = event.target.closest("[data-field-id]");
        if (!field) {
            return;
        }
        openFieldModal(Math.floor(asNumber(field.dataset.fieldId, -1)));
    }

    function handleTroopClick(event) {
        const button = event.target.closest("[data-train-id]");
        if (!button) return;
        trainTroop(button.dataset.trainId);
    }

    function handleDungeonClick(event) {
        const btn = event.target.closest("[data-dungeon-id]");
        if (!btn) return;
        runDungeon(btn.dataset.dungeonId);
    }

    function cacheDomElements() {
        dom.resetGameButton = document.getElementById("resetGameButton");
        dom.helpCloseButton = document.getElementById("helpCloseButton");
        dom.helpModal = document.getElementById("helpModal");
        dom.helpTitle = document.getElementById("helpTitle");
        dom.helpText = document.getElementById("helpText");

        dom.buildingModal = document.getElementById("buildingModal");
        dom.modalTitle = document.getElementById("modalTitle");
        dom.modalHelpBtn = document.getElementById("modalHelpBtn");
        dom.modalDesc = document.getElementById("modalDesc");
        dom.modalCosts = document.getElementById("modalCosts");
        dom.modalTime = document.getElementById("modalTime");
        dom.modalBuild = document.getElementById("modalBuild");
        dom.modalCancel = document.getElementById("modalCancel");

        dom.resWood = document.getElementById("resWood");
        dom.resClay = document.getElementById("resClay");
        dom.resIron = document.getElementById("resIron");
        dom.resCrop = document.getElementById("resCrop");
        dom.rateWood = document.getElementById("rateWood");
        dom.rateClay = document.getElementById("rateClay");
        dom.rateIron = document.getElementById("rateIron");
        dom.rateCrop = document.getElementById("rateCrop");
        dom.storeWood = document.getElementById("storeWood");
        dom.storeClay = document.getElementById("storeClay");
        dom.storeIron = document.getElementById("storeIron");
        dom.storeCrop = document.getElementById("storeCrop");
        dom.gameTime = document.getElementById("gameTime");

        dom.economySummary = document.getElementById("economySummary");
        dom.activeObjectiveSummary = document.getElementById("activeObjectiveSummary");
        dom.objectiveList = document.getElementById("objectiveList");

        dom.queueContainer = document.getElementById("queueContainer");
        dom.queueList = document.getElementById("queueList");
        dom.queueSlotsInfo = document.getElementById("queueSlotsInfo");

        dom.mapGrid = document.getElementById("mapGrid");
        dom.villageLayout = document.getElementById("villageLayout");
        dom.resourceFields = document.getElementById("resourceFields");
        dom.troopsGrid = document.getElementById("troopsGrid");
        dom.reportList = document.getElementById("reportList");
        dom.resGold = document.getElementById("resGold");
        dom.attackAlert = document.getElementById("attackAlert");
        dom.attackAlertText = document.getElementById("attackAlertText");
        dom.attackResolveBtn = document.getElementById("attackResolveBtn");
        dom.dungeonList = document.getElementById("dungeonList");
        dom.mapBadge = document.getElementById("mapBadge");
        dom.newGameModal = document.getElementById("newGameModal");
        dom.newGameConfirm = document.getElementById("newGameConfirm");
        dom.newGameConfirmBtn = document.getElementById("newGameConfirmBtn");
        dom.newGameCancel = document.getElementById("newGameCancel");
    }

    function showTutorial() {
        if (localStorage.getItem(TUTORIAL_KEY)) return;
        const overlay = document.getElementById("tutorialOverlay");
        const text = document.getElementById("tutorialText");
        const closeBtn = document.getElementById("tutorialClose");
        if (!overlay || !text) return;
        overlay.hidden = false;
        text.textContent = "Klicke auf dein Dorf 🏰 in der Mitte der Karte, um zu starten.";
        closeBtn.onclick = () => {
            overlay.hidden = true;
            localStorage.setItem(TUTORIAL_KEY, "1");
        };
    }

    function registerEventListeners() {
        dom.resetGameButton.addEventListener("click", handleResetGame);
        dom.helpCloseButton.addEventListener("click", closeHelpModal);
        dom.modalCancel.addEventListener("click", closeBuildingModal);

        dom.modalHelpBtn.addEventListener("click", () => {
            if (!currentModalHelp) {
                return;
            }
            dom.helpTitle.textContent = "Erklaerung";
            dom.helpText.textContent = currentModalHelp;
            dom.helpModal.classList.add("show");
        });

        document.querySelectorAll(".tab").forEach((tabButton) => {
            tabButton.addEventListener("click", () => {
                switchTab(tabButton.dataset.tab);
            });
        });

        document.body.addEventListener("click", handleHelpClick);
        dom.mapGrid.addEventListener("click", handleMapClick);
        dom.villageLayout.addEventListener("click", handleVillageClick);
        dom.resourceFields.addEventListener("click", handleFieldClick);
        dom.troopsGrid.addEventListener("click", handleTroopClick);
        if (dom.newGameConfirm) dom.newGameConfirm.addEventListener("input", () => {
            dom.newGameConfirmBtn.disabled = dom.newGameConfirm.value.toUpperCase() !== "NEU";
        });
        if (dom.newGameConfirmBtn) dom.newGameConfirmBtn.addEventListener("click", doResetGame);
        if (dom.newGameCancel) dom.newGameCancel.addEventListener("click", () => {
            if (dom.newGameModal) dom.newGameModal.classList.remove("show");
        });
        if (dom.newGameModal) dom.newGameModal.addEventListener("click", (e) => {
            if (e.target === dom.newGameModal) dom.newGameModal.classList.remove("show");
        });
        document.querySelectorAll(".filter-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                reportFilter = btn.dataset.filter;
                renderReports();
            });
        });
        document.querySelectorAll(".speed-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const id = btn.id;
                document.querySelectorAll(".speed-btn").forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                if (id === "speedPause") {
                    game.gamePaused = true;
                    game.gamePausedAt = Date.now();
                    game.gameSpeed = 0;
                } else {
                    game.gamePaused = false;
                    game.gameSpeed = id === "speed2x" ? 2 : 1;
                    game.lastTick = Date.now();
                }
                saveGame();
            });
        });
        if (dom.attackResolveBtn) dom.attackResolveBtn.addEventListener("click", () => {
            if (game.pendingAttack?.warning) {
                game.attackWarningDismissed = true;
                renderAll();
            } else {
                resolveAttackWave();
            }
        });
        if (dom.dungeonList) dom.dungeonList.addEventListener("click", handleDungeonClick);
        document.getElementById("equipmentList")?.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-craft]");
            if (!btn) return;
            if (craftEquipment(btn.dataset.craft)) {
                renderEquipment();
                renderAll();
                saveGame();
            }
        });

        dom.helpModal.addEventListener("click", (event) => {
            if (event.target === dom.helpModal) {
                closeHelpModal();
            }
        });
        dom.buildingModal.addEventListener("click", (event) => {
            if (event.target === dom.buildingModal) {
                closeBuildingModal();
            }
        });

        window.addEventListener("beforeunload", saveGame);
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "hidden") {
                saveGame();
            }
        });
    }

    function init() {
        cacheDomElements();
        const linkEl = document.getElementById("gameLink");
        if (linkEl) {
            linkEl.href = window.location.href;
            linkEl.title = "Link zum Spiel: " + window.location.href;
        }
        showTutorial();
        loadGame();
        ensureStartTimestamp();
        applyOfflineProgress();
        registerEventListeners();
        renderMap();
        switchTab(activeTab);
        renderAll();
        saveGame();
        setInterval(tick, TICK_INTERVAL_MS);
    }

    init();
})();
