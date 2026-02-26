# Architektur

## Ziele

- **Single Source of Truth** für alle Game-Definitionen (Ressourcen/Kosten/IDs).
- **Entkoppelung** von Daten, Simulation und UI.
- **Performanz**: segmentweise Simulation, Save-Throttling, minimale DOM-Updates.
- **Robustheit**: Migration alter Spielstände + Fail-Fast Validierung.

## Layering

### `src/data/*`

Statische Definitionen:

- `resources.js`: Ressourcen-IDs (`wood`, `clay`, `iron`, `crop`) + Meta (Icon/Label)
- `buildings.js`: Gebäude + Voraussetzungen
- `fields.js`: Feldtypen + Produktionsparameter
- `troops.js`: Truppentypen + Kosten/Verbrauch

### `src/game/*`

Simulation & Regeln:

- `balance.js`: Kosten-/Zeitformeln, Produktion, Storage Cap, Verbrauch, Queue-Slots
- `actions.js`: Enqueue-Logik (Bau/Feld/Truppe) inkl. Checks
- `simulate.js`: Zeitfortschritt (Ressourcen + Queue) segmentweise bis zum nächsten Abschluss
- `engine.js`: Tick-Loop (Interval), ruft `simulateTime` auf

### `src/ui/*`

Darstellung/Interaktion:

- `render.js`: Render-Funktionen pro Tab + Resource-Bar + Queue
- `modals.js`: Ausbau-Modals (Gebäude/Feld)
- `help.js`: Hilfe-Overlay (data-help + modal-intern)

### `src/storage/*`

- `persistence.js`: LocalStorage Load/Save + Migration (legacy `w/c/i/r` → `wood/clay/iron/crop`)

### `src/validate/*`

- `validate.js`: Laufzeit-Checks für Definitionen (verhindert „stille“ Inkonsistenzen)

## Zustandsmodell (High-Level)

Der Spielzustand ist ein JSON-Objekt, das vollständig in `localStorage` unter `empire-game` gespeichert wird (Schema-Version 2).

Wichtige Felder:

- `resources`: aktueller Bestand (float intern, gerundet in UI)
- `buildings`, `fields`, `troops`: Level/Counts
- `queue`: maximal 1–2 parallele Einträge (abhängig von `rally`)
- `reports`: letzte 80 Ereignisse
- `lastSavedEpochMs`: Basis für Offline-Fortschritt

## Offline-Fortschritt

Beim Start wird Zeit seit `lastSavedEpochMs` simuliert (cap bei 12h).  
Simulation läuft **segmentweise** (bis zum nächsten Queue-Abschluss), damit Produktion/Storage nach Upgrades korrekt „mitwachsen“.

