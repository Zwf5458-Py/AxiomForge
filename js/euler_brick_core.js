/**
 * AxiomForge - Euler Brick Core Math (shared between the browser visualizer and tests).
 * 完美欧拉砖的纯数论核心：与 UI/Canvas 解耦，可直接在 Node 中测试。
 *
 * Canonical arithmetic contract — mirrors funsearch/euler_brick.py naming
 * (is_d_ab_int, is_euler_brick, is_perfect_cuboid, integer_lengths_count).
 * One note on ordering conventions: the Python module names the c-a face
 * diagonal d_ac; the JS ecosystem (UI labels, theory docs) uses d_ca.
 * Both denote sqrt(c² + a²). This file uses d_ca consistently.
 *
 * UMD wrapper: attaches to window.EulerBrickCore in the browser,
 * and module.exports under Node so tests exercise the SAME code the UI ships.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.EulerBrickCore = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /** Integer square test: {isSquare, root}. */
  function isPerfectSquare(n) {
    if (n < 0) return { isSquare: false, root: 0 };
    const r = Math.round(Math.sqrt(n));
    return { isSquare: r * r === n, root: r };
  }

  /** Clamp a raw edge value to a positive safe integer, or return null. */
  function clampEdge(value) {
    const v = Number(value);
    if (!Number.isSafeInteger(v) || v <= 0) return null;
    return v;
  }

  /**
   * All 7 geometric lengths of cuboid (a, b, c) and their integrality.
   * Returns null when any edge is not a positive safe integer or the
   * squared sums exceed Number.MAX_SAFE_INTEGER (exactness boundary).
   */
  function getBrickMetrics(a, b, c) {
    const ea = clampEdge(a), eb = clampEdge(b), ec = clampEdge(c);
    if (ea === null || eb === null || ec === null) return null;

    const sqAB = ea * ea + eb * eb;
    const sqBC = eb * eb + ec * ec;
    const sqCA = ec * ec + ea * ea;
    const sqBody = ea * ea + eb * eb + ec * ec;
    if (![sqAB, sqBC, sqCA, sqBody].every(Number.isSafeInteger)) return null;

    const ab = isPerfectSquare(sqAB);
    const bc = isPerfectSquare(sqBC);
    const ca = isPerfectSquare(sqCA);
    const body = isPerfectSquare(sqBody);

    const d_ab = ab.isSquare ? ab.root : Math.sqrt(sqAB);
    const d_bc = bc.isSquare ? bc.root : Math.sqrt(sqBC);
    const d_ca = ca.isSquare ? ca.root : Math.sqrt(sqCA);
    const g = body.isSquare ? body.root : Math.sqrt(sqBody);
    const residual_g = Math.abs(g - Math.round(g));

    const is_euler_brick = ab.isSquare && bc.isSquare && ca.isSquare;
    const is_perfect_cuboid = is_euler_brick && body.isSquare;
    const integer_lengths_count =
      3 + (ab.isSquare ? 1 : 0) + (bc.isSquare ? 1 : 0) + (ca.isSquare ? 1 : 0) + (body.isSquare ? 1 : 0);

    return {
      a: ea, b: eb, c: ec,
      d_ab, is_d_ab_int: ab.isSquare,
      d_bc, is_d_bc_int: bc.isSquare,
      d_ca, is_d_ca_int: ca.isSquare,
      g, is_g_int: body.isSquare,
      residual_g,
      is_euler_brick,
      is_perfect_cuboid,
      integer_lengths_count
    };
  }

  /**
   * Necessary modular conditions any Euler brick satisfies:
   * mod 4 (>=2 even, >=1 divisible by 4), mod 16, mod 5, mod 11.
   */
  function verifyModularConstraints(a, b, c) {
    const edges = [a, b, c].map(v => Math.abs(Number(v) || 0));
    const evenCount = edges.filter(x => x % 2 === 0).length;
    const pass_mod4 = evenCount >= 2 && edges.some(x => x % 4 === 0);
    const pass_mod16 = edges.some(x => x % 16 === 0);
    const pass_mod5 = edges.some(x => x % 5 === 0);
    const pass_mod11 = edges.some(x => x % 11 === 0);
    return {
      pass_mod4,
      pass_mod16,
      pass_mod5,
      pass_mod11,
      all_passed: pass_mod4 && pass_mod16 && pass_mod5 && pass_mod11
    };
  }

  /**
   * Validate a proposed research candidate. A candidate must be an Euler
   * brick (all three face diagonals integral) AND satisfy the necessary
   * modular conditions; a small body-diagonal residual alone is meaningless.
   */
  function validateEulerCandidate(a, b, c) {
    const m = getBrickMetrics(a, b, c);
    if (!m || !m.is_euler_brick) return null;
    if (!verifyModularConstraints(m.a, m.b, m.c).all_passed) return null;
    return {
      a: m.a, b: m.b, c: m.c,
      d_ab: m.d_ab, d_bc: m.d_bc, d_ca: m.d_ca,
      g: m.g,
      residual: m.residual_g,
      is_perfect_cuboid: m.is_perfect_cuboid
    };
  }

  /**
   * Saunderson (1740) parametrization: given a Pythagorean triple
   * u² + v² = w², produce an Euler brick reduced by gcd.
   */
  function generateSaundersonBrick(u, v, w) {
    u = Math.abs(Math.trunc(u)); v = Math.abs(Math.trunc(v)); w = Math.abs(Math.trunc(w));
    if (u * u + v * v !== w * w) {
      throw new Error('Inputs (u, v, w) must form a Pythagorean triple: u^2 + v^2 = w^2');
    }
    let a = u * Math.abs(4 * v * v - w * w);
    let b = v * Math.abs(4 * u * u - w * w);
    let c = 4 * u * v * w;
    const gcd3 = (x, y, z) => {
      const gcd = (p, q) => (q === 0 ? p : gcd(q, p % q));
      return gcd(gcd(x, y), z);
    };
    const g = gcd3(a, b, c);
    if (g > 1) { a /= g; b /= g; c /= g; }
    return [a, b, c];
  }

  /**
   * Search the neighborhood of (baseA, baseB, baseC) within ±radius for the
   * Euler brick with the smallest body-diagonal residual. Returns null when
   * no Euler brick exists in range (honest "no candidate" instead of a
   * false near-miss).
   */
  function searchNeighborhoodEuler(baseA, baseB, baseC, radius) {
    const range = Math.max(5, Math.min(200, Math.round(radius)));
    let best = validateEulerCandidate(baseA, baseB, baseC);

    // Cheap necessary congruence sieve before the expensive square tests.
    const step = range > 60 ? 2 : 1;
    for (let da = -range; da <= range; da += step) {
      const na = Math.max(1, baseA + da);
      for (let db = -range; db <= range; db += step) {
        const nb = Math.max(1, baseB + db);
        for (let dc = -range; dc <= range; dc += step) {
          const nc = Math.max(1, baseC + dc);
          if (!verifyModularConstraints(na, nb, nc).all_passed) continue;
          const candidate = validateEulerCandidate(na, nb, nc);
          if (candidate && (!best || candidate.residual < best.residual)) best = candidate;
        }
      }
    }
    return best;
  }

  return {
    isPerfectSquare,
    getBrickMetrics,
    verifyModularConstraints,
    validateEulerCandidate,
    generateSaundersonBrick,
    searchNeighborhoodEuler
  };
});
