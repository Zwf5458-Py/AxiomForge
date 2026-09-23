/**
 * AxiomForge - Collatz Core Math (shared between the browser visualizer and tests).
 * 考拉兹冰雹猜想的纯数学核心：与 UI/Canvas 解耦，可直接在 Node 中测试。
 *
 * UMD wrapper: attaches to window.CollatzCore in the browser,
 * and module.exports under Node so tests exercise the SAME code the UI ships.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CollatzCore = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Generate the Collatz trajectory from seed down to 1.
   * Mirrors the visualizer's bounded loop (cap 5000 terms, then stop).
   * Returns full dynamical statistics so the UI renders without re-deriving math.
   */
  function collatzSequence(seed) {
    const start = Math.max(1, Math.floor(Number(seed) || 1));
    const seq = [start];
    let peak = start;
    let peakIdx = 0;
    let oddCount = 0;

    while (seq[seq.length - 1] !== 1 && seq.length < 5000) {
      const cur = seq[seq.length - 1];
      if (cur % 2 === 0) {
        seq.push(cur / 2);
      } else {
        oddCount++;
        seq.push(3 * cur + 1);
      }
      if (seq[seq.length - 1] > peak) {
        peak = seq[seq.length - 1];
        peakIdx = seq.length - 1;
      }
    }

    const totalSteps = seq.length - 1;

    // Stopping time: first index k>0 with a_k < a_0.
    let stoppingTime = 0;
    let stoppingStepVal = start;
    for (let i = 1; i < seq.length; i++) {
      if (seq[i] < start) {
        stoppingTime = i;
        stoppingStepVal = seq[i];
        break;
      }
    }

    return {
      seed: start,
      sequence: seq,
      totalSteps,
      stoppingTime,
      stoppingStepVal,
      peakValue: peak,
      peakStep: peakIdx,
      oddSteps: oddCount,
      evenSteps: totalSteps - oddCount,
      expansionRatio: peak / start
    };
  }

  /**
   * Children of n in the inverse Collatz tree (moving upward):
   * - even branch: 2n (always valid)
   * - odd branch: (n - 1) / 3, valid iff n % 6 == 4, n > 4, and result is odd
   */
  function inverseCollatzChildren(n) {
    const children = [{ value: 2 * n, type: 'even' }];
    if (n % 6 === 4 && n > 4) {
      const oddChild = (n - 1) / 3;
      if (oddChild % 2 !== 0) {
        children.push({ value: oddChild, type: 'odd' });
      }
    }
    return children;
  }

  /**
   * Find the seed in [start, end] with maximal total stopping time.
   * Bounded exactly like the UI's extremal search: span capped at 5000
   * seeds and each trajectory capped at 3000 steps to keep the UI responsive.
   */
  function findMaxStoppingTimeInRange(start, end, opts) {
    const options = opts || {};
    const maxSpan = options.maxSpan || 5000;
    const maxStepsPerSeed = options.maxStepsPerSeed || 3000;

    const s = Math.max(1, Math.min(start, end));
    const e = Math.min(s + maxSpan, Math.max(start, end));
    let bestSeed = s;
    let maxSteps = 0;
    let bestPeak = 0;

    for (let i = s; i <= e; i++) {
      let v = i;
      let steps = 0;
      let localPeak = i;
      while (v !== 1 && steps < maxStepsPerSeed) {
        v = (v % 2 === 0) ? (v / 2) : (3 * v + 1);
        steps++;
        if (v > localPeak) localPeak = v;
      }
      if (steps > maxSteps) {
        maxSteps = steps;
        bestSeed = i;
        bestPeak = localPeak;
      }
    }

    return { seed: bestSeed, steps: maxSteps, peak: bestPeak };
  }

  return {
    collatzSequence,
    inverseCollatzChildren,
    findMaxStoppingTimeInRange
  };
});
