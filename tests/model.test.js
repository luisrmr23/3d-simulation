import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS, SCENARIOS, normalizeState, calculateMetrics, getRecommendation } from '../src/model.js';

test('default state produces finite metrics in expected ranges', () => {
  const result = calculateMetrics(DEFAULTS);
  for (const value of Object.values(result)) assert.ok(Number.isFinite(value));
  assert.ok(result.index >= 0 && result.index <= 100);
  assert.ok(result.retention >= 0 && result.retention <= 96);
  assert.ok(result.mobility >= 0 && result.mobility <= 100);
});

test('normalization clamps values and replaces invalid input', () => {
  const result = normalizeState({ solar: 500, transit: -5, bike: 'not-a-number' });
  assert.equal(result.solar, 100);
  assert.equal(result.transit, 0);
  assert.equal(result.bike, DEFAULTS.bike);
});

test('higher PV increases modeled production', () => {
  assert.ok(calculateMetrics({ ...DEFAULTS, solar: 80 }).energy > calculateMetrics({ ...DEFAULTS, solar: 10 }).energy);
});

test('more renovation and PV do not increase modeled heating demand', () => {
  assert.ok(calculateMetrics({ ...DEFAULTS, retrofit: 80, solar: 80 }).heating < calculateMetrics(DEFAULTS).heating);
});

test('more unsealed area and storage increase rainwater retention', () => {
  assert.ok(calculateMetrics({ ...DEFAULTS, permeable: 80, storage: 80 }).retention > calculateMetrics(DEFAULTS).retention);
});

test('more green space reduces modeled heat stress', () => {
  assert.ok(calculateMetrics({ ...DEFAULTS, green: 90 }).heat < calculateMetrics(DEFAULTS).heat);
});

test('mobility share is capped and scenarios are valid states', () => {
  assert.equal(calculateMetrics({ ...DEFAULTS, transit: 70, bike: 80 }).mobility, 100);
  for (const scenario of Object.values(SCENARIOS)) {
    for (const value of Object.values(normalizeState(scenario))) assert.ok(value >= 0 && value <= 100);
  }
});

test('recommendation always returns readable text', () => {
  assert.equal(typeof getRecommendation(calculateMetrics(DEFAULTS)), 'string');
  assert.ok(getRecommendation(calculateMetrics(DEFAULTS)).length > 10);
});
