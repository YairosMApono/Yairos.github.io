/**
 * Empire Builder - Spielkonfiguration
 * Zentrale Definition aller Spielkonstanten und Balancing-Parameter
 */

export const MAX_LEVEL = 20;
export const SAVE_KEY = 'empire-game';
export const START_KEY = 'empire-start';
export const TICK_INTERVAL = 100;
export const DAY_DURATION = 90000;
export const MAX_REPORTS = 80;

export const START_RESOURCES = { wood: 750, clay: 750, iron: 750, crop: 750 };

export const BASE_STORAGE = { warehouse: 2000, granary: 2000 };
export const STORAGE_PER_LEVEL = { warehouse: 2500, granary: 2000 };

export const COST_FACTOR = 1.55;
export const BUILD_TIME_FACTOR = 1.5;
export const MAIN_SPEED_BONUS = 0.05;
export const BARRACKS_SPEED_BONUS = 0.10;
export const WALL_DEF_BONUS = 0.03;
export const FIELD_BASE_TIME = 6000;

export const RESOURCE_NAMES = {
    wood: 'Holz', clay: 'Lehm', iron: 'Eisen', crop: 'Getreide'
};

export const COST_ICONS = { w: '🪵', c: '🧱', i: '⚙️', r: '🌾' };
export const COST_TO_RES = { w: 'wood', c: 'clay', i: 'iron', r: 'crop' };

export const BUILDINGS = {
    main: {
        name: 'Hauptgebäude',
        icon: '🏛️',
        desc: 'Reduziert Bau- und Rekrutierungszeiten um 5% pro Stufe.',
        base: { w: 70, c: 40, i: 60, r: 20 },
        time: 8000,
        points: 10,
        help: 'Zentrum des Dorfes. Jede Stufe verkürzt alle Bau- und Rekrutierungszeiten um 5%. Sollte zuerst ausgebaut werden.'
    },
    barracks: {
        name: 'Kaserne',
        icon: '⚔️',
        desc: 'Rekrutiere Infanterie. +10% Rekrutierungsgeschwindigkeit pro Stufe.',
        base: { w: 175, c: 160, i: 80, r: 80 },
        time: 12000,
        points: 12,
        help: 'Trainiert Miliz, Schwertkämpfer, Speerträger und Axtkämpfer. Höhere Kaserne = schnellere Rekrutierung.'
    },
    warehouse: {
        name: 'Lagerhaus',
        icon: '📦',
        desc: 'Speichert Holz, Lehm und Eisen. +2.500 Kapazität pro Stufe.',
        base: { w: 130, c: 160, i: 90, r: 40 },
        time: 10000,
        points: 8,
        help: 'Erhöht die maximale Menge an Holz, Lehm und Eisen um 2.500 pro Stufe.'
    },
    granary: {
        name: 'Getreidespeicher',
        icon: '🌾',
        desc: 'Speichert Getreide. +2.000 Kapazität pro Stufe.',
        base: { w: 80, c: 100, i: 70, r: 20 },
        time: 8000,
        points: 8,
        help: 'Erhöht die maximale Getreide-Menge um 2.000 pro Stufe. Wichtig für Truppen-Versorgung.'
    },
    wall: {
        name: 'Stadtmauer',
        icon: '🧱',
        desc: 'Verteidigungsbonus +3% pro Stufe für alle stationierten Truppen.',
        base: { w: 70, c: 90, i: 170, r: 70 },
        time: 10000,
        points: 15,
        help: 'Schützt dein Dorf. Jede Stufe gibt +3% Verteidigungsbonus für alle stationierten Truppen.'
    },
    rally: {
        name: 'Versammlungsplatz',
        icon: '🏕️',
        desc: 'Schaltet die 2. Bau-Queue frei. Bau zwei Projekte gleichzeitig!',
        base: { w: 110, c: 160, i: 90, r: 70 },
        time: 11000,
        points: 12,
        help: 'Mit Versammlungsplatz kannst du 2 Gebäude/Felder/Truppen gleichzeitig bauen oder rekrutieren.'
    }
};

