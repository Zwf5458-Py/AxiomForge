<p align="center">
  <a href="https://github.com/Zwf5458-Py/AxiomForge">
    <img src="assets/logo.svg" alt="AxiomForge Logo" width="130" height="130">
  </a>
</p>

<h1 align="center">AxiomForge</h1>

<p align="center">
  <strong>Autonomous Program Evolution · Extremal Combinatorics · Complex Dynamics</strong>
</p>

<p align="center">
  <strong>English</strong> | 
  <a href="README_CN.md">简体中文</a>
</p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://github.com/Zwf5458-Py/AxiomForge/actions"><img src="https://github.com/Zwf5458-Py/AxiomForge/actions/workflows/tests.yml/badge.svg" alt="CI Tests"></a>
  <a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python-3.10%2B-blue.svg" alt="Python 3.10+"></a>
  <a href="https://manifund.org/projects/axiomforge-exploring-algebraic-structural-priors-in-heuristic-search-for-extrem"><img src="https://img.shields.io/badge/Manifund-Fast_Grant_Active-orange.svg" alt="Manifund Fast Grant"></a>
  <a href="http://localhost:8080"><img src="https://img.shields.io/badge/Web_UI-3D_Interactive-emerald.svg" alt="Web UI Available"></a>
</p>

> **Project Mission**: A rigorous **Early Open-Source Research Prototype** designed for independent researchers to investigate the intersection of algebraic structural priors (symmetry & modular invariants) and LLM program evolution (FunSearch paradigm) in finite field extremal combinatorics (such as the Cap Set problem), alongside interactive computational tools for higher-order complex dynamics and geometric fractals.

---

## 📸 Representative Visual Gallery

| 1. AI Mathematical Discovery · 3D Slices & Cap Set Evolution | 2. Generalized Complex Dynamics · Mandelbrot Multi-Arm Tour | 3. Geometric Fractals · Koch Snowflake Measure Theory |
| :---: | :---: | :---: |
| [![Cap Set Discovery](assets/preview_funsearch_5d.png)](assets/preview_funsearch_5d.png) | [![Mandelbrot Dynamics](assets/preview_mandelbrot.png)](assets/preview_mandelbrot.png) | [![Koch Snowflake](assets/preview_koch.png)](assets/preview_koch.png) |
| **3D Array Slices & Hypersphere**<br>Breaks the $2^n$ hypercube trap (38 pts in 5D, 64+ in 6D); real-time A/B convergence & LLM reasoning chains | **Generalized Complex Dynamics**<br>Continuous power transformations ($z \mapsto z^d + c$), smooth escape-time shading, orbit traps & phase space tracking | **Measure-Theoretic Demonstrations**<br>Perimeter exponential divergence ($P_n \to \infty$), bounded area convergence ($\frac{8}{5}A_0$), Hausdorff dimension $D \approx 1.26186$ |

---

## 🏛️ Three Core Technical Pillars

### Pillar 1: AI Extremal Mathematical Discovery & Finite Field Cap Sets

The Cap Set problem is a celebrated central challenge in extremal combinatorics and additive number theory, investigated by Terence Tao and serving as a premier benchmark for DeepMind's FunSearch (*Nature 2023*): In the affine space $\mathbb{F}_3^n$, find the maximum subset containing no three collinear points (non-trivial triples satisfying $x + y + z \equiv 0 \pmod 3$).

<div align="center">
  <img src="assets/preview_funsearch_5d.png" alt="AxiomForge Interactive Mathematical Discovery Studio" width="92%">
</div>

- **Overcoming Hypercube Local Traps**: Naive greedy heuristics inevitably stagnate in degenerate affine subspaces of size $2^n$ ($n=4 \to 16$, $n=5 \to 32$, $n=6 \to 64$, $n=7 \to 128$).
- **High-Dimensional Breakthroughs in 6D & 7D**: Powered by compact trinary indexing (`FastCapSetEnv`) and inversion polarization priors, AxiomForge achieves **81 points in $\mathbb{F}_3^6$** (reaching the theoretical Cartesian product bound $9 \times 9 = 81$) and **166 points in $\mathbb{F}_3^7$** (+29.69% over the 128-point hypercube baseline), both 100% mathematically line-free. Detailed benchmarks are documented in the [**High-Dimensional Technical Report**](EXPERIMENT_HIGH_DIM.md).
- **Rigorous Mathematical Verification**: Built-in $O(k^2)$ incremental collinearity verifier, thoroughly covered by unit tests, scans all $\binom{k}{2}$ point pairs in milliseconds to guarantee that **collinear triples are strictly zero**.
- **High-Dimensional Dual-Track Visualization**: Interactive WebGL renderer supports Hypersphere Projection and 3D Slice Array modes, revealing the discrete algebraic symmetry of high-dimensional finite points.

