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
In preliminary controlled trials across $\mathbb{F}_3^4$ to $\mathbb{F}_3^7$:
- **Naive baseline heuristics** (linear coordinate weights) consistently stagnate at elementary hypercube bounds of size $2^n$ ($16, 32, 64, 128$).
- **Heuristics injected with algebraic priors** (Hamming weight $L_0$ slices and affine hyperplane modulo constraints) break this hypercube barrier, achieving exact theoretical maximums at $n=4$ ($20/20$), statistical means of $37.6 \pm 0.7$ at $n=5$ (target: 45), and $157$ at $n=7$.

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
