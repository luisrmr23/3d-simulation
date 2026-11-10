export const DEFAULTS = Object.freeze({
  solar: 24, retrofit: 18, permeable: 12, storage: 20,
  green: 20, transit: 28, bike: 32
});

export const SCENARIOS = Object.freeze({
  today: DEFAULTS,
  2030: Object.freeze({ solar: 42, retrofit: 35, permeable: 28, storage: 40, green: 38, transit: 35, bike: 42 }),
  2040: Object.freeze({ solar: 72, retrofit: 68, permeable: 58, storage: 72, green: 70, transit: 42, bike: 48 })
});

export function normalizeState(input = {}) {
  const state = {};
  for (const [key, fallback] of Object.entries(DEFAULTS)) {
    const raw = Number(input[key] ?? fallback);
    state[key] = Number.isFinite(raw)
      ? Math.min(key === 'transit' ? 70 : key === 'bike' ? 80 : 100, Math.max(0, raw))
      : fallback;
  }
  return state;
}

export function calculateMetrics(input = DEFAULTS) {
  const s = normalizeState(input);
  const energy = Math.round(0.75 + s.solar * 0.72);
  const heating = Math.max(28, Math.round(100 - s.retrofit * 0.55 - s.solar * 0.1));
  const retention = Math.min(96, Math.round(10 + s.permeable * 0.48 + s.storage * 0.34));
  const heat = Math.round(36 - s.green * 0.085 - s.permeable * 0.025);
  const green = Math.round(12 + s.green * 0.72);
  const mobility = Math.min(100, s.transit + s.bike);
  const index = Math.round(Math.min(100, Math.max(0,
    18 + s.solar * 0.17 + s.retrofit * 0.12 + s.permeable * 0.11 +
    s.storage * 0.08 + s.green * 0.2 + mobility * 0.12
  )));
  return { energy, heating, retention, heat, green, mobility, index };
}

export function getRecommendation(metrics) {
  if (metrics.heat > 31) return 'Die modellierte Wärmebelastung ist erhöht. Mehr Bäume, entsiegelte Flächen und Schattenräume können gemeinsam helfen.';
  if (metrics.retention < 45) return 'Der Regenwasserrückhalt ist noch gering. Prüfe zusätzliche Speicher und Versickerungsflächen.';
  if (metrics.energy < 45) return 'Die lokale PV-Produktion bleibt niedrig. Prüfe geeignete Dächer und lokale Energiegemeinschaften.';
  if (metrics.mobility < 65) return 'Der Anteil aktiver Mobilität und ÖPNV kann steigen, wenn sichere Wege und gute Anschlüsse ausgebaut werden.';
  return 'Das Modell zeigt ein ausgewogeneres Ressourcensystem. Prüfe nun Kosten, Flächenkonflikte und soziale Verteilung.';
}
