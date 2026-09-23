/**
 * Node tests for the REAL shipped Collatz code (js/collatz_core.js and js/collatz.js).
 * Unlike tests/test_collatz.py (a Python-only clone), these exercise the exact
 * module the browser loads, so they cannot stay green while the UI regresses.
 *
 * Run: node tests/test_collatz_core.mjs
 */
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// --- 1. Core math module (same code the browser loads) ---
const core = require(join(root, 'js', 'collatz_core.js'));

// Seed 1 is trivial
{
  const r = core.collatzSequence(1);
  assert.deepEqual(r.sequence, [1]);
  assert.equal(r.totalSteps, 0);
  assert.equal(r.peakValue, 1);
  assert.equal(r.oddSteps, 0);
}

// Legendary seed 27: 111 steps, peak 9232, 41 odd / 70 even
{
  const r = core.collatzSequence(27);
  assert.equal(r.totalSteps, 111, 'seed 27 total steps');
  assert.equal(r.peakValue, 9232, 'seed 27 peak');
  assert.equal(r.oddSteps, 41, 'seed 27 odd steps');
  assert.equal(r.evenSteps, 70, 'seed 27 even steps');
  assert.equal(r.sequence[0], 27);
  assert.equal(r.sequence[r.sequence.length - 1], 1);
}

// Seed 11: stopping time 8 (first a_k < 11), total 14, peak 52
{
  const r = core.collatzSequence(11);
  assert.equal(r.stoppingTime, 8, 'seed 11 stopping time');
  assert.equal(r.stoppingStepVal, 10, 'seed 11 first drop value');
  assert.equal(r.totalSteps, 14, 'seed 11 total steps');
  assert.equal(r.peakValue, 52, 'seed 11 peak');
}

// Invalid / non-positive seeds clamp to 1
{
  const r = core.collatzSequence(0);
  assert.equal(r.seed, 1);
  assert.deepEqual(r.sequence, [1]);
}

// Inverse tree children rules
{
  assert.deepEqual(core.inverseCollatzChildren(1).map(c => [c.value, c.type]), [[2, 'even']]);
  assert.deepEqual(core.inverseCollatzChildren(4).map(c => [c.value, c.type]), [[8, 'even']]);
  const c16 = core.inverseCollatzChildren(16).map(c => [c.value, c.type]);
  assert.ok(c16.some(c => c[0] === 32 && c[1] === 'even'));
  assert.ok(c16.some(c => c[0] === 5 && c[1] === 'odd'));
}

// Extremal search in [1, 20]: max total stopping time is 20 (seed 18 or 19)
{
  const { seed, steps } = core.findMaxStoppingTimeInRange(1, 20);
  assert.equal(steps, 20);
  assert.ok(seed === 18 || seed === 19, `unexpected best seed ${seed}`);
}

// --- 2. The visualizer class itself consumes the core (shipped wiring) ---
global.window = {};
global.document = { getElementById: () => null };
global.CollatzCore = core; // browser injects window.CollatzCore; mirror that here
eval(readFileSync(join(root, 'js', 'collatz.js'), 'utf8'));

const engine = Object.create(global.window.CollatzVisualizer.prototype);
engine.seed = 0;
engine.sequence = [];
engine.stats = {};
engine.updateDashboardUI = () => {};

engine.computeSequence(27);
assert.equal(engine.stats.totalSteps, 111);
assert.equal(engine.stats.peakValue, 9232);

engine.computeSequence(11);
assert.equal(engine.stats.stoppingTime, 8);
assert.equal(engine.stats.totalSteps, 14);

const extremal = engine.findExtremalSeed(1, 20);
assert.equal(extremal.steps, 20);
assert.equal(engine.sequence[0], extremal.seed);

// Trajectory transform is a single source of truth for hover + render
engine.width = 800;
engine.height = 600;
engine.trajZoom = 1.0;
engine.trajPanX = 0;
engine.trajPanY = 0;
engine.scaleType = 'log';
const t = engine.getTrajectoryTransform();
assert.ok(t.chartW > 0 && t.chartH > 0);
assert.equal(typeof t.getScreenX(0), 'number');
assert.equal(typeof t.getScreenY(1), 'number');

console.log('test_collatz_core.mjs: all assertions passed (real shipped JS)');
