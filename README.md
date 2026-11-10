# Fürth 2040 – Die regenerative Stadt

Eine browserbasierte Simulation für das Projekt **FÜRTH 2040 – DIE REGENERATIVE STADT**. Neben der interaktiven Modellansicht kann das amtliche 3D-Gebäudemodell der Stadt Fürth eingeblendet werden. Die Modellkennzahlen bleiben vereinfachte Szenarioindikatoren und sind keine amtlichen Messwerte.

## Lokal starten

Voraussetzung: Node.js 20 oder neuer.

```bash
npm install
npm run dev
```

Vite zeigt die lokale Adresse im Terminal an.

## Tests ausführen

```bash
npm test          # Modell- und Berechnungslogik
npm run build     # Produktions-Build
npx playwright install chromium
npm run test:e2e  # Browser-Interaktionen
```

GitHub Actions führt Modelltests, Build und Browser-Tests bei Pushes und Pull Requests automatisch aus. Ein zusätzlicher Workflow veröffentlicht den Produktions-Build auf GitHub Pages. Dafür muss unter **Settings → Pages → Build and deployment → Source** einmalig **GitHub Actions** ausgewählt werden.

## Aktueller Funktionsumfang

- Regler für Photovoltaik, Sanierung, Entsiegelung, Regenwasserspeicher, Grünflächen und Mobilität
- Drei Szenarien (Heute, 2030, 2040), Zurücksetzen und Optimierungs-Demonstrator
- Live-Berechnung der Modellkennzahlen und Handlungshinweis
- Schematische Three.js-Ansicht mit Zoom/Drehung, Netzwerk, PV-Dachflächen und Wärmebild\n- Umschaltbare amtliche 3D-Gebäudeansicht aus dem ArcGIS SceneServer der Stadt Fürth (Gebäude-LoDmax); Gebäudedetails können per Klick geöffnet werden\n- Reale Bevölkerungsdaten: 132.036 Einwohner (2024) und amtliche Vorausberechnung von 133.000 Einwohnern für 2034
- 3D-Ansicht fällt bei fehlender WebGL-Unterstützung aus, ohne die Modellregler zu blockieren

## Fachliche Grenzen

Die standardmäßige Three.js-Stadtgeometrie und die Regenerations-/Energie-/Wärme-Kennzahlen sind illustrative Modellwerte. Die alternative 3D-Gebäudeansicht nutzt dagegen den öffentlichen SceneServer „Gebaeude_LoDmax“ der Stadt Fürth; die Geometrie und Gebäudeattribute stammen aus dem amtlichen Geoportal. Die Bevölkerungswerte stammen aus dem Demographieprofil der kreisfreien Stadt Fürth des Bayerischen Landesamts für Statistik. Die Werte für PV-Produktion, Wärmebelastung, Regenwasserrückhalt und Mobilitätswirkung bleiben Modellannahmen und dürfen nicht als gemessene Fürther Werte interpretiert werden.

## Verwendete reale Datenquellen\n\n- [Geoportal der Stadt Fürth – amtliches 3D-Gebäudemodell (SceneServer)](https://geoportal.fuerth.de/server/rest/services/Gebaeude_LoDmax/SceneServer)\n- [Bayerisches Landesamt für Statistik – Demographieprofil Fürth](https://www.statistik.bayern.de/mam/statistik/gebiet_bevoelkerung/demographische_profile/09563.pdf)\n- [Stadt Fürth – Geoportal und Solar-/Grünkataster](https://www.fuerth.de/service/geoportal/)\n- [Stadtforschung und Statistik Nürnberg/Fürth – Nachhaltigkeit, Umwelt und Verkehr](https://www.nuernberg.de/internet/statistik/umwelt_und_infrastruktur_fue.html)\n\n## Nächste Schritte – erst nach bestandenen Tests

1. Stabilität der Oberfläche und Berechnungen verifizieren
2. Interaktionen und Szenarien automatisiert testen
3. Bedienbarkeit auf Desktop und Smartphone prüfen
4. Fehler und Regressionen beheben
5. Erst danach reale Geodaten und belastbare Teilmodelle integrieren
