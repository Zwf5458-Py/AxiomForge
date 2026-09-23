/**
 * Node tests for the REAL shipped Euler Brick browser logic
 * (js/eulerbrick.js): candidate validation, residual search, parser.
 * These guard the fixes made in 5378be7 so they cannot regress silently.
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

global.window = {};
global.document = { getElementById: () => null };
eval(readFileSync(join(root, 'js', 'eulerbrick.js'), 'utf8'));

const proto = global.window.EulerBrickVisualizer.prototype;
const engine = Object.create(proto);
engine.a = 44; engine.b = 117; engine.c = 240;

// Ordinary cuboid with integer body diagonal but irrational face diagonals
// must be rejected (regression for the (1, 86, 278) false candidate).
{
  assert.equal(engine.validateEulerCandidate(1, 86, 278), null, 'ordinary cuboid must be rejected');
  assert.equal(engine.validateEulerCandidate(3, 4, 5), null, 'non-Euler triple must be rejected');
}

// Halcke 1719 minimal Euler brick is accepted with correct geometry.
{
  const c = engine.validateEulerCandidate(44, 117, 240);
  assert.ok(c, 'Halcke brick must validate');
  assert.equal(c.isPerfect, false);
  assert.equal(c.d_ab, 125);
  assert.equal(c.d_bc, 267);
  assert.equal(c.d_ca, 244);
  assert.ok(Math.abs(c.g - 270.60118) < 1e-3);
  assert.ok(Math.abs(c.residual - 0.39882) < 1e-3);
}

// Modular necessary conditions are enforced (1, 3, 5) violates mod 4/16/5/11.
{
  assert.equal(engine.validateEulerCandidate(1, 3, 5), null);
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
  assert.ok(engine.validateEulerCandidate(result.a, result.b, result.c));
  assert.equal(result.a, 44);
  assert.equal(result.b, 117);
  assert.equal(result.c, 240);
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
