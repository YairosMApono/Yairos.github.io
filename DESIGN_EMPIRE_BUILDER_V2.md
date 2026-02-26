# Empire Builder V2 – Vollständiges Design-Dokument

## Übersicht: Spielstart bis Endgame

| Phase | Tag | Fokus | Inhalte |
|-------|-----|-------|---------|
| **Früh** | 1–5 | Basis aufbauen | Hauptgebäude, erste Felder, Kaserne |
| **Mittel** | 6–15 | Expansion | Wall, Rally, Truppen, erste Angriffe abwehren |
| **Spät** | 16–30 | Eroberung | Dungeons, Dorf-Expansion, Ausrüstung |
| **Endgame** | 31+ | Reich | Alle Ziele, maximale Expansion, Wellen-Bosse |

---

## 1. Einheiten-Level & Ausrüstung

### 1.1 Truppen-Level (1–10)
- **Erfahrung**: Truppen sammeln XP durch Kämpfe (Angriffe, Dungeons, Wellen)
- **Level-Bonus**: +5% Angriff/Verteidigung pro Level
- **Struktur**: `troops: { militia: { count: 5, xp: 120 }, ... }`
- **XP pro Kampf**: Basierend auf besiegten Gegnern

### 1.2 Ausrüstung
- **Schmiede** (neues Gebäude): Ermöglicht Ausrüstungs-Herstellung
- **Ausrüstungstypen**:
  - 🗡️ **Schwert** (+Angriff): Holz, Eisen
  - 🛡️ **Schild** (+Verteidigung): Holz, Eisen, Lehm
  - ⚔️ **Rüstung** (+Verteidigung): Eisen, Lehm
  - 🏹 **Bogen** (+Angriff, Reichweite): Holz, Eisen
- **Stufen**: 1–5, jede Stufe +10% Stat-Bonus
- **Zuweisung**: Pro Truppentyp (z.B. alle Schwertkämpfer haben Schwert St.2)

### 1.3 Neue Ressource: Gold
- Gewinn: Dungeons, besiegte Gegner, Weltereignisse
- Verbrauch: Ausrüstung, spezielle Upgrades
- Speicher: Eigenes „Schatzkammer“-Limit

---

## 2. Gegner & Wellen-Angriffe

### 2.1 Angriffs-Trigger
- **Zeitbasiert**: Alle X Tage (z.B. Tag 5, 10, 15, …)
- **Zufällig**: 15% Chance pro Tag nach Tag 5
- **Wellen-Stärke**: Skaliert mit Spieltag + Dorfstufe

### 2.2 Gegner-Typen
| Gegner | Angriff | Verteidigung | HP | Belohnung |
|--------|---------|--------------|-----|------------|
| 🐺 Wölfe | 5 | 2 | 20 | Wenig Ressourcen |
| 🗡️ Banditen | 12 | 8 | 50 | Ressourcen + Gold |
| ⚔️ Söldner | 25 | 15 | 100 | Gold, XP |
| 👹 Räuberhauptmann | 40 | 25 | 200 | Viel Gold, XP |
| 🐉 Drachenbrut | 60 | 35 | 300 | Seltene Ressourcen |

### 2.3 Kampfmechanik
- **Formel**: `Schaden = Angreifer-ATK - Verteidiger-DEF` (min 1)
- **Reihenfolge**: Spieler-Truppen vs. Gegner (Rundenbasiert)
- **Verteidigungsbonus**: Stadtmauer +20% DEF für Verteidiger
- **Ergebnis**: Sieg → Belohnung; Niederlage → Ressourcenverlust, evtl. Truppenverluste

### 2.4 Wellen-Modus
- 3–5 Wellen pro Angriffs-Event
- Jede Welle stärker als die vorherige
- Zwischen Wellen: Kurze Pause (optional: Truppen nachheilen?)
- Gesamtsieg: Große Belohnung

---

## 3. Dungeon-System

### 3.1 Darstellung
- **Neuer Tab**: „⚔️ Dungeons“ oder Unterbereich in Karte
- **Dungeon-Karte**: 5–10 Level pro Dungeon, linear oder verzweigt
- **Visualisierung**: 
  - Kacheln pro Level (🕳️ Level 1, 🚪 Level 2, …)
  - Fortschrittsanzeige (z.B. Level 3/10)
  - Belohnungs-Vorschau pro Level

### 3.2 Dungeon-Typen
| Dungeon | Level | Gegner | Belohnung |
|---------|-------|--------|-----------|
| Verlassene Mine | 5 | Banditen, Wölfe | Eisen, Gold |
| Verfluchter Wald | 7 | Wölfe, Söldner | Holz, Gold |
| Ruinen der Alten | 10 | Söldner, Räuberhauptmann | Gold, Ausrüstung |
| Drachenhöhle | 10 | Drachenbrut, Boss | Seltene Ressourcen |

### 3.3 Mechanik
- **Eintritt**: Truppen senden (wie Angriff)
- **Kampf pro Level**: Automatisch, Ergebnis nach Berechnung
- **Verluste**: Truppen können fallen (realistisch)
- **Belohnung**: Pro besiegtem Level
- **Cooldown**: 1 Dungeon pro Tag (oder pro X Stunden)

---

## 4. Dorf-Expansion (Nachbarfelder)

