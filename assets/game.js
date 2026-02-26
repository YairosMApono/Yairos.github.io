(() => {
    "use strict";

    const STORAGE_KEY = "empire-game";
    const START_KEY = "empire-start";
    const SAVE_VERSION = 2;

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
    };

    const BUILDING_ORDER = ["main", "barracks", "warehouse", "granary", "wall", "rally"];

    const BUILD_REQS = {
        barracks: { main: 1 },
        warehouse: { main: 1 },
        granary: { main: 1 },
        wall: { main: 3, rally: 1 },
        rally: { main: 1, barracks: 1 },
    };

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
        {
            id: "militia",
            name: "Miliz",
            icon: "🛡️",
            cost: { wood: 60, clay: 70, iron: 40, crop: 20 },
            trainSeconds: 400,
            consume: 1,
        },
        {
            id: "sword",
            name: "Schwertkaempfer",
            icon: "⚔️",
            cost: { wood: 60, clay: 70, iron: 40, crop: 20 },
            trainSeconds: 500,
            consume: 1,
        },
        {
            id: "spear",
            name: "Speertraeger",
            icon: "🔱",
            cost: { wood: 50, clay: 60, iron: 30, crop: 60 },
            trainSeconds: 450,
            consume: 1,
        },
        {
            id: "axe",
            name: "Axtkaempfer",
            icon: "🪓",
            cost: { wood: 60, clay: 70, iron: 40, crop: 20 },
            trainSeconds: 600,
            consume: 2,
        },
    ];
    const TROOPS_BY_ID = Object.fromEntries(TROOPS.map((troop) => [troop.id, troop]));

    const OBJECTIVES = [
        {
            id: "main-3",
            title: "Verwaltung staerken",
            desc: "Baue das Hauptgebaeude auf Stufe 3.",
            reward: { wood: 280, clay: 280, iron: 280, crop: 220 },
            isComplete: (state) => (state.buildings.main || 0) >= 3,
        },
        {
            id: "crop-plus-60",
            title: "Stabile Versorgung",
            desc: "Erreiche mindestens +60 Netto-Getreide pro Stunde.",
            reward: { wood: 180, clay: 180, iron: 120, crop: 360 },
            isComplete: (state) => getNetCropPerHour(state) >= 60,
        },
        {
            id: "army-20",
            title: "Kleine Armee",
            desc: "Rekrutiere insgesamt 20 Truppen.",
            reward: { wood: 300, clay: 250, iron: 320, crop: 260 },
            isComplete: (state) => getTotalTroops(state) >= 20,
        },
    ];

    const WORLD_EVENTS = [
        {
            id: "harvest-festival",
            title: "Erntefest",
            summary: "+450 Getreide",
            apply: (state) => addResources({ crop: 450 }, state),
        },
        {
            id: "craftsman-boom",
            title: "Handwerksboom",
            summary: "+240 Holz, +240 Lehm, +240 Eisen",
            apply: (state) => addResources({ wood: 240, clay: 240, iron: 240 }, state),
        },
        {
            id: "bandit-raid",
            title: "Raubzug",
            summary: "Bis zu 8% Holz, Lehm und Eisen verloren",
            apply: (state) => {
                const factor = 0.08;
                ["wood", "clay", "iron"].forEach((resourceKey) => {
                    const loss = Math.floor(state.resources[resourceKey] * factor);
                    state.resources[resourceKey] = Math.max(0, state.resources[resourceKey] - loss);
                });
            },
        },
    ];

    const HELP_TEXTS = {
        resources:
            "Rohstoffe: Holz, Lehm, Eisen, Getreide.\n\nProduktion entsteht durch Felder, Verbrauch durch Truppen.\n\nLagerhaus und Getreidespeicher begrenzen die maximale Kapazitaet.",
        map:
            "Die Weltkarte zeigt dein Startdorf in der Mitte (🏰).\n\nKlicke auf dein Dorf, um zum Dorfbereich zu wechseln.",
        village:
            "Im Dorfzentrum baust du Gebaeude und Rohstofffelder aus.\n\nAchte auf Voraussetzungen und Kapazitaeten.",
        fields:
            "Rohstofffelder produzieren kontinuierlich.\n\nJede Stufe erhoeht Produktion und Ausbaukosten.",
        troops:
            "Truppen benoetigen Kaserne und verbrauchen Getreide pro Stunde.\n\nNegative Getreidebilanz kann zu Desertion fuehren.",
        reports:
            "Berichte protokollieren Bauabschluesse, Rekrutierungen, Ziele und Weltereignisse.",
        objectives:
            "Ziele geben strukturierte Fortschritte vor.\n\nBeim Abschluss wird die Belohnung automatisch gutgeschrieben.",
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
            resources: { wood: 750, clay: 750, iron: 750, crop: 750 },
            buildings: { main: 1, barracks: 0, warehouse: 0, granary: 0, wall: 0, rally: 0 },
            fields: FIELD_LAYOUT.map((type) => ({ type, level: 1 })),
            troops: { militia: 0, sword: 0, spear: 0, axe: 0 },
            queue: [],
            reports: [],
            day: 1,
            lastTick: Date.now(),
            lastEventDay: 0,
            starvationSeconds: 0,
            objectives: Object.fromEntries(OBJECTIVES.map((objective) => [objective.id, false])),
        };
    }

    function normalizeResourceBundle(rawBundle) {
        const raw = rawBundle && typeof rawBundle === "object" ? rawBundle : {};
        return {
            wood: Math.max(0, asNumber(raw.wood ?? raw.w, 0)),
            clay: Math.max(0, asNumber(raw.clay ?? raw.c, 0)),
            iron: Math.max(0, asNumber(raw.iron ?? raw.i, 0)),
            crop: Math.max(0, asNumber(raw.crop ?? raw.r, 0)),
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
            }))
            .filter((report) => report.text);
    }

    function normalizeObjectives(rawObjectives) {
        const normalized = Object.fromEntries(OBJECTIVES.map((objective) => [objective.id, false]));
        if (!rawObjectives || typeof rawObjectives !== "object") {
            return normalized;
        }
        OBJECTIVES.forEach((objective) => {
            normalized[objective.id] = Boolean(rawObjectives[objective.id]);
        });
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
                queue: game.queue,
                day: game.day,
                lastTick: game.lastTick,
                lastEventDay: game.lastEventDay,
                starvationSeconds: game.starvationSeconds,
                objectives: game.objectives,
                reports: game.reports.slice(-MAX_REPORTS),
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
        return Object.values(state.troops).reduce((sum, count) => sum + count, 0);
    }

    function canAfford(cost) {
        return RESOURCE_KEYS.every((resourceKey) => game.resources[resourceKey] >= cost[resourceKey]);
    }

    function spendResources(cost) {
        RESOURCE_KEYS.forEach((resourceKey) => {
            game.resources[resourceKey] = Math.max(0, game.resources[resourceKey] - asNumber(cost[resourceKey], 0));
        });
    }

    function addResources(resourceBundle, state = game) {
        const caps = getStorageCapacity(state);
        RESOURCE_KEYS.forEach((resourceKey) => {
            const delta = asNumber(resourceBundle[resourceKey], 0);
            state.resources[resourceKey] = Math.max(
                0,
                Math.min(caps[resourceKey], state.resources[resourceKey] + delta)
            );
        });
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

    function addReport(text) {
        game.reports.push({
            text,
            time: new Date().toLocaleString("de-DE"),
        });
        if (game.reports.length > MAX_REPORTS) {
            game.reports = game.reports.slice(-MAX_REPORTS);
        }
    }

    function formatResourceList(resourceBundle) {
        return RESOURCE_KEYS.filter((resourceKey) => asNumber(resourceBundle[resourceKey], 0) > 0)
            .map((resourceKey) => `${RESOURCE_ICONS[resourceKey]} ${Math.floor(resourceBundle[resourceKey])}`)
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
                maybeTriggerWorldEvent(day);
            }
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
        addReport(`Weltereignis (Tag ${day}): ${event.title} - ${event.summary}.`);
    }

    function evaluateObjectives() {
        let changed = false;
        OBJECTIVES.forEach((objective) => {
            if (game.objectives[objective.id]) {
                return;
            }
            if (!objective.isComplete(game)) {
                return;
            }

            game.objectives[objective.id] = true;
            addResources(objective.reward);
            addReport(`Ziel erreicht: ${objective.title}. Belohnung: ${formatResourceList(objective.reward)}.`);
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

        addReport(`${item.name} abgeschlossen.`);
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
        const now = Date.now();
        const deltaSeconds = Math.max(0, (now - game.lastTick) / 1_000);
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
        for (let index = 0; index < 49; index += 1) {
            const tile = document.createElement("button");
            tile.type = "button";
            tile.dataset.index = String(index);
            tile.className = `map-tile ${index === 24 ? "village" : "empty"}`;
            tile.setAttribute("aria-label", index === 24 ? "Eigenes Dorf" : "Leeres Kartenfeld");
            dom.mapGrid.appendChild(tile);
        }
    }

    function renderVillage() {
        dom.villageLayout.innerHTML = BUILDING_ORDER.map((buildingId) => {
            const building = BUILDINGS[buildingId];
            const level = game.buildings[buildingId] || 0;
            return `
                <button type="button" class="building-slot ${level ? "" : "empty"}" data-building-id="${buildingId}">
                    <span class="icon">${building.icon}</span>
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
            const canPayOne = canAfford(troop.cost);
            const buttonDisabled = !canTrain || queueFull || !canPayOne;

            return `
                <article class="troop-card">
                    <div class="icon">${troop.icon}</div>
                    <div class="name">${troop.name}</div>
                    <div class="count">${owned} Einheiten</div>
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

        dom.reportList.innerHTML = game.reports
            .slice()
            .reverse()
            .map(
                (report) => `
                    <article class="report">
                        <div class="time">${report.time}</div>
                        <p>${report.text}</p>
                    </article>
                `
            )
            .join("");
    }

    function renderObjectives() {
        dom.objectiveList.innerHTML = OBJECTIVES.map((objective) => {
            const completed = game.objectives[objective.id];
            return `
                <article class="objective-item ${completed ? "completed" : ""}">
                    <h4>${objective.title}</h4>
                    <p>${objective.desc}</p>
                    <small>${completed ? "Belohnung erhalten." : `Belohnung: ${formatResourceList(objective.reward)}`}</small>
                </article>
            `;
        }).join("");

        const nextObjective = OBJECTIVES.find((objective) => !game.objectives[objective.id]);
        dom.activeObjectiveSummary.textContent = nextObjective
            ? `${nextObjective.title}: ${nextObjective.desc}`
            : "Alle Ziele abgeschlossen.";
    }

    function renderCurrentTab() {
        if (activeTab === "village") {
            renderVillage();
        } else if (activeTab === "troops") {
            renderTroops();
        } else if (activeTab === "reports") {
            renderReports();
        }
    }

    function renderAll() {
        renderResourceBar();
        renderQueue();
        renderObjectives();
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
        const confirmed = window.confirm("Neues Spiel starten? Fortschritt geht verloren.");
        if (!confirmed) {
            return;
        }
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(START_KEY);
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
        if (!tile) {
            return;
        }
        const index = Math.floor(asNumber(tile.dataset.index, -1));
        if (index === 24) {
            switchTab("village");
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
        if (!button) {
            return;
        }
        trainTroop(button.dataset.trainId);
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
