# Empire Builder V3 – Vollständige Konzeption

## Phase 1: Konzeption & Umsetzung

### 1.1 Spielgeschwindigkeit & Pause
- **Speed-Buttons:** 1x | 2x | ⏸ Pause
- **Position:** Header neben Link/Neues Spiel
- **Technik:** `gameSpeed` (0.5, 1, 2), `gamePaused` (boolean)
- **Tick:** `deltaSeconds *= gameSpeed` wenn nicht paused
- **State:** `lastTick` bleibt bei Pause, Simulation läuft nicht

### 1.2 Tutorial / Erster Start
- **Trigger:** `localStorage.getItem("empire-tutorial-done")` fehlt
- **Schritt 1:** Overlay „Klicke auf dein Dorf 🏰 um zu starten“
- **Schritt 2:** Nach Klick auf Dorf → „Baue Gebäude oder Felder aus“
- **Schritt 3:** Nach erstem Bau → „Rekrutiere Truppen in der Kaserne“
- **Speichern:** Nach Schritt 3 → `localStorage.setItem("empire-tutorial-done", "1")`

### 1.3 Angriff-Badge
- **Position:** Tab „Karte“ – Badge (roter Punkt oder Zahl) wenn `pendingAttack`
- **HTML:** `<span class="tab-badge">!</span>` im Tab-Button
- **CSS:** Kleiner roter Kreis, position absolute

### 1.4 Dungeon-Cooldown
- **Anzeige:** „Nächster Dungeon: Tag X“ oder „Bereit“ wenn `lastDungeonDay < day`
- **Berechnung:** `lastDungeonDay >= day` → Cooldown aktiv, nächster Tag = `day + 1`

### 1.5 Ziel-Fortschritt
- **Anzeige:** „7/12 Ziele“ in Status-Panel oder Objectives-Header
- **Berechnung:** `OBJECTIVES.filter(o => game.objectives[o.id]).length`

### 1.6 Schmiede + Ausrüstung
- **Neues Gebäude:** `smithy` – Voraussetzung: Haupt St. 4, Kaserne St. 1
- **Ausrüstung:** 4 Typen (Schwert, Schild, Rüstung, Bogen), St. 1–5
- **Kosten:** Gold + Ressourcen pro Stufe
- **Effekt:** +X% ATK oder DEF für alle Truppen
- **State:** `game.equipment = { sword: 0, shield: 0, armor: 0, bow: 0 }`

### 1.7 Kampf-Log
- **Neuer Report-Typ:** `type: "combat"` mit Details
- **Inhalt:** Gegner, Sieg/Niederlage, Schaden, Verluste, Belohnung
- **Anzeige:** In Berichten oder eigenem „Kampf-Bericht“-Bereich

### 1.8 Vorwarnung Angriff
- **Trigger:** 1 Tag vor Angriff: `attackWarningDay = day + 1`
- **Logik:** Zufälliger Angriff wird 1 Tag vorher „geplant“ – `pendingAttack` mit `warning: true`
- **Anzeige:** „Späher melden: Angriff morgen!“

### 1.9 Achievements
- **Liste:** 8–12 Achievements (Erster Sieg, 100 Truppen, Dungeon ohne Verlust, etc.)
- **State:** `game.achievements = { firstWin: false, ... }`
- **Belohnung:** Kleine Gold-Belohnung

### 1.10 Handel
- **Event:** „Händler“ – tausche z.B. 200 Holz gegen 150 Lehm
- **Trigger:** Zufällig wie Weltereignis, oder alle 5 Tage
- **UI:** Modal mit Tausch-Optionen

### 1.11 Berichte-Filter
- **Filter:** Alle | Bau | Kampf | Ziele | Events
- **Technik:** Report-Typ `type` in reports, Filter-Buttons

### 1.12 Neues Spiel – Doppelte Bestätigung
- **Ablauf:** „Neues Spiel?“ → „Ja“ → „Bitte 'NEU' eingeben zur Bestätigung“

### 1.13 Schwierigkeitsgrad
- **Optionen:** Einfach | Normal | Schwer
- **Einfach:** Mehr Start-Ressourcen, weniger Gegner, 1.2x Belohnung
- **Schwer:** Weniger Ressourcen, mehr Gegner, 0.8x Belohnung
- **State:** `game.difficulty` (einfach, normal, schwer)

### 1.14 Endlos-Modus
- **Trigger:** Nach Ziel 12
- **Ziele:** „Haupt St. 15“, „200 Truppen“, „10 Wellen überleben“
- **Anzeige:** „Endlos-Modus“-Ziele wenn alle 12 erreicht

---

## Phase 2: Prüfung & weitere Entwicklung

### 2.1 Prüfung
- Alle Features getestet
- Save-Migration für alte Saves
- Backward Compatibility

### 2.2 Weitere Optionen (falls Zeit)
- Sound (optional, aus)
- Statistiken (Tage gespielt, Gegner besiegt)
- Dark Mode

---

## Phase 3: Dokumentation
- README.md aktualisieren
- KONZEPTION_VOLLSTAENDIG.md (dieses Dokument)
- CHANGELOG.md für Versionen