### 4.1 Karten-Struktur (7×7)
```
 0  1  2  3  4  5  6
 7  8  9 10 11 12 13
14 15 16 17 18 19 20
21 22 23[24]25 26 27   ← 24 = Hauptdorf
28 29 30 31 32 33 34
35 36 37 38 39 40 41
42 43 44 45 46 47 48
```

### 4.2 Erweiterbare Felder
- **Start**: Nur Feld 24 (Zentrum) besiedelt
- **Nachbarn von 24**: 17, 23, 25, 31 (oben, links, rechts, unten)
- **Expansion**: 
  - Kosten: Holz, Lehm, Eisen, Crop + Zeit
  - Voraussetzung: Hauptgebäude Stufe X
  - Neue Felder = +2 Rohstofffelder pro Expansion ODER neues Gebäude-Slot

### 4.3 Expansion-Stufen
| Stufe | Felder | Voraussetzung | Bonus |
|-------|--------|---------------|-------|
| 0 | 24 | - | 18 Felder, 6 Gebäude |
| 1 | +17,23,25,31 | Haupt St.5 | +4 Felder |
| 2 | +10,16,18 | Haupt St.8 | +3 Felder |
| 3 | +30,32,38 | Haupt St.10 | +3 Felder |

### 4.4 Darstellung auf Karte
- **Besiedelt**: 🏘️ (erweitertes Dorf)
- **Verfügbar**: 🔲 (kann expandiert werden)
- **Gesperrt**: 🌲 (noch nicht freigeschaltet)

---

## 5. Village-Visualisierung (Gameplay Flavor)

### 5.1 Gebäude-Darstellung
- **Stufenabhängige Icons**: Größere/aufwendigere Icons bei höheren Stufen
- **Beispiel**: Hauptgebäude St.1 = 🏠, St.5 = 🏛️, St.10 = 🏰
- **Layout**: Gebäude in „Dorfzentrum“-Anordnung, Felder drumherum

### 5.2 Animations & Feedback
- **Bauabschluss**: Kurzes Aufblitzen, Partikel
- **Ziel erreicht**: Banner „Ziel abgeschlossen!“, Konfetti-ähnlich
- **Kampf**: Schild-Animation, Schadenszahlen
- **Dungeon**: Fortschritts-Balken pro Level

### 5.3 Atmosphäre
- **Tageszeit**: Visueller Wechsel (Morgen/Dunkel) basierend auf Tag
- **Wetter**: Seltene Events (Regen = +10% Crop?)
- **Dorf-Größe**: Mehr Gebäude = „volleres“ Layout

### 5.4 Erweiterte Ziele (8–12 statt 3)
1. Hauptgebäude St.3
2. Netto-Getreide +60/h
3. 20 Truppen
4. Erste Expansion (Nachbarfeld)
5. Erster Dungeon besiegt
6. Stadtmauer St.5
7. 50 Truppen, alle Level 2+
8. Schmiede gebaut, erste Ausrüstung
9. 5 Wellen-Angriff überstanden
10. Dungeon „Ruinen der Alten“ komplett
11. Dorf auf 8 Felder expandiert
12. Endgame: Hauptgebäude St.10, 100 Truppen

---

## 6. Weitere Ideen

### 6.1 Helden/Generäle
- Ein besonderer Einheitentyp mit Fähigkeiten
- Unlock: Nach Dungeon-Boss oder Ziel 8

### 6.2 Allianzen (optional, später)
- NPC-Dörfer auf Karte
- Handel: Ressourcen tauschen
- Gemeinsame Dungeon-Raids

### 6.3 Prestige-System
- „Neustart“ mit Bonus (z.B. +10% Produktion dauerhaft)
- Nach Endgame-Ziel

### 6.4 Achievements
- „Erster Sieg“, „100 Truppen rekrutiert“, „Dungeon ohne Verluste“
- Kleine Belohnungen (Gold, Ressourcen)

### 6.5 Spielgeschwindigkeit
- 1x, 2x Umschaltung
- Pause-Button

---

## 7. Implementierungs-Reihenfolge

1. ✅ **SAVE_VERSION 3** – Neue State-Felder
2. ✅ **Gegner & Wellen** – Kampfsystem, Angriffs-Events (pendingAttack, resolveAttackWave)
3. ✅ **Erweiterte Ziele** – 12 Ziele (inkl. Expansion, Dungeons, Wellen)
4. ✅ **Dorf-Expansion** – Karten-Felder, Expansion-UI (expandable tiles)
5. ✅ **Dungeon-System** – Dungeon-Tab, 3 Dungeons (Mine, Wald, Ruinen)
6. ✅ **Truppen-Level & XP** – Nach Kämpfen (Level 1–10, +5% pro Level)
7. ⏳ **Ausrüstung & Schmiede** – Noch nicht implementiert (Gold vorhanden)
8. ✅ **Visualisierung** – Gebäude-Icons nach Stufe, Ziel-Animation

---

## 8. Technische Notizen

- **Backward Compatibility**: Alte Saves (v1, v2) werden migriert (fehlende Felder = Default)
- **State-Erweiterung**: `expansion`, `dungeons`, `equipment`, `troopXp`, `gold`, `attackWave`, etc.
- **Performance**: Kampf-Berechnung sollte <50ms sein (synchron)