---

### Pillar 2: Universal Model Hub Inspired by `@earendil-works/pi-ai` Architecture

Drawing architectural inspiration from the [@earendil-works/pi-ai](https://github.com/earendil-works/pi/tree/main/packages/ai) ecosystem, AxiomForge incorporates a fully decoupled, zero-configuration multi-provider runtime:

- **Dynamic Remote Model Discovery**: Fetch live model catalogs directly from `${baseUrl}/models` with one click—no hardcoded endpoints required.
- **Custom Provider Management**: Add, name, and manage arbitrary OpenAI-compatible providers (e.g., DeepSeek, SiliconFlow, Ollama, vLLM, custom gateways).
- **403-Bypass Authentication Probing**: Mitigates gateway errors where providers reject unknown model names with HTTP 403, utilizing lightweight credentials verification over `/models`.
- **Isolated Local Persistence**: Credentials and model mappings are safely stored in browser `localStorage`, isolated from server logging.
- **Deep Reasoning Chain (`<think>`) Extraction**: Flawlessly streams and renders reasoning processes from DeepSeek-R1, o1/o3, and Qwen-QwQ with collapsible UI and syntax highlighting.

---

### Pillar 3: Generalized Higher-Order Complex Dynamics & Fractal Geometry

Mathematical aesthetics extend from discrete algebra into continuous dynamical systems and self-similar fractals. AxiomForge packages an industrial-grade WebGL/Canvas renderer:

<div align="center">
  <img src="assets/preview_mandelbrot.png" alt="Generalized Mandelbrot Dynamics" width="48%">
  <img src="assets/preview_koch.png" alt="Koch Snowflake Fractal" width="48%">
</div>

- **Generalized Mandelbrot Dynamics ($z_{k+1} = z_k^d + c$)**:
  - Continuous transitions from degree $d=2$ up to $d=10$, revealing multi-arm floral symmetries;
  - Smooth normalized iteration shading, escape-time algorithms, orbit traps, and real-time complex orbit trajectory tracking.
- **Koch Snowflake Self-Similar Growth & Measure Theory**:
  - Interactive recursive subdivision from order $0$ to $6$;
  - Live HUD telemetry verifying foundational measure theory:
    - **Perimeter exponential divergence**: $P_n = 3 \times \left(\frac{4}{3}\right)^n \to \infty$;
    - **Monotonic bounded area convergence**: $A_\infty = \frac{8}{5} A_0$;
    - **Hausdorff fractal dimension**: $D = \frac{\ln 4}{\ln 3} \approx 1.26186$.

---

### Pillar 4: Discrete Arithmetic Dynamics & Collatz Conjecture (Hailstone & Inverse Tree)

Described by Paul Erdős as a puzzle for which "mathematics is not yet ready", the Collatz ($3x+1$) conjecture serves as a prime archetype for discrete dynamical systems and computational number theory:

- **Hailstone Trajectory Dynamics**: Features particle flow animations, golden odd steps ($3n+1$), and ice-blue even drops ($n/2$), with dual logarithmic ($\log_{10}$) and linear axes to seamlessly explore extreme seeds (e.g., $27$ with 111 steps and 9,232 peak; $9.78\text{B}$ with 1,132 steps and $26.8\text{T}$ peak).
- **Inverse Collatz Fractal Tree**: Roots from unity ($1$) and branches upward along even trunks ($2n$) and modular odd forks ($(n-1)/3$ when $n \equiv 4 \pmod 6$), revealing an infinite, cycle-free spanning network connecting all natural numbers.
- **Extremal Stopping Time Explorer**: Instantly search bounded integer ranges $[N_1, N_2]$ to discover local champion seeds with maximal flight duration and expansion ratios.

---

## 🛠️ Quick Start & Reproducibility

### 1. Installation & Environment Setup
```bash
git clone https://github.com/Zwf5458-Py/AxiomForge.git
cd AxiomForge
pip install -r requirements.txt
```

### 2. Run Test Suite
```bash
pytest tests/
# Or via standard unittest:
python3 -m unittest discover -s tests
```

### 3. Run Autonomous FunSearch Evolutionary Engine
```bash
# Mode A: Deterministic offline mode (Zero cost, no API key needed)
python3 run_funsearch_real.py --dimension 4 --iterations 20 --backend mock --seed 42

# Mode B: Live online LLM evolution (DeepSeek / OpenAI / Qwen / Claude)
python3 run_funsearch_real.py --dimension 4 --iterations 30 --backend deepseek --api-key YOUR_API_KEY

# Mode C: Local open-source model via Ollama / vLLM
python3 run_funsearch_real.py --dimension 4 --iterations 30 --backend custom --api-base http://localhost:11434/v1
```

### 4. Multi-Seed Statistical Evaluation
```bash
# Run 10-seed comparative benchmark in dimension n=5
python3 experiments/run_ab_experiment.py --dimension 5 --iterations 30 --seeds 10

# Run 5-seed comparative benchmark in dimension n=6
python3 experiments/run_ab_experiment.py --dimension 6 --iterations 30 --seeds 5
### 5. High-Dimensional Extremal Benchmark (6D & 7D Breakthroughs)
```bash
# Run 6D benchmark (729 points space, targets 81-point product bound)
python3 run_high_dim_search.py --dim 6 --iterations 15 --local-steps 30

# Run 7D benchmark (2,187 points space, breaks 160-point barrier to 166 points)
python3 run_high_dim_search.py --dim 7 --iterations 20 --local-steps 50
```

### 6. Launch the AxiomForge Interactive Web Console
```bash
# Launch the built-in HTTP server and API proxy
python3 web_server.py --port 8080

# Open in browser: http://localhost:8080
# 1. Switch to "AI Mathematical Discovery (Cap Set)", choose 5D (243 pts) to view hypersphere projection and the 38-point gold cap;
# 2. Click "Model Settings" in the header to manage custom providers and dynamically discover model endpoints;
# 3. Explore "Generalized Mandelbrot" or "Koch Snowflake" to analyze continuous complex dynamics and measure-theoretic convergence.
```

---

## 📂 Repository Architecture

```text
AxiomForge/
├── assets/                           # Visual assets and representative screenshots
│   ├── preview_funsearch_5d.png     # 5D Cap Set evolution & hypersphere topology
│   ├── preview_mandelbrot.png       # Generalized Mandelbrot complex dynamics
│   └── preview_koch.png             # Koch Snowflake self-similar growth HUD
├── funsearch/                        # Core FunSearch program evolution engine
│   ├── programs_database.py         # Multi-island elite population & diversity tracking
│   ├── evaluator.py                 # Isolated execution sandbox & O(k^2) collinearity verifier
│   ├── sampler.py                   # Genetic selection, prompt mutation, and crossover
│   ├── ai_providers/                # Decoupled LLM adapters (OpenAI / DeepSeek / Claude / Ollama)
│   └── mock_provider.py             # Deterministic algebraic mutation simulator
├── js/                              # Front-end interactive engines
│   ├── i18n.js                      # Internationalization engine (English default & Chinese toggle)
│   ├── app.js                       # Workspace router, event bus & Markdown report exporter
│   ├── math_discovery.js            # 5D Cap Set projection, reasoning parser & live evaluation
│   ├── model_platform.js            # Universal model hub, dynamic discovery & localStorage vault
│   ├── mandelbrot.js                # Generalized high-order dynamics & orbit traps
│   ├── orbit.js                     # Phase space complex orbit tracing & trajectory mapping
│   └── snowflake.js                 # Koch snowflake recursive geometry & measure HUD
├── css/                             # Polished neon cyberpunk mathematical styling
│   └── style.css
├── experiments/                     # Statistical benchmark suites
│   └── run_ab_experiment.py         # Automated A/B baseline vs. symmetry evaluation across seeds
├── aimo_pipeline/                   # Kaggle AIMO competition sandbox & majority voting solver
│   └── baseline_solver.py           # Timeout-isolated multiprocess execution pipeline
├── tests/                           # Comprehensive test suite (evaluator, providers, geometry)
├── web_server.py                    # Static asset server & unified model gateway proxy
├── run_funsearch_real.py            # End-to-end CLI evolutionary loop
├── EXPERIMENT_CAPSET.md             # Formal statistical report for 5D Cap Set (English)
├── EXPERIMENT_CAPSET_CN.md          # 5维帽集统计评测正式报告 (简体中文)
├── README.md                        # Master repository documentation (English)
└── README_CN.md                     # 项目主文档 (简体中文)
```

---

## 📊 Experimental Evidence: Multi-Seed Statistical Benchmark

All results below are generated by the fully reproducible command
```bash
python3 experiments/run_ab_experiment.py --dimension N --iterations M --seeds 10
```
Each row reports 10 independent random-seed trials; naive heuristics (linear coordinate weights) deterministically stagnate at the $2^n$ hypercube bound, while symmetry-prior heuristics break through it under identical evaluation budgets.

| Dim | Baseline (Naive) | Symmetry Prior | Best Observed | Reference Benchmark | Gain | Seeds × Iters |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| $n=4$ | $16 \pm 0.0$ | $19.2 \pm 1.03$ | **20 / 20** | 20 (exact max, Pellegrino 1971) | **+20.0%** | 10 × 20 |
| $n=5$ | $32 \pm 0.0$ | $37.6 \pm 0.70$ | **38 / 45** | 45 (exact max, Edel 2004) | **+17.5%** | 10 × 20 |
| $n=6$ | $64 \pm 0.0$ | $77.2 \pm 1.03$ | **78 / 112** | 112 (exact max, Edel/Potechin 2008) | **+20.6%** | 10 × 20 |
| $n=7$ | $128 \pm 0.0$ | $156.8 \pm 0.63$ | **157 / 236** | 236 (best-known lower bound, Edel 2004) | **+22.5%** | 10 × 50 |

Raw reproducible data: `experiments/results_n{4,5,6,7}_statistical.json`.

---

## ⚖️ Academic Rigor & Objective Boundaries

1. **Objective Result Scope**:
   - **$n=4$**: symmetry priors reach the **exact theoretical maximum (20/20)** in 7 of 10 seeds.
   - **$n=5$**: consistently reach $38$ points (mean $37.6 \pm 0.7$), or 84.4% of Edel's exact maximum (45).
   - **$n=6$**: reach $78$ points (mean $77.2 \pm 1.03$), or 69.6% of the exact maximum (112).
   - **$n=7$**: reach $157$ points (mean $156.8 \pm 0.63$), or 66.5% of Edel's best-known lower bound (236). A real gap remains at this dimension.
2. **Prototype Transparency**: This project is maintained as an **early research prototype (Proof of Work)**. Its purpose is to lay down an honest, fully reproducible foundation for small exploratory research grants (such as Manifund, SFF, or Open Philanthropy) without hyperbolic claims. The 236-point figure for $n=7$ is a **best-known lower bound**, not a proven optimum; no world-record claim is made.

---

## 🤝 Research Grants & Community Funding

AxiomForge is currently seeking exploratory research funding via **[Manifund](https://manifund.org/projects/axiomforge-exploring-algebraic-structural-priors-in-heuristic-search-for-extrem)** (a 501(c)3 non-profit grant platform) to cover computational GPU and LLM API costs for scaling heuristic program evolution into 6D–8D finite-field combinatorial spaces.

[![Manifund Grant Application](https://img.shields.io/badge/Manifund-Fast_Grant_Active-orange.svg?style=for-the-badge)](https://manifund.org/projects/axiomforge-exploring-algebraic-structural-priors-in-heuristic-search-for-extrem)

---

## 📄 Citation & License

This project is open-sourced under the [MIT License](LICENSE). If you build upon or reference AxiomForge in your academic research, please cite:

```bibtex
@software{axiomforge2026,
  author = {Zwf5458-Py},
  title = {AxiomForge: A FunSearch-Inspired Heuristic Search Framework for Combinatorial Problems},
  year = {2026},
  url = {https://github.com/Zwf5458-Py/AxiomForge}
}
```
