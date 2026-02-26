# Empire Builder – Architektur

## Projektstruktur

```
/workspace
├── index.html          # Einstiegspunkt, HTML-Struktur
├── css/
│   └── style.css       # Design System, Layout, Komponenten
├── js/
│   ├── config.js       # Spielkonstanten (Gebäude, Felder, Truppen)
│   ├── game.js         # Spiel-Logik (Tick, Ressourcen, Queue)
│   └── ui.js           # UI-Rendering, Modals, Tabs
├── docs/
│   ├── README.md       # Projektübersicht
│   ├── ARCHITECTURE.md # Diese Datei
│   ├── GAMEPLAY.md     # Spielmechaniken
│   └── DESIGN.md       # Design-System
└── .github/workflows/
    └── deploy-pages.yml
```

## Technologie-Stack

- **HTML5** – Semantisches Markup
- **CSS3** – Design System mit CSS-Variablen, Flexbox, Grid
- **Vanilla JavaScript** – Keine Frameworks, ES6+
- **localStorage** – Persistenz

## Datenfluss

1. **Config** (`config.js`) – Statische Definitionen
2. **Game State** (`game.js`) – `game`-Objekt, `load()`, `save()`, `tick()`
3. **UI** (`ui.js`) – `updateUI()`, `render*()`, Event-Handler

## Ressourcen-Schlüssel

Einheitliche Verwendung: `wood`, `clay`, `iron`, `crop` (keine Abkürzungen wie w/c/i/r).
