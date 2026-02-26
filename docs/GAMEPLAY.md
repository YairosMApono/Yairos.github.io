# Gameplay / Balance

## Kernloop

1. **Produktion** über Rohstofffelder (pro Stunde).
2. **Ausbau** von Gebäuden/Feldern (Queue, Bauzeiten).
3. **Rekrutierung** (Queue, Getreideverbrauch).
4. **Berichte** protokollieren Aktionen und Abschlüsse.

## Ressourcen

- `wood`, `clay`, `iron`: Kapazität über **Lagerhaus**
- `crop`: Kapazität über **Getreidespeicher** und Verbrauch durch Truppen

## Formeln (aktuell)

- **Kosten pro Level**: \( \text{cost}(L) = \lfloor \text{base} \cdot 1.55^{L} \rfloor \)
- **Bauzeit**: \( \text{time}(L) = \lfloor \text{baseTime} \cdot 1.5^{L} / (1 + 0.05 \cdot \text{main}) \rfloor \)
- **Rekrutierung**: skaliert mit `main` (+5%/Stufe) und `barracks` (+10%/Stufe)

## Queue

- Standard: **1 Slot**
- Mit `Versammlungsplatz` (`rally` > 0): **2 Slots**
- Es gibt bewusst **keine „Warteschlange“** hinter den Slots: Wenn Slots voll sind, kann nichts zusätzlich eingereiht werden (klarer, weniger Micromanagement).

## Offline-Fortschritt

- Zeit seit `lastSavedEpochMs` wird beim Start nachsimuliert (cap 12h).
- Queue-Abschlüsse werden dabei korrekt in der Reihenfolge verarbeitet.

## Nächste sinnvolle Erweiterungen (optional)

- Markt/Handel (Ressourcentausch, Gebühren)
- Events (Banditenüberfall mit einfacher Kampf-Resolution)
- Mehr Dörfer (Karte als Expansion)

