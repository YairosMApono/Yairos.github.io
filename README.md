# Empire Builder (Singleplayer)

Browser-basiertes Strategie-Spiel (GitHub Pages, ohne Build-Tooling).  
Ziel: saubere Code-Struktur, konsistente Definitionen (Ressourcen/Kosten), performantes Tick-/Queue-System, und nachvollziehbare Dokumentation.

## Projektstruktur

- `index.html`: UI-Markup, lädt CSS + ES-Module
- `assets/styles.css`: Design-System + UI-Styles
- `src/`
  - `data/`: **Definitionen** (Gebäude, Felder, Truppen, Ressourcen)
  - `game/`: Simulation (Produktion, Storage, Queue, Aktionen)
  - `ui/`: Rendering + Modals/Hilfe
  - `storage/`: LocalStorage Persistenz + Migration
  - `validate/`: Laufzeit-Validierung der Definitionen (Fail-Fast)
- `docs/`: Markdown-Dokumentation (Architektur, Gameplay, Design, Glossar)

## Lokales Starten

Das Projekt ist statisch. Du kannst es z. B. so starten:

```bash
python3 -m http.server 8080
```

Dann im Browser öffnen (Pfad hängt von deinem Setup ab).

## Dokumentation

- `docs/ARCHITEKTUR.md`
- `docs/GAMEPLAY.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/DEFINITIONEN.md`