export const BUILD_REQS = {
    main: {},
    barracks: { main: 1 },
    warehouse: { main: 1 },
    granary: { main: 1 },
    wall: { main: 3, rally: 1 },
    rally: { main: 1, barracks: 1 }
};

export const FIELDS = [
    {
        type: 'wood', name: 'Holzfäller', icon: '🪵',
        base: { w: 40, c: 50, i: 30, r: 50 },
        prodBase: 25, prodFactor: 1.22, points: 5,
        help: 'Produziert Holz. Wird für fast alle Gebäude und Truppen benötigt.'
    },
    {
        type: 'clay', name: 'Lehmgrube', icon: '🧱',
        base: { w: 40, c: 50, i: 30, r: 50 },
        prodBase: 25, prodFactor: 1.22, points: 5,
        help: 'Produziert Lehm. Wichtig für Lagerhaus, Kaserne und Versammlungsplatz.'
    },
    {
        type: 'iron', name: 'Eisenmine', icon: '⚙️',
        base: { w: 40, c: 50, i: 30, r: 50 },
        prodBase: 25, prodFactor: 1.22, points: 5,
        help: 'Produziert Eisen. Stadtmauer und höhere Gebäude benötigen viel Eisen.'
    },
    {
        type: 'crop', name: 'Acker', icon: '🌾',
        base: { w: 50, c: 60, i: 40, r: 80 },
        prodBase: 20, prodFactor: 1.25, points: 5,
        help: 'Produziert Getreide. Teurer auszubauen, aber essentiell – Truppen verbrauchen Getreide!'
    }
];

export const TROOPS = [
    {
        id: 'militia', name: 'Miliz', icon: '🛡️',
        cost: { w: 35, c: 30, i: 20, r: 15 },
        time: 300, consume: 1,
        attack: 30, defInf: 45, defCav: 30, speed: 7,
        points: 1,
        help: 'Günstige Allround-Einheit mit solider Verteidigung. Ideal für den Spielstart.'
    },
    {
        id: 'sword', name: 'Schwertkämpfer', icon: '⚔️',
        cost: { w: 60, c: 70, i: 40, r: 20 },
        time: 500, consume: 1,
        attack: 65, defInf: 35, defCav: 25, speed: 5,
        points: 2,
        help: 'Starker Angreifer mit hohem Angriffsschaden. Mittelklasse-Verteidigung.'
    },
    {
        id: 'spear', name: 'Speerträger', icon: '🔱',
        cost: { w: 50, c: 30, i: 30, r: 60 },
        time: 450, consume: 1,
        attack: 25, defInf: 70, defCav: 55, speed: 6,
        points: 2,
        help: 'Defensiv-Spezialist. Beste Verteidigung gegen Infanterie und Kavallerie.'
    },
    {
        id: 'axe', name: 'Axtkämpfer', icon: '🪓',
        cost: { w: 70, c: 50, i: 60, r: 20 },
        time: 600, consume: 2,
        attack: 80, defInf: 20, defCav: 15, speed: 5,
        points: 3,
        help: 'Schwerer Angreifer mit maximalem Schaden. Sehr schwache Verteidigung.'
    }
];

export const FIELD_LAYOUT = [
    ...Array(4).fill('wood'),
    ...Array(4).fill('clay'),
    ...Array(4).fill('iron'),
    ...Array(6).fill('crop')
];

export const BUILDING_SLOTS = ['main', 'barracks', 'warehouse', 'granary', 'wall', 'rally'];

