# Manifund Fast Grant Application: Exploratory Research Proposal

<p align="center">
  <strong>English</strong> | 
  <a href="manifund_grant_pitch_CN.md">简体中文</a>
</p>

> **Project Title**: AxiomForge: Exploring Algebraic Structural Priors in Heuristic Search for Extremal Combinatorics  
> **Applicant Category**: Independent Open-Source AI & Math Researcher  
> **Requested Funding**: $4,000 USD (3-Month Small Exploratory Grant)  
> **Primary Deliverables**: Fully reproducible benchmark codebase, multi-seed statistical report, integration of real LLM program evolution loop, and open technical reports.  
> **Open Source License**: MIT License ([Repository Link](https://github.com/Zwf5458-Py/AxiomForge))  

---

## 1. Project Summary & Honest Assessment of Current State

Inspired by DeepMind's *FunSearch* (*Nature 2023*), we have built **AxiomForge**, an open, lightweight heuristic search and evaluation framework focused on extreme combinatorial geometry—specifically the Cap Set problem in finite affine spaces $\mathbb{F}_3^n$.

### Current Proof of Work (Baseline Prototype):
In controlled multi-seed statistical trials across $\mathbb{F}_3^4$ to $\mathbb{F}_3^7$ (10 independent random seeds per dimension, identical evaluation budgets):
- **Naive baseline heuristics** (linear coordinate weights) deterministically stagnate at elementary hypercube bounds of size $2^n$ ($16, 32, 64, 128$).
- **Heuristics injected with algebraic priors** (Hamming weight $L_0$ slices and affine hyperplane modulo constraints) consistently break this hypercube barrier, reaching the exact theoretical maximum at $n=4$ ($20/20$) and clear improvements at every higher dimension.

| Dim | Baseline (Naive) | Symmetry Prior | Best Observed | Reference Benchmark | Gain |
| :---: | :---: | :---: | :---: | :---: | :---: |
| $n=4$ | $16 \pm 0.0$ | $19.2 \pm 1.03$ | **20 / 20** | 20 (exact max, Pellegrino 1971) | **+20.0%** |
| $n=5$ | $32 \pm 0.0$ | $37.6 \pm 0.70$ | **38 / 45** | 45 (exact max, Edel 2004) | **+17.5%** |
| $n=6$ | $64 \pm 0.0$ | $77.2 \pm 1.03$ | **78 / 112** | 112 (exact max, Edel/Potechin 2008) | **+20.6%** |
| $n=7$ | $128 \pm 0.0$ | $156.8 \pm 0.63$ | **157 / 236** | 236 (best-known lower bound, Edel 2004) | **+22.5%** |

All raw data is publicly reproducible: `experiments/results_n{4,5,6,7}_statistical.json` (10 seeds; 20 iterations per dimension, 50 for $n=7$).

> **Latest Milestone Update (Sep 16, 2026)**: With our newly developed trinary integer solver (`FastCapSetEnv`) and inversion polarization priors, peak observations advanced to **81 points in 6D** (+26.56%, locking onto the maximal orthogonal product bound $9 \times 9 = 81$) and **166 points in 7D** (+29.69%, 100% collinear-free). See the full technical report: [`EXPERIMENT_HIGH_DIM.md`](../../EXPERIMENT_HIGH_DIM.md).

### Critical Limitations We Acknowledge:
1. **Distance to State-of-the-Art**: Our current best observation at $n=7$ (157 points) is still 79 points short of the best-known lower bound (236 points, Edel 2004).
2. **Template Search vs. True LLM Evolution**: The existing prototype relies on parameterized algebraic template mutations rather than an end-to-end autonomous LLM code-generation feedback loop.

---

## 2. Proposed Work & Theory of Change ($4,000 USD, 3 Months)

Rather than over-promising world records, this grant will support bridging our prototype into a rigorous, reproducible AI-assisted math discovery platform:

### Objective 1: Implement Real LLM Program Synthesis Loop (Month 1)
Replace static mutation templates with automated LLM calls (DeepSeek-R1 / Qwen2.5-Coder / OpenAI API) in an isolated execution sandbox with multi-island genetic diversity maintenance.

### Objective 2: Rigorous Multi-Seed Statistical Validation (Month 2)
Run pre-registered evaluations over 30+ random seeds across dimensions $n=5, 6, 7$. Report standard deviation, confidence intervals, and ablation studies to scientifically isolate which prior structures yield genuine improvements.

### Objective 3: Cross-Domain Generalization & Open Report (Month 3)
Extend the evolution engine from Cap Sets to 1D/2D Online Bin Packing (industrial heuristic search) and publish a comprehensive preprint/technical report on arXiv / GitHub.

---

## 3. Budget & Resource Transparency ($4,000 USD)

| Category | Amount (USD) | Detailed Justification |
| :--- | :--- | :--- |
| **LLM API Tokens** | $1,200 | DeepSeek-V3/R1 and Claude 3.5 Haiku API calls for ~30,000 program generation & mutation cycles. |
| **Independent Research Runway** | $2,400 | 3 months of part-time living runway ($800/mo) allowing focused research without corporate distractions. |
| **Compute & CI Infrastructure** | $400 | GitHub Actions runner compute, persistent database hosting for program pools. |
| **Total** | **$4,000** | Frugal, transparent, and focused entirely on verifiable milestones. |

---

## 4. Measurable Deliverables & Commitments

- [x] Working, tested Python repository under MIT License with passing CI.
- [ ] Complete integration of LLM-in-the-loop generator within 30 days.
- [ ] Multi-seed statistical benchmark dataset released openly as CSV/JSON.
- [ ] Public bi-weekly progress updates on Manifund and Twitter/Substack.
