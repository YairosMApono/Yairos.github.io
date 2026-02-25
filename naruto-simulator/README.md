# Naruto Kampf Simulator

Ein visueller Kampf-Simulator mit zufälligen Kämpfern aus dem Naruto-Universum.

**Live:** https://yairosmapono.github.io/

## Features

- **K.O.-Turniersystem** mit 4, 8 oder 16 Kämpfern
- **Charakter-Stats** basierend auf offiziellen Naruto-Databooks (Ninjutsu, Taijutsu, Genjutsu, etc.)
- **6-Sekunden Kampf-Animation** mit Ladebalken
- **Glücksfaktor** für spannende Überraschungen
- **Kampfkarten** mit Charakterbildern und Infos
- **Turnierbaum** zum Verfolgen des Fortschritts
- **Mobile-optimiert** - funktioniert auf Smartphones

## Starten

### Option 1: Direkt öffnen
Öffne `index.html` im Browser (Doppelklick oder Rechtsklick → Öffnen mit).

### Option 2: Lokaler Server (für mobile Geräte im gleichen Netzwerk)
```bash
# Python 3
python3 -m http.server 8080

# Oder mit Node.js (npx)
npx serve .
```

Dann im Browser öffnen:
- **Am PC:** http://localhost:8080
- **Mobil (gleiches WLAN):** http://[DEINE-IP]:8080
  - IP finden: `ip addr` (Linux) oder `ipconfig` (Windows)

### Option 3: Online hosten
Lade das Projekt auf GitHub Pages, Netlify oder Vercel hoch für einen dauerhaften Link.
