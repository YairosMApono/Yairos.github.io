/**
 * Empire Builder – Spielkonfiguration
 * Alle Definitionen nutzen einheitlich: wood, clay, iron, crop
 */

const RESOURCE_KEYS = ['wood', 'clay', 'iron', 'crop'];
const RESOURCE_ICONS = { wood: '🪵', clay: '🧱', iron: '⚙️', crop: '🌾' };
const RESOURCE_NAMES = { wood: 'Holz', clay: 'Lehm', iron: 'Eisen', crop: 'Getreide' };

const BUILDINGS = {
    main: {
        name: 'Hauptgebäude',
        icon: '🏛️',
        desc: 'Reduziert Bau- und Rekrutierungszeiten um 5% pro Stufe. Ohne Voraussetzungen.',
        base: { wood: 70, clay: 40, iron: 60, crop: 20 },
        time: 8000,
        help: 'Zentrum des Dorfes. Jede Stufe verkürzt alle Bau- und Rekrutierungszeiten um 5%. Sollte zuerst ausgebaut werden.'
    },
    barracks: {
        name: 'Kaserne',
        icon: '⚔️',
        desc: 'Rekrutiere Infanterie. +10% Rekrutierungsgeschwindigkeit pro Stufe. Voraussetzung: Hauptgebäude St.1',
        base: { wood: 175, clay: 160, iron: 80, crop: 80 },
        time: 12000,
        help: 'Trainiert Miliz, Schwertkämpfer, Speerträger und Axtkämpfer. Höhere Kaserne = schnellere Rekrutierung.'
    },
    warehouse: {
        name: 'Lagerhaus',
        icon: '📦',
        desc: 'Speichert Holz, Lehm, Eisen. +2500 pro Stufe. Voraussetzung: Hauptgebäude St.1',
        base: { wood: 130, clay: 160, iron: 90, crop: 40 },
        time: 10000,
        help: 'Erhöht die maximale Menge an Holz, Lehm und Eisen. Ohne Ausbau kannst du keine großen Bauprojekte starten.'
    },
    granary: {
        name: 'Getreidespeicher',
        icon: '🌾',
        desc: 'Speichert Getreide. +2000 pro Stufe. Voraussetzung: Hauptgebäude St.1',
        base: { wood: 80, clay: 100, iron: 70, crop: 20 },
        time: 8000,
        help: 'Erhöht die maximale Getreide-Menge. Wichtig für Truppen-Rekrutierung.'
    },
    wall: {
        name: 'Stadtmauer',
        icon: '🧱',
        desc: 'Verteidigungsbonus. Voraussetzung: Hauptgebäude St.3, Versammlungsplatz St.1',
        base: { wood: 70, clay: 90, iron: 170, crop: 70 },
        time: 10000,
        help: 'Schützt dein Dorf. Benötigt Versammlungsplatz (für Koordination der Verteidiger).'
    },
    rally: {
        name: 'Versammlungsplatz',
        icon: '🏕️',
        desc: 'Ermöglicht 2. Bau-Queue. Voraussetzung: Hauptgebäude St.1, Kaserne St.1',
        base: { wood: 110, clay: 160, iron: 90, crop: 70 },
        time: 11000,
        help: 'Mit Versammlungsplatz kannst du 2 Gebäude/Felder/Truppen gleichzeitig bauen oder rekrutieren.'
    }
};

const FIELDS = [
    { type: 'wood', name: 'Holzfäller', icon: '🪵', base: { wood: 40, clay: 50, iron: 30, crop: 50 }, prodBase: 25, prodFactor: 1.22, help: 'Produziert Holz. Wird für fast alle Gebäude und Truppen benötigt.' },
    { type: 'clay', name: 'Lehmgrube', icon: '🧱', base: { wood: 40, clay: 50, iron: 30, crop: 50 }, prodBase: 25, prodFactor: 1.22, help: 'Produziert Lehm. Wichtig für Lagerhaus, Kaserne und Versammlungsplatz.' },
    { type: 'iron', name: 'Eisenmine', icon: '⚙️', base: { wood: 40, clay: 50, iron: 30, crop: 50 }, prodBase: 25, prodFactor: 1.22, help: 'Produziert Eisen. Stadtmauer und höhere Gebäude benötigen viel Eisen.' },
    { type: 'crop', name: 'Acker', icon: '🌾', base: { wood: 50, clay: 60, iron: 40, crop: 80 }, prodBase: 20, prodFactor: 1.25, help: 'Produziert Getreide. Teurer auszubauen, aber essentiell – Truppen verbrauchen Getreide!' }
];

