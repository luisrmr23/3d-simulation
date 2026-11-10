# Fürth 2040 – Die regenerative Stadt

Ein browserbasierter Prototyp für das Projekt **FÜRTH 2040 – DIE REGENERATIVE STADT**. Der aktuelle Schwerpunkt liegt ausdrücklich auf stabilen Grundfunktionen und automatisierten Tests – noch nicht auf einer realitätsgetreuen 3D-Stadt.

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

GitHub Actions führt Modelltests, Build und Browser-Tests bei Pushes und Pull Requests automatisch aus.

## Aktueller Funktionsumfang

- Regler für Photovoltaik, Sanierung, Entsiegelung, Regenwasserspeicher, Grünflächen und Mobilität
- Drei Szenarien (Heute, 2030, 2040), Zurücksetzen und Optimierungs-Demonstrator
- Live-Berechnung der Modellkennzahlen und Handlungshinweis
- Schematische Three.js-Ansicht mit Zoom/Drehung, Netzwerk, PV-Dachflächen und Wärmebild
- 3D-Ansicht fällt bei fehlender WebGL-Unterstützung aus, ohne die Modellregler zu blockieren

## Fachliche Grenzen

Die Stadtgeometrie und alle Kennzahlen sind Platzhalter bzw. illustrative Modellwerte. Sie sind keine amtlichen Messdaten, Prognosen, geprüften Energie- oder Klimabilanzen. Die Flussläufe und Stadtteilpositionen sind schematisch und nicht vermessen. Die Modellformeln sind bewusst einfach und müssen fachlich kalibriert und mit lokalen Daten belegt werden, bevor Ergebnisse als Aussagen über Fürth verwendet werden.

## Nächste Schritte – erst nach bestandenen Tests

1. Stabilität der Oberfläche und Berechnungen verifizieren
2. Interaktionen und Szenarien automatisiert testen
3. Bedienbarkeit auf Desktop und Smartphone prüfen
4. Fehler und Regressionen beheben
5. Erst danach reale Geodaten und belastbare Teilmodelle integrieren
