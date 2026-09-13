# AxiomForge Statistical Evaluation Report: Preliminary Assessment of Algebraic Structural Priors in Cap Set Heuristic Search

<p align="center">
  <strong>English</strong> | 
  <a href="EXPERIMENT_CAPSET_CN.md">简体中文</a>
</p>

> **Nature of Experiment**: Early Research Prototype Evaluation  
> **Topic**: Evaluation of Algebraic Structural Priors in Heuristic Search for Cap Sets in $\mathbb{F}_3^5$  
> **Code & Data Repository**: [https://github.com/Zwf5458-Py/AxiomForge](https://github.com/Zwf5458-Py/AxiomForge)  
> **Evaluation Protocol**: 10 independent random seeds, identical candidate sampling budget (20 iterations per trial)  
> **Experiment Timestamp**: 2026-09-12 11:56:22  

---

## 1. Statistical Summary

In the affine finite space $\mathbb{F}_3^5$ ($3^5 = 243$ candidate points), under identical computational budgets and evaluation iteration counts, we compared the **"Naive Heuristic Baseline"** against the **"Symmetry-Injected Prior Group"**:

| Experimental Group | Seeds | Mean ± Std Dev | Median | Observed Range [Min, Max] | Gain vs. Naive Baseline | Benchmark Reference (45 pts, Edel (2004)) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Control (Naive)** | 10 | **32 ± 0.0** | 32.0 | [32, 32] | Baseline | 71.1% of maximum |
| **Experiment (Symmetry)** | 10 | **37.6 ± 0.7** | 38.0 | [36, 38] | **+5.6 pts (+17.5%)** | 84.4% of maximum |

### Objective Observations & Analysis:
1. **Statistically Significant Gain**: Across multiple random seeds, the symmetry-injected template consistently outperforms the naive linear coordinate baseline. This demonstrates that Hamming weight level-set slicing ($L_0$ norm) combined with modular arithmetic biases helps greedy rankers construct non-collinear point configurations earlier.
2. **Distance to Known Benchmarks**:
   - For $n=4$, the experimental group consistently hits the theoretical maximum of 20 points ($20/20$).
   - For higher dimensions ($n=7$), our single best observation is 157 points, which still lags behind the open best-known lower bound (236 points, Edel 2004; ratio ~66.5%). These results validate preliminary acceleration under constrained template search, but make no claim to breaking or approaching high-dimensional world records.

### 5D Point Set Topology and A/B Convergence Visuals:

<div align="center">
  <img src="assets/preview_funsearch_5d.png" alt="5D Cap Set Topology & AB Convergence" width="90%">
  <p><em>Figure: 5-dimensional (243-point space) hypersphere topological projection (breaking the 32-point trap to reach 38 points, with verified collinear count strictly equal to 0) alongside multi-round A/B convergence trajectories.</em></p>
</div>

---

## 2. Top-Performing Heuristic Function in Benchmark

The following snippet represents the highest-scoring candidate function captured during the statistical trials (single-run peak: 38 / 45 points in $\mathbb{F}_3^5$):

```python
def priority(p: tuple, n: int) -> float:
    # Algebraic prior: L0-norm slicing & modular congruence
    l0_norm = sum(1 for x in p if x != 0)
    # Reward points situated in the intermediate Hamming weight slice
    slice_bonus = 60.0 if l0_norm == (n // 2 + 1) else 0.0
    parity = sum(p) % 3
    return float(slice_bonus + (parity == 0) * 30.0 + p[0] * 3.39)
```

### Objective Architectural Characteristics:
- **Active Structural Features**: The function leverages an $L_0$-norm intermediate slice bias combined with a coordinate sum modulo 3 congruence check (`sum(p) % 3 == 0`).
- **Limitation**: This candidate evolved via parameter search across algebraic templates; it should be regarded as template parameter optimization rather than spontaneous LLM generation of complex polynomial methods.

---

## 3. Next-Phase Research Agenda & Funding Goals

Based on this early prototype, subsequent development will focus on three key pillars:
1. **End-to-End LLM Program Synthesis**: Transitioning from parametric templates to open-ended code generation via LLMs (DeepSeek-R1 / Qwen2.5-Coder) evaluated inside isolated sandboxes;
2. **Multi-Island Genetic Population Diversity**: Preventing premature greedy convergence and stagnation;
3. **Cross-Domain Generalization**: Applying the same evolutionary paradigm to Online Bin Packing and extremal graph theory problems.