const BUILD_REQS = {
    barracks: { main: 1 },
    warehouse: { main: 1 },
    granary: { main: 1 },
    wall: { main: 3, rally: 1 },
    rally: { main: 1, barracks: 1 }
};

const TROOPS = [
    { id: 'militia', name: 'Miliz', icon: '🛡️', cost: { wood: 60, clay: 70, iron: 40, crop: 20 }, time: 400, consume: 1, attack: 1, defense: 2 },
    { id: 'sword', name: 'Schwertkämpfer', icon: '⚔️', cost: { wood: 60, clay: 70, iron: 40, crop: 20 }, time: 500, consume: 1, attack: 3, defense: 2 },
    { id: 'spear', name: 'Speerträger', icon: '🔱', cost: { wood: 50, clay: 60, iron: 30, crop: 60 }, time: 450, consume: 1, attack: 2, defense: 3 },
    { id: 'axe', name: 'Axtkämpfer', icon: '🪓', cost: { wood: 60, clay: 70, iron: 40, crop: 20 }, time: 600, consume: 2, attack: 4, defense: 1 }
];

const HELP_TEXTS = {
    resources: 'Rohstoffe: Holz, Lehm, Eisen, Getreide.\n\nProduktion: Rohstofffelder erzeugen pro Stunde. Die Zahl zeigt +X/h.\n\nSpeicher: Lagerhaus (Holz/Lehm/Eisen) und Getreidespeicher begrenzen die Kapazität.\n\nVerbrauch: Truppen verbrauchen Getreide pro Stunde. Wenn Verbrauch > Produktion, sinkt der Getreide-Vorrat.',
    map: 'Weltkarte: Dein Dorf ist in der Mitte (🏰). Klicke darauf, um zum Dorf-Tab zu wechseln und Gebäude/Felder auszubauen.\n\nDie umliegenden Felder können später für weitere Dörfer genutzt werden.',
    village: 'Dorfzentrum: 6 Gebäude-Plätze.\n\n• Hauptgebäude: Reduziert Bauzeiten\n• Kaserne: Truppen rekrutieren\n• Lagerhaus: Speicher für Holz, Lehm, Eisen\n• Getreidespeicher: Speicher für Getreide\n• Stadtmauer: Verteidigung\n• Versammlungsplatz: 2. Bau-Queue\n\nRohstofffelder: 4× Holzfäller, 4× Lehmgrube, 4× Eisenmine, 6× Acker. Klicken zum Ausbauen.',
    fields: 'Rohstofffelder produzieren kontinuierlich:\n\n• Holzfäller → Holz\n• Lehmgrube → Lehm\n• Eisenmine → Eisen\n• Acker → Getreide\n\nJede Stufe erhöht die Produktion. Acker sind teurer (mehr Getreide-Kosten), da Getreide der limitierende Faktor ist.',
    troops: 'Truppen rekrutieren: Benötigt Kaserne.\n\nJede Einheit verbraucht Getreide pro Stunde (steht bei jedem Typ). Achte darauf, dass deine Getreide-Produktion den Verbrauch deckt.\n\nHauptgebäude und Kaserne beschleunigen die Rekrutierung.',
    reports: 'Berichte protokollieren alle Aktionen: Bauabschlüsse, Rekrutierungen, Warnungen. Die neuesten stehen oben.'
};

const DEFAULT_FIELDS = [
    ...Array(4).fill('wood'),
    ...Array(4).fill('clay'),
    ...Array(4).fill('iron'),
    ...Array(6).fill('crop')
].map(type => ({ type, level: 0 }));

const START_RESOURCES = { wood: 750, clay: 750, iron: 750, crop: 750 };
const TICK_INTERVAL_MS = 100;
const DAY_DURATION_MS = 90000;
