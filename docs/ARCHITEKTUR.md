# Architektur und Definitionsregeln

## 1. Zielbild

Die Anwendung ist bewusst einfach gehalten (kein Framework), folgt aber klaren Schichten:

1. **Daten/Definitionen** (Konstanten im Kopf von `assets/game.js`)
2. **Simulation** (Tick, Produktion, Queue, Events, Ziele)
3. **Rendering** (Resource-Bar, Queue, Tabs, Reports, Ziele)
4. **Interaktion** (Event Delegation statt Inline-JS)

---

## 2. Korrekte Definitionen (Single Source of Truth)

### 2.1 Ressourcen-Schluessel

Im gesamten Code gelten nur:

- `wood`
- `clay`
- `iron`
- `crop`

Historische Kurzschluessel (`w`, `c`, `i`, `r`) werden beim Laden alter Spielstaende
automatisch in das neue Format ueberfuehrt.

### 2.2 Kernobjekte

- `BUILDINGS`: Gebaeudedefinitionen inkl. Basis-Kosten, Dauer, Beschreibung, Hilfe.
- `FIELDS`: Feldtypen inkl. Produktion und Kostenentwicklung.
- `TROOPS`: Truppentypen inkl. Rekrutierungskosten, Dauer, Verbrauch.
- `OBJECTIVES`: Fortschrittsziele mit Bedingungen und Belohnungen.
- `WORLD_EVENTS`: Zyklische Weltereignisse mit Effektfunktionen.

---

## 3. Spielzustand (`game`)

Der Zustand ist in `game` zentral gebuendelt:

- `resources`
- `buildings`
- `fields`
- `troops`
- `queue`
- `reports`
- `day`
- `lastTick`
- `lastEventDay`
- `starvationSeconds`
- `objectives`

Beim Laden wird der Zustand normalisiert (Typen, Grenzen, gueltige IDs, Queue-Validierung).

---

## 4. Simulation

## 4.1 Produktion

Pro Tick:

- Holz/Lehm/Eisen steigen mit Feldproduktion.
- Getreide steigt mit Produktion und sinkt durch Truppenverbrauch.
- Alle Ressourcen werden auf Speicherlimits gekappt.

## 4.2 Queue

- Maximale Queue-Laenge: `8`.
- Aktive parallele Slots:
  - `1` ohne Versammlungsplatz
  - `2` mit Versammlungsplatz
- Queue-Fortschritt wird zeitschrittbasiert und slot-korrekt berechnet.

## 4.3 Ziele

Ziele werden nach jedem Simulationsschritt geprueft:

- Bei Abschluss wird Belohnung sofort gutgeschrieben.
- Abschluss wird im Report protokolliert.

## 4.4 Weltereignisse

- Alle `3` Ingame-Tage.
- Ereignisauswahl deterministisch anhand des Tages (reproduzierbar).
- Effekte werden direkt auf Ressourcen angewendet.

## 4.5 Hungersnot

Wenn Netto-Getreide negativ **und** Speicher leer ist:

- Starvation-Timer laeuft hoch.
- Alle `25` Sekunden kann Desertion ausgeloest werden.

---

## 5. Persistenz

- Speicherintervall: 2 Sekunden (plus `beforeunload`/`visibilitychange`).
- Savegame enthaelt nur den benoetigten Zustand.
- Report-Historie wird auf definierte Maximalgroesse begrenzt.
- Offline-Fortschritt wird bis max. 8h nachsimuliert.

---

## 6. UI und Design

- Design-Tokens in `:root` (`assets/styles.css`).
- Wiederverwendbare Muster: `.card-pattern`, `.tab`, `.btn`.
- Bessere Zugaenglichkeit:
  - `:focus-visible`,
  - semantische Buttons,
  - entfernte Inline-Handler.

---

## 7. Erweiterungsempfehlungen

- Kampf-/Verteidigungssystem mit KI-Gegnern.
- Mehrstufige Tech-Entwicklung (Forschung).
- Export/Import von Spielstaenden als JSON-Datei.
- Unit-Tests fuer Formeln (Kosten, Zeiten, Produktion, Queue-Simulation).
