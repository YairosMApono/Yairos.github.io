/**
 * @typedef {'wood'|'clay'|'iron'|'crop'} FieldType
 */

/** @type {{type:FieldType, name:string, icon:string, base:{wood:number,clay:number,iron:number,crop:number}, prodBase:number, prodFactor:number, help?:string}[]} */
export const FIELDS = [
  {
    type: "wood",
    name: "Holzfäller",
    icon: "🪵",
    base: { wood: 40, clay: 50, iron: 30, crop: 50 },
    prodBase: 25,
    prodFactor: 1.22,
    help: "Produziert Holz. Wird für fast alle Gebäude und Truppen benötigt.",
  },
  {
    type: "clay",
    name: "Lehmgrube",
    icon: "🧱",
    base: { wood: 40, clay: 50, iron: 30, crop: 50 },
    prodBase: 25,
    prodFactor: 1.22,
    help: "Produziert Lehm. Wichtig für Lagerhaus, Kaserne und Versammlungsplatz.",
  },
  {
    type: "iron",
    name: "Eisenmine",
    icon: "⚙️",
    base: { wood: 40, clay: 50, iron: 30, crop: 50 },
    prodBase: 25,
    prodFactor: 1.22,
    help: "Produziert Eisen. Stadtmauer und höhere Gebäude benötigen viel Eisen.",
  },
  {
    type: "crop",
    name: "Acker",
    icon: "🌾",
    base: { wood: 50, clay: 60, iron: 40, crop: 80 },
    prodBase: 20,
    prodFactor: 1.25,
    help: "Produziert Getreide. Teurer auszubauen, aber essentiell – Truppen verbrauchen Getreide!",
  },
];

/** @returns {{type:FieldType, level:number}[]} */
export function createInitialFields() {
  return [
    ...Array(4).fill("wood"),
    ...Array(4).fill("clay"),
    ...Array(4).fill("iron"),
    ...Array(6).fill("crop"),
  ].map((type) => ({ type, level: 0 }));
}

