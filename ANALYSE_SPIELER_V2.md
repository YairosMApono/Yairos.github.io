# Empire Builder – Spieler-Analyse V2

**Perspektive:** Ich bin Spieler. Was fehlt noch?

---

## 1. Design

### ✓ Was gut funktioniert
- Einheitliches Farbschema (Gold, Parchment, dunkles Grün)
- Klare Typografie (Cinzel, Crimson Text)
- Konsistente Karten, Buttons, Modals
- Gebäude-Icons ändern sich mit Stufe (🏠→🏛️→🏰)

### ✗ Was fehlt / verbessert werden könnte

| Thema | Problem | Vorschlag |
|-------|---------|-----------|
| **Feedback** | Kein visuelles/akustisches Feedback bei Aktionen | Kurze Animation bei Bauabschluss, Ziel erreicht; dezente Sounds (optional) |
| **Kampf** | Kampf passiert „unsichtbar“ – nur Text in Berichten | Kampf-Log oder Mini-Animation (Schwert-Icon, Schadenszahlen) |
| **Dungeon** | Nur Punkte – wenig Atmosphäre | Level als kleine Kacheln mit Gegner-Icon, Fortschrittsbalken |
| **Karte** | 7×7 wirkt statisch, wenig Leben | Leichte Animation (Wolken, Vögel?), Tageszeit-Variation |
| **Belohnungen** | Ressourcen erscheinen ohne Hervorhebung | Kurzes Aufblitzen der Rohstoffleiste bei Belohnung |
| **Leere Felder** | 🌲 auf Karte wirkt repetitiv | Variation (🪨, 🌿, 🏔️) je nach Position |

---

## 2. Challenge (Herausforderung)

### ✓ Was gut funktioniert
- 12 Ziele mit steigender Schwierigkeit
- Wellen-Angriffe skalieren mit Tag
- Dungeons haben klare Progression (Mine → Wald → Ruinen)
- Expansion kostet mehr bei jeder Stufe

### ✗ Was fehlt / verbessert werden könnte

| Thema | Problem | Vorschlag |
|-------|---------|-----------|
| **Schwierigkeitsgrad** | Keine Wahl – ein Modus für alle | Optional: „Einfach / Normal / Schwer“ (mehr/weniger Gegner, Ressourcen) |
| **Zeitdruck** | 1 Tag = 90 Sek – fest, kein Pause | Pause-Button, Geschwindigkeit 1x/2x umschaltbar |
| **Räuberhauptmann** | Ruinen-Dungeon: 5× Chieftain hintereinander sehr hart | Schwächere Gegner zwischendurch oder Boss mit eigener Mechanik |
| **Wellen-Zufall** | Angriff kommt zufällig – kann frustrierend sein | Vorwarnung: „Späher melden: Angriff in 2 Tagen!“ |
| **Endgame** | Nach 12 Zielen: kein Inhalt mehr | Endlos-Challenges: „Baue Hauptgebäude St. 15“, „Überlebe 10 Wellen“ |
| **Gold** | Gold hat kaum Verwendung (Ausrüstung fehlt) | Schmiede + Ausrüstung wie im Design-Dokument |

---

## 3. Gameplay

### ✓ Was gut funktioniert
- Klare Wirtschaftslogik (Produktion vs. Verbrauch)
- Queue-System mit 1–2 Slots
- Truppen mit ATK/DEF und XP
- Offline-Fortschritt
- Expansion auf Karte

### ✗ Was fehlt / verbessert werden könnte

| Thema | Problem | Vorschlag |
|-------|---------|-----------|
| **Strategische Tiefe** | Truppen-Unterschiede gering (nur ATK/DEF) | Spezialfähigkeiten: Speer +Def vs. Wand, Axt +ATK vs. Infanterie |
| **Expansion** | Sofort fertig – kein Bauprozess | Expansion als Queue-Auftrag (z.B. 30 Sek) |
| **Dungeon** | Ein Klick = kompletter Lauf – kein Mitspracherecht | Pro Level bestätigen oder „Auto bis Level X“ |
| **Kampf** | Keine Truppenauswahl – alle kämpfen immer | Optional: „Verteidigungsarmee“ auswählen (z.B. nur Miliz + Speer) |
| **Ressourcen-Engpässe** | Oft warten auf eine Ressource | Handels-Event: „Händler bietet Holz gegen Lehm“ |
| **Wiederholbarkeit** | Jede Partie ähnlich | Zufalls-Events, verschiedene Start-Boni, Achievements |

---

## 4. Usability

### ✓ Was gut funktioniert
- Responsive Design (Mobile)
- Hilfe-Buttons (?)
- Klare Tab-Navigation
- Link-Button im Header

