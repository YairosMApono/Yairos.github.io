# Design-System

## Prinzipien

- **Konsistente Radien/Abstände/Schatten** via CSS-Variablen (`:root`).
- **Pill-Buttons/Tabs** für klare Interaktion.
- **Kontrast & Lesbarkeit** (Gold/Perkament auf dunklem Grund).
- **Mobile First**: Layout-Skalierung bis ~380px.
- **A11y**: `:focus-visible`, `prefers-reduced-motion`, Buttons statt klickbarer `div`s.

## Wichtige Tokens

- Radien: `--radius-xl/lg/md/sm/xs`
- Spacing: `--space-xs/sm/md/lg`
- Farben: `--gold`, `--gold-light`, `--surface`, `--border`
- Fokus: `--focus`

## Komponenten

- **Card Pattern**: Basispanel (`.card-pattern`) und abgeleitete Container (`.map-container`, `.queue`, etc.)
- **Modals**: `role="dialog"`, `aria-modal="true"`, Click-outside schließt
- **Resource Bar**: Rate-Farbe für Getreide wechselt bei negativer Bilanz (`.negative`)

## Guidelines

- Keine Inline-Styles im HTML (alles über Klassen/Stylesheet).
- Interaktive Flächen sind `button` (bessere Tastatur-/Screenreader-Unterstützung).