export const MILESTONES = [
    { id: 'first_build', check: g => Object.values(g.buildings).some(v => v >= 2), text: '🏗️ Erster Gebäudeausbau abgeschlossen!' },
    { id: 'barracks_built', check: g => g.buildings.barracks >= 1, text: '🏰 Kaserne errichtet!' },
    { id: 'first_troops', check: g => Object.values(g.troops).some(v => v > 0), text: '⚔️ Erste Truppen rekrutiert!' },
    { id: 'rally_built', check: g => g.buildings.rally >= 1, text: '🏕️ Versammlungsplatz gebaut – 2. Bau-Queue freigeschaltet!' },
    { id: 'wall_built', check: g => g.buildings.wall >= 1, text: '🧱 Stadtmauer errichtet!' },
    { id: 'all_fields_2', check: g => g.fields.every(f => f.level >= 2), text: '🌿 Alle Rohstofffelder auf Stufe 2!' },
    { id: 'all_buildings', check: g => Object.values(g.buildings).every(v => v >= 1), text: '🏛️ Alle Gebäude errichtet!' },
    { id: 'all_fields_5', check: g => g.fields.every(f => f.level >= 5), text: '🌾 Alle Felder auf Stufe 5 – Meisterfarmer!' },
    { id: 'army_10', check: g => Object.values(g.troops).reduce((s, v) => s + v, 0) >= 10, text: '🛡️ 10 Truppen unter deinem Kommando!' },
    { id: 'army_50', check: g => Object.values(g.troops).reduce((s, v) => s + v, 0) >= 50, text: '⚔️ 50 Truppen – Eine beachtliche Armee!' },
    { id: 'main_10', check: g => g.buildings.main >= 10, text: '🏛️ Hauptgebäude Stufe 10 – Imposante Infrastruktur!' },
    { id: 'score_100', check: (g, s) => s >= 100, text: '⭐ 100 Punkte erreicht!' },
    { id: 'score_500', check: (g, s) => s >= 500, text: '🌟 500 Punkte erreicht!' },
    { id: 'score_1000', check: (g, s) => s >= 1000, text: '💫 1.000 Punkte erreicht!' }
];

export const HELP_TEXTS = {
    resources: 'Rohstoffe: Holz 🪵, Lehm 🧱, Eisen ⚙️, Getreide 🌾\n\nProduktion: Rohstofffelder erzeugen Rohstoffe pro Stunde. Die Zahl zeigt +X/h an.\n\nSpeicher: Lagerhaus (Holz/Lehm/Eisen) und Getreidespeicher begrenzen die Kapazität. Der Balken unter jeder Ressource zeigt die Auslastung.\n\nVerbrauch: Truppen verbrauchen Getreide pro Stunde. Wenn Verbrauch > Produktion, sinkt dein Vorrat!',
    map: 'Weltkarte: Dein Dorf ist in der Mitte (🏰).\n\nKlicke darauf, um zum Dorf-Tab zu wechseln und Gebäude/Felder auszubauen.\n\nDie umliegenden Felder zeigen die Umgebung deines Dorfes.',
    village: 'Dorfzentrum: 6 Gebäude-Plätze\n\n• Hauptgebäude 🏛️: Reduziert Bauzeiten (5%/Stufe)\n• Kaserne ⚔️: Truppen rekrutieren\n• Lagerhaus 📦: Speicher für Holz, Lehm, Eisen\n• Getreidespeicher 🌾: Speicher für Getreide\n• Stadtmauer 🧱: Verteidigungsbonus (3%/Stufe)\n• Versammlungsplatz 🏕️: 2. Bau-Queue\n\nRohstofffelder: 4× Holzfäller, 4× Lehmgrube, 4× Eisenmine, 6× Acker',
    fields: 'Rohstofffelder produzieren kontinuierlich:\n\n• Holzfäller 🪵 → Holz\n• Lehmgrube 🧱 → Lehm\n• Eisenmine ⚙️ → Eisen\n• Acker 🌾 → Getreide\n\nJede Stufe erhöht die Produktion. Acker sind teurer, da Getreide der limitierende Faktor ist (Truppen-Verbrauch!).',
    troops: 'Truppen rekrutieren: Benötigt Kaserne.\n\nJede Einheit hat eigene Werte:\n• ⚔️ Angriff – Offensive Stärke\n• 🛡️ Verteidigung – Defensive Stärke\n• 🌾 Verbrauch – Getreide pro Stunde\n\nTruppen-Rollen:\n• Miliz: Günstig, gute Verteidigung\n• Schwertkämpfer: Starker Angriff\n• Speerträger: Beste Verteidigung\n• Axtkämpfer: Maximaler Angriff, schwache Verteidigung',
    reports: 'Berichte protokollieren alle Aktionen:\n\n✅ Bauabschlüsse\n📋 Rekrutierungen\n⚠️ Warnungen\n⭐ Meilensteine\n\nDie neuesten Berichte stehen oben.'
};