### ✗ Was fehlt / verbessert werden könnte

| Thema | Problem | Vorschlag |
|-------|---------|-----------|
| **Erster Start** | Kein Tutorial – Spieler klickt blind | Kurzer Tooltip: „Klicke auf 🏰 um zu starten“ |
| **Angriff** | Alert nur auf Karte – wenn man woanders ist, verpasst man es | Globale Benachrichtigung/Badge auf Tab „Karte“ |
| **Dungeon-Cooldown** | „Ein Dungeon pro Tag“ – nicht sichtbar wann wieder | „Nächster Dungeon in: X Stunden“ oder Countdown |
| **Ziele** | Lange Liste – schwer zu überblicken | Fortschrittsbalken: „7/12 Ziele“ |
| **Berichte** | Nur Text, chronologisch – schwer zu filtern | Filter: Bau / Kampf / Ziele / Events |
| **Rohstoffleiste** | Gold zwischen Hilfe und Holz – Reihenfolge ungewohnt | Gold ans Ende oder eigene Zeile |
| **Neues Spiel** | Bestätigung ohne Rückfrage ob wirklich | Doppelte Bestätigung: „Fortschritt geht verloren. Name eingeben zur Bestätigung?“ |

---

## 5. Features

### ✓ Bereits vorhanden
- Wirtschaft (4 Ressourcen + Gold)
- 6 Gebäude, 18 Felder
- 4 Truppentypen mit Level/XP
- 4 Gegner, Wellen-Angriffe
- 3 Dungeons
- Karten-Expansion
- 12 Ziele
- Weltereignisse
- Offline-Fortschritt

### ✗ Fehlende / geplante Features

| Feature | Priorität | Beschreibung |
|---------|-----------|--------------|
| **Schmiede + Ausrüstung** | Hoch | Gold ausgeben für Schwerter, Schilde etc. – Truppen stärker |
| **Spielgeschwindigkeit** | Hoch | 1x / 2x / Pause |
| **Tutorial** | Hoch | Erste Schritte beim ersten Start |
| **Achievements** | Mittel | „Erster Sieg“, „100 Truppen“, „Dungeon ohne Verlust“ |
| **Kampf-Log** | Mittel | Detaillierter Kampfbericht (Schaden, Verluste) |
| **Handel** | Mittel | Ressourcen tauschen (Event oder Gebäude) |
| **Sound** | Niedrig | Optionale Soundeffekte (Bau, Kampf, Ziel) |
| **Dark/Light Mode** | Niedrig | Theme umschaltbar |
| **Statistiken** | Niedrig | „Gesamt gespielte Tage“, „Gegner besiegt“ |
| **Speicherstände** | Niedrig | Mehrere Slots (Slot 1, 2, 3) |

---

## 6. Priorisierte Empfehlungen

### Sofort umsetzbar (Quick Wins)
1. **Angriff-Benachrichtigung** – Badge auf Karte-Tab wenn `pendingAttack`
2. **Dungeon-Cooldown anzeigen** – „Nächster Dungeon: Tag X“ oder Countdown
3. **Fortschrittsbalken Ziele** – „7/12 Ziele abgeschlossen“
4. **Erster-Start-Tooltip** – „Klicke auf dein Dorf 🏰“

### Mittelfristig (größerer Impact)
5. **Spielgeschwindigkeit** – 1x / 2x / Pause
6. **Schmiede + Ausrüstung** – Gold nutzbar machen
7. **Kampf-Log / -Animation** – Kampf sichtbarer machen
8. **Vorwarnung bei Angriff** – „Angriff in 2 Tagen“

### Langfristig
9. **Achievements**
10. **Handel**
11. **Sound (optional)**
12. **Endlos-Modus nach Ziel 12**

---

## 7. Fazit

| Bereich | Note | Kurz |
|---------|------|------|
| **Design** | 7/10 | Solide Basis, mehr Feedback nötig |
| **Challenge** | 7/10 | Gute Progression, Endgame + Schwierigkeit fehlen |
| **Gameplay** | 8/10 | Starke Mechanik, mehr Tiefe möglich |
| **Usability** | 6/10 | Tutorial, Benachrichtigungen, Filter fehlen |
| **Features** | 7/10 | Viel da, Gold/Ausrüstung/Speed fehlen |

**Gesamt:** Empire Builder ist ein solides Strategiespiel mit guter Basis. Die größten Lücken: **Usability** (Tutorial, Benachrichtigungen), **Gold-Verwendung** (Schmiede), **Zeitkontrolle** (Speed/Pause) und **sichtbares Feedback** (Kampf, Belohnungen).
