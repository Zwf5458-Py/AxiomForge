# OpenAI Researcher Access Program 申请全套通关文案与填表指南

> **计划名称**：OpenAI Researcher Access Program (RAP)  
> **申请系统**：`openai.smapply.org` (Application ID: 0000048290)  
> **申请目标**：申领 $2,500 ~ $5,000 USD 的 OpenAI API 信用额度 (支持 o1-mini / o3-mini / GPT-4o 模型调用)  
> **研究主题**：AxiomForge: Synergizing Algebraic Structural Priors with Advanced LLM Program Evolution for Extremal Combinatorics  
> **开源代码库**：[`https://github.com/Zwf5458-Py/AxiomForge`](https://github.com/Zwf5458-Py/AxiomForge)

---

## 📋 模块一：基础信息字段速查与填写建议

| 表单字段 (Form Field) | 推荐填写值 (Recommended Input) | 填写说明与策略 |
| :--- | :--- | :--- |
| **First Name** | `hua`（或根据实际护照名修改） | 当前表单中已填 `hua` |
| **Last Name** | `Lin`（或根据实际护照名修改） | 当前表单中已填 `Lin` |
| **Institutional Email Address** | 若有高校/科研机构邮箱建议优先填（如 `xxx@edu.cn`）；若为独立研究者可填 `dmklin01@gmail.com` | **加分项提示**：如有高校 `.edu` 邮箱过审速度极快；如无直接填 Gmail 亦完全合规 |
| **Email address associated with your OpenAI API account** | `dmklin01@gmail.com` | 必须与绑定的 OpenAI API 开发者账号一致（额度将直接发放至此账户） |
| **Institution or organization** | `Independent Researcher (AxiomForge Initiative)` 或填写所在大学/研究所全称（如适用） | 独立研究者或所属机构均可，直接体现专注于开源科研 |
| **Please share links to your professional profiles** | 见下方专门整理的 Profile 链接合集 | 展现扎实的 Proof of Work 与代码真实性 |
| **Country** | `China` | 实际常驻地 |
| **Educational Stage** | 根据实际情况选择：`Independent Researcher`, `Master's Student`, `PhD Student`, 或 `Undergraduate` | 独立研究或学生均在资助范围内 |
| **Gender Identity** | 自由选择（可选项通常包含 `Prefer not to say`） | 不影响评审 |
| **Research Areas** | 勾选/输入：`AI for Mathematics / Reasoning / Program Synthesis / AI for Science` | 精准匹配 OpenAI RAP 的重点支持赛道 |

---

## 🔗 模块二：Professional Profiles（一键复制合集）

在 **Please share links to your professional profiles** 文本框中，建议填入以下规范排版的链接列表：

```text
- GitHub Profile: https://github.com/Zwf5458-Py
- Open-Source Repository (AxiomForge): https://github.com/Zwf5458-Py/AxiomForge
- Manifund Fast Grant Proposal (Verified Proof of Work): https://manifund.org/projects/axiomforge-exploring-algebraic-structural-priors-in-heuristic-search-for-extrem
```

---

## 📝 模块三：核心申请问答文案（可直接复制粘贴）

### 1. Project Title (项目标题)
```text
AxiomForge: Synergizing Algebraic Structural Priors with Advanced LLM Program Evolution for Extremal Combinatorics
```

### 2. Project Summary / Abstract (项目摘要，约 200 词)
```text
AxiomForge is an open-source mathematical discovery and program synthesis framework designed to overcome combinatorial search bottlenecks in extremal geometry. Inspired by DeepMind's FunSearch, our methodology departs from traditional "LLM as an oracle" approaches, instead employing LLMs as stochastic program generators operating within a strictly deterministic, sandboxed execution and verification loop ("Code as Hypothesis, Execution as Truth").

While naive combinatorial search rapidly collapses into local hypercube minima (stagnating at size 2^n in affine spaces F_3^n), AxiomForge injects Algebraic Structural Priors—specifically affine hyperplane modulo invariants, Hamming weight L0-slice constraints, and Grassmannian manifold symmetries—directly into prompt templates and genetic evolution pools. 

Our current MIT-licensed prototype has already demonstrated clear empirical gains, achieving exact theoretical maximums at n=4 (20/20) and reaching 38 points in F_3^5 (an 18.75% improvement over the naive 32-point hypercube trap). With OpenAI API support, we aim to leverage state-of-the-art reasoning models (o1-mini and GPT-4o) to scale program evolution across 6-dimensional (729 points) and 7-dimensional (2,187 points) spaces, contributing new extremal bounds and reproducible datasets to the global mathematical and AI-for-Science communities.
```

### 3. Why are OpenAI Models Crucial for this Research? (为何必须使用 OpenAI 模型？审评核心！)
```text
High-dimensional combinatorial geometry requires a rare combination of formal symbolic abstraction, rigorous algorithmic structure, and creative heuristic synthesis. Standard small language models fail catastrophically in this setting: they routinely produce trivial heuristics, hallucinate invalid tensor indices, or fall into cyclic mutations that collapse population diversity.

OpenAI’s frontier reasoning models (such as o1-mini, o3-mini, and GPT-4o) represent an unprecedented breakthrough for program evolution:
1. Deep Chain-of-Thought (CoT) Reasoning: These models exhibit genuine internal search and structural reasoning before code generation, enabling them to comprehend abstract algebraic group actions and modular invariants rather than merely doing superficial token matching.
2. High-Fidelity Python Code Generation: The ability to generate syntactically resilient, vectorizable NumPy/Python heuristics drastically reduces AST parser rejection rates and accelerates genetic search throughput.
3. Complex Constraint Understanding: o1-series models excel at synthesizing priority functions that balance multiple competing mathematical invariants (e.g., maximizing pairwise distance while minimizing collinear triples mod 3).

Access to the OpenAI Researcher Access Program will provide the essential computational runway to systematically investigate how advanced reasoning models formulate mathematical heuristics compared to conventional code models.
```

### 4. Methodology & Experimental Workflow (研究方法与技术路线)
```text
Our research is structured into three clear, reproducible phases:

Phase 1: Automated Multi-Island Program Evolution Loop (Months 1–3)
- Integrate OpenAI API (o1-mini / GPT-4o) directly into our sandbox evaluator (`aimo_pipeline/run_funsearch_real.py`).
- Implement an automated Prompt Diversifier that constructs prompts based on top-performing heuristic ASTs and structural diffs across isolated genetic islands.
- Utilize our dynamic AST self-healing engine to sanitize, bound, and sandbox every generated program in <2ms.

Phase 2: High-Dimensional Scaling & Statistical Benchmarking (Months 4–8)
- Scale the collinearity checker to F_3^6 (3^6 = 729 points) and F_3^7 (3^7 = 2,187 points).
- Run controlled, pre-registered ablation experiments across 30+ randomized seeds comparing:
  (a) Unconstrained random LLM mutations,
  (b) Algebraic prior-injected prompts,
  (c) Standard genetic algorithms without LLM guidance.

Phase 3: Cross-Domain Generalization & Open Publication (Months 9–12)
- Transfer the evolving priority-function framework to industrial combinatorial optimization benchmarks (Online 1D/2D Bin Packing).
- Open-source all evolved program pools, raw logs, and statistical analysis datasets under the MIT license on GitHub, and submit a comprehensive preprint to arXiv.
```

### 5. API Credit Request & Detailed Usage Estimation (申请额度与算力测算)
```text
We formally request $2,500 to $5,000 USD in OpenAI API credits to support our 1-year research roadmap:

1. Exploration & Prompt Tuning (~$1,000):
   - ~10,000 iterative code generations with GPT-4o and o1-mini to calibrate system prompts, AST healing rules, and genetic island migration frequencies.
2. Production Evolution Runs across Higher Dimensions (~$2,500):
   - ~40,000 program mutation and refinement calls during intensive 24/7 genetic search sprints in dimensions n=5, 6, and 7.
3. Comparative Ablation & Industrial Generalization (~$1,500):
   - Cross-model benchmark comparisons (o1-mini vs. GPT-4o) and adaptation to Online Bin Packing heuristics.

Total Requested: $5,000 USD (or a minimum tier of $2,500 USD for core Cap Set runs).
```

### 6. Deliverables, Timeline & Open-Science Commitment (成果交付与开源承诺)
```text
- 100% Open Source: All research code, prompts, AST tools, and logs are publicly maintained at https://github.com/Zwf5458-Py/AxiomForge under the MIT License.
- Reproducibility: Every benchmark run is logged with explicit random seeds, program AST snapshots, and verified mathematical scores.
- Publication & Acknowledgment: We commit to publishing our findings as an open-access preprint on arXiv and presenting them at relevant AI/math venues. We will prominently acknowledge: "This research was supported by compute credits from the OpenAI Researcher Access Program."
```

### 7. Safety, Alignment & Responsible AI Considerations (安全与对齐考量)
```text
This project is dedicated exclusively to theoretical discrete mathematics (finite affine geometry, Cap Set problem) and classical combinatorial algorithms (bin packing). It poses zero biosecurity, cybersecurity, chemical, or geopolitical risks. All code execution occurs within an isolated local AST-guarded sandbox with strict CPU, memory, and networking timeouts, preventing any arbitrary code execution or external network leakage.
```

---

## 💡 模块四：评审关键建议与技巧

1. **审批周期**：OpenAI Researcher Access Program 通常为滚动评审（Rolling basis），审核周期通常在 **2~4 周**。
2. **账号绑定确保**：填写的 OpenAI 关联邮箱 `dmklin01@gmail.com` 需已经完成 OpenAI 平台的注册并创建了默认组织，审批通过后 credits 会直接充值到该 Organization 的 Billing 账户。
