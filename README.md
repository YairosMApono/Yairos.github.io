# Empire Builder

Ein browserbasiertes Einzelspieler-Strategiespiel (HTML/CSS/Vanilla JS) mit Fokus auf:

- saubere Projektstruktur,
- konsistente Datenmodelle,
- performante Spielschleife,
- nachvollziehbares Balancing.

## Projektstruktur

```text
.
├── index.html             # Struktur/Markup der UI
├── assets
│   ├── styles.css         # Design-System + responsive UI
│   └── game.js            # Game Engine, State, Rendering, Events
└── docs
    └── ARCHITEKTUR.md     # Technische Details und Definitionsregeln
```

## Was wurde verbessert?

### 1) Code-Struktur (Best Practice)

- Trennung von **Struktur (HTML)**, **Design (CSS)** und **Logik (JS)**.
- Entfernung von Inline-`onclick`-Handlern zugunsten zentraler Event-Listener.
- Klare Datenkonstanten (`BUILDINGS`, `FIELDS`, `TROOPS`, `OBJECTIVES`).
- Savegame-Normalisierung und Migrationslogik für alte Datenformate.

### 2) Korrekte Definitionen

Alle Ressourcen verwenden nun konsistente Schluessel:

- `wood`, `clay`, `iron`, `crop`

Dadurch sind Kosten-, Bau- und Rekrutierungspruefungen korrekt und stabil.

### 3) Design-Optimierung

- Einheitliches Card-/Pill-Design in `styles.css`.
- Verbesserte Focus-States (`:focus-visible`) fuer Bedienbarkeit.
- Mobile-Optimierung und Reduktion visueller Inkonsistenzen.
- Statuskarten fuer Oekonomie + aktives Ziel.

### 4) Gameplay-Weiterentwicklung

- **Auftragswarteschlange mit Planung** (bis zu 8 Auftraege, 1-2 aktive Slots).
- **Zielsystem** mit automatischen Belohnungen.
- **Weltereignisse** (zyklisch, abhaengig vom Ingame-Tag).
- **Hungersnot-Mechanik**: Desertion bei negativer Getreidebilanz und leerem Speicher.
- **Offline-Fortschritt** (bis zu 8 Stunden) inkl. Queues und Oekonomie.

### 5) Performance

- Tickrate auf 250ms mit periodischem Speichern (statt Dauer-Speicherung pro Tick).
- Begrenzte und normalisierte Report-Historie.

## Lokaler Start

Das Projekt benoetigt keinen Build-Schritt. Einfach `index.html` im Browser oeffnen
oder statisch ausliefern (z. B. via GitHub Pages).

## Hinweise fuer Balancing/Technik

Weitere Details zu Formeln, Spielzustand und Regeln stehen in:

- [`docs/ARCHITEKTUR.md`](docs/ARCHITEKTUR.md)
