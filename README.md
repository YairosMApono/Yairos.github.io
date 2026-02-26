# Empire Builder – Einzelspieler Strategie

Ein mittelalterliches Strategie-Browserspiel, inspiriert von klassischen Aufbau-Strategiespielen wie Travian. Verwalte Rohstoffe, errichte Gebäude und rekrutiere Truppen – alles direkt im Browser, ohne Installation.

## Inhaltsverzeichnis

- [Features](#features)
- [Spielstart](#spielstart)
- [Projektstruktur](#projektstruktur)
- [Architektur](#architektur)
- [Spielmechaniken](#spielmechaniken)
  - [Rohstoffe](#rohstoffe)
  - [Gebäude](#gebäude)
  - [Rohstofffelder](#rohstofffelder)
  - [Truppen](#truppen)
  - [Bau-Queue](#bau-queue)
  - [Punktesystem](#punktesystem)
  - [Meilensteine](#meilensteine)
- [Balancing-Formeln](#balancing-formeln)
- [Technologien](#technologien)
- [Deployment](#deployment)

---

## Features

- **Rohstoff-Management**: Vier Rohstoffe (Holz, Lehm, Eisen, Getreide) mit Echtzeit-Produktion
- **6 Gebäude**: Hauptgebäude, Kaserne, Lagerhaus, Getreidespeicher, Stadtmauer, Versammlungsplatz
- **18 Rohstofffelder**: 4× Holzfäller, 4× Lehmgrube, 4× Eisenmine, 6× Acker
- **4 Truppentypen**: Miliz, Schwertkämpfer, Speerträger, Axtkämpfer – mit differenzierten Kampfwerten
- **Punktesystem**: Score basierend auf Gebäude-Stufen, Feld-Stufen und Truppen
- **Meilensteine**: 14 Achievements, die als Berichte dokumentiert werden
- **Toast-Benachrichtigungen**: Visuelles Feedback bei Bau-Abschlüssen und Meilensteinen
- **Speicher-Anzeige**: Fortschrittsbalken für jede Ressource mit Warnung bei voller Kapazität
- **Responsives Design**: Optimiert für Desktop und Mobile
- **Persistenter Spielstand**: Automatische Speicherung via `localStorage`

---

## Spielstart

1. `index.html` im Browser öffnen (oder via GitHub Pages)
2. Das Spiel startet mit Hauptgebäude Stufe 1 und allen Feldern auf Stufe 1
3. Startressourcen: je 750 Holz, Lehm, Eisen und Getreide
4. Baue Rohstofffelder aus, um die Produktion zu steigern
5. Errichte die Kaserne, um Truppen zu rekrutieren

---

## Projektstruktur

```
empire-builder/
├── index.html              # HTML-Struktur (keine Inline-Logik)
├── css/
│   └── style.css           # Design-System, Layout, Responsive
├── js/
│   ├── config.js           # Spielkonstanten & Definitionen
│   ├── engine.js           # Spiel-Engine (Zustand, Logik, Berechnungen)
│   ├── ui.js               # UI-Controller (DOM, Rendering, Events)
│   └── main.js             # Einstiegspunkt & Game-Loop
├── .github/
│   └── workflows/
│       └── deploy-pages.yml  # GitHub Pages Deployment
└── README.md               # Diese Dokumentation
```

### Datei-Verantwortlichkeiten

| Datei | Verantwortung |
|-------|--------------|
| `config.js` | Alle Spieldaten: Gebäude, Felder, Truppen, Meilensteine, Hilfetexte, Konstanten |
| `engine.js` | Spielzustand, Ressourcen-Tick, Bau-Queue, Speichern/Laden, Punkteberechnung |
| `ui.js` | DOM-Manipulation, Tab-Navigation, Modals, Toast-System, Event-Binding |
| `main.js` | Initialisierung, Game-Loop-Start |

---

## Architektur

Das Projekt folgt einer **MVC-inspirierten Architektur** mit ES-Modulen:

```
┌─────────────┐     onChange()     ┌──────────────┐
│  GameEngine  │ ───────────────▶  │    GameUI     │
│  (Model)     │                   │  (View/Ctrl)  │
│              │ ◀──────────────── │               │
│  - state     │   startBuilding() │  - renderX()  │
│  - tick()    │   trainTroops()   │  - updateUI() │
│  - save()    │                   │  - showToast() │
└─────────────┘                    └──────────────┘
       ▲                                  ▲
       │          ┌──────────┐            │
       └──────────│  config  │────────────┘
                  │ (Daten)  │
                  └──────────┘
```

- **GameEngine** verwaltet den gesamten Spielzustand und die Spiellogik
- **GameUI** bindet Events, rendert die Oberfläche und zeigt Feedback
- **config.js** liefert alle statischen Definitionen – Änderungen am Balancing nur hier

---

## Spielmechaniken

### Rohstoffe

| Rohstoff | Icon | Produktion durch | Speicher durch |
|----------|------|-----------------|----------------|
| Holz | 🪵 | Holzfäller | Lagerhaus |
| Lehm | 🧱 | Lehmgrube | Lagerhaus |
| Eisen | ⚙️ | Eisenmine | Lagerhaus |
| Getreide | 🌾 | Acker | Getreidespeicher |

- **Basis-Speicher**: 2.000 (Lagerhaus) / 2.000 (Getreidespeicher)
- **Pro Stufe**: +2.500 (Lagerhaus) / +2.000 (Getreidespeicher)
- Truppen verbrauchen Getreide pro Stunde – der Netto-Wert wird angezeigt

### Gebäude

| Gebäude | Icon | Effekt | Voraussetzungen |
|---------|------|--------|----------------|
| Hauptgebäude | 🏛️ | −5% Bauzeit pro Stufe | Keine |
| Kaserne | ⚔️ | +10% Rekrutierungsgeschwindigkeit/Stufe | Hauptgebäude St.1 |
| Lagerhaus | 📦 | +2.500 Holz/Lehm/Eisen-Kapazität/Stufe | Hauptgebäude St.1 |
| Getreidespeicher | 🌾 | +2.000 Getreide-Kapazität/Stufe | Hauptgebäude St.1 |
| Stadtmauer | 🧱 | +3% Verteidigungsbonus/Stufe | Hauptgebäude St.3, Versammlungsplatz St.1 |
| Versammlungsplatz | 🏕️ | Schaltet 2. Bau-Queue frei | Hauptgebäude St.1, Kaserne St.1 |

**Maximale Stufe**: 20 für alle Gebäude und Felder.

### Rohstofffelder

| Feld | Icon | Basis-Produktion | Steigerungsfaktor | Basis-Kosten (H/L/E/G) |
|------|------|-----------------|-------------------|------------------------|
| Holzfäller | 🪵 | 25/h | ×1,22 pro Stufe | 40/50/30/50 |
| Lehmgrube | 🧱 | 25/h | ×1,22 pro Stufe | 40/50/30/50 |
| Eisenmine | ⚙️ | 25/h | ×1,22 pro Stufe | 40/50/30/50 |
| Acker | 🌾 | 20/h | ×1,25 pro Stufe | 50/60/40/80 |

Acker produzieren weniger Basis-Output und kosten mehr Getreide – Getreide ist der Bottleneck-Rohstoff.

### Truppen

| Einheit | Icon | ⚔️ Angriff | 🛡️ Vert.(Inf) | 🛡️ Vert.(Kav) | 🌾 Verbr./h | Kosten (H/L/E/G) | Punkte |
|---------|------|-----------|---------------|---------------|------------|-------------------|--------|
| Miliz | 🛡️ | 30 | 45 | 30 | 1 | 35/30/20/15 | 1 |
| Schwertkämpfer | ⚔️ | 65 | 35 | 25 | 1 | 60/70/40/20 | 2 |
| Speerträger | 🔱 | 25 | 70 | 55 | 1 | 50/30/30/60 | 2 |
| Axtkämpfer | 🪓 | 80 | 20 | 15 | 2 | 70/50/60/20 | 3 |

**Truppen-Rollen:**
- **Miliz**: Günstige Allround-Einheit, beste Verteidigung pro Kosten
- **Schwertkämpfer**: Offensiv-Spezialist mit hohem Angriffswert
- **Speerträger**: Defensiv-Spezialist mit der besten Verteidigung
- **Axtkämpfer**: Schwerer Angreifer, maximaler Schaden, aber extrem verwundbar

### Bau-Queue

- Standard: **1 Bau-Slot**
- Mit Versammlungsplatz (St. 1+): **2 Bau-Slots**
- Die Queue verarbeitet Gebäude, Felder und Truppen-Rekrutierungen

### Punktesystem

Punkte werden berechnet aus:

- **Gebäude**: Punkte pro Stufe × Stufennummer (kumulativ)
- **Felder**: Punkte pro Stufe × Stufennummer (kumulativ)
- **Truppen**: Punkte pro Einheit × Anzahl

Beispiel: Hauptgebäude (10 Punkte/Stufe) auf Stufe 3 = 10×1 + 10×2 + 10×3 = 60 Punkte

### Meilensteine

| Meilenstein | Bedingung |
|------------|-----------|
| 🏗️ Erster Gebäudeausbau | Ein Gebäude auf Stufe 2+ |
| 🏰 Kaserne errichtet | Kaserne Stufe 1 |
| ⚔️ Erste Truppen | Mindestens 1 Truppe |
| 🏕️ Versammlungsplatz | 2. Bau-Queue freigeschaltet |
| 🧱 Stadtmauer | Stadtmauer Stufe 1 |
| 🌿 Alle Felder St. 2 | Alle 18 Felder auf Stufe 2 |
| 🏛️ Alle Gebäude | Alle 6 Gebäude mindestens Stufe 1 |
| 🌾 Meisterfarmer | Alle Felder Stufe 5 |
| 🛡️ 10 Truppen | 10 Truppen insgesamt |
| ⚔️ 50 Truppen | 50 Truppen insgesamt |
| 🏛️ HG Stufe 10 | Hauptgebäude Stufe 10 |
| ⭐ 100 Punkte | Score ≥ 100 |
| 🌟 500 Punkte | Score ≥ 500 |
| 💫 1.000 Punkte | Score ≥ 1.000 |

---

## Balancing-Formeln

### Baukosten

```
Kosten(Stufe) = Basis × 1,55^Stufe
```

### Bauzeit

```
Zeit(Stufe) = Basiszeit × 1,5^Stufe ÷ (1 + HG-Stufe × 0,05)
```

### Feld-Produktion

```
Produktion(Stufe) = ⌊ Basis × Faktor^(Stufe-1) ⌋
```

### Rekrutierungszeit

```
Zeit = Basiszeit × Anzahl × 1000 ÷ (1 + HG × 0,05) ÷ (1 + Kaserne × 0,10)
```

### Verteidigungsbonus

```
Verteidigung = Basis-Verteidigung × (1 + Mauer-Stufe × 0,03)
```

---

## Technologien

- **HTML5** – Semantische Struktur
- **CSS3** – Custom Properties, Flexbox, Grid, Animationen, `backdrop-filter`
- **Vanilla JavaScript** – ES-Module (`import`/`export`), Klassen
- **Google Fonts** – Cinzel (Überschriften), Crimson Text (Fließtext)
- **localStorage** – Persistenter Spielstand
- **GitHub Pages** – Deployment via GitHub Actions

---

## Deployment

Das Projekt wird automatisch via GitHub Actions auf GitHub Pages deployed:

1. Push auf den `main`-Branch löst den Workflow aus
2. Der Workflow lädt das gesamte Repository als Pages-Artifact hoch
3. GitHub Pages stellt die Dateien unter der konfigurierten URL bereit

Für lokales Testen wird ein HTTP-Server benötigt (wegen ES-Modulen):

```bash
# Python
python3 -m http.server 8000

# Node.js (npx)
npx serve .
```

Dann `http://localhost:8000` im Browser öffnen.
