/**
 * @typedef {'main'|'barracks'|'warehouse'|'granary'|'wall'|'rally'} BuildingId
 */

/** @type {Record<BuildingId, {name:string, icon:string, desc:string, base:{wood:number,clay:number,iron:number,crop:number}, timeMs:number, help?:string}>} */
export const BUILDINGS = {
  main: {
    name: "Hauptgebäude",
    icon: "🏛️",
    desc: "Reduziert Bau- und Rekrutierungszeiten um 5% pro Stufe. Ohne Voraussetzungen.",
    base: { wood: 70, clay: 40, iron: 60, crop: 20 },
    timeMs: 8000,
    help: "Zentrum des Dorfes. Jede Stufe verkürzt alle Bau- und Rekrutierungszeiten um 5%. Sollte zuerst ausgebaut werden.",
  },
  barracks: {
    name: "Kaserne",
    icon: "⚔️",
    desc: "Rekrutiere Infanterie. +10% Rekrutierungsgeschwindigkeit pro Stufe. Voraussetzung: Hauptgebäude St.1",
    base: { wood: 175, clay: 160, iron: 80, crop: 80 },
    timeMs: 12000,
    help: "Trainiert Miliz, Schwertkämpfer, Speerträger und Axtkämpfer. Höhere Kaserne = schnellere Rekrutierung.",
  },
  warehouse: {
    name: "Lagerhaus",
    icon: "📦",
    desc: "Speichert Holz, Lehm, Eisen. +2500 pro Stufe. Voraussetzung: Hauptgebäude St.1",
    base: { wood: 130, clay: 160, iron: 90, crop: 40 },
    timeMs: 10000,
    help: "Erhöht die maximale Menge an Holz, Lehm und Eisen. Ohne Ausbau kannst du keine großen Bauprojekte starten.",
  },
  granary: {
    name: "Getreidespeicher",
    icon: "🌾",
    desc: "Speichert Getreide. +2000 pro Stufe. Voraussetzung: Hauptgebäude St.1",
    base: { wood: 80, clay: 100, iron: 70, crop: 20 },
    timeMs: 8000,
    help: "Erhöht die maximale Getreide-Menge. Wichtig für Truppen-Rekrutierung.",
  },
  wall: {
    name: "Stadtmauer",
    icon: "🧱",
    desc: "Verteidigungsbonus. Voraussetzung: Hauptgebäude St.3, Versammlungsplatz St.1",
    base: { wood: 70, clay: 90, iron: 170, crop: 70 },
    timeMs: 10000,
    help: "Schützt dein Dorf. Benötigt Versammlungsplatz (für Koordination der Verteidiger).",
  },
  rally: {
    name: "Versammlungsplatz",
    icon: "🏕️",
    desc: "Ermöglicht 2. Bau-Queue. Voraussetzung: Hauptgebäude St.1, Kaserne St.1",
    base: { wood: 110, clay: 160, iron: 90, crop: 70 },
    timeMs: 11000,
    help: "Mit Versammlungsplatz kannst du 2 Gebäude/Felder/Truppen gleichzeitig bauen oder rekrutieren.",
  },
};

/** @type {Record<BuildingId, Partial<Record<BuildingId, number>>>} */
export const BUILD_REQS = {
  main: {},
  barracks: { main: 1 },
  warehouse: { main: 1 },
  granary: { main: 1 },
  wall: { main: 3, rally: 1 },
  rally: { main: 1, barracks: 1 },
};

