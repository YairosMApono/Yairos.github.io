# Empire Builder V3 – Vollständige Dokumentation

## Übersicht

Empire Builder ist ein Einzelspieler-Strategiespiel im Browserspiel-Stil. Der Spieler baut ein Dorf auf, rekrutiert Truppen, wehrt Angriffe ab, erobert Dungeons und expandiert sein Reich.

---

## 1. Konzeption

### 1.1 Phase 1 – Konzeption (KONZEPTION_VOLLSTAENDIG.md)
- Spielgeschwindigkeit & Pause
- Tutorial / Erster Start
- Angriff-Badge
- Dungeon-Cooldown
- Ziel-Fortschritt
- Schmiede + Ausrüstung
- Kampf-Log (Report-Typen)
- Vorwarnung Angriff
- Achievements
- Handel (Weltereignis)
- Berichte-Filter
- Neues Spiel – Doppelte Bestätigung
- Schwierigkeitsgrad
- Endlos-Modus

### 1.2 Phase 2 – Prüfung
- Save-Migration (v3 → v4)
- Backward Compatibility
- Alle Features getestet

---

## 2. Implementierte Features

### 2.1 Spielgeschwindigkeit
- **⏸ Pause** – Simulation stoppt
- **1x** – Normale Geschwindigkeit
- **2x** – Doppelte Geschwindigkeit
- Position: Header neben Link-Button

### 2.2 Tutorial
- Beim ersten Start: Overlay „Klicke auf dein Dorf 🏰“
- Button „Verstanden“ schließt und speichert in `localStorage`
- Key: `empire-tutorial-done`

### 2.3 Angriff-Badge
- Roter Badge „!“ auf Tab „Karte“ wenn `pendingAttack`
- Sichtbar auch bei Vorwarnung

### 2.4 Dungeon-Cooldown
- Anzeige: „Nächster Dungeon: Tag X“ oder „Bereit“
- Ein Dungeon pro Spieltag

### 2.5 Ziel-Fortschritt
- Status-Panel: „7/12 Ziele“
- Nach allen 12: „Endlos“-Ziele (Haupt St.15, 200 Truppen, 10 Wellen)

### 2.6 Schmiede & Ausrüstung
- **Gebäude:** Schmiede (Haupt St.4, Kaserne St.1)
- **Ausrüstung:** Schwert, Schild, Rüstung, Bogen (je St. 1–5)
- **Effekt:** +5% ATK oder DEF pro Stufe
- **Kosten:** Gold + Ressourcen, skaliert mit Level

### 2.7 Kampf-Log / Report-Typen
- `general` – Allgemein
- `build` – Bauabschlüsse
- `combat` – Kämpfe
- `objective` – Ziele
- `event` – Weltereignisse

### 2.8 Vorwarnung Angriff
- 1 Tag vor Angriff: „Späher melden: Angriff in 1 Tag!“
- Button „Verstanden“ blendet Hinweis aus
- Am nächsten Tag: Angriff aktiv

### 2.9 Achievements
- Erster Sieg, Kleine Streitmacht, Perfekter Dungeon, Hundert Mann, Imperator, Unbezwingbar
- Belohnung: Gold
- Automatische Auswertung nach jedem Tick

### 2.10 Handel
- Weltereignis „Händler“
- Zufälliger Tausch (z.B. 200 Holz gegen 150 Lehm)
- Automatisch wenn Ressourcen reichen

### 2.11 Berichte-Filter
- Alle | Bau | Kampf | Ziele | Events
- Filter-Buttons über der Berichtsliste

### 2.12 Neues Spiel
- Modal mit Eingabe „NEU“ zur Bestätigung
- Schwierigkeitsgrad: Einfach | Normal | Schwer
- Einfach: 1.2x Belohnung, weniger Angriffe
- Schwer: 0.8x Belohnung, mehr Angriffe

### 2.13 Endlos-Modus
- Nach 12 Zielen: 3 weitere Ziele
- Haupt St.15, 200 Truppen, 10 Wellen

---

## 3. Technische Details

### 3.1 Save-Format (v4)
```json
{
  "version": 4,
  "resources": { "wood", "clay", "iron", "crop", "gold" },
  "buildings": { "main", "barracks", "warehouse", "granary", "wall", "rally", "smithy" },
  "equipment": { "sword", "shield", "armor", "bow" },
  "gameSpeed": 1,
  "gamePaused": false,
  "difficulty": "normal",
  "achievements": {},
  "statsEnemiesKilled": 0,
  "statsDaysPlayed": 0,
  "attackWarningDay": 0,
  ...
}
```

### 3.2 localStorage-Keys
- `empire-game` – Spielstand
- `empire-start` – Startzeitpunkt (für Tag-Berechnung)
- `empire-tutorial-done` – Tutorial abgeschlossen
- `empire-difficulty` – Schwierigkeit für neues Spiel

### 3.3 Dateien
- `index.html` – Struktur, Modals, Tabs
- `assets/game.js` – Spiel-Logik
- `assets/styles.css` – Styling
- `KONZEPTION_VOLLSTAENDIG.md` – Konzeption
- `ANALYSE_SPIELER_V2.md` – Spieler-Analyse
- `DESIGN_EMPIRE_BUILDER_V2.md` – Design-Dokument
- `DOKUMENTATION_V3.md` – Diese Datei

---

## 4. Weitere Entwicklung (Phase 2+)

### Mögliche Erweiterungen
- Sound (optional)
- Statistiken-Screen (Tage, Gegner besiegt)
- Dark Mode
- Mehr Dungeons
- Expansion als Queue-Auftrag
- Truppen-Spezialfähigkeiten

---

## 5. Changelog

### V4 (aktuell)
- Spielgeschwindigkeit 1x/2x/Pause
- Tutorial
- Angriff-Badge, Vorwarnung
- Dungeon-Cooldown
- Ziel-Fortschritt, Endlos-Modus
- Schmiede, Ausrüstung
- Achievements
- Handel (Weltereignis)
- Berichte-Filter
- Neues Spiel mit Bestätigung
- Schwierigkeitsgrad

### V3
- Truppen-Level/XP
- Gegner, Wellen-Angriffe
- Dungeons
- Dorf-Expansion
- Gold
- 12 Ziele

### V2
- Basis-Spiel
- Gebäude, Felder, Truppen
- Ziele, Weltereignisse
