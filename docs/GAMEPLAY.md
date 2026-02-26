# Empire Builder – Spielmechaniken

## Ressourcen

| Ressource | Produktion | Speicher | Verwendung |
|-----------|------------|----------|------------|
| Holz 🪵 | Holzfäller | Lagerhaus | Gebäude, Truppen |
| Lehm 🧱 | Lehmgrube | Lagerhaus | Gebäude, Truppen |
| Eisen ⚙️ | Eisenmine | Lagerhaus | Gebäude, Truppen |
| Getreide 🌾 | Acker | Getreidespeicher | Gebäude, Truppen, Truppen-Verbrauch |

- **Produktion:** Pro Stunde, abhängig von Feldstufe
- **Verbrauch:** Truppen verbrauchen Getreide/h; bei negativer Bilanz sinkt der Vorrat

## Gebäude

| Gebäude | Effekt | Voraussetzungen |
|---------|--------|-----------------|
| Hauptgebäude | −5% Bau-/Rekrutierungszeit pro Stufe | — |
| Kaserne | Truppen rekrutieren, +10% Rekrutierungsgeschwindigkeit/Stufe | Hauptgebäude St.1 |
| Lagerhaus | +2500 Kapazität Holz/Lehm/Eisen pro Stufe | Hauptgebäude St.1 |
| Getreidespeicher | +2000 Kapazität Getreide pro Stufe | Hauptgebäude St.1 |
| Stadtmauer | Verteidigungsbonus | Hauptgebäude St.3, Versammlungsplatz St.1 |
| Versammlungsplatz | 2. Bau-Queue | Hauptgebäude St.1, Kaserne St.1 |

## Rohstofffelder

- **4× Holzfäller, 4× Lehmgrube, 4× Eisenmine, 6× Acker**
- Produktion: `prodBase × prodFactor^(level-1)` pro Stunde
- Acker sind teurer (höhere Getreide-Kosten), da Getreide der limitierende Faktor ist

## Truppen

| Truppe | Angriff | Verteidigung | Getreide/h |
|--------|---------|--------------|------------|
| Miliz | 1 | 2 | 1 |
| Schwertkämpfer | 3 | 2 | 1 |
| Speerträger | 2 | 3 | 1 |
| Axtkämpfer | 4 | 1 | 2 |

Rekrutierungszeit wird durch Hauptgebäude (−5%/Stufe) und Kaserne (−10%/Stufe) reduziert.

**Max-Button:** Rekrutiert die maximale Anzahl an Truppen, die mit den aktuellen Ressourcen möglich ist.

## Zeit

- **1 Tag** ≈ 90 Sekunden Echtzeit
- Bau-Queue: 1 Slot standardmäßig, 2 mit Versammlungsplatz
- Spielstand wird automatisch in `localStorage` gespeichert
