# Definitionen / Glossar

## Ressourcen-IDs (canonical)

Im Code werden Ressourcen **ausschließlich** mit folgenden IDs adressiert:

- `wood` (Holz)
- `clay` (Lehm)
- `iron` (Eisen)
- `crop` (Getreide)

Wichtig: Legacy-Keys wie `w/c/i/r` werden beim Laden migriert, aber nicht mehr erzeugt.

## Kosten-Objekte

Kosten sind immer ein Objekt mit **Ressourcen-Keys**:

```js
{ wood: 70, clay: 40, iron: 60, crop: 20 }
```

## Feldtypen

Feldtypen verwenden die gleichen IDs wie Ressourcen (`wood`, `clay`, `iron`, `crop`), damit Produktion und UI-Meta ohne Sonderfälle funktionieren.

## Queue-Items

- `building`: `id` ist eine Gebäude-ID (`main`, `barracks`, ...)
- `field`: `id` ist der Feldindex (0..17)
- `troop`: `id` ist eine Truppen-ID (`militia`, `sword`, ...)

`remainingMs` / `totalMs` sind immer Millisekunden.

## Validierung

Beim Start werden Definitionen über `src/validate/validate.js` geprüft:

- Kosten enthalten nur erlaubte Ressourcen-Keys
- IDs sind eindeutig und referenzieren gültige Einträge
- Produktions-/Zeitwerte sind numerisch und > 0

