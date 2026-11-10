# Fürth 2040 – Die regenerative Stadt

Ein browserbasierter 3D-Prototyp für das Projekt **FÜRTH 2040 – DIE REGENERATIVE STADT**.

## Starten

Die Anwendung liegt vollständig in `index.html`. Öffne die Datei über einen lokalen Webserver, zum Beispiel mit VS Code Live Server oder:

```bash
python3 -m http.server 8000
```

Rufe anschließend `http://localhost:8000` im Browser auf. Für die 3D-Darstellung wird Three.js als ES-Modul von jsDelivr geladen; daher ist beim ersten Start eine Internetverbindung nötig.

## Enthaltene Funktionen

- Interaktive 3D-Stadtansicht mit Orbit-Steuerung, Zoom und schematischen Stadtbereichen
- Schematische Flussläufe für Rednitz, Pegnitz und Regnitz
- Ein-/Ausschalten von Ressourcenverbindungen und Wärmebild
- Regler für Photovoltaik, Gebäudesanierung, Entsiegelung, Regenwasserspeicher, Grünflächen und Mobilitätsanteile
- Sofortige Neuberechnung der Modellkennzahlen
- Vorgefertigte Szenarien „Heute“, „2030“ und „2040“
- Zurücksetzen und ein einfacher Optimierungs-Demonstrator

## Wissenschaftliche Einordnung

Die 3D-Geometrie ist eine vereinfachte, nicht grundstücksgenaue Modellstadt. Die dargestellten Werte sind illustrative Modellwerte und keine amtlichen Messdaten, Prognosen oder Kostenschätzungen. Die Berechnungslogik ist bewusst einfach gehalten und muss für wissenschaftliche Verwendung durch geprüfte lokale Daten, dokumentierte Parameter, Unsicherheitsbereiche und validierte Teilmodelle ersetzt beziehungsweise erweitert werden.

## Nächste Ausbaustufen

1. Verlässliche Geodaten und echte Stadtteilgrenzen integrieren
2. Simulationsmodelle für Energie, Wasser, Hitze und Mobilität fachlich vertiefen
3. Stadtteil-Dashboards und Ressourcenbilanzen ergänzen
4. Szenarien speichern, vergleichen und exportieren
5. Regenerationsbudget mit nachvollziehbarer sozialer Verteilungslogik implementieren
6. Daten- und Quellenpanel sowie Präsentationsmodus ergänzen

## Technologie

- Three.js
- JavaScript ES Modules
- HTML und CSS

