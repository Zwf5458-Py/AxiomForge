/**
 * Node tests for the REAL shipped Euler Brick browser logic:
 * js/euler_brick_core.js (canonical arithmetic contract) and
 * js/eulerbrick.js (the visualizer class consuming that contract).
 * These guard the fixes from 5378be7 and the schema unification so they
 * cannot regress silently.
 *
 * Run: node tests/test_euler_brick_ui.mjs
 */
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// --- 1. Core module: canonical contract shared with the browser ---
const core = require(join(root, 'js', 'euler_brick_core.js'));

// isPerfectSquare
assert.deepEqual(core.isPerfectSquare(15625), { isSquare: true, root: 125 });
assert.equal(core.isPerfectSquare(73225).isSquare, false);
assert.equal(core.isPerfectSquare(-4).isSquare, false);

// getBrickMetrics exposes the canonical schema (Python-pattern keys)
{
  const m = core.getBrickMetrics(44, 117, 240);
  assert.equal(m.is_euler_brick, true);
  assert.equal(m.is_perfect_cuboid, false);
  assert.equal(m.d_ab, 125);
  assert.equal(m.d_ac === undefined, true, 'JS convention uses d_ca, not d_ac');
  assert.equal(m.d_ca, 244);
  assert.equal(m.d_bc, 267);
  assert.equal(m.is_d_ab_int, true);
  assert.equal(m.is_d_bc_int, true);
  assert.equal(m.is_d_ca_int, true);
  assert.equal(m.is_g_int, false);
  assert.equal(m.integer_lengths_count, 6);
  assert.ok(Math.abs(m.g - 270.60118) < 1e-3);
  assert.ok(Math.abs(m.residual_g - 0.39882) < 1e-3);
}

// getBrickMetrics rejects non-positive / unsafe edges
assert.equal(core.getBrickMetrics(0, 1, 1), null);
assert.equal(core.getBrickMetrics(-3, 4, 5), null);
assert.equal(core.getBrickMetrics(1.5, 4, 5), null);

// verifyModularConstraints mirrors the Python necessary conditions
{
  const ok = core.verifyModularConstraints(44, 117, 240);
  assert.deepEqual(ok, { pass_mod4: true, pass_mod16: true, pass_mod5: true, pass_mod11: true, all_passed: true });
  assert.equal(core.verifyModularConstraints(1, 3, 5).all_passed, false);
}

// validateEulerCandidate: ordinary cuboids and congruence violators rejected
assert.equal(core.validateEulerCandidate(1, 86, 278), null, 'ordinary cuboid must be rejected');
assert.equal(core.validateEulerCandidate(3, 4, 5), null, 'non-Euler triple must be rejected');
assert.equal(core.validateEulerCandidate(1, 3, 5), null);
{
  const c = core.validateEulerCandidate(44, 117, 240);
  assert.ok(c);
  assert.equal(c.is_perfect_cuboid, false);
  assert.equal(c.d_ab, 125);
}

// Saunderson (3,4,5) regenerates Halcke's brick
{
  const [a, b, c] = core.generateSaundersonBrick(3, 4, 5);
  assert.deepEqual([a, b, c].sort((x, y) => x - y), [44, 117, 240]);
  assert.throws(() => core.generateSaundersonBrick(1, 2, 3), /Pythagorean/);
}

// Neighborhood search: valid base stays, near base recovers Halcke, barren returns null
{
  assert.equal(core.searchNeighborhoodEuler(44, 117, 240, 50)?.a, 44);
  const near = core.searchNeighborhoodEuler(43, 116, 239, 5);
  assert.deepEqual([near.a, near.b, near.c], [44, 117, 240]);
  assert.equal(core.searchNeighborhoodEuler(7, 9, 11, 60), null, 'barren neighborhood must honestly return null');
}

// --- 2. Visualizer class consumes the same core (shipped wiring) ---
global.window = {};
global.document = { getElementById: () => null };
global.EulerBrickCore = core; // browser injects window.EulerBrickCore; mirror that here
eval(readFileSync(join(root, 'js', 'eulerbrick.js'), 'utf8'));

const engine = Object.create(global.window.EulerBrickVisualizer.prototype);
engine.a = 44; engine.b = 117; engine.c = 240;

// Ordinary cuboid with integer body diagonal but irrational face diagonals
// must be rejected (regression for the (1, 86, 278) false candidate).
assert.equal(engine.validateEulerCandidate(1, 86, 278), null, 'ordinary cuboid must be rejected');
assert.equal(engine.validateEulerCandidate(3, 4, 5), null, 'non-Euler triple must be rejected');

// Halcke 1719 minimal Euler brick is accepted with correct geometry.
{
  const c = engine.validateEulerCandidate(44, 117, 240);
  assert.ok(c, 'Halcke brick must validate');
  assert.equal(c.is_perfect_cuboid, false);
  assert.equal(c.d_ab, 125);
  assert.equal(c.d_bc, 267);
  assert.equal(c.d_ca, 244);
  assert.ok(Math.abs(c.g - 270.60118) < 1e-3);
  assert.ok(Math.abs(c.residual - 0.39882) < 1e-3);
}

// Residual search from a valid base returns only valid Euler bricks.
{
  const result = engine.searchMinimalResidual(50);
  assert.ok(result, 'search must find a candidate');
  assert.ok(engine.validateEulerCandidate(result.a, result.b, result.c), 'search result must be a valid Euler brick');
  assert.ok(Number.isInteger(result.d_ab) && Number.isInteger(result.d_bc) && Number.isInteger(result.d_ca));
}

// Residual search from a non-Euler base near Halcke's brick finds it.
{
  engine.a = 43; engine.b = 116; engine.c = 239;
  const result = engine.searchMinimalResidual(5);
  assert.ok(result, 'search must find a candidate near a known Euler brick');
  assert.deepEqual([result.a, result.b, result.c], [44, 117, 240]);
}

// A barren neighborhood (no Euler brick exists with all edges <= 71)
// honestly returns null instead of inventing a false candidate.
{
  engine.a = 7; engine.b = 9; engine.c = 11;
  assert.equal(engine.searchMinimalResidual(60), null);
}

// Parser: strict SOLUTION format preferred; garbage rejected.
{
  assert.deepEqual(engine.parseEulerResponse('SOLUTION: [10, 20, 30]'), { a: 10, b: 20, c: 30 });
  assert.equal(engine.parseEulerResponse('no candidate here'), null);
  assert.equal(engine.parseEulerResponse(''), null);
  assert.equal(engine.parseEulerResponse(null), null);
}

console.log('test_euler_brick_ui.mjs: all assertions passed (real shipped JS)');
